import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Lead, CreateLeadDto, UpdateLeadDto, LeadActivity } from '@/types/lead.types';
import { PaginationQuery, PaginatedResponse, BaseResponse } from '@/types/api.types';
import i18n from '@/lib/i18n';
import { message } from 'antd';

export function useLeads(query?: PaginationQuery) {
  return useQuery<BaseResponse<Lead[]>>({
    queryKey: ['leads', query],
    queryFn: async () => {
      const response = await api.get('/leads', { params: query });
      return response.data;
    },
  });
}

export function useLead(id: string) {
  return useQuery<BaseResponse<Lead>>({
    queryKey: ['lead', id],
    queryFn: async () => {
      const response = await api.get(`/leads/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useLeadActivities(leadId: string) {
  return useQuery<BaseResponse<LeadActivity[]>>({
    queryKey: ['lead-activities', leadId],
    queryFn: async () => {
      const response = await api.get(`/leads/${leadId}/activities`);
      return response.data;
    },
    enabled: !!leadId,
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: CreateLeadDto) => {
      const response = await api.post('/leads', dto);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      message.success(i18n.t('hooks.lead.createdSuccess'));
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || i18n.t('hooks.lead.creationFailed'));
    },
  });
}

export function useUpdateLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, dto }: { id: string; dto: UpdateLeadDto }) => {
      const response = await api.patch(`/leads/${id}`, dto);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead', variables.id] });
      message.success(i18n.t('hooks.lead.updatedSuccess'));
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || i18n.t('hooks.lead.updateFailed'));
    },
  });
}

export function useConvertLead(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: { opportunityName?: string; expectedCloseDate?: string; amount?: number }) => {
      const response = await api.post(`/leads/${id}/convert`, dto);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead', id] });
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      message.success(i18n.t('hooks.lead.convertedSuccess'));
    },
    onError: (error: any) => {
      const resMsg = error.response?.data?.message;
      const parsedMsg = Array.isArray(resMsg) ? resMsg[0] : resMsg;
      message.error(parsedMsg || i18n.t('hooks.lead.conversionFailed'));
    },
  });
}

export function useAddLeadActivity(leadId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: { type: 'CALL' | 'EMAIL' | 'MEETING' | 'NOTE'; notes: string }) => {
      const response = await api.post(`/leads/${leadId}/activities`, dto);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-activities', leadId] });
      message.success(i18n.t('hooks.lead.activityRecorded'));
    },
  });
}

export function useDeleteLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/leads/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      message.success(i18n.t('hooks.lead.deletedSuccess'));
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || i18n.t('hooks.lead.deletionFailed'));
    },
  });
}

export function useAutoQualifyLead(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await api.post(`/leads/${id}/auto-qualify`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead', id] });
      message.success(i18n.t('hooks.lead.autoQualifySuccess'));
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || i18n.t('hooks.lead.autoQualifyFailed'));
    },
  });
}

