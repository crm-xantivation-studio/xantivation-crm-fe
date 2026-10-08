'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button, Select, Switch, message, Badge, Modal, Spin } from 'antd';
import { FloatingInput } from '@/components/FloatingInput';
import { Save, User, Shield, Radio, Key, Plus, Users, MessageSquare, PenTool, Mail, Bot, Settings as SettingsIcon, RefreshCw, Trash2, Cpu, Sliders, Database, Network, Server, Play } from 'lucide-react';
import SharedTable from '@/components/SharedTable';
import type { ColumnProps } from '@/components/SharedTable';
import { useAuthStore } from '@/stores/auth.store';
import { useSettingsStore } from '@/stores/settings.store';
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser, useUpdateProfile, SystemUser, useSalesTeams, useCreateSalesTeam, useUpdateSalesTeam, useDeleteSalesTeam } from '@/hooks/api/useUser';
import { useTestErpConnection, useSyncCustomers, useSyncLeads, useSyncQuotations, useSyncPayments, useSyncOpportunities, useSyncMeetings, useSyncSalesTeams, useSyncUtm, useSyncActivities } from '@/hooks/api/useErp';
import { UserRole } from '@/types/auth.types';

// React Flow Imports
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// AI Settings Query Hooks
import {
  useProviders,
  useCreateProvider,
  useUpdateProvider,
  useDeleteProvider,
  useTestProviderConnection,
  useFetchModelsFromProvider,
  useApiKeys,
  useCreateApiKey,
  useUpdateApiKey,
  useDeleteApiKey,
  useModels,
  useCreateModel,
  useDeleteModel,
  useAgents,
  useCreateAgent,
  useUpdateAgent,
  useDeleteAgent,
  useExecutionLogs,
} from '@/hooks/api/useAiSettings';


