import { useParams } from "react-router";

import { useAppStore } from "~/stores/use-app-store";

export function StudioFooter() {
  const { appId } = useParams();
  const getApplication = useAppStore((s) => s.getApplication);
  const app = appId ? getApplication(appId) : null;

  if (!app) return null;

  const created = new Date(app.createdAt).toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div className="border-t border-border bg-card px-4 py-3">
      <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
        <span>Application ID: {app.id}</span>
        <span>Created: {created}</span>
        <span>Version: {app.currentVersion}</span>
        <span>
          API Endpoint:{" "}
          <a
            href={`https://${app.apiEndpoint}`}
            className="text-primary underline-offset-2 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {app.apiEndpoint}
          </a>
        </span>
      </div>
    </div>
  );
}
