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

// Query parameters schema for fetching visits
export const visitQuerySchema = z.object({
  patientId: z.string().uuid().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
});

export type CreateVisitInput = z.infer<typeof createVisitSchema>;
export type UpdateVisitInput = z.infer<typeof updateVisitSchema>;
export type VisitQueryInput = z.infer<typeof visitQuerySchema>;
export type MedicationInput = z.infer<typeof medicationSchema>;
