import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { api } from '@/services/api';
import { io } from 'socket.io-client';

export function useConversationMessages(conversationId: number | null) {
  const queryClient = useQueryClient();

  // 1. Fetch message history
  const messagesQuery = useQuery({
    queryKey: ['conversation-messages', conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      const res = await api.get(`/integrations/chatwoot/conversations/${conversationId}/messages`);
      return res.data?.data || [];
    },
    enabled: !!conversationId,
    refetchInterval: 5000, // Fallback polling
  });

  // 2. Real-time Socket.io listener
  useEffect(() => {
    if (!conversationId) return;

    const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3001';
    const socket = io(backendUrl, {
      transports: ['websocket', 'polling'],
    });

    socket.on('messaging:message_received', (data: any) => {
      if (data?.conversation?.id === conversationId || data?.conversation_id === conversationId) {
        queryClient.invalidateQueries({ queryKey: ['conversation-messages', conversationId] });
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [conversationId, queryClient]);

  // 3. Send message mutation
  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!conversationId) return;
      const res = await api.post(`/integrations/chatwoot/conversations/${conversationId}/messages`, {
        content,
        messageType: 'outgoing',
      });
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversation-messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  return {
    messages: messagesQuery.data || [],
    isLoading: messagesQuery.isLoading,
    sendMessage: sendMutation.mutateAsync,
    isSending: sendMutation.isPending,
  };
}
