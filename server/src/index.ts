import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import classRoutes from './routes/classes';
import assignmentRoutes from './routes/assignments';
import meetingRoutes from './routes/meetings';
import gradeRoutes from './routes/grading';

dotenv.config();

const app = express();
const server = http.createServer(app);

const frontendOrigin = process.env.FRONTEND_URL || 'http://localhost:3000';

const io = new Server(server, {
  cors: {
    origin: frontendOrigin,
    methods: ['GET', 'POST'],
    credentials: true
  },
});

app.use(cors({
  origin: frontendOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

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

  socket.on('send-message', (data) => {
    io.to(data.roomId).emit('receive-message', data);
  });

  socket.on('raise-hand', (data) => {
    io.to(data.roomId).emit('hand-raised', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
