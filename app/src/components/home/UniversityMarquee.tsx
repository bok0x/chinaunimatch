"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";

// Row 1 — Beijing, Shanghai, Nanjing, Hangzhou, Tianjin, Harbin
const ROW1 = [
  "Peking University",
  "Tsinghua University",
  "Fudan University",
  "Shanghai Jiao Tong University",
  "Zhejiang University",
  "Nanjing University",
  "USTC",
  "Tongji University",
  "Renmin University",
  "Beijing Normal University",
  "Tianjin University",
  "Southeast University",
  "Harbin Institute of Technology",
  "Harbin Engineering University",
  "Nanjing Tech University",
  "Nanjing University of Aeronautics",
  "East China Normal University",
  "Donghua University",
];

// Row 2 — Wuhan, Guangzhou, Xi'an, Chengdu, Chongqing, Changsha
const ROW2 = [
  "Wuhan University",
  "Huazhong University of S&T",
  "Wuhan University of Technology",
  "Sun Yat-sen University",
  "South China University of Technology",
  "Guangzhou University",
  "Xi'an Jiaotong University",
  "Northwestern Polytechnical University",
  "Xidian University",
  "Sichuan University",
  "UESTC",
  "Southwest Jiaotong University",
  "Chongqing University",
  "Southwest University",
  "Central South University",
  "Hunan University",
  "Hunan Normal University",
];

// Row 3 — Zhengzhou, Hefei, Nanchang, Jinan, Shenyang, Dalian, Qingdao + smaller hubs
const ROW3 = [
  "Zhengzhou University",
  "Henan University",
  "Henan Normal University",
  "Hefei University of Technology",
  "Anhui University",
  "Nanchang University",
  "Jiangxi Normal University",
  "Shandong University",
  "Ocean University of China",
  "Jinan University",
  "Northeastern University",
  "Dalian University of Technology",
  "Dalian Maritime University",
  "China University of Petroleum",
  "Qingdao University",
  "Lanzhou University",
  "Yunnan University",
  "Guizhou University",
  "Guangxi University",
  "Ningbo University",
  "Soochow University",
  "SUSTech (Shenzhen)",
  "Shenzhen University",
  "Xiamen University",
  "Fuzhou University",
];

// ─── Single pill ──────────────────────────────────────────────────────────────

function Pill({ name, accent }: { name: string; accent?: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 glass rounded-full flex-shrink-0"
      style={{ color: "var(--color-text-secondary)" }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{
          background: accent ? "var(--color-accent-deep)" : "var(--color-accent)",
        }}
      />
      {name}
    </span>
  );
}

// ─── Scroll-rotating row ──────────────────────────────────────────────────────
//
// The row container rotates around the X axis as you scroll through the section
// (rotateX driven by scrollYProgress). Perspective on the outer div creates
// the 3D depth. The inner strip continues its infinite CSS marquee.

interface ScrollRowProps {
  items: string[];
  reverse?: boolean;
  rotateX: MotionValue<number>;
  opacity: MotionValue<number>;
}

function ScrollRow({ items, reverse, rotateX, opacity }: ScrollRowProps) {
  const doubled = [...items, ...items];
  return (
    // Perspective wrapper — required for 3D to be visible
    <div style={{ perspective: "900px", perspectiveOrigin: "50% 50%" }}>
      <motion.div
        style={{ rotateX, opacity }}
        className="relative flex overflow-hidden"
      >
        <div
          className={`flex gap-3 whitespace-nowrap ${
            reverse ? "animate-marquee-reverse" : "animate-marquee"
          }`}
        >
          {doubled.map((uni, i) => (
            <Pill key={i} name={uni} accent={reverse} />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────
//
// Scroll animation:
//   • Rows enter at rotateX(14deg) — tilted away from viewer (below the horizon)
//   • As the section scrolls into center of viewport → rotateX(0) — perfectly flat
//   • As it exits the top → tilts to rotateX(-8deg) — leaning toward viewer
//   • Opacity also breathes in: 0.4 → 1 → 1 → 0.6

export function UniversityMarquee() {
  const ref = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Row 1: tilts forward (positive) on entry, levels out, tilts slightly back on exit
  const rotateX1 = useTransform(scrollYProgress, [0, 0.35, 0.65, 1], [14, 0, 0, -7]);
  const opacity1 = useTransform(scrollYProgress, [0, 0.25, 0.75, 1], [0.4, 1, 1, 0.6]);

  // Row 2: mirror — tilts opposite direction
  const rotateX2 = useTransform(scrollYProgress, [0, 0.35, 0.65, 1], [-14, 0, 0, 7]);
  const opacity2 = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.4, 1, 1, 0.6]);

  // Row 3: same as row 1
  const rotateX3 = useTransform(scrollYProgress, [0, 0.4, 0.65, 1], [14, 0, 0, -7]);
  const opacity3 = useTransform(scrollYProgress, [0, 0.35, 0.75, 1], [0.4, 1, 1, 0.6]);

  return (
    <section
      ref={ref}
      className="py-14 overflow-hidden space-y-3"
      style={{
        borderTop: "1px solid var(--glass-border-subtle)",
        borderBottom: "1px solid var(--glass-border-subtle)",
      }}
    >
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center text-xs font-heading font-semibold uppercase tracking-widest mb-6"
        style={{ color: "var(--color-text-tertiary)" }}
      >
        1,500+ universities across 40 cities in our database
      </motion.p>

      <ScrollRow items={ROW1} rotateX={rotateX1} opacity={opacity1} />
      <ScrollRow items={ROW2} reverse rotateX={rotateX2} opacity={opacity2} />
      <ScrollRow items={ROW3} rotateX={rotateX3} opacity={opacity3} />
    </section>
  );
}
