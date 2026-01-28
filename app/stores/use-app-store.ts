import { create } from "zustand";

import { DEFAULT_APPLICATIONS, type Application } from "~/lib/mock-data";

interface AppStore {
  applications: Application[];
  currentAppId: string | null;
  activeTab: "slang" | "data-model" | "api-docs";
  dirty: boolean;
  mobileSidebarOpen: boolean;
  sidebarVisible: boolean;
  sidebarWidth: number;
  pendingNavigation: string | null;
  pendingDeleteAppId: string | null;
  generatingAppId: string | null;
  completedAppIds: Set<string>;
  pendingGenerationPrompt: string | null;

  setCurrentApp: (appId: string | null) => void;
  setActiveTab: (tab: "slang" | "data-model" | "api-docs") => void;
  addApplication: (name: string, description: string) => Application;
  createEmptyApplication: () => Application;
  getApplication: (appId: string) => Application | undefined;
  renameApplication: (appId: string, name: string) => void;
  duplicateApplication: (appId: string) => Application | undefined;
  deleteApplication: (appId: string) => void;
  markDirty: () => void;
  clearDirty: () => void;
  setMobileSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setSidebarWidth: (width: number) => void;
  setPendingNavigation: (path: string | null) => void;
  setPendingDeleteAppId: (appId: string | null) => void;
  startGenerating: (appId: string) => void;
  clearGenerating: () => void;
  clearCompleted: (appId: string) => void;
  populateApplication: (appId: string) => void;
  streamSlangCode: (appId: string, targetCode: string, onComplete: () => void) => () => void;
  populateApplicationMetadata: (appId: string) => void;
  setPendingGenerationPrompt: (prompt: string | null) => void;
  consumePendingGenerationPrompt: () => string | null;
}

