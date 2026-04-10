"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShoppingCart, Check, MessageSquare, GraduationCap,
  Calendar, Clock, CheckCircle, XCircle, User, MapPin,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { WHATSAPP_URL } from "@/lib/constants";
import { formatCNY, DEGREE_LABELS, LANGUAGE_LABELS, SCHOLARSHIP_TYPE_LABELS } from "@/lib/utils";
import { useCartStore } from "@/stores/cartStore";
import type { Program } from "@/types";

interface ProgramDetailTabsProps {
  program: Program;
}

const TABS = ["Program Details", "Promotion Materials", "Application Requirements"] as const;
type Tab = typeof TABS[number];

const DOCUMENTS = [
  { key: "requiresPassportPhoto", label: "Passport Photo" },
  { key: "requiresPassportId", label: "Passport ID Page" },
  { key: "requiresTranscripts", label: "Academic Transcripts" },
  { key: "requiresHighestDegree", label: "Highest Degree Certificate" },
  { key: "requiresPhysicalExam", label: "Physical Exam Form" },
  { key: "requiresNonCriminalRecord", label: "Non-criminal Record" },
  { key: "requiresEnglishCert", label: "Language Certificate" },
  { key: "requiresStudyPlan", label: "Study Plan" },
  { key: "requiresRecommendations", label: "Recommendation Letters" },
] as const;

