import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCNY(amount: number): string {
  if (!amount) return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "CNY",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDeadline(deadline?: string | null): string {
  if (!deadline) return "Rolling";
  try {
    return new Date(deadline).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return deadline;
  }
}

export function getDaysUntilDeadline(deadline?: string | null): number | null {
  if (!deadline) return null;
  const diff = new Date(deadline).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export const DEGREE_LABELS: Record<string, string> = {
  NON_DEGREE: "Non-degree",
  ASSOCIATE: "Associate",
  DIPLOMA: "Diploma",
  BACHELOR: "Bachelor's",
  MASTER: "Master's",
  DOCTORAL: "Doctoral",
  STUDY_TOUR: "Study Tour",
  JUNIOR_COLLEGE_UPGRADE: "Junior College Upgrade",
};

export const LANGUAGE_LABELS: Record<string, string> = {
  ENGLISH: "English",
  CHINESE: "Chinese",
  RUSSIAN: "Russian",
  BILINGUAL: "Bilingual",
};

export const SCHOLARSHIP_TYPE_LABELS: Record<string, string> = {
  CSC: "CSC",
  PROVINCIAL: "Provincial",
  UNIVERSITY: "University",
  SILK_ROAD: "Silk Road",
  OTHER: "Scholarship",
};

export function computeYouNeedToPay(program: {
  tuitionAfterScholarship?: number | null;
  originalTuition?: number;
  accommodationFee?: number | null;
  registrationFee?: number | null;
  applicationFee?: number | null;
  serviceFee?: number | null;
}): number {
  return (
    (program.tuitionAfterScholarship ?? program.originalTuition ?? 0) +
    (program.accommodationFee ?? 0) +
    (program.registrationFee ?? 0) +
    (program.applicationFee ?? 0) +
    (program.serviceFee ?? 0)
  );
}
