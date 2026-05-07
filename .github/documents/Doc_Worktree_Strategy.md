# Git Worktree Strategy: Patient Management Application

**Document Type:** Development Workflow & Branch Management  
**Date:** May 7, 2026  
**Status:** Pre-Implementation Setup Guide  
**Related:** Doc_BRD.md, Doc_Implementation_Plan.md

---

## Overview

This document defines the Git worktree strategy for developing the Patient Management Application. Each major feature area will be developed in an isolated worktree to enable:

- **Parallel development** of independent features
- **Clean isolation** preventing conflicts between features
- **Protection of main branch** during active development
- **Easy context switching** between feature work
- **Team collaboration** with clear branch ownership

---

## Repository Structure

```
Copilot-AI/                          # Main repository (main branch)
├── .git/                            # Git metadata
├── .github/                         # Project documentation
│   └── documents/
│       ├── Doc_BRD.md
│       ├── Doc_Brainstorming_Analysis.md
│       ├── Doc_Implementation_Plan.md
│       └── Doc_Worktree_Strategy.md
├── worktrees/                       # Worktree root (gitignored)
│   ├── foundation/                  # Foundation & setup worktree
│   ├── patient-management/          # Patient CRUD worktree
│   ├── consultation-workflow/       # Consultation entry worktree
│   ├── prescription-printing/       # Prescription PDF worktree
│   ├── appointment-scheduling/      # Appointment system worktree
│   ├── patient-history/             # History view worktree
│   ├── data-export/                 # Export features worktree
│   └── testing-deployment/          # QA & deployment worktree
└── [main codebase files when fully integrated]
```

---

## Worktree Planning Matrix

Based on the BRD and Implementation Plan, here are the recommended worktrees:

| Worktree Name | Branch Name | Feature Scope | Priority | Dependencies | Est. Duration |
|---------------|-------------|---------------|----------|--------------|---------------|
| **foundation** | `feature/foundation-setup` | Project scaffold, DB schema, auth | P0 | None | 3-4 days |
| **patient-management** | `feature/patient-management` | Patient CRUD, search | P0 | foundation | 2-3 days |
| **consultation-workflow** | `feature/consultation-workflow` | Visit form, vitals, medications | P0 | patient-management | 3-4 days |
| **prescription-printing** | `feature/prescription-printing` | PDF generation, print preview | P0 | consultation-workflow | 2-3 days |
| **appointment-scheduling** | `feature/appointment-scheduling` | Calendar, daily queue | P1 | patient-management | 2-3 days |
| **patient-history** | `feature/patient-history` | History view, date filters | P1 | consultation-workflow | 1-2 days |
| **data-export** | `feature/data-export` | CSV/PDF export | P2 | All features | 1-2 days |
| **testing-deployment** | `feature/testing-deployment` | E2E tests, CI/CD, docs | P0 | All features | 2-3 days |

**Total Estimated Time:** 16-24 days across 8 worktrees

---

## Initial Setup

### Prerequisites Validation

Ensure your environment is ready:

```powershell
# Navigate to repository
cd c:\Work\Copilot-AI

# Check git status
git status
# Expected output: "On branch main" with clean working tree

# Verify remote connection
git remote -v
# Should show origin URL

# Pull latest changes
git pull origin main
```

### Create Worktrees Directory

```powershell
# Create worktrees root
New-Item -ItemType Directory -Path "worktrees" -Force

# Add to .gitignore
Add-Content -Path ".gitignore" -Value "`nworktrees/"

# Commit gitignore update
git add .gitignore
git commit -m "chore: add worktrees directory to gitignore"
git push origin main
```

---

## Feature Worktree Creation

### 1. Foundation Setup

**Purpose:** Database schema, project scaffold, authentication, API foundation

**Base Branch:** `main`  
**Feature Branch:** `feature/foundation-setup`  
**Priority:** P0 (Must complete first)

#### Creation Commands

```powershell
# Create worktree and branch
git worktree add worktrees/foundation -b feature/foundation-setup

# Navigate to worktree
cd worktrees/foundation

# Set upstream tracking
git push -u origin feature/foundation-setup

