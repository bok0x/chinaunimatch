import { NextRequest, NextResponse } from "next/server";
import { MOCK_PROGRAMS } from "@/lib/mock-programs";
import type { Program } from "@/types";

async function loadDataPrograms(): Promise<Program[] | null> {
  try {
    const { readFileSync } = await import("fs");
    const { join } = await import("path");
    const file = join(process.cwd(), "..", "data", "programs", "all_programs.json");
    const raw = readFileSync(file, "utf-8");
    const parsed = JSON.parse(raw);
    const items: Program[] = (parsed.programs ?? parsed) as Program[];
    return items.length > 0 ? items : null;
  } catch {
    return null;
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const allPrograms: Program[] = (await loadDataPrograms()) ?? MOCK_PROGRAMS;
  const program = allPrograms.find((p) => p.id === id) ?? null;

  if (!program) {
    return NextResponse.json({ error: "Program not found" }, { status: 404 });
  }

  return NextResponse.json(program);
}
