import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, ThumbsUp, CheckCircle, Plus, Hash, X, HelpCircle, Send } from 'lucide-react';
import axios from 'axios';
import { cn } from '../lib/utils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';

interface Doubt {
  id: string;
  question: string;
  category: string;
  upvotes: number;
  is_answered: boolean;
  student_id: string;
  created_at: string;
  users?: { name: string };
}

export default function DoubtQueue({ roomId, socket, user }: { roomId: string, socket: any, user: any }) {
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [category, setCategory] = useState('General');
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    fetchDoubts();

    socket.on('new-doubt', (doubt: Doubt) => {
      setDoubts(prev => [doubt, ...prev]);
    });

    socket.on('doubt-updated', (updatedDoubt: Doubt) => {
      setDoubts(prev => prev.map(d => d.id === updatedDoubt.id ? updatedDoubt : d));
    });

    return () => {
      socket.off('new-doubt');
      socket.off('doubt-updated');
    };
  }, [roomId]);

  const fetchDoubts = async () => {
    try {
      const res = await axios.get(`${API_URL}/classroom-extras/doubts/${roomId}`);
      setDoubts(res.data);
    } catch (err) {
      console.error('Error fetching doubts:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;

    try {
      const res = await axios.post(`${API_URL}/classroom-extras/doubts`, {
        meetingId: roomId,
        question: newQuestion,
        category
      });
      
      socket.emit('doubt-posted', { roomId, ...res.data });
      setNewQuestion('');
      setShowAdd(false);
    } catch (err) {
      alert('Failed to post doubt');
    }
  };

  const handleUpvote = async (id: string) => {
    try {
      const res = await axios.post(`${API_URL}/classroom-extras/doubts/${id}/upvote`);
      socket.emit('doubt-update', { roomId, ...res.data });
      setDoubts(prev => prev.map(d => d.id === id ? res.data : d));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAnswer = async (id: string) => {
    if (user.role !== 'teacher') return;
    try {
      const res = await axios.post(`${API_URL}/classroom-extras/doubts/${id}/answer`);
      socket.emit('doubt-update', { roomId, ...res.data });
      setDoubts(prev => prev.map(d => d.id === id ? res.data : d));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-lectra-sidebar/40 rounded-[2rem] border border-lectra-border/50 overflow-hidden backdrop-blur-3xl">
      <div className="p-6 border-b border-lectra-border/50 flex items-center justify-between bg-lectra-card/30">
        <div className="flex items-center gap-3">
          <div className="size-9 bg-lectra-primary/10 rounded-xl flex items-center justify-center text-lectra-primary">
            <HelpCircle className="size-5" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-lectra-text font-outfit">Inquiry Stream</h4>
            <p className="text-[8px] text-lectra-muted font-bold uppercase tracking-widest mt-0.5">{doubts.length} ACTIVE NODES</p>
          </div>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className={cn(
            "size-10 flex items-center justify-center rounded-xl transition-all shadow-lg active:scale-90",
            showAdd ? "bg-lectra-background text-lectra-muted border border-lectra-border" : "bg-lectra-primary text-white shadow-lectra-primary/20"
          )}
        >
          {showAdd ? <X className="size-5" /> : <Plus className="size-5" />}
        </button>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-lectra-card/50 border-b border-lectra-border/50"
          >
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="relative group">
                <textarea 
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="Ask your question..."
                  className="w-full bg-lectra-background border border-lectra-border rounded-2xl p-4 pr-12 text-sm text-lectra-text focus:border-lectra-primary outline-none h-28 transition-all placeholder:text-slate-800 resize-none font-medium leading-relaxed"
                />
                <div className="absolute top-4 right-4 opacity-20 group-focus-within:opacity-100 transition-opacity">
                  <MessageSquare className="size-4 text-lectra-primary" />
                </div>
              </div>
              
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 flex items-center gap-2 bg-lectra-background border border-lectra-border rounded-xl px-4 py-2 hover:border-lectra-muted transition-all">
                  <Hash className="size-3.5 text-lectra-muted" />
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="bg-transparent text-[10px] font-black uppercase tracking-widest text-lectra-muted outline-none w-full"
                  >
                    <option value="General">General</option>
                    <option value="Technical">Technical</option>
                    <option value="Concept">Concept</option>
                    <option value="Assignment">Assignment</option>
                  </select>
                </div>
                <button type="submit" className="px-6 py-2.5 bg-lectra-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-lectra-primaryHover shadow-lg shadow-lectra-primary/20 transition-all active:scale-95 inline-flex items-center gap-2">
                  <Send className="size-3" /> Transmit
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
        {doubts.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0)).map((doubt) => (
          <div 
            key={doubt.id} 
            className={cn(
              "p-5 rounded-[1.75rem] border transition-all duration-300 relative group overflow-hidden",
              doubt.is_answered 
                ? "bg-lectra-success/5 border-lectra-success/20" 
                : "bg-lectra-card border-lectra-border/50 hover:border-lectra-primary/40 hover:bg-lectra-card/80"
            )}
          >
            {/* Background Accent */}
            <div className={cn("absolute -top-10 -right-10 size-24 rounded-full blur-[40px] opacity-10 transition-opacity group-hover:opacity-20", doubt.is_answered ? "bg-lectra-success" : "bg-lectra-primary")} />

            <div className="flex justify-between items-start mb-4 relative z-10">
              <span className="text-[8px] font-black text-lectra-primary px-2.5 py-1 bg-lectra-primary/10 rounded-lg uppercase tracking-widest border border-lectra-primary/10">
                {doubt.category}
              </span>
              {doubt.is_answered && (
                <span className="flex items-center gap-1.5 text-[8px] font-black text-lectra-success uppercase tracking-[0.2em]">
                  <CheckCircle className="size-3" /> Resolved
                </span>
              )}
            </div>
            
            <p className="text-[13px] text-lectra-text/90 mb-6 font-medium leading-relaxed relative z-10">{doubt.question}</p>
            
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="size-7 bg-lectra-sidebar rounded-full border border-lectra-border flex items-center justify-center text-[10px] font-black text-lectra-muted uppercase">
                  {doubt.users?.name?.slice(0, 1) || 'S'}
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-lectra-text tracking-tight">{doubt.users?.name || 'Student'}</span>
                  <span className="text-[8px] text-lectra-muted font-bold tracking-widest uppercase">{new Date(doubt.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleUpvote(doubt.id)}
                  disabled={doubt.is_answered}
                  className={cn(
                    "flex items-center gap-2 px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm active:scale-95",
                    doubt.upvotes > 0 
                      ? "bg-lectra-primary text-white shadow-lectra-primary/20" 
                      : "bg-lectra-background border border-lectra-border text-lectra-muted hover:text-lectra-primary hover:border-lectra-primary"
                  )}
                >
                  <ThumbsUp className={cn("size-3", doubt.upvotes > 0 && "fill-current")} />
                  {doubt.upvotes}
                </button>
                {user.role === 'teacher' && !doubt.is_answered && (
                  <button 
                    onClick={() => handleAnswer(doubt.id)}
                    className="size-9 bg-lectra-success/10 text-lectra-success border border-lectra-success/20 rounded-xl hover:bg-lectra-success hover:text-white transition-all shadow-sm flex items-center justify-center group/btn active:scale-95"
                  >
                    <CheckCircle className="size-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {doubts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 opacity-20">
            <div className="size-16 bg-lectra-background rounded-3xl flex items-center justify-center border border-lectra-border mb-4">
              <MessageSquare className="size-8 text-lectra-muted" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-lectra-muted">Quiet Stream</p>
          </div>
        )}
      </div>
    </div>
  );
}
