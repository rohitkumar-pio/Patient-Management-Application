# Execution Prompts Guide: Patient Management Application

**Document Type:** Step-by-Step Execution & Verification Guide  
**Date:** May 7, 2026  
**Purpose:** Concrete prompts for implementing and testing each phase  
**Related:** Doc_Implementation.md, Doc_Implementation_Execution.md, Doc_Worktree_Strategy.md

---

## How to Use This Document

1. **Execute prompts in order** — Each phase builds on the previous
2. **Verify after each step** — Run the verification commands provided
3. **Don't skip phases** — Dependencies require sequential execution
4. **Copy-paste prompts** — Prompts are ready to use with implementation agent
5. **Test thoroughly** — Test commands included for validation

**Development Approach:**
- All development happens in the **foundation worktree** (`c:\Work\Copilot-AI\worktrees\foundation`)
- Create feature branches for each phase instead of separate worktrees
- Simpler workflow with all code in one location
- Use Git branches to organize work by feature

---

## 📋 Quick Reference Checklist

- [ ] Phase 0: Repository & Worktree Setup
- [ ] Phase 1A: Foundation Setup (Days 1-4)
- [ ] Phase 1B: Patient Management (Days 5-7)
- [ ] Phase 1C: Consultation Workflow (Days 8-11)
- [ ] Phase 1D: Prescription Printing (Days 12-14)
- [ ] Phase 1E: Appointment Scheduling (Days 15-17)
- [ ] Phase 1F: Patient History (Days 18-19)
- [ ] Phase 1G: Data Export (Days 20-21)
- [ ] Phase 1H: Testing & Deployment (Days 22-28)

---

## Phase 0: Repository & Worktree Setup

### Step 0.1: Initialize Workspace

**Prompt:**
```
Verify the foundation worktree is ready:

1. Navigate to the foundation worktree
2. Verify the repository is clean and on the correct branch
3. Ensure all documentation is committed

Run these commands:
- cd c:\Work\Copilot-AI\worktrees\foundation
- git status  # Should show clean working tree
- git pull origin main  # Get latest changes
```

**Verification Commands:**
```powershell
cd c:\Work\Copilot-AI\worktrees\foundation
git status  # Should show "nothing to commit, working tree clean"
Test-Path backend  # Should return True
Test-Path frontend  # Should return True
```

**Expected Output:**
- ✅ Foundation worktree exists and is clean
- ✅ Backend and frontend directories present
- ✅ Ready to start development

---

## Phase 1A: Foundation Setup (Days 1-4)

### Step 1A.1: Verify Foundation Worktree

**Prompt:**
```
Verify the foundation worktree is set up correctly:

1. Navigate to the foundation worktree
2. Check the current branch
3. Ensure tracking is configured

Commands:
- cd c:\Work\Copilot-AI\worktrees\foundation
- git branch --show-current  # Should show current branch
- git status  # Verify clean state
```

**Verification Commands:**
```powershell
cd c:\Work\Copilot-AI\worktrees\foundation
Test-Path .  # Should return True
git status  # Should show clean working tree
```

**Expected Output:**
- ✅ Foundation worktree exists at c:\Work\Copilot-AI\worktrees\foundation
- ✅ Git repository configured
- ✅ Ready for development

---

### Step 1A.2: Backend Project Initialization

**Prompt:**
```
In the foundation worktree (c:\Work\Copilot-AI\worktrees\foundation), initialize the backend project with Express, TypeScript, and Prisma:

1. Create backend directory structure
2. Initialize npm project with backend dependencies:
   - express, cors, helmet, jsonwebtoken, bcryptjs, dotenv
   - @prisma/client, prisma
   - TypeScript and type definitions
3. Create tsconfig.json with strict mode
4. Create .env.example with database and JWT configuration
5. Set up basic folder structure:
   - /backend/src/server.ts
   - /backend/src/app.ts
   - /backend/src/config/
   - /backend/src/middleware/
   - /backend/src/routes/
   - /backend/src/controllers/
   - /backend/src/services/
   - /backend/src/utils/

Commit message: "feat(backend): initialize Express server with TypeScript"
```

**Verification Commands:**
```powershell
cd c:\Work\Copilot-AI\worktrees\foundation\backend
Test-Path package.json
Test-Path tsconfig.json
Test-Path .env.example
npm list express  # Should show express installed
npm list prisma  # Should show prisma installed
npx tsc --noEmit  # Should compile without errors
```

**Expected Output:**
- ✅ Backend structure created (~15 files)
- ✅ All dependencies installed
- ✅ TypeScript compiles successfully

---

### Step 1A.3: Database Schema Setup

**Prompt:**
```
In the foundation worktree, create the complete Prisma database schema based on the BRD requirements:

1. Initialize Prisma: npx prisma init --datasource-provider postgresql
2. Create schema.prisma with 5 models:
   - User (id, email, password, name, role, createdAt, updatedAt)
   - Patient (id, name, age, dateOfBirth, gender, phone, address, createdAt, updatedAt)
   - Visit (id, patientId, complaints, diagnosis, temperature, bloodPressure, pulse, visitDate, createdAt, updatedAt)
   - Medication (id, visitId, name, dosage, frequency, duration, instructions, createdAt)
   - Appointment (id, patientId, appointmentDate, status, notes, createdAt, updatedAt)
3. Set up relationships:
   - Patient has many Visits
   - Patient has many Appointments
   - Visit has many Medications
4. Add indexes for search optimization:
   - Patient: phone, name
   - Visit: patientId, visitDate
   - Appointment: patientId, appointmentDate

Commit message: "feat(database): add Prisma schema with 5 models"
```

**Verification Commands:**
```powershell
cd c:\Work\Copilot-AI\worktrees\foundation
Test-Path prisma\schema.prisma
npx prisma format  # Should format successfully
npx prisma validate  # Should validate schema
# Don't run migrations yet (PostgreSQL needs to be running)
```

**Expected Output:**
- ✅ schema.prisma created with all 5 models
- ✅ Relationships defined correctly
- ✅ Indexes added for performance
- ✅ Schema validates without errors

---

### Step 1A.4: Authentication System

**Prompt:**
```
In the foundation worktree, implement JWT authentication system:

1. Create /backend/src/middleware/auth.ts with JWT verification
2. Create /backend/src/controllers/authController.ts with:
   - register(req, res): Create new user with hashed password
   - login(req, res): Validate credentials and return JWT token
3. Create /backend/src/routes/auth.ts with POST /register and POST /login
4. Create /backend/src/utils/jwt.ts for token generation and verification
5. Add password hashing utilities with bcryptjs
6. Create request validation with Zod schemas

Security requirements:
- Hash passwords with bcrypt (10 rounds)
- JWT expiration: 24 hours
- Include user ID and role in token payload

Commit message: "feat(auth): implement JWT authentication system"
```

**Verification Commands:**
```powershell
cd c:\Work\Copilot-AI\worktrees\foundation\backend
npx tsc --noEmit  # Should compile without errors
# Manual check: Review auth.ts routes are exported
```

**Expected Output:**
- ✅ Authentication middleware created
- ✅ Register and login endpoints implemented
- ✅ JWT utilities configured
- ✅ Password hashing working

---

### Step 1A.5: Express Server Setup

**Prompt:**
```
In the foundation worktree, create the complete Express server configuration:

1. Create /backend/src/app.ts with:
   - Express app initialization
   - CORS configuration (allow frontend origin)
   - Helmet for security headers
   - JSON body parser
   - Global error handler middleware
   - 404 handler
   - Health check endpoint: GET /api/health

2. Create /backend/src/server.ts with:
   - Database connection via Prisma
   - Server startup on port 5000
   - Graceful shutdown handling

3. Create /backend/src/middleware/errorHandler.ts for centralized error handling

4. Create /backend/src/middleware/requestLogger.ts for request logging

5. Update package.json scripts:
   - "dev": "ts-node-dev --respawn --transpile-only src/server.ts"
   - "build": "tsc"
   - "start": "node dist/server.js"

Commit message: "feat(server): configure Express server with middleware"
```

**Verification Commands:**
```powershell
cd c:\Work\Copilot-AI\worktrees\foundation\backend
npm run build  # Should compile to dist/
# To test server start (requires PostgreSQL):
# npm run dev
# curl http://localhost:5000/api/health
```

**Expected Output:**
- ✅ Server starts on port 5000
- ✅ Health check endpoint responds
- ✅ Error handling middleware works
- ✅ CORS configured correctly

---

### Step 1A.6: Frontend Project Initialization

