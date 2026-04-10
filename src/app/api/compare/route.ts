import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const { programIds } = await req.json();

  if (!Array.isArray(programIds) || programIds.length < 2 || programIds.length > 3) {
    return NextResponse.json({ error: "Provide 2–3 programIds" }, { status: 400 });
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("Program")
    .select(
      `id, universityId, field, programName, degree, teachingLanguage,
       intakeSeason, applicationDeadline, programDuration, originalTuition,
       tuitionAfterScholarship, accommodationFee, registrationFee, applicationFee,
       minAge, maxAge, acceptsMinors, minIeltsScore, minGpaScore,
       requiresPassportPhoto, requiresPassportId, requiresTranscripts,
       requiresHighestDegree, requiresPhysicalExam, requiresNonCriminalRecord,
       requiresEnglishCert, requiresApplicationForm, requiresStudyPlan,
       requiresRecommendations, recommendationLetterCount,
       university:University(id, name, slug, city, province, ranking),
       scholarships:Scholarship(id, type, name, coversTuition, livingAllowance)`
    )
    .in("id", programIds);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ programs: data });
}
