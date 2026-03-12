import { Response } from 'express';
import { supabase } from '../config/supabase.js';
import { AuthRequest } from '../middleware/auth.js';

export const createClass = async (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'teacher') {
    return res.status(403).json({ message: 'Only teachers can create classes' });
  }

  const { title, subject, description, semester, folder, tags } = req.body;
  const classCode = Math.random().toString(36).substring(2, 8).toUpperCase();

  try {
    const { data, error } = await supabase
      .from('classes')
      .insert([
        { 
          title, 
          subject,
          description, 
          semester,
          folder,
          tags: tags || [],
          teacher_id: req.user.id, 
          class_code: classCode 
        }
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
    const { archived } = req.query;
    let query = supabase.from('classes').select('*');
    
    // Check if archived filter is requested
    if (archived !== undefined) {
      query.eq('is_archived', archived === 'true');
    }

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

export const archiveClass = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { archived } = req.body;
  if (req.user?.role !== 'teacher') return res.status(403).json({ message: 'Forbidden' });

  try {
    const { data, error } = await supabase
      .from('classes')
      .update({ is_archived: archived })
      .eq('id', id)
      .eq('teacher_id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error archiving class' });
  }
};

export const getClassAnalytics = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const { data: metrics, error: metricsError } = await supabase
      .from('student_metrics')
      .select('*')
      .eq('class_id', id);

    if (metricsError) throw metricsError;

    // Aggregate metrics
    const avgEngagement = metrics.reduce((acc, m) => acc + (m.engagement_score || 0), 0) / (metrics.length || 1);
    const avgAttendance = metrics.reduce((acc, m) => acc + (m.attendance_rate || 0), 0) / (metrics.length || 1);
    
    res.json({
      studentCount: metrics.length,
      avgEngagement: Math.round(avgEngagement),
      avgAttendance: Math.round(avgAttendance * 100) / 100,
      metrics
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching analytics' });
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

export const deleteClass = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  if (req.user?.role !== 'teacher') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  try {
    const { error } = await supabase
      .from('classes')
      .delete()
      .eq('id', id)
      .eq('teacher_id', req.user.id);

    if (error) throw error;
    res.json({ message: 'Class deleted successfully' });
  } catch (error: any) {
    console.error('Delete Class Error:', error.message);
    res.status(500).json({ message: 'Error deleting class' });
  }
};

export const getClassmates = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase
      .from('enrollments')
      .select('users:student_id(id, name, email)')
      .eq('class_id', id);

    if (error) throw error;
    res.json(data.map((e: any) => e.users));
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching classmates' });
  }
};
