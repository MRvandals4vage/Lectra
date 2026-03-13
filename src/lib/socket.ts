import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';
export const socket = io(API_URL, {
  autoConnect: true,
  withCredentials: true
});
