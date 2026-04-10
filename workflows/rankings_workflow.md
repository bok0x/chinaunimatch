# Rankings Workflow — ShanghaiRanking (ARWU) Data Pipeline

## Objective
Scrape the latest ARWU world university rankings from shanghairanking.com, store them in `/data/rankings/`, and merge them into university records so the platform can display official ranking badges.

## Data Sources
| Source | URL | What it provides |
|---|---|---|
| ARWU Rankings | https://www.shanghairanking.com/rankings/arwu/{YEAR} | World rank, national rank, scoring criteria |
| ScholarshipChina | https://www.scholarshipchina.com | Program details, fees, scholarships |

## Required Inputs
- Internet access (no API key required — shanghairanking.com is public)
- Output directory `data/rankings/` (auto-created by the script)

## Steps

### Step 1: Scrape ARWU Rankings
```bash
python tools/scrape_shanghairanking.py --year 2024
```
- Tries JSON API endpoints first (faster, more complete)
- Falls back to HTML table parsing if API is unavailable
- Filters to Chinese universities by default (use `--all-countries` for global)
- Output: `data/rankings/arwu_2024.json`

**If the scraper returns 0 results:**
- The site may have updated its API path. Check DevTools → Network → XHR on the rankings page
- Find the actual API request URL, add it to the `CANDIDATE_APIS` list in `scrape_shanghairanking.py`
- Document the new endpoint here with the date discovered

### Step 2: Scrape ScholarshipChina Programs
```bash
python tools/scrape_scholarshipchina.py --output .tmp/raw_scholarshipchina.json
```

### Step 3: Normalize Programs
```bash
python tools/normalize_program_data.py --input .tmp/raw_scholarshipchina.json --output .tmp/normalized_programs.json
```

### Step 4: Export to /data/ (merges rankings automatically)
```bash
python tools/export_to_data.py
```
- Reads `data/rankings/arwu_*.json` (most recent file wins)
- Merges ranking data into each university's JSON by slug
- Writes `data/universities/<slug>.json` — one file per university
- Writes `data/programs/all_programs.json` — flat list of all programs

### Step 5: Sync to Supabase
```bash
python tools/sync_to_supabase.py --input .tmp/normalized_programs.json --mode programs
```

### Step 6: Trigger ISR Revalidation
```bash
python tools/trigger_revalidation.py --tag universities
```

## Full Pipeline (one-liner)
```bash
python tools/scrape_shanghairanking.py --year 2024 && \
python tools/scrape_scholarshipchina.py && \
python tools/normalize_program_data.py && \
python tools/export_to_data.py && \
python tools/sync_to_supabase.py --input .tmp/normalized_programs.json --mode programs && \
python tools/trigger_revalidation.py --tag universities
```

## Expected Outputs
| File | Description |
|---|---|
| `data/rankings/arwu_YEAR.json` | Raw ranking data from ShanghaiRanking |
| `data/universities/<slug>.json` | Per-university JSON with programs + ranking |
| `data/programs/all_programs.json` | Flat program list for bulk import |
| `.tmp/normalized_programs.json` | Intermediate normalized data |
| `.tmp/validation_report.json` | Validation audit trail |

## Edge Cases
| Scenario | Handling |
|---|---|
| API returns empty list | Automatically falls back to HTML parsing |
| HTML structure changes | Check DevTools, update CSS selectors in `scrape_shanghairanking.py` |
| University slug mismatch | Rankings merged on normalized slug; unmatched unis get empty ranking fields |
| Year not yet published | Use previous year: `--year 2023` |
| Site blocks scraper | Add a `time.sleep(1)` between requests; try from a different IP |

## Update History
- 2026-04-10: Initial version — dual-source pipeline (ShanghaiRanking + ScholarshipChina)
