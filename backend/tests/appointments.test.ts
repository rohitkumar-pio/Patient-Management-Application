import request from 'supertest';
import app from '../src/app';
import { PrismaClient } from '@prisma/client';
import { generateToken } from '../src/utils/jwt';

// Mock Prisma Client
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    patient: {
      findUnique: jest.fn(),
    },
    appointment: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $disconnect: jest.fn(),
  };

  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
  };
});

const prisma = new PrismaClient();

const mockToken = generateToken({
  userId: '1',
  email: 'doctor@test.com',
  role: 'DOCTOR',
});

const mockPatientId = '550e8400-e29b-41d4-a716-446655440000';
const mockAppointmentId = '650e8400-e29b-41d4-a716-446655440000';
const nonExistentId = '650e8400-e29b-41d4-a716-446655449999';

const mockPatient = {
  id: mockPatientId,
  name: 'John Doe',
  phone: '1234567890',
  age: 35,
  gender: 'Male',
};

const buildAppointment = (overrides: Record<string, unknown> = {}) => ({
  id: mockAppointmentId,
  patientId: mockPatientId,
  appointmentDate: new Date(),
  status: 'SCHEDULED',
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  patient: mockPatient,
  ...overrides,
});

describe('Appointment API', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('POST /api/appointments', () => {
    it('should create a SCHEDULED appointment for an existing patient', async () => {
      const appointmentDate = '2026-10-01T09:30:00.000Z';
      (prisma.patient.findUnique as jest.Mock).mockResolvedValue(mockPatient);
      (prisma.appointment.create as jest.Mock).mockResolvedValue(
        buildAppointment({ appointmentDate: new Date(appointmentDate), notes: 'Follow-up' })
      );

      const response = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({ patientId: mockPatientId, appointmentDate, notes: 'Follow-up' })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('SCHEDULED');
      expect(prisma.appointment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            patientId: mockPatientId,
            appointmentDate: new Date(appointmentDate),
            notes: 'Follow-up',
            status: 'SCHEDULED',
          },
        })
      );
    });

    it('should return 404 when the patient does not exist', async () => {
      (prisma.patient.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({ patientId: mockPatientId, appointmentDate: '2026-10-01T09:30:00.000Z' })
        .expect(404);

      expect(response.body.message).toBe('Patient not found');
      expect(prisma.appointment.create).not.toHaveBeenCalled();
    });

    it('should return 400 for an invalid appointment date', async () => {
      const response = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({ patientId: mockPatientId, appointmentDate: 'tomorrow' })
        .expect(400);

      expect(response.body.message).toBe('Validation error');
      expect(response.body.errors[0].field).toBe('appointmentDate');
    });

    it('should return 401 without authentication token', async () => {
      await request(app).post('/api/appointments').send({}).expect(401);
    });
  });

  describe('GET /api/appointments', () => {
    it('should filter by the local calendar day when date is given', async () => {
      (prisma.appointment.findMany as jest.Mock).mockResolvedValue([buildAppointment()]);

      const response = await request(app)
        .get('/api/appointments?date=2026-10-01')
        .set('Authorization', `Bearer ${mockToken}`)
        .expect(200);

      expect(response.body.count).toBe(1);
      const { where, orderBy } = (prisma.appointment.findMany as jest.Mock).mock.calls[0][0];
      expect(where.appointmentDate).toEqual({
        gte: new Date(2026, 9, 1),
        lt: new Date(2026, 9, 2),
      });
      expect(orderBy).toEqual({ appointmentDate: 'asc' });
    });

    it('should return all appointments when no date is given', async () => {
      (prisma.appointment.findMany as jest.Mock).mockResolvedValue([]);

      await request(app)
        .get('/api/appointments')
        .set('Authorization', `Bearer ${mockToken}`)
        .expect(200);

      const { where } = (prisma.appointment.findMany as jest.Mock).mock.calls[0][0];
      expect(where).toEqual({});
    });

    it.each(['foo', '2026-13-01', '2026-02-30', '01-10-2026'])(
      'should return 400 for invalid date "%s"',
      async (date) => {
        const response = await request(app)
          .get(`/api/appointments?date=${date}`)
          .set('Authorization', `Bearer ${mockToken}`)
          .expect(400);

        expect(response.body.message).toBe('Invalid query parameters');
        expect(prisma.appointment.findMany).not.toHaveBeenCalled();
      }
    );
  });

  describe('GET /api/appointments/today', () => {
    it("should query today's local day range and group by status", async () => {
      (prisma.appointment.findMany as jest.Mock).mockResolvedValue([
        buildAppointment({ id: 'a1', status: 'SCHEDULED' }),
        buildAppointment({ id: 'a2', status: 'COMPLETED' }),
        buildAppointment({ id: 'a3', status: 'CANCELLED' }),
        buildAppointment({ id: 'a4', status: 'NO_SHOW' }),
        buildAppointment({ id: 'a5', status: 'SCHEDULED' }),
      ]);

      const response = await request(app)
        .get('/api/appointments/today')
        .set('Authorization', `Bearer ${mockToken}`)
        .expect(200);

      const now = new Date();
      const { where } = (prisma.appointment.findMany as jest.Mock).mock.calls[0][0];
      expect(where.appointmentDate).toEqual({
        gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
      });

      expect(response.body.count).toBe(5);
      expect(response.body.grouped.scheduled.map((a: any) => a.id)).toEqual(['a1', 'a5']);
      expect(response.body.grouped.completed).toHaveLength(1);
      expect(response.body.grouped.cancelled).toHaveLength(1);
      expect(response.body.grouped.noShow).toHaveLength(1);
    });
  });

  describe('GET /api/appointments/:id', () => {
    it('should return the appointment with patient details', async () => {
      (prisma.appointment.findUnique as jest.Mock).mockResolvedValue(buildAppointment());

      const response = await request(app)
        .get(`/api/appointments/${mockAppointmentId}`)
        .set('Authorization', `Bearer ${mockToken}`)
        .expect(200);

      expect(response.body.data.id).toBe(mockAppointmentId);
      expect(response.body.data.patient.name).toBe('John Doe');
    });

    it('should return 404 for a non-existent appointment', async () => {
      (prisma.appointment.findUnique as jest.Mock).mockResolvedValue(null);

      await request(app)
        .get(`/api/appointments/${nonExistentId}`)
        .set('Authorization', `Bearer ${mockToken}`)
        .expect(404);
    });

    it('should return 400 for an invalid appointment ID', async () => {
      await request(app)
        .get('/api/appointments/not-a-uuid')
        .set('Authorization', `Bearer ${mockToken}`)
        .expect(400);

      expect(prisma.appointment.findUnique).not.toHaveBeenCalled();
    });
  });

  describe('PATCH /api/appointments/:id/status', () => {
    it.each(['SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'])(
      'should update status to %s',
      async (status) => {
        (prisma.appointment.findUnique as jest.Mock).mockResolvedValue(buildAppointment());
        (prisma.appointment.update as jest.Mock).mockResolvedValue(buildAppointment({ status }));

        const response = await request(app)
          .patch(`/api/appointments/${mockAppointmentId}/status`)
          .set('Authorization', `Bearer ${mockToken}`)
          .send({ status })
          .expect(200);

        expect(response.body.data.status).toBe(status);
        expect(prisma.appointment.update).toHaveBeenCalledWith(
          expect.objectContaining({ where: { id: mockAppointmentId }, data: { status } })
        );
      }
    );

    it('should return 400 for an invalid status', async () => {
      const response = await request(app)
        .patch(`/api/appointments/${mockAppointmentId}/status`)
        .set('Authorization', `Bearer ${mockToken}`)
        .send({ status: 'DONE' })
        .expect(400);

      expect(response.body.errors[0].field).toBe('status');
      expect(prisma.appointment.update).not.toHaveBeenCalled();
    });

    it('should return 404 for a non-existent appointment', async () => {
      (prisma.appointment.findUnique as jest.Mock).mockResolvedValue(null);

      await request(app)
        .patch(`/api/appointments/${nonExistentId}/status`)
        .set('Authorization', `Bearer ${mockToken}`)
        .send({ status: 'COMPLETED' })
        .expect(404);

      expect(prisma.appointment.update).not.toHaveBeenCalled();
    });
  });

  describe('DELETE /api/appointments/:id', () => {
    it('should delete an existing appointment', async () => {
      (prisma.appointment.findUnique as jest.Mock).mockResolvedValue(buildAppointment());
      (prisma.appointment.delete as jest.Mock).mockResolvedValue(buildAppointment());

      const response = await request(app)
        .delete(`/api/appointments/${mockAppointmentId}`)
        .set('Authorization', `Bearer ${mockToken}`)
        .expect(200);

      expect(response.body.message).toContain('deleted');
      expect(prisma.appointment.delete).toHaveBeenCalledWith({ where: { id: mockAppointmentId } });
    });

    it('should return 404 for a non-existent appointment', async () => {
      (prisma.appointment.findUnique as jest.Mock).mockResolvedValue(null);

      await request(app)
        .delete(`/api/appointments/${nonExistentId}`)
        .set('Authorization', `Bearer ${mockToken}`)
        .expect(404);

      expect(prisma.appointment.delete).not.toHaveBeenCalled();
    });
  });
});
