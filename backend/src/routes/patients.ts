import { Router } from 'express';
import {
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient,
  searchPatients,
} from '../controllers/patientController';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * @route   GET /api/patients/search
 * @desc    Search patients by name or phone (< 5 seconds per BRD)
 * @access  Protected
 * @query   q - Search term
 */
router.get('/search', authenticate, searchPatients);

/**
 * @route   POST /api/patients
 * @desc    Create a new patient
 * @access  Protected
 * @body    { name, age?, dateOfBirth?, gender?, phone, address? }
 */
router.post('/', authenticate, createPatient);

/**
 * @route   GET /api/patients
 * @desc    Get all patients with pagination and optional search
 * @access  Protected
 * @query   search?, page?, limit?
 */
router.get('/', authenticate, getPatients);

/**
 * @route   GET /api/patients/:id
 * @desc    Get a single patient by ID with visit count
 * @access  Protected
 * @param   id - Patient UUID
 */
router.get('/:id', authenticate, getPatientById);

/**
 * @route   PUT /api/patients/:id
 * @desc    Update patient details
 * @access  Protected
 * @param   id - Patient UUID
 * @body    { name?, age?, dateOfBirth?, gender?, phone?, address? }
 */
router.put('/:id', authenticate, updatePatient);

/**
 * @route   DELETE /api/patients/:id
 * @desc    Delete a patient
 * @access  Protected
 * @param   id - Patient UUID
 */
router.delete('/:id', authenticate, deletePatient);

export default router;
