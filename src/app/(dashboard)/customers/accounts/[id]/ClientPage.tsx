'use client';

import React, { useState, use } from 'react';
import { Button, Modal, message, Select, Spin } from 'antd';
import { useCustomer, useCreateContact, useSetPrimaryContact, useUpdateCustomer, useDeleteCustomer } from '@/hooks/api/useCustomer';
import { Building, Landmark, Globe, MapPin, Calendar, Plus, FileText, Trash2 } from 'lucide-react';
import { FloatingInput } from '@/components/FloatingInput';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  jobTitle: string;
  isPrimary: boolean;
}

interface AccountRecord {
  id: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  taxCode: string;
  website: string;
  industry: string;
  clientType: 'BUSINESS' | 'INDIVIDUAL';
  status: 'ACTIVE' | 'INACTIVE';
  assignedTo: string;
  createdAt: string;
}

const mockAccounts: AccountRecord[] = [
  {
    id: '1',
    code: 'ACC-2026-00001',
    name: 'Xantivation Dev',
    email: 'contact@xantivation.dev',
    phone: '+84987654321',
    address: 'Hanoi, Vietnam',
    taxCode: '0102030405',
    website: 'https://xantivation.dev',
    industry: 'Technology',
    clientType: 'BUSINESS',
    status: 'ACTIVE',
    assignedTo: 'System Admin',
    createdAt: '2026-07-01',
  },
  {
    id: '2',
    code: 'ACC-2026-00002',
    name: 'CyberCore LLC',
    email: 'hello@cybercore.io',
    phone: '+15550199',
    address: 'California, US',
    taxCode: '9988776655',
    website: 'https://cybercore.io',
    industry: 'F&B',
    clientType: 'BUSINESS',
    status: 'ACTIVE',
    assignedTo: 'Jane Smith',
    createdAt: '2026-07-03',
  },
];

const mockContacts: Contact[] = [
  { id: '1', name: 'John Doe', email: 'john@xantivation.dev', phone: '+84987654321', jobTitle: 'Chief Technology Officer', isPrimary: true },
];

