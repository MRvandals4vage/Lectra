import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, FileText, Zap, ChevronRight, Download, Sparkles, Clock, Calendar, Brain, Activity, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { cn } from '../lib/utils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';

export default function RevisionHub({ classId }: { classId: string }) {
  const [sessions, setSessions] = React.useState<any[]>([]);
  const [selectedSession, setSelectedSession] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (classId) fetchSessions();
  }, [classId]);

  const fetchSessions = async () => {
    try {
      const res = await axios.get(`${API_URL}/meetings/class/${classId}`);
      setSessions(res.data);
    } catch (err) {
      console.error('Error fetching sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
      {/* Session List */}
      <div className="lg:col-span-1 space-y-6">
        <div className="flex items-center gap-4 mb-2">
          <div className="size-10 bg-lectra-primary/10 rounded-xl flex items-center justify-center text-lectra-primary">
            <Clock className="size-5" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-lectra-text font-outfit leading-none">Lecture Streams</h2>
            <p className="text-[10px] text-lectra-muted font-bold tracking-widest mt-1 uppercase">Historical Index</p>
          </div>
        </div>

        <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar p-1">
          {sessions.map((session) => (
            <motion.div 
              key={session.id}
              onClick={() => setSelectedSession(session)}
              whileHover={{ x: 4 }}
              className={cn(
                "p-5 rounded-[2rem] border transition-all cursor-pointer relative overflow-hidden group/item",
                selectedSession?.id === session.id 
                ? 'bg-lectra-primary border-lectra-primary shadow-xl shadow-lectra-primary/20' 
                : 'bg-lectra-card border-lectra-border hover:border-lectra-primary/40'
              )}
            >
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex items-center gap-2 px-2 py-1 bg-white/5 rounded-lg border border-white/5">
                  <Calendar className={cn("size-3", selectedSession?.id === session.id ? "text-white/60" : "text-lectra-muted")} />
                  <span className={cn("text-[9px] font-black uppercase tracking-widest", selectedSession?.id === session.id ? "text-white/80" : "text-lectra-muted")}>
                    {new Date(session.created_at).toLocaleDateString()}
                  </span>
                </div>
                {session.analysis && (
                  <div className={cn("size-6 rounded-lg flex items-center justify-center", selectedSession?.id === session.id ? "bg-white/20" : "bg-lectra-primary/10")}>
                    <Sparkles className={cn("size-3", selectedSession?.id === session.id ? "text-white" : "text-lectra-primary")} />
                  </div>
                )}
              </div>
              <h3 className={cn("font-black text-sm mb-2 font-outfit uppercase tracking-tight", selectedSession?.id === session.id ? "text-white" : "text-lectra-text")}>
                {session.title || `Lecture Stream: ${session.room_id.slice(0, 8)}`}
              </h3>
              <p className={cn("text-[10px] font-bold uppercase tracking-widest", selectedSession?.id === session.id ? "text-white/60" : "text-lectra-muted")}>
                Nodes: {session.room_id.slice(0, 12)}...
              </p>
              
              {selectedSession?.id === session.id && (
                <div className="absolute -right-2 -bottom-2 opacity-10">
                   <Activity className="size-16 text-white" />
                </div>
              )}
            </motion.div>
          ))}
          
          {sessions.length === 0 && !loading && (
            <div className="p-10 text-center bg-lectra-sidebar/40 rounded-[2.5rem] border border-dashed border-lectra-border">
              <p className="text-[10px] font-black uppercase tracking-widest text-lectra-muted">No historical data streams captured</p>
            </div>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="lg:col-span-2">
        <AnimatePresence mode="wait">
          {selectedSession ? (
            <motion.div 
              key={selectedSession.id}
              initial={{ opacity: 0, scale: 0.98, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.98, x: -20 }}
              className="bg-lectra-card border border-lectra-border rounded-[3rem] p-10 space-y-10 relative overflow-hidden"
            >
              {/* Decorative Background Element */}
              <div className="absolute top-0 right-0 p-12 opacity-5">
                 <Brain className="size-48 text-lectra-primary" />
              </div>

              <div className="flex justify-between items-start relative z-10">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-3 py-1 bg-lectra-primary/10 text-lectra-primary rounded-full text-[9px] font-black uppercase tracking-widest border border-lectra-primary/10">Synchronized Session</span>
                    <span className="text-lectra-muted text-[9px] font-black uppercase tracking-widest">{new Date(selectedSession.created_at).toLocaleTimeString()}</span>
                  </div>
                  <h2 className="text-3xl font-black text-lectra-text font-outfit uppercase tracking-tighter leading-none">
                    {selectedSession.title || `Stream: ${selectedSession.room_id}`}
                  </h2>
                  <p className="text-lectra-muted mt-4 font-medium max-w-lg">Advanced session analysis and multi-modal revision protocols extracted from the neural stream.</p>
                </div>
                <button className="size-12 flex items-center justify-center bg-lectra-background border border-lectra-border rounded-2xl text-lectra-muted hover:text-white hover:border-lectra-primary/50 transition-all shadow-xl group/dl">
                  <Download className="size-5 group-hover/dl:translate-y-0.5 transition-transform" />
                </button>
              </div>

              {!selectedSession.analysis ? (
                <div className="py-24 text-center space-y-6 bg-lectra-background/50 rounded-[2.5rem] border border-dashed border-lectra-border flex flex-col items-center">
                  <div className="size-20 bg-lectra-sidebar rounded-3xl flex items-center justify-center text-lectra-muted/40 shadow-inner">
                    <Zap className="size-10" />
                  </div>
                  <div>
                    <p className="text-lectra-muted font-bold flex items-center gap-2 justify-center italic text-sm">
                      Neural analysis stream pending for this session.
                    </p>
                    <p className="text-[10px] text-lectra-muted uppercase tracking-widest mt-2">Historical data requires synthesize protocol</p>
                  </div>
                  <button className="px-8 py-3 bg-lectra-primary/10 text-lectra-primary text-[10px] font-black uppercase tracking-widest rounded-xl border border-lectra-primary/20 hover:bg-lectra-primary hover:text-white transition-all">
                    Initiate Synthesis Hub
                  </button>
                </div>
              ) : (
                <>
                  <section className="space-y-6 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="size-8 bg-lectra-primary/10 rounded-lg flex items-center justify-center text-lectra-primary">
                        <FileText className="size-4" />
                      </div>
                      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-lectra-text">Executive Analysis</h3>
                    </div>
                    <div className="text-lectra-muted leading-relaxed text-sm bg-lectra-background/50 p-6 rounded-[2rem] border border-lectra-border font-medium relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-1 h-full bg-lectra-primary/30 group-hover:bg-lectra-primary transition-colors" />
                      {selectedSession.analysis.summary}
                    </div>
                  </section>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
                    <section className="space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="size-8 bg-lectra-warning/10 rounded-lg flex items-center justify-center text-lectra-warning">
                          <Zap className="size-4" />
                        </div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-lectra-text">Neural Vectors</h3>
                      </div>
                      <div className="space-y-4">
                        {selectedSession.analysis.flashcards?.map((card: any, i: number) => (
                          <div key={i} className="p-5 bg-lectra-sidebar/60 rounded-2xl border border-lectra-border space-y-3 group cursor-pointer hover:border-lectra-warning/40 transition-all hover:bg-lectra-sidebar">
                            <div className="flex items-center gap-2">
                               <span className="text-[8px] font-black uppercase tracking-widest text-lectra-warning">Trigger {i+1}</span>
                            </div>
                            <p className="text-xs font-black text-lectra-text font-outfit uppercase tracking-tight leading-snug">Q: {card.question}</p>
                            <p className="text-[11px] text-lectra-muted font-medium opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 italic">
                              Response Protocol: {card.answer}
                            </p>
                          </div>
                        ))}
                      </div>
                    </section>

                    <section className="space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="size-8 bg-lectra-success/10 rounded-lg flex items-center justify-center text-lectra-success">
                          <Activity className="size-4" />
                        </div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-lectra-text">Core Synapses</h3>
                      </div>
                      <ul className="space-y-4">
                        {selectedSession.analysis.revisionNotes?.map((note: string, i: number) => (
                          <li key={i} className="flex gap-4 p-4 bg-lectra-background/40 rounded-2xl border border-lectra-border group hover:border-lectra-success/40 transition-all">
                            <div className="size-6 bg-lectra-success/10 rounded flex items-center justify-center shrink-0 mt-0.5">
                               <CheckCircle2 className="size-3 text-lectra-success" />
                            </div>
                            <p className="text-[11px] text-lectra-muted font-medium leading-relaxed leading-relaxed">{note}</p>
                          </li>
                        ))}
                      </ul>
                    </section>
                  </div>
                </>
              )}
            </motion.div>
          ) : (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center space-y-6 bg-lectra-background/30 border border-lectra-border rounded-[3.5rem] p-12 border-dashed relative group">
              <div className="size-24 bg-lectra-sidebar rounded-[2.5rem] flex items-center justify-center text-lectra-muted/20 shadow-inner group-hover:scale-110 transition-transform duration-700">
                <BookOpen className="size-10" />
              </div>
              <div>
                <h3 className="text-lectra-text font-black font-outfit uppercase tracking-widest text-xl">Select temporal Node</h3>
                <p className="text-[11px] text-lectra-muted font-medium tracking-widest mt-3 max-w-sm uppercase">Choose a historical session from the sidebar to extract analysis modules.</p>
              </div>
              <div className="absolute top-10 right-10 text-[8px] font-black uppercase tracking-[1em] text-lectra-muted/20 vertical-text pointer-events-none">REVISION HUB v4.2</div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
