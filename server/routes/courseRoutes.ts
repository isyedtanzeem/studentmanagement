import { Router } from 'express';
import { CourseController } from '../controllers/courseController';
import { protect } from '../middlewares/authMiddleware';

const router = Router();

// Apply auth middleware
router.use(protect as any);

// Department options for course department mapping
router.get('/department-options', CourseController.getDepartmentOptions);

// Collection operations
router.get('/', CourseController.getCourses);
router.post('/', CourseController.createCourse);

// Item operations
router.get('/:id', CourseController.getCourseById);
router.put('/:id', CourseController.updateCourse);
router.delete('/:id', CourseController.deleteCourse);

export default router;
