"use client";

import { ComparisonTable } from "@/components/comparison/ComparisonTable";
import { useComparisonStore } from "@/stores/comparisonStore";
import Link from "next/link";

export default function ComparePage() {
  const { programs, clear } = useComparisonStore();

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container-app">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <div className="badge badge-accent mb-3">Compare</div>
            <h1 className="text-4xl md:text-5xl font-heading font-black">
              Side-by-Side
            </h1>
            <p className="mt-2" style={{ color: "var(--color-text-secondary)" }}>
              {programs.length > 0
                ? `Comparing ${programs.length} program${programs.length > 1 ? "s" : ""}`
                : "Select programs from Discover to compare here"}
            </p>
          </div>
          {programs.length > 0 && (
            <div className="flex gap-3">
              <button onClick={clear} className="btn-ghost text-sm">
                Clear all
              </button>
              <Link href="/discover" className="btn-accent text-sm">
                Add more
              </Link>
            </div>
          )}
        </div>

        <ComparisonTable />
      </div>
    </div>
  );
}
