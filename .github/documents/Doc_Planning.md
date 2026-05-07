# Implementation Plan: Patient Management Application

**Document Type:** Technical Implementation Roadmap  
**Date:** May 7, 2026  
**Status:** Ready for Development  
**Related Documents:** Doc_BRD.md, Doc_Brainstorming_Analysis.md

---

## Project Overview

### What We're Building

A single-page web application for a solo general physician to manage:
- Patient registration and profiles
- Daily appointment scheduling
- Clinical consultations (vitals, complaints, diagnosis, medications)
- Prescription generation and printing
- Patient visit history tracking
- Data export (CSV/PDF)

### Core Value Proposition

Replace paper-based patient management with a fast, reliable digital system that enables 2–3 minute consultation recording and instant access to patient history.

### Key Success Metrics

- **Performance:** Patient search < 5 seconds, page load < 2 seconds
- **Efficiency:** Complete consultation record in 2–3 minutes
- **Usability:** Minimal training required, intuitive workflow
- **Reliability:** Zero data loss, automated backups

---

## Architecture Overview

### Technology Stack Decision

**Frontend:**
- **Framework:** React 18+ with TypeScript
- **State Management:** React Query + Context API
- **Styling:** Tailwind CSS
- **Form Management:** React Hook Form + Zod validation
- **PDF Generation:** jsPDF + jsPDF-AutoTable
- **HTTP Client:** Axios
- **Date Handling:** date-fns

**Backend:**
- **Runtime:** Node.js 20+
- **Framework:** Express.js with TypeScript
- **Database:** PostgreSQL 15+
- **ORM:** Prisma
- **Authentication:** JWT with bcrypt
- **Validation:** Zod
- **File Generation:** PDFKit (server-side PDF alternative)

**DevOps & Deployment:**
- **Version Control:** Git + GitHub
- **Frontend Hosting:** Vercel or Netlify
- **Backend Hosting:** Railway or Render
- **Database Hosting:** Railway/Render managed PostgreSQL
- **Backups:** Automated daily database snapshots
- **CI/CD:** GitHub Actions

**Development Tools:**
- **Package Manager:** pnpm
- **Code Quality:** ESLint, Prettier
- **Testing:** Vitest (unit), Playwright (e2e)
- **API Documentation:** OpenAPI/Swagger

### Rationale

- **TypeScript:** Type safety reduces bugs in medical data handling
- **React:** Rich ecosystem, component reusability, fast development
- **PostgreSQL:** ACID compliance for medical data integrity, excellent query performance
- **Prisma:** Type-safe database access, easy migrations
- **Tailwind:** Rapid UI development without CSS overhead

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Patient    │  │ Appointment  │  │ Consultation │      │
│  │  Management  │  │  Scheduling  │  │   Workflow   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   History    │  │ Prescription │  │     Export   │      │
│  │    Viewer    │  │   Generator  │  │  CSV / PDF   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                    API Calls (REST)
                              │
┌─────────────────────────────────────────────────────────────┐
│                      BACKEND (Express)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │     Auth     │  │   Patient    │  │ Appointment  │      │
│  │  Controller  │  │  Controller  │  │  Controller  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    Visit     │  │ Prescription │  │    Export    │      │
│  │  Controller  │  │  Controller  │  │  Controller  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │               Prisma ORM Layer                       │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                   PostgreSQL Database                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │ patients │ │  visits  │ │medicines │ │  vitals  │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│  ┌──────────┐ ┌──────────┐                                 │
│  │  users   │ │appts     │                                 │
│  └──────────┘ └──────────┘                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Schema Design

### Core Tables

