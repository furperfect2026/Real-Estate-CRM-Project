import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { MOCK_LEADS, MobileLead } from '../data/mock-crm-data';

export type { MobileLead } from '../data/mock-crm-data';

export function useLeads() {
  return useQuery({
    queryKey: ['leads'],
    queryFn: async (): Promise<MobileLead[]> => {
      try {
        const response = await api.get<MobileLead[]>('/api/v1/leads');
        if (response.data && response.data.length > 0) {
          return response.data;
        }
      } catch (e) {
        // use rich fallback
      }
      return MOCK_LEADS;
    },
    initialData: MOCK_LEADS,
  });
}

export function useLead(id: string) {
  return useQuery({
    queryKey: ['leads', id],
    queryFn: async (): Promise<MobileLead | undefined> => {
      try {
        const response = await api.get<MobileLead>(`/api/v1/leads/${id}`);
        if (response.data) return response.data;
      } catch (e) {
        // fallback
      }
      return MOCK_LEADS.find((l) => l.id === id) || MOCK_LEADS[0];
    },
    initialData: MOCK_LEADS.find((l) => l.id === id) || MOCK_LEADS[0],
    enabled: !!id,
  });
}

export function useUpdateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<MobileLead> }) => {
      try {
        const response = await api.patch(`/api/v1/leads/${id}`, data);
        return response.data;
      } catch (e) {
        return data;
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['leads', variables.id] });
    },
  });
}
