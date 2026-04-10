import { GlassCard } from "@/components/ui/GlassCard";
import Link from "next/link";
import { SITE_NAME, SITE_TAGLINE, WHATSAPP_URL } from "@/lib/constants";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container-app max-w-3xl">
        <div className="badge badge-accent mb-4">About</div>
        <h1 className="text-4xl md:text-5xl font-heading font-black mb-4">{SITE_NAME}</h1>
        <p className="text-xl mb-10" style={{ color: "var(--color-text-secondary)" }}>
          {SITE_TAGLINE}
        </p>

        <div className="space-y-6">
          <GlassCard>
            <h2 className="font-heading font-bold text-xl mb-3">Our Mission</h2>
            <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
              ChinaUniMatch makes it easy for international students from any country to discover,
              compare, and apply to Chinese universities — all in one place. We cut through the
              complexity of navigating dozens of university websites and scholarship portals.
            </p>
          </GlassCard>

          <GlassCard>
            <h2 className="font-heading font-bold text-xl mb-3">What We Offer</h2>
            <ul className="space-y-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
              {[
                "200+ programs across top Chinese universities",
                "CSC, provincial, and university scholarship matching",
                "Side-by-side cost and requirements comparison",
                "Step-by-step application guidance with document checklists",
                "Direct advisor support via WhatsApp",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "var(--color-accent)" }} />
                  {item}
                </li>
              ))}
            </ul>
          </GlassCard>

          <GlassCard>
            <h2 className="font-heading font-bold text-xl mb-3">Contact Us</h2>
            <p className="text-sm mb-4" style={{ color: "var(--color-text-secondary)" }}>
              Have questions? Our advisors are available on WhatsApp.
            </p>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="btn-accent text-sm">
              Chat on WhatsApp
            </a>
          </GlassCard>
        </div>

        <div className="mt-10 text-center">
          <Link href="/discover" className="btn-accent">Start Exploring</Link>
        </div>
      </div>
    </div>
  );
}
