import request from 'supertest';
import app from '../src/app';
import { PrismaClient } from '@prisma/client';
import { generateToken } from '../src/utils/jwt';

// Local midnight != UTC midnight here, so calendar-day bound mistakes fail on any machine
const originalTZ = process.env.TZ;
process.env.TZ = 'Asia/Kolkata';
afterAll(() => {
  if (originalTZ === undefined) delete process.env.TZ;
  else process.env.TZ = originalTZ;
});

jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    patient: {
      findUnique: jest.fn(),
    },
    visit: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    $disconnect: jest.fn(),
  };

  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
  };
});

const prisma = new PrismaClient();

const token = generateToken({ userId: '1', email: 'doctor@test.com', role: 'DOCTOR' });
const patientId = '550e8400-e29b-41d4-a716-446655440000';
const unknownPatientId = '550e8400-e29b-41d4-a716-446655449999';

const buildVisit = (n: number) => ({
  id: `visit-${n}`,
  patientId,
  complaints: `Complaint ${n}`,
  diagnosis: `Diagnosis ${n}`,
  temperature: 37.2,
  bloodPressure: '120/80',
  pulse: 72,
  visitDate: new Date(2026, 9, 30 - n, 10, 0),
  createdAt: new Date(),
  updatedAt: new Date(),
  medications: [
    { id: `med-${n}`, visitId: `visit-${n}`, name: 'Paracetamol', dosage: '500mg', frequency: 'Twice daily', duration: '5 days', instructions: null },
  ],
  patient: { id: patientId, name: 'John Doe', age: 35, gender: 'Male', phone: '1234567890' },
});

const get = (path: string) => request(app).get(path).set('Authorization', `Bearer ${token}`);
const findManyArgs = () => (prisma.visit.findMany as jest.Mock).mock.calls[0][0];

