/// <reference types="vite/client" />
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  School, 
  Settings, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  ScreenShare, 
  Hand, 
  Smile, 
  PhoneOff, 
  Send, 
  Sparkles, 
  CheckCircle, 
  MoreHorizontal,
  MessageSquare,
  TrendingUp,
  Radio,
  Users,
  Activity,
  Layers
} from 'lucide-react';
import { 
  LiveKitRoom, 
  VideoConference, 
  ParticipantTile, 
  useTracks, 
  RoomAudioRenderer,
  ControlBar,
  GridLayout,
  ParticipantLoop,
  useParticipants
} from '@livekit/components-react';
import '@livekit/components-styles';
import { Track } from 'livekit-client';
import axios from 'axios';
import { useAuth } from './context/AuthContext';
import { socket } from './lib/socket.ts';
import { cn } from './lib/utils';
import Whiteboard from './components/Whiteboard';
import DoubtQueue from './components/DoubtQueue';
import AiAssistant from './components/AiAssistant';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';

export default function MeetingRoom({ roomId, onLeave }: { roomId: string, onLeave: () => void }) {
  const { user } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [activeTab, setActiveTab] = useState<'chat' | 'people' | 'doubts' | 'polls'>('chat');

  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [raisedHands, setRaisedHands] = useState<string[]>([]);
  const [doubts, setDoubts] = useState<any[]>([]);
  const [whiteboardData, setWhiteboardData] = useState<any[]>([]);
  const [polls, setPolls] = useState<any[]>([]);
  const [newDoubt, setNewDoubt] = useState('');
  const [showWhiteboard, setShowWhiteboard] = useState(false);

  React.useEffect(() => {

    (async () => {
      try {
        // 1. Get token first (this ensures the meeting record exists in DB)
        const tokenRes = await axios.get(`${API_URL}/meetings/token/${roomId}`);
        setToken(tokenRes.data.token);

        // 2. Fetch other meeting data
        const [msgRes, doubtsRes, pollsRes] = await Promise.all([
          axios.get(`${API_URL}/meetings/messages/${roomId}`),
          axios.get(`${API_URL}/classroom-extras/doubts/${roomId}`),
          axios.get(`${API_URL}/classroom-extras/polls/${roomId}`)
        ]);
        
        setDoubts(doubtsRes.data);
        setPolls(pollsRes.data);
        setMessages(msgRes.data.map((m: any) => ({
          name: m.users?.name || 'Unknown',
          text: m.message,
          time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isMe: m.user_id === user?.id
        })));
      } catch (e) {
        console.error('Failed to initialize meeting data', e);
      }
    })();

    socket.emit('join-room', roomId);
    
    socket.on('receive-message', (data) => {
      setMessages(prev => [...prev, data]);
    });

    socket.on('new-doubt', (doubt) => {
      if (doubt.meeting_id === roomId) setDoubts(prev => [...prev, doubt]);
    });

    socket.on('whiteboard-state', (data) => {
      if (data.roomId === roomId) setWhiteboardData(data.data);
    });

    socket.on('hand-raised', (data) => {
      setRaisedHands(prev => [...new Set([...prev, data.name])]);
      setTimeout(() => {
        setRaisedHands(prev => prev.filter(n => n !== data.name));
      }, 5000);
    });

    return () => {
      socket.off('receive-message');
      socket.off('new-doubt');
      socket.off('whiteboard-state');
      socket.off('hand-raised');
    };
  }, [roomId]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const msg = { roomId, userId: user?.id, name: user?.name, text: inputText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isMe: true };
    socket.emit('send-message', msg);
    setMessages(prev => [...prev, msg]);
    setInputText('');
  };

  const raiseHand = () => {
    socket.emit('raise-hand', { roomId, name: user?.name });
  };

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const transcript = messages.map(m => `${m.name}: ${m.text}`).join('\n');
      const res = await axios.post(`${API_URL}/analyze-meeting`, { roomId, transcript });
      setAnalysis(res.data);
    } catch (e) {
      console.error('Analysis failed', e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCreatePoll = async (question: string, options: string[]) => {
    try {
      const res = await axios.post(`${API_URL}/classroom-extras/polls`, {
        meetingId: roomId,
        question,
        options: JSON.stringify(options)
      });
      socket.emit('poll-created', { roomId, ...res.data });
      setPolls(prev => [...prev, res.data]);
    } catch (e) {
      alert('Failed to create poll');
    }
  };

  const handleVotePoll = async (pollId: string, responseIndex: number) => {
    try {
      await axios.post(`${API_URL}/classroom-extras/polls/vote`, {
        pollId,
        responseIndex
      });
      setPolls(prev => prev.map(p => {
        if (p.id === pollId) {
          const newResponses = [...(p.poll_responses || []), { response_index: responseIndex }];
          return { ...p, poll_responses: newResponses };
        }
        return p;
      }));
    } catch (e) {
      alert('Failed to record vote');
    }
  };

  if (!token) return <div className="h-screen flex flex-col items-center justify-center bg-lectra-background font-outfit text-lectra-text gap-4">
    <div className="size-16 bg-lectra-primary/20 rounded-3xl flex items-center justify-center animate-pulse">
      <Radio className="size-8 text-lectra-primary animate-ping" />
    </div>
    <div className="text-center">
      <h2 className="text-2xl font-black uppercase tracking-tighter">Establishing Link</h2>
      <p className="text-lectra-muted text-[10px] font-black uppercase tracking-widest mt-1">Connecting to Lectra Neural Network...</p>
    </div>
  </div>;

  return (
    <LiveKitRoom
      video={true}
      audio={true}
      token={token}
      serverUrl={import.meta.env.VITE_LIVEKIT_URL}
      onDisconnected={onLeave}
      connectOptions={{ autoSubscribe: true }}
      className="flex flex-col h-screen bg-lectra-background text-lectra-text font-inter overflow-hidden"
    >
      {/* Top Header */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-lectra-border bg-lectra-sidebar/40 backdrop-blur-3xl sticky top-0 z-50">
        <div className="flex items-center gap-5">
          <div className="size-12 bg-lectra-primary rounded-[1rem] flex items-center justify-center text-white shadow-xl shadow-lectra-primary/20 transition-transform hover:scale-105 active:scale-95 cursor-pointer">
            <School className="size-6" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tighter uppercase font-outfit leading-none">Nexus Classroom</h1>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="flex items-center gap-1.5 px-2 py-0.5 bg-lectra-danger/10 rounded-full">
                <span className="size-1.5 rounded-full bg-lectra-danger animate-pulse" />
                <span className="text-[9px] text-lectra-danger font-black uppercase tracking-widest">Live</span>
              </span>
              <span className="text-[10px] text-lectra-muted font-bold uppercase tracking-widest">Room ID: <span className="text-lectra-text/60 select-all">{roomId}</span></span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <button 
            onClick={raiseHand} 
            className="flex items-center gap-2.5 px-5 py-2.5 bg-lectra-card hover:bg-lectra-primary text-lectra-text rounded-2xl border border-lectra-border hover:border-lectra-primary transition-all text-[11px] font-black uppercase tracking-[0.1em] shadow-lg group active:scale-95"
          >
            <Hand className="size-4 group-hover:animate-bounce" />
            Raise Hand
          </button>
          
          <div className="h-10 w-[2px] bg-lectra-border/50 rounded-full mx-1" />
          
          <div className="flex items-center gap-4 bg-lectra-card/50 p-1.5 pr-4 rounded-2xl border border-lectra-border">
            <img 
              className="size-9 rounded-[0.75rem] shadow-md border-2 border-lectra-primary/20" 
              src={`https://ui-avatars.com/api/?name=${user?.name}&background=4F46E5&color=fff&bold=true&rounded=false`} 
              alt="User" 
            />
            <div className="hidden sm:block">
              <p className="text-xs font-black text-lectra-text leading-none">{user?.name}</p>
              <p className="text-[9px] text-lectra-muted font-bold uppercase tracking-widest mt-1">{user?.role}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Side: AI Insights Panel */}
        <aside className="w-80 border-r border-lectra-border p-6 hidden 2xl:flex flex-col gap-8 bg-lectra-sidebar/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 bg-lectra-primary/10 rounded-xl flex items-center justify-center text-lectra-primary">
                <Sparkles className="size-5" />
              </div>
              <h3 className="font-black text-sm uppercase tracking-widest text-lectra-text font-outfit">AI Insights</h3>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-8 custom-scrollbar pr-2">
            <div className="bg-lectra-card/50 rounded-3xl p-6 border border-lectra-border transition-all hover:bg-lectra-card group relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-5 transition-opacity">
                 <Activity className="size-16" />
               </div>
               <p className="text-[10px] font-black text-lectra-primary uppercase tracking-[0.2em] mb-4">Neural Summary</p>
               <p className="text-sm text-lectra-muted leading-relaxed font-medium">
                 {isAnalyzing ? "Processing temporal stream..." : analysis?.summary || "Direct AI feedback will materialize here as the lecture progresses."}
               </p>
            </div>

            {analysis?.concepts && (
              <div className="space-y-4">
                <p className="text-[10px] font-black text-lectra-muted uppercase tracking-[0.2em]">Key Taxonomies</p>
                <div className="flex flex-wrap gap-2">
                  {analysis.concepts.map((c: any, i: number) => (
                    <span key={i} className="px-3 py-1.5 bg-lectra-primary/10 text-lectra-primary text-[9px] font-black uppercase tracking-widest rounded-lg border border-lectra-primary/20 transition-all hover:bg-lectra-primary hover:text-white">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <button 
              onClick={runAnalysis} 
              disabled={isAnalyzing} 
              className="w-full py-4 bg-lectra-background border border-lectra-border text-lectra-muted hover:text-lectra-primary hover:border-lectra-primary text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              Recalibrate Insights
            </button>
          </div>
        </aside>

        {/* Center: Main Stage */}
        <section className="flex-1 relative flex flex-col bg-lectra-background/50">
           <header className="h-16 px-8 flex items-center justify-between border-b border-lectra-border/50 bg-lectra-background/80 backdrop-blur-md">
              <div className="flex items-center gap-4">
                <div className={cn("size-2.5 rounded-full", showWhiteboard ? "bg-lectra-primary shadow-[0_0_12px_rgba(79,70,229,0.5)]" : "bg-lectra-success animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.5)]")} />
                <span className="text-[10px] font-black uppercase text-lectra-muted tracking-[0.25em]">{showWhiteboard ? 'Whiteboard Hub' : 'Live Stream'}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-lectra-card p-1 rounded-2xl border border-lectra-border">
                  <button 
                    onClick={() => setShowWhiteboard(false)} 
                    className={cn("px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all inline-flex items-center gap-2", !showWhiteboard ? "bg-lectra-primary text-white shadow-lg" : "text-lectra-muted hover:text-lectra-text")}
                  >
                    <Video className="size-3.5" /> Stage
                  </button>
                  <button 
                    onClick={() => setShowWhiteboard(true)} 
                    className={cn("px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all inline-flex items-center gap-2", showWhiteboard ? "bg-lectra-primary text-white shadow-lg" : "text-lectra-muted hover:text-lectra-text")}
                  >
                    <Layers className="size-3.5" /> Board
                  </button>
                </div>
                <button onClick={onLeave} className="px-6 py-3 bg-lectra-danger text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-lectra-danger/20 hover:scale-105 transition-all ml-2 active:scale-95">Disconnect</button>
              </div>
           </header>
           
           <div className="flex-1 relative p-6">
              <div className="h-full rounded-[2.5rem] overflow-hidden border border-lectra-border bg-lectra-card shadow-2xl relative">
                {showWhiteboard ? (
                  <Whiteboard socket={socket} roomId={roomId} initialData={whiteboardData} />
                ) : (
                  <div className="h-full bg-lectra-sidebar">
                    <VideoConference />
                  </div>
                )}
              </div>
              
              {/* Hand Raise Overlays */}
              <div className="absolute top-12 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-3">
                <AnimatePresence>
                  {raisedHands.map(name => (
                    <motion.div 
                      key={name} 
                      initial={{ opacity: 0, y: -40, scale: 0.9 }} 
                      animate={{ opacity: 1, y: 0, scale: 1 }} 
                      exit={{ opacity: 0, scale: 0.9 }} 
                      className="bg-lectra-primary text-white px-8 py-4 rounded-[1.5rem] shadow-[0_20px_50px_rgba(79,70,229,0.3)] flex items-center gap-4 font-black text-sm uppercase tracking-widest border border-white/20 backdrop-blur-xl"
                    >
                      <div className="size-8 bg-white/20 rounded-full flex items-center justify-center">
                        <Hand className="size-5" />
                      </div>
                      <span>{name} is requesting attention</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
           </div>
           
           {!showWhiteboard && <div className="pb-8 flex justify-center"><ControlBar /></div>}
        </section>

        {/* Right Sidebar: Interaction Tabs */}
        <aside className="w-96 border-l border-lectra-border flex flex-col bg-lectra-sidebar/60 backdrop-blur-3xl shrink-0">
          <div className="flex border-b border-lectra-border p-2 gap-1">
            {['chat', 'people', 'doubts', 'polls'].map((tab) => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab as any)} 
                className={cn(
                  "flex-1 py-4 text-[10px] font-black uppercase transition-all tracking-[0.2em] rounded-2xl", 
                  activeTab === tab ? "bg-lectra-primary text-white shadow-lg shadow-lectra-primary/20" : "text-lectra-muted hover:text-lectra-text hover:bg-white/5"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {activeTab === 'chat' && (
              <div className="space-y-6 h-full flex flex-col">
                <div className="flex-1 space-y-6">
                  {messages.map((m, i) => <ChatMessage key={i} {...m} />)}
                  {messages.length === 0 && (
                    <div className="text-center py-20 opacity-20 italic text-xs font-bold uppercase tracking-widest">Temporal stream is quiet</div>
                  )}
                </div>
                <form onSubmit={handleSendMessage} className="pt-6 mt-auto border-t border-lectra-border">
                   <div className="relative group">
                     <input 
                       value={inputText} 
                       onChange={e => setInputText(e.target.value)} 
                       className="w-full bg-lectra-card border border-lectra-border rounded-[1.25rem] py-4 px-6 text-sm text-lectra-text focus:border-lectra-primary focus:ring-4 focus:ring-lectra-primary/10 transition-all outline-none placeholder:text-slate-800" 
                       placeholder="Transmit message..." 
                     />
                     <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 size-10 bg-lectra-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-lectra-primary/20 group-hover:scale-110 active:scale-90 transition-transform">
                       <Send className="size-4" />
                     </button>
                   </div>
                </form>
              </div>
            )}
            
            {activeTab === 'people' && <PeopleTab />}
            
            {activeTab === 'doubts' && (
              <DoubtQueue roomId={roomId} socket={socket} user={user} />
            )}
            
            {activeTab === 'polls' && (
              <div className="space-y-6">
                 <div className="flex justify-between items-center px-1">
                    <span className="text-[10px] font-black text-lectra-muted uppercase tracking-[0.25em]">Neural Polls</span>
                    {user?.role === 'teacher' && (
                      <button 
                        onClick={() => {
                          const q = prompt('Poll Question?');
                          const o = prompt('Options (comma separated)?');
                          if(q && o) handleCreatePoll(q, o.split(','));
                        }} 
                        className="text-[9px] text-lectra-primary font-black uppercase tracking-widest hover:bg-lectra-primary/10 px-3 py-1.5 rounded-lg border border-lectra-primary/20 transition-all"
                      >
                        + Create Sync
                      </button>
                    )}
                 </div>
                 <div className="space-y-4">
                  {polls.map(p => (
                    <div key={p.id} className="p-6 rounded-[2rem] bg-lectra-card/50 border border-lectra-border space-y-5 transition-all hover:bg-lectra-card">
                        <h6 className="text-[13px] font-black leading-tight text-lectra-text font-outfit uppercase tracking-tight">{p.question}</h6>
                        <div className="space-y-3">
                          {p.options.map((o: any, i: number) => {
                            const votes = p.poll_responses?.filter((r: any) => r.response_index === i).length || 0;
                            const total = p.poll_responses?.length || 0;
                            const percentage = total === 0 ? 0 : Math.round((votes / total) * 100);
                            return (
                              <button 
                                key={i} 
                                onClick={() => handleVotePoll(p.id, i)} 
                                className="w-full relative p-4 rounded-[1.25rem] border border-lectra-border text-left overflow-hidden group hover:border-lectra-primary/50 transition-all"
                              >
                                <div className="relative z-10 flex justify-between items-center">
                                  <span className="text-[11px] font-bold text-lectra-text uppercase tracking-widest">{o}</span>
                                  <span className="text-lectra-primary font-black text-xs">{percentage}%</span>
                                </div>
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${percentage}%` }}
                                  transition={{ type: "spring", stiffness: 50, damping: 15 }}
                                  className="absolute inset-0 bg-lectra-primary/10" 
                                />
                              </button>
                            );
                          })}
                        </div>
                    </div>
                  ))}
                  {polls.length === 0 && (
                    <div className="text-center py-20 opacity-20 italic text-xs font-black uppercase tracking-widest">No active telemetry</div>
                  )}
                 </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      <RoomAudioRenderer />

      {user?.role === 'student' && (
        <AiAssistant classId={roomId} />
      )}
    </LiveKitRoom>
  );
}

function ChatMessage({ name, time, text, isMe }: any) {
  return (
    <div className={cn("flex flex-col gap-2", isMe && "items-end")}>
      <div className="flex items-center gap-3">
        {!isMe && <span className="text-[10px] font-black text-lectra-muted uppercase tracking-widest">{name}</span>}
        <span className="text-[9px] text-lectra-muted/40 font-bold">{time}</span>
        {isMe && <span className="text-[10px] font-black text-lectra-primary uppercase tracking-widest">You</span>}
      </div>
      <div className={cn(
        "px-5 py-3.5 rounded-[1.25rem] max-w-[90%] text-sm font-medium shadow-sm transition-transform hover:scale-[1.02]",
        isMe ? "bg-lectra-primary text-white rounded-tr-none shadow-lectra-primary/10" : "bg-lectra-card text-lectra-text rounded-tl-none border border-lectra-border"
      )}>
        {text}
      </div>
    </div>
  );
}

function PeopleTab() {
  const participants = useParticipants();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4 px-1">
        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-lectra-muted">Active Nodes</span>
        <span className="text-[10px] px-3 py-1 bg-lectra-primary/10 text-lectra-primary rounded-full font-black shadow-inner">{participants.length}</span>
      </div>
      <div className="space-y-3">
        {participants.map((p) => (
          <div key={p.sid} className="flex items-center gap-4 p-4 rounded-[1.5rem] bg-lectra-card/30 border border-lectra-border transition-all hover:bg-lectra-card group">
            <div className="size-11 bg-lectra-sidebar rounded-xl flex items-center justify-center text-[11px] font-black border border-lectra-border uppercase text-lectra-muted group-hover:text-lectra-primary transition-colors">
              {p.identity.slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate text-lectra-text group-hover:text-lectra-primary transition-colors leading-none">
                {p.metadata ? JSON.parse(p.metadata).name : p.identity}
              </p>
              {p.isSpeaking ? (
                <span className="text-[8px] font-black text-lectra-success uppercase flex items-center gap-1.5 mt-2 tracking-widest">
                  <span className="size-1 bg-lectra-success rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  Transmitting
                </span>
              ) : (
                <p className="text-[8px] text-lectra-muted font-bold uppercase tracking-widest mt-2">Idle Mode</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              {!p.isMicrophoneEnabled ? <div className="size-8 bg-lectra-danger/10 flex items-center justify-center rounded-lg"><MicOff className="size-3.5 text-lectra-danger" /></div> : <div className="size-8 bg-lectra-primary/10 flex items-center justify-center rounded-lg"><Mic className="size-3.5 text-lectra-primary" /></div>}
              {!p.isCameraEnabled ? <div className="size-8 bg-lectra-danger/10 flex items-center justify-center rounded-lg"><VideoOff className="size-3.5 text-lectra-danger" /></div>    : <div className="size-8 bg-lectra-primary/10 flex items-center justify-center rounded-lg"><Video className="size-3.5 text-lectra-primary" /></div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
