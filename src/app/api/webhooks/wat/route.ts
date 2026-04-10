import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

const VALID_TAGS = ["universities", "scholarships", "programs"] as const;

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-wat-secret");
  if (secret !== process.env.WAT_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const tag = body.tag as (typeof VALID_TAGS)[number];

  if (!VALID_TAGS.includes(tag)) {
    return NextResponse.json(
      { error: `Invalid tag. Valid: ${VALID_TAGS.join(", ")}` },
      { status: 400 }
    );
  }

  revalidateTag(tag);
  return NextResponse.json({ revalidated: true, tag, at: new Date().toISOString() });
}
