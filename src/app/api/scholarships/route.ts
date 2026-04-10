import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = createClient();
  const { searchParams } = new URL(req.url);

  const type = searchParams.get("type");
  const coversTuition = searchParams.get("coversTuition") === "true";
  const minAllowance = searchParams.get("minAllowance");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");
  const from = (page - 1) * limit;

  let query = supabase
    .from("Scholarship")
    .select(
      `id, type, name, duration, coversTuition, livingAllowance, policyDetails,
       program:Program(
         programName, degree, field,
         university:University(name, city, slug)
       )`,
      { count: "exact" }
    )
    .eq("active", true)
    .range(from, from + limit - 1)
    .order("type");

  if (type) query = query.eq("type", type);
  if (coversTuition) query = query.eq("coversTuition", true);
  if (minAllowance) query = query.gte("livingAllowance", parseInt(minAllowance));

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ scholarships: data, total: count ?? 0 });
}
