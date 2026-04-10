"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  MessageSquare, Mail, FileText, ArrowLeft,
  GraduationCap, MapPin, Calendar, CheckCircle,
  Clock, ExternalLink,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { WHATSAPP_NUMBER, WHATSAPP_URL } from "@/lib/constants";
import { formatCNY, DEGREE_LABELS } from "@/lib/utils";
import type { Program } from "@/types";

export function ApplyClient() {
  const searchParams = useSearchParams();
  const programId = searchParams.get("program");

  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(!!programId);

  useEffect(() => {
    if (!programId) return;
    fetch(`/api/programs/${programId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        setProgram(data ?? null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [programId]);

  const uni = program?.university;

  // Pre-filled WhatsApp message
  const waMessage = program
    ? `Hi! I'd like to apply for ${program.programName} (${DEGREE_LABELS[program.degree] ?? program.degree}) at ${uni?.name ?? "the university"}. Can you guide me through the application process?`
    : `Hi! I found ChinaUniMatch and I'd like to get help applying to a Chinese university. Can you guide me?`;

  const waUrl = `${WHATSAPP_URL}?text=${encodeURIComponent(waMessage)}`;

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container-app max-w-3xl">

        {/* Back link */}
        <Link
          href={program ? `/programs/${program.id}` : "/discover"}
          className="inline-flex items-center gap-2 text-sm mb-8 transition-colors hover:text-[var(--color-accent)]"
          style={{ color: "var(--color-text-tertiary)" }}
        >
          <ArrowLeft size={15} />
          {program ? "Back to program" : "Back to Discover"}
        </Link>

        {/* Page header */}
        <div className="mb-8">
          <div className="badge badge-accent mb-3">Apply</div>
          <h1 className="text-4xl md:text-5xl font-heading font-black mb-3">
            Start Your Application
          </h1>
          <p style={{ color: "var(--color-text-secondary)" }}>
            Our advisors will guide you through every step — from eligibility to acceptance.
          </p>
        </div>

        {/* Program summary card (shown when ?program= is set) */}
        {loading && (
          <div className="glass rounded-3xl p-6 mb-8 animate-pulse">
            <div className="h-5 rounded w-2/3 mb-3" style={{ background: "var(--color-bg-tertiary)" }} />
            <div className="h-4 rounded w-1/3" style={{ background: "var(--color-bg-tertiary)" }} />
          </div>
        )}

        {program && !loading && (
          <GlassCard className="mb-8">
            <p
              className="text-xs font-heading font-bold tracking-widest uppercase mb-3"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              You're applying for
            </p>
            <h2 className="font-heading font-black text-xl mb-1">{program.programName}</h2>

            <div className="flex items-center gap-2 mb-4" style={{ color: "var(--color-text-secondary)" }}>
              <MapPin size={13} />
              <span className="text-sm">{uni?.name} · {uni?.city}, China</span>
              {uni?.ranking && (
                <span className="badge badge-accent text-xs">#{uni.ranking}</span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Fact icon={<GraduationCap size={13} />} label="Degree" value={DEGREE_LABELS[program.degree] ?? program.degree} />
              <Fact icon={<Calendar size={13} />} label="Intake" value={[program.intakeSeason, program.intakeYear].filter(Boolean).join(" ") || "Sep 2025"} />
              <Fact label="Tuition / yr" value={formatCNY(program.originalTuition)} accent={false} />
              {program.applicationDeadline && (
                <Fact
                  icon={<Clock size={13} />}
                  label="Deadline"
                  value={new Date(program.applicationDeadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                />
              )}
            </div>

            {(program.scholarships?.length ?? 0) > 0 && (
              <div
                className="mt-4 flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl"
                style={{ background: "var(--color-accent-muted)", color: "var(--color-accent)" }}
              >
                <CheckCircle size={14} />
                <span className="font-semibold">
                  {program.scholarships![0].name} — {program.scholarships![0].coversTuition ? "Full tuition covered" : "Partial scholarship"}
                </span>
              </div>
            )}
          </GlassCard>
        )}

        {/* ── How would you like to apply? ─────────────────────────────────── */}
        <p
          className="text-xs font-heading font-bold tracking-widest uppercase mb-5"
          style={{ color: "var(--color-text-tertiary)" }}
        >
          How would you like to apply?
        </p>

        {/* WhatsApp — PRIMARY */}
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block mb-4 group"
        >
          <div
            className="relative rounded-3xl p-6 transition-all duration-300 group-hover:-translate-y-1"
            style={{
              background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
              boxShadow: "0 8px 32px rgba(37,211,102,0.35), 0 2px 8px rgba(0,0,0,0.25)",
            }}
          >
            {/* Recommended badge */}
            <span
              className="absolute top-4 right-4 text-xs font-heading font-bold px-3 py-1 rounded-full"
              style={{ background: "rgba(255,255,255,0.25)", color: "#fff" }}
            >
              RECOMMENDED
            </span>

            <div className="flex items-start gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(255,255,255,0.20)" }}
              >
                <MessageSquare size={28} color="#fff" />
              </div>
              <div className="flex-1">
                <h3 className="font-heading font-black text-xl text-white mb-1">
                  Apply via WhatsApp
                </h3>
                <p className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.80)" }}>
                  Chat directly with our advisors. Get instant answers, a personalised document
                  checklist, and step-by-step guidance from submission to acceptance.
                </p>

                <div className="flex flex-wrap gap-3">
                  {[
                    "Fast response (usually &lt;1hr)",
                    "Free consultation",
                    "Document checklist sent to you",
                    "Step-by-step guidance",
                  ].map((b) => (
                    <span
                      key={b}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
                      style={{ background: "rgba(255,255,255,0.18)", color: "#fff" }}
                      dangerouslySetInnerHTML={{ __html: `✓ ${b}` }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div
              className="mt-5 flex items-center justify-between px-5 py-3.5 rounded-2xl"
              style={{ background: "rgba(255,255,255,0.15)" }}
            >
              <div>
                <p className="font-heading font-bold text-white text-sm">Chat with an advisor now</p>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.70)" }}>{WHATSAPP_NUMBER}</p>
              </div>
              <div
                className="flex items-center gap-2 text-sm font-heading font-bold text-white group-hover:gap-3 transition-all"
              >
                Open WhatsApp <ExternalLink size={15} />
              </div>
            </div>
          </div>
        </a>

        {/* Email — COMING SOON */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ComingSoonCard
            icon={<Mail size={22} />}
            title="Apply by Email"
            description="Send your documents directly to our admissions team by email."
            label="Email application"
          />
          <ComingSoonCard
            icon={<FileText size={22} />}
            title="Online Form"
            description="Fill out our structured application form and upload documents online."
            label="Form application"
          />
        </div>

        {/* Footer note */}
        <p
          className="mt-8 text-center text-sm"
          style={{ color: "var(--color-text-tertiary)" }}
        >
          All applications are reviewed by our advisors within 24 hours.
          <br />
          WhatsApp is the fastest way to get started.
        </p>
      </div>
    </div>
  );
}

function Fact({
  icon,
  label,
  value,
  accent,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div>
      <p className="text-xs mb-0.5" style={{ color: "var(--color-text-tertiary)" }}>{label}</p>
      <p
        className="text-sm font-semibold flex items-center gap-1"
        style={{ color: accent !== false ? "var(--color-accent)" : "var(--color-text-primary)" }}
      >
        {icon}
        {value}
      </p>
    </div>
  );
}

function ComingSoonCard({
  icon,
  title,
  description,
  label,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  label: string;
}) {
  return (
    <div
      className="rounded-3xl p-5 relative overflow-hidden"
      style={{
        background: "var(--color-bg-secondary)",
        border: "1px solid var(--glass-border-subtle)",
        opacity: 0.6,
      }}
    >
      {/* Coming soon overlay */}
      <span
        className="absolute top-4 right-4 text-xs font-heading font-bold px-2.5 py-1 rounded-full"
        style={{ background: "var(--color-bg-tertiary)", color: "var(--color-text-tertiary)" }}
      >
        COMING SOON
      </span>

      <div
        className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: "var(--color-bg-tertiary)", color: "var(--color-text-secondary)" }}
      >
        {icon}
      </div>
      <h3 className="font-heading font-bold text-base mb-1">{title}</h3>
      <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
        {description}
      </p>
      <button
        disabled
        className="mt-4 w-full py-2.5 rounded-xl text-sm font-heading font-bold cursor-not-allowed"
        style={{
          background: "var(--color-bg-tertiary)",
          color: "var(--color-text-tertiary)",
          border: "1px solid var(--glass-border-subtle)",
        }}
      >
        {label}
      </button>
    </div>
  );
}
