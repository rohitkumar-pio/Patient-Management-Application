# Code Review Framework: Patient Management Application

**Document Type:** Code Quality Standards & Review Process  
**Date:** May 7, 2026  
**Status:** Active Review Guidelines  
**Related:** Doc_BRD.md, Doc_Implementation_Plan.md, Doc_Verification_Strategy.md

---

## Overview

This document defines the code review standards, process, and approval criteria for the Patient Management Application. As the **Code Review Agent**, my role is to ensure all code meets quality, correctness, and consistency standards before merging to the main branch.

### Review Philosophy

**Quality over Speed** — Every line of code is reviewed with meticulous attention to:
- **Code Quality:** Architecture, patterns, maintainability
- **Correctness:** Logic, edge cases, error handling
- **Consistency:** Adherence to project standards and conventions

**No Compromise** — Code that doesn't meet standards is blocked until fixed.

---

## Review Process

### 1. Pre-Review Checklist (Developer)

Before requesting review, developers must confirm:

```markdown
- [ ] All tests pass locally (unit + integration + E2E)
- [ ] No linting errors (`npm run lint`)
- [ ] No TypeScript compilation errors
- [ ] Code is formatted (`npm run format`)
- [ ] Branch is up-to-date with main
- [ ] Commit messages follow conventional commits
- [ ] Self-review completed using this framework
```

### 2. Review Submission

**Pull Request Template:**

```markdown
## Feature: [Feature Name]

### BRD Reference
- Section: [Patient Management | Appointments | Consultation | etc.]
- Requirements: [List specific requirements addressed]

### Implementation Summary
[Brief description of approach]

### Files Changed
- Backend: X files
- Frontend: X files
- Tests: X files
- Total: X files, +XXX/-XXX lines

### Testing
- [ ] Unit tests: X passing
- [ ] Integration tests: X passing
- [ ] E2E tests: X passing
- [ ] Manual testing completed

### Database Changes
- [ ] Migrations included
- [ ] Rollback tested
- [ ] Seed data updated (if applicable)

### Performance Impact
[Any performance considerations]

### Security Considerations
[Any security implications]

### Screenshots/Videos
[For UI changes]

### Checklist
- [ ] Self-reviewed against Code Review Framework
- [ ] Documentation updated
- [ ] No commented-out code
- [ ] No console.logs or debug statements
- [ ] Error handling implemented
```

### 3. Code Review Agent Review

I will perform a **multi-dimensional review** examining:

#### A. Code Quality (30%)
- Architecture and design patterns
- Code organization and modularity
- DRY principle adherence
- Separation of concerns
- Maintainability and readability

#### B. Correctness (40%)
- Logic accuracy
- Edge case handling
- Error handling and validation
- Type safety (TypeScript)
- Database query correctness
- API contract compliance

#### C. Consistency (20%)
- Naming conventions
- File structure
- Code style (matches existing patterns)
- API design patterns
- Component architecture

#### D. Testing (10%)
- Test coverage adequate
- Tests are meaningful (not just coverage padding)
- Edge cases tested
- Integration points tested

---

## Review Criteria by Feature Area

### Patient Management

**Backend Review Points:**

```typescript
// ✅ GOOD: Proper validation, error handling, type safety
export async function createPatient(req: Request, res: Response) {
  try {
    const validatedData = patientSchema.parse(req.body);
    
    // Check for duplicate phone number
    const existing = await prisma.patient.findUnique({
      where: { phone: validatedData.phone }
    });
    
    if (existing) {
      return res.status(409).json({ 
        error: 'Patient with this phone number already exists' 
      });
    }
    
    const patient = await prisma.patient.create({
      data: validatedData
    });
    
    res.status(201).json(patient);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.errors 
      });
    }
    next(error); // Pass to global error handler
  }
}

// ❌ BAD: No validation, poor error handling, no type safety
export async function createPatient(req: any, res: any) {
  const patient = await prisma.patient.create({ data: req.body });
  res.json(patient);
}
```

