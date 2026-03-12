import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import classRoutes from './routes/classes.js';
import assignmentRoutes from './routes/assignments.js';
import meetingRoutes from './routes/meetings.js';
import gradeRoutes from './routes/grading.js';
import { supabase } from './config/supabase.js';
import './config/db.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const server = http.createServer(app);

const frontendOrigin = process.env.FRONTEND_URL || 'http://localhost:3000';
console.log('--- BACKEND CONFIG ---');
console.log('Allowed Frontend Origin:', frontendOrigin);
console.log('----------------------');

const io = new Server(server, {
  cors: {
    origin: [frontendOrigin, 'http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST'],
    credentials: true
  },
});

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [frontendOrigin, 'http://localhost:3000', 'http://127.0.0.1:3000'];
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn('CORS Blocked for origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', origin: frontendOrigin }));

// Routes
app.use('/auth', authRoutes);
app.use('/classes', classRoutes);
app.use('/assignments', assignmentRoutes);
app.use('/meetings', meetingRoutes);
app.use('/grade', gradeRoutes);

// Socket.IO
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  socket.on('send-message', async (data) => {
    io.to(data.roomId).emit('receive-message', data);
    
    try {
      // Persist to DB
      const { data: meeting } = await supabase
        .from('meetings')
        .select('id')
        .eq('room_id', data.roomId)
        .single();

      if (meeting) {
        await supabase.from('messages').insert([{
          meeting_id: meeting.id,
          user_id: data.userId,
          message: data.text
        }]);
      }
    } catch (err) {
      console.error('Error persisting message:', err);
    }
  });

  socket.on('raise-hand', (data) => {
    io.to(data.roomId).emit('hand-raised', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Error handling
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err: any, req: any, res: any, next: any) => {
  console.error('SERVER ERROR:', err);
  res.status(500).json({ 
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
