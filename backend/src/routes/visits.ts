import { Router } from 'express';
import * as visitController from '../controllers/visitController';
import { authenticate } from '../middleware/auth';

const router: Router = Router();

// All routes are protected with authentication
router.use(authenticate);

/**
 * @route   POST /api/visits
 * @desc    Create a new visit with vitals and medications
 * @access  Private
 */
router.post('/', visitController.createVisit);

/**
 * @route   GET /api/visits
 * @desc    Visit history with filters, newest first, with medications
 * @query   patientId, startDate, endDate, limit (default 20, max 100), offset
 * @access  Private
 */
router.get('/', visitController.getPatientHistory);

/**
 * @route   GET /api/visits/patient/:patientId
 * @desc    Get all visits for a specific patient (page-based; see GET /api/patients/:id/visits)
 * @access  Private
 */
router.get('/patient/:patientId', visitController.getVisitsByPatient);

/**
 * @route   GET /api/visits/patient/:patientId/summary
 * @desc    Get visit summary statistics for a patient
 * @access  Private
 */
router.get('/patient/:patientId/summary', visitController.getPatientVisitSummary);

/**
 * @route   GET /api/visits/:id
 * @desc    Get a single visit by ID with medications
 * @access  Private
 */
router.get('/:id', visitController.getVisitById);

/**
 * @route   PUT /api/visits/:id
 * @desc    Update visit details
 * @access  Private
 */
router.put('/:id', visitController.updateVisit);

/**
 * @route   DELETE /api/visits/:id
 * @desc    Delete a visit
 * @access  Private
 */
router.delete('/:id', visitController.deleteVisit);

export default router;
