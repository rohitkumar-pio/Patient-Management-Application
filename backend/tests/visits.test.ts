import request from 'supertest';
import app from '../src/app';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Mock Prisma Client
jest.mock('@prisma/client', () => {
  const mockPrisma = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
    patient: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    visit: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    medication: {
      createMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  return {
    PrismaClient: jest.fn(() => mockPrisma),
  };
});

describe('Visit API Endpoints', () => {
  let authToken: string;
  let mockPatientId: string;
  let mockVisitId: string;

  beforeAll(() => {
    // Generate test JWT token
    authToken = jwt.sign(
      { userId: 'test-user-id', role: 'DOCTOR' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    mockPatientId = '123e4567-e89b-12d3-a456-426614174000';
    mockVisitId = '223e4567-e89b-12d3-a456-426614174000';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/visits', () => {
    const validVisitData = {
      patientId: mockPatientId,
      complaints: 'Fever and headache for 3 days',
      diagnosis: 'Viral fever',
      temperature: 38.5,
      bloodPressure: '120/80',
      pulse: 85,
      medications: [
        {
          name: 'Paracetamol',
          dosage: '500mg',
          frequency: 'Three times daily',
          duration: '5 days',
          instructions: 'Take after meals',
        },
      ],
    };

    it('should create visit with medications successfully', async () => {
      const mockPatient = {
        id: mockPatientId,
        name: 'John Doe',
        age: 30,
        gender: 'Male',
        phone: '1234567890',
      };

      const mockVisit = {
        id: mockVisitId,
        patientId: mockPatientId,
        complaints: validVisitData.complaints,
        diagnosis: validVisitData.diagnosis,
        temperature: validVisitData.temperature,
        bloodPressure: validVisitData.bloodPressure,
        pulse: validVisitData.pulse,
        visitDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockMedications = validVisitData.medications.map((med, index) => ({
        id: `med-${index}`,
        visitId: mockVisitId,
        ...med,
        createdAt: new Date(),
      }));

      // Mock Prisma transaction
      (prisma.$transaction as jest.Mock).mockResolvedValue([
        { ...mockVisit, patient: mockPatient, medications: mockMedications },
      ]);

      (prisma.patient.findUnique as jest.Mock).mockResolvedValue(mockPatient);

      const response = await request(app)
        .post('/api/visits')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validVisitData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.complaints).toBe(validVisitData.complaints);
      expect(response.body.data.medications).toHaveLength(1);
    });

    it('should reject visit with invalid temperature (too low)', async () => {
      const response = await request(app)
        .post('/api/visits')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ...validVisitData,
          temperature: 30, // Below 35°C minimum
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Validation error');
    });

    it('should reject visit with invalid temperature (too high)', async () => {
      const response = await request(app)
        .post('/api/visits')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ...validVisitData,
          temperature: 45, // Above 42°C maximum
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject visit with invalid blood pressure format', async () => {
      const response = await request(app)
        .post('/api/visits')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ...validVisitData,
          bloodPressure: 'invalid', // Not in XXX/YYY format
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject visit with invalid blood pressure range (too high)', async () => {
      const response = await request(app)
        .post('/api/visits')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ...validVisitData,
          bloodPressure: '250/150', // Systolic > 200 or Diastolic > 130
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject visit with systolic <= diastolic', async () => {
      const response = await request(app)
        .post('/api/visits')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ...validVisitData,
          bloodPressure: '80/90', // Systolic should be > Diastolic
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject visit with invalid pulse (too low)', async () => {
      const response = await request(app)
        .post('/api/visits')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ...validVisitData,
          pulse: 30, // Below 40 bpm minimum
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject visit with invalid pulse (too high)', async () => {
      const response = await request(app)
        .post('/api/visits')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ...validVisitData,
          pulse: 250, // Above 200 bpm maximum
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject visit without required complaints', async () => {
      const response = await request(app)
        .post('/api/visits')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ...validVisitData,
          complaints: '', // Empty complaints
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject visit with complaints exceeding max length', async () => {
      const response = await request(app)
        .post('/api/visits')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ...validVisitData,
          complaints: 'a'.repeat(1001), // > 1000 characters
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should accept visit with empty medications array', async () => {
      const mockPatient = {
        id: mockPatientId,
        name: 'John Doe',
        age: 30,
        gender: 'Male',
        phone: '1234567890',
      };

      const mockVisit = {
        id: mockVisitId,
        patientId: mockPatientId,
        complaints: validVisitData.complaints,
        diagnosis: validVisitData.diagnosis,
        temperature: validVisitData.temperature,
        bloodPressure: validVisitData.bloodPressure,
        pulse: validVisitData.pulse,
        visitDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.$transaction as jest.Mock).mockResolvedValue([
        { ...mockVisit, patient: mockPatient, medications: [] },
      ]);

      (prisma.patient.findUnique as jest.Mock).mockResolvedValue(mockPatient);

      const response = await request(app)
        .post('/api/visits')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ...validVisitData,
          medications: [],
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.medications).toHaveLength(0);
    });

    it('should reject visit without authentication', async () => {
      const response = await request(app)
        .post('/api/visits')
        .send(validVisitData);

      expect(response.status).toBe(401);
    });

    it('should return 404 if patient does not exist', async () => {
      (prisma.patient.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/visits')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validVisitData);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Patient not found');
    });
  });

  describe('GET /api/visits/patient/:patientId', () => {
    it('should return all visits for a patient with pagination', async () => {
      const mockVisits = [
        {
          id: mockVisitId,
          patientId: mockPatientId,
          complaints: 'Headache',
          diagnosis: 'Migraine',
          temperature: 37.0,
          bloodPressure: '120/80',
          pulse: 72,
          visitDate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          patient: {
            id: mockPatientId,
            name: 'John Doe',
            age: 30,
            gender: 'Male',
            phone: '1234567890',
          },
          medications: [],
        },
      ];

      (prisma.visit.findMany as jest.Mock).mockResolvedValue(mockVisits);
      (prisma.visit.count as jest.Mock).mockResolvedValue(1);

      const response = await request(app)
        .get(`/api/visits/patient/${mockPatientId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .query({ page: 1, limit: 20 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.visits).toHaveLength(1);
      expect(response.body.data.pagination).toBeDefined();
      expect(response.body.data.pagination.total).toBe(1);
    });

    it('should return empty array if patient has no visits', async () => {
      (prisma.visit.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.visit.count as jest.Mock).mockResolvedValue(0);

      const response = await request(app)
        .get(`/api/visits/patient/${mockPatientId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.visits).toHaveLength(0);
    });

    it('should reject request with invalid patient ID format', async () => {
      const response = await request(app)
        .get('/api/visits/patient/invalid-uuid')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/visits/:id', () => {
    it('should return single visit with medications', async () => {
      const mockVisit = {
        id: mockVisitId,
        patientId: mockPatientId,
        complaints: 'Fever',
        diagnosis: 'Viral fever',
        temperature: 38.5,
        bloodPressure: '120/80',
        pulse: 85,
        visitDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        patient: {
          id: mockPatientId,
          name: 'John Doe',
          age: 30,
          gender: 'Male',
          phone: '1234567890',
        },
        medications: [
          {
            id: 'med-1',
            visitId: mockVisitId,
            name: 'Paracetamol',
            dosage: '500mg',
            frequency: 'Three times daily',
            duration: '5 days',
            instructions: 'After meals',
            createdAt: new Date(),
          },
        ],
      };

      (prisma.visit.findUnique as jest.Mock).mockResolvedValue(mockVisit);

      const response = await request(app)
        .get(`/api/visits/${mockVisitId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(mockVisitId);
      expect(response.body.data.medications).toHaveLength(1);
    });

    it('should return 404 if visit not found', async () => {
      (prisma.visit.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .get(`/api/visits/${mockVisitId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/visits/:id', () => {
    it('should update visit successfully', async () => {
      const updateData = {
        diagnosis: 'Updated diagnosis',
        temperature: 37.2,
      };

      const mockUpdatedVisit = {
        id: mockVisitId,
        patientId: mockPatientId,
        complaints: 'Fever',
        diagnosis: updateData.diagnosis,
        temperature: updateData.temperature,
        bloodPressure: '120/80',
        pulse: 85,
        visitDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        patient: {
          id: mockPatientId,
          name: 'John Doe',
        },
        medications: [],
      };

      (prisma.visit.findUnique as jest.Mock).mockResolvedValue(mockUpdatedVisit);
      (prisma.visit.update as jest.Mock).mockResolvedValue(mockUpdatedVisit);

      const response = await request(app)
        .put(`/api/visits/${mockVisitId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.diagnosis).toBe(updateData.diagnosis);
    });

    it('should return 404 if visit to update not found', async () => {
      (prisma.visit.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .put(`/api/visits/${mockVisitId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ diagnosis: 'Updated' });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/visits/:id', () => {
    it('should delete visit successfully', async () => {
      const mockVisit = { id: mockVisitId, patientId: mockPatientId };

      (prisma.visit.findUnique as jest.Mock).mockResolvedValue(mockVisit);
      (prisma.visit.delete as jest.Mock).mockResolvedValue(mockVisit);

      const response = await request(app)
        .delete(`/api/visits/${mockVisitId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted successfully');
    });

    it('should return 404 if visit to delete not found', async () => {
      (prisma.visit.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .delete(`/api/visits/${mockVisitId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Performance Tests', () => {
    it('should create visit with medications in reasonable time', async () => {
      const startTime = Date.now();

      const mockPatient = {
        id: mockPatientId,
        name: 'John Doe',
        age: 30,
        gender: 'Male',
        phone: '1234567890',
      };

      const mockVisit = {
        id: mockVisitId,
        patientId: mockPatientId,
        complaints: 'Test complaints',
        diagnosis: 'Test diagnosis',
        temperature: 37.0,
        bloodPressure: '120/80',
        pulse: 75,
        visitDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockMedications = Array.from({ length: 5 }, (_, i) => ({
        id: `med-${i}`,
        visitId: mockVisitId,
        name: `Medication ${i}`,
        dosage: '500mg',
        frequency: 'Daily',
        duration: '5 days',
        instructions: 'Test',
        createdAt: new Date(),
      }));

      (prisma.$transaction as jest.Mock).mockResolvedValue([
        { ...mockVisit, patient: mockPatient, medications: mockMedications },
      ]);

      (prisma.patient.findUnique as jest.Mock).mockResolvedValue(mockPatient);

      const response = await request(app)
        .post('/api/visits')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          patientId: mockPatientId,
          complaints: 'Test complaints',
          diagnosis: 'Test diagnosis',
          temperature: 37.0,
          bloodPressure: '120/80',
          pulse: 75,
          medications: Array.from({ length: 5 }, (_, i) => ({
            name: `Medication ${i}`,
            dosage: '500mg',
            frequency: 'Daily',
            duration: '5 days',
            instructions: 'Test',
          })),
        });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(response.status).toBe(201);
      expect(duration).toBeLessThan(3000); // Should complete within 3 seconds
    });
  });
});
