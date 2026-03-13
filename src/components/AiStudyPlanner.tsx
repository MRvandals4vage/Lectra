import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Sparkles, CheckCircle2, ListTodo, Bookmark, ChevronRight, Loader2, Compass, Zap, Target } from 'lucide-react';
import axios from 'axios';
import { cn } from '../lib/utils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';

export default function AiStudyPlanner({ classId }: { classId: string }) {
  const [loading, setLoading] = React.useState(false);
  const [planner, setPlanner] = React.useState<any>(null);

  const generatePlanner = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/classroom-extras/ai/study-planner`, { classId });
      setPlanner(res.data.schedule);
    } catch (err) {
      alert('Failed to generate study planner.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="bg-lectra-card border border-lectra-border/50 rounded-[3rem] p-10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-10 opacity-5 scale-150 rotate-12 transition-transform group-hover:rotate-6">
          <Calendar className="size-64 text-lectra-primary" />
        </div>
        
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="size-14 bg-lectra-primary/10 text-lectra-primary rounded-2xl flex items-center justify-center border border-lectra-primary/20 shadow-lg shadow-lectra-primary/5 group-hover:scale-110 transition-transform">
              <Sparkles className="size-7" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-lectra-primary mb-1">Strategic Engine</p>
              <h2 className="text-3xl font-black text-lectra-text font-outfit uppercase tracking-tight leading-none">Neural Study Architect</h2>
            </div>
          </div>
          <p className="text-lectra-muted text-lg mb-10 font-medium leading-relaxed max-w-lg">
            Blueprint your academic success. Generate a personalized 7-day deep study schedule synchronized with your upcoming classroom constraints.
          </p>
          <button 
            onClick={generatePlanner}
            disabled={loading}
            className="px-8 py-4 bg-lectra-primary text-white rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-lectra-primaryHover transition-all flex items-center gap-3 shadow-xl shadow-lectra-primary/20 disabled:opacity-50 active:scale-95 group/btn"
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Zap className="size-4 group-hover/btn:scale-110 transition-transform" />}
            {loading ? "Synthesizing Schedule..." : "Architect 7-Day Protocol"}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {planner && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {Object.entries(planner).map(([day, data]: [string, any], i) => (
              <motion.div
                key={day}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="bg-lectra-sidebar border border-lectra-border p-8 rounded-[2.5rem] hover:border-lectra-primary/50 transition-all group relative overflow-hidden"
              >
                {/* Background Decoration */}
                <div className="absolute -top-10 -right-10 size-24 bg-lectra-primary/5 rounded-full blur-2xl group-hover:bg-lectra-primary/10 transition-colors" />

                <div className="flex justify-between items-center mb-8 relative z-10">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-lectra-primary bg-lectra-primary/10 border border-lectra-primary/10 px-3 py-1.5 rounded-xl shadow-sm">
                    Phase {i + 1}
                  </span>
                  <div className="size-8 bg-lectra-background border border-lectra-border rounded-xl flex items-center justify-center text-[10px] text-lectra-muted font-black uppercase tracking-widest shadow-inner">
                    {day.slice(0, 3)}
                  </div>
                </div>

                <div className="space-y-5 mb-8 relative z-10">
                  <div className="flex gap-4 group/task">
                    <div className="size-9 bg-lectra-primary/10 rounded-xl flex items-center justify-center text-lectra-primary border border-lectra-primary/10 group-hover/task:bg-lectra-primary group-hover/task:text-white transition-all">
                      <Target className="size-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[9px] font-black text-lectra-muted uppercase tracking-[0.2em] mb-1.5">Primary Objective</p>
                      <p className="text-sm font-black text-lectra-text leading-snug font-outfit uppercase tracking-tight">{data.task}</p>
                    </div>
                  </div>
                </div>

                <div className="p-5 bg-lectra-background/50 rounded-2xl border border-lectra-border space-y-3 relative z-10">
                  <div className="flex items-center gap-2.5">
                    <Compass className="size-3.5 text-lectra-success" />
                    <span className="text-[9px] font-black uppercase text-lectra-success tracking-[0.25em]">Strategic Tip</span>
                  </div>
                  <p className="text-[11px] text-lectra-muted italic font-medium leading-relaxed leading-relaxed">"{data.tip}"</p>
                </div>

                <div className="mt-8 pt-6 border-t border-lectra-border relative z-10">
                  <button className="w-full py-3 bg-lectra-background hover:bg-lectra-success/10 text-lectra-muted hover:text-lectra-success text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all flex items-center justify-center gap-3 group/check border border-lectra-border active:scale-95">
                    <CheckCircle2 className="size-4 group-hover/check:scale-110 transition-transform" />
                    Complete Phase
                  </button>
                </div>
              </motion.div>
            ))}
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-1 bg-lectra-card border border-lectra-primary/30 p-10 rounded-[2.5rem] flex flex-col items-center justify-center text-center space-y-6 relative overflow-hidden group/focus shadow-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-lectra-primary/10 via-transparent to-transparent opacity-50" />
              <div className="size-20 bg-lectra-primary rounded-3xl flex items-center justify-center text-white shadow-[0_20px_40px_rgba(79,70,229,0.3)] relative z-10 group-hover/focus:scale-110 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent" />
                <Zap className="size-10 relative z-10" />
              </div>
              <div className="relative z-10">
                <h4 className="font-black text-lectra-text text-xl font-outfit uppercase tracking-tighter">Neural Focus Mode</h4>
                <p className="text-[11px] text-lectra-muted mt-3 font-medium px-4 leading-relaxed">Siphon your cognitive power. Enter an isolated temporal study stream.</p>
              </div>
              <button className="w-full py-4 bg-lectra-primary text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-lectra-primary/20 hover:bg-lectra-primaryHover transition-all relative z-10 active:scale-95">Initiate Session</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
