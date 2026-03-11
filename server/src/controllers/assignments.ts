import { Response } from 'express';
import { query } from '../config/db';
import { AuthRequest } from '../middleware/auth';
import { uploadFileToSupabase } from '../utils/upload';

export const createAssignment = async (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'teacher') {
    return res.status(403).json({ message: 'Only teachers can create assignments' });
  }

  const { classId, title, description, dueDate, maxScore } = req.body;

  try {
    const result = await query(
      'INSERT INTO assignments (class_id, title, description, due_date, max_score) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [classId, title, description, dueDate, maxScore]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error creating assignment' });
  }
};

export const getAssignmentsByClass = async (req: AuthRequest, res: Response) => {
  const { classId } = req.params;
  try {
    const result = await query('SELECT * FROM assignments WHERE class_id = $1', [classId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching assignments' });
  }
};

export const submitAssignment = async (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'student') {
    return res.status(403).json({ message: 'Only students can submit assignments' });
  }

  const { assignmentId } = req.body;
  let fileUrl = req.body.fileUrl;

  try {
    if (req.file) {
      fileUrl = await uploadFileToSupabase(req.file, 'submissions');
    }

    if (!fileUrl) {
      return res.status(400).json({ message: 'No file or URL provided' });
    }

    const result = await query(
      'INSERT INTO submissions (assignment_id, student_id, file_url) VALUES ($1, $2, $3) RETURNING *',
      [assignmentId, req.user.id, fileUrl]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Submission error:', error);
    res.status(500).json({ message: 'Error submitting assignment' });
  }
};
