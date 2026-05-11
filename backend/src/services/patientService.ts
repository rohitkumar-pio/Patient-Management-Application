import { prisma } from '../config/database';
import { CreatePatientInput, UpdatePatientInput } from '../validators/patientValidator';
import { Prisma } from '@prisma/client';

/**
 * Patient service - Business logic for patient management
 */

interface PaginationParams {
  page: number;
  limit: number;
}

interface PatientWithVisitCount {
  id: string;
  name: string;
  age: number | null;
  dateOfBirth: Date | null;
  gender: string | null;
  phone: string;
  address: string | null;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    visits: number;
  };
}

/**
 * Check if a phone number is already in use by another patient
 */
export const isPhoneDuplicate = async (
  phone: string,
  excludePatientId?: string
): Promise<boolean> => {
  const existingPatient = await prisma.patient.findUnique({
    where: { phone },
    select: { id: true },
  });

  if (!existingPatient) {
    return false;
  }

  // If updating, check if the phone belongs to a different patient
  if (excludePatientId && existingPatient.id === excludePatientId) {
    return false;
  }

  return true;
};

/**
 * Create a new patient
 */
export const createPatient = async (
  data: CreatePatientInput
): Promise<PatientWithVisitCount> => {
  // Check for duplicate phone number
  const isDuplicate = await isPhoneDuplicate(data.phone);
  if (isDuplicate) {
    throw new Error('A patient with this phone number already exists');
  }

  // Create patient with visit count
  const patient = await prisma.patient.create({
    data: {
      name: data.name,
      age: data.age ?? null,
      dateOfBirth: data.dateOfBirth ?? null,
      gender: data.gender ?? null,
      phone: data.phone,
      address: data.address ?? null,
    },
    include: {
      _count: {
        select: { visits: true },
      },
    },
  });

  return patient;
};

/**
 * Get paginated list of patients with optional search
 */
export const getPatients = async (
  search?: string,
  pagination?: PaginationParams
) => {
  const page = pagination?.page || 1;
  const limit = pagination?.limit || 20;
  const skip = (page - 1) * limit;

  // Build search conditions
  const searchConditions: Prisma.PatientWhereInput = search
    ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
        ],
      }
    : {};

  // Execute queries in parallel for better performance
  const [patients, totalCount] = await Promise.all([
    prisma.patient.findMany({
      where: searchConditions,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { visits: true },
        },
      },
    }),
    prisma.patient.count({
      where: searchConditions,
    }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;

  return {
    patients,
    pagination: {
      currentPage: page,
      totalPages,
      totalCount,
      limit,
      hasNextPage,
      hasPreviousPage,
    },
  };
};

/**
 * Get a single patient by ID with visit count
 */
export const getPatientById = async (
  id: string
): Promise<PatientWithVisitCount | null> => {
  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      _count: {
        select: { visits: true },
      },
    },
  });

  return patient;
};

/**
 * Update patient details
 */
export const updatePatient = async (
  id: string,
  data: UpdatePatientInput
): Promise<PatientWithVisitCount> => {
  // If phone is being updated, check for duplicates
  if (data.phone) {
    const isDuplicate = await isPhoneDuplicate(data.phone, id);
    if (isDuplicate) {
      throw new Error('A patient with this phone number already exists');
    }
  }

  // Update patient
  const updatedPatient = await prisma.patient.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.age !== undefined && { age: data.age }),
      ...(data.dateOfBirth !== undefined && { dateOfBirth: data.dateOfBirth }),
      ...(data.gender !== undefined && { gender: data.gender }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.address !== undefined && { address: data.address }),
    },
    include: {
      _count: {
        select: { visits: true },
      },
    },
  });

  return updatedPatient;
};

/**
 * Delete a patient (soft delete by marking as deleted or hard delete)
 * For now, implementing hard delete as schema doesn't have deleted flag
 */
export const deletePatient = async (id: string): Promise<void> => {
  await prisma.patient.delete({
    where: { id },
  });
};

/**
 * Search patients by name or phone
 * Optimized for fast search (< 5 seconds requirement)
 */
export const searchPatients = async (
  searchTerm: string,
  limit: number = 50
): Promise<PatientWithVisitCount[]> => {
  const patients = await prisma.patient.findMany({
    where: {
      OR: [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { phone: { contains: searchTerm, mode: 'insensitive' } },
      ],
    },
    take: limit,
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { visits: true },
      },
    },
  });

  return patients;
};

/**
 * Format patient data for response
 */
export const formatPatientData = (patient: PatientWithVisitCount) => {
  return {
    id: patient.id,
    name: patient.name,
    age: patient.age,
    dateOfBirth: patient.dateOfBirth,
    gender: patient.gender,
    phone: patient.phone,
    address: patient.address,
    visitCount: patient._count.visits,
    createdAt: patient.createdAt,
    updatedAt: patient.updatedAt,
  };
};
