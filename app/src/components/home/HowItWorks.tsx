"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Search, GitCompare, FileCheck } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: Search,
    title: "Discover",
    description:
      "Search 12,000+ programs from 1,300+ universities. Filter by field, language, city, and scholarship availability.",
    color: "var(--color-accent)",
  },
  {
    step: "02",
    icon: GitCompare,
    title: "Compare",
    description:
      "Add up to 3 programs side-by-side. Compare tuition, ranking, living costs, and documents required.",
    color: "var(--color-accent)",
  },
  {
    step: "03",
    icon: FileCheck,
    title: "Apply",
    description:
      "Get a personalised document checklist and step-by-step guidance — or talk to an advisor on WhatsApp.",
    color: "var(--color-accent-deep)",
  },
];

// ─── Parallax image-block wrapper ────────────────────────────────────────────
//
// Each step icon block acts as a "scroll-section trigger frame":
//   • Enters from below with rotateX tilt (tilted back) + slight Y offset
//   • Levels out as it crosses into the viewport center
//   • The perspective on the parent creates true 3D depth

function StepCard({
  s,
  i,
}: {
  s: (typeof steps)[number];
  i: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start 95%", "start 40%"],
  });

  // 3D entrance: icon block rotates from tilted-back to flat
  const rotateX = useTransform(scrollYProgress, [0, 1], [18, 0]);
  const translateY = useTransform(scrollYProgress, [0, 1], [30, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.88, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [0, 1]);

  return (
    <div ref={cardRef} className="relative flex flex-col items-center text-center">
      {/* Icon block — 3D scroll-driven entrance */}
      <div style={{ perspective: "700px", perspectiveOrigin: "50% 80%" }}>
        <motion.div
          style={{ rotateX, y: translateY, scale, opacity }}
          className="w-28 h-28 rounded-3xl flex items-center justify-center mb-6 relative"
          css-comment="transformPerspective applied via parent perspective div above"
        >
          {/* Glow layer */}
          <div
            className="absolute inset-0 rounded-3xl"
            style={{
              background: `${s.color}12`,
              border: `1px solid ${s.color}30`,
              boxShadow: `0 0 40px ${s.color}22, inset 0 1px 0 rgba(255,255,255,0.10)`,
            }}
          />
          <s.icon size={36} style={{ color: s.color, position: "relative" }} />
          {/* Step number badge */}
          <span
            className="absolute -top-3 -right-3 w-7 h-7 rounded-full flex items-center justify-center text-xs font-heading font-black text-white"
            style={{ background: s.color }}
          >
            {i + 1}
          </span>
        </motion.div>
      </div>

      {/* Text — standard fade-in-up, staggered */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.55, delay: i * 0.12 + 0.1, ease: [0.22, 1, 0.36, 1] }}
      >
        <h3 className="font-heading font-black text-xl mb-3">{s.title}</h3>
        <p
          className="text-sm leading-relaxed max-w-xs"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {s.description}
        </p>
      </motion.div>
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

export function HowItWorks() {
  return (
    <section className="section container-app relative">
      {/* Atmospheric blob */}
      <div
        className="absolute left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-3xl opacity-5 pointer-events-none"
        style={{ background: "var(--color-accent)" }}
      />

      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-14"
      >
        <div className="badge badge-accent inline-flex mb-4">How it works</div>
        <h2 className="text-4xl md:text-5xl font-heading font-black mb-4">
          Three steps to your{" "}
          <span className="text-gradient">dream program</span>
        </h2>
        <p
          className="text-lg max-w-xl mx-auto"
          style={{ color: "var(--color-text-secondary)" }}
        >
          No more hours lost on scattered university websites. ChinaUniMatch gets
          you from search to application in minutes.
        </p>
      </motion.div>

      {/* Steps grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
        {/* Connector line — desktop only */}
        <div
          className="hidden md:block absolute top-14 left-[calc(33%+2rem)] right-[calc(33%+2rem)] h-px"
          style={{
            background:
              "linear-gradient(90deg, var(--color-accent) 0%, var(--color-accent-deep) 100%)",
            opacity: 0.35,
          }}
        />

        {steps.map((s, i) => (
          <StepCard key={s.step} s={s} i={i} />
        ))}
      </div>
    </section>
  );
}
