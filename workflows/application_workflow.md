# Application Workflow — Step-by-Step Application Assistant

## Objective
Guide a student through the complete application process for a specific program: eligibility check, document collection, upload, and submission tracking.

## Required Inputs
- `programId` — the program the student wants to apply to
- `userId` — authenticated user ID
- User profile data: nationality, age, education level, language scores

## Steps

### Step 1: Eligibility Pre-Check
Before starting the application, run an eligibility check:
```bash
python tools/check_eligibility.py --program-id <programId> --user-profile <profile.json>
```
Checks:
- Age within `minAge`–`maxAge` range
- Nationality not in `locationRestrictions`
- GPA meets `minGpaScore` (if provided)
- Language score meets `minIeltsScore` or `minToeflScore` (if provided)
- Minor status matches `acceptsMinors`

Output: `eligible: true/false` + list of failed checks with explanations

If not eligible: show which requirements aren't met. Do NOT block the application — show a warning and let the student proceed if they choose.

### Step 2: Generate Document Checklist
```bash
python tools/generate_application_checklist.py --program-id <programId>
```
Reads the program's boolean document flags and outputs an ordered checklist:

| # | Document | Required | Notes |
|---|---|---|---|
| 1 | Passport Photo | Yes | Recent, white background, 35×45mm |
| 2 | Passport ID Page | Yes | Valid for at least 6 months beyond program start |
| 3 | Academic Transcripts | Yes | Official, with translation if not in English/Chinese |
| 4 | Highest Degree Certificate | Yes | Notarized copy |
| 5 | Physical Exam Form | If required | Use official Chinese physical exam form |
| 6 | Non-Criminal Record | If required | Issued within 6 months |
| 7 | English Proficiency Certificate | If required | IELTS / TOEFL / Duolingo |
| 8 | Application Form | Yes | Signed and dated |
| 9 | Study Plan / Personal Statement | Yes | Minimum 500 words |
| 10 | Recommendation Letters | If required | Count: `recommendationLetterCount` |

### Step 3: Multi-Step Application Wizard
The UI wizard has 5 steps persisted in localStorage:

**Step 1 — Select Program**
- Confirm selected university and program
- Show key details: deadline, intake, fees

**Step 2 — Eligibility Check**
- Display eligibility check results from Step 1
- If warnings: show clearly, ask student to confirm they meet requirements

**Step 3 — Document Checklist**
- Render checklist from Step 2
- Each item: unchecked / in-progress / uploaded
- Student checks off items as they prepare documents

**Step 4 — Upload Documents**
- File upload for each required document
- Accepted formats: PDF, JPG, PNG (max 10MB per file)
- Uploads go to Supabase Storage: `applications/{userId}/{applicationId}/{documentType}`
- Show upload progress and preview thumbnails

**Step 5 — Review & Submit**
- Summary of all uploaded documents
- Display program deadline with countdown timer
- Confirm declaration checkbox
- Submit button creates `Application` record with `status: SUBMITTED`

### Step 4: Application Tracking
After submission:
- Email confirmation sent via Resend API
- Application appears in `dashboard/applications` with status: `SUBMITTED`
- Status updates flow: SUBMITTED → UNDER_REVIEW → ACCEPTED / REJECTED / WAITLISTED

### Step 5: Advisor Escalation
If student is stuck at any step:
- WhatsApp float button always visible (+21228345297)
- "Get Help" CTA on each wizard step opens WhatsApp with pre-filled message:
  `"Hi, I need help with my application to [University] - [Program]"`

## Expected Outputs
- `Application` record created in database
- All documents uploaded to Supabase Storage
- Confirmation email sent to student
- Application visible in user dashboard

## Edge Cases
| Scenario | Handling |
|---|---|
| File too large (>10MB) | Show error inline, do not proceed |
| Wrong file format | Show accepted formats, reject with clear message |
| Deadline passed | Show warning but allow draft saving; block final submission |
| User loses progress (closes browser) | Wizard state saved to localStorage and Application record as DRAFT |
| Upload fails mid-way | Allow retry on individual files without restarting wizard |
| Student not eligible | Show warning, allow override — we don't gatekeep |

## Update History
- Initial version
