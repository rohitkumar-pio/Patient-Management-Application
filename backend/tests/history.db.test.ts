/**
 * Patient history against a real PostgreSQL database (the one in DATABASE_URL).
 *
 * Skipped by default. Run with:  RUN_DB_TESTS=1 npx jest tests/history.db.test.ts
 *
 * Seeds temporary patients (phone prefix 99998) with 65+ visits and removes them
 * before and after the run. Verifies the BRD target: history in under 2 seconds
 * for 50+ visits, plus date filtering and paging on real queries and indexes.
 */
import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/config/database';
import { generateToken } from '../src/utils/jwt';

const runDbTests = process.env.RUN_DB_TESTS === '1';
const describeDb = runDbTests ? describe : describe.skip;

const PHONE_PREFIX = '99998';
const token = generateToken({ userId: 'history-db-test', email: 'history@test', role: 'DOCTOR' });
const get = (path: string) => request(app).get(path).set('Authorization', `Bearer ${token}`);

const cleanup = () => prisma.patient.deleteMany({ where: { phone: { startsWith: PHONE_PREFIX } } });

describeDb('Patient history API (real database)', () => {
  jest.setTimeout(120_000);

  let patientId: string;
  const inRangeDates = Array.from({ length: 60 }, (_, i) => new Date(2024, 0, 2 + i * 14, 9 + (i % 8), 15));
  const range = 'startDate=2024-01-01&endDate=2026-05-07';

  beforeAll(async () => {
    await cleanup();

    const patient = await prisma.patient.create({
      data: { name: 'History DB Test', phone: `${PHONE_PREFIX}00000`, age: 50, gender: 'Male' },
    });
    patientId = patient.id;

    const outOfRange = [new Date(2023, 11, 31, 23, 59), new Date(2026, 4, 8, 0, 5), new Date(2026, 8, 1, 10)];
    for (const visitDate of [...inRangeDates, ...outOfRange]) {
      await prisma.visit.create({
        data: {
          patientId,
          visitDate,
          complaints: 'History DB test',
          temperature: 37.0,
          bloodPressure: '120/80',
          pulse: 72,
          medications: {
            create: [
              { name: 'Medicine A', dosage: '500mg', frequency: 'Twice daily', duration: '5 days' },
              { name: 'Medicine B', dosage: '10mg', frequency: 'Once daily', duration: '3 days' },
            ],
          },
        },
      });
    }

    // Other patients' visits, so the table is not trivially small
    for (let p = 1; p <= 30; p++) {
      const filler = await prisma.patient.create({
        data: { name: `History DB Filler ${p}`, phone: `${PHONE_PREFIX}${String(p).padStart(5, '0')}`, gender: 'Female', age: 30 },
      });
      await prisma.visit.createMany({
        data: Array.from({ length: 100 }, (_, i) => ({
          patientId: filler.id,
          visitDate: new Date(2024, 0, 1 + i * 8, 11),
          complaints: 'Filler',
        })),
      });
    }
  });

  afterAll(async () => {
    await cleanup();
    await prisma.$disconnect();
  });

  it('returns 50+ visits with medications in under 2 seconds', async () => {
    await get(`/api/patients/${patientId}/visits?${range}`); // warm-up (connection pool, JIT)

    const timings: number[] = [];
    let response: request.Response | undefined;
    for (let i = 0; i < 5; i++) {
      const started = Date.now();
      response = await get(`/api/patients/${patientId}/visits?${range}&limit=100`).expect(200);
      timings.push(Date.now() - started);
    }

    expect(response!.body.pagination.total).toBe(60);
    expect(response!.body.data).toHaveLength(60);
    expect(response!.body.data.every((v: any) => v.medications.length === 2)).toBe(true);
    expect(Math.max(...timings)).toBeLessThan(2000);
  });

  it('filters by inclusive local calendar days', async () => {
    let response = await get(`/api/patients/${patientId}/visits?startDate=2023-12-31&endDate=2023-12-31`).expect(200);
    expect(response.body.pagination.total).toBe(1);

    response = await get(`/api/patients/${patientId}/visits?startDate=2026-05-08&endDate=2026-05-08`).expect(200);
    expect(response.body.pagination.total).toBe(1);

    response = await get(`/api/patients/${patientId}/visits`).expect(200);
    expect(response.body.pagination.total).toBe(63);
  });

  it('pages newest first through every visit exactly once', async () => {
    const seen: string[] = [];
    const dates: number[] = [];
    for (let offset = 0; ; offset += 20) {
      const response = await get(`/api/patients/${patientId}/visits?${range}&limit=20&offset=${offset}`).expect(200);
      seen.push(...response.body.data.map((v: any) => v.id));
      dates.push(...response.body.data.map((v: any) => new Date(v.visitDate).getTime()));
      if (!response.body.pagination.hasMore) break;
    }

    expect(seen).toHaveLength(60);
    expect(new Set(seen).size).toBe(60);
    expect(dates).toEqual([...dates].sort((a, b) => b - a));
    expect(dates[0]).toBe(Math.max(...inRangeDates.map((d) => d.getTime())));
  });
});

// Keep jest from reporting an empty file when skipped
if (!runDbTests) {
  it.skip('real-database history tests (set RUN_DB_TESTS=1)', () => undefined);
}
