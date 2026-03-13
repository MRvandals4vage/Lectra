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
    console.error('Create Class Error Details:', error);
    res.status(500).json({ 
      message: error.message || 'Error creating class',
      details: error.details || error.hint || null
    });
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

export const getStudentDetails = async (req: AuthRequest, res: Response) => {
  const { classId, studentId } = req.params;
  try {
    // Get student info
    const { data: student, error: studentError } = await supabase
      .from('users')
      .select('id, name, email, role, created_at')
      .eq('id', studentId)
      .single();

    if (studentError) throw studentError;

    // Get all assignments for this class
    const { data: assignments, error: assignError } = await supabase
      .from('assignments')
      .select('id, title, description, due_date, max_score, created_at')
      .eq('class_id', classId)
      .order('created_at', { ascending: false });

    if (assignError) throw assignError;

    // Get submissions by this student for assignments in this class
    const assignmentIds = (assignments || []).map((a: any) => a.id);
    let studentSubmissions: any[] = [];
    if (assignmentIds.length > 0) {
      const { data: subs, error: subError } = await supabase
        .from('submissions')
        .select('*, assignments(id, title, max_score, due_date)')
        .eq('student_id', studentId)
        .in('assignment_id', assignmentIds);

      if (subError) throw subError;
      studentSubmissions = subs || [];
    }

    // Get student metrics if they exist
    const { data: metrics } = await supabase
      .from('student_metrics')
      .select('*')
      .eq('class_id', classId)
      .eq('student_id', studentId)
      .single();

    // Get meeting attendance (count of meetings this student joined)
    const { data: meetings } = await supabase
      .from('meetings')
      .select('id, room_id, created_at')
      .eq('class_id', classId);

    // Calculate stats
    const totalAssignments = assignments?.length || 0;
    const submittedCount = studentSubmissions.length;
    const gradedSubmissions = studentSubmissions.filter((s: any) => s.grade !== null && s.grade !== undefined);
    const avgGrade = gradedSubmissions.length > 0
      ? Math.round(gradedSubmissions.reduce((acc: number, s: any) => acc + (s.grade || 0), 0) / gradedSubmissions.length)
      : null;
    const completionRate = totalAssignments > 0 ? Math.round((submittedCount / totalAssignments) * 100) : 100;

    res.json({
      student,
      stats: {
        totalAssignments,
        submittedCount,
        gradedCount: gradedSubmissions.length,
        avgGrade,
        completionRate,
        totalMeetings: meetings?.length || 0,
        engagementScore: metrics?.engagement_score || 0,
        attendanceRate: metrics?.attendance_rate || 0,
      },
      submissions: studentSubmissions,
      assignments: assignments || [],
    });
  } catch (error: any) {
    console.error('Get Student Details Error:', error.message);
    res.status(500).json({ message: 'Error fetching student details' });
  }
};

export const getStudentsWithStats = async (req: AuthRequest, res: Response) => {
  const { id } = req.params; // class ID
  try {
    // Get all enrolled students
    const { data: enrollments, error: enrollError } = await supabase
      .from('enrollments')
      .select('users:student_id(id, name, email, created_at)')
      .eq('class_id', id);

    if (enrollError) throw enrollError;

    const students = (enrollments || []).map((e: any) => e.users);

    // Get all assignments for this class
    const { data: assignments } = await supabase
      .from('assignments')
      .select('id, title, max_score')
      .eq('class_id', id);

    const totalAssignments = assignments?.length || 0;
    const assignmentIds = (assignments || []).map((a: any) => a.id);

    // Get all submissions for assignments in this class
    let allSubmissions: any[] = [];
    if (assignmentIds.length > 0) {
      const { data: subs } = await supabase
        .from('submissions')
        .select('student_id, grade, assignment_id')
        .in('assignment_id', assignmentIds);
      allSubmissions = subs || [];
    }

    // Get student metrics for this class
    const { data: metricsData } = await supabase
      .from('student_metrics')
      .select('student_id, engagement_score, attendance_rate')
      .eq('class_id', id);

    // Combine data
    const studentsWithStats = students.map((student: any) => {
      const studentSubs = allSubmissions.filter((s: any) => s.student_id === student.id);
      const gradedSubs = studentSubs.filter((s: any) => s.grade !== null && s.grade !== undefined);
      const avgGrade = gradedSubs.length > 0
        ? Math.round(gradedSubs.reduce((acc: number, s: any) => acc + (s.grade || 0), 0) / gradedSubs.length)
        : null;
      const completionRate = totalAssignments > 0
        ? Math.round((studentSubs.length / totalAssignments) * 100)
        : 100;
      const metrics = (metricsData || []).find((m: any) => m.student_id === student.id);

      return {
        ...student,
        submittedCount: studentSubs.length,
        gradedCount: gradedSubs.length,
        avgGrade,
        totalAssignments,
        completionRate,
        engagementScore: metrics?.engagement_score || 0,
        attendanceRate: metrics?.attendance_rate || 0,
      };
    });

    res.json(studentsWithStats);
  } catch (error: any) {
    console.error('Get Students With Stats Error:', error.message);
    res.status(500).json({ message: 'Error fetching students with stats' });
  }
};
