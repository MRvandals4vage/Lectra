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
  FileUp
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

export default function Dashboard({ onStartClass }: { onStartClass: (roomId: string) => void }) {
  const { user, logout } = useAuth();
  const [classes, setClasses] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [showJoinModal, setShowJoinModal] = React.useState(false);
  const [classCode, setClassCode] = React.useState('');
  const [newClassTitle, setNewClassTitle] = React.useState('');
  const [newClassDesc, setNewClassDesc] = React.useState('');

  const [selectedClass, setSelectedClass] = React.useState<any>(null);
  const [assignments, setAssignments] = React.useState<any[]>([]);
  const [showAssignmentModal, setShowAssignmentModal] = React.useState(false);
  const [showSubmitModal, setShowSubmitModal] = React.useState(false);
  const [selectedAssignment, setSelectedAssignment] = React.useState<any>(null);
  const [assignmentFile, setAssignmentFile] = React.useState<File | null>(null);
  const [newAssignment, setNewAssignment] = React.useState({ title: '', description: '', dueDate: '', maxScore: 100 });

  React.useEffect(() => {
    fetchClasses();
  }, []);

  React.useEffect(() => {
    if (selectedClass) {
      fetchAssignments(selectedClass.id);
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

  const fetchAssignments = async (classId: string) => {
    try {
      const res = await axios.get(`${API_URL}/assignments/${classId}`);
      setAssignments(res.data);
    } catch (err) {
      console.error('Error fetching assignments:', err);
    }
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/classes`, { title: newClassTitle, description: newClassDesc });
      setNewClassTitle('');
      setNewClassDesc('');
      setShowCreateModal(false);
      fetchClasses();
    } catch (err) {
      alert('Error creating class');
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
      setShowSubmitModal(false);
      setAssignmentFile(null);
      alert('Assignment submitted successfully!');
    } catch (err) {
      alert('Error submitting assignment');
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
            { icon: LayoutDashboard, label: 'Dashboard', active: true },
            { icon: BookOpen, label: 'Classes' },
            { icon: FileText, label: 'Assignments' },
            { icon: Users, label: 'Students' },
            { icon: LineChart, label: 'Analytics' },
            { icon: Settings, label: 'Settings' },
          ].map((item) => (
            <a 
              key={item.label}
              href="#" 
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors",
                item.active ? "bg-primary/10 text-primary" : "text-slate-400 hover:bg-primary/10 hover:text-primary"
              )}
            >
              <item.icon className="size-5" />
              {item.label}
            </a>
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
              <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 border border-slate-700 text-slate-200 rounded-lg font-semibold text-sm hover:bg-slate-700 transition-all">
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
              value="02" 
              label="Active Classrooms" 
              color="emerald" 
              live 
              students={['https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1974&auto=format&fit=crop', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop']} 
            />
            <MetricCard icon={Calendar} value="04" label="Meetings Today" color="primary" subtitle="Next: Advanced UI at 2:30 PM" />
            <MetricCard icon={Clock} value="128" label="To be Graded" color="orange" progress={66} />
            <MetricCard icon={LineChart} value="94%" label="Avg. Engagement" color="purple" trend="+4.2% from last week" />
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

            <div className="bg-slate-900 p-8 rounded-3xl border border-primary/10 shadow-sm overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <MessageSquare className="size-24" />
              </div>
              <h4 className="text-lg font-bold mb-6">Recent Student Feedback</h4>
              <div className="space-y-4">
                <FeedbackItem 
                  name="Sarah Jenkins" 
                  tag="Positive" 
                  color="emerald" 
                  text="The session on Grid layouts was incredibly helpful. The live coding example made it much clearer." 
                  img="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1974&auto=format&fit=crop"
                />
                <FeedbackItem 
                  name="Marcus Thorne" 
                  tag="Question" 
                  color="blue" 
                  text="Could we go over the Figma handoff process again in the next meeting? I missed some details." 
                  img="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2070&auto=format&fit=crop"
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Create Class Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8"
            >
              <h3 className="text-2xl font-bold mb-6">Create New Class</h3>
              <form onSubmit={handleCreateClass} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-400">Class Title</label>
                  <input 
                    value={newClassTitle}
                    onChange={(e) => setNewClassTitle(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white mt-1"
                    placeholder="e.g. Advanced UI Design"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-400">Description</label>
                  <textarea 
                    value={newClassDesc}
                    onChange={(e) => setNewClassDesc(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white mt-1 h-32"
                    placeholder="What will students learn?"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 py-3 border border-slate-700 rounded-xl font-bold hover:bg-slate-800 transition-all"
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
