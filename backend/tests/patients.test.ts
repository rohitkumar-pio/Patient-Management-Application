import request from 'supertest';
import app from '../src/app';
import { PrismaClient } from '@prisma/client';
import { generateToken } from '../src/utils/jwt';

// Mock Prisma Client
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    patient: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    visit: {
      count: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    $disconnect: jest.fn(),
  };

  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
  };
});

const prisma = new PrismaClient();

// Mock user for authentication
const mockUser = {
  id: '1',
  email: 'doctor@test.com',
  name: 'Dr. Test',
  role: 'DOCTOR',
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Generate valid JWT token for testing
const mockToken = generateToken({
  userId: mockUser.id,
  email: mockUser.email,
  role: mockUser.role,
});

// Mock patient data
const mockPatientId = '550e8400-e29b-41d4-a716-446655440000';  // Valid UUID
const mockPatient2Id = '550e8400-e29b-41d4-a716-446655440001'; // Valid UUID

describe('Patient Management API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock user authentication
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/patients - Create Patient', () => {
    it('should create a new patient with valid data', async () => {
      const patientData = {
        name: 'John Doe',
        age: 35,
        gender: 'Male',
        phone: '1234567890',
        address: '123 Main St',
        dateOfBirth: '1989-01-01T00:00:00.000Z',
      };

      const mockPatient = {
        id: mockPatientId,
        ...patientData,
        dateOfBirth: new Date(patientData.dateOfBirth),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.patient.findUnique as jest.Mock).mockResolvedValue(null); // No duplicate
      (prisma.patient.create as jest.Mock).mockResolvedValue(mockPatient);
      (prisma.visit.count as jest.Mock).mockResolvedValue(0);

      const response = await request(app)
        .post('/api/patients')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(patientData)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('name', patientData.name);
      expect(response.body.data).toHaveProperty('phone', patientData.phone);
      expect(prisma.patient.create).toHaveBeenCalledTimes(1);
    });

    it('should return 409 for duplicate phone number', async () => {
      const patientData = {
        name: 'Jane Doe',
        age: 30,
        gender: 'Female',
        phone: '9999999999',
        address: '456 Oak St',
      };

      const existingPatient = {
        id: '650e8400-e29b-41d4-a716-446655440002',
        name: 'Existing Patient',
        phone: '9999999999',
        age: 40,
        gender: 'Male',
        address: '789 Elm St',
        dateOfBirth: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.patient.findUnique as jest.Mock).mockResolvedValue(existingPatient);

      const response = await request(app)
        .post('/api/patients')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(patientData)
        .expect(409);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('phone number');
      expect(prisma.patient.create).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid data', async () => {
      const invalidData = {
        name: 'A', // Too short
        age: 200, // Invalid age
        gender: 'Male',
        phone: '123', // Too short
      };

      const response = await request(app)
        .post('/api/patients')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Validation error');
      expect(prisma.patient.create).not.toHaveBeenCalled();
    });

    it('should return 401 without authentication token', async () => {
      const patientData = {
        name: 'John Doe',
        age: 35,
        gender: 'Male',
        phone: '1234567890',
      };

      const response = await request(app)
        .post('/api/patients')
        .send(patientData)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /api/patients - Get Paginated Patient List', () => {
    it('should return paginated list of patients', async () => {
      const mockPatients = [
        {
          id: mockPatientId,
          name: 'John Doe',
          age: 35,
          gender: 'Male',
          phone: '1234567890',
          address: '123 Main St',
          dateOfBirth: new Date('1989-01-01'),
          createdAt: new Date(),
          updatedAt: new Date(),
          _count: { visits: 5 },
        },
        {
          id: mockPatient2Id,
          name: 'Jane Smith',
          age: 28,
          gender: 'Female',
          phone: '0987654321',
          address: '456 Oak Ave',
          dateOfBirth: new Date('1996-05-15'),
          createdAt: new Date(),
          updatedAt: new Date(),
          _count: { visits: 3 },
        },
      ];

      (prisma.patient.findMany as jest.Mock).mockResolvedValue(mockPatients);
      (prisma.patient.count as jest.Mock).mockResolvedValue(2);

      const response = await request(app)
        .get('/api/patients?page=1&limit=20')
        .set('Authorization', `Bearer ${mockToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
     expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination).toHaveProperty('total', 2);
      expect(response.body.pagination).toHaveProperty('page', 1);
      expect(response.body.pagination).toHaveProperty('limit', 20);
    });

    it('should filter patients by search term', async () => {
      const searchResults = [
        {
          id: 'patient-1',
          name: 'John Doe',
          age: 35,
          gender: 'Male',
          phone: '1234567890',
          address: '123 Main St',
          dateOfBirth: new Date('1989-01-01'),
          createdAt: new Date(),
          updatedAt: new Date(),
          _count: { visits: 5 },
        },
      ];

      (prisma.patient.findMany as jest.Mock).mockResolvedValue(searchResults);
      (prisma.patient.count as jest.Mock).mockResolvedValue(1);

      const response = await request(app)
        .get('/api/patients?search=john')
        .set('Authorization', `Bearer ${mockToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toContain('John');
    });

    it('should handle pagination correctly', async () => {
      const mockPatients = Array.from({ length: 5 }, (_, i) => ({
        id: `550e8400-e29b-41d4-a716-44665544000${i}`,
        name: `Patient ${i + 1}`,
        age: 30 + i,
        gender: i % 2 === 0 ? 'Male' : 'Female',
        phone: `123456789${i}`,
        address: `${i} Test St`,
        dateOfBirth: new Date('1990-01-01'),
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { visits: i },
      }));

      (prisma.patient.findMany as jest.Mock).mockResolvedValue(mockPatients);
      (prisma.patient.count as jest.Mock).mockResolvedValue(50);

      const response = await request(app)
        .get('/api/patients?page=2&limit=5')
        .set('Authorization', `Bearer ${mockToken}`)
        .expect(200);

      expect(response.body.pagination).toHaveProperty('page', 2);
      expect(response.body.pagination).toHaveProperty('limit', 5);
      expect(response.body.pagination).toHaveProperty('total', 50);
      expect(response.body.pagination).toHaveProperty('totalPages', 10);
    });
  });

  describe('GET /api/patients/:id - Get Single Patient', () => {
    it('should return patient details with visit count', async () => {
      const mockPatient = {
        id: mockPatientId,
        name: 'John Doe',
        age: 35,
        gender: 'Male',
        phone: '1234567890',
        address: '123 Main St',
        dateOfBirth: new Date('1989-01-01'),
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { visits: 5 },
      };

      (prisma.patient.findUnique as jest.Mock).mockResolvedValue(mockPatient);

      const response = await request(app)
        .get(`/api/patients/${mockPatientId}`)
        .set('Authorization', `Bearer ${mockToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id', mockPatientId);
      expect(response.body.data).toHaveProperty('name', 'John Doe');
      expect(response.body.data).toHaveProperty('visitCount', 5);
    });

    it('should return 404 for non-existent patient', async () => {
      (prisma.patient.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .get('/api/patients/non-existent-id')
        .set('Authorization', `Bearer ${mockToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('not found');
    });
  });

  describe('PUT /api/patients/:id - Update Patient', () => {
    it('should update patient with valid data', async () => {
      const updateData = {
        name: 'John Doe Updated',
        age: 36,
        address: '456 New Address',
      };

      const existingPatient = {
        id: 'patient-1',
        name: 'John Doe',
        age: 35,
        gender: 'Male',
        phone: '1234567890',
        address: '123 Main St',
        dateOfBirth: new Date('1989-01-01'),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedPatient = {
        ...existingPatient,
        ...updateData,
        updatedAt: new Date(),
      };

      (prisma.patient.findUnique as jest.Mock)
        .mockResolvedValueOnce(existingPatient) // Check existence
        .mockResolvedValueOnce(null); // Check no duplicate phone
      (prisma.patient.update as jest.Mock).mockResolvedValue(updatedPatient);

      const response = await request(app)
        .put('/api/patients/patient-1')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('name', 'John Doe Updated');
      expect(response.body.data).toHaveProperty('age', 36);
      expect(prisma.patient.update).toHaveBeenCalledTimes(1);
    });

    it('should return 409 when updating to duplicate phone', async () => {
      const updateData = {
        phone: '9999999999', // Existing phone of another patient
      };

      const existingPatient = {
        id: 'patient-1',
        name: 'John Doe',
        age: 35,
        gender: 'Male',
        phone: '1234567890',
        address: '123 Main St',
        dateOfBirth: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const duplicatePatient = {
        id: mockPatient2Id,
        name: 'Another Patient',
        phone: '9999999999',
        age: 40,
        gender: 'Male',
        address: '789 Other St',
        dateOfBirth: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.patient.findUnique as jest.Mock)
        .mockResolvedValueOnce(existingPatient)
        .mockResolvedValueOnce(duplicatePatient);

      const response = await request(app)
        .put('/api/patients/patient-1')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(updateData)
        .expect(409);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('phone number');
      expect(prisma.patient.update).not.toHaveBeenCalled();
    });

    it('should return 404 for non-existent patient', async () => {
      (prisma.patient.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .put('/api/patients/non-existent-id')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({ name: 'Updated Name' })
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(prisma.patient.update).not.toHaveBeenCalled();
    });
  });

  describe('DELETE /api/patients/:id - Delete Patient', () => {
    it('should delete patient successfully', async () => {
      const existingPatient = {
        id: 'patient-1',
        name: 'John Doe',
        age: 35,
        gender: 'Male',
        phone: '1234567890',
        address: '123 Main St',
        dateOfBirth: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.patient.findUnique as jest.Mock).mockResolvedValue(existingPatient);
      (prisma.patient.delete as jest.Mock).mockResolvedValue(existingPatient);

      const response = await request(app)
        .delete(`/api/patients/${mockPatientId}`)
        .set('Authorization', `Bearer ${mockToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('deleted');
      expect(prisma.patient.delete).toHaveBeenCalledTimes(1);
    });

    it('should return 404 for non-existent patient', async () => {
      (prisma.patient.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .delete('/api/patients/non-existent-id')
        .set('Authorization', `Bearer ${mockToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(prisma.patient.delete).not.toHaveBeenCalled();
    });
  });

  describe('GET /api/patients/search - Search Patients', () => {
    it('should search patients by name or phone', async () => {
      const searchResults = [
        {
          id: 'patient-1',
          name: 'John Doe',
          age: 35,
          gender: 'Male',
          phone: '1234567890',
          address: '123 Main St',
          dateOfBirth: new Date('1989-01-01'),
          createdAt: new Date(),
          updatedAt: new Date(),
          _count: { visits: 5 },
        },
      ];

      (prisma.patient.findMany as jest.Mock).mockResolvedValue(searchResults);

      const startTime = Date.now();
      const response = await request(app)
        .get('/api/patients/search?q=john')
        .set('Authorization', `Bearer ${mockToken}`)
        .expect(200);
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toContain('John');

      // Verify search performance < 5 seconds (BRD requirement)
      expect(responseTime).toBeLessThan(5000);
    });

    it('should return empty array for no matches', async () => {
      (prisma.patient.findMany as jest.Mock).mockResolvedValue([]);

      const response = await request(app)
        .get('/api/patients/search?q=nonexistent')
        .set('Authorization', `Bearer ${mockToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveLength(0);
    });

    it('should perform search within 5 seconds (performance test)', async () => {
      // Create mock data for 100 patients
      const mockPatients = Array.from({ length: 100 }, (_, i) => ({
        id: `550e8400-e29b-41d4-a716-4466${String(i).padStart(8, '0')}`,
        name: `Patient ${i + 1}`,
        age: 30 + (i % 50),
        gender: i % 2 === 0 ? 'Male' : 'Female',
        phone: `12345${String(i).padStart(5, '0')}`,
        address: `${i} Test St`,
        dateOfBirth: new Date('1990-01-01'),
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { visits: i % 10 },
      }));

      (prisma.patient.findMany as jest.Mock).mockResolvedValue(mockPatients);

      const startTime = Date.now();
      const response = await request(app)
        .get('/api/patients/search?q=patient')
        .set('Authorization', `Bearer ${mockToken}`)
        .expect(200);
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.body).toHaveProperty('success', true);
      // BRD requirement: Search should return results < 5 seconds
      expect(responseTime).toBeLessThan(5000);
      console.log(`Search completed in ${responseTime}ms (target: < 5000ms)`);
    });
  });
});
