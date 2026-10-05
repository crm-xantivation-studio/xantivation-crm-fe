'use client';

import React, { useState, use } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Steps, Select, Modal, Progress, message, Table, Spin } from 'antd';
import { ArrowLeft, User, Calendar, Plus, Trash2, ArrowRight, UserCheck, FileText, CheckCircle2, AlertTriangle, ShieldCheck, Landmark } from 'lucide-react';
import Link from 'next/link';
import { useDeal, useConfigureMilestones, useSubmitDealReview, useApproveDeal } from '@/hooks/api/useDeal';
import { useUsers } from '@/hooks/api/useUser';
import { FloatingInput } from '@/components/FloatingInput';

interface DealMilestoneRecord {
  milestoneName: string;
  percentage: number;
  amount: number;
  dueDate: string;
  acceptanceCondition?: string;
}

interface ScopeItemRecord {
  itemName: string;
  description?: string;
  fixedPrice: number;
  estimatedEffort?: string;
  deliverables?: string;
}

export default function DealDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t } = useTranslation();
  const [activeSubTab, setActiveSubTab] = useState('overview');

  // API Queries
  const { data: dealRes, isLoading } = useDeal(id);
  const { data: usersRes } = useUsers();

  // API Mutations
  const configureMilestonesMutation = useConfigureMilestones();
  const submitReviewMutation = useSubmitDealReview();
  const approveDealMutation = useApproveDeal();

  const d = dealRes?.data as any;
  const realUsers = usersRes?.data || [];

  // Local state for Milestones configure edit
  const [milestones, setMilestones] = useState<DealMilestoneRecord[]>([]);
  const [isEditingMilestones, setIsEditingMilestones] = useState(false);

  // Review states
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');

  // Initial load of milestones once API returns data
  React.useEffect(() => {
    if (d?.milestones) {
      setMilestones(
        d.milestones.map((m: any) => ({
          milestoneName: m.milestoneName,
          percentage: Number(m.percentage) || 0,
          amount: Number(m.amount) || 0,
          dueDate: m.dueDate ? m.dueDate.substring(0, 10) : '',
          acceptanceCondition: m.acceptanceCondition || '',
        }))
      );
    }
  }, [d]);

  if (isLoading) {
    return (
      <div className="py-32 flex flex-col justify-center items-center gap-3">
        <Spin size="large" />
        <span className="text-xs text-[var(--color-muted-fg)] font-mono">{t('deals.loading')}</span>
      </div>
    );
  }

  if (!d) {
    return <div className="p-8 text-center text-red-500 font-bold">{t('deals.notFound')}</div>;
  }

  const dealTotalAmount = Number(d.dealValue) || 0;

  const handleAddMilestone = () => {
    setMilestones([
      ...milestones,
      { milestoneName: '', percentage: 0, amount: 0, dueDate: '', acceptanceCondition: '' }
    ]);
  };

  const handleRemoveMilestone = (idx: number) => {
    setMilestones(milestones.filter((_, i) => i !== idx));
  };

  const handleMilestoneFieldChange = (idx: number, field: keyof DealMilestoneRecord, val: any) => {
    const updated = [...milestones];
    if (field === 'percentage') {
      const pct = Number(val) || 0;
      updated[idx] = {
        ...updated[idx],
        percentage: pct,
        amount: Math.round(dealTotalAmount * (pct / 100))
      };
    } else {
      updated[idx] = { ...updated[idx], [field]: val };
    }
    setMilestones(updated);
  };

  const handleSaveMilestones = async () => {
    const totalPercent = milestones.reduce((sum, m) => sum + m.percentage, 0);
    if (totalPercent !== 100) {
      message.error(t('deals.errorTotalPercent', { current: totalPercent }));
      return;
    }

    if (milestones.some(m => !m.milestoneName.trim() || !m.dueDate)) {
      message.error(t('deals.errorMilestonesValidation'));
      return;
    }

    try {
      await configureMilestonesMutation.mutateAsync({
        id: d.id,
        dto: { milestones },
      });
      setIsEditingMilestones(false);
    } catch (err) {
      // Handled
    }
  };

  const handleSubmitReview = async () => {
    try {
      await submitReviewMutation.mutateAsync({
        id: d.id,
        dto: { reviewNotes },
      });
      setReviewModalOpen(false);
    } catch (err) {
      // Handled
    }
  };

  const handleApproveDeal = async () => {
    try {
      await approveDealMutation.mutateAsync(d.id);
    } catch (err) {
      // Handled
    }
  };

  // Convert stage list to index for visual Stepper
  const stagesOrder = ['DRAFT', 'INTERNAL_REVIEW', 'CUSTOMER_REVIEW', 'CLOSED_WON'];
  const currentStep = stagesOrder.indexOf(d.status === 'CLOSED_LOST' ? 'CLOSED_WON' : d.status);

  const assignedOwnerName = 'System Admin';

  const scopesColumns = [
    {
      title: t('deals.colServiceItems'),
      dataIndex: 'itemName',
      key: 'itemName',
      render: (val: string, rec: any) => (
        <div>
          <p className="font-semibold text-xs text-[var(--color-fg)]">{val}</p>
          <p className="text-[10px] text-[var(--color-muted-fg)]">{rec.description}</p>
        </div>
      )
    },
    {
      title: t('deals.colDeliverableDetails'),
      dataIndex: 'deliverables',
      key: 'deliverables',
      render: (val: string) => <span className="text-xs font-mono text-[var(--color-muted-fg)]">{val || '-'}</span>
    },
    {
      title: t('deals.colValue'),
      dataIndex: 'fixedPrice',
      key: 'fixedPrice',
      align: 'right' as const,
      render: (val: number) => <span className="font-mono font-semibold text-xs">{(Number(val) || 0).toLocaleString('vi-VN')} VND</span>
    }
  ];

  return (
    <div className="space-y-4">
      {/* Breadcrumbs & Title */}
      <div className="flex justify-between items-start shrink-0">
        <div>
          <div className="text-xs text-[var(--color-muted-fg)] flex items-center gap-1.5 mb-2 font-mono">
            <Link href="/deals" className="hover:underline">{t('deals.breadcrumbDeals')}</Link>
            <span>&gt;</span>
            <span className="text-[var(--color-fg)] font-semibold">{d.dealCode}</span>
          </div>
          <h1 className="text-base font-semibold sm: tracking-tight text-[var(--color-fg)]">
            {d.name}
          </h1>
          <p className="text-xs text-[var(--color-muted-fg)]">{t('deals.dealCode')}: {d.dealCode} • {t('deals.client')}: {d.opportunity?.account?.name}</p>
        </div>

        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            d.stage === 'CLOSED_WON' ? 'bg-green-500/10 text-green-500' :
            d.stage === 'CLOSED_LOST' ? 'bg-red-500/10 text-red-500' :
            'bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
          }`}>
            {t('deals.status')}: {d.stage}
          </span>
        </div>
      </div>

      {/* Visual Stepper */}
      {d.stage !== 'CLOSED_LOST' ? (
        <div className="bg-[var(--color-bg-tint)] border border-[var(--color-border)] p-6 rounded-[5px]">
          <Steps
            current={currentStep}
            items={[
              { title: t('deals.stepDraft'), description: t('deals.stepDescMilestones') },
              { title: t('deals.stepInternalReview'), description: t('deals.stepDescManagerApproval') },
              { title: t('deals.stepCustomerReview'), description: t('deals.stepDescDocuSign') },
              { title: t('deals.stepClosedWon'), description: t('deals.stepDescContractSigned') },
            ]}
          />
        </div>
      ) : (
        <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-xl flex items-center gap-3">
          <AlertTriangle className="text-red-500 shrink-0" size={20} />
          <div className="text-xs text-red-800 font-mono">
            <span className="font-bold uppercase block">{t('deals.closedLost')}</span>
            <span>{t('deals.reviewNotes')} {d.reviewNotes || t('deals.noNotes')}</span>
          </div>
        </div>
      )}

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex gap-6 border-b border-[var(--color-border)] pb-px">
            {[
              { id: 'overview', name: t('deals.tabOverview') },
              { id: 'milestones', name: t('deals.tabPaymentMilestoneConfig') },
              { id: 'scopes', name: t('deals.tabScopeSnapshot') },
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

          <div className="bg-[var(--color-bg-tint)] border border-[var(--color-border)] rounded-[5px] p-6 min-h-[300px]">
            {activeSubTab === 'overview' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-6 text-sm">
                  <div className="space-y-3">
                    <h3 className="text-xs font-mono uppercase tracking-widest text-[var(--color-muted-fg)]">{t('deals.commercialTerms')}</h3>
                    <div className="flex justify-between border-b border-[var(--color-border)] pb-2">
                      <span className="text-[var(--color-muted-fg)]">{t('deals.dealValue')}</span>
                      <span className="font-semibold font-mono">{(Number(d.dealValue) || 0).toLocaleString('vi-VN')} VND</span>
                    </div>
                    <div className="flex justify-between border-b border-[var(--color-border)] pb-2">
                      <span className="text-[var(--color-muted-fg)]">{t('deals.expectedStart')}</span>
                      <span className="font-semibold font-mono">{d.expectedStart ? d.expectedStart.substring(0, 10) : ''}</span>
                    </div>
                    <div className="flex justify-between border-b border-[var(--color-border)] pb-2">
                      <span className="text-[var(--color-muted-fg)]">{t('deals.paymentTermsDescription')}</span>
                      <span className="font-semibold">{d.paymentTerms || t('deals.standard')}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xs font-mono uppercase tracking-widest text-[var(--color-muted-fg)]">{t('deals.clientRepresentative')}</h3>
                    <div className="flex justify-between border-b border-[var(--color-border)] pb-2">
                      <span className="text-[var(--color-muted-fg)]">{t('deals.companyAccount')}</span>
                      <span className="font-semibold">{d.account?.name || '-'}</span>
                    </div>
                    <div className="flex justify-between border-b border-[var(--color-border)] pb-2">
                      <span className="text-[var(--color-muted-fg)]">{t('deals.representativeContact')}</span>
                      <span className="font-semibold">{d.contact ? `${d.contact.firstName || ''} ${d.contact.lastName || ''}`.trim() : '-'}</span>
                    </div>
                  </div>
                </div>

                {d.reviewNotes && (
                  <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl space-y-2">
                    <h4 className="text-xs font-mono uppercase tracking-widest text-[var(--color-muted-fg)]">{t('deals.reviewFeedbackNotes')}</h4>
                    <p className="text-xs text-[var(--color-fg)] whitespace-pre-wrap">{d.reviewNotes}</p>
                  </div>
                )}
              </div>
            )}

            {activeSubTab === 'milestones' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-semibold text-[var(--color-fg)]">{t('deals.paymentMilestonesSchedule')}</h3>
                  {d.status === 'DRAFT' && (
                    <div className="flex items-center gap-2">
                      {isEditingMilestones ? (
                        <>
                          <Button size="small" onClick={handleAddMilestone} className="text-xs rounded-lg flex items-center gap-1">
                            <Plus size={10} />
                            <span>{t('deals.addMilestone')}</span>
                          </Button>
                          <Button size="small" type="primary" onClick={handleSaveMilestones} loading={configureMilestonesMutation.isPending} className="text-xs rounded-lg">
                            {t('deals.saveConfiguration')}
                          </Button>
                        </>
                      ) : (
                        <Button size="small" onClick={() => setIsEditingMilestones(true)} className="text-xs rounded-lg">
                          {t('deals.editConfiguration')}
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {isEditingMilestones ? (
                  <div className="space-y-4">
                    {milestones.map((m, idx) => (
                      <div key={idx} className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl relative space-y-3">
                        <button
                          onClick={() => handleRemoveMilestone(idx)}
                          className="absolute top-2 right-2 text-[10px] font-semibold text-red-500 hover:underline cursor-pointer"
                        >
                          {t('deals.remove')}
                        </button>
                        <div className="grid grid-cols-4 gap-4">
                          <div className="col-span-2">
                            <FloatingInput label={t('deals.milestoneName')} value={m.milestoneName} onChange={(val) => handleMilestoneFieldChange(idx, 'milestoneName', val)} required />
                          </div>
                          <div>
                            <FloatingInput label={t('deals.percentage')} type="number" value={m.percentage ? String(m.percentage) : ''} onChange={(val) => handleMilestoneFieldChange(idx, 'percentage', Number(val))} required />
                          </div>
                          <div>
                            <FloatingInput label={t('deals.dueDate')} type="date" value={m.dueDate} onChange={(val) => handleMilestoneFieldChange(idx, 'dueDate', val)} required />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <FloatingInput label={t('deals.acceptanceCriteria')} value={m.acceptanceCondition || ''} onChange={(val) => handleMilestoneFieldChange(idx, 'acceptanceCondition', val)} />
                          <div className="flex items-center pl-2 text-xs font-mono text-[var(--color-muted-fg)] pt-4">
                            {t('deals.correspondingAmount')}: <span className="font-bold text-[var(--color-fg)] ml-1">{m.amount.toLocaleString('vi-VN')} VND</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {milestones.length === 0 && (
                      <div className="py-8 text-center text-xs text-[var(--color-muted-fg)] border border-dashed border-[var(--color-border)] rounded-xl">
                        {t('deals.noMilestonesEditing')}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3 text-xs">
                    {milestones.map((m, idx) => (
                      <div key={idx} className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl flex justify-between items-center">
                        <div className="space-y-1">
                          <p className="font-semibold text-xs text-[var(--color-fg)]">{m.milestoneName}</p>
                          <p className="text-[10px] text-[var(--color-muted-fg)]">{t('deals.due')}: {m.dueDate} • {t('deals.condition')}: {m.acceptanceCondition || t('deals.signOffAcceptance')}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-bold text-xs">{m.amount.toLocaleString('vi-VN')} VND</p>
                          <span className="px-2 py-0.5 rounded-full font-bold bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-[9px] font-mono">
                            {m.percentage}%
                          </span>
                        </div>
                      </div>
                    ))}
                    {milestones.length === 0 && (
                      <div className="py-12 text-center text-xs text-[var(--color-muted-fg)]">
                        {t('deals.noMilestonesView')}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeSubTab === 'scopes' && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-[var(--color-fg)]">{t('deals.scopeItemsDetails')}</h3>
                <Table
                  columns={scopesColumns}
                  dataSource={d.quotation?.items || []}
                  pagination={false}
                  rowKey="id"
                  className="border border-[var(--color-border)] rounded-xl overflow-hidden text-xs"
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar Control */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[var(--color-bg-tint)] border border-[var(--color-border)] rounded-[5px] p-6 space-y-6">
            <h3 className="text-xs font-mono uppercase tracking-widest text-[var(--color-muted-fg)]">
              {t('deals.dealControlPanel')}
            </h3>

            <div className="space-y-3">
              {d.status === 'DRAFT' && milestones.length > 0 && (
                <Button type="primary" onClick={() => { setReviewNotes(''); setReviewModalOpen(true); }} className="w-full flex items-center justify-center gap-1.5 h-10 rounded-xl cursor-pointer">
                  <ShieldCheck size={14} />
                  <span>{t('deals.submitForReview')}</span>
                </Button>
              )}

              {d.status === 'INTERNAL_REVIEW' && (
                <Button type="primary" onClick={handleApproveDeal} loading={approveDealMutation.isPending} className="w-full bg-green-600 hover:bg-green-700 border-green-600 flex items-center justify-center gap-1.5 h-10 rounded-xl cursor-pointer">
                  <CheckCircle2 size={14} />
                  <span>{t('deals.approve')}</span>
                </Button>
              )}
            </div>

            <div className="space-y-4 border-t border-[var(--color-border)]/50 pt-4 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-[var(--color-muted-fg)]">{t('deals.revision')}</span>
                <span className="font-semibold">v{d.quotation?.version || 1}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-muted-fg)]">{t('deals.owner')}</span>
                <span className="font-semibold">{assignedOwnerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-muted-fg)]">{t('deals.createdAt')}:</span>
                <span className="font-semibold">{d.createdAt ? d.createdAt.substring(0, 10) : ''}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Submit for Review notes modal */}
      <Modal
        title={t('deals.submitForInternalApproval')}
        open={reviewModalOpen}
        onCancel={() => setReviewModalOpen(false)}
        onOk={handleSubmitReview}
        confirmLoading={submitReviewMutation.isPending}
        okText={t('deals.submitForApproval')}
        cancelText={t('deals.cancel')}
      >
        <div className="space-y-4 pt-4">
          <p className="text-xs text-[var(--color-muted-fg)]">{t('deals.reviewModalDescription')}</p>
          <textarea
            placeholder={t('deals.reviewNotesPlaceholder')}
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            className="w-full min-h-[100px] p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-fg)] focus:outline-none"
          />
        </div>
      </Modal>
    </div>
  );
}
