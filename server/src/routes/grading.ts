import express from 'express';
import { gradeSubmission } from '../controllers/grading.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);
router.use(authorizeRole('teacher'));

router.post('/', gradeSubmission);

export default router;
