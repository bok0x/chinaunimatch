-- CreateEnum
CREATE TYPE "Degree" AS ENUM ('DIPLOMA', 'BACHELOR', 'MASTER', 'PHD');

-- CreateEnum
CREATE TYPE "Language" AS ENUM ('ENGLISH', 'CHINESE', 'BILINGUAL');

-- CreateEnum
CREATE TYPE "ScholarshipType" AS ENUM ('CSC', 'PROVINCIAL', 'UNIVERSITY', 'SILK_ROAD', 'OTHER');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('DRAFT', 'IN_PROGRESS', 'SUBMITTED', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED', 'WAITLISTED');

-- CreateTable
CREATE TABLE "University" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameZh" TEXT,
    "slug" TEXT NOT NULL,
    "city" TEXT NOT NULL DEFAULT '',
    "province" TEXT NOT NULL DEFAULT '',
    "ranking" INTEGER,
    "logoUrl" TEXT,
    "coverUrl" TEXT,
    "website" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "University_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Program" (
    "id" TEXT NOT NULL,
    "universityId" TEXT NOT NULL,
    "field" TEXT NOT NULL DEFAULT '',
    "programName" TEXT NOT NULL,
    "degree" "Degree" NOT NULL,
    "teachingLanguage" "Language" NOT NULL,
    "intakeSeason" TEXT NOT NULL DEFAULT 'September',
    "applicationDeadline" TIMESTAMP(3),
    "programDuration" TEXT NOT NULL DEFAULT '',
    "originalTuition" INTEGER NOT NULL DEFAULT 0,
    "tuitionAfterScholarship" INTEGER,
    "accommodationFee" INTEGER,
    "registrationFee" INTEGER,
    "applicationFee" INTEGER,
    "serviceFee" INTEGER,
    "minAge" INTEGER,
    "maxAge" INTEGER,
    "acceptsMinors" BOOLEAN NOT NULL DEFAULT false,
    "locationRestrictions" TEXT[],
    "minGpaScore" DOUBLE PRECISION,
    "minIeltsScore" DOUBLE PRECISION,
    "minToeflScore" INTEGER,
    "otherScoreReqs" TEXT,
    "requiresPassportPhoto" BOOLEAN NOT NULL DEFAULT true,
    "requiresPassportId" BOOLEAN NOT NULL DEFAULT true,
    "requiresTranscripts" BOOLEAN NOT NULL DEFAULT true,
    "requiresHighestDegree" BOOLEAN NOT NULL DEFAULT true,
    "requiresPhysicalExam" BOOLEAN NOT NULL DEFAULT false,
    "requiresNonCriminalRecord" BOOLEAN NOT NULL DEFAULT false,
    "requiresEnglishCert" BOOLEAN NOT NULL DEFAULT false,
    "requiresApplicationForm" BOOLEAN NOT NULL DEFAULT true,
    "requiresStudyPlan" BOOLEAN NOT NULL DEFAULT true,
    "requiresRecommendations" BOOLEAN NOT NULL DEFAULT false,
    "recommendationLetterCount" INTEGER NOT NULL DEFAULT 0,
    "sourceUrl" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'complete',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Program_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scholarship" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "type" "ScholarshipType" NOT NULL,
    "name" TEXT NOT NULL,
    "duration" TEXT NOT NULL DEFAULT '',
    "coversTuition" BOOLEAN NOT NULL DEFAULT false,
    "livingAllowance" INTEGER,
    "policyDetails" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Scholarship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "country" TEXT,
    "supabaseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'DRAFT',
    "currentStep" INTEGER NOT NULL DEFAULT 1,
    "notes" TEXT,
    "passportPhotoUrl" TEXT,
    "passportIdUrl" TEXT,
    "transcriptsUrl" TEXT,
    "highestDegreeUrl" TEXT,
    "physicalExamUrl" TEXT,
    "nonCriminalRecordUrl" TEXT,
    "englishCertUrl" TEXT,
    "applicationFormUrl" TEXT,
    "studyPlanUrl" TEXT,
    "recommendationUrls" TEXT[],
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedProgram" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "programId" TEXT NOT NULL,

    CONSTRAINT "SavedProgram_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "University_slug_key" ON "University"("slug");

-- CreateIndex
CREATE INDEX "Program_universityId_idx" ON "Program"("universityId");

-- CreateIndex
CREATE INDEX "Program_field_idx" ON "Program"("field");

-- CreateIndex
CREATE INDEX "Program_degree_idx" ON "Program"("degree");

-- CreateIndex
CREATE INDEX "Program_teachingLanguage_idx" ON "Program"("teachingLanguage");

-- CreateIndex
CREATE UNIQUE INDEX "Program_universityId_programName_degree_teachingLanguage_key" ON "Program"("universityId", "programName", "degree", "teachingLanguage");

-- CreateIndex
CREATE INDEX "Scholarship_programId_idx" ON "Scholarship"("programId");

-- CreateIndex
CREATE UNIQUE INDEX "Scholarship_programId_type_name_key" ON "Scholarship"("programId", "type", "name");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_supabaseId_key" ON "User"("supabaseId");

-- CreateIndex
CREATE INDEX "Application_userId_idx" ON "Application"("userId");

-- CreateIndex
CREATE INDEX "Application_programId_idx" ON "Application"("programId");

-- CreateIndex
CREATE UNIQUE INDEX "SavedProgram_userId_programId_key" ON "SavedProgram"("userId", "programId");

-- AddForeignKey
ALTER TABLE "Program" ADD CONSTRAINT "Program_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scholarship" ADD CONSTRAINT "Scholarship_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedProgram" ADD CONSTRAINT "SavedProgram_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedProgram" ADD CONSTRAINT "SavedProgram_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
