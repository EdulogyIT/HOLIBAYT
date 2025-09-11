import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';

export type UserRole = 'user' | 'host' | 'admin';

export interface UserProfile {
  user_id: string;
  display_name: string | null;
  phone: string | null;
  role: UserRole;
  language: string;
}

export interface AuthUser {
  id: string;
  email: string;
  profile: UserProfile | null;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: AuthUser }>;
  signup: (email: string, password: string, displayName?: string, role?: UserRole) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  assignHostRole: () => Promise<void>;
  isAuthenticated: boolean;
  hasRole: (role: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

// ---- helpers ----
function withTimeout<T>(promise: Promise<T>, ms = 12000): Promise<T> {
  return new Promise((resolve, reject) => {
    const id = setTimeout(() => reject(new Error('Request timed out')), ms);
    promise.then(
      (v) => { clearTimeout(id); resolve(v); },
      (e) => { clearTimeout(id); reject(e); }
    );
  });
}

async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('fetchUserProfile error:', error);
    return null;
  }
  return (data as UserProfile) ?? null;
}

async function ensureProfileAndRole(spUser: SupabaseUser): Promise<UserProfile | null> {
  const email = spUser.email || '';
  const desiredRole: UserRole = email.endsWith('@holibayt.com') ? 'admin' : 'user';

  const { error: upsertErr } = await supabase
    .from('user_profiles')
    .upsert(
      {
        user_id: spUser.id,
        display_name: email,
        role: desiredRole,
        language: 'en',
      },
      { onConflict: 'user_id' }
    );

  if (upsertErr) {
    // Don't block login on profile write issues (RLS etc) — just log it.
    console.warn('ensureProfileAndRole upsert warning:', upsertErr);
  }

  return fetchUserProfile(spUser.id);
}

// ---- provider ----
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string; user?: AuthUser }> => {
    try {
      // Timeout guard: prevents endless “Logging in…”
      const { data, error } = await withTimeout(
        supabase.auth.signInWithPassword({ email, password }),
        12000
      );

      if (error) return { success: false, error: error.message };
      if (!data.user) return { success: false, error: 'No user returned from Supabase.' };

      // Create/refresh profile, but don’t block login if it fails
      const profile = await ensureProfileAndRole(data.user);

      const authUser: AuthUser = {
        id: data.user.id,
        email: data.user.email || '',
        profile,
      };

      setSession(data.session ?? null);
      setUser(authUser);

      return { success: true, user: authUser };
    } catch (e: any) {
      console.error('login exception:', e);
      const msg =
        e?.message === 'Request timed out'
          ? 'Login timed out. Check network / Supabase URL & key / CORS settings.'
          : 'Unexpected error during login.';
      return { success: false, error: msg };
    }
  };

  const signup = async (
    email: string,
    password: string,
    displayName?: string,
    role: UserRole = 'user'
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            display_name: displayName || email,
            role,
            language: 'en',
          },
        },
      });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (e: any) {
      console.error('signup exception:', e);
      return { success: false, error: 'Unexpected error during signup.' };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) console.error('logout error:', error);
    } catch (e) {
      console.error('logout exception:', e);
    } finally {
      setUser(null);
      setSession(null);
      setLoading(false);
    }
  };

  const assignHostRole = async (): Promise<void> => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ role: 'host' })
        .eq('user_id', user.id);

      if (error) {
        console.error('assignHostRole error:', error);
        return;
      }

      const profile = await fetchUserProfile(user.id);
      setUser({ ...user, profile: profile ?? user.profile });
    } catch (e) {
      console.error('assignHostRole exception:', e);
    }
  };

  const hasRole = (role: UserRole): boolean => user?.profile?.role === role;
  const isAuthenticated = user !== null && session !== null;

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;

      setSession(data.session ?? null);

      if (data.session?.user) {
        const profile = await fetchUserProfile(data.session.user.id);
        if (!mounted) return;
        setUser({
          id: data.session.user.id,
          email: data.session.user.email || '',
          profile,
        });
      }
      setLoading(false);
    })();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, sess) => {
      if (!mounted) return;

      setSession(sess ?? null);

      if (sess?.user) {
        const profile = await fetchUserProfile(sess.user.id);
        if (!mounted) return;
        setUser({
          id: sess.user.id,
          email: sess.user.email || '',
          profile,
        });
      } else {
        setUser(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        login,
        signup,
        logout,
        assignHostRole,
        isAuthenticated,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

