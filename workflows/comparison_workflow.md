# Comparison Workflow — Side-by-Side Program Comparison

## Objective
Enable students to compare up to 3 programs side-by-side across tuition, living costs, rankings, scholarship availability, and eligibility requirements.

## Required Inputs
- Array of 2–3 `programId` values (from the database)
- User's profile (optional): nationality, age, education level — for eligibility highlighting

## Steps

### Step 1: Validate Comparison Request
Agent checks:
- Between 2 and 3 programs provided (hard cap: 3 columns for mobile readability)
- All `programId` values exist in the database
- If fewer than 2 programs: return error "Select at least 2 programs to compare"
- If more than 3: return error "Maximum 3 programs can be compared at once"

### Step 2: Fetch Normalized Program Data
```bash
python tools/fetch_programs_for_comparison.py --program-ids <id1> <id2> [id3]
```
- Queries the database for all fee, scholarship, eligibility, and document fields
- Ensures all monetary values are in CNY (normalization already done at sync time)
- Outputs `.tmp/comparison_data.json`

### Step 3: Build Comparison Matrix
The comparison table renders these rows in order:

**University & Program**
- University name + ranking
- Program name
- Degree level
- Teaching language
- Duration
- Intake season
- Application deadline

**Cost Breakdown**
- Original tuition (per year)
- Tuition after scholarship (if applicable)
- Accommodation fee (per year)
- Registration fee (one-time)
- Application fee (one-time)
- Service fee (one-time)
- **Estimated total (Year 1)** — calculated field

**Scholarships**
- Scholarship type (CSC, Provincial, University)
- Covers tuition? (Yes/No)
- Monthly living allowance
- Duration

**Eligibility**
- Age requirements
- Accepts minors?
- Location restrictions
- Min GPA / IELTS / TOEFL

**Required Documents**
- Checklist of required documents (boolean flags rendered as checkmarks)

### Step 4: Highlight Best Values
Agent applies color coding logic:
- **Green highlight**: lowest numeric value in a cost row, highest ranking, most scholarship coverage
- **Neutral**: all other values
- Rule: only highlight if values differ by more than 5% (avoid highlighting near-identical values)

### Step 5: Return Comparison Data
- The comparison data is rendered client-side from the database; no Python tool is needed at runtime
- This workflow is used by the agent during data quality validation before publishing new program records

## Expected Outputs
- `comparison_data.json` with normalized, ready-to-render comparison matrix
- Highlight metadata indicating which cells should be green

## Edge Cases
| Scenario | Handling |
|---|---|
| One program missing scholarship data | Show "N/A" in scholarship rows, do not break the table |
| All programs same cost | No green highlights on that row |
| Mixed currencies in raw data | normalize_program_data.py handles CNY conversion before this workflow runs |
| User not logged in | Comparison still works; eligibility highlighting is disabled |

## Update History
- Initial version
