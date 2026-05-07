# Implementation Execution Plan: Patient Management Application

**Document Type:** Technical Implementation Roadmap  
**Date:** May 7, 2026  
**Status:** Ready for Development  
**Related:** Doc_BRD.md, Doc_Brainstorming_Analysis.md, Doc_Implementation_Plan.md, Doc_Worktree_Strategy.md

---

## Executive Summary

This document provides a concrete, step-by-step implementation plan for building the Patient Management Application. It includes specific file paths, code structure, test requirements, and verification checkpoints for each phase.

**Total Deliverables:** ~85 files across backend, frontend, tests, and configuration  
**Estimated Timeline:** 4 weeks (28 days)  
**Architecture:** React + TypeScript frontend | Node.js + Express + Prisma backend | PostgreSQL database

---

## Technology Stack (Final)

### Frontend
- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **State Management:** React Query (TanStack Query) + Zustand
- **Routing:** React Router v6
- **Form Handling:** React Hook Form + Zod validation
- **PDF Generation:** jsPDF + jspdf-autotable
- **HTTP Client:** Axios

### Backend
- **Runtime:** Node.js 20+
- **Framework:** Express.js
- **Database ORM:** Prisma
- **Authentication:** JWT (jsonwebtoken)
- **Validation:** Zod
- **PDF Generation:** PDFKit
- **Testing:** Jest + Supertest

### Database
- **RDBMS:** PostgreSQL 15+
- **Schema Management:** Prisma Migrations
- **Connection Pooling:** Built-in Prisma connection pool

### DevOps
- **Deployment:** Vercel (frontend) + Railway (backend)
- **CI/CD:** GitHub Actions
- **Environment:** Docker (local development)

---

## UI/UX Design Specifications

This section defines the complete user interface design system for the Patient Management Application, aligned with BRD requirements for simplicity, speed, and minimal training.

### Design Principles (Based on BRD Requirements)

#### 1. Speed-First Design
- **Target:** Complete consultation recording in 2-3 minutes
- **Approach:** Minimize clicks, use single-page forms, implement auto-save
- **No unnecessary navigation:** Keep related data on one screen

#### 2. Minimal Cognitive Load
- **Simple, clean interfaces** with clear visual hierarchy
- **Consistent patterns** across all pages
- **Immediate feedback** for all user actions
- **Progressive disclosure:** Show advanced options only when needed

#### 3. Desktop-Optimized
- **Primary device:** Desktop/Laptop (1366x768 minimum, optimized for 1920x1080)
- **Keyboard-friendly:** Tab navigation, Enter to submit, Escape to cancel
- **Large click targets:** Minimum 44x44px for buttons

#### 4. Medical Context Awareness
- **Professional appearance:** Suitable for clinical environment
- **Data-dense when needed:** Patient history, vitals comparison
- **Clear readability:** Legible fonts, proper contrast ratios

---

### Design System

#### Color Palette

**Primary Colors:**
```css
--primary-50:  #eff6ff;   /* Light blue backgrounds */
--primary-100: #dbeafe;
--primary-500: #3b82f6;   /* Primary buttons, links */
--primary-600: #2563eb;   /* Hover states */
--primary-700: #1d4ed8;   /* Active states */
```

**Semantic Colors:**
```css
--success: #10b981;    /* Completed appointments, confirmations */
--warning: #f59e0b;    /* Warnings, pending states */
--danger:  #ef4444;    /* Errors, cancelled appointments */
--info:    #3b82f6;    /* Informational messages */
```

**Neutral Colors:**
```css
--gray-50:  #f9fafb;   /* Page background */
--gray-100: #f3f4f6;   /* Card backgrounds */
--gray-200: #e5e7eb;   /* Borders */
--gray-300: #d1d5db;   /* Disabled states */
--gray-700: #374151;   /* Body text */
--gray-900: #111827;   /* Headings */
```

**Vitals-Specific Colors:**
```css
--vitals-normal:  #10b981;  /* Normal range vitals */
--vitals-warning: #f59e0b;  /* Borderline vitals */
--vitals-danger:  #ef4444;  /* Abnormal vitals */
```

#### Typography

**Font Family:**
```css
--font-sans: 'Inter', system-ui, -apple-system, sans-serif;
--font-mono: 'JetBrains Mono', 'Courier New', monospace;
```

**Font Sizes:**
```css
--text-xs:   0.75rem;   /* 12px - Labels, captions */
--text-sm:   0.875rem;  /* 14px - Secondary text */
--text-base: 1rem;      /* 16px - Body text */
--text-lg:   1.125rem;  /* 18px - Large body */
--text-xl:   1.25rem;   /* 20px - Section headers */
--text-2xl:  1.5rem;    /* 24px - Page titles */
--text-3xl:  1.875rem;  /* 30px - Hero text */
```

**Font Weights:**
```css
--font-normal:   400;
--font-medium:   500;   /* Buttons, labels */
--font-semibold: 600;   /* Section headings */
--font-bold:     700;   /* Page titles */
```

#### Spacing System

**Tailwind-based spacing scale:**
```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px - Standard padding */
--space-6: 1.5rem;    /* 24px - Section spacing */
--space-8: 2rem;      /* 32px - Large gaps */
```

#### Border Radius

```css
--radius-sm: 0.25rem;  /* 4px - Inputs */
--radius-md: 0.375rem; /* 6px - Buttons */
--radius-lg: 0.5rem;   /* 8px - Cards */
--radius-xl: 0.75rem;  /* 12px - Modals */
```

#### Shadows

```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
```

---

### Component Library

#### 1. Buttons

**Primary Button:**
```tsx
<button className="btn-primary">
  /* Solid blue background, white text */
  /* Use for: Save, Submit, Confirm actions */
</button>
```

**Secondary Button:**
```tsx
<button className="btn-secondary">
  /* Gray background, dark text */
  /* Use for: Cancel, Back, secondary actions */
</button>
```

**Danger Button:**
```tsx
<button className="btn-danger">
  /* Red background, white text */
  /* Use for: Delete, Remove actions */
</button>
```

**Button States:**
- Default: Solid color
- Hover: Slightly darker shade
- Active: Darker + slight scale down
- Disabled: Reduced opacity + cursor not-allowed
- Loading: Spinner icon + "Processing..." text

#### 2. Input Fields

**Text Input:**
```tsx
<input 
  type="text" 
  className="input-field"
  placeholder="Enter patient name..."
/>
/* 
  - Full width by default
  - Border on all sides
  - Focus: blue ring
  - Error: red border + error message below
*/
```

**Textarea:**
```tsx
<textarea 
  className="input-field" 
  rows={4}
  placeholder="Describe symptoms..."
/>
```

**Select Dropdown:**
```tsx
<select className="input-field">
  <option value="">Select gender</option>
  <option value="Male">Male</option>
  <option value="Female">Female</option>
  <option value="Other">Other</option>
</select>
```

**Date Input:**
```tsx
<input 
  type="date" 
  className="input-field"
/>
```

**Number Input with Validation:**
```tsx
<input 
  type="number" 
  className="input-field"
  min="0"
  step="0.1"
  placeholder="98.6"
/>
```

