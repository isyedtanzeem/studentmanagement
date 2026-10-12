import { Router } from 'express';
import { CourseController } from '../controllers/courseController';
import { protect } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/roleMiddleware';

const router = Router();

// Apply auth middleware
router.use(protect as any);

// Department options for course department mapping
router.get('/department-options', CourseController.getDepartmentOptions);

// Collection operations
router.get('/', CourseController.getCourses);
router.post('/', authorizeRoles('Super Admin', 'Admin') as any, CourseController.createCourse);

// Item operations
router.get('/:id', CourseController.getCourseById);
router.put('/:id', authorizeRoles('Super Admin', 'Admin') as any, CourseController.updateCourse);
router.delete('/:id', authorizeRoles('Super Admin', 'Admin') as any, CourseController.deleteCourse);

export default router;
