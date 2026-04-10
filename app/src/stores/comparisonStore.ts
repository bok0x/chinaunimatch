import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Program } from "@/types";

interface ComparisonStore {
  programs: Program[];
  add: (program: Program) => boolean; // returns false if already at max
  remove: (programId: string) => void;
  clear: () => void;
  has: (programId: string) => boolean;
}

const MAX_COMPARE = 3;

export const useComparisonStore = create<ComparisonStore>()(
  persist(
    (set, get) => ({
      programs: [],
      add: (program) => {
        const { programs } = get();
        if (programs.length >= MAX_COMPARE) return false;
        if (programs.find((p) => p.id === program.id)) return true;
        set({ programs: [...programs, program] });
        return true;
      },
      remove: (programId) =>
        set((state) => ({
          programs: state.programs.filter((p) => p.id !== programId),
        })),
      clear: () => set({ programs: [] }),
      has: (programId) => get().programs.some((p) => p.id === programId),
    }),
    { name: "chinaunimatch-comparison" }
  )
);
