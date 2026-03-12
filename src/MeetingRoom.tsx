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

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';
const socket = io(API_URL);

export default function MeetingRoom({ roomId, onLeave }: { roomId: string, onLeave: () => void }) {
  const { user } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [activeTab, setActiveTab] = useState<'chat' | 'people'>('chat');
  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [raisedHands, setRaisedHands] = useState<string[]>([]);

  React.useEffect(() => {
    (async () => {
      try {
        const [tokenRes, msgRes] = await Promise.all([
          axios.get(`${API_URL}/meetings/token/${roomId}`),
          axios.get(`${API_URL}/meetings/messages/${roomId}`)
        ]);
        setToken(tokenRes.data.token);
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

    socket.on('hand-raised', (data) => {
      setRaisedHands(prev => [...new Set([...prev, data.name])]);
      setTimeout(() => {
        setRaisedHands(prev => prev.filter(n => n !== data.name));
      }, 5000);
    });

    return () => {
      socket.off('receive-message');
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
      const res = await axios.post(`${API_URL}/meetings/analyze`, { roomId, transcript });
      setAnalysis(res.data);
    } catch (e) {
      console.error('Analysis failed', e);
    } finally {
      setIsAnalyzing(false);
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
          <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-white">
            <School className="size-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">Nexus Classroom</h1>
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs text-slate-400 font-medium">Live • Room: {roomId}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={raiseHand}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-primary/20 text-slate-300 hover:text-primary rounded-lg border border-slate-700 transition-all text-xs font-bold"
          >
            <Hand className="size-4" />
            Raise Hand
          </button>
          <div className="bg-primary/20 rounded-full p-0.5 border border-primary/50">
            <img 
              className="size-8 rounded-full" 
              src={`https://ui-avatars.com/api/?name=${user?.name}&background=6366f1&color=fff`} 
              alt="User" 
            />
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar: AI Insights */}
        <aside className="w-72 border-r border-primary/10 p-4 flex flex-col gap-6 hidden xl:flex bg-background-dark/30">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2 text-primary">
                <Sparkles className="size-5" />
                AI Insights
              </h3>
              <span className="text-[10px] px-2 py-0.5 bg-primary/20 text-primary rounded-full uppercase font-bold">Live</span>
            </div>
            
            <div className="glass-panel p-4 rounded-xl space-y-3">
              <p className="text-xs font-semibold text-primary uppercase tracking-wider">Current Summary</p>
              <p className="text-sm text-slate-400 leading-relaxed">
                {isAnalyzing ? (
                  <span className="flex items-center gap-2">
                    <span className="size-2 bg-primary rounded-full animate-bounce" />
                    AI is thinking...
                  </span>
                ) : analysis ? (
                  analysis.summary
                ) : (
                  "Lecture in progress. Chat messages will be used for analysis."
                )}
              </p>
            </div>

            {analysis?.concepts && (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Key Concepts</p>
                <div className="flex flex-wrap gap-2">
                  {analysis.concepts.map((c: string, i: number) => (
                    <span key={i} className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-md border border-primary/20">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <button 
              onClick={runAnalysis}
              disabled={isAnalyzing}
              className="w-full py-2 bg-slate-800 hover:bg-primary/20 text-slate-300 hover:text-primary text-xs font-bold rounded-lg border border-slate-700 hover:border-primary/50 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="size-3" />
              {isAnalyzing ? "Analyzing..." : "Refresh Insights"}
            </button>
          </div>
        </aside>

        {/* Center: Video Grid */}
        <section className="flex-1 relative p-6 bg-background-dark">
          {/* Hand Raise Overlay */}
          <div className="absolute top-10 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none">
            <AnimatePresence>
              {raisedHands.map(name => (
                <motion.div
                  key={name}
                  initial={{ opacity: 0, y: -20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="bg-primary text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 font-bold text-sm border border-white/20"
                >
                  <Hand className="size-4 fill-white" />
                  {name} raised their hand!
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <VideoConference />
        </section>

        {/* Right Sidebar: Chat & Participants */}
        <aside className="w-80 border-l border-primary/10 flex flex-col bg-background-dark/50">
          <div className="flex border-b border-primary/10">
            <button 
              onClick={() => setActiveTab('chat')}
              className={cn(
                "flex-1 py-4 text-sm font-bold transition-colors",
                activeTab === 'chat' ? "border-b-2 border-primary text-primary" : "text-slate-500 hover:text-slate-300"
              )}
            >
              Chat
            </button>
            <button 
              onClick={() => setActiveTab('people')}
              className={cn(
                "flex-1 py-4 text-sm font-bold transition-colors",
                activeTab === 'people' ? "border-b-2 border-primary text-primary" : "text-slate-500 hover:text-slate-300"
              )}
            >
              People
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {activeTab === 'chat' ? (
              <div className="space-y-4">
                {messages.map((m, i) => (
                  <ChatMessage key={i} name={m.name} time={m.time} text={m.text} isMe={m.name === user?.name} />
                ))}
              </div>
            ) : (
              <PeopleTab />
            )}
          </div>

          {activeTab === 'chat' && (
            <form onSubmit={handleSendMessage} className="p-4 border-t border-primary/10">
              <div className="relative">
                <input 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="w-full bg-slate-800 border-none rounded-xl py-3 pl-4 pr-12 text-sm focus:ring-2 focus:ring-primary/50 text-white" 
                  placeholder="Message to everyone..." 
                  type="text"
                />
                <button type="submit" className="absolute right-2 top-1.5 p-1.5 text-primary hover:bg-primary/10 rounded-lg">
                  <Send className="size-5" />
                </button>
              </div>
            </form>
          )}
        </aside>
      </div>
      <RoomAudioRenderer />
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
