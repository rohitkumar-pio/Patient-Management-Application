# Gap Analysis Framework: Patient Management Application

**Document Type:** Requirements Compliance Audit Framework  
**Date:** May 7, 2026  
**Status:** Pre-Implementation Quality Gate Definition  
**Related:** Doc_BRD.md, Doc_Implementation_Plan.md, Doc_Verification_Strategy.md

---

## Executive Summary

This document establishes the **Gap Analysis Framework** for auditing the completed Patient Management Application against the original BRD requirements. It defines:

- **Requirements extraction** from BRD (functional + non-functional)
- **Evidence criteria** for each requirement
- **Scoring methodology** (95%+ required for approval)
- **Gap identification** and remediation routing
- **Audit checklist** for comprehensive review

**Purpose:** Serve as the final quality gate before merge/deployment. No feature passes without 95%+ BRD coverage.

---

## Gap Analysis Process

### Phase 1: Requirements Extraction
Extract every requirement statement from BRD and categorize.

### Phase 2: Implementation Audit
Review code, tests, and documentation for evidence of each requirement.

### Phase 3: Coverage Scoring
Calculate percentage met with transparency and evidence links.

### Phase 4: Gap Identification
For each unmet requirement, document specific gaps and remediation path.

### Phase 5: Decision Routing
- **≥95% coverage** → APPROVED for merge/deployment
- **<95% coverage** → LOOP BACK to Planning/Implementation with remediation checklist

---

## Requirements Matrix

### Total Requirements Breakdown

| Category | Total Requirements | Critical (P0) | Important (P1) | Nice-to-Have (P2) |
|----------|-------------------|---------------|----------------|-------------------|
| **Functional** | 47 | 35 | 10 | 2 |
| **Non-Functional** | 12 | 10 | 2 | 0 |
| **Success Criteria** | 6 | 6 | 0 | 0 |
| **TOTAL** | **65** | **51** | **12** | **2** |

**Pass Threshold:** 62/65 requirements met (95.4%)

---

## Functional Requirements Audit

### FR-1: Patient Management (10 Requirements)

#### FR-1.1: Add Patient
**Requirement:** System must allow adding new patient with required fields.

**Evidence Criteria:**
- ✓ API endpoint: `POST /api/patients`
- ✓ Request validation: name, age/DOB, gender, contact required
- ✓ UI form with all fields
- ✓ Success response with patient ID
- ✓ Database record created

**Test Coverage Required:**
- Unit test: Patient creation service
- Integration test: POST endpoint returns 201
- E2E test: Complete add patient flow

**Audit Checklist:**
- [ ] Endpoint exists and is functional
- [ ] All required fields validated
- [ ] Database constraint enforced
- [ ] UI form submits correctly
- [ ] Error handling for duplicates
- [ ] Tests present and passing

**Gap Identification:**
- **If missing API:** Backend gap → Implementation Agent
- **If missing UI:** Frontend gap → Implementation Agent
- **If no validation:** Security/quality gap → Implementation Agent

---

#### FR-1.2: Edit Patient
**Requirement:** System must allow editing existing patient details.

**Evidence Criteria:**
- ✓ API endpoint: `PUT /api/patients/:id`
- ✓ Update validation
- ✓ UI edit form pre-populated with current data
- ✓ Success confirmation

**Test Coverage Required:**
- Unit test: Patient update service
- Integration test: PUT endpoint returns 200
- E2E test: Edit and save patient

**Audit Checklist:**
- [ ] Endpoint exists
- [ ] Pre-population works
- [ ] Updates persist to database
- [ ] Tests passing

---

#### FR-1.3: View Patient Details
**Requirement:** System must display complete patient profile.

**Evidence Criteria:**
- ✓ API endpoint: `GET /api/patients/:id`
- ✓ UI patient detail page
- ✓ All fields displayed

**Test Coverage Required:**
- Integration test: GET returns patient data
- E2E test: Navigate to patient detail view

**Audit Checklist:**
- [ ] Endpoint returns complete data
- [ ] UI displays all fields correctly
- [ ] Tests passing

---

#### FR-1.4: Capture Name
**Requirement:** System must capture patient name.

**Evidence Criteria:**
- ✓ Database field: `patients.name` (VARCHAR, NOT NULL)
- ✓ API validation: name required
- ✓ UI input field with label

**Audit Checklist:**
- [ ] Database column exists
- [ ] Validation prevents empty name
- [ ] UI field present

---

#### FR-1.5: Capture Age/DOB
**Requirement:** System must capture age OR date of birth.

**Evidence Criteria:**
- ✓ Database field: `patients.dateOfBirth` (DATE) OR `patients.age` (INT)
- ✓ UI input for DOB or age
- ✓ Age derived from DOB if provided

**Audit Checklist:**
- [ ] Database field(s) exist
- [ ] UI captures DOB or age
- [ ] Validation ensures valid dates

---

#### FR-1.6: Capture Gender
**Requirement:** System must capture patient gender.

**Evidence Criteria:**
- ✓ Database field: `patients.gender` (ENUM or VARCHAR)
- ✓ UI dropdown/radio buttons

**Audit Checklist:**
- [ ] Database field exists
- [ ] UI captures gender

---

#### FR-1.7: Capture Contact Details
**Requirement:** System must capture patient contact information.

**Evidence Criteria:**
- ✓ Database field: `patients.phone` (VARCHAR)
- ✓ Optional: `patients.email`
- ✓ UI input fields

**Audit Checklist:**
- [ ] Database field for phone exists
- [ ] UI captures phone number
- [ ] Phone validation (format)

