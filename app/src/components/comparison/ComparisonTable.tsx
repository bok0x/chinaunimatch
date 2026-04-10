"use client";

import { X, Check, Minus, TrendingDown } from "lucide-react";
import { useComparisonStore } from "@/stores/comparisonStore";
import { formatCNY, DEGREE_LABELS, LANGUAGE_LABELS } from "@/lib/utils";
import type { Program } from "@/types";

type RowDef = { key: string; label: string; format: (v: unknown) => string; numeric?: boolean };
type RowGroup = { label: string; rows: RowDef[] };

const ROW_GROUPS: RowGroup[] = [
  {
    label: "Program",
    rows: [
      { key: "programName", label: "Program Name", format: (v: unknown) => String(v) },
      { key: "degree", label: "Degree", format: (v: unknown) => DEGREE_LABELS[v as string] ?? String(v) },
      { key: "teachingLanguage", label: "Language", format: (v: unknown) => LANGUAGE_LABELS[v as string] ?? String(v) },
      { key: "field", label: "Field", format: (v: unknown) => String(v) || "—" },
      { key: "programDuration", label: "Duration", format: (v: unknown) => String(v) || "—" },
      { key: "intakeSeason", label: "Intake", format: (v: unknown) => String(v) || "—" },
      { key: "applicationDeadline", label: "Deadline", format: (v: unknown) => v ? new Date(v as string).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Rolling" },
    ],
  },
  {
    label: "Fees (CNY / year)",
    rows: [
      { key: "originalTuition", label: "Tuition", format: (v: unknown) => formatCNY(v as number), numeric: true },
      { key: "tuitionAfterScholarship", label: "After Scholarship", format: (v: unknown) => v != null ? formatCNY(v as number) : "—", numeric: true },
      { key: "accommodationFee", label: "Accommodation", format: (v: unknown) => v != null ? formatCNY(v as number) : "—", numeric: true },
      { key: "registrationFee", label: "Registration", format: (v: unknown) => v != null ? formatCNY(v as number) : "—", numeric: true },
      { key: "applicationFee", label: "Application Fee", format: (v: unknown) => v != null ? formatCNY(v as number) : "—", numeric: true },
    ],
  },
  {
    label: "Eligibility",
    rows: [
      { key: "minAge", label: "Min Age", format: (v: unknown) => v != null ? String(v) : "—" },
      { key: "maxAge", label: "Max Age", format: (v: unknown) => v != null ? String(v) : "—" },
      { key: "acceptsMinors", label: "Accepts Minors", format: (v: unknown) => v ? "Yes" : "No" },
      { key: "minIeltsScore", label: "Min IELTS", format: (v: unknown) => v != null ? String(v) : "—" },
      { key: "minGpaScore", label: "Min GPA", format: (v: unknown) => v != null ? String(v) : "—" },
    ],
  },
];

export function ComparisonTable() {
  const { programs, remove } = useComparisonStore();

  if (programs.length < 2) {
    return (
      <div className="glass rounded-3xl p-16 text-center">
        <p className="text-lg font-heading font-bold mb-2">No programs selected</p>
        <p style={{ color: "var(--color-text-secondary)" }} className="text-sm mb-6">
          Add 2–3 programs from the Discover page to compare them here.
        </p>
        <a href="/discover" className="btn-accent">Browse Programs</a>
      </div>
    );
  }

  // Find best (lowest) numeric values across programs
  const getBest = (key: string): number | null => {
    const vals = programs
      .map((p) => (p as unknown as Record<string, unknown>)[key])
      .filter((v): v is number => typeof v === "number" && v > 0);
    return vals.length ? Math.min(...vals) : null;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-separate border-spacing-0">
        {/* Header row */}
        <thead>
          <tr>
            <th className="text-left px-4 py-3 w-40" />
            {programs.map((prog) => (
              <th key={prog.id} className="px-4 py-3 text-left">
                <div className="glass rounded-2xl p-4 relative">
                  <button
                    onClick={() => remove(prog.id)}
                    className="absolute top-2 right-2 p-1 rounded-lg transition-colors hover:bg-[var(--color-bg-tertiary)]"
                    style={{ color: "var(--color-text-tertiary)" }}
                  >
                    <X size={14} />
                  </button>
                  <p className="font-heading font-bold text-sm leading-snug pr-6">
                    {prog.university?.name ?? "University"}
                  </p>
                  {prog.university?.ranking && (
                    <span className="badge badge-accent text-[10px] mt-1">
                      #{prog.university.ranking}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {ROW_GROUPS.map((group) => (
            <>
              {/* Group header */}
              <tr key={`group-${group.label}`}>
                <td
                  colSpan={programs.length + 1}
                  className="px-4 py-3 text-xs font-heading font-bold uppercase tracking-widest"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  {group.label}
                </td>
              </tr>

              {group.rows.map((row) => {
                const bestVal = row.numeric ? getBest(row.key) : null;
                return (
                  <tr
                    key={row.key}
                    className="transition-colors hover:bg-[var(--color-accent-muted)]"
                  >
                    <td
                      className="px-4 py-3 text-sm font-medium"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      {row.label}
                    </td>
                    {programs.map((prog) => {
                      const raw = (prog as unknown as Record<string, unknown>)[row.key];
                      const isBest = bestVal != null && raw === bestVal;
                      return (
                        <td key={prog.id} className="px-4 py-3">
                          <span
                            className="text-sm font-medium inline-flex items-center gap-1"
                            style={{ color: isBest ? "var(--color-accent)" : "var(--color-text-primary)" }}
                          >
                            {isBest && <TrendingDown size={13} />}
                            {row.format(raw)}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </>
          ))}

          {/* Documents row */}
          <tr>
            <td
              colSpan={programs.length + 1}
              className="px-4 py-3 text-xs font-heading font-bold uppercase tracking-widest"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              Documents Required
            </td>
          </tr>
          {[
            { key: "requiresPhysicalExam", label: "Physical Exam" },
            { key: "requiresNonCriminalRecord", label: "Criminal Record" },
            { key: "requiresEnglishCert", label: "English Certificate" },
            { key: "requiresRecommendations", label: "Recommendations" },
          ].map((doc) => (
            <tr key={doc.key} className="transition-colors hover:bg-[var(--color-accent-muted)]">
              <td className="px-4 py-3 text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
                {doc.label}
              </td>
              {programs.map((prog) => {
                const required = (prog as unknown as Record<string, unknown>)[doc.key];
                return (
                  <td key={prog.id} className="px-4 py-3">
                    {required ? (
                      <Check size={16} style={{ color: "var(--color-accent)" }} />
                    ) : (
                      <Minus size={16} style={{ color: "var(--color-text-tertiary)" }} />
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