# Verify isolation
git branch --show-current  
# Output: feature/foundation-setup

git status
# Output: On branch feature/foundation-setup, nothing to commit
```

#### Deliverables

**Backend:**
- Express.js server setup
- Prisma ORM configuration
- PostgreSQL schema models (User, Patient, Visit, Medication, Appointment)
- JWT authentication middleware
- Error handling middleware
- Request validation middleware
- Environment configuration (.env template)

**Frontend:**
- React + TypeScript + Vite setup
- Tailwind CSS configuration
- React Router setup
- API client with Axios
- Auth context provider
- Protected route components
- Basic layout structure

**Files to Create:** ~30 files
```
backend/
├── src/
│   ├── server.ts
│   ├── config/database.ts
│   ├── config/env.ts
│   ├── middleware/auth.ts
│   ├── middleware/errorHandler.ts
│   ├── middleware/validator.ts
│   └── routes/auth.ts
├── prisma/schema.prisma
├── package.json
└── tsconfig.json

frontend/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── lib/api.ts
│   ├── contexts/AuthContext.tsx
│   ├── components/Layout/
│   └── pages/Login/
├── package.json
├── tailwind.config.js
└── vite.config.ts
```

#### Success Criteria

```powershell
# Backend verification
cd backend
npm install
npm run dev
# Server should start on http://localhost:3000

# Database verification
npx prisma migrate dev
npx prisma studio
# Prisma Studio should open with all models visible

# Frontend verification
cd ../frontend
npm install
npm run dev
# App should start on http://localhost:5173

# Auth test
curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d "{\"username\":\"admin\",\"password\":\"test\"}"
# Should return JWT token
```

**✅ Ready for Development**

---

### 2. Patient Management

**Purpose:** Patient CRUD operations, search, profile management

**Base Branch:** `main` (after foundation merged)  
**Feature Branch:** `feature/patient-management`  
**Priority:** P0  
**Dependencies:** ✓ foundation

#### Creation Commands

```powershell
# Return to main repository
cd c:\Work\Copilot-AI

# Update main with merged foundation
git checkout main
git pull origin main

# Create worktree from updated main
git worktree add worktrees/patient-management -b feature/patient-management

cd worktrees/patient-management
git push -u origin feature/patient-management

# Install dependencies (inherited from foundation)
cd backend; npm install
cd ../frontend; npm install
```

#### Deliverables

**Backend API:**
- `POST /api/patients` - Create patient
- `GET /api/patients` - List patients (with pagination & search)
- `GET /api/patients/:id` - Get patient details
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient (soft delete)
- Full-text search indexing on name and phone

**Frontend Components:**
- Patient list page with pagination
- Patient search bar with debouncing
- Add patient modal/form
- Edit patient modal/form
- Patient profile view
- Delete confirmation dialog

**Files to Create:** ~15 files
```
backend/src/
├── routes/patients.ts
├── controllers/patientController.ts
├── services/patientService.ts
├── validators/patientValidator.ts
└── tests/patients.test.ts

frontend/src/
├── pages/Patients/
│   ├── PatientList.tsx
│   ├── PatientProfile.tsx
│   └── index.ts
├── components/
│   ├── PatientSearch/PatientSearch.tsx
│   ├── PatientForm/PatientForm.tsx
│   └── PatientCard/PatientCard.tsx
└── hooks/usePatients.ts
```

#### Success Criteria

- ✓ Can add new patient with all required fields (name, DOB, gender, contact)
- ✓ Search returns results within 2 seconds for 1000+ patients
- ✓ Patient list displays with pagination (20 per page)
- ✓ Edit patient updates database correctly
- ✓ Validation prevents duplicate phone numbers
- ✓ Soft delete preserves data integrity

---

### 3. Consultation Workflow

**Purpose:** Visit recording, vitals capture, complaints, diagnosis, medications

**Base Branch:** `main` (after patient-management merged)  
**Feature Branch:** `feature/consultation-workflow`  
**Priority:** P0  
**Dependencies:** ✓ patient-management

#### Creation Commands

```powershell
cd c:\Work\Copilot-AI
git checkout main
git pull origin main