**Prompt:**
```
In the foundation worktree, initialize the React + TypeScript frontend with Vite:

1. Create frontend using: npm create vite@latest frontend -- --template react-ts
2. Install dependencies:
   - react-router-dom
   - @tanstack/react-query
   - axios
   - zustand (state management)
   - react-hook-form
   - zod
   - tailwindcss, postcss, autoprefixer
3. Initialize Tailwind CSS: npx tailwindcss init -p
4. Configure tailwind.config.js with custom colors from Doc_Implementation.md
5. Create folder structure:
   - /frontend/src/pages/
   - /frontend/src/components/
   - /frontend/src/lib/ (API client)
   - /frontend/src/stores/ (Zustand stores)
   - /frontend/src/hooks/
   - /frontend/src/types/
   - /frontend/src/utils/

6. Create /frontend/src/lib/api.ts with Axios instance and auth interceptor

Commit message: "feat(frontend): initialize React + TypeScript with Vite and Tailwind"
```

**Verification Commands:**
```powershell
cd c:\Work\Copilot-AI\worktrees\foundation\frontend
Test-Path package.json
Test-Path tailwind.config.js
npm list react  # Should show React 18+
npm run build  # Should build successfully
npm run dev  # Should start dev server on port 5173
```

**Expected Output:**
- ✅ Vite development server starts
- ✅ Tailwind CSS configured
- ✅ Folder structure created
- ✅ API client configured

---

### Step 1A.7: Authentication UI

**Prompt:**
```
In the foundation worktree, create the login page and authentication flow:

1. Create /frontend/src/stores/authStore.ts with Zustand:
   - State: user, token, isAuthenticated
   - Actions: login, logout, setUser

2. Create /frontend/src/pages/Login.tsx with:
   - Email and password inputs
   - Form validation with React Hook Form + Zod
   - Login API call
   - Store token in localStorage
   - Redirect to dashboard on success
   - Error message display

3. Create /frontend/src/components/ProtectedRoute.tsx:
   - Check authentication status
   - Redirect to login if not authenticated

4. Create /frontend/src/App.tsx with React Router:
   - Route: / → Login
   - Route: /dashboard → Protected Dashboard (placeholder)

5. Style with Tailwind CSS matching design system

Commit message: "feat(auth): implement login UI and protected routes"
```

**Verification Commands:**
```powershell
cd c:\Work\Copilot-AI\worktrees\foundation\frontend
npm run dev
# Manual testing:
# 1. Open http://localhost:5173
# 2. Should see login page
# 3. Try accessing /dashboard - should redirect to login
```

**Expected Output:**
- ✅ Login page renders correctly
- ✅ Form validation works
- ✅ Protected routes redirect to login
- ✅ Token stored in localStorage after login

---

### Step 1A.8: Foundation Testing

**Prompt:**
```
In the foundation worktree, set up testing infrastructure:

1. Backend testing:
   - Install Jest, Supertest, @types/jest
   - Create jest.config.js for TypeScript
   - Create /backend/tests/auth.test.ts with:
     * Test POST /api/auth/register creates user
     * Test POST /api/auth/login returns JWT
     * Test invalid credentials return 401
   - Add test script: "test": "jest"

2. Frontend testing:
   - Install @testing-library/react, @testing-library/jest-dom, vitest
   - Create vitest.config.ts
   - Create /frontend/src/tests/Login.test.tsx with:
     * Test login form renders
     * Test validation messages
   - Add test script: "test": "vitest"

3. Run all tests to verify setup

Commit message: "test(foundation): add Jest and Vitest testing setup"
```

**Verification Commands:**
```powershell
cd c:\Work\Copilot-AI\worktrees\foundation\backend
npm test  # Should run backend tests

cd c:\Work\Copilot-AI\worktrees\foundation\frontend
npm test  # Should run frontend tests
```

**Expected Output:**
- ✅ Backend tests pass (auth endpoints)
- ✅ Frontend tests pass (login component)
- ✅ Test infrastructure configured

---

### Step 1A.9: Foundation Phase Completion

**Prompt:**
```
Finalize the foundation phase:

1. Create README.md in project root with:
   - Project overview
   - Setup instructions
   - Environment variables documentation
   - How to run backend and frontend
   - Database migration commands

2. Create /backend/.env.example and /frontend/.env.example

3. Verify all files are committed

4. Run final checklist:
   - Backend builds without errors
   - Frontend builds without errors
   - All tests pass
   - TypeScript has no errors

5. Push all changes to feature/foundation-setup branch

6. Create a Pull Request or merge to main (based on Doc_Finishing_Guide.md)
```

**Verification Commands:**
```powershell
cd c:\Work\Copilot-AI\worktrees\foundation

# Backend verification
cd backend
npm run build  # Should succeed
npm test  # All tests pass
npx tsc --noEmit  # No TypeScript errors

# Frontend verification
cd ../frontend
npm run build  # Should succeed
npm test  # All tests pass
npx tsc --noEmit  # No TypeScript errors

# Git verification
cd ..
git status  # All changes committed
git push origin feature/foundation-setup
```

**Expected Output:**
- ✅ ~25 files created
- ✅ All builds successful
- ✅ All tests passing
- ✅ Ready for Phase 1B

**Success Criteria from BRD:**
- ✅ Backend server starts successfully
- ✅ Database schema defined and validated
- ✅ Authentication system working
- ✅ Frontend renders and connects to backend

---

## Phase 1B: Patient Management (Days 5-7)

### Step 1B.1: Create Patient Management Branch

**Prompt:**
```
In the foundation worktree, create a new branch for patient management:

Commands:
- cd c:\Work\Copilot-AI\worktrees\foundation
- git checkout -b feature/patient-management
- git push -u origin feature/patient-management
```

**Verification Commands:**
```powershell
cd c:\Work\Copilot-AI\worktrees\foundation
git branch --show-current  # Should show: feature/patient-management
```

---

### Step 1B.2: Patient API Endpoints

**Prompt:**
```
In the foundation worktree, implement complete Patient CRUD API:

1. Create /backend/src/controllers/patientController.ts with:
   - createPatient(req, res): Create new patient with validation
   - getPatients(req, res): Get all patients with pagination and search
   - getPatientById(req, res): Get single patient with visit count
   - updatePatient(req, res): Update patient details
   - deletePatient(req, res): Soft delete patient
   - searchPatients(req, res): Search by name or phone (< 5 seconds per BRD)

2. Create /backend/src/services/patientService.ts with business logic:
   - Validate duplicate phone numbers
   - Format patient data
   - Handle pagination (20 patients per page)
   - Implement search with Prisma full-text search

3. Create /backend/src/routes/patients.ts with:
   - POST /api/patients - Create patient
   - GET /api/patients - List with ?search=&page=&limit=
   - GET /api/patients/:id - Get single patient
   - PUT /api/patients/:id - Update patient
   - DELETE /api/patients/:id - Delete patient

4. Add Zod validation schemas in /backend/src/validators/patientValidator.ts

5. Protect all routes with auth middleware

Commit message: "feat(patients): implement CRUD API with search"
```

**Verification Commands:**
```powershell
cd c:\Work\Copilot-AI\worktrees\foundation\backend
npx tsc --noEmit  # Should compile
# Test with curl or Postman:
# POST http://localhost:5000/api/patients
# GET http://localhost:5000/api/patients?search=john
```

**Expected Output:**
- ✅ All CRUD endpoints work
- ✅ Search returns results < 5 seconds
- ✅ Duplicate phone validation works
- ✅ Pagination implemented

---

### Step 1B.3: Patient List UI

**Prompt:**
```
In the foundation worktree, create the patient list page:

1. Create /frontend/src/pages/Patients/PatientList.tsx with:
   - Table showing: Name, Age, Gender, Phone, Action buttons
   - Pagination controls (previous/next, page numbers)
   - Search input with debounce (300ms)
   - "Add New Patient" button
   - Loading skeleton while fetching
   - Empty state when no patients found

2. Create /frontend/src/components/PatientSearch.tsx:
   - Search input with magnifying glass icon
   - Real-time search (debounced)
   - Clear button

3. Use TanStack Query for data fetching and caching

4. Style with Tailwind CSS per design system

5. Add to router: /patients → PatientList

Commit message: "feat(patients): add patient list with search and pagination"
```

**Verification Commands:**
```powershell
cd c:\Work\Copilot-AI\worktrees\foundation\frontend
npm run dev
# Manual testing:
# 1. Navigate to /patients
# 2. Should see patient list
# 3. Test search functionality
# 4. Test pagination
```