---

#### FR-1.8: Search by Name
**Requirement:** System must allow searching patients by name.

**Evidence Criteria:**
- ✓ API endpoint: `GET /api/patients?search=name`
- ✓ Database query with LIKE or full-text search
- ✓ UI search input
- ✓ Results displayed

**Test Coverage Required:**
- Integration test: Search returns matching patients
- E2E test: Type name and see results

**Audit Checklist:**
- [ ] Search endpoint functional
- [ ] Partial name matching works
- [ ] Case-insensitive search
- [ ] UI displays results correctly
- [ ] Tests passing

---

#### FR-1.9: Search by Phone Number
**Requirement:** System must allow searching patients by phone number.

**Evidence Criteria:**
- ✓ API endpoint: `GET /api/patients?phone=number`
- ✓ Database query by phone
- ✓ UI search supports phone input

**Test Coverage Required:**
- Integration test: Search by phone returns patient
- E2E test: Search by phone flow

**Audit Checklist:**
- [ ] Search by phone functional
- [ ] Partial phone matching works
- [ ] Tests passing

---

#### FR-1.10: Patient List View
**Requirement:** System must display list of all patients.

**Evidence Criteria:**
- ✓ API endpoint: `GET /api/patients?limit=50&offset=0`
- ✓ UI patient list page
- ✓ Pagination or infinite scroll

**Audit Checklist:**
- [ ] List endpoint functional
- [ ] UI displays patient list
- [ ] Pagination implemented

---

### FR-2: Appointment Management (8 Requirements)

#### FR-2.1: Schedule Appointment
**Requirement:** Doctor can schedule appointments for patients.

**Evidence Criteria:**
- ✓ API endpoint: `POST /api/appointments`
- ✓ Request body: patientId, date, time (optional), status
- ✓ UI form to create appointment
- ✓ Patient selection dropdown

**Test Coverage Required:**
- Unit test: Appointment creation service
- Integration test: POST creates appointment
- E2E test: Schedule appointment for patient

**Audit Checklist:**
- [ ] Endpoint exists and functional
- [ ] UI form present
- [ ] Patient can be selected
- [ ] Appointment saves to database
- [ ] Tests passing

---

#### FR-2.2: View Daily Appointment List
**Requirement:** System displays all appointments for a specific day.

**Evidence Criteria:**
- ✓ API endpoint: `GET /api/appointments?date=YYYY-MM-DD`
- ✓ UI daily calendar/list view
- ✓ Date navigation (prev/next day)

**Test Coverage Required:**
- Integration test: GET returns appointments for date
- E2E test: View today's appointments

**Audit Checklist:**
- [ ] Endpoint filters by date correctly
- [ ] UI displays daily appointments
- [ ] Date navigation works
- [ ] Tests passing

---

#### FR-2.3: Update Status - Scheduled
**Requirement:** Appointment can be marked as "Scheduled".

**Evidence Criteria:**
- ✓ Database field: `appointments.status` (ENUM includes 'SCHEDULED')
- ✓ API endpoint: `PATCH /api/appointments/:id/status`
- ✓ UI button/dropdown to change status

**Audit Checklist:**
- [ ] Status enum includes SCHEDULED
- [ ] API updates status
- [ ] UI allows status change

---

#### FR-2.4: Update Status - Completed
**Requirement:** Appointment can be marked as "Completed".

**Evidence Criteria:**
- ✓ ENUM includes 'COMPLETED'
- ✓ UI button to mark completed

**Audit Checklist:**
- [ ] Status updates to COMPLETED
- [ ] UI reflects change

---

#### FR-2.5: Update Status - Cancelled
**Requirement:** Appointment can be marked as "Cancelled".

**Evidence Criteria:**
- ✓ ENUM includes 'CANCELLED'
- ✓ UI button to cancel

**Audit Checklist:**
- [ ] Status updates to CANCELLED
- [ ] UI reflects change

---

#### FR-2.6: Update Status - No-show
**Requirement:** Appointment can be marked as "No-show".

**Evidence Criteria:**
- ✓ ENUM includes 'NO_SHOW'
- ✓ UI button to mark no-show

**Audit Checklist:**
- [ ] Status updates to NO_SHOW
- [ ] UI reflects change

---

#### FR-2.7: Appointment Entity
**Requirement:** System persists appointment data.

**Evidence Criteria:**
- ✓ Database table: `appointments`
- ✓ Fields: id, patientId, date, time (optional), status, createdAt

**Audit Checklist:**
- [ ] Table exists in schema
- [ ] Foreign key to patients table
- [ ] All status values supported

---

#### FR-2.8: Today's Queue
**Requirement:** Quick access to today's appointments (dashboard widget).

**Evidence Criteria:**
- ✓ UI dashboard component showing today's list
- ✓ Default date filter = today

**Audit Checklist:**
- [ ] Dashboard displays today's appointments
- [ ] Auto-filters to current date

---

### FR-3: Consultation Workflow (14 Requirements)

#### FR-3.1: Record Visit
**Requirement:** System allows creating a new visit record for a patient.

**Evidence Criteria:**
- ✓ API endpoint: `POST /api/visits`
- ✓ Request body: patientId, date, vitals, complaints, diagnosis, medications
- ✓ UI visit form page
- ✓ Form accessible from patient profile

**Test Coverage Required:**
- Unit test: Visit creation service
- Integration test: POST creates visit with all data
- E2E test: Complete consultation workflow

