"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useState } from "react";
import { X, SlidersHorizontal, ChevronDown } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { FIELDS_OF_STUDY, CHINESE_PROVINCES, CHINESE_CITIES } from "@/lib/constants";

const DEGREES = [
  { value: "NON_DEGREE", label: "Non-degree" },
  { value: "ASSOCIATE", label: "Associate" },
  { value: "BACHELOR", label: "Bachelor's" },
  { value: "MASTER", label: "Master's" },
  { value: "DOCTORAL", label: "Doctoral" },
  { value: "STUDY_TOUR", label: "Study Tour" },
  { value: "JUNIOR_COLLEGE_UPGRADE", label: "Jr. College Upgrade" },
  { value: "DIPLOMA", label: "Diploma" },
];

const LANGUAGES = [
  { value: "ENGLISH", label: "English" },
  { value: "CHINESE", label: "Chinese" },
  { value: "RUSSIAN", label: "Russian" },
  { value: "BILINGUAL", label: "Bilingual" },
];

const INTAKE_YEARS = ["2025", "2026"];

const INTAKE_SEASONS = ["Spring", "Summer", "Autumn", "Winter"];

export function FilterSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);

  const updateFilter = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  const clearAll = () => {
    router.push(pathname, { scroll: false });
  };

  const hasFilters = searchParams.size > 0;

  const currentDegree = searchParams.get("degree");
  const currentLang = searchParams.get("language");
  const currentField = searchParams.get("field");
  const currentProvince = searchParams.get("province");
  const currentCity = searchParams.get("city") ?? "";
  const currentUniversity = searchParams.get("universityName") ?? "";
  const currentIntakeYear = searchParams.get("intakeYear");
  const currentIntakeSeason = searchParams.get("intakeSeason");
  const currentAcceptsMinors = searchParams.get("acceptsMinors");
  const currentHasCscaScore = searchParams.get("hasCscaScore");
  const hasScholarship = searchParams.get("hasScholarship") === "true";

  return (
    <GlassCard padding="sm" className="lg:sticky lg:top-24">
      {/* Header — always visible; tap to expand on mobile */}
      <button
        className="w-full flex items-center justify-between mb-1 px-2 py-1 lg:cursor-default"
        onClick={() => setMobileOpen((v) => !v)}
        aria-expanded={mobileOpen}
      >
        <div className="flex items-center gap-2 font-heading font-bold text-sm">
          <SlidersHorizontal size={15} />
          Filters
          {hasFilters && (
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: "var(--color-accent)" }}
            />
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasFilters && (
            <button
              onClick={(e) => { e.stopPropagation(); clearAll(); }}
              className="text-xs flex items-center gap-1 transition-colors hover:text-[var(--color-accent)]"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              <X size={12} />
              Clear
            </button>
          )}
          <ChevronDown
            size={16}
            className={`lg:hidden transition-transform ${mobileOpen ? "rotate-180" : ""}`}
            style={{ color: "var(--color-text-tertiary)" }}
          />
        </div>
      </button>

      <div className={`space-y-5 mt-3 ${mobileOpen ? "block" : "hidden lg:block"}`}>

        {/* Scholarship toggle */}
        <div>
          <label className="flex items-center justify-between gap-3 px-2 py-2 rounded-xl cursor-pointer transition-colors hover:bg-[var(--color-accent-muted)]">
            <span className="text-sm font-medium">Scholarship only</span>
            <div
              onClick={() => updateFilter("hasScholarship", hasScholarship ? null : "true")}
              className="relative w-10 h-5 rounded-full transition-colors cursor-pointer"
              style={{
                background: hasScholarship ? "var(--color-accent)" : "var(--color-bg-tertiary)",
              }}
            >
              <div
                className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow-sm"
                style={{ transform: hasScholarship ? "translateX(20px)" : "translateX(2px)" }}
              />
            </div>
          </label>
        </div>

        {/* Degree */}
        <FilterGroup label="Academic Level">
          {DEGREES.map((d) => (
            <FilterChip
              key={d.value}
              label={d.label}
              active={currentDegree === d.value}
              onClick={() => updateFilter("degree", currentDegree === d.value ? null : d.value)}
            />
          ))}
        </FilterGroup>

        {/* Language */}
        <FilterGroup label="Teaching Language">
          {LANGUAGES.map((l) => (
            <FilterChip
              key={l.value}
              label={l.label}
              active={currentLang === l.value}
              onClick={() => updateFilter("language", currentLang === l.value ? null : l.value)}
            />
          ))}
        </FilterGroup>

        {/* Intake Year */}
        <FilterGroup label="Intake Year">
          {INTAKE_YEARS.map((y) => (
            <FilterChip
              key={y}
              label={y}
              active={currentIntakeYear === y}
              onClick={() => updateFilter("intakeYear", currentIntakeYear === y ? null : y)}
            />
          ))}
        </FilterGroup>

        {/* Intake Season */}
        <FilterGroup label="Intake Season">
          {INTAKE_SEASONS.map((s) => (
            <FilterChip
              key={s}
              label={s}
              active={currentIntakeSeason === s}
              onClick={() => updateFilter("intakeSeason", currentIntakeSeason === s ? null : s)}
            />
          ))}
        </FilterGroup>

        {/* Accept Minors */}
        <FilterGroup label="Accepts Minors">
          <FilterChip
            label="Yes"
            active={currentAcceptsMinors === "true"}
            onClick={() => updateFilter("acceptsMinors", currentAcceptsMinors === "true" ? null : "true")}
          />
          <FilterChip
            label="No"
            active={currentAcceptsMinors === "false"}
            onClick={() => updateFilter("acceptsMinors", currentAcceptsMinors === "false" ? null : "false")}
          />
        </FilterGroup>

        {/* CSCA Score */}
        <FilterGroup label="CSCA Score">
          <FilterChip
            label="Yes"
            active={currentHasCscaScore === "true"}
            onClick={() => updateFilter("hasCscaScore", currentHasCscaScore === "true" ? null : "true")}
          />
          <FilterChip
            label="No"
            active={currentHasCscaScore === "false"}
            onClick={() => updateFilter("hasCscaScore", currentHasCscaScore === "false" ? null : "false")}
          />
        </FilterGroup>

        {/* University */}
        <FilterGroup label="University">
          <input
            type="text"
            placeholder="Search university..."
            value={currentUniversity}
            onChange={(e) => updateFilter("universityName", e.target.value || null)}
            className="input-glass text-xs py-2 w-full"
          />
        </FilterGroup>

        {/* City */}
        <FilterGroup label="City">
          <select
            value={currentCity}
            onChange={(e) => updateFilter("city", e.target.value || null)}
            className="input-glass text-xs py-2"
          >
            <option value="">All Cities</option>
            {CHINESE_CITIES.map(({ city, count }) => (
              <option key={city} value={city}>{city} ({count})</option>
            ))}
          </select>
        </FilterGroup>

        {/* Province */}
        <FilterGroup label="Province">
          <select
            value={currentProvince ?? ""}
            onChange={(e) => updateFilter("province", e.target.value || null)}
            className="input-glass text-xs py-2"
          >
            <option value="">All Provinces</option>
            {CHINESE_PROVINCES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </FilterGroup>

        {/* Field of Study */}
        <FilterGroup label="Field of Study">
          <select
            value={currentField ?? ""}
            onChange={(e) => updateFilter("field", e.target.value || null)}
            className="input-glass text-xs py-2"
          >
            <option value="">All Fields</option>
            {FIELDS_OF_STUDY.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </FilterGroup>

      </div>
    </GlassCard>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p
        className="text-xs font-heading font-semibold uppercase tracking-wider mb-2 px-2"
        style={{ color: "var(--color-text-tertiary)" }}
      >
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5 px-2">{children}</div>
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
      style={{
        background: active ? "var(--color-accent)" : "var(--color-bg-tertiary)",
        color: active ? "#fff" : "var(--color-text-secondary)",
        border: active ? "1px solid var(--color-accent)" : "1px solid var(--glass-border-subtle)",
      }}
    >
      {label}
    </button>
  );
}