#### 3. Cards

**Standard Card:**
```tsx
<div className="card">
  /* White background, rounded corners, shadow */
  /* Use for: Forms, data display, grouped content */
</div>
```

**Interactive Card (clickable):**
```tsx
<div className="card cursor-pointer hover:shadow-lg transition-shadow">
  /* Adds hover effect for clickable cards */
</div>
```

#### 4. Tables

**Patient/Data Table:**
```tsx
<table className="w-full">
  <thead className="bg-gray-50 border-b">
    <tr>
      <th className="text-left px-4 py-3 font-semibold text-sm">Name</th>
      <th className="text-left px-4 py-3 font-semibold text-sm">Phone</th>
      <th className="text-right px-4 py-3 font-semibold text-sm">Actions</th>
    </tr>
  </thead>
  <tbody>
    <tr className="border-b hover:bg-gray-50">
      <td className="px-4 py-3">John Doe</td>
      <td className="px-4 py-3">555-1234</td>
      <td className="px-4 py-3 text-right">
        <button className="text-blue-600">View</button>
      </td>
    </tr>
  </tbody>
</table>
```

#### 5. Navigation

**Sidebar Navigation:**
```tsx
<nav className="w-64 bg-white border-r h-screen fixed left-0 top-0">
  <div className="p-6">
    <h1 className="text-xl font-bold">Clinic Name</h1>
  </div>
  <ul>
    <li className="px-6 py-3 hover:bg-gray-50 cursor-pointer">
      Dashboard
    </li>
    <li className="px-6 py-3 hover:bg-gray-50 cursor-pointer">
      Patients
    </li>
    {/* ... more items */}
  </ul>
</nav>
```

#### 6. Modals/Dialogs

**Confirmation Modal:**
```tsx
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  <div className="bg-white rounded-xl p-6 max-w-md w-full">
    <h2 className="text-xl font-bold mb-4">Confirm Action</h2>
    <p className="text-gray-700 mb-6">Are you sure?</p>
    <div className="flex gap-4 justify-end">
      <button className="btn-secondary">Cancel</button>
      <button className="btn-danger">Delete</button>
    </div>
  </div>
</div>
```

#### 7. Form Validation Display

**Error Message:**
```tsx
{errors.fieldName && (
  <p className="text-red-500 text-sm mt-1">
    {errors.fieldName.message}
  </p>
)}
```

**Success Message:**
```tsx
<div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
  <p className="text-green-800">Patient saved successfully!</p>
</div>
```

#### 8. Loading States

**Spinner:**
```tsx
<div className="flex items-center justify-center py-8">
  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
</div>
```

**Skeleton Loader:**
```tsx
<div className="animate-pulse">
  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
</div>
```

---

### Page Layouts & Wireframes

#### Layout Structure

**Master Layout:**
```
┌─────────────────────────────────────────────┐
│  Header (64px)                              │
├──────────┬──────────────────────────────────┤
│          │                                  │
│ Sidebar  │  Main Content Area               │
│ (256px)  │  (Scrollable)                    │
│          │                                  │
│ - Logo   │  ┌────────────────────────┐     │
│ - Nav    │  │ Page Title             │     │
│          │  │                        │     │
│          │  │ Breadcrumbs            │     │
│          │  ├────────────────────────┤     │
│          │  │                        │     │
│          │  │ Content Cards/Forms    │     │
│          │  │                        │     │
│          │  └────────────────────────┘     │
│          │                                  │
└──────────┴──────────────────────────────────┘
```

---

#### 1. Login Page

**Layout:** Centered, no sidebar
```
┌─────────────────────────────────────┐
│                                     │
│         ┌───────────────┐           │
│         │  Clinic Logo  │           │
│         └───────────────┘           │
│                                     │
│      ┌──────────────────┐           │
│      │ Email            │           │
│      ├──────────────────┤           │
│      │ Password         │           │
│      ├──────────────────┤           │
│      │  [Login Button]  │           │
│      └──────────────────┘           │
│                                     │
└─────────────────────────────────────┘
```

**Key Features:**
- Clean, minimal design
- Large input fields
- Clear error messages below fields
- "Remember me" checkbox
- Forgot password link (for future)

---

#### 2. Dashboard Page

**URL:** `/dashboard`

**Layout:**
```
┌─────────────────────────────────────────────┐
│  Dashboard                         Dr. Name  │
├─────────────────────────────────────────────┤
│                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│  │ Today's  │ │  Total   │ │Scheduled │    │
│  │ Visits   │ │ Patients │ │   for    │    │
│  │   12     │ │   450    │ │ Tomorrow │    │
│  └──────────┘ └──────────┘ └──────────┘    │
│                                             │
│  Today's Appointments                       │
│  ┌─────────────────────────────────────┐   │
│  │ 10:00 AM - John Doe     [Start]     │   │
│  │ 10:30 AM - Jane Smith   [Start]     │   │
│  │ 11:00 AM - Bob Johnson  [Start]     │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Recent Patients                 [View All] │
│  ┌─────────────────────────────────────┐   │
│  │ • Alice Brown - 2 hours ago         │   │
│  │ • Charlie Davis - 4 hours ago       │   │
│  └─────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
```

**Key Features:**
- Quick stats cards at top
- Today's appointment queue (primary focus)
- Quick access to recent patients
- Search bar in header for fast patient lookup

---

#### 3. Patient List Page

**URL:** `/patients`

**Layout:**
```
┌─────────────────────────────────────────────┐
│  Patients                    [+ New Patient]│
├─────────────────────────────────────────────┤
│                                             │
│  [Search: name or phone...]                 │
│                                             │
│  ┌─────┬──────────┬────────┬────┬────────┐ │
│  │Name │  Phone   │ Gender │Age │Actions │ │
│  ├─────┼──────────┼────────┼────┼────────┤ │
│  │John │555-1234  │ Male   │ 45 │View Edit│
│  │Jane │555-5678  │Female  │ 32 │View Edit│
│  │Bob  │555-9012  │ Male   │ 67 │View Edit│
│  └─────┴──────────┴────────┴────┴────────┘ │
│                                             │
│  Showing 1-20 of 450    [< 1 2 3 ... 23 >] │
│                                             │
└─────────────────────────────────────────────┘
```

**Key Features:**
- Prominent "+ New Patient" button (top right)
- Search bar with auto-complete (debounced)
- Sortable table columns
- Pagination controls
- Quick actions: View, Edit (inline)

---

#### 4. Patient Profile Page

**URL:** `/patients/:id`

**Layout:**
```
┌─────────────────────────────────────────────┐
│  ← Back to Patients                         │
├─────────────────────────────────────────────┤
│  John Doe                           [Edit]  │
│  Male, 45 years • 555-1234                  │
│                                             │
│  ┌───────────────┬───────────────────────┐ │
│  │ Personal Info │ Appointment History   │ │
│  ├───────────────┴───────────────────────┤ │
│  │ Age: 45                               │ │
│  │ Gender: Male                          │ │
│  │ Phone: 555-1234                       │ │
│  │ Address: 123 Main St                  │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  Visit History              [+ New Visit]   │
│  ┌─────────────────────────────────────┐   │
│  │ May 5, 2026                         │   │
│  │ BP: 120/80  Temp: 98.6°F           │   │
│  │ Diagnosis: Common cold              │   │
│  │ [View Details] [Print Prescription] │   │
│  ├─────────────────────────────────────┤   │
│  │ April 20, 2026                      │   │
│  │ ...                                 │   │
│  └─────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
```