**Audit Checklist:**
- [ ] Endpoint creates visit
- [ ] UI form accessible
- [ ] All sections (vitals, complaints, etc.) present
- [ ] Tests passing

---

#### FR-3.2: Mandatory Temperature
**Requirement:** Every consultation must capture temperature.

**Evidence Criteria:**
- ✓ Database field: `visits.temperature` (DECIMAL, NOT NULL)
- ✓ API validation: temperature required
- ✓ UI input field marked as required
- ✓ Validation error if missing

**Test Coverage Required:**
- Integration test: POST visit without temperature returns 400
- E2E test: Form blocks submission without temperature

**Audit Checklist:**
- [ ] Database column NOT NULL
- [ ] API rejects visit without temperature
- [ ] UI field marked required
- [ ] Validation error displayed
- [ ] Tests passing

---

#### FR-3.3: Mandatory Blood Pressure
**Requirement:** Every consultation must capture blood pressure.

**Evidence Criteria:**
- ✓ Database fields: `visits.bloodPressureSystolic`, `visits.bloodPressureDiastolic` (INT, NOT NULL)
- ✓ API validation: BP required
- ✓ UI input fields (systolic/diastolic)

**Test Coverage Required:**
- Integration test: POST visit without BP returns 400
- E2E test: Form requires BP values

**Audit Checklist:**
- [ ] Database columns NOT NULL
- [ ] API validates BP presence
- [ ] UI has two BP input fields
- [ ] Tests passing

---

#### FR-3.4: Mandatory Pulse
**Requirement:** Every consultation must capture pulse.

**Evidence Criteria:**
- ✓ Database field: `visits.pulse` (INT, NOT NULL)
- ✓ API validation: pulse required
- ✓ UI input field

**Test Coverage Required:**
- Integration test: POST without pulse returns 400
- E2E test: Form requires pulse

**Audit Checklist:**
- [ ] Database column NOT NULL
- [ ] API validates pulse presence
- [ ] UI field required
- [ ] Tests passing

---

#### FR-3.5: Enter Complaints (Free Text)
**Requirement:** Doctor can enter patient symptoms as free text.

**Evidence Criteria:**
- ✓ Database field: `visits.complaints` (TEXT, nullable)
- ✓ UI textarea for complaints
- ✓ No length restriction (or reasonable limit like 5000 chars)

**Audit Checklist:**
- [ ] Database field exists
- [ ] UI textarea present
- [ ] Text saves correctly

---

#### FR-3.6: Record Diagnosis
**Requirement:** Doctor can record diagnosis notes.

**Evidence Criteria:**
- ✓ Database field: `visits.diagnosis` (TEXT, nullable)
- ✓ UI textarea for diagnosis

**Audit Checklist:**
- [ ] Database field exists
- [ ] UI textarea present
- [ ] Text saves correctly

---

#### FR-3.7: Add Medicine - Name
**Requirement:** System captures medicine name.

**Evidence Criteria:**
- ✓ Database table: `medications`
- ✓ Field: `medications.name` (VARCHAR, NOT NULL)
- ✓ UI input for medicine name

**Audit Checklist:**
- [ ] Medications table exists
- [ ] Name field required
- [ ] UI captures name

---

#### FR-3.8: Add Medicine - Dosage
**Requirement:** System captures medicine dosage.

**Evidence Criteria:**
- ✓ Field: `medications.dosage` (VARCHAR)
- ✓ UI input for dosage (e.g., "500mg")

**Audit Checklist:**
- [ ] Field exists
- [ ] UI captures dosage

---

#### FR-3.9: Add Medicine - Frequency
**Requirement:** System captures medicine frequency.

**Evidence Criteria:**
- ✓ Field: `medications.frequency` (VARCHAR)
- ✓ UI input (e.g., "Twice daily")

**Audit Checklist:**
- [ ] Field exists
- [ ] UI captures frequency

---

#### FR-3.10: Add Medicine - Duration
**Requirement:** System captures medicine duration.

**Evidence Criteria:**
- ✓ Field: `medications.duration` (VARCHAR)
- ✓ UI input (e.g., "7 days")

**Audit Checklist:**
- [ ] Field exists
- [ ] UI captures duration

---

#### FR-3.11: Add Medicine - Instructions
**Requirement:** System captures medicine instructions.

**Evidence Criteria:**
- ✓ Field: `medications.instructions` (TEXT)
- ✓ UI textarea (e.g., "Take after meals")

**Audit Checklist:**
- [ ] Field exists
- [ ] UI captures instructions

---

#### FR-3.12: Visit-Medication Relationship
**Requirement:** Medications are linked to visits.

**Evidence Criteria:**
- ✓ Foreign key: `medications.visitId` references `visits.id`
- ✓ API returns medications with visit
- ✓ UI displays medications on visit detail

**Audit Checklist:**
- [ ] Foreign key exists
- [ ] Cascade delete on visit removal
- [ ] API includes medications

---

#### FR-3.13: Multiple Medications per Visit
**Requirement:** One visit can have multiple medications.

**Evidence Criteria:**
- ✓ One-to-many relationship in database
- ✓ API accepts array of medications
- ✓ UI allows adding/removing medications dynamically

**Test Coverage Required:**
- Integration test: POST visit with 3 medications
- E2E test: Add multiple medications to visit

**Audit Checklist:**
- [ ] Relationship allows multiple medications
- [ ] UI has add/remove buttons
- [ ] Tests passing

---

#### FR-3.14: Visit Associated with Patient
**Requirement:** Every visit belongs to a patient.

