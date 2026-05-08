import request from 'supertest';
import app from '../src/app';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-testing-only';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';

// Mock Prisma Client
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    patient: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    $disconnect: jest.fn(),
  };

  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
  };
});

const prisma = new PrismaClient();

describe('Authentication API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/auth/register', () => {
    it('should create a new user with valid data', async () => {
      const userData = {
        email: 'newdoctor@test.com',
        password: 'password123',
        name: 'Dr. New Doctor',
      };

      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const mockUser = {
        id: '1',
        email: userData.email,
        name: userData.name,
        role: 'DOCTOR',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock Prisma user.create (note: no password field in response)
      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user).toHaveProperty('email', userData.email);
      expect(response.body.data.user).toHaveProperty('name', userData.name);
      expect(response.body.data.user).not.toHaveProperty('password');
    });

    it('should return 400 for invalid email format', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'password123',
        name: 'Dr. Test',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('errors');
    });

    it('should return 400 for short password', async () => {
      const userData = {
        email: 'doctor@test.com',
        password: '123',
        name: 'Dr. Test',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('errors');
    });

    it('should return 400 for duplicate email', async () => {
      const userData = {
        email: 'existing@test.com',
        password: 'password123',
        name: 'Dr. Test',
      };

      const existingUser = {
        id: '1',
        email: userData.email,
        password: 'hashedpass',
        name: 'Existing User',
        role: 'DOCTOR',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock that user already exists
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(existingUser);

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should return JWT token with valid credentials', async () => {
      const loginData = {
        email: 'doctor@test.com',
        password: 'password123',
      };

      const hashedPassword = await bcrypt.hash(loginData.password, 10);
      const mockUser = {
        id: '1',
        email: loginData.email,
        password: hashedPassword,
        name: 'Dr. Test Doctor',
        role: 'DOCTOR',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock Prisma user.findUnique
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user).toHaveProperty('email', loginData.email);
      expect(response.body.data.user).not.toHaveProperty('password');
    });

    it('should return 401 for invalid email', async () => {
      const loginData = {
        email: 'nonexistent@test.com',
        password: 'password123',
      };

      // Mock user not found
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Invalid');
    });

    it('should return 401 for invalid password', async () => {
      const loginData = {
        email: 'doctor@test.com',
        password: 'wrongpassword',
      };

      const hashedPassword = await bcrypt.hash('correctpassword', 10);
      const mockUser = {
        id: '1',
        email: loginData.email,
        password: hashedPassword,
        name: 'Dr. Test',
        role: 'DOCTOR',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock user found but password incorrect
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Invalid');
    });

    it('should return 400 for missing email', async () => {
      const loginData = {
        password: 'password123',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 for missing password', async () => {
      const loginData = {
        email: 'doctor@test.com',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('Authentication Flow', () => {
    it('should complete full registration and login flow', async () => {
      const userData = {
        email: 'flowtest@test.com',
        password: 'flowpassword123',
        name: 'Dr. Flow Test',
      };

      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const mockUser = {
        id: '2',
        email: userData.email,
        password: hashedPassword,
        name: userData.name,
        role: 'DOCTOR',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Step 1: Register
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);
      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);

      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(registerResponse.body).toHaveProperty('success', true);
      expect(registerResponse.body.data).toHaveProperty('token');
      const registerToken = registerResponse.body.data.token;
      expect(registerToken).toBeTruthy();

      // Step 2: Login with same credentials
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(mockUser);

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password,
        })
        .expect(200);

      expect(loginResponse.body).toHaveProperty('success', true);
      expect(loginResponse.body.data).toHaveProperty('token');
      const loginToken = loginResponse.body.data.token;
      expect(loginToken).toBeTruthy();
      expect(loginResponse.body.data.user.email).toBe(userData.email);
    });
  });
});
