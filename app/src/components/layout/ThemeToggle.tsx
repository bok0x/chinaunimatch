"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      className="p-2 rounded-xl glass-hover transition-all"
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      style={{ color: "var(--color-text-secondary)" }}
    >
      {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  );
}
