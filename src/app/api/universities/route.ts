import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = createClient();
  const { searchParams } = new URL(req.url);

  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");
  const search = searchParams.get("search") ?? "";
  const field = searchParams.get("field");
  const degree = searchParams.get("degree");
  const language = searchParams.get("language");
  const province = searchParams.get("province");
  const hasScholarship = searchParams.get("hasScholarship") === "true";
  const from = (page - 1) * limit;

  const scholarshipJoin = hasScholarship
    ? "scholarships:Scholarship!inner(id, type, name, coversTuition, livingAllowance)"
    : "scholarships:Scholarship(id, type, name, coversTuition, livingAllowance)";

  let query = supabase
    .from("Program")
    .select(
      `id, universityId, field, programName, degree, teachingLanguage,
       intakeSeason, applicationDeadline, programDuration, originalTuition,
       tuitionAfterScholarship, accommodationFee, status,
       university:University!inner(id, name, slug, city, province, ranking, logoUrl, coverUrl),
       ${scholarshipJoin}`,
      { count: "exact" }
    )
    .range(from, from + limit - 1)
    .order("programName");

  if (search) {
    query = query.or(`programName.ilike.%${search}%,field.ilike.%${search}%`);
  }
  if (degree) query = query.eq("degree", degree);
  if (language) query = query.eq("teachingLanguage", language);
  if (field) query = query.ilike("field", `%${field}%`);
  if (province) query = query.eq("university.province", province);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ programs: data, total: count ?? 0 });
}
