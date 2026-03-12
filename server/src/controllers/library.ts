import { Response } from 'express';
import { supabase } from '../config/supabase.js';
import { AuthRequest } from '../middleware/auth.js';
import { uploadFileToSupabase } from '../utils/upload.js';

export const uploadMaterial = async (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'teacher') {
    return res.status(403).json({ message: 'Only teachers can upload materials' });
  }

  const { classId, title, type } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: 'File is required' });
  }

  try {
    const fileUrl = await uploadFileToSupabase(file, 'materials');

    const { data, error } = await supabase
      .from('materials')
      .insert([
        { 
          class_id: classId, 
          title, 
          type, 
          url: fileUrl,
          size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
          uploaded_by: req.user.id
        }
      ])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error: any) {
    console.error('Upload Material Error:', error.message);
    res.status(500).json({ message: 'Error uploading material' });
  }
};

export const getMaterials = async (req: AuthRequest, res: Response) => {
  const { classId } = req.params;
  try {
    const { data, error } = await supabase
      .from('materials')
      .select('*, users:uploaded_by(name)')
      .eq('class_id', classId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    console.error('Get Materials Error:', error.message);
    res.status(500).json({ message: 'Error fetching materials' });
  }
};

export const deleteMaterial = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  if (req.user?.role !== 'teacher') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  try {
    const { error } = await supabase
      .from('materials')
      .delete()
      .eq('id', id)
      .eq('uploaded_by', req.user.id);

    if (error) throw error;
    res.json({ message: 'Material deleted successfully' });
  } catch (error: any) {
    console.error('Delete Material Error:', error.message);
    res.status(500).json({ message: 'Error deleting material' });
  }
};
