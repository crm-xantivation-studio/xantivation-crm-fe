'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal, message, Select, Drawer, Spin } from 'antd';
import { useCustomers, useContacts, useCreateCustomer, useCreateContact, useUpdateCustomer, useUpdateContact, useDeleteCustomer, useDeleteContact } from '@/hooks/api/useCustomer';
import { Plus, Search, Download, Check, SlidersHorizontal } from 'lucide-react';
import SharedTable from '@/components/SharedTable';
import type { ColumnProps } from '@/components/SharedTable';
import { FloatingInput } from '@/components/FloatingInput';
import { FormSelect } from '@/components/FormSelect';
import { useDuplicateValidator } from '@/hooks/useDuplicateValidator';
import Link from 'next/link';

interface ContactRecord {
  id: string;
  firstName: string;
  lastName: string;
  name?: string;
  email: string;
  phone: string;
  role: string;
  jobTitle: string;
  isPrimary: boolean;
  companyId: string;
  companyName: string;
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
  contactsCount: number;
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
    contactsCount: 1,
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
    contactsCount: 2,
  },
];

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
  },
  {
    id: '3',
    firstName: 'Alfred',
    lastName: 'Pennyworth',
    email: 'alfred@cybercore.io',
    phone: '+15550200',
    role: 'COO',
    jobTitle: 'Chief Operating Officer',
    isPrimary: false,
    companyId: '2',
    companyName: 'CyberCore LLC',
  },
];

