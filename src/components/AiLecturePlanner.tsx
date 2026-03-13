import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Sparkles, BookOpen, List, HelpCircle, Layout, ArrowRight, Loader2, Target, Waves, Activity } from 'lucide-react';
import axios from 'axios';
import { cn } from '../lib/utils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';

export default function AiLecturePlanner() {
  const [topic, setTopic] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [plan, setPlan] = React.useState<any>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    setLoading(true);
    setPlan(null);

    try {
      const res = await axios.post(`${API_URL}/classroom-extras/ai/lecture-planner`, { topic });
      setPlan(res.data);
    } catch (err) {
      alert('Failed to generate lecture plan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="bg-lectra-card p-12 rounded-[3.5rem] border border-lectra-border/50 relative overflow-hidden group">
        {/* Animated Background Decoration */}
        <div className="absolute -top-24 -right-24 size-96 bg-lectra-primary/10 rounded-full blur-[100px] transition-all group-hover:bg-lectra-primary/20" />
        <div className="absolute top-12 right-12 opacity-5 group-hover:opacity-10 transition-opacity">
           <Zap className="size-64 text-lectra-primary group-hover:scale-110 transition-transform duration-700" />
        </div>
        
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="size-16 bg-lectra-primary rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-lectra-primary/30 relative overflow-hidden group/icon">
              <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent" />
              <Zap className="size-8 relative z-10 group-hover/icon:scale-110 transition-transform" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-lectra-primary mb-1">Architectural Engine</p>
              <h2 className="text-4xl font-black tracking-tighter text-lectra-text font-outfit uppercase">Neural Lecture Planner</h2>
            </div>
          </div>
          
          <p className="text-lectra-muted text-lg mb-10 font-medium leading-relaxed max-w-2xl">
            Siphon comprehensive intelligence into your curriculum. Provide a core subject and let Lectra AI architect a multi-modal lecture strategy.
          </p>

          <form onSubmit={handleGenerate} className="flex gap-4 p-2 bg-lectra-background border border-lectra-border rounded-3xl group/form focus-within:border-lectra-primary/50 transition-all shadow-inner">
            <input 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="flex-1 bg-transparent border-none py-4 px-6 text-lectra-text placeholder:text-slate-800 focus:ring-0 font-medium text-base"
              placeholder="Inject subject (e.g. Advanced Quantum Cryptography)"
              required
            />
            <button 
              type="submit"
              disabled={loading}
              className="px-10 py-4 bg-lectra-primary text-white rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-lectra-primaryHover transition-all flex items-center gap-3 shadow-xl shadow-lectra-primary/20 disabled:opacity-50 active:scale-95"
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              {loading ? "Synthesizing" : "Architect Plan"}
            </button>
          </form>
        </div>
      </div>

      <AnimatePresence>
        {plan && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-10"
          >
            {/* Outline & Topics */}
            <div className="space-y-10">
              <section className="bg-lectra-card border border-lectra-border/50 p-10 rounded-[2.5rem] space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                   <Target className="size-24 text-lectra-primary" />
                </div>
                <div className="flex items-center gap-4">
                  <div className="size-10 bg-lectra-primary/10 rounded-xl flex items-center justify-center text-lectra-primary">
                    <BookOpen className="size-5" />
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-lectra-text font-outfit">Syllabus Outline</h3>
                </div>
                <div className="space-y-5">
                  {plan.outline?.map((item: string, i: number) => (
                    <div key={i} className="flex gap-5 group">
                      <span className="text-lectra-primary font-black text-[10px] uppercase tracking-widest shrink-0 mt-1 opacity-40 group-hover:opacity-100 transition-opacity">Phase {String(i + 1).padStart(2, '0')}</span>
                      <p className="text-sm text-lectra-text/80 font-medium leading-relaxed">{item}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="bg-lectra-card border border-lectra-border/50 p-10 rounded-[2.5rem] space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                   <Waves className="size-24 text-lectra-success" />
                </div>
                <div className="flex items-center gap-4">
                  <div className="size-10 bg-lectra-success/10 rounded-xl flex items-center justify-center text-lectra-success">
                    <List className="size-5" />
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-lectra-text font-outfit">Core Taxonomies</h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  {plan.keyTopics?.map((topic: string, i: number) => (
                    <span key={i} className="px-5 py-2.5 bg-lectra-success/10 text-lectra-success rounded-xl text-[10px] font-black uppercase tracking-widest border border-lectra-success/20 transition-all hover:bg-lectra-success hover:text-white cursor-default">
                      {topic}
                    </span>
                  ))}
                </div>
              </section>
            </div>

            {/* Discussion & Slides */}
            <div className="space-y-10">
              <section className="bg-lectra-card border border-lectra-border/50 p-10 rounded-[2.5rem] space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                   <Activity className="size-24 text-lectra-warning" />
                </div>
                <div className="flex items-center gap-4">
                  <div className="size-10 bg-lectra-warning/10 rounded-xl flex items-center justify-center text-lectra-warning">
                    <HelpCircle className="size-5" />
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-lectra-text font-outfit">Neural Interaction</h3>
                </div>
                <div className="space-y-4">
                  {plan.discussionQuestions?.map((q: string, i: number) => (
                    <div key={i} className="p-6 bg-lectra-background rounded-2xl border border-lectra-border text-xs text-lectra-muted font-medium leading-relaxed relative">
                      <span className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-1 h-8 bg-lectra-warning rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                      "{q}"
                    </div>
                  ))}
                </div>
              </section>

              <section className="bg-lectra-card border border-lectra-border/50 p-10 rounded-[2.5rem] space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                   <Layout className="size-24 text-lectra-accent" />
                </div>
                <div className="flex items-center gap-4">
                  <div className="size-10 bg-lectra-accent/10 rounded-xl flex items-center justify-center text-lectra-accent">
                    <Layout className="size-5" />
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-lectra-text font-outfit">Visual Hierarchy</h3>
                </div>
                <div className="space-y-4">
                  {plan.slidesStructure?.map((slide: string, i: number) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-lectra-background rounded-2xl border border-lectra-border hover:border-lectra-accent/40 transition-all group">
                      <div className="size-10 bg-lectra-accent/10 text-lectra-accent rounded-xl flex items-center justify-center text-xs font-black group-hover:bg-lectra-accent group-hover:text-white transition-all">
                        {String(i + 1).padStart(2, '0')}
                      </div>
                      <span className="text-[11px] text-lectra-text font-black uppercase tracking-widest">{slide}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
            
            <div className="col-span-full pt-10 flex justify-center">
              <button className="px-12 py-5 bg-lectra-sidebar hover:bg-lectra-card border border-lectra-border text-lectra-text rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] transition-all flex items-center gap-4 shadow-xl hover:border-lectra-primary/50 group active:scale-95">
                Commit to Instructional Stream
                <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
