import { Outlet } from "react-router";

import { StudioSidebar } from "~/components/studio-sidebar";
import { useAppStore } from "~/stores/use-app-store";
import { useViewportStore } from "~/stores/use-viewport-store";

function ViewportFrame({ children }: { children: React.ReactNode }) {
  const viewport = useViewportStore((s) => s.viewport);
  const getMaxWidth = useViewportStore((s) => s.getMaxWidth);
  const maxWidth = getMaxWidth();

  if (viewport === "desktop") {
    return <div className="flex h-full flex-1 flex-col overflow-hidden">{children}</div>;
  }

  return (
    <div className="flex flex-1 justify-center overflow-hidden bg-zinc-950">
      <div
        className="flex h-full flex-col overflow-hidden border-x border-border"
        style={{ width: "100%", maxWidth }}
      >
        {children}
      </div>
    </div>
  );
}

export default function StudioLayout() {
  const viewport = useViewportStore((s) => s.viewport);
  const mobileSidebarOpen = useAppStore((s) => s.mobileSidebarOpen);
  const setMobileSidebarOpen = useAppStore((s) => s.setMobileSidebarOpen);
  const sidebarVisible = useAppStore((s) => s.sidebarVisible);
  const sidebarWidth = useAppStore((s) => s.sidebarWidth);
  const isMobile = viewport === "mobile";

  return (
    <ViewportFrame>
        <div className="relative flex flex-1 overflow-hidden">
          {/* Inline sidebar for desktop/tablet */}
          {!isMobile && (
            <div
              className="shrink-0 overflow-hidden transition-[width] duration-200 ease-in-out"
              style={{ width: sidebarVisible ? sidebarWidth : 0 }}
            >
              <StudioSidebar />
            </div>
          )}

          {/* Mobile sidebar overlay + panel */}
          {isMobile && mobileSidebarOpen && (
            <div
              className="absolute inset-0 z-40 bg-black/50"
              onClick={() => setMobileSidebarOpen(false)}
            />
          )}
          {isMobile && (
            <div
              className={`absolute inset-y-0 left-0 z-50 w-64 transform bg-background shadow-lg transition-transform duration-200 ease-in-out ${
                mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
              }`}
            >
              <StudioSidebar className="h-full w-full" />
            </div>
          )}

          <main className="flex flex-1 flex-col overflow-hidden bg-background">
            <Outlet />
          </main>
        </div>
    </ViewportFrame>
  );
}
