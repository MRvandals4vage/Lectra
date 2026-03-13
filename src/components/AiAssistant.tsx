import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Sparkles, User, Brain, X, ChevronDown, MessageSquare, Bot } from 'lucide-react';
import axios from 'axios';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';

export default function AiAssistant({ classId }: { classId: string }) {
  const [messages, setMessages] = React.useState<{ role: 'user' | 'assistant', content: string }[]>([
    { role: 'assistant', content: "Hello! I'm your Lectra AI Assistant. Ask me anything about your lectures, assignments, or course materials." }
  ]);
  const [input, setInput] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/classroom-extras/ai/assistant`, { classId, question: userMessage });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.answer }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting right now. Please try again later." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-8 right-8 z-50 size-20 bg-lectra-primary rounded-[2rem] flex items-center justify-center text-white shadow-[0_20px_50px_-10px_rgba(79,70,229,0.5)] hover:scale-105 active:scale-95 transition-all group overflow-hidden border border-white/20 hover:rotate-3",
          isOpen && "scale-0 opacity-0 pointer-events-none"
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <MessageSquare className="size-8 relative z-10" />
        <span className="absolute top-4 right-4 size-3 bg-lectra-success rounded-full ring-4 ring-lectra-primary animate-pulse" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 100, x: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 100, x: 50 }}
            className="fixed bottom-8 right-8 z-[100] w-full max-w-md h-[720px] bg-lectra-card border border-lectra-border rounded-[2.5rem] shadow-[0_30px_100px_-20px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden backdrop-blur-2xl"
          >
            {/* Header */}
            <header className="p-8 pb-6 flex justify-between items-center bg-lectra-sidebar/40 relative border-b border-white/5">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-lectra-primary via-lectra-accent to-lectra-primary bg-[length:200%_auto] animate-gradient" />
              <div className="flex items-center gap-4">
                <div className="size-14 bg-lectra-primary rounded-2xl flex items-center justify-center shadow-lg shadow-lectra-primary/20 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent opacity-50" />
                  <Bot className="size-7 text-white relative z-10 group-hover:scale-110 transition-transform" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-lectra-text font-outfit uppercase tracking-tighter leading-none">Lectra AI</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="size-1.5 rounded-full bg-lectra-success animate-pulse" />
                    <p className="text-lectra-muted text-[10px] uppercase font-black tracking-widest leading-none">Co-Pilot Mode Active</p>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="size-10 flex items-center justify-center hover:bg-white/5 rounded-xl text-lectra-muted hover:text-white transition-all border border-transparent hover:border-white/10"
              >
                <ChevronDown className="size-6" />
              </button>
            </header>

            {/* Chat Content */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar bg-gradient-to-b from-transparent to-lectra-background/30"
            >
              <div className="text-center pb-4">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-lectra-muted/40">Temporal Session Initiated</p>
              </div>

              {messages.map((msg, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "flex gap-4 max-w-[90%] group",
                    msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                  )}
                >
                  <div className={cn(
                    "size-10 rounded-2xl flex items-center justify-center shrink-0 border transition-all group-hover:scale-105 shadow-sm",
                    msg.role === 'user' 
                      ? "bg-lectra-background border-lectra-border text-lectra-muted" 
                      : "bg-lectra-primary/10 border-lectra-primary/20 text-lectra-primary"
                  )}>
                    {msg.role === 'user' ? <User className="size-5" /> : <Sparkles className="size-5" />}
                  </div>
                  <div className={cn(
                    "p-5 rounded-3xl text-sm leading-relaxed relative overflow-hidden",
                    msg.role === 'user' 
                      ? "bg-lectra-primary text-white rounded-tr-none shadow-xl shadow-lectra-primary/10" 
                      : "bg-lectra-sidebar/60 text-lectra-text/90 rounded-tl-none border border-lectra-border backdrop-blur-sm"
                  )}>
                    {msg.role === 'assistant' && (
                      <div className="absolute top-0 right-0 p-3 opacity-5">
                        <Brain className="size-12" />
                      </div>
                    )}
                    <div className="markdown-content prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex gap-4 mr-auto max-w-[90%]">
                  <div className="size-10 bg-lectra-primary/10 border border-lectra-primary/20 text-lectra-primary rounded-2xl flex items-center justify-center shrink-0 animate-pulse">
                    <Sparkles className="size-5" />
                  </div>
                  <div className="bg-lectra-sidebar/40 p-5 rounded-3xl rounded-tl-none border border-lectra-border flex flex-col gap-2">
                    <div className="flex gap-1.5 items-center">
                      <span className="size-1.5 bg-lectra-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <span className="size-1.5 bg-lectra-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <span className="size-1.5 bg-lectra-primary rounded-full animate-bounce" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-lectra-muted italic">Processing neural stream...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <footer className="p-8 border-t border-lectra-border bg-lectra-sidebar/80 backdrop-blur-2xl">
              <form onSubmit={handleSend} className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-lectra-primary to-lectra-accent rounded-[1.5rem] opacity-0 group-focus-within:opacity-20 transition-opacity blur" />
                <input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask your digital neural assistant..."
                  className="w-full bg-lectra-background border border-lectra-border focus:border-lectra-primary rounded-[1.5rem] py-5 pl-8 pr-16 text-sm text-lectra-text focus:ring-0 transition-all placeholder:text-slate-800 font-medium relative z-10"
                />
                <button 
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="absolute right-2 top-2 size-12 bg-lectra-primary text-white rounded-[1rem] flex items-center justify-center hover:bg-lectra-primaryHover transition-all disabled:opacity-50 shadow-lg shadow-lectra-primary/30 z-20 active:scale-95 group/btn"
                >
                  <Send className="size-5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                </button>
              </form>
              <div className="flex items-center justify-center gap-3 mt-5 opacity-40">
                <div className="h-px flex-1 bg-lectra-border" />
                <p className="text-[8px] uppercase font-black tracking-[0.4em] text-lectra-muted">Lectra Core Engine v2.4</p>
                <div className="h-px flex-1 bg-lectra-border" />
              </div>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
