import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, FileText, Bell, ChevronLeft, Users, Video, Calendar, Settings } from 'lucide-react';
import { Course } from './MyClassesView';

interface CourseWorkspaceProps {
  course: Course;
  onBack: () => void;
}

export default function CourseWorkspace({ course, onBack }: CourseWorkspaceProps) {
  const [activeTab, setActiveTab] = React.useState<'Materials' | 'Assignments' | 'Announcements'>('Materials');

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50/5 relative">
      {/* Course Header */}
      <div className={`pt-12 pb-8 px-8 relative overflow-hidden bg-gradient-to-r ${course.color || 'from-primary to-purple-600'}`}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20" />
        
        <div className="relative z-10">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-white/80 hover:text-white text-sm font-semibold mb-6 transition-colors"
          >
            <ChevronLeft className="size-4" />
            Back to Classes
          </button>
          
          <div className="flex justify-between items-end">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-black tracking-widest text-white uppercase shadow-sm">
                  {course.code}
                </span>
                {course.isLive && (
                  <span className="px-3 py-1 bg-red-500/20 backdrop-blur-md text-red-500 rounded-full text-xs font-black tracking-widest uppercase border border-red-500/50 flex items-center gap-2 shadow-sm shadow-red-500/20">
                    <span className="relative flex size-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full size-2 bg-red-500"></span>
                    </span>
                    Live Now
                  </span>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight drop-shadow-md">
                {course.name}
              </h1>
              <p className="text-white/80 font-medium mt-2 flex items-center gap-2">
                <Users className="size-4" />
                Instructor: {course.instructor}
              </p>
            </div>
            
            {course.isLive && (
              <button className="hidden md:flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all shadow-xl shadow-red-500/20">
                <Video className="size-5" />
                Join Lecture
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-8 border-b border-white/5 bg-slate-900/50 backdrop-blur-xl">
        <div className="flex gap-8">
          {(['Materials', 'Assignments', 'Announcements'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 text-sm font-bold relative transition-colors ${
                activeTab === tab ? 'text-primary' : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div 
                  layoutId="tabIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full shadow-[0_-2px_8px_rgba(99,102,241,0.5)]"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Workspace Content */}
      <div className="flex-1 overflow-y-auto p-8 hide-scrollbar">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {activeTab === 'Materials' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-bold flex items-center gap-2">
                    <BookOpen className="text-primary size-6" /> Course Materials
                  </h3>
                  <button className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-sm font-bold hover:bg-slate-700 transition-colors">
                    Filter by Unit
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Dummy Materials */}
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="group p-5 bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-white/5 hover:border-primary/30 hover:bg-slate-900 transition-all cursor-pointer">
                      <div className="size-12 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-500 group-hover:text-white transition-all">
                        <FileText className="size-6" />
                      </div>
                      <h4 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">Lecture {i}: Core Concepts</h4>
                      <p className="text-sm text-slate-400 mb-4 line-clamp-2">Understanding the foundational principles of the subject matter covered in this module.</p>
                      <div className="flex justify-between items-center text-xs text-slate-500">
                        <span>PDF • 2.4 MB</span>
                        <span>Added 2 days ago</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'Assignments' && (
              <div className="space-y-6 flex flex-col h-full">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-bold flex items-center gap-2">
                    <FileText className="text-orange-500 size-6" /> Assignments
                  </h3>
                </div>
                
                <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-slate-900/30 rounded-3xl border border-white/5 border-dashed">
                  <FileText className="size-16 text-slate-700 mb-4" />
                  <h4 className="text-xl font-bold text-slate-300 mb-2">No pending assignments</h4>
                  <p className="text-sm text-slate-500">You're all caught up! Check back later for new tasks.</p>
                </div>
              </div>
            )}

            {activeTab === 'Announcements' && (
              <div className="max-w-3xl mx-auto space-y-6 pt-4">
                <div className="p-6 bg-slate-900/80 rounded-3xl border border-primary/20 shadow-lg shadow-primary/5">
                  <div className="flex gap-4">
                    <div className="size-12 bg-primary/20 text-primary rounded-full flex items-center justify-center shrink-0">
                      <Bell className="size-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-lg">Midterm Exam Schedule Available</h4>
                        <span className="px-2 py-0.5 bg-primary/20 text-primary text-[10px] font-black uppercase rounded-full">New</span>
                      </div>
                      <span className="text-xs text-slate-400 font-medium block mb-3">Posted by {course.instructor} • 2 hours ago</span>
                      <p className="text-slate-300 text-sm leading-relaxed">
                        Please check the course schedule for the upcoming midterm exam details. The exam will cover materials from Week 1 to Week 5. Make sure you have your student ID ready for verification.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
