import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User, UserCircle, School, GraduationCap, Loader2, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<'teacher' | 'student'>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/signup';
      const payload = isLogin ? { email, password } : { name, email, password, role };
      
      const response = await axios.post(`${API_URL}${endpoint}`, payload);
      const { user, token } = response.data;
      
      login(token, user);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0F172A]/80 backdrop-blur-xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            className="w-full max-w-lg bg-lectra-sidebar border border-lectra-border/50 rounded-[3rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] relative"
          >
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-lectra-primary via-lectra-accent to-lectra-primary animate-gradient" />
            <div className="absolute -top-24 -right-24 size-64 bg-lectra-primary/10 rounded-full blur-[80px]" />
            <div className="absolute -bottom-24 -left-24 size-64 bg-lectra-accent/10 rounded-full blur-[80px]" />

            <div className="relative p-12">
              <button 
                onClick={onClose}
                className="absolute top-8 right-8 size-10 flex items-center justify-center bg-white/5 border border-white/5 hover:border-white/10 rounded-xl text-lectra-muted hover:text-white transition-all group"
              >
                <X className="size-5 group-hover:rotate-90 transition-transform" />
              </button>

              <div className="text-center mb-12">
                <div className="size-20 bg-lectra-primary rounded-[1.75rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-lectra-primary/30 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent" />
                  <Zap className="size-10 text-white relative z-10 group-hover:scale-110 transition-transform" />
                </div>
                <h2 className="text-4xl font-black text-lectra-text font-outfit uppercase tracking-tighter leading-none mb-4">
                  {isLogin ? 'Neural Re-Entry' : 'System Genesis'}
                </h2>
                <p className="text-lectra-muted text-sm font-medium tracking-wide">
                  {isLogin ? 'Synchronize your credentials to continue' : 'Initiate your neural profile within Lectra'}
                </p>
              </div>

              {!isLogin && (
                <div className="grid grid-cols-2 gap-4 mb-10">
                  <button
                    type="button"
                    onClick={() => setRole('student')}
                    className={cn(
                      "flex flex-col items-center gap-3 p-6 rounded-[2rem] border-2 transition-all relative overflow-hidden group/btn",
                      role === 'student' 
                        ? 'border-lectra-primary bg-lectra-primary/10 text-lectra-primary shadow-lg shadow-lectra-primary/10' 
                        : 'border-lectra-border bg-lectra-background text-lectra-muted hover:border-lectra-primary/40'
                    )}
                  >
                    <GraduationCap className={cn("size-6 group-hover/btn:scale-110 transition-transform", role === 'student' && "animate-bounce")} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Student Mod</span>
                    {role === 'student' && <div className="absolute top-2 right-2 size-2 bg-lectra-primary rounded-full animate-pulse" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('teacher')}
                    className={cn(
                      "flex flex-col items-center gap-3 p-6 rounded-[2rem] border-2 transition-all relative overflow-hidden group/btn",
                      role === 'teacher' 
                        ? 'border-lectra-primary bg-lectra-primary/10 text-lectra-primary shadow-lg shadow-lectra-primary/10' 
                        : 'border-lectra-border bg-lectra-background text-lectra-muted hover:border-lectra-primary/40'
                    )}
                  >
                    <School className={cn("size-6 group-hover/btn:scale-110 transition-transform", role === 'teacher' && "animate-pulse")} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Instructor Mod</span>
                    {role === 'teacher' && <div className="absolute top-2 right-2 size-2 bg-lectra-primary rounded-full animate-pulse" />}
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {!isLogin && (
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-lectra-muted ml-4 tracking-[0.3em]">Neural Identifier</label>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-lectra-primary/5 rounded-2xl opacity-0 group-focus-within:opacity-100 blur transition-opacity" />
                      <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-800 size-5 relative z-10" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required={!isLogin}
                        className="w-full bg-lectra-background border border-lectra-border focus:border-lectra-primary rounded-2xl py-5 pl-16 pr-6 text-sm text-white focus:ring-0 transition-all font-medium relative z-10"
                        placeholder="e.g. Alan Turing"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-lectra-muted ml-4 tracking-[0.3em]">Access Stream (Email)</label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-lectra-primary/5 rounded-2xl opacity-0 group-focus-within:opacity-100 blur transition-opacity" />
                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-800 size-5 relative z-10" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full bg-lectra-background border border-lectra-border focus:border-lectra-primary rounded-2xl py-5 pl-16 pr-6 text-sm text-white focus:ring-0 transition-all font-medium relative z-10"
                      placeholder="identity@lectra.io"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-lectra-muted ml-4 tracking-[0.3em]">Security Matrix (Password)</label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-lectra-primary/5 rounded-2xl opacity-0 group-focus-within:opacity-100 blur transition-opacity" />
                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-800 size-5 relative z-10" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full bg-lectra-background border border-lectra-border focus:border-lectra-primary rounded-2xl py-5 pl-16 pr-6 text-sm text-white focus:ring-0 transition-all font-medium relative z-10"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="flex items-center gap-3 p-4 bg-lectra-danger/10 border border-lectra-danger/20 rounded-2xl"
                  >
                    <ShieldCheck className="size-4 text-lectra-danger shrink-0" />
                    <p className="text-lectra-danger text-[11px] font-black uppercase tracking-widest">{error}</p>
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-lectra-primary hover:bg-lectra-primaryHover text-white font-black uppercase tracking-[0.3em] text-[11px] py-5 rounded-2xl shadow-xl shadow-lectra-primary/20 transition-all flex items-center justify-center gap-3 mt-4 active:scale-95 disabled:opacity-50 group/submit"
                >
                  {loading ? (
                    <Loader2 className="animate-spin size-5" />
                  ) : (
                    <>
                      {isLogin ? 'Initiate Sync' : 'Initialize Profile'}
                      <Sparkles className="size-4 group-hover/submit:scale-110 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-10 flex items-center justify-center gap-4">
                <div className="h-px flex-1 bg-lectra-border opacity-50" />
                <p className="text-lectra-muted text-[10px] font-black uppercase tracking-[0.3em] text-center whitespace-nowrap">
                  {isLogin ? "New to the grid?" : "Already synchronized?"}{' '}
                  <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-lectra-primary hover:text-lectra-accent transition-colors ml-2"
                  >
                    {isLogin ? 'Sign Up' : 'Log In'}
                  </button>
                </p>
                <div className="h-px flex-1 bg-lectra-border opacity-50" />
              </div>
            </div>
            
            <div className="bg-lectra-background px-12 py-6 border-t border-lectra-border flex justify-between items-center opacity-40">
               <p className="text-[8px] font-black uppercase tracking-[0.5em] text-lectra-muted">Encrypted Stream Layer 12</p>
               <p className="text-[8px] font-black uppercase tracking-[0.5em] text-lectra-muted">Nexus Protocol v8.0</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
