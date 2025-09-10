import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

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
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, displayName?: string, role?: UserRole) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  assignHostRole: () => Promise<void>;
  isAuthenticated: boolean;
  hasRole: (role: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data as UserProfile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred' };
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
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            display_name: displayName || email,
            role: role,
            language: 'en'
          }
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
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
        console.error('Error updating user role:', error);
        return;
      }

      // Refresh user profile
      const profile = await fetchUserProfile(user.id);
      if (profile) {
        setUser({ ...user, profile });
      }
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const hasRole = (role: UserRole): boolean => {
    return user?.profile?.role === role;
  };

  const isAuthenticated = user !== null && session !== null;

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        
        if (session?.user) {
          const profile = await fetchUserProfile(session.user.id);
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            profile
          });
        } else {
          setUser(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      
      if (session?.user) {
        fetchUserProfile(session.user.id).then(profile => {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            profile
          });
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
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