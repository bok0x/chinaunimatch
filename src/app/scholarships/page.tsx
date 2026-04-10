import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ScholarshipCard } from "@/components/scholarship/ScholarshipCard";
import { AnimatedGrid, AnimatedItem } from "@/components/ui/AnimatedGrid";
import type { Metadata } from "next";
import type { Scholarship } from "@/types";

export const metadata: Metadata = { title: "Scholarships" };
export const revalidate = 3600;

async function getScholarships() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("Scholarship")
    .select(
      `id, type, name, duration, coversTuition, livingAllowance, policyDetails, active,
       program:Program(
         programName, degree, field,
         university:University(name, city, slug)
       )`
    )
    .eq("active", true)
    .order("type")
    .limit(100);

  if (error) {
    console.error("Scholarships fetch error:", error.message);
    return [];
  }
  return data ?? [];
}

export default async function ScholarshipsPage() {
  const raw = await getScholarships();

  // Flatten program/university info into the card shape
  const scholarships = raw.map((s: Record<string, unknown>) => {
    const prog = s.program as Record<string, unknown> | null;
    const uni = prog?.university as Record<string, unknown> | null;
    return {
      ...(s as unknown as Scholarship),
      universityName: (uni?.name as string) ?? undefined,
      programName: (prog?.programName as string) ?? undefined,
      programField: (prog?.field as string) ?? undefined,
      programDegree: (prog?.degree as string) ?? undefined,
    };
  });

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container-app">
        {/* Header */}
        <div className="mb-10">
          <div className="badge badge-accent mb-3">Scholarships</div>
          <h1 className="text-4xl md:text-5xl font-heading font-black mb-3">
            Find Your Scholarship
          </h1>
          <p className="max-w-xl" style={{ color: "var(--color-text-secondary)" }}>
            Browse CSC, provincial, and university scholarships — many covering full tuition and a monthly living allowance.
          </p>
        </div>

        {/* Scholarship types explainer */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          {[
            { type: "CSC",        href: "/discover?hasScholarship=true", label: "Chinese Government Scholarship", desc: "Full tuition + living allowance + accommodation. Most competitive.", color: "#e74c3c" },
            { type: "PROVINCIAL", href: "/discover?hasScholarship=true", label: "Provincial Scholarships",        desc: "Funded by provincial governments. Less competitive than CSC.",   color: "#8b5cf6" },
            { type: "UNIVERSITY", href: "/discover?hasScholarship=true", label: "University Scholarships",       desc: "Awarded directly by institutions. Varies by program.",           color: "var(--color-accent)" },
          ].map((t) => (
            <Link key={t.type} href={t.href}
              className="glass p-5 rounded-2xl glass-hover block no-underline"
              style={{ textDecoration: "none" }}>
              <div
                className="badge text-xs mb-3 inline-flex"
                style={{ background: `${t.color}20`, color: t.color, border: `1px solid ${t.color}40` }}
              >
                {t.type}
              </div>
              <h3 className="font-heading font-bold text-sm mb-1">{t.label}</h3>
              <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>{t.desc}</p>
            </Link>
          ))}
        </div>

        {/* Scholarship grid */}
        {scholarships.length === 0 ? (
          <div className="glass rounded-3xl p-16 text-center">
            <p className="font-heading font-bold text-lg mb-2">No scholarships yet</p>
            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
              Run the data pipeline to populate scholarships.
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm mb-6" style={{ color: "var(--color-text-secondary)" }}>
              {scholarships.length} scholarships available
            </p>
            <AnimatedGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {scholarships.map((s) => (
                <AnimatedItem key={s.id}>
                  <ScholarshipCard scholarship={s} />
                </AnimatedItem>
              ))}
            </AnimatedGrid>
          </>
        )}
      </div>
    </div>
  );
}
