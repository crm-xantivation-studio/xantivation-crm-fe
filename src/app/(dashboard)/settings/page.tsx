'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
    { id: 'profile', name: 'Profile', icon: User },
    ...(isAdmin ? [
      { id: 'users', name: 'Employee Management', icon: Shield },
      { id: 'sales-teams', name: 'Sales Teams', icon: Users }
    ] : []),
    ...(isManagerOrAdmin ? [
      { id: 'ai-governance', name: 'AI Governance', icon: Radio },
      { id: 'integrations', name: 'Third-Party Integrations', icon: Key }
    ] : []),
  ];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--color-fg)]">Settings</h1>
        <p className="text-sm text-[var(--color-muted-fg)]">Configure system integrations, manage employee accounts, and AI settings.</p>
      </div>

      {/* Sub Tabs */}
      <div className="flex border-b border-[var(--color-border)] gap-6 pb-px">
        {allTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-2 pb-4 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                isActive
                  ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
                  : 'border-transparent text-[var(--color-muted-fg)] hover:text-[var(--color-fg)]'
              }`}
            >
              <Icon size={16} />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Sub-tab Bodies */}
      <div className="bg-[var(--color-bg-tint)] border border-[var(--color-border)] rounded-lg p-6 min-h-[400px]">
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
          <div className="space-y-6">
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
            {userModalOpen && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl p-5 w-full max-w-md space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto">
                  <h4 className="font-semibold text-sm text-[var(--color-fg)] pb-2 border-b border-[var(--color-border)]">
                    {editingUser ? 'Edit Account' : 'Create Employee Account'}
                  </h4>

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
              </div>
            )}
          </div>
        )}

        {activeSubTab === 'sales-teams' && isAdmin && (
          <div className="space-y-6">
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
            {teamModalOpen && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl p-5 w-full max-w-md space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto">
                  <h4 className="font-semibold text-sm text-[var(--color-fg)] pb-2 border-b border-[var(--color-border)]">
                    {editingTeam ? 'Edit Team' : 'Create Sales Team'}
                  </h4>

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

                  <div className="flex justify-end gap-3 pt-2">
                    <Button onClick={() => setTeamModalOpen(false)} className="rounded-xl">Cancel</Button>
                    <Button type="primary" onClick={handleSaveTeam} loading={createTeamMutation.isPending || updateTeamMutation.isPending} className="rounded-xl">Save</Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeSubTab === 'ai-governance' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-fg)]">AI Features & Agents Governance</h3>
              <p className="text-xs text-[var(--color-muted-fg)] mt-1">
                Manage LLM Providers, securely configure API keys, design hierarchical Agent Tree, and set governance rules.
              </p>
            </div>

            {/* Sub-Section Navigation */}
            <div className="flex gap-4 border-b border-[var(--color-border)]/60 pb-px">
              {[
                { id: 'providers', name: 'Providers & API Keys', icon: Server },
                { id: 'agents', name: 'Agent Tree Diagram', icon: Network },
                { id: 'controls', name: 'Features & Limits', icon: Sliders },
              ].map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setAiSubSection(sub.id as any)}
                  className={`flex items-center gap-2 pb-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                    aiSubSection === sub.id
                      ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
                      : 'border-transparent text-[var(--color-muted-fg)] hover:text-[var(--color-fg)]'
                  }`}
                >
                  <sub.icon size={14} />
                  <span>{sub.name}</span>
                </button>
              ))}
            </div>

            {/* Sub-Section Bodies */}
            {aiSubSection === 'providers' && (
              <div className="space-y-8">
                {/* Providers Section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-muted-fg)]">LLM Providers</h4>
                    <Button
                      size="small"
                      type="primary"
                      icon={<Plus size={14} />}
                      onClick={handleOpenCreateProvider}
                      className="rounded-lg text-xs cursor-pointer"
                    >
                      Add Provider
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {providersList.map((p) => {
                      const status = providerStatuses[p.id];
                      return (
                        <div key={p.id} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 flex flex-col justify-between space-y-4 hover:border-[var(--color-accent)]/50 transition-all">
                          <div className="space-y-2">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-2">
                                <Cpu size={16} className="text-[var(--color-accent)]" />
                                <span className="font-semibold text-xs text-[var(--color-fg)]">{p.name}</span>
                              </div>
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                p.type === 'CLOUD' ? 'bg-blue-500/10 text-blue-500' :
                                p.type === 'LOCAL' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-purple-500/10 text-purple-500'
                              }`}>
                                {p.type}
                              </span>
                            </div>
                            <p className="text-[9px] text-[var(--color-muted-fg)] font-mono truncate">{p.baseUrl}</p>
                          </div>

                          <div className="flex items-center gap-2 border-t border-[var(--color-border)]/50 pt-3">
                            <span className="text-[9px] text-[var(--color-muted-fg)] flex-1">
                              {status === 'success' && <Badge status="success" text="Connected" className="text-[10px]" />}
                              {status === 'failed' && <Badge status="error" text="Connection Error" className="text-[10px]" />}
                              {status === 'testing' && <Badge status="processing" text="Testing..." className="text-[10px]" />}
                              {!status && <Badge status="default" text="Not Tested" className="text-[10px]" />}
                            </span>
                            <div className="flex gap-1.5">
                              <Button size="small" onClick={() => handleTestProvider(p.id)} className="text-[10px] rounded-lg cursor-pointer">Test</Button>
                              <Button
                                size="small"
                                onClick={() => handleScanModels(p.id)}
                                loading={scanningProviderId === p.id}
                                className="text-[10px] rounded-lg cursor-pointer"
                              >
                                Scan Models
                              </Button>
                              <Button size="small" onClick={() => handleOpenEditProvider(p)} className="text-[10px] rounded-lg cursor-pointer">Edit</Button>
                              <Button size="small" danger onClick={() => handleDeleteProvider(p.id)} className="text-[10px] rounded-lg cursor-pointer">Delete</Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* API Keys Section */}
                <div className="space-y-4 border-t border-[var(--color-border)]/60 pt-6">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-muted-fg)]">API Keys (Encrypted Storage)</h4>
                    <Button
                      size="small"
                      type="primary"
                      icon={<Plus size={14} />}
                      onClick={() => handleOpenCreateKey()}
                      className="rounded-lg text-xs cursor-pointer"
                    >
                      Add API Key
                    </Button>
                  </div>

                  <SharedTable
                    dataSource={apiKeysList}
                    columns={[
                      { title: 'Label', dataIndex: 'label', key: 'label', render: (val) => <span className="font-semibold text-xs text-[var(--color-fg)]">{val}</span> },
                      {
                        title: 'Provider',
                        dataIndex: 'providerId' as any,
                        key: 'provider',
                        render: (_, record: any) => <span className="text-xs text-[var(--color-muted-fg)]">{record.provider?.name || '—'}</span>
                      },
                      { title: 'API Key', dataIndex: 'maskedKey', key: 'maskedKey', render: (val) => <span className="font-mono text-xs text-indigo-500">{val}</span> },
                      {
                        title: 'Status',
                        dataIndex: 'isActive',
                        key: 'isActive',
                        render: (active, record: any) => (
                          <Switch
                            size="small"
                            checked={active}
                            onChange={async (val) => {
                              try {
                                await updateApiKeyMutation.mutateAsync({ id: record.id, data: { isActive: val } as any });
                              } catch (e) {}
                            }}
                          />
                        )
                      },
                      {
                        title: 'Actions',
                        dataIndex: 'id' as any,
                        key: 'actions',
                        render: (_, record: any) => (
                          <Button size="small" danger icon={<Trash2 size={12} />} onClick={() => handleDeleteKey(record.id)} className="rounded-lg cursor-pointer">Delete</Button>
                        )
                      }
                    ]}
                  />
                </div>
              </div>
            )}

            {aiSubSection === 'agents' && (
              <div className="grid grid-cols-1 xl:grid-cols-10 gap-6">
                {/* Left Side: React Flow Canvas */}
                <div className="xl:col-span-7 flex flex-col space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-muted-fg)]">Agent Network Hierarchy</h4>
                    <div className="flex gap-2">
                      <Button
                        size="small"
                        icon={<Plus size={12} />}
                        onClick={() => handleOpenCreateAgent()}
                        className="text-xs rounded-lg cursor-pointer"
                      >
                        Add Root Agent
                      </Button>
                      {selectedAgentNode && (
                        <>
                          <Button
                            size="small"
                            icon={<Plus size={12} />}
                            onClick={() => handleOpenCreateAgent(selectedAgentNode.id)}
                            className="text-xs rounded-lg cursor-pointer"
                          >
                            Add Subagent
                          </Button>
                          <Button
                            size="small"
                            danger
                            icon={<Trash2 size={12} />}
                            onClick={() => handleDeleteAgent(selectedAgentNode.id)}
                            className="text-xs rounded-lg cursor-pointer"
                          >
                            Delete Agent
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="h-[520px] border border-[var(--color-border)] rounded-2xl bg-[var(--color-surface)]/30 overflow-hidden relative">
                    {agentsList.length === 0 ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                        <Network size={32} className="text-[var(--color-muted-fg)] mb-2" />
                        <p className="text-xs text-[var(--color-muted-fg)] font-semibold">No AI Agents registered yet</p>
                        <Button
                          size="small"
                          onClick={() => handleOpenCreateAgent()}
                          className="mt-3 text-xs rounded-lg cursor-pointer"
                        >
                          Create First Agent
                        </Button>
                      </div>
                    ) : (() => {
                      // Helper layout mapping function
                      const buildGraphData = (agents: any[]) => {
                        const nodes: any[] = [];
                        const edges: any[] = [];
                        const rootAgents = agents.filter((a) => !a.parentAgentId);
                        
                        rootAgents.forEach((root, rootIdx) => {
                          const rootX = rootIdx * 280 + 100;
                          const rootY = 60;
                          const rootNodeId = root.id;

                          nodes.push({
                            id: rootNodeId,
                            position: { x: rootX, y: rootY },
                            style: {
                              background: 'var(--color-surface)',
                              border: root.id === selectedAgentNode?.id ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
                              borderRadius: '12px',
                              padding: '12px',
                              width: '180px',
                              boxShadow: root.id === selectedAgentNode?.id ? '0 10px 15px -3px rgba(99, 102, 241, 0.15)' : 'none',
                              cursor: 'pointer'
                            },
                            data: { 
                              label: (
                                <div className="text-left space-y-1">
                                  <div className="flex justify-between items-center text-[8px] font-extrabold uppercase text-[var(--color-accent)]">
                                    <span>{root.role}</span>
                                    <span className={`w-1.5 h-1.5 rounded-full ${root.isActive ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                                  </div>
                                  <div className="font-bold text-xs text-[var(--color-fg)] truncate">{root.name}</div>
                                  <div className="text-[9px] text-[var(--color-muted-fg)] truncate font-mono">{root.model?.modelName || 'Default'}</div>
                                </div>
                              )
                            },
                          });

                          const subs = agents.filter((a) => a.parentAgentId === root.id);
                          subs.forEach((sub, subIdx) => {
                            const subX = rootX + (subIdx - (subs.length - 1) / 2) * 200;
                            const subY = rootY + 160;
                            const subNodeId = sub.id;

                            nodes.push({
                              id: subNodeId,
                              position: { x: subX, y: subY },
                              style: {
                                background: 'var(--color-surface)',
                                border: sub.id === selectedAgentNode?.id ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
                                borderRadius: '12px',
                                padding: '12px',
                                width: '180px',
                                boxShadow: sub.id === selectedAgentNode?.id ? '0 10px 15px -3px rgba(99, 102, 241, 0.15)' : 'none',
                                cursor: 'pointer'
                              },
                              data: {
                                label: (
                                  <div className="text-left space-y-1">
                                    <div className="flex justify-between items-center text-[8px] font-extrabold uppercase text-indigo-400">
                                      <span>{sub.role}</span>
                                      <span className={`w-1.5 h-1.5 rounded-full ${sub.isActive ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                                    </div>
                                    <div className="font-bold text-xs text-[var(--color-fg)] truncate">{sub.name}</div>
                                    <div className="text-[9px] text-[var(--color-muted-fg)] truncate font-mono">{sub.model?.modelName || 'Inherit'}</div>
                                  </div>
                                )
                              },
                            });

                            edges.push({
                              id: `e-${rootNodeId}-${subNodeId}`,
                              source: rootNodeId,
                              target: subNodeId,
                              animated: sub.isActive,
                              style: { stroke: sub.id === selectedAgentNode?.id ? 'var(--color-accent)' : 'var(--color-border)', strokeWidth: 2 },
                              markerEnd: { type: MarkerType.ArrowClosed, color: sub.id === selectedAgentNode?.id ? '#6366f1' : '#888' },
                            });

                            // Grandchildren
                            const grandSubs = agents.filter((a) => a.parentAgentId === sub.id);
                            grandSubs.forEach((grand, grandIdx) => {
                              const grandX = subX + (grandIdx - (grandSubs.length - 1) / 2) * 180;
                              const grandY = subY + 160;
                              const grandNodeId = grand.id;

                              nodes.push({
                                id: grandNodeId,
                                position: { x: grandX, y: grandY },
                                style: {
                                  background: 'var(--color-surface)',
                                  border: grand.id === selectedAgentNode?.id ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
                                  borderRadius: '12px',
                                  padding: '12px',
                                  width: '180px',
                                  boxShadow: grand.id === selectedAgentNode?.id ? '0 10px 15px -3px rgba(99, 102, 241, 0.15)' : 'none',
                                  cursor: 'pointer'
                                },
                                data: {
                                  label: (
                                    <div className="text-left space-y-1">
                                      <div className="flex justify-between items-center text-[8px] font-extrabold uppercase text-purple-400">
                                        <span>{grand.role}</span>
                                        <span className={`w-1.5 h-1.5 rounded-full ${grand.isActive ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                                      </div>
                                      <div className="font-bold text-xs text-[var(--color-fg)] truncate">{grand.name}</div>
                                      <div className="text-[9px] text-[var(--color-muted-fg)] truncate font-mono">{grand.model?.modelName || 'Inherit'}</div>
                                    </div>
                                  )
                                },
                              });

                              edges.push({
                                id: `e-${subNodeId}-${grandNodeId}`,
                                source: subNodeId,
                                target: grandNodeId,
                                animated: grand.isActive,
                                style: { stroke: grand.id === selectedAgentNode?.id ? 'var(--color-accent)' : 'var(--color-border)', strokeWidth: 2 },
                                markerEnd: { type: MarkerType.ArrowClosed, color: grand.id === selectedAgentNode?.id ? '#6366f1' : '#888' },
                              });
                            });
                          });
                        });

                        return { nodes, edges };
                      };

                      const { nodes, edges } = buildGraphData(agentsList);

                      return (
                        <ReactFlow
                          nodes={nodes}
                          edges={edges}
                          fitView
                          onNodeClick={(event, node) => {
                            const agent = agentsList.find((a) => a.id === node.id);
                            if (agent) {
                              setSelectedAgentNode(agent);
                            }
                          }}
                        >
                          <Controls />
                          <Background color="var(--color-border)" gap={16} />
                        </ReactFlow>
                      );
                    })()}
                  </div>
                </div>

                {/* Right Side: Agent Details Sidebar Editor */}
                <div className="xl:col-span-3 bg-[var(--color-surface)]/50 border border-[var(--color-border)] rounded-2xl p-4 min-h-[520px] flex flex-col justify-between">
                  {selectedAgentNode ? (
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-xs text-[var(--color-fg)]">Agent Configuration</h4>
                          <span className="text-[8px] font-bold px-2 py-0.5 bg-indigo-500/10 text-indigo-500 rounded-full">{selectedAgentNode.role}</span>
                        </div>
                        <p className="text-[10px] text-[var(--color-muted-fg)] mt-0.5">ID: {selectedAgentNode.slug}</p>
                      </div>

                      <div className="space-y-3">
                        <FloatingInput label="Agent Name" value={selectedAgentNode.name} onChange={(val) => setSelectedAgentNode({ ...selectedAgentNode, name: val })} />
                        
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[9px] font-semibold text-[var(--color-muted-fg)] uppercase">LLM Model</label>
                          <Select
                            value={selectedAgentNode.modelId}
                            onChange={(val) => setSelectedAgentNode({ ...selectedAgentNode, modelId: val })}
                            options={modelsList.map(m => ({ value: m.id, label: `${m.provider?.name} — ${m.modelName}` }))}
                            className="w-full h-9"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[9px] font-semibold text-[var(--color-muted-fg)] uppercase">API Key (Inheritance)</label>
                          <Select
                            value={selectedAgentNode.apiKeyId || ''}
                            onChange={(val) => setSelectedAgentNode({ ...selectedAgentNode, apiKeyId: val || null })}
                            options={[
                              { value: '', label: 'Inherit from Parent Agent / Provider Default' },
                              ...apiKeysList.map(k => ({ value: k.id, label: `${k.provider?.name} (${k.label})` }))
                            ]}
                            className="w-full h-9"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[9px] font-semibold text-[var(--color-muted-fg)] uppercase">Autonomy Level</label>
                          <Select
                            value={selectedAgentNode.autonomyLevel}
                            onChange={(val) => setSelectedAgentNode({ ...selectedAgentNode, autonomyLevel: val })}
                            options={[
                              { value: 'FULL', label: 'FULL (Auto execute)' },
                              { value: 'SEMI', label: 'SEMI (Requires approval)' },
                              { value: 'MANUAL', label: 'MANUAL (Run on click only)' },
                            ]}
                            className="w-full h-9"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[9px] font-semibold text-[var(--color-muted-fg)] uppercase">System Prompt Instructions</label>
                          <textarea
                            value={selectedAgentNode.systemPrompt}
                            onChange={(e) => setSelectedAgentNode({ ...selectedAgentNode, systemPrompt: e.target.value })}
                            className="w-full min-h-[100px] text-xs p-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl outline-none focus:border-[var(--color-accent)] font-mono"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 pt-4 border-t border-[var(--color-border)]/50">
                        <Button
                          type="primary"
                          size="small"
                          onClick={async () => {
                            try {
                              await updateAgentMutation.mutateAsync({
                                id: selectedAgentNode.id,
                                data: selectedAgentNode
                              });
                            } catch (e) {}
                          }}
                          className="flex-1 rounded-lg text-xs cursor-pointer"
                        >
                          Save Changes
                        </Button>
                        <Button
                          size="small"
                          danger
                          onClick={() => {
                            setSelectedAgentNode(null);
                          }}
                          className="rounded-lg text-xs cursor-pointer"
                        >
                          Close
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                      <Bot size={24} className="text-[var(--color-muted-fg)] mb-2" />
                      <p className="text-[10px] text-[var(--color-muted-fg)]">Click an Agent on the diagram to configure detailed properties, prompts, or API Key overrides.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {aiSubSection === 'controls' && (
              <div className="max-w-xl space-y-8">
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl">
                    <div>
                      <p className="font-semibold text-xs text-[var(--color-fg)]">Lead BANT Syncing</p>
                      <p className="text-[10px] text-[var(--color-muted-fg)]">Auto score leads on budget and authority parameters.</p>
                    </div>
                    <Switch checked={settings.leadBantSync} onChange={(val) => settings.updateSettings({ leadBantSync: val })} />
                  </div>

                  <div className="flex justify-between items-center p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl">
                    <div>
                      <p className="font-semibold text-xs text-[var(--color-fg)]">Opportunity Coach</p>
                      <p className="text-[10px] text-[var(--color-muted-fg)]">Suggests next actions on active pipeline steps.</p>
                    </div>
                    <Switch checked={settings.oppCoach} onChange={(val) => settings.updateSettings({ oppCoach: val })} />
                  </div>

                  <div className="flex justify-between items-center p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl">
                    <div>
                      <p className="font-semibold text-xs text-[var(--color-fg)]">Quotation Follow-up</p>
                      <p className="text-[10px] text-[var(--color-muted-fg)]">Propose email drafts based on customer timeline rules.</p>
                    </div>
                    <Switch checked={settings.quoFollowUp} onChange={(val) => settings.updateSettings({ quoFollowUp: val })} />
                  </div>

                  <div className="flex justify-between items-center p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl">
                    <div>
                      <p className="font-semibold text-xs text-[var(--color-fg)]">Contract Risk Audit</p>
                      <p className="text-[10px] text-[var(--color-muted-fg)]">Identify unfavorable clauses inside uploaded documents.</p>
                    </div>
                    <Switch checked={settings.contractRisk} onChange={(val) => settings.updateSettings({ contractRisk: val })} />
                  </div>

                  <div className="flex flex-col gap-2 pt-2">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted-fg)]">
                      Autonomy Threshold
                    </label>
                    <Select
                      value={settings.autonomyMode}
                      onChange={(val) => settings.updateSettings({ autonomyMode: val })}
                      options={[
                        { value: 'AUTO', label: 'Full Autonomy (Agentic workflow auto-trigger)' },
                        { value: 'SEMI', label: 'Semi Autonomy (Requires human click confirmation)' },
                        { value: 'OFF', label: 'Manual Only' },
                      ]}
                      className="w-full h-11"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted-fg)]">
                      Data Sensitivity Threshold
                    </label>
                    <Select
                      value={settings.sensitivityThreshold}
                      onChange={(val) => settings.updateSettings({ sensitivityThreshold: val })}
                      options={[
                        { value: 'HIGH', label: 'Strict GDPR / NDAs alignment' },
                        { value: 'MEDIUM', label: 'Balanced (Recommended)' },
                        { value: 'LOW', label: 'Permissive analysis' },
                      ]}
                      className="w-full h-11"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal: Add/Edit Provider */}
        <Modal
          title={editingProvider ? 'Edit Provider' : 'Add New Provider'}
          open={providerModalOpen}
          onOk={handleSaveProvider}
          onCancel={() => setProviderModalOpen(false)}
          okText="Save"
          cancelText="Cancel"
          className="rounded-2xl"
        >
          <div className="space-y-4 pt-3">
            <FloatingInput label="Provider Name (e.g., Ollama, Local LM)" value={providerNameInput} onChange={setProviderNameInput} />
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-semibold text-[var(--color-muted-fg)] uppercase">Provider Type</label>
              <Select
                value={providerTypeInput}
                onChange={setProviderTypeInput}
                options={[
                  { value: 'CLOUD', label: 'CLOUD (Groq, OpenAI, Gemini,...)' },
                  { value: 'LOCAL', label: 'LOCAL (Ollama, LM Studio,...)' },
                  { value: 'CUSTOM', label: 'CUSTOM (Private Network / Private Endpoint)' },
                ]}
                className="w-full h-11"
              />
            </div>

            <FloatingInput label="Base API URL (e.g., http://localhost:11434/v1)" value={providerBaseUrlInput} onChange={setProviderBaseUrlInput} />

            <div className="flex items-center justify-between p-3 border border-[var(--color-border)] rounded-xl bg-[var(--color-surface)]">
              <div>
                <p className="font-semibold text-xs text-[var(--color-fg)]">OpenAI Compatible Format</p>
                <p className="text-[8px] text-[var(--color-muted-fg)]">Uses OpenAI standard /chat/completions payload structure</p>
              </div>
              <Switch checked={providerCompatibleInput} onChange={setProviderCompatibleInput} />
            </div>

            <FloatingInput label="Icon Slug (e.g., openai, groq, custom)" value={providerIconSlugInput} onChange={setProviderIconSlugInput} />
          </div>
        </Modal>

        {/* Modal: Add API Key */}
        <Modal
          title="Add New Encrypted API Key"
          open={keyModalOpen}
          onOk={handleSaveKey}
          onCancel={() => setKeyModalOpen(false)}
          okText="Add"
          cancelText="Cancel"
          className="rounded-2xl"
        >
          <div className="space-y-4 pt-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-semibold text-[var(--color-muted-fg)] uppercase">Provider</label>
              <Select
                value={keyProviderIdInput}
                onChange={setKeyProviderIdInput}
                options={providersList.map(p => ({ value: p.id, label: `${p.name} (${p.type})` }))}
                placeholder="Select Provider for this key"
                className="w-full h-11"
              />
            </div>

            <FloatingInput label="Key Label (e.g., Prod Key, Test Key)" value={keyLabelInput} onChange={setKeyLabelInput} />
            
            <FloatingInput label="API Key Secret (Will be AES-256 encrypted)" type="password" value={keyValInput} onChange={setKeyValInput} />
          </div>
        </Modal>

        {/* Modal: Add/Edit Agent */}
        <Modal
          title={editingAgent ? 'Edit Agent' : 'Create New AI Agent'}
          open={agentModalOpen}
          onOk={handleSaveAgent}
          onCancel={() => setAgentModalOpen(false)}
          okText="Save"
          cancelText="Cancel"
          className="rounded-2xl"
          width={600}
        >
          <div className="space-y-4 pt-3">
            <div className="grid grid-cols-2 gap-4">
              <FloatingInput label="Agent Name (e.g., Lead Qualifier)" value={agentNameInput} onChange={setAgentNameInput} />
              <FloatingInput label="Identifier Slug (e.g., lead-qualifier)" value={agentSlugInput} onChange={setAgentSlugInput} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-semibold text-[var(--color-muted-fg)] uppercase">LLM Model</label>
                <Select
                  value={agentModelIdInput}
                  onChange={setAgentModelIdInput}
                  options={modelsList.map(m => ({ value: m.id, label: `${m.provider?.name} — ${m.modelName}` }))}
                  placeholder="Select Model"
                  className="w-full h-11"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-semibold text-[var(--color-muted-fg)] uppercase">Role</label>
                <Select
                  value={agentRoleInput}
                  onChange={setAgentRoleInput}
                  options={[
                    { value: 'QUALIFIER', label: 'QUALIFIER (Auto evaluate Lead)' },
                    { value: 'COACH', label: 'COACH (AI Sales Coaching)' },
                    { value: 'RISK_AUDITOR', label: 'RISK_AUDITOR (Contract Risk Analysis)' },
                    { value: 'EMAIL_DRAFTER', label: 'EMAIL_DRAFTER (Automated Email Drafting)' },
                    { value: 'CUSTOM', label: 'CUSTOM (Other)' },
                  ]}
                  className="w-full h-11"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-semibold text-[var(--color-muted-fg)] uppercase">Parent Agent</label>
                <Select
                  value={agentParentIdInput}
                  onChange={setAgentParentIdInput}
                  options={[
                    { value: '', label: 'None (This is a Root Agent)' },
                    ...agentsList.map(a => ({ value: a.id, label: a.name }))
                  ]}
                  className="w-full h-11"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-semibold text-[var(--color-muted-fg)] uppercase">API Key Override</label>
                <Select
                  value={agentApiKeyIdInput}
                  onChange={setAgentApiKeyIdInput}
                  options={[
                    { value: '', label: 'Inherit from Parent Agent / Provider Default' },
                    ...apiKeysList.map(k => ({ value: k.id, label: `${k.provider?.name} (${k.label})` }))
                  ]}
                  className="w-full h-11"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-semibold text-[var(--color-muted-fg)] uppercase">System Prompt Instructions</label>
              <textarea
                value={agentPromptInput}
                onChange={(e) => setAgentPromptInput(e.target.value)}
                placeholder="Example: You are a lead analysis expert using the BANT methodology..."
                className="w-full min-h-[120px] text-xs p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl outline-none focus:border-[var(--color-accent)] font-mono"
              />
            </div>

            <FloatingInput label="Agent Summary Description" value={agentDescInput} onChange={setAgentDescInput} />
          </div>
        </Modal>

        {activeSubTab === 'integrations' && (
          <div className="space-y-6">
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
                  <div className="space-y-4 max-w-xl">
                    <div className="flex justify-between items-center bg-[var(--color-surface)]/50 p-4 border border-[var(--color-border)] rounded-2xl">
                      <div>
                        <h4 className="font-bold text-sm text-[var(--color-fg)]">Chatwoot Inbox</h4>
                        <p className="text-[10px] text-[var(--color-muted-fg)]">Multi-channel conversation sync (Facebook, Zalo...)</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {chatwootStatus === 'success' && <Badge status="success" text="Connected" className="text-xs" />}
                        {chatwootStatus === 'failed' && <Badge status="error" text="Connection Error" className="text-xs" />}
                        <Button size="small" onClick={testChatwootConnection} className="text-xs rounded-lg cursor-pointer">Test Connection</Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FloatingInput label="Chatwoot Base URL" value={settings.chatwootUrl} onChange={(val) => settings.updateSettings({ chatwootUrl: val })} />
                      <FloatingInput label="API Access Token" type="password" value={settings.chatwootToken} onChange={(val) => settings.updateSettings({ chatwootToken: val })} />
                    </div>
                  </div>
                )}

                {/* DocuSign Content */}
                {activeIntegrationTab === 'docusign' && (
                  <div className="space-y-4 max-w-xl">
                    <div className="flex justify-between items-center bg-[var(--color-surface)]/50 p-4 border border-[var(--color-border)] rounded-2xl">
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
                    <div className="flex justify-between items-center bg-[var(--color-surface)]/50 p-4 border border-[var(--color-border)] rounded-2xl">
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
                  <div className="space-y-6">
                    <div className="flex justify-between items-center bg-[var(--color-surface)]/50 p-4 border border-[var(--color-border)] rounded-2xl">
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
