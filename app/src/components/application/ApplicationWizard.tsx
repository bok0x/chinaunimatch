"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight, Upload, AlertCircle } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { WHATSAPP_URL } from "@/lib/constants";
import type { Program, ChecklistItem } from "@/types";

const STEPS = [
  { id: 1, label: "Select Program" },
  { id: 2, label: "Eligibility" },
  { id: 3, label: "Documents" },
  { id: 4, label: "Upload" },
  { id: 5, label: "Review" },
];

interface ApplicationWizardProps {
  program?: Program;
}

export function ApplicationWizard({ program }: ApplicationWizardProps) {
  const [step, setStep] = useState(1);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [agreed, setAgreed] = useState(false);

  // Generate checklist from program doc flags
  useEffect(() => {
    if (!program) return;
    const items: ChecklistItem[] = [];
    const add = (key: string, label: string, notes: string, category: string, count?: number) =>
      items.push({ key, label: count ? `${label} (×${count})` : label, notes, category, required: true, status: "pending", count });

    if (program.requiresPassportPhoto) add("passport_photo", "Passport Photo", "White background, 35×45mm", "identity");
    if (program.requiresPassportId) add("passport_id", "Passport ID Page", "Valid 6+ months past program start", "identity");
    if (program.requiresTranscripts) add("transcripts", "Academic Transcripts", "Official + certified translation", "academic");
    if (program.requiresHighestDegree) add("highest_degree", "Highest Degree Certificate", "Notarized copy", "academic");
    if (program.requiresPhysicalExam) add("physical_exam", "Physical Exam Form", "Official Chinese form, within 6 months", "health");
    if (program.requiresNonCriminalRecord) add("criminal_record", "Non-Criminal Record", "Police certificate, within 6 months", "legal");
    if (program.requiresEnglishCert) add("english_cert", "English Certificate", "IELTS / TOEFL", "language");
    if (program.requiresApplicationForm) add("application_form", "Application Form", "Signed and dated", "application");
    if (program.requiresStudyPlan) add("study_plan", "Study Plan", "Min 500 words", "application");
    if (program.requiresRecommendations) add("recommendations", "Recommendation Letters", "On official letterhead", "application", program.recommendationLetterCount || 1);

    setChecklist(items);
  }, [program]);

  const markItem = (key: string, status: ChecklistItem["status"]) => {
    setChecklist((prev) =>
      prev.map((item) => (item.key === key ? { ...item, status } : item))
    );
  };

  const uploadedCount = checklist.filter((i) => i.status === "uploaded").length;
  const progress = checklist.length > 0 ? Math.round((uploadedCount / checklist.length) * 100) : 0;

  if (!program) {
    return (
      <GlassCard className="text-center py-12">
        <p className="font-heading font-bold text-lg mb-2">No program selected</p>
        <p className="text-sm mb-6" style={{ color: "var(--color-text-secondary)" }}>
          Browse programs first, then click "Apply" on any program to start here.
        </p>
        <a href="/discover" className="btn-accent">Browse Programs</a>
      </GlassCard>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2 flex-shrink-0">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-heading font-bold transition-all"
              style={{
                background:
                  step > s.id
                    ? "var(--color-accent)"
                    : step === s.id
                    ? "var(--color-accent-muted)"
                    : "var(--color-bg-tertiary)",
                color:
                  step > s.id
                    ? "#fff"
                    : step === s.id
                    ? "var(--color-accent)"
                    : "var(--color-text-tertiary)",
                border: step === s.id ? "2px solid var(--color-accent)" : "2px solid transparent",
              }}
            >
              {step > s.id ? <Check size={14} /> : s.id}
            </div>
            <span
              className="text-xs font-medium hidden sm:block"
              style={{ color: step === s.id ? "var(--color-accent)" : "var(--color-text-tertiary)" }}
            >
              {s.label}
            </span>
            {i < STEPS.length - 1 && (
              <div className="w-6 h-0.5 flex-shrink-0" style={{ background: "var(--glass-border-subtle)" }} />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
        >
          {step === 1 && (
            <GlassCard>
              <h2 className="font-heading font-bold text-xl mb-4">Confirm Program</h2>
              <div className="space-y-3">
                <Row label="University" value={program.university?.name ?? "—"} />
                <Row label="Program" value={program.programName} />
                <Row label="Degree" value={program.degree} />
                <Row label="Language" value={program.teachingLanguage} />
                <Row label="Intake" value={program.intakeSeason} />
                <Row label="Deadline" value={program.applicationDeadline ? new Date(program.applicationDeadline).toLocaleDateString() : "Rolling"} />
                <Row label="Tuition / year" value={`CNY ${program.originalTuition.toLocaleString()}`} />
              </div>
            </GlassCard>
          )}

          {step === 2 && (
            <GlassCard>
              <h2 className="font-heading font-bold text-xl mb-4">Eligibility Check</h2>
              <div
                className="flex gap-3 p-4 rounded-xl mb-4"
                style={{ background: "var(--color-accent-muted)" }}
              >
                <AlertCircle size={18} style={{ color: "var(--color-accent)", flexShrink: 0 }} />
                <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                  Please review the eligibility requirements below. We display these as a guide — contact our advisors if you have questions.
                </p>
              </div>
              <div className="space-y-3">
                {program.minAge && <Row label="Minimum age" value={String(program.minAge)} />}
                {program.maxAge && <Row label="Maximum age" value={String(program.maxAge)} />}
                <Row label="Accepts minors" value={program.acceptsMinors ? "Yes" : "No"} />
                {program.minIeltsScore && <Row label="Min IELTS" value={String(program.minIeltsScore)} />}
                {program.minToeflScore && <Row label="Min TOEFL" value={String(program.minToeflScore)} />}
                {program.locationRestrictions.length > 0 && (
                  <Row label="Location restrictions" value={program.locationRestrictions.join(", ")} />
                )}
              </div>
              <a
                href={`${WHATSAPP_URL}?text=${encodeURIComponent(`Hi, I need help checking eligibility for ${program.programName} at ${program.university?.name}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost mt-4 text-sm"
              >
                Ask an Advisor
              </a>
            </GlassCard>
          )}

          {step === 3 && (
            <GlassCard>
              <h2 className="font-heading font-bold text-xl mb-4">Document Checklist</h2>
              <p className="text-sm mb-4" style={{ color: "var(--color-text-secondary)" }}>
                {checklist.length} documents required for this program. Prepare them before uploading.
              </p>
              <div className="space-y-3">
                {checklist.map((item) => (
                  <div
                    key={item.key}
                    className="flex items-start gap-3 p-3 rounded-xl transition-colors"
                    style={{ background: "var(--color-bg-tertiary)" }}
                  >
                    <div
                      className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5 cursor-pointer"
                      style={{
                        background: item.status === "uploaded" ? "var(--color-accent)" : "var(--glass-border-subtle)",
                      }}
                      onClick={() => markItem(item.key, item.status === "pending" ? "in_progress" : "pending")}
                    >
                      {item.status !== "pending" && <Check size={11} color="#fff" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>{item.notes}</p>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {step === 4 && (
            <GlassCard>
              <h2 className="font-heading font-bold text-xl mb-2">Upload Documents</h2>
              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1">
                  <span style={{ color: "var(--color-text-secondary)" }}>Upload progress</span>
                  <span style={{ color: "var(--color-accent)" }}>{uploadedCount}/{checklist.length}</span>
                </div>
                <div className="h-2 rounded-full" style={{ background: "var(--color-bg-tertiary)" }}>
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{ width: `${progress}%`, background: "var(--color-accent)" }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                {checklist.map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl"
                    style={{ background: "var(--color-bg-tertiary)" }}
                  >
                    <span className="text-sm font-medium">{item.label}</span>
                    <div className="flex items-center gap-2">
                      {item.status === "uploaded" ? (
                        <span className="badge badge-accent text-xs">Uploaded</span>
                      ) : (
                        <label className="btn-ghost text-xs py-1.5 px-3 cursor-pointer flex items-center gap-1.5">
                          <Upload size={12} />
                          Upload
                          <input
                            type="file"
                            className="sr-only"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={() => markItem(item.key, "uploaded")}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {step === 5 && (
            <GlassCard>
              <h2 className="font-heading font-bold text-xl mb-4">Review & Submit</h2>
              <div className="space-y-4 mb-6">
                <Row label="Program" value={`${program.programName} — ${program.university?.name}`} />
                <Row label="Documents uploaded" value={`${uploadedCount} / ${checklist.length}`} />
                {program.applicationDeadline && (
                  <Row label="Deadline" value={new Date(program.applicationDeadline).toLocaleDateString()} />
                )}
              </div>
              <label className="flex items-start gap-3 cursor-pointer mb-6">
                <div
                  className="w-5 h-5 rounded flex-shrink-0 flex items-center justify-center mt-0.5 border"
                  style={{
                    background: agreed ? "var(--color-accent)" : "transparent",
                    borderColor: agreed ? "var(--color-accent)" : "var(--glass-border-subtle)",
                  }}
                  onClick={() => setAgreed(!agreed)}
                >
                  {agreed && <Check size={12} color="#fff" />}
                </div>
                <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                  I confirm that all documents are accurate and I meet the eligibility requirements for this program.
                </span>
              </label>
              <button
                disabled={!agreed || uploadedCount < checklist.length}
                className="btn-accent w-full justify-center disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Submit Application
              </button>
              {uploadedCount < checklist.length && (
                <p className="text-xs mt-2 text-center" style={{ color: "var(--color-text-tertiary)" }}>
                  Upload all {checklist.length} documents to submit.
                </p>
              )}
            </GlassCard>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          disabled={step === 1}
          className="btn-ghost text-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Back
        </button>
        {step < 5 && (
          <button
            onClick={() => setStep((s) => Math.min(5, s + 1))}
            className="btn-accent text-sm"
          >
            Continue
            <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2" style={{ borderBottom: "1px solid var(--glass-border-subtle)" }}>
      <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>{label}</span>
      <span className="text-sm font-medium text-right">{value}</span>
    </div>
  );
}
