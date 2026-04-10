"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, BookOpen } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { ThemeToggle } from "./ThemeToggle";
import { NAV_LINKS, SITE_NAME } from "@/lib/constants";
import { useComparisonStore } from "@/stores/comparisonStore";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { programs: compared } = useComparisonStore();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "glass py-3" : "py-5 bg-transparent"
      )}
      style={scrolled ? { borderRadius: 0, borderLeft: "none", borderRight: "none", borderTop: "none" } : {}}
    >
      <div className="container-app flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 relative">
            <Image
              src="/logo-icon.svg"
              alt={SITE_NAME}
              width={32}
              height={32}
              className="object-contain"
              onError={(e) => {
                // fallback icon if logo not found
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
          <span
            className="font-heading font-800 text-lg tracking-tight"
            style={{ color: "var(--color-text-primary)" }}
          >
            China<span style={{ color: "var(--color-accent)" }}>Uni</span>Match
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-[var(--color-accent-muted)] hover:text-[var(--color-accent)]"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Compare badge */}
          {compared.length > 0 && (
            <Link
              href="/compare"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold font-heading badge-accent"
            >
              <BookOpen size={13} />
              Compare ({compared.length}/3)
            </Link>
          )}

          <ThemeToggle />

          <Link href="/apply" className="hidden md:flex btn-accent text-sm py-2">
            Apply Now
          </Link>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-lg glass-hover"
            aria-label="Toggle menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden mt-2 mx-4 glass rounded-2xl overflow-hidden animate-slide-up">
          <div className="p-4 flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="px-4 py-3 rounded-xl text-sm font-medium transition-colors hover:bg-[var(--color-accent-muted)] hover:text-[var(--color-accent)]"
                style={{ color: "var(--color-text-primary)" }}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/apply"
              onClick={() => setOpen(false)}
              className="mt-2 btn-accent text-center"
            >
              Apply Now
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
