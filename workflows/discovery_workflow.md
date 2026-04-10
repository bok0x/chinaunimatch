# Discovery Workflow — University & Program Search

## Objective
Search, scrape, normalize, and sync Chinese university program data into the database so students can discover programs via the platform's discovery page.

## Required Inputs
- `university_sources.json` — seed list of target universities with names, slugs, and source URLs
- `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` — from `.env`

## Steps

### Step 1: Scrape Raw Data
Run the scraper for each university in the seed list:
```bash
python tools/scrape_universities.py --source tools/university_sources.json --output .tmp/raw_universities/
```
- Outputs one JSON file per university to `.tmp/raw_universities/`
- If a page is CAPTCHA-protected, log `CAPTCHA_BLOCKED` and skip; switch that university to manual entry mode
- If rate-limited, apply exponential backoff: 2s, 4s, 8s... up to 5 retries before skipping

### Step 2: Normalize & Validate
```bash
python tools/normalize_program_data.py --input .tmp/raw_universities/ --output .tmp/normalized_programs.json
```
- Validates each record against the Program schema (Pydantic model)
- Flags any record missing required fields: `programName`, `degree`, `teachingLanguage`, `originalTuition`
- Converts all fee amounts to CNY integers
- Standardizes degree values to: BACHELOR, MASTER, PHD, DIPLOMA
- Outputs a validation report to `.tmp/validation_report.json`

### Step 3: Agent Review
- Read `.tmp/validation_report.json`
- For records flagged as `incomplete`, either:
  - Apply documented defaults (e.g., `applicationFee: 0` if not found)
  - Mark the record `status: incomplete` for manual review
- Do NOT silently drop records — log every skipped entry

### Step 4: Sync to Database
```bash
python tools/sync_to_supabase.py --input .tmp/normalized_programs.json --mode programs
```
- Upserts using `(universityId, programName, degree, teachingLanguage)` as the composite idempotency key
- Returns a sync summary: inserted, updated, skipped

### Step 5: Trigger ISR Revalidation
```bash
python tools/trigger_revalidation.py --tag universities
```
- POSTs to `<APP_URL>/api/webhooks/wat` with secret header to revalidate cached pages
- Confirms HTTP 200 before marking the run complete

## Expected Outputs
- Updated `programs` and `universities` tables in Supabase
- `.tmp/validation_report.json` for audit trail
- Console summary of inserted/updated/skipped counts

## Edge Cases
| Scenario | Handling |
|---|---|
| CAPTCHA on scrape | Skip + log; queue for manual entry |
| Chinese-only page | Playwright screenshot → note for manual translation |
| Rate limited | Exponential backoff, max 5 retries |
| Duplicate program | Upsert (update if changed, skip if identical) |
| Missing required field | Flag as `incomplete`, do not drop |
| Scrape succeeds but sync fails | Re-run Step 4 with existing `.tmp/normalized_programs.json` |

## Update History
- Initial version — document any changes here with date and what changed
