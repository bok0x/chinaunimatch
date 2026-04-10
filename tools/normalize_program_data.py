"""
Normalize raw scraped program data into the canonical schema.

Usage:
    python tools/normalize_program_data.py
    python tools/normalize_program_data.py --input .tmp/raw_scholarshipchina.json --output .tmp/normalized_programs.json
"""

import json
import argparse
import re
from pathlib import Path
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, field_validator, model_validator

INPUT_FILE = Path(".tmp/raw_scholarshipchina.json")
OUTPUT_FILE = Path(".tmp/normalized_programs.json")
REPORT_FILE = Path(".tmp/validation_report.json")


# ─── Schema ───────────────────────────────────────────────────────────────────

class ScholarshipModel(BaseModel):
    type: str = "UNIVERSITY"  # CSC | PROVINCIAL | UNIVERSITY | SILK_ROAD | OTHER
    name: str = ""
    duration: str = ""
    coversTuition: bool = False
    livingAllowance: Optional[int] = None  # CNY per month
    policyDetails: str = ""


class ProgramModel(BaseModel):
    # Identity
    universityName: str
    universitySlug: str = ""
    city: str = ""
    province: str = ""

    # Program details
    field: str = ""
    programName: str
    degree: str  # BACHELOR | MASTER | PHD | DIPLOMA
    teachingLanguage: str = "ENGLISH"  # ENGLISH | CHINESE | BILINGUAL
    intakeSeason: str = ""
    applicationDeadline: Optional[str] = None
    programDuration: str = ""

    # Fees (CNY per year unless noted)
    originalTuition: int = 0
    tuitionAfterScholarship: Optional[int] = None
    accommodationFee: Optional[int] = None
    registrationFee: Optional[int] = None
    applicationFee: Optional[int] = None
    serviceFee: Optional[int] = None

    # Eligibility
    minAge: Optional[int] = None
    maxAge: Optional[int] = None
    acceptsMinors: bool = False
    locationRestrictions: list[str] = []
    minGpaScore: Optional[float] = None
    minIeltsScore: Optional[float] = None
    minToeflScore: Optional[int] = None

    # Documents (boolean flags)
    requiresPassportPhoto: bool = True
    requiresPassportId: bool = True
    requiresTranscripts: bool = True
    requiresHighestDegree: bool = True
    requiresPhysicalExam: bool = False
    requiresNonCriminalRecord: bool = False
    requiresEnglishCert: bool = False
    requiresApplicationForm: bool = True
    requiresStudyPlan: bool = True
    requiresRecommendations: bool = False
    recommendationLetterCount: int = 0

    # Scholarship info
    scholarships: list[ScholarshipModel] = []

    # Meta
    sourceUrl: str = ""
    status: str = "complete"  # complete | incomplete
    missingFields: list[str] = []

    @field_validator("degree")
    @classmethod
    def validate_degree(cls, v):
        valid = {"BACHELOR", "MASTER", "PHD", "DIPLOMA"}
        v_upper = v.upper().strip()
        if v_upper in valid:
            return v_upper
        # Fuzzy map
        if "BACH" in v_upper or "BSC" in v_upper or "B.A" in v_upper:
            return "BACHELOR"
        if "MAST" in v_upper or "MSC" in v_upper or "MBA" in v_upper:
            return "MASTER"
        if "PHD" in v_upper or "DOCT" in v_upper:
            return "PHD"
        if "DIPL" in v_upper or "CERT" in v_upper:
            return "DIPLOMA"
        return "BACHELOR"  # default fallback

    @field_validator("teachingLanguage")
    @classmethod
    def validate_language(cls, v):
        v_upper = v.upper().strip()
        if "CHIN" in v_upper and "ENG" in v_upper:
            return "BILINGUAL"
        if "CHIN" in v_upper:
            return "CHINESE"
        return "ENGLISH"

    @model_validator(mode="after")
    def check_required_fields(self):
        missing = []
        if not self.programName:
            missing.append("programName")
        if not self.universityName:
            missing.append("universityName")
        if self.originalTuition == 0:
            missing.append("originalTuition")
        if not self.teachingLanguage:
            missing.append("teachingLanguage")
        if missing:
            self.missingFields = missing
            self.status = "incomplete"
        return self


# ─── Parsers ──────────────────────────────────────────────────────────────────

