import request from 'supertest';
import app from '../src/app';
import { PrismaClient } from '@prisma/client';
import { generateToken } from '../src/utils/jwt';

// Run in a timezone where local midnight != UTC midnight, so day-boundary bugs
// (e.g. parsing YYYY-MM-DD as UTC) fail here even on machines/CI set to UTC.
const originalTZ = process.env.TZ;
process.env.TZ = 'Asia/Kolkata';
afterAll(() => {
  if (originalTZ === undefined) delete process.env.TZ;
  else process.env.TZ = originalTZ;
});

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

describe('Appointment API - validation gaps', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should list every missing required field on create', async () => {
    const response = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${mockToken}`)
      .send({})
      .expect(400);

    const fields = response.body.errors.map((e: { field: string }) => e.field);
    expect(fields).toEqual(expect.arrayContaining(['patientId', 'appointmentDate']));
    expect(prisma.patient.findUnique).not.toHaveBeenCalled();
  });

  it('should reject notes longer than 1000 characters', async () => {
    const response = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${mockToken}`)
      .send({ patientId: mockPatientId, appointmentDate: '2026-10-01T09:30:00.000Z', notes: 'a'.repeat(1001) })
      .expect(400);

    expect(response.body.errors[0].field).toBe('notes');
  });

  it('should reject a status update without a status', async () => {
    await request(app)
      .patch(`/api/appointments/${mockAppointmentId}/status`)
      .set('Authorization', `Bearer ${mockToken}`)
      .send({})
      .expect(400);

    expect(prisma.appointment.findUnique).not.toHaveBeenCalled();
  });

  it('should accept a leap day and reject a non-leap Feb 29', async () => {
    (prisma.appointment.findMany as jest.Mock).mockResolvedValue([]);

    await request(app)
      .get('/api/appointments?date=2028-02-29')
      .set('Authorization', `Bearer ${mockToken}`)
      .expect(200);
    await request(app)
      .get('/api/appointments?date=2027-02-29')
      .set('Authorization', `Bearer ${mockToken}`)
      .expect(400);
  });

  it('should return 500 when the database fails', async () => {
    (prisma.appointment.findMany as jest.Mock).mockRejectedValue(new Error('connection lost'));

    const response = await request(app)
      .get('/api/appointments/today')
      .set('Authorization', `Bearer ${mockToken}`)
      .expect(500);

    expect(response.body.success).toBe(false);
  });
});

/**
 * Workflow tests against an in-memory store that applies the same date-range
 * filter and ordering the database would, so they exercise how the controller's
 * queries behave end to end: create -> list by date -> today's queue -> status -> delete.
 */
