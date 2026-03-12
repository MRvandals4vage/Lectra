import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, X, Folder, Tag, BookOpen, Calendar } from 'lucide-react';

interface CreateClassModalProps {
  show: boolean;
  onClose: () => void;
  onCreate: (data: any) => void;
}

export default function CreateClassModal({ show, onClose, onCreate }: CreateClassModalProps) {
  const [formData, setFormData] = React.useState({
    title: '',
    subject: '',
    description: '',
    semester: '',
    folder: '',
    tags: [] as string[]
  });
  const [tagInput, setTagInput] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(formData);
    onClose();
  };

  const addTag = () => {
    if (tagInput && !formData.tags.includes(tagInput)) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput] });
      setTagInput('');
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">Create New Classroom</h3>
              <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400">
                <X className="size-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-sm font-medium text-slate-400">Class Title</label>
                  <input 
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white mt-1"
                    placeholder="e.g. Advanced UX Research"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-400">Subject</label>
                  <div className="relative">
                    <BookOpen className="absolute left-3 top-4 size-4 text-slate-500" />
                    <input 
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white mt-1"
                      placeholder="e.g. Design"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-400">Semester</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-4 size-4 text-slate-500" />
                    <input 
                      value={formData.semester}
                      onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white mt-1"
                      placeholder="e.g. Spring 2024"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-400">Description</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white mt-1 h-20"
                  placeholder="What will students learn?"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-400">Folder</label>
                  <div className="relative">
                    <Folder className="absolute left-3 top-4 size-4 text-slate-500" />
                    <input 
                      value={formData.folder}
                      onChange={(e) => setFormData({ ...formData, folder: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white mt-1"
                      placeholder="e.g. Graduate"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-400">Tags</label>
                  <div className="flex gap-2 mt-1">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-3 size-4 text-slate-500" />
                      <input 
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 pl-10 pr-4 text-sm text-white"
                        placeholder="Add tag..."
                      />
                    </div>
                    <button type="button" onClick={addTag} className="p-2 bg-slate-800 border border-slate-700 rounded-xl hover:bg-slate-700">
                      <Plus className="size-5" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.map(tag => (
                      <span key={tag} className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded-md flex items-center gap-1 font-bold">
                        {tag}
                        <X className="size-3 cursor-pointer" onClick={() => setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) })} />
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-6">
                <button 
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 border border-slate-700 rounded-xl font-bold hover:bg-slate-800 transition-all text-white"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-primary rounded-xl font-bold text-white hover:brightness-110 transition-all shadow-lg shadow-primary/20"
                >
                  Create Classroom
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
