import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, X, Folder, Tag, BookOpen, Calendar } from 'lucide-react';
import { cn } from '../lib/utils';

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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-lectra-background/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-lg bg-lectra-card border border-lectra-border rounded-[2.5rem] p-10 shadow-3xl relative overflow-hidden"
          >
            {/* Background Decorative Element */}
            <div className="absolute top-0 right-0 size-32 bg-lectra-primary/5 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />
            
            <div className="flex justify-between items-center mb-8 relative z-10">
              <div>
                <h3 className="text-2xl font-black text-lectra-text font-outfit uppercase tracking-tight">Create Classroom</h3>
                <p className="text-lectra-muted text-xs font-bold uppercase tracking-widest mt-1">Design your digital learning space</p>
              </div>
              <button 
                onClick={onClose} 
                className="size-10 flex items-center justify-center hover:bg-lectra-background rounded-2xl text-lectra-muted hover:text-lectra-text transition-all border border-transparent hover:border-lectra-border"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-lectra-muted uppercase tracking-[0.2em] px-1">Class Title</label>
                  <input 
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-lectra-background border border-lectra-border rounded-2xl py-4 px-6 text-lectra-text mt-2 focus:border-lectra-primary outline-none transition-all placeholder:text-slate-800 font-medium"
                    placeholder="e.g. Advanced UX Research"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-lectra-muted uppercase tracking-[0.2em] px-1">Subject Area</label>
                    <div className="relative group mt-2">
                      <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-lectra-muted group-focus-within:text-lectra-primary transition-colors" />
                      <input 
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full bg-lectra-background border border-lectra-border rounded-xl py-3.5 pl-11 pr-4 text-lectra-text focus:border-lectra-primary outline-none transition-all placeholder:text-slate-800 text-sm font-medium"
                        placeholder="e.g. Design"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-lectra-muted uppercase tracking-[0.2em] px-1">Semester</label>
                    <div className="relative group mt-2">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-lectra-muted group-focus-within:text-lectra-primary transition-colors" />
                      <input 
                        value={formData.semester}
                        onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                        className="w-full bg-lectra-background border border-lectra-border rounded-xl py-3.5 pl-11 pr-4 text-lectra-text focus:border-lectra-primary outline-none transition-all placeholder:text-slate-800 text-sm font-medium"
                        placeholder="e.g. Spring 2024"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-lectra-muted uppercase tracking-[0.2em] px-1">Description</label>
                  <textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-lectra-background border border-lectra-border rounded-2xl py-4 px-6 text-lectra-text mt-2 h-24 focus:border-lectra-primary outline-none transition-all placeholder:text-slate-800 resize-none text-sm font-medium leading-relaxed"
                    placeholder="Briefly describe the learning objectives..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-lectra-muted uppercase tracking-[0.2em] px-1">Folder Path</label>
                    <div className="relative group mt-2">
                      <Folder className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-lectra-muted group-focus-within:text-lectra-primary transition-colors" />
                      <input 
                        value={formData.folder}
                        onChange={(e) => setFormData({ ...formData, folder: e.target.value })}
                        className="w-full bg-lectra-background border border-lectra-border rounded-xl py-3.5 pl-11 pr-4 text-lectra-text focus:border-lectra-primary outline-none transition-all placeholder:text-slate-800 text-sm font-medium"
                        placeholder="e.g. Graduate"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-lectra-muted uppercase tracking-[0.2em] px-1">Category Tags</label>
                    <div className="flex gap-2 mt-2">
                      <div className="relative flex-1 group">
                        <Tag className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-lectra-muted group-focus-within:text-lectra-primary transition-colors" />
                        <input 
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                          className="w-full bg-lectra-background border border-lectra-border rounded-xl py-3.5 pl-11 pr-4 text-[13px] text-lectra-text focus:border-lectra-primary outline-none transition-all placeholder:text-slate-800 font-medium"
                          placeholder="Add..."
                        />
                      </div>
                      <button 
                        type="button" 
                        onClick={addTag} 
                        className="size-[46px] bg-lectra-background border border-lectra-border rounded-xl hover:border-lectra-primary text-lectra-muted hover:text-lectra-primary transition-all flex items-center justify-center"
                      >
                        <Plus className="size-5" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {formData.tags.map(tag => (
                        <span key={tag} className="text-[9px] bg-lectra-primary/10 text-lectra-primary px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-black uppercase tracking-widest border border-lectra-primary/10 transition-all hover:bg-lectra-primary hover:text-white">
                          {tag}
                          <X className="size-3 cursor-pointer opacity-50 hover:opacity-100" onClick={() => setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) })} />
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-4 border border-lectra-border rounded-2xl font-black uppercase tracking-widest text-[11px] text-lectra-muted hover:text-lectra-text hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-lectra-primary rounded-2xl font-black uppercase tracking-widest text-[11px] text-white hover:bg-lectra-primaryHover transition-all shadow-xl shadow-lectra-primary/20"
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
