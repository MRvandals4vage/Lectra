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
  Users
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
import { Track } from 'livekit-client';
import { io } from 'socket.io-client';
import axios from 'axios';
import { useAuth } from './context/AuthContext';
import { cn } from './lib/utils';
import Whiteboard from './components/Whiteboard';
import AiAssistant from './components/AiAssistant';



const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';
const socket = io(API_URL);

export default function MeetingRoom({ roomId, onLeave }: { roomId: string, onLeave: () => void }) {
  const { user } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [activeTab, setActiveTab] = useState<'chat' | 'people' | 'doubts' | 'whiteboard' | 'polls'>('chat');

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
        const [tokenRes, msgRes, doubtsRes, pollsRes] = await Promise.all([
          axios.get(`${API_URL}/meetings/token/${roomId}`),
          axios.get(`${API_URL}/meetings/messages/${roomId}`),
          axios.get(`${API_URL}/classroom-extras/doubts/${roomId}`),
          axios.get(`${API_URL}/classroom-extras/polls/${roomId}`)
        ]);
        setToken(tokenRes.data.token);
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

  const handlePostDoubt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoubt.trim()) return;
    try {
      const res = await axios.post(`${API_URL}/classroom-extras/doubts`, {
        meetingId: roomId,
        question: newDoubt,
        category: 'General'
      });
      socket.emit('doubt-posted', { roomId, ...res.data });
      setNewDoubt('');
    } catch (e) {
      alert('Failed to post doubt');
    }
  };

  const handleUpvoteDoubt = async (doubtId: string) => {
    try {
      await axios.patch(`${API_URL}/classroom-extras/doubts/${doubtId}/upvote`);
      setDoubts(prev => prev.map(d => d.id === doubtId ? { ...d, upvotes: (d.upvotes || 0) + 1 } : d).sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0)));
    } catch (e) {
      console.error('Upvote failed');
    }
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
      // In a real app, socket would broadcast the vote update
      // For now, update local state
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



  if (!token) return <div className="h-screen flex items-center justify-center">Connecting...</div>;

  return (
    <LiveKitRoom
      video={true}
      audio={true}
      token={token}
      serverUrl={import.meta.env.VITE_LIVEKIT_URL}
      onDisconnected={onLeave}
      connectOptions={{ autoSubscribe: true }}
      className="flex flex-col h-screen bg-background-dark text-slate-100 overflow-hidden"
    >
      {/* Top Navigation */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-primary/20 bg-background-dark/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-white"><School className="size-5" /></div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">Nexus Classroom</h1>
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs text-slate-400 font-medium">Live • Room: {roomId}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={raiseHand} className="px-3 py-1.5 bg-slate-800 hover:bg-primary/20 text-slate-300 rounded-lg border border-slate-700 text-xs font-bold transition-all"><Hand className="size-4 mr-2 inline" />Raise Hand</button>
          <div className="bg-primary/20 rounded-full p-0.5 border border-primary/50">
            <img className="size-8 rounded-full" src={`https://ui-avatars.com/api/?name=${user?.name}&background=6366f1&color=fff`} alt="User" />
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar: AI Insights */}
        <aside className="w-72 border-r border-primary/10 p-4 hidden xl:flex flex-col gap-6 bg-background-dark/30">
          <div className="flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2 text-primary"><Sparkles className="size-5" />AI Insights</h3>
            <span className="text-[10px] px-2 py-0.5 bg-primary/20 text-primary rounded-full uppercase font-bold">Live</span>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-6 custom-scrollbar pr-1">
            <div className="glass-panel p-4 rounded-xl space-y-3">
              <p className="text-xs font-semibold text-primary uppercase tracking-wider">Current Summary</p>
              <p className="text-sm text-slate-400 leading-relaxed">
                {isAnalyzing ? "AI is thinking..." : analysis?.summary || "Meeting transcript will appear here."}
              </p>
            </div>
            {analysis?.concepts && (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Key Concepts</p>
                <div className="flex flex-wrap gap-2">
                  {analysis.concepts.map((c: any, i: number) => <span key={i} className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-md border border-primary/20">{c}</span>)}
                </div>
              </div>
            )}
            <button onClick={runAnalysis} disabled={isAnalyzing} className="w-full py-2 bg-slate-800 hover:bg-primary/20 text-slate-300 text-xs font-bold rounded-lg border border-slate-700 transition-all">Refresh Insights</button>
          </div>
        </aside>

        {/* Center: Main Content */}
        <section className="flex-1 relative flex flex-col bg-background-dark/50">
           <header className="h-12 px-6 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-2">
                <div className={cn("size-2 rounded-full", showWhiteboard ? "bg-primary" : "bg-emerald-500 animate-pulse")} />
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{showWhiteboard ? 'Whiteboard Mode' : 'Video Conference'}</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setShowWhiteboard(!showWhiteboard)} className={cn("px-3 py-1 rounded-lg text-[10px] font-bold transition-all", showWhiteboard ? "bg-primary text-white" : "bg-slate-800 text-slate-400")}>
                  {showWhiteboard ? 'Switch to Video' : 'Switch to Board'}
                </button>
                <button onClick={onLeave} className="px-3 py-1 bg-rose-500 text-white rounded-lg text-[10px] font-bold">End</button>
              </div>
           </header>
           
           <div className="flex-1 relative p-4">
              {showWhiteboard ? (
                <div className="absolute inset-4 rounded-3xl overflow-hidden border border-white/10">
                  <Whiteboard socket={socket} roomId={roomId} initialData={whiteboardData} />
                </div>
              ) : (
                <div className="h-full rounded-3xl overflow-hidden border border-white/5 bg-slate-900/50">
                  <VideoConference />
                </div>
              )}
              
              {/* Hand Raise Overlays */}
              <div className="absolute top-8 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2">
                <AnimatePresence>
                  {raisedHands.map(name => (
                    <motion.div key={name} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-primary text-white px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 font-bold text-sm">
                      <Hand className="size-4" /> {name} raised hand!
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
           </div>
           
           {!showWhiteboard && <ControlBar />}
        </section>

        {/* Right Sidebar: Tabs */}
        <aside className="w-80 border-l border-primary/10 flex flex-col bg-background-dark/80 backdrop-blur-xl">
          <div className="flex border-b border-primary/10">
            {['chat', 'people', 'doubts', 'polls'].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab as any)} className={cn("flex-1 py-4 text-[10px] font-black uppercase transition-all", activeTab === tab ? "border-b-2 border-primary text-primary bg-primary/5" : "text-slate-500 hover:text-slate-300")}>{tab}</button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {activeTab === 'chat' ? (
              <div className="space-y-4">
                {messages.map((m, i) => <ChatMessage key={i} {...m} />)}
              </div>
            ) : activeTab === 'people' ? (
              <PeopleTab />
            ) : activeTab === 'doubts' ? (
              <div className="space-y-4">
                {doubts.map(d => (
                  <div key={d.id} className="p-3 rounded-xl bg-slate-800/50 border border-white/5 space-y-2">
                    <p className="text-sm text-slate-200">{d.question}</p>
                    <div className="flex justify-between items-center text-[10px] font-bold">
                       <span className="text-slate-500">{d.users?.name}</span>
                       <button onClick={() => handleUpvoteDoubt(d.id)} className="text-primary hover:bg-primary/10 px-2 py-1 rounded bg-primary/5 flex items-center gap-1">
                         <TrendingUp className="size-3" /> {d.upvotes || 0}
                       </button>
                    </div>
                  </div>
                ))}
                <form onSubmit={handlePostDoubt} className="pt-2">
                   <input value={newDoubt} onChange={e => setNewDoubt(e.target.value)} className="w-full bg-slate-800 border-none rounded-xl py-3 px-4 text-xs text-white" placeholder="Ask a doubt..." />
                </form>
              </div>
            ) : (
              <div className="space-y-4">
                 <div className="flex justify-between items-center px-1">
                    <span className="text-[10px] font-black text-slate-500 uppercase">Live Polls</span>
                    {user?.role === 'teacher' && <button onClick={() => {
                        const q = prompt('Question?');
                        const o = prompt('Options (A,B,C)?');
                        if(q && o) handleCreatePoll(q, o.split(','));
                    }} className="text-[10px] text-primary font-bold">+ NEW</button>}
                 </div>
                 {polls.map(p => (
                   <div key={p.id} className="p-4 rounded-xl bg-slate-800/50 border border-white/5 space-y-3">
                      <h6 className="text-xs font-bold">{p.question}</h6>
                      <div className="space-y-2">
                        {p.options.map((o: any, i: number) => {
                          const votes = p.poll_responses?.filter((r: any) => r.response_index === i).length || 0;
                          return (
                            <button key={i} onClick={() => handleVotePoll(p.id, i)} className="w-full relative p-3 rounded-lg border border-white/5 text-left text-[10px] overflow-hidden group">
                              <div className="relative z-10 flex justify-between"><span>{o}</span><span className="text-primary font-bold">{votes}</span></div>
                              <div className="absolute inset-0 bg-primary/10 transition-all" style={{ width: `${(votes / (p.poll_responses?.length || 1)) * 100}%` }} />
                            </button>
                          );
                        })}
                      </div>
                   </div>
                 ))}
              </div>
            )}
          </div>
          
          {activeTab === 'chat' && (
            <form onSubmit={handleSendMessage} className="p-4 border-t border-white/5">
               <input value={inputText} onChange={e => setInputText(e.target.value)} className="w-full bg-slate-800 border-none rounded-xl py-3 px-4 text-xs text-white" placeholder="Type a message..." />
            </form>
          )}
        </aside>
      </div>


      <RoomAudioRenderer />

      {user?.role === 'student' && (
        <AiAssistant classId={roomId} />
      )}
    </LiveKitRoom>

  );
}

function PointItem({ text, active, pending }: any) {

  return (
    <li className={cn("flex gap-2 text-sm", pending && "opacity-50")}>
      {pending ? (
        <MoreHorizontal className="text-slate-500 size-4 shrink-0 mt-0.5" />
      ) : (
        <CheckCircle className="text-primary size-4 shrink-0 mt-0.5" />
      )}
      <span>{text}</span>
    </li>
  );
}

function Participant({ name, img, initials, active, micOn, videoOn = true, cameraOff, reaction }: any) {
  return (
    <div className={cn(
      "relative rounded-2xl overflow-hidden bg-slate-800 border border-slate-700 transition-all",
      active && "active-speaker-ring"
    )}>
      {cameraOff ? (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center">
            <div className="size-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3 border-2 border-primary/50">
              <span className="text-2xl font-bold text-primary">{initials}</span>
            </div>
            <p className="text-sm font-semibold text-slate-300">{name}</p>
            <p className="text-[10px] text-slate-500 uppercase">Camera Off</p>
          </div>
        </div>
      ) : (
        <>
          <img 
            className={cn("w-full h-full object-cover", !videoOn && "hidden")} 
            src={img} 
            alt={name} 
            referrerPolicy="no-referrer"
          />
          {!videoOn && (
            <div className="w-full h-full flex items-center justify-center bg-slate-900">
              <VideoOff className="size-12 text-slate-700" />
            </div>
          )}
        </>
      )}
      
      <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg flex items-center gap-2 border border-white/10">
        {micOn ? (
          <Mic className="text-primary size-3.5 fill-current" />
        ) : (
          <MicOff className="text-red-500 size-3.5" />
        )}
        <span className="text-xs font-medium text-white">{name}</span>
      </div>

      {active && (
        <div className="absolute top-4 right-4 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded">
          ACTIVE SPEAKER
        </div>
      )}

      {reaction && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div 
            initial={{ scale: 0, y: 20 }}
            animate={{ scale: 1.5, y: -20 }}
            exit={{ opacity: 0 }}
            className="bg-primary/20 backdrop-blur-xl size-16 rounded-full flex items-center justify-center border border-primary/50 text-3xl"
          >
            {reaction}
          </motion.div>
        </div>
      )}
    </div>
  );
}

function ControlButton({ icon: Icon, active, onClick, danger, primary }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "size-12 rounded-xl flex items-center justify-center transition-all",
        primary ? "bg-primary text-white shadow-lg shadow-primary/20 hover:scale-105" : 
        danger ? "bg-red-500 text-white" :
        "bg-slate-800 hover:bg-slate-700 text-white"
      )}
    >
      <Icon className="size-5" />
    </button>
  );
}

