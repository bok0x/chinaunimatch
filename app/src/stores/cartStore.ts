import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Program } from "@/types";

interface CartStore {
  items: Program[];
  add: (program: Program) => void;
  remove: (programId: string) => void;
  clear: () => void;
  has: (programId: string) => boolean;
  count: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      add: (program) => {
        const { items } = get();
        if (items.find((p) => p.id === program.id)) return;
        set({ items: [...items, program] });
      },
      remove: (programId) =>
        set((state) => ({
          items: state.items.filter((p) => p.id !== programId),
        })),
      clear: () => set({ items: [] }),
      has: (programId) => get().items.some((p) => p.id === programId),
      count: () => get().items.length,
    }),
    { name: "chinaunimatch-cart" }
  )
);