**Key Features:**
- Patient header with key info
- Tabbed or sectioned layout
- Large "+ New Visit" button
- Visit history timeline (most recent first)
- Quick actions on each visit

---

#### 5. New Consultation Page (CRITICAL - Most Used)

**URL:** `/patients/:id/visits/new`

**Layout:** Single-page form (all sections visible, no tabs)
```
┌─────────────────────────────────────────────┐
│  New Consultation - John Doe (45, Male)     │
├─────────────────────────────────────────────┤
│                                             │
│  VITALS (Mandatory) *                       │
│  ┌───────┬───────┬───────┬────────┐        │
│  │ Temp  │  BP   │  BP   │ Pulse  │        │
│  │ (°F)  │(Sys.) │(Dias.)│ (BPM)  │        │
│  ├───────┼───────┼───────┼────────┤        │
│  │[98.6] │[120]  │[ 80]  │[ 72]   │        │
│  └───────┴───────┴───────┴────────┘        │
│                                             │
│  COMPLAINTS / SYMPTOMS *                    │
│  ┌─────────────────────────────────────┐   │
│  │ Fever since yesterday, body aches,  │   │
│  │ mild cough...                       │   │
│  │                                     │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  DIAGNOSIS *                                │
│  ┌─────────────────────────────────────┐   │
│  │ Viral fever, common cold symptoms   │   │
│  │                                     │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  MEDICATIONS                    [+ Add Med] │
│  ┌─────────────────────────────────────┐   │
│  │ 1. Paracetamol 500mg                │   │
│  │    Frequency: 3 times daily         │   │
│  │    Duration: 3 days      [Remove]   │   │
│  ├─────────────────────────────────────┤   │
│  │ 2. Cough syrup 10ml                 │   │
│  │    Frequency: Twice daily           │   │
│  │    Duration: 5 days      [Remove]   │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  [Save & Print Prescription]  [Save Draft]  │
│                                             │
└─────────────────────────────────────────────┘
```

**Key Features:**
- All fields on ONE page (no tabs/wizards)
- Vitals in horizontal row for quick entry
- Large text areas for complaints/diagnosis
- Dynamic medication list (add/remove)
- Auto-save every 30 seconds
- Keyboard shortcuts (Ctrl+S to save)
- Target: Complete in under 3 minutes

**Form Validation:**
- Real-time validation on blur
- Vitals: Numeric validation, range warnings
- Required field indicators (*)
- Prevent submission if mandatory fields empty

---

#### 6. Appointment Scheduling Page

**URL:** `/appointments`

**Layout:**
```
┌─────────────────────────────────────────────┐
│  Appointments          [+ Schedule New]     │
├─────────────────────────────────────────────┤
│                                             │
│  [< May 6, 2026 | Today | May 8, 2026 >]   │
│                                             │
│  Today's Queue (May 7, 2026)                │
│  ┌─────────────────────────────────────┐   │
│  │ 09:00 AM - John Doe                 │   │
│  │ Status: Scheduled    [Start Visit]  │   │
│  ├─────────────────────────────────────┤   │
│  │ 09:30 AM - Jane Smith               │   │
│  │ Status: Completed    [View]         │   │
│  ├─────────────────────────────────────┤   │
│  │ 10:00 AM - Bob Johnson              │   │
│  │ Status: Scheduled    [Start Visit]  │   │
│  ├─────────────────────────────────────┤   │
│  │ 10:30 AM - Alice Brown              │   │
│  │ Status: No-show      [Reschedule]   │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Status Summary:                            │
│  Scheduled: 5 | Completed: 3 | Cancelled: 1│
│                                             │
└─────────────────────────────────────────────┘
```

**Key Features:**
- Daily view (not complex calendar)
- Date navigation (today + prev/next)
- Status badges (color-coded)
- Quick actions per appointment
- Walk-in option (add unscheduled)

---

#### 7. Patient History View

**URL:** `/patients/:id/history`

**Layout:**
```
┌─────────────────────────────────────────────┐
│  ← Back to Patient Profile                  │
├─────────────────────────────────────────────┤
│  John Doe - Visit History                   │
│                                             │
│  Filter: [From: 2026-01-01] [To: 2026-12-31│
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ May 5, 2026 (2 days ago)            │   │
│  │ ┌───────────────────────────────┐   │   │
│  │ │ Vitals: BP 120/80 | Temp 98.6 │   │   │
│  │ │ Diagnosis: Common cold        │   │   │
│  │ │ Medications: 2 prescribed     │   │   │
│  │ │ [View Details][Print Rx]      │   │   │
│  │ └───────────────────────────────┘   │   │
│  ├─────────────────────────────────────┤   │
│  │ April 20, 2026                      │   │
│  │ ┌───────────────────────────────┐   │   │
│  │ │ Vitals: BP 125/82 | Temp 98.4 │   │   │
│  │ │ Diagnosis: Hypertension check │   │   │
│  │ │ [View Details][Print Rx]      │   │   │
│  │ └───────────────────────────────┘   │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Showing 10 of 25 visits    [Load More]     │
│                                             │
└─────────────────────────────────────────────┘
```

**Key Features:**
- Timeline view (most recent first)
- Collapsible visit cards
- Date range filter
- Quick view/print actions
- Vitals trend visualization (optional)

---

#### 8. Prescription Print Preview

**Modal/Overlay:**
```
┌─────────────────────────────────────────────┐
│  Prescription Preview                  [✕]  │
├─────────────────────────────────────────────┤
│  ┌───────────────────────────────────────┐ │
│  │      MEDICAL CLINIC LETTERHEAD        │ │
│  │      Dr. John Smith, MD               │ │
│  │      123 Medical St, City, ST 12345   │ │
│  │                                       │ │
│  │  Date: May 7, 2026                    │ │
│  │                                       │ │
│  │  Patient: John Doe                    │ │
│  │  Age: 45 | Gender: Male               │ │
│  │                                       │ │
│  │  Vitals:                              │ │
│  │  Temperature: 98.6°F                  │ │
│  │  Blood Pressure: 120/80 mmHg          │ │
│  │  Pulse: 72 BPM                        │ │
│  │                                       │ │
│  │  Diagnosis: Common cold               │ │
│  │                                       │ │
│  │  Rx:                                  │ │
│  │  1. Paracetamol 500mg                 │ │
│  │     Dosage: 1 tablet                  │ │
│  │     Frequency: 3 times daily          │ │
│  │     Duration: 3 days                  │ │
│  │                                       │ │
│  │  2. Cough syrup 10ml                  │ │
│  │     Frequency: Twice daily            │ │
│  │     Duration: 5 days                  │ │
│  │                                       │ │
│  │  _____________________                │ │
│  │  Doctor's Signature                   │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  [Download PDF]  [Print]  [Close]           │
│                                             │
└─────────────────────────────────────────────┘
```