**Frontend Review Points:**

```typescript
// ✅ GOOD: Form validation, loading states, error handling
export function PatientForm({ onSubmit, initialData }: PatientFormProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(patientSchema),
    defaultValues: initialData
  });

  const [error, setError] = useState<string | null>(null);

  const onSubmitHandler = async (data: PatientFormData) => {
    try {
      setError(null);
      await onSubmit(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save patient');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmitHandler)}>
      {error && <Alert variant="error">{error}</Alert>}
      
      <Input
        {...register('name')}
        label="Full Name"
        error={errors.name?.message}
        required
      />
      
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Save Patient'}
      </Button>
    </form>
  );
}

// ❌ BAD: No validation, no error handling, no loading states
export function PatientForm({ onSubmit }: any) {
  return (
    <form onSubmit={(e) => { 
      e.preventDefault(); 
      onSubmit({}); 
    }}>
      <input name="name" />
      <button>Save</button>
    </form>
  );
}
```

**Checklist:**

- [ ] **API Endpoints:** RESTful design, proper HTTP status codes
- [ ] **Validation:** Zod schemas for all inputs
- [ ] **Error Handling:** Try-catch blocks, user-friendly messages
- [ ] **Database Queries:** Proper indexing, prevent N+1 queries
- [ ] **Search Performance:** Debouncing, pagination, results <5 seconds (BRD requirement)
- [ ] **Duplicate Prevention:** Phone number uniqueness enforced
- [ ] **TypeScript:** No `any` types, interfaces defined
- [ ] **Form Validation:** Client-side validation with react-hook-form
- [ ] **Loading States:** Spinners/skeletons during async operations
- [ ] **Empty States:** Proper UI when no patients exist

---

### Consultation Workflow

**Critical Review Areas:**

1. **Vitals Validation:**
```typescript
// ✅ GOOD: Strict validation with realistic ranges
const vitalsSchema = z.object({
  temperature: z.number()
    .min(35, 'Temperature too low (min 35°C)')
    .max(42, 'Temperature too high (max 42°C)'),
  bloodPressure: z.object({
    systolic: z.number().min(70).max(250),
    diastolic: z.number().min(40).max(150)
  }).refine(
    (bp) => bp.systolic > bp.diastolic,
    'Systolic must be greater than diastolic'
  ),
  pulse: z.number().min(40).max(200)
});

// ❌ BAD: No validation bounds
const vitalsSchema = z.object({
  temperature: z.number(),
  bloodPressure: z.string(), // Wrong type!
  pulse: z.number()
});
```

2. **Medication Management:**
```typescript
// ✅ GOOD: Proper relationship management, validation
export async function createVisit(data: VisitCreateInput) {
  return await prisma.visit.create({
    data: {
      patientId: data.patientId,
      vitals: data.vitals,
      complaints: data.complaints,
      diagnosis: data.diagnosis,
      medications: {
        create: data.medications.map(med => ({
          name: med.name,
          dosage: med.dosage,
          frequency: med.frequency,
          duration: med.duration,
          instructions: med.instructions
        }))
      }
    },
    include: {
      medications: true,
      patient: true
    }
  });
}

// ❌ BAD: No transaction, potential data inconsistency
export async function createVisit(data: any) {
  const visit = await prisma.visit.create({ data });
  for (const med of data.medications) {
    await prisma.medication.create({ data: med }); // No transaction!
  }
  return visit;
}
```

**Checklist:**

- [ ] **Vitals Mandatory:** Cannot save visit without all 3 vitals
- [ ] **Vitals Validation:** Realistic ranges with clear error messages
- [ ] **Dynamic Medications:** Add/remove medications without page reload
- [ ] **Auto-Save:** Draft saving every 30 seconds (prevent data loss)
- [ ] **Form Timing:** Can complete entire form in <3 minutes (BRD requirement)
- [ ] **Database Transactions:** Visit + medications saved atomically
- [ ] **Relationship Integrity:** Foreign keys properly enforced
- [ ] **Error Recovery:** Can retry failed saves without losing data
- [ ] **Confirmation:** Clear success message after save

