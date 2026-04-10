"use client";

import { motion } from "framer-motion";
import { Search, GitCompare, FileText, Award } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

const features = [
  {
    icon: Search,
    title: "Discover Universities",
    description:
      "Filter by field, language, location, and tuition. Find your perfect match from 200+ programs.",
    href: "/discover",
    color: "var(--color-accent)",
  },
  {
    icon: GitCompare,
    title: "Side-by-Side Compare",
    description:
      "Compare tuition, living costs, rankings, and scholarship availability across up to 3 programs.",
    href: "/compare",
    color: "var(--color-accent)",
  },
  {
    icon: Award,
    title: "Find Scholarships",
    description:
      "Match with CSC, provincial, and university scholarships that cover full tuition and living costs.",
    href: "/scholarships",
    color: "#f59e0b",
  },
  {
    icon: FileText,
    title: "Apply with Guidance",
    description:
      "Step-by-step application assistant. Know exactly what documents you need and when to submit.",
    href: "/apply",
    color: "#8b5cf6",
  },
];

export function FeatureGrid() {
  return (
    <section className="section container-app">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-14"
      >
        <div className="badge badge-accent inline-flex mb-4">Everything you need</div>
        <h2 className="text-4xl md:text-5xl font-heading font-black mb-4">
          Built for international students
        </h2>
        <p className="text-lg max-w-xl mx-auto" style={{ color: "var(--color-text-secondary)" }}>
          One platform to research, compare, and apply — no more jumping between
          dozens of university websites.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {features.map((f, i) => (
          <motion.a
            key={f.title}
            href={f.href}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <GlassCard hover className="h-full">
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: `${f.color}20` }}
              >
                <f.icon size={22} style={{ color: f.color }} />
              </div>
              <h3 className="font-heading font-bold text-base mb-2">{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                {f.description}
              </p>
            </GlassCard>
          </motion.a>
        ))}
      </div>
    </section>
  );
}
