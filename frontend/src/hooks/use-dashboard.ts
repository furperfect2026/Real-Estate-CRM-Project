import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export function useDashboard() {
  const useGetDashboardStats = () => {
    return useQuery({
      queryKey: ['dashboard', 'stats'],
      queryFn: async () => {
        const { data } = await api.get('/dashboard/stats');
        return data;
      },
    });
  };

  const useGetRecentActivity = () => {
    return useQuery({
      queryKey: ['dashboard', 'activity'],
      queryFn: async () => {
        const { data } = await api.get('/dashboard/activity');
        return data;
      },
    });
  };

  return {
    useGetDashboardStats,
    useGetRecentActivity,
  };
}
