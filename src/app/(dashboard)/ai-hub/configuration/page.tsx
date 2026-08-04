'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Server, Network, Shield, Sliders, Terminal, Plus, Trash2, Cpu,
  Key, RefreshCw, Save, CheckCircle2, AlertTriangle, HelpCircle,
  Activity, Radio, Bot, ShieldCheck, Lock, Play, Layers, CornerDownRight, X,
  Brain, Globe, Image as ImageIcon, FileText, Sparkles, Search, Zap, SlidersHorizontal, ArrowRight, RotateCcw
} from 'lucide-react';
import { Button, Select, Switch, message, Badge, Modal, Spin, InputNumber, Segmented, AutoComplete, Tooltip, Slider } from 'antd';
import { FloatingInput } from '@/components/FloatingInput';
import SharedTable from '@/components/SharedTable';
import { useAuthStore } from '@/stores/auth.store';
import { useAiConfigStore } from '@/stores/ai-config.store';
import { UserRole } from '@/types/auth.types';

// React Flow Imports for Agent Canvas
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  MarkerType,
  useNodesState,
  useEdgesState,
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
  useAiConfiguration,
  useUpdateAiConfiguration,
  useAuxiliaryModels,
  useUpsertAuxiliaryModel,
} from '@/hooks/api/useAiSettings';

const AVAILABLE_CRM_ACTIONS = [
  { value: 'lead.qualify', label: 'Lead: BANT Qualification & Scoring' },
  { value: 'lead.enrich', label: 'Lead: Company Data Enrichment' },
  { value: 'activity.log', label: 'Activity: Log Call / Meeting Note' },
  { value: 'opportunity.coach', label: 'Opportunity: Next Step Coaching' },
  { value: 'quotation.draft', label: 'Quotation: Automated Draft Generation' },
  { value: 'contract.audit', label: 'Contract: Risk Clause Audit' },
  { value: 'customer.delete', label: 'Customer: Hard Delete Account (High Risk)' },
  { value: 'contract.sign', label: 'Contract: Execute DocuSign Signing (High Risk)' },
  { value: 'payment.refund', label: 'Payment: Issue Refund (High Risk)' },
];