git worktree add worktrees/consultation-workflow -b feature/consultation-workflow

cd worktrees/consultation-workflow
git push -u origin feature/consultation-workflow

cd backend; npm install
cd ../frontend; npm install
```

#### Deliverables

**Backend API:**
- `POST /api/visits` - Create new visit
- `GET /api/visits/:id` - Get visit details
- `PUT /api/visits/:id` - Update visit
- `GET /api/patients/:id/visits` - Get patient visit history
- `POST /api/medications` - Add medication to visit
- `DELETE /api/medications/:id` - Remove medication

**Frontend Components:**
- New visit page (single-page form)
- Vitals input component (Temperature, BP, Pulse)
- Complaints textarea with character count
- Diagnosis textarea
- Medications dynamic list (add/remove rows)
- Form auto-save functionality
- Visit submission confirmation

**Files to Create:** ~20 files
```
backend/src/
├── routes/visits.ts
├── routes/medications.ts
├── controllers/visitController.ts
├── controllers/medicationController.ts
├── services/visitService.ts
├── validators/visitValidator.ts
└── tests/visits.test.ts

frontend/src/
├── pages/NewVisit/
│   ├── NewVisit.tsx
│   ├── VisitForm.tsx
│   └── index.ts
├── components/
│   ├── VitalsInput/VitalsInput.tsx
│   ├── MedicationList/
│   │   ├── MedicationList.tsx
│   │   └── MedicationRow.tsx
│   └── ComplaintsInput/ComplaintsInput.tsx
└── hooks/
    ├── useAutoSave.ts
    └── useVisits.ts
```

#### Success Criteria

- ✓ Can complete consultation record in under 3 minutes
- ✓ Vitals validation prevents invalid ranges (BP: 0-300, Pulse: 30-200, Temp: 95-106°F)
- ✓ Medications can be dynamically added/removed
- ✓ Auto-save triggers every 30 seconds
- ✓ Form validation prevents submission without mandatory vitals
- ✓ Visit associates correctly with patient ID

---

### 4. Prescription Printing

**Purpose:** PDF prescription generation with clinic header, patient details, medications

**Base Branch:** `main` (after consultation-workflow merged)  
**Feature Branch:** `feature/prescription-printing`  
**Priority:** P0  
**Dependencies:** ✓ consultation-workflow

#### Creation Commands

```powershell
cd c:\Work\Copilot-AI
git checkout main
git pull origin main

git worktree add worktrees/prescription-printing -b feature/prescription-printing

cd worktrees/prescription-printing
git push -u origin feature/prescription-printing

# Install PDF generation libraries
cd backend
npm install pdfkit
cd ../frontend
npm install jspdf jspdf-autotable
```

#### Deliverables

**Backend:**
- PDF generation service using PDFKit
- Prescription template with clinic header/footer
- API endpoint to generate prescription PDF
- PDF storage/retrieval

**Frontend:**
- Prescription preview modal
- Print button in visit view
- Browser print dialog integration
- Download prescription as PDF
- Print settings (paper size, margins)

**Files to Create:** ~10 files
```
backend/src/
├── services/prescriptionGenerator.ts
├── templates/prescriptionTemplate.ts
├── routes/prescriptions.ts
└── utils/pdfHelpers.ts

