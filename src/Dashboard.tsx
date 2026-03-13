import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  School, 
  LayoutDashboard, 
  BookOpen, 
  FileText, 
  Users, 
  LineChart, 
  Settings, 
  Search, 
  Bell, 
  Mail, 
  Plus, 
  Video, 
  FilePlus, 
  Radio, 
  Calendar, 
  Clock, 
  MapPin, 
  Brain, 
  Zap, 
  MessageSquare,
  TrendingUp,
  FileUp,
  Sparkles,
  Library,
  Folder,
  History,
  Activity,
  Award
} from 'lucide-react';

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { useAuth } from './context/AuthContext';
import axios from 'axios';
import { cn } from './lib/utils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';

const chartColors = {
  engagement: "#4F46E5",
  participation: "#7C3AED",
  completion: "#10B981",
  pending: "#F59E0B"
};

// Note: data state is used for the chart in Student view, but currently has mock values. 
// We should ideally fetch this from analytics, but for now we'll keep it as an empty or neutral set if requested, 
// or just leave it for visual flavor if it's considered "chart placeholder" rather than "dummy data".
// To be safe and follow instructions strictly, I'll clear it or use real-ish logic if available.
const data: any[] = []; 

import CreateClassModal from './components/CreateClassModal';
import StudyRooms from './components/StudyRooms';
import RevisionHub from './components/RevisionHub';
import AiLecturePlanner from './components/AiLecturePlanner';
import AiStudyPlanner from './components/AiStudyPlanner';
import AiAssistant from './components/AiAssistant';
import ReactMarkdown from 'react-markdown';

