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
    const storedUser = localStorage.getItem('skill_link_current_user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.token) {
        setState({
          user: parsedUser,
          isAuthenticated: true,
          token: parsedUser.token
        });
        api.getMe().then(fullUser => {
            setState(prev => ({ ...prev, user: { ...fullUser, token: parsedUser.token } }));
        }).catch(() => logout());
      }
    }
  }, []);

  const saveToStorage = (userObj: User) => {
      const storageUser = { ...userObj };
      delete storageUser.portfolio;
      localStorage.setItem('skill_link_current_user', JSON.stringify(storageUser));
  };

  const login = async (email: string, role: UserRole) => { 
    try {
      const user = await api.login({ email, password: 'password123' });
      saveToStorage(user);
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
      saveToStorage(user);
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
      saveToStorage(updatedUser as User);
      setState(prev => ({ ...prev, user: updatedUser as User }));

      api.updateProfile({ location: { lat, lng } }).catch(err => console.error("Failed to sync location", err));
    }
  };

  const updateUserProfile = async (updatedUser: User) => {
    try {
      const user = await api.updateProfile(updatedUser);
      // Backend doesn't return the token in profile update, so we preserve it
      user.token = state.token;
      saveToStorage(user);
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