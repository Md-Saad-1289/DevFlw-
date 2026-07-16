import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'developer' | 'client' | 'admin';
  plan?: string;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  registerDeveloper: (name: string, email: string, password: string) => Promise<boolean>;
  registerClient: (name: string, email: string, password: string) => Promise<boolean>;
  registerAdmin: (name: string, email: string, password: string) => Promise<boolean>;
  updatePlan: (plan: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Auto-restore session from localStorage on load and verify token validity
  useEffect(() => {
    const verifyAndRestore = async () => {
      const storedToken = localStorage.getItem('devflw_token');
      const storedUser = localStorage.getItem('devflw_user');

      if (storedToken && storedUser) {
        try {
          // Verify with server using /api/auth/me
          const response = await fetch('/api/auth/me', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${storedToken}`
            }
          });
          if (response.ok) {
            const data = await response.json();
            setToken(storedToken);
            setUser(data.user);
            localStorage.setItem('devflw_user', JSON.stringify(data.user));
          } else {
            // Token is invalid/expired
            console.warn('Session is expired or invalid, logging out.');
            localStorage.removeItem('devflw_token');
            localStorage.removeItem('devflw_user');
            setToken(null);
            setUser(null);
          }
        } catch (err) {
          console.error('Failed to verify session with server:', err);
          // Fallback to cached user if server is unreachable (offline/loading fallback)
          setToken(storedToken);
          try {
            setUser(JSON.parse(storedUser));
          } catch (e) {
            localStorage.removeItem('devflw_token');
            localStorage.removeItem('devflw_user');
          }
        }
      }
      setLoading(false);
    };

    verifyAndRestore();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setError(null);
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to log in');
      }

      localStorage.setItem('devflw_token', data.token);
      localStorage.setItem('devflw_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return true;
    } catch (err: any) {
      setError(err.message || 'An error occurred during login');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const registerDeveloper = async (name: string, email: string, password: string): Promise<boolean> => {
    setError(null);
    setLoading(true);
    try {
      const response = await fetch('/api/auth/register-developer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to register as developer');
      }

      localStorage.setItem('devflw_token', data.token);
      localStorage.setItem('devflw_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return true;
    } catch (err: any) {
      setError(err.message || 'An error occurred during developer registration');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const registerClient = async (name: string, email: string, password: string): Promise<boolean> => {
    setError(null);
    setLoading(true);
    try {
      const response = await fetch('/api/auth/register-client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to register as client');
      }

      localStorage.setItem('devflw_token', data.token);
      localStorage.setItem('devflw_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return true;
    } catch (err: any) {
      setError(err.message || 'An error occurred during client registration');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const registerAdmin = async (name: string, email: string, password: string): Promise<boolean> => {
    setError(null);
    setLoading(true);
    try {
      const response = await fetch('/api/auth/register-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to register as administrator');
      }

      localStorage.setItem('devflw_token', data.token);
      localStorage.setItem('devflw_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return true;
    } catch (err: any) {
      setError(err.message || 'An error occurred during admin registration');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updatePlan = async (plan: string): Promise<boolean> => {
    setError(null);
    setLoading(true);
    try {
      const response = await fetch('/api/auth/plan', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ plan }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update plan');
      }

      const updatedUser = { ...user, plan: data.user.plan } as User;
      localStorage.setItem('devflw_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return true;
    } catch (err: any) {
      setError(err.message || 'An error occurred during plan update');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('devflw_token');
    localStorage.removeItem('devflw_user');
    setToken(null);
    setUser(null);
    setError(null);
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        registerDeveloper,
        registerClient,
        registerAdmin,
        updatePlan,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
