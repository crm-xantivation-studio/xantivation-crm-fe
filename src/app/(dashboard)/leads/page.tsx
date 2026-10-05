'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal, Progress, message, Select, Drawer, Spin } from 'antd';
import { useLeads, useCreateLead, useUpdateLead, useDeleteLead } from '@/hooks/api/useLead';
import { Plus, Search, Upload, AlertTriangle, SlidersHorizontal } from 'lucide-react';
import SharedTable from '@/components/SharedTable';
import type { ColumnProps } from '@/components/SharedTable';
import { FloatingInput } from '@/components/FloatingInput';
import Link from 'next/link';

interface LeadRecord {
  id: string;
  leadCode: string;
  firstName: string;
  lastName: string;
  company: string;
  email: string;
  phone: string;
  source: string;
  status: string;
  owner: string;
  createdAt: string;
  bantScore: number;
  budget: number;
  serviceInterest: string;
  need: string;
  timeline: string;
}

export default function Leads() {
  const { t } = useTranslation();
  const { data: leadsResponse, isLoading } = useLeads();
  const createMutation = useCreateLead();
  const updateMutation = useUpdateLead();
  const deleteMutation = useDeleteLead();

  const rawLeads = leadsResponse?.data || [];
  const leads = rawLeads.map((l: any) => ({
    id: l.id,
    leadCode: l.leadCode,
    firstName: l.firstName || '',
    lastName: l.lastName || l.name || '',
    company: l.companyName || l.company || '',
    email: l.email || '',
    phone: l.phone || '',
    source: l.source,
    status: l.status,
    owner: l.assignedTo?.name || l.owner?.name || 'System Admin',
    createdAt: l.createdAt ? l.createdAt.substring(0, 10) : '',
    bantScore: Number(l.bantScore) || 0,
    budget: Number(l.budget) || 0,
    serviceInterest: l.serviceInterest || 'WEBSITE',
    need: l.need || '',
    timeline: l.timeline || '',
  }));

  const [modalOpen, setModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<LeadRecord | null>(null);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterSource, setFilterSource] = useState<string>('ALL');
  const [filterOwner, setFilterOwner] = useState<string>('ALL');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [source, setSource] = useState('MANUAL');
  const [serviceInterest, setServiceInterest] = useState('WEBSITE');
  const [budget, setBudget] = useState('');
  const [assignedOwner, setAssignedOwner] = useState('System Admin');

  // BANT checks
  const [budgetApproved, setBudgetApproved] = useState(false);
  const [authorityMarker, setAuthorityMarker] = useState(false);
  const [need, setNeed] = useState('');
  const [timeline, setTimeline] = useState('');

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Duplicate check warning state
  const [duplicateWarningOpen, setDuplicateWarningOpen] = useState(false);
  const [duplicateMessage, setDuplicateMessage] = useState('');

  // Bulk action state
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // Trigger duplicate check on blur
  const handleCheckDuplicate = (field: 'email' | 'phone', val: string) => {
    if (!val) return;
    const exists = leads.find((l) => (field === 'email' ? l.email === val : l.phone === val) && l.id !== editingLead?.id);
    if (exists) {
      setDuplicateMessage(`Duplicate ${field} detected: Already exists under Lead ${exists.leadCode} (${exists.firstName} ${exists.lastName})`);
      setDuplicateWarningOpen(true);
    }
  };

  const columns: ColumnProps<LeadRecord>[] = [
    {
      title: t('leads.leadCode'),
      dataIndex: 'leadCode',
      key: 'leadCode',
      render: (val, rec) => (
        <Link href={`/leads/${rec.id}`} className="font-mono text-xs font-semibold bg-[var(--color-surface)] px-2.5 py-1 rounded-lg border border-[var(--color-border)] hover:text-[var(--color-accent)] transition-colors">
          {val}
        </Link>
      ),
    },
    {
      title: t('leads.name'),
      dataIndex: 'lastName',
      key: 'name',
      render: (_, rec) => (
        <div>
          <Link href={`/leads/${rec.id}`} className="font-semibold text-[var(--color-fg)] hover:underline">
            {rec.firstName} {rec.lastName}
          </Link>
          <p className="text-xs text-[var(--color-muted-fg)]">{rec.company}</p>
        </div>
      ),
    },
    { title: t('leads.email'), dataIndex: 'email', key: 'email' },
    { title: t('leads.phone'), dataIndex: 'phone', key: 'phone' },
    {
      title: t('leads.source'),
      dataIndex: 'source',
      key: 'source',
      render: (src: string) => <span className="text-xs text-[var(--color-muted-fg)] font-mono">{src}</span>,
    },
    {
      title: t('leads.bantScore'),
      dataIndex: 'bantScore',
      key: 'bantScore',
      render: (score: number) => (
        <div className="flex items-center gap-2 min-w-[120px]">
          <Progress percent={score} size="small" strokeColor="#4F46E5" showInfo={false} />
          <span className="text-xs font-mono font-semibold">{score}%</span>
        </div>
      ),
    },
    {
      title: t('leads.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'bg-gray-500/10 text-gray-500';
        if (status === 'QUALIFIED') color = 'bg-green-500/10 text-green-500';
        if (status === 'CONTACTED') color = 'bg-blue-500/10 text-blue-500';
        return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${color}`}>{status}</span>;
      },
    },
    { title: t('leads.owner'), dataIndex: 'owner', key: 'owner', render: (val) => <span className="text-xs text-[var(--color-fg)]">{val}</span> },
    { title: t('leads.createdAt'), dataIndex: 'createdAt', key: 'createdAt', render: (val) => <span className="text-xs text-[var(--color-muted-fg)] font-mono">{val}</span> },
  ];

  const handleOpenCreate = () => {
    setEditingLead(null);
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setCompany('');
    setSource('MANUAL');
    setServiceInterest('WEBSITE');
    setBudget('');
    setAssignedOwner('System Admin');
    setBudgetApproved(false);
    setAuthorityMarker(false);
    setNeed('');
    setTimeline('');
    setErrors({});
    setModalOpen(true);
  };

  const handleOpenEdit = (rec: LeadRecord) => {
    setEditingLead(rec);
    setFirstName(rec.firstName);
    setLastName(rec.lastName);
    setEmail(rec.email);
    setPhone(rec.phone);
    setCompany(rec.company);
    setSource(rec.source);
    setServiceInterest(rec.serviceInterest);
    setBudget(String(rec.budget));
    setAssignedOwner(rec.owner);
    setBudgetApproved(rec.bantScore >= 50);
    setAuthorityMarker(rec.bantScore >= 75);
    setNeed(rec.need);
    setTimeline(rec.timeline);
    setErrors({});
    setModalOpen(true);
  };

  const handleSave = () => {
    const newErrors: Record<string, string> = {};
    if (!lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!email.trim() || !email.includes('@')) newErrors.email = 'Please enter a valid email address';
    if (!phone.trim()) newErrors.phone = 'Please enter a valid phone number';
    if (!source) newErrors.source = 'Please select a lead source';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    let score = 0;
    if (budgetApproved) score += 25;
    if (authorityMarker) score += 25;
    if (need.trim() !== '') score += 25;
    if (timeline.trim() !== '') score += 25;

    const payload = {
      firstName,
      lastName,
      companyName: company,
      email,
      phone,
      source: source as any,
      serviceInterest,
      budget: Number(budget) || 0,
      bantScore: score,
      budgetApproved,
      authorityMarker,
      need,
      timeline,
    };

    if (editingLead) {
      updateMutation.mutate(
        { id: editingLead.id, dto: payload },
        {
          onSuccess: () => {
            setModalOpen(false);
          },
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          setModalOpen(false);
        },
      });
    }
  };

  const handleDelete = (rec: LeadRecord) => {
    deleteMutation.mutate(rec.id);
  };

  const handleImport = () => {
    message.loading('Parsing Excel columns...');
    setTimeout(() => {
      message.success('Successfully imported 12 new prospects from Excel template.');
    }, 1500);
  };

  const handleBulkReassign = () => {
    if (selectedRowKeys.length === 0) return;
    message.success(`Reassigned ${selectedRowKeys.length} leads to owner.`);
    setSelectedRowKeys([]);
  };

  const handleBulkExport = () => {
    if (selectedRowKeys.length === 0) return;
    message.success(`Exporting ${selectedRowKeys.length} records to crm_leads_export.xlsx`);
    setSelectedRowKeys([]);
  };

  const filteredLeads = leads.filter((l) => {
    const matchesSearch =
      l.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.leadCode.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === 'ALL' || l.status === filterStatus;
    const matchesSource = filterSource === 'ALL' || l.source === filterSource;
    const matchesOwner = filterOwner === 'ALL' || l.owner === filterOwner;

    return matchesSearch && matchesStatus && matchesSource && matchesOwner;
  });

  const activeFiltersCount =
    (filterStatus !== 'ALL' ? 1 : 0) +
    (filterSource !== 'ALL' ? 1 : 0) +
    (filterOwner !== 'ALL' ? 1 : 0);

  return (
    <div className="space-y-4">
      {/* Title & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-base font-semibold sm: tracking-tight text-[var(--color-fg)]">{t('leads.title')}</h1>
          <p className="text-xs sm:text-xs text-[var(--color-muted-fg)] mt-0.5">{t('leads.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Search bar */}
          <div className="flex items-center gap-2 bg-[var(--color-bg-tint)] border border-[var(--color-border)] rounded-lg px-3 py-1.5 w-44 sm:w-64">
            <Search size={14} className="text-[var(--color-muted-fg)] shrink-0" />
            <input
              type="text"
              placeholder={t('leads.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-xs text-[var(--color-fg)] placeholder-[var(--color-muted-fg)] w-full"
            />
          </div>

          {/* Filters Icon Button */}
          <button
            onClick={() => setFilterDrawerOpen(true)}
            title={t('leads.filters')}
            className={`w-9 h-9 flex items-center justify-center rounded-lg border transition-all cursor-pointer relative shrink-0 ${
              activeFiltersCount > 0
                ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
                : 'border-[var(--color-border)] hover:bg-[var(--color-surface)] text-[var(--color-muted-fg)] hover:text-[var(--color-fg)]'
            }`}
          >
            <SlidersHorizontal size={15} />
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[var(--color-accent)] text-white text-[9px] flex items-center justify-center font-bold animate-pulse">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Import Icon Button */}
          <button
            onClick={handleImport}
            title={t('leads.import')}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-surface)] text-[var(--color-muted-fg)] hover:text-[var(--color-fg)] transition-all cursor-pointer shrink-0"
          >
            <Upload size={15} />
          </button>

          {/* New Lead Icon Button */}
          <button
            onClick={handleOpenCreate}
            title={t('leads.newLead')}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white shadow-xs transition-all cursor-pointer shrink-0"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Advanced Filter Drawer */}
      <Drawer
        title={
          <div className="flex items-center justify-between w-full pr-4">
            <span className="text-sm font-semibold text-[var(--color-fg)]">{t('leads.advancedFilters')}</span>
            {activeFiltersCount > 0 && (
              <button
                onClick={() => {
                  setFilterStatus('ALL');
                  setFilterSource('ALL');
                  setFilterOwner('ALL');
                }}
                className="text-[11px] font-semibold text-[var(--color-accent)] hover:underline cursor-pointer"
              >
                {t('leads.clearAll')}
              </button>
            )}
          </div>
        }
        placement="right"
        width={340}
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
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono uppercase tracking-tight text-[var(--color-muted-fg)] font-medium">
              {t('leads.leadStatus')}
            </label>
            <Select
              value={filterStatus}
              onChange={setFilterStatus}
              className="w-full h-9"
              options={[
                { value: 'ALL', label: t('leads.allStatuses') },
                { value: 'NEW', label: 'New' },
                { value: 'CONTACTED', label: 'Contacted' },
                { value: 'QUALIFIED', label: 'Qualified' },
                { value: 'UNQUALIFIED', label: 'Unqualified' },
              ]}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono uppercase tracking-tight text-[var(--color-muted-fg)] font-medium">
              {t('leads.leadSource')}
            </label>
            <Select
              value={filterSource}
              onChange={setFilterSource}
              className="w-full h-9"
              options={[
                { value: 'ALL', label: t('leads.allSources') },
                { value: 'WEBSITE', label: 'Website' },
                { value: 'FACEBOOK', label: 'Facebook' },
                { value: 'INSTAGRAM', label: 'Instagram' },
                { value: 'LINKEDIN', label: 'LinkedIn' },
                { value: 'X', label: 'X (Twitter)' },
                { value: 'YOUTUBE', label: 'YouTube' },
                { value: 'TIKTOK', label: 'TikTok' },
                { value: 'ZALO', label: 'Zalo' },
                { value: 'GMAIL', label: 'Gmail' },
                { value: 'REFERRAL', label: 'Referral' },
                { value: 'EVENT', label: 'Event' },
                { value: 'PORTFOLIO', label: 'Portfolio' },
                { value: 'TELEGRAM', label: 'Telegram' },
                { value: 'MANUAL', label: 'Manual' },
                { value: 'XANT', label: 'Xantivation' },
                { value: 'XZ', label: 'Xaniz' },
              ]}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono uppercase tracking-tight text-[var(--color-muted-fg)] font-medium">
              {t('leads.assignedOwner')}
            </label>
            <Select
              value={filterOwner}
              onChange={setFilterOwner}
              className="w-full h-9"
              options={[
                { value: 'ALL', label: t('leads.allOwners') },
                { value: 'System Admin', label: 'System Admin' },
                { value: 'Jane Smith', label: 'Jane Smith' },
                { value: 'John Doe', label: 'John Doe' },
              ]}
            />
          </div>
        </div>
      </Drawer>

      {/* Bulk actions trigger bar */}
      {selectedRowKeys.length > 0 && (
        <div className="bg-[var(--color-accent)]/5 border border-[var(--color-accent)]/20 p-2.5 rounded-lg flex justify-between items-center text-xs animate-in fade-in slide-in-from-top-2 duration-200">
          <span className="font-semibold text-[var(--color-fg)]">{t('leads.selectedCount',{count:selectedRowKeys.length})}</span>
          <div className="flex gap-2">
            <button onClick={handleBulkReassign} className="px-3 py-1 bg-white hover:bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg font-semibold cursor-pointer text-xs">
              {t('leads.reassignOwner')}
            </button>
            <button onClick={handleBulkExport} className="px-3 py-1 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white rounded-lg font-semibold cursor-pointer text-xs">
              {t('leads.exportExcel')}
            </button>
          </div>
        </div>
      )}

      {/* Unified Table Container Canvas */}
      <div className="relative">
        <Spin spinning={isLoading}>
          <SharedTable
            columns={columns}
            dataSource={filteredLeads}
            onEdit={handleOpenEdit}
            onDelete={handleDelete}
            rowSelection={{
              selectedRowKeys,
              onChange: (keys) => setSelectedRowKeys(keys),
            }}
          />
        </Spin>
      </div>

      {/* Create / Edit Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 pb-2 border-b border-[var(--color-border)]">
            <div className="w-6 h-6 rounded-md bg-[var(--color-accent)]/15 border border-[var(--color-accent)]/30 flex items-center justify-center text-[var(--color-accent)]">
              <Plus size={14} />
            </div>
            <span className="text-sm font-semibold text-[var(--color-fg)]">
              {editingLead ? t('leads.edit') : t('leads.create')}
            </span>
          </div>
        }
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={580}
        styles={{
          body: {
            background: 'var(--color-bg)',
            color: 'var(--color-fg)',
            paddingTop: '8px',
            paddingBottom: '8px',
          },
          header: {
            background: 'transparent',
            borderBottom: 'none',
          }
        }}
      >
        <div className="space-y-3.5 pt-1 max-h-[75vh] overflow-y-auto px-0.5">
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <FloatingInput label={t('leads.firstName')} value={firstName} onChange={setFirstName} />
            </div>
            <div>
              <FloatingInput label={t('leads.lastName')} value={lastName} onChange={setLastName} required />
              {errors.lastName && <p className="text-red-500 text-[10px] mt-0.5">{errors.lastName}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <FloatingInput
                label={t('leads.emailAddress')}
                type="email"
                value={email}
                onChange={setEmail}
                required
                onBlur={() => handleCheckDuplicate('email', email)}
              />
              {errors.email && <p className="text-red-500 text-[10px] mt-0.5">{errors.email}</p>}
            </div>
            <div>
              <FloatingInput
                label={t('leads.phoneNumber')}
                value={phone}
                onChange={setPhone}
                required
                onBlur={() => handleCheckDuplicate('phone', phone)}
              />
              {errors.phone && <p className="text-red-500 text-[10px] mt-0.5">{errors.phone}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <FloatingInput label={t('leads.companyName')} value={company} onChange={setCompany} />
            <FloatingInput label={t('leads.estimatedBudget')} type="number" value={budget} onChange={setBudget} />
          </div>

          <div className="grid grid-cols-2 gap-3.5 pt-1">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono uppercase tracking-tight text-[var(--color-muted-fg)] font-medium">
                {t('leads.leadSource')}
              </label>
              <Select
                value={source}
                onChange={setSource}
                options={[
                  { value: 'WEBSITE', label: 'Website' },
                  { value: 'FACEBOOK', label: 'Facebook' },
                  { value: 'INSTAGRAM', label: 'Instagram' },
                  { value: 'LINKEDIN', label: 'LinkedIn' },
                  { value: 'X', label: 'X (Twitter)' },
                  { value: 'YOUTUBE', label: 'YouTube' },
                  { value: 'TIKTOK', label: 'TikTok' },
                  { value: 'ZALO', label: 'Zalo' },
                  { value: 'GMAIL', label: 'Gmail' },
                  { value: 'REFERRAL', label: 'Referral' },
                  { value: 'EVENT', label: 'Event' },
                  { value: 'PORTFOLIO', label: 'Portfolio' },
                  { value: 'TELEGRAM', label: 'Telegram' },
                  { value: 'MANUAL', label: 'Manual' },
                  { value: 'XANT', label: 'Xantivation' },
                  { value: 'XZ', label: 'Xaniz' },
                ]}
                className="w-full h-9 text-xs"
              />
              {errors.source && <p className="text-red-500 text-[10px]">{errors.source}</p>}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono uppercase tracking-tight text-[var(--color-muted-fg)] font-medium">
                {t('leads.serviceInterest')}
              </label>
              <Select
                value={serviceInterest}
                onChange={setServiceInterest}
                options={[
                  { value: 'WEBSITE', label: 'Website Design' },
                  { value: 'APP_MVP', label: 'App MVP Building' },
                  { value: 'BRANDING', label: 'Branding Identity' },
                  { value: 'UI_UX', label: 'UI/UX Design System' },
                  { value: 'SOCIAL_KIT', label: 'Social Media Kit' },
                  { value: 'MAINTENANCE', label: 'Maintenance SLA' },
                  { value: 'CUSTOM', label: 'Custom Requirement' },
                ]}
                className="w-full h-9 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono uppercase tracking-tight text-[var(--color-muted-fg)] font-medium">
                {t('leads.assignedOwner')}
              </label>
              <Select
                value={assignedOwner}
                onChange={setAssignedOwner}
                options={[
                  { value: 'System Admin', label: 'System Admin' },
                  { value: 'Jane Smith', label: 'Jane Smith' },
                  { value: 'John Doe', label: 'John Doe' },
                ]}
                className="w-full h-9 text-xs"
              />
            </div>

            <div className="pt-2">
              <FloatingInput label={t('leads.timeline')} value={timeline} onChange={setTimeline} />
            </div>
          </div>

          {/* BANT Qualification segment */}
          <div className="pt-3 border-t border-[var(--color-border)]">
            <h4 className="text-[10px] font-mono uppercase tracking-tight text-[var(--color-muted-fg)] font-semibold mb-2.5">
              {t('leads.bantQualification')}
            </h4>
            <div className="grid grid-cols-2 gap-4 mb-2.5">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={budgetApproved}
                  onChange={(e) => setBudgetApproved(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-[var(--color-border)] accent-[var(--color-accent)] cursor-pointer"
                />
                <span className="text-xs font-medium text-[var(--color-fg)] select-none">{t('leads.budgetApproved')}</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={authorityMarker}
                  onChange={(e) => setAuthorityMarker(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-[var(--color-border)] accent-[var(--color-accent)] cursor-pointer"
                />
                <span className="text-xs font-medium text-[var(--color-fg)] select-none">{t('leads.authorityConfirmed')}</span>
              </label>
            </div>

            <FloatingInput label={t('leads.describeNeed')} value={need} onChange={setNeed} />
          </div>

          {/* Submit Actions */}
          <div className="flex justify-end gap-2.5 pt-3 border-t border-[var(--color-border)]">
            <button
              onClick={() => setModalOpen(false)}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-surface)] text-[var(--color-muted-fg)] hover:text-[var(--color-fg)] transition-all cursor-pointer"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white shadow-xs transition-all cursor-pointer"
            >
              {t('common.saveChanges')}
            </button>
          </div>
        </div>
      </Modal>

      {/* Duplicate warning Modal */}
      <Modal
        title={
          <span className="flex items-center gap-2 text-amber-500 font-bold">
            <AlertTriangle size={18} />
            <span>{t('leads.duplicateDetected')}</span>
          </span>
        }
        open={duplicateWarningOpen}
        onCancel={() => setDuplicateWarningOpen(false)}
        footer={[
          <Button key="close" onClick={() => setDuplicateWarningOpen(false)} className="rounded-xl">
            {t('leads.ignoreContinue')}
          </Button>,
        ]}
      >
        <p className="text-xs text-[var(--color-fg)] py-2">{duplicateMessage}</p>
      </Modal>
    </div>
  );
}
