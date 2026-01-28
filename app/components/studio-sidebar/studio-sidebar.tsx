import {
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronDown,
  Loader2,
  LogOut,
  Mail,
  PanelLeft,
  Plus,
} from "lucide-react";
import * as React from "react";
import { useNavigate, useParams } from "react-router";

import { SutroLogoWithTypography } from "~/components/sutro-logo";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

import { cn } from "~/lib/utils";
import { useAppStore } from "~/stores/use-app-store";
import { useViewportStore } from "~/stores/use-viewport-store";

function ResizeHandle({ sidebarRef }: { sidebarRef: React.RefObject<HTMLDivElement | null> }) {
  const setSidebarWidth = useAppStore((s) => s.setSidebarWidth);
  const dragging = React.useRef(false);

  const handlePointerDown = React.useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      dragging.current = true;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [],
  );

  const handlePointerMove = React.useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return;
      const sidebarLeft = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      setSidebarWidth(e.clientX - sidebarLeft);
    },
    [setSidebarWidth, sidebarRef],
  );

  const handlePointerUp = React.useCallback(() => {
    dragging.current = false;
  }, []);

  return (
    <div
      className="group absolute inset-y-0 z-10 flex cursor-col-resize items-stretch"
      style={{ right: -14, width: 18 }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Visible line aligned with the card's left border (8px into main content area) */}
      <div className="absolute inset-y-0 w-px group-hover:bg-primary/40 group-active:bg-primary/60" style={{ left: 9 }} />
    </div>
  );
}

export function StudioSidebar({ className }: { className?: string }) {
  const applications = useAppStore((s) => s.applications);
  const setMobileSidebarOpen = useAppStore((s) => s.setMobileSidebarOpen);
  const dirty = useAppStore((s) => s.dirty);
  const clearDirty = useAppStore((s) => s.clearDirty);
  const setPendingNavigation = useAppStore((s) => s.setPendingNavigation);
  const setPendingDeleteAppId = useAppStore((s) => s.setPendingDeleteAppId);
  const deleteApplication = useAppStore((s) => s.deleteApplication);
  const getApplication = useAppStore((s) => s.getApplication);
  const createEmptyApplication = useAppStore((s) => s.createEmptyApplication);
  const renameApplication = useAppStore((s) => s.renameApplication);
  const generatingAppId = useAppStore((s) => s.generatingAppId);
  const completedAppIds = useAppStore((s) => s.completedAppIds);
  const clearCompleted = useAppStore((s) => s.clearCompleted);
  const navigate = useNavigate();
  const { appId } = useParams();
  const [search] = React.useState("");
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editValue, setEditValue] = React.useState("");
  const editInputRef = React.useRef<HTMLInputElement>(null);

  const startRename = (id: string, name: string) => {
    setEditingId(id);
    setEditValue(name);
  };

  React.useEffect(() => {
    if (editingId) {
      editInputRef.current?.focus();
      editInputRef.current?.select();
    }
  }, [editingId]);

  const commitRename = () => {
    const trimmed = editValue.trim();
    if (trimmed && editingId) {
      renameApplication(editingId, trimmed);
    }
    setEditingId(null);
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      commitRename();
    } else if (e.key === "Escape") {
      setEditingId(null);
    }
  };

  const guardedNavigate = (path: string) => {
    setMobileSidebarOpen(false);
    const currentApp = appId ? getApplication(appId) : undefined;
    if (currentApp?.empty && !dirty) {
      // Empty app with no prompt content — delete silently
      deleteApplication(currentApp.id);
      navigate(path);
    } else if (dirty) {
      setPendingNavigation(path);
      if (currentApp?.empty) {
        setPendingDeleteAppId(currentApp.id);
      }
    } else {
      navigate(path);
    }
  };

  const filteredApps = applications.filter((app) =>
    app.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const viewport = useViewportStore((s) => s.viewport);
  const sidebarWidth = useAppStore((s) => s.sidebarWidth);
  const sidebarRef = React.useRef<HTMLDivElement>(null);

  return (
    <div
      ref={sidebarRef}
      className={cn("relative flex h-full shrink-0 flex-col bg-background", className)}
      style={viewport === "mobile" ? undefined : { width: sidebarWidth }}
    >
      {viewport !== "mobile" && <ResizeHandle sidebarRef={sidebarRef} />}
      {/* Header */}
      <div className="flex flex-col gap-2 pt-2 px-3 pb-1">
        <div className="flex items-center justify-between py-1.5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex h-9 items-center gap-2 rounded-md px-3 hover:bg-accent/25">
                <SutroLogoWithTypography className="h-4" />
                <ChevronDown className="size-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem>
                <LogOut className="size-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {viewport !== "mobile" && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 hover:bg-accent/25"
              onClick={toggleSidebar}
            >
              <PanelLeft className="size-4" />
            </Button>
          )}
        </div>
        <Button
          variant="outline"
          className="w-full gap-2 hover:bg-accent/25"
          onClick={() => {
            setMobileSidebarOpen(false);
            const currentApp = appId ? getApplication(appId) : undefined;
            if (currentApp?.empty) {
              deleteApplication(currentApp.id);
              clearDirty();
            }
            const app = createEmptyApplication();
            navigate(`/studio/${app.id}`);
          }}
        >
          <Plus className="size-4" />
          New application
        </Button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-1">
        {filteredApps.map((app) =>
          editingId === app.id ? (
            <input
              key={app.id}
              ref={editInputRef}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={commitRename}
              onKeyDown={handleRenameKeyDown}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-ring"
            />
          ) : (
            <button
              key={app.id}
              onClick={() => {
                clearCompleted(app.id);
                guardedNavigate(`/studio/${app.id}`);
              }}
              onDoubleClick={() => startRename(app.id, app.name)}
              className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                appId === app.id
                  ? "bg-accent/50 text-accent-foreground"
                  : "text-foreground hover:bg-accent/25"
              }`}
            >
              <span className={`truncate ${generatingAppId === app.id ? "animate-text-shimmer" : ""}`}>{app.name}</span>
              {generatingAppId === app.id && appId !== app.id && (
                <Loader2 className="ml-auto size-3.5 shrink-0 animate-spin text-muted-foreground" />
              )}
              {completedAppIds.has(app.id) && appId !== app.id && (
                <Check className="ml-auto size-3.5 shrink-0 text-foreground" />
              )}
            </button>
          )
        )}
      </div>

      {/* Footer */}
      <div className="shrink-0 p-2">
        <button className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent/25">
          <Mail className="size-4" />
          Contact sales
        </button>
        <a
          href="https://docs.withsutro.com"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent/25"
        >
          <BookOpen className="size-4" />
          Docs
          <ArrowUpRight className="ml-auto size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        </a>
      </div>
    </div>
  );
}