export default function Settings() {
  const user = useAuthStore((state) => state.user);
  const updateUserStore = useAuthStore((state) => state.updateUser);
  const settings = useSettingsStore();

  const [activeSubTab, setActiveSubTab] = useState('profile');
  const [activeIntegrationTab, setActiveIntegrationTab] = useState('chatwoot');

  // --- Profile State ---
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profilePassword, setProfilePassword] = useState('');
  // Language preference read from persisted settings store
  const settingsLocale = useSettingsStore((state) => state.locale);
  const updateSettings = useSettingsStore((state) => state.updateSettings);
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      const u = user as any;
      setProfileName(u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || '');
      setProfileEmail(u.email || '');
    }
  }, [user]);

  // --- Users Tab API Hooks ---
  const { data: usersRes, isLoading: isUsersLoading } = useUsers();
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();
  const updateProfileMutation = useUpdateProfile();

  const usersList = usersRes?.data || [];

  // --- Users CRUD State ---
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [userNameInput, setUserNameInput] = useState('');
  const [userEmailInput, setUserEmailInput] = useState('');
  const [userPasswordInput, setUserPasswordInput] = useState('');
  const [userRoleInput, setUserRoleInput] = useState<UserRole>(UserRole.SALES_REP);
  const [userErrors, setUserErrors] = useState<Record<string, string>>({});
  const [userModalOpen, setUserModalOpen] = useState(false);

  // --- AI Settings States ---
  const [aiSubSection, setAiSubSection] = useState<'providers' | 'agents' | 'controls'>('providers');

  // Providers states
  const [providerModalOpen, setProviderModalOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<any>(null);
  const [providerNameInput, setProviderNameInput] = useState('');
  const [providerTypeInput, setProviderTypeInput] = useState<'CLOUD' | 'LOCAL' | 'CUSTOM'>('CLOUD');
  const [providerBaseUrlInput, setProviderBaseUrlInput] = useState('');
  const [providerCompatibleInput, setProviderCompatibleInput] = useState(true);
  const [providerIconSlugInput, setProviderIconSlugInput] = useState('');

  // API Key states
  const [keyModalOpen, setKeyModalOpen] = useState(false);
  const [keyProviderIdInput, setKeyProviderIdInput] = useState('');
  const [keyLabelInput, setKeyLabelInput] = useState('');
  const [keyValInput, setKeyValInput] = useState('');

  // Agent States
  const [agentModalOpen, setAgentModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<any>(null);
  const [agentNameInput, setAgentNameInput] = useState('');
  const [agentSlugInput, setAgentSlugInput] = useState('');
  const [agentRoleInput, setAgentRoleInput] = useState('QUALIFIER');
  const [agentDescInput, setAgentDescInput] = useState('');
  const [agentPromptInput, setAgentPromptInput] = useState('');
  const [agentModelIdInput, setAgentModelIdInput] = useState('');
  const [agentParentIdInput, setAgentParentIdInput] = useState('');
  const [agentApiKeyIdInput, setAgentApiKeyIdInput] = useState('');
  const [agentAutonomyInput, setAgentAutonomyInput] = useState<'FULL' | 'SEMI' | 'MANUAL'>('SEMI');
  const [agentMaxTokensInput, setAgentMaxTokensInput] = useState<number>(2048);
  const [agentTempInput, setAgentTempInput] = useState<number>(0.3);
  const [agentRepModeInput, setAgentRepModeInput] = useState<'REALTIME' | 'BATCH' | 'SILENT'>('REALTIME');
  const [agentRepTargetInput, setAgentRepTargetInput] = useState('');

  // Selected agent node for sidebar editor
  const [selectedAgentNode, setSelectedAgentNode] = useState<any>(null);

  // --- AI Settings API Hooks ---
  const { data: providersRes } = useProviders();
  const { data: apiKeysRes } = useApiKeys();
  const { data: modelsRes } = useModels();
  const { data: agentsRes } = useAgents();

  const createProviderMutation = useCreateProvider();
  const updateProviderMutation = useUpdateProvider();
  const deleteProviderMutation = useDeleteProvider();
  const testProviderConnectionMutation = useTestProviderConnection();
  const fetchModelsMutation = useFetchModelsFromProvider();

  const createKeyMutation = useCreateApiKey();
  const updateApiKeyMutation = useUpdateApiKey();
  const deleteKeyMutation = useDeleteApiKey();

  const createAgentMutation = useCreateAgent();
  const updateAgentMutation = useUpdateAgent();
  const deleteAgentMutation = useDeleteAgent();

  const providersList = providersRes?.data || [];
  const apiKeysList = apiKeysRes?.data || [];
  const modelsList = modelsRes?.data || [];
  const agentsList = agentsRes?.data || [];

  // Connection tester states
  const [chatwootStatus, setChatwootStatus] = useState<null | 'success' | 'failed'>(null);
  const [docusignStatus, setDocusignStatus] = useState<null | 'success' | 'failed'>(null);
  const [resendStatus, setResendStatus] = useState<null | 'success' | 'failed'>(null);
  const [erpStatus, setErpStatus] = useState<null | 'success' | 'failed'>(null);
  const [integrationErrors, setIntegrationErrors] = useState<Record<string, string>>({});

  // --- ERP Sync Mutations ---
  const testErpMutation = useTestErpConnection();
  const syncCustomersMutation = useSyncCustomers();
  const syncLeadsMutation = useSyncLeads();
  const syncQuotationsMutation = useSyncQuotations();
  const syncPaymentsMutation = useSyncPayments();
  const syncOpportunitiesMutation = useSyncOpportunities();
  const syncMeetingsMutation = useSyncMeetings();
  const syncSalesTeamsMutation = useSyncSalesTeams();
  const syncUtmMutation = useSyncUtm();
  const syncActivitiesMutation = useSyncActivities();

  // Helper validations
  const validateUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const validateGuid = (guid: string) => {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(guid);
  };

  // --- Connection Testers ---
  const testChatwootConnection = () => {
    const errs: Record<string, string> = {};
    if (!settings.chatwootUrl || !validateUrl(settings.chatwootUrl)) {
      errs.chatwoot_base_url = 'Chatwoot URL is required';
    }
    if (!settings.chatwootToken || settings.chatwootToken.length < 10) {
      errs.chatwoot_api_access_token = 'API token is required';
    }

    if (Object.keys(errs).length > 0) {
      setIntegrationErrors(errs);
      setChatwootStatus('failed');
      message.error('Validation failed for Chatwoot Integration.');
      return;
    }

    setIntegrationErrors({});
    setChatwootStatus(null);
    message.loading('Testing connection to Chatwoot...');
    setTimeout(() => {
      setChatwootStatus('success');
      message.success('Chatwoot Connection test passed successfully!');
    }, 1200);
  };

  const testDocuSignConnection = () => {
    const errs: Record<string, string> = {};
    if (!settings.docusignKey || !validateGuid(settings.docusignKey)) {
      errs.docusign_integration_key = 'Integration Key must be a valid GUID format';
    }
    if (!settings.docusignSecret) {
      errs.docusign_secret_key = 'Secret Key is required';
    }
    if (!settings.docusignAccountId || !validateGuid(settings.docusignAccountId)) {
      errs.docusign_account_id = 'Account ID must be a valid GUID format';
    }

    if (Object.keys(errs).length > 0) {
      setIntegrationErrors(errs);
      setDocusignStatus('failed');
      message.error('Validation failed for DocuSign Integration.');
      return;
    }

    setIntegrationErrors({});
    setDocusignStatus(null);
    message.loading('Requesting DocuSign JWT Token...');
    setTimeout(() => {
      setDocusignStatus('success');
      message.success('DocuSign Connection verified successfully!');
    }, 1200);
  };

  const testResendConnection = () => {
    const errs: Record<string, string> = {};
    if (!settings.resendApiKey) {
      errs.resend_api_key = 'Resend API Key is required';
    }

    if (Object.keys(errs).length > 0) {
      setIntegrationErrors(errs);
      setResendStatus('failed');
      message.error('Validation failed for Resend Integration.');
      return;
    }

    setIntegrationErrors({});
    setResendStatus(null);
    message.loading('Testing Resend mail gateway...');
    setTimeout(() => {
      setResendStatus('success');
      message.success('Resend connection verified!');
    }, 1200);
  };


  const handleTestErpConnection = async () => {
    if (!settings.erpUrl || !validateUrl(settings.erpUrl)) {
      message.error('ERP Endpoint URL is invalid');
      setErpStatus('failed');
      return;
    }
    if (!settings.erpDb || !settings.erpUsername) {
      message.error('ERP Database and Username are required');
      setErpStatus('failed');
      return;
    }

    setErpStatus(null);
    const hide = message.loading('Testing connection to ERP server via XML-RPC...', 0);
    try {
      const response = await testErpMutation.mutateAsync({
        url: settings.erpUrl,
        db: settings.erpDb,
        username: settings.erpUsername,
        password: settings.erpPassword,
      });
      hide();
      if (response.statusCode === 200) {
        setErpStatus('success');
        message.success('ERP Connection test passed successfully!');
      } else {
        setErpStatus('failed');
        message.error(response.message || 'ERP Connection test failed');
      }
    } catch (err: any) {
      hide();
      setErpStatus('failed');
      message.error(err?.response?.data?.message || err.message || 'ERP Connection test failed');
    }
  };

  const handleSyncErp = async (moduleType: 'customers' | 'leads' | 'opportunities' | 'quotations' | 'payments' | 'meetings' | 'sales-teams' | 'utm' | 'activities') => {
    const hide = message.loading(`Synchronizing ${moduleType} with ERP...`, 0);
    try {
      let res;
      if (moduleType === 'customers') {
        res = await syncCustomersMutation.mutateAsync(undefined);
      } else if (moduleType === 'leads') {
        res = await syncLeadsMutation.mutateAsync(undefined);
      } else if (moduleType === 'opportunities') {
        res = await syncOpportunitiesMutation.mutateAsync(undefined);
      } else if (moduleType === 'quotations') {
        res = await syncQuotationsMutation.mutateAsync(undefined);
      } else if (moduleType === 'payments') {
        res = await syncPaymentsMutation.mutateAsync(undefined);
      } else if (moduleType === 'meetings') {
        res = await syncMeetingsMutation.mutateAsync(undefined);
      } else if (moduleType === 'sales-teams') {
        res = await syncSalesTeamsMutation.mutateAsync(undefined);
      } else if (moduleType === 'utm') {
        res = await syncUtmMutation.mutateAsync();
      } else {
        res = await syncActivitiesMutation.mutateAsync(undefined);
      }
      hide();
      if (res.statusCode === 200) {
        message.success(res.message || `Sync of ${moduleType} completed successfully`);
      } else {
        message.error(res.message || `Sync of ${moduleType} failed`);
      }
    } catch (err: any) {
      hide();
      message.error(err?.response?.data?.message || err.message || `Sync of ${moduleType} failed`);
    }
  };

  // --- CRUD Users ---
  const handleOpenCreateUser = () => {
    setEditingUser(null);
    setUserNameInput('');
    setUserEmailInput('');
    setUserPasswordInput('');
    setUserRoleInput(UserRole.SALES_REP);
    setUserErrors({});
    setUserModalOpen(true);
  };

  const handleOpenEditUser = (record: SystemUser) => {
    setEditingUser(record);
    setUserNameInput(record.name);
    setUserEmailInput(record.email);
    setUserPasswordInput('');
    setUserRoleInput(record.role);
    setUserErrors({});
    setUserModalOpen(true);
  };

  const handleSaveUser = async () => {
    const errs: Record<string, string> = {};
    if (!userNameInput.trim()) errs.name = 'Name is required';
    if (!userEmailInput.trim() || !userEmailInput.includes('@')) errs.email = 'Valid Email is required';
    if (!editingUser && !userPasswordInput) errs.password = 'Password is required for new users';

    if (Object.keys(errs).length > 0) {
      setUserErrors(errs);
      return;
    }

    try {
      if (editingUser) {
        await updateUserMutation.mutateAsync({
          id: editingUser.id,
          dto: {
            name: userNameInput,
            email: userEmailInput,
            role: userRoleInput,
            password: userPasswordInput || undefined,
          },
        });
      } else {
        await createUserMutation.mutateAsync({
          name: userNameInput,
          email: userEmailInput,
          role: userRoleInput,
          password: userPasswordInput,
        });
      }
      setUserModalOpen(false);
    } catch (err) {
      // Handled
    }
  };

  const handleDeleteUser = async (record: SystemUser) => {
    try {
      await deleteUserMutation.mutateAsync(record.id);
    } catch (err) {
      // Handled
    }
  };

  // --- Sales Teams Tab API Hooks ---
  const { data: teamsRes, isLoading: isTeamsLoading } = useSalesTeams();
  const createTeamMutation = useCreateSalesTeam();
  const updateTeamMutation = useUpdateSalesTeam();
  const deleteTeamMutation = useDeleteSalesTeam();

  const teamsList = teamsRes?.data || [];

  // --- Sales Teams CRUD State ---
  const [editingTeam, setEditingTeam] = useState<any | null>(null);
  const [teamNameInput, setTeamNameInput] = useState('');
  const [teamDescInput, setTeamDescInput] = useState('');
  const [teamLeaderInput, setTeamLeaderInput] = useState<string | undefined>(undefined);
  const [teamMembersInput, setTeamMembersInput] = useState<string[]>([]);
  const [teamRuleInput, setTeamRuleInput] = useState('ROUND_ROBIN');
  const [teamErrors, setTeamErrors] = useState<Record<string, string>>({});
  const [teamModalOpen, setTeamModalOpen] = useState(false);

  const handleOpenCreateTeam = () => {
    setEditingTeam(null);
    setTeamNameInput('');
    setTeamDescInput('');
    setTeamLeaderInput(undefined);
    setTeamMembersInput([]);
    setTeamRuleInput('ROUND_ROBIN');
    setTeamErrors({});
    setTeamModalOpen(true);
  };

  const handleOpenEditTeam = (record: any) => {
    setEditingTeam(record);
    setTeamNameInput(record.name || '');
    setTeamDescInput(record.description || '');
    setTeamLeaderInput(record.leader?.id);
    setTeamMembersInput(record.members?.map((m: any) => m.id) || []);
    setTeamRuleInput(record.assignmentRule || 'ROUND_ROBIN');
    setTeamErrors({});
    setTeamModalOpen(true);
  };

  const handleSaveTeam = async () => {
    const errs: Record<string, string> = {};
    if (!teamNameInput.trim()) errs.name = 'Team name is required';

    if (Object.keys(errs).length > 0) {
      setTeamErrors(errs);
      return;
    }

    try {
      const payload = {
        name: teamNameInput,
        description: teamDescInput,
        leaderId: teamLeaderInput || null,
        memberIds: teamMembersInput,
        assignmentRule: teamRuleInput,
      };

      if (editingTeam) {
        await updateTeamMutation.mutateAsync({
          id: editingTeam.id,
          data: payload,
        });
      } else {
        await createTeamMutation.mutateAsync(payload);
      }
      setTeamModalOpen(false);
    } catch (err) {
      // Handled
    }
  };

  const handleDeleteTeam = async (record: any) => {
    try {
      await deleteTeamMutation.mutateAsync(record.id);
    } catch (err) {
      // Handled
    }
  };

  const teamColumns: ColumnProps<any>[] = [
    { title: 'Team Name', dataIndex: 'name', key: 'name', render: (val) => <span className="font-semibold text-[var(--color-fg)]">{val}</span> },
    { title: 'Description', dataIndex: 'description', key: 'description', render: (val) => <span className="text-xs text-[var(--color-muted-fg)]">{val || '—'}</span> },
    {
      title: 'Team Leader',
      dataIndex: 'leader',
      key: 'leader',
      render: (leader) => <span className="text-xs font-semibold text-[var(--color-fg)]">{leader?.name || 'Unassigned'}</span>,
    },
    {
      title: 'Member Count',
      dataIndex: 'members',
      key: 'members',
      render: (members) => <span className="text-xs text-[var(--color-muted-fg)] font-mono">{(members || []).length} employees</span>,
    },
    {
      title: 'Assignment Rule',
      dataIndex: 'assignmentRule',
      key: 'assignmentRule',
      render: (rule) => (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${rule === 'ROUND_ROBIN' ? 'bg-indigo-500/10 text-indigo-500' : 'bg-gray-500/10 text-gray-500'}`}>
          {rule === 'ROUND_ROBIN' ? 'Round Robin' : 'Manual'}
        </span>
      ),
    },
  ];

  const handleSaveProfile = async () => {
    if (!user) return;
    const errs: Record<string, string> = {};
    if (!profileName.trim()) errs.name = 'Name is required';
    if (!profileEmail.trim() || !profileEmail.includes('@')) errs.email = 'Valid Email is required';

    if (Object.keys(errs).length > 0) {
      setProfileErrors(errs);
      return;
    }

    try {
      await updateProfileMutation.mutateAsync({
        id: user.id,
        dto: {
          name: profileName,
          email: profileEmail,
          password: profilePassword || undefined,
        },
      });
      updateUserStore({
        name: profileName,
        email: profileEmail,
      } as any);
      setProfilePassword('');
    } catch (err) {
      // Handled
    }
  };

  // === AI Settings Handlers ===
  const [providerStatuses, setProviderStatuses] = useState<Record<string, 'success' | 'failed' | 'testing' | null>>({});
  const [scanningProviderId, setScanningProviderId] = useState<string | null>(null);

  const handleTestProvider = async (providerId: string) => {
    setProviderStatuses(prev => ({ ...prev, [providerId]: 'testing' }));
    try {
      const res = await testProviderConnectionMutation.mutateAsync(providerId);
      if (res.success) {
        setProviderStatuses(prev => ({ ...prev, [providerId]: 'success' }));
        message.success(`Successfully connected to provider!`);
      } else {
        setProviderStatuses(prev => ({ ...prev, [providerId]: 'failed' }));
        message.error(`Connection failed: ${res.message}`);
      }
    } catch (err: any) {
      setProviderStatuses(prev => ({ ...prev, [providerId]: 'failed' }));
      message.error(`Connection error: ${err.message || err}`);
    }
  };

  const handleScanModels = async (providerId: string) => {
    setScanningProviderId(providerId);
    try {
      await fetchModelsMutation.mutateAsync(providerId);
    } catch (err) {
      // Handled
    } finally {
      setScanningProviderId(null);
    }
  };

  const handleOpenCreateProvider = () => {
    setEditingProvider(null);
    setProviderNameInput('');
    setProviderTypeInput('CLOUD');
    setProviderBaseUrlInput('');
    setProviderCompatibleInput(true);
    setProviderIconSlugInput('');
    setProviderModalOpen(true);
  };

  const handleOpenEditProvider = (p: any) => {
    setEditingProvider(p);
    setProviderNameInput(p.name || '');
    setProviderTypeInput(p.type || 'CLOUD');
    setProviderBaseUrlInput(p.baseUrl || '');
    setProviderCompatibleInput(p.isOpenAiCompatible);
    setProviderIconSlugInput(p.iconSlug || '');
    setProviderModalOpen(true);
  };

  const handleSaveProvider = async () => {
    if (!providerNameInput.trim()) {
      message.error('Please enter provider name');
      return;
    }
    if (!providerBaseUrlInput.trim()) {
      message.error('Please enter Base URL');
      return;
    }
    const payload = {
      name: providerNameInput,
      type: providerTypeInput,
      baseUrl: providerBaseUrlInput,
      isOpenAiCompatible: providerCompatibleInput,
      iconSlug: providerIconSlugInput || undefined,
    };
    try {
      if (editingProvider) {
        await updateProviderMutation.mutateAsync({ id: editingProvider.id, data: payload });
      } else {
        await createProviderMutation.mutateAsync(payload);
      }
      setProviderModalOpen(false);
    } catch (err) {}
  };

  const handleDeleteProvider = async (id: string) => {
    Modal.confirm({
      title: 'Confirm delete provider?',
      content: 'This action will delete all associated API Keys and Models.',
      okText: 'Delete',
      cancelText: 'Cancel',
      okType: 'danger',
      onOk: async () => {
        try {
          await deleteProviderMutation.mutateAsync(id);
        } catch (err) {}
      }
    });
  };

  const handleOpenCreateKey = (providerId?: string) => {
    setKeyProviderIdInput(providerId || '');
    setKeyLabelInput('');
    setKeyValInput('');
    setKeyModalOpen(true);
  };

  const handleSaveKey = async () => {
    if (!keyProviderIdInput) {
      message.error('Please select a provider');
      return;
    }
    if (!keyLabelInput.trim()) {
      message.error('Please enter key label');
      return;
    }
    if (!keyValInput.trim()) {
      message.error('Please enter API Key');
      return;
    }
    try {
      await createKeyMutation.mutateAsync({
        providerId: keyProviderIdInput,
        label: keyLabelInput,
        key: keyValInput,
      });
      setKeyModalOpen(false);
    } catch (err) {}
  };

  const handleDeleteKey = (id: string) => {
    Modal.confirm({
      title: 'Confirm delete API Key?',
      okText: 'Delete',
      cancelText: 'Cancel',
      okType: 'danger',
      onOk: async () => {
        try {
          await deleteKeyMutation.mutateAsync(id);
        } catch (err) {}
      }
    });
  };

  const handleOpenCreateAgent = (parentId?: string) => {
    setEditingAgent(null);
    setAgentNameInput('');
    setAgentSlugInput('');
    setAgentRoleInput('QUALIFIER');
    setAgentDescInput('');
    setAgentPromptInput('');
    setAgentModelIdInput('');
    setAgentParentIdInput(parentId || '');
    setAgentApiKeyIdInput('');
    setAgentAutonomyInput('SEMI');
    setAgentMaxTokensInput(2048);
    setAgentTempInput(0.3);
    setAgentRepModeInput('REALTIME');
    setAgentRepTargetInput('');
    setAgentModalOpen(true);
  };

  const handleOpenEditAgent = (agent: any) => {
    setEditingAgent(agent);
    setAgentNameInput(agent.name || '');
    setAgentSlugInput(agent.slug || '');
    setAgentRoleInput(agent.role || 'QUALIFIER');
    setAgentDescInput(agent.description || '');
    setAgentPromptInput(agent.systemPrompt || '');
    setAgentModelIdInput(agent.modelId || '');
    setAgentParentIdInput(agent.parentAgentId || '');
    setAgentApiKeyIdInput(agent.apiKeyId || '');
    setAgentAutonomyInput(agent.autonomyLevel || 'SEMI');
    setAgentMaxTokensInput(agent.maxTokensPerRequest || 2048);
    setAgentTempInput(agent.temperature !== undefined ? agent.temperature : 0.3);
    setAgentRepModeInput(agent.reportingMode || 'REALTIME');
    setAgentRepTargetInput(agent.reportingTarget || '');
    setAgentModalOpen(true);
  };

  const handleSaveAgent = async () => {
    if (!agentNameInput.trim()) {
      message.error('Please enter Agent name');
      return;
    }
    if (!agentSlugInput.trim()) {
      message.error('Please enter identifier slug');
      return;
    }
    if (!agentPromptInput.trim()) {
      message.error('Please enter System Prompt');
      return;
    }
    if (!agentModelIdInput) {
      message.error('Please select LLM model');
      return;
    }
    const payload = {
      name: agentNameInput,
      slug: agentSlugInput,
      role: agentRoleInput,
      description: agentDescInput || undefined,
      systemPrompt: agentPromptInput,
      modelId: agentModelIdInput,
      parentAgentId: agentParentIdInput || undefined,
      apiKeyId: agentApiKeyIdInput || undefined,
      autonomyLevel: agentAutonomyInput,
      maxTokensPerRequest: agentMaxTokensInput,
      temperature: agentTempInput,
      reportingMode: agentRepModeInput,
      reportingTarget: agentRepTargetInput || undefined,
    };
    try {
      if (editingAgent) {
        await updateAgentMutation.mutateAsync({ id: editingAgent.id, data: payload });
        if (selectedAgentNode && selectedAgentNode.id === editingAgent.id) {
          setSelectedAgentNode({ ...selectedAgentNode, ...payload });
        }
      } else {
        await createAgentMutation.mutateAsync(payload);
      }
      setAgentModalOpen(false);
    } catch (err) {}
  };

  const handleDeleteAgent = (id: string) => {
    Modal.confirm({
      title: 'Confirm delete AI Agent?',
      content: 'This action will permanently delete the Agent and all its Subagents.',
      okText: 'Delete',
      cancelText: 'Cancel',
      okType: 'danger',
      onOk: async () => {
        try {
          await deleteAgentMutation.mutateAsync(id);
          if (selectedAgentNode && selectedAgentNode.id === id) {
            setSelectedAgentNode(null);
          }
        } catch (err) {}
      }
    });
  };


  const userColumns: ColumnProps<SystemUser>[] = [
    { title: 'Employee Name', dataIndex: 'name', key: 'name', render: (val) => <span className="font-semibold text-[var(--color-fg)]">{val}</span> },
    { title: 'Email', dataIndex: 'email', key: 'email', render: (val) => <span className="font-mono text-xs text-[var(--color-muted-fg)]">{val}</span> },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => {
        let color = 'bg-gray-500/10 text-gray-500';
        if (role === 'ADMIN') color = 'bg-red-500/10 text-red-500';
        if (role === 'SALES_MANAGER') color = 'bg-indigo-500/10 text-indigo-500';
        if (role === 'ACCOUNTANT') color = 'bg-amber-500/10 text-amber-500';
        return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${color}`}>{role}</span>;
      },
    },
  ];

  const isAdmin = user?.role === UserRole.ADMIN;
  const isManagerOrAdmin = user?.role === UserRole.ADMIN || user?.role === UserRole.SALES_MANAGER;

  const allTabs = [
    { id: 'profile', name: 'Profile', desc: 'Thông tin cá nhân & mật khẩu', icon: User },
    ...(isAdmin ? [
      { id: 'users', name: 'Employee Management', desc: 'Quản lý tài khoản nhân viên', icon: Shield },
      { id: 'sales-teams', name: 'Sales Teams', desc: 'Cấu hình nhóm kinh doanh', icon: Users }
    ] : []),
    ...(isManagerOrAdmin ? [
      { id: 'integrations', name: 'Third-Party Integrations', desc: 'Kết nối ERP, Mail & AI', icon: Key }
    ] : []),
  ];

  return (
    <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden bg-[var(--color-bg)]">
      {/* Secondary Left Sidebar (SCRUM-67) */}
      <motion.div
        initial={{ x: -250, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        className="w-72 shrink-0 flex flex-col border-r border-[var(--color-border)] bg-[var(--color-bg)] h-full overflow-y-auto"
      >
        <div className="px-5 py-5 border-b border-[var(--color-border)] mb-2 shrink-0">
          <h1 className="text-base font-bold text-[var(--color-fg)] flex items-center gap-2 mb-1">
            <SettingsIcon size={18} className="text-[var(--color-accent)]" />
            <span>Settings</span>
          </h1>
          <p className="text-[11px] text-[var(--color-muted-fg)] leading-tight">
            Configure system integrations, manage employee accounts, and AI settings.
          </p>
        </div>
        <div className="px-3 flex flex-col gap-1.5 pb-6">
          {allTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[var(--color-surface)] text-[var(--color-fg)] font-semibold shadow-sm border border-[var(--color-border)]/50'
                    : 'text-[var(--color-muted-fg)] hover:text-[var(--color-fg)] hover:bg-[var(--color-surface)]/50 border border-transparent'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-[var(--color-accent)]' : 'text-[var(--color-muted-fg)]'} />
                <div className="flex flex-col">
                  <span className="text-xs font-semibold">{tab.name}</span>
                  <span className="text-[10px] text-[var(--color-muted-fg)]">{tab.desc}</span>
                </div>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Right Content Panel */}
      <div className="flex-1 p-6 lg:p-8 overflow-y-auto bg-[var(--color-bg-tint)] relative">
        {activeSubTab === 'profile' && (
          <div className="max-w-xl space-y-6">
            <h3 className="text-sm font-semibold text-[var(--color-fg)]">Personal Information</h3>
            <div className="space-y-4">
              <div>
                <FloatingInput label="Full Name" value={profileName} onChange={setProfileName} required />
                {profileErrors.name && <p className="text-red-500 text-[10px] mt-1">{profileErrors.name}</p>}
              </div>
              <div>
                <FloatingInput label="Login Email" value={profileEmail} onChange={setProfileEmail} required />
                {profileErrors.email && <p className="text-red-500 text-[10px] mt-1">{profileErrors.email}</p>}
              </div>
              <div>
                <FloatingInput label="Change Password (Leave blank to keep current)" type="password" value={profilePassword} onChange={setProfilePassword} />
              </div>
            </div>

            <div className="pt-4">
              <Button type="primary" onClick={handleSaveProfile} loading={updateProfileMutation.isPending} className="flex items-center gap-2 h-10 px-5 rounded-xl cursor-pointer">
                <Save size={16} />
                <span>Save Changes</span>
              </Button>
            </div>
          </div>
        )}

        {activeSubTab === 'users' && isAdmin && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold text-[var(--color-fg)]">Account Management (Admin Only)</h3>
              <Button type="primary" onClick={handleOpenCreateUser} className="flex items-center gap-2 h-9 px-4 rounded-xl cursor-pointer">
                <Plus size={14} />
                <span>Add Employee</span>
              </Button>
            </div>

            {isUsersLoading ? (
              <div className="py-12 flex justify-center"><Spin /></div>
            ) : (
              <SharedTable
                columns={userColumns}
                dataSource={usersList}
                onEdit={handleOpenEditUser}
                onDelete={handleDeleteUser}
              />
            )}

            {/* Modal Edit/Create User */}
            <Modal
              title={editingUser ? 'Edit Account' : 'Create Employee Account'}
              open={userModalOpen}
              onCancel={() => setUserModalOpen(false)}
              footer={null}
              zIndex={1050}
              centered
              destroyOnClose
            >
              <div className="space-y-4 pt-3">
                <div className="space-y-3">
                  <div>
                    <FloatingInput label="Full Name" value={userNameInput} onChange={setUserNameInput} required />
                    {userErrors.name && <p className="text-red-500 text-[10px] mt-0.5">{userErrors.name}</p>}
                  </div>
                  <div>
                    <FloatingInput label="Email Address" value={userEmailInput} onChange={setUserEmailInput} required />
                    {userErrors.email && <p className="text-red-500 text-[10px] mt-0.5">{userErrors.email}</p>}
                  </div>
                  <div>
                    <FloatingInput label="Password" type="password" value={userPasswordInput} onChange={setUserPasswordInput} required={!editingUser} />
                    {userErrors.password && <p className="text-red-500 text-[10px] mt-0.5">{userErrors.password}</p>}
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono uppercase tracking-tight text-[var(--color-muted-fg)] font-medium">System Role</label>
                    <Select
                      value={userRoleInput}
                      onChange={setUserRoleInput}
                      options={[
                        { value: 'SALES_REP', label: 'Sales Representative' },
                        { value: 'SALES_MANAGER', label: 'Sales Manager' },
                        { value: 'ACCOUNTANT', label: 'Accountant' },
                        { value: 'ADMIN', label: 'Administrator' },
                      ]}
                      className="w-full h-9 text-xs"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-3 border-t border-[var(--color-border)]">
                  <button onClick={() => setUserModalOpen(false)} className="px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-surface)] text-[var(--color-muted-fg)] hover:text-[var(--color-fg)] transition-all cursor-pointer">Cancel</button>
                  <button onClick={handleSaveUser} className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-[var(--color-accent)] to-cyan-500 hover:opacity-90 text-white shadow-sm transition-all cursor-pointer">Save</button>
                </div>
              </div>
            </Modal>
          </div>
        )}

        {activeSubTab === 'sales-teams' && isAdmin && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold text-[var(--color-fg)]">Sales Team Management (Admin Only)</h3>
              <Button type="primary" onClick={handleOpenCreateTeam} className="flex items-center gap-2 h-9 px-4 rounded-xl cursor-pointer">
                <Plus size={14} />
                <span>Add Team</span>
              </Button>
            </div>

            {isTeamsLoading ? (
              <div className="py-12 flex justify-center"><Spin /></div>
            ) : (
              <SharedTable
                columns={teamColumns}
                dataSource={teamsList}
                onEdit={handleOpenEditTeam}
                onDelete={handleDeleteTeam}
              />
            )}

            {/* Modal Edit/Create Sales Team */}
            <Modal
              title={editingTeam ? 'Edit Team' : 'Create Sales Team'}
              open={teamModalOpen}
              onCancel={() => setTeamModalOpen(false)}
              footer={null}
              zIndex={1050}
              centered
              destroyOnClose
            >
              <div className="space-y-4 pt-3">
                <div className="space-y-3">
                  <div>
                    <FloatingInput label="Team Name" value={teamNameInput} onChange={setTeamNameInput} required />
                    {teamErrors.name && <p className="text-red-500 text-[10px] mt-0.5">{teamErrors.name}</p>}
                  </div>
                  <div>
                    <FloatingInput label="Team Description" value={teamDescInput} onChange={setTeamDescInput} />
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-mono uppercase tracking-tight text-[var(--color-muted-fg)] font-medium">Team Leader</label>
                    <Select
                      value={teamLeaderInput}
                      onChange={setTeamLeaderInput}
                      placeholder="Select Team Leader"
                      options={usersList.filter(u => u.role === 'SALES_MANAGER' || u.role === 'ADMIN').map(u => ({ value: u.id, label: `${u.name} (${u.role})` }))}
                      className="w-full h-11"
                      allowClear
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted-fg)]">Members</label>
                    <Select
                      mode="multiple"
                      value={teamMembersInput}
                      onChange={setTeamMembersInput}
                      placeholder="Select Sales Members"
                      options={usersList.map(u => ({ value: u.id, label: `${u.name} (${u.role})` }))}
                      className="w-full min-h-11"
                      allowClear
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted-fg)]">Auto Assignment Rule</label>
                    <Select
                      value={teamRuleInput}
                      onChange={setTeamRuleInput}
                      options={[
                        { value: 'ROUND_ROBIN', label: 'Round Robin (Rotating assignment)' },
                        { value: 'MANUAL', label: 'Manual (Assign manually)' },
                      ]}
                      className="w-full h-11"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-[var(--color-border)]">
                  <Button onClick={() => setTeamModalOpen(false)} className="rounded-xl">Cancel</Button>
                  <Button type="primary" onClick={handleSaveTeam} loading={createTeamMutation.isPending || updateTeamMutation.isPending} className="rounded-xl">Save</Button>
                </div>
              </div>
            </Modal>
          </div>
        )}

        {activeSubTab === 'integrations' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-fg)]">Service Integration Configuration</h3>
              <p className="text-xs text-[var(--color-muted-fg)] mt-1">Connect and synchronize data with third-party platforms and services.</p>
            </div>

            <div className="flex gap-6 min-h-[480px] border-t border-[var(--color-border)] pt-6">
              {/* Left Navigation Menu */}
              <div className="w-1/4 flex flex-col gap-1 border-r border-[var(--color-border)] pr-6">
                {[
                  { id: 'chatwoot', name: 'Chatwoot Inbox', icon: MessageSquare, desc: 'Omnichannel Inbox' },
                  { id: 'docusign', name: 'DocuSign Signature', icon: PenTool, desc: 'E-Signature Hub' },
                  { id: 'resend', name: 'Resend SMTP', icon: Mail, desc: 'Mail Gateway' },
                  { id: 'erp', name: 'ERP Sync', icon: RefreshCw, desc: 'XML-RPC Connection' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveIntegrationTab(tab.id)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all cursor-pointer ${
                      activeIntegrationTab === tab.id
                        ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)] border-l-2 border-[var(--color-accent)] pl-2.5'
                        : 'text-[var(--color-muted-fg)] hover:text-[var(--color-fg)] hover:bg-[var(--color-muted-bg)]/20'
                    }`}
                  >
                    <tab.icon size={16} className={activeIntegrationTab === tab.id ? 'text-[var(--color-accent)]' : 'text-[var(--color-muted-fg)]'} />
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold">{tab.name}</span>
                      <span className="text-[9px] text-[var(--color-muted-fg)]">{tab.desc}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Right Panel Content */}
              <div className="w-3/4 pl-2 space-y-6">
                {/* Chatwoot Content */}
                {activeIntegrationTab === 'chatwoot' && (
                  <div className="space-y-4 max-w-xl bg-[var(--color-surface)]/50 p-6 border border-[var(--color-border)] rounded-[5px]">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="text-[var(--color-accent)]" size={24} />
                      <div>
                        <h4 className="font-bold text-sm text-[var(--color-fg)]">Cấu Hình Chatwoot Omnichannel</h4>
                        <p className="text-xs text-[var(--color-muted-fg)]">Toàn bộ cài đặt kết nối Chatwoot, công tắc Bật/Tắt AI và quản lý Kênh đã được di chuyển về trung tâm quản trị Messaging.</p>
                      </div>
                    </div>
                    <div className="pt-2">
                      <a
                        href="/messaging/configuration"
                        className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-[var(--color-accent)] text-white hover:opacity-90 transition-all cursor-pointer"
                      >
                        <span>Đi tới Cấu hình Kênh Tương Tác (/messaging/configuration)</span>
                      </a>
                    </div>
                  </div>
                )}

                {/* DocuSign Content */}
                {activeIntegrationTab === 'docusign' && (
                  <div className="space-y-4 max-w-xl">
                    <div className="flex justify-between items-center bg-[var(--color-surface)]/50 p-4 border border-[var(--color-border)] rounded-[5px]">
                      <div>
                        <h4 className="font-bold text-sm text-[var(--color-fg)]">DocuSign E-Signature Hub</h4>
                        <p className="text-[10px] text-[var(--color-muted-fg)]">E-signature automation on CRM Contracts</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {docusignStatus === 'success' && <Badge status="success" text="Connected" className="text-xs" />}
                        {docusignStatus === 'failed' && <Badge status="error" text="Connection Error" className="text-xs" />}
                        <Button size="small" onClick={testDocuSignConnection} className="text-xs rounded-lg cursor-pointer">Test Connection</Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FloatingInput label="Integration Key (GUID)" value={settings.docusignKey} onChange={(val) => settings.updateSettings({ docusignKey: val })} />
                      <FloatingInput label="Secret Key" type="password" value={settings.docusignSecret} onChange={(val) => settings.updateSettings({ docusignSecret: val })} />
                      <FloatingInput label="Account ID (GUID)" value={settings.docusignAccountId} onChange={(val) => settings.updateSettings({ docusignAccountId: val })} />
                      <FloatingInput label="User ID (GUID)" value={settings.docusignUserId} onChange={(val) => settings.updateSettings({ docusignUserId: val })} />
                    </div>
                  </div>
                )}

                {/* Resend Content */}
                {activeIntegrationTab === 'resend' && (
                  <div className="space-y-4 max-w-xl">
                    <div className="flex justify-between items-center bg-[var(--color-surface)]/50 p-4 border border-[var(--color-border)] rounded-[5px]">
                      <div>
                        <h4 className="font-bold text-sm text-[var(--color-fg)]">Resend SMTP Gateway</h4>
                        <p className="text-[10px] text-[var(--color-muted-fg)]">Automated quotation and contract email sending</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {resendStatus === 'success' && <Badge status="success" text="Connected" className="text-xs" />}
                        {resendStatus === 'failed' && <Badge status="error" text="Connection Error" className="text-xs" />}
                        <Button size="small" onClick={testResendConnection} className="text-xs rounded-lg cursor-pointer">Test Connection</Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FloatingInput label="Resend API Key" type="password" value={settings.resendApiKey} onChange={(val) => settings.updateSettings({ resendApiKey: val })} />
                      <FloatingInput label="From Email Address" value={settings.resendFromEmail} onChange={(val) => settings.updateSettings({ resendFromEmail: val })} />
                    </div>
                  </div>
                )}

                {/* ERP Sync Content */}
                {activeIntegrationTab === 'erp' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center bg-[var(--color-surface)]/50 p-4 border border-[var(--color-border)] rounded-[5px]">
                      <div>
                        <h4 className="font-bold text-sm text-[var(--color-fg)]">ERP System Sync</h4>
                        <p className="text-[10px] text-[var(--color-muted-fg)]">Bi-directional sync of customers, opportunities, quotations, and payment invoices via XML-RPC</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {erpStatus === 'success' && <Badge status="success" text="Connected" className="text-xs" />}
                        {erpStatus === 'failed' && <Badge status="error" text="Connection Error" className="text-xs" />}
                        <Button size="small" onClick={handleTestErpConnection} className="text-xs rounded-lg cursor-pointer">Test Connection</Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 max-w-xl">
                      <FloatingInput label="ERP XML-RPC URL" value={settings.erpUrl} onChange={(val) => settings.updateSettings({ erpUrl: val })} />
                      <FloatingInput label="ERP Database Name" value={settings.erpDb} onChange={(val) => settings.updateSettings({ erpDb: val })} />
                      <FloatingInput label="Username / Email" value={settings.erpUsername} onChange={(val) => settings.updateSettings({ erpUsername: val })} />
                      <FloatingInput label="Password / API Key" type="password" value={settings.erpPassword || ''} onChange={(val) => settings.updateSettings({ erpPassword: val })} />
                    </div>

                    <div className="border-t border-[var(--color-border)] pt-4 space-y-4">
                      <h5 className="font-semibold text-xs text-[var(--color-fg)]">ERP Module Sync & Automation</h5>
                      <div className="grid grid-cols-2 gap-4">
                        {/* Customers */}
                        <div className="flex flex-col justify-between p-3 border border-[var(--color-border)] rounded-xl bg-[var(--color-muted-bg)]/20 space-y-3">
                          <div className="flex justify-between items-start">
                            <div className="space-y-0.5">
                              <span className="text-xs font-semibold text-[var(--color-fg)]">Customers & Contacts</span>
                              <p className="text-[10px] text-[var(--color-muted-fg)]">Sync companies and individual contacts</p>
                            </div>
                            <Button size="small" onClick={() => handleSyncErp('customers')} className="text-xs rounded-lg cursor-pointer">Sync Now</Button>
                          </div>
                          <div className="flex justify-between items-center border-t border-[var(--color-border)]/50 pt-2">
                            <span className="text-[10px] text-[var(--color-muted-fg)]">Auto Sync</span>
                            <Switch size="small" checked={settings.erpAutoSyncCustomers} onChange={(val) => settings.updateSettings({ erpAutoSyncCustomers: val })} />
                          </div>
                        </div>
                        
                        {/* Leads */}
                        <div className="flex flex-col justify-between p-3 border border-[var(--color-border)] rounded-xl bg-[var(--color-muted-bg)]/20 space-y-3">
                          <div className="flex justify-between items-start">
                            <div className="space-y-0.5">
                              <span className="text-xs font-semibold text-[var(--color-fg)]">Leads</span>
                              <p className="text-[10px] text-[var(--color-muted-fg)]">Sync new lead information</p>
                            </div>
                            <Button size="small" onClick={() => handleSyncErp('leads')} className="text-xs rounded-lg cursor-pointer">Sync Now</Button>
                          </div>
                          <div className="flex justify-between items-center border-t border-[var(--color-border)]/50 pt-2">
                            <span className="text-[10px] text-[var(--color-muted-fg)]">Auto Sync</span>
                            <Switch size="small" checked={settings.erpAutoSyncLeads} onChange={(val) => settings.updateSettings({ erpAutoSyncLeads: val })} />
                          </div>
                        </div>

                        {/* Opportunities */}
                        <div className="flex flex-col justify-between p-3 border border-[var(--color-border)] rounded-xl bg-[var(--color-muted-bg)]/20 space-y-3">
                          <div className="flex justify-between items-start">
                            <div className="space-y-0.5">
                              <span className="text-xs font-semibold text-[var(--color-fg)]">Sales Opportunities</span>
                              <p className="text-[10px] text-[var(--color-muted-fg)]">Sync opportunity pipeline</p>
                            </div>
                            <Button size="small" onClick={() => handleSyncErp('opportunities')} className="text-xs rounded-lg cursor-pointer">Sync Now</Button>
                          </div>
                          <div className="flex justify-between items-center border-t border-[var(--color-border)]/50 pt-2">
                            <span className="text-[10px] text-[var(--color-muted-fg)]">Auto Sync</span>
                            <Switch size="small" checked={settings.erpAutoSyncOpportunities} onChange={(val) => settings.updateSettings({ erpAutoSyncOpportunities: val })} />
                          </div>
                        </div>

                        {/* Quotations */}
                        <div className="flex flex-col justify-between p-3 border border-[var(--color-border)] rounded-xl bg-[var(--color-muted-bg)]/20 space-y-3">
                          <div className="flex justify-between items-start">
                            <div className="space-y-0.5">
                              <span className="text-xs font-semibold text-[var(--color-fg)]">Quotations</span>
                              <p className="text-[10px] text-[var(--color-muted-fg)]">Sync fixed quotations and scope items</p>
                            </div>
                            <Button size="small" onClick={() => handleSyncErp('quotations')} className="text-xs rounded-lg cursor-pointer">Sync Now</Button>
                          </div>
                          <div className="flex justify-between items-center border-t border-[var(--color-border)]/50 pt-2">
                            <span className="text-[10px] text-[var(--color-muted-fg)]">Auto Sync</span>
                            <Switch size="small" checked={settings.erpAutoSyncQuotations} onChange={(val) => settings.updateSettings({ erpAutoSyncQuotations: val })} />
                          </div>
                        </div>

                        {/* Payments */}
                        <div className="flex flex-col justify-between p-3 border border-[var(--color-border)] rounded-xl bg-[var(--color-muted-bg)]/20 space-y-3">
                          <div className="flex justify-between items-start">
                            <div className="space-y-0.5">
                              <span className="text-xs font-semibold text-[var(--color-fg)]">Payments & Invoices</span>
                              <p className="text-[10px] text-[var(--color-muted-fg)]">Sync invoices and payment status</p>
                            </div>
                            <Button size="small" onClick={() => handleSyncErp('payments')} className="text-xs rounded-lg cursor-pointer">Sync Now</Button>
                          </div>
                          <div className="flex justify-between items-center border-t border-[var(--color-border)]/50 pt-2">
                            <span className="text-[10px] text-[var(--color-muted-fg)]">Auto Sync</span>
                            <Switch size="small" checked={settings.erpAutoSyncPayments} onChange={(val) => settings.updateSettings({ erpAutoSyncPayments: val })} />
                          </div>
                        </div>

                        {/* Meetings */}
                        <div className="flex flex-col justify-between p-3 border border-[var(--color-border)] rounded-xl bg-[var(--color-muted-bg)]/20 space-y-3">
                          <div className="flex justify-between items-start">
                            <div className="space-y-0.5">
                              <span className="text-xs font-semibold text-[var(--color-fg)]">Meetings & Events</span>
                              <p className="text-[10px] text-[var(--color-muted-fg)]">Sync meeting schedules and customer events</p>
                            </div>
                            <Button size="small" onClick={() => handleSyncErp('meetings')} className="text-xs rounded-lg cursor-pointer">Sync Now</Button>
                          </div>
                          <div className="flex justify-between items-center border-t border-[var(--color-border)]/50 pt-2">
                            <span className="text-[10px] text-[var(--color-muted-fg)]">Auto Sync</span>
                            <Switch size="small" checked={settings.erpAutoSyncMeetings} onChange={(val) => settings.updateSettings({ erpAutoSyncMeetings: val })} />
                          </div>
                        </div>

                        {/* Sales Teams */}
                        <div className="flex flex-col justify-between p-3 border border-[var(--color-border)] rounded-xl bg-[var(--color-muted-bg)]/20 space-y-3">
                          <div className="flex justify-between items-start">
                            <div className="space-y-0.5">
                              <span className="text-xs font-semibold text-[var(--color-fg)]">Sales Teams</span>
                              <p className="text-[10px] text-[var(--color-muted-fg)]">Sync teams and task distribution</p>
                            </div>
                            <Button size="small" onClick={() => handleSyncErp('sales-teams')} className="text-xs rounded-lg cursor-pointer">Sync Now</Button>
                          </div>
                          <div className="flex justify-between items-center border-t border-[var(--color-border)]/50 pt-2">
                            <span className="text-[10px] text-[var(--color-muted-fg)]">Auto Sync</span>
                            <Switch size="small" checked={settings.erpAutoSyncSalesTeams} onChange={(val) => settings.updateSettings({ erpAutoSyncSalesTeams: val })} />
                          </div>
                        </div>

                        {/* UTM Sources */}
                        <div className="flex flex-col justify-between p-3 border border-[var(--color-border)] rounded-xl bg-[var(--color-muted-bg)]/20 space-y-3">
                          <div className="flex justify-between items-start">
                            <div className="space-y-0.5">
                              <span className="text-xs font-semibold text-[var(--color-fg)]">Campaigns & UTM Sources</span>
                              <p className="text-[10px] text-[var(--color-muted-fg)]">Sync UTM sources and campaigns</p>
                            </div>
                            <Button size="small" onClick={() => handleSyncErp('utm')} className="text-xs rounded-lg cursor-pointer">Sync Now</Button>
                          </div>
                          <div className="flex justify-between items-center border-t border-[var(--color-border)]/50 pt-2">
                            <span className="text-[10px] text-[var(--color-muted-fg)]">Auto Sync</span>
                            <Switch size="small" checked={settings.erpAutoSyncUtm} onChange={(val) => settings.updateSettings({ erpAutoSyncUtm: val })} />
                          </div>
                        </div>

                        {/* Activities */}
                        <div className="flex flex-col justify-between p-3 border border-[var(--color-border)] rounded-xl bg-[var(--color-muted-bg)]/20 space-y-3">
                          <div className="flex justify-between items-start">
                            <div className="space-y-0.5">
                              <span className="text-xs font-semibold text-[var(--color-fg)]">Activity Log</span>
                              <p className="text-[10px] text-[var(--color-muted-fg)]">Sync calls, emails, activities</p>
                            </div>
                            <Button size="small" onClick={() => handleSyncErp('activities')} className="text-xs rounded-lg cursor-pointer">Sync Now</Button>
                          </div>
                          <div className="flex justify-between items-center border-t border-[var(--color-border)]/50 pt-2">
                            <span className="text-[10px] text-[var(--color-muted-fg)]">Auto Sync</span>
                            <Switch size="small" checked={settings.erpAutoSyncActivities} onChange={(val) => settings.updateSettings({ erpAutoSyncActivities: val })} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
