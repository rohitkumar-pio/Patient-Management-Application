import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { generatePrescriptionPDF, getPrescriptionFilename } from '../services/prescriptionGenerator';
import { prisma } from '../config/database';

const router = Router();

/**
 * GET /api/visits/:id/prescription
 * Generate and download prescription PDF for a visit
 */
router.get('/:id/prescription', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const visitId = req.params.id as string;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(visitId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid visit ID format'
      });
      return;
    }

    // Check if visit exists
    const visit = await prisma.visit.findUnique({
      where: { id: visitId },
      include: { patient: true }
    });

    if (!visit) {
      res.status(404).json({
        success: false,
        message: 'Visit not found'
      });
      return;
    }

    // Generate PDF
    const pdfBuffer = await generatePrescriptionPDF(visitId);
    const filename = getPrescriptionFilename(visit);

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    // Send PDF
    res.send(pdfBuffer);
  } catch (error: any) {
    console.error('Error generating prescription PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate prescription',
      error: error.message
    });
  }
});

export default router;
