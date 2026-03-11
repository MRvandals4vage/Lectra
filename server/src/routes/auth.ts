import express from 'express';
import { signup, login, getMe } from '../controllers/auth';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', authenticateToken, getMe);

export default router;