**Evidence Criteria:**
- ✓ Foreign key: `visits.patientId` references `patients.id`
- ✓ API requires patientId in request

**Audit Checklist:**
- [ ] Foreign key exists
- [ ] API validates patientId
- [ ] Cannot create orphaned visit

---

### FR-4: Prescription Printing (7 Requirements)

#### FR-4.1: Generate Printable Prescription
**Requirement:** System generates printable prescription from visit data.

**Evidence Criteria:**
- ✓ API endpoint: `GET /api/visits/:id/prescription` (returns PDF or HTML)
- ✓ PDF generation library integrated (PDFKit, jsPDF)
- ✓ UI button "Print Prescription"

**Test Coverage Required:**
- Integration test: GET prescription returns PDF/HTML
- E2E test: Click print button, prescription generated

**Audit Checklist:**
- [ ] Endpoint exists
- [ ] PDF/HTML generated successfully
- [ ] UI button functional
- [ ] Tests passing

---

#### FR-4.2: Prescription - Clinic/Doctor Header
**Requirement:** Prescription includes clinic and doctor information.

**Evidence Criteria:**
- ✓ Template includes: Clinic name, address, doctor name, credentials, contact
- ✓ Header configured in settings or template file

**Audit Checklist:**
- [ ] Header appears on prescription
- [ ] All required info displayed
- [ ] Professional formatting

---

#### FR-4.3: Prescription - Patient Details
**Requirement:** Prescription includes patient information.

**Evidence Criteria:**
- ✓ Template includes: Patient name, age, gender, contact
- ✓ Data pulled from patient record

**Audit Checklist:**
- [ ] Patient data appears correctly
- [ ] No missing fields

---

#### FR-4.4: Prescription - Vitals
**Requirement:** Prescription includes vitals from visit.

**Evidence Criteria:**
- ✓ Template includes: Temperature, BP, Pulse
- ✓ Data pulled from visit record

**Audit Checklist:**
- [ ] Vitals displayed on prescription
- [ ] Correct formatting (e.g., BP as 120/80)

---

#### FR-4.5: Prescription - Diagnosis
**Requirement:** Prescription includes diagnosis notes.

**Evidence Criteria:**
- ✓ Template includes diagnosis section
- ✓ Text from visit.diagnosis displayed

**Audit Checklist:**
- [ ] Diagnosis appears on prescription
- [ ] Text wraps correctly if long

---

#### FR-4.6: Prescription - Medications
**Requirement:** Prescription lists all medications with details.

**Evidence Criteria:**
- ✓ Template includes medications table
- ✓ Each medication shows: name, dosage, frequency, duration, instructions

**Audit Checklist:**
- [ ] All medications from visit displayed
- [ ] All fields (dosage, frequency, etc.) shown
- [ ] Readable table format

---

#### FR-4.7: Prescription - Footer
**Requirement:** Prescription includes footer with signature area.

**Evidence Criteria:**
- ✓ Template includes footer section
- ✓ Space for signature, date, stamp

**Audit Checklist:**
- [ ] Footer exists on prescription
- [ ] Signature area present

---

### FR-5: Patient History (5 Requirements)

#### FR-5.1: View Previous Visits
**Requirement:** System displays list of all past visits for a patient.

**Evidence Criteria:**
- ✓ API endpoint: `GET /api/patients/:id/visits`
- ✓ UI patient history page
- ✓ List or timeline view

**Test Coverage Required:**
- Integration test: GET returns all visits for patient
- E2E test: Navigate to history page, see visits

**Audit Checklist:**
- [ ] Endpoint returns visits ordered by date (newest first)
- [ ] UI displays history page
- [ ] Tests passing

---

#### FR-5.2: Access Visit Vitals
**Requirement:** History shows vitals from each visit.

**Evidence Criteria:**
- ✓ API includes vitals in visit data
- ✓ UI displays temperature, BP, pulse per visit

**Audit Checklist:**
- [ ] Vitals visible in history
- [ ] Correct data shown

---

#### FR-5.3: Access Visit Complaints
**Requirement:** History shows complaints from each visit.

**Evidence Criteria:**
- ✓ API includes complaints
- ✓ UI displays complaints (truncated or full)

**Audit Checklist:**
- [ ] Complaints visible in history

---

#### FR-5.4: Access Visit Diagnosis
**Requirement:** History shows diagnosis from each visit.

**Evidence Criteria:**
- ✓ API includes diagnosis
- ✓ UI displays diagnosis

**Audit Checklist:**
- [ ] Diagnosis visible in history

---

#### FR-5.5: Access Visit Prescriptions
**Requirement:** History shows medications prescribed in each visit.

**Evidence Criteria:**
- ✓ API includes medications array
- ✓ UI displays medications per visit

**Audit Checklist:**
- [ ] Medications visible in history
- [ ] All medication details shown

---

#### FR-5.6: Filter by Date
**Requirement:** Doctor can filter visit history by date range.

**Evidence Criteria:**
- ✓ API supports query params: `GET /api/patients/:id/visits?startDate=X&endDate=Y`
- ✓ UI date range picker

**Test Coverage Required:**
- Integration test: Date filter returns correct visits
- E2E test: Select date range, see filtered results

**Audit Checklist:**
- [ ] Date filter functional
- [ ] UI has date range picker
- [ ] Results filtered correctly
- [ ] Tests passing

---

### FR-6: Search & Navigation (3 Requirements)

#### FR-6.1: Quick Patient Search
**Requirement:** Fast search accessible from any page.