export default function Dashboard({ onStartClass }: { onStartClass: (roomId: string) => void }) {



  const { user, token, logout } = useAuth();
  const [classes, setClasses] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [showJoinModal, setShowJoinModal] = React.useState(false);
  const [classCode, setClassCode] = React.useState('');
  
  const [selectedClass, setSelectedClass] = React.useState<any>(null);
  const [classAnalytics, setClassAnalytics] = React.useState<any>(null);
  const [assignments, setAssignments] = React.useState<any[]>([]);
  const [showAssignmentModal, setShowAssignmentModal] = React.useState(false);
  const [showSubmitModal, setShowSubmitModal] = React.useState(false);
  const [selectedAssignment, setSelectedAssignment] = React.useState<any>(null);
  const [assignmentFile, setAssignmentFile] = React.useState<File | null>(null);
  const [newAssignment, setNewAssignment] = React.useState({ 
    title: '', 
    description: '', 
    dueDate: '', 
    maxScore: 100,
    rubric: [] as any[],
    latePenaltyRule: {} as any
  });
  const [submissions, setSubmissions] = React.useState<any[]>([]);
  const [showGradingModal, setShowGradingModal] = React.useState(false);
  const [selectedSubmission, setSelectedSubmission] = React.useState<any>(null);
  const [gradingInfo, setGradingInfo] = React.useState({ grade: 0, feedback: '' });
  const [currentTab, setCurrentTab] = React.useState(user?.role === 'teacher' ? 'Dashboard' : 'Classes');
  const [isAiGrading, setIsAiGrading] = React.useState(false);
  const [showArchived, setShowArchived] = React.useState(false);

  const [materials, setMaterials] = React.useState<any[]>([]);
  const [isUploading, setIsUploading] = React.useState(false);
  const [classmates, setClassmates] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (token) {
      fetchClasses();
    }
  }, [token]);

  React.useEffect(() => {
    if (selectedClass) {
      fetchAssignments(selectedClass.id);
      fetchSubmissions(selectedClass.id);
      fetchAnalytics(selectedClass.id);
      fetchMaterials(selectedClass.id);
      fetchClassmates(selectedClass.id);
    }
  }, [selectedClass]);

  const fetchClassmates = async (classId: string) => {
    try {
      const res = await axios.get(`${API_URL}/classes/${classId}/classmates`);
      setClassmates(res.data);
    } catch (err) {
      console.error('Error fetching classmates:', err);
    }
  };

  const fetchMaterials = async (classId: string) => {
    try {
      const res = await axios.get(`${API_URL}/library/${classId}`);
      setMaterials(res.data);
    } catch (err) {
      console.error('Error fetching materials:', err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0];
    if (!file || !selectedClass) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('classId', selectedClass.id);
    formData.append('title', file.name);
    formData.append('type', type);

    setIsUploading(true);
    try {
      await axios.post(`${API_URL}/library`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchMaterials(selectedClass.id);
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const archiveClass = async (id: string, archived: boolean) => {
    try {
      await axios.patch(`${API_URL}/classes/${id}/archive`, { archived });
      fetchClasses();
    } catch (err) {
      console.error('Archive failed:', err);
    }
  };

  const deleteClass = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this class? This cannot be undone.')) return;
    try {
      await axios.delete(`${API_URL}/classes/${id}`);
      fetchClasses();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await axios.get(`${API_URL}/classes`);
      setClasses(res.data);
      if (res.data.length > 0 && !selectedClass) {
        setSelectedClass(res.data[0]);
      }
    } catch (err) {
      console.error('Error fetching classes:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async (classId: string) => {
    try {
      const res = await axios.get(`${API_URL}/classes/${classId}/analytics`);
      setClassAnalytics(res.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    }
  };

  const fetchAssignments = async (classId: string) => {
    try {
      const res = await axios.get(`${API_URL}/assignments/${classId}`);
      setAssignments(res.data);
    } catch (err) {
      console.error('Error fetching assignments:', err);
    }
  };

  const fetchSubmissions = async (classId: string) => {
    try {
      const res = await axios.get(`${API_URL}/assignments/submissions/${classId}`);
      setSubmissions(res.data);
    } catch (err) {
      console.error('Error fetching submissions:', err);
    }
  };

  const handleCreateClass = async (classData: any) => {
    try {
      await axios.post(`${API_URL}/classes`, classData);
      setShowCreateModal(false);
      fetchClasses();
    } catch (err: any) {
      const errorData = err.response?.data;
      const errorMessage = errorData?.message || err.message;
      const errorDetails = errorData?.details ? `\nDetails: ${errorData.details}` : '';
      console.error('Create Class Error:', errorData || err.message);
      alert(`Error creating class: ${errorMessage}${errorDetails}`);
    }
  };

  const handleArchiveClass = async (classId: string, archived: boolean) => {
    try {
      await axios.patch(`${API_URL}/classes/${classId}/archive`, { archived });
      fetchClasses();
      if (selectedClass?.id === classId) setSelectedClass(null);
    } catch (err) {
      alert('Error updating class status');
    }
  };

  const handleAiSuggestGrade = async (submissionId: string) => {
    setIsAiGrading(true);
    try {
      const res = await axios.get(`${API_URL}/assignments/submissions/${submissionId}/ai-grade`);
      setGradingInfo({
        grade: res.data.suggestedScore,
        feedback: res.data.feedback
      });
    } catch (err) {
      alert('AI Grading failed');
    } finally {
      setIsAiGrading(false);
    }
  };

  const handleJoinClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/classes/join`, { classCode });
      setClassCode('');
      setShowJoinModal(false);
      fetchClasses();
    } catch (err) {
      alert('Invalid class code');
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/assignments`, { ...newAssignment, classId: selectedClass.id });
      setShowAssignmentModal(false);
      fetchAssignments(selectedClass.id);
    } catch (err) {
      alert('Error creating assignment');
    }
  };

  const handleSubmitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignmentFile) return alert('Please select a file');

    const formData = new FormData();
    formData.append('assignmentId', selectedAssignment.id);
    formData.append('file', assignmentFile);

    try {
      await axios.post(`${API_URL}/assignments/submit`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setAssignmentFile(null);
      setShowSubmitModal(false);
      fetchSubmissions(selectedClass.id);
      alert('Assignment submitted successfully!');
    } catch (err) {
      alert('Error submitting assignment');
    }
  };

  const handleGradeSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/assignments/grade`, {
        submissionId: selectedSubmission.id,
        ...gradingInfo
      });
      setShowGradingModal(false);
      fetchSubmissions(selectedClass.id);
      alert('Graded successfully!');
    } catch (err) {
      alert('Error grading');
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-lectra-background text-lectra-text">
      {/* Sidebar */}
      <aside className="w-64 bg-lectra-sidebar border-r border-lectra-border flex flex-col h-full shrink-0">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-lectra-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-lectra-primary/20">
            <School className="size-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight text-lectra-text">Nexus</h1>
            <p className="text-xs text-lectra-muted font-medium">Classroom Pro</p>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {(user?.role === 'teacher' ? [
            { icon: LayoutDashboard, label: 'Dashboard' },
            { icon: BookOpen, label: 'Classes' },
            { icon: FileText, label: 'Assignments' },
            { icon: Users, label: 'Students' },
            { icon: Video, label: 'Live Lectures' },
            { icon: LineChart, label: 'Analytics' },
            { icon: Sparkles, label: 'AI Insights' },
            { icon: Library, label: 'Content Library' },
            { icon: Settings, label: 'Settings' },
          ] : [
            { icon: BookOpen, label: 'Classes' },
            { icon: LayoutDashboard, label: 'Dashboard' },
            { icon: FileText, label: 'Assignments' },
            { icon: Users, label: 'Students' },
            { icon: Sparkles, label: 'Smart Planner' },
            { icon: LineChart, label: 'Revision Hub' },
            { icon: Library, label: 'Content Library' },
            { icon: Settings, label: 'Settings' },
          ]).map((item) => (
            <button 
              key={item.label}
              onClick={() => setCurrentTab(item.label)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all duration-200",
                currentTab === item.label 
                  ? "bg-lectra-primary/10 text-lectra-primary border border-lectra-primary/20" 
                  : "text-lectra-muted hover:bg-white/5 hover:text-lectra-text"
              )}
            >
              <item.icon className="size-5" />
              <span className="text-sm font-semibold">{item.label}</span>
            </button>
          ))}
        </nav>


        <div className="p-4 mt-auto">
          <div className="p-4 glass-card">
            <p className="text-[10px] font-black uppercase text-lectra-primary tracking-widest mb-2">Cloud Connectivity</p>
            <div className="w-full bg-lectra-border h-1.5 rounded-full mb-2 overflow-hidden">
              <div className="bg-lectra-primary h-full w-full rounded-full" />
            </div>
            <p className="text-[10px] text-lectra-muted font-bold">Secure Node Linked</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-lectra-background relative custom-scrollbar">
        {/* Header */}
        <header className="sticky top-0 z-30 px-6 py-4 flex items-center justify-between bg-lectra-background/80 backdrop-blur-md">
          <div className="flex-1 flex justify-center">
            <div className="flex items-center bg-lectra-card border border-lectra-border rounded-full px-4 py-2 shadow-2xl w-full max-w-2xl gap-4 focus-within:border-lectra-primary transition-all">
              <div className="flex items-center gap-2 text-lectra-muted flex-1">
                <Search className="size-5" />
                <input 
                  className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder-lectra-muted text-lectra-text" 
                  placeholder="Search classrooms, students, or resources..." 
                  type="text"
                />
                <span className="text-[10px] bg-lectra-background px-1.5 py-0.5 rounded border border-lectra-border font-mono text-lectra-muted">⌘K</span>
              </div>
              <div className="h-6 w-[1px] bg-lectra-border" />
              <div className="flex items-center gap-2 shrink-0">
                <button className="p-2 text-lectra-muted hover:bg-white/5 rounded-full transition-colors relative">
                  <Bell className="size-5" />
                  <span className="absolute top-2 right-2 size-2 bg-lectra-danger rounded-full border-2 border-lectra-card" />
                </button>
                <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-lectra-border cursor-pointer hover:border-lectra-primary transition-all" onClick={logout}>
                  <img className="w-full h-full object-cover" src={`https://ui-avatars.com/api/?name=${user?.name}&background=4F46E5&color=fff`} alt="Profile" />
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          {(() => {
            switch (currentTab) {
              case 'Dashboard':
                return (
                  <div className="px-8 pb-12 space-y-8">
                    {/* Welcome & Actions */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                      <div>
                        <h2 className="text-3xl font-bold tracking-tight text-lectra-text">
                          Welcome back, {user?.role === 'teacher' ? `Prof. ${user?.name}` : user?.name}
                        </h2>
                        <p className="text-lectra-muted mt-1 font-medium">
                          {user?.role === 'teacher' ? `You have ${classes.length} active classes.` : `You are enrolled in ${classes.length} classes today.`}
                        </p>
                      </div>
                      <div className="flex gap-3">
                        {user?.role === 'teacher' ? (
                          <button 
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-lectra-primary hover:bg-lectra-primary-hover text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-lectra-primary/20 hover:-translate-y-0.5"
                          >
                            <Plus className="size-5" />
                            Create Class
                          </button>
                        ) : (
                          <button 
                            onClick={() => setShowJoinModal(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-lectra-primary hover:bg-lectra-primary-hover text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-lectra-primary/20 hover:-translate-y-0.5"
                          >
                            <Plus className="size-5" />
                            Join Class
                          </button>
                        )}
                        <button 
                          onClick={() => selectedClass ? onStartClass(selectedClass.class_code) : alert('Select a class first')}
                          className="flex items-center gap-2 px-5 py-2.5 bg-transparent border border-lectra-border hover:border-lectra-primary text-lectra-text rounded-xl font-bold text-sm transition-all"
                        >
                          <Video className="size-5" />
                          {user?.role === 'teacher' ? 'Start Lecture' : 'Join Meeting'}
                        </button>
                        {user?.role === 'teacher' && (
                          <button 
                            onClick={() => setShowAssignmentModal(true)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 border border-slate-700 text-slate-200 rounded-lg font-semibold text-sm hover:bg-slate-700 transition-all"
                          >
                            <FilePlus className="size-5" />
                            New Assignment
                          </button>
                        )}
                      </div>
                    </div>

                    {user?.role === 'teacher' ? (
                      /* Teacher Dashboard View */
                      <>
                        {/* Hero Section */}
                        <div className="lectra-gradient p-8 rounded-[2rem] border border-white/20 shadow-2xl relative overflow-hidden group">
                          <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-500">
                            <Video className="size-64" />
                          </div>
                          <div className="flex flex-col lg:flex-row justify-between gap-8 relative z-10">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-6">
                                <div className="size-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white border border-white/20 shadow-lg">
                                  <Radio className="size-6 animate-pulse-slow" />
                                </div>
                                <div>
                                  <h4 className="text-2xl font-black italic uppercase tracking-tighter text-white">Lectra Live Control</h4>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="w-2 h-2 rounded-full bg-lectra-success animate-pulse" />
                                    <p className="text-white/80 text-[10px] font-black tracking-widest uppercase">Encryption: AES-256 Validated</p>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                                  <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1">Active Lecture</p>
                                  <p className="text-sm font-bold truncate text-white">{selectedClass?.title || 'No Stream Active'}</p>
                                </div>
                                <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                                  <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1">Participants</p>
                                  <p className="text-sm font-bold text-white">{classmates.length} Connected</p>
                                </div>
                                <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                                  <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1">Engagement</p>
                                  <p className="text-sm font-bold text-lectra-success">{classAnalytics?.averageEngagement || '0'}%</p>
                                </div>
                                <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                                  <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1">Status</p>
                                  <p className="text-sm font-bold text-lectra-success">Synchronized</p>
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-4 mt-8">
                                <button 
                                  onClick={() => selectedClass ? onStartClass(selectedClass.class_code) : alert('Select a class first')}
                                  className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:brightness-110 transition-all shadow-lg shadow-primary/20"
                                >
                                  <Video className="size-5" />
                                  Start Lecture
                                </button>
                                <button className="flex items-center gap-2 px-6 py-3 bg-slate-800 border border-slate-700 text-slate-200 rounded-xl font-bold hover:bg-slate-700 transition-all">
                                  <Calendar className="size-5" />
                                  Schedule
                                </button>
                                <button className="flex items-center gap-2 px-6 py-3 bg-slate-800 border border-slate-700 text-slate-200 rounded-xl font-bold hover:bg-slate-700 transition-all">
                                  <Award className="size-5" />
                                  Whiteboard
                                </button>
                                <button className="flex items-center gap-2 px-6 py-3 bg-slate-800 border border-slate-700 text-slate-200 rounded-xl font-bold hover:bg-slate-700 transition-all">
                                  <Activity className="size-5" />
                                  Launch Poll
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                          <MetricCard 
                            icon={Radio} 
                            value={classes.filter(c => !c.is_archived).length.toString().padStart(2, '0')} 
                            label="Active Classes" 
                            color="emerald" 
                            trend={`${classes.filter(c => !c.is_archived).length} nodes currently online`}
                          />
                          <MetricCard 
                            icon={Users} 
                            value={classes.reduce((acc, curr) => acc + (curr.student_count || 0), 0).toString()} 
                            label="Total Students" 
                            color="primary" 
                            trend="Verified across all nodes"
                          />
                          <MetricCard 
                            icon={Clock} 
                            value={submissions.filter(s => !s.grade).length.toString()} 
                            label="Pending Grading" 
                            color="orange" 
                            trend="Immediate action required"
                          />
                          <MetricCard 
                            icon={LineChart} 
                            value={`${classAnalytics?.averageScore || '0'}%`} 
                            label="Avg. Performance Score" 
                            color="purple" 
                            trend="Live class aggregate" 
                          />
                        </div>

                        {/* Class Management & Recent Submissions */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                          <div className="lg:col-span-2 space-y-6">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-xl font-bold underline decoration-primary decoration-4 underline-offset-8">Your Classes</h4>
                              <button onClick={() => setCurrentTab('Classes')} className="text-xs text-primary font-bold hover:underline">View All</button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {classes.slice(0, 4).map((cls) => (
                                <div key={cls.id} className="glass-card p-6 border-lectra-border/50 group">
                                  <div className="flex justify-between items-start mb-4">
                                      <div className="size-12 bg-lectra-primary/10 rounded-2xl flex items-center justify-center text-lectra-primary group-hover:bg-lectra-primary group-hover:text-white transition-all transform group-hover:rotate-6">
                                        <BookOpen className="size-6" />
                                      </div>
                                      <div className="text-right">
                                        <p className="text-[10px] font-black uppercase text-lectra-muted tracking-widest">Code: {cls.class_code}</p>
                                        <div className="flex flex-col">
                                          <span className="text-[10px] font-black text-lectra-muted uppercase tracking-widest">Enrollment Status</span>
                                          <span className="text-xs font-bold text-lectra-text">{cls.description || 'Core Curriculum'}</span>
                                        </div>
                                      </div>
                                  </div>
                                  <h5 className="text-lg font-bold text-lectra-text truncate">{cls.title}</h5>
                                  <p className="text-sm text-lectra-muted mb-6">Introduction to Computer Science</p>
                                  
                                  <div className="flex items-center justify-between pt-6 border-t border-lectra-border">
                                      <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-lectra-muted uppercase tracking-widest">Students</span>
                                        <span className="text-xs font-bold text-lectra-text">{cls.student_count} Enrolled</span>
                                      </div>
                                      <div className="flex gap-2">
                                        <button 
                                          onClick={() => setSelectedClass(cls)}
                                          className="px-3 py-1.5 bg-lectra-primary/10 text-lectra-primary rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-lectra-primary hover:text-white transition-all"
                                        >
                                          Open
                                        </button>
                                        <button 
                                          onClick={(e) => { e.stopPropagation(); onStartClass(cls.class_code); }}
                                          className="p-1.5 bg-lectra-accent/10 text-lectra-accent rounded-lg hover:bg-lectra-accent hover:text-white transition-all"
                                        >
                                          <Video className="size-4" />
                                        </button>
                                      </div>
                                  </div>
                                </div>
                              ))}
                              <button 
                                onClick={() => setShowCreateModal(true)}
                                className="border-2 border-dashed border-lectra-border rounded-xl p-6 flex flex-col items-center justify-center text-lectra-muted hover:border-lectra-primary hover:text-lectra-primary hover:bg-lectra-primary/5 transition-all group"
                              >
                                <Plus className="size-10 mb-2 group-hover:scale-110 transition-transform" />
                                <p className="font-bold uppercase tracking-widest text-[10px]">Create New Classroom</p>
                              </button>
                            </div>
                          </div>

                          <div className="space-y-6">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-xl font-bold underline decoration-orange-500 decoration-4 underline-offset-8">Recent Submissions</h4>
                              <button onClick={() => setShowAssignmentModal(true)} className="size-8 bg-orange-500/10 text-orange-500 rounded-lg flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all">
                                <Plus className="size-4" />
                              </button>
                            </div>
                            <div className="bg-slate-950/50 rounded-3xl border border-white/5 p-2 space-y-2 max-h-[500px] overflow-y-auto">
                              {submissions.length > 0 ? (
                                submissions.slice(0, 5).map((s) => (
                                  <div key={s.id} className="p-4 rounded-2xl bg-slate-900 border border-white/5 space-y-3 hover:border-primary/30 transition-colors group">
                                    <div className="flex justify-between items-start">
                                        <div>
                                          <span className="text-[10px] font-bold text-primary uppercase">Student</span>
                                          <h6 className="text-sm font-bold">{s.users.name}</h6>
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-500">{new Date(s.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <div className="p-2 bg-slate-800/50 rounded-lg">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase leading-none mb-1">Assignment</p>
                                        <p className="text-xs font-bold truncate">{s.assignments.title}</p>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <a href={s.file_url} target="_blank" rel="noopener noreferrer" className="flex-1 py-1.5 bg-slate-800 rounded-lg text-center text-[10px] font-bold hover:bg-slate-700">Open File</a>
                                        {!s.grade && (
                                          <button 
                                            onClick={() => {
                                              setSelectedSubmission(s);
                                              setShowGradingModal(true);
                                            }}
                                            className="flex-1 py-1.5 bg-primary/20 text-primary rounded-lg text-[10px] font-bold hover:bg-primary hover:text-white transition-all"
                                          >
                                            Grade Now
                                          </button>
                                        )}
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="p-12 text-center">
                                  <p className="text-slate-600 text-sm italic">No recent submissions</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Student Monitor & AI Panel */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          <div className="bg-slate-900 p-8 rounded-3xl border border-primary/10 shadow-sm flex flex-col min-h-[400px]">
                              <div className="flex items-center justify-between mb-8">
                                <h4 className="text-lg font-bold">Student Engagement Monitor</h4>
                                <div className="flex gap-2">
                                  <span className="p-1.5 bg-emerald-500/10 text-emerald-500 rounded-md"><Activity className="size-4" /></span>
                                  <span className="p-1.5 bg-orange-500/10 text-orange-500 rounded-md"><Bell className="size-4 animate-bounce" /></span>
                                </div>
                              </div>
                              <div className="space-y-4 flex-1 overflow-y-auto pr-2">
                                {classmates.length > 0 ? (
                                  classmates.map((student, i) => (
                                    <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-lectra-sidebar/50 hover:bg-lectra-sidebar transition-colors border border-lectra-border/50">
                                        <img src={`https://ui-avatars.com/api/?name=${student.name}&background=random`} alt="" className="size-10 rounded-full" />
                                        <div className="flex-1">
                                          <h5 className="text-sm font-bold text-lectra-text">{student.name}</h5>
                                          <p className="text-[10px] text-lectra-muted uppercase tracking-widest font-black">Member Profile</p>
                                        </div>
                                        <div className="text-right">
                                          <div className="size-2 rounded-full ml-auto bg-lectra-success shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                        </div>
                                    </div>
                                  ))
                                ) : (
                                  <div className="py-12 text-center">
                                    <p className="text-xs text-lectra-muted uppercase tracking-[0.2em] font-black">No classmates detected</p>
                                  </div>
                                )}
                              </div>
                              <div className="mt-6 p-4 bg-lectra-primary/5 border border-lectra-primary/10 rounded-2xl flex items-center gap-3">
                                <div className="size-8 bg-lectra-primary/20 text-lectra-primary rounded-lg flex items-center justify-center shrink-0">
                                    <Activity className="size-4" />
                                </div>
                                <p className="text-[10px] text-lectra-muted font-black uppercase tracking-widest">{classmates.length} nodes active in current neural landscape.</p>
                              </div>
                          </div>

                          <div className="bg-slate-900 p-8 rounded-3xl border border-primary/10 shadow-sm relative overflow-hidden flex flex-col min-h-[400px]">
                              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                                <Sparkles className="size-32 text-primary" />
                              </div>
                              <div className="flex items-center justify-between mb-8">
                                <h4 className="text-lg font-bold flex items-center gap-2">
                                    <Brain className="text-primary size-5" />
                                    AI Teaching Insights
                                </h4>
                              </div>
                              <div className="space-y-4 flex-1">
                                <div className="p-6 bg-lectra-primary/5 border border-lectra-primary/10 rounded-2xl">
                                    <p className="text-[10px] font-black uppercase text-lectra-primary tracking-widest mb-3">System Analysis</p>
                                    <p className="text-xs text-lectra-muted leading-relaxed font-semibold italic">"Neural teaching insights will propagate here once class analytics have been synchronized with the central hub."</p>
                                </div>
                                <div className="p-6 bg-lectra-sidebar/50 rounded-2xl border border-lectra-border/50">
                                    <p className="text-[10px] font-black uppercase text-lectra-muted tracking-widest mb-4">Strategic Vectors</p>
                                    <ul className="space-y-3">
                                      <li className="text-[10px] font-black uppercase tracking-widest text-lectra-muted flex items-center gap-2 italic">Awaiting data stream...</li>
                                    </ul>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-3 mt-6">
                                <button className="py-2.5 bg-primary text-white text-[10px] font-bold rounded-xl hover:brightness-110 transition-all">GENERATE SUMMARY</button>
                                <button className="py-2.5 bg-slate-800 text-slate-300 text-[10px] font-bold rounded-xl hover:bg-slate-700 transition-all">EXPORT NOTES</button>
                              </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                          <MetricCard 
                            icon={Calendar} 
                            value={classes.length.toString().padStart(2, '0')} 
                            label="Total Enrollments" 
                            color="primary" 
                          />
                          <MetricCard 
                            icon={Clock} 
                            value={assignments.filter(a => !submissions.find(s => s.assignment_id === a.id)).length.toString()} 
                            label="Assignments Due" 
                            color="orange" 
                            progress={assignments.length > 0 ? Math.round((submissions.length / assignments.length) * 100) : 100} 
                          />
                          <MetricCard 
                            icon={Sparkles} 
                            value={`${classAnalytics?.engagementScore || 0}%`} 
                            label="Engagement Core" 
                            color="purple" 
                            trend="Live stream analysis" 
                          />
                          <MetricCard 
                            icon={Activity} 
                            value="Synchronized" 
                            label="Neural Link Status" 
                            color="emerald" 
                          />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                          <div className="lg:col-span-2 bg-gradient-to-br from-primary to-blue-700 p-8 rounded-3xl text-white shadow-xl shadow-primary/30 relative overflow-hidden">
                            <div className="absolute -right-10 -bottom-10 opacity-10">
                              <Sparkles className="size-64" />
                            </div>
                            <div className="flex justify-between items-start mb-12 relative z-10">
                              <div>
                                <h4 className="text-2xl font-black italic uppercase tracking-tighter mb-2">Nexus Live Stats</h4>
                                <p className="text-white/70 text-sm">Real-time learning optimization data</p>
                              </div>
                              <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase">
                                AI MONITORING ACTIVE
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                              <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10">
                                <Brain className="size-8 mb-4" />
                                <div className="text-3xl font-bold">{classAnalytics?.averageEngagement || 0}%</div>
                                <div className="text-[10px] font-bold uppercase text-white/60 tracking-wider">Neural Sync Rate</div>
                              </div>
                              <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10">
                                <Zap className="size-8 mb-4" />
                                <div className="text-3xl font-bold">ACTIVE</div>
                                <div className="text-[10px] font-bold uppercase text-white/60 tracking-wider">Connection Integrity</div>
                              </div>
                                <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10">
                                  <TrendingUp className="size-8 mb-4" />
                                  <div className="text-3xl font-bold">{classes.length}</div>
                                  <div className="text-[10px] font-bold uppercase text-white/60 tracking-wider">Linked Hubs</div>
                                </div>
                              </div>
                            </div>

                          <div className="bg-slate-900 p-8 rounded-3xl border border-primary/10 shadow-sm flex flex-col">
                            <div className="flex items-center justify-between mb-8">
                              <h4 className="text-lg font-bold">Upcoming Lectures</h4>
                              <button className="text-primary text-sm font-semibold hover:underline">View Calendar</button>
                            </div>
                            <div className="space-y-6 flex-1 max-h-[400px] overflow-y-auto pr-2">
                              {classes.length > 0 ? (
                                classes.map((cls, idx) => (
                                  <TimelineItem 
                                    key={cls.id}
                                    time={new Date(cls.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
                                    title={cls.title} 
                                    location={`Join Code: ${cls.class_code}`} 
                                    active={selectedClass?.id === cls.id} 
                                    last={idx === classes.length - 1}
                                    onClick={() => {
                                      setSelectedClass(cls);
                                      setCurrentTab('Students');
                                    }}
                                  />
                                ))
                              ) : (
                                <p className="text-slate-500 text-sm text-center py-10">No classes found.</p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          <div className="bg-lectra-card p-8 rounded-3xl border border-lectra-border shadow-sm flex flex-col">
                            <div className="flex items-center justify-between mb-6">
                              <h4 className="text-lg font-bold text-lectra-text">Your Assignments</h4>
                              <button onClick={() => setCurrentTab('Assignments')} className="text-xs text-lectra-primary font-bold hover:underline">View All</button>
                            </div>
                            <div className="space-y-4 overflow-y-auto pr-2 flex-1 custom-scrollbar">
                              {assignments.length > 0 ? (
                                assignments.slice(0, 4).map((as: any) => {
                                  const isSubmitted = submissions.find(s => s.assignment_id === as.id);
                                  return (
                                    <div key={as.id} className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors border border-lectra-border/50 group">
                                      <div className="flex justify-between items-start mb-2">
                                        <h5 className="font-bold text-sm text-lectra-text group-hover:text-lectra-primary transition-colors">{as.title}</h5>
                                        {isSubmitted ? (
                                          <span className="text-[10px] px-2 py-0.5 bg-lectra-success/20 text-lectra-success rounded-full font-bold">Submitted</span>
                                        ) : (
                                          <span className="text-[10px] px-2 py-0.5 bg-lectra-warning/20 text-lectra-warning rounded-full font-bold">Pending</span>
                                        )}
                                      </div>
                                      <p className="text-xs text-lectra-muted line-clamp-1 mb-3">{as.description}</p>
                                      <div className="flex items-center justify-between mt-auto">
                                        <div className="flex items-center gap-2 text-[10px] text-lectra-muted font-bold">
                                          <Clock className="size-3" />
                                          DUE: {new Date(as.due_date).toLocaleDateString()}
                                        </div>
                                        {!isSubmitted && (
                                          <button 
                                            onClick={() => {
                                              setSelectedAssignment(as);
                                              setShowSubmitModal(true);
                                            }}
                                            className="text-[10px] font-black text-lectra-primary hover:text-white hover:bg-lectra-primary px-3 py-1 rounded-md transition-all uppercase tracking-widest"
                                          >
                                            Submit Now
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })
                              ) : (
                                <div className="text-center py-10">
                                  <p className="text-lectra-muted text-sm italic">No assignments for this class yet.</p>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="bg-lectra-card p-8 rounded-3xl border border-lectra-border shadow-sm flex flex-col group overflow-hidden relative">
                            <Sparkles className="absolute -right-4 -bottom-4 size-32 text-lectra-primary opacity-5 transform group-hover:scale-110 transition-transform" />
                             <div className="flex items-center justify-between mb-6">
                              <h4 className="text-lg font-bold text-lectra-text">Study Insights</h4>
                              <div className="size-8 bg-lectra-primary/10 rounded-lg flex items-center justify-center text-lectra-primary">
                                <Sparkles className="size-5" />
                              </div>
                            </div>
                            <div className="space-y-4 relative z-10">
                              <div className="p-5 rounded-2xl bg-lectra-primary/5 border border-lectra-primary/20">
                                <p className="text-[10px] font-black text-lectra-primary mb-2 uppercase tracking-widest leading-none">AI PERFORMANCE COACH</p>
                                <p className="text-sm text-lectra-text font-medium italic">"Your focus peaks between 10 AM and 11 AM. Try tackling the {assignments[0]?.title || 'next assignment'} during this window!"</p>
                              </div>
                              <div className="p-4 rounded-2xl bg-white/5 border border-lectra-border">
                                <p className="text-[10px] font-black text-lectra-muted mb-2 uppercase tracking-widest leading-none">RECENT REMARK</p>
                                {submissions.filter(s => s.grade).length > 0 ? (
                                   <p className="text-sm text-lectra-muted italic">"{submissions.filter(s => s.grade)[0].feedback}"</p>
                                ) : (
                                  <p className="text-sm text-lectra-muted italic">"Keep participating in live lectures to boost your engagement score!"</p>
                                )}
                              </div>
                            </div>
                            <button 
                              onClick={() => setCurrentTab('Revision Hub')}
                              className="mt-8 w-full py-3 bg-lectra-primary text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-lectra-primary-hover transition-all shadow-lg shadow-lectra-primary/20"
                            >
                              OPEN REVISION HUB
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                );
              case 'Assignments':
                return (
                  <div className="px-8 pb-12 space-y-8">
                    {!selectedClass ? (
                      <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
                        <div className="size-20 bg-slate-900 rounded-3xl flex items-center justify-center text-slate-700 mb-6 border border-white/5">
                          <BookOpen className="size-10" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">No Class Selected</h3>
                        <p className="text-slate-500 max-w-xs">Please select a class from the sidebar or dashboard to manage its assignments.</p>
                        <button 
                          onClick={() => setCurrentTab('Dashboard')}
                          className="mt-6 px-6 py-2 bg-primary text-white rounded-xl font-bold hover:brightness-110 transition-all"
                        >
                          Go to Dashboard
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between">
                          <div>
                            <h2 className="text-3xl font-extrabold tracking-tight">Assignments</h2>
                            <p className="text-slate-400 mt-1">Manage and track classroom work for {selectedClass?.title}</p>
                          </div>
                          {user?.role === 'teacher' && (
                            <button 
                              onClick={() => setShowAssignmentModal(true)}
                              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:brightness-110 transition-all shadow-xl shadow-primary/20"
                            >
                              <Plus className="size-5" />
                              Create Assignment
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                          <div className="xl:col-span-2 space-y-6">
                            <h4 className="text-xl font-bold flex items-center gap-2">
                              <FileText className="text-primary" />
                              Active Assignments
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {assignments.length > 0 ? assignments.map((as) => (
                                <div key={as.id} className="glass-card p-6 rounded-3xl border border-white/5 bg-slate-900/50 hover:bg-slate-900 transition-all group">
                                  <div className="flex justify-between items-start mb-4">
                                    <div className="size-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                      <FileText className="size-6" />
                                    </div>
                                    <div className="flex flex-col items-end">
                                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Max Score</span>
                                      <span className="text-lg font-bold text-primary">{as.max_score}</span>
                                    </div>
                                  </div>
                                  <h5 className="text-lg font-bold mb-2">{as.title}</h5>
                                  <p className="text-sm text-slate-400 line-clamp-2 mb-6">{as.description}</p>
                                  
                                  <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                    <div className="flex flex-col">
                                      <span className="text-[10px] font-bold text-slate-600 uppercase">Deadline</span>
                                      <span className="text-xs font-bold text-slate-300">{new Date(as.due_date).toLocaleDateString()}</span>
                                    </div>
                                    {user?.role === 'student' ? (
                                      <button 
                                        onClick={() => {
                                          setSelectedAssignment(as);
                                          setShowSubmitModal(true);
                                        }}
                                        className="px-4 py-2 bg-primary/10 text-primary rounded-lg text-xs font-bold hover:bg-primary hover:text-white transition-all"
                                      >
                                        Submit Work
                                      </button>
                                    ) : (
                                      <span className="text-[10px] px-2 py-1 bg-primary/5 text-primary rounded-md font-bold italic">
                                        {submissions.filter(s => s.assignment_id === as.id).length} Submissions
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )) : (
                                <div className="col-span-full p-12 bg-slate-900/30 rounded-3xl border border-white/5 text-center">
                                  <p className="text-slate-500 text-sm italic">No assignments created yet.</p>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="space-y-6">
                            <h4 className="text-xl font-bold flex items-center gap-2">
                              <Clock className="text-orange-500" />
                              Submission History
                            </h4>
                            <div className="bg-slate-950/50 rounded-3xl border border-white/5 p-2 space-y-2 max-h-[600px] overflow-y-auto">
                              {user?.role === 'teacher' ? (
                                submissions.map((s) => (
                                  <div key={s.id} className="p-4 rounded-2xl bg-slate-900 border border-white/5 space-y-3">
                                    <div className="flex justify-between items-center">
                                      <span className="text-[10px] font-bold text-primary uppercase">{s.users.name}</span>
                                      {s.grade ? (
                                        <span className="text-[10px] font-black text-emerald-500">{s.grade}/{s.assignments.max_score}</span>
                                      ) : (
                                        <span className="text-[10px] font-black text-orange-500 uppercase tracking-tighter">Pending</span>
                                      )}
                                    </div>
                                    <h6 className="text-sm font-bold truncate">{s.assignments.title}</h6>
                                    <div className="flex gap-2">
                                      <a href={s.file_url} target="_blank" rel="noopener noreferrer" className="flex-1 py-1.5 bg-slate-800 rounded-lg text-center text-[10px] font-bold hover:bg-slate-700">View File</a>
                                      {!s.grade && (
                                        <button 
                                          onClick={() => {
                                            setSelectedSubmission(s);
                                            setShowGradingModal(true);
                                            setGradingInfo({ grade: 0, feedback: '' });
                                          }}
                                          className="flex-1 py-1.5 bg-primary/10 text-primary rounded-lg text-[10px] font-bold hover:bg-primary hover:text-white transition-all"
                                        >
                                          Grade
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                ))
                              ) : (
                                submissions.filter(s => s.student_id === user?.id).map((s) => (
                                  <div key={s.id} className="p-4 rounded-2xl bg-slate-900 border border-white/5 space-y-3">
                                    <div className="flex justify-between items-center">
                                      <span className="text-[10px] font-bold text-slate-500">{new Date(s.submitted_at).toLocaleDateString()}</span>
                                      {s.grade ? (
                                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter">Graded</span>
                                      ) : (
                                        <span className="text-[10px] font-black text-orange-500 uppercase tracking-tighter">Reviewing</span>
                                      )}
                                    </div>
                                    <h6 className="text-sm font-bold truncate">{s.assignments.title}</h6>
                                    {s.grade && (
                                      <div className="p-2 bg-emerald-500/5 rounded-lg border border-emerald-500/10">
                                        <p className="text-[10px] font-bold text-emerald-500 mb-1 leading-none">FEEDBACK • {s.grade} pts</p>
                                        <p className="text-[10px] text-slate-400 italic">"{s.feedback || 'No written feedback provided.'}"</p>
                                      </div>
                                    )}
                                    <a href={s.file_url} target="_blank" rel="noopener noreferrer" className="block w-full py-1.5 bg-slate-800 rounded-lg text-center text-[10px] font-bold hover:bg-slate-700">Download Submission</a>
                                  </div>
                                ))
                              )}
                              {submissions.length === 0 && (
                                <div className="p-12 text-center">
                                  <p className="text-slate-600 text-sm italic">No history to display</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                );
              case 'Analytics':
                return (
                  <div className="px-8 pb-12 space-y-8">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-3xl font-extrabold tracking-tight text-lectra-text">Class Analytics</h2>
                        <p className="text-lectra-muted mt-1">Deep insights into student engagement and performance.</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                       <div className="bg-lectra-card p-8 rounded-3xl border border-lectra-border h-96 flex flex-col">
                          <h4 className="text-lg font-bold text-lectra-text mb-6 flex items-center gap-2">
                             <Activity className="size-5 text-lectra-primary" />
                             Attendance Trends
                          </h4>
                          <div className="flex-1 min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                                <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} axisLine={false} tickLine={false} />
                                <YAxis stroke="#94A3B8" fontSize={10} axisLine={false} tickLine={false} />
                                <Tooltip 
                                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }} 
                                  cursor={{ fill: 'rgba(79, 70, 229, 0.1)' }}
                                />
                                <Bar dataKey="value" fill="#4F46E5" radius={[6, 6, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                       </div>
                       <div className="bg-lectra-card p-8 rounded-3xl border border-lectra-border h-96">
                          <h4 className="text-lg font-bold text-lectra-text mb-6">Engagement Distribution</h4>
                          <div className="flex items-center justify-center h-full">
                             <div className="text-center group">
                                <Activity className="size-16 text-lectra-muted mx-auto mb-4 group-hover:text-lectra-primary transition-colors animate-pulse-slow" />
                                <p className="text-lectra-muted text-xs max-w-xs mx-auto font-medium">Neural systems are tracking student attention patterns. Data will refresh in <span className="text-lectra-primary font-bold">4m 12s</span></p>
                             </div>
                          </div>
                       </div>
                       <div className="lg:col-span-2">
                          <WeeklySummaryCard classId={selectedClass?.id} />
                       </div>
                    </div>
                  </div>
                );
              case 'Revision Hub':
                return (
                  <div className="px-8 pb-12">
                    <RevisionHub classId={selectedClass?.id} />
                  </div>
                );
              case 'Study Rooms':
              case 'Students':
                return (
                   <div className="px-8 pb-12">
                     {user?.role === 'student' ? (
                        <div className="space-y-12">
                          <div>
                            <h2 className="text-3xl font-extrabold tracking-tight mb-6">Classmates</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                              {classmates.map((c) => (
                                <div key={c.id} className="flex flex-col items-center p-4 bg-slate-900 shadow-sm rounded-3xl border border-white/5 hover:border-primary/30 transition-all cursor-default">
                                  <img 
                                    src={`https://ui-avatars.com/api/?name=${c.name}&background=random`} 
                                    className="size-16 rounded-2xl mb-3 shadow-inner" 
                                    alt={c.name} 
                                  />
                                  <p className="text-xs font-bold text-center truncate w-full">{c.name}</p>
                                  <p className="text-[10px] text-slate-500 truncate w-full text-center">{c.email}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                          <StudyRooms classId={selectedClass?.id} />
                        </div>
                     ) : (
                        <div className="space-y-6">
                           <div className="flex justify-between items-center">
                              <div>
                                <h2 className="text-3xl font-extrabold tracking-tight">Student Engagement Monitor</h2>
                                <p className="text-slate-400 mt-1">Real-time performance tracking for {selectedClass?.title || 'all classes'}</p>
                              </div>
                           </div>
                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {[
                                { name: 'Alex Rivera', attendance: '98%', participation: 94, progress: 88 },
                                { name: 'Sarah Chen', attendance: '92%', participation: 82, progress: 95 },
                                { name: 'Mark Wilson', attendance: '64%', participation: 45, progress: 30 },
                                { name: 'Emma Davis', attendance: '88%', participation: 78, progress: 82 },
                                { name: 'James Knight', attendance: '95%', participation: 91, progress: 89 },
                              ].map((student, i) => (
                                <div key={i} className="bg-slate-900/50 border border-white/5 rounded-3xl p-6 hover:bg-slate-900 transition-all">
                                   <div className="flex items-center gap-4 mb-6">
                                      <img src={`https://ui-avatars.com/api/?name=${student.name}&background=random`} alt="" className="size-12 rounded-2xl" />
                                      <div>
                                         <h5 className="font-bold">{student.name}</h5>
                                         <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Attendance: {student.attendance}</p>
                                      </div>
                                   </div>
                                   <div className="space-y-4">
                                      <div>
                                         <div className="flex justify-between text-[10px] font-bold mb-1">
                                            <span className="text-slate-500">PARTICIPATION</span>
                                            <span className={student.participation < 60 ? 'text-red-500' : 'text-primary'}>{student.participation}%</span>
                                         </div>
                                         <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                                            <div className={cn("h-full transition-all", student.participation < 60 ? 'bg-red-500' : 'bg-primary')} style={{ width: `${student.participation}%` }} />
                                         </div>
                                      </div>
                                      <div>
                                         <div className="flex justify-between text-[10px] font-bold mb-1">
                                            <span className="text-slate-500">COURSE PROGRESS</span>
                                            <span className="text-emerald-500">{student.progress}%</span>
                                         </div>
                                         <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500 transition-all" style={{ width: `${student.progress}%` }} />
                                         </div>
                                      </div>
                                   </div>
                                   <div className="mt-6 flex gap-2">
                                      <button className="flex-1 py-2 bg-slate-800 rounded-xl text-[10px] font-bold hover:bg-slate-700 transition-all text-slate-400">MESSAGE</button>
                                      <button className="flex-1 py-2 bg-primary/10 text-primary rounded-xl text-[10px] font-bold hover:bg-primary hover:text-white transition-all">VIEW PROFILE</button>
                                   </div>
                                </div>
                              ))}
                           </div>
                        </div>
                     )}
                   </div>
                );
              case 'Live Lectures':
                return (
                  <div className="px-8 pb-12 space-y-6">
                     <div className="flex justify-between items-center">
                        <div>
                          <h2 className="text-3xl font-extrabold tracking-tight">Live Lectures</h2>
                          <p className="text-slate-400 mt-1">Direct control center for virtual classroom sessions.</p>
                        </div>
                        <div className="flex gap-3">
                           <button className="flex items-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700">
                             <Calendar className="size-5" />
                             Schedule
                           </button>
                           <button 
                             onClick={() => onStartClass(selectedClass?.class_code || '')}
                             className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:brightness-110 shadow-lg shadow-primary/20"
                           >
                             <Radio className="size-5" />
                             Start Session
                           </button>
                        </div>
                     </div>
                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                           <div className="bg-slate-900 border border-white/5 rounded-3xl p-8">
                              <h4 className="text-lg font-bold mb-6 flex items-center justify-between">
                                 Active Participants
                                 <span className="text-[10px] bg-primary/10 text-primary px-3 py-1 rounded-full uppercase tracking-widest font-black">42 Online</span>
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 {[1,2,3,4,5,6].map(i => (
                                   <div key={i} className="flex items-center justify-between p-4 bg-slate-800/30 rounded-2xl border border-white/5 hover:border-primary/20 transition-all">
                                      <div className="flex items-center gap-3">
                                         <div className="size-9 bg-slate-700 rounded-xl" />
                                         <div>
                                            <p className="text-sm font-bold">Student {i}</p>
                                            <p className="text-[10px] text-emerald-500 font-bold">LIFELINE ESTABLISHED</p>
                                         </div>
                                      </div>
                                      <button className="size-8 bg-slate-700/50 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors">
                                         <Radio className="size-4" />
                                      </button>
                                   </div>
                                 ))}
                              </div>
                           </div>
                        </div>
                        <div className="space-y-6">
                           <div className="bg-slate-900 border border-white/5 rounded-3xl p-8">
                              <h4 className="text-lg font-bold mb-6">Interaction Tools</h4>
                              <div className="grid grid-cols-1 gap-3">
                                 <button className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-2xl hover:bg-primary hover:text-white group transition-all">
                                    <div className="flex items-center gap-3">
                                       <Award className="size-5 text-primary group-hover:text-white transition-colors" />
                                       <span className="text-sm font-bold">Collaborative Whiteboard</span>
                                    </div>
                                    <Plus className="size-4" />
                                 </button>
                                 <button className="flex items-center justify-between p-4 bg-slate-800/50 border border-white/5 rounded-2xl hover:bg-slate-800 transition-all">
                                    <div className="flex items-center gap-3">
                                       <Activity className="size-5 text-orange-500" />
                                       <span className="text-sm font-bold">Launch Surprise Poll</span>
                                    </div>
                                    <Plus className="size-4" />
                                 </button>
                                 <button className="flex items-center justify-between p-4 bg-slate-800/50 border border-white/5 rounded-2xl hover:bg-slate-800 transition-all">
                                    <div className="flex items-center gap-3">
                                       <Users className="size-5 text-emerald-500" />
                                       <span className="text-sm font-bold">Create Breakout Rooms</span>
                                    </div>
                                    <Plus className="size-4" />
                                 </button>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
                );
              case 'AI Insights':
                return (
                  <div className="px-8 pb-12 space-y-8">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-3xl font-extrabold tracking-tight">AI Insights</h2>
                        <p className="text-slate-400 mt-1">Lectra's neural patterns analyzing your classroom data.</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       <div className="bg-slate-900 p-8 rounded-3xl border border-primary/10 relative overflow-hidden group col-span-1">
                          <Brain className="absolute -right-8 -bottom-8 size-40 opacity-5 text-primary group-hover:scale-110 transition-transform" />
                          <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                             <Sparkles className="size-4 text-primary" />
                             Lecture Summarizer
                          </h4>
                          <p className="text-xs text-slate-500 mb-8 leading-relaxed">Turn hour-long lectures into distilled, 5-minute reading experiences for your students automatically.</p>
                          <button className="px-6 py-2.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Generate Summary</button>
                       </div>
                       <div className="bg-slate-900 p-8 rounded-3xl border border-primary/10 relative overflow-hidden group col-span-1">
                          <Activity className="absolute -right-8 -bottom-8 size-40 opacity-5 text-emerald-500 group-hover:scale-110 transition-transform" />
                          <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                             <TrendingUp className="size-4 text-emerald-500" />
                             Smart Quizzing
                          </h4>
                          <p className="text-xs text-slate-500 mb-8 leading-relaxed">Let AI generate context-aware quizzes based specifically on the live discussions and questions from today.</p>
                          <button className="px-6 py-2.5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Create Quiz</button>
                       </div>
                       <div className="bg-slate-900 p-8 rounded-3xl border border-primary/10 relative overflow-hidden group col-span-1">
                          <Mail className="absolute -right-8 -bottom-8 size-40 opacity-5 text-orange-500 group-hover:scale-110 transition-transform" />
                          <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                             <Zap className="size-4 text-orange-500" />
                             Insight Exports
                          </h4>
                          <p className="text-xs text-slate-500 mb-8 leading-relaxed">Export pedagogical insights to share with department heads or for your own academic record keeping.</p>
                          <button className="px-6 py-2.5 bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Export Report</button>
                       </div>
                    </div>
                  </div>
                );
              case 'Content Library':
                return (
                  <div className="px-8 pb-12 space-y-8">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-3xl font-extrabold tracking-tight">Content Library</h2>
                        <p className="text-slate-400 mt-1">Manage learning assets and recorded knowledge.</p>
                      </div>
                      {user?.role === 'teacher' && (
                        <div className="relative">
                          <input 
                            type="file" 
                            id="library-upload" 
                            className="hidden" 
                            onChange={(e) => handleFileUpload(e, 'other')}
                          />
                          <button 
                            disabled={isUploading}
                            onClick={() => document.getElementById('library-upload')?.click()}
                            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 disabled:opacity-50"
                          >
                            <FileUp className="size-5" />
                            {isUploading ? 'Uploading...' : 'Upload New Materials'}
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                       {materials.length > 0 ? materials.map((item) => (
                         <div key={item.id} className="bg-slate-900 border border-white/5 rounded-3xl p-6 hover:border-primary/40 transition-all group cursor-pointer text-center relative">
                            {user?.role === 'teacher' && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (window.confirm('Delete this material?')) {
                                    axios.delete(`${API_URL}/library/${item.id}`).then(() => fetchMaterials(selectedClass.id));
                                  }
                                }}
                                className="absolute top-2 right-2 p-1 text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Plus className="size-4 rotate-45" />
                              </button>
                            )}
                            <a href={item.url} target="_blank" rel="noopener noreferrer" className="block">
                              <div className="size-16 bg-slate-800 rounded-2xl flex items-center justify-center text-slate-500 mx-auto mb-4 group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
                                {item.type === 'video' ? <Video className="size-8" /> : <FileText className="size-8" />}
                              </div>
                              <h5 className="font-bold text-xs truncate mb-1">{item.title}</h5>
                              <p className="text-[10px] font-bold text-slate-600 uppercase">{item.type} • {item.size}</p>
                            </a>
                         </div>
                       )) : (
                         <div className="col-span-full py-20 text-center bg-slate-900/30 rounded-3xl border border-white/5">
                            <Library className="size-12 text-slate-700 mx-auto mb-4" />
                            <p className="text-slate-500 text-sm">No materials uploaded for this class yet.</p>
                         </div>
                       )}
                       {user?.role === 'teacher' && materials.length > 0 && (
                         <button 
                          onClick={() => document.getElementById('library-upload')?.click()}
                          className="border-2 border-dashed border-slate-800 rounded-3xl p-6 flex flex-col items-center justify-center text-slate-700 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all group"
                         >
                            <Plus className="size-10 mb-2 group-hover:scale-110 transition-transform" />
                            <p className="text-[10px] font-bold uppercase">Add More</p>
                         </button>
                       )}
                    </div>
                  </div>
                );
              case 'Course Design':
                return (
                  <div className="px-8 pb-12">
                    <AiLecturePlanner />
                  </div>
                );
              case 'Smart Planner':
                return (
                  <div className="px-8 pb-12">
                    <AiStudyPlanner classId={selectedClass?.id} />
                  </div>
                );
              case 'Settings':
                return (
                  <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                    <div className="size-20 bg-slate-900 rounded-3xl flex items-center justify-center text-slate-700 mb-6 border border-white/5">
                      <Settings className="size-10" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Under Construction</h3>
                    <p className="text-slate-500 max-w-xs">The {currentTab} module is coming soon in the next update.</p>
                  </div>
                );
              case 'Classes':
                const filteredClasses = classes.filter(c => !!c.is_archived === showArchived);
                return (
                  <div className="px-8 pb-12 space-y-8">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-3xl font-extrabold tracking-tight text-lectra-text">{showArchived ? 'Archived' : 'My'} Classes</h2>
                        <p className="text-lectra-muted mt-1">Manage your {showArchived ? 'past' : 'active'} learning environments.</p>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex bg-lectra-card p-1 rounded-xl border border-lectra-border">
                          <button 
                            onClick={() => setShowArchived(false)}
                            className={cn("px-4 py-2 rounded-lg text-xs font-bold transition-all", !showArchived ? "bg-lectra-primary text-white shadow-lg" : "text-lectra-muted hover:text-lectra-text")}
                          >
                            Active
                          </button>
                          <button 
                            onClick={() => setShowArchived(true)}
                            className={cn("px-4 py-2 rounded-lg text-xs font-bold transition-all", showArchived ? "bg-lectra-primary text-white shadow-lg" : "text-lectra-muted hover:text-lectra-text")}
                          >
                            Archived
                          </button>
                        </div>
                        {user?.role === 'teacher' && (
                          <button 
                            onClick={() => setShowCreateModal(true)}
                            className="px-6 py-2.5 bg-lectra-primary text-white rounded-xl font-bold hover:bg-lectra-primaryHover shadow-lg shadow-lectra-primary/20"
                          >
                            Create New Class
                          </button>
                        )}
                        {user?.role === 'student' && (
                          <button 
                            onClick={() => setShowJoinModal(true)}
                            className="px-6 py-2.5 bg-lectra-primary text-white rounded-xl font-bold hover:bg-lectra-primaryHover shadow-lg shadow-lectra-primary/20"
                          >
                            Join Class
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredClasses.length > 0 ? filteredClasses.map((c) => (
                        <div key={c.id} className="glass-card p-8 rounded-[2.5rem] border border-lectra-border bg-lectra-card/50 hover:bg-lectra-card transition-all group relative overflow-hidden">
                           <div className="flex justify-between items-start mb-6">
                             <div className="size-14 bg-lectra-primary/10 rounded-2xl flex items-center justify-center text-lectra-primary group-hover:bg-lectra-primary group-hover:text-white transition-all shadow-xl">
                               <School className="size-8" />
                             </div>
                             {user?.role === 'teacher' && (
                               <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <button 
                                  onClick={() => archiveClass(c.id, !c.is_archived)}
                                  className="p-2 bg-lectra-background rounded-lg text-lectra-muted hover:text-lectra-primary transition-colors border border-lectra-border"
                                  title={c.is_archived ? "Unarchive" : "Archive"}
                                 >
                                   <History className="size-4" />
                                 </button>
                                 <button 
                                  onClick={() => deleteClass(c.id)}
                                  className="p-2 bg-lectra-background rounded-lg text-lectra-muted hover:text-lectra-danger transition-colors border border-lectra-border"
                                  title="Delete"
                                 >
                                   <Plus className="size-4 rotate-45" />
                                 </button>
                               </div>
                             )}
                           </div>
                           <h4 className="text-xl font-bold mb-2 text-lectra-text">{c.name}</h4>
                           <p className="text-sm text-lectra-muted mb-8 line-clamp-1">{c.description || 'No description provided.'}</p>
                           
                           <div className="flex items-center justify-between pt-6 border-t border-lectra-border/50">
                             <div className="flex flex-col">
                               <span className="text-[10px] uppercase font-black text-lectra-muted tracking-widest">Class Code</span>
                               <span className="text-sm font-mono font-bold text-lectra-primary">{c.class_code}</span>
                             </div>
                             <button 
                              onClick={() => {
                                setSelectedClass(c);
                                setCurrentTab(user?.role === 'teacher' ? 'Dashboard' : 'Students');
                              }}
                              className="px-6 py-2 bg-lectra-primary/10 hover:bg-lectra-primary hover:text-white text-lectra-primary rounded-xl text-xs font-bold transition-all border border-lectra-primary/20"
                             >
                               Open Class
                             </button>
                           </div>
                        </div>
                      )) : (
                        <div className="col-span-full py-20 text-center bg-lectra-card/30 rounded-[2.5rem] border border-lectra-border">
                          <BookOpen className="size-12 text-lectra-muted mx-auto mb-4" />
                          <p className="text-lectra-muted font-medium">No {showArchived ? 'archived' : 'active'} classes found.</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              default:
                if (!selectedClass && ['Dashboard', 'Assignments', 'Students', 'Analytics', 'Content Library', 'Smart Planner', 'Revision Hub'].includes(currentTab)) {
                  return (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                      <div className="size-20 bg-slate-900 rounded-3xl flex items-center justify-center text-slate-700 mb-6 border border-white/5">
                        <BookOpen className="size-10" />
                      </div>
                      <h3 className="text-2xl font-bold mb-2">No Class Selected</h3>
                      <p className="text-slate-500 max-w-xs mb-8">Please select a class from the "Classes" tab to view its {currentTab.toLowerCase()}.</p>
                      <button 
                        onClick={() => setCurrentTab('Classes')}
                        className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20"
                      >
                        Go to Classes
                      </button>
                    </div>
                  );
                }
                return null;
            }
          })()}
        </div>
      </main>

      {user?.role === 'student' && selectedClass && (
        <AiAssistant classId={selectedClass.id} />
      )}


      {/* Create Class Modal */}
      <CreateClassModal 
        show={showCreateModal} 
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateClass}
      />


      {/* Join Class Modal */}
      <AnimatePresence>
        {showJoinModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-lectra-background/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-lectra-card border border-lectra-border rounded-3xl p-8 shadow-2xl"
            >
              <h3 className="text-2xl font-bold mb-2 text-center text-lectra-text font-outfit">Join a Class</h3>
              <p className="text-lectra-muted text-sm mb-8 text-center">Enter the 6-character code provided by your teacher</p>
              <form onSubmit={handleJoinClass} className="space-y-4">
                <input 
                  value={classCode}
                  onChange={(e) => setClassCode(e.target.value)}
                  className="w-full bg-lectra-background border border-lectra-border rounded-xl py-4 text-center text-3xl font-black tracking-widest text-lectra-primary uppercase placeholder:text-slate-800 placeholder:font-normal focus:border-lectra-primary outline-none transition-all"
                  placeholder="CODE"
                  maxLength={6}
                  required
                />
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowJoinModal(false)}
                    className="flex-1 py-3 border border-lectra-border rounded-xl font-bold hover:bg-white/5 transition-all text-lectra-text"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-lectra-primary rounded-xl font-bold text-white hover:bg-lectra-primaryHover transition-all shadow-lg shadow-lectra-primary/20"
                  >
                    Join
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Assignment Modal */}
      <AnimatePresence>
        {showAssignmentModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-lectra-background/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-lectra-card border border-lectra-border rounded-3xl p-8 shadow-2xl"
            >
              <h3 className="text-2xl font-bold mb-6 text-lectra-text">New Assignment</h3>
              <form onSubmit={handleCreateAssignment} className="space-y-4">
                <div>
                  <label className="text-xs font-black text-lectra-muted uppercase tracking-widest px-1">Title</label>
                  <input 
                    value={newAssignment.title}
                    onChange={(e) => setNewAssignment({...newAssignment, title: e.target.value})}
                    className="w-full bg-lectra-background border border-lectra-border rounded-xl py-3 px-4 text-lectra-text mt-1.5 focus:border-lectra-primary outline-none transition-all"
                    placeholder="e.g. Midterm Project"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-lectra-muted uppercase tracking-widest px-1">Description</label>
                  <textarea 
                    value={newAssignment.description}
                    onChange={(e) => setNewAssignment({...newAssignment, description: e.target.value})}
                    className="w-full bg-lectra-background border border-lectra-border rounded-xl py-3 px-4 text-lectra-text mt-1.5 h-24 focus:border-lectra-primary outline-none transition-all resize-none"
                    placeholder="Assignment details..."
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-xs font-black text-lectra-muted uppercase tracking-widest px-1">Due Date</label>
                    <input 
                      type="date"
                      value={newAssignment.dueDate}
                      onChange={(e) => setNewAssignment({...newAssignment, dueDate: e.target.value})}
                      className="w-full bg-lectra-background border border-lectra-border rounded-xl py-3 px-4 text-lectra-text mt-1.5 focus:border-lectra-primary outline-none transition-all"
                      required
                    />
                  </div>
                  <div className="w-24">
                    <label className="text-xs font-black text-lectra-muted uppercase tracking-widest px-1">Max Score</label>
                    <input 
                      type="number"
                      value={newAssignment.maxScore}
                      onChange={(e) => setNewAssignment({...newAssignment, maxScore: parseInt(e.target.value)})}
                      className="w-full bg-lectra-background border border-lectra-border rounded-xl py-3 px-4 text-lectra-text mt-1.5 focus:border-lectra-primary outline-none transition-all"
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-6">
                  <button 
                    type="button"
                    onClick={() => setShowAssignmentModal(false)}
                    className="flex-1 py-3 border border-lectra-border rounded-xl font-bold text-lectra-text hover:bg-white/5 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-lectra-primary rounded-xl font-bold text-white hover:bg-lectra-primaryHover transition-all shadow-lg shadow-lectra-primary/20"
                  >
                    Create
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Submit Assignment Modal */}
      <AnimatePresence>
        {showSubmitModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-lectra-background/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-lectra-card border border-lectra-border rounded-3xl p-8 text-center shadow-2xl"
            >
              <h3 className="text-2xl font-bold mb-2 text-lectra-text font-outfit">Submit Assignment</h3>
              <p className="text-lectra-muted text-sm mb-6">{selectedAssignment?.title}</p>
              
              <form onSubmit={handleSubmitAssignment} className="space-y-6">
                <div className="border-2 border-dashed border-lectra-border/50 rounded-2xl p-8 hover:border-lectra-primary transition-colors cursor-pointer relative group bg-lectra-background/50">
                  <input 
                    type="file" 
                    onChange={(e) => setAssignmentFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  <FileUp className="size-10 text-lectra-muted mx-auto mb-4 group-hover:text-lectra-primary transition-colors" />
                  <p className="text-sm font-medium text-lectra-text">
                    {assignmentFile ? assignmentFile.name : "Click or drag file back"}
                  </p>
                  <p className="text-[10px] text-lectra-muted mt-2 font-black uppercase tracking-widest">PDF, DOCX, or ZIP up to 10MB</p>
                </div>

                <div className="flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setShowSubmitModal(false)}
                    className="flex-1 py-3 border border-lectra-border rounded-xl font-bold text-lectra-text hover:bg-white/5 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-lectra-primary rounded-xl font-bold text-white hover:bg-lectra-primaryHover shadow-lg shadow-lectra-primary/20 transition-all font-black uppercase tracking-widest text-xs"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Grading Modal */}
      <AnimatePresence>
        {showGradingModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-lectra-background/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-lectra-card border border-lectra-border rounded-3xl p-8 shadow-2xl"
            >
              <h3 className="text-2xl font-bold mb-2 text-lectra-text">Grade Submission</h3>
              <p className="text-lectra-muted text-sm mb-6">{selectedSubmission?.users.name} - {selectedSubmission?.assignments.title}</p>
              
              <form onSubmit={handleGradeSubmission} className="space-y-4">
                <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="text-xs font-black text-lectra-muted uppercase tracking-widest px-1">Score (max {selectedSubmission?.assignments.max_score})</label>
                  <button 
                    type="button"
                    onClick={() => handleAiSuggestGrade(selectedSubmission.id)}
                    disabled={isAiGrading}
                    className="text-[10px] bg-lectra-primary/10 text-lectra-primary px-3 py-1.5 rounded-lg font-black uppercase tracking-widest flex items-center gap-2 hover:bg-lectra-primary hover:text-white transition-all disabled:opacity-50"
                  >
                    <Brain className={cn("size-3", isAiGrading && "animate-pulse")} />
                    {isAiGrading ? "Analyzing..." : "AI Suggest Score"}
                  </button>
                </div>
                <input 
                  type="number"
                  value={gradingInfo.grade}
                  onChange={(e) => setGradingInfo({ ...gradingInfo, grade: parseInt(e.target.value) })}
                  className="w-full bg-lectra-background border border-lectra-border rounded-xl py-3 px-4 text-lectra-text mt-1 focus:border-lectra-primary outline-none transition-all"
                  max={selectedSubmission?.assignments.max_score}
                  required
                />

                </div>
                <div>
                  <label className="text-xs font-black text-lectra-muted uppercase tracking-widest px-1">Feedback</label>
                  <textarea 
                    value={gradingInfo.feedback}
                    onChange={(e) => setGradingInfo({ ...gradingInfo, feedback: e.target.value })}
                    className="w-full bg-lectra-background border border-lectra-border rounded-xl py-3 px-4 text-lectra-text mt-1.5 h-32 focus:border-lectra-primary outline-none transition-all resize-none"
                    placeholder="Well done! Keep it up."
                  />
                </div>
                <div className="flex gap-3 pt-6">
                  <button 
                    type="button"
                    onClick={() => setShowGradingModal(false)}
                    className="flex-1 py-3 border border-lectra-border rounded-xl font-bold text-lectra-text hover:bg-white/5 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-lectra-primary rounded-xl font-bold text-white hover:bg-lectra-primaryHover shadow-lg shadow-lectra-primary/20 transition-all font-black uppercase tracking-widest text-xs"
                  >
                    Save Grade
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MetricCard({ icon: Icon, value, label, color, live, students, subtitle, progress, trend }: any) {
  const colors: any = {
    emerald: 'bg-lectra-success/10 text-lectra-success',
    primary: 'bg-lectra-primary/10 text-lectra-primary',
    orange: 'bg-lectra-warning/10 text-lectra-warning',
    purple: 'bg-lectra-accent/10 text-lectra-accent',
  };

  return (
    <div className="bg-lectra-card p-6 rounded-2xl border border-lectra-border shadow-sm relative overflow-hidden group">
      <div className="flex justify-between items-start mb-4">
        <div className={cn("p-2 rounded-lg", colors[color])}>
          <Icon className="size-5" />
        </div>
        {live && (
          <span className="flex items-center gap-1.5 text-[10px] font-black text-lectra-success uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-lectra-success animate-pulse" />
            Live Now
          </span>
        )}
      </div>
      <h3 className="text-2xl font-bold text-lectra-text">{value}</h3>
      <p className="text-sm text-lectra-muted">{label}</p>
      
      {students && (
        <div className="mt-4 flex -space-x-2">
          {students.map((s: string, i: number) => (
            <img key={i} className="w-7 h-7 rounded-full border-2 border-lectra-card object-cover" src={s} alt="Student" referrerPolicy="no-referrer" />
          ))}
          <div className="w-7 h-7 rounded-full bg-lectra-background border-2 border-lectra-card flex items-center justify-center text-[10px] font-bold text-lectra-muted font-black">+12</div>
        </div>
      )}

      {subtitle && (
        <div className="mt-4 text-[10px] font-black tracking-widest uppercase text-lectra-primary bg-lectra-primary/10 py-1 px-3 rounded-full w-fit">
          {subtitle}
        </div>
      )}

      {progress !== undefined && (
        <div className="mt-4 flex items-center gap-2">
          <div className="flex-1 bg-lectra-background h-1.5 rounded-full overflow-hidden border border-lectra-border/30">
            <div className="bg-lectra-warning h-full" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-[10px] font-black text-lectra-muted">{progress}%</span>
        </div>
      )}

      {trend && (
        <div className="mt-4 flex items-center gap-1 text-lectra-success font-black text-[10px] tracking-widest uppercase">
          <TrendingUp className="size-4" />
          {trend}
        </div>
      )}
    </div>
  );
}

function TimelineItem({ time, title, location, icon: Icon = MapPin, active, last, onClick }: any) {
  return (
    <div className="flex gap-4 relative cursor-pointer group" onClick={onClick}>
      <div className="flex flex-col items-center">
        <div className={cn(
          "size-3 rounded-full border-2 border-lectra-card transition-all",
          active ? "bg-lectra-primary ring-4 ring-lectra-primary/20 scale-110" : "bg-lectra-border group-hover:bg-lectra-muted"
        )} />
        {!last && <div className="w-0.5 flex-1 bg-lectra-border/50 my-1 rounded-full" />}
      </div>
      <div className="pb-4">
        <p className={cn("text-[10px] font-black uppercase tracking-widest transition-colors", active ? "text-lectra-primary" : "text-lectra-muted group-hover:text-lectra-text")}>{time}</p>
        <h5 className={cn("text-sm font-bold mt-1 transition-colors", active ? "text-lectra-text" : "text-lectra-muted group-hover:text-lectra-text")}>{title}</h5>
        <p className="text-[10px] text-lectra-muted mt-1 flex items-center gap-1 font-bold">
          <Icon className="size-3" />
          {location.toUpperCase()}
        </p>
      </div>
    </div>
  );
}

function FeedbackItem({ name, tag, color, text, img }: any) {
  const colors: any = {
    emerald: 'bg-lectra-success/20 text-lectra-success border-lectra-success/20',
    blue: 'bg-lectra-primary/20 text-lectra-primary border-lectra-primary/20',
  };

  return (
    <div className="flex gap-4 p-5 rounded-2xl bg-lectra-background/50 border border-lectra-border/50 hover:bg-lectra-background transition-all">
      <img className="size-12 rounded-2xl object-cover ring-2 ring-lectra-border shadow-md" src={img} alt={name} referrerPolicy="no-referrer" />
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm font-bold text-lectra-text">{name}</span>
          <span className={cn("text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest border", colors[color])}>{tag}</span>
        </div>
        <p className="text-xs text-lectra-muted leading-relaxed line-clamp-2 italic">"{text}"</p>
      </div>
    </div>
  );
}

function WeeklySummaryCard({ classId }: { classId: string }) {
  const [summary, setSummary] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5002'}/classroom-extras/ai/weekly-summary`, { classId });
      setSummary(res.data.summary);
    } catch (e) {
      alert('Failed to generate summary');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-lectra-card border border-lectra-border rounded-3xl p-8 space-y-6 h-full relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
        <Sparkles className="size-24 text-lectra-primary" />
      </div>
      <div className="flex items-center justify-between relative z-10">
        <h3 className="text-xl font-bold flex items-center gap-3 text-lectra-text">
          <div className="size-10 bg-lectra-primary/10 rounded-xl flex items-center justify-center text-lectra-primary">
            <Sparkles className="size-6" />
          </div>
          AI Weekly Summary
        </h3>
        <button 
          onClick={generate}
          disabled={loading}
          className="text-[10px] font-black uppercase tracking-widest text-white bg-lectra-primary px-4 py-2 rounded-xl hover:bg-lectra-primaryHover transition-all disabled:opacity-50 shadow-lg shadow-lectra-primary/20"
        >
          {loading ? 'Generating...' : 'Regenerate'}
        </button>
      </div>
      
      {summary ? (
        <div className="prose prose-invert prose-sm max-w-none max-h-80 overflow-y-auto custom-scrollbar p-6 bg-lectra-background/50 rounded-2xl border border-lectra-border/50 relative z-10">
           <ReactMarkdown>{summary}</ReactMarkdown>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 opacity-50 py-16 relative z-10">
          <div className="size-16 bg-lectra-background rounded-full flex items-center justify-center border border-lectra-border">
            <FileText className="size-8 text-lectra-muted" />
          </div>
          <p className="text-sm text-lectra-muted max-w-[280px] font-medium leading-relaxed">Let AI distill a week of learning into a comprehensive insights report for your records.</p>
        </div>
      )}
    </div>
  );
}