---

### Prescription Printing

**PDF Generation Review:**

```typescript
// ✅ GOOD: Professional template, error handling, proper formatting
export async function generatePrescriptionPDF(visitId: string): Promise<Buffer> {
  const visit = await prisma.visit.findUnique({
    where: { id: visitId },
    include: { patient: true, medications: true }
  });

  if (!visit) {
    throw new Error('Visit not found');
  }

  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  const chunks: Buffer[] = [];

  doc.on('data', (chunk) => chunks.push(chunk));
  
  // Header
  doc.fontSize(20).font('Helvetica-Bold').text('Dr. [Name] Clinic', { align: 'center' });
  doc.fontSize(10).font('Helvetica').text('[Address] | [Phone] | [Email]', { align: 'center' });
  doc.moveDown(2);

  // Patient Details
  doc.fontSize(12).font('Helvetica-Bold').text('Patient Information:');
  doc.fontSize(10).font('Helvetica')
    .text(`Name: ${visit.patient.name}`)
    .text(`Age: ${visit.patient.age} | Gender: ${visit.patient.gender}`)
    .text(`Date: ${format(visit.createdAt, 'dd MMM yyyy')}`);
  
  doc.moveDown();

  // Vitals
  doc.fontSize(12).font('Helvetica-Bold').text('Vitals:');
  doc.fontSize(10).font('Helvetica')
    .text(`Temperature: ${visit.vitals.temperature}°C | BP: ${visit.vitals.bloodPressure.systolic}/${visit.vitals.bloodPressure.diastolic} mmHg | Pulse: ${visit.vitals.pulse} bpm`);
  
  doc.moveDown();

  // Diagnosis
  doc.fontSize(12).font('Helvetica-Bold').text('Diagnosis:');
  doc.fontSize(10).font('Helvetica').text(visit.diagnosis || 'N/A');
  
  doc.moveDown();

  // Medications
  doc.fontSize(12).font('Helvetica-Bold').text('Prescription:');
  visit.medications.forEach((med, index) => {
    doc.fontSize(10).font('Helvetica')
      .text(`${index + 1}. ${med.name} - ${med.dosage}`)
      .text(`   ${med.frequency}, ${med.duration}`)
      .text(`   ${med.instructions || ''}`);
    doc.moveDown(0.5);
  });

  // Footer
  doc.moveDown(3);
  doc.fontSize(10).font('Helvetica-Bold').text('Dr. [Name]', { align: 'right' });
  doc.fontSize(8).font('Helvetica').text('Signature', { align: 'right' });

  doc.end();

  return new Promise((resolve, reject) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });
}

// ❌ BAD: No error handling, missing information, poor layout
export async function generatePrescriptionPDF(visitId: string) {
  const visit = await prisma.visit.findUnique({ where: { id: visitId } });
  const doc = new PDFDocument();
  doc.text(visit.diagnosis);
  doc.end();
  return doc;
}
```

**Checklist:**

- [ ] **Professional Template:** Clinic header with logo/credentials
- [ ] **Complete Information:** Patient details, vitals, diagnosis, medications
- [ ] **Readable Layout:** Proper spacing, font sizes, hierarchy
- [ ] **Footer:** Doctor signature area, date, license info (if required)
- [ ] **Performance:** PDF generates in <10 seconds (BRD target)
- [ ] **Print Preview:** Users can preview before printing
- [ ] **Download Option:** Can download as PDF file
- [ ] **Browser Compatibility:** Works in Chrome, Edge, Safari (BRD requirement)
- [ ] **Error Handling:** Graceful failure with user-friendly message
- [ ] **Saved to Record:** PDF saved/linked to visit for future access

