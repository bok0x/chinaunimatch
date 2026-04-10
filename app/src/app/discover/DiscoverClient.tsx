"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import { Search } from "lucide-react";
import { FilterSidebar } from "@/components/discovery/FilterSidebar";
import { UniversityCard } from "@/components/discovery/UniversityCard";
import { ProgramListTable } from "@/components/discovery/ProgramListTable";
import { ViewToggle } from "@/components/discovery/ViewToggle";
import type { Program } from "@/types";

const LIMIT = 24;

export function DiscoverClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const view = searchParams.get("view") ?? "card";
  const page = parseInt(searchParams.get("page") ?? "1");

  const [searchInput, setSearchInput] = useState(() => searchParams.get("search") ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const prevSearchParam = useRef(searchParams.get("search") ?? "");

  useEffect(() => {
    const urlSearch = searchParams.get("search") ?? "";
    if (!urlSearch && prevSearchParam.current) setSearchInput("");
    prevSearchParam.current = urlSearch;
  }, [searchParams]);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value.trim()) { params.set("search", value.trim()); } else { params.delete("search"); }
      params.delete("page");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, 350);
  };

  const [programs, setPrograms] = useState<Program[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isMock, setIsMock] = useState(false);

  const fetchPrograms = useCallback(async () => {
    setLoading(true);

    // Build query params — mirrors the URL search params
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(LIMIT));

    const forward = ["search", "degree", "language", "field", "province", "city", "universityName", "hasScholarship", "intakeSeason"];
    for (const key of forward) {
      const val = searchParams.get(key);
      if (val) params.set(key, val);
    }

    try {
      const res = await fetch(`/api/programs?${params.toString()}`);
      const data = await res.json();
      setPrograms(data.programs ?? []);
      setTotal(data.total ?? 0);
      // Detect if we're showing mock data (IDs start with "mock-")
      setIsMock((data.programs?.[0]?.id ?? "").startsWith("mock-"));
    } catch {
      setPrograms([]);
      setTotal(0);
    }

    setLoading(false);
  }, [searchParams, page]);

  useEffect(() => { fetchPrograms(); }, [fetchPrograms]);

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container-app">
        {/* Header */}
        <div className="mb-8">
          <div className="badge badge-accent mb-3">Discover</div>
          <h1 className="text-4xl md:text-5xl font-heading font-black mb-3">
            Find Your Program
          </h1>
          <p style={{ color: "var(--color-text-secondary)" }}>
            {loading
              ? "Loading programs…"
              : `${total.toLocaleString()} programs across Chinese universities`}
          </p>
        </div>

        {/* Demo banner */}
        {isMock && !loading && (
          <div
            className="mb-6 px-5 py-3 rounded-2xl text-sm flex items-center gap-3"
            style={{
              background: "rgba(72,197,156,0.10)",
              border: "1px solid rgba(72,197,156,0.30)",
              color: "var(--color-text-secondary)",
            }}
          >
            <span style={{ color: "var(--color-accent)" }}>●</span>
            <span>
              <strong style={{ color: "var(--color-text-primary)" }}>Preview mode</strong> — showing sample programs.
              Connect Supabase or run the data pipeline to load real data.
            </span>
          </div>
        )}

        {/* Search + View Toggle */}
        <div className="flex items-center gap-4 mb-8">
          <div className="relative flex-1 max-w-xl">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "var(--color-text-tertiary)" }}
            />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search programs, universities, cities…"
              className="input-glass pl-10"
            />
          </div>
          <ViewToggle />
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
          <aside>
            <FilterSidebar />
          </aside>

          <div>
            {loading ? (
              <LoadingSkeleton view={view} />
            ) : programs.length === 0 ? (
              <EmptyState />
            ) : view === "list" ? (
              <>
                <ProgramListTable programs={programs} />
                {totalPages > 1 && (
                  <PaginationBar page={page} totalPages={totalPages} searchParams={searchParams} />
                )}
              </>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {programs.map((program) => (
                    <UniversityCard key={program.id} program={program} />
                  ))}
                </div>
                {totalPages > 1 && (
                  <PaginationBar page={page} totalPages={totalPages} searchParams={searchParams} />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton({ view }: { view: string }) {
  if (view === "list") {
    return (
      <div className="rounded-2xl overflow-hidden animate-pulse" style={{ border: "1px solid var(--glass-border-subtle)" }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex gap-4 px-4 py-3"
            style={{ borderBottom: "1px solid var(--glass-border-subtle)", background: i % 2 === 0 ? "var(--color-bg-primary)" : "var(--color-bg-secondary)" }}
          >
            <div className="h-4 rounded w-20" style={{ background: "var(--color-bg-tertiary)" }} />
            <div className="h-4 rounded flex-1 max-w-[220px]" style={{ background: "var(--color-bg-tertiary)" }} />
            <div className="h-4 rounded w-24" style={{ background: "var(--color-bg-tertiary)" }} />
            <div className="h-4 rounded w-16" style={{ background: "var(--color-bg-tertiary)" }} />
            <div className="h-4 rounded w-20" style={{ background: "var(--color-bg-tertiary)" }} />
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl overflow-hidden animate-pulse"
          style={{ background: "var(--color-bg-secondary)", border: "1px solid var(--glass-border-subtle)", height: 320 }}
        >
          <div className="w-full h-44" style={{ background: "var(--color-bg-tertiary)" }} />
          <div className="p-4 space-y-3">
            <div className="h-4 rounded w-3/4" style={{ background: "var(--color-bg-tertiary)" }} />
            <div className="h-3 rounded w-1/2" style={{ background: "var(--color-bg-tertiary)" }} />
            <div className="h-3 rounded w-2/3" style={{ background: "var(--color-bg-tertiary)" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function PaginationBar({
  page,
  totalPages,
  searchParams,
}: {
  page: number;
  totalPages: number;
  searchParams: ReturnType<typeof useSearchParams>;
}) {
  const buildHref = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    return `?${params.toString()}`;
  };
  return (
    <div className="flex justify-center gap-2 mt-10">
      {page > 1 && <a href={buildHref(page - 1)} className="btn-ghost text-sm">Previous</a>}
      <span className="px-4 py-2 text-sm rounded-xl glass" style={{ color: "var(--color-text-secondary)" }}>
        Page {page} of {totalPages}
      </span>
      {page < totalPages && <a href={buildHref(page + 1)} className="btn-ghost text-sm">Next</a>}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="glass rounded-3xl p-16 text-center">
      <p className="font-heading font-bold text-lg mb-2">No programs match your filters</p>
      <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
        Try adjusting your search or clearing some filters.
      </p>
    </div>
  );
}
