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

/**
 * Workflow tests over an in-memory store that applies the same filter, order and
 * paging the database would, so they check what the endpoint actually returns
 * for a realistic history (60+ visits), not just the query it builds.
 */
describe('Patient history API - workflow (in-memory store)', () => {
  type StoredVisit = ReturnType<typeof buildVisit> & { visitDate: Date };
  let store: StoredVisit[];

  // 60 visits in range (every 14 days from 2024-01-02, at varying local hours),
  // plus 5 outside it, plus 2 sharing one timestamp to exercise the id tie-break
  const seed = () => {
    const visits: StoredVisit[] = [];
    for (let i = 0; i < 60; i++) {
      visits.push({ ...buildVisit(i), id: `in-${String(i).padStart(2, '0')}`, visitDate: new Date(2024, 0, 2 + i * 14, 9 + (i % 8), 15) });
    }
    const outside = [new Date(2023, 11, 31, 23, 59), new Date(2023, 5, 1, 10), new Date(2026, 4, 8, 0, 5), new Date(2026, 5, 1, 10), new Date(2026, 8, 1, 10)];
    outside.forEach((visitDate, i) => visits.push({ ...buildVisit(100 + i), id: `out-${i}`, visitDate }));
    const sameTime = new Date(2025, 5, 15, 12, 0);
    visits.push({ ...buildVisit(200), id: 'tie-a', visitDate: sameTime }, { ...buildVisit(201), id: 'tie-b', visitDate: sameTime });
    return visits;
  };

  const matches = (v: StoredVisit, where: any) =>
    (!where.patientId || v.patientId === where.patientId) &&
    (!where.visitDate?.gte || v.visitDate >= where.visitDate.gte) &&
    (!where.visitDate?.lt || v.visitDate < where.visitDate.lt);

  beforeEach(() => {
    jest.resetAllMocks();
    store = seed();
    (prisma.patient.findUnique as jest.Mock).mockImplementation(async ({ where }) =>
      where.id === patientId ? { id: patientId } : null
    );
    (prisma.visit.findMany as jest.Mock).mockImplementation(async ({ where, orderBy, skip, take }) => {
      expect(orderBy).toEqual([{ visitDate: 'desc' }, { id: 'desc' }]);
      return store
        .filter((v) => matches(v, where))
        .sort((a, b) => b.visitDate.getTime() - a.visitDate.getTime() || (a.id < b.id ? 1 : -1))
        .slice(skip, skip + take);
    });
    (prisma.visit.count as jest.Mock).mockImplementation(async ({ where }) => store.filter((v) => matches(v, where)).length);
  });

  const range = 'startDate=2024-01-01&endDate=2026-05-07';

  it('returns 50+ visits for the range within 2 seconds', async () => {
    const started = Date.now();
    const response = await get(`/api/patients/${patientId}/visits?${range}&limit=100`).expect(200);
    const elapsed = Date.now() - started;

    // 60 regular in-range visits + the 2 same-timestamp ones (2025-06-15)
    expect(response.body.pagination.total).toBe(62);
    expect(response.body.data).toHaveLength(62);
    expect(response.body.data.every((v: any) => v.medications.length > 0)).toBe(true);
    // Covers the HTTP stack, validation and formatting; the dev-database timing is in history.db.test.ts
    expect(elapsed).toBeLessThan(2000);
  });

  it('applies inclusive local calendar-day bounds', async () => {
    let response = await get(`/api/patients/${patientId}/visits?${range}&limit=100`).expect(200);
    const ids = response.body.data.map((v: any) => v.id);
    expect(ids.some((id: string) => id.startsWith('out-'))).toBe(false);

    // 2023-12-31 23:59 local is excluded by startDate=2024-01-01; 2026-05-08 00:05 by endDate=2026-05-07
    response = await get(`/api/patients/${patientId}/visits?startDate=2023-12-31&endDate=2023-12-31`).expect(200);
    expect(response.body.data.map((v: any) => v.id)).toEqual(['out-0']);
    response = await get(`/api/patients/${patientId}/visits?startDate=2026-05-08&endDate=2026-05-08`).expect(200);
    expect(response.body.data.map((v: any) => v.id)).toEqual(['out-2']);
  });

  it('returns newest first', async () => {
    const response = await get(`/api/patients/${patientId}/visits?${range}&limit=100`).expect(200);
    const times = response.body.data.map((v: any) => new Date(v.visitDate).getTime());
    expect(times).toEqual([...times].sort((a, b) => b - a));
  });

  it('pages through every visit exactly once, including same-timestamp visits', async () => {
    const seen: string[] = [];
    let offset = 0;
    let pages = 0;
    for (;;) {
      const response = await get(`/api/patients/${patientId}/visits?${range}&limit=20&offset=${offset}`).expect(200);
      pages += 1;
      seen.push(...response.body.data.map((v: any) => v.id));
      expect(response.body.pagination).toMatchObject({ total: 62, limit: 20, offset });
      if (!response.body.pagination.hasMore) break;
      offset += response.body.data.length;
    }

    expect(pages).toBe(4); // 20 + 20 + 20 + 2
    expect(seen).toHaveLength(62);
    expect(new Set(seen).size).toBe(62);
    expect(seen.indexOf('tie-b')).toBe(seen.indexOf('tie-a') - 1); // id desc breaks the tie
  });

  it('returns an empty page past the end', async () => {
    const response = await get(`/api/patients/${patientId}/visits?${range}&offset=500`).expect(200);
    expect(response.body.data).toEqual([]);
    expect(response.body.pagination).toMatchObject({ total: 62, hasMore: false });
  });
});