---

### Appointment Scheduling

**Date/Time Handling Review:**

```typescript
// ✅ GOOD: Proper date handling, timezone awareness, validation
export async function createAppointment(data: AppointmentCreateInput) {
  // Validate date is in the future
  const appointmentDate = new Date(data.date);
  if (appointmentDate < new Date()) {
    throw new Error('Cannot schedule appointments in the past');
  }

  // Check for existing appointment on same day (optional based on clinic needs)
  const existingCount = await prisma.appointment.count({
    where: {
      patientId: data.patientId,
      date: {
        gte: startOfDay(appointmentDate),
        lte: endOfDay(appointmentDate)
      },
      status: { not: 'CANCELLED' }
    }
  });

  if (existingCount > 0) {
    throw new Error('Patient already has an appointment on this date');
  }

  return await prisma.appointment.create({
    data: {
      ...data,
      status: 'SCHEDULED'
    },
    include: { patient: true }
  });
}

// ❌ BAD: No date validation, no duplicate check
export async function createAppointment(data: any) {
  return await prisma.appointment.create({ data });
}
```

**Checklist:**

- [ ] **Date Validation:** Cannot schedule past dates
- [ ] **Duplicate Prevention:** Warn or prevent double-booking (design choice)
- [ ] **Status Management:** Scheduled → Completed/Cancelled/No-show
- [ ] **Daily View:** Filter appointments by specific date
- [ ] **Today's Queue:** Separate view for today's appointments only
- [ ] **Walk-in Support:** Can add unscheduled patients to today's queue
- [ ] **Patient Association:** Appointments linked to patient records
- [ ] **Status Updates:** One-click status change with confirmation
- [ ] **Date Navigation:** Easy next/previous day navigation
- [ ] **Empty State:** Clear message when no appointments

---

### Patient History

**Performance Optimization Review:**

```typescript
// ✅ GOOD: Pagination, proper query optimization, date filtering
export async function getPatientHistory(
  patientId: string,
  options: { page?: number; pageSize?: number; startDate?: Date; endDate?: Date }
) {
  const { page = 1, pageSize = 20, startDate, endDate } = options;

  const where = {
    patientId,
    ...(startDate || endDate ? {
      createdAt: {
        ...(startDate && { gte: startDate }),
        ...(endDate && { lte: endDate })
      }
    } : {})
  };

  const [visits, total] = await Promise.all([
    prisma.visit.findMany({
      where,
      include: {
        medications: true
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize
    }),
    prisma.visit.count({ where })
  ]);

  return {
    visits,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize)
    }
  };
}

// ❌ BAD: No pagination, loads all data (performance issue for many visits)
export async function getPatientHistory(patientId: string) {
  return await prisma.visit.findMany({
    where: { patientId },
    include: { medications: true }
  });
}
```

**Checklist:**

- [ ] **Performance:** Loads <2 seconds for 50+ visits (BRD requirement)
- [ ] **Pagination:** Loads visits in chunks (10-20 per page)
- [ ] **Date Filtering:** Can filter by date range
- [ ] **Visit Details:** Click to expand/view full visit details
- [ ] **Chronological Order:** Most recent visits first
- [ ] **Complete Data:** Shows vitals, complaints, diagnosis, medications
- [ ] **Print History:** Can print comprehensive history report
- [ ] **Empty State:** Clear message when no visit history
- [ ] **Query Optimization:** Proper indexes on patientId + createdAt

---

### Data Export

**Large Dataset Handling:**