**Evidence Criteria:**
- ✓ UI search bar in header/navigation
- ✓ Search as user types (debounced)
- ✓ Dropdown with results

**Test Coverage Required:**
- E2E test: Type in search, see results dropdown

**Audit Checklist:**
- [ ] Search bar visible globally
- [ ] Debouncing implemented (300-500ms)
- [ ] Results appear quickly
- [ ] Tests passing

---

#### FR-6.2: View Recent Patients
**Requirement:** System shows recently accessed/viewed patients.

**Evidence Criteria:**
- ✓ API endpoint: `GET /api/patients/recent` (last 5-10 patients)
- ✓ UI dashboard widget or sidebar

**Audit Checklist:**
- [ ] Recent patients list functional
- [ ] Updates when patient viewed
- [ ] UI displays recent list

---

#### FR-6.3: Easy Navigation
**Requirement:** Seamless navigation between patient profile and visits.

**Evidence Criteria:**
- ✓ Patient profile has button "New Visit"
- ✓ Patient profile has link to "View History"
- ✓ Visit detail page links back to patient profile

**Audit Checklist:**
- [ ] Navigation buttons/links present
- [ ] Smooth transitions
- [ ] No dead ends (always way back)

---

### FR-7: Data Export (2 Requirements)

#### FR-7.1: Export as CSV
**Requirement:** System exports patient or visit data as CSV.

**Evidence Criteria:**
- ✓ API endpoint: `GET /api/export/patients?format=csv`
- ✓ API endpoint: `GET /api/export/visits?format=csv`
- ✓ CSV generation library (csv-writer, papaparse)
- ✓ UI export dialog with CSV option

**Test Coverage Required:**
- Integration test: CSV export returns valid CSV format
- E2E test: Click export, CSV downloads

**Audit Checklist:**
- [ ] CSV export endpoint functional
- [ ] File downloads correctly
- [ ] All fields included in CSV
- [ ] Tests passing

---

#### FR-7.2: Export as PDF
**Requirement:** System exports patient or visit data as PDF.

**Evidence Criteria:**
- ✓ API endpoint: `GET /api/export/patients?format=pdf`
- ✓ API endpoint: `GET /api/export/visits?format=pdf`
- ✓ PDF generation library
- ✓ UI export dialog with PDF option

**Test Coverage Required:**
- Integration test: PDF export returns valid PDF
- E2E test: Click export, PDF downloads

**Audit Checklist:**
- [ ] PDF export endpoint functional
- [ ] File downloads correctly
- [ ] PDF readable and formatted
- [ ] Tests passing

---

## Non-Functional Requirements Audit

### NFR-1: Usability (2 Requirements)

#### NFR-1.1: Simple, Minimal UI
**Requirement:** UI optimized for fast data entry during consultations.

**Evidence Criteria:**
- ✓ Clean, uncluttered interface
- ✓ No unnecessary popups or confirmations
- ✓ Keyboard shortcuts for common actions (optional)
- ✓ Tab navigation works logically

**Audit Method:**
- Manual UX review
- User testing feedback (if available)
- Consultation time measurement

**Audit Checklist:**
- [ ] UI is intuitive
- [ ] No design bloat
- [ ] Fast data entry confirmed

---

#### NFR-1.2: Minimal Training Required
**Requirement:** High usability without extensive training.

**Evidence Criteria:**
- ✓ Clear labels and instructions
- ✓ Tooltips or help text where needed
- ✓ Consistent design patterns
- ✓ User documentation available

**Audit Checklist:**
- [ ] UI is self-explanatory
- [ ] Documentation provided

---

### NFR-2: Performance (3 Requirements)

#### NFR-2.1: Page Load Time < 2 Seconds
**Requirement:** All pages load within 2 seconds.

**Evidence Criteria:**
- ✓ Lighthouse performance score >85
- ✓ Manual timing tests confirm <2s load
- ✓ Bundle size optimized (code splitting, lazy loading)

**Test Coverage Required:**
- Performance test: Measure load time for each major page
- Lighthouse audit in CI pipeline

**Audit Checklist:**
- [ ] Dashboard loads <2s
- [ ] Patient list loads <2s
- [ ] Visit form loads <2s
- [ ] Lighthouse score >85
- [ ] Tests passing

**Gap Identification:**
- If >2s: Performance optimization needed → Implementation Agent (code splitting, caching)

---

#### NFR-2.2: Fast Patient Search
**Requirement:** Patient search returns results quickly.

**Evidence Criteria:**
- ✓ Search response time <500ms for typical dataset
- ✓ Database indexing on name and phone columns
- ✓ Debouncing to reduce redundant queries

**Test Coverage Required:**
- Performance test: Measure search query time
- Load test: 1000 patients in database, search still <500ms

**Audit Checklist:**
- [ ] Database indexes exist on `patients.name`, `patients.phone`
- [ ] Search response <500ms
- [ ] Tests passing

**Gap Identification:**
- If slow: Database optimization gap → Implementation Agent (add indexes, full-text search)

---

#### NFR-2.3: Fast History Retrieval
**Requirement:** Patient history retrieval within 2-5 seconds.

**Evidence Criteria:**
- ✓ History API response time <5s even with 50+ visits
- ✓ Database query optimized (joins, indexes)
- ✓ Pagination or lazy loading if needed

**Test Coverage Required:**
- Performance test: Patient with 100 visits, history loads <5s

**Audit Checklist:**
- [ ] History loads <5s
- [ ] Query optimized
- [ ] Tests passing

---

### NFR-3: Reliability (2 Requirements)

