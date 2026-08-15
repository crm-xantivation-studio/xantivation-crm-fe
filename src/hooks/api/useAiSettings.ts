import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { BaseResponse } from '@/types/api.types';
import {
  LlmProvider,
  ApiKey,
  LlmModel,
  Agent,
  AgentExecutionLog,
  CreateProviderDto,
  CreateApiKeyDto,
  CreateModelDto,
  CreateAgentDto,
} from '@/types/ai-settings.types';
import i18n from '@/lib/i18n';
import { message } from 'antd';

// === Providers Hooks ===
export function useProviders() {
  return useQuery<BaseResponse<LlmProvider[]>>({
    queryKey: ['llm-providers'],
    queryFn: async () => {
      const response = await api.get('/ai-settings/providers');
      return response.data;
    },
  });
}

export function useCreateProvider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: CreateProviderDto) => {
      const response = await api.post('/ai-settings/providers', dto);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['llm-providers'] });
      message.success(i18n.t('hooks.aiSettings.providerAdded'));
    },
  });
}

export function useUpdateProvider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateProviderDto> }) => {
      const response = await api.patch(`/ai-settings/providers/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['llm-providers'] });
      message.success(i18n.t('hooks.aiSettings.providerUpdated'));
    },
  });
}

export function useDeleteProvider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/ai-settings/providers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['llm-providers'] });
      message.success(i18n.t('hooks.aiSettings.providerDeleted'));
    },
  });
}

export function useTestProviderConnection() {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(`/ai-settings/providers/${id}/test`);
      return response.data;
    },
  });
}

export function useFetchModelsFromProvider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(`/ai-settings/providers/${id}/fetch-models`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['llm-models'] });
      queryClient.invalidateQueries({ queryKey: ['llm-providers'] });
      message.success(i18n.t('hooks.aiSettings.modelsScanned'));
    },
  });
}

// === API Keys Hooks ===
export function useApiKeys() {
  return useQuery<BaseResponse<ApiKey[]>>({
    queryKey: ['api-keys'],
    queryFn: async () => {
      const response = await api.get('/ai-settings/api-keys');
      return response.data;
    },
  });
}

export function useCreateApiKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: CreateApiKeyDto) => {
      const response = await api.post('/ai-settings/api-keys', dto);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      message.success(i18n.t('hooks.aiSettings.apiKeySaved'));
    },
  });
}

export function useUpdateApiKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateApiKeyDto> }) => {
      const response = await api.patch(`/ai-settings/api-keys/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      message.success(i18n.t('hooks.aiSettings.apiKeyUpdated'));
    },
  });
}

export function useDeleteApiKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/ai-settings/api-keys/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      message.success(i18n.t('hooks.aiSettings.apiKeyDeleted'));
    },
  });
}

// === Models Hooks ===
export function useModels() {
  return useQuery<BaseResponse<LlmModel[]>>({
    queryKey: ['llm-models'],
    queryFn: async () => {
      const response = await api.get('/ai-settings/models');
      return response.data;
    },
  });
}

export function useCreateModel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: CreateModelDto) => {
      const response = await api.post('/ai-settings/models', dto);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['llm-models'] });
      message.success(i18n.t('hooks.aiSettings.modelAdded'));
    },
  });
}

export function useDeleteModel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/ai-settings/models/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['llm-models'] });
      message.success(i18n.t('hooks.aiSettings.modelDeleted'));
    },
  });
}

// === Agents Hooks ===
export function useAgents() {
  return useQuery<BaseResponse<Agent[]>>({
    queryKey: ['agents'],
    queryFn: async () => {
      const response = await api.get('/ai-settings/agents');
      return response.data;
    },
  });
}

export function useAgentBySlug(slug: string) {
  return useQuery<BaseResponse<Agent>>({
    queryKey: ['agent', slug],
    queryFn: async () => {
      const response = await api.get(`/ai-settings/agents/slug/${slug}`);
      return response.data;
    },
    enabled: !!slug,
  });
}

export function useCreateAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: CreateAgentDto) => {
      const response = await api.post('/ai-settings/agents', dto);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      message.success(i18n.t('hooks.aiSettings.agentCreated'));
    },
  });
}

export function useUpdateAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateAgentDto> }) => {
      const response = await api.patch(`/ai-settings/agents/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      message.success(i18n.t('hooks.aiSettings.agentUpdated'));
    },
  });
}

export function useDeleteAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/ai-settings/agents/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      message.success(i18n.t('hooks.aiSettings.agentDeleted'));
    },
  });
}

// === Execution Logs Hooks ===
export function useExecutionLogs(page = 1, limit = 20) {
  return useQuery<BaseResponse<{ data: AgentExecutionLog[]; total: number }>>({
    queryKey: ['execution-logs', page, limit],
    queryFn: async () => {
      const response = await api.get(`/ai-settings/execution-logs?page=${page}&limit=${limit}`);
      return response.data;
    },
  });
}

// === Configuration Hooks ===
export function useAiConfiguration() {
  return useQuery<BaseResponse<Record<string, any>>>({
    queryKey: ['ai-configuration'],
    queryFn: async () => {
      const response = await api.get('/ai-settings/configuration');
      return response.data;
    },
  });
}

export function useUpdateAiConfiguration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (settings: Record<string, any>) => {
      const response = await api.patch('/ai-settings/configuration', { settings });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-configuration'] });
      message.success('AI Governance configuration saved & synced in real-time');
    },
  });
}

