# Scholarship Workflow — Scraping & Matching

## Objective
Scrape current scholarship policies from authoritative sources, normalize them, link them to matching programs, and surface the best matches for each student's profile.

## Scholarship Sources
| Type | Source | Frequency |
|---|---|---|
| CSC (Chinese Government Scholarship) | csc.edu.cn | Monthly |
| Provincial scholarships | Provincial education bureau websites | Quarterly |
| University-level scholarships | Individual university portals | Per discovery run |
| Silk Road Scholarship | csc.edu.cn/silk | Quarterly |

## Required Inputs
- `scholarship_sources.json` — list of source URLs by type
- `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` — from `.env`
- Optional: `userId` + user profile — for personalized matching

## Steps

### Step 1: Scrape Scholarship Data
```bash
python tools/scrape_scholarships.py --source tools/scholarship_sources.json --output .tmp/raw_scholarships/
```
- One JSON file per source
- Captures: scholarship name, type, universities covered, fields covered, degree levels, duration, benefits (tuition coverage, living allowance amount), application period
- Timestamps every record with `scrapedAt` — never overwrite history, keep all versions

### Step 2: Normalize Scholarship Records
```bash
python tools/normalize_scholarship_data.py --input .tmp/raw_scholarships/ --output .tmp/normalized_scholarships.json
```
- Maps to `ScholarshipType` enum: CSC, PROVINCIAL, UNIVERSITY, SILK_ROAD, OTHER
- Validates living allowance is a CNY integer (per month)
- Flags records where `universityCoverage = "all"` — these apply to all programs

### Step 3: Match Scholarships to Programs
```bash
python tools/match_scholarships.py --scholarships .tmp/normalized_scholarships.json
```
Matching logic:
1. If scholarship covers specific universities: match to programs at those universities
2. If scholarship covers specific fields: further filter by `program.field`
3. If scholarship covers specific degrees: further filter by `program.degree`
4. If scholarship is university-wide: link to all programs at that university
5. Multiple scholarships can link to one program — store all, do not deduplicate

Outputs: `.tmp/scholarship_matches.json` — array of `(scholarshipId, programId)` pairs

### Step 4: Sync to Database
```bash
python tools/sync_to_supabase.py --input .tmp/scholarship_matches.json --mode scholarships
```
- Upserts `Scholarship` records
- Creates `ProgramScholarship` join records
- Marks obsolete scholarships (not seen in latest scrape) with `active: false` — do NOT delete them

### Step 5: Trigger Revalidation
```bash
python tools/trigger_revalidation.py --tag scholarships
```

## Scholarship Matching for Students
When a student uses the Scholarship Matcher UI:

Input: nationality, age, education level, GPA, language score, preferred field, preferred degree

Matching algorithm (run in Python or as a DB query):
1. Filter scholarships where student's nationality is not in exclusion list
2. Filter by age range
3. Filter by education level (required prior degree)
4. Filter by language score if required
5. Sort by: (1) full coverage (tuition + living allowance), (2) living allowance amount, (3) duration

Return: top 10 matching scholarships with linked programs

## Expected Outputs
- Updated `scholarships` table in Supabase
- Updated `program_scholarships` join table
- Personalized match list for student profiles

## Edge Cases
| Scenario | Handling |
|---|---|
| Scholarship changes mid-year | Keep old record with `active: false`; create new record |
| Scholarship site is down | Use last successful scrape; log staleness warning |
| Overlapping scholarships on one program | Store all; UI surfaces the best (highest total value) |
| Scholarship with no living allowance listed | Store `livingAllowance: null`, not 0 |
| New scholarship type not in enum | Use `OTHER` and log for manual review |

## Update History
- Initial version
