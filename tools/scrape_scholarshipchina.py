"""
Scraper for scholarshipchina.com

Calls the underlying istudyedu.com API directly — no browser required.
The site is a Nuxt.js SPA backed by a public JSON API at center.istudyedu.com.

Usage:
    python tools/scrape_scholarshipchina.py
    python tools/scrape_scholarshipchina.py --max-pages 5
    python tools/scrape_scholarshipchina.py --output .tmp/raw_scholarshipchina.json
"""

import json
import argparse
import time
from pathlib import Path
from datetime import datetime, UTC

import requests
from dotenv import load_dotenv

load_dotenv()

BASE_URL = "https://www.scholarshipchina.com"
API_BASE = "https://center.istudyedu.com/api/sc"
OUTPUT_FILE = Path(".tmp/raw_scholarshipchina.json")

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36",
    "Accept": "application/json",
    "Referer": "https://www.scholarshipchina.com/",
    "Origin": "https://www.scholarshipchina.com",
}


# ─── Helpers ──────────────────────────────────────────────────────────────────

def log(msg: str):
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}", flush=True)


def get_json(url: str, params: dict = None, retries: int = 3) -> dict | None:
    for attempt in range(retries):
        try:
            r = requests.get(url, headers=HEADERS, params=params, timeout=15)
            r.raise_for_status()
            return r.json()
        except Exception as e:
            if attempt < retries - 1:
                log(f"  Retry {attempt+1}/{retries-1}: {e}")
                time.sleep(2)
            else:
                log(f"  ERROR: {e}")
                return None


def extract_items(response: dict) -> tuple[list, int]:
    """Extract items list and total_pages from API response.

    The istudyedu API returns:
      {"code": 200, "data": [...], "total_pages": N, "total": N, "pageSize": N}
    """
    if not response:
        return [], 0

    # Pagination info is at top level
    total_pages = (
        response.get("total_pages") or
        response.get("last_page") or
        response.get("total_page") or
        1
    )

    data = response.get("data", response)
    if isinstance(data, list):
        return data, total_pages
    if isinstance(data, dict):
        items = (
            data.get("data") or
            data.get("list") or
            data.get("items") or
            data.get("records") or
            []
        )
        inner_pages = (
            data.get("last_page") or
            data.get("total_pages") or
            total_pages
        )
        return items, inner_pages
    return [], 0


# ─── Scrapers ─────────────────────────────────────────────────────────────────

def scrape_schools(max_pages: int) -> list[dict]:
    """Fetch all universities from /api/sc/schools."""
    log("\n-- Scraping universities (/api/sc/schools) --")
    all_items = []

    # Get first page to find total
    resp = get_json(f"{API_BASE}/schools", params={"keyword": "", "limit": 20, "page": 1})
    items, last_page = extract_items(resp)
    all_items.extend(items)
    total_pages = min(last_page, max_pages)
    log(f"  Page 1/{total_pages}: {len(items)} universities (total pages: {last_page})")

    for page in range(2, total_pages + 1):
        resp = get_json(f"{API_BASE}/schools", params={"keyword": "", "limit": 20, "page": page})
        items, _ = extract_items(resp)
        all_items.extend(items)
        log(f"  Page {page}/{total_pages}: {len(items)} universities")
        time.sleep(0.3)

    log(f"  Total universities scraped: {len(all_items)}")
    return all_items


def scrape_products(max_pages: int) -> list[dict]:
    """Fetch all programs from /api/sc/products."""
    log("\n-- Scraping programs (/api/sc/products) --")
    all_items = []

    params = {"education_id": 0, "city_id": 0, "language_id": 0, "label_id": 0, "limit": 20, "page": 1}
    resp = get_json(f"{API_BASE}/products", params=params)
    items, last_page = extract_items(resp)
    all_items.extend(items)
    total_pages = min(last_page, max_pages)
    log(f"  Page 1/{total_pages}: {len(items)} programs (total pages: {last_page})")

    for page in range(2, total_pages + 1):
        params["page"] = page
        resp = get_json(f"{API_BASE}/products", params=params)
        items, _ = extract_items(resp)
        all_items.extend(items)
        log(f"  Page {page}/{total_pages}: {len(items)} programs")
        time.sleep(0.3)

    log(f"  Total programs scraped: {len(all_items)}")
    return all_items


def scrape_scholarships(max_pages: int) -> list[dict]:
    """Fetch scholarship programs from /api/sc/products with type=1."""
    log("\n-- Scraping scholarships (/api/sc/products?type=1) --")
    all_items = []

    params = {"limit": 20, "page": 1, "type": 1, "label_id": 0, "education_id": 0}
    resp = get_json(f"{API_BASE}/products", params=params)
    items, last_page = extract_items(resp)
    all_items.extend(items)
    total_pages = min(last_page, max_pages)
    log(f"  Page 1/{total_pages}: {len(items)} scholarships (total pages: {last_page})")

    for page in range(2, total_pages + 1):
        params["page"] = page
        resp = get_json(f"{API_BASE}/products", params=params)
        items, _ = extract_items(resp)
        all_items.extend(items)
        log(f"  Page {page}/{total_pages}: {len(items)} scholarships")
        time.sleep(0.3)

    log(f"  Total scholarships scraped: {len(all_items)}")
    return all_items


# ─── Main ─────────────────────────────────────────────────────────────────────

def main(max_pages: int = 999, output: Path = OUTPUT_FILE):
    output.parent.mkdir(parents=True, exist_ok=True)

    schools = scrape_schools(max_pages)
    products = scrape_products(max_pages)
    scholarships = scrape_scholarships(max_pages)

    # Deduplicate products + scholarships by id
    seen_ids = set()
    all_products = []
    for item in products + scholarships:
        pid = item.get("id")
        if pid not in seen_ids:
            seen_ids.add(pid)
            all_products.append(item)

    # Build output in the same format the normalize script expects
    # Convert schools and products into "api_calls" format for compatibility
    api_calls = [
        {
            "url": f"{API_BASE}/schools (all pages)",
            "status": 200,
            "data": {"data": schools},
            "captured_at": datetime.now(UTC).isoformat(),
        },
        {
            "url": f"{API_BASE}/products (all pages)",
            "status": 200,
            "data": {"data": all_products},
            "captured_at": datetime.now(UTC).isoformat(),
        },
    ]

    result = {
        "scraped_at": datetime.now(UTC).isoformat(),
        "source": BASE_URL,
        "total_programs": len(all_products),
        "total_schools": len(schools),
        "total_api_calls": len(api_calls),
        "programs": [],          # empty — data is in api_calls
        "api_calls": api_calls,
        "schools": schools,      # also stored at top level for convenience
        "products": all_products,
    }

    output.write_text(json.dumps(result, indent=2, ensure_ascii=False), encoding="utf-8")
    log(f"\nSaved {len(schools)} schools + {len(all_products)} programs -> {output}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Scrape scholarshipchina.com via direct API calls")
    parser.add_argument("--max-pages", type=int, default=999, help="Max pages per endpoint (default: all)")
    parser.add_argument("--output", type=Path, default=OUTPUT_FILE)
    args = parser.parse_args()

    main(max_pages=args.max_pages, output=args.output)
