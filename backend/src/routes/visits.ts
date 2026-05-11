import { Router } from 'express';
import * as visitController from '../controllers/visitController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes are protected with authentication
router.use(authenticate);

/**
 * @route   POST /api/visits
 * @desc    Create a new visit with vitals and medications
 * @access  Private
 */
router.post('/', visitController.createVisit);

/**
 * @route   GET /api/patients/:patientId/visits
 * @desc    Get all visits for a specific patient
 * @access  Private
 */
router.get('/patient/:patientId', visitController.getVisitsByPatient);

/**
 * @route   GET /api/patients/:patientId/visits/summary
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
