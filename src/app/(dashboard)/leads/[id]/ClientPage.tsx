'use client';

import React, { useState, use } from 'react';
import { Button, Steps, Select, Modal, Progress, message, Spin } from 'antd';
import { useLead, useConvertLead, useAddLeadActivity, useLeadActivities, useUpdateLead, useDeleteLead, useAutoQualifyLead } from '@/hooks/api/useLead';
import { User, Briefcase, Mail, Phone, Calendar, Plus, ArrowRight, UserCheck, Bot, FileText, AlertTriangle, Trash2 } from 'lucide-react';
import { FloatingInput } from '@/components/FloatingInput';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

interface ActivityItem {
  id: string;
  type: 'CALL' | 'EMAIL' | 'MEETING' | 'NOTE';
  description: string;
  createdAt: string;
}

export default function LeadDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t } = useTranslation();

  const { data: leadResponse, isLoading: isLeadLoading } = useLead(id);
  const { data: activitiesResponse } = useLeadActivities(id);
  const convertMutation = useConvertLead(id);
  const addActivityMutation = useAddLeadActivity(id);
  const updateMutation = useUpdateLead();
  const deleteLeadMutation = useDeleteLead();
  const autoQualifyMutation = useAutoQualifyLead(id);
  
  const rawLead = leadResponse?.data;
  const lead = rawLead ? {
    id: rawLead.id,
    leadCode: rawLead.leadCode,
    firstName: rawLead.firstName || '',
    lastName: rawLead.lastName || rawLead.name || '',
    company: rawLead.companyName || rawLead.company || '',
    email: rawLead.email || '',
    phone: rawLead.phone || '',
    source: rawLead.source,
    status: rawLead.status,
    owner: rawLead.assignedTo?.name || rawLead.owner?.name || 'System Admin',
    createdAt: rawLead.createdAt ? rawLead.createdAt.substring(0, 10) : '',
    bantScore: Number(rawLead.bantScore) || 0,
    budget: Number(rawLead.budget) || 0,
    serviceInterest: rawLead.serviceInterest || 'WEBSITE',
    need: rawLead.need || '',
    timeline: rawLead.timeline || '',
    aiScore: rawLead.aiScore !== undefined && rawLead.aiScore !== null ? Number(rawLead.aiScore) : null,
    aiScoreData: rawLead.aiScoreData || null,
    aiScoredAt: rawLead.aiScoredAt || null,
  } : undefined;

  const rawActivities = activitiesResponse?.data || [];
  const activities = rawActivities.map((act: any) => ({
    id: act.id,
    type: act.type,
    description: act.description,
    createdAt: act.createdAt ? act.createdAt.replace('T', ' ').substring(0, 16) : '',
  }));

  const [activeSubTab, setActiveSubTab] = useState('overview');
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [actType, setActType] = useState<'CALL' | 'EMAIL' | 'MEETING' | 'NOTE'>('NOTE');
  const [actDescription, setActDescription] = useState('');

  // Conversion Wizard State
  const [convertStep, setConvertStep] = useState(0);
  const [clientType, setClientType] = useState('BUSINESS');
  const [companyName, setCompanyName] = useState('');
  const [taxCode, setTaxCode] = useState('');
  const [opportunityAmount, setOpportunityAmount] = useState('');
  const [expectedCloseDate, setExpectedCloseDate] = useState('2026-09-30');
  const [serviceInterest, setServiceInterest] = useState('WEBSITE');

  // Duplicate Check Modal State
  const [duplicateWarningOpen, setDuplicateWarningOpen] = useState(false);
  const [duplicateContact, setDuplicateContact] = useState<any>(null);

  React.useEffect(() => {
    if (lead) {
      setCompanyName(lead.company || '');
      setOpportunityAmount(String(lead.budget || ''));
      setServiceInterest(lead.serviceInterest || 'WEBSITE');
    }
  }, [lead]);

  if (isLeadLoading) {
    return (
      <div className="p-12 flex justify-center items-center h-96">
        <Spin size="large" tip={t('leads.loading')} />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="p-8 text-center text-red-500 font-bold">
        {t('leads.notFound')}
      </div>
    );
  }

  const handleAddActivity = () => {
    if (!actDescription.trim()) return;
    addActivityMutation.mutate(
      { type: actType, notes: actDescription },
      {
        onSuccess: () => {
          setActDescription('');
          setActivityModalOpen(false);
        },
      }
    );
  };

  const handleConvertSubmit = (linkContactId?: string, forceCreate?: boolean) => {
    const payload: any = {
      clientType,
      companyName,
      taxCode,
      opportunityAmount: Number(opportunityAmount) || 0,
      expectedCloseDate,
      serviceInterest,
    };
    if (linkContactId) {
      payload.linkContactId = linkContactId;
    }
    if (forceCreate) {
      payload.forceCreate = true;
    }

    const hide = message.loading(t('leads.converting'), 0);
    convertMutation.mutate(payload, {
      onSuccess: (res: any) => {
        hide();
        if (res.data?.isDuplicate) {
          setDuplicateContact(res.data.duplicateRecord);
          setDuplicateWarningOpen(true);
        } else {
          message.success(t('leads.convertedSuccess'));
          setConvertStep(2);
          setDuplicateWarningOpen(false);
        }
      },
      onError: (err: any) => {
        hide();
        message.error(err.response?.data?.message || t('leads.conversionFailed'));
      }
    });
  };

  const handleAutoQualify = () => {
    const hide = message.loading(t('leads.analyzingBant'), 0);
    autoQualifyMutation.mutate(undefined, {
      onSuccess: () => {
        hide();
      },
      onError: () => {
        hide();
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Breadcrumbs & Title */}
      <div className="flex justify-between items-start shrink-0">
        <div>
          <div className="text-xs text-[var(--color-muted-fg)] flex items-center gap-1.5 mb-2 font-mono">
            <Link href="/leads" className="hover:underline">{t('leads.breadcrumbLeads')}</Link>
            <span>&gt;</span>
            <span className="text-[var(--color-fg)] font-semibold">{lead.leadCode}</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--color-fg)]">
            {lead.firstName} {lead.lastName}
          </h1>
          <p className="text-sm text-[var(--color-muted-fg)]">{t('leads.refCode')} {lead.leadCode} • {t('leads.from')} {lead.source}</p>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            lead.status === 'QUALIFIED' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'
          }`}>
            {t('leads.status')} {lead.status}
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* Left Side: Sub Tabs & Content (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Sub Navigation */}
          <div className="flex border-b border-[var(--color-border)] gap-6 pb-px">
            {[
              { id: 'overview', name: t('leads.tabOverview') },
              { id: 'activity', name: t('leads.tabActivityLog') },
              { id: 'convert', name: t('leads.tabConvert') },
              { id: 'ai-insights', name: t('leads.tabAiInsights') },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`pb-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                  activeSubTab === tab.id
                    ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
                    : 'border-transparent text-[var(--color-muted-fg)] hover:text-[var(--color-fg)]'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>

          {/* Sub Tab Bodies */}
          <div className="bg-[var(--color-bg-tint)] border border-[var(--color-border)] rounded-2xl p-6 min-h-[300px]">
            {activeSubTab === 'overview' && (
              <div className="space-y-8">
                {/* Contact Card */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-xs font-mono uppercase tracking-widest text-[var(--color-muted-fg)]">
                      {t('leads.contactDetails')}
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2.5 text-sm">
                        <User size={16} className="text-[var(--color-muted-fg)]" />
                        <span className="text-[var(--color-fg)] font-medium">
                          {lead.firstName} {lead.lastName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5 text-sm">
                        <Mail size={16} className="text-[var(--color-muted-fg)]" />
                        <span className="text-[var(--color-fg)] font-mono">{lead.email}</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-sm">
                        <Phone size={16} className="text-[var(--color-muted-fg)]" />
                        <span className="text-[var(--color-fg)] font-mono">{lead.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-mono uppercase tracking-widest text-[var(--color-muted-fg)]">
                      {t('leads.companyInfo')}
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2.5 text-sm">
                        <Briefcase size={16} className="text-[var(--color-muted-fg)]" />
                        <span className="text-[var(--color-fg)] font-medium">{lead.company}</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-sm">
                        <Calendar size={16} className="text-[var(--color-muted-fg)]" />
                        <span className="text-[var(--color-muted-fg)]">{t('leads.created')} {lead.createdAt}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* BANT summary */}
                <div className="pt-6 border-t border-[var(--color-border)]/50 space-y-4">
                  <h3 className="text-xs font-mono uppercase tracking-widest text-[var(--color-muted-fg)]">
                    {t('leads.bantParameters')}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-xs bg-[var(--color-surface)]/30 p-4 border border-[var(--color-border)]/50 rounded-xl">
                    <div>
                      <p className="text-[10px] uppercase font-mono text-[var(--color-muted-fg)] mb-1">{t('leads.budgetApproved')}</p>
                      <span className={`font-semibold ${lead.bantScore >= 50 ? 'text-green-500' : 'text-gray-500'}`}>
                        {lead.bantScore >= 50 ? t('leads.yes') : t('leads.no')}
                      </span>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-mono text-[var(--color-muted-fg)] mb-1">{t('leads.authorityConfirmed')}</p>
                      <span className={`font-semibold ${lead.bantScore >= 75 ? 'text-green-500' : 'text-gray-500'}`}>
                        {lead.bantScore >= 75 ? t('leads.yes') : t('leads.no')}
                      </span>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-mono text-[var(--color-muted-fg)] mb-1">{t('leads.statedNeed')}</p>
                      <span className="font-semibold text-[var(--color-fg)] truncate block">{lead.need || t('leads.none')}</span>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-mono text-[var(--color-muted-fg)] mb-1">{t('leads.targetTimeline')}</p>
                      <span className="font-semibold text-[var(--color-fg)]">{lead.timeline || t('leads.none')}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSubTab === 'activity' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-semibold text-[var(--color-fg)]">{t('leads.interactionTimeline')}</h3>
                  <Button type="primary" onClick={() => setActivityModalOpen(true)} className="flex items-center gap-2 h-9 px-4 rounded-xl cursor-pointer">
                    <Plus size={14} />
                    <span>{t('leads.addActivity')}</span>
                  </Button>
                </div>

                <div className="space-y-6 pt-4 border-l-2 border-[var(--color-border)] ml-3 pl-6">
                  {activities.map((act) => (
                    <div key={act.id} className="relative space-y-1">
                      <span className="absolute -left-[31px] top-0 bg-[var(--color-accent)] text-white p-1 rounded-full text-[8px] font-bold w-4 h-4 flex items-center justify-center">
                        {act.type[0]}
                      </span>
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-xs text-[var(--color-fg)]">{t('leads.activityLogged', { type: act.type })}</span>
                        <span className="text-[10px] font-mono text-[var(--color-muted-fg)]">{act.createdAt}</span>
                      </div>
                      <p className="text-xs text-[var(--color-muted-fg)]">{act.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSubTab === 'convert' && (
              <div className="space-y-6">
                <h3 className="text-sm font-semibold text-[var(--color-fg)]">{t('leads.leadConversionWizard')}</h3>

                <Steps
                  current={convertStep}
                  items={[
                    { title: t('leads.stepCustomerProfile') },
                    { title: t('leads.stepOpportunityScope') },
                    { title: t('leads.stepCompleted') },
                  ]}
                  className="pb-4"
                />

                {convertStep === 0 && (
                  <div className="space-y-6 pt-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted-fg)]">
                        {t('leads.clientType')}
                      </label>
                      <Select
                        value={clientType}
                        onChange={setClientType}
                        options={[
                          { value: 'BUSINESS', label: t('leads.optionB2B') },
                          { value: 'INDIVIDUAL', label: t('leads.optionB2C') },
                        ]}
                        className="w-full h-11"
                      />
                    </div>
                    {clientType === 'BUSINESS' && (
                      <>
                        <FloatingInput label={t('leads.companyAccountName')} value={companyName} onChange={setCompanyName} required />
                        <FloatingInput label={t('leads.taxCodeOptional')} value={taxCode} onChange={setTaxCode} />
                      </>
                    )}
                    <div className="flex justify-end pt-4">
                      <Button type="primary" onClick={() => setConvertStep(1)} className="flex items-center gap-1.5 h-10 px-5 rounded-xl cursor-pointer">
                        <span>{t('leads.next')}</span>
                        <ArrowRight size={14} />
                      </Button>
                    </div>
                  </div>
                )}

                {convertStep === 1 && (
                  <div className="space-y-6 pt-4">
                    <FloatingInput label={t('leads.estimatedAmount')} type="number" value={opportunityAmount} onChange={setOpportunityAmount} required />
                    <FloatingInput label={t('leads.expectedCloseDate')} value={expectedCloseDate} onChange={setExpectedCloseDate} required />

                    <div className="flex flex-col gap-2 pt-2">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted-fg)]">
                        {t('leads.serviceInterest')}
                      </label>
                      <Select
                        value={serviceInterest}
                        onChange={setServiceInterest}
                        options={[
                          { value: 'WEBSITE', label: t('leads.optionWebsite') },
                          { value: 'APP_MVP', label: t('leads.optionAppMvp') },
                          { value: 'BRANDING', label: t('leads.optionBranding') },
                          { value: 'UI_UX', label: t('leads.optionUiUx') },
                          { value: 'CUSTOM', label: t('leads.optionCustom') },
                        ]}
                        className="w-full h-11"
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                      <Button onClick={() => setConvertStep(0)} className="rounded-xl">{t('leads.back')}</Button>
                      <Button type="primary" onClick={() => handleConvertSubmit()} className="flex items-center gap-2 h-10 px-5 rounded-xl cursor-pointer">
                        <UserCheck size={16} />
                        <span>{t('leads.convertLead')}</span>
                      </Button>
                    </div>
                  </div>
                )}

                {convertStep === 2 && (
                  <div className="pt-6 text-center space-y-4">
                    <div className="p-3 bg-green-500/10 text-green-500 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
                      <UserCheck size={24} />
                    </div>
                    <h4 className="font-bold text-lg text-[var(--color-fg)]">{t('leads.leadConvertedSuccess')}</h4>
                    <p className="text-xs text-[var(--color-muted-fg)] max-w-sm mx-auto">
                      {t('leads.convertSuccessMsg')}
                    </p>
                    <div className="pt-4 flex justify-center gap-3">
                      <Link href="/customers">
                        <Button className="rounded-xl">{t('leads.goToCustomers')}</Button>
                      </Link>
                      <Link href="/opportunities">
                        <Button type="primary" className="rounded-xl">{t('leads.goToOpportunities')}</Button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeSubTab === 'ai-insights' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-semibold text-[var(--color-fg)]">{t('leads.aiBantScoreInsights')}</h3>
                  <Button 
                    type="primary" 
                    onClick={handleAutoQualify} 
                    loading={autoQualifyMutation.isPending}
                    className="flex items-center gap-2 h-9 px-4 rounded-xl cursor-pointer bg-[var(--color-accent)]"
                  >
                    <Bot size={14} />
                    <span>{t('leads.autoQualify')}</span>
                  </Button>
                </div>

                {lead.aiScore !== null ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start pt-4">
                    <div className="space-y-4 text-xs">
                      <div className="flex justify-between items-center">
                        <span>{t('leads.overallAiQualityScore')}</span>
                        <span className="font-mono font-bold text-base text-[var(--color-accent)]">{lead.aiScore * 10}%</span>
                      </div>
                      <Progress percent={lead.aiScore * 10} status="active" strokeColor="#4F46E5" />

                      <div className="grid grid-cols-2 gap-3 mt-4">
                        <div className="p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl">
                          <p className="text-[10px] text-[var(--color-muted-fg)] font-mono uppercase">{t('leads.budget')}</p>
                          <p className="text-sm font-bold text-[var(--color-fg)] mt-1">{lead.aiScoreData?.budget || 0}/10</p>
                        </div>
                        <div className="p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl">
                          <p className="text-[10px] text-[var(--color-muted-fg)] font-mono uppercase">{t('leads.authority')}</p>
                          <p className="text-sm font-bold text-[var(--color-fg)] mt-1">{lead.aiScoreData?.authority || 0}/10</p>
                        </div>
                        <div className="p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl">
                          <p className="text-[10px] text-[var(--color-muted-fg)] font-mono uppercase">{t('leads.need')}</p>
                          <p className="text-sm font-bold text-[var(--color-fg)] mt-1">{lead.aiScoreData?.need || 0}/10</p>
                        </div>
                        <div className="p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl">
                          <p className="text-[10px] text-[var(--color-muted-fg)] font-mono uppercase">{t('leads.timeline')}</p>
                          <p className="text-sm font-bold text-[var(--color-fg)] mt-1">{lead.aiScoreData?.timeline || 0}/10</p>
                        </div>
                      </div>

                      <div className="p-4 bg-[var(--color-surface)]/50 border border-[var(--color-border)] rounded-xl space-y-2 mt-4 font-sans">
                        <p className="font-semibold text-[var(--color-fg)] flex items-center gap-1.5">
                          <Bot size={12} className="text-[var(--color-accent)]" />
                          <span>{t('leads.aiRecommendation')}</span>
                        </p>
                        <p className="text-[11px] text-[var(--color-muted-fg)] leading-relaxed">
                          {lead.aiScoreData?.recommendation || t('leads.noRecommendation')}
                        </p>
                        {lead.aiScoredAt && (
                          <p className="text-[9px] text-[var(--color-muted-fg)] font-mono pt-1">
                            {t('leads.evaluatedAt')} {new Date(lead.aiScoredAt).toLocaleString('vi-VN')}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="p-5 bg-[var(--color-surface)]/20 border border-[var(--color-border)]/50 rounded-2xl flex flex-col gap-3 justify-center min-h-[160px] text-center text-[var(--color-muted-fg)] text-xs font-mono">
                      <FileText size={32} className="mx-auto text-[var(--color-accent)]/50" />
                      <span>{t('leads.faissMatches', { count: 3 })}</span>
                      <span className="text-[10px] text-[var(--color-muted-fg)]">{t('leads.readyToConvert')}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 space-y-3 bg-[var(--color-surface)]/10 border border-dashed border-[var(--color-border)] rounded-xl">
                    <Bot size={40} className="mx-auto text-[var(--color-muted-fg)]/40" />
                    <p className="text-xs text-[var(--color-muted-fg)]">{t('leads.notEvaluated')}</p>
                    <Button onClick={handleAutoQualify} loading={autoQualifyMutation.isPending} className="h-9 px-4 rounded-xl cursor-pointer">
                      {t('leads.evaluateNow')}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Sidebar Actions (1 col) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-[var(--color-bg-tint)] border border-[var(--color-border)] rounded-lg p-6 min-h-[400px]">
            <h3 className="text-xs font-mono uppercase tracking-widest text-[var(--color-muted-fg)]">
              {t('leads.leadControlPanel')}
            </h3>

            {/* Change Status */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted-fg)]">
                {t('leads.leadStatus')}
              </label>
              <Select
                value={lead.status}
                onChange={(val) => {
                  updateMutation.mutate({ id, dto: { status: val as any } });
                }}
                options={[
                  { value: 'NEW', label: t('leads.optionNew') },
                  { value: 'CONTACTED', label: t('leads.optionContacted') },
                  { value: 'QUALIFIED', label: t('leads.optionQualified') },
                  { value: 'UNQUALIFIED', label: t('leads.optionUnqualified') },
                ]}
                className="w-full h-10"
              />
            </div>

            {/* Change Owner */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted-fg)]">
                {t('leads.leadOwner')}
              </label>
              <Select
                value={lead.owner}
                onChange={(val) => {
                  updateMutation.mutate({ id, dto: { assignedToId: val } });
                }}
                options={[
                  { value: 'System Admin', label: t('leads.ownerSystemAdmin') },
                  { value: 'Jane Smith', label: t('leads.ownerJaneSmith') },
                  { value: 'John Doe', label: t('leads.ownerJohnDoe') },
                ]}
                className="w-full h-10"
              />
            </div>

            {/* Delete Option */}
            <div className="pt-4 border-t border-[var(--color-border)]/50">
              <Button
                danger
                onClick={() => {
                  Modal.confirm({
                    title: t('leads.confirmDeleteTitle'),
                    content: t('leads.confirmDeleteContent'),
                    okText: t('leads.delete'),
                    cancelText: t('leads.cancel'),
                    okButtonProps: { danger: true },
                    onOk: () => {
                      deleteLeadMutation.mutate(id, {
                        onSuccess: () => {
                          window.location.href = '/leads';
                        },
                      });
                    },
                  });
                }}
                className="w-full flex items-center justify-center gap-2 h-10 rounded-xl cursor-pointer"
              >
                <Trash2 size={16} />
                <span>{t('leads.deleteLead')}</span>
              </Button>
            </div>
          </div>
        </div>

      </div>

      {/* Activity Creation Modal */}
      <Modal
        title={t('leads.logActivity')}
        open={activityModalOpen}
        onCancel={() => setActivityModalOpen(false)}
        onOk={handleAddActivity}
        okText={t('leads.logActivityOk')}
        cancelText={t('leads.cancel')}
      >
        <div className="space-y-4 pt-4">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted-fg)]">{t('leads.activityType')}</label>
            <Select
              value={actType}
              onChange={setActType}
              options={[
                { value: 'NOTE', label: t('leads.optionNote') },
                { value: 'CALL', label: t('leads.optionCall') },
                { value: 'EMAIL', label: t('leads.optionEmail') },
                { value: 'MEETING', label: t('leads.optionMeeting') },
              ]}
              className="h-10"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted-fg)]">{t('leads.descriptionDetails')}</label>
            <textarea
              value={actDescription}
              onChange={(e) => setActDescription(e.target.value)}
              className="w-full h-24 p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-fg)] focus:outline-none"
              placeholder={t('leads.activityPlaceholder')}
            />
          </div>
        </div>
      </Modal>

      {/* Duplicate Warning Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-amber-500 font-bold">
            <AlertTriangle size={18} />
            <span>{t('leads.duplicateDetected')}</span>
          </div>
        }
        open={duplicateWarningOpen}
        onCancel={() => setDuplicateWarningOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setDuplicateWarningOpen(false)}>
            {t('leads.cancel')}
          </Button>,
          <Button
            key="force"
            onClick={() => handleConvertSubmit(undefined, true)}
            loading={convertMutation.isPending}
          >
            {t('leads.skipDuplicate')}
          </Button>,
          <Button
            key="link"
            type="primary"
            onClick={() => handleConvertSubmit(duplicateContact?.id)}
            loading={convertMutation.isPending}
          >
            {t('leads.linkToExisting')}
          </Button>,
        ]}
      >
        <div className="space-y-3 pt-2 text-xs">
          <p className="text-[var(--color-muted-fg)] leading-relaxed">
            {t('leads.duplicateDescription')}
          </p>
          <div className="p-3.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl space-y-1.5 font-mono text-[11px]">
            <p><strong>{t('leads.name')}</strong> {duplicateContact?.name}</p>
            <p><strong>{t('leads.email')}</strong> {duplicateContact?.email}</p>
            <p><strong>{t('leads.phone')}</strong> {duplicateContact?.phone}</p>
            <p><strong>{t('leads.customerAccount')}</strong> {duplicateContact?.customerName || t('leads.notAvailable')}</p>
          </div>
          <p className="text-[var(--color-muted-fg)]">
            {t('leads.linkOrCreateDescription')}
          </p>
        </div>
      </Modal>
    </div>
  );
}
