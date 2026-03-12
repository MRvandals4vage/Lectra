import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, BookOpen, Clock, CheckCircle, ChevronRight, User, AlertCircle, PlayCircle, FileText, CheckSquare, Settings } from 'lucide-react';
import { cn } from '../lib/utils';

export interface Course {
  id: string;
  name: string;
  code: string;
  instructor: string;
  progress: number;
  pending: number;
  submitted: number;
  graded: number;
  completed: boolean;
  isLive: boolean;
  schedule?: string;
  color?: string;
}

interface MyClassesViewProps {
  classes: Course[];
  handleViewCourse: (course: Course) => void;
}

export default function MyClassesView({ classes, handleViewCourse }: MyClassesViewProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'ongoing' | 'completed'>('ongoing');

  const filteredClasses = classes
    .filter(c => 
      c.name.toLowerCase().includes(search.toLowerCase()) || 
      c.code.toLowerCase().includes(search.toLowerCase())
    )
    .filter(c => {
      if (filter === 'ongoing') return !c.completed;
      if (filter === 'completed') return c.completed;
      return true;
    });

  // Mock data if no classes exist yet to demonstrate the design
  const displayClasses = filteredClasses.length > 0 ? filteredClasses : [
    {
      id: '1',
      name: 'Advanced Physics: Quantum Mechanics',
      code: 'PHY-401',
      instructor: 'Dr. Sarah Jenkins',
      progress: 65,
      pending: 2,
      submitted: 4,
      graded: 3,
      completed: false,
      isLive: true,
      color: 'from-blue-600 to-indigo-600',
      schedule: 'Mon, Wed 10:00 AM'
    },
    {
      id: '2',
      name: 'Data Structures & Algorithms',
      code: 'CS-201',
      instructor: 'Prof. Alan Turing',
      progress: 88,
      pending: 0,
      submitted: 8,
      graded: 8,
      completed: false,
      isLive: false,
      color: 'from-emerald-500 to-teal-600',
      schedule: 'Tue, Thu 2:00 PM'
    },
    {
      id: '3',
      name: 'Modern World History',
      code: 'HIS-101',
      instructor: 'Dr. Emily Carter',
      progress: 100,
      pending: 0,
      submitted: 12,
      graded: 12,
      completed: true,
      isLive: false,
      color: 'from-amber-500 to-orange-600',
      schedule: 'Completed'
    },
    {
      id: '4',
      name: 'Differential Equations',
      code: 'MAT-301',
      instructor: 'Prof. John Nash',
      progress: 24,
      pending: 3,
      submitted: 1,
      graded: 0,
      completed: false,
      isLive: false,
      color: 'from-purple-500 to-pink-600',
      schedule: 'Fri 9:00 AM'
    }
  ].filter(c => {
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.code.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === 'ongoing' && c.completed) return false;
    if (filter === 'completed' && !c.completed) return false;
    return true;
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50/5 relative">
      <div className="px-8 pt-8 pb-4 flex flex-col md:flex-row md:items-end justify-between gap-6 z-10 relative">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-primary/20 text-primary rounded-xl backdrop-blur-md">
              <BookOpen className="size-6" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white">My Classes</h1>
          </div>
          <p className="text-slate-400 mt-1 max-w-xl text-sm">
            Manage your academic journey. Access workspaces, track progress, and join live lectures instantly.
          </p>
        </div>

        {/* Smart Filtering & Search */}
        <div className="flex flex-col gap-4 w-full md:w-auto animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by name or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-[280px] bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-full py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-slate-500 text-white"
            />
          </div>
          <div className="flex bg-slate-900/80 p-1.5 rounded-full border border-white/10 backdrop-blur-xl">
            {(['all', 'ongoing', 'completed'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-bold capitalize transition-all",
                  filter === tab 
                    ? "bg-primary text-white shadow-lg shadow-primary/30" 
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 pb-12 pt-4 hide-scrollbar">
        {displayClasses.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center animate-in fade-in">
            <div className="size-16 bg-slate-900 border border-white/5 rounded-2xl flex items-center justify-center mb-4 text-slate-600">
               <Search className="size-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-300">No classes found</h3>
            <p className="text-slate-500 text-sm mt-2">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {displayClasses.map((course, idx) => (
                <motion.div
                  key={course.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className="group relative"
                >
                  {/* Glowing hover effect */}
                  <div className={cn(
                     "absolute -inset-0.5 rounded-[2rem] blur opacity-0 group-hover:opacity-40 transition duration-500 bg-gradient-to-br",
                     course.color || "from-primary to-purple-600"
                  )} />
                  
                  {/* Card Content */}
                  <div className="relative h-full bg-slate-900/90 backdrop-blur-xl border border-white/10 p-6 rounded-3xl flex flex-col hover:-translate-y-1 transition-transform duration-300 shadow-xl overflow-hidden">
                    
                    {/* Live Badge */}
                    <div className="flex justify-between items-start mb-6">
                      <div className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border",
                        course.isLive 
                          ? "bg-red-500/10 border-red-500/20 text-red-500 flex items-center gap-2"
                          : course.completed
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                            : "bg-slate-800 border-white/5 text-slate-400"
                      )}>
                        {course.isLive && (
                          <span className="relative flex size-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full size-2 bg-red-500"></span>
                          </span>
                        )}
                        {course.isLive ? 'Live Now' : course.completed ? 'Completed' : 'Upcoming'}
                      </div>
                      
                      <div className="px-2 py-1 bg-white/5 rounded-lg border border-white/5 text-xs font-mono font-medium text-slate-400">
                        {course.code}
                      </div>
                    </div>

                    {/* Course Info */}
                    <div className="mb-6 flex-1">
                      <h2 className="text-xl font-bold text-white mb-2 leading-tight group-hover:text-primary transition-colors">
                        {course.name}
                      </h2>
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <User className="size-4" />
                          {course.instructor}
                        </span>
                        {!course.completed && (
                          <span className="flex items-center gap-1.5">
                            <Clock className="size-4" />
                            {course.schedule}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-6">
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Course Progress</span>
                        <span className="text-sm font-black text-white">{course.progress}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-white/5">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${course.progress}%` }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                          className={cn(
                            "h-full rounded-full bg-gradient-to-r",
                            course.color || "from-primary to-purple-500"
                          )}
                        />
                      </div>
                    </div>

                    {/* Bottom Stats & Action */}
                    <div className="flex items-center justify-between gap-4 mt-auto pt-6 border-t border-white/5">
                      <div className="flex gap-4">
                        <div className="flex flex-col items-start" title="Pending Assignments">
                          <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase">
                            <AlertCircle className="size-3 text-orange-400" /> Pending
                          </span>
                          <span className="text-sm font-bold text-white">{course.pending}</span>
                        </div>
                        <div className="flex flex-col items-start" title="Submitted Assignments">
                          <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase">
                            <CheckSquare className="size-3 text-blue-400" /> Submitted
                          </span>
                          <span className="text-sm font-bold text-white">{course.submitted}</span>
                        </div>
                        <div className="flex flex-col items-start" title="Graded Assignments">
                          <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase">
                            <CheckCircle className="size-3 text-emerald-400" /> Graded
                          </span>
                          <span className="text-sm font-bold text-white">{course.graded}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleViewCourse(course)}
                        className={cn(
                          "flex items-center justify-center size-10 rounded-xl transition-all font-bold group/btn",
                          course.isLive 
                            ? "bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/30"
                            : "bg-primary text-white hover:brightness-110 shadow-lg shadow-primary/20"
                        )}
                      >
                        {course.isLive ? <PlayCircle className="size-5" /> : <ChevronRight className="size-5 group-hover/btn:translate-x-0.5 transition-transform" />}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}