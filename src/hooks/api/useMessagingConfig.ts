import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';

export function useMessagingResource(resource: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['messaging', resource],
    queryFn: async () => {
      const res = await api.get(`/integrations/chatwoot/${resource}`);
      const raw = res.data?.data;
      if (Array.isArray(raw)) return raw;
      if (raw && typeof raw === 'object') {
        const arrayField = Object.values(raw).find((v) => Array.isArray(v));
        if (arrayField) return arrayField;
      }
      return [];
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

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string | number; payload: any }) => {
      const res = await api.patch(`/integrations/chatwoot/${resource}/${id}`, payload);
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messaging', resource] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string | number) => {
      const res = await api.delete(`/integrations/chatwoot/${resource}/${id}`);
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
    updateItem: updateMutation.mutateAsync,
    deleteItem: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

export function useSystemSettings() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['system-settings'],
    queryFn: async () => {
      const res = await api.get('/integrations/chatwoot/system-settings');
      return res.data?.data || {};
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (settings: Array<{ key: string; value?: string; isEnabled?: boolean; description?: string }>) => {
      const res = await api.post('/integrations/chatwoot/system-settings', { settings });
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
    },
  });

  return {
    settings: query.data || {},
    isLoading: query.isLoading,
    refetch: query.refetch,
    saveSettings: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
  };
}

export function useTestChatwootConnection() {
  return useMutation({
    mutationFn: async (payload: { baseUrl: string; accessToken: string; accountId?: number }) => {
      const res = await api.post('/integrations/chatwoot/test-connection', payload);
      return res.data?.data;
    },
  });
}

// === MESSAGING CHANNELS HOOKS (Phase 1 Backend API) ===

export function useMessagingChannels(includeStatus = true) {
  return useQuery({
    queryKey: ['messaging-channels', includeStatus],
    queryFn: async () => {
      const res = await api.get(`/integrations/channels?includeStatus=${includeStatus}`);
      return res.data?.data || [];
    },
  });
}

export function useSaveMessagingChannel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id?: string; payload: { name?: string; platform?: string; botToken?: string; channelName?: string; inboxId?: number } }) => {
      if (id) {
        const res = await api.patch(`/integrations/channels/${id}`, payload);
        return res.data?.data;
      } else {
        const res = await api.post('/integrations/channels', payload);
        return res.data?.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messaging-channels'] });
    },
  });
}

export function useDeleteMessagingChannel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/integrations/channels/${id}`);
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messaging-channels'] });
    },
  });
}

export function useRegisterWebhook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post(`/integrations/channels/${id}/register-webhook`);
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messaging-channels'] });
    },
  });
}

export function useRegisterAllWebhooks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await api.post('/integrations/channels/register-all');
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messaging-channels'] });
    },
  });
}

export function useTunnelTest() {
  return useMutation({
    mutationFn: async (tunnelUrl?: string) => {
      const res = await api.post('/integrations/channels/test-tunnel', { tunnelUrl });
      return res.data?.data;
    },
  });
}

export function useDiagnostics() {
  return useQuery({
    queryKey: ['messaging-diagnostics'],
    queryFn: async () => {
      const res = await api.get('/integrations/channels/diagnostics');
      return res.data?.data || null;
    },
    enabled: false, // Refetch manually on button click
  });
}

export function useInboxMembers(inboxId?: number) {
  return useQuery({
    queryKey: ['inbox-members', inboxId],
    queryFn: async () => {
      if (!inboxId) return [];
      const res = await api.get(`/integrations/chatwoot/inboxes/${inboxId}/members`);
      return res.data?.data || [];
    },
    enabled: !!inboxId,
  });
}

export function useSaveInboxMembers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ inboxId, agentIds }: { inboxId: number; agentIds: number[] }) => {
      const res = await api.post(`/integrations/chatwoot/inboxes/${inboxId}/members`, { agentIds });
      return res.data?.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['inbox-members', variables.inboxId] });
    },
  });
}

// === SOCIAL POSTS & COMMENT SETTINGS HOOKS ===

export function useSocialPosts(includeArchived = false) {
  return useQuery({
    queryKey: ['social-posts', includeArchived],
    queryFn: async () => {
      const res = await api.get(`/integrations/social-posts?includeArchived=${includeArchived}`);
      return res.data?.data || [];
    },
  });
}

export function useCreateSocialPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      title?: string;
      content: string;
      platform?: string;
      channelName?: string;
      status?: string;
      scheduledAt?: string;
      copywritingFramework?: string;
      targetAudience?: string;
      contentPillar?: string;
      hashtags?: string[];
      origin?: string;
      topicCategory?: string;
      imageUrl?: string;
      mediaUrls?: string[];
    }) => {
      const res = await api.post('/integrations/social-posts', payload);
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-posts'] });
    },
  });
}

export function usePublishSocialPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post(`/integrations/social-posts/${id}/publish`);
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-posts'] });
    },
  });
}

export function useGenerateSocialPostContent() {
  return useMutation({
    mutationFn: async (payload: string | { prompt: string; framework?: string; targetAudience?: string; contentPillar?: string; platform?: string; tone?: string; includeVisualPrompt?: boolean }) => {
      const body = typeof payload === 'string' ? { prompt: payload } : payload;
      const res = await api.post('/integrations/social-posts/generate', body);
      return res.data?.data;
    },
  });
}

export function useDeleteSocialPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/integrations/social-posts/${id}`);
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-posts'] });
    },
  });
}