**Expected Output:**
- ✅ Patient list renders
- ✅ Search works with debounce
- ✅ Pagination functional
- ✅ Loading states display

---

### Step 1B.4: Patient Form Component

**Prompt:**
```
In the foundation worktree, create the patient add/edit form:

1. Create /frontend/src/components/PatientForm.tsx with:
   - Fields: Name (required), Date of Birth, Age (calculated or manual), Gender (select), Phone (required, unique), Address (textarea)
   - React Hook Form + Zod validation
   - Age auto-calculation from DOB
   - Phone number format validation
   - Submit and Cancel buttons
   - Error messages display
   - Loading state during submission

2. Validation rules:
   - Name: 2-100 characters
   - Phone: 10 digits, unique
   - Age: 0-150 or calculated from DOB
   - Gender: Male/Female/Other

3. Handle create and update modes (check if patientId prop exists)

4. Show success toast after submission

Commit message: "feat(patients): add patient form with validation"
```

**Verification Commands:**
```powershell
cd c:\Work\Copilot-AI\worktrees\foundation\frontend
npm run dev
# Manual testing:
# 1. Click "Add New Patient"
# 2. Fill form with valid data
# 3. Submit and verify patient created
# 4. Try duplicate phone - should show error
```

**Expected Output:**
- ✅ Form renders with all fields
- ✅ Validation works correctly
- ✅ Duplicate phone prevented
- ✅ Age auto-calculated from DOB

---

### Step 1B.5: Patient Profile Page

**Prompt:**
```
In the foundation worktree, create the patient profile view:

1. Create /frontend/src/pages/Patients/PatientProfile.tsx with:
   - Patient details card (name, age, gender, phone, address)
   - Edit button (opens form in modal or navigates to edit page)
   - Delete button (with confirmation dialog)
   - Tab navigation: Overview | Visits | Appointments
   - Visit count and last visit date
   - Quick actions: "New Visit", "Schedule Appointment"

2. Create /frontend/src/components/ConfirmDialog.tsx for delete confirmation

3. Fetch patient data with TanStack Query

4. Add route: /patients/:id → PatientProfile

Commit message: "feat(patients): add patient profile page with actions"
```

**Verification Commands:**
```powershell
cd c:\Work\Copilot-AI\worktrees\foundation\frontend
npm run dev
# Manual testing:
# 1. Click on a patient from the list
# 2. Should navigate to /patients/:id
# 3. View patient details
# 4. Test edit and delete actions
```

**Expected Output:**
- ✅ Profile page displays patient data
- ✅ Edit button works
- ✅ Delete with confirmation
- ✅ Tab navigation ready

---

### Step 1B.6: Patient Management Testing

**Prompt:**
```
In the foundation worktree, add comprehensive tests:

1. Backend tests in /backend/tests/patients.test.ts:
   - Test POST /api/patients creates patient
   - Test GET /api/patients returns paginated list
   - Test GET /api/patients/:id returns single patient
   - Test PUT /api/patients/:id updates patient
   - Test DELETE /api/patients/:id deletes patient
   - Test search returns results in < 5 seconds
   - Test duplicate phone validation

2. Frontend tests in /frontend/src/tests/PatientList.test.tsx:
   - Test patient list renders
   - Test search updates list
   - Test pagination works

3. Frontend tests in /frontend/src/tests/PatientForm.test.tsx:
   - Test form validation
   - Test submission
   - Test duplicate phone error

Commit message: "test(patients): add unit and integration tests"
```

**Verification Commands:**
```powershell
cd c:\Work\Copilot-AI\worktrees\foundation\backend
npm test  # Should pass all tests

cd ../frontend
npm test  # Should pass all tests
```

**Expected Output:**
- ✅ All backend tests pass
- ✅ All frontend tests pass
- ✅ Search performance < 5 seconds verified

---

### Step 1B.7: Patient Management Phase Completion

**Prompt:**
```
Finalize patient management phase:

1. Verify all features work:
   - Create patient
   - View patient list
   - Search patients
   - View patient profile
   - Edit patient
   - Delete patient

2. Verify BRD requirements:
   - Patient search < 5 seconds ✓
   - All required fields captured ✓
   - Duplicate phone prevention ✓

3. Run all tests and builds

4. Commit all changes

5. Push to feature/patient-management branch

6. Follow Doc_Finishing_Guide.md to merge or create PR
```

**Verification Commands:**
```powershell
cd c:\Work\Copilot-AI\worktrees\foundation

# Backend
cd backend
npm run build
npm test

# Frontend
cd ../frontend
npm run build
npm test

# Git
cd ..
git status
git push origin feature/patient-management
```

**Expected Output:**
- ✅ ~15 files created
- ✅ All builds successful
- ✅ All tests passing
- ✅ Ready for Phase 1C

---

## Phase 1C: Consultation Workflow (Days 8-11)

### Step 1C.1: Create Consultation Workflow Branch

**Prompt:**
```
In the foundation worktree, create a new branch for consultation workflow:

Commands:
- cd c:\Work\Copilot-AI\worktrees\foundation
- git checkout -b feature/consultation-workflow
- git push -u origin feature/consultation-workflow
```

**Verification Commands:**
```powershell
cd c:\Work\Copilot-AI\worktrees\foundation
git branch --show-current  # Should show: feature/consultation-workflow
```

---

### Step 1C.2: Visit API Implementation

**Prompt:**
```
In the foundation worktree, implement Visit API with medications:

1. Create /backend/src/controllers/visitController.ts with:
   - createVisit(req, res): Create visit with vitals and medications
   - getVisitsByPatient(req, res): Get all visits for a patient
   - getVisitById(req, res): Get single visit with medications
   - updateVisit(req, res): Update visit details
   - deleteVisit(req, res): Delete visit

2. Create /backend/src/services/visitService.ts:
   - Validate mandatory vitals (temperature, BP, pulse)
   - Create visit with nested medications in transaction
   - Calculate visit summary statistics

3. Create /backend/src/routes/visits.ts:
   - POST /api/visits - Create visit (with medications array)
   - GET /api/patients/:patientId/visits - Get patient visits
   - GET /api/visits/:id - Get single visit
   - PUT /api/visits/:id - Update visit
   - DELETE /api/visits/:id - Delete visit

4. Create /backend/src/validators/visitValidator.ts with Zod:
   - Vitals validation:
     * Temperature: 95-107°F (35-42°C)
     * Blood Pressure: systolic 80-200, diastolic 40-130
     * Pulse: 40-200 bpm
   - Complaints: required, 1-1000 characters
   - Diagnosis: optional, max 2000 characters
   - Medications array validation

Commit message: "feat(visits): implement visit CRUD API with vitals validation"
```

**Verification Commands:**
```powershell
cd c:\Work\Copilot-AI\worktrees\foundation\backend
npx tsc --noEmit
# Test with curl:
# POST http://localhost:5000/api/visits
# Body: { patientId, complaints, diagnosis, temperature, bloodPressure, pulse, medications: [] }
```

**Expected Output:**
- ✅ Visit creation with medications works
- ✅ Vitals validation enforced
- ✅ Nested medications saved in transaction

---

### Step 1C.3: Medication API

**Prompt:**
```
In the foundation worktree, implement Medication API:

1. Create /backend/src/controllers/medicationController.ts:
   - addMedication(req, res): Add medication to existing visit
   - updateMedication(req, res): Update medication details
   - deleteMedication(req, res): Remove medication from visit

2. Create /backend/src/routes/medications.ts:
   - POST /api/visits/:visitId/medications - Add medication
   - PUT /api/medications/:id - Update medication
   - DELETE /api/medications/:id - Delete medication

3. Create /backend/src/validators/medicationValidator.ts:
   - Name: required, 2-200 characters
   - Dosage: required (e.g., "500mg", "2 tablets")
   - Frequency: required (e.g., "Twice daily", "Every 8 hours")
   - Duration: required (e.g., "5 days", "2 weeks")
   - Instructions: optional (e.g., "After meals")

Commit message: "feat(medications): implement medication CRUD API"
```

**Verification Commands:**
```powershell
cd c:\Work\Copilot-AI\worktrees\foundation\backend
npx tsc --noEmit
# Test medication endpoints
```

**Expected Output:**
- ✅ Medications can be added to visits
- ✅ Validation works correctly

---

### Step 1C.4: New Visit Form UI