export const useAppStore = create<AppStore>((set, get) => ({
  applications: DEFAULT_APPLICATIONS,
  currentAppId: null,
  activeTab: "slang",
  dirty: false,
  mobileSidebarOpen: false,
  sidebarVisible: true,
  sidebarWidth: 256,
  pendingNavigation: null,
  pendingDeleteAppId: null,
  generatingAppId: null,
  completedAppIds: new Set<string>(),
  pendingGenerationPrompt: null,

  setCurrentApp: (appId) => set({ currentAppId: appId, activeTab: "slang", dirty: false }),
  setActiveTab: (activeTab) => set({ activeTab }),
  addApplication: (name, description) => {
    const id = crypto.randomUUID();
    const newApp: Application = {
      id,
      name,
      description,
      createdAt: new Date().toISOString(),
      slangCode: `model ${name.replace(/\s+/g, "")} {\n  description "${description}"\n  fields {\n    Name: TEXT\n      description "Name field."\n  }\n}`,
      mermaidDiagram: `classDiagram\n  class ${name.replace(/\s+/g, "")} {\n    +String name\n  }`,
      openApiSpec: {
        openapi: "3.1.1",
        info: { title: name, version: "1.0.0" },
        paths: {},
      },
      apiEndpoint: `${id}.app.withsutro.com/api/v1.0.0`,
      versions: [{ label: "v1.0.0", createdAt: new Date().toISOString() }],
      currentVersion: "v1.0.0",
    };
    set((state) => ({ applications: [...state.applications, newApp] }));
    return newApp;
  },
  createEmptyApplication: () => {
    const id = crypto.randomUUID();
    const newApp: Application = {
      id,
      name: "Untitled",
      description: "",
      createdAt: new Date().toISOString(),
      slangCode: "// Start editing with SLang or use the prompt box below...",
      mermaidDiagram: "",
      openApiSpec: {},
      apiEndpoint: "",
      versions: [],
      currentVersion: "",
      empty: true,
    };
    set((state) => ({ applications: [newApp, ...state.applications] }));
    return newApp;
  },
  getApplication: (appId) => {
    return get().applications.find((a) => a.id === appId);
  },
  renameApplication: (appId, name) => {
    set((state) => ({
      applications: state.applications.map((a) =>
        a.id === appId ? { ...a, name } : a
      ),
    }));
  },
  duplicateApplication: (appId) => {
    const source = get().applications.find((a) => a.id === appId);
    if (!source) return undefined;
    const id = crypto.randomUUID();
    const newApp: Application = {
      ...source,
      id,
      name: `${source.name} (copy)`,
      createdAt: new Date().toISOString(),
    };
    set((state) => {
      const idx = state.applications.findIndex((a) => a.id === appId);
      const apps = [...state.applications];
      apps.splice(idx + 1, 0, newApp);
      return { applications: apps };
    });
    return newApp;
  },
  deleteApplication: (appId) => {
    set((state) => ({
      applications: state.applications.filter((a) => a.id !== appId),
    }));
  },
  markDirty: () => set({ dirty: true }),
  clearDirty: () => set({ dirty: false }),
  setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),
  toggleSidebar: () => set((s) => ({ sidebarVisible: !s.sidebarVisible })),
  setSidebarWidth: (width) => set({ sidebarWidth: Math.min(Math.max(width, 200), 480) }),
  setPendingNavigation: (path) => set({ pendingNavigation: path }),
  setPendingDeleteAppId: (appId) => set({ pendingDeleteAppId: appId }),
  startGenerating: (appId) => set({ generatingAppId: appId }),
  clearGenerating: () => {
    const { generatingAppId, completedAppIds } = get();
    if (generatingAppId) {
      const newCompleted = new Set(completedAppIds);
      newCompleted.add(generatingAppId);
      set({ generatingAppId: null, completedAppIds: newCompleted });
    } else {
      set({ generatingAppId: null });
    }
  },
  clearCompleted: (appId) => {
    const { completedAppIds } = get();
    if (completedAppIds.has(appId)) {
      const newCompleted = new Set(completedAppIds);
      newCompleted.delete(appId);
      set({ completedAppIds: newCompleted });
    }
  },
  populateApplication: (appId) => {
    const app = get().applications.find((a) => a.id === appId);
    if (!app) return;
    const name = app.name === "Untitled" ? "MyApp" : app.name.replace(/\s+/g, "");
    set((state) => ({
      applications: state.applications.map((a) =>
        a.id === appId
          ? {
              ...a,
              empty: false,
              slangCode:
                a.slangCode ||
                `model ${name} {\n  description "Generated model"\n  fields {\n    Name: TEXT\n      description "Name field."\n  }\n}`,
              mermaidDiagram:
                a.mermaidDiagram ||
                `classDiagram\n  class ${name} {\n    +String name\n  }`,
              openApiSpec:
                Object.keys(a.openApiSpec).length > 0
                  ? a.openApiSpec
                  : {
                      openapi: "3.1.1",
                      info: { title: a.name, version: "1.0.0" },
                      paths: {
                        [`/${name.toLowerCase()}s`]: {
                          get: { summary: `List ${name}s`, operationId: `list${name}s` },
                          post: { summary: `Create ${name}`, operationId: `create${name}` },
                        },
                        [`/${name.toLowerCase()}s/{id}`]: {
                          get: { summary: `Get ${name}`, operationId: `get${name}` },
                          put: { summary: `Update ${name}`, operationId: `update${name}` },
                          delete: { summary: `Delete ${name}`, operationId: `delete${name}` },
                        },
                      },
                    },
              apiEndpoint: a.apiEndpoint || `${appId}.app.withsutro.com/api/v1.0.0`,
              versions:
                a.versions.length > 0
                  ? a.versions
                  : [{ label: "v1.0.0", createdAt: new Date().toISOString() }],
              currentVersion: a.currentVersion || "v1.0.0",
            }
          : a
      ),
    }));
  },
  streamSlangCode: (appId, targetCode, onComplete) => {
    // Split on word boundaries, preserving whitespace and newlines
    const tokens = targetCode.match(/\S+|\s+/g) ?? [];
    let currentToken = 0;

    set((state) => ({
      applications: state.applications.map((a) =>
        a.id === appId ? { ...a, slangCode: "" } : a
      ),
    }));

    const interval = setInterval(() => {
      currentToken++;
      const partial = tokens.slice(0, currentToken).join("");
      set((state) => ({
        applications: state.applications.map((a) =>
          a.id === appId ? { ...a, slangCode: partial } : a
        ),
      }));

      if (currentToken >= tokens.length) {
        clearInterval(interval);
        onComplete();
      }
    }, 30);

    return () => clearInterval(interval);
  },
  populateApplicationMetadata: (appId) => {
    const app = get().applications.find((a) => a.id === appId);
    if (!app) return;
    const name = app.name === "Untitled" ? "MyApp" : app.name.replace(/\s+/g, "");
    set((state) => ({
      applications: state.applications.map((a) =>
        a.id === appId
          ? {
              ...a,
              empty: false,
              name: a.name === "Untitled" ? "My App" : a.name,
              mermaidDiagram:
                a.mermaidDiagram ||
                `classDiagram\n  class ${name} {\n    +String name\n  }`,
              openApiSpec:
                Object.keys(a.openApiSpec).length > 0
                  ? a.openApiSpec
                  : {
                      openapi: "3.1.1",
                      info: { title: a.name, version: "1.0.0" },
                      paths: {
                        [`/${name.toLowerCase()}s`]: {
                          get: { summary: `List ${name}s`, operationId: `list${name}s` },
                          post: { summary: `Create ${name}`, operationId: `create${name}` },
                        },
                        [`/${name.toLowerCase()}s/{id}`]: {
                          get: { summary: `Get ${name}`, operationId: `get${name}` },
                          put: { summary: `Update ${name}`, operationId: `update${name}` },
                          delete: { summary: `Delete ${name}`, operationId: `delete${name}` },
                        },
                      },
                    },
              apiEndpoint: a.apiEndpoint || `${appId}.app.withsutro.com/api/v1.0.0`,
              versions:
                a.versions.length > 0
                  ? a.versions
                  : [{ label: "v1.0.0", createdAt: new Date().toISOString() }],
              currentVersion: a.currentVersion || "v1.0.0",
            }
          : a
      ),
    }));
  },
  setPendingGenerationPrompt: (prompt) => set({ pendingGenerationPrompt: prompt }),
  consumePendingGenerationPrompt: () => {
    const { pendingGenerationPrompt } = get();
    if (pendingGenerationPrompt) {
      set({ pendingGenerationPrompt: null });
    }
    return pendingGenerationPrompt;
  },
}));