export default function AccountDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t } = useTranslation();

  const { data: customerResponse, isLoading } = useCustomer(id);
  const createContactMutation = useCreateContact();
  const setPrimaryContactMutation = useSetPrimaryContact(id);
  const updateCustomerMutation = useUpdateCustomer();
  const deleteCustomerMutation = useDeleteCustomer();

  const rawCustomer = customerResponse?.data;
  const account = rawCustomer ? {
    id: rawCustomer.id,
    code: rawCustomer.code,
    name: rawCustomer.name,
    email: rawCustomer.email || '',
    phone: rawCustomer.phone || '',
    address: rawCustomer.address || '',
    taxCode: rawCustomer.taxCode || '',
    website: rawCustomer.website || '',
    industry: rawCustomer.industry || '',
    clientType: rawCustomer.clientType,
    status: rawCustomer.status,
    assignedTo: rawCustomer.assignedTo?.name || 'System Admin',
    createdAt: rawCustomer.createdAt ? rawCustomer.createdAt.substring(0, 10) : '',
  } : undefined;

  const contacts = rawCustomer?.contacts?.map((c: any) => ({
    id: c.id,
    name: c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim(),
    email: c.email || '',
    phone: c.phone || '',
    jobTitle: c.jobTitle || '',
    isPrimary: c.isPrimary || false,
  })) || [];

  const [activeSubTab, setActiveSubTab] = useState('overview');

  // Contact Creation Modal inside Account detail
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactJobTitle, setContactJobTitle] = useState('');
  const [isPrimaryVal, setIsPrimaryVal] = useState(false);

  // Private notes state
  const [notes, setNotes] = useState('First meeting notes: Client wants to start standard website design project next month.');
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState(notes);

  if (isLoading) {
    return (
      <div className="p-12 flex justify-center items-center h-96">
        <Spin size="large" description={t('customers.loading')} />
      </div>
    );
  }

  if (!account) {
    return <div className="p-8 text-center text-red-500 font-bold">{t('customers.accountNotFound')}</div>;
  }

  const handleAddContact = () => {
    if (!lastName.trim() || !contactEmail.trim() || !contactPhone.trim()) {
      message.error(t('customers.requiredFields'));
      return;
    }

    createContactMutation.mutate(
      {
        firstName,
        lastName,
        email: contactEmail,
        phone: contactPhone,
        jobTitle: contactJobTitle,
        isPrimary: isPrimaryVal,
        accountId: id,
      },
      {
        onSuccess: () => {
          setFirstName('');
          setLastName('');
          setContactEmail('');
          setContactPhone('');
          setContactJobTitle('');
          setIsPrimaryVal(false);
          setContactModalOpen(false);
        },
      }
    );
  };

  const handleSetPrimary = (contactId: string) => {
    setPrimaryContactMutation.mutate(contactId);
  };

  const handleSaveNotes = () => {
    setNotes(notesDraft);
    setEditingNotes(false);
    message.success(t('customers.notesSaved'));
  };

  return (
    <div className="space-y-8">
      {/* Breadcrumbs & Title */}
      <div className="flex justify-between items-start shrink-0">
        <div>
          <div className="text-xs text-[var(--color-muted-fg)] flex items-center gap-1.5 mb-2 font-mono">
            <Link href="/customers" className="hover:underline">{t('customers.breadcrumbCustomers')}</Link>
            <span>&gt;</span>
            <span className="text-[var(--color-fg)] font-semibold">{account.code}</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--color-fg)]">
            {account.name}
          </h1>
          <p className="text-sm text-[var(--color-muted-fg)]">{t('customers.accountCode')}: {account.code} • {account.industry}</p>
        </div>

        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            account.status === 'ACTIVE' ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500'
          }`}>
            {t('customers.status')}: {account.status}
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
              { id: 'overview', name: t('customers.tabOverview') },
              { id: 'contacts', name: t('customers.tabContacts') },
              { id: 'opportunities', name: t('customers.tabOpportunities') },
              { id: 'contracts', name: t('customers.tabContracts') },
              { id: 'notes', name: t('customers.tabNotes') },
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-xs font-mono uppercase tracking-widest text-[var(--color-muted-fg)]">
                      {t('customers.businessDetails')}
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2.5 text-sm">
                        <Building size={16} className="text-[var(--color-muted-fg)]" />
                        <span className="text-[var(--color-fg)] font-medium">{account.name}</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-sm">
                        <Landmark size={16} className="text-[var(--color-muted-fg)]" />
                        <span className="text-[var(--color-fg)] font-mono">{t('customers.taxCode', { code: account.taxCode || t('customers.na') })}</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-sm">
                        <Globe size={16} className="text-[var(--color-muted-fg)]" />
                        <a href={account.website} target="_blank" className="text-[var(--color-accent)] font-mono hover:underline">{account.website || t('customers.na')}</a>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-mono uppercase tracking-widest text-[var(--color-muted-fg)]">
                      {t('customers.locationsDates')}
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2.5 text-sm">
                        <MapPin size={16} className="text-[var(--color-muted-fg)]" />
                        <span className="text-[var(--color-fg)]">{account.address}</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-sm">
                        <Calendar size={16} className="text-[var(--color-muted-fg)]" />
                        <span className="text-[var(--color-muted-fg)]">{t('customers.createdAt')}: {account.createdAt}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSubTab === 'contacts' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-semibold text-[var(--color-fg)]">{t('customers.keyContacts')}</h3>
                  <Button type="primary" onClick={() => setContactModalOpen(true)} className="flex items-center gap-2 h-9 px-4 rounded-xl cursor-pointer">
                    <Plus size={14} />
                    <span>{t('customers.addContact')}</span>
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {contacts.map(c => (
                    <div key={c.id} className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl space-y-3 relative group">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-sm text-[var(--color-fg)]">{c.name}</h4>
                          <p className="text-xs text-[var(--color-muted-fg)]">{c.jobTitle}</p>
                        </div>
                        {c.isPrimary && (
                          <span className="text-[9px] font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            {t('customers.primary')}
                          </span>
                        )}
                      </div>
                      <div className="space-y-1.5 text-xs text-[var(--color-muted-fg)] font-mono">
                        <p>{c.email}</p>
                        <p>{c.phone}</p>
                      </div>
                      {!c.isPrimary && (
                        <button
                          onClick={() => handleSetPrimary(c.id)}
                          className="opacity-0 group-hover:opacity-100 absolute bottom-4 right-4 text-xs font-semibold text-[var(--color-accent)] hover:underline cursor-pointer transition-opacity"
                        >
                          {t('customers.setPrimary')}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSubTab === 'opportunities' && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-[var(--color-fg)]">{t('customers.opportunitiesMiniTracker')}</h3>
                <div className="p-6 bg-[var(--color-surface)]/20 border border-[var(--color-border)]/50 rounded-2xl flex flex-col gap-3 justify-center min-h-[160px] text-center text-[var(--color-muted-fg)] text-xs font-mono">
                  <FileText size={32} className="mx-auto text-[var(--color-accent)]/50" />
                  <span>{t('customers.noOpportunities')}</span>
                </div>
              </div>
            )}

            {activeSubTab === 'contracts' && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-[var(--color-fg)]">{t('customers.relatedContracts')}</h3>
                <div className="p-6 bg-[var(--color-surface)]/20 border border-[var(--color-border)]/50 rounded-2xl flex flex-col gap-3 justify-center min-h-[160px] text-center text-[var(--color-muted-fg)] text-xs font-mono">
                  <FileText size={32} className="mx-auto text-[var(--color-accent)]/50" />
                  <span>{t('customers.noContracts')}</span>
                </div>
              </div>
            )}

            {activeSubTab === 'notes' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-semibold text-[var(--color-fg)]">{t('customers.internalPrivateNotes')}</h3>
                  {!editingNotes ? (
                    <Button onClick={() => { setNotesDraft(notes); setEditingNotes(true); }} className="rounded-xl h-9 px-4 cursor-pointer">
                      {t('customers.editNotes')}
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button onClick={() => setEditingNotes(false)} className="rounded-xl h-9 px-4">{t('customers.cancel')}</Button>
                      <Button type="primary" onClick={handleSaveNotes} className="rounded-xl h-9 px-4">{t('customers.save')}</Button>
                    </div>
                  )}
                </div>

                {!editingNotes ? (
                  <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl min-h-[120px] text-xs text-[var(--color-fg)] whitespace-pre-wrap">
                    {notes || t('customers.noNotesSaved')}
                  </div>
                ) : (
                  <textarea
                    value={notesDraft}
                    onChange={(e) => setNotesDraft(e.target.value)}
                    className="w-full min-h-[120px] p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-fg)] focus:outline-none"
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Sidebar Actions (1 col) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[var(--color-bg-tint)] border border-[var(--color-border)] rounded-2xl p-6 space-y-6">
            <h3 className="text-xs font-mono uppercase tracking-widest text-[var(--color-muted-fg)]">
              {t('customers.accountControlPanel')}
            </h3>

            {/* Change Status */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted-fg)]">
                {t('customers.statusSetting')}
              </label>
              <Select
                value={account.status}
                onChange={(val) => {
                  updateCustomerMutation.mutate({ id, dto: { status: val } });
                }}
                options={[
                  { value: 'ACTIVE', label: t('customers.active') },
                  { value: 'INACTIVE', label: t('customers.inactive') },
                ]}
                className="w-full h-10"
              />
            </div>

            {/* Change Owner */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted-fg)]">
                {t('customers.assignedOwner')}
              </label>
              <Select
                value={account.assignedTo}
                onChange={(val) => {
                  updateCustomerMutation.mutate({ id, dto: { assignedToId: val } });
                }}
                options={[
                  { value: 'System Admin', label: 'System Admin' },
                  { value: 'Jane Smith', label: 'Jane Smith' },
                  { value: 'John Doe', label: 'John Doe' },
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
                    content: t('customers.confirmDeleteContent'),
                    okText: t('customers.delete'),
                    cancelText: t('customers.cancel'),
                    okButtonProps: { danger: true },
                    onOk: () => {
                      deleteCustomerMutation.mutate(id, {
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
                <span>{t('customers.deleteAccount')}</span>
              </Button>
            </div>
          </div>
        </div>

      </div>

      {/* Contact Creation Modal inside Account detail */}
      <Modal
        title={t('customers.addContactPerson')}
        open={contactModalOpen}
        onCancel={() => setContactModalOpen(false)}
        onOk={handleAddContact}
        okText={t('customers.addContact')}
        cancelText={t('customers.cancel')}
      >
        <div className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <FloatingInput label={t('customers.firstName')} value={firstName} onChange={setFirstName} />
            <FloatingInput label={t('customers.lastName')} value={lastName} onChange={setLastName} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FloatingInput label={t('customers.emailAddress')} type="email" value={contactEmail} onChange={setContactEmail} required />
            <FloatingInput label={t('customers.phoneNumber')} value={contactPhone} onChange={setContactPhone} required />
          </div>
          <FloatingInput label={t('customers.jobTitle')} value={contactJobTitle} onChange={setContactJobTitle} />
          
          <label className="flex items-center gap-3 cursor-pointer group mt-4">
            <input
              type="checkbox"
              checked={isPrimaryVal}
              onChange={(e) => setIsPrimaryVal(e.target.checked)}
              className="w-4 h-4 rounded accent-[var(--color-accent)] cursor-pointer"
            />
            <span className="text-xs text-[var(--color-fg)] select-none">{t('customers.setAsPrimary')}</span>
          </label>
        </div>
      </Modal>
    </div>
  );
}
