import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { setAuthCredentials } from '../api';

interface AuthContextType {
  username: string | null;
  credentials: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [username, setUsername] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<string | null>(null);

  const login = (user: string, password: string) => {
    const encodedCredentials = btoa(`${user}:${password}`);
    setUsername(user);
    setCredentials(encodedCredentials);
    setAuthCredentials(encodedCredentials);
  };

  const logout = () => {
    setUsername(null);
    setCredentials(null);
    setAuthCredentials(null);
  };

  return (
    <AuthContext.Provider
      value={{
        username,
        credentials,
        isAuthenticated: !!username,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
