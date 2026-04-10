import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { MapPin, ArrowLeft, GraduationCap, Calendar, Globe, ExternalLink } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { ProgramDetailTabs } from "@/components/programs/ProgramDetailTabs";
import { createClient } from "@/lib/supabase/server";
import { formatCNY, DEGREE_LABELS, LANGUAGE_LABELS, SCHOLARSHIP_TYPE_LABELS } from "@/lib/utils";
import type { Metadata } from "next";
import type { Program } from "@/types";

export const revalidate = 3600;

async function getProgramById(id: string): Promise<Program | null> {
  // Attempt 1: Supabase (production)
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("Program")
      .select(
        `id, universityId, field, programName, programCode, degree, teachingLanguage,
         intakeSeason, intakeYear, applicationDeadline, programDuration,
         originalTuition, tuitionAfterScholarship,
         accommodationFee, accommodationSingleFee, accommodationDoubleFee,
         registrationFee, applicationFee, serviceFee,
         minAge, maxAge, acceptsMinors, locationRestrictions,
         minGpaScore, minIeltsScore, minToeflScore, hasCscaScore,
         requiresPassportPhoto, requiresPassportId, requiresTranscripts,
         requiresHighestDegree, requiresPhysicalExam, requiresNonCriminalRecord,
         requiresEnglishCert, requiresApplicationForm, requiresStudyPlan,
         requiresRecommendations, recommendationLetterCount,
         university:University(id, name, nameZh, slug, city, province, ranking, logoUrl, coverUrl, website, description),
         scholarships:Scholarship(id, programId, type, name, category, duration, coversTuition, livingAllowance, policyDetails)`
      )
      .eq("id", id)
      .single();
    if (!error && data) return data as unknown as Program;
  } catch {
    // Supabase not configured
  }

  // Attempt 2: /data/ JSON files or mock data via internal API
  try {
    const { MOCK_PROGRAMS } = await import("@/lib/mock-programs");
    const found = MOCK_PROGRAMS.find((p) => p.id === id);
    if (found) return found;
  } catch {
    // ignore
  }

  return null;
}

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const program = await getProgramById(params.id);
  if (!program) return { title: "Program Not Found" };
  return {
    title: `${program.programName} — ${program.university?.name ?? "University"}`,
    description: `${DEGREE_LABELS[program.degree]} in ${program.field} at ${program.university?.name}. Intake: ${program.intakeSeason}. Tuition: ${formatCNY(program.originalTuition)}.`,
  };
}

