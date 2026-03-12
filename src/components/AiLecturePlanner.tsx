import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Sparkles, BookOpen, List, HelpCircle, Layout, ArrowRight, Loader2 } from 'lucide-react';
import axios from 'axios';

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
    <div className="space-y-8">
      <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 p-10 rounded-[40px] border border-primary/20 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-10 opacity-10 scale-150 rotate-12 transition-transform group-hover:rotate-6">
          <Sparkles className="size-48 text-primary" />
        </div>
        
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="size-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/40">
              <Zap className="size-6" />
            </div>
            <h2 className="text-3xl font-black tracking-tight text-white uppercase italic">AI Lecture Planner</h2>
          </div>
          
          <p className="text-slate-400 text-lg mb-8">
            Enter a topic and let Lectra AI generate a comprehensive lecture structure, discussion points, and slide outlines for you.
          </p>

          <form onSubmit={handleGenerate} className="flex gap-3">
            <input 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="flex-1 bg-white/5 border-2 border-white/10 focus:border-primary/50 rounded-2xl py-4 px-6 text-white placeholder:text-slate-600 focus:ring-0 transition-all backdrop-blur-md"
              placeholder="e.g. Introduction to Quantum Computing"
              required
            />
            <button 
              type="submit"
              disabled={loading}
              className="px-8 py-4 bg-primary text-white rounded-2xl font-bold hover:brightness-110 transition-all flex items-center gap-2 shadow-xl shadow-primary/20 disabled:opacity-50"
            >
              {loading ? <Loader2 className="size-5 animate-spin" /> : <Sparkles className="size-5" />}
              {loading ? "Planning..." : "Generate Plan"}
            </button>
          </form>
        </div>
      </div>

      <AnimatePresence>
        {plan && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* Outline & Topics */}
            <div className="space-y-8">
              <section className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl space-y-6">
                <h3 className="text-lg font-bold flex items-center gap-2 text-primary">
                  <BookOpen className="size-5" />
                  Lecture Outline
                </h3>
                <div className="space-y-4">
                  {plan.outline?.map((item: string, i: number) => (
                    <div key={i} className="flex gap-4">
                      <span className="text-primary font-black text-xs shrink-0 mt-1">{String(i + 1).padStart(2, '0')}.</span>
                      <p className="text-sm text-slate-300 font-medium">{item}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl space-y-6">
                <h3 className="text-lg font-bold flex items-center gap-2 text-emerald-500">
                  <List className="size-5" />
                  Key Topics
                </h3>
                <div className="flex flex-wrap gap-2">
                  {plan.keyTopics?.map((topic: string, i: number) => (
                    <span key={i} className="px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-xl text-xs font-bold border border-emerald-500/20">
                      {topic}
                    </span>
                  ))}
                </div>
              </section>
            </div>

            {/* Discussion & Slides */}
            <div className="space-y-8">
              <section className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl space-y-6">
                <h3 className="text-lg font-bold flex items-center gap-2 text-orange-500">
                  <HelpCircle className="size-5" />
                  Discussion Questions
                </h3>
                <div className="space-y-3">
                  {plan.discussionQuestions?.map((q: string, i: number) => (
                    <div key={i} className="p-4 bg-slate-800/50 rounded-2xl border border-white/5 text-sm text-slate-400 italic">
                      "{q}"
                    </div>
                  ))}
                </div>
              </section>

              <section className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl space-y-6">
                <h3 className="text-lg font-bold flex items-center gap-2 text-purple-500">
                  <Layout className="size-5" />
                  Slides Structure
                </h3>
                <div className="space-y-3">
                  {plan.slidesStructure?.map((slide: string, i: number) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-xl border border-white/5">
                      <div className="size-8 bg-purple-500/10 text-purple-500 rounded-lg flex items-center justify-center text-xs font-bold">
                        {i + 1}
                      </div>
                      <span className="text-xs text-slate-300 font-medium">{slide}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
            
            <div className="col-span-full pt-6 flex justify-center">
              <button className="px-10 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl font-bold transition-all flex items-center gap-3">
                Export to Schedule
                <ArrowRight className="size-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