export function useRestoreSocialPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post(`/integrations/social-posts/${id}/restore`);
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-posts'] });
    },
  });
}

export function useCommentSettings() {
  return useQuery({
    queryKey: ['comment-settings'],
    queryFn: async () => {
      const res = await api.get('/integrations/social-posts/comment-settings');
      return res.data?.data || null;
    },
  });
}

export function useUpdateCommentSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { autoReplyEnabled: boolean; template: string; portfolioContactLink: string }) => {
      const res = await api.post('/integrations/social-posts/comment-settings', payload);
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comment-settings'] });
    },
  });
}

// === HERMES AUTO POST & FILTERED POSTS HOOKS ===

export interface SocialPostsFilterParams {
  status?: string;
  origin?: string;
  includeArchived?: boolean;
  page?: number;
  limit?: number;
}

export function useSocialPostsFiltered(filters: SocialPostsFilterParams = {}) {
  const params = new URLSearchParams();
  if (filters.status && filters.status !== 'all') params.set('status', filters.status);
  if (filters.origin && filters.origin !== 'all') params.set('origin', filters.origin);
  if (filters.includeArchived) params.set('includeArchived', 'true');
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));

  const queryString = params.toString();

  return useQuery({
    queryKey: ['social-posts', filters],
    queryFn: async () => {
      const res = await api.get(`/integrations/social-posts${queryString ? `?${queryString}` : ''}`);
      const raw = res.data?.data;
      if (Array.isArray(raw)) return raw;
      if (raw && typeof raw === 'object' && Array.isArray(raw.data)) return raw.data;
      return [];
    },
  });
}

export function useApproveSocialPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: {
        action: 'approve' | 'approve_and_publish';
        editedContent?: string;
        editedTitle?: string;
        scheduledAt?: string;
      };
    }) => {
      const res = await api.post(`/integrations/social-posts/${id}/approve`, payload);
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-posts'] });
    },
  });
}

export function useRegenerateSocialPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: { feedback?: string; keepTopicCategory?: boolean };
    }) => {
      const res = await api.post(`/integrations/social-posts/${id}/regenerate`, payload);
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-posts'] });
    },
  });
}

export function useAutoPostConfig() {
  return useQuery({
    queryKey: ['auto-post-config'],
    queryFn: async () => {
      const res = await api.get('/integrations/social-posts/config');
      return res.data?.data || {};
    },
  });
}

export function useUpdateAutoPostConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, any>) => {
      const res = await api.post('/integrations/social-posts/config', payload);
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auto-post-config'] });
    },
  });
}

