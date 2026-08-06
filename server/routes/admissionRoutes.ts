import { Router } from 'express';
import { AdmissionController } from '../controllers/admissionController';
import { protect } from '../middlewares/authMiddleware';

const router = Router();

// Apply auth middleware to all admission management routes
router.use(protect as any);

// Roll Number Generator helper endpoint
router.get('/generate-rollno', AdmissionController.generateRollNumber);

// List and Submit Application
router.get('/', AdmissionController.getApplications);
router.post('/', AdmissionController.createApplication);

// Application details
router.get('/:id', AdmissionController.getApplicationById);

// Update status / Verification / Approval / Rejection
router.patch('/:id/status', AdmissionController.updateStatus);
router.put('/:id/verify-documents', AdmissionController.verifyDocuments);
router.post('/:id/approve', AdmissionController.approveAndEnroll);
router.post('/:id/reject', AdmissionController.rejectApplication);

export default router;
