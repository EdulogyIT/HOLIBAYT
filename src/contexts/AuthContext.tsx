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
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  assignHostRole: () => void;
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

      // Check if email is confirmed
      if (data.user && !data.user.email_confirmed_at) {
        console.error('Email not verified');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
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
        return false;
      }

      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const assignHostRole = () => {
    if (user && user.role === 'user') {
      const updatedUser = { ...user, role: 'host' as UserRole, isHost: true };
      setUser(updatedUser);
    }
  };

  const hasRole = (role: UserRole): boolean => {
    return user?.role === role || (role === 'host' && user?.isHost);
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        
        if (session?.user) {
          // Only allow verified users
          if (session.user.email_confirmed_at) {
            const userData: User = {
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || '',
              role: 'user', // Default role, can be enhanced with profiles table
              emailConfirmed: true
            };
            setUser(userData);
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      
      if (session?.user) {
        // Only allow verified users
        if (session.user.email_confirmed_at) {
          const userData: User = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || '',
            role: 'user',
            emailConfirmed: true
          };
          setUser(userData);
        } else {
          setUser(null);
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
      logout,
      assignHostRole,
      isAuthenticated: !!user,
      hasRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};