describe('Patient history API', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    (prisma.patient.findUnique as jest.Mock).mockResolvedValue({ id: patientId });
    (prisma.visit.findMany as jest.Mock).mockResolvedValue([buildVisit(1), buildVisit(2)]);
    (prisma.visit.count as jest.Mock).mockResolvedValue(2);
  });

  describe('GET /api/patients/:id/visits', () => {
    it('returns visits newest first with medications and default pagination', async () => {
      const response = await get(`/api/patients/${patientId}/visits`).expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].medications[0].name).toBe('Paracetamol');
      expect(response.body.pagination).toEqual({ total: 2, limit: 20, offset: 0, hasMore: false });

      const args = findManyArgs();
      expect(args.where).toEqual({ patientId });
      expect(args.orderBy).toEqual([{ visitDate: 'desc' }, { id: 'desc' }]);
      expect(args.skip).toBe(0);
      expect(args.take).toBe(20);
      expect(args.include.medications).toBeTruthy();
      expect(prisma.visit.count).toHaveBeenCalledWith({ where: { patientId } });
    });

    it('returns flat vitals the frontend reads (and keeps nested vitals)', async () => {
      const response = await get(`/api/patients/${patientId}/visits`).expect(200);

      const visit = response.body.data[0];
      expect(visit).toMatchObject({ temperature: 37.2, bloodPressure: '120/80', pulse: 72 });
      expect(visit.vitals).toEqual({ temperature: 37.2, bloodPressure: '120/80', pulse: 72 });
    });

    it('filters by an inclusive local calendar-day range', async () => {
      await get(`/api/patients/${patientId}/visits?startDate=2024-01-01&endDate=2026-05-07`).expect(200);

      expect(findManyArgs().where).toEqual({
        patientId,
        visitDate: {
          gte: new Date(2024, 0, 1), // local midnight
          lt: new Date(2026, 4, 8), // start of the day after endDate
        },
      });
    });

    it('accepts ISO datetimes as exact bounds', async () => {
      await get(
        `/api/patients/${patientId}/visits?startDate=2026-05-01T09:00:00.000Z&endDate=2026-05-07T18:30:00.000Z`
      ).expect(200);

      expect(findManyArgs().where.visitDate).toEqual({
        gte: new Date('2026-05-01T09:00:00.000Z'),
        lt: new Date(new Date('2026-05-07T18:30:00.000Z').getTime() + 1),
      });
    });

    it('supports a start date alone and an end date alone', async () => {
      await get(`/api/patients/${patientId}/visits?startDate=2026-01-01`).expect(200);
      expect(findManyArgs().where.visitDate).toEqual({ gte: new Date(2026, 0, 1) });

      (prisma.visit.findMany as jest.Mock).mockClear();
      await get(`/api/patients/${patientId}/visits?endDate=2026-01-31`).expect(200);
      expect(findManyArgs().where.visitDate).toEqual({ lt: new Date(2026, 1, 1) });
    });

    it('allows a single-day range', async () => {
      await get(`/api/patients/${patientId}/visits?startDate=2026-05-07&endDate=2026-05-07`).expect(200);
      expect(findManyArgs().where.visitDate).toEqual({ gte: new Date(2026, 4, 7), lt: new Date(2026, 4, 8) });
    });

    it('paginates with limit and offset and reports hasMore', async () => {
      (prisma.visit.findMany as jest.Mock).mockResolvedValue([buildVisit(3), buildVisit(4)]);
      (prisma.visit.count as jest.Mock).mockResolvedValue(55);

      const response = await get(`/api/patients/${patientId}/visits?limit=2&offset=2`).expect(200);

      expect(findManyArgs()).toMatchObject({ skip: 2, take: 2 });
      expect(response.body.pagination).toEqual({ total: 55, limit: 2, offset: 2, hasMore: true });
    });

    it('reports hasMore false on the last page', async () => {
      (prisma.visit.findMany as jest.Mock).mockResolvedValue([buildVisit(55)]);
      (prisma.visit.count as jest.Mock).mockResolvedValue(55);

      const response = await get(`/api/patients/${patientId}/visits?limit=20&offset=54`).expect(200);
      expect(response.body.pagination.hasMore).toBe(false);
    });

    it('returns an empty list for a patient with no visits', async () => {
      (prisma.visit.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.visit.count as jest.Mock).mockResolvedValue(0);

      const response = await get(`/api/patients/${patientId}/visits`).expect(200);
      expect(response.body.data).toEqual([]);
      expect(response.body.pagination.total).toBe(0);
    });

    it('returns 404 for an unknown patient', async () => {
      (prisma.patient.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await get(`/api/patients/${unknownPatientId}/visits`).expect(404);
      expect(response.body.message).toBe('Patient not found');
    });

    it.each([
      ['an invalid patient id', '/api/patients/not-a-uuid/visits', 'patientId'],
      ['a malformed startDate', `/api/patients/${patientId}/visits?startDate=01-01-2024`, 'startDate'],
      ['an impossible endDate', `/api/patients/${patientId}/visits?endDate=2026-02-30`, 'endDate'],
      ['startDate after endDate', `/api/patients/${patientId}/visits?startDate=2026-05-08&endDate=2026-05-07`, 'endDate'],
      ['limit 0', `/api/patients/${patientId}/visits?limit=0`, 'limit'],
      ['limit over 100', `/api/patients/${patientId}/visits?limit=101`, 'limit'],
      ['a negative offset', `/api/patients/${patientId}/visits?offset=-1`, 'offset'],
      ['a non-numeric limit', `/api/patients/${patientId}/visits?limit=ten`, 'limit'],
    ])('returns 400 for %s', async (_label, path, field) => {
      const response = await get(path).expect(400);

      expect(response.body.message).toBe('Invalid query parameters');
      expect(response.body.errors.map((e: { field: string }) => e.field)).toContain(field);
      expect(prisma.visit.findMany).not.toHaveBeenCalled();
    });

    it('requires authentication', async () => {
      await request(app).get(`/api/patients/${patientId}/visits`).expect(401);
    });

    it('returns 500 when the database fails', async () => {
      (prisma.visit.findMany as jest.Mock).mockRejectedValue(new Error('connection lost'));

      const response = await get(`/api/patients/${patientId}/visits`).expect(500);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/visits', () => {
    it('filters by ?patientId= with the same behavior', async () => {
      const response = await get(`/api/visits?patientId=${patientId}&startDate=2026-01-01&limit=5`).expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(findManyArgs()).toMatchObject({
        where: { patientId, visitDate: { gte: new Date(2026, 0, 1) } },
        take: 5,
      });
    });

    it('lists visits across all patients without a patientId', async () => {
      await get('/api/visits?startDate=2026-10-01&endDate=2026-10-01').expect(200);

      expect(findManyArgs().where).toEqual({ visitDate: { gte: new Date(2026, 9, 1), lt: new Date(2026, 9, 2) } });
      expect(prisma.patient.findUnique).not.toHaveBeenCalled();
    });
  });
});
