import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '@/services/apiClient';

export interface User {
  id: string;
  email: string;
  name: string;
  tenant_id: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Validate the stored token and get current user data on mount
  useEffect(() => {
    const validateAuth = async () => {
      setLoading(true);
      const storedToken = localStorage.getItem('authToken');
      
      if (!storedToken) {
        setLoading(false);
        return;
      }
      
      try {
        // Attempt to get current user with the stored token
        const userData = await apiClient.auth.getCurrentUser();
        
        // If successful, set the user and token
        setToken(storedToken);
        setUser(userData);
      } catch (error) {
        console.error('Error validating authentication:', error);
        // If token is invalid, clear local storage
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
      } finally {
        setLoading(false);
      }
    };
    
    validateAuth();
  }, []);

  const login = (newToken: string, newUser: User) => {
    // Set token and user in state
    setToken(newToken);
    setUser(newUser);
    
    // Save to localStorage
    localStorage.setItem('authToken', newToken);
    localStorage.setItem('userData', JSON.stringify(newUser));
  };

  const logout = () => {
    // Clear token and user from state
    setToken(null);
    setUser(null);
    
    // Clear from localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        token, 
        isAuthenticated: !!token && !!user,
        loading,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 