"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { LayoutGrid, List } from "lucide-react";

export function ViewToggle() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const view = searchParams.get("view") ?? "card";

  const setView = (v: "card" | "list") => {
    const params = new URLSearchParams(searchParams.toString());
    if (v === "card") {
      params.delete("view");
    } else {
      params.set("view", v);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div
      className="flex items-center rounded-xl overflow-hidden"
      style={{ border: "1px solid var(--glass-border-subtle)", background: "var(--color-bg-secondary)" }}
    >
      <button
        onClick={() => setView("card")}
        className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-all"
        style={{
          background: view === "card" ? "var(--color-accent)" : "transparent",
          color: view === "card" ? "#fff" : "var(--color-text-secondary)",
        }}
        title="Card view"
      >
        <LayoutGrid size={14} />
        Cards
      </button>
      <button
        onClick={() => setView("list")}
        className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-all"
        style={{
          background: view === "list" ? "var(--color-accent)" : "transparent",
          color: view === "list" ? "#fff" : "var(--color-text-secondary)",
        }}
        title="List view"
      >
        <List size={14} />
        List
      </button>
    </div>
  );
}
