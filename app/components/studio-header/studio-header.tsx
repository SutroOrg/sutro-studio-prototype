import { ChevronDown, Copy, Link, Loader2, Menu, PanelLeft, Pencil, Trash2 } from "lucide-react";
import * as React from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { useAppStore } from "~/stores/use-app-store";
import { useViewportStore } from "~/stores/use-viewport-store";

interface StudioHeaderProps {
  generationStatus?: "thinking" | "streaming" | "applying" | null;
}

export function StudioHeader({ generationStatus }: StudioHeaderProps) {
  const { appId } = useParams();
  const getApplication = useAppStore((s) => s.getApplication);
  const renameApplication = useAppStore((s) => s.renameApplication);
  const duplicateApplication = useAppStore((s) => s.duplicateApplication);
  const deleteApplication = useAppStore((s) => s.deleteApplication);
  const setMobileSidebarOpen = useAppStore((s) => s.setMobileSidebarOpen);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const sidebarVisible = useAppStore((s) => s.sidebarVisible);
  const generatingAppId = useAppStore((s) => s.generatingAppId);
  const viewport = useViewportStore((s) => s.viewport);
  const navigate = useNavigate();
  const app = appId ? getApplication(appId) : null;
  const isGenerating = generatingAppId === appId;

  const [renameOpen, setRenameOpen] = React.useState(false);
  const [renameValue, setRenameValue] = React.useState("");

  const openRenameDialog = () => {
    if (!app) return;
    setRenameValue(app.name);
    setRenameOpen(true);
  };

  const commitRename = () => {
    const trimmed = renameValue.trim();
    if (trimmed && appId) {
      renameApplication(appId, trimmed);
    }
    setRenameOpen(false);
  };

  const handleMenuClick = () => {
    if (viewport === "mobile") {
      setMobileSidebarOpen(true);
    } else {
      toggleSidebar();
    }
  };

  const currentVersion = app?.currentVersion ?? "";

  return (
    <>
      <div className="flex h-fit items-center gap-4 bg-zinc-800 pl-1 pr-4 py-1">
        <div className="flex min-w-0 flex-1 items-center gap-0.5">
          {(viewport === "mobile" || !sidebarVisible) && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={handleMenuClick}
            >
              {viewport === "mobile" ? (
                <Menu className="size-4" />
              ) : (
                <PanelLeft className="size-4" />
              )}
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex h-9 min-w-0 items-center gap-2 rounded-md px-3 hover:bg-accent/25">
                <span className={`truncate text-base font-semibold leading-tight text-foreground ${generatingAppId === appId ? "animate-text-shimmer" : ""}`}>
                  {app?.name ?? "Sutro Studio"}
                </span>
                {currentVersion && (
                  <Badge variant="secondary" className="shrink-0 text-[10px] px-1.5 py-0">
                    {currentVersion}
                  </Badge>
                )}
                <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={openRenameDialog}>
                <Pencil className="size-4" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  if (!appId) return;
                  const newApp = duplicateApplication(appId);
                  if (newApp) {
                    navigate(`/studio/${newApp.id}`);
                    toast.success("App duplicated");
                  }
                }}
              >
                <Copy className="size-4" />
                Duplicate
              </DropdownMenuItem>
              {app?.apiEndpoint && (
                <DropdownMenuItem
                  onClick={() => {
                    navigator.clipboard.writeText(`https://${app.apiEndpoint}`);
                    toast.success("API URL copied");
                  }}
                >
                  <Link className="size-4" />
                  Copy API URL
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => {
                  if (!appId) return;
                  deleteApplication(appId);
                  navigate("/studio");
                  toast.success("App deleted");
                }}
              >
                <Trash2 className="size-4 text-destructive" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {isGenerating && generationStatus && (
          <span className="flex shrink-0 items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            {generationStatus === "thinking" && "Thinking..."}
            {generationStatus === "streaming" && "Generating SLang..."}
            {generationStatus === "applying" && "Generating backend..."}
          </span>
        )}
        {!isGenerating && app?.apiEndpoint && viewport !== "mobile" && (
          <a
            href={`https://${app.apiEndpoint}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`text-sm text-muted-foreground hover:text-foreground hover:underline ${viewport === "tablet" ? "min-w-0 truncate" : "shrink-0"}`}
          >
            {app.apiEndpoint}
          </a>
        )}
      </div>

      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename application</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              commitRename();
            }}
          >
            <Input
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              autoFocus
            />
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setRenameOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!renameValue.trim()}>
                Rename
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
