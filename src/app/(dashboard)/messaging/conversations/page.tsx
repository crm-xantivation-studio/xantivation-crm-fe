'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input, Select, Tag, Skeleton, Form, Switch, message, Badge } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RefreshCw,
  MessageSquare,
  User,
  Building,
  Target,
  FileText,
  AlertTriangle,
  ArrowUpRight,
  Plus,
  Send,
  Link as LinkIcon
} from 'lucide-react';
import Link from 'next/link';
import { useConversations, useMatchConversationContact } from '@/hooks/api/useConversation';
import { useCreateLead } from '@/hooks/api/useLead';
import { formatVND } from '@/lib/utils';
import NativeChatWindow from './components/NativeChatWindow';
import ConversationControlPanel from './components/ConversationControlPanel';

import { ChannelLogo, FacebookIcon, TelegramIcon, ZaloIcon, WhatsAppIcon, InstagramIcon, EmailIcon, WebIcon } from '@/components/icons/SocialIcons';

export default function ConversationsPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'open' | 'pending' | 'resolved'>('open');
  const [selectedChannel, setSelectedChannel] = useState<'all' | 'telegram' | 'facebook' | 'zalo' | 'whatsapp' | 'instagram' | 'email' | 'web'>('all');
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [form] = Form.useForm();

  // Fetch conversations from NestJS proxy
  const { data: conversationsRes, isLoading: listLoading, refetch } = useConversations(activeTab);
  const conversations = conversationsRes?.data || [];

  // Channel filtering
  const filteredConversations = conversations.filter((conv: any) => {
    if (selectedChannel === 'all') return true;
    const ch = (conv.channel_type || conv.meta?.channel || conv.inbox?.channel_type || '').toLowerCase();
    if (selectedChannel === 'telegram') return ch.includes('telegram');
    if (selectedChannel === 'facebook') return ch.includes('facebook') || ch.includes('messenger');
    if (selectedChannel === 'zalo') return ch.includes('zalo');
    if (selectedChannel === 'whatsapp') return ch.includes('whatsapp');
    if (selectedChannel === 'instagram') return ch.includes('instagram');
    if (selectedChannel === 'email') return ch.includes('email') || ch.includes('mail');
    if (selectedChannel === 'web') return ch.includes('web') || ch.includes('widget') || ch.includes('api');
    return true;
  });

  const getChannelIcon = (channelType?: string) => {
    return <ChannelLogo channel={channelType} size={15} />;
  };

  // Active contact info
  const activeContact = selectedConversation?.contact;
  const searchEmail = activeContact?.email || '';
  const searchPhone = activeContact?.phoneNumber || '';

  // Matches CRM Profile
  const { data: matchRes, isLoading: matchLoading, refetch: refetchMatch } = useMatchConversationContact({
    email: searchEmail,
    phone: searchPhone,
  });
  const match = matchRes?.data;

  // Lead quick create mutation
  const createLeadMutation = useCreateLead();

  useEffect(() => {
    if (conversations.length > 0 && !selectedConversation) {
      setSelectedConversation(conversations[0]);
    }
  }, [conversations, selectedConversation]);

  // Set default values when contact changes
  useEffect(() => {
    if (activeContact) {
      form.setFieldsValue({
        name: activeContact.name || '',
        email: activeContact.email || '',
        phone: activeContact.phoneNumber || '',
        company: '',
        budgetApproved: false,
        authorityMarker: false,
        need: '',
        timeline: '',
      });
      setQuickCreateOpen(false);
    }
  }, [activeContact, form]);

  const handleRefresh = async () => {
    await refetch();
    if (selectedConversation) {
      refetchMatch();
    }
    message.success('Conversation list updated');
  };

  const handleQuickCreateLead = async (values: any) => {
    try {
      await createLeadMutation.mutateAsync({
        name: values.name,
        companyName: values.company || undefined,
        email: values.email || undefined,
        phone: values.phone || undefined,
        budgetApproved: values.budgetApproved,
        authorityMarker: values.authorityMarker,
        need: values.need || undefined,
        timeline: values.timeline || undefined,
        source: 'CHATWOOT' as any,
      });
      refetchMatch();
      setQuickCreateOpen(false);
    } catch (err) {
      // Handled by mutation toast
    }
  };

  // Build embedded Chatwoot URL
  const chatwootBase = process.env.NEXT_PUBLIC_CHATWOOT_IFRAME_URL || 'http://localhost:3003';
  const chatwootUrl = selectedConversation
    ? `${chatwootBase}/app/accounts/1/inbox/1/conversations/${selectedConversation.id}`
    : `${chatwootBase}/app/accounts/1/inbox/1`;

  return (
    <div className="h-full w-full flex overflow-hidden">
      {/* Column 1: Conversations List Sidebar */}
      <div className="w-80 flex flex-col bg-[var(--color-bg)] border-r border-[var(--color-border)] shrink-0">
        {/* Sidebar Header (merged page header) */}
        <div className="p-4 border-b border-[var(--color-border)] space-y-3 shrink-0">
          <div className="flex justify-between items-center">
            <h1 className="text-lg font-bold text-[var(--color-fg)]">Inbox</h1>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-1.5 p-1.5 rounded hover:bg-[var(--color-surface)] text-[var(--color-muted-fg)] hover:text-[var(--color-fg)] transition-all cursor-pointer"
            >
              <RefreshCw size={14} className={listLoading ? 'animate-spin' : ''} />
            </button>
          </div>
          
          {/* Status Tabs header */}
          <div className="flex gap-1 bg-[var(--color-surface)]/50 p-1 rounded-lg">
            {(['open', 'pending', 'resolved'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setSelectedConversation(null);
                }}
                className={`flex-1 py-1 text-[11px] font-bold rounded uppercase transition-all cursor-pointer ${
                  activeTab === tab
                    ? 'bg-white border border-[var(--color-border)] text-indigo-600 shadow-sm'
                    : 'text-[var(--color-muted-fg)] hover:text-[var(--color-fg)]'
                }`}
              >
                {tab === 'open' ? t('conversations.open') : tab === 'pending' ? t('conversations.pending') : t('conversations.closed')}
              </button>
            ))}
          </div>
        </div>

        {/* Platform Channel Filter Pills */}
        <div className="flex border-b border-[var(--color-border)]/40 p-2 gap-1 overflow-x-auto shrink-0 bg-[var(--color-surface)]/10">
          {[
            { id: 'all', label: 'Tất cả', icon: null },
            { id: 'telegram', label: 'Telegram', icon: <TelegramIcon size={12} /> },
            { id: 'facebook', label: 'Facebook', icon: <FacebookIcon size={12} /> },
            { id: 'zalo', label: 'Zalo', icon: <ZaloIcon size={12} /> },
            { id: 'whatsapp', label: 'WhatsApp', icon: <WhatsAppIcon size={12} /> },
            { id: 'instagram', label: 'Instagram', icon: <InstagramIcon size={12} /> },
            { id: 'email', label: 'Email', icon: <EmailIcon size={12} /> },
            { id: 'web', label: 'Web', icon: <WebIcon size={12} /> },
          ].map((ch) => (
            <button
              key={ch.id}
              onClick={() => setSelectedChannel(ch.id as any)}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold rounded-full transition-all cursor-pointer shrink-0 ${
                selectedChannel === ch.id
                  ? 'bg-[var(--color-accent)] text-white shadow-sm'
                  : 'text-[var(--color-muted-fg)] hover:text-[var(--color-fg)] hover:bg-[var(--color-surface)] border border-[var(--color-border)]/40'
              }`}
            >
              {ch.icon}
              <span>{ch.label}</span>
            </button>
          ))}
        </div>

        {/* Conversations listing */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {listLoading ? (
            Array(4)
              .fill(null)
              .map((_, i) => (
                <div key={i} className="p-3 bg-[var(--color-surface)]/40 rounded-xl space-y-2 border border-transparent">
                  <Skeleton.Input active size="small" style={{ width: '60%' }} />
                  <Skeleton.Input active size="small" style={{ width: '85%' }} />
                </div>
              ))
          ) : filteredConversations.length === 0 ? (
            <div className="text-center py-8 text-[var(--color-muted-fg)] flex flex-col items-center justify-center space-y-2">
              <MessageSquare size={24} className="stroke-1 text-[var(--color-muted-fg)]/60" />
              <span className="text-xs">{t('conversations.noConversations')}</span>
            </div>
          ) : (
            filteredConversations.map((conv: any) => {
              const isSelected = selectedConversation?.id === conv.id;
              const lastMsg = conv.messages?.[conv.messages.length - 1];
              return (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer flex flex-col justify-between space-y-1.5 hover-action ${
                    isSelected
                      ? 'bg-[var(--color-surface)] border-[var(--color-border)] shadow-sm'
                      : 'bg-transparent border-transparent hover:bg-[var(--color-surface)]/50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5 min-w-0 mr-2">
                      <span className="text-xs font-bold text-[var(--color-fg)] truncate">
                        {conv.contact?.name || conv.meta?.sender?.name || t('conversations.anonymous')}
                      </span>
                      {getChannelIcon(conv.channel_type || conv.meta?.channel)}
                    </div>
                    {conv.unreadCount > 0 && (
                      <Badge count={conv.unreadCount} size="small" className="font-mono" />
                    )}
                  </div>
                  {(lastMsg || conv.last_non_activity_message) && (
                    <p className="text-[10px] text-[var(--color-muted-fg)] truncate">
                      {lastMsg?.content || conv.last_non_activity_message?.content}
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Column 2: Native React Chat Window */}
      <div className="flex-1 flex flex-col relative bg-[var(--color-bg-tint)]">
        <NativeChatWindow conversation={selectedConversation} onRefresh={refetch} />
      </div>

      {/* Column 3: Conversation Control Panel */}
      <div className="w-80 flex flex-col bg-[var(--color-bg)] border-l border-[var(--color-border)] overflow-y-auto shrink-0 p-4">
        <ConversationControlPanel
          conversation={selectedConversation}
          onRefresh={handleRefresh}
        />
      </div>
    </div>
  );
}