**Prompt:**
```
In the foundation worktree, create the comprehensive consultation form:

1. Create /frontend/src/pages/NewVisit/NewVisitForm.tsx with single-page layout:
   
   SECTION 1: Patient Selection (top)
   - Patient dropdown with search
   - Shows: patient name, age, last visit date
   
   SECTION 2: Vitals (mandatory, always visible)
   - Temperature input (Celsius, decimal)
   - Blood Pressure inputs (Systolic / Diastolic)
   - Pulse input (BPM, integer)
   - Color coding: green (normal), yellow (warning), red (danger)
   
   SECTION 3: Complaints (required)
   - Large textarea (symptoms)
   - Character count: 0/1000
   
   SECTION 4: Diagnosis
   - Large textarea
   - Character count: 0/2000
   
   SECTION 5: Medications (dynamic list)
   - Table with columns: Name, Dosage, Frequency, Duration, Instructions, Actions
   - "Add Medication" button (adds new row)
   - Remove button for each row
   - At least 1 medication required or allow empty
   
   FOOTER:
   - "Save & Print Prescription" button (primary)
   - "Save Visit" button (secondary)
   - "Cancel" button
   - Auto-save draft every 30 seconds

2. Form requirements:
   - React Hook Form + Zod validation
   - Real-time vitals validation with visual feedback
   - Auto-save to localStorage
   - Confirm dialog if user navigates away with unsaved changes
   - Loading states during submission
   - Success redirect to patient profile

3. Target: Complete form submission in < 3 minutes (BRD requirement)

Commit message: "feat(visits): add comprehensive new visit form"
```

**Verification Commands:**
```powershell
cd c:\Work\Copilot-AI\worktrees\foundation\frontend
npm run dev
# Manual testing:
# 1. Navigate to /visits/new
# 2. Fill all fields
# 3. Add multiple medications
# 4. Verify vitals validation
# 5. Submit form
# 6. Time the process - should be < 3 minutes
```

**Expected Output:**
- ✅ Single-page form renders
- ✅ All sections visible without scrolling (or minimal scroll)
- ✅ Vitals validation with color coding
- ✅ Medications can be added/removed dynamically
- ✅ Form submits successfully
- ✅ Auto-save works

---

### Step 1C.5: Vitals Input Component

**Prompt:**
```
In the foundation worktree, create specialized vitals input:

1. Create /frontend/src/components/VitalsInput.tsx with:
   - Temperature input:
     * Celsius selector
     * Decimal input (e.g., 37.5)
     * Normal range hint: 36.1-37.2°C
     * Color indicator: green/yellow/red
   
   - Blood Pressure input:
     * Two inputs: Systolic / Diastolic
     * Format: XXX / YYY mmHg
     * Normal range: 120/80
     * Validation: systolic > diastolic
   
   - Pulse input:
     * Integer only
     * BPM label
     * Normal range: 60-100 bpm

2. Visual feedback:
   - Green border: normal range
   - Yellow border: slightly abnormal
   - Red border: dangerous range
   - Tooltip with normal ranges on hover

3. Props: name, value, onChange, error (for React Hook Form integration)

Commit message: "feat(visits): add vitals input component with validation"
```

**Verification Commands:**
```powershell
# Manual testing in browser:
# 1. Enter vitals values
# 2. Verify color changes based on ranges
# 3. Test validation messages
```

**Expected Output:**
- ✅ Vitals inputs render with visual feedback
- ✅ Validation prevents invalid values
- ✅ Color coding works correctly

---

### Step 1C.6: Medication List Component

**Prompt:**
```
In the foundation worktree, create dynamic medication list:

1. Create /frontend/src/components/MedicationList.tsx:
   - Table layout with headers
   - Each row has 5 input fields + Remove button
   - "Add Medication" button adds new empty row
   - Integration with React Hook Form useFieldArray
   - Validation for each field
   - Empty state: "No medications added yet"

2. Features:
   - Keyboard navigation (Tab through fields)
   - Remove confirmation for last medication
   - Duplicate medication name warning
   - Common medications dropdown suggestions (optional enhancement)

3. Styling:
   - Compact table design
   - Clear visual separation between rows
   - Disabled state for submit until valid

Commit message: "feat(visits): add dynamic medication list component"
```

**Verification Commands:**
```powershell
# Manual testing:
# 1. Click "Add Medication" multiple times
# 2. Fill in medication details
# 3. Remove medications
# 4. Verify validation
```

**Expected Output:**
- ✅ Medications can be added/removed
- ✅ Validation works per row
- ✅ Form array integrates with parent form

---

### Step 1C.7: Visit Auto-Save Feature

**Prompt:**
```
In the foundation worktree, implement auto-save for visit drafts:

1. Create /frontend/src/hooks/useAutoSave.ts:
   - Automatically save form data to localStorage every 30 seconds
   - Save on field blur events
   - Clear draft after successful submission
   - Return: { isDraft: boolean, loadDraft: () => void, clearDraft: () => void }

2. Update NewVisitForm.tsx:
   - Integrate useAutoSave hook
   - Load draft on component mount (show "Resume draft?" dialog)
   - Show "Draft saved" indicator
   - Clear draft after submission or explicit discard

3. Storage key format: `visit-draft-${patientId}-${timestamp}`

Commit message: "feat(visits): add auto-save for visit drafts"
```

**Verification Commands:**
```powershell
# Manual testing:
# 1. Start filling visit form
# 2. Wait 30 seconds
# 3. Refresh page
# 4. Should prompt to resume draft
```

**Expected Output:**
- ✅ Form auto-saves to localStorage
- ✅ Draft can be resumed
- ✅ Draft clears after submission

---

### Step 1C.8: Consultation Workflow Testing

**Prompt:**
```
In the foundation worktree, add comprehensive tests:

1. Backend tests in /backend/tests/visits.test.ts:
   - Test POST /api/visits creates visit with medications
   - Test vitals validation (temperature, BP, pulse ranges)
   - Test GET /api/patients/:id/visits returns all visits
   - Test visit with invalid vitals returns 400
   - Test transaction rollback if medication save fails

2. Frontend tests in /frontend/src/tests/NewVisitForm.test.tsx:
   - Test form renders all sections
   - Test vitals validation
   - Test medication add/remove
   - Test auto-save functionality
   - Test form submission

3. Performance test:
   - Measure time to complete full consultation form
   - Target: < 3 minutes (BRD requirement)

Commit message: "test(visits): add comprehensive visit workflow tests"
```

**Verification Commands:**
```powershell
cd c:\Work\Copilot-AI\worktrees\foundation
npm test  # Backend and frontend
```

**Expected Output:**
- ✅ All tests pass
- ✅ Performance target met

---

### Step 1C.9: Consultation Workflow Phase Completion

**Prompt:**
```
Finalize consultation workflow phase:

1. Verify all features:
   - Create visit with vitals
   - Add medications
   - Form validation
   - Auto-save
   - Submit within 3 minutes

2. Verify BRD requirements:
   - Consultation record in 2-3 minutes ✓
   - Mandatory vitals capture ✓
   - Complaints recorded ✓
   - Diagnosis documented ✓
   - Medications managed ✓

3. Run all tests and builds

4. Commit and push

5. Merge or create PR
```

**Verification Commands:**
```powershell
cd c:\Work\Copilot-AI\worktrees\foundation
# Run builds and tests
# Push changes
git push origin feature/consultation-workflow
```

**Expected Output:**
- ✅ ~20 files created
- ✅ All tests passing
- ✅ Ready for Phase 1D

---

## Phase 1D: Prescription Printing (Days 12-14)

### Step 1D.1: Create Prescription Printing Branch

**Prompt:**
```
In the foundation worktree, create a new branch for prescription printing:

Commands:
- cd c:\Work\Copilot-AI\worktrees\foundation
- git checkout -b feature/prescription-printing
- git push -u origin feature/prescription-printing
- cd backend && npm install pdfkit
- cd ../frontend && npm install jspdf jspdf-autotable
```

**Verification Commands:**
```powershell
cd c:\Work\Copilot-AI\worktrees\foundation
git branch --show-current  # Should show: feature/prescription-printing
```

---

### Step 1D.2: Backend PDF Generation Service

**Prompt:**
```
In the foundation worktree, create PDF generation service:

1. Create /backend/src/services/prescriptionGenerator.ts using PDFKit:
   - generatePrescriptionPDF(visitId): Promise<Buffer>
   - Fetch visit with patient and medications
   - Template layout:
     * HEADER: Clinic logo, name, address, phone (customizable)
     * DATE: Visit date (top right)
     * PATIENT INFO: Name, Age, Gender, Phone
     * VITALS: Temperature, BP, Pulse
     * COMPLAINTS: Symptoms text
     * DIAGNOSIS: Diagnosis text
     * MEDICATIONS TABLE: Name, Dosage, Frequency, Duration, Instructions
     * FOOTER: Doctor name, signature line, clinic notes

2. Create /backend/src/routes/prescription.ts:
   - GET /api/visits/:id/prescription - Generate and download PDF
   - Response: PDF file with proper headers

3. Styling:
   - Professional medical document appearance
   - Clear typography
   - Proper spacing and margins
   - Print-friendly (A4 size)

Commit message: "feat(prescription): implement PDF generation service"
```

