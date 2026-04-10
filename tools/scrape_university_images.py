"""
Scrape and sync cover images for universities.

Strategy (in priority order):
  1. Real cover/home/sc images from istudyedu.com (already in raw data — just URL-encode)
  2. Wikipedia REST API thumbnail for universities that have a Wikipedia page
  3. Province-level fallback image (a curated set of beautiful campus/city photos)

Usage:
    python tools/scrape_university_images.py
    python tools/scrape_university_images.py --source raw      # only use raw data
    python tools/scrape_university_images.py --source wiki     # only Wikipedia pass
    python tools/scrape_university_images.py --dry-run
"""

import json
import argparse
import os
import sys
import time
from pathlib import Path
from urllib.parse import quote
from dotenv import load_dotenv
import requests
from supabase import create_client, Client

load_dotenv()

RAW_FILE = Path(".tmp/raw_scholarshipchina.json")
PLACEHOLDER = "school_rank.png"

HEADERS_WIKI = {
    "User-Agent": "ChinaUniMatch/1.0 (educational platform; contact@chinaunimatch.com)",
    "Accept": "application/json",
}
HEADERS_IMG = {
    "User-Agent": "Mozilla/5.0",
    "Referer": "https://www.scholarshipchina.com/",
}

# ── Province fallback images (Unsplash static sources, no API key needed) ────
# These are direct Unsplash photo URLs (permanent CDN links, no redirect).
# One beautiful campus/cityscape photo per province.
PROVINCE_FALLBACKS: dict[str, str] = {
    "Beijing":       "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800",
    "Shanghai":      "https://images.unsplash.com/photo-1548919973-5cef591cdbc9?w=800",
    "Tianjin":       "https://images.unsplash.com/photo-1529400971008-f566de0e6dfc?w=800",
    "Chongqing":     "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800",
    "Guangdong":     "https://images.unsplash.com/photo-1470004914212-05527e49370b?w=800",
    "Zhejiang":      "https://images.unsplash.com/photo-1535083783855-eda0788ae675?w=800",
    "Jiangsu":       "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800",
    "Shandong":      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800",
    "Sichuan":       "https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=800",
    "Hubei":         "https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?w=800",
    "Hunan":         "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800",
    "Fujian":        "https://images.unsplash.com/photo-1526401485004-46910ecc8e51?w=800",
    "Liaoning":      "https://images.unsplash.com/photo-1464817739973-0128fe77aaa1?w=800",
    "Shaanxi":       "https://images.unsplash.com/photo-1508804052814-cd3ba865a116?w=800",
    "Henan":         "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?w=800",
    "Heilongjiang":  "https://images.unsplash.com/photo-1467533003447-e295ff1b0435?w=800",
    "Jilin":         "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
    "Hebei":         "https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?w=800",
    "Shanxi":        "https://images.unsplash.com/photo-1508804052814-cd3ba865a116?w=800",
    "Anhui":         "https://images.unsplash.com/photo-1535083783855-eda0788ae675?w=800",
    "Jiangxi":       "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800",
    "Guangxi":       "https://images.unsplash.com/photo-1526401485004-46910ecc8e51?w=800",
    "Yunnan":        "https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=800",
    "Guizhou":       "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800",
    "Gansu":         "https://images.unsplash.com/photo-1508804052814-cd3ba865a116?w=800",
    "Hainan":        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
    "Nei Mongol":    "https://images.unsplash.com/photo-1467533003447-e295ff1b0435?w=800",
    "Xinjiang":      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
    "Ningxia":       "https://images.unsplash.com/photo-1508804052814-cd3ba865a116?w=800",
    "Qinghai":       "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
    "Tibet":         "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
    "Xizang":        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
}
DEFAULT_FALLBACK = "https://images.unsplash.com/photo-1562774053-701939374585?w=800"  # generic campus


def log(msg: str):
    print(msg.encode(sys.stdout.encoding or "utf-8", errors="replace").decode(sys.stdout.encoding or "utf-8"), flush=True)


# ── Image sources ──────────────────────────────────────────────────────────────

def best_source_image(school: dict) -> str | None:
    """Pick the best cover image from raw school data; URL-encode Chinese chars."""
    for field in ("cover_image", "home_image", "sc_image"):
        url = school.get(field, "")
        if url and PLACEHOLDER not in url:
            try:
                # Already ASCII — return as-is
                url.encode("ascii")
                return url
            except UnicodeEncodeError:
                # Has non-ASCII (Chinese) chars in path — URL-encode path only
                from urllib.parse import urlsplit, urlunsplit
                parts = urlsplit(url)
                encoded_path = quote(parts.path, safe="/%")
                return urlunsplit((parts.scheme, parts.netloc, encoded_path, parts.query, parts.fragment))
    return None


