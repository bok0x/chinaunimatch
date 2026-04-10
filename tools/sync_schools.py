"""
Sync all universities from raw_scholarshipchina.json to Supabase.

This imports the full school records (logo, description, rankings, labels)
for every school in the scraped data — even those without complete programs.

Usage:
    python tools/sync_schools.py
    python tools/sync_schools.py --input .tmp/raw_scholarshipchina.json
"""

import json
import argparse
import os
import re
import sys
import uuid
from pathlib import Path
from datetime import datetime, UTC
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

INPUT_FILE = Path(".tmp/raw_scholarshipchina.json")


def log(msg: str):
    print(msg.encode(sys.stdout.encoding or "utf-8", errors="replace").decode(sys.stdout.encoding or "utf-8"))


def slugify(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def strip_html(html: str) -> str:
    """Strip HTML tags from a profile description."""
    if not html:
        return ""
    text = re.sub(r"<[^>]+>", " ", html)
    text = re.sub(r"&[a-z]+;", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text[:2000]  # cap at 2000 chars


def best_ranking(school: dict) -> int | None:
    """Return the best available ranking (lowest non-zero number)."""
    candidates = []
    for key in ("qs_rank", "shanghai_rank"):
        val = school.get(key)
        if val and isinstance(val, (int, float)) and 0 < val < 9999:
            candidates.append(int(val))
    return min(candidates) if candidates else None


def build_university_row(school: dict) -> dict:
    name = school.get("en_name", "").strip()
    urlname = school.get("urlname", "")
    slug = slugify(urlname) if urlname else slugify(name)

    labels = school.get("labels", []) or []
    # Append labels to description as context
    label_str = ", ".join(labels) if labels else ""
    raw_profile = school.get("profile", "") or ""
    description = strip_html(raw_profile)
    if label_str:
        description = f"[{label_str}] {description}".strip() if description else f"[{label_str}]"

    return {
        "name": name,
        "slug": slug,
        "city": school.get("city") or "",
        "province": school.get("province") or "",
        "logoUrl": school.get("logo") or None,
        "coverUrl": school.get("cover_image") or school.get("home_image") or None,
        "description": description or None,
        "ranking": best_ranking(school),
        "updatedAt": datetime.now(UTC).isoformat(),
    }


def sync_schools(client: Client, schools: list[dict]):
    log(f"Syncing {len(schools)} schools to Supabase University table...")

    # Fetch all existing slugs (paginate to get past the 1000-row default limit)
    existing: dict[str, str] = {}
    page_size = 1000
    offset = 0
    while True:
        batch = client.table("University").select("id,slug").range(offset, offset + page_size - 1).execute()
        rows = batch.data or []
        for row in rows:
            existing[row["slug"]] = row["id"]
        if len(rows) < page_size:
            break
        offset += page_size
    log(f"  {len(existing)} universities already in database")

    inserted = 0
    updated = 0
    skipped = 0
    errors = 0

    for school in schools:
        name = (school.get("en_name") or "").strip()
        if not name:
            skipped += 1
            continue

        try:
            row = build_university_row(school)
            slug = row["slug"]
            if not slug:
                skipped += 1
                continue

            if slug in existing:
                # Update existing — preserve the original id
                uni_id = existing[slug]
                update_data = {k: v for k, v in row.items() if k not in ("slug",)}
                client.table("University").update(update_data).eq("id", uni_id).execute()
                updated += 1
            else:
                # Insert new
                uni_id = str(uuid.uuid4())
                client.table("University").insert({"id": uni_id, **row}).execute()
                existing[slug] = uni_id
                inserted += 1

            if (inserted + updated) % 100 == 0:
                log(f"  ... {inserted} inserted, {updated} updated so far")

        except Exception as e:
            log(f"  [ERROR] {name}: {e}")
            errors += 1

    log(f"\nDone. {inserted} inserted, {updated} updated, {skipped} skipped, {errors} errors")


def main(input_file: Path = INPUT_FILE):
    if not input_file.exists():
        print(f"[ERROR] Input file not found: {input_file}")
        print("  Run tools/scrape_scholarshipchina.py first.")
        return

    raw = json.loads(input_file.read_text(encoding="utf-8"))
    schools = raw.get("schools", [])
    if not schools:
        print("[ERROR] No schools found in input file.")
        return

    url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_KEY")
    if not url or not key:
        raise EnvironmentError("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env")

    client = create_client(url, key)
    sync_schools(client, schools)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Sync all universities from raw scraped data to Supabase")
    parser.add_argument("--input", type=Path, default=INPUT_FILE)
    args = parser.parse_args()
    main(args.input)
