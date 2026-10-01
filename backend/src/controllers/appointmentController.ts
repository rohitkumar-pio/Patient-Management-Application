import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import {
  AppointmentStatus,
  createAppointmentSchema,
  updateStatusSchema,
  appointmentIdSchema,
  appointmentQuerySchema,
} from '../validators/appointmentValidator';

export { AppointmentStatus };

// Patient fields included with appointment responses
const patientSummarySelect = {
  id: true,
  name: true,
  phone: true,
  age: true,
  gender: true,
};

/**
 * Get the [start, end) range of a calendar day in server local time.
 * Both the ?date= filter and today's queue use this so they agree on day boundaries.
 */
const getDayRange = (year: number, monthIndex: number, day: number) => {
  const start = new Date(year, monthIndex, day);
  const end = new Date(year, monthIndex, day + 1);
  return { start, end };
};

const sendValidationError = (res: Response, error: z.ZodError, message = 'Validation error') =>
  res.status(400).json({
    success: false,
    message,
    errors: error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    })),
  });

/**
 * Create a new appointment
 * POST /api/appointments
 */
export const createAppointment = async (req: Request, res: Response): Promise<any> => {
  try {
    const validatedData = createAppointmentSchema.parse(req.body);

    // Check if patient exists
    const patient = await prisma.patient.findUnique({
      where: { id: validatedData.patientId },
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found',
      });
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientId: validatedData.patientId,
        appointmentDate: new Date(validatedData.appointmentDate),
        notes: validatedData.notes,
        status: AppointmentStatus.SCHEDULED,
      },
      include: {
        patient: { select: patientSummarySelect },
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: appointment,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return sendValidationError(res, error);
    }

    console.error('Error creating appointment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create appointment',
      error: error.message,
    });
  }
};

/**
 * Get appointments with optional date filter
 * GET /api/appointments?date=YYYY-MM-DD
 */
export const getAppointments = async (req: Request, res: Response): Promise<any> => {
  try {
    const { date } = appointmentQuerySchema.parse(req.query);

    const where: { appointmentDate?: { gte: Date; lt: Date } } = {};

    if (date) {
      const [year, month, day] = date.split('-').map(Number);
      const { start, end } = getDayRange(year, month - 1, day);
      where.appointmentDate = { gte: start, lt: end };
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        patient: { select: patientSummarySelect },
      },
      orderBy: { appointmentDate: 'asc' },
    });

    return res.status(200).json({
      success: true,
      data: appointments,
      count: appointments.length,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return sendValidationError(res, error, 'Invalid query parameters');
    }

    console.error('Error fetching appointments:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments',
      error: error.message,
    });
  }
};

/**
 * Get today's appointments (today's queue)
 * GET /api/appointments/today
 */
export const getTodayAppointments = async (_req: Request, res: Response): Promise<any> => {
  try {
    const now = new Date();
    const { start, end } = getDayRange(now.getFullYear(), now.getMonth(), now.getDate());

    const appointments = await prisma.appointment.findMany({
      where: {
        appointmentDate: { gte: start, lt: end },
      },
      include: {
        patient: { select: patientSummarySelect },
      },
      orderBy: { appointmentDate: 'asc' },
    });

    // Group by status for queue management
    const grouped = {
      scheduled: appointments.filter((a) => a.status === AppointmentStatus.SCHEDULED),
      completed: appointments.filter((a) => a.status === AppointmentStatus.COMPLETED),
      cancelled: appointments.filter((a) => a.status === AppointmentStatus.CANCELLED),
      noShow: appointments.filter((a) => a.status === AppointmentStatus.NO_SHOW),
    };

    return res.status(200).json({
      success: true,
      data: appointments,
      grouped,
      count: appointments.length,
    });
  } catch (error: any) {
    console.error("Error fetching today's appointments:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch today's appointments",
      error: error.message,
    });
  }
};

/**
 * Get single appointment by ID
 * GET /api/appointments/:id
 */
export const getAppointmentById = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = appointmentIdSchema.parse(req.params);

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: { select: { ...patientSummarySelect, address: true } },
      },
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return sendValidationError(res, error);
    }

    console.error('Error fetching appointment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch appointment',
      error: error.message,
    });
  }
};

/**
 * Update appointment status
 * PATCH /api/appointments/:id/status
 */
export const updateAppointmentStatus = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = appointmentIdSchema.parse(req.params);
    const { status } = updateStatusSchema.parse(req.body);

    const existingAppointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!existingAppointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: { status },
      include: {
        patient: { select: patientSummarySelect },
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Appointment status updated successfully',
      data: updatedAppointment,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return sendValidationError(res, error);
    }

    console.error('Error updating appointment status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update appointment status',
      error: error.message,
    });
  }
};

/**
 * Delete appointment
 * DELETE /api/appointments/:id
 */
export const deleteAppointment = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = appointmentIdSchema.parse(req.params);

    const existingAppointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!existingAppointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    await prisma.appointment.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: 'Appointment deleted successfully',
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return sendValidationError(res, error);
    }

    console.error('Error deleting appointment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete appointment',
      error: error.message,
    });
  }
};
