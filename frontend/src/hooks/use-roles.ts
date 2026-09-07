import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export function useRoles() {
  const queryClient = useQueryClient();

  const useGetRoles = () => {
    return useQuery({
      queryKey: ['roles'],
      queryFn: async () => {
        const { data } = await api.get('/roles');
        return data;
      },
    });
  };

  const createRoleMutation = useMutation({
    mutationFn: async (roleData: any) => {
      const { data } = await api.post('/roles', roleData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });

  return {
    useGetRoles,
    createRoleMutation,
  };
}
