import { PrismaClient } from '@prisma/client';
import { CreateVisitInput, UpdateVisitInput } from '../validators/visitValidator';

const prisma = new PrismaClient();

/**
 * Create a new visit with medications in a transaction
 */
export const createVisit = async (data: CreateVisitInput) => {
  const { patientId, complaints, diagnosis, temperature, bloodPressure, pulse, medications, visitDate } = data;

  // Verify patient exists
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
  });

  if (!patient) {
    throw new Error('Patient not found');
  }

  // Create visit with medications in a transaction
  const visit = await prisma.$transaction(async (tx) => {
    // Create the visit
    const newVisit = await tx.visit.create({
      data: {
        patientId,
        complaints,
        diagnosis: diagnosis || null,
        temperature,
        bloodPressure,
        pulse,
        visitDate: visitDate ? new Date(visitDate) : new Date(),
      },
    });

    // Create medications if provided
    if (medications && medications.length > 0) {
      await tx.medication.createMany({
        data: medications.map((med) => ({
          visitId: newVisit.id,
          name: med.name,
          dosage: med.dosage,
          frequency: med.frequency,
          duration: med.duration,
          instructions: med.instructions || null,
        })),
      });
    }

    // Fetch the complete visit with medications
    const completeVisit = await tx.visit.findUnique({
      where: { id: newVisit.id },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            age: true,
            gender: true,
            phone: true,
          },
        },
        medications: true,
      },
    });

    return completeVisit;
  });

  return visit;
};

/**
 * Get all visits for a specific patient
 */
export const getVisitsByPatient = async (patientId: string, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  const [visits, total] = await Promise.all([
    prisma.visit.findMany({
      where: { patientId },
      include: {
        medications: true,
        patient: {
          select: {
            id: true,
            name: true,
            age: true,
            gender: true,
            phone: true,
          },
        },
      },
      orderBy: { visitDate: 'desc' },
      skip,
      take: limit,
    }),
    prisma.visit.count({ where: { patientId } }),
  ]);

  return {
    visits,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get a single visit by ID with medications
 */
export const getVisitById = async (visitId: string) => {
  const visit = await prisma.visit.findUnique({
    where: { id: visitId },
    include: {
      patient: {
        select: {
          id: true,
          name: true,
          age: true,
          gender: true,
          phone: true,
          address: true,
        },
      },
      medications: true,
    },
  });

  if (!visit) {
    throw new Error('Visit not found');
  }

  return visit;
};

/**
 * Update visit details
 */
export const updateVisit = async (visitId: string, data: UpdateVisitInput) => {
  // Verify visit exists
  const existingVisit = await prisma.visit.findUnique({
    where: { id: visitId },
  });

  if (!existingVisit) {
    throw new Error('Visit not found');
  }

  // Update visit
  const updatedVisit = await prisma.visit.update({
    where: { id: visitId },
    data: {
      complaints: data.complaints,
      diagnosis: data.diagnosis,
      temperature: data.temperature,
      bloodPressure: data.bloodPressure,
      pulse: data.pulse,
    },
    include: {
      patient: {
        select: {
          id: true,
          name: true,
          age: true,
          gender: true,
          phone: true,
        },
      },
      medications: true,
    },
  });

  return updatedVisit;
};

/**
 * Delete a visit (cascades to medications)
 */
export const deleteVisit = async (visitId: string) => {
  // Verify visit exists
  const existingVisit = await prisma.visit.findUnique({
    where: { id: visitId },
  });

  if (!existingVisit) {
    throw new Error('Visit not found');
  }

  // Delete visit (medications will be cascade deleted)
  await prisma.visit.delete({
    where: { id: visitId },
  });

  return { message: 'Visit deleted successfully' };
};

/**
 * Get visit summary statistics for a patient
 */
export const getPatientVisitSummary = async (patientId: string) => {
  const visitCount = await prisma.visit.count({
    where: { patientId },
  });

  const lastVisit = await prisma.visit.findFirst({
    where: { patientId },
    orderBy: { visitDate: 'desc' },
    select: {
      id: true,
      visitDate: true,
      complaints: true,
      diagnosis: true,
    },
  });

  const medicationCount = await prisma.medication.count({
    where: {
      visit: {
        patientId,
      },
    },
  });

  return {
    totalVisits: visitCount,
    lastVisit,
    totalMedicationsPrescribed: medicationCount,
  };
};

/**
 * Format visit data for API response
 */
export const formatVisitData = (visit: any) => {
  return {
    id: visit.id,
    patientId: visit.patientId,
    patient: visit.patient ? {
      id: visit.patient.id,
      name: visit.patient.name,
      age: visit.patient.age,
      gender: visit.patient.gender,
      phone: visit.patient.phone,
    } : undefined,
    complaints: visit.complaints,
    diagnosis: visit.diagnosis,
    vitals: {
      temperature: visit.temperature,
      bloodPressure: visit.bloodPressure,
      pulse: visit.pulse,
    },
    medications: visit.medications || [],
    visitDate: visit.visitDate,
    createdAt: visit.createdAt,
    updatedAt: visit.updatedAt,
  };
};
