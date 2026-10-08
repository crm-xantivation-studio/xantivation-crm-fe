'use client';

import React, { useState } from 'react';
import { Button, Select, Tag, Switch, Skeleton, Form, Input, message, Tooltip, Dropdown } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  ShieldAlert,
  ShieldCheck,
  Bot,
  UserCheck,
  Tag as TagIcon,
  Plus,
  ArrowUpRight,
  Sparkles,
  FileText,
  Calendar,
  AlertTriangle,
  RefreshCw,
  MoreVertical,
} from 'lucide-react';
import Link from 'next/link';
import {
  useBlockContact,
  useUnblockContact,
  useAssignConversation,
  useUpdateConversationStatus,
  useConversationLabels,
  useAddConversationLabels,
  useDraftLeads,
  useExtractLead,
  useSummarizeConversation,
  useAIStatus,
  useToggleAIMode,
  useMatchConversationContact,
} from '@/hooks/api/useConversation';
import { useMessagingResource } from '@/hooks/api/useMessagingConfig';
import DraftLeadCard from './DraftLeadCard';
import QuickQuoteModal from './QuickQuoteModal';
import QuickActivityModal from './QuickActivityModal';

interface ConversationControlPanelProps {
  conversation: any;
  onRefresh?: () => void;
}

export default function ConversationControlPanel({ conversation, onRefresh }: ConversationControlPanelProps) {
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [summaryText, setSummaryText] = useState<string | null>(null);

  const conversationId = conversation?.id || null;
  const activeContact = conversation?.contact;

  // AI & Conversation Status
  const { data: aiStatusRes } = useAIStatus(conversationId);
  const toggleAIMutation = useToggleAIMode(conversationId);
  const aiMode = aiStatusRes?.data?.aiMode !== false;

  // CRM Contact Matcher
  const searchEmail = activeContact?.email || '';
  const searchPhone = activeContact?.phoneNumber || '';
  const { data: matchRes, isLoading: matchLoading } = useMatchConversationContact({
    email: searchEmail,
    phone: searchPhone,
  });
  const match = matchRes?.data;

  // Controls Mutations
  const blockMutation = useBlockContact();
  const unblockMutation = useUnblockContact();
  const assignMutation = useAssignConversation(conversationId);
  const statusMutation = useUpdateConversationStatus(conversationId);
  const summarizeMutation = useSummarizeConversation(conversationId);

  // Labels Query & Mutation
  const { data: labelsRes } = useConversationLabels(conversationId);
  const addLabelsMutation = useAddConversationLabels(conversationId);
  const currentLabels = labelsRes?.data || [];

  // Draft Leads Query & Extract Mutation
  const { data: draftLeadsRes, isLoading: draftLoading } = useDraftLeads(conversationId);
  const extractLeadMutation = useExtractLead(conversationId);
  const draftLeads = draftLeadsRes?.data || [];
  const activeDraft = draftLeads.find((d: any) => d.status === 'DRAFT' || d.status === 'PENDING');

  // Chatwoot Agents list for assignment (Configured staff/agents in Chatwoot)
  const { items: chatwootAgents } = useMessagingResource('agents');

  const handleToggleAI = async () => {
    if (!conversationId) return;
    try {
      const res = await toggleAIMutation.mutateAsync();
      if (res?.data?.aiMode) {
        message.success('Đã khôi phục Hermes AI tự động!');
      } else {
        message.info('Đã chuyển sang Nhận tư vấn (Tắt AI)!');
      }
    } catch (e) {
      message.error('Không thể cập nhật trạng thái AI');
    }
  };

  const handleBlockToggle = async () => {
    if (!activeContact?.id) return;
    try {
      if (activeContact.blocked) {
        await unblockMutation.mutateAsync(activeContact.id);
        message.success('Đã bỏ chặn người dùng');
      } else {
        await blockMutation.mutateAsync(activeContact.id);
        message.warning('Đã chặn người dùng này!');
      }
      if (onRefresh) onRefresh();
    } catch (e) {
      message.error('Thao tác chặn thất bại');
    }
  };

  const handleStatusChange = async (status: 'open' | 'pending' | 'resolved') => {
    if (!conversationId) return;
    try {
      await statusMutation.mutateAsync(status);
      message.success(`Đã đổi trạng thái sang ${status.toUpperCase()}`);
    } catch (e) {
      message.error('Cập nhật trạng thái thất bại');
    }
  };

  const handleAssignAgent = async (agentId: number | null) => {
    if (!conversationId) return;
    try {
      await assignMutation.mutateAsync(agentId);
      message.success('Đã cập nhật nhân viên phụ trách');
    } catch (e) {
      message.error('Không thể gán nhân viên');
    }
  };

  const handleSummarize = async () => {
    if (!conversationId) return;
    try {
      const res = await summarizeMutation.mutateAsync();
      setSummaryText(res?.data?.summary || 'Không có bản tóm tắt.');
      message.success('Tóm tắt hội thoại bằng AI thành công!');
    } catch (e) {
      message.error('Không thể tạo bản tóm tắt');
    }
  };

  const handleExtractLeadManual = async () => {
    if (!conversationId) return;
    try {
      const res = await extractLeadMutation.mutateAsync();
      if (res?.data) {
        message.success('AI đã trích xuất thông tin thành công!');
      } else {
        message.info('Chưa đủ thông tin trò chuyện để bóc tách Lead.');
      }
    } catch (e) {
      message.error('Bóc tách thất bại');
    }
  };

  if (!conversation) {
    return (
      <div className="text-center py-16 text-[var(--color-muted-fg)]">
        Chọn một cuộc trò chuyện để xem thông tin
      </div>
    );
  }

  return (
    <div className="space-y-5 text-xs">
      {/* ──────────────── SECTION 1: MESSAGING CONTROLS ──────────────── */}
      <div className="space-y-4 pb-4 border-b border-[var(--color-border)]">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--color-muted-fg)]">
            Thao Tác Hội Thoại
          </span>
          <div className="flex items-center gap-1">
            <Tooltip title={activeContact?.blocked ? 'Bỏ chặn' : 'Chặn tin nhắn rác'}>
              <Button
                type="text"
                size="small"
                danger={!activeContact?.blocked}
                icon={activeContact?.blocked ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
                onClick={handleBlockToggle}
                loading={blockMutation.isPending || unblockMutation.isPending}
                className="rounded-lg cursor-pointer"
              />
            </Tooltip>
          </div>
        </div>

        {/* AI Toggle Switch & Agent Assignee */}
        <div className="space-y-2.5 bg-[var(--color-surface)]/40 p-3 rounded-xl border border-[var(--color-border)]/50">
          {/* AI Switch */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-semibold">
              {aiMode ? <Bot size={14} className="text-emerald-500" /> : <UserCheck size={14} className="text-amber-500" />}
              <span>{aiMode ? 'Hermes AI Trả Lời' : 'Người Thật Nhận Tư Vấn'}</span>
            </div>
            <Switch size="small" checked={aiMode} onChange={handleToggleAI} loading={toggleAIMutation.isPending} />
          </div>

          {/* Status Switcher */}
          <div className="flex items-center justify-between border-t border-[var(--color-border)]/40 pt-2">
            <span className="text-[10px] text-[var(--color-muted-fg)] uppercase font-mono">Trạng Thái:</span>
            <Select
              size="small"
              value={conversation.status || 'open'}
              onChange={handleStatusChange}
              loading={statusMutation.isPending}
              className="w-32 text-xs"
            >
              <Select.Option value="open">
                <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shrink-0" /> Open</span>
              </Select.Option>
              <Select.Option value="pending">
                <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block shrink-0" /> Pending</span>
              </Select.Option>
              <Select.Option value="resolved">
                <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-gray-400 inline-block shrink-0" /> Closed</span>
              </Select.Option>
            </Select>
          </div>

          {/* Assignee Dropdown */}
          <div className="flex items-center justify-between border-t border-[var(--color-border)]/40 pt-2">
            <span className="text-[10px] text-[var(--color-muted-fg)] uppercase font-mono">Phụ Trách:</span>
            <Select
              size="small"
              allowClear
              placeholder="Chưa phân công"
              value={conversation.assignee_id ?? conversation.meta?.assignee?.id ?? conversation.assignee?.id ?? undefined}
              onChange={handleAssignAgent}
              loading={assignMutation.isPending}
              className="w-36 text-xs"
            >
              {chatwootAgents.map((a: any) => (
                <Select.Option key={a.id} value={a.id}>
                  {a.name || a.email}
                </Select.Option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      {/* ──────────────── SECTION 2: CRM MATCH & DRAFT LEAD QUEUE ──────────────── */}
      <div className="space-y-4 pb-4 border-b border-[var(--color-border)]">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--color-muted-fg)] block">
          Hồ Sơ CRM & Hàng Đợi Lead
        </span>

        {matchLoading ? (
          <Skeleton active paragraph={{ rows: 2 }} />
        ) : match?.matched ? (
          /* Case A: Already Matched Lead or Customer */
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-500">
                {match.type === 'lead' ? 'Đã Khớp Lead CRM' : 'Đã Khớp Khách Hàng CRM'}
              </span>
              <Tag color={match.type === 'lead' ? 'cyan' : 'green'} className="rounded-full">
                {match.type === 'lead' ? 'Lead' : 'Customer'}
              </Tag>
            </div>

            <div className="bg-[var(--color-surface)]/60 rounded-xl border border-[var(--color-border)] p-3 space-y-2">
              <div>
                <span className="text-[10px] font-mono text-[var(--color-muted-fg)]">
                  {match.type === 'lead' ? 'Công Ty / Tên' : 'Mã KH / Tên'}
                </span>
                <p className="font-semibold text-[var(--color-fg)]">
                  {match.profile?.companyName || match.profile?.name || match.profile?.code}
                </p>
              </div>
              {match.profile?.status && (
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-[var(--color-muted-fg)]">Trạng Thái:</span>
                  <span className="font-bold">{match.profile.status}</span>
                </div>
              )}
            </div>

            <Link href={match.type === 'lead' ? `/leads/${match.profile?.id}` : `/customers/accounts/${match.profile?.id}`} className="block">
              <Button
                type="primary"
                icon={<ArrowUpRight size={13} />}
                className="w-full bg-[var(--color-accent)] border-none rounded-xl text-xs h-8 flex items-center justify-center cursor-pointer"
              >
                {match.type === 'lead' ? 'Xem Hồ Sơ Lead' : 'Xem Hồ Sơ Khách Hàng'}
              </Button>
            </Link>
          </div>
        ) : activeDraft ? (
          /* Case B: Pending Draft Lead from AI Extraction */
          <DraftLeadCard draft={activeDraft} conversationId={conversationId} />
        ) : (
          /* Case C: Not Matched & No Draft Lead -> AI Extract Button */
          <div className="space-y-3">
            <div className="bg-rose-500/10 text-rose-500 p-3 rounded-xl border border-rose-500/20 text-xs flex gap-2 items-start">
              <AlertTriangle size={15} className="shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Chưa có liên kết CRM</p>
                <p className="text-[10px] opacity-80 mt-0.5">Khách hàng chưa tồn tại trong danh sách Lead/Customer.</p>
              </div>
            </div>

            <Button
              type="dashed"
              icon={<Sparkles size={14} className="text-amber-500" />}
              onClick={handleExtractLeadManual}
              loading={extractLeadMutation.isPending}
              className="w-full border-amber-500/40 text-amber-600 dark:text-amber-400 rounded-xl text-xs h-9 flex items-center justify-center cursor-pointer"
            >
              AI Bóc Tách Thông Tin Lead
            </Button>
          </div>
        )}
      </div>

      {/* ──────────────── SECTION 3: AI COPILOT & QUICK ACTIONS ──────────────── */}
      <div className="space-y-3">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--color-muted-fg)] block">
          Công Cụ Trợ Lý AI & Thao Tác Nhanh
        </span>

        {/* AI Summarize Button & Card */}
        <div className="space-y-2">
          <Button
            type="dashed"
            block
            icon={<Sparkles size={14} className="text-indigo-500" />}
            onClick={handleSummarize}
            loading={summarizeMutation.isPending}
            className="rounded-xl text-xs h-9 flex items-center justify-center cursor-pointer"
          >
            Tóm Tắt Hội Thoại Với AI
          </Button>

          {summaryText && (
            <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-3 space-y-1 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-indigo-500 text-[11px]">
                <Sparkles size={12} /> Tóm Tắt AI:
              </div>
              <p className="text-[11px] text-[var(--color-fg)] leading-relaxed whitespace-pre-line">{summaryText}</p>
            </div>
          )}
        </div>

        {/* Quick Quote & Activity Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            icon={<FileText size={14} className="text-indigo-500" />}
            onClick={() => setQuoteModalOpen(true)}
            className="rounded-xl text-xs h-9 flex items-center justify-center cursor-pointer"
          >
            Tạo Báo Giá
          </Button>

          <Button
            icon={<Calendar size={14} className="text-emerald-500" />}
            onClick={() => setActivityModalOpen(true)}
            className="rounded-xl text-xs h-9 flex items-center justify-center cursor-pointer"
          >
            Đặt Lịch Hẹn
          </Button>
        </div>
      </div>

      {/* Quick Modals */}
      <QuickQuoteModal
        visible={quoteModalOpen}
        onClose={() => setQuoteModalOpen(false)}
        conversationId={conversationId}
        matchedProfile={match}
      />

      <QuickActivityModal
        visible={activityModalOpen}
        onClose={() => setActivityModalOpen(false)}
        conversationId={conversationId}
        matchedProfile={match}
      />
    </div>
  );
}
