import React from 'react';
import { motion } from 'motion/react';
import {
  School,
  ArrowRight,
  Sparkles,
  Video,
  PenTool,
  Star,
  TrendingUp,
  Globe,
  Mail,
  Share2,
  Zap,
  Activity,
  Brain,
  Shield,
  Layers
} from 'lucide-react';
import { cn } from './lib/utils';

export default function LandingPage({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <div className="min-h-screen bg-lectra-background text-lectra-text font-outfit selection:bg-lectra-primary/30">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-lectra-border/50 bg-lectra-background/80 backdrop-blur-xl px-6 md:px-10 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="bg-lectra-primary p-2 rounded-xl shadow-lg shadow-lectra-primary/20 transition-transform group-hover:scale-110">
              <School className="text-white size-6" />
            </div>
            <h2 className="text-xl font-black tracking-tighter uppercase">
              Lectra<span className="text-lectra-primary"></span>
            </h2>
          </div>
          <nav className="hidden md:flex items-center gap-10">
            {['Features', 'AI Insights', 'Security', 'Enterprise'].map((item) => (
              <a key={item} href="#" className="text-[10px] font-black uppercase tracking-[0.2em] hover:text-lectra-primary transition-all text-lectra-muted">
                {item}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-6">
            <button className="hidden sm:block text-[10px] font-black uppercase tracking-widest hover:text-lectra-primary transition-colors text-lectra-text">
              Log In
            </button>
            <button
              onClick={onGetStarted}
              className="bg-lectra-primary hover:bg-lectra-primaryHover text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-lectra-primary/20 transition-all hover:-translate-y-0.5"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative pt-24 pb-40 px-6 overflow-hidden">
          {/* Ambient Background Elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-[radial-gradient(circle_at_50%_0%,rgba(79,70,229,0.15),transparent_70%)] -z-10" />
          <div className="absolute top-[20%] right-[-10%] size-[600px] bg-lectra-primary/10 blur-[140px] rounded-full -z-10 animate-pulse-slow" />
          <div className="absolute bottom-[-10%] left-[-10%] size-[600px] bg-lectra-accent/10 blur-[140px] rounded-full -z-10 animate-pulse-slow" />

          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex flex-col gap-10"
            >
              <div className="inline-flex items-center gap-3 bg-lectra-primary/10 border border-lectra-primary/20 px-6 py-2 rounded-full w-fit">
                <div className="size-2 bg-lectra-primary rounded-full animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-lectra-primary">Advanced Learning Analytics Active</span>
              </div>
              <h1 className="text-6xl md:text-8xl font-black leading-[0.9] tracking-tighter uppercase italic">
                Elevate <span className="text-transparent bg-clip-text bg-gradient-to-r from-lectra-primary via-lectra-accent to-indigo-400">Learning</span> <br />
                Without Limits.
              </h1>
              <p className="text-lg md:text-xl text-lectra-muted leading-relaxed max-w-xl font-medium">
                Experience the next evolution of virtual education. A high-performance classroom platform engineered with AI analytics and seamless collaboration.
              </p>
              <div className="flex flex-col sm:flex-row gap-5 pt-4">
                <button
                  onClick={onGetStarted}
                  className="bg-lectra-primary hover:bg-lectra-primaryHover text-white px-12 py-5 rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-lectra-primary/30 flex items-center justify-center gap-3 group transition-all hover:scale-105 active:scale-95"
                >
                  Join Classroom
                  <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="bg-lectra-card hover:bg-lectra-sidebar text-lectra-text px-12 py-5 rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] border border-lectra-border transition-all flex items-center justify-center gap-3 hover:border-lectra-primary/50 shadow-xl">
                  Watch Demo
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative group"
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-lectra-primary to-lectra-accent rounded-[3rem] blur-2xl opacity-10 group-hover:opacity-20 transition duration-1000" />
              <div className="relative bg-lectra-sidebar border border-lectra-border rounded-[2.5rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.5)]">
                <div className="flex items-center gap-3 px-6 py-4 bg-lectra-card/80 border-b border-lectra-border/50 backdrop-blur-md">
                  <div className="flex gap-2">
                    <div className="size-3 rounded-full bg-lectra-danger/30" />
                    <div className="size-3 rounded-full bg-lectra-warning/30" />
                    <div className="size-3 rounded-full bg-lectra-success/30" />
                  </div>
                  <div className="mx-auto text-[9px] text-lectra-muted font-bold tracking-[0.2em] uppercase">Lectra-classroom.app/session/bio-101</div>
                </div>
                <div className="relative aspect-video">
                  <img
                    className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-[2s] ease-out"
                    src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop"
                    alt="Education Platform"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-lectra-background via-transparent to-transparent opacity-60" />
                  <div className="absolute bottom-8 left-8 flex items-center gap-3">
                    <div className="size-12 bg-lectra-primary/20 backdrop-blur-md rounded-xl border border-lectra-primary/30 flex items-center justify-center text-lectra-primary">
                      <Activity className="size-6 animate-pulse" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-white uppercase tracking-widest">Live Session Active</p>
                      <p className="text-[9px] text-white/60 font-medium uppercase tracking-widest">High Student Engagement</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-32 px-6 relative bg-lectra-sidebar/40">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col items-center text-center gap-6 mb-24">
              <div className="size-16 bg-lectra-primary/10 rounded-2xl flex items-center justify-center text-lectra-primary border border-lectra-primary/10">
                <Layers className="size-8" />
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-lectra-text tracking-tighter uppercase italic">Platform Core Features</h2>
              <p className="text-lectra-muted max-w-2xl text-lg font-medium leading-relaxed">Engineered for precision in teaching and collaboration.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-10">
              {[
                { icon: Brain, title: 'AI Analytics', desc: 'Automated lesson summaries and student engagement tracking during live classes.', color: 'lectra-primary' },
                { icon: Zap, title: 'Real-time Sync', desc: 'Fast, reliable communication across globally distributed classroom environments.', color: 'lectra-accent' },
                { icon: PenTool, title: 'Interactive Canvas', desc: 'Advanced whiteboard for real-time sketching, brainstorming, and student participation.', color: 'lectra-success' }
              ].map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                  className="group p-10 rounded-[3rem] bg-lectra-card border border-lectra-border hover:border-lectra-primary transition-all duration-500 hover:-translate-y-3 shadow-2xl"
                >
                  <div className={cn("size-16 rounded-2xl flex items-center justify-center mb-8 bg-black/20 group-hover:scale-110 transition-transform")}>
                    <feature.icon className="text-lectra-primary size-8" />
                  </div>
                  <h3 className="text-xl font-black text-lectra-text mb-4 uppercase tracking-tight">{feature.title}</h3>
                  <p className="text-lectra-muted leading-relaxed font-medium">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Engagement Metric */}
        <section className="py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <div className="space-y-12">
                <h2 className="text-5xl font-black text-lectra-text leading-none uppercase italic tracking-tighter">Empowering thousands of global classrooms.</h2>
                <div className="space-y-10">
                  {[
                    {
                      name: 'Professor Elena Vance',
                      role: 'Computer Science, MIT',
                      quote: 'Lectra is not just a tool; it’s an extension of the teacher’s experience. The AI insights help me support students more effectively.',
                      img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1976&auto=format&fit=crop'
                    },
                    {
                      name: 'Julian Sterling',
                      role: 'Director of Education, V-Tech',
                      quote: "The interface design alone boosted our student's voluntary participation by nearly 60%. It feels like the modern classroom.",
                      img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop'
                    }
                  ].map((t) => (
                    <div key={t.name} className="flex gap-8 items-start group">
                      <img className="size-16 rounded-2xl border-2 border-lectra-border object-cover group-hover:border-lectra-primary transition-all shadow-xl" src={t.img} alt={t.name} referrerPolicy="no-referrer" />
                      <div className="space-y-3">
                        <p className="text-lg text-lectra-text font-medium italic">"{t.quote}"</p>
                        <div>
                          <p className="font-black text-lectra-primary text-sm uppercase tracking-widest">{t.name}</p>
                          <p className="text-lectra-muted text-[10px] font-black uppercase tracking-widest mt-1">{t.role}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="relative w-full max-w-lg aspect-[4/5] bg-lectra-card rounded-[4rem] p-12 border border-lectra-border shadow-3xl overflow-hidden group">
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-lectra-primary/10 to-transparent" />
                  <div className="relative h-full flex flex-col justify-center items-center text-center gap-10">
                    <div className="size-32 rounded-3xl bg-lectra-primary/10 border border-lectra-primary/20 flex items-center justify-center text-lectra-primary shadow-2xl group-hover:scale-110 transition-transform duration-700">
                      <TrendingUp className="size-16" />
                    </div>
                    <div>
                      <div className="text-8xl font-black text-white italic tracking-tighter">98.2%</div>
                      <p className="text-lectra-muted font-black uppercase tracking-[0.3em] text-xs mt-4">Average Engagement Rate</p>
                    </div>
                    <div className="w-full space-y-4">
                      <div className="w-full h-1.5 bg-lectra-background rounded-full overflow-hidden border border-lectra-border">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: '98.2%' }}
                          className="h-full bg-lectra-primary shadow-[0_0_15px_rgba(79,70,229,0.5)]"
                        />
                      </div>
                      <div className="flex justify-between text-[10px] font-black text-lectra-muted uppercase tracking-widest">
                        <span>Min Threshold</span>
                        <span>Platform Peak</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Global CTA */}
        <section className="py-40 px-6">
          <div className="max-w-6xl mx-auto rounded-[4rem] bg-gradient-to-br from-lectra-primary via-lectra-accent to-indigo-900 p-16 md:p-24 text-center relative overflow-hidden shadow-[0_60px_120px_rgba(79,70,229,0.25)] group">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]" />

            <div className="relative z-10 flex flex-col items-center gap-10">
              <div className="size-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white border border-white/20">
                <Shield className="size-10" />
              </div>
              <h2 className="text-5xl md:text-7xl font-black text-white leading-[0.9] tracking-tighter uppercase italic">Ready to transform Your <br /> Classroom?</h2>
              <p className="text-white/80 text-lg md:text-xl max-w-2xl font-medium">
                Experience the power of advanced digital teaching. Join the platform today.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 pt-8">
                <button
                  onClick={onGetStarted}
                  className="bg-white text-lectra-primary hover:bg-slate-100 px-16 py-6 rounded-[2rem] text-sm font-black uppercase tracking-widest transition-all shadow-2xl hover:scale-105 active:scale-95"
                >
                  Get Started
                </button>
                <button className="bg-black/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/10 px-16 py-6 rounded-[2rem] text-sm font-black uppercase tracking-widest transition-all">
                  Contact Sales
                </button>
              </div>
              <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.3em]">No Credit Card Required • Academic Grade Security</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-lectra-sidebar border-t border-lectra-border py-24 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-16 relative">
          <div className="col-span-2 lg:col-span-2 space-y-10">
            <div className="flex items-center gap-3">
              <div className="bg-lectra-primary p-2 rounded-xl">
                <School className="text-white size-6" />
              </div>
              <h2 className="text-2xl font-black text-lectra-text tracking-tighter uppercase">Lectra</h2>
            </div>
            <p className="text-lectra-muted max-w-sm font-medium leading-relaxed">
              Elevating the digital learning landscape through AI-powered insights and seamless remote communication.
            </p>
            <div className="flex gap-4">
              {[Globe, Mail, Share2].map((Icon, i) => (
                <a key={i} className="size-12 rounded-2xl bg-lectra-card flex items-center justify-center hover:bg-lectra-primary transition-all text-lectra-muted hover:text-white border border-lectra-border hover:border-lectra-primary shadow-xl" href="#">
                  <Icon className="size-5" />
                </a>
              ))}
            </div>
          </div>
          {[
            { title: 'Product', links: ['AI Insights', 'Live Classes', 'Security', 'Features'] },
            { title: 'Company', links: ['About', 'Careers', 'Blog', 'Contact'] },
            { title: 'Legal', links: ['Privacy Policy', 'Terms', 'Data Protection'] }
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-lectra-text mb-10">{col.title}</h4>
              <ul className="space-y-5 text-lectra-muted text-xs font-bold uppercase tracking-widest">
                {col.links.map((link) => (
                  <li key={link}><a className="hover:text-lectra-primary transition-all inline-block hover:translate-x-1" href="#">{link}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="max-w-7xl mx-auto pt-20 mt-20 border-t border-lectra-border flex flex-col md:flex-row justify-between items-center gap-8 text-[9px] font-black uppercase tracking-[0.4em] text-lectra-muted/40 text-center">
          <p>© 2026 Lectra Classroom. All rights reserved.</p>
          <div className="flex gap-10">
            <span>Designed for Education</span>
            <span>Secure & Encrypted</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
