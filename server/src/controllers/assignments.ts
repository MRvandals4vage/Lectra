import { Response } from 'express';
import { supabase } from '../config/supabase.js';
import { AuthRequest } from '../middleware/auth.js';
import { uploadFileToSupabase } from '../utils/upload.js';
import { model } from '../lib/gemini.js';

export const createAssignment = async (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'teacher') {
    return res.status(403).json({ message: 'Only teachers can create assignments' });
  }

  const { classId, title, description, dueDate, maxScore, rubric, latePenaltyRule, attachments } = req.body;

  try {
    const { data, error } = await supabase
      .from('assignments')
      .insert([
        { 
          class_id: classId, 
          title, 
          description, 
          due_date: dueDate, 
          max_score: maxScore,
          rubric: rubric || [],
          late_penalty_rule: latePenaltyRule || {},
          attachments: attachments || []
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
  const { assignmentId, isDraft, version } = req.body;
  const file = req.file;

  if (!file && !isDraft) {
    return res.status(400).json({ message: 'File is required' });
  }

  try {
    let fileUrl = '';
    if (file) {
      fileUrl = await uploadFileToSupabase(file, 'assignments');
    }

    const { data, error } = await supabase
      .from('submissions')
      .upsert([
        { 
          assignment_id: assignmentId, 
          student_id: req.user?.id, 
          file_url: fileUrl || undefined,
          is_draft: isDraft === 'true',
          version: version ? parseInt(version) : 1
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

export const getSubmissions = async (req: AuthRequest, res: Response) => {
  const { classId } = req.params;
  try {
    let query = supabase
      .from('submissions')
      .select(`
        *,
        assignments!inner(id, title, class_id, max_score, rubric),
        users:student_id(name)
      `)
      .eq('assignments.class_id', classId);

    if (req.user?.role === 'student') {
      query = query.eq('student_id', req.user.id);
    }
    
    const { data, error } = await query;

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    console.error('Get Submissions Error:', error.message);
    res.status(500).json({ message: 'Error fetching submissions' });
  }
};

export const aiSuggestGrade = async (req: AuthRequest, res: Response) => {
  const { submissionId } = req.params;
  try {
    const { data: submission, error: subError } = await supabase
      .from('submissions')
      .select('*, assignments(*)')
      .eq('id', submissionId)
      .single();

    if (subError) throw subError;

    const prompt = `
      As an expert teacher, evaluate the following student assignment submission based on the provided rubric.
      Assignment: ${submission.assignments.title}
      Description: ${submission.assignments.description}
      Rubric: ${JSON.stringify(submission.assignments.rubric)}
      Submission Content (URL): ${submission.file_url}
      
      Suggest a score out of ${submission.assignments.max_score} and provide detailed feedback.
      Return JSON: { "suggestedScore": number, "feedback": "string" }
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const suggestion = jsonMatch ? JSON.parse(jsonMatch[0]) : { suggestedScore: 0, feedback: "AI evaluation failed." };

    res.json(suggestion);
  } catch (error) {
    console.error('AI Suggest Grade Error:', error);
    res.status(500).json({ message: 'AI evaluation failed' });
  }
};

export const gradeSubmission = async (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'teacher') {
    return res.status(403).json({ message: 'Only teachers can grade submissions' });
  }

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

