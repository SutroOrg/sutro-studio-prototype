import { create } from "zustand";

interface SignupData {
  name: string;
  email: string;
  role: string;
  company: string;
}

interface SignupStore {
  data: SignupData | null;
  email: string | null;
  pendingPrompt: string | null;
  setData: (data: SignupData) => void;
  setEmail: (email: string) => void;
  setPendingPrompt: (prompt: string | null) => void;
  clearPendingPrompt: () => void;
  clear: () => void;
}

export const useSignupStore = create<SignupStore>((set) => ({
  data: null,
  email: null,
  pendingPrompt: null,
  setData: (data) => set({ data }),
  setEmail: (email) => set({ email }),
  setPendingPrompt: (prompt) => set({ pendingPrompt: prompt }),
  clearPendingPrompt: () => set({ pendingPrompt: null }),
  clear: () => set({ data: null, email: null, pendingPrompt: null }),
}));
