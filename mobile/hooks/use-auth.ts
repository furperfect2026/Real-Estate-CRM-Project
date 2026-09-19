import { useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { api } from '../lib/api';

export function useAuth() {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await SecureStore.getItemAsync('token');
        if (token) {
          // Ideally, verify the token or fetch user info from the server here
          // For now, we simulate being logged in if there's a token
          setUser({ id: '1', email: 'user@example.com' }); 
        }
      } catch (error) {
        console.error('Failed to restore token', error);
      } finally {
        setIsLoading(false);
      }
    };
    checkToken();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user: loggedInUser } = response.data;
      
      await SecureStore.setItemAsync('token', token);
      setUser(loggedInUser);
      return { success: true };
    } catch (error: any) {
      console.error('Login error', error);
      return { success: false, error: error.response?.data?.detail || 'Login failed' };
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync('token');
      setUser(null);
    } catch (error) {
      console.error('Logout error', error);
    }
  };

  return { user, isLoading, login, logout };
}
