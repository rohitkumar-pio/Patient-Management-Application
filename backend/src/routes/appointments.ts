import express from 'express';
import {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  deleteAppointment,
  getTodayAppointments,
} from '../controllers/appointmentController';
import { authenticate } from '../middleware/auth';

const router: express.Router = express.Router();

// All appointment routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/appointments
 * @desc    Create a new appointment
 * @access  Private
 */
router.post('/', createAppointment);

/**
 * @route   GET /api/appointments
 * @desc    Get appointments with optional date filter
 * @query   date - YYYY-MM-DD format (optional)
 * @access  Private
 */
router.get('/', getAppointments);

/**
 * @route   GET /api/appointments/today
 * @desc    Get today's appointments (today's queue)
 * @access  Private
 */
router.get('/today', getTodayAppointments);

/**
 * @route   GET /api/appointments/:id
 * @desc    Get single appointment by ID
 * @access  Private
 */
router.get('/:id', getAppointmentById);

/**
 * @route   PATCH /api/appointments/:id/status
 * @desc    Update appointment status
 * @access  Private
 */
router.patch('/:id/status', updateAppointmentStatus);

/**
 * @route   DELETE /api/appointments/:id
 * @desc    Delete appointment
 * @access  Private
 */
router.delete('/:id', deleteAppointment);

export default router;