```typescript
// ✅ GOOD: Streaming for large datasets, proper CSV formatting
export async function exportPatientsCSV(options: ExportOptions): Promise<string> {
  const patients = await prisma.patient.findMany({
    where: options.filters,
    include: {
      _count: { select: { visits: true } }
    }
  });

  const csvWriter = createObjectCsvStringifier({
    header: [
      { id: 'id', title: 'Patient ID' },
      { id: 'name', title: 'Name' },
      { id: 'age', title: 'Age' },
      { id: 'gender', title: 'Gender' },
      { id: 'phone', title: 'Phone' },
      { id: 'email', title: 'Email' },
      { id: 'visitCount', title: 'Total Visits' },
      { id: 'createdAt', title: 'Registered On' }
    ]
  });

  const records = patients.map(p => ({
    id: p.id,
    name: p.name,
    age: p.age,
    gender: p.gender,
    phone: p.phone,
    email: p.email || '',
    visitCount: p._count.visits,
    createdAt: format(p.createdAt, 'yyyy-MM-dd')
  }));

  return csvWriter.getHeaderString() + csvWriter.stringifyRecords(records);
}

// ❌ BAD: Exports raw JSON, poor formatting, no headers
export async function exportPatientsCSV() {
  const patients = await prisma.patient.findMany();
  return JSON.stringify(patients);
}
```

**Checklist:**

- [ ] **CSV Format:** Proper headers, comma-separated, quoted strings
- [ ] **PDF Format:** Professional layout matching prescription style
- [ ] **Large Datasets:** Can export 1000+ records (BRD requirement)
- [ ] **Date Range Options:** Filter exports by date
- [ ] **File Naming:** Includes timestamp (e.g., `patients_2026-05-07.csv`)
- [ ] **Download Trigger:** Browser save dialog opens automatically
- [ ] **Complete Data:** All relevant fields exported
- [ ] **Progress Indicator:** Loading state for large exports
- [ ] **Error Handling:** Graceful failure with retry option

---

## Security Review Checklist

**Critical Security Issues (Must Block PR):**

- [ ] **Authentication:** JWT tokens properly validated on all protected routes
- [ ] **Authorization:** Single-user model enforced (no unauthorized access)
- [ ] **SQL Injection:** Parameterized queries only (Prisma handles this)
- [ ] **XSS Prevention:** User input sanitized, React escapes by default
- [ ] **CSRF Protection:** CSRF tokens on state-changing requests
- [ ] **Password Security:** Bcrypt with salt rounds ≥10
- [ ] **Environment Variables:** No secrets in code, use `.env`
- [ ] **HTTPS Enforcement:** Production uses HTTPS only
- [ ] **Data Encryption:** Database encryption at rest (cloud provider)
- [ ] **Input Validation:** All inputs validated server-side (never trust client)
- [ ] **Rate Limiting:** API rate limits to prevent abuse
- [ ] **Error Messages:** No sensitive info exposed in error responses

---

## Performance Review Checklist

**BRD Performance Requirements:**

- [ ] **Page Load:** <2 seconds (BRD requirement)
  - Measure with Lighthouse CI
  - Check bundle size (<500KB initial)
  - Code splitting for routes

- [ ] **Patient Search:** <5 seconds (BRD requirement)
  - Database indexes on name, phone
  - Debouncing on search input (300ms)
  - Limit results (pagination)

- [ ] **Consultation Recording:** <3 minutes total (BRD requirement)
  - Form optimized for speed
  - Auto-save draft every 30s
  - Minimal required fields

- [ ] **Prescription Generation:** <10 seconds
  - PDF generation async if needed
  - Show loading indicator
  - Cache clinic header/footer

---

## Common Issues & How to Fix

### Issue 1: Missing Error Handling

**❌ Problem:**
```typescript
export async function getPatient(id: string) {
  const patient = await prisma.patient.findUnique({ where: { id } });
  return patient; // Could be null!
}
```

**✅ Solution:**
```typescript
export async function getPatient(id: string) {
  const patient = await prisma.patient.findUnique({ where: { id } });
  
  if (!patient) {
    throw new AppError('Patient not found', 404);
  }
  
  return patient;
}
```

### Issue 2: No Loading States

