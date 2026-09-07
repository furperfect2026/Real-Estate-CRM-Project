import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export function useTeams() {
  const queryClient = useQueryClient();

  const useGetTeams = () => {
    return useQuery({
      queryKey: ['teams'],
      queryFn: async () => {
        const { data } = await api.get('/teams');
        return data;
      },
    });
  };

  const createTeamMutation = useMutation({
    mutationFn: async (teamData: any) => {
      const { data } = await api.post('/teams', teamData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });

  return {
    useGetTeams,
    createTeamMutation,
  };
}
