import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { ChatwootConversation, ChatwootMessage } from '@/types/conversation.types';
import { BaseResponse } from '@/types/api.types';

export function useConversations(status: 'open' | 'pending' | 'resolved' = 'open') {
  return useQuery<BaseResponse<ChatwootConversation[]>>({
    queryKey: ['conversations', status],
    queryFn: async () => {
      const response = await api.get('/integrations/chatwoot/conversations', { params: { status } });
      return response.data;
    },
  });
}

export function useConversationMessages(conversationId: number) {
  return useQuery<BaseResponse<ChatwootMessage[]>>({
    queryKey: ['conversation-messages', conversationId],
    queryFn: async () => {
      const response = await api.get(`/integrations/chatwoot/conversations/${conversationId}/messages`);
      return response.data;
    },
    enabled: !!conversationId,
  });
}

export function useSendConversationMessage(conversationId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: { content: string; messageType?: 'incoming' | 'outgoing' }) => {
      const response = await api.post(`/integrations/chatwoot/conversations/${conversationId}/messages`, dto);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversation-messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export interface ContactMatchResponse {
  matched: boolean;
  type?: 'lead' | 'customer';
  profile?: any;
}

export function useMatchConversationContact(params: { email?: string; phone?: string }) {
  return useQuery<BaseResponse<ContactMatchResponse>>({
    queryKey: ['match-contact', params],
    queryFn: async () => {
      const response = await api.get('/integrations/chatwoot/match', { params });
      return response.data;
    },
    enabled: !!(params.email || params.phone),
  });
}

export function useAIStatus(conversationId: number) {
  return useQuery<BaseResponse<{ conversationId: number; aiMode: boolean }>>({
    queryKey: ['ai-status', conversationId],
    queryFn: async () => {
      const response = await api.get(`/integrations/chatwoot/conversations/${conversationId}/ai-status`);
      return response.data;
    },
    enabled: !!conversationId,
  });
}

export function useToggleAIMode(conversationId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await api.patch(`/integrations/chatwoot/conversations/${conversationId}/toggle-ai`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-status', conversationId] });
    },
  });
}

// --- MESSAGING CONTROLS HOOKS ---

export function useBlockContact() {
  return useMutation({
    mutationFn: async (contactId: number) => {
      const response = await api.put(`/integrations/chatwoot/contacts/${contactId}/block`);
      return response.data;
    },
  });
}

export function useUnblockContact() {
  return useMutation({
    mutationFn: async (contactId: number) => {
      const response = await api.delete(`/integrations/chatwoot/contacts/${contactId}/block`);
      return response.data;
    },
  });
}

export function useAssignConversation(conversationId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (assigneeId: number | null) => {
      const response = await api.post(`/integrations/chatwoot/conversations/${conversationId}/assign`, { assigneeId });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useUpdateConversationStatus(conversationId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (status: 'open' | 'pending' | 'resolved') => {
      const response = await api.patch(`/integrations/chatwoot/conversations/${conversationId}/status`, { status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useConversationLabels(conversationId: number) {
  return useQuery<BaseResponse<string[]>>({
    queryKey: ['conversation-labels', conversationId],
    queryFn: async () => {
      const response = await api.get(`/integrations/chatwoot/conversations/${conversationId}/labels`);
      return response.data;
    },
    enabled: !!conversationId,
  });
}

export function useAddConversationLabels(conversationId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (labels: string[]) => {
      const response = await api.post(`/integrations/chatwoot/conversations/${conversationId}/labels`, { labels });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversation-labels', conversationId] });
    },
  });
}

// --- DRAFT LEADS HOOKS ---

export function useDraftLeads(conversationId: number | null) {
  return useQuery<BaseResponse<any[]>>({
    queryKey: ['draft-leads', conversationId],
    queryFn: async () => {
      const response = await api.get(`/integrations/chatwoot/conversations/${conversationId}/draft-leads`);
      return response.data;
    },
    enabled: !!conversationId,
  });
}

export function useExtractLead(conversationId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await api.post(`/integrations/chatwoot/conversations/${conversationId}/extract-lead`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['draft-leads', conversationId] });
    },
  });
}

export function useApproveDraftLead(conversationId?: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ draftId, overrides }: { draftId: string; overrides?: any }) => {
      const response = await api.patch(`/integrations/chatwoot/leads/${draftId}/approve-draft`, overrides);
      return response.data;
    },
    onSuccess: () => {
      if (conversationId) {
        queryClient.invalidateQueries({ queryKey: ['draft-leads', conversationId] });
        queryClient.invalidateQueries({ queryKey: ['match-contact'] });
        queryClient.invalidateQueries({ queryKey: ['leads'] });
      }
    },
  });
}

export function useRejectDraftLead(conversationId?: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (draftId: string) => {
      const response = await api.patch(`/integrations/chatwoot/leads/${draftId}/reject-draft`);
      return response.data;
    },
    onSuccess: () => {
      if (conversationId) {
        queryClient.invalidateQueries({ queryKey: ['draft-leads', conversationId] });
        queryClient.invalidateQueries({ queryKey: ['leads'] });
      }
    },
  });
}

export function useUpdateDraftLead(conversationId?: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ draftId, updates }: { draftId: string; updates: any }) => {
      const response = await api.patch(`/integrations/chatwoot/leads/${draftId}/update-draft`, updates);
      return response.data;
    },
    onSuccess: () => {
      if (conversationId) {
        queryClient.invalidateQueries({ queryKey: ['draft-leads', conversationId] });
      }
    },
  });
}

// --- AI COPILOT & QUICK ACTIONS HOOKS ---

export function useSummarizeConversation(conversationId: number) {
  return useMutation({
    mutationFn: async () => {
      const response = await api.post(`/integrations/chatwoot/conversations/${conversationId}/summarize`);
      return response.data;
    },
  });
}

export function useSuggestQuickQuote(conversationId: number) {
  return useMutation({
    mutationFn: async () => {
      const response = await api.post(`/integrations/chatwoot/conversations/${conversationId}/quick-quote-suggest`);
      return response.data;
    },
  });
}

export function useCreateQuickQuote(conversationId: number) {
  return useMutation({
    mutationFn: async (payload: { leadId?: string; customerId?: string; items: Array<{ productName: string; quantity: number; unitPrice: number }> }) => {
      const response = await api.post(`/integrations/chatwoot/conversations/${conversationId}/quick-quote`, payload);
      return response.data;
    },
  });
}

export function useCreateQuickActivity(conversationId: number) {
  return useMutation({
    mutationFn: async (payload: { type: string; title: string; scheduledAt?: string; leadId?: string; customerId?: string }) => {
      const response = await api.post(`/integrations/chatwoot/conversations/${conversationId}/quick-activity`, payload);
      return response.data;
    },
  });
}
