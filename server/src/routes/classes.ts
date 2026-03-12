import express from 'express';
import { createClass, getClasses, getClassById, joinClass, archiveClass, getClassAnalytics } from '../controllers/classes.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/', createClass);
router.get('/', getClasses);
router.get('/:id', getClassById);
router.post('/join', joinClass);
router.patch('/:id/archive', archiveClass);
router.get('/:id/analytics', getClassAnalytics);

export default router;

