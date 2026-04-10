"""
Generate a document checklist for a specific program application.

Usage:
    python tools/generate_application_checklist.py --program-id <id>
    python tools/generate_application_checklist.py --program-id <id> --output .tmp/checklist.json
"""

import json
import argparse
import os
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

DOCUMENT_DEFINITIONS = [
    {
        "key": "requires_passport_photo",
        "label": "Passport Photo",
        "notes": "Recent photo, white background, 35×45mm, taken within the last 6 months.",
        "category": "identity",
    },
    {
        "key": "requires_passport_id",
        "label": "Passport ID Page",
        "notes": "Clear copy of bio-data page. Passport must be valid for at least 6 months beyond the program start date.",
        "category": "identity",
    },
    {
        "key": "requires_transcripts",
        "label": "Academic Transcripts",
        "notes": "Official transcripts from all previous institutions. Must include English or Chinese translation if issued in another language.",
        "category": "academic",
    },
    {
        "key": "requires_highest_degree",
        "label": "Highest Degree Certificate",
        "notes": "Notarized copy of your highest completed degree. Include certified translation if not in English or Chinese.",
        "category": "academic",
    },
    {
        "key": "requires_physical_exam",
        "label": "Physical Examination Form",
        "notes": "Use the official Foreigner Physical Examination Form. Must be completed by a licensed physician within 6 months of application.",
        "category": "health",
    },
    {
        "key": "requires_non_criminal_record",
        "label": "Non-Criminal Record Certificate",
        "notes": "Police clearance certificate from your home country. Must be issued within 6 months of application.",
        "category": "legal",
    },
    {
        "key": "requires_english_cert",
        "label": "English Proficiency Certificate",
        "notes": "IELTS, TOEFL, or equivalent. Check the program's minimum score requirements.",
        "category": "language",
    },
    {
        "key": "requires_application_form",
        "label": "Application Form",
        "notes": "Complete and sign the official application form. Download from the university's international admissions page.",
        "category": "application",
    },
    {
        "key": "requires_study_plan",
        "label": "Study Plan / Personal Statement",
        "notes": "Minimum 500 words. Describe your academic background, research interests, and career goals.",
        "category": "application",
    },
    {
        "key": "requires_recommendations",
        "label": "Recommendation Letters",
        "notes": "From professors or employers familiar with your academic/professional work. Must be on official letterhead.",
        "category": "application",
        "count_key": "recommendation_letter_count",
    },
]


def get_client():
    url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_KEY")
    if not url or not key:
        raise EnvironmentError("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env")
    return create_client(url, key)


def generate_checklist(program_id: str) -> dict:
    client = get_client()

    result = client.table("programs").select("*").eq("id", program_id).single().execute()
    if not result.data:
        raise ValueError(f"Program not found: {program_id}")

    program = result.data
    checklist = []

    for doc in DOCUMENT_DEFINITIONS:
        required = program.get(doc["key"], False)
        if not required:
            continue

        item = {
            "key": doc["key"].replace("requires_", ""),
            "label": doc["label"],
            "notes": doc["notes"],
            "category": doc["category"],
            "required": True,
            "status": "pending",  # pending | in_progress | uploaded
        }

        # For recommendations, add count
        if "count_key" in doc:
            count = program.get(doc["count_key"], 1)
            item["count"] = count
            item["label"] = f"Recommendation Letters (×{count})"

        checklist.append(item)

    return {
        "program_id": program_id,
        "program_name": program.get("program_name", ""),
        "university_id": program.get("university_id", ""),
        "application_deadline": program.get("application_deadline"),
        "checklist": checklist,
        "total_documents": len(checklist),
        "categories": list({item["category"] for item in checklist}),
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate application document checklist")
    parser.add_argument("--program-id", required=True)
    parser.add_argument("--output", type=Path, default=None)
    args = parser.parse_args()

    checklist = generate_checklist(args.program_id)

    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(json.dumps(checklist, indent=2), encoding="utf-8")
        print(f"✓ Checklist saved → {args.output}")
    else:
        print(json.dumps(checklist, indent=2))
