import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';

export type UserRole = 'user' | 'host' | 'admin';

interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  isHost?: boolean;
  emailConfirmed?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; needsConfirmation: boolean }>;
  loginWithGoogle: () => Promise<void>;
  loginWithFacebook: () => Promise<void>;
  logout: () => void;
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

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error.message);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<{ success: boolean; needsConfirmation: boolean }> => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name: name
          }
        }
      });

      if (error) {
        console.error('Registration error:', error.message);
        return { success: false, needsConfirmation: false };
      }

      // Check if email confirmation is needed
      const needsConfirmation = data.user && !data.user.email_confirmed_at;
      
      return { success: true, needsConfirmation: !!needsConfirmation };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, needsConfirmation: false };
    }
  };

  const loginWithGoogle = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });
      
      if (error) {
        console.error('Google login error:', error.message);
        throw error;
      }
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  };

  const loginWithFacebook = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });
      
      if (error) {
        console.error('Facebook login error:', error.message);
        throw error;
      }
    } catch (error) {
      console.error('Facebook login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const assignHostRole = async () => {
    console.log('assignHostRole called, current user:', user);
    if (user && user.role === 'user') {
      try {
        console.log('Updating role to host for user ID:', user.id);
        // Update role in database
        const { data, error } = await supabase
          .from('profiles')
          .update({ role: 'host', updated_at: new Date().toISOString() })
          .eq('id', user.id)
          .select();

        console.log('Database update result:', { data, error });

        if (error) {
          console.error('Error updating host role:', error);
          return;
        }

        // Update local state
        const updatedUser = { ...user, role: 'host' as UserRole, isHost: true };
        console.log('Updating local user state to:', updatedUser);
        setUser(updatedUser);
      } catch (error) {
        console.error('Error assigning host role:', error);
      }
    } else {
      console.log('assignHostRole: User not eligible for host role', { user: user?.role });
    }
  };

  const hasRole = (role: UserRole): boolean => {
    return user?.role === role || (role === 'host' && user?.isHost);
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state change:', event, session?.user?.id);
        setSession(session);
        
      if (session?.user) {
        console.log('Session user found, fetching profile for:', session.user.id);
        // Fetch user profile to get role
        setTimeout(async () => {
          try {
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .maybeSingle();

            console.log('Profile fetch result:', { profile, error });

            if (profile) {
              const userData: User = {
                id: session.user.id,
                email: profile.email,
                name: profile.name || session.user.email?.split('@')[0] || '',
                role: profile.role as UserRole,
                emailConfirmed: !!session.user.email_confirmed_at
              };
              console.log('Setting user data:', userData);
              setUser(userData);
            } else {
              console.log('No profile found, setting user to null');
              setUser(null);
            }
          } catch (error) {
            console.error('Error fetching profile:', error);
            setUser(null);
          }
        }, 0);
      } else {
        console.log('No session user, setting user to null');
        setUser(null);
      }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      
      if (session?.user) {
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          if (profile) {
            const userData: User = {
              id: session.user.id,
              email: profile.email,
              name: profile.name || session.user.email?.split('@')[0] || '',
              role: profile.role as UserRole,
              emailConfirmed: !!session.user.email_confirmed_at
            };
            setUser(userData);
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      loginWithGoogle,
      loginWithFacebook,
      logout,
      assignHostRole,
      isAuthenticated: !!user,
      hasRole,
    }}>
      {children}
    </AuthContext.Provider>
  );
};