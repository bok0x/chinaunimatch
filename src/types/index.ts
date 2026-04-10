export type Degree =
  | "NON_DEGREE"
  | "ASSOCIATE"
  | "DIPLOMA"
  | "BACHELOR"
  | "MASTER"
  | "DOCTORAL"
  | "STUDY_TOUR"
  | "JUNIOR_COLLEGE_UPGRADE";

export type Language = "ENGLISH" | "CHINESE" | "RUSSIAN" | "BILINGUAL";
export type ScholarshipType = "CSC" | "PROVINCIAL" | "UNIVERSITY" | "SILK_ROAD" | "OTHER";
export type ApplicationStatus =
  | "DRAFT"
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "ACCEPTED"
  | "REJECTED"
  | "WAITLISTED";

export interface University {
  id: string;
  name: string;
  nameZh?: string;
  slug: string;
  city: string;
  province: string;
  ranking?: number | null;
  logoUrl?: string | null;
  coverUrl?: string | null;
  website?: string | null;
  description?: string | null;
  programs?: Program[];
}

export interface Scholarship {
  id: string;
  programId: string;
  type: ScholarshipType;
  name: string;
  category: string;
  duration: string;
  coversTuition: boolean;
  livingAllowance?: number;
  policyDetails?: string;
}

export interface Program {
  id: string;
  universityId: string;
  university?: University;
  field: string;
  programName: string;
  programCode: string;
  degree: Degree;
  teachingLanguage: Language;
  intakeSeason: string;
  intakeYear?: number | null;
  applicationDeadline?: string;
  programDuration: string;
  originalTuition: number;
  tuitionAfterScholarship?: number;
  accommodationFee?: number;
  accommodationSingleFee?: number;
  accommodationDoubleFee?: number;
  registrationFee?: number;
  applicationFee?: number;
  serviceFee?: number;
  minAge?: number;
  maxAge?: number;
  acceptsMinors: boolean;
  hasCscaScore: boolean;
  locationRestrictions: string[];
  minGpaScore?: number;
  minIeltsScore?: number;
  minToeflScore?: number;
  requiresPassportPhoto: boolean;
  requiresPassportId: boolean;
  requiresTranscripts: boolean;
  requiresHighestDegree: boolean;
  requiresPhysicalExam: boolean;
  requiresNonCriminalRecord: boolean;
  requiresEnglishCert: boolean;
  requiresApplicationForm: boolean;
  requiresStudyPlan: boolean;
  requiresRecommendations: boolean;
  recommendationLetterCount: number;
  scholarships?: Scholarship[];
}

export interface ProgramFilters {
  search?: string;
  field?: string;
  degree?: Degree;
  language?: Language;
  province?: string;
  city?: string;
  universityName?: string;
  intakeYear?: number;
  intakeSeason?: string;
  acceptsMinors?: boolean;
  hasCscaScore?: boolean;
  minTuition?: number;
  maxTuition?: number;
  hasScholarship?: boolean;
  page?: number;
}

export interface ChecklistItem {
  key: string;
  label: string;
  notes: string;
  category: string;
  required: boolean;
  status: "pending" | "in_progress" | "uploaded";
  count?: number;
  fileUrl?: string;
}
