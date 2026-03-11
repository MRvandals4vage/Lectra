import { Response } from 'express';
import { query } from '../config/db';
import { AuthRequest } from '../middleware/auth';

export const gradeSubmission = async (req: AuthRequest, res: Response) => {
  const { submissionId, grade, feedback } = req.body;

  try {
    const result = await query(
      'UPDATE submissions SET grade = $1, feedback = $2 WHERE id = $3 RETURNING *',
      [grade, feedback, submissionId]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error grading submission' });
  }
};
