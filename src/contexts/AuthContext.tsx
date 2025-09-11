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
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles') // <-- make sure table name matches your DB
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('fetchUserProfile error:', error);
      return null;
    }
    return (data as UserProfile) || null;
  }

  async function ensureProfileAndRole(spUser: SupabaseUser): Promise<UserProfile | null> {
    const email = spUser.email || '';
    const desiredRole: UserRole = email.endsWith('@holibayt.com') ? 'admin' : 'user';

    // Upsert (create if missing, otherwise keep existing but enforce admin for @holibayt.com)
    const { error: upsertErr } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: spUser.id,
        display_name: email,
        role: desiredRole,
        language: 'en',
      }, { onConflict: 'user_id' });

    if (upsertErr) {
      console.error('ensureProfileAndRole upsert error:', upsertErr);
      return null;
    }

    return fetchUserProfile(spUser.id);
  }

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string; user?: AuthUser }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { success: false, error: error.message };
      if (!data.user) return { success: false, error: 'No user returned from Supabase.' };

      // Ensure profile exists and map @holibayt.com to admin
      const profile = await ensureProfileAndRole(data.user);

      const authUser: AuthUser = {
        id: data.user.id,
        email: data.user.email || '',
        profile,
      };

      // Set state immediately for snappy UI (auth listener will also fire)
      setSession(data.session ?? null);
      setUser(authUser);

      return { success: true, user: authUser };
    } catch (e: any) {
      console.error('login exception:', e);
      return { success: false, error: 'Unexpected error during login.' };
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

  const hasRole = (role: UserRole): boolean => {
    return user?.profile?.role === role;
    // If admins should also access host pages, use:
    // return user?.profile?.role === role || (role === 'host' && user?.profile?.role === 'admin');
  };

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
