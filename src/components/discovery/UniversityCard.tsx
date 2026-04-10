"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, GraduationCap, Plus, Check } from "lucide-react";
import { useComparisonStore } from "@/stores/comparisonStore";
import { formatCNY, DEGREE_LABELS, SCHOLARSHIP_TYPE_LABELS } from "@/lib/utils";
import type { Program } from "@/types";

interface UniversityCardProps {
  program: Program;
}

export function UniversityCard({ program }: UniversityCardProps) {
  const { add, remove, has } = useComparisonStore();
  const isCompared = has(program.id);
  const hasScholarship = (program.scholarships?.length ?? 0) > 0;
  const primaryScholarship = program.scholarships?.[0];
  const uni = program.university;

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isCompared) {
      remove(program.id);
    } else {
      const added = add(program);
      if (!added) alert("Maximum 3 programs can be compared. Remove one first.");
    }
  };

  const rawCover = uni?.coverUrl;
  const isPlaceholder = !rawCover || rawCover.includes("school_rank.png");
  const coverSrc = isPlaceholder ? (uni?.logoUrl ?? null) : rawCover;
  const slug = uni?.slug ?? program.universityId;

  return (
    <article
      className="group relative flex flex-col rounded-2xl overflow-hidden transition-transform duration-300 hover:-translate-y-1"
      style={{
        background: "var(--color-bg-secondary)",
        border: "1px solid var(--glass-border-subtle)",
        boxShadow: "0 2px 16px rgba(0,0,0,0.18)",
      }}
    >
      {/* ── Cover image (links to program detail) ──────────────────────── */}
      <Link href={`/programs/${program.id}`} className="block relative w-full aspect-[16/9] overflow-hidden bg-[var(--color-bg-tertiary)]">
        {coverSrc ? (
          <Image
            src={coverSrc}
            alt={`${uni?.name ?? "University"} campus`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            unoptimized
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, var(--color-accent-hover) 0%, var(--color-accent) 100%)",
              opacity: 0.35,
            }}
          />
        )}

        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to top, rgba(5,13,26,0.85) 0%, transparent 55%)",
          }}
        />

        {/* Logo pill */}
        {uni?.logoUrl && (
          <div
            className="absolute bottom-3 left-3 w-10 h-10 rounded-xl overflow-hidden flex-shrink-0"
            style={{
              background: "rgba(255,255,255,0.95)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
            }}
          >
            <Image
              src={uni.logoUrl}
              alt={`${uni.name} logo`}
              fill
              sizes="40px"
              className="object-contain p-1"
              unoptimized
            />
          </div>
        )}

        {/* Ranking badge */}
        {uni?.ranking && (
          <span
            className="absolute top-3 right-3 text-xs font-heading font-bold px-2.5 py-1 rounded-full"
            style={{
              background: "var(--color-accent)",
              color: "#fff",
              boxShadow: "0 2px 8px rgba(54,180,137,0.4)",
            }}
          >
            #{uni.ranking}
          </span>
        )}

        {/* Scholarship ribbon */}
        {hasScholarship && (
          <span
            className="absolute top-3 left-3 flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{
              background: "rgba(54,180,137,0.9)",
              color: "#fff",
              backdropFilter: "blur(4px)",
            }}
          >
            <GraduationCap size={11} />
            {primaryScholarship ? (SCHOLARSHIP_TYPE_LABELS[primaryScholarship.type] ?? "Scholarship") : "Scholarship"}
          </span>
        )}
      </Link>

      {/* ── Card body ────────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 gap-3 p-4">
        {/* University name + city — links to university page */}
        <div>
          <Link
            href={`/discover/${slug}`}
            className="font-heading font-bold text-base leading-snug line-clamp-1 hover:underline block"
          >
            {uni?.name ?? "University"}
          </Link>
          <div
            className="flex items-center gap-1 mt-1 text-xs"
            style={{ color: "var(--color-text-secondary)" }}
          >
            <MapPin size={11} />
            <span>{uni?.city}, China</span>
          </div>
        </div>

        {/* Program — links to program detail */}
        <Link href={`/programs/${program.id}`} className="flex-1">
          <p className="font-medium text-sm leading-snug line-clamp-2">{program.programName}</p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            <span className="badge badge-gray">{DEGREE_LABELS[program.degree]}</span>
            <span className="badge badge-gray">
              {program.teachingLanguage === "ENGLISH"
                ? "English"
                : program.teachingLanguage === "CHINESE"
                ? "Chinese"
                : program.teachingLanguage === "RUSSIAN"
                ? "Russian"
                : "Bilingual"}
            </span>
            {program.field && <span className="badge badge-gray">{program.field}</span>}
          </div>
        </Link>

        {/* Fees */}
        <div
          className="mt-auto pt-3 flex items-end justify-between"
          style={{ borderTop: "1px solid var(--glass-border-subtle)" }}
        >
          <div>
            <p className="text-xs mb-0.5" style={{ color: "var(--color-text-tertiary)" }}>
              Tuition / year
            </p>
            <p className="font-heading font-bold text-lg">{formatCNY(program.originalTuition)}</p>
            {program.tuitionAfterScholarship != null && (
              <p className="text-xs" style={{ color: "var(--color-accent)" }}>
                After scholarship: {formatCNY(program.tuitionAfterScholarship)}
              </p>
            )}
          </div>
          {program.applicationDeadline && (
            <div className="text-right">
              <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                Deadline
              </p>
              <p className="text-xs font-semibold">
                {new Date(program.applicationDeadline).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Compare button ────────────────────────────────────────────────── */}
      <button
        onClick={handleCompare}
        className="mx-4 mb-4 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold font-heading transition-all"
        style={{
          background: isCompared ? "var(--color-accent-muted)" : "var(--color-bg-tertiary)",
          color: isCompared ? "var(--color-accent)" : "var(--color-text-secondary)",
          border: isCompared
            ? "1px solid var(--color-accent)"
            : "1px solid var(--glass-border-subtle)",
        }}
      >
        {isCompared ? <Check size={13} /> : <Plus size={13} />}
        {isCompared ? "Added to Compare" : "Add to Compare"}
      </button>
    </article>
  );
}
