import express from 'express';
import { createClass, getClasses, getClassById, joinClass } from '../controllers/classes.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/', createClass);
router.get('/', getClasses);
router.get('/:id', getClassById);
router.post('/join', joinClass);

export default router;
