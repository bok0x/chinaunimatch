"""
Scraper for shanghairanking.com — ARWU (Academic Ranking of World Universities)

Tries the site's JSON API first; falls back to HTML table parsing.
Saves results to data/rankings/arwu_YEAR.json.

Usage:
    python tools/scrape_shanghairanking.py
    python tools/scrape_shanghairanking.py --year 2024
    python tools/scrape_shanghairanking.py --year 2024 --all-countries
    python tools/scrape_shanghairanking.py --year 2024 --output data/rankings/arwu_2024.json
"""

import json
import argparse
import time
from pathlib import Path
from datetime import datetime, UTC

import httpx
from bs4 import BeautifulSoup
from dotenv import load_dotenv

load_dotenv()

CURRENT_YEAR = datetime.now().year
OUTPUT_DIR = Path("data/rankings")
BASE_URL = "https://www.shanghairanking.com"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36",
    "Accept": "application/json, text/html, */*",
    "Referer": "https://www.shanghairanking.com/",
    "Origin": "https://www.shanghairanking.com",
}

# Candidate API endpoints — the site is Vue.js-backed, so we probe the most likely paths
CANDIDATE_APIS = [
    "/api/pub/v1/arwu/ranklist",
    "/api/v1/arwu/ranklist",
    "/api/pub/v1/rankings/arwu",
]


# ─── Helpers ──────────────────────────────────────────────────────────────────

def log(msg: str):
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}", flush=True)


# ─── API Scraper ──────────────────────────────────────────────────────────────

def try_api(year: int, client: httpx.Client) -> list[dict] | None:
    """Probe known API endpoint patterns. Returns a raw list or None if all fail."""
    log("  Trying JSON API endpoints...")

    for path in CANDIDATE_APIS:
        for type_id in [1, 0]:
            url = BASE_URL + path
            params = {"year": year, "type": type_id, "limit": 1000, "page": 1}
            try:
                r = client.get(url, params=params, headers={**HEADERS, "Accept": "application/json"}, timeout=15)
                if r.status_code != 200:
                    continue
                body = r.json()
                # Walk common response shapes to find the university list
                items = _extract_list(body)
                if items and len(items) > 10:
                    log(f"  API hit: {url} → {len(items)} entries")
                    return items
            except Exception as e:
                log(f"    {url}: {e}")
            time.sleep(0.4)

    return None


def _extract_list(body: dict | list) -> list:
    """Walk a nested JSON response and find the first substantial list."""
    if isinstance(body, list) and len(body) > 5:
        return body
    if isinstance(body, dict):
        for key in ("ranklist", "universities", "list", "data", "items", "records"):
            val = body.get(key)
            if isinstance(val, list) and len(val) > 5:
                return val
            if isinstance(val, dict):
                inner = _extract_list(val)
                if inner:
                    return inner
    return []


def parse_api_university(item: dict) -> dict:
    """Normalise a university object from the ARWU API into our schema."""
    return {
        "worldRank": str(
            item.get("ranking") or item.get("world_rank") or
            item.get("rank") or item.get("Rank") or ""
        ),
        "universityName": (
            item.get("university_en") or item.get("name_en") or
            item.get("name") or item.get("university") or
            item.get("University") or ""
        ),
        "universityNameZh": (
            item.get("university_zh") or item.get("name_zh") or
            item.get("name_cn") or item.get("universityZh") or ""
        ),
        "country": (
            item.get("country") or item.get("country_en") or
            item.get("Country") or ""
        ),
        "city": item.get("city") or item.get("City") or "",
        "nationalRank": str(item.get("national_rank") or item.get("n_rank") or item.get("NationalRank") or ""),
        "totalScore": str(item.get("total_score") or item.get("total") or item.get("TotalScore") or ""),
        "alumni": str(item.get("alumni") or item.get("Alumni") or ""),
        "award": str(item.get("award") or item.get("Award") or ""),
        "hici": str(item.get("hici") or item.get("HiCi") or ""),
        "ns": str(item.get("ns") or item.get("NS") or ""),
        "pub": str(item.get("pub") or item.get("PUB") or ""),
        "pcp": str(item.get("pcp") or item.get("PCP") or ""),
        "website": item.get("website") or item.get("url") or item.get("homepage") or "",
        "source": "shanghairanking.com/api",
    }


# ─── HTML Fallback ─────────────────────────────────────────────────────────────

