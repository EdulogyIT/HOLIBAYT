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
      console.log('Fetching user profile for:', userId);
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      if (!data) {
        console.log('No profile found for user:', userId);
        return null;
      }

      console.log('User profile fetched:', data);
      return data as UserProfile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('Attempting login for:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('Login response:', { data: !!data, error });

      if (error) {
        console.error('Login error:', error);
        return { success: false, error: error.message };
      }

      console.log('Login successful');
      return { success: true };
    } catch (error) {
      console.error('Login exception:', error);
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
      console.log('AuthContext: Starting logout process');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('AuthContext: Logout error:', error);
      } else {
        console.log('AuthContext: Logout successful');
        setUser(null);
        setSession(null);
      }
    } catch (error) {
      console.error('AuthContext: Error signing out:', error);
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
    console.log('Setting up auth state listener');
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, !!session);
        console.log('Session user:', session?.user?.id, session?.user?.email);
        setSession(session);
        
        if (session?.user) {
          console.log('User found in session, fetching profile for:', session.user.id);
          const profile = await fetchUserProfile(session.user.id);
          console.log('Profile fetched:', profile);
          const authUser = {
            id: session.user.id,
            email: session.user.email || '',
            profile
          };
          console.log('Setting user:', authUser);
          setUser(authUser);
        } else {
          console.log('No user in session, clearing user state');
          setUser(null);
        }
        
        setLoading(false);
      }
    );

    console.log('Checking for existing session');
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Existing session check:', !!session);
      setSession(session);
      
      if (session?.user) {
        console.log('Found existing session, fetching profile');
        fetchUserProfile(session.user.id).then(profile => {
          const authUser = {
            id: session.user.id,
            email: session.user.email || '',
            profile
          };
          console.log('Setting user from existing session:', authUser);
          setUser(authUser);
          setLoading(false);
        });
      } else {
        console.log('No existing session');
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