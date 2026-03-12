import express from 'express';
import multer from 'multer';
import { uploadMaterial, getMaterials, deleteMaterial } from '../controllers/library.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(authenticateToken);

router.post('/', upload.single('file'), uploadMaterial);
router.get('/:classId', getMaterials);
router.delete('/:id', deleteMaterial);

export default router;
