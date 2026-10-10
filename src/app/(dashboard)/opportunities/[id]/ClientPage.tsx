'use client';

import React, { useState, use } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { Button, Steps, Modal, Progress, message, Spin } from 'antd';
import { User, Briefcase, Mail, Phone, Calendar, Plus, ArrowRight, UserCheck, FileText, AlertTriangle, Trash2, HelpCircle, Bot, Zap } from 'lucide-react';
import { FormSelect } from '@/components/FormSelect';
import { useOpportunity, useUpdateOpportunity, useCloseLostOpportunity, useDeleteOpportunity } from '@/hooks/api/useOpportunity';
import { useAuthStore } from '@/stores/auth.store';
import { useUsers } from '@/hooks/api/useUser';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { OpportunityStage } from '@/types/opportunity.types';

export default function OpportunityDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t } = useTranslation();
  const router = useRouter();
  const [activeSubTab, setActiveSubTab] = useState('overview');
  const [coachingNotes, setCoachingNotes] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  const handleStartCoaching = async () => {
    setCoachingNotes('');
    setIsStreaming(true);
    try {
      const token = useAuthStore.getState().accessToken;
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
      
      const response = await fetch(`${API_URL}/opportunities/${id}/coaching`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(t('opportunities.coachConnectError'));
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');
      
      if (!reader) return;

      let buffer = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;
        
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          const cleanedLine = line.trim();
          if (cleanedLine.startsWith('data:')) {
            const dataStr = cleanedLine.slice(5).trim();
            if (dataStr) {
              try {
                const parsed = JSON.parse(dataStr);
                 if (parsed && parsed.data) {
                   setCoachingNotes((prev) => prev + parsed.data);
                 } else if (parsed && typeof parsed === 'string') {
                   setCoachingNotes((prev) => prev + parsed);
                 }
              } catch (e) {
                setCoachingNotes((prev) => prev + dataStr);
              }
            }
          }
        }
      }
    } catch (error: any) {
      message.error(t('opportunities.coachConnError') + ' ' + error.message);
    } finally {
      setIsStreaming(false);
    }
  };

  // API Queries
  const { data: oppRes, isLoading } = useOpportunity(id);
  const { data: usersRes } = useUsers();

  // API Mutations
  const updateMutation = useUpdateOpportunity();
  const closeLostMutation = useCloseLostOpportunity();
  const deleteMutation = useDeleteOpportunity();

  const opp = oppRes?.data;
  const realUsers = usersRes?.data || [];

  // Modal control for Close Lost
  const [lostModalOpen, setLostModalOpen] = useState(false);
  const [lostReason, setLostReason] = useState('');

  if (isLoading) {
    return (
      <div className="py-32 flex flex-col justify-center items-center gap-3">
        <Spin size="large" />
        <span className="text-xs text-[var(--color-muted-fg)] font-mono">{t('opportunities.loading')}</span>
      </div>
    );
  }

  if (!opp) {
    return <div className="p-8 text-center text-red-500 font-bold">{t('opportunities.notFound')}</div>;
  }

  const getStageLabel = (st: string) => {
    switch (st) {
      case OpportunityStage.QUALIFICATION:
      case 'QUALIFICATION':
        return t('opportunities.stageQualification');
      case OpportunityStage.PROPOSAL:
      case 'PROPOSAL':
        return t('opportunities.stageProposal');
      case OpportunityStage.NEGOTIATION:
      case 'NEGOTIATION':
        return t('opportunities.stageNegotiation');
      case OpportunityStage.CLOSED_WON:
      case 'CLOSED_WON':
      case 'WON':
        return t('opportunities.stageWon');
      case OpportunityStage.CLOSED_LOST:
      case 'CLOSED_LOST':
      case 'LOST':
        return t('opportunities.stageLost');
      case OpportunityStage.PROSPECTING:
      case 'PROSPECTING':
        return 'Prospecting';
      default:
        return st;
    }
  };

  const handleStageChange = async (newStage: any) => {
    if (newStage === OpportunityStage.CLOSED_LOST || newStage === 'CLOSED_LOST' || newStage === 'LOST') {
      setLostReason('');
      setLostModalOpen(true);
      return;
    }

    let prob = 20;
    if (newStage === OpportunityStage.CLOSED_WON || newStage === 'CLOSED_WON' || newStage === 'WON') {
      prob = 100;
    } else if (newStage === OpportunityStage.NEGOTIATION || newStage === 'NEGOTIATION') {
      prob = 80;
    } else if (newStage === OpportunityStage.PROPOSAL || newStage === 'PROPOSAL') {
      prob = 50;
    } else if (newStage === OpportunityStage.QUALIFICATION || newStage === 'QUALIFICATION') {
      prob = 20;
    }

    try {
      await updateMutation.mutateAsync({
        id: opp.id,
        dto: {
          stage: newStage,
          probability: prob,
        },
      });
      message.success(t('opportunities.statusChanged', { stage: getStageLabel(newStage) }) || `Chuyển giai đoạn: ${getStageLabel(newStage)}`);
    } catch (err) {
      // Handled
    }
  };

  const handleConfirmLost = async () => {
    if (!lostReason.trim()) {
      message.error(t('opportunities.lostReasonRequired'));
      return;
    }

    try {
      await closeLostMutation.mutateAsync({
        id: opp.id,
        lostReason,
      });
      setLostModalOpen(false);
      message.success(t('opportunities.statusChanged', { stage: getStageLabel(OpportunityStage.CLOSED_LOST) }) || 'Đã đóng - Mất cơ hội');
    } catch (err) {
      // Handled
    }
  };

  const handleDelete = async () => {
    Modal.confirm({
      title: t('opportunities.confirmDelete'),
      content: t('opportunities.deleteWarning'),
      okText: t('opportunities.confirmDeleteBtn'),
      okType: 'danger',
      cancelText: t('opportunities.cancel'),
      onOk: async () => {
        try {
          await deleteMutation.mutateAsync(opp.id);
          router.push('/opportunities');
        } catch (err) {
          // Handled
        }
      }
    });
  };

  const handleOwnerChange = async (assignedToId: string) => {
    try {
      await updateMutation.mutateAsync({
        id: opp.id,
        dto: { assignedToId },
      });
      message.success(t('opportunities.saveChanges') || 'Cập nhật thành công');
    } catch (err) {
      // Handled
    }
  };

  // Convert stage list to index for visual Stepper
  const stagesOrder = [
    OpportunityStage.QUALIFICATION,
    OpportunityStage.PROPOSAL,
    OpportunityStage.NEGOTIATION,
    OpportunityStage.CLOSED_WON,
  ];
  const currentStep = stagesOrder.indexOf(opp.stage);

  const ownerName = opp.assignedTo ? `${opp.assignedTo.firstName || ''} ${opp.assignedTo.lastName || ''}`.trim() : t('opportunities.systemAdmin');

  return (
    <div className="space-y-4">
      {/* Breadcrumbs & Title */}
      <div className="flex justify-between items-start shrink-0">
        <div>
          <div className="text-xs text-[var(--color-muted-fg)] flex items-center gap-1.5 mb-2 font-mono">
            <Link href="/opportunities" className="hover:underline">{t('opportunities.breadcrumbOpportunities')}</Link>
            <span>&gt;</span>
            <span className="text-[var(--color-fg)] font-semibold">{opp.oppCode}</span>
          </div>
          <h1 className="text-base font-semibold sm: tracking-tight text-[var(--color-fg)]">
            {opp.name}
          </h1>
          <p className="text-xs text-[var(--color-muted-fg)]">{t('opportunities.dealCode')}: {opp.oppCode} • {opp.serviceInterest}</p>
        </div>

        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            opp.stage === OpportunityStage.CLOSED_WON ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
            opp.stage === OpportunityStage.CLOSED_LOST ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
            'bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/20'
          }`}>
            {t('opportunities.stage')}: {getStageLabel(opp.stage)}
          </span>
        </div>
      </div>

      {/* Visual Stage Progress Stepper (Compact Sleek Bar) */}
      {opp.stage !== OpportunityStage.CLOSED_LOST ? (
        <div className="bg-[var(--color-bg-tint)] border border-[var(--color-border)]/40 px-5 py-3 rounded-lg shadow-sm">
          <Steps
            size="small"
            current={currentStep >= 0 ? currentStep : 0}
            onChange={(stepIdx) => {
              const target = stagesOrder[stepIdx];
              if (target && target !== opp.stage) {
                handleStageChange(target);
              }
            }}
            className="cursor-pointer select-none"
            items={[
              { title: t('opportunities.stepQualification'), description: t('opportunities.prob20') },
              { title: t('opportunities.stepProposal'), description: t('opportunities.prob50') },
              { title: t('opportunities.stepNegotiation'), description: t('opportunities.prob80') },
              { title: t('opportunities.stepClosedWon'), description: t('opportunities.prob100') },
            ]}
          />
        </div>
      ) : (
        <div className="bg-red-500/5 border border-red-500/20 p-3 rounded-lg flex items-center gap-3">
          <AlertTriangle className="text-red-500 shrink-0" size={18} />
          <div className="text-xs text-red-800 font-mono">
            <span className="font-bold uppercase inline-block mr-2">{t('opportunities.closedLostLabel')}:</span>
            <span>{t('opportunities.reason')}: {opp.lostReason}</span>
          </div>
        </div>
      )}

      {/* Main Layout 3:1 */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Content (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Sub Navigation */}
          <div className="flex gap-6 border-b border-[var(--color-border)] pb-px">
            {[
              { id: 'overview', name: t('opportunities.tabOverview') },
              { id: 'progress', name: t('opportunities.tabProgress') },
              { id: 'activity', name: t('opportunities.tabActivity') },
              { id: 'ai-coach', name: t('opportunities.tabAiCoach') },
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
          <div className="bg-[var(--color-bg-tint)] border border-[var(--color-border)] rounded-[5px] p-6 min-h-[300px]">
            {activeSubTab === 'overview' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-xs font-mono uppercase tracking-widest text-[var(--color-muted-fg)]">
                      {t('opportunities.dealParameters')}
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between border-b border-[var(--color-border)] pb-2">
                        <span className="text-[var(--color-muted-fg)]">{t('opportunities.estimatedAmount')}</span>
                        <span className="font-semibold font-mono">{(opp.amount || 0).toLocaleString('vi-VN')} VND</span>
                      </div>
                      <div className="flex justify-between border-b border-[var(--color-border)] pb-2">
                        <span className="text-[var(--color-muted-fg)]">{t('opportunities.probability')}</span>
                        <span className="font-semibold font-mono">{opp.probability || 0}%</span>
                      </div>
                      <div className="flex justify-between border-b border-[var(--color-border)] pb-2">
                        <span className="text-[var(--color-muted-fg)]">{t('opportunities.targetCloseDate')}</span>
                        <span className="font-semibold font-mono">{opp.closeDate ? opp.closeDate.substring(0, 10) : ''}</span>
                      </div>
                      <div className="flex justify-between border-b border-[var(--color-border)] pb-2">
                        <span className="text-[var(--color-muted-fg)]">{t('opportunities.serviceInterest')}</span>
                        <span className="font-semibold">{opp.serviceInterest}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-mono uppercase tracking-widest text-[var(--color-muted-fg)]">
                      {t('opportunities.customerRelations')}
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between border-b border-[var(--color-border)] pb-2">
                        <span className="text-[var(--color-muted-fg)]">{t('opportunities.accountCustomer')}</span>
                        {opp.customer?.id && (
                          <Link href={`/customers/accounts/${opp.customer?.id}`} className="font-semibold text-[var(--color-accent)] hover:underline">
                            {opp.customer?.name || t('opportunities.viewAccount')}
                          </Link>
                        )}
                      </div>
                      <div className="flex justify-between border-b border-[var(--color-border)] pb-2">
                        <span className="text-[var(--color-muted-fg)]">{t('opportunities.primaryContact')}</span>
                        {opp.contact?.id && (
                          <Link href={`/customers/contacts/${opp.contact?.id}`} className="font-semibold text-[var(--color-accent)] hover:underline">
                            {opp.contact ? `${opp.contact.firstName || ''} ${opp.contact.lastName || ''}`.trim() : t('opportunities.viewContact')}
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-[var(--color-border)]/50">
                  <h3 className="text-xs font-mono uppercase tracking-widest text-[var(--color-muted-fg)]">
                    {t('opportunities.scopeDescription')}
                  </h3>
                  <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-fg)] whitespace-pre-wrap font-mono">
                    {opp.description || t('opportunities.noDescription')}
                  </div>
                </div>
              </div>
            )}

            {activeSubTab === 'progress' && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-[var(--color-fg)]">{t('opportunities.stageHistory')}</h3>
                <div className="relative border-l border-[var(--color-border)] ml-3 pl-6 space-y-6 text-xs font-mono">
                  <div className="relative">
                    <span className="absolute -left-[30px] top-0 bg-[var(--color-accent)] text-white w-4 h-4 rounded-full flex items-center justify-center font-bold font-mono text-[9px]">1</span>
                    <p className="font-semibold text-[var(--color-fg)]">{t('opportunities.qualificationReached')}</p>
                    <p className="text-[10px] text-[var(--color-muted-fg)]">{opp.createdAt ? opp.createdAt.substring(0, 10) : ''} • {t('opportunities.systemAutoQualify')}</p>
                  </div>
                  <div className="relative">
                    <span className="absolute -left-[30px] top-0 bg-[var(--color-accent)] text-white w-4 h-4 rounded-full flex items-center justify-center font-bold font-mono text-[9px]">2</span>
                    <p className="font-semibold text-[var(--color-fg)]">{getStageLabel(opp.stage)} {t('opportunities.stageReached')}</p>
                    <p className="text-[10px] text-[var(--color-muted-fg)]">{opp.updatedAt ? opp.updatedAt.substring(0, 10) : ''} • {t('opportunities.transitionedBy')} {ownerName}</p>
                  </div>
                </div>
              </div>
            )}

            {activeSubTab === 'activity' && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-[var(--color-fg)]">{t('opportunities.timelineLogs')}</h3>
                <div className="p-6 bg-[var(--color-surface)]/20 border border-[var(--color-border)]/50 rounded-[5px] flex flex-col gap-3 justify-center min-h-[160px] text-center text-[var(--color-muted-fg)] text-xs font-mono">
                  <HelpCircle size={32} className="mx-auto text-[var(--color-accent)]/50" />
                  <span>{t('opportunities.noTimelineLogs')}</span>
                </div>
              </div>
            )}

            {activeSubTab === 'ai-coach' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-[var(--color-border)]/50 pb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--color-fg)] flex items-center gap-2">
                      <Bot size={18} className="text-[var(--color-accent)]" />
                      <span>{t('opportunities.aiCoach')}</span>
                    </h3>
                    <p className="text-[11px] text-[var(--color-muted-fg)] mt-1">{t('opportunities.aiCoachDesc')}</p>
                  </div>
                  <Button 
                    type="primary" 
                    onClick={handleStartCoaching} 
                    loading={isStreaming}
                    className="flex items-center gap-2 h-9 px-4 rounded-xl cursor-pointer bg-[var(--color-accent)]"
                  >
                    <Zap size={14} />
                    <span>{coachingNotes ? t('opportunities.reloadSuggestions') : t('opportunities.startCoach')}</span>
                  </Button>
                </div>

                {coachingNotes ? (
                  <div className="space-y-4 pt-2">
                    <div className="p-5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[5px] space-y-3 font-sans shadow-sm leading-relaxed text-xs">
                      <p className="font-semibold text-xs text-[var(--color-fg)] flex items-center gap-1.5 border-b border-[var(--color-border)]/50 pb-2">
                        <Bot size={14} className="text-[var(--color-accent)]" />
                        <span>{t('opportunities.coachAdvice')}</span>
                      </p>
                      <div className="whitespace-pre-wrap text-xs text-[var(--color-fg)] space-y-2 pt-1 font-mono">
                        {coachingNotes}
                      </div>
                      {isStreaming && (
                        <div className="flex items-center gap-1.5 text-[10px] text-[var(--color-accent)] font-mono animate-pulse pt-2">
                          <span className="w-1.5 h-1.5 bg-[var(--color-accent)] rounded-full"></span>
                          <span>{t('opportunities.aiTyping')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16 space-y-3 bg-[var(--color-surface)]/10 border border-dashed border-[var(--color-border)] rounded-[5px]">
                    <Bot size={44} className="mx-auto text-[var(--color-muted-fg)]/40" />
                    <p className="text-xs text-[var(--color-muted-fg)] max-w-md mx-auto leading-relaxed">
                      {t('opportunities.coachEmpty')}
                    </p>
                    <Button onClick={handleStartCoaching} loading={isStreaming} className="h-9 px-4 rounded-xl cursor-pointer">
                      {t('opportunities.startCoach')}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar Actions (1 col) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[var(--color-bg-tint)] border border-[var(--color-border)] rounded-[5px] p-6 space-y-6">
            <h3 className="text-xs font-mono uppercase tracking-widest text-[var(--color-muted-fg)]">
              {t('opportunities.controlPanel')}
            </h3>

            {/* Change Stage */}
            <FormSelect
              label={t('opportunities.salesStageSetting')}
              value={opp.stage}
              onChange={(val) => handleStageChange(val as string)}
              options={[
                { value: OpportunityStage.QUALIFICATION, label: `${t('opportunities.stageQualification')} (20%)` },
                { value: OpportunityStage.PROPOSAL, label: `${t('opportunities.stageProposal')} (50%)` },
                { value: OpportunityStage.NEGOTIATION, label: `${t('opportunities.stageNegotiation')} (80%)` },
                { value: OpportunityStage.CLOSED_WON, label: `${t('opportunities.stageWon')} (100%)` },
                { value: OpportunityStage.CLOSED_LOST, label: `${t('opportunities.stageLost')} (0%)` },
              ]}
            />

            {/* Change Owner */}
            <FormSelect
              label={t('opportunities.assignedOwner')}
              value={opp.assignedTo?.id || ''}
              onChange={(val) => handleOwnerChange(val as string)}
              options={realUsers.map(u => ({ value: u.id, label: u.name }))}
            />

            {/* Delete Option */}
            <div className="pt-4 border-t border-[var(--color-border)]/50">
              <Button danger onClick={handleDelete} loading={deleteMutation.isPending} className="w-full flex items-center justify-center gap-2 h-10 rounded-xl cursor-pointer">
                <Trash2 size={16} />
                <span>{t('opportunities.deleteOpportunity')}</span>
              </Button>
            </div>
          </div>
        </div>

      </div>

      {/* Closed Lost Reason Modal */}
      <Modal
        title={t('opportunities.markClosedLost')}
        open={lostModalOpen}
        onCancel={() => setLostModalOpen(false)}
        onOk={handleConfirmLost}
        confirmLoading={closeLostMutation.isPending}
        okText={t('opportunities.confirmCloseLost')}
        cancelText={t('opportunities.cancel')}
      >
        <div className="space-y-4 pt-4">
          <p className="text-xs text-[var(--color-muted-fg)]">{t('opportunities.lostReasonInstruction')}</p>
          <textarea
            placeholder={t('opportunities.lostReasonPlaceholder')}
            value={lostReason}
            onChange={(e) => setLostReason(e.target.value)}
            className="w-full min-h-[100px] p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-fg)] focus:outline-none"
          />
        </div>
      </Modal>
    </div>
  );
}
