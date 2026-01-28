import { Check, Copy } from "lucide-react";
import * as React from "react";

import { Button } from "~/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "~/components/ui/item";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";

interface ApiDocsViewerProps {
  spec: Record<string, unknown>;
  baseUrl?: string;
}

const METHOD_STYLES: Record<string, string> = {
  get: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  post: "bg-blue-500/15 text-blue-400 border-blue-500/25",
  put: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  patch: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  delete: "bg-red-500/15 text-red-400 border-red-500/25",
};

interface PathInfo {
  path: string;
  method: string;
  summary: string;
  description: string;
  operationId: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractEndpoints(spec: Record<string, unknown>): PathInfo[] {
  const paths = (spec["paths"] ?? {}) as Record<string, Record<string, any>>;
  const endpoints: PathInfo[] = [];

  for (const [path, methods] of Object.entries(paths)) {
    for (const [method, details] of Object.entries(methods)) {
      if (["get", "post", "put", "patch", "delete"].includes(method)) {
        endpoints.push({
          path,
          method,
          summary: details["summary"] ?? "",
          description: details["description"] ?? "",
          operationId: details["operationId"] ?? "",
        });
      }
    }
  }

  return endpoints;
}

function renderPath(path: string) {
  const parts = path.split(/(\{[^}]+\})/g);
  return parts.map((part, i) =>
    part.startsWith("{") ? (
      <span key={i} className="text-amber-400">{part}</span>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

function groupEndpoints(endpoints: PathInfo[]): { group: string; endpoints: PathInfo[] }[] {
  const groups: Map<string, PathInfo[]> = new Map();

  for (const ep of endpoints) {
    // Extract first path segment: "/pipelines/{id}/start" → "pipelines"
    const segment = ep.path.split("/")[1] ?? "";
    const key = segment.replace(/[{}]/g, "");
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(ep);
  }

  return Array.from(groups.entries()).map(([group, eps]) => ({ group, endpoints: eps }));
}

function formatGroupName(segment: string): string {
  return segment
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon" className="size-7 shrink-0" onClick={handleCopy}>
          {copied ? (
            <Check className="size-3.5 text-emerald-400" />
          ) : (
            <Copy className="size-3.5 text-muted-foreground" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="left">
        {copied ? "Link copied" : "Copy link"}
      </TooltipContent>
    </Tooltip>
  );
}

export function ApiDocsViewer({ spec, baseUrl }: ApiDocsViewerProps) {
  const endpoints = extractEndpoints(spec);

  if (endpoints.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <p className="text-sm text-muted-foreground">No API endpoints defined.</p>
      </div>
    );
  }

  const base = baseUrl ? `https://${baseUrl}` : "";
  const groups = groupEndpoints(endpoints);

  return (
    <div className="h-full overflow-auto">
      <div className="pb-[72px]">
        {groups.map(({ group, endpoints: eps }) => (
          <div key={group}>
            <h3 className="sticky top-0 z-10 bg-zinc-800 px-4 py-2 text-xs font-medium text-muted-foreground">
              {formatGroupName(group)}
            </h3>
            <ItemGroup>
              {eps.map((ep, i) => {
                const fullUrl = `${base}${ep.path}`;

                return (
                  <Item key={`${ep.method}-${ep.path}-${i}`} size="sm">
                    <span
                      className={cn(
                        "inline-flex min-w-[56px] shrink-0 items-center justify-center self-start rounded-md border px-2 py-0.5 text-[11px] font-bold uppercase leading-tight",
                        METHOD_STYLES[ep.method] ?? "bg-secondary text-secondary-foreground border-border",
                      )}
                    >
                      {ep.method}
                    </span>
                    <ItemContent>
                      {ep.summary && (
                        <ItemTitle>{ep.summary}</ItemTitle>
                      )}
                      <ItemDescription>
                        <code className="text-xs">{renderPath(ep.path)}</code>
                      </ItemDescription>
                    </ItemContent>
                    <ItemActions>
                      <CopyLinkButton url={fullUrl} />
                    </ItemActions>
                  </Item>
                );
              })}
            </ItemGroup>
          </div>
        ))}
      </div>
    </div>
  );
}
