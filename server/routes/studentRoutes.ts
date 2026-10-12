import { Router } from 'express';
import { StudentController } from '../controllers/studentController';
import { protect } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/roleMiddleware';

const router = Router();

// Apply auth middleware to all student routes
router.use(protect as any);

// Export CSV & Student Portal routes (must be placed before GET :id)
router.get('/export/csv', StudentController.exportCSV);
router.get('/my-portal', StudentController.getMyPortalData);

// List and Create
router.get('/', StudentController.getStudents);
router.post('/', StudentController.createStudent);

// Bulk Import (Restricted to Super Admin & Admin)
router.post('/bulk-import', authorizeRoles('Super Admin', 'Admin') as any, StudentController.bulkImport);

// ID specific routes
router.get('/:id', StudentController.getStudentById);
router.put('/:id', authorizeRoles('Super Admin', 'Admin') as any, StudentController.updateStudent);
router.delete('/:id', authorizeRoles('Super Admin', 'Admin') as any, StudentController.deleteStudent);

export default router;
