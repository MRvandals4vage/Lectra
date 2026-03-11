import { Response } from 'express';
import { query } from '../config/db';
import { AuthRequest } from '../middleware/auth';
import { AccessToken } from 'livekit-server-sdk';

export const createMeeting = async (req: AuthRequest, res: Response) => {
  const { classId, roomId } = req.body;

  try {
    const result = await query(
      'INSERT INTO meetings (class_id, room_id, created_by) VALUES ($1, $2, $3) RETURNING *',
      [classId, roomId, req.user?.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error creating meeting' });
  }
};

export const getMeetingsByClass = async (req: AuthRequest, res: Response) => {
  const { classId } = req.params;
  try {
    const result = await query('SELECT * FROM meetings WHERE class_id = $1 ORDER BY start_time DESC', [classId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching meetings' });
  }
};

export const getToken = async (req: AuthRequest, res: Response) => {
  const { roomId } = req.params;
  const participantName = req.user?.id || 'identity'; // Use ID as identity

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  if (!apiKey || !apiSecret) {
    return res.status(500).json({ message: 'LiveKit API keys not configured' });
  }

  const at = new AccessToken(apiKey, apiSecret, {
    identity: participantName,
  });

  at.addGrant({ roomJoin: true, room: roomId, canPublish: true, canSubscribe: true });

  res.json({ token: await at.toJwt() });
};