#### NFR-3.1: No Data Loss
**Requirement:** System prevents data loss through robust error handling.

**Evidence Criteria:**
- ✓ Database transactions for critical operations
- ✓ Error handling in API (try-catch blocks)
- ✓ Frontend error boundaries
- ✓ Auto-save for long forms (optional but recommended)

**Test Coverage Required:**
- Unit test: Database rollback on error
- Integration test: Failed API calls don't corrupt data
- E2E test: Network error doesn't lose form data

**Audit Checklist:**
- [ ] Transactions implemented for visit creation
- [ ] Error handling comprehensive
- [ ] Auto-save present (or explicit save confirmation)
- [ ] Tests passing

**Gap Identification:**
- If transactions missing: Data integrity gap → Implementation Agent (add transactions)

---

#### NFR-3.2: Regular Automated Backups
**Requirement:** Database backed up automatically and regularly.

**Evidence Criteria:**
- ✓ Backup script or service configured
- ✓ Daily backups (or more frequent)
- ✓ Backup verification (restore test)
- ✓ Documentation on restore procedure

**Audit Checklist:**
- [ ] Backup mechanism exists
- [ ] Backup frequency defined
- [ ] Restore procedure documented

**Gap Identification:**
- If no backups: Critical deployment gap → Deployment configuration needed

---

### NFR-4: Security (3 Requirements)

#### NFR-4.1: Secure Login
**Requirement:** Single user authentication with secure credentials.

**Evidence Criteria:**
- ✓ Password hashing (bcrypt or Argon2)
- ✓ JWT token-based authentication
- ✓ Login endpoint with validation
- ✓ Protected routes (API middleware checks token)

**Test Coverage Required:**
- Integration test: Login with correct credentials returns token
- Integration test: Login with wrong credentials returns 401
- Integration test: Protected endpoint rejects unauthenticated request

**Audit Checklist:**
- [ ] Passwords hashed (not stored plaintext)
- [ ] JWT auth implemented
- [ ] Protected routes enforce auth
- [ ] Tests passing

**Gap Identification:**
- If no auth: Critical security gap → BLOCK until implemented

---

#### NFR-4.2: Data Encryption at Rest
**Requirement:** Sensitive data encrypted in database.

**Evidence Criteria:**
- ✓ Database encryption enabled (PostgreSQL TDE or encrypted volume)
- ✓ Or application-level encryption for sensitive fields

**Audit Checklist:**
- [ ] Database encryption configured
- [ ] Or sensitive fields encrypted

**Gap Identification:**
- If no encryption: Security/compliance gap → Deployment configuration needed

---

#### NFR-4.3: Data Encryption in Transit
**Requirement:** All API communications encrypted with HTTPS.

**Evidence Criteria:**
- ✓ HTTPS/TLS certificate installed
- ✓ Frontend calls API over HTTPS
- ✓ HTTP redirects to HTTPS

**Audit Checklist:**
- [ ] Production uses HTTPS
- [ ] SSL certificate valid
- [ ] No mixed content errors

**Gap Identification:**
- If no HTTPS: Critical security gap → Deployment configuration needed

---

### NFR-5: Scalability (1 Requirement)

#### NFR-5.1: Single Clinic Support
**Requirement:** System handles moderate patient volume for single clinic.

**Evidence Criteria:**
- ✓ Database can handle 1000-5000 patients
- ✓ Performance tests confirm acceptable speed at scale

**Test Coverage Required:**
- Load test: Seed database with 2000 patients, 10,000 visits
- Performance test: Verify search, history still performant

**Audit Checklist:**
- [ ] Load testing completed
- [ ] System performs well at expected scale

---

### NFR-6: Compatibility (1 Requirement)

#### NFR-6.1: Modern Browser Support
**Requirement:** Works on Chrome, Edge, Safari latest versions.

**Evidence Criteria:**
- ✓ Manual testing on Chrome, Edge, Safari
- ✓ No browser-specific errors
- ✓ Polyfills for ES6+ features if needed

**Test Coverage Required:**
- E2E tests run on multiple browsers (Playwright multi-browser)

**Audit Checklist:**
- [ ] Chrome tested and working
- [ ] Edge tested and working
- [ ] Safari tested and working (macOS)
- [ ] No console errors specific to browsers

---

## Success Criteria Audit

### SC-1: Consultation Record Within 2-3 Minutes
**Requirement:** Doctor can complete a consultation record in 2-3 minutes.

**Evidence Criteria:**
- ✓ Timed E2E test: Complete workflow from patient selection to save
- ✓ Manual user testing confirms timing

**Test Coverage Required:**
- E2E performance test: Full consultation workflow timed

**Audit Checklist:**
- [ ] E2E test completes workflow in <3 minutes (automated)
- [ ] Manual testing confirms timing

**Gap Identification:**
- If >3 minutes: UX optimization gap → Review form complexity, auto-save, reduce clicks

---

### SC-2: Patient Search Within 2-5 Seconds
**Requirement:** Patient search and history retrieval within 2-5 seconds.

**Evidence Criteria:**
- ✓ Performance test confirms <5s
- ✓ Database optimized (indexes)

**Audit Checklist:**
- [ ] Search test <5s
- [ ] History test <5s

---

### SC-3: 80% Reduction in Paper Usage
**Requirement:** Achieve 80% reduction in paper usage.

**Evidence Criteria:**
- ✓ All features functional (eliminates most paper)
- ✓ Digital prescriptions replace handwritten

