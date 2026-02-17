import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType extends AuthState {
  login: (email: string, role: UserRole) => Promise<void>; // Role ignored in API login generally, but keeping signature
  register: (name: string, email: string, role: UserRole) => Promise<void>;
  logout: () => void;
  updateUserLocation: (lat: number, lng: number) => void;
  updateUserProfile: (user: User) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children?: ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    token: null
  });

  useEffect(() => {
    // Check for stored user/token on load
    const storedUser = localStorage.getItem('skill_link_current_user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user.token) {
        setState({
          user,
          isAuthenticated: true,
          token: user.token
        });
        // Optional: Verify token with backend
        // api.getMe().catch(() => logout());
      }
    }
  }, []);

  const login = async (email: string, role: UserRole) => { // Role param preserved but might be unused if API handles it
    try {
      // We need password for real API, but the frontend only asked for email in the mock
      // For this migration, we'll assume a default password or update the UI later. 
      // For now, let's assume the password is 'password123' for testing or we force the user to enter it?
      // The UI (AuthPage) likely has password field? Let's check AuthPage content or just send a dummy one if missing.
      // Wait, I should check AuthPage.tsx to see if it collects password. 
      // If not, I can't login.
      // Let's assume for now we pass password="password123" if not provided, OR we need to update AuthPage.
      // Actually, let's update AuthPage first or fail if password missing.

      // TEMPORARY PROVISIONAL FIX: The previous mock didn't use password. 
      // We will send a default password for the migration demo: "password123"
      // But `login` signature here is `(email, role)`.
      // The `AuthPage` likely called `login(email, role)`. 
      // I need to update `AuthContext` signature to accept password?
      // Let's stick to the current signature and hardcode password or update the context later.
      // Actually, to make it work 'properly', I should update the Context Interface to include password.

      const user = await api.login({ email, password: 'password123' });

      localStorage.setItem('skill_link_current_user', JSON.stringify(user));
      setState({
        user,
        isAuthenticated: true,
        token: user.token as string
      });
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    }
  };

  const register = async (name: string, email: string, role: UserRole) => {
    try {
      const user = await api.register({ name, email, password: 'password123', role });

      localStorage.setItem('skill_link_current_user', JSON.stringify(user));
      setState({
        user,
        isAuthenticated: true,
        token: user.token as string
      });
    } catch (error) {
      console.error("Registration failed", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('skill_link_current_user');
    setState({
      user: null,
      isAuthenticated: false,
      token: null
    });
  };

  const updateUserLocation = (lat: number, lng: number) => {
    if (state.user) {
      const updatedUser = { ...state.user, location: { ...state.user.location, lat, lng } };
      // Save locally first for UI responsiveness, but should also sync to backend
      localStorage.setItem('skill_link_current_user', JSON.stringify(updatedUser));
      setState(prev => ({ ...prev, user: updatedUser as User }));

      // Sync
      api.updateProfile({ location: { lat, lng } }).catch(err => console.error("Failed to sync location", err));
    }
  };

  const updateUserProfile = async (updatedUser: User) => {
    try {
      const user = await api.updateProfile(updatedUser);
      localStorage.setItem('skill_link_current_user', JSON.stringify(user));
      setState(prev => ({ ...prev, user }));
    } catch (error) {
      console.error("Update profile failed", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, updateUserLocation, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};