import express from 'express';
import { 
    getDoubts, 
    createDoubt, 
    upvoteDoubt, 
    markDoubtAnswered, 
    saveWhiteboard, 
    getWhiteboard, 
    getPolls,
    createPoll,
    votePoll,
    createStudyRoom, 
    getStudyRooms, 
    aiAssistant,
    aiStudyPlanner,
    generateWeeklySummary,
    aiLecturePlanner 
} from '../controllers/classroomExtras.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

// Doubts
router.get('/doubts/:meetingId', getDoubts);
router.post('/doubts', createDoubt);
router.patch('/doubts/:id/upvote', upvoteDoubt);
router.patch('/doubts/:id/answer', markDoubtAnswered);

// Whiteboard
router.post('/whiteboard', saveWhiteboard);
router.get('/whiteboard/:meetingId', getWhiteboard);

// Polling
router.get('/polls/:meetingId', getPolls);
router.post('/polls', createPoll);
router.post('/polls/vote', votePoll);

// Study Rooms
router.post('/study-rooms', createStudyRoom);
router.get('/study-rooms/:classId', getStudyRooms);


// AI Assistant
router.post('/ai/assistant', aiAssistant);
router.post('/ai/study-planner', aiStudyPlanner);
router.post('/ai/weekly-summary', generateWeeklySummary);
router.post('/ai/lecture-planner', aiLecturePlanner);




export default router;