**Verification Commands:**
```powershell
cd c:\Work\Copilot-AI\worktrees\foundation\backend
npx tsc --noEmit
# Test endpoint:
# GET http://localhost:5000/api/visits/1/prescription
# Should download PDF file
```

**Expected Output:**
- ✅ PDF generates successfully
- ✅ All visit data included
- ✅ Professional layout
- ✅ Downloaded as .pdf file

---

### Step 1D.3: Prescription Preview Component

**Prompt:**
```
In the foundation worktree, create prescription preview modal:

1. Create /frontend/src/components/PrescriptionPreview.tsx:
   - Modal dialog with full prescription preview
   - Two modes: Preview (HTML) | PDF (iframe)
   - Buttons: "Print", "Download PDF", "Close"
   - Preview shows same layout as PDF
   - Loading state while generating PDF

2. Fetch prescription data from API

3. Use jsPDF for client-side PDF generation (backup to server PDF)

4. Browser print dialog integration:
   - window.print() for direct printing
   - Hide non-printable elements
   - Print-specific CSS

Commit message: "feat(prescription): add prescription preview modal"
```

**Verification Commands:**
```powershell
cd c:\Work\Copilot-AI\worktrees\foundation\frontend
npm run dev
# Manual testing:
# 1. Complete a visit
# 2. Click "Print Prescription"
# 3. Should open preview modal
# 4. Test Print and Download buttons
```

**Expected Output:**
- ✅ Preview modal displays correctly
- ✅ Print dialog opens
- ✅ PDF downloads successfully

---

### Step 1D.4: Print Integration in Visit Workflow

**Prompt:**
```
In the foundation worktree, integrate prescription printing:

1. Update /frontend/src/pages/NewVisit/NewVisitForm.tsx:
   - After successful visit submission, show options:
     * "Print Prescription" button
     * "View Patient Profile" button
   - "Save & Print Prescription" button in form (submits and opens print dialog)

2. Update /frontend/src/pages/Patients/PatientProfile.tsx:
   - Add "Print Prescription" button for each past visit
   - Opens PrescriptionPreview modal with that visit's data

3. Quick print flow:
   - Submit visit → Auto-open print preview → Print → Redirect to patient profile

Commit message: "feat(prescription): integrate printing in visit workflow"
```

**Verification Commands:**
```powershell
# Manual testing:
# 1. Create new visit
# 2. Click "Save & Print Prescription"
# 3. Should auto-open print dialog
# 4. Print or download
# 5. Verify PDF quality
```

**Expected Output:**
- ✅ Print accessible from multiple places
- ✅ Quick print flow works
- ✅ Prescription quality professional

---

### Step 1D.5: Prescription Settings

**Prompt:**
```
In the foundation worktree, create clinic settings for prescription customization:

1. Create /backend/src/models/settings.ts:
   - Clinic name
   - Clinic address
   - Clinic phone
   - Doctor name
   - Doctor credentials
   - Clinic logo URL (optional)
   - Footer text

2. Create /backend/src/routes/settings.ts:
   - GET /api/settings - Get clinic settings
   - PUT /api/settings - Update clinic settings

3. Create /frontend/src/pages/Settings/ClinicSettings.tsx:
   - Form to edit all clinic information
   - Logo upload (optional)
   - Preview prescription with current settings

4. Use settings in prescriptionGenerator.ts header/footer

Commit message: "feat(prescription): add clinic settings for customization"
```

**Verification Commands:**
```powershell
# Manual testing:
# 1. Navigate to /settings
# 2. Update clinic name
# 3. Generate prescription
# 4. Verify new name appears on prescription
```

**Expected Output:**
- ✅ Settings can be updated
- ✅ Prescription uses custom settings
- ✅ Preview updates in real-time

---

### Step 1D.6: Prescription Printing Testing

**Prompt:**
```
In the foundation worktree, add tests:

1. Backend tests in /backend/tests/prescription.test.ts:
   - Test PDF generation completes < 10 seconds
   - Test PDF contains all visit data
   - Test PDF with no medications generates correctly
   - Test custom clinic settings appear in PDF

2. Frontend tests:
   - Test preview modal renders
   - Test print button triggers window.print()
   - Test download button downloads PDF

3. Performance test:
   - Measure PDF generation time
   - Target: < 10 seconds (BRD: smooth generation)

Commit message: "test(prescription): add PDF generation tests"
```

**Verification Commands:**
```powershell
npm test
```

**Expected Output:**
- ✅ All tests pass
- ✅ PDF generation < 10 seconds

---

### Step 1D.7: Prescription Phase Completion

**Prompt:**
```
Finalize prescription printing phase:

1. Verify BRD requirements:
   - Smooth generation and printing ✓
   - Printable prescription with header/footer ✓
   - Clinic/doctor customization ✓
   - All visit data included ✓

2. Test complete flow:
   - Create visit → Generate prescription → Print → Download

3. Run all tests and builds

4. Commit and push

5. Merge or create PR
```

**Verification Commands:**
```powershell
cd c:\Work\Copilot-AI\worktrees\foundation
# Build and test
git push origin feature/prescription-printing
```

**Expected Output:**
- ✅ ~10 files created
- ✅ All tests passing
- ✅ Ready for Phase 1E

---

## Phase 1E: Appointment Scheduling (Days 15-17)

### Step 1E.1: Create Appointment Scheduling Branch

**Prompt:**
```
In the foundation worktree, create a new branch for appointment scheduling:

Commands:
- cd c:\Work\Copilot-AI\worktrees\foundation
- git checkout -b feature/appointment-scheduling
- git push -u origin feature/appointment-scheduling
```

**Verification Commands:**
```powershell
cd c:\Work\Copilot-AI\worktrees\foundation
git branch --show-current  # Should show: feature/appointment-scheduling
```

---

### Step 1E.2: Appointment API Implementation

**Prompt:**
```
In the foundation worktree, implement appointment API:

1. Create /backend/src/controllers/appointmentController.ts:
   - createAppointment(req, res): Schedule appointment
   - getAppointments(req, res): Get appointments with date filter
   - getAppointmentById(req, res): Get single appointment
   - updateAppointmentStatus(req, res): Update status (Scheduled/Completed/Cancelled/No-show)
   - deleteAppointment(req, res): Delete appointment
   - getTodayAppointments(req, res): Get today's queue

2. Create /backend/src/routes/appointments.ts:
   - POST /api/appointments - Create
   - GET /api/appointments?date=YYYY-MM-DD - Get by date
   - GET /api/appointments/today - Today's queue
   - GET /api/appointments/:id - Single appointment
   - PATCH /api/appointments/:id/status - Update status
   - DELETE /api/appointments/:id - Delete

3. Status enum: SCHEDULED | COMPLETED | CANCELLED | NO_SHOW

Commit message: "feat(appointments): implement appointment API with status"
```

**Verification Commands:**
```powershell
cd c:\Work\Copilot-AI\worktrees\foundation\backend
npx tsc --noEmit
# Test endpoints
```

**Expected Output:**
- ✅ Appointment CRUD works
- ✅ Status updates persist
- ✅ Today's queue filters correctly

---

### Step 1E.3: Appointments Page UI

**Prompt:**
```
In the foundation worktree, create appointments page:

1. Create /frontend/src/pages/Appointments/AppointmentsPage.tsx:
   - Date selector (defaults to today)
   - Previous/Next day navigation buttons
   - "Add Appointment" button
   - List of appointments for selected date
   - Each appointment card shows:
     * Patient name
     * Appointment time (if time-based) or just date
     * Status badge (color-coded)
     * Notes
     * Action buttons: Mark Complete, Cancel, No-show, Delete

2. Create /frontend/src/components/AppointmentCard.tsx:
   - Card layout with patient info
   - Status badge component
   - Quick action buttons
   - Click to view patient profile

3. Add route: /appointments → AppointmentsPage

Commit message: "feat(appointments): add appointments page with daily view"
```

**Verification Commands:**
```powershell
cd c:\Work\Copilot-AI\worktrees\foundation\frontend
npm run dev
# Navigate to /appointments
# Test date navigation
# Test status updates
```

