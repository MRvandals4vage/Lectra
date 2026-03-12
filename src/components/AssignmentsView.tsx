import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, FileText, Clock, AlertCircle, CheckCircle, ChevronRight, User, BookOpen, AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';

export interface Assignment {
  id: string;
  courseId: string;
  name: string;
  courseName: string;
  instructor: string;
  assignedDate: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded';
}

interface AssignmentsViewProps {
  assignments: Assignment[];
  handleOpenAssignment: (courseId: string, assignmentId: string) => void;
}

export default function AssignmentsView({ assignments, handleOpenAssignment }: AssignmentsViewProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'submitted' | 'graded'>('all');

  // Helper functions for dates
  const parseDate = (dateStr: string) => new Date(dateStr);
  const now = new Date();
  
  const getDaysDiff = (targetDate: Date) => {
    const diffTime = targetDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const isOverdue = (dueDateStr: string, status: string) => {
    if (status !== 'pending') return false;
    const dueDate = parseDate(dueDateStr);
    return dueDate < now;
  };

  const isDueSoon = (dueDateStr: string, status: string) => {
    if (status !== 'pending') return false;
    const dueDate = parseDate(dueDateStr);
    const days = getDaysDiff(dueDate);
    return days >= 0 && days <= 3;
  };

  // Filter and sort assignments
  const filteredAssignments = assignments
    .filter(a => 
      a.name.toLowerCase().includes(search.toLowerCase()) || 
      a.courseName.toLowerCase().includes(search.toLowerCase())
    )
    .filter(a => {
      if (filter === 'all') return true;
      return a.status === filter;
    })
    .sort((a, b) => parseDate(b.assignedDate).getTime() - parseDate(a.assignedDate).getTime()); // Newest first

  // Mock data if no assignments exist yet to demonstrate the design
  const displayAssignments = filteredAssignments.length > 0 ? filteredAssignments : [
    {
      id: "a1",
      courseId: "c1",
      name: "Quantum Tunneling Analysis",
      courseName: "Advanced Physics",
      instructor: "Dr. Sarah Jenkins",
      assignedDate: "2026-03-10",
      dueDate: "2026-03-20",
      status: "pending" as const
    },
    {
      id: "a2",
      courseId: "c2",
      name: "Binary Trees Implementation",
      courseName: "Data Structures",
      instructor: "Prof. Alan Turing",
      assignedDate: "2026-03-08",
      dueDate: "2026-03-11",
      status: "pending" as const
    },
    {
      id: "a3",
      courseId: "c3",
      name: "Cold War Essay",
      courseName: "Modern World History",
      instructor: "Dr. Emily Carter",
      assignedDate: "2026-03-01",
      dueDate: "2026-03-05",
      status: "graded" as const
    },
    {
      id: "a4",
      courseId: "c4",
      name: "Partial Differential Equations Problem Set",
      courseName: "Calculus III",
      instructor: "Prof. John Nash",
      assignedDate: "2026-02-28",
      dueDate: "2026-03-08",
      status: "pending" as const // This will be overdue
    },
    {
      id: "a5",
      courseId: "c2",
      name: "Graph Algorithms Summary",
      courseName: "Data Structures",
      instructor: "Prof. Alan Turing",
      assignedDate: "2026-03-05",
      dueDate: "2026-03-15",
      status: "submitted" as const
    }
  ].filter(a => {
    if (search && !a.name.toLowerCase().includes(search.toLowerCase()) && !a.courseName.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter !== 'all' && a.status !== filter) return false;
    return true;
  }).sort((a, b) => parseDate(b.assignedDate).getTime() - parseDate(a.assignedDate).getTime());

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50/5 relative">
      <div className="px-8 pt-8 pb-4 flex flex-col md:flex-row md:items-end justify-between gap-6 z-10 relative">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-orange-500/20 text-orange-500 rounded-xl backdrop-blur-md">
              <FileText className="size-6" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white">Global Assignments</h1>
          </div>
          <p className="text-slate-400 mt-1 max-w-xl text-sm">
            Manage your assignments across all courses. Track deadlines, submissions, and grades.
          </p>
        </div>

        {/* Smart Filtering & Search */}
        <div className="flex flex-col gap-4 w-full md:w-auto animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by assignment or course..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-[320px] bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-full py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-slate-500 text-white shadow-inner"
            />
          </div>
          <div className="flex bg-slate-900/80 p-1.5 rounded-full border border-white/10 backdrop-blur-xl self-start md:self-end">
            {(['all', 'pending', 'submitted', 'graded'] as const).map(tab => (
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
        {displayAssignments.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center animate-in fade-in">
            <div className="size-16 bg-slate-900 border border-white/5 rounded-2xl flex items-center justify-center mb-4 text-slate-600">
               <FileText className="size-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-300">No assignments found</h3>
            <p className="text-slate-500 text-sm mt-2">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {displayAssignments.map((assignment, idx) => {
                const overdue = isOverdue(assignment.dueDate, assignment.status);
                const dueSoon = isDueSoon(assignment.dueDate, assignment.status);
                
                let StatusIcon = Clock;
                let statusColor = "text-amber-500";
                let statusBg = "bg-amber-500/10 border-amber-500/20";
                let glowColor = "from-amber-500/30 to-orange-600/30";

                if (assignment.status === 'submitted') {
                  StatusIcon = CheckCircle;
                  statusColor = "text-blue-500";
                  statusBg = "bg-blue-500/10 border-blue-500/20";
                  glowColor = "from-blue-500/30 to-indigo-600/30";
                } else if (assignment.status === 'graded') {
                  StatusIcon = CheckCircle;
                  statusColor = "text-emerald-500";
                  statusBg = "bg-emerald-500/10 border-emerald-500/20";
                  glowColor = "from-emerald-500/30 to-teal-600/30";
                } else if (overdue) {
                  StatusIcon = AlertCircle;
                  statusColor = "text-red-500";
                  statusBg = "bg-red-500/10 border-red-500/20 flex flex-row items-center gap-1.5";
                  glowColor = "from-red-500/30 to-pink-600/30";
                } else if (dueSoon) {
                  StatusIcon = AlertTriangle;
                  statusColor = "text-orange-400";
                  statusBg = "bg-orange-500/10 border-orange-500/20";
                  glowColor = "from-orange-500/30 to-amber-600/30";
                }

                return (
                  <motion.div
                    key={assignment.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className="group relative cursor-pointer"
                    onClick={() => handleOpenAssignment(assignment.courseId, assignment.id)}
                  >
                    {/* Glowing hover effect */}
                    <div className={cn(
                       "absolute -inset-0.5 rounded-[2rem] blur opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-br",
                       glowColor
                    )} />
                    
                    {/* Card Content */}
                    <div className="relative h-full bg-slate-900/90 backdrop-blur-xl border border-white/10 p-6 rounded-3xl flex flex-col hover:-translate-y-1 transition-transform duration-300 shadow-xl overflow-hidden">
                      
                      {/* Header with Status Badge */}
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex-1 pr-4">
                          <h2 className="text-xl font-bold text-white mb-2 leading-tight group-hover:text-primary transition-colors line-clamp-2">
                            {assignment.name}
                          </h2>
                        </div>
                        <div className={cn(
                          "px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase border flex items-center gap-1.5 shrink-0 shadow-sm",
                          statusColor, statusBg
                        )}>
                          {(overdue || dueSoon) && assignment.status === 'pending' && (
                            <span className="relative flex size-2 mr-0.5">
                              <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", overdue ? "bg-red-400" : "bg-orange-400")}></span>
                              <span className={cn("relative inline-flex rounded-full size-2", overdue ? "bg-red-500" : "bg-orange-500")}></span>
                            </span>
                          )}
                          <StatusIcon className="size-3.5" />
                          {overdue ? 'Overdue' : dueSoon ? 'Due Soon' : assignment.status}
                        </div>
                      </div>

                      {/* Course Info */}
                      <div className="mb-6 flex-1 bg-slate-800/50 rounded-2xl p-4 border border-white/5 group-hover:border-white/10 transition-colors">
                        <div className="flex items-center gap-2 mb-2">
                          <BookOpen className="size-4 text-primary" />
                          <span className="font-semibold text-slate-200 text-sm">{assignment.courseName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <User className="size-3.5" />
                          <span>{assignment.instructor}</span>
                        </div>
                      </div>

                      {/* Dates */}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Assigned Date</span>
                          <span className="text-sm font-medium text-slate-300">{parseDate(assignment.assignedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Due Date</span>
                          <span className={cn(
                            "text-sm font-medium",
                            overdue ? "text-red-400 font-bold" : dueSoon ? "text-orange-400 font-bold" : "text-slate-300"
                          )}>
                            {parseDate(assignment.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="mt-auto pt-4 border-t border-white/5 flex justify-end">
                        <div className="flex items-center text-xs font-bold text-slate-400 group-hover:text-primary transition-colors">
                          View Details <ChevronRight className="size-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>

                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
