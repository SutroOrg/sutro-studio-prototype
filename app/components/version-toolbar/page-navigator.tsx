import { useLocation, useNavigate } from "react-router";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useAppStore } from "~/stores/use-app-store";

const STATIC_PAGES = [
  { value: "/studio", label: "Studio home" },
  { value: "/", label: "Landing page" },
  { value: "/signup", label: "Sign up" },
];

export function PageNavigator() {
  const navigate = useNavigate();
  const location = useLocation();
  const applications = useAppStore((s) => s.applications);
  const dirty = useAppStore((s) => s.dirty);
  const setPendingNavigation = useAppStore((s) => s.setPendingNavigation);
  const setPendingDeleteAppId = useAppStore((s) => s.setPendingDeleteAppId);
  const deleteApplication = useAppStore((s) => s.deleteApplication);
  const getApplication = useAppStore((s) => s.getApplication);

  // Determine current value from the URL
  const currentPath = location.pathname;
  const currentValue =
    STATIC_PAGES.find((p) => p.value === currentPath)?.value ??
    (currentPath.startsWith("/studio/") ? currentPath : "/");

  // Extract current app ID from path
  const currentAppId = currentPath.startsWith("/studio/")
    ? currentPath.replace("/studio/", "")
    : null;

  const handleNavigate = (value: string) => {
    const currentApp = currentAppId ? getApplication(currentAppId) : undefined;
    if (currentApp?.empty && !dirty) {
      deleteApplication(currentApp.id);
      navigate(value);
    } else if (dirty) {
      setPendingNavigation(value);
      if (currentApp?.empty) {
        setPendingDeleteAppId(currentApp.id);
      }
    } else {
      navigate(value);
    }
  };

  return (
    <Select
      value={currentValue}
      onValueChange={handleNavigate}
    >
      <SelectTrigger
        size="sm"
        className="border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-100 [&_svg]:text-zinc-500"
      >
        <SelectValue placeholder="Navigate to…" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Pages</SelectLabel>
          {STATIC_PAGES.map((page) => (
            <SelectItem key={page.value} value={page.value}>
              {page.label}
            </SelectItem>
          ))}
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Applications</SelectLabel>
          {applications.map((app) => (
            <SelectItem
              key={app.id}
              value={`/studio/${app.id}`}
            >
              {app.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