**Expected Output:**
- ✅ Appointments page renders
- ✅ Date navigation works
- ✅ Status updates in real-time

---

### Step 1E.4: Add Appointment Modal

**Prompt:**
```
In the foundation worktree, create appointment scheduling modal:

1. Create /frontend/src/components/AddAppointmentModal.tsx:
   - Patient selection (searchable dropdown)
   - Date picker (defaults to today)
   - Time picker (optional - if implementing time slots)
   - Notes textarea
   - Submit and Cancel buttons

2. Features:
   - React Hook Form + Zod validation
   - Patient phone display for confirmation
   - Duplicate appointment warning (same patient, same date)
   - Success message after creation

3. Trigger from:
   - Appointments page "Add Appointment" button
   - Patient profile "Schedule Appointment" button

Commit message: "feat(appointments): add appointment scheduling modal"
```

**Verification Commands:**
```powershell
# Manual testing:
# 1. Click "Add Appointment"
# 2. Select patient
# 3. Pick date
# 4. Submit
# 5. Verify appointment appears in list
```

**Expected Output:**
- ✅ Modal opens and closes correctly
- ✅ Appointment created successfully
- ✅ Appears in appointments list

---

### Step 1E.5: Dashboard Today's Queue

**Prompt:**
```
In the foundation worktree, add today's appointments to dashboard:

1. Create /frontend/src/pages/Dashboard.tsx:
   - Welcome message
   - "Today's Appointments" section
   - Count: X appointments today
   - List of today's appointments (compact view)
   - Quick actions per appointment
   - "View All Appointments" button

2. Create /frontend/src/components/DailyQueue.tsx:
   - Compact list of today's appointments
   - Status color badges
   - Quick "Start Consultation" button (redirects to new visit form with patient pre-selected)

3. Update router: / → Dashboard (protected)

Commit message: "feat(appointments): add today's queue to dashboard"
```

**Verification Commands:**
```powershell
# Manual testing:
# 1. Navigate to /dashboard
# 2. View today's appointments
# 3. Test "Start Consultation" button
```

**Expected Output:**
- ✅ Dashboard displays today's queue
- ✅ Quick actions work
- ✅ Navigation to new visit pre-fills patient

---

### Step 1E.6: Appointment Testing

**Prompt:**
```
In the foundation worktree, add tests:

1. Backend tests in /backend/tests/appointments.test.ts:
   - Test create appointment
   - Test get today's appointments
   - Test status update
   - Test date filtering

2. Frontend tests:
   - Test appointments page renders
   - Test date navigation
   - Test status change

Commit message: "test(appointments): add appointment workflow tests"
```

---

### Step 1E.7: Appointments Phase Completion

**Prompt:**
```
Finalize appointments phase:

1. Verify BRD requirements:
   - Schedule appointments ✓
   - View daily appointment list ✓
   - Update appointment status ✓
   - All status types working ✓

2. Run all tests and builds

3. Commit and push

4. Merge or create PR
```

**Expected Output:**
- ✅ ~12 files created
- ✅ All tests passing
- ✅ Ready for Phase 1F

---

## Phase 1F: Patient History (Days 18-19)

### Step 1F.1: Create Patient History Branch

**Prompt:**
```
In the foundation worktree, create a new branch for patient history:

Commands:
- cd c:\Work\Copilot-AI\worktrees\foundation
- git checkout -b feature/patient-history
- git push -u origin feature/patient-history
```

**Verification Commands:**
```powershell
cd c:\Work\Copilot-AI\worktrees\foundation
git branch --show-current  # Should show: feature/patient-history
```

---

### Step 1F.2: Patient History API

**Prompt:**
```
In the foundation worktree, implement history API:

1. Update /backend/src/controllers/visitController.ts:
   - getPatientHistory(req, res): Get all visits with filters
   - Query parameters: patientId, startDate, endDate, limit, offset

2. Optimize query:
   - Include medications in response
   - Sort by visitDate descending (newest first)
   - Add pagination (default 20 visits per page)
   - Performance target: < 2 seconds for 50+ visits (BRD requirement)
   - Use database indexes on patientId and visitDate

Commit message: "feat(history): add optimized patient history API"
```

**Verification Commands:**
```powershell
# Test with large dataset:
# GET /api/patients/:id/visits?startDate=2024-01-01&endDate=2026-05-07
# Measure response time - should be < 2 seconds
```

**Expected Output:**
- ✅ History API returns all visits
- ✅ Date filtering works
- ✅ Performance < 2 seconds

---

### Step 1F.3: Patient History Page UI

**Prompt:**
```
In the foundation worktree, create patient history page:

1. Create /frontend/src/pages/Patients/PatientHistory.tsx:
   - Patient header (name, age, contact)
   - Date range filter (start date, end date)
   - "All Time" preset button
   - Timeline view of visits (or table view toggle)
   - Each visit shows:
     * Visit date
     * Vitals (temperature, BP, pulse)
     * Complaints summary (truncated)
     * Diagnosis summary (truncated)
     * Medication count
     * "View Details" button

2. Create /frontend/src/components/VisitCard.tsx:
   - Compact card layout
   - Color-coded vitals indicators
   - Expandable details (or modal)

3. Create /frontend/src/components/VisitDetailModal.tsx:
   - Full visit details in modal
   - All vitals, full complaints, diagnosis
   - Complete medication list table
   - "Print Prescription" button
   - "Edit Visit" button (optional)

4. Performance:
   - Virtualized list if > 50 visits (react-window)
   - Load more pagination
   - Target: < 2 seconds load time

5. Add route: /patients/:id/history → PatientHistory

Commit message: "feat(history): add patient history timeline with filtering"
```

**Verification Commands:**
```powershell
cd c:\Work\Copilot-AI\worktrees\foundation\frontend
npm run dev
# Navigate to /patients/:id/history
# Test date filtering
# Test visit detail modal
# Measure load time with 50+ visits
```

**Expected Output:**
- ✅ History timeline displays
- ✅ Date filter works
- ✅ Visit details accessible
- ✅ Load time < 2 seconds

---

### Step 1F.4: History Comparison View (Optional Enhancement)

**Prompt:**
```
In the foundation worktree, add vitals comparison chart:

1. Install chart library: npm install recharts

2. Create /frontend/src/components/VitalsChart.tsx:
   - Line chart showing vitals over time
   - Three lines: Temperature, Systolic BP, Pulse
   - X-axis: Visit dates
   - Y-axis: Values (scaled appropriately)
   - Hover tooltip with exact values

3. Add to PatientHistory page as optional view:
   - Toggle between "Timeline" and "Chart" views

Commit message: "feat(history): add vitals trend chart (optional)"
```

**Verification Commands:**
```powershell
# Manual testing:
# Toggle to chart view
# Verify all visits plotted correctly
```

**Expected Output:**
- ✅ Chart displays vitals trends
- ✅ Easy to read and interpret

---

### Step 1F.5: History Testing

**Prompt:**
```
In the foundation worktree, add tests:

1. Backend tests:
   - Test history API with 50+ visits returns < 2 seconds
   - Test date filtering
   - Test pagination

2. Frontend tests:
   - Test history page renders
   - Test date filter updates list
   - Test visit detail modal

Commit message: "test(history): add patient history tests"
```

---

### Step 1F.6: History Phase Completion

**Prompt:**
```
Finalize patient history phase:

1. Verify BRD requirements:
   - View previous visits ✓
   - Access vitals, complaints, diagnosis, prescriptions ✓
   - Filter by date ✓
   - History retrieval within 2-5 seconds ✓

2. Run all tests and builds

3. Commit and push

4. Merge or create PR
```

**Expected Output:**
- ✅ ~8 files created
- ✅ All tests passing
- ✅ Ready for Phase 1G

---

## Phase 1G: Data Export (Days 20-21)

### Step 1G.1: Create Data Export Branch

**Prompt:**
```
In the foundation worktree, create a new branch for data export:

Commands:
- cd c:\Work\Copilot-AI\worktrees\foundation
- git checkout -b feature/data-export
- git push -u origin feature/data-export
- cd backend && npm install csv-writer papaparse
```

**Verification Commands:**
```powershell
cd c:\Work\Copilot-AI\worktrees\foundation
git branch --show-current  # Should show: feature/data-export
```

---

### Step 1G.2: Export Service Implementation