frontend/src/
├── components/PrescriptionPreview/
│   ├── PrescriptionPreview.tsx
│   ├── PrescriptionModal.tsx
│   └── styles.css
└── utils/printHelpers.ts
```

#### Prescription Template Structure

```
┌─────────────────────────────────────────┐
│         CLINIC NAME & LOGO              │
│    Address | Phone | Email              │
│    Dr. [Name] - [Qualifications]       │
├─────────────────────────────────────────┤
│                                         │
│ Patient: [Name]        Date: [Date]    │
│ Age: [Age]  Gender: [Gender]           │
│                                         │
│ Vitals:                                 │
│   Temperature: [value]                  │
│   Blood Pressure: [value]               │
│   Pulse: [value]                        │
│                                         │
│ Complaints:                             │
│   [Free text symptoms]                  │
│                                         │
│ Diagnosis:                              │
│   [Doctor's diagnosis notes]            │
│                                         │
│ Rx:                                     │
│   1. [Medicine] - [Dosage]             │
│      [Frequency] - [Duration]           │
│      [Instructions]                     │
│   2. [Medicine] - [Dosage]             │
│      ...                                │
│                                         │
├─────────────────────────────────────────┤
│              _________________          │
│              Dr. [Name]                 │
│              [License Number]           │
└─────────────────────────────────────────┘
```

#### Success Criteria

- ✓ Prescription generates within 5 seconds
- ✓ All visit data appears correctly formatted
- ✓ Browser print dialog opens with correct settings
- ✓ PDF download includes complete prescription
- ✓ Prescription is legible and professional
- ✓ Print-friendly CSS prevents page breaks mid-content

---

### 5. Appointment Scheduling

**Purpose:** Appointment calendar, daily queue, status tracking

**Base Branch:** `main` (after patient-management merged)  
**Feature Branch:** `feature/appointment-scheduling`  
**Priority:** P1  
**Dependencies:** ✓ patient-management

#### Creation Commands

```powershell
cd c:\Work\Copilot-AI
git checkout main
git pull origin main

git worktree add worktrees/appointment-scheduling -b feature/appointment-scheduling

cd worktrees/appointment-scheduling
git push -u origin feature/appointment-scheduling
```

#### Deliverables

**Backend API:**
- `POST /api/appointments` - Schedule appointment
- `GET /api/appointments` - List appointments (with date filter)
- `GET /api/appointments/today` - Get today's appointments
- `PUT /api/appointments/:id` - Update appointment
- `PATCH /api/appointments/:id/status` - Update status
- `DELETE /api/appointments/:id` - Cancel appointment

**Frontend Components:**
- Appointments page with daily view
- Add appointment modal (patient selection, date/time)
- Today's queue widget for dashboard
- Appointment status buttons (Scheduled, Completed, Cancelled, No-show)
- Date navigation (previous/next day)
- Calendar month view (optional)

**Files to Create:** ~12 files
```
backend/src/
├── routes/appointments.ts
├── controllers/appointmentController.ts
├── services/appointmentService.ts
├── validators/appointmentValidator.ts
└── tests/appointments.test.ts

frontend/src/
├── pages/Appointments/
│   ├── AppointmentList.tsx
│   ├── DailyView.tsx
│   └── index.ts
├── components/
│   ├── AppointmentCard/AppointmentCard.tsx
│   ├── AddAppointmentModal/AddAppointmentModal.tsx
│   └── DailyQueue/DailyQueue.tsx
```

#### Success Criteria

- ✓ Can schedule appointment for future date
- ✓ Today's queue shows only today's appointments
- ✓ Status updates persist in database
- ✓ Walk-in patients can be added to queue
- ✓ Date navigation updates list correctly
- ✓ Cancelled/completed appointments styled differently

---

### 6. Patient History

**Purpose:** Historical visit view, date filtering, record access

**Base Branch:** `main` (after consultation-workflow merged)  
**Feature Branch:** `feature/patient-history`  
**Priority:** P1  
**Dependencies:** ✓ consultation-workflow

#### Creation Commands

```powershell
cd c:\Work\Copilot-AI
git checkout main
git pull origin main

git worktree add worktrees/patient-history -b feature/patient-history

cd worktrees/patient-history
git push -u origin feature/patient-history
```

#### Deliverables

**Backend API:**
- `GET /api/patients/:id/history` - Get complete patient history
- `GET /api/patients/:id/history?from=DATE&to=DATE` - Date range filter

**Frontend Components:**
- Patient history page (timeline or table view)
- Visit card component (showing summary)
- Visit detail modal (full consultation data)
- Date range filter
- Print history button
- Vitals trend chart (optional enhancement)

**Files to Create:** ~8 files
```
backend/src/
├── controllers/historyController.ts
├── services/historyService.ts
└── tests/history.test.ts

frontend/src/
├── pages/PatientHistory/
│   ├── PatientHistory.tsx
│   ├── HistoryTimeline.tsx
│   └── index.ts
└── components/
    ├── VisitCard/VisitCard.tsx
    ├── VisitDetailModal/VisitDetailModal.tsx
    └── DateRangeFilter/DateRangeFilter.tsx
```

#### Success Criteria

- ✓ History loads within 2 seconds for 50+ visits
- ✓ Date filter updates view correctly
- ✓ Visit details show all consultation data (vitals, complaints, diagnosis, medications)
- ✓ Easy navigation back to patient profile
- ✓ Can print comprehensive history report
- ✓ Chronological ordering (newest first)

---

### 7. Data Export

**Purpose:** CSV and PDF export for patients, visits, and reports

**Base Branch:** `main` (after all features merged)  
**Feature Branch:** `feature/data-export`  
**Priority:** P2  
**Dependencies:** ✓ All feature worktrees

#### Creation Commands

```powershell
cd c:\Work\Copilot-AI
git checkout main
git pull origin main

git worktree add worktrees/data-export -b feature/data-export

cd worktrees/data-export
git push -u origin feature/data-export

# Install export libraries
cd backend
npm install csv-writer papaparse
```

#### Deliverables

**Backend Services:**
- CSV export service for patients
- CSV export service for visits
- PDF report generation
- Data sanitization for export

**Frontend UI:**
- Export dialog component
- Export type selection (CSV/PDF)
- Data range selection
- Export options (all data, date range, specific patients)
- Download progress indicator

**Files to Create:** ~6 files
```
backend/src/
├── services/exportService.ts
├── routes/export.ts
└── tests/export.test.ts

frontend/src/
└── components/
    ├── ExportDialog/
    │   ├── ExportDialog.tsx
    │   └── ExportOptions.tsx
    └── utils/downloadHelpers.ts
```

#### Export Formats

**Patient CSV:**
```csv
PatientID,Name,DOB,Age,Gender,Phone,Email,CreatedDate,LastVisit
PAT001,John Doe,1980-05-15,45,Male,555-0100,john@example.com,2026-01-10,2026-05-05
```

**Visit CSV:**
```csv
VisitID,PatientID,PatientName,Date,Temperature,BP,Pulse,Complaints,Diagnosis,Medications
VIS001,PAT001,John Doe,2026-05-01,98.6,120/80,72,Fever,Common Cold,"Paracetamol 500mg TID"
```

#### Success Criteria

- ✓ CSV export includes all patient/visit fields
- ✓ PDF export matches prescription formatting
- ✓ Large datasets (1000+ records) export successfully without timeout
- ✓ File downloads trigger browser save dialog
- ✓ Export file naming includes date/timestamp
- ✓ Data sanitization protects sensitive information

---

### 8. Testing & Deployment

**Purpose:** E2E tests, CI/CD pipeline, documentation, production deployment

**Base Branch:** `main` (after all features merged)  
**Feature Branch:** `feature/testing-deployment`  
**Priority:** P0  
**Dependencies:** ✓ All features complete

#### Creation Commands

```powershell
cd c:\Work\Copilot-AI
git checkout main
git pull origin main

git worktree add worktrees/testing-deployment -b feature/testing-deployment

cd worktrees/testing-deployment
git push -u origin feature/testing-deployment

# Install testing dependencies
cd frontend
npm install --save-dev @playwright/test @testing-library/react @testing-library/jest-dom
cd ../backend
npm install --save-dev jest supertest @types/jest @types/supertest
```

#### Deliverables

**Testing:**
- Unit tests for backend services
- Integration tests for API endpoints
- E2E tests for critical user workflows
- Test coverage reports

**CI/CD:**
- GitHub Actions workflow
- Automated testing on PR
- Automated deployment to staging
- Production deployment script

**Documentation:**
- User guide with screenshots
- API documentation
- Deployment guide
- Troubleshooting guide

**Files to Create:** ~15 files
```
tests/
├── e2e/
│   ├── patient-workflow.spec.ts
│   ├── consultation-workflow.spec.ts
│   ├── prescription-printing.spec.ts
│   └── appointment-workflow.spec.ts
├── backend/
│   ├── unit/
│   │   ├── patientService.test.ts
│   │   ├── visitService.test.ts
│   │   └── prescriptionGenerator.test.ts
│   └── integration/
│       ├── patients.integration.test.ts
│       └── visits.integration.test.ts
└── playwright.config.ts

.github/
└── workflows/
    ├── ci.yml
    ├── deploy-staging.yml
    └── deploy-production.yml

docs/
├── USER_GUIDE.md
├── API_DOCUMENTATION.md
├── DEPLOYMENT.md
└── TROUBLESHOOTING.md
```

#### E2E Test Scenarios

```typescript
// Patient workflow test
test('Complete patient management workflow', async ({ page }) => {
  // 1. Login
  // 2. Add new patient
  // 3. Search for patient
  // 4. Edit patient details
  // 5. View patient profile
});

// Consultation workflow test
test('Complete consultation workflow', async ({ page }) => {
  // 1. Select patient
  // 2. Create new visit
  // 3. Enter vitals
  // 4. Add complaints
  // 5. Add diagnosis
  // 6. Add medications
  // 7. Generate prescription
  // 8. Print prescription
});
```

#### Success Criteria

- ✓ All E2E tests pass for critical workflows
- ✓ Backend test coverage > 70%
- ✓ Frontend test coverage > 60%
- ✓ CI pipeline runs on every PR
- ✓ Automated deployment to staging succeeds
- ✓ User documentation complete with screenshots
- ✓ API documentation generated (OpenAPI/Swagger)

---

## Daily Worktree Workflow

### Starting Your Work Day

```powershell
# Navigate to your feature worktree
cd c:\Work\Copilot-AI\worktrees\[feature-name]

# Check current branch
git branch --show-current

# Sync with main branch
git fetch origin
git rebase origin/main

# If conflicts occur, resolve them
# git status (shows conflicted files)
# Edit files to resolve conflicts
# git add [resolved-files]
# git rebase --continue

# Start development servers
cd backend
npm run dev  # Terminal 1

cd ../frontend
npm run dev  # Terminal 2
```

### Committing Changes

Use **Conventional Commits** format:

```powershell
# Stage changes
git add .

# Commit with descriptive message
git commit -m "feat(patients): add search functionality with debounce"
git commit -m "fix(vitals): validate blood pressure range 0-300"
git commit -m "docs(readme): update setup instructions"
git commit -m "test(visits): add unit tests for visit service"
git commit -m "refactor(api): extract validation middleware"
git commit -m "style(ui): improve patient card layout"
git commit -m "chore(deps): update dependencies"

# Push to remote
git push origin feature/[feature-name]
```

### Switching Between Features

```powershell
# No need to commit in current worktree
# Just switch directories
cd c:\Work\Copilot-AI\worktrees\[target-feature]

# Check status
git status
git log --oneline -5
```

---

## Branch Synchronization

### Strategy 1: Rebase (Recommended)

Keeps linear history, easier code review:

```powershell
cd worktrees\[your-feature]

# Fetch latest main
git fetch origin main

# Rebase your feature on top of main
git rebase origin/main

# If conflicts:
# 1. Fix conflicts in files
# 2. git add [resolved-files]
# 3. git rebase --continue

# Force push (rewrites history)
git push --force-with-lease origin feature/[your-feature]
```

### Strategy 2: Merge

Preserves history, creates merge commits:

```powershell
cd worktrees\[your-feature]

git fetch origin main
git merge origin/main

# Resolve conflicts if any
git add .
git commit -m "merge: sync with main"

git push origin feature/[your-feature]
```

**Recommendation:** Use **Rebase** for cleaner history

---

## Pull Request Process

### Before Creating PR

```powershell
# 1. Run all tests
cd backend
npm test
npm run test:integration
npm run lint

cd ../frontend
npm test
npm run lint
npm run build

# 2. Sync with latest main
git fetch origin
git rebase origin/main

# 3. Push to remote
git push --force-with-lease origin feature/[feature-name]
```

### PR Template

```markdown
## Feature: [Feature Name]

### Summary
Brief description of what this feature implements.

### Checklist
- [ ] Backend API implemented
- [ ] Frontend UI completed
- [ ] Validation added
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] E2E tests (if applicable)
- [ ] Documentation updated
- [ ] No console errors/warnings