export default function Customers() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'accounts' | 'contacts'>('accounts');

  const { data: customersResponse, isLoading: isCustomersLoading } = useCustomers();
  const { data: contactsResponse, isLoading: isContactsLoading } = useContacts();

  const createCustomerMutation = useCreateCustomer();
  const updateCustomerMutation = useUpdateCustomer();
  const deleteCustomerMutation = useDeleteCustomer();

  const createContactMutation = useCreateContact();
  const updateContactMutation = useUpdateContact();
  const deleteContactMutation = useDeleteContact();

  const rawCustomers = customersResponse?.data || [];
  const accounts = rawCustomers.map((c: any) => ({
    id: c.id,
    code: c.code,
    name: c.name,
    email: c.email || '',
    phone: c.phone || '',
    address: c.address || '',
    taxCode: c.taxCode || '',
    website: c.website || '',
    industry: c.industry || '',
    clientType: c.clientType,
    status: c.status,
    contactsCount: c.contacts?.length || 0,
  }));

  const rawContacts = contactsResponse?.data || [];
  const contacts: ContactRecord[] = rawContacts.map((c: any) => {
    let firstName = c.firstName || '';
    let lastName = c.lastName || '';
    
    // If individual name fields are missing but composite name exists, split appropriately (ignore if it's an email string)
    const compositeCandidate = (c.name || c.fullName || '').trim();
    if (!firstName && !lastName && compositeCandidate && !compositeCandidate.includes('@')) {
      const parts = compositeCandidate.split(/\s+/);
      if (parts.length > 1) {
        firstName = parts.slice(0, -1).join(' ');
        lastName = parts[parts.length - 1];
      } else {
        firstName = parts[0] || '';
        lastName = '';
      }
    }

    const fullName = (firstName || lastName)
      ? `${firstName} ${lastName}`.trim()
      : (compositeCandidate && !compositeCandidate.includes('@') ? compositeCandidate : '—');

    const companyId = c.accountId || c.customerId || c.customer?.id || c.account?.id || c.account_id || c.customer_id || '';
    const companyName = c.account?.name || c.customer?.name || c.companyName || (companyId ? `Account #${companyId.substring(0, 8)}` : '—');

    return {
      id: c.id,
      firstName,
      lastName,
      name: fullName,
      email: c.email || '',
      phone: c.phone || '',
      role: c.role || '',
      jobTitle: c.jobTitle || '',
      isPrimary: c.isPrimary || false,
      companyId,
      companyName,
    };
  });
  
  // Modal states
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AccountRecord | null>(null);
  const [editingContact, setEditingContact] = useState<ContactRecord | null>(null);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterClientType, setFilterClientType] = useState('ALL');
  const [filterPrimary, setFilterPrimary] = useState('ALL');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Account Form states
  const [accountName, setAccountName] = useState('');
  const [accountEmail, setAccountEmail] = useState('');
  const [accountPhone, setAccountPhone] = useState('');
  const [accountAddress, setAccountAddress] = useState('');
  const [taxCodeVal, setTaxCodeVal] = useState('');
  const [websiteVal, setWebsiteVal] = useState('');
  const [industryVal, setIndustryVal] = useState('');
  const [clientTypeVal, setClientTypeVal] = useState<'BUSINESS' | 'INDIVIDUAL'>('BUSINESS');
  const [accountStatus, setAccountStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');

  // Contact Form states
  const [contactFirstName, setContactFirstName] = useState('');
  const [contactLastName, setContactLastName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactRoleVal, setContactRoleVal] = useState('');
  const [contactJobTitle, setContactJobTitle] = useState('');
  const [contactIsPrimary, setContactIsPrimary] = useState(false);
  const [contactCompanyId, setContactCompanyId] = useState('1');

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Real-time debounced duplicate validator for Accounts (SCRUM-70, SCRUM-80)
  const {
    duplicateErrors: accountDuplicateErrors,
    hasDuplicate: hasAccountDuplicate,
    setFieldValue: setAccountDuplicateField,
    clearDuplicates: clearAccountDuplicates,
  } = useDuplicateValidator<AccountRecord>({
    records: accounts,
    currentId: editingAccount?.id,
    rules: [
      {
        field: 'email',
        label: 'Email',
        matcher: (item, val) => Boolean(item.email && item.email.toLowerCase() === val.toLowerCase()),
      },
      {
        field: 'phone',
        label: 'Số điện thoại',
        matcher: (item, val) => Boolean(item.phone && item.phone.trim() === val.trim()),
      },
      {
        field: 'taxCode',
        label: 'Mã số thuế',
        matcher: (item, val) => Boolean(item.taxCode && item.taxCode.trim() === val.trim()),
      },
    ],
  });

  // Real-time debounced duplicate validator for Contacts (SCRUM-70, SCRUM-80)
  const {
    duplicateErrors: contactDuplicateErrors,
    hasDuplicate: hasContactDuplicate,
    setFieldValue: setContactDuplicateField,
    clearDuplicates: clearContactDuplicates,
  } = useDuplicateValidator<ContactRecord>({
    records: contacts,
    currentId: editingContact?.id,
    rules: [
      {
        field: 'email',
        label: 'Email',
        matcher: (item, val) => Boolean(item.email && item.email.toLowerCase() === val.toLowerCase()),
      },
      {
        field: 'phone',
        label: 'Số điện thoại',
        matcher: (item, val) => Boolean(item.phone && item.phone.trim() === val.trim()),
      },
    ],
  });

  // Bulk selection states
  const [selectedAccountKeys, setSelectedAccountKeys] = useState<React.Key[]>([]);
  const [selectedContactKeys, setSelectedContactKeys] = useState<React.Key[]>([]);

  // Columns for Accounts Table
  const accountColumns: ColumnProps<AccountRecord>[] = [
    {
      title: t('customers.accountCode'),
      dataIndex: 'code',
      key: 'code',
      render: (val, rec) => (
        <Link href={`/customers/accounts/${rec.id}`} className="font-mono text-xs font-semibold bg-[var(--color-surface)] px-2.5 py-1 rounded-lg border border-[var(--color-border)] hover:text-[var(--color-accent)] transition-colors">
          {val}
        </Link>
      ),
    },
    {
      title: t('customers.companyName'),
      dataIndex: 'name',
      key: 'name',
      render: (val, rec) => (
        <Link href={`/customers/accounts/${rec.id}`} className="font-semibold text-[var(--color-fg)] hover:underline">
          {val}
        </Link>
      ),
    },
    { title: t('customers.taxCode'), dataIndex: 'taxCode', key: 'taxCode', render: (val) => <span className="font-mono text-xs text-[var(--color-muted-fg)]">{val || 'N/A'}</span> },
    { title: t('customers.phone'), dataIndex: 'phone', key: 'phone' },
    { title: t('customers.email'), dataIndex: 'email', key: 'email' },
    {
      title: t('customers.clientType'),
      dataIndex: 'clientType',
      key: 'clientType',
      render: (val) => <span className="text-xs font-semibold">{val}</span>,
    },
    {
      title: t('customers.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
          status === 'ACTIVE' ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500'
        }`}>{status}</span>
      ),
    },
    {
      title: t('customers.contacts'),
      dataIndex: 'contactsCount',
      key: 'contactsCount',
      render: (count) => <span className="text-xs text-[var(--color-muted-fg)] font-mono font-semibold">{count}</span>,
    },
  ];

  // Columns for Contacts Table
  const contactColumns: ColumnProps<ContactRecord>[] = [
    {
      title: t('customers.name'),
      dataIndex: 'name',
      key: 'name',
      render: (_, rec) => (
        <Link href={`/customers/contacts/${rec.id}`} className="font-semibold text-[var(--color-fg)] hover:underline">
          {(rec.name && rec.name !== '—' && !rec.name.includes('@')) ? rec.name : `${rec.firstName || ''} ${rec.lastName || ''}`.trim() || 'Người liên hệ'}
        </Link>
      ),
    },
    { title: t('customers.email'), dataIndex: 'email', key: 'email' },
    { title: t('customers.phone'), dataIndex: 'phone', key: 'phone' },
    { title: t('customers.jobTitle'), dataIndex: 'jobTitle', key: 'jobTitle', render: (val) => <span className="text-xs">{val || 'N/A'}</span> },
    {
      title: t('customers.account'),
      dataIndex: 'companyName',
      key: 'companyName',
      render: (val, rec) => (
        rec.companyId ? (
          <Link href={`/customers/accounts/${rec.companyId}`} className="text-xs font-semibold text-[var(--color-accent)] hover:underline">
            {val || '—'}
          </Link>
        ) : (
          <span className="text-xs text-[var(--color-muted-fg)]">{val || '—'}</span>
        )
      ),
    },
    {
      title: t('customers.primary'),
      dataIndex: 'isPrimary',
      key: 'isPrimary',
      render: (isPri) => isPri ? (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
          <Check size={10} /> {t('customers.primary')}
        </span>
      ) : <span className="text-xs text-[var(--color-muted-fg)]">-</span>,
    },
  ];

  // Save Account
  const handleSaveAccount = () => {
    const newErrors: Record<string, string> = {};
    if (!accountName.trim()) newErrors.accountName = 'Account name is required';
    if (!accountEmail.trim() || !accountEmail.includes('@')) newErrors.accountEmail = 'Please enter a valid email address';
    if (!accountPhone.trim()) newErrors.accountPhone = 'Please enter a valid phone number';
    if (clientTypeVal === 'BUSINESS' && !taxCodeVal.trim()) {
      newErrors.taxCode = 'Tax code is required for B2B accounts';
    } else if (taxCodeVal && !/^[0-9]{10}(-[0-9]{3})?$/.test(taxCodeVal)) {
      newErrors.taxCode = 'Invalid tax code format (10 or 13 digits)';
    }

    if (hasAccountDuplicate) {
      message.error('Vui lòng giải quyết các cảnh báo trùng lặp trước khi lưu');
      return;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload = {
      name: accountName.trim(),
      email: accountEmail.trim(),
      phone: accountPhone.trim(),
      address: accountAddress.trim(),
      taxCode: taxCodeVal.trim(),
      website: websiteVal.trim(),
      industry: industryVal,
      clientType: clientTypeVal as any,
      status: accountStatus as any,
    };

    if (editingAccount) {
      updateCustomerMutation.mutate(
        { id: editingAccount.id, dto: payload },
        {
          onSuccess: () => {
            setAccountModalOpen(false);
          },
        }
      );
    } else {
      createCustomerMutation.mutate(payload, {
        onSuccess: () => {
          setAccountModalOpen(false);
        },
      });
    }
  };

  // Save Contact
  const handleSaveContact = () => {
    const newErrors: Record<string, string> = {};
    if (!contactLastName.trim()) newErrors.contactLastName = 'Last name is required';
    if (!contactEmail.trim() || !contactEmail.includes('@')) newErrors.contactEmail = 'Please enter a valid email address';
    if (!contactPhone.trim()) newErrors.contactPhone = 'Please enter a valid phone number';

    if (hasContactDuplicate) {
      message.error('Vui lòng giải quyết các cảnh báo trùng lặp trước khi lưu');
      return;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload = {
      firstName: contactFirstName.trim(),
      lastName: contactLastName.trim(),
      email: contactEmail.trim(),
      phone: contactPhone.trim(),
      role: contactRoleVal,
      jobTitle: contactJobTitle.trim(),
      isPrimary: contactIsPrimary,
      accountId: contactCompanyId,
    };

    if (editingContact) {
      updateContactMutation.mutate(
        { id: editingContact.id, dto: payload },
        {
          onSuccess: () => {
            setContactModalOpen(false);
          },
        }
      );
    } else {
      createContactMutation.mutate(payload, {
        onSuccess: () => {
          setContactModalOpen(false);
        },
      });
    }
  };

  // Filter Accounts & Contacts
  const filteredAccounts = accounts.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          a.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          a.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || a.status === filterStatus;
    const matchesType = filterClientType === 'ALL' || a.clientType === filterClientType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const filteredContacts = contacts.filter((c: any) => {
    const matchesSearch =
      (c.name && c.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.firstName && c.firstName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.lastName && c.lastName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.companyName && c.companyName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesPrimary = filterPrimary === 'ALL' || (filterPrimary === 'PRIMARY' && c.isPrimary) || (filterPrimary === 'REGULAR' && !c.isPrimary);
    return matchesSearch && matchesPrimary;
  });

  const handleOpenAccountCreate = () => {
    setEditingAccount(null);
    setAccountName('');
    setAccountEmail('');
    setAccountPhone('');
    setAccountAddress('');
    setTaxCodeVal('');
    setWebsiteVal('');
    setIndustryVal('');
    setClientTypeVal('BUSINESS');
    setAccountStatus('ACTIVE');
    setErrors({});
    clearAccountDuplicates();
    setAccountModalOpen(true);
  };

  const handleOpenAccountEdit = (rec: AccountRecord) => {
    setEditingAccount(rec);
    setAccountName(rec.name);
    setAccountEmail(rec.email);
    setAccountPhone(rec.phone);
    setAccountAddress(rec.address);
    setTaxCodeVal(rec.taxCode);
    setWebsiteVal(rec.website);
    setIndustryVal(rec.industry);
    setClientTypeVal(rec.clientType);
    setAccountStatus(rec.status);
    setErrors({});
    clearAccountDuplicates();
    setAccountModalOpen(true);
  };

  const handleOpenContactCreate = () => {
    setEditingContact(null);
    setContactFirstName('');
    setContactLastName('');
    setContactEmail('');
    setContactPhone('');
    setContactRoleVal('');
    setContactJobTitle('');
    setContactIsPrimary(false);
    setContactCompanyId(accounts[0]?.id || '');
    setErrors({});
    clearContactDuplicates();
    setContactModalOpen(true);
  };

  const handleOpenContactEdit = (rec: ContactRecord) => {
    setEditingContact(rec);
    setContactFirstName(rec.firstName);
    setContactLastName(rec.lastName);
    setContactEmail(rec.email);
    setContactPhone(rec.phone);
    setContactRoleVal(rec.role);
    setContactJobTitle(rec.jobTitle);
    setContactIsPrimary(rec.isPrimary);
    setContactCompanyId(rec.companyId);
    setErrors({});
    clearContactDuplicates();
    setContactModalOpen(true);
  };

  const activeFiltersCount =
    activeTab === 'accounts'
      ? (filterStatus !== 'ALL' ? 1 : 0) + (filterClientType !== 'ALL' ? 1 : 0)
      : (filterPrimary !== 'ALL' ? 1 : 0);

  return (
    <div className="space-y-4">
      {/* Title & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-base font-semibold tracking-tight text-[var(--color-fg)]">{t('customers.title')}</h1>
          <p className="text-xs text-[var(--color-muted-fg)] mt-1">{t('customers.subtitle')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Search bar */}
          <div className="flex items-center gap-2 bg-[var(--color-bg-tint)] border border-[var(--color-border)] rounded-xl px-3 py-2 w-full md:w-64">
            <Search size={15} className="text-[var(--color-muted-fg)]" />
            <input
              type="text"
              placeholder={t('customers.searchPlaceholder',{tab:activeTab === 'accounts' ? 'accounts' : 'contacts'})}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-xs text-[var(--color-fg)] placeholder-[var(--color-muted-fg)] w-full"
            />
          </div>

          {/* Filters Button */}
          <button
            onClick={() => setFilterDrawerOpen(true)}
            title="Filters"
            className={`w-9 h-9 flex items-center justify-center rounded-xl border transition-all cursor-pointer relative shrink-0 ${
              activeFiltersCount > 0
                ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
                : 'border-[var(--color-border)] hover:bg-[var(--color-surface)] text-[var(--color-muted-fg)] hover:text-[var(--color-fg)] bg-[var(--color-bg-tint)]'
            }`}
          >
            <SlidersHorizontal size={15} />
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[var(--color-accent)] text-white text-[9px] flex items-center justify-center font-bold animate-pulse">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Export Excel Button */}
          <button
            onClick={() => message.success('Exporting accounts to Excel sheet...')}
            title={t('customers.exportExcel')}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-[var(--color-border)] hover:bg-[var(--color-surface)] bg-[var(--color-bg-tint)] text-[var(--color-muted-fg)] hover:text-[var(--color-fg)] transition-all cursor-pointer shrink-0"
          >
            <Download size={15} />
          </button>

          {/* New Account / Contact Button */}
          <button
            onClick={activeTab === 'accounts' ? handleOpenAccountCreate : handleOpenContactCreate}
            title={activeTab === 'accounts' ? t('customers.newAccount') : t('customers.newContact')}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white shadow-xs transition-all cursor-pointer shrink-0"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Tabs Switcher & Helper Tip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-border)]">
        <div className="flex gap-6">
          <button
            onClick={() => { setActiveTab('accounts'); setSearchQuery(''); }}
            className={`pb-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'accounts'
                ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
                : 'border-transparent text-[var(--color-muted-fg)] hover:text-[var(--color-fg)]'
            }`}
          >
            {t('customers.accounts')} ({accounts.length})
          </button>
          <button
            onClick={() => { setActiveTab('contacts'); setSearchQuery(''); }}
            className={`pb-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'contacts'
                ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
                : 'border-transparent text-[var(--color-muted-fg)] hover:text-[var(--color-fg)]'
            }`}
          >
            {t('customers.contacts')} ({contacts.length})
          </button>
        </div>

        <div className="pb-2 text-xs text-[var(--color-muted-fg)] flex items-center gap-1.5 font-mono">
          <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] inline-block"></span>
          <span>
            {activeTab === 'accounts' 
              ? 'Accounts: Company & organization entities holding deals, contracts, and billing.'
              : 'Contacts: Individual people & stakeholders associated with a Customer Account.'}
          </span>
        </div>
      </div>

      {/* Advanced Filter Drawer */}
      <Drawer
        title={
          <div className="flex items-center justify-between w-full pr-4">
            <span className="text-base font-bold text-[var(--color-fg)]">Advanced Filters</span>
            {activeFiltersCount > 0 && (
              <button
                onClick={() => {
                  if (activeTab === 'accounts') {
                    setFilterStatus('ALL');
                    setFilterClientType('ALL');
                  } else {
                    setFilterPrimary('ALL');
                  }
                }}
                className="text-[11px] font-semibold text-[var(--color-accent)] hover:underline cursor-pointer"
              >
                Clear all
              </button>
            )}
          </div>
        }
        placement="right"
        width={360}
        onClose={() => setFilterDrawerOpen(false)}
        open={filterDrawerOpen}
        styles={{
          body: {
            background: 'var(--color-bg)',
            color: 'var(--color-fg)',
          },
          header: {
            background: 'var(--color-bg)',
            borderBottom: '1px solid var(--color-border)',
          }
        }}
      >
        <div className="space-y-4">
          {activeTab === 'accounts' ? (
            <>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted-fg)]">
                  {t('customers.accountStatus')}
                </label>
                <Select
                  value={filterStatus}
                  onChange={setFilterStatus}
                  className="w-full h-11"
                  options={[
                    { value: 'ALL', label: t('customers.allStatuses') },
                    { value: 'ACTIVE', label: t('customers.active') },
                    { value: 'INACTIVE', label: t('customers.inactive') },
                  ]}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted-fg)]">
                  {t('customers.clientType')}
                </label>
                <Select
                  value={filterClientType}
                  onChange={setFilterClientType}
                  className="w-full h-11"
                  options={[
                    { value: 'ALL', label: t('customers.allTypes') },
                    { value: 'BUSINESS', label: t('customers.business') },
                    { value: 'INDIVIDUAL', label: t('customers.individual') },
                  ]}
                />
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted-fg)]">
                {t('customers.contactRole')}
              </label>
              <Select
                value={filterPrimary}
                onChange={setFilterPrimary}
                className="w-full h-11"
                options={[
                  { value: 'ALL', label: t('customers.allRoles') },
                  { value: 'PRIMARY', label: t('customers.primaryOnly') },
                  { value: 'REGULAR', label: t('customers.regularOnly') },
                ]}
              />
            </div>
          )}
        </div>
      </Drawer>

      {/* Bulk selection actions */}
      {activeTab === 'accounts' && selectedAccountKeys.length > 0 && (
        <div className="bg-[var(--color-accent)]/5 border border-[var(--color-accent)]/20 p-3 rounded-xl flex justify-between items-center text-xs animate-in fade-in slide-in-from-top-2 duration-200">
          <span className="font-semibold text-[var(--color-fg)]">Selected {selectedAccountKeys.length} accounts</span>
          <div className="flex gap-2">
            <button
              onClick={() => {
                message.success(`Deactivated ${selectedAccountKeys.length} selected accounts.`);
                setSelectedAccountKeys([]);
              }}
              className="px-3 py-1 bg-white hover:bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg font-semibold cursor-pointer"
            >
              {t('customers.deactivate')}
            </button>
            <button
              onClick={() => {
                message.success(`Exporting ${selectedAccountKeys.length} accounts to Excel file...`);
                setSelectedAccountKeys([]);
              }}
              className="px-3 py-1 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white rounded-lg font-semibold cursor-pointer"
            >
              {t('customers.exportSelected')}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'contacts' && selectedContactKeys.length > 0 && (
        <div className="bg-[var(--color-accent)]/5 border border-[var(--color-accent)]/20 p-3 rounded-xl flex justify-between items-center text-xs animate-in fade-in slide-in-from-top-2 duration-200">
          <span className="font-semibold text-[var(--color-fg)]">Selected {selectedContactKeys.length} contacts</span>
          <div className="flex gap-2">
            <button
              onClick={() => {
                message.success(`Sent bulk sync invitation to ${selectedContactKeys.length} contacts.`);
                setSelectedContactKeys([]);
              }}
              className="px-3 py-1 bg-white hover:bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg font-semibold cursor-pointer"
            >
              {t('customers.sendSyncInvite')}
            </button>
          </div>
        </div>
      )}

      {/* Unified Table Container Canvas */}
      <div className="relative">
        <Spin spinning={activeTab === 'accounts' ? isCustomersLoading : isContactsLoading}>
          {activeTab === 'accounts' ? (
            <SharedTable
              columns={accountColumns}
              dataSource={filteredAccounts}
              onEdit={handleOpenAccountEdit}
              onDelete={(rec) => {
                Modal.confirm({
                  title: t('customers.confirmDeleteCustomer'),
                  content: t('customers.deleteCustomerContent',{name:rec.name}),
                  okText: t('customers.delete'),
                  cancelText: t('customers.cancel'),
                  okButtonProps: { danger: true },
                  onOk: () => {
                    deleteCustomerMutation.mutate(rec.id);
                  },
                });
              }}
              rowSelection={{
                selectedRowKeys: selectedAccountKeys,
                onChange: (keys) => setSelectedAccountKeys(keys),
              }}
            />
          ) : (
            <SharedTable
              columns={contactColumns}
              dataSource={filteredContacts}
              onEdit={handleOpenContactEdit}
              onDelete={(rec) => {
                Modal.confirm({
                  title: t('customers.confirmDeleteContact'),
                  content: t('customers.deleteContactContent',{name:`${rec.firstName} ${rec.lastName}`}),
                  okText: t('customers.delete'),
                  cancelText: t('customers.cancel'),
                  okButtonProps: { danger: true },
                  onOk: () => {
                    deleteContactMutation.mutate(rec.id);
                  },
                });
              }}
              rowSelection={{
                selectedRowKeys: selectedContactKeys,
                onChange: (keys) => setSelectedContactKeys(keys),
              }}
            />
          )}
        </Spin>
      </div>

      {/* Create / Edit Account Modal */}
      <Modal
        title={editingAccount ? t('customers.editAccount') : t('customers.createAccount')}
        open={accountModalOpen}
        onCancel={() => setAccountModalOpen(false)}
        footer={null}
        width={600}
        zIndex={1050}
      >
        <div className="space-y-6 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <FormSelect
              label={t('customers.clientType')}
              value={clientTypeVal}
              onChange={(val: any) => setClientTypeVal(val)}
              options={[
                { value: 'BUSINESS', label: t('customers.businessB2b') },
                { value: 'INDIVIDUAL', label: t('customers.individualB2c') },
              ]}
            />
            <FormSelect
              label={t('customers.accountStatus')}
              value={accountStatus}
              onChange={(val: any) => setAccountStatus(val)}
              options={[
                { value: 'ACTIVE', label: t('customers.active') },
                { value: 'INACTIVE', label: t('customers.inactive') },
              ]}
            />
          </div>

          <FloatingInput
            label={t('customers.companyAccountName')}
            value={accountName}
            onChange={setAccountName}
            required
            error={errors.accountName}
          />

          <div className="grid grid-cols-2 gap-4">
            <FloatingInput
              label={t('customers.emailAddress')}
              type="email"
              value={accountEmail}
              onChange={(val) => {
                setAccountEmail(val);
                setAccountDuplicateField('email', val);
              }}
              required
              error={accountDuplicateErrors.email || errors.accountEmail}
            />
            <FloatingInput
              label={t('customers.phoneNumber')}
              type="tel"
              value={accountPhone}
              onChange={(val) => {
                setAccountPhone(val);
                setAccountDuplicateField('phone', val);
              }}
              required
              error={accountDuplicateErrors.phone || errors.accountPhone}
            />
          </div>

          {clientTypeVal === 'BUSINESS' && (
            <div className="grid grid-cols-2 gap-4">
              <FloatingInput
                label={t('customers.taxCodeMst')}
                value={taxCodeVal}
                onChange={(val) => {
                  setTaxCodeVal(val);
                  setAccountDuplicateField('taxCode', val);
                }}
                required
                error={accountDuplicateErrors.taxCode || errors.taxCode}
              />
              <FloatingInput
                label={t('customers.industrySector')}
                value={industryVal}
                onChange={setIndustryVal}
              />
            </div>
          )}

          <FloatingInput label={t('customers.websiteAddress')} value={websiteVal} onChange={setWebsiteVal} />
          <FloatingInput label={t('customers.officeLocationAddress')} value={accountAddress} onChange={setAccountAddress} />

          <div className="flex justify-end gap-3 pt-4">
            <Button onClick={() => setAccountModalOpen(false)} className="rounded-xl">{t('customers.cancel')}</Button>
            <Button
              type="primary"
              onClick={handleSaveAccount}
              disabled={hasAccountDuplicate || createCustomerMutation.isPending || updateCustomerMutation.isPending}
              loading={createCustomerMutation.isPending || updateCustomerMutation.isPending}
              className="rounded-xl"
            >
              {t('customers.saveChanges')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create / Edit Contact Modal */}
      <Modal
        title={editingContact ? t('customers.editContact') : t('customers.createContact')}
        open={contactModalOpen}
        onCancel={() => setContactModalOpen(false)}
        footer={null}
        width={600}
        zIndex={1050}
      >
        <div className="space-y-6 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <FloatingInput
              label={t('customers.firstName')}
              value={contactFirstName}
              onChange={setContactFirstName}
            />
            <FloatingInput
              label={t('customers.lastName')}
              value={contactLastName}
              onChange={setContactLastName}
              required
              error={errors.contactLastName}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FloatingInput
              label={t('customers.emailAddress')}
              type="email"
              value={contactEmail}
              onChange={(val) => {
                setContactEmail(val);
                setContactDuplicateField('email', val);
              }}
              required
              error={contactDuplicateErrors.email || errors.contactEmail}
            />
            <FloatingInput
              label={t('customers.phoneNumber')}
              type="tel"
              value={contactPhone}
              onChange={(val) => {
                setContactPhone(val);
                setContactDuplicateField('phone', val);
              }}
              required
              error={contactDuplicateErrors.phone || errors.contactPhone}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FloatingInput label={t('customers.jobTitle')} value={contactJobTitle} onChange={setContactJobTitle} />
            <FloatingInput label={t('customers.internalRoleNotes')} value={contactRoleVal} onChange={setContactRoleVal} />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <FormSelect
              label={t('customers.associatedAccount')}
              value={contactCompanyId}
              onChange={(val: any) => setContactCompanyId(val)}
              options={accounts.map(a => ({ value: a.id, label: a.name }))}
            />
            
            <label className="flex items-center gap-3 cursor-pointer group mt-6 pl-4">
              <input
                type="checkbox"
                checked={contactIsPrimary}
                onChange={(e) => setContactIsPrimary(e.target.checked)}
                className="w-4 h-4 rounded accent-[var(--color-accent)] cursor-pointer"
              />
              <span className="text-sm text-[var(--color-fg)] select-none">{t('customers.setAsPrimary')}</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button onClick={() => setContactModalOpen(false)} className="rounded-xl">{t('customers.cancel')}</Button>
            <Button
              type="primary"
              onClick={handleSaveContact}
              disabled={hasContactDuplicate || createContactMutation.isPending || updateContactMutation.isPending}
              loading={createContactMutation.isPending || updateContactMutation.isPending}
              className="rounded-xl"
            >
              {t('customers.saveChanges')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