**Prompt:**
```
In the foundation worktree, implement export service:

1. Create /backend/src/services/exportService.ts:
   - exportPatientsCSV(): Export all patients to CSV
   - exportVisitsCSV(patientId?, startDate?, endDate?): Export visits to CSV
   - exportPatientsPDF(): Export patients to PDF table
   - exportVisitsPDF(patientId?, startDate?, endDate?): Export visits to PDF

2. CSV format:
   - Patients: ID, Name, Age, Gender, Phone, Address, Created Date
   - Visits: ID, Patient Name, Visit Date, Complaints, Diagnosis, Temperature, BP, Pulse, Medications (comma-separated)

3. PDF format:
   - Professional table layout
   - Paginated if > 50 records
   - Header with export date and filters applied

4. Create /backend/src/routes/export.ts:
   - GET /api/export/patients/csv
   - GET /api/export/patients/pdf
   - GET /api/export/visits/csv?patientId=&startDate=&endDate=
   - GET /api/export/visits/pdf?patientId=&startDate=&endDate=

5. Performance:
   - Test with 1000+ record exports (BRD: successful export)
   - Stream large datasets instead of loading all in memory

Commit message: "feat(export): implement CSV and PDF export service"
```

**Verification Commands:**
```powershell
cd c:\Work\Copilot-AI\worktrees\foundation\backend
npx tsc --noEmit
# Test endpoints:
# GET http://localhost:5000/api/export/patients/csv
# Should download CSV file
```

**Expected Output:**
- ✅ CSV export generates correctly
- ✅ PDF export generates correctly
- ✅ Large datasets (1000+) export successfully

---

### Step 1G.3: Export UI Component

**Prompt:**
```
In the foundation worktree, create export dialog:

1. Create /frontend/src/components/ExportDialog.tsx:
   - Modal dialog with export options
   - Radio buttons: "Patients" | "Visits"
   - Format selection: CSV | PDF
   - If Visits selected:
     * Patient filter (optional - all patients or specific patient)
     * Date range filter (start date, end date)
   - "Export" button (triggers download)
   - Loading state during export
   - Success message with download link

2. Create /frontend/src/utils/downloadHelpers.ts:
   - downloadFile(url, filename): Trigger browser download
   - formatExportFilename(type, format, date): e.g., "patients-export-2026-05-07.csv"

3. Add export button to:
   - Patient list page header
   - Patient history page header
   - Settings page

Commit message: "feat(export): add export dialog with CSV/PDF options"
```

**Verification Commands:**
```powershell
cd c:\Work\Copilot-AI\worktrees\foundation\frontend
npm run dev
# Manual testing:
# 1. Click "Export" button
# 2. Select options
# 3. Click "Export"
# 4. Verify file downloads
# 5. Open CSV in Excel
# 6. Open PDF in viewer
```

**Expected Output:**
- ✅ Export dialog opens
- ✅ All options work
- ✅ Files download correctly
- ✅ CSV/PDF formatted properly

---

### Step 1G.4: Export Testing

**Prompt:**
```
In the foundation worktree, add tests:

1. Backend tests in /backend/tests/export.test.ts:
   - Test CSV export contains all patient fields
   - Test PDF export generates
   - Test large dataset (1000+ records) exports successfully
   - Test date filtering in visit exports

2. Frontend tests:
   - Test export dialog renders
   - Test file download triggers

Commit message: "test(export): add export functionality tests"
```

---

### Step 1G.5: Export Phase Completion

**Prompt:**
```
Finalize data export phase:

1. Verify BRD requirements:
   - Successful export of data in CSV/PDF format ✓
   - Both patient and visit exports working ✓

2. Run all tests and builds

3. Commit and push

4. Merge or create PR
```

**Expected Output:**
- ✅ ~6 files created
- ✅ All tests passing
- ✅ Ready for Phase 1H

---

## Phase 1H: Testing & Deployment (Days 22-28)

### Step 1H.1: Create Testing & Deployment Branch

**Prompt:**
```
In the foundation worktree, create a new branch for testing and deployment:

Commands:
- cd c:\Work\Copilot-AI\worktrees\foundation
- git checkout -b feature/testing-deployment
- git push -u origin feature/testing-deployment
```

**Verification Commands:**
```powershell
cd c:\Work\Copilot-AI\worktrees\foundation
git branch --show-current  # Should show: feature/testing-deployment
```

---

### Step 1H.2: End-to-End Tests Setup

**Prompt:**
```
In the foundation worktree, set up E2E testing:

1. Install Playwright:
   - cd frontend
   - npm install --save-dev @playwright/test
   - npx playwright install

2. Create playwright.config.ts with:
   - Base URL: http://localhost:5173
   - Test directory: tests/e2e
   - Browsers: chromium, firefox, webkit
   - Screenshots on failure
   - Video recording on failure

3. Create /tests/e2e directory structure

Commit message: "test(e2e): setup Playwright for end-to-end testing"
```

---

### Step 1H.3: Critical User Workflow E2E Tests

**Prompt:**
```
In the foundation worktree, create comprehensive E2E tests:

1. Create /tests/e2e/auth.spec.ts:
   - Test login with valid credentials
   - Test login with invalid credentials
   - Test logout
   - Test protected route redirect

2. Create /tests/e2e/patient-workflow.spec.ts:
   - Test create new patient
   - Test search patient
   - Test view patient profile
   - Test edit patient
   - Verify duplicate phone prevention

3. Create /tests/e2e/consultation-workflow.spec.ts:
   - Test complete consultation workflow:
     * Login
     * Select patient
     * Fill vitals (verify validation)
     * Enter complaints and diagnosis
     * Add multiple medications
     * Submit form
     * Verify consultation saved
   - Measure time: should complete < 3 minutes

4. Create /tests/e2e/prescription-workflow.spec.ts:
   - Test prescription generation
   - Test prescription download
   - Verify PDF contains all data

5. Create /tests/e2e/appointment-workflow.spec.ts:
   - Test schedule appointment
   - Test view today's appointments
   - Test update appointment status

6. Create /tests/e2e/export-workflow.spec.ts:
   - Test CSV export downloads
   - Test PDF export downloads

Commit message: "test(e2e): add comprehensive workflow tests"
```

**Verification Commands:**
```powershell
cd c:\Work\Copilot-AI\worktrees\foundation\frontend
npx playwright test
npx playwright test --ui  # Open UI mode
```

**Expected Output:**
- ✅ All E2E tests pass
- ✅ Consultation workflow < 3 minutes verified

---

### Step 1H.4: CI/CD Pipeline Setup

**Prompt:**
```
In the foundation worktree, create GitHub Actions CI/CD pipeline:

1. Create /.github/workflows/ci.yml:
   - Trigger: on push to main and pull requests
   - Jobs:
     * Backend tests (npm test)
     * Frontend tests (npm test)
     * Backend build (npm run build)
     * Frontend build (npm run build)
     * TypeScript type checking
     * Linting (ESLint)
   - PostgreSQL service for database tests
   - Cache node_modules for faster builds

2. Create /.github/workflows/e2e.yml:
   - Trigger: on pull request
   - Start backend and frontend servers
   - Run Playwright E2E tests
   - Upload test results and screenshots on failure

3. Create /.github/workflows/deploy.yml:
   - Trigger: on push to main (after tests pass)
   - Deploy frontend to Vercel
   - Deploy backend to Railway

Commit message: "ci: add GitHub Actions CI/CD pipeline"
```

**Verification Commands:**
```powershell
# Push to GitHub and verify workflows run
git push origin feature/testing-deployment
# Check GitHub Actions tab for workflow status
```

**Expected Output:**
- ✅ CI pipeline runs on PR
- ✅ All tests pass in CI
- ✅ Deployment workflow configured

---

### Step 1H.5: Documentation

**Prompt:**
```
In the foundation worktree, create comprehensive documentation:

1. Create /docs/USER_GUIDE.md:
   - Getting started
   - Login instructions
   - Patient management
   - Creating consultations
   - Printing prescriptions
   - Scheduling appointments
   - Viewing patient history
   - Exporting data
   - Screenshots for each feature

2. Create /docs/DEPLOYMENT.md:
   - Prerequisites (Node.js, PostgreSQL)
   - Environment variables
   - Database setup and migrations
   - Running locally
   - Production deployment (Vercel + Railway)
   - Backup and restore procedures

3. Create /docs/API_DOCUMENTATION.md:
   - All API endpoints
   - Request/response examples
   - Authentication
   - Error codes

4. Update root README.md with:
   - Project overview
   - Features list
   - Tech stack
   - Quick start guide
   - Links to detailed docs

Commit message: "docs: add comprehensive user and deployment guides"
```

**Expected Output:**
- ✅ User guide complete
- ✅ Deployment guide complete
- ✅ API documentation complete

