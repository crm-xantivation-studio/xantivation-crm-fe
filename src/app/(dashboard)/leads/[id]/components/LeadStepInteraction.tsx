'use client';

import React, { useState } from 'react';
import { Button, Select, Progress, Modal, message } from 'antd';
import { Bot, Plus, ArrowRight, ShieldCheck, XCircle, MessageSquare, Save, Building2, User, DollarSign, ShieldAlert, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { FloatingInput } from '@/components/FloatingInput';

interface LeadStepInteractionProps {
  lead: any;
  activities: any[];
  onUpdateLead: (dto: any) => Promise<any>;
  onAddActivity: (type: string, notes: string) => Promise<any>;
  onAutoQualify: () => void;
  onConvertSubmit: (payload: any) => Promise<any>;
  onAdvanceToNextStep: () => void;
  isUpdating: boolean;
  isAutoQualifying: boolean;
  isConverting: boolean;
}

export function LeadStepInteraction({
  lead,
  activities,
  onUpdateLead,
  onAddActivity,
  onAutoQualify,
  onConvertSubmit,
  onAdvanceToNextStep,
  isUpdating,
  isAutoQualifying,
  isConverting,
}: LeadStepInteractionProps) {
  const { t } = useTranslation();
  
  // BANT State
  const [budget, setBudget] = useState(String(lead.budget || ''));
  const [need, setNeed] = useState(lead.need || '');
  const [timeline, setTimeline] = useState(lead.timeline || '');
  const [authorityConfirmed, setAuthorityConfirmed] = useState(lead.bantScore >= 75 ? 'YES' : 'NO');

  // Activity State
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [actType, setActType] = useState<'CALL' | 'EMAIL' | 'MEETING' | 'NOTE'>('CALL');
  const [actNotes, setActNotes] = useState('');

  // Conversion State
  const [clientType, setClientType] = useState<'BUSINESS' | 'INDIVIDUAL'>(
    lead.company ? 'BUSINESS' : 'INDIVIDUAL'
  );
  const [companyName, setCompanyName] = useState(lead.company || '');
  const [taxCode, setTaxCode] = useState('');
  
  const [oppAmount, setOppAmount] = useState(String(lead.budget || 10000000));
  const [expectedCloseDate, setExpectedCloseDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10)
  );
  const [serviceType, setServiceType] = useState(lead.serviceInterest || 'WEBSITE');

  // Deduplication Modal State
  const [dupModalOpen, setDupModalOpen] = useState(false);
  const [dupType, setDupType] = useState<'CONTACT' | 'TAX_CODE'>('CONTACT');
  const [dupInfo, setDupInfo] = useState<any>(null);

  // Handlers
  const handleAddAct = async () => {
    if (!actNotes.trim()) return;
    try {
      await onAddActivity(actType, actNotes);
      setActNotes('');
      setActivityModalOpen(false);
      message.success(t('leads.logActivityOk') || 'Đã ghi nhận tương tác');
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Ghi nhận thất bại');
    }
  };

  const handleSaveBant = async () => {
    try {
      await onUpdateLead({
        budget: Number(budget) || 0,
        need,
        timeline,
        bantScore: Math.max(lead.bantScore || 50, 75),
      });
      message.success(t('leads.bantSaved') || 'Đã lưu thông tin BANT');
    } catch (err: any) {
      // Handled by hook
    }
  };

  const handleMarkUnqualified = async () => {
    try {
      await onUpdateLead({ status: 'UNQUALIFIED' });
    } catch (err: any) {
      // Handled by hook
    }
  };

  const handleTriggerConvert = async (forceCreateContact = false, linkExistingContactId?: string) => {
    if (clientType === 'BUSINESS' && !companyName.trim()) {
      message.error(t('leads.companyAccountNameReq') || 'Tên công ty / Account là bắt buộc đối với Khách hàng Doanh nghiệp.');
      return;
    }

    try {
      // First save BANT if not saved
      await onUpdateLead({
        budget: Number(budget) || 0,
        need,
        timeline,
        bantScore: Math.max(lead.bantScore || 50, 75),
      });

      const payload = {
        clientType,
        companyName: clientType === 'BUSINESS' ? companyName : undefined,
        taxCode: clientType === 'BUSINESS' ? taxCode : undefined,
        opportunityAmount: Number(oppAmount) || 0,
        expectedCloseDate,
        serviceType,
        serviceInterest: serviceType,
        forceCreateContact,
        linkExistingContactId,
      };

      await onConvertSubmit(payload);
      onAdvanceToNextStep();
    } catch (err: any) {
      const resData = err.response?.data;

      if (resData?.code === 'TAX_CODE_EXISTS') {
        Modal.error({
          title: t('leads.taxCodeExistsTitle') || 'Mã số thuế trùng lặp (Tài khoản Doanh nghiệp đã tồn tại)',
          content: (
            <div className="space-y-2 pt-2 text-xs">
              <p className="text-red-500 font-semibold">
                Mã số thuế {taxCode} đã thuộc về Doanh nghiệp: <strong>{resData.existingAccountName}</strong>.
              </p>
              <p>Theo quy tắc flow.md, bạn không thể tạo trùng Account. Vui lòng chuyển về Account cũ hoặc sửa lại MST.</p>
            </div>
          ),
        });
        return;
      }

      if (resData?.code === 'CONTACT_EXISTS') {
        setDupType('CONTACT');
        setDupInfo(resData.existingContact);
        setDupModalOpen(true);
        return;
      }

      message.error(resData?.message || t('leads.conversionFailed') || 'Chuyển đổi Lead thất bại.');
    }
  };

  return (
    <div className="bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)]/40 p-6 shadow-sm relative overflow-hidden space-y-8">
      {/* SINGLE Header Info for the entire block */}
      <div className="border-b border-[var(--color-border)]/40 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-[var(--color-fg)]">
            {t('leads.step2Title') || 'Tương tác, Đánh giá BANT & Thiết lập Chuyển đổi Lead'}
          </h3>
          <p className="text-xs text-[var(--color-muted-fg)] mt-0.5">
            {t('leads.step2Desc') || 'Ghi nhận lịch sử làm việc, xác minh BANT và thiết lập Hồ sơ khách hàng để chuyển đổi.'}
          </p>
        </div>

        <Button
          onClick={onAutoQualify}
          loading={isAutoQualifying}
          className="flex items-center gap-1.5 h-9 px-4 rounded-xl cursor-pointer border-[var(--color-accent)] text-[var(--color-accent)] shrink-0"
        >
          <Bot size={14} />
          <span>{t('leads.aiAutoQualify') || 'AI Auto-Qualify'}</span>
        </Button>
      </div>

      {/* Main Grid 1: BANT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* BANT Parameters Evaluation Form */}
        <div className="space-y-4">
          <h4 className="text-xs font-mono uppercase tracking-widest text-[var(--color-muted-fg)] flex items-center gap-1.5 border-b border-[var(--color-border)]/30 pb-2">
            <ShieldCheck size={14} className="text-[var(--color-accent)]" />
            <span>{t('leads.bantParameters') || 'Tham số BANT'}</span>
          </h4>

          <div className="space-y-3">
            <FloatingInput label={t('leads.budgetVnd') || 'Ngân sách dự kiến (VND)'} type="number" value={budget} onChange={setBudget} />

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted-fg)]">
                {t('leads.authorityConfirmedLabel') || 'Xác nhận Thẩm quyền người quyết định (Authority)'}
              </label>
              <Select
                value={authorityConfirmed}
                onChange={setAuthorityConfirmed}
                options={[
                  { value: 'YES', label: t('leads.authorityOptionYes') || 'Đã xác nhận: Người quyết định trực tiếp (CEO / Founder / Director)' },
                  { value: 'NO', label: t('leads.authorityOptionNo') || 'Chưa xác nhận / Người đại diện tìm hiểu hộ' },
                ]}
                className="w-full h-11"
              />
            </div>

            <FloatingInput label={t('leads.specificNeed') || 'Mô tả nhu cầu cụ thể (Need)'} value={need} onChange={setNeed} />
            <FloatingInput label={t('leads.timelineWanted') || 'Thời gian triển khai mong muốn (Timeline)'} value={timeline} onChange={setTimeline} />
          </div>

          {lead.aiScore !== null && (
            <div className="pt-3 border-t border-[var(--color-border)]/30 space-y-1.5">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-[var(--color-muted-fg)]">{t('leads.aiEvaluation') || 'Đánh giá từ AI:'}</span>
                <span className="font-bold text-[var(--color-accent)]">{lead.aiScore * 10} / 100</span>
              </div>
              <Progress percent={lead.aiScore * 10} strokeColor="#4F46E5" size="small" />
            </div>
          )}
        </div>

        {/* Activity Log Recorder */}
        <div className="space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-[var(--color-border)]/30 pb-2">
              <h4 className="text-xs font-mono uppercase tracking-widest text-[var(--color-muted-fg)] flex items-center gap-1.5">
                <MessageSquare size={14} className="text-[var(--color-accent)]" />
                <span>{t('leads.interactionLogs') || 'Nhật ký tương tác'}</span>
              </h4>
              <Button
                type="primary"
                size="small"
                onClick={() => setActivityModalOpen(true)}
                className="flex items-center gap-1.5 text-xs rounded-lg cursor-pointer"
              >
                <Plus size={12} />
                <span>{t('leads.recordInteraction') || 'Ghi tương tác'}</span>
              </Button>
            </div>

            <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
              {activities.length > 0 ? (
                activities.map((act) => (
                  <div key={act.id} className="p-3 bg-[var(--color-bg-tint)] border border-[var(--color-border)]/40 rounded-xl space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-xs text-[var(--color-accent)] font-mono">{act.type}</span>
                      <span className="text-[10px] text-[var(--color-muted-fg)] font-mono">{act.createdAt}</span>
                    </div>
                    <p className="text-xs text-[var(--color-fg)]">{act.description}</p>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-xs text-[var(--color-muted-fg)] font-mono border border-dashed border-[var(--color-border)]/40 rounded-xl">
                  {t('leads.noInteractionsRecorded') || 'Chưa có tương tác nào. Bấm "Ghi tương tác" để lưu nhật ký làm việc.'}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      <div className="border-t border-[var(--color-border)]/40 pt-8" />

      {/* Main Grid 2: Conversion Wizard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Customer Profile Branching Setup */}
        <div className="space-y-4">
          <h4 className="text-xs font-mono uppercase tracking-widest text-[var(--color-muted-fg)] flex items-center gap-1.5 border-b border-[var(--color-border)]/30 pb-2">
            <Building2 size={14} className="text-[var(--color-accent)]" />
            <span>{t('leads.customerProfileType') || 'Phân loại Hồ sơ Khách hàng (Customer Profile)'}</span>
          </h4>

          <div className="space-y-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted-fg)]">
                {t('leads.clientType') || 'Loại Khách hàng'}
              </label>
              <Select
                value={clientType}
                onChange={(val) => setClientType(val as any)}
                options={[
                  { value: 'BUSINESS', label: t('leads.clientTypeBusiness') || 'Khách hàng Doanh nghiệp (B2B - Đơn vị / Công ty)' },
                  { value: 'INDIVIDUAL', label: t('leads.clientTypeIndividual') || 'Khách hàng Cá nhân (B2C - Người mua lẻ / Tự do)' },
                ]}
                className="w-full h-11"
              />
            </div>

            {clientType === 'BUSINESS' ? (
              <>
                <FloatingInput label={t('leads.companyAccountNameReq') || 'Tên Công ty / Account *'} value={companyName} onChange={setCompanyName} required />
                <FloatingInput label={t('leads.taxCodeOptional') || 'Mã số thuế (Tax Code)'} value={taxCode} onChange={setTaxCode} />
                <p className="text-[10px] text-[var(--color-muted-fg)] italic">
                  {t('leads.taxCodeDeduplicationNotice') || '* Hệ thống sẽ tự động kiểm tra trùng lặp Mã số thuế trong dữ liệu Doanh nghiệp.'}
                </p>
              </>
            ) : (
              <div className="p-3 bg-[var(--color-bg-tint)] border border-[var(--color-border)]/40 rounded-xl space-y-1">
                <span className="text-xs font-semibold text-[var(--color-accent)] flex items-center gap-1">
                  <User size={14} />
                  {t('customers.individual') || 'Nhánh Cá nhân (Individual)'}
                </span>
                <p className="text-[11px] text-[var(--color-muted-fg)]">
                  {t('leads.individualBranchDesc', { name: `${lead.firstName} ${lead.lastName}` }) || `Bỏ qua bước tạo Account Doanh nghiệp. Hệ thống sẽ tạo thẳng Contact với tên ${lead.firstName} ${lead.lastName}.`}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Opportunity Scope Setup */}
        <div className="space-y-4">
          <h4 className="text-xs font-mono uppercase tracking-widest text-[var(--color-muted-fg)] flex items-center gap-1.5 border-b border-[var(--color-border)]/30 pb-2">
            <DollarSign size={14} className="text-[var(--color-accent)]" />
            <span>{t('leads.oppScopeSetup') || 'Phạm vi Cơ hội Kinh doanh (Opportunity Scope)'}</span>
          </h4>

          <div className="space-y-3">
            <FloatingInput label={t('leads.oppAmountReq') || 'Giá trị Cơ hội ước tính (VND) *'} type="number" value={oppAmount} onChange={setOppAmount} required />
            <FloatingInput label={t('leads.expectedCloseDateReq') || 'Ngày dự kiến chốt (Expected Close Date) *'} type="date" value={expectedCloseDate} onChange={setExpectedCloseDate} required />

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted-fg)]">
                {t('leads.serviceType') || 'Loại dịch vụ'}
              </label>
              <Select
                value={serviceType}
                onChange={setServiceType}
                options={[
                  { value: 'WEBSITE', label: t('leads.optionWebsite') || 'Thiết kế Website' },
                  { value: 'APP_MVP', label: t('leads.optionAppMvp') || 'Xây dựng Mobile App / MVP' },
                  { value: 'BRANDING', label: t('leads.optionBranding') || 'Bộ nhận diện Thương hiệu' },
                  { value: 'UI_UX', label: t('leads.optionUiUx') || 'Thiết kế UI/UX' },
                  { value: 'CUSTOM', label: t('leads.optionCustom') || 'Dịch vụ Tùy chỉnh' },
                ]}
                className="w-full h-11"
              />
            </div>
          </div>
        </div>

      </div>

      {/* SINGLE Unified Footer Action Toolbar */}
      <div className="pt-6 border-t border-[var(--color-border)]/40 flex flex-col sm:flex-row justify-between items-center gap-4">
        <Button
          danger
          onClick={handleMarkUnqualified}
          loading={isUpdating}
          className="flex items-center gap-1.5 h-10 px-4 rounded-xl cursor-pointer"
        >
          <XCircle size={16} />
          <span>{t('leads.unqualify') || 'Không đạt chuẩn (Unqualify)'}</span>
        </Button>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            onClick={handleSaveBant}
            loading={isUpdating}
            className="flex items-center gap-2 h-10 px-6 rounded-xl cursor-pointer border-[var(--color-border)] text-[var(--color-fg)] flex-1 sm:flex-none justify-center"
          >
            <Save size={16} />
            <span>{t('leads.saveBant') || 'Lưu BANT'}</span>
          </Button>

          <Button
            type="primary"
            onClick={() => handleTriggerConvert(false)}
            loading={isConverting}
            className="flex items-center gap-2 h-10 px-6 rounded-xl cursor-pointer flex-1 sm:flex-none justify-center"
          >
            <Sparkles size={16} />
            <span>{t('leads.performLeadConversion') || 'Thực hiện Chuyển đổi Lead'}</span>
            <ArrowRight size={16} />
          </Button>
        </div>
      </div>

      {/* Activity Modal */}
      <Modal
        title={t('leads.logActivityTitle') || 'Ghi nhận tương tác với Lead'}
        open={activityModalOpen}
        onCancel={() => setActivityModalOpen(false)}
        onOk={handleAddAct}
        okText={t('leads.saveInteraction') || 'Lưu tương tác'}
        cancelText={t('common.cancel') || 'Hủy'}
      >
        <div className="space-y-4 pt-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted-fg)]">
              {t('leads.activityType') || 'Loại tương tác'}
            </label>
            <Select
              value={actType}
              onChange={setActType}
              options={[
                { value: 'CALL', label: t('leads.activityCall') || 'Cuộc gọi điện' },
                { value: 'EMAIL', label: t('leads.activityEmail') || 'Email trao đổi' },
                { value: 'MEETING', label: t('leads.activityMeeting') || 'Cuộc họp / Demo' },
                { value: 'NOTE', label: t('leads.activityNote') || 'Ghi chú nội bộ' },
              ]}
              className="h-10"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted-fg)]">
              {t('leads.activityContent') || 'Nội dung trao đổi'}
            </label>
            <textarea
              value={actNotes}
              onChange={(e) => setActNotes(e.target.value)}
              className="w-full h-24 p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-fg)] focus:outline-none"
              placeholder={t('leads.activityPlaceholder') || 'Nhập chi tiết thông tin trao đổi...'}
            />
          </div>
        </div>
      </Modal>

      {/* Contact Deduplication Warning Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-amber-500">
            <ShieldAlert size={20} />
            <span>{t('leads.contactExistsTitle') || 'Cảnh báo: Liên hệ (Contact) đã tồn tại trong hệ thống'}</span>
          </div>
        }
        open={dupModalOpen}
        onCancel={() => setDupModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setDupModalOpen(false)}>
            {t('common.cancel') || 'Hủy bỏ'}
          </Button>,
          <Button
            key="link"
            type="primary"
            onClick={() => {
              setDupModalOpen(false);
              handleTriggerConvert(false, dupInfo?.id);
            }}
          >
            {t('leads.linkOldContact', { name: dupInfo?.name }) || `Liên kết với Contact cũ (${dupInfo?.name})`}
          </Button>,
        ]}
      >
        {dupInfo && (
          <div className="space-y-3 pt-3 text-xs">
            <p className="text-[var(--color-fg)]">
              {t('leads.contactExistsDesc', { email: dupInfo.email, phone: dupInfo.phone }) || `Hệ thống phát hiện Email ${dupInfo.email} hoặc SĐT ${dupInfo.phone} đã khớp với Contact:`}
            </p>
            <div className="p-3 bg-[var(--color-bg-tint)] border border-[var(--color-border)]/40 rounded-xl space-y-1 font-mono">
              <p><strong>{t('leads.name') || 'Họ tên'}:</strong> {dupInfo.name}</p>
              <p><strong>{t('leads.email') || 'Email'}:</strong> {dupInfo.email}</p>
              <p><strong>{t('leads.phone') || 'Số điện thoại'}:</strong> {dupInfo.phone}</p>
            </div>
            <p className="text-[var(--color-muted-fg)] italic">
              * Theo quy tắc deduplication, bạn có thể chọn liên kết dữ liệu với Contact cũ hoặc ép buộc tạo Contact mới.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
