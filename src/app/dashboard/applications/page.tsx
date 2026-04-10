import { createClient } from "@/lib/supabase/server";
import { GlassCard } from "@/components/ui/GlassCard";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "My Applications" };

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  DRAFT: { bg: "var(--color-bg-tertiary)", color: "var(--color-text-secondary)", label: "Draft" },
  IN_PROGRESS: { bg: "rgba(72,197,156,0.1)", color: "var(--color-accent)", label: "In Progress" },
  SUBMITTED: { bg: "var(--color-accent-muted)", color: "var(--color-accent)", label: "Submitted" },
  UNDER_REVIEW: { bg: "rgba(245,158,11,0.1)", color: "#f59e0b", label: "Under Review" },
  ACCEPTED: { bg: "rgba(54,180,137,0.15)", color: "#36b489", label: "Accepted ✓" },
  REJECTED: { bg: "rgba(239,68,68,0.1)", color: "#ef4444", label: "Rejected" },
  WAITLISTED: { bg: "rgba(139,92,246,0.1)", color: "#8b5cf6", label: "Waitlisted" },
};

export default async function ApplicationsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: applications } = await supabase
    .from("applications")
    .select("*, program:programs(program_name, degree, university:universities(name, city))")
    .eq("user_id", user?.id ?? "")
    .order("created_at", { ascending: false });

  if (!applications || applications.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-heading font-black mb-6">My Applications</h1>
        <GlassCard className="text-center py-12">
          <p className="font-heading font-bold text-lg mb-2">No applications yet</p>
          <p className="text-sm mb-6" style={{ color: "var(--color-text-secondary)" }}>
            Browse programs and click "Apply Now" to start.
          </p>
          <Link href="/discover" className="btn-accent">Browse Programs</Link>
        </GlassCard>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-heading font-black mb-6">My Applications</h1>
      <div className="space-y-4">
        {applications.map((app: {
          id: string;
          status: string;
          current_step: number;
          submitted_at?: string;
          created_at: string;
          program?: { program_name: string; degree: string; university?: { name: string; city: string } };
        }) => {
          const style = STATUS_STYLES[app.status] ?? STATUS_STYLES.DRAFT;
          return (
            <GlassCard key={app.id} padding="sm">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <p className="font-heading font-bold text-sm">
                    {app.program?.program_name ?? "Unknown Program"}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
                    {app.program?.university?.name} · {app.program?.university?.city}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className="px-3 py-1 rounded-full text-xs font-semibold font-heading"
                    style={{ background: style.bg, color: style.color }}
                  >
                    {style.label}
                  </span>
                  {app.status === "DRAFT" || app.status === "IN_PROGRESS" ? (
                    <Link href={`/apply?program=${app.id}`} className="btn-accent text-xs py-1.5 px-3">
                      Continue
                    </Link>
                  ) : (
                    <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                      {app.submitted_at
                        ? `Submitted ${new Date(app.submitted_at).toLocaleDateString()}`
                        : new Date(app.created_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