def wikipedia_image(uni_name: str) -> str | None:
    """Try to fetch the main thumbnail for a university from Wikipedia REST API."""
    # Try exact name first, then a few variations
    candidates = [
        uni_name,
        uni_name.replace(" University", " university"),
        uni_name + " (China)",
    ]
    for title in candidates:
        try:
            r = requests.get(
                f"https://en.wikipedia.org/api/rest_v1/page/summary/{quote(title)}",
                headers=HEADERS_WIKI,
                timeout=8,
            )
            if r.status_code == 200:
                data = r.json()
                # Prefer originalimage for higher resolution
                img = (
                    (data.get("originalimage") or {}).get("source") or
                    (data.get("thumbnail") or {}).get("source")
                )
                if img:
                    return img
        except Exception:
            pass
        time.sleep(0.05)  # be polite to Wikipedia
    return None


# ── Main passes ───────────────────────────────────────────────────────────────

def supabase_update(client: Client, table: str, data: dict, field: str, value: str, retries: int = 3):
    """Update a Supabase row with retry on 5xx errors."""
    for attempt in range(retries):
        try:
            client.table(table).update(data).eq(field, value).execute()
            return True
        except Exception as e:
            if attempt < retries - 1:
                time.sleep(2 ** attempt)
            else:
                log(f"  [ERROR] {value}: {e}")
                return False
    return False


def pass_raw(client: Client, school_by_slug: dict[str, dict], dry_run: bool):
    """Pass 1 — update universities that already have a real image in the raw data."""
    log("\n[Pass 1] Applying real cover images from scraped data...")
    updated = 0
    for slug, school in school_by_slug.items():
        img = best_source_image(school)
        if not img:
            continue
        if dry_run:
            log(f"  [DRY] {school['en_name']}: {img[:80]}")
            updated += 1
            continue
        if supabase_update(client, "University", {"coverUrl": img}, "slug", slug):
            updated += 1
        time.sleep(0.05)
    log(f"  Done: {updated} universities updated with source images")


def pass_wikipedia(client: Client, dry_run: bool):
    """Pass 2 — Wikipedia lookup for universities still missing a real cover."""
    log("\n[Pass 2] Fetching missing covers from Wikipedia...")

    # Get all universities without a good cover (NULL or placeholder domain)
    all_unis = []
    offset = 0
    while True:
        r = client.table("University").select("id,name,slug,province,coverUrl").range(offset, offset + 999).execute()
        all_unis.extend(r.data)
        if len(r.data) < 1000:
            break
        offset += 1000

    need_cover = [
        u for u in all_unis
        if not u.get("coverUrl") or "school_rank.png" in (u.get("coverUrl") or "")
    ]
    log(f"  {len(need_cover)} universities need Wikipedia images")

    found = 0
    fallback = 0
    for i, uni in enumerate(need_cover):
        name = uni["name"]
        img = wikipedia_image(name)

        if img:
            found += 1
            if not dry_run:
                supabase_update(client, "University", {"coverUrl": img}, "id", uni["id"])
            if i % 50 == 0:
                log(f"  ... {i}/{len(need_cover)} checked ({found} found via Wikipedia)")
        else:
            # Apply province fallback
            province_img = PROVINCE_FALLBACKS.get(uni.get("province", ""), DEFAULT_FALLBACK)
            fallback += 1
            if not dry_run:
                supabase_update(client, "University", {"coverUrl": province_img}, "id", uni["id"])

        time.sleep(0.1)  # rate-limit Wikipedia requests

    log(f"  Done: {found} from Wikipedia, {fallback} province fallbacks applied")


# ── Entry point ───────────────────────────────────────────────────────────────

def main(source: str = "all", dry_run: bool = False):
    raw = json.loads(RAW_FILE.read_text(encoding="utf-8"))
    schools = raw.get("schools", [])

    # Build slug → school mapping (use urlname or slugified en_name)
    import re
    def slugify(t: str) -> str:
        return re.sub(r"[^a-z0-9]+", "-", t.lower()).strip("-")

    school_by_slug: dict[str, dict] = {}
    for s in schools:
        urlname = s.get("urlname", "")
        slug = re.sub(r"[^a-z0-9]+", "-", urlname.lower()).strip("-") if urlname else slugify(s.get("en_name", ""))
        if slug:
            school_by_slug[slug] = s

    supabase_url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_SERVICE_KEY")
    if not supabase_url or not supabase_key:
        raise EnvironmentError("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env")
    client = create_client(supabase_url, supabase_key)

    if source in ("all", "raw"):
        pass_raw(client, school_by_slug, dry_run)

    if source in ("all", "wiki"):
        pass_wikipedia(client, dry_run)

    log("\nImage scraping complete.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Scrape and sync university cover images")
    parser.add_argument("--source", choices=["all", "raw", "wiki"], default="all")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    main(source=args.source, dry_run=args.dry_run)