export default function AiConfigurationPage() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === UserRole.ADMIN;

  const aiConfig = useAiConfigStore();
  const updateAiConfigMutation = useUpdateAiConfiguration();
  const { data: dbConfigRes } = useAiConfiguration();

  // Sync DB config to zustand store if available
  useEffect(() => {
    const rawConfig = dbConfigRes?.data || dbConfigRes;
    if (rawConfig && typeof rawConfig === 'object' && Object.keys(rawConfig).length > 0) {
      aiConfig.setFullConfig(rawConfig);
    }
  }, [dbConfigRes]);

  const [activeTab, setActiveTab] = useState<'providers' | 'agents' | 'safety' | 'features' | 'logs'>('providers');

  // --- API Hooks ---
  const { data: providersRes } = useProviders();
  const { data: apiKeysRes } = useApiKeys();
  const { data: modelsRes } = useModels();
  const { data: agentsRes } = useAgents();
  const { data: auxModelsRes } = useAuxiliaryModels();

  const upsertAuxMutation = useUpsertAuxiliaryModel();

  const createProviderMutation = useCreateProvider();
  const updateProviderMutation = useUpdateProvider();
  const deleteProviderMutation = useDeleteProvider();
  const testProviderMutation = useTestProviderConnection();
  const fetchModelsMutation = useFetchModelsFromProvider();

  const createKeyMutation = useCreateApiKey();
  const updateApiKeyMutation = useUpdateApiKey();
  const deleteKeyMutation = useDeleteApiKey();

  const createAgentMutation = useCreateAgent();
  const updateAgentMutation = useUpdateAgent();
  const deleteAgentMutation = useDeleteAgent();

  const providersList = Array.isArray(providersRes) ? providersRes : (providersRes?.data || []);
  const apiKeysList = Array.isArray(apiKeysRes) ? apiKeysRes : (apiKeysRes?.data || []);
  const modelsList = Array.isArray(modelsRes) ? modelsRes : (modelsRes?.data || []);
  const agentsList = Array.isArray(agentsRes) ? agentsRes : (agentsRes?.data || []);
  const auxList = Array.isArray(auxModelsRes) ? auxModelsRes : (auxModelsRes?.data || []);

  // --- Modals State ---
  const [providerModalOpen, setProviderModalOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<any>(null);
  const [providerNameInput, setProviderNameInput] = useState('');
  const [providerTypeInput, setProviderTypeInput] = useState<'CLOUD' | 'LOCAL' | 'CUSTOM'>('CLOUD');
  const [providerBaseUrlInput, setProviderBaseUrlInput] = useState('');
  const [providerCompatibleInput, setProviderCompatibleInput] = useState(true);
  const [providerIconSlugInput, setProviderIconSlugInput] = useState('');

  const [keyModalOpen, setKeyModalOpen] = useState(false);
  const [keyProviderIdInput, setKeyProviderIdInput] = useState('');
  const [keyLabelInput, setKeyLabelInput] = useState('');
  const [keyValInput, setKeyValInput] = useState('');

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

  // Selected agent for Sidebar Editor in Canvas tab
  const [selectedAgentNode, setSelectedAgentNode] = useState<any>(null);
  const [providerStatuses, setProviderStatuses] = useState<Record<string, 'testing' | 'success' | 'failed'>>({});
  const [scanningProviderId, setScanningProviderId] = useState<string | null>(null);

  // New action input state for Allowlist tag-input
  const [newActionInput, setNewActionInput] = useState('');

  // Execution logs state
  const [logsPage, setLogsPage] = useState(1);
  const { data: logsRes, isLoading: isLogsLoading } = useExecutionLogs(logsPage, 15);

  // If non-admin user tries to access
  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center p-8 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl">
        <Lock size={48} className="text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-[var(--color-fg)]">Access Restricted</h2>
        <p className="text-sm text-[var(--color-muted-fg)] mt-1 max-w-md">
          Only System Administrators are allowed to configure AI Hub settings and Hermes Agent governance rules.
        </p>
      </div>
    );
  }

  // --- Handlers: Providers ---
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
    setProviderNameInput(p.name);
    setProviderTypeInput(p.type);
    setProviderBaseUrlInput(p.baseUrl);
    setProviderCompatibleInput(p.isOpenAiCompatible);
    setProviderIconSlugInput(p.iconSlug || '');
    setProviderModalOpen(true);
  };

  const handleSaveProvider = async () => {
    if (!providerNameInput || !providerBaseUrlInput) {
      message.error('Provider Name and Base API URL are required.');
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
    } catch (e) {}
  };

  const handleTestProvider = async (id: string) => {
    setProviderStatuses((prev) => ({ ...prev, [id]: 'testing' }));
    try {
      const res = await testProviderMutation.mutateAsync(id);
      if (res.success) {
        setProviderStatuses((prev) => ({ ...prev, [id]: 'success' }));
        message.success(`Provider connected: ${res.message}`);
      } else {
        setProviderStatuses((prev) => ({ ...prev, [id]: 'failed' }));
        message.error(`Connection failed: ${res.message}`);
      }
    } catch (e) {
      setProviderStatuses((prev) => ({ ...prev, [id]: 'failed' }));
    }
  };

  const handleScanModels = async (id: string) => {
    setScanningProviderId(id);
    try {
      await fetchModelsMutation.mutateAsync(id);
    } catch (e) {
    } finally {
      setScanningProviderId(null);
    }
  };

  const handleDeleteProvider = async (id: string) => {
    Modal.confirm({
      title: 'Delete Provider?',
      content: 'This will remove the LLM provider and associated model definitions.',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        await deleteProviderMutation.mutateAsync(id);
      },
    });
  };

  // --- Handlers: API Keys ---
  const handleOpenCreateKey = () => {
    setKeyProviderIdInput(providersList[0]?.id || '');
    setKeyLabelInput('');
    setKeyValInput('');
    setKeyModalOpen(true);
  };

  const handleSaveKey = async () => {
    if (!keyProviderIdInput || !keyLabelInput || !keyValInput) {
      message.error('Please complete all API key fields.');
      return;
    }
    try {
      await createKeyMutation.mutateAsync({
        providerId: keyProviderIdInput,
        label: keyLabelInput,
        key: keyValInput,
      });
      setKeyModalOpen(false);
    } catch (e) {}
  };

  const handleDeleteKey = async (id: string) => {
    Modal.confirm({
      title: 'Delete API Key?',
      content: 'Agents utilizing this key override will fall back to default provider settings.',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        await deleteKeyMutation.mutateAsync(id);
      },
    });
  };

  // --- Handlers: Agent Canvas ---
  const handleOpenCreateAgent = (parentId?: string) => {
    setEditingAgent(null);
    setAgentNameInput('');
    setAgentSlugInput('');
    setAgentRoleInput('QUALIFIER');
    setAgentDescInput('');
    setAgentPromptInput('');
    setAgentModelIdInput(modelsList[0]?.id || '');
    setAgentParentIdInput(parentId || '');
    setAgentApiKeyIdInput('');
    setAgentAutonomyInput('SEMI');
    setAgentMaxTokensInput(2048);
    setAgentTempInput(0.3);
    setAgentRepModeInput('REALTIME');
    setAgentRepTargetInput('');
    setAgentModalOpen(true);
  };

  const handleSaveAgent = async () => {
    if (!agentNameInput || !agentSlugInput || !agentModelIdInput || !agentPromptInput) {
      message.error('Name, Slug, Model, and System Prompt are required.');
      return;
    }
    const payload: any = {
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
      } else {
        await createAgentMutation.mutateAsync(payload);
      }
      setAgentModalOpen(false);
    } catch (e) {}
  };

  const handleDeleteAgent = async (id: string) => {
    Modal.confirm({
      title: 'Delete AI Agent?',
      content: 'This will remove the agent node. Sub-agents will be re-assigned to root level.',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        await deleteAgentMutation.mutateAsync(id);
        if (selectedAgentNode?.id === id) setSelectedAgentNode(null);
      },
    });
  };

  // Save full governance config to DB & Trigger Realtime Sync
  const saveGovernanceConfig = async (updatedFields: Record<string, any>) => {
    aiConfig.updateAiConfig(updatedFields);
    try {
      await updateAiConfigMutation.mutateAsync({
        ...aiConfig,
        ...updatedFields,
      });
    } catch (e) {}
  };

  const handleAddAllowlistAction = (val: string) => {
    if (!val) return;
    if (aiConfig.actionAllowlist.includes(val)) {
      message.warning('Action already in allowlist');
      return;
    }
    saveGovernanceConfig({
      actionAllowlist: [...aiConfig.actionAllowlist, val],
    });
    setNewActionInput('');
  };

  const handleRemoveAllowlistAction = (action: string) => {
    saveGovernanceConfig({
      actionAllowlist: aiConfig.actionAllowlist.filter((a) => a !== action),
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-fg)] flex items-center gap-2.5">
            <Radio size={26} className="text-[var(--color-accent)]" />
            <span>AI Hub — Configuration</span>
          </h1>
          <p className="text-xs text-[var(--color-muted-fg)] mt-1">
            Configure LLM Providers, encrypted API keys, design visual Agent network tree, and enforce Hermes safety controls.
          </p>
        </div>

        <Badge status="processing" text="Realtime Sync Active" className="bg-emerald-500/10 text-emerald-500 px-3 py-1.5 rounded-full text-xs font-semibold border border-emerald-500/30" />
      </div>

      {/* Main Sub Tabs Bar */}
      <div className="flex border-b border-[var(--color-border)] gap-6 pb-px">
        {[
          { id: 'providers', name: 'Providers & Models', icon: Server },
          { id: 'agents', name: 'Agent Canvas', icon: Network },
          { id: 'safety', name: 'Safety & Approval', icon: ShieldCheck },
          { id: 'features', name: 'Features & Limits', icon: Sliders },
          { id: 'logs', name: 'Execution Logs', icon: Terminal },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 pb-3.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                isActive
                  ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
                  : 'border-transparent text-[var(--color-muted-fg)] hover:text-[var(--color-fg)]'
              }`}
            >
              <Icon size={15} />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Main Tab Content Body */}
      <div className="bg-[var(--color-bg-tint)] border border-[var(--color-border)] rounded-2xl p-6 min-h-[550px]">
        
        {/* TAB 1: PROVIDERS & KEYS */}
        {activeTab === 'providers' && (
          <div className="space-y-8">
            {/* Providers List */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-muted-fg)]">LLM Infrastructure Providers</h4>
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
                    <div key={p.id} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 flex flex-col justify-between space-y-4 hover:border-[var(--color-accent)]/50 transition-all shadow-sm">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <Cpu size={18} className="text-[var(--color-accent)]" />
                            <span className="font-bold text-xs text-[var(--color-fg)]">{p.name}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                            p.type === 'CLOUD' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/30' :
                            p.type === 'LOCAL' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30' : 'bg-purple-500/10 text-purple-500 border border-purple-500/30'
                          }`}>
                            {p.type}
                          </span>
                        </div>
                        <p className="text-[10px] text-[var(--color-muted-fg)] font-mono truncate">{p.baseUrl}</p>
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

            {/* API Keys Encrypted Storage Table */}
            <div className="space-y-4 border-t border-[var(--color-border)]/60 pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-muted-fg)]">Encrypted API Keys Vault</h4>
                  <p className="text-[10px] text-[var(--color-muted-fg)] mt-0.5">API keys are stored encrypted using AES-256 and decrypted only during inference time.</p>
                </div>
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
                    render: (_, record: any) => <span className="text-xs text-[var(--color-muted-fg)] font-medium">{record.provider?.name || '—'}</span>
                  },
                  { title: 'Masked API Key', dataIndex: 'maskedKey', key: 'maskedKey', render: (val) => <span className="font-mono text-xs text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md">{val}</span> },
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

            {/* Auxiliary Task Model Assignments (Cost Optimization & Task Specialization) */}
            <div className="space-y-4 border-t border-[var(--color-border)]/60 pt-6">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-muted-fg)] flex items-center gap-2">
                  <Cpu size={14} className="text-[var(--color-accent)]" />
                  <span>Auxiliary Task Model Assignments (Cost Optimization)</span>
                </h4>
                <p className="text-[10px] text-[var(--color-muted-fg)] mt-0.5">
                  Assign specialized lightweight models (e.g. Gemini Flash, DeepSeek V3) to handle background subtasks (Vision OCR, Web Summaries, Compression) to cut LLM expenses by up to 90%.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { type: 'vision', name: 'Vision & Image Analysis', icon: ImageIcon, desc: 'Used for PDF/Image OCR and document audit' },
                  { type: 'web_extract', name: 'Web Scraping & Extract', icon: Globe, desc: 'Used for web crawling and lead enrichment' },
                  { type: 'compression', name: 'Context Compressor Engine', icon: Zap, desc: 'Used for background history compaction' },
                  { type: 'title_generation', name: 'Session Title Generator', icon: FileText, desc: 'Generates session titles after first turn' },
                  { type: 'session_search', name: 'Session History Search', icon: Search, desc: 'Summarizes matching past user sessions' },
                ].map((task) => {
                  const Icon = task.icon;
                  const existingAux = auxList.find((a: any) => a.taskType === task.type) || {};
                  
                  return (
                    <div key={task.type} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 space-y-3 shadow-sm hover:border-[var(--color-accent)]/40 transition-all">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg">
                            <Icon size={16} />
                          </div>
                          <div>
                            <h5 className="font-bold text-xs text-[var(--color-fg)]">{task.name}</h5>
                            <p className="text-[9px] text-[var(--color-muted-fg)]">{task.desc}</p>
                          </div>
                        </div>
                        <Switch
                          size="small"
                          checked={existingAux.isEnabled ?? true}
                          onChange={(val) => {
                            upsertAuxMutation.mutate({
                              taskType: task.type,
                              data: { isEnabled: val }
                            });
                          }}
                        />
                      </div>

                      <div className="space-y-2 pt-2 border-t border-[var(--color-border)]/40">
                        <div className="flex flex-col gap-1">
                          <label className="text-[8px] font-bold text-[var(--color-muted-fg)] uppercase">Assigned Model</label>
                          <Select
                            size="small"
                            value={existingAux.modelId || ''}
                            onChange={(val) => {
                              upsertAuxMutation.mutate({
                                taskType: task.type,
                                data: { modelId: val || null }
                              });
                            }}
                            options={[
                              { value: '', label: '⚡ Auto (Provider Default / Gemini Flash)' },
                              ...modelsList.map((m) => ({ value: m.id, label: `${m.provider?.name} — ${m.modelName}` }))
                            ]}
                            className="w-full text-xs"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col gap-1">
                            <label className="text-[8px] font-bold text-[var(--color-muted-fg)] uppercase">Timeout (sec)</label>
                            <InputNumber
                              size="small"
                              value={existingAux.timeoutSeconds || 30}
                              onChange={(val) => {
                                upsertAuxMutation.mutate({
                                  taskType: task.type,
                                  data: { timeoutSeconds: val || 30 }
                                });
                              }}
                              min={5}
                              max={300}
                              className="w-full text-xs"
                            />
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="text-[8px] font-bold text-[var(--color-muted-fg)] uppercase">Reasoning</label>
                            <Select
                              size="small"
                              value={existingAux.reasoningEffort || 'none'}
                              onChange={(val) => {
                                upsertAuxMutation.mutate({
                                  taskType: task.type,
                                  data: { reasoningEffort: val }
                                });
                              }}
                              options={[
                                { value: 'none', label: 'None (Fast)' },
                                { value: 'low', label: 'Low' },
                                { value: 'medium', label: 'Medium' },
                                { value: 'high', label: 'High' },
                              ]}
                              className="w-full text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: AGENT CANVAS (n8n-style) */}
        {activeTab === 'agents' && (
          <div className="grid grid-cols-1 xl:grid-cols-10 gap-6">
            {/* Left Side: ReactFlow Canvas */}
            <div className="xl:col-span-7 flex flex-col space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-muted-fg)] flex items-center gap-2">
                  <Network size={14} className="text-[var(--color-accent)]" />
                  <span>Agent Hierarchy Network Tree</span>
                </h4>
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

              {/* ReactFlow Visual Container */}
              <div className="h-[550px] border border-[var(--color-border)] rounded-2xl bg-[var(--color-surface)]/40 overflow-hidden relative shadow-inner">
                {agentsList.length === 0 ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                    <Network size={36} className="text-[var(--color-muted-fg)] mb-2" />
                    <p className="text-xs text-[var(--color-muted-fg)] font-semibold">No AI Agents registered in hierarchy</p>
                    <Button
                      size="small"
                      type="primary"
                      onClick={() => handleOpenCreateAgent()}
                      className="mt-3 text-xs rounded-lg cursor-pointer"
                    >
                      Create First Root Agent
                    </Button>
                  </div>
                ) : (() => {
                  const buildGraphData = (agents: any[]) => {
                    const nodes: any[] = [];
                    const edges: any[] = [];
                    const rootAgents = agents.filter((a) => !a.parentAgentId);
                    
                    rootAgents.forEach((root, rootIdx) => {
                      const rootX = rootIdx * 300 + 100;
                      const rootY = 50;
                      const rootNodeId = root.id;

                      nodes.push({
                        id: rootNodeId,
                        position: { x: rootX, y: rootY },
                        style: {
                          background: 'var(--color-surface)',
                          border: root.id === selectedAgentNode?.id ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
                          borderRadius: '14px',
                          padding: '12px',
                          width: '200px',
                          boxShadow: root.id === selectedAgentNode?.id ? '0 10px 20px -3px rgba(99, 102, 241, 0.25)' : '0 4px 6px -1px rgba(0,0,0,0.1)',
                          cursor: 'pointer'
                        },
                        data: { 
                          label: (
                            <div className="text-left space-y-1.5">
                              <div className="flex justify-between items-center text-[8px] font-extrabold uppercase tracking-wider text-[var(--color-accent)]">
                                <span>{root.role}</span>
                                <span className={`w-2 h-2 rounded-full ${root.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
                              </div>
                              <div className="font-bold text-xs text-[var(--color-fg)] truncate flex items-center gap-1.5">
                                <Bot size={14} className="text-indigo-400" />
                                <span>{root.name}</span>
                              </div>
                              <div className="flex justify-between items-center text-[9px] text-[var(--color-muted-fg)] font-mono pt-1 border-t border-[var(--color-border)]/40">
                                <span className="truncate">{root.model?.modelName || 'Default'}</span>
                                <span className={`font-bold px-1.5 py-0.2 rounded text-[8px] ${
                                  root.autonomyLevel === 'FULL' ? 'bg-emerald-500/10 text-emerald-400' :
                                  root.autonomyLevel === 'SEMI' ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'
                                }`}>{root.autonomyLevel}</span>
                              </div>
                            </div>
                          )
                        },
                      });

                      const subs = agents.filter((a) => a.parentAgentId === root.id);
                      subs.forEach((sub, subIdx) => {
                        const subX = rootX + (subIdx - (subs.length - 1) / 2) * 220;
                        const subY = rootY + 170;
                        const subNodeId = sub.id;

                        nodes.push({
                          id: subNodeId,
                          position: { x: subX, y: subY },
                          style: {
                            background: 'var(--color-surface)',
                            border: sub.id === selectedAgentNode?.id ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
                            borderRadius: '14px',
                            padding: '12px',
                            width: '200px',
                            boxShadow: sub.id === selectedAgentNode?.id ? '0 10px 20px -3px rgba(99, 102, 241, 0.25)' : '0 4px 6px -1px rgba(0,0,0,0.1)',
                            cursor: 'pointer'
                          },
                          data: {
                            label: (
                              <div className="text-left space-y-1.5">
                                <div className="flex justify-between items-center text-[8px] font-extrabold uppercase tracking-wider text-indigo-400">
                                  <span>{sub.role}</span>
                                  <span className={`w-2 h-2 rounded-full ${sub.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
                                </div>
                                <div className="font-bold text-xs text-[var(--color-fg)] truncate flex items-center gap-1.5">
                                  <Bot size={14} className="text-purple-400" />
                                  <span>{sub.name}</span>
                                </div>
                                <div className="flex justify-between items-center text-[9px] text-[var(--color-muted-fg)] font-mono pt-1 border-t border-[var(--color-border)]/40">
                                  <span className="truncate">{sub.model?.modelName || 'Inherit'}</span>
                                  <span className={`font-bold px-1.5 py-0.2 rounded text-[8px] ${
                                    sub.autonomyLevel === 'FULL' ? 'bg-emerald-500/10 text-emerald-400' :
                                    sub.autonomyLevel === 'SEMI' ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'
                                  }`}>{sub.autonomyLevel}</span>
                                </div>
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

                        const grandSubs = agents.filter((a) => a.parentAgentId === sub.id);
                        grandSubs.forEach((grand, grandIdx) => {
                          const grandX = subX + (grandIdx - (grandSubs.length - 1) / 2) * 200;
                          const grandY = subY + 170;
                          const grandNodeId = grand.id;

                          nodes.push({
                            id: grandNodeId,
                            position: { x: grandX, y: grandY },
                            style: {
                              background: 'var(--color-surface)',
                              border: grand.id === selectedAgentNode?.id ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
                              borderRadius: '14px',
                              padding: '12px',
                              width: '200px',
                              boxShadow: grand.id === selectedAgentNode?.id ? '0 10px 20px -3px rgba(99, 102, 241, 0.25)' : '0 4px 6px -1px rgba(0,0,0,0.1)',
                              cursor: 'pointer'
                            },
                            data: {
                              label: (
                                <div className="text-left space-y-1.5">
                                  <div className="flex justify-between items-center text-[8px] font-extrabold uppercase tracking-wider text-purple-400">
                                    <span>{grand.role}</span>
                                    <span className={`w-2 h-2 rounded-full ${grand.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
                                  </div>
                                  <div className="font-bold text-xs text-[var(--color-fg)] truncate flex items-center gap-1.5">
                                    <Bot size={14} className="text-emerald-400" />
                                    <span>{grand.name}</span>
                                  </div>
                                  <div className="flex justify-between items-center text-[9px] text-[var(--color-muted-fg)] font-mono pt-1 border-t border-[var(--color-border)]/40">
                                    <span className="truncate">{grand.model?.modelName || 'Inherit'}</span>
                                    <span className={`font-bold px-1.5 py-0.2 rounded text-[8px] ${
                                      grand.autonomyLevel === 'FULL' ? 'bg-emerald-500/10 text-emerald-400' :
                                      grand.autonomyLevel === 'SEMI' ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'
                                    }`}>{grand.autonomyLevel}</span>
                                  </div>
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
                        if (agent) setSelectedAgentNode(agent);
                      }}
                    >
                      <Controls />
                      <MiniMap />
                      <Background color="var(--color-border)" gap={16} />
                    </ReactFlow>
                  );
                })()}
              </div>
            </div>

            {/* Right Side: Detailed Sidebar Editor for Selected Agent Node */}
            <div className="xl:col-span-3 bg-[var(--color-surface)]/60 border border-[var(--color-border)] rounded-2xl p-5 min-h-[550px] flex flex-col justify-between shadow-sm">
              {selectedAgentNode ? (
                <div className="space-y-4 overflow-y-auto max-h-[530px] pr-1">
                  <div>
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-xs text-[var(--color-fg)] uppercase tracking-wider">Agent Node Properties</h4>
                      <span className="text-[8px] font-extrabold px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded-full border border-indigo-500/20">{selectedAgentNode.role}</span>
                    </div>
                    <p className="text-[10px] text-[var(--color-muted-fg)] font-mono mt-0.5">ID: {selectedAgentNode.slug}</p>
                  </div>

                  <div className="space-y-3">
                    <FloatingInput label="Agent Name" value={selectedAgentNode.name} onChange={(val) => setSelectedAgentNode({ ...selectedAgentNode, name: val })} />

                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-semibold text-[var(--color-muted-fg)] uppercase">LLM Model</label>
                      <Select
                        value={selectedAgentNode.modelId}
                        onChange={(val) => setSelectedAgentNode({ ...selectedAgentNode, modelId: val })}
                        options={modelsList.map(m => ({ value: m.id, label: `${m.provider?.name} — ${m.modelName}` }))}
                        className="w-full h-9 text-xs"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-semibold text-[var(--color-muted-fg)] uppercase">API Key Override</label>
                      <Select
                        value={selectedAgentNode.apiKeyId || ''}
                        onChange={(val) => setSelectedAgentNode({ ...selectedAgentNode, apiKeyId: val || null })}
                        options={[
                          { value: '', label: 'Inherit from Parent Agent / Provider Default' },
                          ...apiKeysList.map(k => ({ value: k.id, label: `${k.provider?.name} (${k.label})` }))
                        ]}
                        className="w-full h-9 text-xs"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-semibold text-[var(--color-muted-fg)] uppercase">Autonomy Level</label>
                      <Select
                        value={selectedAgentNode.autonomyLevel}
                        onChange={(val) => setSelectedAgentNode({ ...selectedAgentNode, autonomyLevel: val })}
                        options={[
                          { value: 'FULL', label: 'FULL (Auto execute actions)' },
                          { value: 'SEMI', label: 'SEMI (Requires approval for high risk)' },
                          { value: 'MANUAL', label: 'MANUAL (Run on explicit click only)' },
                        ]}
                        className="w-full h-9 text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-semibold text-[var(--color-muted-fg)] uppercase">Max Tokens</label>
                        <InputNumber
                          value={selectedAgentNode.maxTokensPerRequest || 2048}
                          onChange={(val) => setSelectedAgentNode({ ...selectedAgentNode, maxTokensPerRequest: val || 2048 })}
                          className="w-full text-xs"
                          min={256}
                          max={32768}
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-semibold text-[var(--color-muted-fg)] uppercase">Temperature</label>
                        <InputNumber
                          value={selectedAgentNode.temperature ?? 0.3}
                          onChange={(val) => setSelectedAgentNode({ ...selectedAgentNode, temperature: val ?? 0.3 })}
                          className="w-full text-xs"
                          step={0.1}
                          min={0}
                          max={1}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-semibold text-[var(--color-muted-fg)] uppercase">Reporting Mode</label>
                      <Select
                        value={selectedAgentNode.reportingMode || 'REALTIME'}
                        onChange={(val) => setSelectedAgentNode({ ...selectedAgentNode, reportingMode: val })}
                        options={[
                          { value: 'REALTIME', label: 'REALTIME (Notify instantly)' },
                          { value: 'BATCH', label: 'BATCH (Summary report daily)' },
                          { value: 'SILENT', label: 'SILENT (Log only)' },
                        ]}
                        className="w-full h-9 text-xs"
                      />
                    </div>

                    <FloatingInput label="Reporting Target (e.g. #sales-alerts, webhook URL)" value={selectedAgentNode.reportingTarget || ''} onChange={(val) => setSelectedAgentNode({ ...selectedAgentNode, reportingTarget: val })} />

                    {/* Fallback Model Chain (High Availability) */}
                    <div className="flex flex-col gap-2 p-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl">
                      <div className="flex justify-between items-center">
                        <label className="text-[9px] font-bold text-[var(--color-muted-fg)] uppercase flex items-center gap-1.5">
                          <RotateCcw size={12} className="text-amber-400" />
                          <span>Fallback Model Chain</span>
                        </label>
                        <Button
                          size="small"
                          type="dashed"
                          icon={<Plus size={10} />}
                          onClick={() => {
                            const current = selectedAgentNode.fallbackModelIds || [];
                            if (current.length >= 5) {
                              message.warning('Max 5 fallback models allowed per agent');
                              return;
                            }
                            setSelectedAgentNode({
                              ...selectedAgentNode,
                              fallbackModelIds: [...current, modelsList[0]?.id || '']
                            });
                          }}
                          className="text-[9px] h-6 px-2 rounded-md cursor-pointer"
                        >
                          Add Fallback
                        </Button>
                      </div>
                      <p className="text-[9px] text-[var(--color-muted-fg)]">
                        Sequential backup models used if primary model errors (429 Rate Limit / 503 Outage).
                      </p>

                      {(!selectedAgentNode.fallbackModelIds || selectedAgentNode.fallbackModelIds.length === 0) ? (
                        <p className="text-[9px] text-[var(--color-muted-fg)] italic text-center py-1">No fallbacks configured (Single point of failure)</p>
                      ) : (
                        <div className="space-y-1.5 pt-1">
                          {selectedAgentNode.fallbackModelIds.map((fbId: string, idx: number) => (
                            <div key={idx} className="flex items-center gap-1.5">
                              <span className="text-[9px] font-mono text-amber-400 font-bold px-1.5 py-0.5 bg-amber-500/10 rounded">#{idx + 1}</span>
                              <Select
                                size="small"
                                value={fbId}
                                onChange={(val) => {
                                  const updated = [...(selectedAgentNode.fallbackModelIds || [])];
                                  updated[idx] = val;
                                  setSelectedAgentNode({ ...selectedAgentNode, fallbackModelIds: updated });
                                }}
                                options={modelsList.map(m => ({ value: m.id, label: `${m.provider?.name} — ${m.modelName}` }))}
                                className="flex-1 text-xs"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = (selectedAgentNode.fallbackModelIds || []).filter((_: any, i: number) => i !== idx);
                                  setSelectedAgentNode({ ...selectedAgentNode, fallbackModelIds: updated });
                                }}
                                className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-semibold text-[var(--color-muted-fg)] uppercase">System Prompt Instructions</label>
                      <textarea
                        value={selectedAgentNode.systemPrompt || ''}
                        onChange={(e) => setSelectedAgentNode({ ...selectedAgentNode, systemPrompt: e.target.value })}
                        className="w-full min-h-[110px] text-xs p-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl outline-none focus:border-[var(--color-accent)] font-mono leading-relaxed"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-[var(--color-border)]/50">
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
                      Save Node Changes
                    </Button>
                    <Button
                      size="small"
                      danger
                      onClick={() => setSelectedAgentNode(null)}
                      className="rounded-lg text-xs cursor-pointer"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-3">
                  <Bot size={32} className="text-[var(--color-muted-fg)]" />
                  <p className="text-xs text-[var(--color-muted-fg)] font-medium">
                    Click an Agent node on the diagram canvas to inspect and edit properties, prompts, temperature, or API key overrides.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: SAFETY & APPROVAL (HERMES GOVERNANCE) */}
        {activeTab === 'safety' && (
          <div className="max-w-3xl space-y-6">
            <div>
              <h3 className="text-sm font-bold text-[var(--color-fg)] flex items-center gap-2">
                <ShieldCheck size={18} className="text-[var(--color-accent)]" />
                <span>Hermes Agent Safety & Approval Controls</span>
              </h3>
              <p className="text-xs text-[var(--color-muted-fg)] mt-1">
                Strict governance settings to prevent agents from executing unauthorized actions or corrupting CRM records.
              </p>
            </div>

            {/* 1. Approval Mode Card */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 space-y-3 shadow-sm">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-bold text-[var(--color-fg)]">Agent Approval Mode</h4>
                  <p className="text-[11px] text-[var(--color-muted-fg)]">Determines whether Hermes asks human permission before invoking tools or write actions.</p>
                </div>
                <Segmented
                  value={aiConfig.approvalMode}
                  onChange={(val) => saveGovernanceConfig({ approvalMode: val as any })}
                  options={[
                    { label: 'MANUAL', value: 'MANUAL' },
                    { label: 'SMART', value: 'SMART' },
                    { label: 'OFF', value: 'OFF' },
                  ]}
                  className="font-bold text-xs"
                />
              </div>

              <div className="text-[11px] bg-[var(--color-bg)] p-3 rounded-xl border border-[var(--color-border)] font-mono text-[var(--color-muted-fg)]">
                {aiConfig.approvalMode === 'MANUAL' && '🔴 MANUAL: Agent stops and requests explicit human confirmation before EVERY action.'}
                {aiConfig.approvalMode === 'SMART' && '🟡 SMART: Agent auto-approves safe actions (reading/qualifying), but asks approval for high-risk actions.'}
                {aiConfig.approvalMode === 'OFF' && '🟢 OFF: Full autonomy. Agent executes all tools automatically without human intervention.'}
              </div>
            </div>

            {/* 2. Action Allowlist Tag Input Card */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 space-y-4 shadow-sm">
              <div>
                <h4 className="text-xs font-bold text-[var(--color-fg)]">Action Allowlist (Auto-Approve Tags)</h4>
                <p className="text-[11px] text-[var(--color-muted-fg)]">Actions listed here will bypass human approval when Approval Mode is set to SMART.</p>
              </div>

              {/* Tag Chips Container */}
              <div className="flex flex-wrap gap-2 p-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl min-h-[50px] items-center">
                {aiConfig.actionAllowlist.map((action) => (
                  <span
                    key={action}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-full text-xs font-mono font-semibold"
                  >
                    <span>{action}</span>
                    <button
                      onClick={() => handleRemoveAllowlistAction(action)}
                      className="hover:text-red-400 cursor-pointer ml-0.5"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>

              {/* Add New Action Input with Autocomplete */}
              <div className="flex gap-2">
                <AutoComplete
                  value={newActionInput}
                  onChange={setNewActionInput}
                  options={AVAILABLE_CRM_ACTIONS}
                  placeholder="Select or type action tag (e.g. lead.qualify, quotation.draft)..."
                  className="flex-1 h-9 text-xs"
                />
                <Button
                  type="primary"
                  icon={<Plus size={14} />}
                  onClick={() => handleAddAllowlistAction(newActionInput)}
                  className="rounded-xl text-xs cursor-pointer"
                >
                  Add Tag
                </Button>
              </div>
            </div>

            {/* 3. Safety Toggles Stack */}
            <div className="space-y-3">
              <div className="flex justify-between items-center p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-sm">
                <div>
                  <p className="font-bold text-xs text-[var(--color-fg)]">Redact Sensitive Data</p>
                  <p className="text-[10px] text-[var(--color-muted-fg)]">Mask PII (phone numbers, emails, personal IDs) before transmitting prompts to external LLM APIs.</p>
                </div>
                <Switch
                  checked={aiConfig.redactSensitiveData}
                  onChange={(val) => saveGovernanceConfig({ redactSensitiveData: val })}
                />
              </div>

              <div className="flex justify-between items-center p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-sm">
                <div>
                  <p className="font-bold text-xs text-[var(--color-fg)]">Data Checkpoints & Snapshot Rollback</p>
                  <p className="text-[10px] text-[var(--color-muted-fg)]">Automatically generate an atomic data checkpoint before Agent updates any CRM database record.</p>
                </div>
                <Switch
                  checked={aiConfig.dataCheckpoints}
                  onChange={(val) => saveGovernanceConfig({ dataCheckpoints: val })}
                />
              </div>

              <div className="flex justify-between items-center p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-sm">
                <div>
                  <p className="font-bold text-xs text-[var(--color-fg)]">Allow Direct Database Write</p>
                  <p className="text-[10px] text-[var(--color-muted-fg)]">When disabled, Agent operates in read-only mode and can only propose draft changes.</p>
                </div>
                <Switch
                  checked={aiConfig.allowDatabaseWrite}
                  onChange={(val) => saveGovernanceConfig({ allowDatabaseWrite: val })}
                />
              </div>
            </div>

            {/* 4. Limits & Threshold Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 space-y-2 shadow-sm">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted-fg)]">Max Steps Per Turn</label>
                <InputNumber
                  value={aiConfig.maxStepsPerTurn}
                  onChange={(val) => saveGovernanceConfig({ maxStepsPerTurn: val || 15 })}
                  className="w-full text-xs"
                  min={1}
                  max={50}
                />
                <p className="text-[9px] text-[var(--color-muted-fg)]">Limits loop steps per task.</p>
              </div>

              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 space-y-2 shadow-sm">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted-fg)]">Subagent Concurrency</label>
                <InputNumber
                  value={aiConfig.maxConcurrentSubagents}
                  onChange={(val) => saveGovernanceConfig({ maxConcurrentSubagents: val || 3 })}
                  className="w-full text-xs"
                  min={1}
                  max={10}
                />
                <p className="text-[9px] text-[var(--color-muted-fg)]">Max parallel sub-agents.</p>
              </div>

              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 space-y-2 shadow-sm">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted-fg)]">Subagent Timeout (sec)</label>
                <InputNumber
                  value={aiConfig.subagentTimeoutSec}
                  onChange={(val) => saveGovernanceConfig({ subagentTimeoutSec: val || 120 })}
                  className="w-full text-xs"
                  min={10}
                  max={600}
                />
                <p className="text-[9px] text-[var(--color-muted-fg)]">Timeout before cancelling.</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: FEATURES & LIMITS */}
        {activeTab === 'features' && (
          <div className="max-w-3xl space-y-6">
            <div>
              <h3 className="text-sm font-bold text-[var(--color-fg)] flex items-center gap-2">
                <Sliders size={18} className="text-[var(--color-accent)]" />
                <span>AI Module Toggles & Memory Engine</span>
              </h3>
              <p className="text-xs text-[var(--color-muted-fg)] mt-1">
                Enable CRM AI features and configure Hermes long-term memory & context compression limits.
              </p>
            </div>

            {/* Feature Toggles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex justify-between items-center p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-sm">
                <div>
                  <p className="font-bold text-xs text-[var(--color-fg)]">Lead BANT Syncing</p>
                  <p className="text-[10px] text-[var(--color-muted-fg)]">Auto score leads on budget and authority parameters.</p>
                </div>
                <Switch checked={aiConfig.leadBantSync} onChange={(val) => saveGovernanceConfig({ leadBantSync: val })} />
              </div>

              <div className="flex justify-between items-center p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-sm">
                <div>
                  <p className="font-bold text-xs text-[var(--color-fg)]">Opportunity Coach</p>
                  <p className="text-[10px] text-[var(--color-muted-fg)]">Suggests next actions on active pipeline steps.</p>
                </div>
                <Switch checked={aiConfig.oppCoach} onChange={(val) => saveGovernanceConfig({ oppCoach: val })} />
              </div>

              <div className="flex justify-between items-center p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-sm">
                <div>
                  <p className="font-bold text-xs text-[var(--color-fg)]">Quotation Follow-up</p>
                  <p className="text-[10px] text-[var(--color-muted-fg)]">Propose email drafts based on customer timeline rules.</p>
                </div>
                <Switch checked={aiConfig.quoFollowUp} onChange={(val) => saveGovernanceConfig({ quoFollowUp: val })} />
              </div>

              <div className="flex justify-between items-center p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-sm">
                <div>
                  <p className="font-bold text-xs text-[var(--color-fg)]">Contract Risk Audit</p>
                  <p className="text-[10px] text-[var(--color-muted-fg)]">Identify unfavorable clauses inside uploaded documents.</p>
                </div>
                <Switch checked={aiConfig.contractRisk} onChange={(val) => saveGovernanceConfig({ contractRisk: val })} />
              </div>

              <div className="flex justify-between items-center p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-sm">
                <div>
                  <p className="font-bold text-xs text-[var(--color-fg)]">Churn Risk Prediction</p>
                  <p className="text-[10px] text-[var(--color-muted-fg)]">Run daily cron job to detect high-churn risk accounts.</p>
                </div>
                <Switch checked={aiConfig.churnPredictionEnabled} onChange={(val) => saveGovernanceConfig({ churnPredictionEnabled: val })} />
              </div>

              <div className="flex justify-between items-center p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-sm">
                <div>
                  <p className="font-bold text-xs text-[var(--color-fg)]">Stalled Deal Alert</p>
                  <p className="text-[10px] text-[var(--color-muted-fg)]">Alert account managers when deals stagnate.</p>
                </div>
                <Switch checked={aiConfig.stalledDealDetection} onChange={(val) => saveGovernanceConfig({ stalledDealDetection: val })} />
              </div>
            </div>

            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 space-y-3 shadow-sm">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-muted-fg)]">
                Data Sensitivity Threshold
              </label>
              <Select
                value={aiConfig.sensitivityThreshold}
                onChange={(val) => saveGovernanceConfig({ sensitivityThreshold: val as any })}
                options={[
                  { value: 'HIGH', label: 'Strict GDPR / NDAs alignment (High masking)' },
                  { value: 'MEDIUM', label: 'Balanced (Recommended)' },
                  { value: 'LOW', label: 'Permissive analysis' },
                ]}
                className="w-full h-10 text-xs"
              />
            </div>

            {/* Persistent Memory Engine */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 space-y-4 shadow-sm">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-fg)] flex items-center gap-2">
                  <Brain size={16} className="text-indigo-400" />
                  <span>Persistent Memory Engine (Long-term Context)</span>
                </h4>
                <p className="text-[11px] text-[var(--color-muted-fg)] mt-0.5">
                  Maintains curated facts, customer preferences, and past interaction summaries across sessions.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex justify-between items-center p-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl">
                  <div>
                    <p className="font-bold text-xs text-[var(--color-fg)]">Agent Personal Memory</p>
                    <p className="text-[9px] text-[var(--color-muted-fg)]">Store environment facts & conventions</p>
                  </div>
                  <Switch checked={aiConfig.memoryEnabled} onChange={(val) => saveGovernanceConfig({ memoryEnabled: val })} />
                </div>

                <div className="flex justify-between items-center p-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl">
                  <div>
                    <p className="font-bold text-xs text-[var(--color-fg)]">User Profile Memory</p>
                    <p className="text-[9px] text-[var(--color-muted-fg)]">Store user preferences & expectations</p>
                  </div>
                  <Switch checked={aiConfig.userProfileEnabled} onChange={(val) => saveGovernanceConfig({ userProfileEnabled: val })} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-semibold text-[var(--color-muted-fg)] uppercase">Memory Notes Cap (chars)</label>
                  <InputNumber
                    value={aiConfig.memoryCharLimit}
                    onChange={(val) => saveGovernanceConfig({ memoryCharLimit: val || 2200 })}
                    className="w-full text-xs"
                    min={500}
                    max={10000}
                  />
                  <span className="text-[8px] text-[var(--color-muted-fg)]">~800 tokens budget</span>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-semibold text-[var(--color-muted-fg)] uppercase">User Profile Cap (chars)</label>
                  <InputNumber
                    value={aiConfig.userCharLimit}
                    onChange={(val) => saveGovernanceConfig({ userCharLimit: val || 1375 })}
                    className="w-full text-xs"
                    min={500}
                    max={5000}
                  />
                  <span className="text-[8px] text-[var(--color-muted-fg)]">~500 tokens budget</span>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-semibold text-[var(--color-muted-fg)] uppercase">Memory Nudge (turns)</label>
                  <InputNumber
                    value={aiConfig.memoryNudgeInterval}
                    onChange={(val) => saveGovernanceConfig({ memoryNudgeInterval: val ?? 10 })}
                    className="w-full text-xs"
                    min={0}
                    max={50}
                  />
                  <span className="text-[8px] text-[var(--color-muted-fg)]">Remind agent to save notes</span>
                </div>
              </div>
            </div>

            {/* Auto-Context Compression Engine */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 space-y-4 shadow-sm">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-fg)] flex items-center gap-2">
                  <Zap size={16} className="text-amber-400" />
                  <span>Auto-Context Compression Engine</span>
                </h4>
                <p className="text-[11px] text-[var(--color-muted-fg)] mt-0.5">
                  Automatically summarizes long conversations to keep prompt tokens well within LLM context limits.
                </p>
              </div>

              <div className="flex justify-between items-center p-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl">
                <div>
                  <p className="font-bold text-xs text-[var(--color-fg)]">Enable Auto Compression</p>
                  <p className="text-[9px] text-[var(--color-muted-fg)]">Automatically compact turns when context window reaches threshold</p>
                </div>
                <Switch checked={aiConfig.autoCompression} onChange={(val) => saveGovernanceConfig({ autoCompression: val })} />
              </div>

              <div className="space-y-4 pt-1">
                <div>
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-[var(--color-fg)]">Compression Trigger Threshold</span>
                    <span className="font-mono text-amber-400 font-bold">{Math.round((aiConfig.compressionThreshold || 0.50) * 100)}% of context limit</span>
                  </div>
                  <Slider
                    value={(aiConfig.compressionThreshold || 0.50) * 100}
                    onChange={(val) => saveGovernanceConfig({ compressionThreshold: val / 100 })}
                    min={20}
                    max={90}
                    step={5}
                  />
                  <p className="text-[9px] text-[var(--color-muted-fg)]">Lower = compress early; Higher = wait until context is fuller.</p>
                </div>

                <div>
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-[var(--color-fg)]">Post-Compression Recent Tail Preserved</span>
                    <span className="font-mono text-emerald-400 font-bold">{Math.round((aiConfig.compressionTargetRatio || 0.20) * 100)}% of threshold</span>
                  </div>
                  <Slider
                    value={(aiConfig.compressionTargetRatio || 0.20) * 100}
                    onChange={(val) => saveGovernanceConfig({ compressionTargetRatio: val / 100 })}
                    min={10}
                    max={80}
                    step={5}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-semibold text-[var(--color-muted-fg)] uppercase">Protected Recent Messages</label>
                    <InputNumber
                      value={aiConfig.compressionProtectLastN}
                      onChange={(val) => saveGovernanceConfig({ compressionProtectLastN: val || 20 })}
                      className="w-full text-xs"
                      min={5}
                      max={50}
                    />
                    <span className="text-[8px] text-[var(--color-muted-fg)]">Most recent messages always kept verbatim</span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-semibold text-[var(--color-muted-fg)] uppercase">Max Retry Attempts</label>
                    <InputNumber
                      value={aiConfig.compressionMaxAttempts}
                      onChange={(val) => saveGovernanceConfig({ compressionMaxAttempts: val || 3 })}
                      className="w-full text-xs"
                      min={1}
                      max={10}
                    />
                    <span className="text-[8px] text-[var(--color-muted-fg)]">Max compression attempts before giving up</span>
                  </div>
                </div>

                <div className="p-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl font-mono text-[10px] text-[var(--color-muted-fg)] space-y-1">
                  <p className="font-bold text-indigo-400">💡 Active Compression Strategy Preview:</p>
                  <p>• Triggers when context reaches <span className="text-amber-400 font-bold">{Math.round((aiConfig.compressionThreshold || 0.50) * 100)}%</span> of total LLM context window.</p>
                  <p>• Summarizes middle messages while preserving the last <span className="text-emerald-400 font-bold">{aiConfig.compressionProtectLastN || 20}</span> recent messages.</p>
                  <p>• Yields a post-compression tail of <span className="text-indigo-400 font-bold">{Math.round((aiConfig.compressionTargetRatio || 0.20) * (aiConfig.compressionThreshold || 0.50) * 100)}%</span> of total context window.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: EXECUTION LOGS */}
        {activeTab === 'logs' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-muted-fg)] flex items-center gap-2">
                  <Terminal size={15} className="text-[var(--color-accent)]" />
                  <span>Agent Execution & Audit Trails</span>
                </h4>
                <p className="text-[10px] text-[var(--color-muted-fg)] mt-0.5">Real-time log stream of agent tool executions, steps, and latency metrics.</p>
              </div>

              <Badge status="processing" text="SSE Live Stream Connected" className="bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full text-xs font-mono font-semibold border border-indigo-500/30" />
            </div>

            {isLogsLoading ? (
              <div className="py-16 flex justify-center"><Spin /></div>
            ) : (
              <SharedTable
                dataSource={Array.isArray(logsRes?.data) ? logsRes.data : (logsRes?.data?.data || [])}
                columns={[
                  { title: 'Timestamp', dataIndex: 'createdAt', key: 'createdAt', render: (val) => <span className="font-mono text-[11px] text-[var(--color-muted-fg)]">{new Date(val).toLocaleTimeString()}</span> },
                  { title: 'Agent Node', dataIndex: 'agent' as any, key: 'agent', render: (_, record: any) => <span className="font-bold text-xs text-[var(--color-fg)]">{record.agent?.name || 'Root Agent'}</span> },
                  { title: 'Action Tool', dataIndex: 'actionName', key: 'actionName', render: (val) => <span className="font-mono text-xs text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">{val || 'query'}</span> },
                  {
                    title: 'Status',
                    dataIndex: 'status',
                    key: 'status',
                    render: (val) => (
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                        val === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30' :
                        val === 'RUNNING' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/30' : 'bg-red-500/10 text-red-500 border border-red-500/30'
                      }`}>
                        {val}
                      </span>
                    )
                  },
                  { title: 'Tokens Used', dataIndex: 'tokensUsed', key: 'tokensUsed', render: (val) => <span className="font-mono text-xs text-[var(--color-muted-fg)]">{val || 0}</span> },
                  { title: 'Latency (ms)', dataIndex: 'executionTimeMs', key: 'executionTimeMs', render: (val) => <span className="font-mono text-xs text-[var(--color-muted-fg)]">{val ? `${val}ms` : '—'}</span> },
                ]}
              />
            )}
          </div>
        )}

      </div>

      {/* --- MODALS --- */}
      {/* Provider Modal */}
      <Modal
        title={editingProvider ? 'Edit Provider' : 'Add New Provider'}
        open={providerModalOpen}
        onOk={handleSaveProvider}
        onCancel={() => setProviderModalOpen(false)}
        okText="Save Provider"
        cancelText="Cancel"
        className="rounded-2xl"
      >
        <div className="space-y-4 pt-3">
          <FloatingInput label="Provider Name (e.g., Groq, Ollama, OpenAI)" value={providerNameInput} onChange={setProviderNameInput} />
          
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-semibold text-[var(--color-muted-fg)] uppercase">Provider Type</label>
            <Select
              value={providerTypeInput}
              onChange={setProviderTypeInput}
              options={[
                { value: 'CLOUD', label: 'CLOUD (Groq, OpenAI, Gemini,...)' },
                { value: 'LOCAL', label: 'LOCAL (Ollama, LM Studio,...)' },
                { value: 'CUSTOM', label: 'CUSTOM (Private Endpoint)' },
              ]}
              className="w-full h-10"
            />
          </div>

          <FloatingInput label="Base API URL (e.g., https://api.openai.com/v1)" value={providerBaseUrlInput} onChange={setProviderBaseUrlInput} />

          <div className="flex items-center justify-between p-3 border border-[var(--color-border)] rounded-xl bg-[var(--color-surface)]">
            <div>
              <p className="font-bold text-xs text-[var(--color-fg)]">OpenAI Compatible Format</p>
              <p className="text-[9px] text-[var(--color-muted-fg)]">Uses OpenAI standard payload structure</p>
            </div>
            <Switch checked={providerCompatibleInput} onChange={setProviderCompatibleInput} />
          </div>

          <FloatingInput label="Icon Slug (e.g., openai, groq)" value={providerIconSlugInput} onChange={setProviderIconSlugInput} />
        </div>
      </Modal>

      {/* API Key Modal */}
      <Modal
        title="Add Encrypted API Key"
        open={keyModalOpen}
        onOk={handleSaveKey}
        onCancel={() => setKeyModalOpen(false)}
        okText="Save Encrypted Key"
        cancelText="Cancel"
        className="rounded-2xl"
      >
        <div className="space-y-4 pt-3">
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-semibold text-[var(--color-muted-fg)] uppercase">Provider</label>
            <Select
              value={keyProviderIdInput}
              onChange={setKeyProviderIdInput}
              options={providersList.map(p => ({ value: p.id, label: `${p.name} (${p.type})` }))}
              placeholder="Select Provider for key"
              className="w-full h-10"
            />
          </div>

          <FloatingInput label="Key Label (e.g., Production Secret)" value={keyLabelInput} onChange={setKeyLabelInput} />
          <FloatingInput label="API Key Secret (AES-256 Encrypted)" type="password" value={keyValInput} onChange={setKeyValInput} />
        </div>
      </Modal>

      {/* Agent Modal */}
      <Modal
        title={editingAgent ? 'Edit Agent Node' : 'Create New AI Agent Node'}
        open={agentModalOpen}
        onOk={handleSaveAgent}
        onCancel={() => setAgentModalOpen(false)}
        okText="Save Agent"
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
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-semibold text-[var(--color-muted-fg)] uppercase">LLM Model</label>
              <Select
                value={agentModelIdInput}
                onChange={setAgentModelIdInput}
                options={modelsList.map(m => ({ value: m.id, label: `${m.provider?.name} — ${m.modelName}` }))}
                placeholder="Select Model"
                className="w-full h-10"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-semibold text-[var(--color-muted-fg)] uppercase">Role</label>
              <Select
                value={agentRoleInput}
                onChange={setAgentRoleInput}
                options={[
                  { value: 'QUALIFIER', label: 'QUALIFIER (Evaluate Lead)' },
                  { value: 'COACH', label: 'COACH (Sales Coaching)' },
                  { value: 'RISK_AUDITOR', label: 'RISK_AUDITOR (Contract Audit)' },
                  { value: 'EMAIL_DRAFTER', label: 'EMAIL_DRAFTER (Email Drafting)' },
                  { value: 'CUSTOM', label: 'CUSTOM (Other Role)' },
                ]}
                className="w-full h-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-semibold text-[var(--color-muted-fg)] uppercase">Parent Agent Node</label>
              <Select
                value={agentParentIdInput}
                onChange={setAgentParentIdInput}
                options={[
                  { value: '', label: 'None (Root Agent)' },
                  ...agentsList.map(a => ({ value: a.id, label: a.name }))
                ]}
                className="w-full h-10"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-semibold text-[var(--color-muted-fg)] uppercase">API Key Override</label>
              <Select
                value={agentApiKeyIdInput}
                onChange={setAgentApiKeyIdInput}
                options={[
                  { value: '', label: 'Inherit from Parent / Default' },
                  ...apiKeysList.map(k => ({ value: k.id, label: `${k.provider?.name} (${k.label})` }))
                ]}
                className="w-full h-10"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-semibold text-[var(--color-muted-fg)] uppercase">System Prompt Instructions</label>
            <textarea
              value={agentPromptInput}
              onChange={(e) => setAgentPromptInput(e.target.value)}
              placeholder="You are an expert sales qualifier using BANT criteria..."
              className="w-full min-h-[120px] text-xs p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl outline-none focus:border-[var(--color-accent)] font-mono"
            />
          </div>

          <FloatingInput label="Agent Summary Description" value={agentDescInput} onChange={setAgentDescInput} />
        </div>
      </Modal>

    </div>
  );
}