---

### Step 1H.6: Performance Optimization

**Prompt:**
```
In the foundation worktree, run performance audit:

1. Frontend performance:
   - Run Lighthouse audit
   - Target: Performance score > 90
   - Optimize bundle size (code splitting)
   - Lazy load non-critical routes
   - Image optimization

2. Backend performance:
   - Add database query logging
   - Identify and optimize slow queries
   - Add connection pooling configuration
   - Enable response compression (gzip)

3. Verify BRD performance requirements:
   - Page load time < 2 seconds ✓
   - Patient search < 5 seconds ✓
   - Consultation record < 3 minutes ✓
   - Prescription generation < 10 seconds ✓

Commit message: "perf: optimize frontend bundle and backend queries"
```

**Verification Commands:**
```powershell
# Frontend Lighthouse audit
cd frontend
npm run build
npx lighthouse http://localhost:5173 --view

# Backend query logging
# Check console for query times
```

**Expected Output:**
- ✅ Lighthouse score > 90
- ✅ All performance targets met

---

### Step 1H.7: Security Audit

**Prompt:**
```
In the foundation worktree, conduct security audit:

1. Backend security:
   - npm audit (fix vulnerabilities)
   - Verify password hashing (bcrypt)
   - Verify JWT secret is strong
   - Add rate limiting (express-rate-limit)
   - Add request validation on all endpoints
   - Verify CORS configuration

2. Frontend security:
   - npm audit
   - Verify sensitive data not in localStorage
   - Check XSS vulnerabilities
   - Verify API token handling

3. Create /.env.example with all required environment variables

4. Add security headers (Helmet.js already configured)

Commit message: "security: audit and fix vulnerabilities"
```

**Verification Commands:**
```powershell
cd backend
npm audit
cd ../frontend
npm audit
```

**Expected Output:**
- ✅ No high/critical vulnerabilities
- ✅ Security best practices followed

---

### Step 1H.8: Deployment Configuration

**Prompt:**
```
In the foundation worktree, create deployment configuration:

1. Backend deployment (Railway):
   - Create railway.json
   - Configure PostgreSQL connection
   - Set environment variables
   - Configure health check endpoint

2. Frontend deployment (Vercel):
   - Create vercel.json
   - Configure build command
   - Set environment variables (API URL)
   - Configure redirects for SPA

3. Create deployment scripts:
   - /scripts/deploy-backend.sh
   - /scripts/deploy-frontend.sh

4. Test deployment to staging environment

Commit message: "deploy: add Vercel and Railway configuration"
```

---

### Step 1H.9: Final Testing & Launch Checklist

**Prompt:**
```
In the foundation worktree, execute final pre-launch checklist:

1. All BRD Requirements Verification:
   - [ ] Web-based access ✓
   - [ ] Patient registration and profile management ✓
   - [ ] Appointment scheduling and tracking ✓
   - [ ] Recording patient complaints (symptoms) ✓
   - [ ] Diagnosis documentation ✓
   - [ ] Medication and prescription management ✓
   - [ ] Printable prescriptions with header, footer ✓
   - [ ] Mandatory vitals capture (temperature, BP, pulse) ✓
   - [ ] Patient visit history tracking ✓
   - [ ] Basic search functionality ✓
   - [ ] Data export (CSV/PDF) ✓

2. All Success Criteria Verification:
   - [ ] Doctor can complete consultation record within 2–3 minutes ✓
   - [ ] Patient search and history retrieval within 2–5 seconds ✓
   - [ ] Smooth generation and printing of prescriptions ✓
   - [ ] Successful export of data in CSV/PDF format ✓
   - [ ] High usability with minimal training required ✓

3. Technical Verification:
   - [ ] All unit tests pass (135 tests)
   - [ ] All integration tests pass (64 tests)
   - [ ] All E2E tests pass (33 tests)
   - [ ] Code coverage > 80%
   - [ ] No TypeScript errors
   - [ ] No ESLint errors
   - [ ] Backend builds successfully
   - [ ] Frontend builds successfully
   - [ ] Database migrations run clean
   - [ ] CI/CD pipeline passes
   - [ ] Security audit clean
   - [ ] Performance targets met

4. Documentation Verification:
   - [ ] User guide complete
   - [ ] Deployment guide complete
   - [ ] API documentation complete
   - [ ] README updated

5. Deployment Verification:
   - [ ] Staging environment deployed
   - [ ] Manual testing on staging
   - [ ] Production environment configured
   - [ ] Backup and restore tested

Create final launch report with all verification results.

Commit message: "chore: final pre-launch verification complete"
```

**Verification Commands:**
```powershell
# Run all tests
cd backend && npm test && cd ..
cd frontend && npm test && cd ..
npx playwright test

# Run all builds
cd backend && npm run build && cd ..
cd frontend && npm run build && cd ..

# Check CI pipeline
# View GitHub Actions status
```

**Expected Output:**
- ✅ All checklists complete
- ✅ Application ready for production deployment

---

### Step 1H.10: Production Deployment

**Prompt:**
```
Execute production deployment:

1. Merge feature/testing-deployment to main

2. Deploy backend to Railway:
   - Connect Railway to GitHub repository
   - Configure PostgreSQL database
   - Run migrations: npx prisma migrate deploy
   - Set environment variables
   - Deploy backend service

3. Deploy frontend to Vercel:
   - Connect Vercel to GitHub repository
   - Configure build settings
   - Set environment variables (backend API URL)
   - Deploy frontend

4. Post-deployment verification:
   - Test all critical workflows on production
   - Verify SSL certificates
   - Test API connectivity
   - Monitor error logs

5. Create release tag: v1.0.0

6. Notify stakeholders: Production deployment complete!

Commit message: "deploy: launch v1.0.0 to production"
```

**Verification Commands:**
```powershell
# Test production URLs
# curl https://your-backend-url.railway.app/api/health
# Open https://your-frontend-url.vercel.app in browser
```

**Expected Output:**
- ✅ Backend deployed and healthy
- ✅ Frontend deployed and accessible
- ✅ All features working in production
- ✅ Application live!

---

## 🎉 Project Complete!

### Final Summary

**Deliverables Created:**
- ✅ ~85 files across backend, frontend, tests, config
- ✅ 5 database models
- ✅ 25+ API endpoints
- ✅ 232 tests (unit, integration, E2E)
- ✅ 8 feature phases completed
- ✅ Complete documentation
- ✅ CI/CD pipeline
- ✅ Production deployment

**BRD Requirements Met:**
- ✅ All functional requirements implemented
- ✅ All non-functional requirements met
- ✅ All success criteria achieved
- ✅ All performance targets met

**Next Steps:**
1. Monitor production for issues
2. Gather doctor feedback
3. Plan Phase 2 enhancements (multi-user, billing, etc.)
4. Iterate based on real-world usage

---

## Quick Command Reference

### Branch Management
```powershell
# List all branches
git branch -a

# Create new branch
git checkout -b feature/[name]

# Switch to branch
git checkout [branch-name]

# Delete branch (local)
git branch -d feature/[name]

# Delete branch (remote)
git push origin --delete feature/[name]
```

### Development Commands
```powershell
# Backend
cd backend
npm install
npm run dev           # Start development server
npm test              # Run tests
npm run build         # Build for production

# Frontend
cd frontend
npm install
npm run dev           # Start development server
npm test              # Run tests
npm run build         # Build for production
npx playwright test   # Run E2E tests
```

### Database Commands
```powershell
cd backend
npx prisma migrate dev           # Create and apply migration
npx prisma migrate deploy        # Apply migrations (production)
npx prisma generate              # Generate Prisma client
npx prisma studio                # Open Prisma Studio (GUI)
npx prisma db seed               # Seed database with test data
```

### Git Commands
```powershell
git status
git add .
git commit -m "feat(scope): message"
git push origin feature/[branch-name]
git rebase origin/main
```

---

## Notes for Implementation Agent

- **Execute prompts in order** - Dependencies exist between phases
- **Verify after each step** - Use verification commands
- **Don't skip testing** - Tests ensure quality
- **All development in foundation worktree** - No separate worktrees needed
- **Create feature branches** - One branch per feature phase
- **Follow Doc_Finishing_Guide.md** - For merge/PR procedures
- **Refer to Doc_Implementation.md** - For detailed code examples
- **Check Doc_Verification_Strategy.md** - For quality gates
- **Working directory**: `c:\Work\Copilot-AI\worktrees\foundation`

---

**END OF EXECUTION PROMPTS GUIDE**
