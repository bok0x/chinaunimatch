import { NextRequest, NextResponse } from "next/server";
import { MOCK_PROGRAMS } from "@/lib/mock-programs";
import type { Program } from "@/types";

// Try Supabase first, fall back to data files, then mock programs
async function getAllPrograms(): Promise<Program[]> {
  // Attempt 1: Supabase
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = createClient();
    const { data, error } = await supabase
      .from("Program")
      .select(
        `id, universityId, field, programName, programCode, degree, teachingLanguage,
         intakeSeason, intakeYear, applicationDeadline, programDuration,
         originalTuition, tuitionAfterScholarship,
         accommodationFee, accommodationSingleFee, accommodationDoubleFee,
         registrationFee, applicationFee, serviceFee,
         minAge, maxAge, acceptsMinors, locationRestrictions,
         minGpaScore, minIeltsScore, minToeflScore, hasCscaScore,
         requiresPassportPhoto, requiresPassportId, requiresTranscripts,
         requiresHighestDegree, requiresPhysicalExam, requiresNonCriminalRecord,
         requiresEnglishCert, requiresApplicationForm, requiresStudyPlan,
         requiresRecommendations, recommendationLetterCount,
         university:University(id, name, nameZh, slug, city, province, ranking, logoUrl, coverUrl, website, description),
         scholarships:Scholarship(id, programId, type, name, category, duration, coversTuition, livingAllowance, policyDetails)`
      )
      .order("programName")
      .limit(500);
    if (!error && data && data.length > 0) {
      return data as unknown as Program[];
    }
  } catch {
    // Supabase not configured — continue to fallbacks
  }

  // Attempt 2: /data/programs/all_programs.json (populated after pipeline run)
  try {
    const { readFileSync } = await import("fs");
    const { join } = await import("path");
    const file = join(process.cwd(), "..", "data", "programs", "all_programs.json");
    const raw = readFileSync(file, "utf-8");
    const parsed = JSON.parse(raw);
    const items: Program[] = (parsed.programs ?? parsed) as Program[];
    if (items.length > 0) return items;
  } catch {
    // Data pipeline not run yet — use mock data
  }

  // Fallback: hardcoded mock programs
  return MOCK_PROGRAMS;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const search = searchParams.get("search")?.toLowerCase() ?? "";
  const degree = searchParams.get("degree") ?? "";
  const language = searchParams.get("language") ?? "";
  const field = searchParams.get("field")?.toLowerCase() ?? "";
  const province = searchParams.get("province")?.toLowerCase() ?? "";
  const city = searchParams.get("city")?.toLowerCase() ?? "";
  const universityName = searchParams.get("universityName")?.toLowerCase() ?? "";
  const hasScholarship = searchParams.get("hasScholarship") === "true";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = Math.min(100, parseInt(searchParams.get("limit") ?? "24"));

  const allPrograms = await getAllPrograms();

  let filtered = allPrograms.filter((p) => {
    const uName = (p.university?.name ?? "").toLowerCase();
    const uCity = (p.university?.city ?? "").toLowerCase();
    const uProv = (p.university?.province ?? "").toLowerCase();

    if (search && !p.programName.toLowerCase().includes(search) && !p.field.toLowerCase().includes(search) && !uName.includes(search)) return false;
    if (degree && p.degree !== degree) return false;
    if (language && p.teachingLanguage !== language) return false;
    if (field && !p.field.toLowerCase().includes(field)) return false;
    if (province && !uProv.includes(province.toLowerCase())) return false;
    if (city && !uCity.includes(city.toLowerCase())) return false;
    if (universityName && !uName.includes(universityName)) return false;
    if (hasScholarship && (p.scholarships?.length ?? 0) === 0) return false;
    return true;
  });

  const total = filtered.length;
  const from = (page - 1) * limit;
  const programs = filtered.slice(from, from + limit);

  return NextResponse.json({ programs, total, page, limit });
}
