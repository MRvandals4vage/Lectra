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
  Sparkles
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

const data = [
  { name: 'Week 1', value: 60 },
  { name: 'Week 2', value: 45 },
  { name: 'Week 3', value: 80 },
  { name: 'Week 4', value: 70 },
  { name: 'Week 5', value: 95 },
  { name: 'Week 6', value: 85 },
  { name: 'Week 7', value: 75 },
  { name: 'Week 8', value: 90 },
  { name: 'Week 9', value: 65 },
  { name: 'Week 10', value: 55 },
];

import CreateClassModal from './components/CreateClassModal';
import StudyRooms from './components/StudyRooms';
import RevisionHub from './components/RevisionHub';
import AiLecturePlanner from './components/AiLecturePlanner';
import AiStudyPlanner from './components/AiStudyPlanner';
import AiAssistant from './components/AiAssistant';
import ReactMarkdown from 'react-markdown';

export default function Dashboard({ onStartClass }: { onStartClass: (roomId: string) => void }) {



  const { user, logout } = useAuth();
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
  const [currentTab, setCurrentTab] = React.useState('Dashboard');
  const [isAiGrading, setIsAiGrading] = React.useState(false);

  React.useEffect(() => {
    fetchClasses();
  }, []);

  React.useEffect(() => {
    if (selectedClass) {
      fetchAssignments(selectedClass.id);
      fetchSubmissions(selectedClass.id);
      fetchAnalytics(selectedClass.id);
    }
  }, [selectedClass]);

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
    } catch (err) {
      alert('Error creating class');
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
      await axios.post(`${API_URL}/grade`, {
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
    <div className="flex h-screen overflow-hidden bg-background-dark">
      {/* Sidebar */}
      <aside className="w-64 border-r border-primary/20 bg-background-dark flex flex-col h-full shrink-0">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white">
            <School className="size-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight">Nexus</h1>
            <p className="text-xs text-slate-400">Classroom Pro</p>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {[
            { icon: LayoutDashboard, label: 'Dashboard' },
            { icon: BookOpen, label: 'Classes' },
            { icon: FileText, label: 'Assignments' },
            { icon: Users, label: user?.role === 'teacher' ? 'Students' : 'Study Rooms' },
            { icon: user?.role === 'teacher' ? Zap : Sparkles, label: user?.role === 'teacher' ? 'Course Design' : 'Smart Planner' },
            { icon: LineChart, label: user?.role === 'teacher' ? 'Analytics' : 'Revision Hub' },
            { icon: Settings, label: 'Settings' },

          ].map((item) => (
            <button 
              key={item.label}
              onClick={() => setCurrentTab(item.label)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors",
                currentTab === item.label ? "bg-primary/10 text-primary" : "text-slate-400 hover:bg-primary/10 hover:text-primary"
              )}
            >
              <item.icon className="size-5" />
              {item.label}
            </button>
          ))}
        </nav>


        <div className="p-4 mt-auto">
          <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Storage Usage</p>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mb-2">
              <div className="bg-primary h-full w-3/4 rounded-full" />
            </div>
            <p className="text-[10px] text-slate-500">75% of 10GB plan used</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-slate-50/5 relative">
        {/* Header */}
        <header className="sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
          <div className="flex-1 flex justify-center">
            <div className="flex items-center bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-full px-4 py-2 shadow-2xl w-full max-w-2xl gap-4">
              <div className="flex items-center gap-2 text-slate-400 flex-1">
                <Search className="size-5" />
                <input 
                  className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder-slate-500" 
                  placeholder="Search classrooms, students, or resources..." 
                  type="text"
                />
                <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 font-mono">⌘K</span>
              </div>
              <div className="h-6 w-[1px] bg-slate-800" />
              <div className="flex items-center gap-2 shrink-0">
                <button className="p-2 text-slate-500 hover:bg-slate-800 rounded-full"><Bell className="size-5" /></button>
                <button className="p-2 text-slate-500 hover:bg-slate-800 rounded-full"><Mail className="size-5" /></button>
                <div className="w-8 h-8 rounded-full overflow-hidden border border-primary/20 cursor-pointer" onClick={logout}>
                  <img className="w-full h-full object-cover" src={`https://ui-avatars.com/api/?name=${user?.name}&background=6366f1&color=fff`} alt="Profile" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {currentTab === 'Dashboard' && (
          <div className="px-8 pb-12 space-y-8">
            {/* Welcome & Actions */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h2 className="text-3xl font-extrabold tracking-tight">Welcome back, {user?.name}</h2>
                <p className="text-slate-400 mt-1">You have {classes.length} active classes.</p>
              </div>
              <div className="flex gap-3">
                {user?.role === 'teacher' ? (
                  <button 
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg font-semibold text-sm hover:brightness-110 transition-all shadow-lg shadow-primary/20"
                  >
                    <Plus className="size-5" />
                    Create Class
                  </button>
                ) : (
                  <button 
                    onClick={() => setShowJoinModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg font-semibold text-sm hover:brightness-110 transition-all shadow-lg shadow-primary/20"
                  >
                    <Plus className="size-5" />
                    Join Class
                  </button>
                )}
                <button 
                  onClick={() => selectedClass ? onStartClass(selectedClass.class_code) : alert('Select a class first')}
                  className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 border border-slate-700 text-slate-200 rounded-lg font-semibold text-sm hover:bg-slate-700 transition-all"
                >
                  <Video className="size-5" />
                  Start Meeting
                </button>
                <button 
                  onClick={() => setShowAssignmentModal(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 border border-slate-700 text-slate-200 rounded-lg font-semibold text-sm hover:bg-slate-700 transition-all"
                >
                  <FilePlus className="size-5" />
                  New Assignment
                </button>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard 
                icon={Radio} 
                value={classes.filter(c => !c.is_archived).length.toString().padStart(2, '0')} 
                label="Active Classrooms" 
                color="emerald" 
                live 
                students={['https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1974&auto=format&fit=crop', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop']} 
              />
              <MetricCard icon={Calendar} value="04" label="Meetings Today" color="primary" subtitle="Next: Advanced UI at 2:30 PM" />
              <MetricCard 
                icon={Clock} 
                value={submissions.filter(s => !s.grade).length.toString()} 
                label="To be Graded" 
                color="orange" 
                progress={submissions.length > 0 ? Math.round((submissions.filter(s => s.grade).length / submissions.length) * 100) : 0} 
              />
              <MetricCard 
                icon={LineChart} 
                value={classAnalytics ? `${classAnalytics.avgEngagement}%` : "94%"} 
                label="Avg. Engagement" 
                color="purple" 
                trend={classAnalytics ? `${classAnalytics.studentCount} Students Active` : "+4.2% from last week"} 
              />
            </div>


            {/* Charts & Timeline */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-slate-900 p-8 rounded-3xl border border-primary/10 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h4 className="text-lg font-bold">Participation Trends</h4>
                    <p className="text-sm text-slate-500">Attendance and activity per lecture</p>
                  </div>
                  <select className="bg-slate-800 border-none rounded-lg text-xs font-semibold focus:ring-primary text-slate-300">
                    <option>Last 30 Days</option>
                    <option>This Quarter</option>
                  </select>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {data.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 4 ? '#256af4' : '#256af433'} className="hover:fill-primary transition-colors cursor-pointer" />
                        ))}
                      </Bar>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                        itemStyle={{ color: '#fff' }}
                        cursor={{ fill: 'transparent' }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-between mt-4 px-2 text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
                  <span>Week 1</span>
                  <span>Week 2</span>
                  <span>Week 3</span>
                  <span>Week 4</span>
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
                        location={`Code: ${cls.class_code}`} 
                        active={selectedClass?.id === cls.id} 
                        last={idx === classes.length - 1}
                        onClick={() => setSelectedClass(cls)}
                      />
                    ))
                  ) : (
                    <p className="text-slate-500 text-sm text-center py-10">No classes found.</p>
                  )}
                </div>
                <button className="w-full mt-6 py-3 border-2 border-dashed border-slate-800 rounded-xl text-slate-500 text-xs font-bold hover:border-primary hover:text-primary transition-all">
                  + ADD NEW SLOT
                </button>
              </div>
            </div>

            {/* Secondary Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {user?.role === 'student' ? (
                <div className="bg-gradient-to-br from-primary to-blue-700 p-8 rounded-3xl text-white shadow-xl shadow-primary/30">
                  <div className="flex justify-between items-start mb-12">
                    <div>
                      <h4 className="text-2xl font-black italic uppercase tracking-tighter mb-2">Nexus Live</h4>
                      <p className="text-white/70 text-sm">Optimizing classroom performance</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase">
                      PRO VERSION
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                      <Brain className="size-8 mb-2" />
                      <div className="text-2xl font-bold">88%</div>
                      <div className="text-[10px] font-bold uppercase text-white/60 tracking-wider">Focus Rate</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                      <Zap className="size-8 mb-2" />
                      <div className="text-2xl font-bold">12ms</div>
                      <div className="text-[10px] font-bold uppercase text-white/60 tracking-wider">Sync Latency</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-900 p-8 rounded-3xl border border-primary/10 shadow-sm overflow-hidden relative flex flex-col min-h-[400px]">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Users className="size-24" />
                  </div>
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-lg font-bold">Student Submissions</h4>
                    <button onClick={() => setCurrentTab('Assignments')} className="text-xs text-primary font-bold hover:underline">View All</button>
                  </div>
                  <div className="space-y-4 overflow-y-auto pr-2 flex-1">
                    {submissions.length > 0 ? (
                      submissions.slice(0, 3).map((s: any) => (
                        <div key={s.id} className="p-4 rounded-2xl bg-slate-800/50 hover:bg-slate-800 transition-colors border border-white/5">
                          <div className="flex justify-between items-center mb-2">
                            <div>
                              <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">{s.assignments.title}</p>
                              <h5 className="font-bold text-sm">{s.users.name}</h5>
                            </div>
                            {s.grade ? (
                              <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-500 rounded-full font-bold">Graded: {s.grade}</span>
                            ) : (
                              <button 
                                onClick={() => {
                                  setSelectedSubmission(s);
                                  setShowGradingModal(true);
                                  setGradingInfo({ grade: s.grade || 0, feedback: s.feedback || '' });
                                }}
                                className="text-[10px] px-2 py-1 bg-primary text-white rounded-md font-bold hover:brightness-110"
                              >
                                Grade Now
                              </button>
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-3 text-[10px] text-slate-500">
                            <span>{new Date(s.submitted_at).toLocaleString()}</span>
                            <a href={s.file_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                              <FileText className="size-3" />
                              View File
                            </a>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-10 text-slate-500 text-sm italic">
                        No submissions to review.
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="bg-slate-900 p-8 rounded-3xl border border-primary/10 shadow-sm overflow-hidden relative flex flex-col min-h-[400px]">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <FileText className="size-24" />
                </div>
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-lg font-bold">Class Assignments</h4>
                  <button onClick={() => setCurrentTab('Assignments')} className="text-xs text-primary font-bold hover:underline">Manage All</button>
                </div>
                <div className="space-y-4 overflow-y-auto pr-2 flex-1">
                  {assignments.length > 0 ? (
                    assignments.slice(0, 3).map((as: any) => (
                      <div key={as.id} className="p-4 rounded-2xl bg-slate-800/50 hover:bg-slate-800 transition-colors border border-white/5">
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-bold text-sm">{as.title}</h5>
                          <span className="text-[10px] px-2 py-0.5 bg-primary/20 text-primary rounded-full font-bold">
                            {as.max_score} pts
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-1 mb-3">{as.description}</p>
                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex items-center gap-2 text-[10px] text-slate-500">
                            <Clock className="size-3" />
                            Due: {new Date(as.due_date).toLocaleDateString()}
                          </div>
                          {user?.role === 'student' && (
                            <button 
                              onClick={() => {
                                setSelectedAssignment(as);
                                setShowSubmitModal(true);
                              }}
                              className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1"
                            >
                              <FileUp className="size-3" />
                              Submit
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10">
                      <p className="text-slate-500 text-sm italic">No assignments for this class yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {(currentTab === 'Analytics' || currentTab === 'Revision Hub') && (
          <div className="px-8 pb-12 space-y-8">
            {user?.role === 'teacher' ? (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-extrabold tracking-tight">Class Analytics</h2>
                    <p className="text-slate-400 mt-1">Deep insights into student engagement and performance.</p>
                  </div>
                </div>
                {/* Analytics components here */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                   <div className="bg-slate-900 p-8 rounded-3xl border border-primary/10 h-80 flex flex-col items-center justify-center text-center">
                      <TrendingUp className="size-12 text-primary mb-4" />
                      <h4 className="font-bold">Comparative Performance</h4>
                      <p className="text-sm text-slate-500 max-w-xs">AI-generated comparison with previous semesters will appear here.</p>
                   </div>
                   <div className="h-80">
                      <WeeklySummaryCard classId={selectedClass?.id} />
                   </div>
                </div>

              </>
            ) : (
              <RevisionHub classId={selectedClass?.id} />
            )}
          </div>
        )}

        {currentTab === 'Study Rooms' && (
          <div className="px-8 pb-12">
            <StudyRooms classId={selectedClass?.id} />
          </div>
        )}

        {currentTab === 'Course Design' && (
          <div className="px-8 pb-12">
            <AiLecturePlanner />
          </div>
        )}

        {currentTab === 'Smart Planner' && (
          <div className="px-8 pb-12">
            <AiStudyPlanner classId={selectedClass?.id} />
          </div>
        )}

        {currentTab === 'Assignments' && (


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
        )}

        {(currentTab !== 'Dashboard' && currentTab !== 'Assignments') && (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="size-20 bg-slate-900 rounded-3xl flex items-center justify-center text-slate-700 mb-6 border border-white/5">
              <Settings className="size-10" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Under Construction</h3>
            <p className="text-slate-500 max-w-xs">The {currentTab} module is coming soon in the next update.</p>
          </div>
        )}
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
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-8"
            >
              <h3 className="text-2xl font-bold mb-2 text-center">Join a Class</h3>
              <p className="text-slate-400 text-sm mb-8 text-center">Enter the 6-character code provided by your teacher</p>
              <form onSubmit={handleJoinClass} className="space-y-4">
                <input 
                  value={classCode}
                  onChange={(e) => setClassCode(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-4 text-center text-3xl font-black tracking-widest text-primary uppercase placeholder:text-slate-700 placeholder:font-normal"
                  placeholder="CODE"
                  maxLength={6}
                  required
                />
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowJoinModal(false)}
                    className="flex-1 py-3 border border-slate-700 rounded-xl font-bold hover:bg-slate-800 transition-all text-white"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-primary rounded-xl font-bold text-white hover:brightness-110 transition-all shadow-lg shadow-primary/20"
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
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8"
            >
              <h3 className="text-2xl font-bold mb-6 text-white">New Assignment</h3>
              <form onSubmit={handleCreateAssignment} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-400">Title</label>
                  <input 
                    value={newAssignment.title}
                    onChange={(e) => setNewAssignment({...newAssignment, title: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white mt-1"
                    placeholder="e.g. Midterm Project"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-400">Description</label>
                  <textarea 
                    value={newAssignment.description}
                    onChange={(e) => setNewAssignment({...newAssignment, description: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white mt-1 h-24"
                    placeholder="Assignment details"
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-sm font-medium text-slate-400">Due Date</label>
                    <input 
                      type="date"
                      value={newAssignment.dueDate}
                      onChange={(e) => setNewAssignment({...newAssignment, dueDate: e.target.value})}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white mt-1"
                      required
                    />
                  </div>
                  <div className="w-24">
                    <label className="text-sm font-medium text-slate-400">Max Score</label>
                    <input 
                      type="number"
                      value={newAssignment.maxScore}
                      onChange={(e) => setNewAssignment({...newAssignment, maxScore: parseInt(e.target.value)})}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white mt-1"
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowAssignmentModal(false)}
                    className="flex-1 py-3 border border-slate-700 rounded-xl font-bold hover:bg-slate-800 transition-all text-white"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-primary rounded-xl font-bold text-white hover:brightness-110 transition-all shadow-lg shadow-primary/20"
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
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center"
            >
              <h3 className="text-2xl font-bold mb-2 text-white">Submit Assignment</h3>
              <p className="text-slate-400 text-sm mb-6">{selectedAssignment?.title}</p>
              
              <form onSubmit={handleSubmitAssignment} className="space-y-6">
                <div className="border-2 border-dashed border-slate-700 rounded-2xl p-8 hover:border-primary transition-colors cursor-pointer relative group">
                  <input 
                    type="file" 
                    onChange={(e) => setAssignmentFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  <FileUp className="size-10 text-slate-500 mx-auto mb-4 group-hover:text-primary transition-colors" />
                  <p className="text-sm font-medium text-slate-300">
                    {assignmentFile ? assignmentFile.name : "Click or drag file to upload"}
                  </p>
                  <p className="text-xs text-slate-500 mt-2">PDF, DOCX, or ZIP up to 10MB</p>
                </div>

                <div className="flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setShowSubmitModal(false)}
                    className="flex-1 py-3 border border-slate-700 rounded-xl font-bold hover:bg-slate-800 transition-all text-white"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-primary rounded-xl font-bold text-white hover:brightness-110 transition-all shadow-lg shadow-primary/20"
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
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8"
            >
              <h3 className="text-2xl font-bold mb-2">Grade Submission</h3>
              <p className="text-slate-400 text-sm mb-6">{selectedSubmission?.users.name} - {selectedSubmission?.assignments.title}</p>
              
              <form onSubmit={handleGradeSubmission} className="space-y-4">
                <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="text-sm font-medium text-slate-400">Score (max {selectedSubmission?.assignments.max_score})</label>
                  <button 
                    type="button"
                    onClick={() => handleAiSuggestGrade(selectedSubmission.id)}
                    disabled={isAiGrading}
                    className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded-md font-bold flex items-center gap-1 hover:bg-primary hover:text-white transition-all disabled:opacity-50"
                  >
                    <Brain className={cn("size-3", isAiGrading && "animate-pulse")} />
                    {isAiGrading ? "Analyzing..." : "AI Suggest Score"}
                  </button>
                </div>
                <input 
                  type="number"
                  value={gradingInfo.grade}
                  onChange={(e) => setGradingInfo({ ...gradingInfo, grade: parseInt(e.target.value) })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white mt-1"
                  max={selectedSubmission?.assignments.max_score}
                  required
                />

                </div>
                <div>
                  <label className="text-sm font-medium text-slate-400">Feedback</label>
                  <textarea 
                    value={gradingInfo.feedback}
                    onChange={(e) => setGradingInfo({ ...gradingInfo, feedback: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white mt-1 h-32"
                    placeholder="Well done! Keep it up."
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowGradingModal(false)}
                    className="flex-1 py-3 border border-slate-700 rounded-xl font-bold hover:bg-slate-800 transition-all text-white"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-primary rounded-xl font-bold text-white hover:brightness-110 transition-all shadow-lg shadow-primary/20"
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
    emerald: 'bg-emerald-500/10 text-emerald-500',
    primary: 'bg-primary/10 text-primary',
    orange: 'bg-orange-500/10 text-orange-500',
    purple: 'bg-purple-500/10 text-purple-500',
  };

  return (
    <div className="bg-slate-900 p-6 rounded-2xl border border-primary/10 shadow-sm relative overflow-hidden group">
      <div className="flex justify-between items-start mb-4">
        <div className={cn("p-2 rounded-lg", colors[color])}>
          <Icon className="size-5" />
        </div>
        {live && (
          <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Now
          </span>
        )}
      </div>
      <h3 className="text-2xl font-bold">{value}</h3>
      <p className="text-sm text-slate-400">{label}</p>
      
      {students && (
        <div className="mt-4 flex -space-x-2">
          {students.map((s: string, i: number) => (
            <img key={i} className="w-7 h-7 rounded-full border-2 border-slate-900 object-cover" src={s} alt="Student" referrerPolicy="no-referrer" />
          ))}
          <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold">+12</div>
        </div>
      )}

      {subtitle && (
        <div className="mt-4 text-xs font-medium text-primary bg-primary/5 py-1 px-2 rounded-md w-fit italic">
          {subtitle}
        </div>
      )}

      {progress !== undefined && (
        <div className="mt-4 flex items-center gap-2">
          <div className="flex-1 bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-orange-500 h-full" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-[10px] font-bold text-slate-500">{progress}%</span>
        </div>
      )}

      {trend && (
        <div className="mt-4 flex items-center gap-1 text-emerald-500 font-bold text-xs">
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
          "w-3 h-3 rounded-full",
          active ? "bg-primary ring-4 ring-primary/20" : "bg-slate-700"
        )} />
        {!last && <div className="w-0.5 flex-1 bg-slate-800 my-1" />}
      </div>
      <div className="pb-2">
        <p className={cn("text-[10px] font-bold uppercase", active ? "text-primary" : "text-slate-500")}>{time}</p>
        <h5 className="text-sm font-bold mt-1">{title}</h5>
        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
          <Icon className="size-3" />
          {location}
        </p>
      </div>
    </div>
  );
}

function FeedbackItem({ name, tag, color, text, img }: any) {
  const colors: any = {
    emerald: 'bg-emerald-500/20 text-emerald-500',
    blue: 'bg-blue-500/20 text-blue-500',
  };

  return (
    <div className="flex gap-4 p-4 rounded-2xl bg-slate-800/50">
      <img className="w-10 h-10 rounded-full object-cover" src={img} alt={name} referrerPolicy="no-referrer" />
      <div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold">{name}</span>
          <span className={cn("text-[10px] px-1.5 py-0.5 rounded", colors[color])}>{tag}</span>
        </div>
        <p className="text-xs text-slate-500 mt-1 line-clamp-2">"{text}"</p>
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
    <div className="bg-slate-900 border border-primary/10 rounded-3xl p-6 space-y-4 h-full">
      <div className="flex items-center justify-between">
        <h3 className="font-bold flex items-center gap-2">
          <Sparkles className="size-4 text-primary" />
          AI Weekly Summary
        </h3>
        <button 
          onClick={generate}
          disabled={loading}
          className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1.5 rounded-lg hover:bg-primary hover:text-white transition-all disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Generate New'}
        </button>
      </div>
      
      {summary ? (
        <div className="prose prose-invert prose-sm max-w-none max-h-60 overflow-y-auto custom-scrollbar p-4 bg-slate-950/50 rounded-2xl border border-white/5">
           <ReactMarkdown>{summary}</ReactMarkdown>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3 opacity-50 py-10">
          <FileText className="size-8" />
          <p className="text-xs max-w-[200px]">Get a comprehensive overview of last week's lectures and assignments.</p>
        </div>
      )}
    </div>
  );
}