**❌ Problem:**
```typescript
export function PatientList() {
  const [patients, setPatients] = useState([]);
  
  useEffect(() => {
    api.getPatients().then(setPatients);
  }, []);
  
  return <div>{patients.map(p => <PatientCard key={p.id} {...p} />)}</div>;
}
```

**✅ Solution:**
```typescript
export function PatientList() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    api.getPatients()
      .then(setPatients)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);
  
  if (loading) return <Spinner />;
  if (error) return <Alert variant="error">{error}</Alert>;
  if (patients.length === 0) return <EmptyState message="No patients yet" />;
  
  return <div>{patients.map(p => <PatientCard key={p.id} {...p} />)}</div>;
}
```

### Issue 3: TypeScript `any` Types

**❌ Problem:**
```typescript
export function PatientForm({ patient }: any) {
  const handleSubmit = (data: any) => {
    // No type safety!
  };
}
```

**✅ Solution:**
```typescript
interface PatientFormProps {
  patient?: Patient;
  onSubmit: (data: PatientFormData) => Promise<void>;
  onCancel?: () => void;
}

export function PatientForm({ patient, onSubmit, onCancel }: PatientFormProps) {
  const handleSubmit = async (data: PatientFormData) => {
    await onSubmit(data);
  };
}
```

### Issue 4: N+1 Query Problem

**❌ Problem:**
```typescript
export async function getAppointmentsWithPatients() {
  const appointments = await prisma.appointment.findMany();
  
  for (const appt of appointments) {
    appt.patient = await prisma.patient.findUnique({ 
      where: { id: appt.patientId } 
    }); // N+1 queries!
  }
  
  return appointments;
}
```

**✅ Solution:**
```typescript
export async function getAppointmentsWithPatients() {
  return await prisma.appointment.findMany({
    include: { patient: true } // Single query with join
  });
}
```

---

## Review Outcome Classification

### ✅ APPROVED

**Criteria:**
- All critical issues resolved
- Code quality meets standards
- Tests pass with adequate coverage
- BRD requirements fully met
- No security vulnerabilities
- Performance meets targets

**Action:** Merge to main

---

### 🔄 REQUEST CHANGES

**Criteria:**
- Critical or high-severity issues found
- Missing tests or inadequate coverage
- Security vulnerabilities discovered
- Performance regressions
- BRD requirements not fully met

**Action:** Block merge, provide detailed feedback, re-review after fixes

---

### 💬 COMMENT (Optional Improvements)

**Criteria:**
- Low-severity issues or suggestions
- Code works but could be cleaner
- Minor style inconsistencies
- Optional enhancements

**Action:** Can merge, but improvements noted for future

---

## Feedback Template

```markdown
## Code Review: [Feature Name]

**Reviewer:** Code Review Agent  
**Date:** [Date]  
**Decision:** ✅ APPROVED | 🔄 REQUEST CHANGES | 💬 COMMENT

---

### Summary
[Overall assessment in 2-3 sentences]

---

### Code Quality Assessment

**Score:** X/10

**Strengths:**
- [Positive point 1]
- [Positive point 2]

**Areas for Improvement:**
- [Improvement 1]
- [Improvement 2]

---

### Issues Found

#### [CRITICAL] Issue Title

**File:** `path/to/file.ts`  
**Line(s):** 45-50

**Problem:**
[Describe the issue]

**Impact:**
[Why this matters - security, data loss, performance, etc.]

**Recommendation:**
[Specific fix with code example if applicable]

```typescript
// Current code
[problematic code]

