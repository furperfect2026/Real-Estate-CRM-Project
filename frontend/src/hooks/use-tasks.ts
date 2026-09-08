import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
// Mock data for Preview Mode
let mockTasks: any[] = [
  { id: "1", title: "Follow up with Adhiraj", description: "Call regarding Pride World City project", due_date: new Date().toISOString(), priority: "High", assignee: "Gayatri", status: "TODO" },
  { id: "2", title: "Send Brochure", description: "Email brochure to Siddhi", due_date: new Date().toISOString(), priority: "Medium", assignee: "Rohit Nalpe", status: "IN_PROGRESS" }
];

export function useTasks() {
  const queryClient = useQueryClient();

  const useGetTasks = () => {
    return useQuery({
      queryKey: ['tasks'],
      queryFn: async () => {
        return { items: [...mockTasks] };
      },
    });
  };

  const createTaskMutation = useMutation({
    mutationFn: async (taskData: any) => {
      const newTask = { ...taskData, id: Math.random().toString(36).substr(2, 9), status: "TODO" };
      mockTasks = [...mockTasks, newTask];
      return newTask;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, ...taskData }: any) => {
      const index = mockTasks.findIndex(t => t.id === id);
      if (index !== -1) {
        mockTasks[index] = { ...mockTasks[index], ...taskData };
        mockTasks = [...mockTasks];
      }
      return mockTasks[index];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const { data: tasksData, isLoading } = useGetTasks();

  return {
    tasks: tasksData?.items || [],
    isLoading,
    addTask: createTaskMutation.mutateAsync,
    updateTask: updateTaskMutation.mutateAsync,
    useGetTasks,
    createTaskMutation,
    updateTaskMutation,
  };
}
