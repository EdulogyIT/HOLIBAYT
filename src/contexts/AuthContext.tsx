import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'user' | 'host' | 'admin';

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isHost?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
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

  // Mock authentication - replace with Supabase later
  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock users for testing
    const mockUsers: User[] = [
      { id: '1', email: 'admin@holibayt.com', name: 'Admin User', role: 'admin' },
      { id: '2', email: 'host@holibayt.com', name: 'Host User', role: 'host', isHost: true },
      { id: '3', email: 'user@holibayt.com', name: 'Regular User', role: 'user' },
    ];

    const foundUser = mockUsers.find(u => u.email === email);
    if (foundUser && password === 'password') {
      setUser(foundUser);
      localStorage.setItem('auth_user', JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_user');
  };

  const assignHostRole = () => {
    if (user && user.role === 'user') {
      const updatedUser = { ...user, role: 'host' as UserRole, isHost: true };
      setUser(updatedUser);
      localStorage.setItem('auth_user', JSON.stringify(updatedUser));
    }
  };

  const hasRole = (role: UserRole): boolean => {
    return user?.role === role || (role === 'host' && user?.isHost);
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      assignHostRole,
      isAuthenticated: !!user,
      hasRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};