```sql
-- Users (Single doctor for Phase 1)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  clinic_name VARCHAR(255),
  clinic_address TEXT,
  clinic_contact VARCHAR(50),
  license_number VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Patients
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_number VARCHAR(50) UNIQUE NOT NULL, -- Auto-generated: PAT001, PAT002...
  name VARCHAR(255) NOT NULL,
  date_of_birth DATE NOT NULL,
  age INTEGER GENERATED ALWAYS AS (EXTRACT(YEAR FROM AGE(CURRENT_DATE, date_of_birth))) STORED,
  gender VARCHAR(20) NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  address TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Indexes for fast search
  CREATE INDEX idx_patients_name ON patients(name);
  CREATE INDEX idx_patients_phone ON patients(phone);
);

-- Appointments
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  appointment_date DATE NOT NULL,
  appointment_time TIME,
  status VARCHAR(20) NOT NULL DEFAULT 'scheduled' 
    CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CREATE INDEX idx_appointments_date ON appointments(appointment_date);
  CREATE INDEX idx_appointments_patient ON appointments(patient_id);
);

-- Visits (Consultation Records)
CREATE TABLE visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  visit_date TIMESTAMP NOT NULL DEFAULT NOW(),
  appointment_id UUID REFERENCES appointments(id),
  
  -- Vitals (Mandatory)
  temperature DECIMAL(4,1), -- 98.6
  temperature_unit VARCHAR(1) DEFAULT 'F' CHECK (temperature_unit IN ('F', 'C')),
  blood_pressure_systolic INTEGER, -- 120
  blood_pressure_diastolic INTEGER, -- 80
  pulse INTEGER, -- 72
  
  -- Clinical Data
  complaints TEXT, -- Patient symptoms (free text)
  diagnosis TEXT, -- Diagnosis notes
  notes TEXT, -- Additional notes
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CREATE INDEX idx_visits_patient ON visits(patient_id);
  CREATE INDEX idx_visits_date ON visits(visit_date);
);

-- Medications (Prescriptions)
CREATE TABLE medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id UUID NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
  medicine_name VARCHAR(255) NOT NULL,
  dosage VARCHAR(100), -- "500mg"
  frequency VARCHAR(100), -- "Twice daily" or "Morning, Evening"
  duration VARCHAR(100), -- "5 days" or "2 weeks"
  instructions TEXT, -- "Take after meals"
  sequence INTEGER DEFAULT 0, -- Display order
  created_at TIMESTAMP DEFAULT NOW(),
  
  CREATE INDEX idx_medications_visit ON medications(visit_id);
);
```

### Relationships

```
users (1) ─────┐
               │
patients (1) ──┼── (*) appointments
               │
               └── (*) visits (1) ── (*) medications
```

---

## Implementation Phases

### Phase 1A: Foundation & Core Workflow (Week 1-2)

**Goal:** Establish project structure, database, API, and core consultation workflow

#### Steps

1. **Project Setup & Infrastructure**
   - Initialize monorepo structure (frontend + backend)
   - Configure TypeScript, ESLint, Prettier
   - Set up Git repository with branching strategy
   - Configure environment variables
   - Set up deployment pipelines (CI/CD)

2. **Database Setup**
   - Install and configure PostgreSQL
   - Initialize Prisma
   - Create database schema (all tables)
   - Generate Prisma client
   - Create seed data for development

3. **Backend API - Authentication**
   - Implement user registration endpoint
   - Implement login endpoint (JWT generation)
   - Create auth middleware
   - Password hashing with bcrypt
   - Token validation

4. **Backend API - Patient Management**
   - POST /api/patients (create patient)
   - GET /api/patients/:id (get patient details)
   - PUT /api/patients/:id (update patient)
   - GET /api/patients/search?q=name (search patients)
   - Auto-generate patient numbers (PAT001, PAT002...)

5. **Backend API - Visit Management**
   - POST /api/visits (create new visit/consultation)
   - GET /api/visits/:id (get visit details)
   - GET /api/patients/:id/visits (get patient history)
   - Include vitals, complaints, diagnosis, medications in response

6. **Backend API - Medication Management**
   - POST /api/visits/:id/medications (add medication to visit)
   - PUT /api/medications/:id (update medication)
   - DELETE /api/medications/:id (remove medication)

7. **Frontend - Authentication UI**
   - Login page
   - Protected route wrapper
   - Token storage (localStorage)
   - Auto-redirect on auth failure

8. **Frontend - Patient Management UI**
   - Patient list view with search bar
   - Add new patient form (modal or page)
   - Edit patient form
   - Patient profile view
   - Search autocomplete with debouncing

9. **Frontend - Consultation Workflow UI**
   - New visit form (single-page, sections: vitals, complaints, diagnosis, medications)
   - Vitals input fields (temperature, BP, pulse)
   - Complaints textarea
   - Diagnosis textarea
   - Medication entry (dynamic add/remove)
   - Form validation
   - Auto-save draft (localStorage)
   - Submit and save visit

10. **Frontend - Patient History UI**
    - Visit history list for a patient
    - Expandable visit details
    - Display vitals, complaints, diagnosis, medications
    - Date filtering

#### File Targets (Phase 1A)

**Backend Structure:**
```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts
│   │   └── config.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── validation.middleware.ts
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── patient.controller.ts
│   │   ├── visit.controller.ts
│   │   └── medication.controller.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── patient.service.ts
│   │   ├── visit.service.ts
│   │   └── medication.service.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── patient.routes.ts
│   │   ├── visit.routes.ts
│   │   └── index.ts
│   ├── types/
│   │   ├── patient.types.ts
│   │   ├── visit.types.ts
│   │   └── api.types.ts
│   ├── utils/
│   │   ├── jwt.util.ts
│   │   ├── validation.util.ts
│   │   └── response.util.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.ts
│   │   └── migrations/
│   └── index.ts (entry point)
├── package.json
├── tsconfig.json
└── .env.example
```

