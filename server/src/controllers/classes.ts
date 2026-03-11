import { Response } from 'express';
import { query } from '../config/db';
import { AuthRequest } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

export const createClass = async (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'teacher') {
    return res.status(403).json({ message: 'Only teachers can create classes' });
  }

  const { title, description } = req.body;
  const classCode = Math.random().toString(36).substring(2, 8).toUpperCase();

  try {
    const result = await query(
      'INSERT INTO classes (title, description, teacher_id, class_code) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, description, req.user.id, classCode]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error creating class' });
  }
};

export const getClasses = async (req: AuthRequest, res: Response) => {
  try {
    let result;
    if (req.user?.role === 'teacher') {
      result = await query('SELECT * FROM classes WHERE teacher_id = $1', [req.user.id]);
    } else {
      result = await query(
        'SELECT c.* FROM classes c JOIN enrollments e ON c.id = e.class_id WHERE e.student_id = $1',
        [req.user?.id]
      );
    }
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching classes' });
  }
};

export const getClassById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const result = await query('SELECT * FROM classes WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Class not found' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching class' });
  }
};

export const joinClass = async (req: AuthRequest, res: Response) => {
  const { classCode } = req.body;
  try {
    const classResult = await query('SELECT id FROM classes WHERE class_code = $1', [classCode]);
    if (classResult.rows.length === 0) return res.status(404).json({ message: 'Invalid class code' });

    const classId = classResult.rows[0].id;
    await query(
      'INSERT INTO enrollments (class_id, student_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [classId, req.user?.id]
    );

    res.json({ message: 'Successfully joined class', classId });
  } catch (error) {
    res.status(500).json({ message: 'Error joining class' });
  }
};
