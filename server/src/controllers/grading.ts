import { Response } from 'express';
import { supabase } from '../config/supabase.js';
import { AuthRequest } from '../middleware/auth.js';

export const gradeSubmission = async (req: AuthRequest, res: Response) => {
  const { submissionId, grade, feedback } = req.body;

  try {
    const { data, error } = await supabase
      .from('submissions')
      .update({ grade, feedback })
      .eq('id', submissionId)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    console.error('Grade Submission Error:', error.message);
    res.status(500).json({ message: 'Error grading submission' });
  }
};
