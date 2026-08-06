import { Router } from 'express';
import { DepartmentController } from '../controllers/departmentController';
import { protect } from '../middlewares/authMiddleware';

const router = Router();

// Apply auth middleware
router.use(protect as any);

// Faculty options endpoint for HOD selection
router.get('/faculty-options', DepartmentController.getFacultyOptions);

// Collection operations
router.get('/', DepartmentController.getDepartments);
router.post('/', DepartmentController.createDepartment);

// Item operations
router.get('/:id', DepartmentController.getDepartmentById);
router.put('/:id', DepartmentController.updateDepartment);
router.delete('/:id', DepartmentController.deleteDepartment);

export default router;