function ChatMessage({ name, time, text, isMe }: any) {
  return (
    <div className={cn("flex flex-col gap-1", isMe && "items-end")}>
      <div className="flex items-center gap-2">
        {!isMe && <span className="text-xs font-bold text-slate-400">{name}</span>}
        <span className="text-[10px] text-slate-600">{time}</span>
        {isMe && <span className="text-xs font-bold text-primary">You</span>}
      </div>
      <div className={cn(
        "p-3 rounded-b-xl max-w-[90%] text-sm",
        isMe ? "bg-primary text-white rounded-tl-xl" : "bg-slate-800/50 text-slate-300 rounded-tr-xl"
      )}>
        {text}
      </div>
    </div>
  );
}

function PeopleTab() {
  const participants = useParticipants();
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Active Participants</span>
        <span className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-full font-bold">{participants.length}</span>
      </div>
      {participants.map((p) => (
        <div key={p.sid} className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/30 border border-white/5">
          <div className="size-8 bg-slate-800 rounded-lg flex items-center justify-center text-[10px] font-bold border border-white/10 uppercase">
            {p.identity.slice(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate">
              {p.metadata ? JSON.parse(p.metadata).name : p.identity}
            </p>
            {p.isSpeaking && (
              <span className="text-[8px] font-black text-emerald-500 uppercase flex items-center gap-1">
                <span className="size-1 bg-emerald-500 rounded-full animate-pulse" />
                Speaking
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!p.isMicrophoneEnabled ? <MicOff className="size-3 text-red-500" /> : <Mic className="size-3 text-primary" />}
            {!p.isCameraEnabled ? <VideoOff className="size-3 text-red-500" /> : <Video className="size-3 text-primary" />}
          </div>
        </div>
      ))}
    </div>
  );
}
