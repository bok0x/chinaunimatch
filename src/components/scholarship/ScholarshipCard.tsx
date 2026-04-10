import Link from "next/link";
import { Award, DollarSign, Clock, CheckCircle, ArrowRight } from "lucide-react";
import { formatCNY, SCHOLARSHIP_TYPE_LABELS } from "@/lib/utils";
import type { Scholarship } from "@/types";

interface ScholarshipCardProps {
  scholarship: Scholarship & {
    universityName?: string;
    programName?: string;
    programField?: string;
    programDegree?: string;
  };
}

const TYPE_COLORS: Record<string, string> = {
  CSC:        "#e74c3c",
  PROVINCIAL: "#8b5cf6",
  UNIVERSITY: "var(--color-accent)",
  SILK_ROAD:  "#f59e0b",
  OTHER:      "var(--color-accent)",
};

export function ScholarshipCard({ scholarship }: ScholarshipCardProps) {
  const color = TYPE_COLORS[scholarship.type] ?? "var(--color-accent)";
  const href = `/discover?hasScholarship=true${scholarship.programField ? `&field=${encodeURIComponent(scholarship.programField)}` : ""}`;

  return (
    <Link
      href={href}
      className="block glass rounded-2xl p-5 flex flex-col gap-4 glass-hover cursor-pointer no-underline h-full transition-all duration-200"
      style={{ textDecoration: "none" }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div
          className="badge text-xs font-heading"
          style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}
        >
          <Award size={11} />
          {SCHOLARSHIP_TYPE_LABELS[scholarship.type]}
        </div>
        {scholarship.coversTuition && (
          <span className="badge badge-accent text-xs">Full Tuition</span>
        )}
      </div>

      {/* Name + university */}
      <div className="flex-1">
        <h3 className="font-heading font-bold text-base leading-snug">
          {scholarship.name}
        </h3>
        {scholarship.universityName && (
          <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
            {scholarship.universityName}
          </p>
        )}
        {scholarship.programName && (
          <p className="text-xs mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>
            {scholarship.programName}
          </p>
        )}
      </div>

      {/* Benefits */}
      <div className="space-y-2">
        {scholarship.coversTuition && (
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle size={13} style={{ color: "var(--color-accent)" }} />
            <span>Free tuition covered</span>
          </div>
        )}
        {scholarship.livingAllowance != null && (
          <div className="flex items-center gap-2 text-sm">
            <DollarSign size={13} style={{ color: "var(--color-accent)" }} />
            <span>
              Living allowance:{" "}
              <strong>{formatCNY(scholarship.livingAllowance)}/month</strong>
            </span>
          </div>
        )}
        {scholarship.duration && (
          <div className="flex items-center gap-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
            <Clock size={13} style={{ color: "var(--color-text-tertiary)" }} />
            Duration: {scholarship.duration}
          </div>
        )}
      </div>

      {scholarship.policyDetails && (
        <p className="text-xs leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
          {scholarship.policyDetails.length > 120
            ? scholarship.policyDetails.slice(0, 120) + "…"
            : scholarship.policyDetails}
        </p>
      )}

      {/* CTA */}
      <div
        className="flex items-center gap-1.5 text-xs font-heading font-bold mt-auto pt-2"
        style={{ color: "var(--color-accent)", borderTop: "1px solid var(--glass-border-subtle)" }}
      >
        View programs with this scholarship
        <ArrowRight size={12} />
      </div>
    </Link>
  );
}
