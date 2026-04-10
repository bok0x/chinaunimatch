"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  GraduationCap, MapPin, Award, Sparkles,
  ArrowRight, Globe, BookOpen, ChevronDown,
} from "lucide-react";
import { FIELDS_OF_STUDY, CHINESE_CITIES, WHATSAPP_URL } from "@/lib/constants";

/* ── GPA format configs ──────────────────────────────────── */
const GPA_FORMATS = [
  { label: "4.0",  placeholder: "3.5", max: 4.0  },
  { label: "5.0",  placeholder: "4.2", max: 5.0  },
  { label: "/20",  placeholder: "15",  max: 20   },
  { label: "%",    placeholder: "75",  max: 100  },
];

/* ── Sample "preview" match cards (static, decorative) ───── */
const PREVIEW_UNIS = [
  { name: "Peking University",     city: "Beijing",   field: "Computer Science", match: 98 },
  { name: "Fudan University",      city: "Shanghai",  field: "Business",         match: 94 },
  { name: "Tsinghua University",   city: "Beijing",   field: "Engineering",      match: 91 },
  { name: "Zhejiang University",   city: "Hangzhou",  field: "Medicine",         match: 88 },
];

const STATS = [
  { value: "1,300+",  label: "Universities" },
  { value: "12,000+", label: "Programs"     },
  { value: "490+",    label: "Scholarships" },
];

