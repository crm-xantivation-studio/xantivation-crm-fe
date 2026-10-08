'use client';

import React, { useState, use, useEffect } from 'react';
import { Button, Select, Modal, Spin, message } from 'antd';
import { useLead, useConvertLead, useAddLeadActivity, useLeadActivities, useUpdateLead, useDeleteLead, useAutoQualifyLead } from '@/hooks/api/useLead';
import { useUsers } from '@/hooks/api/useUser';
import { Trash2, ArrowLeft, RefreshCw, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { LeadProgressStepper } from './LeadProgressStepper';
import { LeadStepIntake } from './components/LeadStepIntake';
import { LeadStepBant } from './components/LeadStepBant';
import { LeadStepConvert } from './components/LeadStepConvert';
import { LeadStepCompleted } from './components/LeadStepCompleted';

export default function LeadDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t } = useTranslation();

  const { data: leadResponse, isLoading: isLeadLoading } = useLead(id);
  const { data: activitiesResponse } = useLeadActivities(id);
  const { data: usersResponse } = useUsers();
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
    assignedToId: (rawLead as any).assignedToId || rawLead.assignedTo?.id,
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

  // Track active step: 1 (Intake), 2 (BANT), 3 (Convert), 4 (Completed)
  const [activeStep, setActiveStep] = useState(1);

  // Sync active step based on lead status
  useEffect(() => {
    if (lead) {
      if (lead.status === 'NEW') {
        setActiveStep(1);
      } else if (lead.status === 'CONTACTED') {
        // Prevent resetting to step 2 if the user locally advanced to step 3 (Convert)
        setActiveStep((prev) => (prev === 3 ? 3 : 2));
      } else if (lead.status === 'QUALIFIED' || (lead.status as string) === 'CONVERTED') {
        setActiveStep(4); // 4 = Completed (visually Step 3 done)
      } else if (lead.status === 'UNQUALIFIED') {
        setActiveStep(1);
      }
    }
  }, [lead?.status]);

  if (isLeadLoading) {
    return (
      <div className="py-32 flex flex-col justify-center items-center gap-3">
        <Spin size="large" />
        <span className="text-xs text-[var(--color-muted-fg)] font-mono">{t('common.loading') || 'Đang tải dữ liệu...'}</span>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="p-8 text-center text-red-500 font-bold">
        {t('leads.notFound') || 'Không tìm thấy thông tin Lead.'}
      </div>
    );
  }

  const handleUpdateLead = async (dto: any) => {
    return updateMutation.mutateAsync({ id, dto });
  };

  const handleAddActivity = async (type: any, notes: string) => {
    return addActivityMutation.mutateAsync({ type, notes });
  };

  const handleConvertSubmit = async (payload: any) => {
    return convertMutation.mutateAsync(payload);
  };

  const handleAutoQualify = () => {
    const hide = message.loading(t('leads.analyzingBant') || 'Đang phân tích BANT bằng AI...', 0);
    autoQualifyMutation.mutate(undefined, {
      onSettled: () => {
        hide();
      },
    });
  };

  const isUnqualified = lead.status === 'UNQUALIFIED';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Breadcrumb & Title */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center shrink-0 gap-4">
        <div className="flex-1">
          <div className="text-xs text-[var(--color-muted-fg)] flex items-center gap-1.5 mb-2 font-mono">
            <Link href="/leads" className="hover:underline flex items-center gap-1">
              <ArrowLeft size={12} />
              <span>{t('leads.breadcrumbLeads') || 'Đầu mối'}</span>
            </Link>
            <span>/</span>
            <span className="text-[var(--color-fg)] font-semibold">{lead.leadCode}</span>
          </div>
          <h1 className="text-base font-semibold tracking-tight text-[var(--color-fg)] flex items-center gap-3">
            <span>{lead.firstName} {lead.lastName}</span>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              lead.status === 'QUALIFIED' || (lead.status as string) === 'CONVERTED'
                ? 'bg-green-500/10 text-green-500 border border-green-500/30'
                : lead.status === 'UNQUALIFIED'
                ? 'bg-red-500/10 text-red-500 border border-red-500/30'
                : 'bg-blue-500/10 text-blue-500 border border-blue-500/30'
            }`}>
              {lead.status}
            </span>
          </h1>
          <p className="text-xs text-[var(--color-muted-fg)] mt-1">
            {t('leads.refCode') || 'Ref Code'} {lead.leadCode} • {t('leads.source') || 'Nguồn'} {lead.source} • {t('leads.createdAt') || 'Ngày tạo'}: {lead.createdAt}
          </p>
        </div>

        {/* Visual Timeline Stepper (Compact Right Side) */}
        <div className="w-full xl:w-[480px] shrink-0 mt-4 xl:mt-0">
          <LeadProgressStepper
            status={lead.status}
            bantScore={lead.bantScore}
            activeStep={activeStep}
          />
        </div>
      </div>

      {/* Unqualified Warning Alert */}
      {isUnqualified && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-[5px] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-red-500">
            <XCircle size={20} />
            <span className="text-xs font-semibold">
              {t('leads.unqualifiedNotice') || 'Lead này hiện ở trạng thái Không đạt chuẩn (Unqualified). Bạn có thể mở lại Lead để tái tiếp cận.'}
            </span>
          </div>
          <Button
            type="primary"
            onClick={() => handleUpdateLead({ status: 'NEW' })}
            loading={updateMutation.isPending}
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs cursor-pointer bg-red-600 hover:bg-red-700 border-none"
          >
            <RefreshCw size={12} />
            <span>{t('leads.reopenLead') || 'Mở lại Lead (Reopen)'}</span>
          </Button>
        </div>
      )}

      {/* Main Workspace Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Main Step Workspace Container (3 Cols) */}
        <div className="lg:col-span-3 space-y-6">
          {activeStep === 1 && (
            <LeadStepIntake
              lead={lead}
              onUpdateLead={handleUpdateLead}
              onAdvanceToNextStep={() => setActiveStep(2)}
              isUpdating={updateMutation.isPending}
            />
          )}

          {activeStep === 2 && (
            <LeadStepBant
              lead={lead}
              activities={activities}
              onUpdateLead={handleUpdateLead}
              onAddActivity={handleAddActivity}
              onAutoQualify={handleAutoQualify}
              onAdvanceToNextStep={() => setActiveStep(3)}
              isUpdating={updateMutation.isPending}
              isAutoQualifying={autoQualifyMutation.isPending}
            />
          )}

          {activeStep === 3 && (
            <LeadStepConvert
              lead={lead}
              onConvertSubmit={handleConvertSubmit}
              onAdvanceToNextStep={() => setActiveStep(4)}
              isConverting={convertMutation.isPending}
            />
          )}

          {activeStep === 4 && (
            <LeadStepCompleted lead={lead} />
          )}
        </div>

        {/* Streamlined Right Sidebar (1 Col) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[var(--color-bg-tint)] border border-[var(--color-border)]/40 rounded-[5px] p-5 space-y-4 shadow-sm">
            <h3 className="text-xs font-mono uppercase tracking-widest text-[var(--color-muted-fg)] border-b border-[var(--color-border)]/30 pb-2.5">
              {t('leads.additionalInfo') || 'Thông tin bổ sung'}
            </h3>

            {/* Change Owner (Reassign Owner) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted-fg)]">
                {t('leads.reassignOwner') || 'Người phụ trách (Owner)'}
              </label>
              <Select
                value={lead.assignedToId || lead.owner}
                onChange={async (val) => {
                  const targetUser = (usersResponse?.data || []).find((u: any) => u.id === val);
                  const targetName = targetUser?.name || targetUser?.email || val;
                  await handleUpdateLead({ assignedToId: val });
                  await handleAddActivity('NOTE', `Chuyển giao người phụ trách cho ${targetName}`);
                  message.success(`Đã chuyển giao Lead cho ${targetName}`);
                }}
                options={
                  (usersResponse?.data && usersResponse.data.length > 0)
                    ? usersResponse.data.map((u: any) => ({ value: u.id, label: u.name || u.email }))
                    : [{ value: lead.assignedToId || 'admin-id', label: lead.owner }]
                }
                disabled={(lead.status as string) === 'CONVERTED'}
                className="w-full h-10"
              />
            </div>

            {/* Metadata Summary (Clean Flat Rows) */}
            <div className="pt-2 space-y-2 text-xs font-mono border-t border-[var(--color-border)]/30">
              <div className="flex justify-between">
                <span className="text-[var(--color-muted-fg)]">{t('leads.leadCodeLabel') || 'Mã Lead:'}</span>
                <span className="font-bold text-[var(--color-fg)]">{lead.leadCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-muted-fg)]">{t('leads.sourceLabel') || 'Nguồn:'}</span>
                <span className="font-bold text-[var(--color-fg)]">{lead.source}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-muted-fg)]">{t('leads.createdAtLabel') || 'Ngày tạo:'}</span>
                <span className="font-bold text-[var(--color-fg)]">{lead.createdAt}</span>
              </div>
            </div>

            {/* Delete Action (Disabled if Converted) */}
            <div className="pt-3 border-t border-[var(--color-border)]/30">
              <Button
                danger
                disabled={(lead.status as string) === 'CONVERTED'}
                onClick={() => {
                  Modal.confirm({
                    title: t('leads.deleteConfirmTitle') || 'Xóa đầu mối',
                    content: t('leads.deleteConfirmContent', { name: `${lead.firstName} ${lead.lastName}` }) || `Bạn có chắc chắn muốn xóa đầu mối ${lead.firstName} ${lead.lastName}?`,
                    okText: t('common.delete') || 'Xóa',
                    cancelText: t('common.cancel') || 'Hủy',
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
                className="w-full flex items-center justify-center gap-2 h-9 rounded-xl cursor-pointer text-xs"
              >
                <Trash2 size={14} />
                <span>{t('leads.deleteThisLead') || 'Xóa Lead này'}</span>
              </Button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
