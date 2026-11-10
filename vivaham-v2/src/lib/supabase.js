import { createClient } from '@supabase/supabase-js';
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const configured = !!(url && key);
export const sb = configured
  ? createClient(url, key, { db: { schema: 'vivaham' }, auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } })
  : null;
export const BUCKET = 'vivaham';
// run a query, throw a readable error
export async function must(p) {
  const r = await p;
  if (r.error) throw new Error(r.error.message || 'Something went wrong');
  return r.data;
}
