import React from 'react';
import { motion } from 'motion/react';
import { Users, Video, Clock, ArrowRight, Plus, Activity } from 'lucide-react';
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
    const title = prompt('Enter Neural Hub Title:');
    if (!title) return;
    try {
      await axios.post(`${API_URL}/classroom-extras/study-rooms`, { classId, title });
      fetchRooms();
    } catch (err) {
      alert('Node initialization failure');
    }
  };

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="size-8 bg-lectra-primary/10 rounded-lg flex items-center justify-center text-lectra-primary">
              <Users className="size-4" />
            </div>
            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-lectra-text font-outfit leading-none">Peer Collaboration Nodes</h2>
          </div>
          <p className="text-lectra-muted text-[11px] font-medium tracking-widest uppercase opacity-60">Synchronize with classmates in temporary neural hubs.</p>
        </div>
        <button 
          onClick={createRoom}
          className="px-8 py-4 bg-lectra-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-lectra-primaryHover transition-all shadow-xl shadow-lectra-primary/20 flex items-center gap-3 group active:scale-95"
        >
          <Plus className="size-4 group-hover:rotate-90 transition-transform" />
          Initialize Hub
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-full py-32 flex flex-col items-center justify-center text-center space-y-6">
            <div className="relative">
              <div className="size-16 border-2 border-lectra-primary/10 border-t-lectra-primary rounded-full animate-spin" />
              <Activity className="size-6 text-lectra-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-lectra-muted italic">Scanning neural landscape...</p>
          </div>
        ) : rooms.length === 0 ? (
          <div className="col-span-full py-32 bg-lectra-background/30 border border-lectra-border border-dashed rounded-[3.5rem] text-center flex flex-col items-center group">
            <div className="size-24 bg-lectra-sidebar rounded-[2.5rem] flex items-center justify-center text-lectra-muted/20 shadow-inner mb-8 group-hover:scale-110 transition-transform duration-700">
              <Video className="size-10" />
            </div>
            <div>
              <p className="text-lectra-text font-black font-outfit uppercase tracking-widest text-xl">Nodes Offline</p>
              <p className="text-[10px] text-lectra-muted font-black uppercase tracking-[0.3em] mt-4 max-w-sm">No active collaboration streams detected. Initiate a hub to start.</p>
            </div>
          </div>
        ) : (
          rooms.map((room) => (
            <motion.div 
              key={room.id}
              whileHover={{ y: -6, scale: 1.02 }}
              className="bg-lectra-card border border-lectra-border p-8 rounded-[2.5rem] hover:border-lectra-primary/50 transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5">
                 <Video className="size-24 text-lectra-primary group-hover:scale-110 transition-transform" />
              </div>

              <div className="flex justify-between items-start mb-8 relative z-10">
                <div className="size-14 bg-lectra-primary/10 rounded-[1.25rem] flex items-center justify-center text-lectra-primary border border-lectra-primary/10 group-hover:bg-lectra-primary group-hover:text-white transition-all shadow-lg group-hover:shadow-lectra-primary/30">
                  <Video className="size-7" />
                </div>
                <div className="flex items-center gap-2.5 text-[9px] font-black text-lectra-success uppercase tracking-[0.25em] bg-lectra-success/10 border border-lectra-success/10 px-3.5 py-1.5 rounded-xl shadow-sm">
                  <span className="size-1.5 bg-lectra-success rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  Live Sync
                </div>
              </div>
              
              <h3 className="text-xl font-black text-lectra-text mb-3 font-outfit uppercase tracking-tighter leading-none relative z-10">{room.title}</h3>
              
              <div className="flex items-center gap-6 text-[9px] font-black text-lectra-muted uppercase tracking-[0.2em] mb-10 relative z-10">
                <span className="flex items-center gap-2">
                  <Clock className="size-3.5 text-lectra-primary/40" />
                  Node Initialized
                </span>
                <span className="flex items-center gap-2 text-lectra-primary">
                  <Users className="size-3.5" />
                  Stream Active
                </span>
              </div>

              <button className="w-full py-4 bg-lectra-background hover:bg-lectra-primary text-lectra-muted hover:text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl transition-all flex items-center justify-center gap-3 border border-lectra-border shadow-xl hover:shadow-lectra-primary/20 group/join active:scale-95 relative z-10">
                Join Stream
                <ArrowRight className="size-4 group-hover/join:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
