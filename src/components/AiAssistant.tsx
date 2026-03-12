import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Sparkles, User, Brain, X, ChevronDown, MessageSquare } from 'lucide-react';
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
          "fixed bottom-8 right-8 z-50 size-16 bg-primary rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-primary/40 hover:scale-105 transition-transform",
          isOpen && "scale-0 opacity-0 pointer-events-none"
        )}
      >
        <MessageSquare className="size-8" />
        <span className="absolute -top-1 -right-1 size-4 bg-emerald-500 rounded-full border-2 border-background-dark animate-pulse" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-8 right-8 z-[100] w-full max-w-md h-[600px] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-blue-600 p-6 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="size-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                  <Brain className="size-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold leading-none">Lectra AI</h3>
                  <p className="text-white/70 text-[10px] uppercase font-black tracking-widest mt-1">Teaching Assistant</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full text-white/80 transition-colors"
              >
                <ChevronDown className="size-6" />
              </button>
            </div>

            {/* Chat Content */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar"
            >
              {messages.map((msg, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "flex gap-4 max-w-[85%]",
                    msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                  )}
                >
                  <div className={cn(
                    "size-8 rounded-lg flex items-center justify-center shrink-0",
                    msg.role === 'user' ? "bg-slate-800" : "bg-primary/20 text-primary"
                  )}>
                    {msg.role === 'user' ? <User className="size-4" /> : <Sparkles className="size-4" />}
                  </div>
                  <div className={cn(
                    "p-4 rounded-2xl text-sm leading-relaxed",
                    msg.role === 'user' 
                      ? "bg-primary text-white rounded-tr-none" 
                      : "bg-slate-800/50 text-slate-300 rounded-tl-none border border-white/5"
                  )}>
                    <div className="markdown-content">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  </div>

                </div>
              ))}
              {loading && (
                <div className="flex gap-4 mr-auto max-w-[85%]">
                  <div className="size-8 bg-primary/20 text-primary rounded-lg flex items-center justify-center shrink-0">
                    <Sparkles className="size-4 animate-pulse" />
                  </div>
                  <div className="bg-slate-800/50 p-4 rounded-2xl rounded-tl-none border border-white/5 italic text-slate-500 text-xs">
                    Thinking... 
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-6 border-t border-slate-800 bg-slate-900/50 backdrop-blur-xl">
              <div className="relative group">
                <input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about the course..."
                  className="w-full bg-slate-800 border-2 border-transparent focus:border-primary/30 rounded-2xl py-4 pl-6 pr-14 text-sm text-white focus:ring-0 transition-all placeholder:text-slate-500 shadow-inner"
                />
                <button 
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="absolute right-2 top-2 size-10 bg-primary text-white rounded-xl flex items-center justify-center hover:brightness-110 transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
                >
                  <Send className="size-5" />
                </button>
              </div>
              <p className="text-[10px] text-center text-slate-600 mt-3 uppercase font-bold tracking-widest">Powered by Lectra Intelligence</p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
