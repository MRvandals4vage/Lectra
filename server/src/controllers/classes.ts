import { Response } from 'express';
import { supabase } from '../config/supabase.js';
import { AuthRequest } from '../middleware/auth.js';

export const createClass = async (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'teacher') {
    return res.status(403).json({ message: 'Only teachers can create classes' });
  }

  const { title, description } = req.body;
  const classCode = Math.random().toString(36).substring(2, 8).toUpperCase();

  try {
    const { data, error } = await supabase
      .from('classes')
      .insert([
        { title, description, teacher_id: req.user.id, class_code: classCode }
      ])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error: any) {
    console.error('Create Class Error:', error.message);
    res.status(500).json({ message: 'Error creating class' });
  }
};

export const getClasses = async (req: AuthRequest, res: Response) => {
  try {
    let query = supabase.from('classes').select('*');
    
    if (req.user?.role === 'teacher') {
      query = query.eq('teacher_id', req.user.id);
    } else {
      // For students, get classes through enrollments
      const { data: enrollments, error: enrollError } = await supabase
        .from('enrollments')
        .select('class_id')
        .eq('student_id', req.user?.id);
        
      if (enrollError) throw enrollError;
      
      const classIds = enrollments.map(e => e.class_id);
      query = query.in('id', classIds);
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    console.error('Get Classes Error:', error.message);
    res.status(500).json({ message: 'Error fetching classes' });
  }
};

export const getClassById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return res.status(404).json({ message: 'Class not found' });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching class' });
  }
};

export const joinClass = async (req: AuthRequest, res: Response) => {
  const { classCode } = req.body;
  try {
    const { data: classData, error: classError } = await supabase
      .from('classes')
      .select('id')
      .eq('class_code', classCode)
      .single();

    if (classError || !classData) {
      return res.status(404).json({ message: 'Invalid class code' });
    }

    const classId = classData.id;
    const { error: enrollError } = await supabase
      .from('enrollments')
      .upsert([
        { class_id: classId, student_id: req.user?.id }
      ], { onConflict: 'class_id,student_id' });

    if (enrollError) throw enrollError;

    res.json({ message: 'Successfully joined class', classId });
  } catch (error: any) {
    console.error('Join Class Error:', error.message);
    res.status(500).json({ message: 'Error joining class' });
  }
};