### Related
- BRD Section: [Section Name]
- Implementation Plan: [Task ID]
- Closes #[issue-number]

### Testing Performed
- Manual testing completed ✓
- Unit tests: [X] passing
- Integration tests: [X] passing
- E2E tests: [X] passing

### Screenshots
[Add UI screenshots if applicable]

### Breaking Changes
[List any breaking changes or migration steps needed]
```

### After PR Approval

```powershell
# Merge PR via GitHub UI (use "Squash and merge")

# Update main repository
cd c:\Work\Copilot-AI
git checkout main
git pull origin main

# Update dependent worktrees
cd worktrees\[dependent-feature]
git fetch origin
git rebase origin/main
git push --force-with-lease origin feature/[dependent-feature]
```

---

## Worktree Status Management

### Check All Worktrees

```powershell
cd c:\Work\Copilot-AI
git worktree list
```

**Output:**
```
c:\Work\Copilot-AI                                          abc1234 [main]
c:\Work\Copilot-AI\worktrees\foundation                     def5678 [feature/foundation-setup]
c:\Work\Copilot-AI\worktrees\patient-management             ghi9012 [feature/patient-management]
c:\Work\Copilot-AI\worktrees\consultation-workflow          jkl3456 [feature/consultation-workflow]
```

### Status Dashboard Script

```powershell
# Create a status check script
$worktreesPath = "c:\Work\Copilot-AI\worktrees"