describe('Appointment API - workflow', () => {
  type StoredAppointment = {
    id: string;
    patientId: string;
    appointmentDate: Date;
    status: string;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
  };

  let store: StoredAppointment[];
  let nextId: number;

  const withPatient = (a: StoredAppointment) => ({ ...a, patient: mockPatient });
  const inRange = (date: Date, range?: { gte: Date; lt: Date }) =>
    !range || (date >= range.gte && date < range.lt);

  beforeEach(() => {
    jest.resetAllMocks();
    store = [];
    nextId = 1;

    (prisma.patient.findUnique as jest.Mock).mockImplementation(async ({ where }) =>
      where.id === mockPatientId ? mockPatient : null
    );
    (prisma.appointment.create as jest.Mock).mockImplementation(async ({ data }) => {
      const created: StoredAppointment = {
        id: `750e8400-e29b-41d4-a716-${String(nextId++).padStart(12, '0')}`,
        patientId: data.patientId,
        appointmentDate: data.appointmentDate,
        status: data.status,
        notes: data.notes ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      store.push(created);
      return withPatient(created);
    });
    (prisma.appointment.findMany as jest.Mock).mockImplementation(async ({ where }) =>
      store
        .filter((a) => inRange(a.appointmentDate, where?.appointmentDate))
        .sort((a, b) => a.appointmentDate.getTime() - b.appointmentDate.getTime())
        .map(withPatient)
    );
    (prisma.appointment.findUnique as jest.Mock).mockImplementation(async ({ where }) => {
      const found = store.find((a) => a.id === where.id);
      return found ? withPatient(found) : null;
    });
    (prisma.appointment.update as jest.Mock).mockImplementation(async ({ where, data }) => {
      const found = store.find((a) => a.id === where.id)!;
      Object.assign(found, data, { updatedAt: new Date() });
      return withPatient(found);
    });
    (prisma.appointment.delete as jest.Mock).mockImplementation(async ({ where }) => {
      const found = store.find((a) => a.id === where.id)!;
      store = store.filter((a) => a.id !== where.id);
      return found;
    });
  });

  const pad = (n: number) => String(n).padStart(2, '0');
  const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const localDate = (dayOffset: number, hours: number, minutes = 0) => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate() + dayOffset, hours, minutes);
  };

  const create = async (appointmentDate: Date) => {
    const response = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${mockToken}`)
      .send({ patientId: mockPatientId, appointmentDate: appointmentDate.toISOString() })
      .expect(201);
    return response.body.data.id as string;
  };
  const getIds = async (path: string) => {
    const response = await request(app).get(path).set('Authorization', `Bearer ${mockToken}`).expect(200);
    return response.body.data.map((a: { id: string }) => a.id) as string[];
  };

  it('should put early-morning appointments on the right local day in both the queue and the date filter', async () => {
    // 00:30 local (IST) is 19:00 UTC the previous day: a UTC-midnight boundary would drop it
    const early = await create(localDate(0, 0, 30));
    const late = await create(localDate(0, 23, 45));
    const tomorrow = await create(localDate(1, 0, 15));
    const yesterday = await create(localDate(-1, 23, 59));

    const todayQueue = await getIds('/api/appointments/today');
    const byDate = await getIds(`/api/appointments?date=${ymd(new Date())}`);

    expect(todayQueue).toEqual([early, late]);
    expect(byDate).toEqual(todayQueue);
    expect(await getIds(`/api/appointments?date=${ymd(localDate(1, 0))}`)).toEqual([tomorrow]);
    expect(await getIds(`/api/appointments?date=${ymd(localDate(-1, 0))}`)).toEqual([yesterday]);
  });

  it('should filter across month and year boundaries', async () => {
    const eveId = await create(new Date(2026, 11, 31, 23, 30));
    const dayId = await create(new Date(2027, 0, 1, 0, 30));

    expect(await getIds('/api/appointments?date=2026-12-31')).toEqual([eveId]);
    expect(await getIds('/api/appointments?date=2027-01-01')).toEqual([dayId]);
  });

  it('should run the full create -> status -> delete workflow', async () => {
    const morning = await create(localDate(0, 9, 0));
    const afternoon = await create(localDate(0, 14, 0));

    // Both start in the scheduled queue, in time order
    let response = await request(app).get('/api/appointments/today').set('Authorization', `Bearer ${mockToken}`);
    expect(response.body.data.map((a: any) => a.status)).toEqual(['SCHEDULED', 'SCHEDULED']);
    expect(response.body.grouped.scheduled.map((a: any) => a.id)).toEqual([morning, afternoon]);

    // Status updates persist and regroup the queue
    await request(app)
      .patch(`/api/appointments/${morning}/status`)
      .set('Authorization', `Bearer ${mockToken}`)
      .send({ status: 'COMPLETED' })
      .expect(200);
    await request(app)
      .patch(`/api/appointments/${afternoon}/status`)
      .set('Authorization', `Bearer ${mockToken}`)
      .send({ status: 'NO_SHOW' })
      .expect(200);

    response = await request(app).get(`/api/appointments/${morning}`).set('Authorization', `Bearer ${mockToken}`);
    expect(response.body.data.status).toBe('COMPLETED');

    response = await request(app).get('/api/appointments/today').set('Authorization', `Bearer ${mockToken}`);
    expect(response.body.grouped.scheduled).toHaveLength(0);
    expect(response.body.grouped.completed.map((a: any) => a.id)).toEqual([morning]);
    expect(response.body.grouped.noShow.map((a: any) => a.id)).toEqual([afternoon]);

    // Undo puts it back in the scheduled group
    await request(app)
      .patch(`/api/appointments/${afternoon}/status`)
      .set('Authorization', `Bearer ${mockToken}`)
      .send({ status: 'SCHEDULED' })
      .expect(200);
    response = await request(app).get('/api/appointments/today').set('Authorization', `Bearer ${mockToken}`);
    expect(response.body.grouped.scheduled.map((a: any) => a.id)).toEqual([afternoon]);

    // Delete removes it from every view
    await request(app).delete(`/api/appointments/${morning}`).set('Authorization', `Bearer ${mockToken}`).expect(200);
    expect(await getIds('/api/appointments/today')).toEqual([afternoon]);
    await request(app).get(`/api/appointments/${morning}`).set('Authorization', `Bearer ${mockToken}`).expect(404);
  });
});