**Key Features:**
- Professional medical format
- Clear section headers
- All visit data included
- Download as PDF option
- Direct print button

---

### Responsive Design Guidelines

#### Breakpoints

```css
/* Mobile: Not primary focus, but graceful degradation */
sm: 640px   

/* Tablet: Minimum supported */
md: 768px   

/* Desktop: Primary target */
lg: 1024px  

/* Large Desktop: Optimized for */
xl: 1280px  
2xl: 1536px 
```

#### Mobile Considerations (Future)

While mobile is out of scope for Phase 1, ensure:
- Forms are usable on tablets (768px+)
- Tables scroll horizontally on small screens
- Sidebar collapses to hamburger menu
- Touch targets are 44x44px minimum

---

### Accessibility Standards (WCAG 2.1 Level AA)

#### Color Contrast
- Text on white: Minimum 4.5:1 ratio
- Large text: Minimum 3:1 ratio
- Interactive elements: Clear focus indicators

#### Keyboard Navigation
- All actions accessible via keyboard
- Logical tab order
- Escape to close modals
- Enter to submit forms

#### Screen Reader Support
- Semantic HTML (proper heading levels)
- ARIA labels where needed
- Form labels properly associated
- Error messages announced

#### Focus Indicators
```css
:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}
```

---

### Performance Optimization Strategies

#### Target: < 2 Second Page Load (BRD Requirement)

**Code Splitting:**
```typescript
// Lazy load non-critical pages
const PatientHistory = lazy(() => import('./pages/PatientHistory'));
const DataExport = lazy(() => import('./pages/DataExport'));
```

**Image Optimization:**
- Use WebP format for images
- Lazy load images below fold
- Serve responsive images

**Bundle Size Management:**
- Keep main bundle < 200KB (gzipped)
- Async load heavy libraries (PDF generators)
- Tree-shake unused code

**Caching Strategy:**
```typescript
// React Query cache times
queryClient.setQueryData('patients', {
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
});
```

**Search Optimization:**
- Debounce search input (300ms)
- Server-side pagination
- Database indexing on name/phone fields

---

### Browser Compatibility Matrix

| Browser         | Version | Support Level |
|-----------------|---------|---------------|
| Chrome          | 100+    | Full ✅       |
| Edge            | 100+    | Full ✅       |
| Safari          | 15+     | Full ✅       |
| Firefox         | 98+     | Full ✅       |
| Internet Explorer | Any   | Not Supported ❌ |

**Polyfills Required:**
- None (modern browsers only)

**CSS Features Used:**
- CSS Grid
- Flexbox
- CSS Custom Properties (variables)
- Modern selectors (:focus-visible)

---

### Animation & Transitions

**Principles:**
- Subtle, purposeful animations
- Fast transitions (150-300ms)
- Respect prefers-reduced-motion

**Common Transitions:**
```css
/* Button hover */
transition: background-color 150ms ease-in-out;

/* Modal appearance */
transition: opacity 200ms ease-in, transform 200ms ease-out;

/* Page transitions */
transition: opacity 300ms ease-in-out;
```

---

## Phase 1A: Foundation & Project Setup (Days 1-4)

**Worktree:** `feature/foundation-setup`  
**Goal:** Establish project structure, database schema, authentication, and API foundation

### 1.1 Project Initialization

#### Backend Setup

**Files to Create:**
```
backend/
├── package.json
├── tsconfig.json
├── .env.example
├── .gitignore
├── src/
│   ├── server.ts
│   ├── app.ts
│   ├── config/
│   │   ├── database.ts
│   │   └── env.ts
│   ├── middleware/
│   │   ├── errorHandler.ts
│   │   ├── authenticate.ts
│   │   └── validateRequest.ts
│   └── utils/
│       ├── logger.ts
│       └── asyncHandler.ts
└── prisma/
    ├── schema.prisma
    └── seed.ts
```

**Implementation Steps:**

1. **Initialize Backend Project**
```bash
cd c:\Work\Copilot-AI\worktrees\foundation
mkdir backend
cd backend
npm init -y
npm install express cors dotenv bcryptjs jsonwebtoken
npm install @prisma/client
npm install -D typescript @types/node @types/express @types/cors @types/bcryptjs @types/jsonwebtoken
npm install -D prisma ts-node-dev nodemon
npm install -D jest @types/jest ts-jest supertest @types/supertest
npm install zod express-validator
```

2. **Create `backend/package.json` scripts:**
```json
{
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:seed": "ts-node prisma/seed.ts",
    "test": "jest --watchAll=false",
    "test:watch": "jest --watch"
  }
}
```

3. **Create `backend/tsconfig.json`:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

4. **Create `backend/.env.example`:**
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/patient_management"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="24h"

# Server
PORT=5000
NODE_ENV="development"

# CORS
FRONTEND_URL="http://localhost:5173"
```

5. **Create `backend/src/server.ts`:**
```typescript
import app from './app';
import { config } from './config/env';
import { logger } from './utils/logger';

const PORT = config.port;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} in ${config.nodeEnv} mode`);
});
```

6. **Create `backend/src/app.ts`:**
```typescript
import express, { Application } from 'express';
import cors from 'cors';
import { config } from './config/env';
import { errorHandler } from './middleware/errorHandler';

const app: Application = express();

// Middleware
app.use(cors({ origin: config.frontendUrl }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes will be added here

// Error handling (must be last)
app.use(errorHandler);

export default app;
```

7. **Create `backend/src/config/env.ts`:**
```typescript
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('24h'),
  PORT: z.string().transform(Number).default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  FRONTEND_URL: z.string().url(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables:', parsedEnv.error.format());
  process.exit(1);
}

export const config = {
  databaseUrl: parsedEnv.data.DATABASE_URL,
  jwtSecret: parsedEnv.data.JWT_SECRET,
  jwtExpiresIn: parsedEnv.data.JWT_EXPIRES_IN,
  port: parsedEnv.data.PORT,
  nodeEnv: parsedEnv.data.NODE_ENV,
  frontendUrl: parsedEnv.data.FRONTEND_URL,
};
```

8. **Create `backend/src/utils/logger.ts`:**
```typescript
export const logger = {
  info: (message: string, ...meta: any[]) => {
    console.log(`[INFO] ${new Date().toISOString()}:`, message, ...meta);
  },
  error: (message: string, ...meta: any[]) => {
    console.error(`[ERROR] ${new Date().toISOString()}:`, message, ...meta);
  },
  warn: (message: string, ...meta: any[]) => {
    console.warn(`[WARN] ${new Date().toISOString()}:`, message, ...meta);
  },
  debug: (message: string, ...meta: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${new Date().toISOString()}:`, message, ...meta);
    }
  },
};
```

9. **Create `backend/src/utils/asyncHandler.ts`:**
```typescript
import { Request, Response, NextFunction } from 'express';