Get-ChildItem -Path $worktreesPath -Directory | ForEach-Object {
    Write-Host "=== $($_.Name) ===" -ForegroundColor Cyan
    Push-Location $_.FullName
    
    $branch = git branch --show-current
    $status = git status -s
    $ahead = git rev-list --count origin/$branch..$branch 2>$null
    
    Write-Host "Branch: $branch" -ForegroundColor Yellow
    if ($ahead -gt 0) {
        Write-Host "Commits ahead: $ahead" -ForegroundColor Green
    }
    if ($status) {
        Write-Host "Uncommitted changes:" -ForegroundColor Red
        Write-Host $status
    } else {
        Write-Host "Clean working tree" -ForegroundColor Green
    }
    Write-Host ""
    
    Pop-Location
}
```

---

## Cleanup & Maintenance

### Remove Completed Worktree

```powershell
cd c:\Work\Copilot-AI

# Remove worktree (deletes directory and git metadata)
git worktree remove worktrees\[feature-name]

# If directory was manually deleted:
git worktree prune

# Optionally delete remote branch (after merge)
git push origin --delete feature/[feature-name]
```

### Bulk Cleanup Script

```powershell
# After all features are merged
cd c:\Work\Copilot-AI

# List all worktrees
git worktree list

# Remove each completed worktree
git worktree remove worktrees\foundation
git worktree remove worktrees\patient-management
git worktree remove worktrees\consultation-workflow
git worktree remove worktrees\prescription-printing
git worktree remove worktrees\appointment-scheduling
git worktree remove worktrees\patient-history
git worktree remove worktrees\data-export
git worktree remove worktrees\testing-deployment

