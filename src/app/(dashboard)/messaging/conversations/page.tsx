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

export default function ConversationsPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'open' | 'pending' | 'resolved'>('open');
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [form] = Form.useForm();

  // Fetch conversations from NestJS proxy
  const { data: conversationsRes, isLoading: listLoading, refetch } = useConversations(activeTab);
  const conversations = conversationsRes?.data || [];

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
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--color-fg)]">{t('conversations.title')}</h1>
          <p className="text-sm text-[var(--color-muted-fg)]">{t('conversations.subtitle')}</p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-surface)] text-[var(--color-muted-fg)] hover:text-[var(--color-fg)] transition-all cursor-pointer"
        >
          <RefreshCw size={12} className={listLoading ? 'animate-spin' : ''} />
          <span>{t('conversations.syncInbox')}</span>
        </button>
      </div>

      {/* 4-column Bento Grid Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
        {/* Column 1: Conversations List Sidebar */}
        <div className="lg:col-span-1 bg-[var(--color-bg-tint)] border border-[var(--color-border)] rounded-2xl flex flex-col min-h-0 overflow-hidden">
          {/* Tabs header */}
          <div className="flex border-b border-[var(--color-border)] p-2 gap-1 bg-[var(--color-surface)]/20 shrink-0">
            {(['open', 'pending', 'resolved'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setSelectedConversation(null);
                }}
                className={`flex-1 py-1.5 text-[11px] font-mono uppercase tracking-wider font-bold rounded-lg transition-all cursor-pointer ${
                  activeTab === tab
                    ? 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-accent)] shadow-sm'
                    : 'text-[var(--color-muted-fg)] hover:text-[var(--color-fg)]'
                }`}
              >
                {tab === 'open' ? t('conversations.open') : tab === 'pending' ? t('conversations.pending') : t('conversations.closed')}
              </button>
            ))}
          </div>

          {/* Conversations listing */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {listLoading ? (
              Array(4)
                .fill(null)
                .map((_, i) => (
                  <div key={i} className="p-3 bg-[var(--color-surface)]/40 rounded-xl space-y-2 border border-[var(--color-border)]/50">
                    <Skeleton.Input active size="small" style={{ width: '60%' }} />
                    <Skeleton.Input active size="small" style={{ width: '85%' }} />
                  </div>
                ))
            ) : conversations.length === 0 ? (
              <div className="text-center py-8 text-[var(--color-muted-fg)] flex flex-col items-center justify-center space-y-2">
                <MessageSquare size={24} className="stroke-1 text-[var(--color-muted-fg)]/60" />
                <span className="text-xs">{t('conversations.noConversations')}</span>
              </div>
            ) : (
              conversations.map((conv: any) => {
                const isSelected = selectedConversation?.id === conv.id;
                const lastMsg = conv.messages?.[conv.messages.length - 1];
                return (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-1.5 hover-action ${
                      isSelected
                        ? 'bg-[var(--color-surface)] border-[var(--color-accent)] shadow-sm'
                        : 'bg-[var(--color-surface)]/50 border-[var(--color-border)] hover:border-[var(--color-border-hover)]'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-[var(--color-fg)] truncate mr-2">
                        {conv.contact?.name || t('conversations.anonymous')}
                      </span>
                      {conv.unreadCount > 0 && (
                        <Badge count={conv.unreadCount} size="small" className="font-mono" />
                      )}
                    </div>
                    {lastMsg && (
                      <p className="text-[10px] text-[var(--color-muted-fg)] truncate">
                        {lastMsg.content}
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Column 2 & 3: Main Chatwoot Embedded Panel */}
        <div className="lg:col-span-2 bg-[var(--color-bg-tint)] border border-[var(--color-border)] rounded-2xl overflow-hidden flex flex-col relative">
          <iframe
            src={chatwootUrl}
            className="w-full flex-1 border-none"
            title="Chatwoot Conversations"
            allow="camera;microphone;clipboard-read;clipboard-write;"
          />
        </div>

        {/* Column 4: CRM Context Matcher Details */}
        <div className="lg:col-span-1 bg-[var(--color-bg-tint)] border border-[var(--color-border)] rounded-2xl p-6 flex flex-col min-h-0 overflow-y-auto">
          <div className="space-y-6 flex-1">
            <h3 className="text-xs font-mono uppercase tracking-widest text-[var(--color-muted-fg)] pb-3 border-b border-[var(--color-border)]">
              {t('conversations.crmContextMatcher')}
            </h3>

            {activeContact ? (
              <div className="space-y-6">
                {/* Chatwoot Contact Details */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-fg)] shrink-0">
                      <User size={18} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-[var(--color-fg)] truncate">
                        {activeContact.name}
                      </h4>
                      <p className="text-[10px] font-mono text-[var(--color-muted-fg)] truncate">
                        ID: {activeContact.id}
                      </p>
                    </div>
                  </div>

                  <div className="text-[11px] space-y-1 bg-[var(--color-surface)]/30 p-3 rounded-xl border border-[var(--color-border)]/50">
                    <p className="text-[var(--color-fg)]"><span className="text-[var(--color-muted-fg)]">Email:</span> {activeContact.email || 'N/A'}</p>
                    <p className="text-[var(--color-fg)]"><span className="text-[var(--color-muted-fg)]">Phone:</span> {activeContact.phoneNumber || 'N/A'}</p>
                  </div>
                </div>

                {/* CRM Matcher State */}
                <div className="pt-2">
                  {matchLoading ? (
                    <div className="space-y-2">
                      <Skeleton.Input active size="small" style={{ width: 120 }} />
                      <Skeleton active paragraph={{ rows: 3 }} />
                    </div>
                  ) : match?.matched ? (
                    <AnimatePresence mode="wait">
                      {match.type === 'lead' ? (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="space-y-4"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-500">
                              {t('conversations.matchedLead')}
                            </span>
                            <Tag color="cyan">Lead</Tag>
                          </div>

                          <div className="bg-[var(--color-surface)]/60 rounded-xl border border-[var(--color-border)] p-4 space-y-3">
                            <div>
                              <span className="text-[10px] font-mono text-[var(--color-muted-fg)]">Company</span>
                              <p className="text-xs font-semibold text-[var(--color-fg)]">
                                {match.profile?.company || 'Individual'}
                              </p>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <span className="text-[10px] font-mono text-[var(--color-muted-fg)]">Status</span>
                                <p className="text-xs font-semibold text-[var(--color-fg)] mt-0.5">
                                  {match.profile?.status}
                                </p>
                              </div>
                              <div>
                                <span className="text-[10px] font-mono text-[var(--color-muted-fg)]">BANT Score</span>
                                <p className="text-xs font-semibold text-emerald-500 mt-0.5">
                                  {match.profile?.bantScore ?? 0}/100
                                </p>
                              </div>
                            </div>

                            {(match.profile?.need || match.profile?.timeline) && (
                              <div className="border-t border-[var(--color-border)] pt-2 space-y-1.5">
                                {match.profile?.need && (
                                  <p className="text-[10px] text-[var(--color-fg)] leading-relaxed">
                                    <span className="text-[var(--color-muted-fg)]">Need:</span> {match.profile.need}
                                  </p>
                                )}
                                {match.profile?.timeline && (
                                  <p className="text-[10px] text-[var(--color-fg)]">
                                    <span className="text-[var(--color-muted-fg)]">Timeline:</span> {match.profile.timeline}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>

                          <Link href={`/leads/${match.profile?.id}`} className="block">
                            <Button
                              type="primary"
                              icon={<ArrowUpRight size={14} />}
                              className="w-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] border-none rounded-xl text-xs h-9 flex items-center justify-center cursor-pointer"
                            >
                              {t('conversations.viewLeadProfile')}
                            </Button>
                          </Link>
                        </motion.div>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="space-y-4"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-500">
                              {t('conversations.matchedCustomer')}
                            </span>
                            <Tag color="green">Customer</Tag>
                          </div>

                          <div className="bg-[var(--color-surface)]/60 rounded-xl border border-[var(--color-border)] p-4 space-y-3">
                            <div>
                              <span className="text-[10px] font-mono text-[var(--color-muted-fg)]">Customer Code</span>
                              <p className="text-xs font-mono font-semibold text-[var(--color-fg)] mt-0.5">
                                {match.profile?.code}
                              </p>
                            </div>
                            <div>
                              <span className="text-[10px] font-mono text-[var(--color-muted-fg)]">Company Name</span>
                              <p className="text-xs font-semibold text-[var(--color-fg)] mt-0.5">
                                {match.profile?.name}
                              </p>
                            </div>

                            <div className="grid grid-cols-2 gap-2 border-t border-[var(--color-border)] pt-2">
                              <div>
                                <span className="text-[10px] font-mono text-[var(--color-muted-fg)]">Region</span>
                                <p className="text-xs font-semibold text-[var(--color-fg)] mt-0.5">
                                  {match.profile?.region || '-'}
                                </p>
                              </div>
                              <div>
                                <span className="text-[10px] font-mono text-[var(--color-muted-fg)]">MST</span>
                                <p className="text-xs font-mono text-[var(--color-fg)] mt-0.5">
                                  {match.profile?.taxCode || '-'}
                                </p>
                              </div>
                            </div>
                          </div>

                          <Link href={`/customers/accounts/${match.profile?.id}`} className="block">
                            <Button
                              type="primary"
                              icon={<ArrowUpRight size={14} />}
                              className="w-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] border-none rounded-xl text-xs h-9 flex items-center justify-center cursor-pointer"
                            >
                              {t('conversations.viewCustomerProfile')}
                            </Button>
                          </Link>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      <div className="bg-rose-500/10 text-rose-500 p-3 rounded-xl border border-rose-500/20 text-xs flex gap-2 items-start">
                        <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold">{t('conversations.notLinked')}</p>
                          <p className="text-[10px] opacity-80 mt-0.5">
                            {t('conversations.notLinkedDesc')}
                          </p>
                        </div>
                      </div>

                      {!quickCreateOpen ? (
                        <Button
                          type="dashed"
                          icon={<Plus size={14} />}
                          onClick={() => setQuickCreateOpen(true)}
                          className="w-full border-[var(--color-border)] hover:border-[var(--color-accent)] text-[var(--color-fg)] rounded-xl text-xs h-9 flex items-center justify-center cursor-pointer"
                        >
                          {t('conversations.quickCreateLead')}
                        </Button>
                      ) : (
                        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-4 rounded-xl space-y-4">
                          <h4 className="text-xs font-bold text-[var(--color-fg)]">{t('conversations.createNewLead')}</h4>
                          <Form
                            form={form}
                            layout="vertical"
                            onFinish={handleQuickCreateLead}
                            className="space-y-3"
                          >
                            <Form.Item
                              name="name"
                              label={<span className="text-[10px] font-mono text-[var(--color-muted-fg)] uppercase">{t('conversations.formCustomerName')}</span>}
                              rules={[{ required: true, message: t('conversations.enterName') }]}
                              className="mb-0"
                            >
                              <Input className="text-xs rounded-lg" />
                            </Form.Item>

                            <Form.Item
                               name="company"
                               label={<span className="text-[10px] font-mono text-[var(--color-muted-fg)] uppercase">{t('conversations.formCompanyName')}</span>}
                               className="mb-0"
                             >
                               <Input className="text-xs rounded-lg" placeholder={t('conversations.naIfIndividual')} />
                             </Form.Item>

                             <Form.Item
                               name="email"
                               label={<span className="text-[10px] font-mono text-[var(--color-muted-fg)] uppercase">{t('conversations.formContactEmail')}</span>}
                               className="mb-0"
                             >
                               <Input className="text-xs rounded-lg" />
                             </Form.Item>

                             <Form.Item
                               name="phone"
                               label={<span className="text-[10px] font-mono text-[var(--color-muted-fg)] uppercase">{t('conversations.formPhoneNumber')}</span>}
                               className="mb-0"
                             >
                               <Input className="text-xs rounded-lg" />
                             </Form.Item>

                            <div className="grid grid-cols-2 gap-2">
                              <Form.Item
                                name="budgetApproved"
                                label={<span className="text-[10px] font-mono text-[var(--color-muted-fg)] uppercase">{t('conversations.formHasBudget')}</span>}
                                valuePropName="checked"
                                className="mb-0"
                              >
                                <Switch size="small" />
                              </Form.Item>

                              <Form.Item
                                name="authorityMarker"
                                label={<span className="text-[10px] font-mono text-[var(--color-muted-fg)] uppercase">{t('conversations.formHasAuthority')}</span>}
                                valuePropName="checked"
                                className="mb-0"
                              >
                                <Switch size="small" />
                              </Form.Item>
                            </div>

                            <Form.Item
                              name="need"
                              label={<span className="text-[10px] font-mono text-[var(--color-muted-fg)] uppercase">{t('conversations.formSpecificNeed')}</span>}
                              className="mb-0"
                            >
                              <Input.TextArea rows={2} className="text-xs rounded-lg" />
                            </Form.Item>

                            <div className="flex gap-2 pt-2">
                              <Button
                                size="small"
                                onClick={() => setQuickCreateOpen(false)}
                                className="flex-1 rounded-lg text-xs cursor-pointer"
                              >
                                {t('conversations.cancel')}
                              </Button>
                              <Button
                                type="primary"
                                size="small"
                                htmlType="submit"
                                loading={createLeadMutation.isPending}
                                className="flex-1 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] border-none rounded-lg text-xs cursor-pointer"
                              >
                                {t('conversations.save')}
                              </Button>
                            </div>
                          </Form>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-[var(--color-muted-fg)]">
                {t('conversations.selectConversation')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
