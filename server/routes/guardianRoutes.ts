import { Router } from 'express';
import { GuardianController } from '../controllers/guardianController';
import { protect } from '../middlewares/authMiddleware';

const router = Router();

// Apply auth middleware
router.use(protect as any);

// Student options for guardian-student mapping
router.get('/student-options', GuardianController.getStudentOptions);

// Collection operations
router.get('/', GuardianController.getGuardians);
router.post('/', GuardianController.createGuardian);

// Item operations
router.get('/:id', GuardianController.getGuardianById);
router.put('/:id', GuardianController.updateGuardian);
router.delete('/:id', GuardianController.deleteGuardian);

export default router;
