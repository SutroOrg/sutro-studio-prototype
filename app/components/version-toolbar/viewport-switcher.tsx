import { Monitor, Smartphone, Tablet } from "lucide-react";

import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { type ViewportSize, useViewportStore } from "~/stores/use-viewport-store";

const viewports: { size: ViewportSize; icon: typeof Monitor; label: string }[] = [
  { size: "mobile", icon: Smartphone, label: "Mobile (375px)" },
  { size: "tablet", icon: Tablet, label: "Tablet (768px)" },
  { size: "desktop", icon: Monitor, label: "Desktop" },
];

export function ViewportSwitcher() {
  const viewport = useViewportStore((s) => s.viewport);
  const setViewport = useViewportStore((s) => s.setViewport);

  return (
    <div className="flex items-center gap-1">
      {viewports.map(({ size, icon: Icon, label }) => (
        <Tooltip key={size}>
          <TooltipTrigger asChild>
            <Button
              variant={viewport === size ? "secondary" : "ghost"}
              size="icon"
              className={cn("h-8 w-8 text-zinc-600", viewport === size ? "bg-zinc-100 text-zinc-900 hover:bg-zinc-200" : "hover:bg-zinc-100 hover:text-zinc-900")}
              onClick={() => setViewport(size)}
            >
              <Icon className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{label}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}