type AsyncFunction = (req: Request, res: Response, next: NextFunction) => Promise<any>;

export const asyncHandler = (fn: AsyncFunction) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
```

10. **Create `backend/src/middleware/errorHandler.ts`:**
```typescript
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    logger.error(`AppError: ${err.message}`, { statusCode: err.statusCode, path: req.path });
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  logger.error(`Unexpected Error: ${err.message}`, { stack: err.stack, path: req.path });
  
  return res.status(500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
};
```

### 1.2 Database Schema Design

**Create `backend/prisma/schema.prisma`:**

```prisma
// This is your Prisma schema file

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// User/Doctor model (single user for Phase 1)
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  name      String
  role      String   @default("doctor")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}

// Patient model
model Patient {
  id          String   @id @default(uuid())
  name        String
  age         Int?
  dateOfBirth DateTime?
  gender      String
  phone       String   @unique
  address     String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  visits      Visit[]
  appointments Appointment[]

  @@index([phone])
  @@index([name])
  @@map("patients")
}

// Visit/Consultation model
model Visit {
  id          String   @id @default(uuid())
  patientId   String
  visitDate   DateTime @default(now())
  
  // Vitals (mandatory)
  temperature Float
  bloodPressureSystolic  Int
  bloodPressureDiastolic Int
  pulse       Int
  
  // Consultation details
  complaints  String   // Patient symptoms (free text)
  diagnosis   String   // Diagnosis notes
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  patient     Patient      @relation(fields: [patientId], references: [id], onDelete: Cascade)
  medications Medication[]

  @@index([patientId])
  @@index([visitDate])
  @@map("visits")
}

// Medication model
model Medication {
  id           String  @id @default(uuid())
  visitId      String
  name         String
  dosage       String
  frequency    String
  duration     String
  instructions String?
  
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  visit        Visit   @relation(fields: [visitId], references: [id], onDelete: Cascade)

  @@index([visitId])
  @@map("medications")
}

// Appointment model
model Appointment {
  id             String   @id @default(uuid())
  patientId      String
  appointmentDate DateTime
  status         String   @default("scheduled") // scheduled, completed, cancelled, no-show
  notes          String?
  
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  patient        Patient  @relation(fields: [patientId], references: [id], onDelete: Cascade)

  @@index([patientId])
  @@index([appointmentDate])
  @@map("appointments")
}
```

**Run migrations:**
```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
```

### 1.3 Authentication System

**Create `backend/src/middleware/authenticate.ts`:**
```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { AppError } from './errorHandler';
import { asyncHandler } from '../utils/asyncHandler';

interface JwtPayload {
  userId: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticate = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('No token provided', 401);
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    throw new AppError('Invalid or expired token', 401);
  }
});
```

**Create `backend/src/routes/auth.ts`:**
```typescript
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { config } from '../config/env';
import { AppError } from '../middleware/errorHandler';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();
const prisma = new PrismaClient();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// POST /api/auth/login
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({ where: { email } });
  
  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  
  if (!isPasswordValid) {
    throw new AppError('Invalid credentials', 401);
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  });
}));

// POST /api/auth/register (for initial setup only)
router.post('/register', asyncHandler(async (req, res) => {
  const { email, password, name } = loginSchema.extend({ name: z.string() }).parse(req.body);

  const existingUser = await prisma.user.findUnique({ where: { email } });
  
  if (existingUser) {
    throw new AppError('User already exists', 400);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
    },
  });

  const token = jwt.sign(
    { userId: user.id, email: user.email },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );

  res.status(201).json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  });
}));

export default router;
```

**Update `backend/src/app.ts` to include auth routes:**
```typescript
// ... existing imports
import authRoutes from './routes/auth';

// ... existing middleware

// Routes
app.use('/api/auth', authRoutes);

// ... rest of the file
```

#### Frontend Setup

**Files to Create:**
```
frontend/
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── index.html
├── .env.example
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── vite-env.d.ts
│   ├── lib/
│   │   ├── api.ts
│   │   └── queryClient.ts
│   ├── store/
│   │   └── authStore.ts
│   ├── types/
│   │   └── index.ts
│   ├── pages/
│   │   ├── Login.tsx
│   │   └── Dashboard.tsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   └── Header.tsx
│   │   └── ProtectedRoute.tsx
│   └── styles/
│       └── globals.css
```

**Implementation Steps:**

1. **Initialize Frontend Project**
```bash
cd c:\Work\Copilot-AI\worktrees\foundation
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
npm install react-router-dom @tanstack/react-query axios zustand
npm install react-hook-form zod @hookform/resolvers
npm install jspdf jspdf-autotable
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

2. **Create `frontend/tailwind.config.js`:**
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

3. **Create `frontend/src/styles/globals.css`:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-gray-50 text-gray-900;
  }
}

@layer components {
  .btn-primary {
    @apply bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors;
  }
  
  .btn-secondary {
    @apply bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors;
  }
  
  .input-field {
    @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500;
  }
  
  .card {
    @apply bg-white rounded-lg shadow-md p-6;
  }
}
```

4. **Create `frontend/.env.example`:**
```env
VITE_API_URL=http://localhost:5000/api
```

5. **Create `frontend/src/lib/api.ts`:**
```typescript
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

6. **Create `frontend/src/store/authStore.ts`:**
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => {
        localStorage.setItem('token', token);
        set({ user, token });
      },
      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
