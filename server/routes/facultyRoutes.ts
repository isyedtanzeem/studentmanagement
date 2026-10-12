import { Router } from 'express';
import { FacultyController } from '../controllers/facultyController';
import { protect } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/roleMiddleware';

const router = Router();

router.use(protect as any);

router.get('/', FacultyController.getFacultyList);
router.post('/', authorizeRoles('Super Admin', 'Admin') as any, FacultyController.createFaculty);
router.get('/:id', FacultyController.getFacultyById);
router.put('/:id', authorizeRoles('Super Admin', 'Admin') as any, FacultyController.updateFaculty);
router.delete('/:id', authorizeRoles('Super Admin', 'Admin') as any, FacultyController.deleteFaculty);

export default router;