def scrape_html(year: int, client: httpx.Client) -> list[dict]:
    """Fallback: parse the ranking table from the HTML page."""
    url = f"{BASE_URL}/rankings/arwu/{year}"
    log(f"  HTML fallback → {url}")

    try:
        r = client.get(url, headers=HEADERS, timeout=25)
        r.raise_for_status()
    except Exception as e:
        log(f"  ERROR fetching HTML: {e}")
        return []

    soup = BeautifulSoup(r.text, "lxml")
    universities = []

    # The ARWU page renders a <table> with class names or generic tbody rows
    rows = (
        soup.select("tr.rk-table-row") or
        soup.select("table.rk-table tbody tr") or
        soup.select("tbody tr") or
        soup.select("table tr")
    )
    log(f"  Found {len(rows)} candidate table rows")

    for row in rows:
        cells = row.find_all(["td", "th"])
        if len(cells) < 3:
            continue
        texts = [c.get_text(strip=True) for c in cells]

        # The first cell should be a rank — contains digits or range like "101-150"
        rank_text = texts[0]
        if not any(ch.isdigit() for ch in rank_text):
            continue  # Skip header / non-rank rows

        # University name — prefer the hyperlink text in the row
        link = row.find("a")
        name = link.get_text(strip=True) if link else (texts[1] if len(texts) > 1 else "")
        if not name or len(name) < 3:
            continue

        universities.append({
            "worldRank": rank_text,
            "universityName": name,
            "universityNameZh": "",
            "country": texts[2] if len(texts) > 2 else "",
            "city": "",
            "nationalRank": "",
            "totalScore": texts[3] if len(texts) > 3 else "",
            "alumni":     texts[4] if len(texts) > 4 else "",
            "award":      texts[5] if len(texts) > 5 else "",
            "hici":       texts[6] if len(texts) > 6 else "",
            "ns":         texts[7] if len(texts) > 7 else "",
            "pub":        texts[8] if len(texts) > 8 else "",
            "pcp":        texts[9] if len(texts) > 9 else "",
            "website": link["href"] if link and link.get("href") else "",
            "source": "shanghairanking.com/html",
        })

    log(f"  HTML parsed: {len(universities)} universities")
    return universities


# ─── Filter ───────────────────────────────────────────────────────────────────

CHINA_KEYWORDS = {"china", "chinese", "prc", "hong kong", "taiwan", "macau"}


def filter_china(universities: list[dict]) -> list[dict]:
    """Keep only Chinese universities (including HK/Taiwan) for this platform."""
    result = [
        u for u in universities
        if any(kw in u.get("country", "").lower() for kw in CHINA_KEYWORDS)
    ]
    # If the country field is empty for all items, return everything
    return result if result else universities


# ─── Main ─────────────────────────────────────────────────────────────────────

def main(year: int = CURRENT_YEAR, output: Path | None = None, all_countries: bool = False):
    output = output or (OUTPUT_DIR / f"arwu_{year}.json")
    output.parent.mkdir(parents=True, exist_ok=True)

    log(f"\n== ShanghaiRanking / ARWU {year} Scraper ==")

    with httpx.Client(follow_redirects=True) as client:
        # Attempt 1: JSON API
        raw_items = try_api(year, client)

        if raw_items:
            universities = [parse_api_university(u) for u in raw_items]
            log(f"  Parsed {len(universities)} universities from API")
        else:
            # Attempt 2: HTML fallback
            universities = scrape_html(year, client)

    if not universities:
        log("  No data scraped — check the site structure or try a different year.")
        return

    if not all_countries:
        original_count = len(universities)
        universities = filter_china(universities)
        log(f"  Filtered to {len(universities)} Chinese universities (from {original_count} total)")
        log("  Use --all-countries to keep all countries")

    result = {
        "scraped_at": datetime.now(UTC).isoformat(),
        "source": BASE_URL,
        "year": year,
        "total": len(universities),
        "notes": [
            "worldRank: string — may be a range like '101-150' for tied ranks",
            "nationalRank: rank within China only (populated if available from API)",
            "Filter applied: China, Hong Kong, Taiwan, Macau only (use --all-countries for global)",
        ],
        "universities": universities,
    }

    output.write_text(json.dumps(result, indent=2, ensure_ascii=False), encoding="utf-8")
    log(f"\nSaved {len(universities)} universities → {output}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Scrape ShanghaiRanking (ARWU) data")
    parser.add_argument("--year", type=int, default=CURRENT_YEAR, help="Ranking year (default: current year)")
    parser.add_argument("--output", type=Path, default=None, help="Output path (default: data/rankings/arwu_YEAR.json)")
    parser.add_argument("--all-countries", action="store_true", help="Include all countries (default: China only)")
    args = parser.parse_args()

    main(year=args.year, output=args.output, all_countries=args.all_countries)
