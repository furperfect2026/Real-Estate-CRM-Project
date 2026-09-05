import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuthContext } from '@/providers/auth-provider';

export function useAuth() {
  const { setUser } = useAuthContext();

  const loginMutation = useMutation({
    mutationFn: async (credentials: any) => {
      const { data } = await api.post('/auth/login', credentials);
      return data;
    },
    onSuccess: (data) => {
      localStorage.setItem('token', data.token);
      if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
      setUser(data.user);
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: any) => {
      const { data } = await api.post('/auth/register', userData);
      return data;
    },
    onSuccess: (data) => {
      localStorage.setItem('token', data.token);
      if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
      setUser(data.user);
    },
  });

  return {
    loginMutation,
    registerMutation,
  };
}
