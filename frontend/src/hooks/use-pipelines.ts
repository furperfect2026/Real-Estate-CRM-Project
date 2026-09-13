import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

// Mock data for Preview Mode - Tathastu Infra 7-Stage Flow
const mockStages = [
  { id: "1", name: "New Lead", order: 1, color: "blue", stage: "NEW_LEAD", icon: "Inbox" },
  { id: "2", name: "Assigned", order: 2, color: "purple", stage: "ASSIGNED", icon: "UserPlus" },
  { id: "3", name: "Calling", order: 3, color: "amber", stage: "CALLING", icon: "PhoneCall" },
  { id: "4", name: "Interested", order: 4, color: "emerald", stage: "INTERESTED", icon: "Star" },
  { id: "5", name: "Site Visit", order: 5, color: "indigo", stage: "SITE_VISIT", icon: "Calendar" },
  { id: "6", name: "Negotiation", order: 6, color: "rose", stage: "NEGOTIATION", icon: "Handshake" },
  { id: "7", name: "Converted (Client)", order: 7, color: "teal", stage: "CONVERTED", icon: "CheckCircle" },
];

export function usePipelines() {
  const queryClient = useQueryClient();

  const useGetPipelineStages = () => {
    return useQuery({
      queryKey: ['pipeline-stages'],
      queryFn: async () => {
        return { items: mockStages };
      },
    });
  };

  const { data: stagesData, isLoading: isLoadingStages } = useGetPipelineStages();

  return {
    stages: stagesData?.items || [],
    isLoadingStages,
    useGetPipelineStages,
  };
}
