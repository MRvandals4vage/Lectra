import { supabase } from '../config/supabase.js';
import { randomUUID } from 'crypto';

export const uploadFileToSupabase = async (file: Express.Multer.File, bucket: string) => {
  const fileExt = file.originalname.split('.').pop();
  const fileName = `${randomUUID()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
    });

  if (error) {
    throw error;
  }

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return publicUrl;
};
