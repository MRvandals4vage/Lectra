import React from 'react';
import { motion } from 'motion/react';
import { Users, Video, Clock, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { cn } from '../lib/utils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';

export default function StudyRooms({ classId }: { classId: string }) {
  const [rooms, setRooms] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (classId) fetchRooms();
  }, [classId]);

  const fetchRooms = async () => {
    try {
      const res = await axios.get(`${API_URL}/classroom-extras/study-rooms/${classId}`);
      setRooms(res.data);
    } catch (err) {
      console.error('Error fetching study rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  const createRoom = async () => {
    const title = prompt('Enter Room Title:');
    if (!title) return;
    try {
      await axios.post(`${API_URL}/classroom-extras/study-rooms`, { classId, title });
      fetchRooms();
    } catch (err) {
      alert('Error creating room');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white">Peer Study Rooms</h2>
          <p className="text-sm text-slate-400">Join a room to collaborate with your classmates.</p>
        </div>
        <button 
          onClick={createRoom}
          className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:brightness-110 transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
        >
          <Users className="size-4" />
          Create Room
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-500">
            <div className="size-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
            <p>Loading rooms...</p>
          </div>
        ) : rooms.length === 0 ? (
          <div className="col-span-full py-20 bg-slate-900/50 border border-slate-800 rounded-3xl text-center space-y-4">
            <div className="size-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-500">
              <Video className="size-8" />
            </div>
            <div>
              <p className="text-slate-300 font-bold">No active rooms</p>
              <p className="text-xs text-slate-500">Be the first to start a collaboration session!</p>
            </div>
          </div>
        ) : (
          rooms.map((room) => (
            <motion.div 
              key={room.id}
              whileHover={{ y: -4 }}
              className="bg-slate-900 border border-slate-800 p-6 rounded-3xl hover:border-primary/50 transition-all group"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="size-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <Video className="size-6" />
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2 py-1 rounded-full">
                  <span className="size-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  Active Now
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-white mb-2">{room.title}</h3>
              <div className="flex items-center gap-4 text-xs text-slate-500 mb-6">
                <span className="flex items-center gap-1">
                  <Clock className="size-3.5" />
                  Started 2h ago
                </span>
                <span className="flex items-center gap-1 text-primary">
                  <Users className="size-3.5" />
                  {Math.floor(Math.random() * 5) + 1} students
                </span>
              </div>

              <button className="w-full py-3 bg-slate-800 hover:bg-primary text-white text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2">
                Join Session
                <ArrowRight className="size-4" />
              </button>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
