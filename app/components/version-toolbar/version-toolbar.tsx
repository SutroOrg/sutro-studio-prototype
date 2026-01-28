import { Separator } from "~/components/ui/separator";

import { PageNavigator } from "./page-navigator";
import { VersionSelector } from "./version-selector";
import { ViewportSwitcher } from "./viewport-switcher";

export function VersionToolbar() {
  return (
    <div className="flex h-11 items-center justify-between border-b border-zinc-200 bg-white px-3">
      {/* Left: Page nav */}
      <PageNavigator />

      {/* Center: Version selector */}
      <VersionSelector />

      {/* Right: Viewport switcher */}
      <div className="flex items-center gap-2">
        <Separator orientation="vertical" className="h-5 bg-zinc-200" />
        <ViewportSwitcher />
      </div>
    </div>
  );
}
