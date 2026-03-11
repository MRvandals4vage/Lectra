import express from 'express';
import multer from 'multer';
import { createAssignment, getAssignmentsByClass, submitAssignment } from '../controllers/assignments';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(authenticateToken);

router.post('/', createAssignment);
router.get('/:classId', getAssignmentsByClass);
router.post('/submit', upload.single('file'), submitAssignment);

export default router;
