'use client';

import React, { useState, useEffect } from 'react';
import { Button, Switch, message, Badge, Spin, Tag, Popconfirm, Select } from 'antd';
import { FloatingInput } from '@/components/FloatingInput';
import {
  Settings,
  Network,
  Power,
  Bot,
  Users,
  Zap,
  Plus,
  RefreshCw,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Trash2,
  UserCheck,
  Users2,
  Tag as TagIcon,
  MessageCircle,
} from 'lucide-react';
import SharedTable from '@/components/SharedTable';
import {
  useMessagingResource,
  useSystemSettings,
  useTestChatwootConnection,
} from '@/hooks/api/useMessagingConfig';
import HermesAgentQuickConfig from './components/HermesAgentQuickConfig';
import ResourceModal from './components/ResourceModal';
import TunnelWebhookCard from './components/TunnelWebhookCard';
import InboxConfigTable from './components/InboxConfigTable';
import InboxFormModal from './components/InboxFormModal';
import DiagnosticsPanel from './components/DiagnosticsPanel';

export default function MessagingConfigurationPage() {
  // Main Tab State (5 Tabs)
  const [activeTab, setActiveTab] = useState<'channels' | 'system' | 'hermes-ai' | 'operations' | 'automation-webhooks'>('channels');

  // Operations Sub-Tab State
  const [operationsSubTab, setOperationsSubTab] = useState<'agents' | 'teams' | 'labels' | 'canned-responses'>('agents');

  // Modal States
  const [isInboxModalOpen, setIsInboxModalOpen] = useState(false);
  const [channelToEdit, setChannelToEdit] = useState<any | null>(null);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);
  const [modalResourceType, setModalResourceType] = useState<'agents' | 'agent-bots' | 'teams' | 'labels' | 'canned-responses' | 'webhooks' | null>(null);

  // System Settings Hook
  const { settings, isLoading: isSettingsLoading, saveSettings, isSaving } = useSystemSettings();
  const testConnectionMutation = useTestChatwootConnection();

  // System Settings form states
  const [chatwootEnabled, setChatwootEnabled] = useState(true);
  const [hermesAiEnabled, setHermesAiEnabled] = useState(true);
  const [autoCreateLeadEnabled, setAutoCreateLeadEnabled] = useState(true);
  const [baseUrl, setBaseUrl] = useState('http://localhost:3003');
  const [accessToken, setAccessToken] = useState('XRq5UmJcH84wnz5oWR879AwC');
  const [accountId, setAccountId] = useState('1');
  const [webhookSecret, setWebhookSecret] = useState('');
  const [testResult, setTestResult] = useState<{ success: boolean; latencyMs: number; message: string } | null>(null);

  // AI Lead Extraction & Auto-Approve settings states
  const [autoExtractEnabled, setAutoExtractEnabled] = useState(true);
  const [extractMinMessages, setExtractMinMessages] = useState('3');
  const [extractLookbackWindow, setExtractLookbackWindow] = useState('today');
  const [extractConfidenceThreshold, setExtractConfidenceThreshold] = useState('0.6');
  const [autoApproveEnabled, setAutoApproveEnabled] = useState(true);
  const [autoApproveHours, setAutoApproveHours] = useState('12');
  const [summaryLookbackWindow, setSummaryLookbackWindow] = useState('all');

  useEffect(() => {
    if (settings) {
      if (settings.INTEGRATION_CHATWOOT_ENABLED !== undefined) setChatwootEnabled(settings.INTEGRATION_CHATWOOT_ENABLED.isEnabled);
      if (settings.INTEGRATION_HERMES_AI_ENABLED !== undefined) setHermesAiEnabled(settings.INTEGRATION_HERMES_AI_ENABLED.isEnabled);
      if (settings.AUTO_CREATE_LEAD_ENABLED !== undefined) setAutoCreateLeadEnabled(settings.AUTO_CREATE_LEAD_ENABLED.isEnabled);
      if (settings.CHATWOOT_BASE_URL?.value) setBaseUrl(settings.CHATWOOT_BASE_URL.value);
      if (settings.CHATWOOT_API_ACCESS_TOKEN?.value) setAccessToken(settings.CHATWOOT_API_ACCESS_TOKEN.value);
      if (settings.CHATWOOT_ACCOUNT_ID?.value) setAccountId(settings.CHATWOOT_ACCOUNT_ID.value);
      if (settings.CHATWOOT_WEBHOOK_SECRET?.value) setWebhookSecret(settings.CHATWOOT_WEBHOOK_SECRET.value);

      if (settings.AI_EXTRACT_AUTO_TRIGGER !== undefined) setAutoExtractEnabled(settings.AI_EXTRACT_AUTO_TRIGGER.value !== 'false');
      if (settings.AI_EXTRACT_MIN_MESSAGES?.value) setExtractMinMessages(settings.AI_EXTRACT_MIN_MESSAGES.value);
      if (settings.AI_EXTRACT_LOOKBACK_WINDOW?.value) setExtractLookbackWindow(settings.AI_EXTRACT_LOOKBACK_WINDOW.value);
      if (settings.AI_EXTRACT_CONFIDENCE_THRESHOLD?.value) setExtractConfidenceThreshold(settings.AI_EXTRACT_CONFIDENCE_THRESHOLD.value);
      if (settings.DRAFT_LEAD_AUTO_APPROVE_ENABLED !== undefined) setAutoApproveEnabled(settings.DRAFT_LEAD_AUTO_APPROVE_ENABLED.value !== 'false');
      if (settings.DRAFT_LEAD_AUTO_APPROVE_HOURS?.value) setAutoApproveHours(settings.DRAFT_LEAD_AUTO_APPROVE_HOURS.value);
      if (settings.AI_SUMMARY_LOOKBACK_WINDOW?.value) setSummaryLookbackWindow(settings.AI_SUMMARY_LOOKBACK_WINDOW.value);
    }
  }, [settings]);

  // Handle Real Connection Test
  const handleTestConnection = async () => {
    setTestResult(null);
    try {
      const res = await testConnectionMutation.mutateAsync({
        baseUrl,
        accessToken,
        accountId: parseInt(accountId, 10) || 1,
      });
      setTestResult(res);
      if (res?.success) message.success(res.message);
      else message.error(res.message);
    } catch (err: any) {
      setTestResult({ success: false, latencyMs: 0, message: err.message || 'Lỗi kết nối' });
      message.error('Không thể kiểm tra kết nối tới Chatwoot Server');
    }
  };

  // Handle Save System Settings
  const handleSaveSettings = async () => {
    try {
      await saveSettings([
        { key: 'INTEGRATION_CHATWOOT_ENABLED', isEnabled: chatwootEnabled, description: 'Master Toggle cho Chatwoot Integration' },
        { key: 'INTEGRATION_HERMES_AI_ENABLED', isEnabled: hermesAiEnabled, description: 'Cho phép Hermes AI tự động trả lời' },
        { key: 'AUTO_CREATE_LEAD_ENABLED', isEnabled: autoCreateLeadEnabled, description: 'Tự động tạo Lead khi có tin nhắn mới' },
        { key: 'CHATWOOT_BASE_URL', value: baseUrl, description: 'Base URL Server Chatwoot' },
        { key: 'CHATWOOT_API_ACCESS_TOKEN', value: accessToken, description: 'SuperAdmin Access Token' },
        { key: 'CHATWOOT_ACCOUNT_ID', value: accountId, description: 'Chatwoot Account ID' },
        { key: 'CHATWOOT_WEBHOOK_SECRET', value: webhookSecret, description: 'Webhook HMAC Secret' },

        { key: 'AI_EXTRACT_AUTO_TRIGGER', value: autoExtractEnabled ? 'true' : 'false', isEnabled: autoExtractEnabled, description: 'Tự động bóc tách thông tin Lead' },
        { key: 'AI_EXTRACT_MIN_MESSAGES', value: extractMinMessages, description: 'Số tin nhắn tối thiểu trước khi trigger AI bóc tách' },
        { key: 'AI_EXTRACT_LOOKBACK_WINDOW', value: extractLookbackWindow, description: 'Phạm vi tin nhắn AI đọc để bóc tách' },
        { key: 'AI_EXTRACT_CONFIDENCE_THRESHOLD', value: extractConfidenceThreshold, description: 'Ngưỡng độ tin cậy AI tối thiểu' },
        { key: 'DRAFT_LEAD_AUTO_APPROVE_ENABLED', value: autoApproveEnabled ? 'true' : 'false', isEnabled: autoApproveEnabled, description: 'Bật tự động duyệt Draft Lead theo thời gian' },
        { key: 'DRAFT_LEAD_AUTO_APPROVE_HOURS', value: autoApproveHours, description: 'Số giờ chờ trước khi tự động duyệt' },
        { key: 'AI_SUMMARY_LOOKBACK_WINDOW', value: summaryLookbackWindow, description: 'Phạm vi tin nhắn cho AI tóm tắt' },
      ]);
      message.success('Đã lưu cấu hình hệ thống thành công!');
    } catch (err: any) {
      message.error('Lưu cấu hình thất bại!');
    }
  };

  // Resource Hooks for Operations & Automation
  const agents = useMessagingResource('agents');
  const agentBots = useMessagingResource('agent-bots');
  const teams = useMessagingResource('teams');
  const labels = useMessagingResource('labels');
  const cannedResponses = useMessagingResource('canned-responses');
  const automationRules = useMessagingResource('automation-rules');
  const webhooks = useMessagingResource('webhooks');

  const getActiveResourceHook = () => {
    switch (modalResourceType) {
      case 'agents': return agents;
      case 'agent-bots': return agentBots;
      case 'teams': return teams;
      case 'labels': return labels;
      case 'canned-responses': return cannedResponses;
      case 'webhooks': return webhooks;
      default: return null;
    }
  };

  const currentResourceHook = getActiveResourceHook();

  const handleModalSubmit = async (payload: any) => {
    if (currentResourceHook) {
      await currentResourceHook.createItem(payload);
      message.success('Tạo dữ liệu thành công!');
    }
  };

  const tabs = [
    { id: 'channels', name: 'Kênh Kết Nối & Tunnel', icon: Network, desc: 'Telegram Bots, Public Tunnel & Webhook Status' },
    { id: 'system', name: 'Cấu Hình Hệ Thống', icon: Power, desc: 'Chatwoot Server Base URL & API Tokens' },
    { id: 'hermes-ai', name: 'Hermes AI Engine', icon: Bot, desc: 'Model Matrix, Provider & System Prompts' },
    { id: 'operations', name: 'Vận Hành CSKH', icon: Users, desc: 'Nhân viên, Nhóm, Nhãn, Trả lời nhanh' },
    { id: 'automation-webhooks', name: 'Tự Động Hóa & Webhooks', icon: Zap, desc: 'Quy tắc chia lead & System Webhooks' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Resource Modal for Operations */}
      <ResourceModal
        visible={modalResourceType !== null}
        resourceType={modalResourceType}
        onClose={() => setModalResourceType(null)}
        onSubmit={handleModalSubmit}
        loading={currentResourceHook?.isCreating || false}
      />

      {/* Inbox Form Modal */}
      <InboxFormModal
        visible={isInboxModalOpen}
        channelToEdit={channelToEdit}
        onClose={() => {
          setIsInboxModalOpen(false);
          setChannelToEdit(null);
        }}
        onSuccess={() => {
          setIsInboxModalOpen(false);
          setChannelToEdit(null);
        }}
      />

      {/* Diagnostics Panel Modal */}
      <DiagnosticsPanel
        visible={isDiagnosticsOpen}
        onClose={() => setIsDiagnosticsOpen(false)}
      />

      {/* Top Page Header */}
      <div>
        <h1 className="text-xl font-bold text-[var(--color-fg)] flex items-center gap-2.5">
          <Settings className="text-[var(--color-accent)]" size={24} />
          <span>Trung Tâm Cấu Hình Kênh Tương Tác & Engine Chatwoot</span>
        </h1>
        <p className="text-xs text-[var(--color-muted-fg)] mt-1">
          Quản lý tập trung Telegram Bots, Public Tunnel Gateway, Hermes AI Engine và quy tắc vận hành CSKH đa kênh.
        </p>
      </div>

      {/* Main Tab Wrapper */}
      <div className="flex gap-6 min-h-[580px] bg-[var(--color-surface)]/30 border border-[var(--color-border)] rounded-2xl p-6 shadow-sm">
        {/* Left Sidebar Sub-Tabs (5 Tabs) */}
        <div className="w-64 flex flex-col gap-1.5 border-r border-[var(--color-border)] pr-5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-left transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[var(--color-accent)]/15 text-[var(--color-accent)] font-semibold border-l-4 border-[var(--color-accent)] pl-2.5 shadow-sm'
                    : 'text-[var(--color-muted-fg)] hover:text-[var(--color-fg)] hover:bg-[var(--color-muted-bg)]/30'
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

        {/* Right Content Panel */}
        <div className="flex-1 pl-2">
          {isSettingsLoading ? (
            <div className="p-12 text-center">
              <Spin size="large" />
              <p className="text-xs text-[var(--color-muted-fg)] mt-3">Đang tải cấu hình hệ thống...</p>
            </div>
          ) : (
            <>
              {/* TAB 1: KÊNH KẾT NỐI & TUNNEL GATEWAY (Default) */}
              {activeTab === 'channels' && (
                <div className="space-y-6">
                  {/* Public Tunnel & Webhook Controller Card */}
                  <TunnelWebhookCard onOpenDiagnostics={() => setIsDiagnosticsOpen(true)} />

                  {/* Messaging Channels Table */}
                  <InboxConfigTable
                    onOpenCreateModal={() => {
                      setChannelToEdit(null);
                      setIsInboxModalOpen(true);
                    }}
                    onOpenEditModal={(channel) => {
                      setChannelToEdit(channel);
                      setIsInboxModalOpen(true);
                    }}
                  />
                </div>
              )}

              {/* TAB 2: CẤU HÌNH HỆ THỐNG (Server Settings) */}
              {activeTab === 'system' && (
                <div className="space-y-6 max-w-2xl">
                  {/* Master Toggle Status */}
                  <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b border-[var(--color-border)]">
                      <div>
                        <h3 className="font-bold text-sm text-[var(--color-fg)] flex items-center gap-2">
                          <ShieldCheck className="text-emerald-500" size={18} />
                          <span>Master Integration Status</span>
                        </h3>
                        <p className="text-[11px] text-[var(--color-muted-fg)]">
                          Công tắc bật/tắt toàn bộ dịch vụ xử lý tin nhắn Chatwoot & Hermes AI
                        </p>
                      </div>
                      <Tag color={chatwootEnabled ? 'success' : 'error'} className="px-3 py-1 text-xs rounded-full font-bold">
                        {chatwootEnabled ? 'ĐANG BẬT' : 'ĐANG TẮT'}
                      </Tag>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between py-2 border-b border-[var(--color-border)]/50">
                        <div>
                          <span className="text-xs font-semibold text-[var(--color-fg)]">Chatwoot Omnichannel Integration</span>
                          <p className="text-[10px] text-[var(--color-muted-fg)]">Bật/Tắt nhận Webhook và xử lý tin nhắn đa kênh</p>
                        </div>
                        <Switch checked={chatwootEnabled} onChange={setChatwootEnabled} />
                      </div>

                      <div className="flex items-center justify-between py-2 border-b border-[var(--color-border)]/50">
                        <div>
                          <span className="text-xs font-semibold text-[var(--color-fg)]">Hermes AI Auto-Reply Agent</span>
                          <p className="text-[10px] text-[var(--color-muted-fg)]">Cho phép Hermes AI tự động trả lời khách hàng 24/7</p>
                        </div>
                        <Switch checked={hermesAiEnabled} onChange={setHermesAiEnabled} />
                      </div>

                      <div className="flex items-center justify-between py-2">
                        <div>
                          <span className="text-xs font-semibold text-[var(--color-fg)]">Tự Động Tạo Lead Mới (Auto-Create Lead)</span>
                          <p className="text-[10px] text-[var(--color-muted-fg)]">Tự động tạo hồ sơ Lead trong CRM khi nhận tin nhắn từ người mới</p>
                        </div>
                        <Switch checked={autoCreateLeadEnabled} onChange={setAutoCreateLeadEnabled} />
                      </div>
                    </div>
                  </div>

                  {/* AI Extraction & Lead Approval Settings Card */}
                  <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bot className="text-amber-500" size={18} />
                        <h3 className="font-bold text-sm text-[var(--color-fg)]">Cấu Hình AI Bóc Tách & Duyệt Lead Tự Động</h3>
                      </div>
                      <Tag color="gold" className="rounded-full text-[10px]">
                        AI Automation
                      </Tag>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold text-[var(--color-muted-fg)]">Tự Động Bóc Tách Lead Tích Hợp Chat</label>
                        <div className="pt-1">
                          <Switch checked={autoExtractEnabled} onChange={setAutoExtractEnabled} />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold text-[var(--color-muted-fg)]">Số Tin Nhắn Tối Thiểu Để Trigger AI Bóc Tách</label>
                        <Select
                          value={extractMinMessages}
                          onChange={setExtractMinMessages}
                          className="w-full text-xs rounded-lg"
                        >
                          <Select.Option value="1">1 Tin Nhắn</Select.Option>
                          <Select.Option value="2">2 Tin Nhắn</Select.Option>
                          <Select.Option value="3">3 Tin Nhắn (Mặc Định)</Select.Option>
                          <Select.Option value="5">5 Tin Nhắn</Select.Option>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold text-[var(--color-muted-fg)]">Phạm Vi Tin Nhắn AI Đọc (Lookback Window)</label>
                        <Select
                          value={extractLookbackWindow}
                          onChange={setExtractLookbackWindow}
                          className="w-full text-xs rounded-lg"
                        >
                          <Select.Option value="today">📅 Trong Hôm Nay</Select.Option>
                          <Select.Option value="last_2_days">⏳ 2 Ngày Gần Nhất</Select.Option>
                          <Select.Option value="last_7_days">📆 7 Ngày Gần Nhất</Select.Option>
                          <Select.Option value="all">♾️ Toàn Bộ Lịch Sử</Select.Option>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold text-[var(--color-muted-fg)]">Ngưỡng Độ Tin Cậy AI Tối Thiểu (Confidence)</label>
                        <Select
                          value={extractConfidenceThreshold}
                          onChange={setExtractConfidenceThreshold}
                          className="w-full text-xs rounded-lg"
                        >
                          <Select.Option value="0.4">40% (Thấp - Nhận Nhiều)</Select.Option>
                          <Select.Option value="0.5">50% (Trung Bình)</Select.Option>
                          <Select.Option value="0.6">60% (Chuẩn Mặc Định)</Select.Option>
                          <Select.Option value="0.7">70% (Cao - Chọn Lọc)</Select.Option>
                          <Select.Option value="0.8">80% (Rất Khắt Khe)</Select.Option>
                        </Select>
                      </div>

                      <div className="space-y-1.5 border-t border-[var(--color-border)]/50 pt-3">
                        <label className="text-[11px] font-semibold text-[var(--color-muted-fg)]">Bật Tự Động Duyệt Lead Theo Hạn Giờ</label>
                        <div className="pt-1">
                          <Switch checked={autoApproveEnabled} onChange={setAutoApproveEnabled} />
                        </div>
                      </div>

                      <div className="space-y-1.5 border-t border-[var(--color-border)]/50 pt-3">
                        <label className="text-[11px] font-semibold text-[var(--color-muted-fg)]">Thời Gian Chờ Trước Khi Tự Động Duyệt</label>
                        <Select
                          value={autoApproveHours}
                          onChange={setAutoApproveHours}
                          disabled={!autoApproveEnabled}
                          className="w-full text-xs rounded-lg"
                        >
                          <Select.Option value="1">1 Giờ (Test Nhanh)</Select.Option>
                          <Select.Option value="2">2 Giờ</Select.Option>
                          <Select.Option value="4">4 Giờ</Select.Option>
                          <Select.Option value="6">6 Giờ</Select.Option>
                          <Select.Option value="12">12 Giờ (Mặc Định)</Select.Option>
                          <Select.Option value="24">24 Giờ (1 Ngày)</Select.Option>
                          <Select.Option value="48">48 Giờ (2 Ngày)</Select.Option>
                        </Select>
                      </div>

                      <div className="space-y-1.5 col-span-2 border-t border-[var(--color-border)]/50 pt-3">
                        <label className="text-[11px] font-semibold text-[var(--color-muted-fg)]">Phạm Vi Tin Nhắn AI Tóm Tắt (AI Summary Lookback)</label>
                        <Select
                          value={summaryLookbackWindow}
                          onChange={setSummaryLookbackWindow}
                          className="w-full text-xs rounded-lg"
                        >
                          <Select.Option value="today">📅 Trong Hôm Nay</Select.Option>
                          <Select.Option value="last_2_days">⏳ 2 Ngày Gần Nhất</Select.Option>
                          <Select.Option value="all">♾️ Toàn Bộ Lịch Sử Chat</Select.Option>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Server Connection Inputs */}
                  <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 space-y-4">
                    <h3 className="font-bold text-sm text-[var(--color-fg)]">Thông Số Kết Nối Server Chatwoot</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <FloatingInput label="Chatwoot Base URL" value={baseUrl} onChange={setBaseUrl} placeholder="http://localhost:3003" />
                      <FloatingInput label="API Access Token" type="password" value={accessToken} onChange={setAccessToken} placeholder="SuperAdmin Token" />
                      <FloatingInput label="Account ID" value={accountId} onChange={setAccountId} placeholder="1" />
                      <FloatingInput label="Webhook Secret Key" type="password" value={webhookSecret} onChange={setWebhookSecret} placeholder="HMAC Key (Option)" />
                    </div>

                    {testResult && (
                      <div
                        className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs ${
                          testResult.success
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                            : 'bg-rose-500/10 border-rose-500/30 text-rose-500'
                        }`}
                      >
                        {testResult.success ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                        <span>{testResult.message}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-2">
                      <Button
                        onClick={handleTestConnection}
                        loading={testConnectionMutation.isPending}
                        icon={<RefreshCw size={14} />}
                        className="rounded-xl cursor-pointer"
                      >
                        Kiểm Tra Kết Nối Thực Tế (Test Connection)
                      </Button>

                      <Button
                        type="primary"
                        onClick={handleSaveSettings}
                        loading={isSaving}
                        className="rounded-xl cursor-pointer bg-[var(--color-accent)] hover:opacity-90"
                      >
                        Lưu Cấu Hình (Save Settings)
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: HERMES AI ENGINE */}
              {activeTab === 'hermes-ai' && (
                <div className="space-y-6">
                  <HermesAgentQuickConfig />

                  <div className="space-y-4 pt-4 border-t border-[var(--color-border)]/40">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-sm text-[var(--color-fg)]">Danh Sách Agent Bots Khác</h3>
                        <p className="text-[11px] text-[var(--color-muted-fg)]">Các bot webhook tự động hóa khác bên ngoài Hermes AI.</p>
                      </div>
                      <Button
                        type="primary"
                        onClick={() => setModalResourceType('agent-bots')}
                        icon={<Plus size={14} />}
                        className="rounded-xl bg-[var(--color-accent)] cursor-pointer"
                      >
                        Tạo Agent Bot
                      </Button>
                    </div>

                    <SharedTable<any>
                      columns={[
                        { title: 'ID', dataIndex: 'id', key: 'id', render: (v: number) => <span className="font-mono font-bold">#{v}</span> },
                        { title: 'Tên Bot', dataIndex: 'name', key: 'name' },
                        { title: 'Mô Tả', dataIndex: 'description', key: 'description' },
                        { title: 'Webhook Outgoing URL', dataIndex: 'outgoing_url', key: 'outgoing_url', render: (v: string) => <span className="font-mono text-xs">{v}</span> },
                        {
                          title: 'Hành Động',
                          dataIndex: 'id',
                          key: 'actions',
                          render: (_: any, record: any) => (
                            <Popconfirm
                              title="Xoá Agent Bot?"
                              onConfirm={() => agentBots.deleteItem(record.id)}
                              okText="Xoá"
                              cancelText="Hủy"
                              okButtonProps={{ danger: true }}
                            >
                              <Button type="text" size="small" icon={<Trash2 size={14} className="text-rose-500" />} />
                            </Popconfirm>
                          ),
                        },
                      ]}
                      dataSource={agentBots.items}
                    />
                  </div>
                </div>
              )}

              {/* TAB 4: VẬN HÀNH CSKH (Operations with Horizontal Sub-nav) */}
              {activeTab === 'operations' && (
                <div className="space-y-5">
                  {/* Horizontal Sub-nav */}
                  <div className="flex items-center gap-2 border-b border-[var(--color-border)] pb-3">
                    <button
                      onClick={() => setOperationsSubTab('agents')}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        operationsSubTab === 'agents'
                          ? 'bg-[var(--color-accent)] text-white shadow-sm'
                          : 'text-[var(--color-muted-fg)] hover:bg-[var(--color-muted-bg)]'
                      }`}
                    >
                      <UserCheck size={14} /> Nhân Viên CSKH (Agents)
                    </button>

                    <button
                      onClick={() => setOperationsSubTab('teams')}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        operationsSubTab === 'teams'
                          ? 'bg-[var(--color-accent)] text-white shadow-sm'
                          : 'text-[var(--color-muted-fg)] hover:bg-[var(--color-muted-bg)]'
                      }`}
                    >
                      <Users2 size={14} /> Nhóm Hỗ Trợ (Teams)
                    </button>

                    <button
                      onClick={() => setOperationsSubTab('labels')}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        operationsSubTab === 'labels'
                          ? 'bg-[var(--color-accent)] text-white shadow-sm'
                          : 'text-[var(--color-muted-fg)] hover:bg-[var(--color-muted-bg)]'
                      }`}
                    >
                      <TagIcon size={14} /> Nhãn Phân Loại (Labels)
                    </button>

                    <button
                      onClick={() => setOperationsSubTab('canned-responses')}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        operationsSubTab === 'canned-responses'
                          ? 'bg-[var(--color-accent)] text-white shadow-sm'
                          : 'text-[var(--color-muted-fg)] hover:bg-[var(--color-muted-bg)]'
                      }`}
                    >
                      <MessageCircle size={14} /> Mẫu Trả Lời Nhanh (Canned)
                    </button>
                  </div>

                  {/* Sub-Tab 1: Agents */}
                  {operationsSubTab === 'agents' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="font-bold text-sm text-[var(--color-fg)]">Danh Sách Nhân Viên CSKH (Human Agents)</h3>
                        <Button
                          type="primary"
                          onClick={() => setModalResourceType('agents')}
                          icon={<Plus size={14} />}
                          className="rounded-xl bg-[var(--color-accent)] cursor-pointer"
                        >
                          Thêm Nhân Viên
                        </Button>
                      </div>
                      <SharedTable<any>
                        columns={[
                          { title: 'ID', dataIndex: 'id', key: 'id', render: (v: number) => <span className="font-mono font-bold">#{v}</span> },
                          { title: 'Tên Nhân Viên', dataIndex: 'name', key: 'name' },
                          { title: 'Email', dataIndex: 'email', key: 'email', render: (v: string) => <span className="font-mono text-xs">{v}</span> },
                          {
                            title: 'Phân Quyền (Role)',
                            dataIndex: 'role',
                            key: 'role',
                            render: (val: string) => <Tag color={val === 'administrator' ? 'gold' : 'blue'}>{val?.toUpperCase()}</Tag>,
                          },
                          {
                            title: 'Hành Động',
                            dataIndex: 'id',
                            key: 'actions',
                            render: (_: any, record: any) => (
                              <Popconfirm
                                title="Xoá nhân viên này?"
                                onConfirm={() => agents.deleteItem(record.id)}
                                okText="Xoá"
                                cancelText="Hủy"
                                okButtonProps={{ danger: true }}
                              >
                                <Button type="text" size="small" icon={<Trash2 size={14} className="text-rose-500" />} />
                              </Popconfirm>
                            ),
                          },
                        ]}
                        dataSource={agents.items}
                      />
                    </div>
                  )}

                  {/* Sub-Tab 2: Teams */}
                  {operationsSubTab === 'teams' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="font-bold text-sm text-[var(--color-fg)]">Danh Sách Nhóm CSKH (Teams)</h3>
                        <Button
                          type="primary"
                          onClick={() => setModalResourceType('teams')}
                          icon={<Plus size={14} />}
                          className="rounded-xl bg-[var(--color-accent)] cursor-pointer"
                        >
                          Thêm Nhóm
                        </Button>
                      </div>
                      <SharedTable<any>
                        columns={[
                          { title: 'ID', dataIndex: 'id', key: 'id', render: (v: number) => <span className="font-mono font-bold">#{v}</span> },
                          { title: 'Tên Nhóm', dataIndex: 'name', key: 'name' },
                          { title: 'Mô Tả', dataIndex: 'description', key: 'description' },
                          {
                            title: 'Hành Động',
                            dataIndex: 'id',
                            key: 'actions',
                            render: (_: any, record: any) => (
                              <Popconfirm
                                title="Xoá nhóm này?"
                                onConfirm={() => teams.deleteItem(record.id)}
                                okText="Xoá"
                                cancelText="Hủy"
                                okButtonProps={{ danger: true }}
                              >
                                <Button type="text" size="small" icon={<Trash2 size={14} className="text-rose-500" />} />
                              </Popconfirm>
                            ),
                          },
                        ]}
                        dataSource={teams.items}
                      />
                    </div>
                  )}

                  {/* Sub-Tab 3: Labels */}
                  {operationsSubTab === 'labels' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="font-bold text-sm text-[var(--color-fg)]">Nhãn Phân Loại Hội Thoại (Labels)</h3>
                        <Button
                          type="primary"
                          onClick={() => setModalResourceType('labels')}
                          icon={<Plus size={14} />}
                          className="rounded-xl bg-[var(--color-accent)] cursor-pointer"
                        >
                          Tạo Nhãn Mới
                        </Button>
                      </div>
                      <SharedTable<any>
                        columns={[
                          {
                            title: 'Tên Nhãn',
                            dataIndex: 'title',
                            key: 'title',
                            render: (val: string, record: any) => <Tag color={record.color || 'magenta'}>{val}</Tag>,
                          },
                          { title: 'Mã Màu', dataIndex: 'color', key: 'color', render: (v: string) => <span className="font-mono text-xs">{v}</span> },
                          { title: 'Mô Tả', dataIndex: 'description', key: 'description' },
                          {
                            title: 'Hành Động',
                            dataIndex: 'id',
                            key: 'actions',
                            render: (_: any, record: any) => (
                              <Popconfirm
                                title="Xoá nhãn này?"
                                onConfirm={() => labels.deleteItem(record.id)}
                                okText="Xoá"
                                cancelText="Hủy"
                                okButtonProps={{ danger: true }}
                              >
                                <Button type="text" size="small" icon={<Trash2 size={14} className="text-rose-500" />} />
                              </Popconfirm>
                            ),
                          },
                        ]}
                        dataSource={labels.items}
                      />
                    </div>
                  )}

                  {/* Sub-Tab 4: Canned Responses */}
                  {operationsSubTab === 'canned-responses' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="font-bold text-sm text-[var(--color-fg)]">Mẫu Trả Lời Nhanh (Canned Responses)</h3>
                        <Button
                          type="primary"
                          onClick={() => setModalResourceType('canned-responses')}
                          icon={<Plus size={14} />}
                          className="rounded-xl bg-[var(--color-accent)] cursor-pointer"
                        >
                          Thêm Mẫu Mới
                        </Button>
                      </div>
                      <SharedTable<any>
                        columns={[
                          { title: 'Mã Nhanh', dataIndex: 'short_code', key: 'short_code', render: (val: string) => <Tag color="cyan">/{val}</Tag> },
                          { title: 'Nội Dung Mẫu', dataIndex: 'content', key: 'content' },
                          {
                            title: 'Hành Động',
                            dataIndex: 'id',
                            key: 'actions',
                            render: (_: any, record: any) => (
                              <Popconfirm
                                title="Xoá mẫu trả lời này?"
                                onConfirm={() => cannedResponses.deleteItem(record.id)}
                                okText="Xoá"
                                cancelText="Hủy"
                                okButtonProps={{ danger: true }}
                              >
                                <Button type="text" size="small" icon={<Trash2 size={14} className="text-rose-500" />} />
                              </Popconfirm>
                            ),
                          },
                        ]}
                        dataSource={cannedResponses.items}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: TỰ ĐỘNG HÓA & WEBHOOKS (Automation & System Webhooks) */}
              {activeTab === 'automation-webhooks' && (
                <div className="space-y-8">
                  {/* Automation Rules Section */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-sm text-[var(--color-fg)]">Quy Tắc Tự Động Hóa (Automation Rules)</h3>
                        <p className="text-[11px] text-[var(--color-muted-fg)]">Tự động gán team, nhãn và trạng thái khi nhận tin nhắn mới.</p>
                      </div>
                      <Button type="primary" icon={<Plus size={14} />} className="rounded-xl bg-[var(--color-accent)] cursor-pointer">
                        Thêm Quy Tắc
                      </Button>
                    </div>
                    <SharedTable<any>
                      columns={[
                        { title: 'Tên Quy Tắc', dataIndex: 'name', key: 'name' },
                        { title: 'Sự Kiện Triggers', dataIndex: 'event_name', key: 'event_name', render: (val: string) => <Tag color="gold">{val}</Tag> },
                        {
                          title: 'Trạng Thái',
                          dataIndex: 'active',
                          key: 'active',
                          render: (val: boolean) => <Badge status={val ? 'success' : 'default'} text={val ? 'Active' : 'Disabled'} />,
                        },
                      ]}
                      dataSource={automationRules.items}
                    />
                  </div>

                  {/* System Webhooks Section */}
                  <div className="space-y-4 pt-6 border-t border-[var(--color-border)]">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-sm text-[var(--color-fg)]">Webhooks Hệ Thống (Chatwoot ➔ Backend CRM)</h3>
                        <p className="text-[11px] text-[var(--color-muted-fg)]">Đường dẫn nhận sự kiện tin nhắn từ Chatwoot đẩy về CRM Backend.</p>
                      </div>
                      <Button
                        type="primary"
                        onClick={() => setModalResourceType('webhooks')}
                        icon={<Plus size={14} />}
                        className="rounded-xl bg-[var(--color-accent)] cursor-pointer"
                      >
                        Thêm Webhook
                      </Button>
                    </div>
                    <SharedTable<any>
                      columns={[
                        { title: 'ID', dataIndex: 'id', key: 'id', render: (v: number) => <span className="font-mono font-bold">#{v}</span> },
                        { title: 'Webhook Endpoint URL', dataIndex: 'url', key: 'url', render: (v: string) => <span className="font-mono text-xs">{v}</span> },
                        {
                          title: 'Sự Kiện Đăng Ký',
                          dataIndex: 'subscriptions',
                          key: 'subscriptions',
                          render: (val: string[]) => val?.map((s, i) => <Tag key={i} color="purple">{s}</Tag>),
                        },
                        {
                          title: 'Hành Động',
                          dataIndex: 'id',
                          key: 'actions',
                          render: (_: any, record: any) => (
                            <Popconfirm
                              title="Xoá Webhook này?"
                              onConfirm={() => webhooks.deleteItem(record.id)}
                              okText="Xoá"
                              cancelText="Hủy"
                              okButtonProps={{ danger: true }}
                            >
                              <Button type="text" size="small" icon={<Trash2 size={14} className="text-rose-500" />} />
                            </Popconfirm>
                          ),
                        },
                      ]}
                      dataSource={webhooks.items}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