```

7. **Create `frontend/src/types/index.ts`:**
```typescript
export interface Patient {
  id: string;
  name: string;
  age?: number;
  dateOfBirth?: string;
  gender: string;
  phone: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Visit {
  id: string;
  patientId: string;
  visitDate: string;
  temperature: number;
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  pulse: number;
  complaints: string;
  diagnosis: string;
  medications: Medication[];
  createdAt: string;
  updatedAt: string;
}

export interface Medication {
  id: string;
  visitId: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  appointmentDate: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  patient?: Patient;
}
```

### 1.4 Testing Foundation

**Create `backend/tests/setup.ts`:**
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

beforeAll(async () => {
  // Setup test database
});

afterAll(async () => {
  await prisma.$disconnect();
});

afterEach(async () => {
  // Clean up database after each test
  const deleteUsers = prisma.user.deleteMany();
  const deleteAppointments = prisma.appointment.deleteMany();
  const deleteMedications = prisma.medication.deleteMany();
  const deleteVisits = prisma.visit.deleteMany();
  const deletePatients = prisma.patient.deleteMany();

  await prisma.$transaction([
    deleteUsers,
    deleteAppointments,
    deleteMedications,
    deleteVisits,
    deletePatients,
  ]);
});

export { prisma };
```

**Create `backend/tests/auth.test.ts`:**
```typescript
import request from 'supertest';
import app from '../src/app';
import { prisma } from './setup';
import bcrypt from 'bcryptjs';

describe('Authentication', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'doctor@clinic.com',
          password: 'password123',
          name: 'Dr. Smith',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('email', 'doctor@clinic.com');
    });

    it('should not register duplicate email', async () => {
      await prisma.user.create({
        data: {
          email: 'doctor@clinic.com',
          password: await bcrypt.hash('password123', 10),
          name: 'Dr. Smith',
        },
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'doctor@clinic.com',
          password: 'password123',
          name: 'Dr. Smith',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      await prisma.user.create({
        data: {
          email: 'doctor@clinic.com',
          password: await bcrypt.hash('password123', 10),
          name: 'Dr. Smith',
        },
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'doctor@clinic.com',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@clinic.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
    });
  });
});
```

### Phase 1A Verification Checklist

- [ ] Backend server starts without errors (`npm run dev`)
- [ ] Database migrations run successfully
- [ ] `/health` endpoint returns 200 OK
- [ ] User registration creates user in database
- [ ] User login returns JWT token
- [ ] Protected routes reject unauthenticated requests
- [ ] Frontend dev server starts (`npm run dev`)
- [ ] Frontend can connect to backend API
- [ ] All unit tests pass (`npm test`)

**Estimated Time:** 3-4 days

---

## Phase 1B: Patient Management (Days 5-7)

**Worktree:** `feature/patient-management`  
**Goal:** Complete CRUD operations for patients with search functionality

### 2.1 Backend: Patient API

**Create `backend/src/routes/patients.ts`:**
```typescript
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../middleware/errorHandler';
import { authenticate } from '../middleware/authenticate';

const router = Router();
const prisma = new PrismaClient();

// All routes require authentication
router.use(authenticate);

const patientSchema = z.object({
  name: z.string().min(1),
  age: z.number().int().positive().optional(),
  dateOfBirth: z.string().datetime().optional(),
  gender: z.enum(['Male', 'Female', 'Other']),
  phone: z.string().min(10),
  address: z.string().optional(),
});

// GET /api/patients - List all patients with search
router.get('/', asyncHandler(async (req, res) => {
  const { search, page = '1', limit = '20' } = req.query;
  
  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const where = search
    ? {
        OR: [
          { name: { contains: search as string, mode: 'insensitive' as any } },
          { phone: { contains: search as string } },
        ],
      }
    : {};

  const [patients, total] = await Promise.all([
    prisma.patient.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.patient.count({ where }),
  ]);

  res.json({
    patients,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / take),
    },
  });
}));

// GET /api/patients/:id - Get single patient
router.get('/:id', asyncHandler(async (req, res) => {
  const patient = await prisma.patient.findUnique({
    where: { id: req.params.id },
    include: {
      visits: {
        orderBy: { visitDate: 'desc' },
        take: 5,
      },
      appointments: {
        where: {
          appointmentDate: { gte: new Date() },
        },
        orderBy: { appointmentDate: 'asc' },
      },
    },
  });

  if (!patient) {
    throw new AppError('Patient not found', 404);
  }

  res.json(patient);
}));

// POST /api/patients - Create new patient
router.post('/', asyncHandler(async (req, res) => {
  const data = patientSchema.parse(req.body);

  const existingPatient = await prisma.patient.findUnique({
    where: { phone: data.phone },
  });

  if (existingPatient) {
    throw new AppError('Patient with this phone number already exists', 400);
  }

  const patient = await prisma.patient.create({
    data: {
      ...data,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
    },
  });

  res.status(201).json(patient);
}));

// PUT /api/patients/:id - Update patient
router.put('/:id', asyncHandler(async (req, res) => {
  const data = patientSchema.partial().parse(req.body);

  const patient = await prisma.patient.update({
    where: { id: req.params.id },
    data: {
      ...data,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
    },
  });

  res.json(patient);
}));

// DELETE /api/patients/:id - Delete patient
router.delete('/:id', asyncHandler(async (req, res) => {
  await prisma.patient.delete({
    where: { id: req.params.id },
  });

  res.status(204).send();
}));

export default router;
```

**Update `backend/src/app.ts`:**
```typescript
import patientRoutes from './routes/patients';

// ... after auth routes
app.use('/api/patients', patientRoutes);
```

### 2.2 Frontend: Patient Management UI

**Create `frontend/src/pages/Patients/PatientList.tsx`:**
```typescript
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { Patient } from '../../types';

export default function PatientList() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['patients', search, page],
    queryFn: async () => {
      const response = await api.get('/patients', {
        params: { search, page, limit: 20 },
      });
      return response.data;
    },
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Patients</h1>
        <button
          onClick={() => navigate('/patients/new')}
          className="btn-primary"
        >
          Add New Patient
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field max-w-md"
        />
      </div>

      <div className="card">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Name</th>
              <th className="text-left py-2">Age</th>
              <th className="text-left py-2">Gender</th>
              <th className="text-left py-2">Phone</th>
              <th className="text-left py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.patients.map((patient: Patient) => (
              <tr key={patient.id} className="border-b hover:bg-gray-50">
                <td className="py-3">{patient.name}</td>
                <td className="py-3">{patient.age || 'N/A'}</td>
                <td className="py-3">{patient.gender}</td>
                <td className="py-3">{patient.phone}</td>
                <td className="py-3">
                  <button
                    onClick={() => navigate(`/patients/${patient.id}`)}
                    className="text-blue-600 hover:underline mr-3"
                  >
                    View
                  </button>
                  <button
                    onClick={() => navigate(`/patients/${patient.id}/edit`)}
                    className="text-green-600 hover:underline"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <div>
            Showing {data?.patients.length} of {data?.pagination.total} patients
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-secondary disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-4 py-2">
              Page {page} of {data?.pagination.pages}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= data?.pagination.pages}
              className="btn-secondary disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Create `frontend/src/pages/Patients/PatientForm.tsx`:**
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../lib/api';

const patientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  age: z.number().int().positive().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['Male', 'Female', 'Other']),
  phone: z.string().min(10, 'Phone number is required'),
  address: z.string().optional(),
});

type PatientFormData = z.infer<typeof patientSchema>;

export default function PatientForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
  });

  const mutation = useMutation({
    mutationFn: async (data: PatientFormData) => {
      if (id) {
        return api.put(`/patients/${id}`, data);
      }
      return api.post('/patients', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      navigate('/patients');
    },
  });

  const onSubmit = (data: PatientFormData) => {
    mutation.mutate(data);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">
        {id ? 'Edit Patient' : 'Add New Patient'}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name *</label>
          <input {...register('name')} className="input-field" />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Age</label>
            <input
              type="number"
              {...register('age', { valueAsNumber: true })}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Date of Birth</label>
            <input type="date" {...register('dateOfBirth')} className="input-field" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Gender *</label>
          <select {...register('gender')} className="input-field">
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          {errors.gender && (
            <p className="text-red-500 text-sm mt-1">{errors.gender.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Phone *</label>
          <input {...register('phone')} className="input-field" />
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Address</label>
          <textarea {...register('address')} className="input-field" rows={3} />
        </div>

        <div className="flex gap-4 pt-4">
          <button type="submit" className="btn-primary">
            {mutation.isPending ? 'Saving...' : 'Save Patient'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/patients')}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
```

### Phase 1B Verification Checklist

- [ ] Can create new patient with all fields
- [ ] Phone number uniqueness is enforced
- [ ] Search returns results within 2 seconds
- [ ] Pagination works correctly
- [ ] Can edit patient information
- [ ] Can view patient details
- [ ] All form validations working
- [ ] API tests pass for patient endpoints

**Estimated Time:** 2-3 days

---

## Phase 1C: Consultation Workflow (Days 8-11)

**Worktree:** `feature/consultation-workflow`  
**Goal:** Complete visit recording with vitals, complaints, diagnosis, and medications

### 3.1 Backend: Visit & Medication APIs

**Create `backend/src/routes/visits.ts`:**
```typescript
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler';
import { authenticate } from '../middleware/authenticate';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

const medicationSchema = z.object({
  name: z.string().min(1),
  dosage: z.string().min(1),
  frequency: z.string().min(1),
  duration: z.string().min(1),
  instructions: z.string().optional(),
});

const visitSchema = z.object({
  patientId: z.string().uuid(),
  temperature: z.number().positive(),
  bloodPressureSystolic: z.number().int().positive(),
  bloodPressureDiastolic: z.number().int().positive(),
  pulse: z.number().int().positive(),
  complaints: z.string().min(1),
  diagnosis: z.string().min(1),
  medications: z.array(medicationSchema),
});

// POST /api/visits - Create new visit
router.post('/', asyncHandler(async (req, res) => {
  const { medications, ...visitData } = visitSchema.parse(req.body);

  const visit = await prisma.visit.create({
    data: {
      ...visitData,
      medications: {
        create: medications,
      },
    },
    include: {
      medications: true,
      patient: true,
    },
  });

  res.status(201).json(visit);
}));

// GET /api/visits/:id - Get single visit
router.get('/:id', asyncHandler(async (req, res) => {
  const visit = await prisma.visit.findUnique({
    where: { id: req.params.id },
    include: {
      medications: true,
      patient: true,
    },
  });

  if (!visit) {
    throw new AppError('Visit not found', 404);
  }

  res.json(visit);
}));

// GET /api/visits/patient/:patientId - Get patient visit history
router.get('/patient/:patientId', asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const where: any = {
    patientId: req.params.patientId,
  };

  if (startDate || endDate) {
    where.visitDate = {};
    if (startDate) where.visitDate.gte = new Date(startDate as string);
    if (endDate) where.visitDate.lte = new Date(endDate as string);
  }

  const visits = await prisma.visit.findMany({
    where,
    include: {
      medications: true,
    },
    orderBy: { visitDate: 'desc' },
  });

  res.json(visits);
}));

export default router;
```

**Update `backend/src/app.ts`:**
```typescript
import visitRoutes from './routes/visits';

app.use('/api/visits', visitRoutes);
```

### 3.2 Frontend: Consultation Form

**Create `frontend/src/pages/Consultation/NewVisit.tsx`:**
```typescript
import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../lib/api';

const medicationSchema = z.object({
  name: z.string().min(1, 'Medicine name is required'),
  dosage: z.string().min(1, 'Dosage is required'),
  frequency: z.string().min(1, 'Frequency is required'),
  duration: z.string().min(1, 'Duration is required'),
  instructions: z.string().optional(),
});

const visitSchema = z.object({
  patientId: z.string(),
  temperature: z.number().positive('Temperature must be positive'),
  bloodPressureSystolic: z.number().int().positive(),
  bloodPressureDiastolic: z.number().int().positive(),
  pulse: z.number().int().positive(),
  complaints: z.string().min(1, 'Complaints are required'),
  diagnosis: z.string().min(1, 'Diagnosis is required'),
  medications: z.array(medicationSchema),
});

type VisitFormData = z.infer<typeof visitSchema>;

export default function NewVisit() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<VisitFormData>({
    resolver: zodResolver(visitSchema),
    defaultValues: {
      patientId,
      medications: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'medications',
  });

  const mutation = useMutation({
    mutationFn: async (data: VisitFormData) => {
      return api.post('/visits', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visits'] });
      navigate(`/patients/${patientId}`);
    },
  });

  const onSubmit = (data: VisitFormData) => {
    mutation.mutate(data);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">New Consultation</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Vitals Section */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Vitals (Mandatory)</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Temperature (°F)</label>
              <input
                type="number"
                step="0.1"
                {...register('temperature', { valueAsNumber: true })}
                className="input-field"
                placeholder="98.6"
              />
              {errors.temperature && (
                <p className="text-red-500 text-sm mt-1">{errors.temperature.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">BP Systolic</label>
              <input
                type="number"
                {...register('bloodPressureSystolic', { valueAsNumber: true })}
                className="input-field"
                placeholder="120"
              />
              {errors.bloodPressureSystolic && (
                <p className="text-red-500 text-sm mt-1">{errors.bloodPressureSystolic.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">BP Diastolic</label>
              <input
                type="number"
                {...register('bloodPressureDiastolic', { valueAsNumber: true })}
                className="input-field"
                placeholder="80"
              />
              {errors.bloodPressureDiastolic && (
                <p className="text-red-500 text-sm mt-1">{errors.bloodPressureDiastolic.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Pulse (BPM)</label>
              <input
                type="number"
                {...register('pulse', { valueAsNumber: true })}
                className="input-field"
                placeholder="72"
              />
              {errors.pulse && (
                <p className="text-red-500 text-sm mt-1">{errors.pulse.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Complaints Section */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Complaints / Symptoms</h2>
          <textarea
            {...register('complaints')}
            className="input-field"
            rows={4}
            placeholder="Describe patient symptoms..."
          />
          {errors.complaints && (
            <p className="text-red-500 text-sm mt-1">{errors.complaints.message}</p>
          )}
        </div>

        {/* Diagnosis Section */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Diagnosis</h2>
          <textarea
            {...register('diagnosis')}
            className="input-field"
            rows={4}
            placeholder="Enter diagnosis notes..."
          />
          {errors.diagnosis && (
            <p className="text-red-500 text-sm mt-1">{errors.diagnosis.message}</p>
          )}
        </div>

        {/* Medications Section */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Medications</h2>
            <button
              type="button"
              onClick={() =>
                append({ name: '', dosage: '', frequency: '', duration: '', instructions: '' })
              }
              className="btn-secondary text-sm"
            >
              + Add Medication
            </button>
          </div>

          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="border p-4 rounded-md relative">
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                >
                  ✕ Remove
                </button>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">Medicine Name</label>
                    <input
                      {...register(`medications.${index}.name`)}
                      className="input-field"
                      placeholder="e.g., Amoxicillin"
                    />
                    {errors.medications?.[index]?.name && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.medications[index]?.name?.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Dosage</label>
                    <input
                      {...register(`medications.${index}.dosage`)}
                      className="input-field"
                      placeholder="e.g., 500mg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Frequency</label>
                    <input
                      {...register(`medications.${index}.frequency`)}
                      className="input-field"
                      placeholder="e.g., 3 times daily"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Duration</label>
                    <input
                      {...register(`medications.${index}.duration`)}
                      className="input-field"
                      placeholder="e.g., 7 days"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Instructions</label>
                    <input
                      {...register(`medications.${index}.instructions`)}
                      className="input-field"
                      placeholder="e.g., After meals"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4">
          <button type="submit" className="btn-primary" disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving...' : 'Complete Consultation'}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/patients/${patientId}`)}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