**Audit Method:**
- Qualitative assessment (all digital workflows present)

**Audit Checklist:**
- [ ] All workflows digital (no paper forms needed)

---

### SC-4: Smooth Prescription Generation
**Requirement:** Smooth generation and printing of prescriptions.

**Evidence Criteria:**
- ✓ Prescription generates without errors
- ✓ Print dialog opens correctly
- ✓ PDF format is professional

**Test Coverage Required:**
- E2E test: Generate and print prescription

**Audit Checklist:**
- [ ] Prescription generation <10s
- [ ] Print dialog opens
- [ ] PDF is formatted correctly
- [ ] Tests passing

---

### SC-5: Data Export Success
**Requirement:** Successful export of data in CSV/PDF format.

**Evidence Criteria:**
- ✓ CSV export works
- ✓ PDF export works
- ✓ Files open correctly

**Test Coverage Required:**
- E2E test: Export CSV and PDF, verify file download

**Audit Checklist:**
- [ ] CSV export functional
- [ ] PDF export functional
- [ ] Files valid format
- [ ] Tests passing

---

### SC-6: High Usability
**Requirement:** High usability with minimal training required.

**Evidence Criteria:**
- ✓ UI is intuitive
- ✓ Documentation provided
- ✓ User feedback positive (if available)

**Audit Method:**
- Manual UX review
- User testing feedback

**Audit Checklist:**
- [ ] UI intuitive
- [ ] Documentation complete

---

## Coverage Scoring Methodology

### Requirements Categories

| Category | Weight | Total Req | Points Each | Max Score |
|----------|--------|-----------|-------------|-----------|
| Functional (Critical) | 50% | 35 | 1.43 | 50 |
| Functional (Important) | 20% | 10 | 2.0 | 20 |
| Functional (Nice-to-Have) | 5% | 2 | 2.5 | 5 |
| Non-Functional | 15% | 12 | 1.25 | 15 |
| Success Criteria | 10% | 6 | 1.67 | 10 |
| **TOTAL** | **100%** | **65** | - | **100** |

### Scoring Rules

**Fully Met (100%):**
- All evidence criteria present
- All tests passing
- Code implemented and working

**Partially Met (50%):**
- Some evidence criteria present
-Implementation incomplete or tests failing
- Core functionality exists but missing validation/tests

**Not Met (0%):**
- No evidence found
- Feature missing entirely
- Tests not implemented

### Pass Threshold

**✅ APPROVED:** ≥95 points (62/65 requirements met)  
**❌ LOOP BACK:** <95 points

### Example Calculation

If audit finds:
- **Functional (Critical):** 33/35 met = 94.3% of 50 = 47.1 points
- **Functional (Important):** 10/10 met = 100% of 20 = 20 points
- **Functional (Nice-to-Have):** 1/2 met = 50% of 5 = 2.5 points
- **Non-Functional:** 11/12 met = 91.7% of 15 = 13.8 points
- **Success Criteria:** 6/6 met = 100% of 10 = 10 points

**Total Score:** 93.4/100 → **LOOP BACK** (below 95)

---

## Gap Identification Template

For each unmet requirement:

### Gap Report Entry

**Requirement ID:** [e.g., FR-3.2]  
**Requirement:** [e.g., Mandatory Temperature Capture]

**Expected:** [What BRD specifies]  
- Database field `temperature` NOT NULL
- API validation rejects visits without temperature
- UI field marked required

**Delivered:** [What was found in implementation]  
- Database field exists but nullable
- API accepts visits without temperature
- UI field not marked required

**Gap:** [Specific shortfall]  
- Database constraint missing (allows NULL)
- API validation missing (400 error not returned)
- UI validation missing (form submits without temperature)

**Impact:** [Severity]  
- 🔴 Critical: Data integrity issue, violates mandatory requirement
- 🟡 Important: Affects usability but not blocking
- 🟢 Minor: Nice-to-have, low impact

**Remediation:** [Action needed]  
- **Agent:** Implementation Agent
- **Task:** Add NOT NULL constraint, API validation, UI required attribute
- **Estimated Effort:** Small (1-2 hours)
- **Files to Change:**
  - `prisma/schema.prisma` (add NOT NULL)
  - `backend/src/validators/visitValidator.ts` (add temperature check)
  - `frontend/src/pages/NewVisit/index.tsx` (add required prop)
- **Tests to Add:**
  - Integration test: `POST /api/visits` without temperature returns 400
  - E2E test: Form blocks submission without temperature

---

## Remediation Routing Logic

Based on gap type, route to appropriate agent:

### Implementation Agent
**Triggers:**
- Missing features/endpoints
- Incomplete UI components
- Missing validations
- Missing tests
- Small to medium code gaps

**Examples:**
- API endpoint not implemented
- Form field missing
- Validation logic absent
- Tests not written

---

### Planning Agent
**Triggers:**
- Architectural issues
- Design changes needed
- Large refactoring required
- Multiple dependent gaps

**Examples:**
- Database schema redesign needed
- Major UI restructuring required
- Performance architecture changes

---

### Brain-Storming Agent
**Triggers:**
- Requirements ambiguity
- Scope clarification needed
- Conflicting requirements
- Missing specifications

**Examples:**
- BRD unclear on specific behavior
- Edge cases not defined
- Technical approach needs discussion

---

### Verification Agent (Re-audit)
**Triggers:**
- After all gaps remediated
- Re-run audit to confirm 95%+ coverage

---

## Audit Execution Checklist

### Pre-Audit (Before Running Gap Analysis)