// Suggested fix
[corrected code]
```

---

#### [HIGH] Issue Title

[Same format as above]

---

#### [MEDIUM] Issue Title

[Same format as above]

---

#### [LOW] Issue Title

[Same format as above]

---

### Correctness Assessment

- [ ] Logic implements requirements correctly
- [ ] Edge cases handled
- [ ] Error scenarios covered
- [ ] Data validation present
- [ ] Type safety enforced

**Issues:**
- [List any correctness concerns]

---

### Consistency Assessment

- [ ] Follows naming conventions
- [ ] Matches existing file structure
- [ ] API design consistent
- [ ] Component patterns consistent
- [ ] Code style matches project

**Issues:**
- [List any consistency concerns]

---

### Testing Assessment

**Coverage:** X%

- [ ] Unit tests adequate
- [ ] Integration tests present
- [ ] E2E tests for critical paths
- [ ] Edge cases tested

**Issues:**
- [List any testing gaps]

---

### Performance Assessment

- [ ] Meets BRD performance targets
- [ ] No obvious bottlenecks
- [ ] Database queries optimized
- [ ] Bundle size acceptable

**Issues:**
- [List any performance concerns]

---

### Security Assessment

- [ ] Authentication/authorization proper
- [ ] Input validation present
- [ ] No sensitive data exposed
- [ ] SQL injection prevented
- [ ] XSS prevented

**Issues:**
- [List any security concerns]

---

### Action Items

**Must Fix (Blocking):**
1. [Critical issue 1]
2. [Critical issue 2]

**Should Fix (Recommended):**
1. [High priority issue 1]
2. [High priority issue 2]

**Nice to Have:**
1. [Optional improvement 1]
2. [Optional improvement 2]

---

### Next Steps

**If APPROVED:**
- Merge to main
- Deploy to staging for further testing

**If REQUEST CHANGES:**
- Address all "Must Fix" items
- Re-submit for review
- Do not merge until approved

**If COMMENT:**
- Can merge if time-sensitive
- Create follow-up tickets for improvements

---

### Final Notes
[Any additional context or recommendations]
```

---

## Code Review SLAs

**Review Turnaround:**
- Small PRs (<200 lines): 4 hours
- Medium PRs (200-500 lines): 1 day
- Large PRs (>500 lines): 2 days

**Re-Review After Changes:**
- Critical fixes only: 2 hours
- Full re-review: 4 hours

---

## Best Practices for Developers

### Before Requesting Review

1. **Self-Review First:** Read your own PR as if reviewing someone else's code
2. **Run All Tests:** Ensure 100% pass rate locally
3. **Check Linting:** No warnings or errors
4. **Update Documentation:** If API or features changed
5. **Write Meaningful PR Description:** Explain *why*, not just *what*
6. **Keep PRs Small:** Aim for <500 lines per PR
7. **One Feature Per PR:** Makes review easier and rollback safer

### During Review Process

1. **Respond to All Comments:** Even if just "Fixed" or "Good point"
2. **Ask Questions:** If feedback is unclear, ask for clarification
3. **Don't Take It Personally:** Reviews improve code quality, not judge developers
4. **Explain Trade-offs:** If you disagree with feedback, explain your reasoning
5. **Update PR Description:** If scope changes during review

### After Approval

1. **Squash or Rebase:** Keep main branch history clean
2. **Delete Branch:** After successful merge
3. **Monitor Production:** Watch for issues after deployment
4. **Update Documentation:** If not done during development

---

## Code Review Agent Commitments

As the Code Review Agent, I commit to:

1. **Thorough Reviews:** Every line of code examined with care
2. **Constructive Feedback:** Focus on improvement, not criticism
3. **Clear Explanations:** Always explain *why* something is an issue
4. **Timely Reviews:** Meet SLA turnaround times
5. **Consistency:** Apply same standards to all code
6. **Education:** Help developers grow through feedback
7. **Uncompromising Quality:** Block PRs that don't meet standards

---

## Continuous Improvement

This framework is a living document. As we learn what works (and what doesn't), we'll update these guidelines.

**Feedback Welcome:** If you have suggestions for improving the review process or these guidelines, please raise them!

---

**Document Control**

**Version:** 1.0  
**Author:** Code Review Agent  
**Review Status:** Active  
**Next Review Date:** After Phase 1 completion

---

**END OF CODE REVIEW FRAMEWORK**