```

### Phase 1C Verification Checklist

- [ ] Can create complete visit in under 3 minutes
- [ ] All vitals validation works correctly
- [ ] Can add/remove medications dynamically
- [ ] Form validation prevents incomplete submissions
- [ ] Visit associates correctly with patient
- [ ] Visit data persists to database
- [ ] API tests pass for visit endpoints

**Estimated Time:** 3-4 days

---

## Phase 1D: Prescription Printing (Days 12-14)

**Worktree:** `feature/prescription-printing`  
**Goal:** PDF generation and browser printing

**Create `backend/src/services/prescriptionService.ts`:**
```typescript
import PDFDocument from 'pdfkit';
import { Visit, Patient, Medication } from '@prisma/client';

interface PrescriptionData extends Visit {
  patient: Patient;
  medications: Medication[];
}

export function generatePrescriptionPDF(data: PrescriptionData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const buffers: Buffer[] = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    // Header
    doc.fontSize(20).text('Medical Clinic', { align: 'center' });
    doc.fontSize(12).text('Dr. John Smith, MD', { align: 'center' });
    doc.text('123 Medical Street, City, State 12345', { align: 'center' });
    doc.text('Phone: (555) 123-4567', { align: 'center' });
    
    doc.moveDown(2);
    doc.fontSize(10).text(`Date: ${new Date(data.visitDate).toLocaleDateString()}`, { align: 'right' });

    doc.moveDown();
    doc.fontSize(14).text('PRESCRIPTION', { align: 'center', underline: true });
    doc.moveDown();

    // Patient Info
    doc.fontSize(12).text(`Patient Name: ${data.patient.name}`);
    doc.text(`Age: ${data.patient.age || 'N/A'}`);
    doc.text(`Gender: ${data.patient.gender}`);
    doc.moveDown();

    // Vitals
    doc.text('Vitals:');
    doc.fontSize(10);
    doc.text(`  Temperature: ${data.temperature}°F`);
    doc.text(`  Blood Pressure: ${data.bloodPressureSystolic}/${data.bloodPressureDiastolic} mmHg`);
    doc.text(`  Pulse: ${data.pulse} BPM`);
    doc.moveDown();

    // Diagnosis
    doc.fontSize(12).text('Diagnosis:');
    doc.fontSize(10).text(data.diagnosis);
    doc.moveDown();

    // Medications
    doc.fontSize(12).text('Rx (Medications):');
    doc.moveDown(0.5);
    
    data.medications.forEach((med, index) => {
      doc.fontSize(10);
      doc.text(`${index + 1}. ${med.name}`);
      doc.text(`   Dosage: ${med.dosage}`);
      doc.text(`   Frequency: ${med.frequency}`);
      doc.text(`   Duration: ${med.duration}`);
      if (med.instructions) {
        doc.text(`   Instructions: ${med.instructions}`);
      }
      doc.moveDown(0.5);
    });

    doc.moveDown(2);
    doc.text('_________________________', { align: 'right' });
    doc.text('Doctor Signature', { align: 'right' });

    doc.end();
  });
}
```

**Update `backend/src/routes/visits.ts`:**
```typescript
import { generatePrescriptionPDF } from '../services/prescriptionService';

