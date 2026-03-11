import { Response } from 'express';
import { supabase } from '../config/supabase.js';
import { AuthRequest } from '../middleware/auth.js';
import { uploadFileToSupabase } from '../utils/upload.js';

export const createAssignment = async (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'teacher') {
    return res.status(403).json({ message: 'Only teachers can create assignments' });
  }

  const { classId, title, description, dueDate, maxScore } = req.body;

  try {
    const { data, error } = await supabase
      .from('assignments')
      .insert([
        { 
          class_id: classId, 
          title, 
          description, 
          due_date: dueDate, 
          max_score: maxScore 
        }
      ])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error: any) {
    console.error('Create Assignment Error:', error.message);
    res.status(500).json({ message: 'Error creating assignment' });
  }
};

export const getAssignmentsByClass = async (req: AuthRequest, res: Response) => {
  const { classId } = req.params;
  try {
    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .eq('class_id', classId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching assignments' });
  }
};

export const submitAssignment = async (req: AuthRequest, res: Response) => {
  const { assignmentId } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: 'File is required' });
  }

  try {
    const fileUrl = await uploadFileToSupabase(file, 'assignments');

    const { data, error } = await supabase
      .from('submissions')
      .upsert([
        { 
          assignment_id: assignmentId, 
          student_id: req.user?.id, 
          file_url: fileUrl 
        }
      ], { onConflict: 'assignment_id,student_id' })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error: any) {
    console.error('Submit Assignment Error:', error.message);
    res.status(500).json({ message: 'Error submitting assignment' });
  }
};