# Prune stale worktree metadata
git worktree prune

# Verify cleanup
git worktree list
# Should only show main repository
```

---

## Troubleshooting Guide

### Problem: Worktree already exists

```
fatal: 'worktrees/[name]' already exists
```

**Solution:**
```powershell
# Check if worktree is registered
git worktree list

# If listed, remove it
git worktree remove worktrees\[name]

# If not listed but directory exists, delete directory
Remove-Item -Recurse -Force worktrees\[name]

# Prune stale entries
git worktree prune

# Try creating again
git worktree add worktrees\[name] -b feature/[name]
```

### Problem: Branch already exists

```
fatal: A branch named 'feature/[name]' already exists
```

**Solution:**
```powershell
# Check if branch exists locally
git branch -a | Select-String "[name]"

# If you want to recreate:
git branch -D feature/[name]

# Or checkout existing branch:
git worktree add worktrees\[name] feature/[name]
```

### Problem: Rebase conflicts

```
CONFLICT (content): Merge conflict in [file]
```

**Solution:**
```powershell
# Check which files have conflicts
git status

# Open conflicted files and resolve
# Look for conflict markers: <<<<<<<, =======, >>>>>>>

# After resolving each file:
git add [resolved-file]

# Continue rebase
git rebase --continue

# If you want to abort:
git rebase --abort
```

### Problem: Dirty worktree prevents operations

```
error: cannot pull with rebase: You have unstaged changes
```

**Solution:**
```powershell
# Option 1: Stash changes
git stash
git pull --rebase origin main
git stash pop

