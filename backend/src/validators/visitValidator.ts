import { z } from 'zod';

// Medication schema for nested creation
export const medicationSchema = z.object({
  name: z.string().min(2, 'Medication name must be at least 2 characters').max(200, 'Medication name must not exceed 200 characters'),
  dosage: z.string().min(1, 'Dosage is required').max(100, 'Dosage must not exceed 100 characters'),
  frequency: z.string().min(1, 'Frequency is required').max(200, 'Frequency must not exceed 200 characters'),
  duration: z.string().min(1, 'Duration is required').max(100, 'Duration must not exceed 100 characters'),
  instructions: z.string().max(500, 'Instructions must not exceed 500 characters').optional(),
});

// Blood pressure validation helper
const bloodPressureRegex = /^\d{2,3}\/\d{2,3}$/;

const validateBloodPressure = (bp: string) => {
  if (!bloodPressureRegex.test(bp)) {
    return false;
  }
  
  const [systolic, diastolic] = bp.split('/').map(Number);
  
  // Validate ranges
  if (systolic < 80 || systolic > 200) return false;
  if (diastolic < 40 || diastolic > 130) return false;
  if (systolic <= diastolic) return false; // Systolic should be greater than diastolic
  
  return true;
};

// Create visit schema
export const createVisitSchema = z.object({
  patientId: z.string().uuid('Invalid patient ID'),
  complaints: z.string()
    .min(1, 'Complaints are required')
    .max(1000, 'Complaints must not exceed 1000 characters'),
  diagnosis: z.string()
    .max(2000, 'Diagnosis must not exceed 2000 characters')
    .optional(),
  temperature: z.number()
    .min(35, 'Temperature must be at least 35°C (95°F)')
    .max(42, 'Temperature must not exceed 42°C (107°F)')
    .refine((val) => val !== undefined && val !== null, {
      message: 'Temperature is required',
    }),
  bloodPressure: z.string()
    .refine(validateBloodPressure, {
      message: 'Blood pressure must be in format "120/80" with systolic (80-200) > diastolic (40-130)',
    }),
  pulse: z.number()
    .int('Pulse must be an integer')
    .min(40, 'Pulse must be at least 40 bpm')
    .max(200, 'Pulse must not exceed 200 bpm')
    .refine((val) => val !== undefined && val !== null, {
      message: 'Pulse is required',
    }),
  medications: z.array(medicationSchema).optional().default([]),
  visitDate: z.string().datetime().optional(), // ISO 8601 format
});

// Update visit schema (all fields optional except vitals if being updated)
export const updateVisitSchema = z.object({
  complaints: z.string()
    .min(1, 'Complaints are required')
    .max(1000, 'Complaints must not exceed 1000 characters')
    .optional(),
  diagnosis: z.string()
    .max(2000, 'Diagnosis must not exceed 2000 characters')
    .optional(),
  temperature: z.number()
    .min(35, 'Temperature must be at least 35°C (95°F)')
    .max(42, 'Temperature must not exceed 42°C (107°F)')
    .optional(),
  bloodPressure: z.string()
    .refine(validateBloodPressure, {
      message: 'Blood pressure must be in format "120/80" with systolic (80-200) > diastolic (40-130)',
    })
    .optional(),
  pulse: z.number()
    .int('Pulse must be an integer')
    .min(40, 'Pulse must be at least 40 bpm')
    .max(200, 'Pulse must not exceed 200 bpm')
    .optional(),
});

/**
 * Parse a history date bound. YYYY-MM-DD is a local calendar day (like the
 * appointment filters); a full ISO datetime is used as-is.
 * For an end bound, a calendar day includes the whole day.
 */
const parseHistoryDate = (value: string, bound: 'start' | 'end'): Date | null => {
  const dayMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (dayMatch) {
    const [year, month, day] = dayMatch.slice(1).map(Number);
    const date = new Date(year, month - 1, day);
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
      return null;
    }
    // Exclusive upper bound: start of the following day
    return bound === 'end' ? new Date(year, month - 1, day + 1) : date;
  }
  if (z.string().datetime({ offset: true }).safeParse(value).success) {
    const date = new Date(value);
    // Exclusive upper bound just after the given instant
    return bound === 'end' ? new Date(date.getTime() + 1) : date;
  }
  return null;
};

const historyDateSchema = (bound: 'start' | 'end') =>
  z.string().transform((value, ctx) => {
    const date = parseHistoryDate(value, bound);
    if (!date) {
      ctx.addIssue({ code: 'custom', message: 'Date must be YYYY-MM-DD or an ISO 8601 datetime' });
      return z.NEVER;
    }
    return date;
  });

const integerParam = (name: string, min: number, max: number) =>
  z
    .string()
    .regex(/^\d+$/, `${name} must be a whole number`)
    .transform(Number)
    .refine((n) => n >= min && n <= max, `${name} must be between ${min} and ${max}`);

export const HISTORY_DEFAULT_LIMIT = 20;
export const HISTORY_MAX_LIMIT = 100;

// Query parameters for patient visit history
export const visitHistoryQuerySchema = z
  .object({
    patientId: z.string().uuid('Invalid patient ID format').optional(),
    startDate: historyDateSchema('start').optional(),
    // Exclusive upper bound (see parseHistoryDate)
    endDate: historyDateSchema('end').optional(),
    limit: integerParam('limit', 1, HISTORY_MAX_LIMIT).default(HISTORY_DEFAULT_LIMIT),
    offset: integerParam('offset', 0, Number.MAX_SAFE_INTEGER).default(0),
  })
  .refine((q) => !q.startDate || !q.endDate || q.startDate < q.endDate, {
    message: 'startDate must be on or before endDate',
    path: ['endDate'],
  });

export type CreateVisitInput = z.infer<typeof createVisitSchema>;
export type UpdateVisitInput = z.infer<typeof updateVisitSchema>;
export type VisitHistoryQuery = z.infer<typeof visitHistoryQuerySchema>;
export type MedicationInput = z.infer<typeof medicationSchema>;
