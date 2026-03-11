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
  Share2 
} from 'lucide-react';
import { cn } from './lib/utils';

export default function LandingPage({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-primary/10 bg-background-dark/80 backdrop-blur-md px-6 md:px-10 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="bg-primary p-1.5 rounded-lg">
              <School className="text-white size-6" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-100">
              Nexus<span className="text-primary">Classroom</span>
            </h2>
          </div>
          <nav className="hidden md:flex items-center gap-10">
            {['Features', 'Solutions', 'Testimonials', 'Pricing'].map((item) => (
              <a key={item} href="#" className="text-sm font-medium hover:text-primary transition-colors text-slate-300">
                {item}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <button className="hidden sm:block text-sm font-semibold hover:text-primary transition-colors text-slate-100">
              Log In
            </button>
            <button 
              onClick={onGetStarted}
              className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-primary/20 transition-all"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 px-6 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-primary/10 via-transparent to-transparent -z-10" />
          <div className="absolute -top-[10%] -right-[10%] w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full" />
          <div className="absolute -bottom-[10%] -left-[10%] w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full" />
          
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col gap-8"
            >
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full w-fit">
                <Sparkles className="text-primary size-4" />
                <span className="text-xs font-bold uppercase tracking-widest text-primary">Now with AI Insights</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black leading-tight text-slate-100">
                The Future of <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-400">Learning</span> is Here.
              </h1>
              <p className="text-lg md:text-xl text-slate-400 leading-relaxed max-w-xl">
                Experience a high-end virtual classroom powered by AI insights and seamless collaboration. Designed for the next generation of global educators.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button 
                  onClick={onGetStarted}
                  className="bg-primary hover:bg-primary/90 text-white px-10 py-4 rounded-xl text-lg font-bold shadow-2xl shadow-primary/30 flex items-center justify-center gap-2 group"
                >
                  Start for Free
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="bg-slate-800 hover:bg-slate-700 text-white px-10 py-4 rounded-xl text-lg font-bold border border-slate-700 transition-all flex items-center justify-center gap-2">
                  Book a Demo
                </button>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative group"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-indigo-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000" />
              <div className="relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="flex items-center gap-2 px-4 py-3 bg-slate-800/50 border-b border-slate-800">
                  <div className="flex gap-1.5">
                    <div className="size-3 rounded-full bg-red-500/50" />
                    <div className="size-3 rounded-full bg-amber-500/50" />
                    <div className="size-3 rounded-full bg-emerald-500/50" />
                  </div>
                  <div className="mx-auto text-[10px] text-slate-500 font-mono">nexus-classroom.app/session/bio-101</div>
                </div>
                <img 
                  className="w-full h-auto object-cover aspect-video opacity-90 group-hover:scale-105 transition-transform duration-700" 
                  src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop" 
                  alt="Virtual Classroom"
                  referrerPolicy="no-referrer"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 px-6 bg-slate-900/50">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col items-center text-center gap-4 mb-20">
              <h2 className="text-3xl md:text-5xl font-bold text-slate-100 tracking-tight">Redefining Digital Education</h2>
              <p className="text-slate-400 max-w-2xl text-lg">Powerful tools designed to make remote learning feel natural and intuitive for both teachers and students.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: Sparkles, title: 'AI Insights', desc: 'Real-time engagement analytics and automated summaries that identify where students need help most.' },
                { icon: Video, title: 'Seamless Video', desc: 'Crystal clear 4K streaming with proprietary zero-latency tech. Never let a lag spike break the learning flow.' },
                { icon: PenTool, title: 'Collaborative Canvas', desc: 'Infinite interactive whiteboard for real-time brainstorming, sketching, and complex problem-solving.' }
              ].map((feature, i) => (
                <motion.div 
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="group p-8 rounded-2xl bg-background-dark border border-slate-800 hover:border-primary/50 transition-all duration-300 hover:-translate-y-2"
                >
                  <div className="size-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary transition-colors">
                    <feature.icon className="text-primary group-hover:text-white size-7" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-100 mb-3">{feature.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 px-6 overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <h2 className="text-4xl font-bold text-slate-100 leading-tight">Join thousands of educators scaling their impact.</h2>
                <div className="flex flex-col gap-10">
                  {[
                    { 
                      name: 'Sarah Jenkins', 
                      role: 'Lead Instructor, EduGlobal', 
                      quote: 'Nexus has completely transformed how I engage with my students. The AI insights are a genuine game changer for lesson planning.',
                      img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1974&auto=format&fit=crop'
                    },
                    { 
                      name: 'Dr. Marcus Chen', 
                      role: 'Professor, Stamford University', 
                      quote: "The most stable and visually stunning platform we've ever used for our global seminars. Our attendance retention has increased by 40%.",
                      img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2070&auto=format&fit=crop'
                    }
                  ].map((t) => (
                    <div key={t.name} className="flex flex-col gap-4">
                      <div className="flex gap-1 text-primary">
                        {[...Array(5)].map((_, i) => <Star key={i} className="size-5 fill-current" />)}
                      </div>
                      <p className="text-xl text-slate-300 italic">"{t.quote}"</p>
                      <div className="flex items-center gap-4">
                        <img className="size-12 rounded-full border-2 border-primary/20 object-cover" src={t.img} alt={t.name} referrerPolicy="no-referrer" />
                        <div>
                          <p className="font-bold text-slate-100 text-lg">{t.name}</p>
                          <p className="text-slate-500 text-sm">{t.role}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative flex justify-center lg:justify-end">
                <div className="relative w-full max-w-md aspect-square bg-gradient-to-tr from-primary/30 to-indigo-600/30 rounded-3xl p-8 border border-white/10">
                  <div className="absolute inset-0 bg-background-dark/20 backdrop-blur-sm rounded-3xl" />
                  <div className="relative h-full flex flex-col justify-center items-center text-center gap-6">
                    <div className="size-24 rounded-full bg-primary flex items-center justify-center text-white shadow-2xl shadow-primary/50">
                      <TrendingUp className="size-12" />
                    </div>
                    <div className="space-y-2">
                      <div className="text-5xl font-black text-white">98%</div>
                      <p className="text-slate-400 font-medium uppercase tracking-widest text-sm">Student Engagement Rate</p>
                    </div>
                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div className="w-[98%] h-full bg-primary" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 px-6">
          <div className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-br from-primary to-indigo-700 p-12 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-primary/20">
            <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,1),rgba(255,255,255,0))]" />
            <div className="relative z-10 flex flex-col items-center gap-8">
              <h2 className="text-4xl md:text-6xl font-black text-white leading-tight">Ready to transform your classroom?</h2>
              <p className="text-white/80 text-lg md:text-xl max-w-2xl font-medium">
                Join the education revolution today. Scale your teaching and provide an unparalleled experience for your students.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button 
                  onClick={onGetStarted}
                  className="bg-white text-primary hover:bg-slate-100 px-12 py-5 rounded-2xl text-xl font-black transition-all shadow-xl"
                >
                  Get Started for Free
                </button>
                <button className="bg-primary-dark/20 border border-white/30 text-white hover:bg-white/10 px-12 py-5 rounded-2xl text-xl font-bold transition-all">
                  Contact Sales
                </button>
              </div>
              <p className="text-white/60 text-sm font-medium">No credit card required • 14-day free trial</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12">
          <div className="col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-primary p-1 rounded-lg">
                <School className="text-white size-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-100">Nexus Classroom</h2>
            </div>
            <p className="text-slate-500 max-w-xs mb-8">
              Elevating the digital learning experience through advanced AI and crystal-clear communication.
            </p>
            <div className="flex gap-4">
              {[Globe, Mail, Share2].map((Icon, i) => (
                <a key={i} className="size-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary transition-colors text-slate-400 hover:text-white" href="#">
                  <Icon className="size-5" />
                </a>
              ))}
            </div>
          </div>
          {[
            { title: 'Product', links: ['Features', 'Integrations', 'Enterprise', 'Solutions'] },
            { title: 'Company', links: ['About Us', 'Careers', 'Blog', 'Contact'] },
            { title: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy'] }
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-slate-100 font-bold mb-6">{col.title}</h4>
              <ul className="space-y-4 text-slate-500 text-sm">
                {col.links.map((link) => (
                  <li key={link}><a className="hover:text-primary transition-colors" href="#">{link}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="max-w-7xl mx-auto pt-16 mt-16 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-600 text-xs font-medium uppercase tracking-widest">
          <p>© 2024 Nexus Classroom Inc. All rights reserved.</p>
          <div className="flex gap-8">
            <span>Designed with Excellence</span>
            <span>Powered by AI</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
