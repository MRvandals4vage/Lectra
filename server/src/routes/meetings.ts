import express from 'express';
import { createMeeting, getMeetingsByClass, getToken, getMeetingMessages } from '../controllers/meetings.js';
import { analyzeMeeting } from '../controllers/analysis.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/create', createMeeting);
router.get('/token/:roomId', getToken);
router.get('/messages/:roomId', getMeetingMessages);
router.post('/analyze', analyzeMeeting);
router.get('/class/:classId', getMeetingsByClass);

export default router;