export function Hero() {
  const router = useRouter();
  const [gpaFmt, setGpaFmt] = useState(0);
  const [form, setForm] = useState({
    field:      "",
    degree:     "",
    gpa:        "",
    city:       "",
    language:   "",
    scholarship: false,
  });

  function set<K extends keyof typeof form>(key: K, val: (typeof form)[K]) {
    setForm(f => ({ ...f, [key]: val }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const p = new URLSearchParams();
    if (form.field)                          p.set("field",          form.field);
    if (form.degree)                         p.set("degree",         form.degree);
    if (form.language && form.language !== "any") p.set("language",  form.language);
    if (form.city)                           p.set("province",       form.city);
    if (form.scholarship)                    p.set("hasScholarship", "true");
    router.push(`/discover?${p.toString()}`);
  }

  return (
    <section
      className="relative min-h-screen flex flex-col justify-center overflow-hidden"
      style={{ paddingTop: "7rem", paddingBottom: "4rem" }}
    >
      {/* ── Atmospheric orbs (layered blurs) ──────────────── */}
      <div aria-hidden className="pointer-events-none select-none">
        <div className="absolute -top-32 -left-40 w-[700px] h-[700px] rounded-full opacity-60"
          style={{ background: "radial-gradient(circle, rgba(72,197,156,0.28) 0%, transparent 65%)", filter: "blur(90px)" }} />
        <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] rounded-full opacity-50"
          style={{ background: "radial-gradient(circle, rgba(100,218,227,0.22) 0%, transparent 65%)", filter: "blur(90px)" }} />
        <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] rounded-full opacity-40"
          style={{ background: "radial-gradient(circle, rgba(80,50,180,0.16) 0%, transparent 65%)", filter: "blur(100px)" }} />
      </div>

      <div className="container-app relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20 items-center">

          {/* ── LEFT: Copy + Form ─────────────────────────── */}
          <div>
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 badge badge-accent mb-6"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping"
                  style={{ background: "var(--color-accent)" }} />
                <span className="relative inline-flex h-2 w-2 rounded-full"
                  style={{ background: "var(--color-accent)" }} />
              </span>
              AI-Powered University Matching
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.08 }}
              className="text-4xl md:text-5xl xl:text-6xl font-heading font-black mb-4 leading-[1.05] tracking-tight"
            >
              Find Your Perfect
              <br />
              <span className="text-gradient">University in China</span>
            </motion.h1>

            {/* Sub */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="text-base md:text-lg mb-8 leading-relaxed max-w-lg"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Tell us about yourself — we&apos;ll match you with programs from
              1,300+ Chinese universities, including CSC scholarship opportunities.
            </motion.p>

            {/* ── Matching Form ─────────────────────────────── */}
            <motion.form
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.22 }}
              onSubmit={handleSubmit}
              className="glass rounded-3xl p-6 space-y-5"
            >
              {/* Row 1 — Field + Degree */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Field of study */}
                <div>
                  <label className="block text-xs font-heading font-bold tracking-widest mb-2"
                    style={{ color: "var(--color-text-tertiary)" }}>
                    FIELD OF STUDY
                  </label>
                  <div className="relative">
                    <select
                      className="input-glass w-full"
                      value={form.field}
                      onChange={e => set("field", e.target.value)}
                    >
                      <option value="">Any field…</option>
                      {FIELDS_OF_STUDY.map(f => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Degree */}
                <div>
                  <label className="block text-xs font-heading font-bold tracking-widest mb-2"
                    style={{ color: "var(--color-text-tertiary)" }}>
                    DEGREE LEVEL
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(["BACHELOR", "MASTER", "PHD"] as const).map(d => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => set("degree", form.degree === d ? "" : d)}
                        className={`py-2.5 text-xs font-heading font-bold rounded-xl border transition-all duration-200 ${
                          form.degree === d
                            ? "border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent-muted)] shadow-[0_0_12px_var(--color-accent-glow)]"
                            : "border-transparent bg-white/5 hover:bg-white/10 hover:border-white/15"
                        }`}
                        style={{ color: form.degree === d ? undefined : "var(--color-text-secondary)" }}
                      >
                        {d === "BACHELOR" ? "Bachelor" : d === "MASTER" ? "Master" : "PhD"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Row 2 — GPA + City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* GPA */}
                <div>
                  <label className="block text-xs font-heading font-bold tracking-widest mb-2"
                    style={{ color: "var(--color-text-tertiary)" }}>
                    YOUR GPA
                  </label>
                  <div className="flex gap-2">
                    {/* Format toggle row */}
                    <div className="flex rounded-xl overflow-hidden border border-white/8 flex-shrink-0"
                      style={{ background: "rgba(255,255,255,0.04)" }}>
                      {GPA_FORMATS.map((fmt, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setGpaFmt(i)}
                          className={`px-2 py-2 text-xs font-heading font-bold transition-all duration-150 ${
                            gpaFmt === i
                              ? "text-white"
                              : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
                          }`}
                          style={gpaFmt === i ? { background: "var(--color-accent)" } : {}}
                        >
                          {fmt.label}
                        </button>
                      ))}
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max={GPA_FORMATS[gpaFmt].max}
                      placeholder={GPA_FORMATS[gpaFmt].placeholder}
                      className="input-glass flex-1 min-w-0"
                      value={form.gpa}
                      onChange={e => set("gpa", e.target.value)}
                    />
                  </div>
                </div>

                {/* City / Province */}
                <div>
                  <label className="block text-xs font-heading font-bold tracking-widest mb-2"
                    style={{ color: "var(--color-text-tertiary)" }}>
                    PREFERRED CITY / REGION
                  </label>
                  <select
                    className="input-glass w-full"
                    value={form.city}
                    onChange={e => set("city", e.target.value)}
                  >
                    <option value="">Anywhere in China</option>
                    {CHINESE_CITIES.map(({ city, count }) => (
                      <option key={city} value={city}>{city} ({count} universities)</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 3 — Language + Scholarship toggle */}
              <div className="flex flex-wrap items-end gap-4">
                {/* Language */}
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-heading font-bold tracking-widest mb-2"
                    style={{ color: "var(--color-text-tertiary)" }}>
                    TEACHING LANGUAGE
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { v: "ENGLISH", l: "English" },
                      { v: "CHINESE", l: "Chinese" },
                      { v: "any",     l: "Any" },
                    ].map(opt => (
                      <button
                        key={opt.v}
                        type="button"
                        onClick={() => set("language", form.language === opt.v ? "" : opt.v)}
                        className={`py-2.5 text-xs font-heading font-bold rounded-xl border transition-all duration-200 ${
                          form.language === opt.v
                            ? "border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent-muted)] shadow-[0_0_12px_var(--color-accent-glow)]"
                            : "border-transparent bg-white/5 hover:bg-white/10 hover:border-white/15"
                        }`}
                        style={{ color: form.language === opt.v ? undefined : "var(--color-text-secondary)" }}
                      >
                        {opt.l}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Scholarship toggle */}
                <div className="flex-shrink-0 pb-0">
                  <label className="block text-xs font-heading font-bold tracking-widest mb-2"
                    style={{ color: "var(--color-text-tertiary)" }}>
                    SCHOLARSHIP
                  </label>
                  <button
                    type="button"
                    onClick={() => set("scholarship", !form.scholarship)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-heading font-bold transition-all duration-200 ${
                      form.scholarship
                        ? "border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent-muted)]"
                        : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
                    }`}
                    style={{ color: form.scholarship ? undefined : "var(--color-text-secondary)" }}
                  >
                    <Award size={14} />
                    Need Scholarship
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="btn-accent w-full py-3.5 text-[0.95rem] justify-center gap-2.5"
              >
                <Sparkles size={17} />
                Find My Matches
                <ArrowRight size={17} />
              </button>
            </motion.form>

            {/* Quick links */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap items-center gap-3 mt-5"
            >
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost text-sm py-2"
              >
                Talk to an Advisor
              </a>
              <a href="/scholarships" className="btn-ghost text-sm py-2">
                Browse Scholarships
              </a>
            </motion.div>
          </div>

          {/* ── RIGHT: Match Preview Panel ────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="hidden lg:flex flex-col gap-4"
          >
            {/* Stats glass card */}
            <div className="glass rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "var(--color-accent-muted)" }}>
                  <GraduationCap size={20} style={{ color: "var(--color-accent)" }} />
                </div>
                <div>
                  <p className="font-heading font-bold text-sm">China&apos;s Top Universities</p>
                  <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                    Verified data from 30+ provinces
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {STATS.map(s => (
                  <div key={s.label}
                    className="text-center p-3 rounded-2xl"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div className="font-heading font-black text-xl" style={{ color: "var(--color-accent)" }}>
                      {s.value}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Preview match cards */}
            <div className="flex flex-col gap-3">
              <p className="text-xs font-heading font-bold tracking-widest px-1"
                style={{ color: "var(--color-text-tertiary)" }}>
                TOP MATCHES FOR YOU
              </p>
              {PREVIEW_UNIS.map((u, i) => (
                <motion.div
                  key={u.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.08 }}
                  className="glass rounded-2xl p-4 flex items-center gap-4 glass-hover cursor-pointer"
                  onClick={() => router.push("/discover")}
                >
                  {/* Avatar */}
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 font-heading font-black text-xl"
                    style={{ background: "var(--color-accent-muted)", color: "var(--color-accent)" }}
                  >
                    {u.name.charAt(0)}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-heading font-bold text-sm truncate">{u.name}</p>
                    <div className="flex items-center gap-1.5 text-xs mt-0.5"
                      style={{ color: "var(--color-text-secondary)" }}>
                      <MapPin size={11} />
                      {u.city}
                      <span className="opacity-40">·</span>
                      <BookOpen size={11} />
                      {u.field}
                    </div>
                  </div>
                  {/* Match % */}
                  <div className="flex-shrink-0 text-right">
                    <div className="font-heading font-black text-xl leading-none"
                      style={{ color: "var(--color-accent)" }}>
                      {u.match}%
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>
                      Match
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Globe decoration */}
            <div
              className="glass rounded-2xl p-4 flex items-center gap-3 text-sm"
              style={{ color: "var(--color-text-secondary)" }}
            >
              <Globe size={18} style={{ color: "var(--color-accent)" }} />
              <span>
                Students from <strong style={{ color: "var(--color-text-primary)" }}>100+ countries</strong>{" "}
                enrolled in Chinese universities this year
              </span>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        style={{ color: "var(--color-text-tertiary)" }}
      >
        <span className="text-xs font-medium tracking-widest uppercase">Scroll</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.6, repeat: Infinity }}
        >
          <ChevronDown size={16} />
        </motion.div>
      </motion.div>
    </section>
  );
}