# Option 2: Commit changes
git add .
git commit -m "wip: work in progress"
git pull --rebase origin main

# Option 3: Discard changes (be careful!)
git reset --hard HEAD
git pull --rebase origin main
```

### Problem: Outdated worktree

Worktree is many commits behind main.

**Solution:**
```powershell
cd worktrees\[feature-name]

# Check how far behind
git fetch origin
git log --oneline HEAD..origin/main

# Rebase onto latest main
git rebase origin/main

# Resolve any conflicts
# Then force push
git push --force-with-lease origin feature/[feature-name]
```

---

## Best Practices

### ✅ DO

- **Commit frequently** with descriptive messages
- **Sync with main** at least daily
- **Run tests** before pushing
- **Use conventional commits** for consistent history
- **Keep worktrees clean** - remove after merge
- **Review PR checklist** before submitting
- **Communicate** with team about worktree dependencies

### ❌ DON'T

- **Don't commit directly to main** - always use feature branches
- **Don't force push** without `--force-with-lease`
- **Don't skip tests** before creating PR
- **Don't leave worktrees** unused for weeks
- **Don't merge** without code review
- **Don't mix features** in one worktree
- **Don't ignore conflicts** - resolve them properly

---

## Worktree Lifecycle Summary

```
1. CREATE WORKTREE
   ↓
2. DEVELOP FEATURE
   ↓
3. COMMIT CHANGES
   ↓
4. SYNC WITH MAIN (daily)
   ↓
5. RUN TESTS
   ↓
6. CREATE PULL REQUEST
   ↓
7. CODE REVIEW
   ↓
8. MERGE TO MAIN
   ↓
9. UPDATE DEPENDENT WORKTREES
   ↓
10. REMOVE WORKTREE
```

---

## Commands Quick Reference

```powershell
# Create worktree
git worktree add worktrees/[name] -b feature/[name]

# List worktrees
git worktree list

# Remove worktree
git worktree remove worktrees/[name]

# Prune stale worktrees
git worktree prune

# Sync with main
git fetch origin
git rebase origin/main

# Check status
git status
git log --oneline -10

# Commit
git add .
git commit -m "feat: add feature"

# Push
git push origin feature/[name]

# Force push after rebase
git push --force-with-lease origin feature/[name]
```

---

## Success Metrics

### Worktree Strategy Success Indicators

- ✓ Zero merge conflicts between features
- ✓ Main branch always deployable
- ✓ Features developed in parallel without interference
- ✓ Easy context switching between features
- ✓ Clear ownership and responsibility per feature
- ✓ Reduced development time due to isolation
- ✓ Clean, linear git history

---

## Handoff to Implementation

Once this worktree strategy is validated:

1. **Create foundation worktree** and start Phase 1A
2. **Establish PR process** and review guidelines
3. **Set up CI/CD** in testing-deployment worktree
4. **Monitor worktree status** daily
5. **Follow dependency chain** as outlined in planning matrix

**Implementation Agent**: Use this document as your guide for organizing development across isolated feature branches. Each worktree represents a clean, testable unit of work.

---

**Document Version:** 1.0  
**Last Updated:** May 7, 2026  
**Status:** ✅ Ready for Implementation  
**Next Review:** After foundation worktree merge

---

**END OF WORKTREE STRATEGY**
