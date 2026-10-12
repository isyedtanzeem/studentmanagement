import { Router } from 'express';
import { DepartmentController } from '../controllers/departmentController';
import { protect } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/roleMiddleware';

const router = Router();

// Apply auth middleware
router.use(protect as any);

// Faculty options endpoint for HOD selection
router.get('/faculty-options', DepartmentController.getFacultyOptions);

// Collection operations
router.get('/', DepartmentController.getDepartments);
router.post('/', authorizeRoles('Super Admin', 'Admin') as any, DepartmentController.createDepartment);

// Item operations
router.get('/:id', DepartmentController.getDepartmentById);
router.put('/:id', authorizeRoles('Super Admin', 'Admin') as any, DepartmentController.updateDepartment);
router.delete('/:id', authorizeRoles('Super Admin', 'Admin') as any, DepartmentController.deleteDepartment);

export default router;