export function ProgramDetailTabs({ program }: ProgramDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>("Program Details");
  const { add, remove, has } = useCartStore();
  const inCart = has(program.id);

  const handleCart = () => {
    if (inCart) {
      remove(program.id);
    } else {
      add(program);
    }
  };

  const whatsappMsg = `Hi, I'm interested in the ${program.programName} program at ${program.university?.name ?? "this university"}. Can you help me apply?`;

  return (
    <div>
      {/* ── Action Buttons ──────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3 mb-8">
        <button
          onClick={handleCart}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold font-heading transition-all"
          style={{
            background: inCart ? "var(--color-accent-muted)" : "var(--color-accent)",
            color: inCart ? "var(--color-accent)" : "#fff",
            border: inCart ? "1px solid var(--color-accent)" : "none",
          }}
        >
          {inCart ? <Check size={16} /> : <ShoppingCart size={16} />}
          {inCart ? "Added to Cart" : "Add to Cart"}
        </button>

        <Link
          href={`/apply?program=${program.id}`}
          className="btn-accent text-sm"
        >
          Apply Now
        </Link>

        <a
          href={`${WHATSAPP_URL}?text=${encodeURIComponent(whatsappMsg)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold font-heading transition-all"
          style={{
            background: "var(--color-bg-secondary)",
            color: "var(--color-text-primary)",
            border: "1px solid var(--glass-border-subtle)",
          }}
        >
          <MessageSquare size={16} />
          Leave a Message
        </a>
      </div>

      {/* ── Tabs ────────────────────────────────────────────────────────── */}
      <div
        className="flex gap-1 mb-6 p-1 rounded-xl"
        style={{ background: "var(--color-bg-secondary)", border: "1px solid var(--glass-border-subtle)" }}
      >
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="flex-1 py-2.5 px-3 rounded-lg text-sm font-medium font-heading transition-all"
            style={{
              background: activeTab === tab ? "var(--color-accent)" : "transparent",
              color: activeTab === tab ? "#fff" : "var(--color-text-secondary)",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Tab 1: Program Details ──────────────────────────────────────── */}
      {activeTab === "Program Details" && (
        <div className="space-y-6">
          <GlassCard>
            <h3 className="font-heading font-bold text-base mb-4">Basic Info</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoRow label="Field of Study" value={program.field || "—"} />
              <InfoRow label="Program Name" value={program.programName} />
              <InfoRow label="Course Duration" value={program.programDuration || "—"} />
              <InfoRow
                label="Intake"
                value={[program.intakeSeason, program.intakeYear].filter(Boolean).join(" ") || "—"}
              />
              <InfoRow
                label="Application Deadline"
                value={
                  program.applicationDeadline
                    ? new Date(program.applicationDeadline).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Rolling"
                }
              />
              <InfoRow label="Degree" value={DEGREE_LABELS[program.degree] ?? program.degree} />
              <InfoRow label="Teaching Language" value={LANGUAGE_LABELS[program.teachingLanguage] ?? program.teachingLanguage} />
              <InfoRow label="CSCA Score" value={program.hasCscaScore ? "Yes" : "No"} />
            </div>
          </GlassCard>

          {(program.scholarships?.length ?? 0) > 0 && (
            <GlassCard>
              <h3 className="font-heading font-bold text-base mb-4">Scholarship Info</h3>
              <div className="space-y-4">
                {program.scholarships!.map((s) => (
                  <div
                    key={s.id}
                    className="rounded-xl p-4 space-y-3"
                    style={{ background: "var(--color-accent-muted)", border: "1px solid var(--color-accent)" }}
                  >
                    <div className="flex items-center gap-2">
                      <GraduationCap size={16} style={{ color: "var(--color-accent)" }} />
                      <span className="font-semibold text-sm">{s.name}</span>
                      {s.category && (
                        <span className="badge badge-accent text-xs">{s.category}</span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <InfoRow label="Type" value={SCHOLARSHIP_TYPE_LABELS[s.type] ?? s.type} />
                      <InfoRow label="Duration" value={s.duration || "—"} />
                      <InfoRow label="Covers Tuition" value={s.coversTuition ? "Yes" : "No"} />
                      {s.livingAllowance && (
                        <InfoRow label="Monthly Stipend" value={formatCNY(s.livingAllowance) + "/mo"} />
                      )}
                    </div>
                    {s.policyDetails && (
                      <p className="text-xs leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                        {s.policyDetails}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </GlassCard>
          )}
        </div>
      )}

      {/* ── Tab 2: Promotion Materials ──────────────────────────────────── */}
      {activeTab === "Promotion Materials" && (
        <div className="space-y-6">
          <GlassCard>
            <h3 className="font-heading font-bold text-base mb-4">University Fees</h3>
            <div className="space-y-3">
              <FeeRow
                label="Original Tuition"
                original={program.originalTuition}
                discounted={program.tuitionAfterScholarship}
                discountLabel="After Scholarship"
              />
              {(program.accommodationFee != null || program.accommodationSingleFee != null || program.accommodationDoubleFee != null) && (
                <div className="pt-3" style={{ borderTop: "1px solid var(--glass-border-subtle)" }}>
                  <p className="text-xs font-semibold mb-2" style={{ color: "var(--color-text-tertiary)" }}>
                    Accommodation
                  </p>
                  {program.accommodationSingleFee != null && (
                    <FeeRow label="Single Room" original={program.accommodationSingleFee} />
                  )}
                  {program.accommodationDoubleFee != null && (
                    <FeeRow label="Double Room" original={program.accommodationDoubleFee} />
                  )}
                  {program.accommodationFee != null && !program.accommodationSingleFee && !program.accommodationDoubleFee && (
                    <FeeRow label="Accommodation" original={program.accommodationFee} />
                  )}
                </div>
              )}
              {program.registrationFee != null && (
                <div className="pt-3" style={{ borderTop: "1px solid var(--glass-border-subtle)" }}>
                  <FeeRow label="University Registration Fee" original={program.registrationFee} />
                </div>
              )}
            </div>
          </GlassCard>

          <GlassCard>
            <h3 className="font-heading font-bold text-base mb-4">Platform Service Fees</h3>
            <div className="space-y-3">
              {program.applicationFee != null ? (
                <FeeRow label="Platform Application Fee" original={program.applicationFee} />
              ) : (
                <p className="text-sm" style={{ color: "var(--color-text-tertiary)" }}>No application fee</p>
              )}
              {program.serviceFee != null && (
                <FeeRow label="Platform Service Fee" original={program.serviceFee} />
              )}
            </div>
          </GlassCard>
        </div>
      )}

      {/* ── Tab 3: Application Requirements ────────────────────────────── */}
      {activeTab === "Application Requirements" && (
        <div className="space-y-6">
          <GlassCard>
            <h3 className="font-heading font-bold text-base mb-4">Eligibility</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(program.minAge || program.maxAge) && (
                <InfoRow
                  label="Age Range"
                  value={`${program.minAge ?? "—"} – ${program.maxAge ?? "—"}`}
                  icon={<User size={13} />}
                />
              )}
              <InfoRow
                label="Accepts Minors"
                value={program.acceptsMinors ? "Yes" : "No"}
                icon={<User size={13} />}
              />
              {program.locationRestrictions?.length > 0 && (
                <InfoRow
                  label="Location Restrictions"
                  value={program.locationRestrictions.join(", ")}
                  icon={<MapPin size={13} />}
                />
              )}
              {program.minGpaScore != null && (
                <InfoRow label="Min. GPA / Academic Score" value={`>${program.minGpaScore}%`} />
              )}
              {program.minIeltsScore != null && (
                <InfoRow label="Min. IELTS" value={String(program.minIeltsScore)} />
              )}
              {program.minToeflScore != null && (
                <InfoRow label="Min. TOEFL" value={String(program.minToeflScore)} />
              )}
            </div>
          </GlassCard>

          <GlassCard>
            <h3 className="font-heading font-bold text-base mb-4">Document Checklist</h3>
            <div className="space-y-2">
              {DOCUMENTS.map(({ key, label }) => {
                const required = (program as unknown as Record<string, boolean>)[key];
                return (
                  <div
                    key={key}
                    className="flex items-center gap-3 py-2 px-3 rounded-xl"
                    style={{
                      background: required ? "var(--color-accent-muted)" : "var(--color-bg-tertiary)",
                    }}
                  >
                    {required ? (
                      <CheckCircle size={15} style={{ color: "var(--color-accent)", flexShrink: 0 }} />
                    ) : (
                      <XCircle size={15} style={{ color: "var(--color-text-tertiary)", flexShrink: 0 }} />
                    )}
                    <span
                      className="text-sm"
                      style={{ color: required ? "var(--color-text-primary)" : "var(--color-text-tertiary)" }}
                    >
                      {label}
                      {key === "requiresRecommendations" && program.recommendationLetterCount > 0
                        ? ` (×${program.recommendationLetterCount})`
                        : ""}
                    </span>
                    {!required && (
                      <span className="ml-auto text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                        Not required
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs mb-0.5" style={{ color: "var(--color-text-tertiary)" }}>
        {label}
      </p>
      <p className="text-sm font-medium flex items-center gap-1">
        {icon}
        {value}
      </p>
    </div>
  );
}

function FeeRow({
  label,
  original,
  discounted,
  discountLabel,
}: {
  label: string;
  original: number;
  discounted?: number | null;
  discountLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>{label}</p>
      <div className="text-right">
        <p
          className="font-heading font-bold text-sm"
          style={{ textDecoration: discounted != null ? "line-through" : "none", color: discounted != null ? "var(--color-text-tertiary)" : "var(--color-text-primary)" }}
        >
          {formatCNY(original)}
        </p>
        {discounted != null && (
          <p className="text-sm font-bold" style={{ color: "var(--color-accent)" }}>
            {formatCNY(discounted)}
            {discountLabel && <span className="text-xs font-normal ml-1">({discountLabel})</span>}
          </p>
        )}
      </div>
    </div>
  );
}
