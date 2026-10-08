'use client';

import React, { useState } from 'react';
import { Button, Select, Modal, message } from 'antd';
import { Building2, User, DollarSign, Calendar, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { FloatingInput } from '@/components/FloatingInput';

interface LeadStepConvertProps {
  lead: any;
  onConvertSubmit: (payload: any) => Promise<any>;
  onAdvanceToNextStep: () => void;
  isConverting: boolean;
}

export function LeadStepConvert({
  lead,
  onConvertSubmit,
  onAdvanceToNextStep,
  isConverting,
}: LeadStepConvertProps) {
  const { t } = useTranslation();
  // Branching: BUSINESS vs INDIVIDUAL
  const [clientType, setClientType] = useState<'BUSINESS' | 'INDIVIDUAL'>(
    lead.company ? 'BUSINESS' : 'INDIVIDUAL'
  );
  const [companyName, setCompanyName] = useState(lead.company || '');
  const [taxCode, setTaxCode] = useState('');
  
  // Opportunity scope
  const [oppAmount, setOppAmount] = useState(String(lead.budget || 10000000));
  const [expectedCloseDate, setExpectedCloseDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10)
  );
  const [serviceType, setServiceType] = useState(lead.serviceInterest || 'WEBSITE');

  // Deduplication Warning Modal
  const [dupModalOpen, setDupModalOpen] = useState(false);
  const [dupType, setDupType] = useState<'CONTACT' | 'TAX_CODE'>('CONTACT');
  const [dupInfo, setDupInfo] = useState<any>(null);

  const handleTriggerConvert = async (forceCreateContact = false, linkExistingContactId?: string) => {
    if (clientType === 'BUSINESS' && !companyName.trim()) {
      message.error(t('leads.companyAccountNameReq') || 'Tên công ty / Account là bắt buộc đối với Khách hàng Doanh nghiệp.');
      return;
    }

    try {
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

      // Deduplication Tax Code Error (Section 3.2 Blocked)
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

      // Deduplication Contact Warning (Section 3.2 Warning)
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
    <div className="space-y-4">
      {/* Header Info */}
      <div className="border-b border-[var(--color-border)]/40 pb-3">
        <h3 className="text-sm font-bold text-[var(--color-fg)]">
          {t('leads.step3Title') || 'Bước 3: Thiết lập Chuyển đổi Lead (Conversion Wizard)'}
        </h3>
        <p className="text-xs text-[var(--color-muted-fg)] mt-0.5">
          {t('leads.step3Desc') || 'Xác định loại Khách hàng (Business / Individual) và thông số Cơ hội kinh doanh để thực hiện Convert.'}
        </p>
      </div>

      {/* Main Grid: Clean Flat Layout */}
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

      {/* Footer Action Toolbar */}
      <div className="pt-6 border-t border-[var(--color-border)]/40 flex justify-end items-center">
        <Button
          type="primary"
          onClick={() => handleTriggerConvert(false)}
          loading={isConverting}
          className="flex items-center gap-2 h-11 px-8 rounded-xl cursor-pointer bg-purple-600 hover:bg-purple-700 border-none font-semibold text-sm shadow-md"
        >
          <Sparkles size={18} />
          <span>{t('leads.performLeadConversion') || 'Thực hiện Chuyển đổi Lead'}</span>
          <ArrowRight size={18} />
        </Button>
      </div>

      {/* Contact Deduplication Warning Modal (Section 3.2) */}
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