export default async function ProgramDetailPage({ params }: Props) {
  const program = await getProgramById(params.id);
  if (!program) notFound();

  const uni = program.university;
  const hasScholarship = (program.scholarships?.length ?? 0) > 0;
  const primaryScholarship = program.scholarships?.[0];

  const heroCover =
    uni?.coverUrl && !uni.coverUrl.includes("school_rank.png") ? uni.coverUrl : null;

  return (
    <div className="min-h-screen pb-16">
      {/* ── Block 1: Hero / Header Summary ──────────────────────────────── */}
      <div className="relative w-full h-52 md:h-72 overflow-hidden">
        {heroCover ? (
          <Image
            src={heroCover}
            alt={`${uni?.name ?? "University"} campus`}
            fill
            priority
            sizes="100vw"
            className="object-cover"
            unoptimized
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, var(--color-accent-hover) 0%, var(--color-accent) 100%)",
              opacity: 0.4,
            }}
          />
        )}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to bottom, rgba(5,13,26,0.3) 0%, rgba(5,13,26,0.85) 100%)",
          }}
        />
        <div className="absolute top-6 left-0 right-0 container-app">
          <Link
            href="/discover"
            className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} /> Back to Discover
          </Link>
        </div>
      </div>

      <div className="container-app">
        {/* ── Hero Summary Card ─────────────────────────────────────────── */}
        <div className="-mt-16 relative z-10 mb-8">
          <GlassCard>
            <div className="flex flex-col md:flex-row gap-5">
              {/* Logo */}
              {uni?.logoUrl && (
                <div
                  className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0"
                  style={{ background: "rgba(255,255,255,0.95)", boxShadow: "0 4px 16px rgba(0,0,0,0.2)" }}
                >
                  <Image
                    src={uni.logoUrl}
                    alt={`${uni.name} logo`}
                    width={80}
                    height={80}
                    className="object-contain p-2 w-full h-full"
                    unoptimized
                  />
                </div>
              )}

              <div className="flex-1 min-w-0">
                {/* Category + Program ID */}
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {primaryScholarship?.category && (
                    <span className="badge badge-accent">{primaryScholarship.category}</span>
                  )}
                  {hasScholarship && (
                    <span
                      className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{ background: "var(--color-accent-muted)", color: "var(--color-accent)" }}
                    >
                      <GraduationCap size={11} />
                      {SCHOLARSHIP_TYPE_LABELS[primaryScholarship!.type] ?? "Scholarship"}
                    </span>
                  )}
                  {program.programCode && (
                    <span
                      className="font-mono text-xs px-2 py-1 rounded-lg"
                      style={{ background: "var(--color-bg-tertiary)", color: "var(--color-text-tertiary)" }}
                    >
                      {program.programCode}
                    </span>
                  )}
                </div>

                {/* Program title */}
                <h1 className="text-2xl md:text-3xl font-heading font-black leading-tight mb-1">
                  {program.programName}
                </h1>

                {/* University link */}
                {uni && (
                  <Link
                    href={`/discover/${uni.slug}`}
                    className="flex items-center gap-2 text-sm hover:underline mb-3"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    <MapPin size={13} />
                    {uni.name} · {uni.city}, {uni.province}
                    {uni.ranking && (
                      <span className="badge badge-gray">#{uni.ranking}</span>
                    )}
                  </Link>
                )}

                {/* Price summary */}
                <div className="flex flex-wrap items-end gap-4 mb-4">
                  <div>
                    <p className="text-xs mb-0.5" style={{ color: "var(--color-text-tertiary)" }}>
                      Tuition / year
                    </p>
                    <p
                      className="font-heading font-black text-2xl"
                      style={{ textDecoration: program.tuitionAfterScholarship != null ? "line-through" : "none", color: program.tuitionAfterScholarship != null ? "var(--color-text-tertiary)" : "var(--color-text-primary)" }}
                    >
                      {formatCNY(program.originalTuition)}
                    </p>
                    {program.tuitionAfterScholarship != null && (
                      <p className="font-heading font-black text-2xl" style={{ color: "var(--color-accent)" }}>
                        {formatCNY(program.tuitionAfterScholarship)}{" "}
                        <span className="text-sm font-normal">after scholarship</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Quick Facts */}
                <div className="flex flex-wrap gap-4 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                  <QuickFact
                    icon={<Calendar size={13} />}
                    label="Intake"
                    value={[program.intakeSeason, program.intakeYear].filter(Boolean).join(" ") || "—"}
                  />
                  <QuickFact
                    icon={<GraduationCap size={13} />}
                    label="Degree"
                    value={DEGREE_LABELS[program.degree] ?? program.degree}
                  />
                  <QuickFact
                    icon={<Globe size={13} />}
                    label="Language"
                    value={LANGUAGE_LABELS[program.teachingLanguage] ?? program.teachingLanguage}
                  />
                  {program.applicationFee != null && (
                    <QuickFact label="Application Fee" value={formatCNY(program.applicationFee)} />
                  )}
                  {program.serviceFee != null && (
                    <QuickFact label="Service Fee" value={formatCNY(program.serviceFee)} />
                  )}
                  {uni?.website && (
                    <a
                      href={uni.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:underline"
                      style={{ color: "var(--color-accent)" }}
                    >
                      <ExternalLink size={12} />
                      Official Website
                    </a>
                  )}
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* ── Blocks 2–4: Tabs ──────────────────────────────────────────── */}
        <ProgramDetailTabs program={program} />
      </div>
    </div>
  );
}

function QuickFact({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <p className="text-xs mb-0.5" style={{ color: "var(--color-text-tertiary)" }}>{label}</p>
      <p className="flex items-center gap-1 text-sm font-medium">
        {icon}
        {value}
      </p>
    </div>
  );
}
