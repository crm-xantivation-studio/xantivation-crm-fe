'use client';

import React, { useState, use } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, message, Select, Spin, Modal } from 'antd';
import { useContact, useUpdateContact, useDeleteContact, useSetPrimaryContact } from '@/hooks/api/useCustomer';
import { User, Mail, Phone, Briefcase, FileText, Check, ShieldCheck, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface ContactRecord {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  jobTitle: string;
  isPrimary: boolean;
  companyId: string;
  companyName: string;
  status: 'ACTIVE' | 'INACTIVE';
}

const mockContacts: ContactRecord[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@xantivation.dev',
    phone: '+84987654321',
    role: 'CTO',
    jobTitle: 'Chief Technology Officer',
    isPrimary: true,
    companyId: '1',
    companyName: 'Xantivation Dev',
    status: 'ACTIVE',
  },
  {
    id: '2',
    firstName: 'Bruce',
    lastName: 'Wayne',
    email: 'bruce@cybercore.io',
    phone: '+15550199',
    role: 'Founder',
    jobTitle: 'Chief Executive Officer',
    isPrimary: true,
    companyId: '2',
    companyName: 'CyberCore LLC',
    status: 'ACTIVE',
  },
];

export default function ContactDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t } = useTranslation();

  const { data: contactResponse, isLoading } = useContact(id);
  const deleteContactMutation = useDeleteContact();
  const updateContactMutation = useUpdateContact();

  const rawContact = contactResponse?.data;
  let parsedFirstName = rawContact?.firstName || '';
  let parsedLastName = rawContact?.lastName || '';
  const fallbackName = (rawContact?.name || rawContact?.fullName || '').trim();
  if (!parsedFirstName && !parsedLastName && fallbackName && !fallbackName.includes('@')) {
    const parts = fallbackName.split(/\s+/);
    if (parts.length > 1) {
      parsedFirstName = parts.slice(0, -1).join(' ');
      parsedLastName = parts[parts.length - 1];
    } else {
      parsedFirstName = parts[0] || '';
      parsedLastName = '';
    }
  }

  const contact = rawContact ? {
    id: rawContact.id,
    firstName: parsedFirstName,
    lastName: parsedLastName,
    displayName: (parsedFirstName || parsedLastName)
      ? `${parsedFirstName} ${parsedLastName}`.trim()
      : (fallbackName && !fallbackName.includes('@') ? fallbackName : 'Người liên hệ'),
    email: rawContact.email || '',
    phone: rawContact.phone || '',
    role: rawContact.role || '',
    jobTitle: rawContact.jobTitle || '',
    isPrimary: rawContact.isPrimary || false,
    companyId: rawContact.customer?.id || rawContact.account?.id || '',
    companyName: rawContact.customer?.name || rawContact.account?.name || '',
    status: rawContact.status || 'ACTIVE',
  } : undefined;

  const setPrimaryContactMutation = useSetPrimaryContact(contact?.companyId || '');

  const [activeSubTab, setActiveSubTab] = useState('overview');

  if (isLoading) {
    return (
      <div className="p-12 flex justify-center items-center h-96">
        <Spin size="large" description={t('customers.contactLoading')} />
      </div>
    );
  }

  if (!contact) {
    return <div className="p-8 text-center text-red-500 font-bold">{t('customers.contactNotFound')}</div>;
  }

  return (
    <div className="space-y-4">
      {/* Breadcrumbs & Title */}
      <div className="flex justify-between items-start shrink-0">
        <div>
          <div className="text-xs text-[var(--color-muted-fg)] flex items-center gap-1.5 mb-2 font-mono">
            <Link href="/customers" className="hover:underline">{t('customers.breadcrumbCustomers')}</Link>
            <span>&gt;</span>
            <span className="text-xs text-[var(--color-muted-fg)]">{t('customers.breadcrumbContacts')}</span>
            <span>&gt;</span>
            <span className="text-[var(--color-fg)] font-semibold">{contact.firstName} {contact.lastName}</span>
          </div>
          <h1 className="text-base font-semibold sm: tracking-tight text-[var(--color-fg)]">
            {contact.firstName} {contact.lastName}
          </h1>
          <p className="text-xs text-[var(--color-muted-fg)]">{t('customers.associatedAccount')}: <Link href={`/customers/accounts/${contact.companyId}`} className="text-[var(--color-accent)] hover:underline">{contact.companyName}</Link></p>
        </div>

        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            contact.status === 'ACTIVE' ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500'
          }`}>
            {t('customers.status')}: {contact.status}
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Side: Sub Tabs & Content (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Sub Navigation */}
          <div className="flex gap-6 border-b border-[var(--color-border)]">
            {[
              { id: 'overview', name: t('customers.tabOverview') },
              { id: 'opportunities', name: t('customers.tabRepresentedOpportunities') },
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-xs font-mono uppercase tracking-widest text-[var(--color-muted-fg)]">
                      {t('customers.personalDetails')}
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2.5 text-sm">
                        <User size={16} className="text-[var(--color-muted-fg)]" />
                        <span className="text-[var(--color-fg)] font-medium">
                          {contact.firstName} {contact.lastName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5 text-sm">
                        <Mail size={16} className="text-[var(--color-muted-fg)]" />
                        <span className="text-[var(--color-fg)] font-mono">{contact.email}</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-sm">
                        <Phone size={16} className="text-[var(--color-muted-fg)]" />
                        <span className="text-[var(--color-fg)] font-mono">{contact.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-mono uppercase tracking-widest text-[var(--color-muted-fg)]">
                      {t('customers.professionalInfo')}
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2.5 text-sm">
                        <Briefcase size={16} className="text-[var(--color-muted-fg)]" />
                        <span className="text-[var(--color-fg)] font-medium">{contact.jobTitle || t('customers.na')}</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-sm">
                        <ShieldCheck size={16} className="text-[var(--color-muted-fg)]" />
                        <span className="text-[var(--color-fg)]">{t('customers.internalRole')}: {contact.role || t('customers.representative')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Primary status block */}
                {contact.isPrimary && (
                  <div className="pt-6 border-t border-[var(--color-border)]/50">
                    <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl flex items-start gap-3">
                      <Check size={16} className="text-amber-600 mt-0.5" />
                      <div className="text-xs text-amber-800 space-y-1">
                        <p className="font-semibold uppercase tracking-wider">{t('customers.primaryAccountContact')}</p>
                        <p>{t('customers.primaryAccountContactDesc', { companyName: contact.companyName })}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeSubTab === 'opportunities' && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-[var(--color-fg)]">{t('customers.representedOpportunities')}</h3>
                <div className="p-6 bg-[var(--color-surface)]/20 border border-[var(--color-border)]/50 rounded-[5px] flex flex-col gap-3 justify-center min-h-[160px] text-center text-[var(--color-muted-fg)] text-xs font-mono">
                  <FileText size={32} className="mx-auto text-[var(--color-accent)]/50" />
                  <span>{t('customers.noContactOpportunities')}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Sidebar Actions (1 col) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[var(--color-bg-tint)] border border-[var(--color-border)] rounded-[5px] p-6 space-y-6">
            <h3 className="text-xs font-mono uppercase tracking-widest text-[var(--color-muted-fg)]">
              {t('customers.contactControlPanel')}
            </h3>

            {/* Set Primary Button */}
            {!contact.isPrimary && (
              <Button
                type="primary"
                onClick={() => {
                  setPrimaryContactMutation.mutate(contact.id);
                }}
                className="w-full h-10 rounded-xl"
              >
                {t('customers.setAsPrimary')}
              </Button>
            )}

            {/* Change Status */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted-fg)]">
                {t('customers.statusSetting')}
              </label>
              <Select
                value={contact.status}
                onChange={(val) => {
                  updateContactMutation.mutate({ id, dto: { status: val } });
                }}
                options={[
                  { value: 'ACTIVE', label: t('customers.active') },
                  { value: 'INACTIVE', label: t('customers.inactive') },
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
                    title: t('customers.confirmDeleteTitle'),
                    content: t('customers.confirmDeleteContactContent'),
                    okText: t('customers.delete'),
                    cancelText: t('customers.cancel'),
                    okButtonProps: { danger: true },
                    onOk: () => {
                      deleteContactMutation.mutate(id, {
                        onSuccess: () => {
                          window.location.href = '/customers';
                        },
                      });
                    },
                  });
                }}
                className="w-full flex items-center justify-center gap-2 h-10 rounded-xl cursor-pointer"
              >
                <Trash2 size={16} />
                <span>{t('customers.deleteContact')}</span>
              </Button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
