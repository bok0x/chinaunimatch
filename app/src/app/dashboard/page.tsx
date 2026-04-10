import { createClient } from "@/lib/supabase/server";
import { GlassCard } from "@/components/ui/GlassCard";
import Link from "next/link";
import { FileText, Search, Award } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch application count
  const { count: appCount } = await supabase
    .from("applications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user?.id ?? "");

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-black mb-1">Dashboard</h1>
        <p style={{ color: "var(--color-text-secondary)" }} className="text-sm">
          Welcome back, {user?.email}
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <GlassCard padding="sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--color-accent-muted)" }}>
              <FileText size={18} style={{ color: "var(--color-accent)" }} />
            </div>
            <div>
              <p className="font-heading font-bold text-2xl">{appCount ?? 0}</p>
              <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>Applications</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard padding="sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(72,197,156,0.1)" }}>
              <Search size={18} style={{ color: "var(--color-accent)" }} />
            </div>
            <div>
              <p className="font-heading font-bold text-2xl">—</p>
              <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>Saved Programs</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard padding="sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(245,158,11,0.1)" }}>
              <Award size={18} style={{ color: "#f59e0b" }} />
            </div>
            <div>
              <p className="font-heading font-bold text-2xl">—</p>
              <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>Matched Scholarships</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Quick actions */}
      <GlassCard>
        <h2 className="font-heading font-bold text-lg mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/discover" className="btn-accent text-sm">Browse Programs</Link>
          <Link href="/scholarships" className="btn-ghost text-sm">Find Scholarships</Link>
          <Link href="/apply" className="btn-ghost text-sm">Start Application</Link>
        </div>
      </GlassCard>
    </div>
  );
}
