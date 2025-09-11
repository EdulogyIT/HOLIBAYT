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

  // Mock users storage
  const getMockUsers = (): User[] => {
    const stored = localStorage.getItem('mock_users');
    return stored ? JSON.parse(stored) : [
      { id: '1', email: 'admin@holibayt.com', name: 'Admin User', role: 'admin' },
      { id: '2', email: 'host@holibayt.com', name: 'Host User', role: 'host', isHost: true },
      { id: '3', email: 'user@holibayt.com', name: 'Regular User', role: 'user' },
    ];
  };

  const saveMockUsers = (users: User[]) => {
    localStorage.setItem('mock_users', JSON.stringify(users));
  };

  // Mock authentication - replace with Supabase later
  const login = async (email: string, password: string): Promise<boolean> => {
    const mockUsers = getMockUsers();
    const foundUser = mockUsers.find(u => u.email === email);
    if (foundUser && password === 'password') {
      setUser(foundUser);
      localStorage.setItem('auth_user', JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    const mockUsers = getMockUsers();
    
    // Check if email already exists
    if (mockUsers.find(u => u.email === email)) {
      return false;
    }

    // Create new user
    const newUser: User = {
      id: (mockUsers.length + 1).toString(),
      email,
      name,
      role: 'user'
    };

    mockUsers.push(newUser);
    saveMockUsers(mockUsers);

    return true;
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