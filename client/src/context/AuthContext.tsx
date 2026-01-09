import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService, User, RegisterInput, LoginInput } from '../services/authService';
import { api } from '../services/api';
import Toast from 'react-native-toast-message';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  register: (data: RegisterInput) => Promise<void>;
  login: (data: LoginInput) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = '@nofee:token';
const USER_KEY = '@nofee:user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load stored auth data on mount
  useEffect(() => {
    loadStoredAuth();
  }, []);

  // Set token in API service when it changes
  useEffect(() => {
    if (token) {
      api.setToken(token);
    } else {
      api.clearToken();
    }
  }, [token]);

  const loadStoredAuth = async () => {
    try {
      const [storedToken, storedUser] = await Promise.all([
        AsyncStorage.getItem(TOKEN_KEY),
        AsyncStorage.getItem(USER_KEY),
      ]);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        api.setToken(storedToken);
        
        // Verify token is still valid
        try {
          const currentUser = await authService.getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
            await AsyncStorage.setItem(USER_KEY, JSON.stringify(currentUser));
          }
        } catch (error) {
          // Token invalid, clear storage
          await logout();
        }
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterInput) => {
    try {
      const response = await authService.register(data);
      await saveAuthData(response.user, response.token);
      Toast.show({
        type: 'success',
        text1: 'Επιτυχία!',
        text2: 'Ο λογαριασμός δημιουργήθηκε επιτυχώς',
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Σφάλμα',
        text2: error.message || 'Αποτυχία εγγραφής',
      });
      throw error;
    }
  };

  const login = async (data: LoginInput) => {
    try {
      const response = await authService.login(data);
      await saveAuthData(response.user, response.token);
      Toast.show({
        type: 'success',
        text1: 'Καλώς ήρθες!',
        text2: `Γεια σου ${response.user.name || response.user.email}`,
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Σφάλμα',
        text2: error.message || 'Αποτυχία σύνδεσης',
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
      setToken(null);
      setUser(null);
      api.clearToken();
      Toast.show({
        type: 'info',
        text1: 'Αποσυνδέθηκες',
        text2: 'Ελπίζουμε να σε δούμε σύντομα!',
      });
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const refreshUser = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(currentUser));
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
      // If refresh fails, user might be logged out
      await logout();
    }
  };

  const saveAuthData = async (userData: User, tokenData: string) => {
    try {
      await Promise.all([
        AsyncStorage.setItem(TOKEN_KEY, tokenData),
        AsyncStorage.setItem(USER_KEY, JSON.stringify(userData)),
      ]);
      setUser(userData);
      setToken(tokenData);
      api.setToken(tokenData);
    } catch (error) {
      console.error('Error saving auth data:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user && !!token,
        register,
        login,
        logout,
        refreshUser,
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

