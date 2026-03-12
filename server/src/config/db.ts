import { supabase } from './supabase.js';

// The 'pg' library was causing ETIMEDOUT/ENOTFOUND on port 6543/5432.
// We have switched the entire backend to use the Supabase SDK over HTTPS (port 443).
// This file now acts as a bridge and connectivity tester.

export const query = async (text: string, params?: any[]) => {
  console.warn('DEPRECATED: Direct SQL query called. Use Supabase SDK instead.');
  throw new Error('Direct SQL queries are disabled due to network restrictions. Use Supabase SDK.');
};

// Connectivity Test using Supabase SDK (HTTPS)
(async () => {
  try {
    const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
    if (error) throw error;
    console.log('✅ Supabase API (HTTPS) Connectivity Successful');
    console.log('--- BACKEND READY ---');
  } catch (err: any) {
     console.error('❌ Supabase API Connection failed:', err.message);
  }
})();

export default { query };
