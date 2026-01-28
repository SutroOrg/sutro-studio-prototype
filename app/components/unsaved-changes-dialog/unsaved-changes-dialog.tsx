import { useNavigate } from "react-router";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { useAppStore } from "~/stores/use-app-store";

export function UnsavedChangesDialog() {
  const navigate = useNavigate();
  const pendingNavigation = useAppStore((s) => s.pendingNavigation);
  const setPendingNavigation = useAppStore((s) => s.setPendingNavigation);
  const pendingDeleteAppId = useAppStore((s) => s.pendingDeleteAppId);
  const setPendingDeleteAppId = useAppStore((s) => s.setPendingDeleteAppId);
  const deleteApplication = useAppStore((s) => s.deleteApplication);
  const clearDirty = useAppStore((s) => s.clearDirty);

  const open = pendingNavigation !== null;

  const cleanup = () => {
    const dest = pendingNavigation!;
    setPendingNavigation(null);
    setPendingDeleteAppId(null);
    return dest;
  };

  const handleSave = () => {
    console.log("Saving Slang changes…");
    clearDirty();
    const dest = cleanup();
    navigate(dest);
  };

  const handleDiscard = () => {
    clearDirty();
    if (pendingDeleteAppId) {
      deleteApplication(pendingDeleteAppId);
    }
    const dest = cleanup();
    navigate(dest);
  };

  const handleCancel = () => {
    setPendingNavigation(null);
    setPendingDeleteAppId(null);
  };

  return (
    <AlertDialog open={open} onOpenChange={(o) => { if (!o) handleCancel(); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Unsaved changes</AlertDialogTitle>
          <AlertDialogDescription>
            You have unsaved Slang changes. Would you like to save them before
            leaving?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction
            className="bg-transparent text-foreground shadow-none hover:bg-accent hover:text-accent-foreground"
            onClick={handleDiscard}
          >
            Discard
          </AlertDialogAction>
          <AlertDialogAction onClick={handleSave}>Save</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