- [ ] Implementation phase complete (all features claimed done)
- [ ] All PRs merged to main branch
- [ ] CI/CD pipeline passing
- [ ] Deployment to staging environment successful
- [ ] Code freeze in place (no new changes during audit)

### Audit Process

- [ ] **Day 1-2:** Extract requirements from BRD (use this document)
- [ ] **Day 3-4:** Review codebase for functional requirements evidence
- [ ] **Day 5:** Review non-functional requirements and success criteria
- [ ] **Day 6:** Run all tests (unit, integration, E2E)
- [ ] **Day 7:** Manual testing and UX review
- [ ] **Day 8:** Calculate coverage score
- [ ] **Day 9:** Document gaps with remediation plans
- [ ] **Day 10:** Generate final audit report

### Post-Audit

**If ≥95% Coverage:**
- [ ] Issue **APPROVED** decision
- [ ] Clear for merge to production
- [ ] Proceed to deployment

**If <95% Coverage:**
- [ ] Issue **LOOP BACK** decision
- [ ] Create remediation tickets for each gap
- [ ] Route tickets to appropriate agents
- [ ] Set deadline for gap closure
- [ ] Schedule re-audit after remediation

---

## Audit Report Template

```markdown
# Gap Analysis Audit Report
**Project:** Patient Management Application  
**Audit Date:** [Date]  
**Auditor:** Gap Analysis Agent  
**BRD Version:** 1.0  

---

## Executive Summary

**Overall Score:** XX/100  
**Status:** ✅ APPROVED | ❌ LOOP BACK  
**Requirements Coverage:** XX/65 met (XX%)  

---

## Coverage Summary

| Category | Requirements | Met | Partial | Unmet | Score | Status |
|----------|--------------|-----|---------|-------|-------|--------|
| Functional (Critical) | 35 | XX | XX | XX | XX/50 | ✅/❌ |
| Functional (Important) | 10 | XX | XX | XX | XX/20 | ✅/❌ |
| Functional (Nice-to-Have) | 2 | XX | XX | XX | XX/5 | ✅/❌ |
| Non-Functional | 12 | XX | XX | XX | XX/15 | ✅/❌ |
| Success Criteria | 6 | XX | XX | XX | XX/10 | ✅/❌ |
| **TOTAL** | **65** | **XX** | **XX** | **XX** | **XX/100** | **✅/❌** |

---

## Met Requirements (with Evidence)

### FR-1.1: Add Patient ✅
- **Implementation:** `POST /api/patients` at [backend/src/routes/patients.ts#L23](link)
- **Tests:** Integration test passing at [backend/tests/integration/patients.test.ts#L45](link)
- **UI:** Add patient form at [frontend/src/pages/Patients/AddPatient.tsx](link)
- **Evidence:** Code reviewed, tests passing, manual testing confirmed

[Repeat for all met requirements]

---

## Unmet / Partial Requirements

### FR-3.2: Mandatory Temperature Capture ❌ CRITICAL GAP

**Expected:**
- Database field `temperature` NOT NULL
- API validation rejects visits without temperature
- UI field marked required

**Delivered:**
- Database field exists but nullable ❌
- API accepts visits without temperature ❌
- UI field not marked required ❌

**Gap:**
- Database constraint missing (allows NULL)
- API validation missing (400 error not returned)
- UI validation missing (form submits without temperature)

**Impact:** 🔴 Critical — Data integrity issue, violates mandatory requirement from BRD

**Remediation:**
- **Route to:** Implementation Agent
- **Task:** Add NOT NULL constraint, API validation, UI required attribute
- **Estimated Effort:** Small (1-2 hours)
- **Priority:** P0 (Blocking)
- **Files to Change:**
  - `prisma/schema.prisma` (add NOT NULL)
  - `backend/src/validators/visitValidator.ts` (add temperature check)
  - `frontend/src/pages/NewVisit/index.tsx` (add required prop)
- **Tests to Add:**
  - Integration test: POST without temperature returns 400
  - E2E test: Form blocks submission without temperature

[Repeat for all gaps]

---

## Blocker Analysis

**Critical Blockers (Must Fix Before Approval):**
1. FR-3.2: Mandatory vitals not enforced
2. NFR-4.1: Authentication not implemented
3. SC-1: Consultation workflow exceeds 3-minute target

**Important Issues (Should Fix):**
4. FR-5.6: Date filter not working correctly
5. NFR-2.2: Search performance >5s with large dataset

---

## Next Steps

### If Approved (≥95%)
1. Merge to production branch
2. Deploy to production environment
3. Monitor for issues

### If Loop Back (<95%)
1. Create remediation tickets:
   - TICKET-001: Fix mandatory vitals validation (FR-3.2) → Implementation Agent
   - TICKET-002: Implement authentication (NFR-4.1) → Implementation Agent
   - TICKET-003: Optimize consultation workflow (SC-1) → UX review + Implementation
2. Assign to appropriate agents with priority
3. Set deadline: [Date]
4. Schedule re-audit after fixes deployed
5. **No merge to production until re-audit passes 95%**

---

## Sign-Off

**Auditor:** Gap Analysis Agent  
**Date:** [Date]  
**Decision:** ✅ APPROVED / ❌ LOOP BACK  

**Notes:** [Any additional context or recommendations]
```

---

## Document Control

**Version:** 1.0  
**Last Updated:** May 7, 2026  
**Author:** Gap Analysis Agent  
**Review Status:** Ready for use in post-implementation audit  

---

**END OF GAP ANALYSIS FRAMEWORK**
