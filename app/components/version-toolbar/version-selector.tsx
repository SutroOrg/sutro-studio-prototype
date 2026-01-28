import { Copy, Plus, Trash2 } from "lucide-react";
import * as React from "react";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useAppStore } from "~/stores/use-app-store";
import { useSignupStore } from "~/stores/use-signup-store";
import { useVersionStore } from "~/stores/use-version-store";

function getSnapshot() {
  const { applications, currentAppId, activeTab } = useAppStore.getState();
  const { data: signupData } = useSignupStore.getState();
  return { applications, currentAppId, activeTab, signupData };
}

export function VersionSelector() {
  const versions = useVersionStore((s) => s.versions);
  const currentVersionId = useVersionStore((s) => s.currentVersionId);
  const createVersion = useVersionStore((s) => s.createVersion);
  const switchVersion = useVersionStore((s) => s.switchVersion);
  const deleteVersion = useVersionStore((s) => s.deleteVersion);
  const loadFromStorage = useVersionStore((s) => s.loadFromStorage);

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [newLabel, setNewLabel] = React.useState("");

  // Load versions from storage on mount
  React.useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  const currentVersion = versions.find((v) => v.id === currentVersionId);

  const handleCreateVersion = () => {
    const label = newLabel.trim() || `v${versions.length + 1}`;
    createVersion(label, getSnapshot());
    setNewLabel("");
    setDialogOpen(false);
  };

  const handleSwitchVersion = (versionId: string) => {
    const version = switchVersion(versionId);
    if (version?.state) {
      const { applications, currentAppId, activeTab } = version.state as {
        applications: unknown[];
        currentAppId: string | null;
        activeTab: string;
      };
      if (Array.isArray(applications)) {
        useAppStore.setState({
          applications: applications as ReturnType<typeof useAppStore.getState>["applications"],
          currentAppId,
          activeTab: activeTab as "slang" | "data-model" | "api-docs",
        });
      }
    }
  };

  const handleDuplicate = () => {
    const label = `${currentVersion?.label ?? "v1"} (copy)`;
    createVersion(label, getSnapshot());
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 min-w-[120px] border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-100">
              {currentVersion?.label ?? "No version"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-56">
            {versions.map((v) => (
              <DropdownMenuItem
                key={v.id}
                onClick={() => handleSwitchVersion(v.id)}
                className={v.id === currentVersionId ? "bg-accent" : ""}
              >
                <span className="flex-1">{v.label}</span>
                {versions.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteVersion(v.id);
                    }}
                    className="ml-2 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-3" />
                  </button>
                )}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setDialogOpen(true)}>
              <Plus className="size-4" />
              New version
            </DropdownMenuItem>
            {currentVersion && (
              <DropdownMenuItem onClick={handleDuplicate}>
                <Copy className="size-4" />
                Duplicate current
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Version</DialogTitle>
            <DialogDescription>
              Save the current state as a new version you can switch back to.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="version-label">Version label</Label>
            <Input
              id="version-label"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder={`v${versions.length + 1}`}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateVersion();
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateVersion}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
