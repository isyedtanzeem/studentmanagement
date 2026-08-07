import { Router } from 'express';
import { FacultyController } from '../controllers/facultyController';
import { protect } from '../middlewares/authMiddleware';

const router = Router();

router.use(protect as any);

router.get('/', FacultyController.getFacultyList);
router.post('/', FacultyController.createFaculty);
router.get('/:id', FacultyController.getFacultyById);
router.put('/:id', FacultyController.updateFaculty);
router.delete('/:id', FacultyController.deleteFaculty);

export default router;