// GET /api/visits/:id/prescription - Generate prescription PDF
router.get('/:id/prescription', asyncHandler(async (req, res) => {
  const visit = await prisma.visit.findUnique({
    where: { id: req.params.id },
    include: {
      medications: true,
      patient: true,
    },
  });

  if (!visit) {
    throw new AppError('Visit not found', 404);
  }

  const pdfBuffer = await generatePrescriptionPDF(visit);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=prescription-${visit.id}.pdf`);
  res.send(pdfBuffer);
}));
```

**Frontend prescription preview component:**
```typescript
// frontend/src/components/PrescriptionPreview.tsx
import { useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';

interface Props {
  visitId: string;
  onClose: () => void;
}

export default function PrescriptionPreview({ visitId, onClose }: Props) {
  const downloadMutation = useMutation({
    mutationFn: async () => {
      const response = await api.get(`/visits/${visitId}/prescription`, {
        responseType: 'blob',
      });
      return response.data;
    },
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `prescription-${visitId}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    },
  });

  const handlePrint = () => {
    downloadMutation.mutate();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
        <h2 className="text-2xl font-bold mb-4">Prescription</h2>
        <div className="flex gap-4">
          <button onClick={handlePrint} className="btn-primary">
            Download PDF
          </button>
          <button onClick={onClose} className="btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
```

### Phase 1D Verification Checklist

- [ ] Prescription PDF generates successfully
- [ ] All visit data appears in prescription
- [ ] PDF is professional and legible
- [ ] Download functionality works
- [ ] Print dialog opens correctly
- [ ] PDF includes clinic header and footer

**Estimated Time:** 2-3 days

---

## Remaining Phases Summary

### Phase 1E: Appointments (Days 15-17)
- Appointment CRUD API
- Daily queue component
- Calendar view
- Status updates

### Phase 1F: Patient History (Days 18-19)
- History view with timeline
- Date range filtering
- Visit details modal

### Phase 1G: Data Export (Days 20-21)
- CSV export service
- PDF reports
- Export dialog UI

### Phase 1H: Testing & Deployment (Days 22-28)
- E2E test suite (Playwright)
- CI/CD pipeline (GitHub Actions)
- Production deployment
- User documentation

---

## Final Verification Checklist

### Functional Requirements
- [ ] All CRUD operations working
- [ ] Search performs within 2 seconds
- [ ] Consultation completes within 3 minutes
- [ ] Prescriptions print correctly
- [ ] Patient history accessible
- [ ] Data export successful

### Technical Requirements
- [ ] All unit tests passing (>70% coverage)
- [ ] All integration tests passing
- [ ] E2E tests covering critical flows
- [ ] No console errors in production
- [ ] Responsive design verified
- [ ] Cross-browser compatibility tested

### Deployment
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Backup strategy implemented
- [ ] SSL/HTTPS enabled
- [ ] Performance monitoring active

---

## Progress Tracking Template

Create issues in GitHub for each phase with this template:

```markdown
## Phase [X]: [Feature Name]

**Worktree:** `feature/[feature-name]`
**Estimated:** X days

### Backend Tasks
- [ ] API endpoints implemented
- [ ] Validation schemas defined
- [ ] Unit tests written
- [ ] Integration tests passing

### Frontend Tasks
- [ ] UI components created
- [ ] Form validation working
- [ ] API integration complete
- [ ] Responsive design verified

### Testing
- [ ] Manual testing complete
- [ ] Edge cases handled
- [ ] Performance verified

### Documentation
- [ ] API documentation updated
- [ ] Code comments added
- [ ] User guide section written
```

---

**END OF IMPLEMENTATION EXECUTION PLAN**
