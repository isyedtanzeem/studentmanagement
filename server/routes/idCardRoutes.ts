import { Router } from 'express';
import { IdCardController } from '../controllers/idCardController';
import { protect } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/roleMiddleware';

const router = Router();

router.use(protect as any);

router.get('/', IdCardController.getIdCards);
router.get('/branding', IdCardController.getBranding);
router.put('/branding', authorizeRoles('Super Admin', 'Admin') as any, IdCardController.updateBranding);
router.post('/generate', IdCardController.generateCard);
router.post('/batch-generate', IdCardController.batchGenerateCards);
router.get('/:id', IdCardController.getIdCardById);
router.put('/:id', IdCardController.updateCard);
router.post('/:id/revoke', authorizeRoles('Super Admin', 'Admin') as any, IdCardController.revokeCard);
router.post('/:id/record-print', IdCardController.recordPrint);

export default router;