def slugify(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def parse_cny_amount(text: str) -> Optional[int]:
    """Extract a CNY integer from strings like 'CNY 25,000/year' or '¥25000'."""
    if not text:
        return None
    # Remove currency symbols and normalize
    clean = re.sub(r"[¥CNYcny,RMBrmb\s]", "", text)
    # Find a number
    m = re.search(r"(\d+(?:\.\d+)?)", clean)
    if m:
        return int(float(m.group(1)))
    return None


def parse_deadline(text: str) -> Optional[str]:
    """Parse a deadline string into ISO date or None."""
    if not text:
        return None
    # Try common date patterns
    patterns = [
        r"(\d{4}[-/]\d{1,2}[-/]\d{1,2})",
        r"(\d{1,2}[-/]\d{1,2}[-/]\d{4})",
        r"(\w+ \d{1,2},?\s*\d{4})",
        r"(\d{1,2}\s+\w+\s+\d{4})",
    ]
    for pat in patterns:
        m = re.search(pat, text)
        if m:
            return m.group(1)
    return None


def parse_scholarship_type(text: str) -> str:
    t = text.upper()
    if "CSC" in t or "CHINESE GOVERNMENT" in t:
        return "CSC"
    if "SILK" in t or "ROAD" in t:
        return "SILK_ROAD"
    if "PROVINCE" in t or "PROVINCIAL" in t:
        return "PROVINCIAL"
    if "UNIVERSITY" in t or "COLLEGE" in t or "INSTITUTE" in t:
        return "UNIVERSITY"
    return "OTHER"


def detect_document_requirements(text: str) -> dict:
    """Detect which documents are required from free text."""
    t = text.lower()
    return {
        "requiresPassportPhoto": "passport photo" in t or "recent photo" in t,
        "requiresPassportId": "passport" in t and ("copy" in t or "page" in t or "scan" in t),
        "requiresTranscripts": "transcript" in t or "academic record" in t,
        "requiresHighestDegree": "degree" in t and ("certif" in t or "diploma" in t or "notariz" in t),
        "requiresPhysicalExam": "physical exam" in t or "medical" in t or "health exam" in t,
        "requiresNonCriminalRecord": "criminal" in t or "police" in t or "no criminal" in t,
        "requiresEnglishCert": "ielts" in t or "toefl" in t or "english proficiency" in t or "language cert" in t,
        "requiresApplicationForm": "application form" in t or "admission form" in t,
        "requiresStudyPlan": "study plan" in t or "personal statement" in t or "motivation" in t,
        "requiresRecommendations": "recommendation" in t or "reference letter" in t,
        "recommendationLetterCount": 2 if "two recommendation" in t or "2 recommendation" in t else
                                     1 if "recommendation" in t else 0,
    }


def normalize_record(raw: dict) -> Optional[dict]:
    """Convert a raw scraped record to the normalized Program schema."""
    # raw may be {"api_data": {...}} (old format) or a direct product dict (new format)
    api = raw.get("api_data", raw)

    # Field mappings for the istudyedu.com API (product object)
    university_name = (
        api.get("school_name") or          # istudyedu products API
        api.get("en_name") or              # istudyedu schools API
        api.get("university_name") or
        api.get("universityName") or
        raw.get("universityName") or
        extract_from_raw_text(raw.get("raw_text", ""), "university")
    )

    program_name = (
        api.get("subject") or              # istudyedu products API
        api.get("en_name") or              # fallback to school name if no subject
        api.get("program_name") or
        api.get("programName") or
        raw.get("programName") or
        extract_from_raw_text(raw.get("raw_text", ""), "program")
    )

    if not university_name or not program_name:
        return None

    # Degree: "education" field in products API (e.g. "Bachelor", "Master", "PhD", "Non-degree")
    degree_raw = (
        api.get("education") or
        api.get("degree") or
        raw.get("degree") or
        "BACHELOR"
    )

    # Language: "language" field (e.g. "English", "Chinese", "Chinese-English Bilingual")
    language_raw = (
        api.get("language") or
        api.get("teaching_language") or
        raw.get("teachingLanguage") or
        "English"
    )

    # Tuition: "self_tuition_fee" or "charges[2]" in products
    tuition_str = (
        api.get("self_tuition_fee") or
        api.get("tuition_fee") or
        api.get("tuition") or
        raw.get("tuitionRaw") or
        ""
    )
    # charges is a list [tuition_before, tuition_after, amount]
    charges = api.get("charges", [])
    if not tuition_str and charges:
        tuition_str = charges[2] if len(charges) > 2 else charges[0] if charges else ""
    tuition = parse_cny_amount(str(tuition_str)) or 0

    scholarship_type_raw = (
        api.get("scholarship_type") or
        api.get("scholarship_str") or
        raw.get("scholarshipType") or
        ""
    )
    scholarship = None
    if scholarship_type_raw and scholarship_type_raw.lower() not in ("self-financed", "self-paying", ""):
        scholarship = ScholarshipModel(
            type=parse_scholarship_type(scholarship_type_raw),
            name=scholarship_type_raw,
            coversTuition="free tuition" in scholarship_type_raw.lower() or tuition == 0,
            livingAllowance=api.get("living_allowance"),
        )

    # Deadline: "end_at" field (e.g. "Dec 31,2026")
    deadline_str = (
        api.get("end_at") or
        api.get("deadline_date") or
        api.get("deadline") or
        raw.get("applicationDeadline") or
        ""
    )
    if isinstance(deadline_str, bool):
        deadline_str = ""

    # Accommodation: "room_fee" or "single_room_fee"
    room_fee_str = (
        api.get("single_room_fee") or
        api.get("double_room_fee") or
        api.get("room_fee") or
        api.get("scholarship_room_fee") or
        ""
    )

    docs_text = raw.get("documents_raw", "") + raw.get("raw_text", "")
    doc_flags = detect_document_requirements(docs_text)

    # Build source URL from urlname
    urlname = api.get("urlname", "")
    source_url = (
        f"https://www.scholarshipchina.com/programs/{urlname}" if urlname else
        raw.get("detail_url") or raw.get("source") or ""
    )

    data = {
        "universityName": university_name,
        "universitySlug": slugify(university_name),
        "city": api.get("city") or raw.get("city") or "",
        "province": api.get("province") or raw.get("province") or "",
        "field": api.get("subject") or api.get("field") or raw.get("field") or "",
        "programName": program_name,
        "degree": degree_raw or "BACHELOR",
        "teachingLanguage": language_raw,
        "intakeSeason": api.get("arrival_season") or api.get("intake_season") or raw.get("intakeSeason") or "September",
        "applicationDeadline": parse_deadline(str(deadline_str)) if deadline_str else None,
        "programDuration": api.get("duration") or raw.get("programDuration") or "",
        "originalTuition": tuition,
        "tuitionAfterScholarship": None if tuition == 0 else parse_cny_amount(
            str(api.get("tuition_last_fee") or api.get("tuition_after_scholarship") or "")
        ),
        "accommodationFee": parse_cny_amount(str(room_fee_str)) if room_fee_str else None,
        "registrationFee": parse_cny_amount(str(api.get("registration_fee") or "")),
        "applicationFee": parse_cny_amount(str(api.get("application_fee") or "")),
        "serviceFee": parse_cny_amount(str(api.get("service_fee") or "")),
        "scholarships": [scholarship.model_dump()] if scholarship else [],
        "sourceUrl": source_url,
        **doc_flags,
    }

    try:
        model = ProgramModel(**data)
        return model.model_dump()
    except Exception as e:
        return {**data, "status": "error", "error": str(e)}


def extract_from_raw_text(text: str, field: str) -> str:
    """Fallback: extract university or program name from raw text."""
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    if not lines:
        return ""
    if field == "university":
        for line in lines:
            if any(k in line.lower() for k in ["university", "college", "institute", "academy"]):
                return line[:100]
    return lines[0][:100] if lines else ""


# ─── Main ─────────────────────────────────────────────────────────────────────

def main(input_file: Path = INPUT_FILE, output_file: Path = OUTPUT_FILE):
    if not input_file.exists():
        print(f"[ERROR] Input file not found: {input_file}")
        print("  Run tools/scrape_scholarshipchina.py first.")
        return

    raw_data = json.loads(input_file.read_text(encoding="utf-8"))

    # Source can be a direct list or wrapped in {"programs": [...], "api_calls": [...]}
    if isinstance(raw_data, list):
        records = raw_data
        api_calls = []
    else:
        records = raw_data.get("programs", [])
        api_calls = raw_data.get("api_calls", [])

    # If API calls were intercepted, prefer that data
    api_program_data: list[dict] = []
    for call in api_calls:
        data = call.get("data", {})
        if isinstance(data, list):
            api_program_data.extend(data)
        elif isinstance(data, dict):
            items = data.get("data") or data.get("list") or data.get("items") or data.get("records") or []
            if isinstance(items, list):
                api_program_data.extend(items)

    print(f"Input: {len(records)} DOM records + {len(api_program_data)} API records")

    # Merge: use API data if available, else DOM data
    all_records = []
    if api_program_data:
        for item in api_program_data:
            all_records.append({"api_data": item, "raw_text": "", "source": BASE_URL})
    else:
        all_records = records

    normalized: list[dict] = []
    skipped: list[dict] = []
    errors: list[dict] = []

    for rec in all_records:
        try:
            result = normalize_record(rec)
            if result is None:
                skipped.append({"reason": "missing university or program name", "raw": str(rec)[:200]})
            elif result.get("status") == "incomplete":
                normalized.append(result)
            elif result.get("status") == "error":
                errors.append(result)
            else:
                normalized.append(result)
        except Exception as e:
            errors.append({"error": str(e), "raw": str(rec)[:200]})

    # Save normalized output
    output_file.parent.mkdir(parents=True, exist_ok=True)
    output_file.write_text(json.dumps(normalized, indent=2, ensure_ascii=False), encoding="utf-8")

    # Save validation report
    report = {
        "run_at": datetime.utcnow().isoformat(),
        "total_input": len(all_records),
        "normalized": len([r for r in normalized if r.get("status") != "incomplete"]),
        "incomplete": len([r for r in normalized if r.get("status") == "incomplete"]),
        "skipped": len(skipped),
        "errors": len(errors),
        "skip_details": skipped,
        "error_details": errors,
    }
    REPORT_FILE.write_text(json.dumps(report, indent=2), encoding="utf-8")

    print(f"\nDone. Normalized: {report['normalized']} complete, {report['incomplete']} incomplete, {report['skipped']} skipped, {report['errors']} errors")
    print(f"  Output -> {output_file}")
    print(f"  Report -> {REPORT_FILE}")


BASE_URL = "https://www.scholarshipchina.com"

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Normalize raw scraped program data")
    parser.add_argument("--input", type=Path, default=INPUT_FILE)
    parser.add_argument("--output", type=Path, default=OUTPUT_FILE)
    args = parser.parse_args()
    main(args.input, args.output)
