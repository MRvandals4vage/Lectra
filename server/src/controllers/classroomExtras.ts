import { Response } from 'express';
import { supabase } from '../config/supabase.js';
import { AuthRequest } from '../middleware/auth.js';
import { generateContent, generateJSON } from '../lib/gemini.js';

// Doubt Queue
export const getDoubts = async (req: AuthRequest, res: Response) => {
  const { meetingId } = req.params;
  try {
    const { data, error } = await supabase
      .from('doubts')
      .select('*, users:student_id(name)')
      .eq('meeting_id', meetingId)
      .order('upvotes', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching doubts' });
  }
};

export const createDoubt = async (req: AuthRequest, res: Response) => {
  const { meetingId, question, category } = req.body;
  try {
    const { data, error } = await supabase
      .from('doubts')
      .insert([{ meeting_id: meetingId, student_id: req.user?.id, question, category }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error creating doubt' });
  }
};

export const upvoteDoubt = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const { data: current, error: getError } = await supabase
      .from('doubts')
      .select('upvotes')
      .eq('id', id)
      .single();

    if (getError) throw getError;

    const { data, error } = await supabase
      .from('doubts')
      .update({ upvotes: (current.upvotes || 0) + 1 })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error upvoting doubt' });
  }
};

export const markDoubtAnswered = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  if (req.user?.role !== 'teacher') return res.status(403).json({ message: 'Forbidden' });

  try {
    const { data, error } = await supabase
      .from('doubts')
      .update({ is_answered: true })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error updating doubt' });
  }
};

// Whiteboard
export const saveWhiteboard = async (req: AuthRequest, res: Response) => {
  const { meetingId, data } = req.body;
  try {
    const { error } = await supabase
      .from('whiteboard_sessions')
      .upsert([{ meeting_id: meetingId, data, last_saved: new Date() }], { onConflict: 'meeting_id' });

    if (error) throw error;
    res.json({ message: 'Whiteboard saved' });
  } catch (error) {
    res.status(500).json({ message: 'Error saving whiteboard' });
  }
};

