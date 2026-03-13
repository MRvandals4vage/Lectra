import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Starting migration...');

    // Update Classes table
    await client.query(`
      ALTER TABLE classes ADD COLUMN IF NOT EXISTS subject TEXT;
      ALTER TABLE classes ADD COLUMN IF NOT EXISTS semester TEXT;
      ALTER TABLE classes ADD COLUMN IF NOT EXISTS folder TEXT;
      ALTER TABLE classes ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]';
      ALTER TABLE classes ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;
    `);
    console.log('Updated classes table.');

    // Update Assignments table
    await client.query(`
      ALTER TABLE assignments ADD COLUMN IF NOT EXISTS rubric JSONB DEFAULT '[]';
      ALTER TABLE assignments ADD COLUMN IF NOT EXISTS late_penalty_rule JSONB DEFAULT '{}';
      ALTER TABLE assignments ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]';
    `);
    console.log('Updated assignments table.');

    // Update Submissions table
    await client.query(`
      ALTER TABLE submissions ADD COLUMN IF NOT EXISTS ai_feedback TEXT;
      ALTER TABLE submissions ADD COLUMN IF NOT EXISTS is_draft BOOLEAN DEFAULT FALSE;
      ALTER TABLE submissions ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;
    `);
    console.log('Updated submissions table.');

    // Update Meetings table
    await client.query(`
      ALTER TABLE meetings ADD COLUMN IF NOT EXISTS scheduled_time TIMESTAMP WITH TIME ZONE;
      ALTER TABLE meetings ADD COLUMN IF NOT EXISTS reminders JSONB DEFAULT '[]';
      ALTER TABLE meetings ADD COLUMN IF NOT EXISTS resources JSONB DEFAULT '[]';
    `);
    console.log('Updated meetings table.');

    // Create New Tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS doubts (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
          student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          question TEXT NOT NULL,
          category TEXT,
          upvotes INTEGER DEFAULT 0,
          is_answered BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS polls (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
          question TEXT NOT NULL,
          options JSONB NOT NULL,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS poll_responses (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
          student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          response_index INTEGER NOT NULL,
          UNIQUE(poll_id, student_id)
      );

      CREATE TABLE IF NOT EXISTS whiteboard_sessions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
          data JSONB DEFAULT '[]',
          last_saved TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS student_metrics (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
          engagement_score INTEGER DEFAULT 0,
          attendance_rate DECIMAL DEFAULT 0,
          participation_score INTEGER DEFAULT 0,
          assignment_completion_rate DECIMAL DEFAULT 0,
          last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(student_id, class_id)
      );

      CREATE TABLE IF NOT EXISTS session_reports (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
          summary TEXT,
          key_concepts JSONB DEFAULT '[]',
          action_items JSONB DEFAULT '[]',
          highlights JSONB DEFAULT '[]',
          revision_notes TEXT,
          flashcards JSONB DEFAULT '[]',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS study_rooms (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
          title TEXT NOT NULL,
          created_by UUID NOT NULL REFERENCES users(id),
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Created new feature tables.');

    console.log('Migration completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
