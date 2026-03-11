import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err);
});

// Connectivity Test
(async () => {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('Database connectivity test successful:', res.rows[0]);
  } catch (err: any) {
    if (err.message.includes('password authentication failed')) {
      console.error('CRITICAL: Database password incorrect. Please update [YOUR-PASSWORD] in server/.env');
    } else {
      console.error('CRITICAL: Could not connect to database:', err.message);
    }
  }
})();

export const query = (text: string, params?: any[]) => pool.query(text, params);

export default pool;