export const getWhiteboard = async (req: AuthRequest, res: Response) => {
  const { meetingId } = req.params;
  try {
    const { data, error } = await supabase
      .from('whiteboard_sessions')
      .select('*')
      .eq('meeting_id', meetingId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    res.json(data || { data: [] });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching whiteboard' });
  }
};

// Polling
export const getPolls = async (req: AuthRequest, res: Response) => {
  const { meetingId } = req.params;
  try {
    const { data: polls, error } = await supabase
      .from('polls')
      .select('*, poll_responses(response_index)')
      .eq('meeting_id', meetingId);

    if (error) throw error;
    res.json(polls);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching polls' });
  }
};

export const createPoll = async (req: AuthRequest, res: Response) => {
  const { meetingId, question, options } = req.body;
  if (req.user?.role !== 'teacher') return res.status(403).json({ message: 'Forbidden' });

  try {
    const { data, error } = await supabase
      .from('polls')
      .insert([{ meeting_id: meetingId, question, options: JSON.parse(options) }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error creating poll' });
  }
};

export const votePoll = async (req: AuthRequest, res: Response) => {
  const { pollId, responseIndex } = req.body;
  try {
    const { error } = await supabase
      .from('poll_responses')
      .upsert([{ poll_id: pollId, student_id: req.user?.id, response_index: responseIndex }], { onConflict: 'poll_id,student_id' });

    if (error) throw error;
    res.json({ message: 'Vote recorded' });
  } catch (error) {
    res.status(500).json({ message: 'Error recording vote' });
  }
};

// Study Rooms
export const createStudyRoom = async (req: AuthRequest, res: Response) => {

  const { classId, title } = req.body;
  try {
    const { data, error } = await supabase
      .from('study_rooms')
      .insert([{ class_id: classId, title, created_by: req.user?.id }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error creating study room' });
  }
};

export const getStudyRooms = async (req: AuthRequest, res: Response) => {
  const { classId } = req.params;
  try {
    const { data, error } = await supabase
      .from('study_rooms')
      .select('*, users:created_by(name)')
      .eq('class_id', classId)
      .eq('is_active', true);

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching study rooms' });
  }
};

// AI Teaching Assistant
export const aiAssistant = async (req: AuthRequest, res: Response) => {
  const { classId, question } = req.body;

  try {
    // Fetch context: last meetings and assignments
    const { data: meetings } = await supabase
      .from('meetings')
      .select('analysis')
      .eq('class_id', classId)
      .not('analysis', 'is', null)
      .order('created_at', { ascending: false })
      .limit(3);

    const { data: assignments } = await supabase
      .from('assignments')
      .select('title, description')
      .eq('class_id', classId)
      .limit(5);

    const context = `
      Class Context:
      Recent Lectures: ${meetings?.map(m => JSON.stringify(m.analysis)).join('\n')}
      Assignments: ${assignments?.map(a => `${a.title}: ${a.description}`).join('\n')}
    `;

    const prompt = `
      You are Lectra AI, a highly intelligent teaching assistant for this classroom.
      Use the following context to answer the student's question accurately and helpfully.
      If the answer is not in the context, use your general knowledge but mention it's outside the class materials.
      
      Context:
      ${context}

      Student Question: "${question}"
      
      Respond in a professional, encouraging, and clear manner. Use markdown for formatting.
    `;

    const response = await generateContent(prompt);
    res.json({ answer: response });
  } catch (error: any) {
    console.error('AI Assistant Error:', error.message);
    res.status(500).json({ message: 'Error from AI Assistant' });
  }
};

export const aiStudyPlanner = async (req: AuthRequest, res: Response) => {
  const { classId } = req.body;
  try {
    const { data: assignments } = await supabase
      .from('assignments')
      .select('*')
      .eq('class_id', classId)
      .gte('due_date', new Date().toISOString())
      .order('due_date', { ascending: true });

    const prompt = `
      As a student success coach, create a personalized study planner for a student in this classroom.
      Upcoming Assignments: ${assignments?.map(a => `${a.title} due on ${a.due_date}`).join(', ')}
      
      Provide a logical 7-day study schedule to tackle these assignments. 
      Break it down by day. Include tips for each day.
      Return JSON: { "schedule": { "day1": { "task": string, "tip": string }, ... } }
    `;

    const plan = await generateJSON(prompt);
    res.json(plan || { error: "Failed to generate study plan" });
  } catch (error) {
    res.status(500).json({ message: 'AI Study Planner failed' });
  }
};

export const generateWeeklySummary = async (req: AuthRequest, res: Response) => {
  const { classId } = req.body;
  try {
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    const [meetings, assignments] = await Promise.all([
      supabase.from('meetings').select('id, session_reports(summary)').eq('class_id', classId).gte('start_time', lastWeek.toISOString()),
      supabase.from('assignments').select('title').eq('class_id', classId).gte('created_at', lastWeek.toISOString())
    ]);

    const summaries = meetings.data?.map(m => m.session_reports?.[0]?.summary).filter(Boolean).join('\n');
    const assignmentTitles = assignments.data?.map(a => a.title).join(', ');

    const prompt = `
      Create a weekly summary for a classroom.
      Lecture Summaries: ${summaries}
      New Assignments: ${assignmentTitles}
      
      Structure:
      1. Overall Progress
      2. Key Topics Covered
      3. Upcoming Deadlines
      4. Recommendations for Students
    `;

    const response = await generateContent(prompt);
    res.json({ summary: response });
  } catch (error) {
    res.status(500).json({ message: 'Weekly Summary failed' });
  }
};



export const aiLecturePlanner = async (req: AuthRequest, res: Response) => {

  const { topic } = req.body;
  try {
    const prompt = `
      As an expert teacher, create an intelligent lecture plan for the topic: "${topic}".
      Provide:
      1. A detailed lecture outline.
      2. Key topics to cover.
      3. Discussion questions for students.
      4. Suggested slides structure.
      
      Return JSON with fields: "outline" (array), "keyTopics" (array), "discussionQuestions" (array), "slidesStructure" (array).
    `;

    const plan = await generateJSON(prompt);
    res.json(plan || { error: "Failed to generate plan" });

  } catch (error) {
    res.status(500).json({ message: 'AI Planner failed' });
  }
};
