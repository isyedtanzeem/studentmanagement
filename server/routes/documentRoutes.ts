import { Router } from 'express';
import { DocumentController } from '../controllers/documentController';
import { protect } from '../middlewares/authMiddleware';

const router = Router();

// Protect all document endpoints
router.use(protect as any);

router.get('/', DocumentController.getDocuments);
router.get('/:id', DocumentController.getDocumentById);
router.post('/', DocumentController.createDocument);
router.put('/:id', DocumentController.updateDocument);
router.delete('/:id', DocumentController.deleteDocument);

export default router;
