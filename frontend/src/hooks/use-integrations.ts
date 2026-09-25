import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Integration } from '@/lib/types';

export function useIntegrations() {
  const queryClient = useQueryClient();

  const useGetIntegrations = () => {
    return useQuery({
      queryKey: ['integrations'],
      queryFn: async () => {
        // Mocking an initial default structure since it's frontend
        // In a real app this comes from the backend
        try {
          const { data } = await api.get<Integration[]>('/integrations');
          return data;
        } catch (error) {
          // Fallback mock data for development
          return [
            { id: '1', organization_id: 'org_1', platform: 'facebook', is_active: true, api_key: 'sk_fb_123', webhook_url: 'https://api.tathastuinfra.com/api/v1/webhooks/facebook/org_1', settings: {}, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
            { id: '2', organization_id: 'org_1', platform: '99acres', is_active: false, api_key: null, webhook_url: 'https://api.tathastuinfra.com/api/v1/webhooks/99acres/org_1', settings: {}, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
            { id: '3', organization_id: 'org_1', platform: 'magicbricks', is_active: false, api_key: null, webhook_url: 'https://api.tathastuinfra.com/api/v1/webhooks/magicbricks/org_1', settings: {}, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
            { id: '4', organization_id: 'org_1', platform: 'housing', is_active: false, api_key: null, webhook_url: 'https://api.tathastuinfra.com/api/v1/webhooks/housing/org_1', settings: {}, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
            { id: '5', organization_id: 'org_1', platform: 'website', is_active: true, api_key: 'sk_web_456', webhook_url: 'https://api.tathastuinfra.com/api/v1/webhooks/website/org_1', settings: {}, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
            { id: '6', organization_id: 'org_1', platform: 'custom', is_active: false, api_key: null, webhook_url: 'https://api.tathastuinfra.com/api/v1/webhooks/custom/org_1', settings: {}, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          ] as Integration[];
        }
      },
    });
  };

  const toggleIntegrationMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      // Mock toggling
      const { data } = await api.patch(`/integrations/${id}`, { is_active });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    },
  });

  const generateApiKeyMutation = useMutation({
    mutationFn: async (id: string) => {
      // Mock generating API key
      const { data } = await api.post(`/integrations/${id}/api-key`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    },
  });

  return {
    useGetIntegrations,
    toggleIntegrationMutation,
    generateApiKeyMutation,
  };
}
