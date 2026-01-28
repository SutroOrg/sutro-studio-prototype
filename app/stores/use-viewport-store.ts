import { create } from "zustand";

export type ViewportSize = "mobile" | "tablet" | "desktop";

interface ViewportStore {
  viewport: ViewportSize;
  setViewport: (size: ViewportSize) => void;
  getMaxWidth: () => string;
}

export const useViewportStore = create<ViewportStore>((set, get) => ({
  viewport: "desktop",
  setViewport: (viewport) => set({ viewport }),
  getMaxWidth: () => {
    const { viewport } = get();
    switch (viewport) {
      case "mobile":
        return "375px";
      case "tablet":
        return "768px";
      case "desktop":
        return "100%";
    }
  },
}));
