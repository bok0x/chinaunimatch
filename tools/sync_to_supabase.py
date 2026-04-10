"""
Sync normalized program/scholarship data to Supabase.

Usage:
    python tools/sync_to_supabase.py
    python tools/sync_to_supabase.py --input .tmp/normalized_programs.json
"""

import json
import argparse
import os
import sys
import uuid
from pathlib import Path
from datetime import datetime, UTC
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

INPUT_PROGRAMS = Path(".tmp/normalized_programs.json")

# ─── Supabase client ──────────────────────────────────────────────────────────

def get_client() -> Client:
    url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_KEY")
    if not url or not key:
        raise EnvironmentError(
            "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env"
        )
    return create_client(url, key)


def log(msg: str):
    """Print safely on Windows (replace unencodable chars)."""
    print(msg.encode(sys.stdout.encoding or "utf-8", errors="replace").decode(sys.stdout.encoding or "utf-8"))


# ─── Upsert helpers ───────────────────────────────────────────────────────────
# NOTE: Table names match Prisma model names exactly (PascalCase).
# Column names match Prisma field names exactly (camelCase).

def upsert_university(client: Client, program: dict, _cache: dict = {}) -> str | None:
    """Get existing university ID by slug (cached), or insert a new record."""
    slug = program["universitySlug"]
    if slug in _cache:
        return _cache[slug]
    # Check if already exists — never overwrite the primary key
    existing = client.table("University").select("id").eq("slug", slug).maybe_single().execute()
    if existing.data:
        _cache[slug] = existing.data["id"]
        return _cache[slug]
    # Insert new university
    uni_id = str(uuid.uuid4())
    result = client.table("University").insert({
        "id": uni_id,
        "name": program["universityName"],
        "slug": slug,
        "city": program.get("city") or "",
        "province": program.get("province") or "",
        "updatedAt": datetime.now(UTC).isoformat(),
    }).execute()
    if result.data:
        _cache[slug] = result.data[0]["id"]
        return _cache[slug]
    return None


def upsert_program(client: Client, program: dict, university_id: str) -> str | None:
    """Upsert a program record and return its ID."""
    prog_data = {
        "id": str(uuid.uuid4()),
        "universityId": university_id,
        "field": program.get("field") or "",
        "programName": program["programName"],
        "degree": program["degree"],
        "teachingLanguage": program["teachingLanguage"],
        "intakeSeason": program.get("intakeSeason") or "September",
        "applicationDeadline": program.get("applicationDeadline"),
        "programDuration": program.get("programDuration") or "",
        "originalTuition": program.get("originalTuition") or 0,
        "tuitionAfterScholarship": program.get("tuitionAfterScholarship"),
        "accommodationFee": program.get("accommodationFee"),
        "registrationFee": program.get("registrationFee"),
        "applicationFee": program.get("applicationFee"),
        "serviceFee": program.get("serviceFee"),
        "minAge": program.get("minAge"),
        "maxAge": program.get("maxAge"),
        "acceptsMinors": program.get("acceptsMinors", False),
        "locationRestrictions": program.get("locationRestrictions", []),
        "minGpaScore": program.get("minGpaScore"),
        "minIeltsScore": program.get("minIeltsScore"),
        "minToeflScore": program.get("minToeflScore"),
        "requiresPassportPhoto": program.get("requiresPassportPhoto", True),
        "requiresPassportId": program.get("requiresPassportId", True),
        "requiresTranscripts": program.get("requiresTranscripts", True),
        "requiresHighestDegree": program.get("requiresHighestDegree", True),
        "requiresPhysicalExam": program.get("requiresPhysicalExam", False),
        "requiresNonCriminalRecord": program.get("requiresNonCriminalRecord", False),
        "requiresEnglishCert": program.get("requiresEnglishCert", False),
        "requiresApplicationForm": program.get("requiresApplicationForm", True),
        "requiresStudyPlan": program.get("requiresStudyPlan", True),
        "requiresRecommendations": program.get("requiresRecommendations", False),
        "recommendationLetterCount": program.get("recommendationLetterCount", 0),
        "sourceUrl": program.get("sourceUrl") or "",
        "status": program.get("status", "complete"),
        "updatedAt": datetime.now(UTC).isoformat(),
    }
    result = client.table("Program").upsert(
        prog_data,
        on_conflict="universityId,programName,degree,teachingLanguage",
    ).execute()
    if result.data:
        return result.data[0]["id"]
    return None


def upsert_scholarship(client: Client, scholarship: dict, program_id: str):
    """Upsert a scholarship linked to a program."""
    sch_data = {
        "id": str(uuid.uuid4()),
        "programId": program_id,
        "type": scholarship.get("type", "OTHER"),
        "name": scholarship.get("name") or "",
        "duration": scholarship.get("duration") or "",
        "coversTuition": scholarship.get("coversTuition", False),
        "livingAllowance": scholarship.get("livingAllowance"),
        "policyDetails": scholarship.get("policyDetails") or "",
        "updatedAt": datetime.now(UTC).isoformat(),
    }
    client.table("Scholarship").upsert(
        sch_data,
        on_conflict="programId,type,name",
    ).execute()


# ─── Main sync ────────────────────────────────────────────────────────────────

def sync_programs(client: Client, input_file: Path):
    if not input_file.exists():
        print(f"[ERROR] Input file not found: {input_file}")
        print("  Run tools/normalize_program_data.py first.")
        return

    programs = json.loads(input_file.read_text(encoding="utf-8"))
    print(f"Syncing {len(programs)} programs to Supabase...")

    inserted = 0
    errors = 0
    batch_size = 100

    for i, prog in enumerate(programs):
        try:
            uni_id = upsert_university(client, prog)
            if not uni_id:
                log(f"  [FAIL] University upsert returned no ID: {prog['universityName']}")
                errors += 1
                continue

            prog_id = upsert_program(client, prog, uni_id)
            if not prog_id:
                log(f"  [FAIL] Program upsert returned no ID: {prog['programName']}")
                errors += 1
                continue

            for sch in prog.get("scholarships", []):
                upsert_scholarship(client, sch, prog_id)

            inserted += 1
            if inserted % batch_size == 0:
                print(f"  ... {inserted}/{len(programs)} synced")

        except Exception as e:
            log(f"  [ERROR] {prog.get('programName', '?')}: {e}")
            errors += 1

    print(f"\nSync complete: {inserted} upserted, {errors} errors")


# ─── Entry Point ──────────────────────────────────────────────────────────────

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Sync normalized data to Supabase")
    parser.add_argument("--input", type=Path, default=INPUT_PROGRAMS)
    args = parser.parse_args()

    client = get_client()
    sync_programs(client, args.input)
