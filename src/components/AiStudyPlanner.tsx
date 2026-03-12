import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Sparkles, CheckCircle2, ListTodo, Bookmark, ChevronRight, Loader2 } from 'lucide-react';
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
    <div className="space-y-8">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-5 scale-150 rotate-12">
          <Calendar className="size-48 text-primary" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="size-10 bg-primary/20 text-primary rounded-xl flex items-center justify-center">
              <Sparkles className="size-6" />
            </div>
            <h2 className="text-xl font-bold text-white">AI Study Planner</h2>
          </div>
          <p className="text-slate-400 max-w-lg mb-8">
            Get a personalized 7-day study schedule based on your upcoming assignments and deadlines.
          </p>
          <button 
            onClick={generatePlanner}
            disabled={loading}
            className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:brightness-110 transition-all flex items-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50"
          >
            {loading ? <Loader2 className="size-5 animate-spin" /> : <Sparkles className="size-5" />}
            {loading ? "Calculating Schedule..." : "Generate 7-Day Plan"}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {planner && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {Object.entries(planner).map(([day, data]: [string, any], i) => (
              <motion.div
                key={day}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-slate-900 border border-slate-800 p-6 rounded-3xl hover:border-primary/50 transition-all group"
              >
                <div className="flex justify-between items-center mb-6">
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-1 rounded">
                    Day {i + 1}
                  </span>
                  <div className="size-6 bg-slate-800 rounded-full flex items-center justify-center text-[10px] text-slate-500 font-bold">
                    {day.toUpperCase()}
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex gap-3">
                    <ListTodo className="size-4 text-primary shrink-0 mt-1" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter mb-1">Focus Task</p>
                      <p className="text-sm font-semibold text-slate-200 leading-tight">{data.task}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-800/40 rounded-2xl border border-white/5 space-y-2">
                  <div className="flex items-center gap-2">
                    <Bookmark className="size-3 text-emerald-500" />
                    <span className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">Study Tip</span>
                  </div>
                  <p className="text-xs text-slate-400 italic">"{data.tip}"</p>
                </div>

                <div className="mt-6 pt-6 border-t border-white/5">
                  <button className="w-full py-2 bg-slate-800 hover:bg-emerald-500/20 text-slate-500 hover:text-emerald-500 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2">
                    <CheckCircle2 className="size-3" />
                    Mark Complete
                  </button>
                </div>
              </motion.div>
            ))}
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-1 bg-gradient-to-br from-primary/20 to-transparent border border-primary/20 p-8 rounded-3xl flex flex-col items-center justify-center text-center space-y-4"
            >
              <div className="size-16 bg-primary rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-primary/30">
                <ChevronRight className="size-8" />
              </div>
              <div>
                <h4 className="font-bold text-white">Full Focus Mode</h4>
                <p className="text-xs text-slate-400 mt-2">Ready to start? Enter deep work mode for this session.</p>
              </div>
              <button className="w-full py-3 bg-primary text-white text-xs font-bold rounded-xl shadow-lg shadow-primary/20 hover:brightness-110">Start Session</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
