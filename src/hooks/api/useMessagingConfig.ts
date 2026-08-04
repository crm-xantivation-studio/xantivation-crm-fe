import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';

export function useMessagingResource(resource: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['messaging', resource],
    queryFn: async () => {
      const res = await api.get(`/integrations/chatwoot/${resource}`);
      return res.data?.data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post(`/integrations/chatwoot/${resource}`, payload);
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messaging', resource] });
    },
  });

  return {
    items: query.data || [],
    isLoading: query.isLoading,
    refetch: query.refetch,
    createItem: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
  };
}