**Frontend Structure:**
```
frontend/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── patients/
│   │   │   ├── PatientList.tsx
│   │   │   ├── PatientCard.tsx
│   │   │   ├── PatientForm.tsx
│   │   │   ├── PatientSearch.tsx
│   │   │   └── PatientProfile.tsx
│   │   ├── visits/
│   │   │   ├── NewVisitForm.tsx
│   │   │   ├── VitalsInput.tsx
│   │   │   ├── ComplaintsInput.tsx
│   │   │   ├── DiagnosisInput.tsx
│   │   │   ├── MedicationInput.tsx
│   │   │   └── VisitHistory.tsx
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Card.tsx
│   │   │   └── Spinner.tsx
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── PatientsPage.tsx
│   │   ├── PatientDetailPage.tsx
│   │   └── NewVisitPage.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── usePatients.ts
│   │   ├── useVisits.ts
│   │   └── useForm.ts
│   ├── services/
│   │   ├── api.service.ts
│   │   ├── auth.service.ts
│   │   ├── patient.service.ts
│   │   └── visit.service.ts
│   ├── store/
│   │   ├── AuthContext.tsx
│   │   └── AppContext.tsx
│   ├── utils/
│   │   ├── date.util.ts
│   │   ├── validation.util.ts
│   │   └── format.util.ts
│   ├── types/
│   │   ├── patient.types.ts
│   │   ├── visit.types.ts
│   │   └── api.types.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

#### Dependencies

- 14 backend files (controllers, services, routes, middleware)
- None (fresh start)

#### Effort Estimate

- **Size:** Large (core foundation)
- **Duration:** 10-12 days
- **Complexity:** High (multiple moving parts, database setup, auth)

---

### Phase 1B: Prescription & Appointments (Week 3)

**Goal:** Add prescription generation/printing and appointment scheduling

#### Steps

11. **Backend API - Prescription Generation**
    - GET /api/visits/:id/prescription (generate prescription PDF)
    - Include clinic header, patient info, vitals, diagnosis, medications
    - Use PDFKit or pass data to frontend for jsPDF generation

12. **Backend API - Appointment Management**
    - POST /api/appointments (create appointment)
    - GET /api/appointments?date=YYYY-MM-DD (get appointments for a date)
    - PUT /api/appointments/:id (update appointment status)
    - DELETE /api/appointments/:id (cancel appointment)

13. **Frontend - Prescription UI**
    - Prescription preview component
    - Print button (opens browser print dialog)
    - PDF download button
    - Customize clinic header (settings page later)

14. **Frontend - Appointment Scheduling UI**
    - Daily appointment calendar view
    - Add appointment form (link to existing patient or create new)
    - Appointment status update (dropdown: scheduled, completed, cancelled, no-show)
    - Link appointment to visit when consultation is recorded

15. **Frontend - Dashboard/Home Page**
    - Today's appointment list
    - Quick patient search
    - Recent patients widget
    - Quick action buttons (New Patient, New Visit)

#### File Targets (Phase 1B)

**Backend:**
- `backend/src/controllers/prescription.controller.ts`
- `backend/src/services/prescription.service.ts`
- `backend/src/controllers/appointment.controller.ts`
- `backend/src/services/appointment.service.ts`
- `backend/src/routes/prescription.routes.ts`
- `backend/src/routes/appointment.routes.ts`
- `backend/src/utils/pdf.util.ts`

**Frontend:**
- `frontend/src/components/prescriptions/PrescriptionPreview.tsx`
- `frontend/src/components/prescriptions/PrescriptionPDF.tsx`
- `frontend/src/components/appointments/AppointmentCalendar.tsx`
- `frontend/src/components/appointments/AppointmentList.tsx`
- `frontend/src/components/appointments/AppointmentForm.tsx`
- `frontend/src/pages/AppointmentsPage.tsx`
- `frontend/src/hooks/useAppointments.ts`
- `frontend/src/services/appointment.service.ts`

#### Dependencies

- Phase 1A completion (core patient & visit management)

#### Effort Estimate

- **Size:** Medium
- **Duration:** 4-5 days
- **Complexity:** Medium (PDF generation requires testing)

---

### Phase 1C: Data Export & Polish (Week 4)

**Goal:** Add CSV/PDF export, improve UX, bug fixes, documentation

#### Steps

16. **Backend API - Data Export**
    - GET /api/export/patients?format=csv (export all patients as CSV)
    - GET /api/export/patients?format=pdf (export all patients as PDF)
    - GET /api/export/visits?patient_id=X&format=csv (export patient visits)
    - GET /api/export/visits?patient_id=X&format=pdf (export patient visits)

17. **Frontend - Export UI**
    - Export button on patient list page
    - Export button on patient history page
    - Format selection (CSV or PDF)
    - Download trigger

18. **Frontend - UX Improvements**
    - Loading states for all async operations
    - Error handling and display (toast notifications)
    - Form validation feedback
    - Empty states (no patients, no visits)
    - Keyboard shortcuts (Enter to submit, Esc to close modal)
    - Responsive design for tablet access

19. **Settings/Profile Page**
    - Edit doctor profile (name, clinic details, license number)
    - Clinic header customization for prescriptions
    - Password change

20. **Testing & QA**
    - Unit tests for critical services
    - E2E tests for core workflows
    - Cross-browser testing
    - Performance testing (patient search, history load)
    - Security audit (SQL injection, XSS prevention)

21. **Documentation**
    - API documentation (Swagger/OpenAPI)
    - User manual (how to use the system)
    - Deployment guide
    - Database backup/restore procedures

#### File Targets (Phase 1C)

**Backend:**
- `backend/src/controllers/export.controller.ts`
- `backend/src/services/export.service.ts`
- `backend/src/routes/export.routes.ts`
- `backend/src/utils/csv.util.ts`
- `backend/tests/` (unit tests)

**Frontend:**
- `frontend/src/components/export/ExportButton.tsx`
- `frontend/src/components/common/Toast.tsx`
- `frontend/src/components/common/EmptyState.tsx`
- `frontend/src/pages/SettingsPage.tsx`
- `frontend/src/hooks/useExport.ts`
- `frontend/tests/` (E2E tests with Playwright)

**Documentation:**
- `docs/API.md`
- `docs/USER_MANUAL.md`
- `docs/DEPLOYMENT.md`
- `README.md`

#### Dependencies

- Phase 1B completion

#### Effort Estimate

- **Size:** Medium
- **Duration:** 5-6 days
- **Complexity:** Low-Medium (mostly integration and polish)

---

## Complete File & Module Breakdown

### Backend Files (Total: ~35 files)

| File | Purpose | Phase |
|------|---------|-------|
| `prisma/schema.prisma` | Database schema definition | 1A |
| `prisma/seed.ts` | Development seed data | 1A |
| `src/config/database.ts` | Prisma client initialization | 1A |
| `src/config/config.ts` | Environment configuration | 1A |
| `src/middleware/auth.middleware.ts` | JWT authentication | 1A |
| `src/middleware/error.middleware.ts` | Global error handler | 1A |
| `src/middleware/validation.middleware.ts` | Request validation | 1A |
| `src/controllers/auth.controller.ts` | Login/register endpoints | 1A |
| `src/controllers/patient.controller.ts` | Patient CRUD endpoints | 1A |
| `src/controllers/visit.controller.ts` | Visit CRUD endpoints | 1A |
| `src/controllers/medication.controller.ts` | Medication CRUD endpoints | 1A |
| `src/controllers/appointment.controller.ts` | Appointment CRUD endpoints | 1B |
| `src/controllers/prescription.controller.ts` | Prescription PDF generation | 1B |
| `src/controllers/export.controller.ts` | CSV/PDF export endpoints | 1C |
| `src/services/auth.service.ts` | Authentication business logic | 1A |
| `src/services/patient.service.ts` | Patient business logic | 1A |
| `src/services/visit.service.ts` | Visit business logic | 1A |
| `src/services/medication.service.ts` | Medication business logic | 1A |
| `src/services/appointment.service.ts` | Appointment business logic | 1B |
| `src/services/prescription.service.ts` | Prescription generation logic | 1B |
| `src/services/export.service.ts` | Export logic | 1C |
| `src/routes/auth.routes.ts` | Auth route definitions | 1A |
| `src/routes/patient.routes.ts` | Patient route definitions | 1A |
| `src/routes/visit.routes.ts` | Visit route definitions | 1A |
| `src/routes/appointment.routes.ts` | Appointment route definitions | 1B |
| `src/routes/prescription.routes.ts` | Prescription route definitions | 1B |
| `src/routes/export.routes.ts` | Export route definitions | 1C |
| `src/routes/index.ts` | Route aggregator | 1A |
| `src/utils/jwt.util.ts` | JWT helper functions | 1A |
| `src/utils/validation.util.ts` | Validation helpers | 1A |
| `src/utils/response.util.ts` | API response formatter | 1A |
| `src/utils/pdf.util.ts` | PDF generation helpers | 1B |
| `src/utils/csv.util.ts` | CSV generation helpers | 1C |
| `src/types/` | TypeScript type definitions | 1A |
| `src/index.ts` | Express app entry point | 1A |

### Frontend Files (Total: ~50 files)

| File | Purpose | Phase |
|------|---------|-------|
| `src/pages/LoginPage.tsx` | Login UI | 1A |
| `src/pages/DashboardPage.tsx` | Home dashboard | 1B |
| `src/pages/PatientsPage.tsx` | Patient list page | 1A |
| `src/pages/PatientDetailPage.tsx` | Patient profile & history | 1A |
| `src/pages/NewVisitPage.tsx` | New consultation form | 1A |
| `src/pages/AppointmentsPage.tsx` | Appointment calendar | 1B |
| `src/pages/SettingsPage.tsx` | Doctor/clinic settings | 1C |
| `src/components/auth/LoginForm.tsx` | Login form component | 1A |
| `src/components/auth/ProtectedRoute.tsx` | Auth guard wrapper | 1A |
| `src/components/patients/PatientList.tsx` | Patient list renderer | 1A |
| `src/components/patients/PatientCard.tsx` | Patient card component | 1A |
| `src/components/patients/PatientForm.tsx` | Add/edit patient form | 1A |
| `src/components/patients/PatientSearch.tsx` | Search autocomplete | 1A |
| `src/components/patients/PatientProfile.tsx` | Patient detail view | 1A |
| `src/components/visits/NewVisitForm.tsx` | Visit entry form | 1A |
| `src/components/visits/VitalsInput.tsx` | Vitals input section | 1A |
| `src/components/visits/ComplaintsInput.tsx` | Complaints textarea | 1A |
| `src/components/visits/DiagnosisInput.tsx` | Diagnosis textarea | 1A |
| `src/components/visits/MedicationInput.tsx` | Medication list manager | 1A |
| `src/components/visits/VisitHistory.tsx` | Patient visit history | 1A |
| `src/components/prescriptions/PrescriptionPreview.tsx` | Prescription display | 1B |
| `src/components/prescriptions/PrescriptionPDF.tsx` | PDF generator | 1B |
| `src/components/appointments/AppointmentCalendar.tsx` | Daily calendar | 1B |
| `src/components/appointments/AppointmentList.tsx` | Appointment list | 1B |
| `src/components/appointments/AppointmentForm.tsx` | Add appointment | 1B |
| `src/components/export/ExportButton.tsx` | Export trigger | 1C |
| `src/components/common/Button.tsx` | Reusable button | 1A |
| `src/components/common/Input.tsx` | Reusable input | 1A |
| `src/components/common/Modal.tsx` | Modal dialog | 1A |
| `src/components/common/Card.tsx` | Card container | 1A |
| `src/components/common/Spinner.tsx` | Loading spinner | 1A |
| `src/components/common/Toast.tsx` | Toast notifications | 1C |
| `src/components/common/EmptyState.tsx` | Empty state placeholder | 1C |
| `src/hooks/useAuth.ts` | Authentication hook | 1A |
| `src/hooks/usePatients.ts` | Patient data hook | 1A |
| `src/hooks/useVisits.ts` | Visit data hook | 1A |
| `src/hooks/useAppointments.ts` | Appointment data hook | 1B |
| `src/hooks/useExport.ts` | Export data hook | 1C |
| `src/hooks/useForm.ts` | Form state management | 1A |
| `src/services/api.service.ts` | Axios base configuration | 1A |
| `src/services/auth.service.ts` | Auth API calls | 1A |
| `src/services/patient.service.ts` | Patient API calls | 1A |
| `src/services/visit.service.ts` | Visit API calls | 1A |
| `src/services/appointment.service.ts` | Appointment API calls | 1B |
| `src/store/AuthContext.tsx` | Global auth state | 1A |
| `src/utils/date.util.ts` | Date formatting helpers | 1A |
| `src/utils/validation.util.ts` | Client-side validation | 1A |
| `src/utils/format.util.ts` | Data formatters | 1A |
| `src/types/` | TypeScript interfaces | 1A |
| `src/App.tsx` | Root app component | 1A |

---

## Test Strategy

### Unit Tests

**Backend Unit Tests (Vitest):**

| Module | Test Coverage |
|--------|---------------|
| `auth.service.ts` | - Password hashing<br>- JWT generation/validation<br>- Login success/failure scenarios |
| `patient.service.ts` | - Patient creation with auto-generated ID<br>- Search by name/phone<br>- Duplicate phone detection<br>- Update patient details |
| `visit.service.ts` | - Visit creation with vitals<br>- Medication association<br>- Patient history retrieval<br>- Date filtering |
| `appointment.service.ts` | - Appointment scheduling<br>- Status updates<br>- Daily appointment list<br>- Conflict prevention |
| `prescription.service.ts` | - PDF generation with all data<br>- Missing data handling<br>- Format validation |
| `export.service.ts` | - CSV generation<br>- PDF generation<br>- Data filtering |

**Frontend Unit Tests (Vitest + Testing Library):**

| Component | Test Coverage |
|-----------|---------------|
| `PatientForm.tsx` | - Form validation (required fields)<br>- Phone format validation<br>- Submit success/error handling |
| `NewVisitForm.tsx` | - Vitals validation (numeric, ranges)<br>- Mandatory fields enforcement<br>- Medication add/remove<br>- Auto-save draft |
| `PatientSearch.tsx` | - Debounced search<br>- Result rendering<br>- No results state |
| `PrescriptionPDF.tsx` | - PDF structure validation<br>- Data rendering |

### Integration Tests

| Workflow | Test Scenario |
|----------|---------------|
| **Patient Registration → First Visit** | 1. Create new patient<br>2. Search for patient<br>3. Record first consultation<br>4. Verify visit in history |
| **Appointment → Consultation** | 1. Schedule appointment<br>2. Mark as completed<br>3. Create visit from appointment<br>4. Verify linkage |
| **Full Consultation Flow** | 1. Select patient<br>2. Enter vitals, complaints, diagnosis<br>3. Add medications<br>4. Generate prescription<br>5. Print PDF<br>6. Verify in history |
| **Data Export** | 1. Create multiple patients and visits<br>2. Export as CSV<br>3. Verify data integrity<br>4. Export as PDF<br>5. Verify formatting |

### End-to-End Tests (Playwright)

**Critical User Journeys:**

1. **New Doctor Onboarding**
   - Register account → Configure clinic details → Add first patient → Record first visit

2. **Daily Workflow**
   - Login → View today's appointments → Complete consultations for 3 patients → Print prescriptions

3. **Patient History Review**
   - Search for existing patient → View visit history → Filter by date → Review past prescriptions

4. **Data Management**
   - Add 10 patients → Export patient list as CSV → Verify download

### Performance Tests

| Metric | Target | Test Method |
|--------|--------|-------------|
| Patient search response time | < 5 seconds | Load 1000 patients, search by partial name |
| Visit history load time | < 3 seconds | Patient with 50+ visits |
| Prescription PDF generation | < 10 seconds | Complex prescription with 8 medications |
| Page load time | < 2 seconds | Measure with Lighthouse or WebPageTest |
| Database query performance | < 100ms | Profile slow queries with Prisma logging |

### Security Tests

- **SQL Injection:** Test all input fields with SQL injection payloads
- **XSS:** Test text areas with script tags
- **Authentication:** Test unauthorized access to protected routes
- **Password Security:** Verify bcrypt hashing, no plaintext storage
- **JWT Expiration:** Verify token expiration and refresh logic

---

## Risk Assessment & Mitigation

### High-Priority Risks

| Risk | Impact | Probability | Mitigation Strategy |
|------|--------|-------------|---------------------|
| **Data Loss During Consultation** | Critical | Low | - Auto-save draft to localStorage every 30 seconds<br>- Server-side validation before save<br>- Transaction rollback on errors<br>- Daily automated database backups |
| **Slow Patient Search Performance** | High | Medium | - Database indexing on name and phone fields<br>- Implement full-text search (PostgreSQL `tsvector`)<br>- Limit results to top 20, add pagination<br>- Cache recent searches |
| **Prescription Format Errors** | High | Low | - Comprehensive PDF template testing<br>- Preview before print<br>- Fallback to plain text if PDF fails<br>- Sample prescription in dev environment |
| **Doctor Rejects System (UX Failure)** | Critical | Low-Medium | - Early prototype review with doctor<br>- Usability testing before launch<br>- Quick action shortcuts<br>- Minimize clicks (2-3 clicks to any feature) |
| **Security Breach (PHI Exposure)** | Critical | Low | - HTTPS enforcement<br>- Encrypted database connections<br>- JWT short expiration (1 hour)<br>- No sensitive data in logs<br>- Regular security audits |

### Medium-Priority Risks

| Risk | Impact | Probability | Mitigation Strategy |
|------|--------|-------------|---------------------|
| **Unclear Requirements** | Medium | Low | - Brainstorming doc already created<br>- Regular stakeholder check-ins<br>- Iterative development with feedback loops |
| **Scope Creep** | Medium | Medium | - Strict Phase 1 definition<br>- Feature freeze after Phase 1C starts<br>- Defer requests to Phase 2 backlog |
| **Browser Compatibility Issues** | Medium | Low | - Target modern browsers only (Chrome, Edge, Safari)<br>- Polyfills for missing features<br>- Cross-browser testing in CI |
| **Database Migration Failures** | Medium | Low | - Test migrations on staging environment<br>- Backup before each migration<br>- Rollback scripts prepared |
| **Third-Party Library Vulnerabilities** | Medium | Low | - Regular dependency updates<br>- Automated vulnerability scanning (Dependabot)<br>- Pin versions for stability |

---

## Execution Checklist

### Pre-Development (Day 0)

- [ ] Secure hosting accounts (Vercel, Railway/Render)
- [ ] Set up GitHub repository with proper access
- [ ] Create development, staging, production environments
- [ ] Acquire domain name (optional)
- [ ] Set up SSL certificates
- [ ] Configure database instances (dev, prod)
- [ ] Prepare development machines (Node.js, PostgreSQL, IDE)
- [ ] Review BRD and brainstorming docs with team

### Week 1: Phase 1A Foundation

**Day 1-2: Project & Database Setup**
- [ ] Initialize monorepo structure
- [ ] Configure TypeScript, ESLint, Prettier
- [ ] Set up Prisma with PostgreSQL
- [ ] Create database schema
- [ ] Generate Prisma client
- [ ] Create seed data
- [ ] Test database connection

**Day 3-4: Backend API - Auth & Patients**
- [ ] Implement auth middleware (JWT)
- [ ] Create auth endpoints (register, login)
- [ ] Create patient endpoints (CRUD, search)
- [ ] Test with Postman/Insomnia
- [ ] Document API with Swagger

**Day 5-6: Backend API - Visits & Medications**
- [ ] Create visit endpoints
- [ ] Create medication endpoints
- [ ] Test consultation workflow end-to-end
- [ ] Validate data integrity

**Day 7: Frontend Setup**
- [ ] Initialize React + Vite project
- [ ] Configure Tailwind CSS
- [ ] Set up routing (React Router)
- [ ] Create base layout components
- [ ] Implement auth context and protected routes

**Day 8-9: Frontend - Patient Management**
- [ ] Build patient list page
- [ ] Build patient search
- [ ] Build add/edit patient forms
- [ ] Build patient profile page
- [ ] Connect to backend API

**Day 10: Frontend - Consultation Workflow**
- [ ] Build new visit form
- [ ] Build vitals input section
- [ ] Build complaints/diagnosis sections
- [ ] Build medication input (dynamic list)
- [ ] Implement form validation
- [ ] Connect to backend API

### Week 2: Phase 1A Completion & Testing

**Day 11-12: Frontend - Visit History**
- [ ] Build visit history component
- [ ] Display vitals, complaints, diagnosis, medications
- [ ] Implement date filtering
- [ ] Test full patient → visit → history workflow

**Day 13: Integration Testing**
- [ ] Test happy path: register → add patient → record visit → view history
- [ ] Test edge cases: validation errors, missing data
- [ ] Fix bugs discovered during testing

**Day 14: Code Review & Refactoring**
- [ ] Review all code for quality
- [ ] Refactor duplicate logic
- [ ] Improve error handling
- [ ] Add loading states

### Week 3: Phase 1B Appointments & Prescriptions

**Day 15-16: Prescription Generation**
- [ ] Backend: Implement prescription PDF generation
- [ ] Frontend: Build prescription preview component
- [ ] Frontend: Integrate jsPDF for client-side generation
- [ ] Test print functionality in Chrome, Edge, Safari
- [ ] Customize clinic header format

**Day 17-18: Appointment Management**
- [ ] Backend: Create appointment endpoints
- [ ] Frontend: Build daily appointment calendar
- [ ] Frontend: Build add/update appointment forms
- [ ] Implement appointment status workflow
- [ ] Link appointments to visits

**Day 19: Dashboard Page**
- [ ] Build home dashboard
- [ ] Display today's appointments
- [ ] Add quick action buttons
- [ ] Add recent patients widget

**Day 20-21: Integration & Polish**
- [ ] Test appointment → consultation → prescription flow
- [ ] Fix bugs
- [ ] Improve UI/UX based on testing

### Week 4: Phase 1C Export & Launch Prep

**Day 22-23: Data Export**
- [ ] Backend: Implement CSV export for patients
- [ ] Backend: Implement CSV export for visits
- [ ] Backend: Implement PDF export
- [ ] Frontend: Add export buttons
- [ ] Test download functionality

**Day 24: Settings & Profile**
- [ ] Build settings page
- [ ] Allow doctor to edit clinic details
- [ ] Implement password change
- [ ] Test profile update

**Day 25: Testing & QA**
- [ ] Run full test suite (unit + integration + E2E)
- [ ] Performance testing (patient search, history load)
- [ ] Security audit checklist
- [ ] Cross-browser testing

**Day 26: Documentation**
- [ ] Complete API documentation
- [ ] Write user manual with screenshots
- [ ] Write deployment guide
- [ ] Document backup/restore procedures

**Day 27: Deployment**
- [ ] Deploy backend to production
- [ ] Deploy frontend to production
- [ ] Configure environment variables
- [ ] Set up automated backups
- [ ] Configure monitoring and logging
- [ ] Smoke test production environment

**Day 28: Training & Handoff**
- [ ] Conduct training session with doctor
- [ ] Provide user manual
- [ ] Set up support channel
- [ ] Go live!
- [ ] Monitor for issues

---

## Unknown Unknowns & Validation Needs

### What Might We Be Missing?

1. **Regulatory Compliance:** Are there local/regional medical records regulations we haven't accounted for? (e.g., HIPAA equivalent, data retention laws)

2. **Clinic Workflow Nuances:** Does the doctor have special workflows we haven't captured? (e.g., follow-up tracking, referrals)

3. **Printing Challenges:** Will the clinic's printer work reliably with browser-based printing? Should we provide an alternative print method?

4. **Data Volume:** Is the expected patient volume truly "moderate"? If the clinic is busier than expected, will the system scale?

5. **Internet Reliability:** Is the internet truly reliable? Should we reconsider offline mode?

6. **Mobile Access:** Will the doctor ever need tablet/mobile access during patient rounds? (Currently out of scope)

### Who Should Validate This Plan?

- **Product Owner:** Confirm scope, priorities, and timeline
- **Doctor (Primary User):** Validate workflow, UI mockups, and feature priorities
- **Legal/Compliance Advisor:** Review data security and retention requirements
- **IT/Infrastructure Lead:** Confirm hosting strategy and backup procedures
- **Development Team:** Validate technical approach and effort estimates

---

## Next Steps

### Immediate Actions (Before Development Starts)

1. **Stakeholder Review Meeting**
   - Walk through this implementation plan
   - Get approval on technical architecture
   - Confirm timeline and resource allocation
   - Address any concerns or questions

2. **UI/UX Mockups**
   - Create wireframes for 5 key screens:
     - Patient list + search
     - New visit form
     - Prescription preview
     - Appointment calendar
     - Patient history
   - Get doctor feedback on mockups

3. **Technical Setup**
   - Provision hosting environments
   - Set up GitHub repository
   - Configure CI/CD pipelines
   - Prepare development environment setup guide

4. **Sprint Planning**
   - Break phases into 1-week sprints
   - Assign tasks to team members
   - Set up project tracking (Jira, Linear, or GitHub Projects)

5. **Kickoff Meeting**
   - Review roles and responsibilities
   - Establish communication channels (Slack, daily standups)
   - Set expectations for code reviews and testing
   - Confirm definition of "done" for each task

---

## Success Criteria Review

At the end of Phase 1C (Week 4), we should be able to demonstrate:

✅ **Core Features Working:**
- Patient registration, search, and profile management
- Appointment scheduling with daily view
- Full consultation workflow (vitals, complaints, diagnosis, medications)
- Prescription generation and printing
- Patient visit history with filtering
- CSV/PDF data export

✅ **Performance Targets Met:**
- Patient search completes in < 5 seconds
- Page loads in < 2 seconds
- Consultation recording takes 2–3 minutes
- Prescription generation takes < 10 seconds

✅ **Quality Standards:**
- Zero critical bugs
- 80%+ test coverage for backend services
- E2E tests passing for all critical workflows
- Security checklist completed
- Cross-browser compatibility verified

✅ **Usability Validated:**
- Doctor can use system with minimal training
- UI is intuitive and fast
- Error messages are clear and helpful
- System handles edge cases gracefully

✅ **Production Ready:**
- Deployed to production environment
- Automated backups configured
- Monitoring and logging in place
- User manual completed
- Support process defined

---

## Appendix: API Endpoints Summary

### Authentication
- `POST /api/auth/register` - Register new user (doctor)
- `POST /api/auth/login` - Login and get JWT
- `GET /api/auth/me` - Get current user profile

### Patients
- `POST /api/patients` - Create new patient
- `GET /api/patients/:id` - Get patient details
- `PUT /api/patients/:id` - Update patient
- `GET /api/patients/search?q=name` - Search patients
- `GET /api/patients?recent=true` - Get recent patients

### Visits
- `POST /api/visits` - Create new visit/consultation
- `GET /api/visits/:id` - Get visit details
- `GET /api/patients/:patientId/visits` - Get patient visit history
- `PUT /api/visits/:id` - Update visit (if needed)

### Medications
- `POST /api/visits/:visitId/medications` - Add medication to visit
- `PUT /api/medications/:id` - Update medication
- `DELETE /api/medications/:id` - Delete medication

### Appointments
- `POST /api/appointments` - Create appointment
- `GET /api/appointments?date=YYYY-MM-DD` - Get appointments for date
- `PUT /api/appointments/:id` - Update appointment (status, notes)
- `DELETE /api/appointments/:id` - Cancel appointment

### Prescriptions
- `GET /api/visits/:visitId/prescription` - Generate prescription PDF

### Export
- `GET /api/export/patients?format=csv` - Export all patients as CSV
- `GET /api/export/patients?format=pdf` - Export all patients as PDF
- `GET /api/export/visits?patientId=X&format=csv` - Export patient visits as CSV
- `GET /api/export/visits?patientId=X&format=pdf` - Export patient visits as PDF

### Settings
- `PUT /api/users/:id` - Update doctor/clinic profile
- `POST /api/users/:id/change-password` - Change password

---

## Document Control

**Version:** 1.0  
**Author:** Planning Agent  
**Status:** Ready for Development  
**Next Review:** After Phase 1A completion  
**Related Documents:**
- Doc_BRD.md (Business Requirements)
- Doc_Brainstorming_Analysis.md (Discovery & Design Options)

---

**END OF IMPLEMENTATION PLAN**
