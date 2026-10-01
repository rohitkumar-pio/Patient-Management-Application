import { z } from 'zod';

// Appointment status values (stored as a string column in the database)
export enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
}

// Create appointment schema
export const createAppointmentSchema = z.object({
  patientId: z.string().uuid('Invalid patient ID format'),
  appointmentDate: z.string().datetime({ message: 'Invalid date format. Use ISO 8601 format' }),
  notes: z.string().max(1000, 'Notes must not exceed 1000 characters').optional(),
});

// Update status schema
export const updateStatusSchema = z.object({
  status: z.nativeEnum(AppointmentStatus, {
    message: 'Status must be one of SCHEDULED, COMPLETED, CANCELLED, NO_SHOW',
  }),
});

// Appointment ID param schema
export const appointmentIdSchema = z.object({
  id: z.string().uuid('Invalid appointment ID format'),
});

// Query parameters schema for listing appointments
export const appointmentQuerySchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .refine((value) => {
      const [year, month, day] = value.split('-').map(Number);
      const parsed = new Date(year, month - 1, day);
      return parsed.getFullYear() === year && parsed.getMonth() === month - 1 && parsed.getDate() === day;
    }, 'Invalid calendar date')
    .optional(),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
