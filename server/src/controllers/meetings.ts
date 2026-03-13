import { Response } from 'express';
import { supabase } from '../config/supabase.js';
import { AuthRequest } from '../middleware/auth.js';
import { AccessToken } from 'livekit-server-sdk';

export const createMeeting = async (req: AuthRequest, res: Response) => {
  const { classId, roomId, scheduledTime, reminders, resources } = req.body;

  try {
    const { data, error } = await supabase
      .from('meetings')
      .insert([
        { 
          class_id: classId, 
          room_id: roomId, 
          created_by: req.user?.id,
          scheduled_time: scheduledTime,
          reminders: reminders || [],
          resources: resources || []
        }
      ])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error: any) {
    console.error('Create Meeting Error:', error.message);
    res.status(500).json({ message: 'Error creating meeting' });
  }
};


export const getMeetingsByClass = async (req: AuthRequest, res: Response) => {
  const { classId } = req.params;
  try {
    const { data, error } = await supabase
      .from('meetings')
      .select('*')
      .eq('class_id', classId)
      .order('start_time', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching meetings' });
  }
};

export const getToken = async (req: AuthRequest, res: Response) => {
  const { roomId } = req.params; // This is the class_code
  const participantName = req.user?.name || 'User';

  try {
    // Check if meeting exists
    let { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .select('id')
      .eq('room_id', roomId)
      .single();

    if (meetingError || !meeting) {
      // Create meeting record if it doesn't exist
      // Since roomId is class_code, find the class first
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('id')
        .eq('class_code', roomId)
        .single();

      if (classError || !classData) {
        return res.status(404).json({ message: 'Class not found for this room' });
      }

      const { data: newMeeting, error: createError } = await supabase
        .from('meetings')
        .insert([
          { 
            class_id: classData.id, 
            room_id: roomId, 
            created_by: req.user?.id 
          }
        ])
        .select()
        .single();

      if (createError) throw createError;
      meeting = newMeeting;
    }

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;

    if (!apiKey || !apiSecret) {
      return res.status(500).json({ message: 'LiveKit API keys not configured' });
    }

    const at = new AccessToken(apiKey, apiSecret, {
      identity: req.user?.id || 'identity',
      name: participantName,
    });

    at.addGrant({ roomJoin: true, room: roomId as string, canPublish: true, canSubscribe: true });

    res.json({ token: await at.toJwt() });
  } catch (error: any) {
    console.error('getToken Error:', error.message);
    res.status(500).json({ message: 'Error generating token' });
  }
};

export const getMeetingMessages = async (req: AuthRequest, res: Response) => {
  const { roomId } = req.params;
  try {
    // First find the meeting UUID
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .select('id')
      .eq('room_id', roomId)
      .single();

    if (meetingError || !meeting) return res.status(404).json({ message: 'Meeting not found' });

    const { data: messages, error } = await supabase
      .from('messages')
      .select('*, users(name)')
      .eq('meeting_id', meeting.id)
      .order('created_at', { ascending: true });

    if (error) throw error;
    res.json(messages);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching messages' });
  }
};
