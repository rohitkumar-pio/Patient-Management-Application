import { z } from 'zod';

/**
 * Validation schema for creating a new patient
 */
export const createPatientSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters'),
  age: z
    .number()
    .int('Age must be an integer')
    .min(0, 'Age cannot be negative')
    .max(150, 'Age must be less than 150')
    .optional()
    .nullable(),
  dateOfBirth: z
    .string()
    .datetime({ message: 'Invalid date format. Use ISO 8601 format (e.g., 2000-01-01T00:00:00Z)' })
    .optional()
    .nullable()
    .transform((val: string | null | undefined) => (val ? new Date(val) : null)),
  gender: z
    .enum(['Male', 'Female', 'Other'])
    .optional()
    .nullable(),
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number must not exceed 15 digits')
    .regex(/^[0-9+\-() ]+$/, 'Phone number can only contain digits, +, -, (, ), and spaces'),
  address: z
    .string()
    .max(500, 'Address must not exceed 500 characters')
    .optional()
    .nullable(),
});

/**
 * Validation schema for updating a patient
 * All fields are optional for partial updates
 */
export const updatePatientSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters')
    .optional(),
  age: z
    .number()
    .int('Age must be an integer')
    .min(0, 'Age cannot be negative')
    .max(150, 'Age must be less than 150')
    .optional()
    .nullable(),
  dateOfBirth: z
    .string()
    .datetime({ message: 'Invalid date format. Use ISO 8601 format' })
    .optional()
    .nullable()
    .transform((val: string | null | undefined) => (val ? new Date(val) : null)),
  gender: z
    .enum(['Male', 'Female', 'Other'])
    .optional()
    .nullable(),
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number must not exceed 15 digits')
    .regex(/^[0-9+\-() ]+$/, 'Phone number can only contain digits, +, -, (, ), and spaces')
    .optional(),
  address: z
    .string()
    .max(500, 'Address must not exceed 500 characters')
    .optional()
    .nullable(),
});

/**
 * Validation schema for patient ID parameter
 */
export const patientIdSchema = z.object({
  id: z.string().uuid('Invalid patient ID format'),
});

/**
 * Validation schema for search and pagination query parameters
 */
export const patientQuerySchema = z.object({
  search: z.string().optional(),
  page: z
    .string()
    .optional()
    .transform((val: string | undefined) => (val ? parseInt(val, 10) : 1))
    .refine((val: number) => val > 0, { message: 'Page must be greater than 0' }),
  limit: z
    .string()
    .optional()
    .transform((val: string | undefined) => (val ? parseInt(val, 10) : 20))
    .refine((val: number) => val > 0 && val <= 100, {
      message: 'Limit must be between 1 and 100',
    }),
});

/**
 * TypeScript types inferred from Zod schemas
 */
export type CreatePatientInput = z.infer<typeof createPatientSchema>;
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>;
export type PatientIdInput = z.infer<typeof patientIdSchema>;
export type PatientQueryInput = z.infer<typeof patientQuerySchema>;
