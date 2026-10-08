'use client';

import React, { useState, useEffect } from 'react';
import { Button, Select, message } from 'antd';
import { User, Briefcase, Save, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { FloatingInput } from '@/components/FloatingInput';

interface LeadStepIntakeProps {
  lead: any;
  onUpdateLead: (dto: any) => Promise<any>;
  onAdvanceToNextStep: () => void;
  isUpdating: boolean;
}

export function LeadStepIntake({
  lead,
  onUpdateLead,
  onAdvanceToNextStep,
  isUpdating,
}: LeadStepIntakeProps) {
  const { t } = useTranslation();
  const [firstName, setFirstName] = useState(lead.firstName || '');
  const [lastName, setLastName] = useState(lead.lastName || '');
  const [email, setEmail] = useState(lead.email || '');
  const [phone, setPhone] = useState(lead.phone || '');
  const [companyName, setCompanyName] = useState(lead.company || '');
  const [serviceInterest, setServiceInterest] = useState(lead.serviceInterest || 'WEBSITE');
  const [source, setSource] = useState(lead.source || 'MANUAL');

  useEffect(() => {
    setFirstName(lead.firstName || '');
    setLastName(lead.lastName || '');
    setEmail(lead.email || '');
    setPhone(lead.phone || '');
    setCompanyName(lead.company || '');
    setServiceInterest(lead.serviceInterest || 'WEBSITE');
    setSource(lead.source || 'MANUAL');
  }, [lead]);

  const handleSave = async (andNext: boolean = false) => {
    if (!lastName.trim() || !email.trim() || !phone.trim()) {
      message.error('Vui lòng điền đầy đủ Tên, Email và Số điện thoại');
      return;
    }

    try {
      await onUpdateLead({
        firstName,
        lastName,
        email,
        phone,
        companyName,
        serviceInterest,
        source,
        ...(andNext ? { status: 'CONTACTED' } : {}),
      });

      if (andNext) {
        onAdvanceToNextStep();
      }
    } catch (err: any) {
      // Error message is handled by the hook
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="border-b border-[var(--color-border)]/40 pb-3">
        <h3 className="text-sm font-bold text-[var(--color-fg)]">
          {t('leads.step1Title') || 'Bước 1: Tiếp nhận & Kiểm tra thông tin Lead'}
        </h3>
        <p className="text-xs text-[var(--color-muted-fg)] mt-0.5">
          {t('leads.step1Desc') || 'Xác minh và hoàn thiện thông tin liên hệ của khách hàng trước khi tiến hành tiếp xúc.'}
        </p>
      </div>

      {/* Clean Flat Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h4 className="text-xs font-mono uppercase tracking-widest text-[var(--color-muted-fg)] flex items-center gap-1.5 border-b border-[var(--color-border)]/30 pb-2">
            <User size={14} className="text-[var(--color-accent)]" />
            <span>{t('leads.contactInfo') || 'Thông tin liên hệ'}</span>
          </h4>

          <div className="grid grid-cols-2 gap-3">
            <FloatingInput label={t('leads.firstName') || 'Họ'} value={firstName} onChange={setFirstName} />
            <FloatingInput label={t('leads.lastName') || 'Tên'} value={lastName} onChange={setLastName} required />
          </div>

          <FloatingInput label={t('leads.emailAddress') || 'Địa chỉ Email'} value={email} onChange={setEmail} required />
          <FloatingInput label={t('leads.phoneNumber') || 'Số điện thoại'} value={phone} onChange={setPhone} required />
        </div>

        <div className="space-y-4">
          <h4 className="text-xs font-mono uppercase tracking-widest text-[var(--color-muted-fg)] flex items-center gap-1.5 border-b border-[var(--color-border)]/30 pb-2">
            <Briefcase size={14} className="text-[var(--color-accent)]" />
            <span>{t('leads.businessAndService') || 'Doanh nghiệp & Dịch vụ'}</span>
          </h4>

          <FloatingInput label={t('leads.companyName') || 'Tên Công ty / Tổ chức'} value={companyName} onChange={setCompanyName} />

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted-fg)]">
              {t('leads.serviceInterest') || 'Dịch vụ quan tâm'}
            </label>
            <Select
              value={serviceInterest}
              onChange={setServiceInterest}
              options={[
                { value: 'WEBSITE', label: 'Thiết kế Website Corporate' },
                { value: 'APP_MVP', label: 'Xây dựng App MVP / Mobile App' },
                { value: 'BRANDING', label: 'Thiết kế Bộ nhận diện Thương hiệu' },
                { value: 'UI_UX', label: 'Thiết kế UI/UX & Prototype' },
                { value: 'CUSTOM', label: 'Dịch vụ Tùy chỉnh (Custom Solution)' },
              ]}
              className="w-full h-11"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted-fg)]">
              {t('leads.leadSource') || 'Nguồn Lead'}
            </label>
            <Select
              value={source}
              onChange={setSource}
              options={[
                { value: 'WEBSITE', label: 'Website Form' },
                { value: 'FACEBOOK', label: 'Facebook Lead Ads' },
                { value: 'LINKEDIN', label: 'LinkedIn Lead Gen' },
                { value: 'PORTFOLIO', label: 'Portfolio Contact' },
                { value: 'REFERRAL', label: 'Giới thiệu (Referral)' },
                { value: 'MANUAL', label: 'Nhập thủ công' },
              ]}
              className="w-full h-11"
            />
          </div>
        </div>
      </div>

      {/* Footer Action Toolbar */}
      <div className="pt-6 border-t border-[var(--color-border)]/40 flex justify-between items-center">
        <Button
          onClick={() => handleSave(false)}
          loading={isUpdating}
          className="flex items-center gap-2 h-10 px-4 rounded-xl cursor-pointer"
        >
          <Save size={16} />
          <span>{t('common.save') || 'Lưu thông tin'}</span>
        </Button>

        <Button
          type="primary"
          onClick={() => handleSave(true)}
          loading={isUpdating}
          className="flex items-center gap-2 h-10 px-6 rounded-xl cursor-pointer bg-[var(--color-accent)] font-semibold"
        >
          <span>Next</span>
          <ArrowRight size={16} />
        </Button>
      </div>
    </div>
  );
}
