import { Request, Response } from 'express';
import {
  createPatientSchema,
  updatePatientSchema,
  patientIdSchema,
  patientQuerySchema,
  CreatePatientInput,
  UpdatePatientInput,
} from '../validators/patientValidator';
import * as patientService from '../services/patientService';
import { z } from 'zod';

/**
 * Create a new patient
 * POST /api/patients
 */
export const createPatient = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Validate request body
    const validatedData: CreatePatientInput = createPatientSchema.parse(req.body);

    // Create patient
    const patient = await patientService.createPatient(validatedData);

    // Format response
    const formattedPatient = patientService.formatPatientData(patient);

    res.status(201).json({
      success: true,
      message: 'Patient created successfully',
      data: formattedPatient,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      });
      return;
    }

    if (error instanceof Error) {
      // Handle duplicate phone number error
      if (error.message.includes('phone number already exists')) {
        res.status(409).json({
          success: false,
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Failed to create patient',
        error: error.message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'An unexpected error occurred',
    });
  }
};

/**
 * Get all patients with pagination and optional search
 * GET /api/patients?search=&page=&limit=
 */
export const getPatients = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Validate query parameters
    const validatedQuery = patientQuerySchema.parse(req.query);

    // Get patients with pagination
    const result = await patientService.getPatients(
      validatedQuery.search,
      {
        page: validatedQuery.page,
        limit: validatedQuery.limit,
      }
    );

    // Format patients
    const formattedPatients = result.patients.map(
      patientService.formatPatientData
    );

    res.status(200).json({
      success: true,
      data: formattedPatients,
      pagination: result.pagination,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Invalid query parameters',
        errors: error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      });
      return;
    }

    if (error instanceof Error) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve patients',
        error: error.message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'An unexpected error occurred',
    });
  }
};

/**
 * Get a single patient by ID with visit count
 * GET /api/patients/:id
 */
export const getPatientById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Validate patient ID
    const validatedParams = patientIdSchema.parse(req.params);

    // Get patient
    const patient = await patientService.getPatientById(validatedParams.id);

    if (!patient) {
      res.status(404).json({
        success: false,
        message: 'Patient not found',
      });
      return;
    }

    // Format response
    const formattedPatient = patientService.formatPatientData(patient);

    res.status(200).json({
      success: true,
      data: formattedPatient,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Invalid patient ID',
        errors: error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      });
      return;
    }

    if (error instanceof Error) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve patient',
        error: error.message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'An unexpected error occurred',
    });
  }
};

/**
 * Update patient details
 * PUT /api/patients/:id
 */
export const updatePatient = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Validate patient ID
    const validatedParams = patientIdSchema.parse(req.params);

    // Validate request body
    const validatedData: UpdatePatientInput = updatePatientSchema.parse(req.body);

    // Check if patient exists
    const existingPatient = await patientService.getPatientById(
      validatedParams.id
    );

    if (!existingPatient) {
      res.status(404).json({
        success: false,
        message: 'Patient not found',
      });
      return;
    }

    // Update patient
    const updatedPatient = await patientService.updatePatient(
      validatedParams.id,
      validatedData
    );

    // Format response
    const formattedPatient = patientService.formatPatientData(updatedPatient);

    res.status(200).json({
      success: true,
      message: 'Patient updated successfully',
      data: formattedPatient,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      });
      return;
    }

    if (error instanceof Error) {
      // Handle duplicate phone number error
      if (error.message.includes('phone number already exists')) {
        res.status(409).json({
          success: false,
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Failed to update patient',
        error: error.message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'An unexpected error occurred',
    });
  }
};

/**
 * Delete a patient
 * DELETE /api/patients/:id
 */
export const deletePatient = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Validate patient ID
    const validatedParams = patientIdSchema.parse(req.params);

    // Check if patient exists
    const existingPatient = await patientService.getPatientById(
      validatedParams.id
    );

    if (!existingPatient) {
      res.status(404).json({
        success: false,
        message: 'Patient not found',
      });
      return;
    }

    // Delete patient
    await patientService.deletePatient(validatedParams.id);

    res.status(200).json({
      success: true,
      message: 'Patient deleted successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Invalid patient ID',
        errors: error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      });
      return;
    }

    if (error instanceof Error) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete patient',
        error: error.message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'An unexpected error occurred',
    });
  }
};

/**
 * Search patients by name or phone (< 5 seconds per BRD)
 * GET /api/patients/search?q=searchTerm
 */
export const searchPatients = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const searchTerm = req.query.q as string;

    if (!searchTerm || searchTerm.trim() === '') {
      res.status(400).json({
        success: false,
        message: 'Search term (q) is required',
      });
      return;
    }

    // Search patients
    const patients = await patientService.searchPatients(searchTerm);

    // Format patients
    const formattedPatients = patients.map(patientService.formatPatientData);

    res.status(200).json({
      success: true,
      data: formattedPatients,
      count: formattedPatients.length,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        success: false,
        message: 'Failed to search patients',
        error: error.message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'An unexpected error occurred',
    });
  }
};
