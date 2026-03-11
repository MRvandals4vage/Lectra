import express from 'express';
import { createMeeting, getMeetingsByClass, getToken } from '../controllers/meetings.js';
import { analyzeMeeting } from '../controllers/analysis.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/create', createMeeting);
router.get('/:classId', getMeetingsByClass);
router.get('/token/:roomId', getToken);
router.post('/analyze', analyzeMeeting);

export default router;
