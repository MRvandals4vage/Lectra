import express from 'express';
import { gradeSubmission } from '../controllers/grading';
import { authenticateToken, authorizeRole } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);
router.use(authorizeRole('teacher'));

router.post('/', gradeSubmission);

export default router;
