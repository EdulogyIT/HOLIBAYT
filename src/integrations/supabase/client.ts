import { createClient } from '@supabase/supabase-js';

const url  = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anon) {
  // Visible in browser console if envs are missing in Vercel
  console.error(
    '[Supabase] Missing env vars: VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. ' +
    'Set them in your Vercel project (Production & Preview).'
  );
}

export const supabase = createClient(url!, anon!, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    // Prevents the library from waiting on URL parsing that you don't use here
    detectSessionInUrl: false,
  },
  // Explicit fetch helps some older/safari contexts
  global: { fetch: (...args) => fetch(...args) },
});
