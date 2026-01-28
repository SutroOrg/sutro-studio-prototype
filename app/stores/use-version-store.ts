import { create } from "zustand";

interface VersionSnapshot {
  applications: unknown[];
  currentAppId: string | null;
  activeTab: string;
  signupData: unknown;
}

interface Version {
  id: string;
  label: string;
  createdAt: string;
  state: VersionSnapshot;
}

interface VersionStore {
  versions: Version[];
  currentVersionId: string | null;
  createVersion: (label: string, snapshot: VersionSnapshot) => void;
  switchVersion: (versionId: string) => Version | undefined;
  deleteVersion: (versionId: string) => void;
  renameVersion: (versionId: string, label: string) => void;
  updateCurrentSnapshot: (snapshot: VersionSnapshot) => void;
  loadFromStorage: () => void;
  saveToStorage: () => void;
}

const STORAGE_KEY = "sutro-studio-versions";

export const useVersionStore = create<VersionStore>((set, get) => ({
  versions: [],
  currentVersionId: null,

  createVersion: (label, snapshot) => {
    const id = crypto.randomUUID();
    const version: Version = {
      id,
      label,
      createdAt: new Date().toISOString(),
      state: snapshot,
    };
    set((state) => ({
      versions: [...state.versions, version],
      currentVersionId: id,
    }));
    get().saveToStorage();
  },

  switchVersion: (versionId) => {
    const version = get().versions.find((v) => v.id === versionId);
    if (version) {
      set({ currentVersionId: versionId });
      get().saveToStorage();
    }
    return version;
  },

  deleteVersion: (versionId) => {
    set((state) => {
      const versions = state.versions.filter((v) => v.id !== versionId);
      const currentVersionId =
        state.currentVersionId === versionId
          ? versions[versions.length - 1]?.id ?? null
          : state.currentVersionId;
      return { versions, currentVersionId };
    });
    get().saveToStorage();
  },

  renameVersion: (versionId, label) => {
    set((state) => ({
      versions: state.versions.map((v) =>
        v.id === versionId ? { ...v, label } : v
      ),
    }));
    get().saveToStorage();
  },

  updateCurrentSnapshot: (snapshot) => {
    const { currentVersionId } = get();
    if (!currentVersionId) return;
    set((state) => ({
      versions: state.versions.map((v) =>
        v.id === currentVersionId ? { ...v, state: snapshot } : v
      ),
    }));
    get().saveToStorage();
  },

  loadFromStorage: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const { versions, currentVersionId } = JSON.parse(stored);
        set({ versions, currentVersionId });
      }
    } catch {
      // ignore parse errors
    }
  },

  saveToStorage: () => {
    try {
      const { versions, currentVersionId } = get();
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ versions, currentVersionId })
      );
    } catch {
      // ignore storage errors
    }
  },
}));
