import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, FileText, Zap, ChevronRight, Download, Sparkles } from 'lucide-react';
import axios from 'axios';

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
      // Filter for sessions that have analysis
      setSessions(res.data);
    } catch (err) {
      console.error('Error fetching sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Session List */}
      <div className="lg:col-span-1 space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <BookOpen className="size-5 text-primary" />
          Lecture History
        </h2>
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          {sessions.map((session) => (
            <motion.div 
              key={session.id}
              onClick={() => setSelectedSession(session)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                selectedSession?.id === session.id 
                ? 'bg-primary/10 border-primary shadow-lg shadow-primary/5' 
                : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase">{new Date(session.created_at).toLocaleDateString()}</span>
                {session.analysis && <Sparkles className="size-3 text-primary" />}
              </div>
              <h3 className="font-bold text-sm mb-1">{session.title || `Lecture: ${session.room_id}`}</h3>
              <p className="text-xs text-slate-500 line-clamp-1">Room ID: {session.room_id}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="lg:col-span-2">
        <AnimatePresence mode="wait">
          {selectedSession ? (
            <motion.div 
              key={selectedSession.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-8"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold">{selectedSession.title || `Lecture: ${selectedSession.room_id}`}</h2>
                  <p className="text-slate-400 mt-1">Detailed analysis and revision materials.</p>
                </div>
                <button className="p-2 bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors">
                  <Download className="size-5" />
                </button>
              </div>

              {!selectedSession.analysis ? (
                <div className="py-20 text-center space-y-4 bg-slate-800/20 rounded-2xl border border-dashed border-slate-700">
                  <Zap className="size-12 text-slate-700 mx-auto" />
                  <p className="text-slate-500 italic">No AI analysis available for this session.</p>
                  <button className="px-4 py-2 bg-primary/20 text-primary text-xs font-bold rounded-lg border border-primary/20">
                    Generate Analysis
                  </button>
                </div>
              ) : (
                <>
                  <section className="space-y-4">
                    <h3 className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
                      <FileText className="size-4" />
                      Executive Summary
                    </h3>
                    <p className="text-slate-300 leading-relaxed text-sm bg-slate-800/30 p-4 rounded-2xl border border-white/5">
                      {selectedSession.analysis.summary}
                    </p>
                  </section>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <section className="space-y-4">
                      <h3 className="text-sm font-black uppercase tracking-widest text-orange-500 flex items-center gap-2">
                        <Zap className="size-4" />
                        Flashcards
                      </h3>
                      <div className="space-y-3">
                        {selectedSession.analysis.flashcards?.map((card: any, i: number) => (
                          <div key={i} className="p-4 bg-slate-800/50 rounded-xl border border-white/5 space-y-2 group cursor-pointer hover:bg-slate-800 transition-all">
                            <p className="text-xs font-bold text-primary">Q: {card.question}</p>
                            <p className="text-[10px] text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">A: {card.answer}</p>
                          </div>
                        ))}
                      </div>
                    </section>

                    <section className="space-y-4">
                      <h3 className="text-sm font-black uppercase tracking-widest text-emerald-500 flex items-center gap-2">
                        <ChevronRight className="size-4" />
                        Revision Notes
                      </h3>
                      <ul className="space-y-3">
                        {selectedSession.analysis.revisionNotes?.map((note: string, i: number) => (
                          <li key={i} className="flex gap-3 text-xs text-slate-400 p-3 bg-slate-800/30 rounded-xl border border-white/5">
                            <span className="size-1.5 bg-emerald-500 rounded-full mt-1.5 shrink-0" />
                            {note}
                          </li>
                        ))}
                      </ul>
                    </section>
                  </div>
                </>
              )}
            </motion.div>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center space-y-4 bg-slate-900 border border-slate-800 rounded-3xl p-8 border-dashed">
              <BookOpen className="size-16 text-slate-800" />
              <div>
                <h3 className="text-slate-300 font-bold">Select a Lecture</h3>
                <p className="text-xs text-slate-500">Choose a session from the history to view resources.</p>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
