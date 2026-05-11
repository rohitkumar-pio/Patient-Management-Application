import { Request, Response } from 'express';
import { z } from 'zod';
import * as visitService from '../services/visitService';
import {
  createVisitSchema,
  updateVisitSchema,
} from '../validators/visitValidator';

/**
 * @route   POST /api/visits
 * @desc    Create a new visit with vitals and medications
 * @access  Private
 */
export const createVisit = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body
    const validatedData = createVisitSchema.parse(req.body);

    // Create visit
    const visit = await visitService.createVisit(validatedData);

    // Format and return response
    const formattedVisit = visitService.formatVisitData(visit);

    res.status(201).json({
      success: true,
      message: 'Visit created successfully',
      data: formattedVisit,
    });
  } catch (error: any) {
    console.error('Error creating visit:', error);

    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
      return;
    }

    if (error.message === 'Patient not found') {
      res.status(404).json({
        success: false,
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create visit',
      error: error.message,
    });
  }
};

/**
 * @route   GET /api/patients/:patientId/visits
 * @desc    Get all visits for a specific patient
 * @access  Private
 */
export const getVisitsByPatient = async (req: Request, res: Response): Promise<void> => {
  try {
    const patientId = Array.isArray(req.params.patientId) ? req.params.patientId[0] : req.params.patientId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    // Validate patientId
    if (!patientId || !/^[0-9a-fA-F-]{36}$/.test(patientId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid patient ID format',
      });
      return;
    }

    const result = await visitService.getVisitsByPatient(patientId, page, limit);

    res.status(200).json({
      success: true,
      data: {
        visits: result.visits.map(visitService.formatVisitData),
        pagination: result.pagination,
      },
    });
  } catch (error: any) {
    console.error('Error fetching patient visits:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patient visits',
      error: error.message,
    });
  }
};

/**
 * @route   GET /api/visits/:id
 * @desc    Get a single visit by ID with medications
 * @access  Private
 */
export const getVisitById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    // Validate id format
    if (!id || !/^[0-9a-fA-F-]{36}$/.test(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid visit ID format',
      });
      return;
    }

    const visit = await visitService.getVisitById(id);
    const formattedVisit = visitService.formatVisitData(visit);

    res.status(200).json({
      success: true,
      data: formattedVisit,
    });
  } catch (error: any) {
    console.error('Error fetching visit:', error);

    if (error.message === 'Visit not found') {
      res.status(404).json({
        success: false,
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Failed to fetch visit',
      error: error.message,
    });
  }
};

/**
 * @route   PUT /api/visits/:id
 * @desc    Update visit details
 * @access  Private
 */
export const updateVisit = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    // Validate id format
    if (!id || !/^[0-9a-fA-F-]{36}$/.test(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid visit ID format',
      });
      return;
    }

    // Validate request body
    const validatedData = updateVisitSchema.parse(req.body);

    // Update visit
    const visit = await visitService.updateVisit(id, validatedData);
    const formattedVisit = visitService.formatVisitData(visit);

    res.status(200).json({
      success: true,
      message: 'Visit updated successfully',
      data: formattedVisit,
    });
  } catch (error: any) {
    console.error('Error updating visit:', error);

    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
      return;
    }

    if (error.message === 'Visit not found') {
      res.status(404).json({
        success: false,
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update visit',
      error: error.message,
    });
  }
};

/**
 * @route   DELETE /api/visits/:id
 * @desc    Delete a visit
 * @access  Private
 */
export const deleteVisit = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    // Validate id format
    if (!id || !/^[0-9a-fA-F-]{36}$/.test(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid visit ID format',
      });
      return;
    }

    const result = await visitService.deleteVisit(id);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    console.error('Error deleting visit:', error);

    if (error.message === 'Visit not found') {
      res.status(404).json({
        success: false,
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Failed to delete visit',
      error: error.message,
    });
  }
};

/**
 * @route   GET /api/patients/:patientId/visits/summary
 * @desc    Get visit summary statistics for a patient
 * @access  Private
 */
export const getPatientVisitSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const patientId = Array.isArray(req.params.patientId) ? req.params.patientId[0] : req.params.patientId;

    // Validate patientId
    if (!patientId || !/^[0-9a-fA-F-]{36}$/.test(patientId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid patient ID format',
      });
      return;
    }

    const summary = await visitService.getPatientVisitSummary(patientId);

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error: any) {
    console.error('Error fetching visit summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch visit summary',
      error: error.message,
    });
  }
};
