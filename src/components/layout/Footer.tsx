import Link from "next/link";
import { NAV_LINKS, SITE_NAME, SITE_TAGLINE, WHATSAPP_URL } from "@/lib/constants";

export function Footer() {
  return (
    <footer
      className="border-t mt-20"
      style={{ borderColor: "var(--glass-border-subtle)" }}
    >
      <div className="container-app py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="font-heading font-bold text-xl mb-2">
              China<span style={{ color: "var(--color-accent)" }}>Uni</span>Match
            </div>
            <p className="text-sm mb-4" style={{ color: "var(--color-text-secondary)" }}>
              {SITE_TAGLINE}. Helping international students discover, compare, and apply to
              the best Chinese universities.
            </p>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-accent text-sm inline-flex"
            >
              Chat with an Advisor
            </a>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-heading font-semibold text-sm mb-3 uppercase tracking-wider"
                style={{ color: "var(--color-text-tertiary)" }}>
              Platform
            </h4>
            <ul className="space-y-2">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors hover:text-[var(--color-accent)]"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-semibold text-sm mb-3 uppercase tracking-wider"
                style={{ color: "var(--color-text-tertiary)" }}>
              Support
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm transition-colors hover:text-[var(--color-accent)]"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  WhatsApp Support
                </a>
              </li>
              <li>
                <Link
                  href="/apply"
                  className="text-sm transition-colors hover:text-[var(--color-accent)]"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  Start Application
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div
          className="mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs"
          style={{ borderTop: "1px solid var(--glass-border-subtle)", color: "var(--color-text-tertiary)" }}
        >
          <span>© {new Date().getFullYear()} {SITE_NAME}. All rights reserved.</span>
          <span>Data sourced from scholarshipchina.com</span>
        </div>
      </div>
    </footer>
  );
}
