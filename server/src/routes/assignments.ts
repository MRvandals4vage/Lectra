import express from 'express';
import multer from 'multer';
import { 
  createAssignment, 
  getAssignmentsByClass, 
  submitAssignment, 
  getSubmissions,
  gradeSubmission,
  aiSuggestGrade 
} from '../controllers/assignments.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(authenticateToken);

router.post('/', createAssignment);
router.get('/:classId', getAssignmentsByClass);
router.get('/submissions/:classId', getSubmissions);
router.post('/submit', upload.single('file'), submitAssignment);
router.post('/grade', gradeSubmission);
router.get('/submissions/:submissionId/ai-grade', aiSuggestGrade);

export default router;

