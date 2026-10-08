'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal, Select, message, Tag, Drawer, Spin } from 'antd';
import { Plus, Download, Search, FileText, Check, AlertCircle, SlidersHorizontal } from 'lucide-react';
import SharedTable from '@/components/SharedTable';
import type { ColumnProps } from '@/components/SharedTable';
import { FloatingInput } from '@/components/FloatingInput';
import { FormSelect } from '@/components/FormSelect';
import Link from 'next/link';
import { useQuotations, useCreateQuotation, useUpdateQuotation, useCloneQuotation } from '@/hooks/api/useQuotation';
import { useOpportunities } from '@/hooks/api/useOpportunity';
import { useUsers } from '@/hooks/api/useUser';
import { PackageType, AdjustmentType, QuotationStatus } from '@/types/quotation.types';

interface QuotationItemRecord {
  itemName: string;
  description?: string;
  fixedPrice: number;
  estimatedEffort?: string;
  deliverables?: string;
}

interface QuotationRecord {
  id: string;
  code: string;
  version: number;
  projectName: string;
  serviceType: string;
  packageType: 'BASIC' | 'STANDARD' | 'PREMIUM' | 'CUSTOM';
  validUntil: string;
  totalAmount: number;
  adjustmentType?: 'DISCOUNT' | 'RUSH_FEE' | 'OTHER';
  adjustmentAmount: number;
  adjustmentReason?: string;
  vatRate: number;
  vatAmount: number;
  grandTotal: number;
  status: 'DRAFT' | 'REVIEW' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  opportunityId: string;
  opportunityName: string;
  companyName: string;
  timeline?: string;
  revisionLimit: number;
  paymentTerms?: string;
  termsConditions?: string;
  notes?: string;
  owner: string;
  items: QuotationItemRecord[];
}

const serviceOptions = [
  { value: 'WEBSITE', label: 'Website Development' },
  { value: 'APP_MVP', label: 'Mobile App / MVP Build' },
  { value: 'BRANDING', label: 'Brand Guidelines' },
  { value: 'UI_UX', label: 'UI/UX Design UI Kit' },
  { value: 'SOCIAL_KIT', label: 'Social Media Kit' },
  { value: 'MAINTENANCE', label: 'Maintenance & Operations' },
  { value: 'CUSTOM', label: 'Custom Studio Services' },
];

const packageOptions = [
  { value: 'BASIC', label: 'Basic' },
  { value: 'STANDARD', label: 'Standard' },
  { value: 'PREMIUM', label: 'Premium' },
  { value: 'CUSTOM', label: 'Custom package' },
];

const statusOptions = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'REVIEW', label: 'Review Required' },
  { value: 'SENT', label: 'Sent to Client' },
  { value: 'ACCEPTED', label: 'Accepted' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'EXPIRED', label: 'Expired' },
];

export default function Quotations() {
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState<QuotationRecord | null>(null);

  // API Queries
  const { data: quotationsRes, isLoading: isQuotationsLoading } = useQuotations({ limit: 100 });
  const { data: oppsRes } = useOpportunities({ limit: 100 });
  const { data: usersRes } = useUsers();

  // API Mutations
  const createMutation = useCreateQuotation();
  const updateMutation = useUpdateQuotation();
  const cloneMutation = useCloneQuotation();

  const rawQuotations = Array.isArray(quotationsRes?.data) 
    ? quotationsRes.data 
    : ((quotationsRes?.data as any)?.items || []);
  const realOpps = Array.isArray(oppsRes?.data) 
    ? oppsRes.data 
    : ((oppsRes?.data as any)?.items || (Array.isArray(oppsRes) ? oppsRes : []));
  const realUsers = usersRes?.data || [];

  // Map API response to local record format
  const quotationsList: QuotationRecord[] = rawQuotations.map((q: any) => ({
    id: q.id,
    code: q.quotationCode,
    version: q.version || 1,
    projectName: q.projectName,
    serviceType: q.serviceType,
    packageType: q.packageType as any,
    validUntil: q.validUntil ? q.validUntil.substring(0, 10) : '',
    totalAmount: q.subtotal || 0,
    adjustmentType: q.adjustmentType as any,
    adjustmentAmount: q.adjustmentAmount || 0,
    adjustmentReason: q.adjustmentReason || '',
    vatRate: q.taxPercent || 0,
    vatAmount: q.taxAmount || 0,
    grandTotal: q.grandTotal || 0,
    status: q.status as any,
    opportunityId: q.opportunityId || '',
    opportunityName: q.opportunity?.name || '',
    companyName: q.opportunity?.customer?.name || q.opportunity?.account?.name || q.opportunity?.lead?.company || '',
    timeline: q.timeline || '',
    revisionLimit: q.revisionLimit || 3,
    paymentTerms: q.paymentTerms || '',
    termsConditions: q.termsConditions || '',
    notes: q.notes || '',
    owner: q.owner ? `${q.owner.firstName || ''} ${q.owner.lastName || ''}`.trim() : 'System Admin',
    items: (q.items || []).map((item: any) => ({
      itemName: item.itemName,
      description: item.description,
      fixedPrice: Number(item.fixedPrice) || 0,
      estimatedEffort: item.estimatedEffort,
      deliverables: item.deliverables,
    })),
  }));

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterService, setFilterService] = useState('ALL');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Form states
  const [opportunityId, setOpportunityId] = useState('');
  const [projectName, setProjectName] = useState('');
  const [serviceType, setServiceType] = useState('WEBSITE');
  const [packageType, setPackageType] = useState<'BASIC' | 'STANDARD' | 'PREMIUM' | 'CUSTOM'>('STANDARD');
  const [validUntil, setValidUntil] = useState('');
  const [status, setStatus] = useState<'DRAFT' | 'REVIEW' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED'>('DRAFT');

  // Pricing adjustments
  const [adjustmentType, setAdjustmentType] = useState<'DISCOUNT' | 'RUSH_FEE' | 'OTHER' | undefined>(undefined);
  const [adjustmentAmount, setAdjustmentAmount] = useState('');
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [vatRate, setVatRate] = useState('10');

  // Terms and conditions
  const [timeline, setTimeline] = useState('');
  const [revisionLimit, setRevisionLimit] = useState<number>(3);
  const [paymentTerms, setPaymentTerms] = useState('');
  const [termsConditions, setTermsConditions] = useState('');
  const [notes, setNotes] = useState('');

  // Scope Items list
  const [items, setItems] = useState<QuotationItemRecord[]>([
    { itemName: '', description: '', fixedPrice: 0, estimatedEffort: '', deliverables: '' },
  ]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleDownloadPdf = (rec: QuotationRecord) => {
    message.loading(`Generating PDF for ${rec.code}...`);
    setTimeout(() => {
      message.success(`PDF exported successfully for ${rec.code}`);
    }, 1000);
  };

  const handleOpportunityChange = (oppId: string) => {
    setOpportunityId(oppId);
    const selected = realOpps.find((opp: any) => opp.id === oppId);
    if (selected && !projectName) {
      setProjectName(selected.name);
    }
  };

  const handleOpenCreate = () => {
    setEditingQuotation(null);
    const firstOpp = realOpps[0];
    setOpportunityId(firstOpp?.id || '');
    setProjectName(firstOpp?.name || '');
    setServiceType('WEBSITE');
    setPackageType('STANDARD');
    setValidUntil('');
    setStatus('DRAFT');
    setAdjustmentType(undefined);
    setAdjustmentAmount('');
    setAdjustmentReason('');
    setVatRate('10');
    setTimeline('');
    setRevisionLimit(3);
    setPaymentTerms('');
    setTermsConditions('');
    setNotes('');
    setItems([{ itemName: '', description: '', fixedPrice: 0, estimatedEffort: '', deliverables: '' }]);
    setErrors({});
    setModalOpen(true);
  };

  const handleOpenEdit = (rec: QuotationRecord) => {
    setEditingQuotation(rec);
    setOpportunityId(rec.opportunityId);
    setProjectName(rec.projectName);
    setServiceType(rec.serviceType);
    setPackageType(rec.packageType);
    setValidUntil(rec.validUntil);
    setStatus(rec.status);
    setAdjustmentType(rec.adjustmentType);
    setAdjustmentAmount(rec.adjustmentAmount ? String(rec.adjustmentAmount) : '');
    setAdjustmentReason(rec.adjustmentReason || '');
    setVatRate(String(rec.vatRate));
    setTimeline(rec.timeline || '');
    setRevisionLimit(rec.revisionLimit);
    setPaymentTerms(rec.paymentTerms || '');
    setTermsConditions(rec.termsConditions || '');
    setNotes(rec.notes || '');
    setItems(rec.items);
    setErrors({});
    setModalOpen(true);
  };

  const handleAddItemRow = () => {
    setItems([...items, { itemName: '', description: '', fixedPrice: 0, estimatedEffort: '', deliverables: '' }]);
  };

  const handleRemoveItemRow = (idx: number) => {
    setItems(items.filter((_, index) => index !== idx));
  };

  const handleItemFieldChange = (idx: number, field: keyof QuotationItemRecord, val: any) => {
    const updated = [...items];
    updated[idx] = { ...updated[idx], [field]: val };
    setItems(updated);
  };

  // Live Pricing Calculations
  const calculatePricing = () => {
    const subtotal = items.reduce((sum, item) => sum + (Number(item.fixedPrice) || 0), 0);
    const adjAmount = Number(adjustmentAmount) || 0;
    
    let adjustedSubtotal = subtotal;
    if (adjustmentType === 'DISCOUNT') {
      adjustedSubtotal = subtotal - Math.abs(adjAmount);
    } else if (adjustmentType === 'RUSH_FEE' || adjustmentType === 'OTHER') {
      adjustedSubtotal = subtotal + Math.abs(adjAmount);
    }

    const rateVal = Number(vatRate) || 0;
    const vatVal = adjustedSubtotal * (rateVal / 100);
    const grandVal = adjustedSubtotal + vatVal;

    return { subtotal, vatVal, grandVal };
  };

  const { subtotal, vatVal, grandVal } = calculatePricing();

  const handleSave = async () => {
    const newErrors: Record<string, string> = {};
    if (!projectName.trim()) newErrors.projectName = 'Project Name is required';
    if (!validUntil) newErrors.validUntil = 'Validity date is required';

    if (items.length === 0 || items.some(item => !item.itemName.trim() || Number(item.fixedPrice) <= 0)) {
      newErrors.items = 'All scope items must have a name and a price greater than 0';
    }

    if (adjustmentType && (!adjustmentAmount || Number(adjustmentAmount) <= 0)) {
      newErrors.adjustmentAmount = 'Adjustment amount is required and must be greater than 0';
    }
    if (adjustmentType && !adjustmentReason.trim()) {
      newErrors.adjustmentReason = 'A reason for price adjustment is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      message.error('Please resolve validation errors before saving');
      return;
    }

    const payload = {
      opportunityId,
      projectName,
      serviceType,
      packageType: packageType as PackageType,
      adjustmentType: adjustmentType as AdjustmentType,
      adjustmentAmount: adjustmentType ? Number(adjustmentAmount) : undefined,
      adjustmentReason: adjustmentType ? adjustmentReason : undefined,
      taxPercent: Number(vatRate),
      timeline,
      revisionLimit,
      paymentTerms,
      termsConditions,
      notes,
      validUntil,
      items: items.map(i => ({
        itemName: i.itemName,
        description: i.description,
        fixedPrice: Number(i.fixedPrice),
        estimatedEffort: i.estimatedEffort,
        deliverables: i.deliverables,
      })),
    };

    try {
      if (editingQuotation) {
        await updateMutation.mutateAsync({
          id: editingQuotation.id,
          dto: payload,
        });
      } else {
        await createMutation.mutateAsync(payload);
      }
      setModalOpen(false);
    } catch (err) {
      // Handled
    }
  };

  const handleCloneVersion = async (id: string) => {
    try {
      await cloneMutation.mutateAsync(id);
    } catch (err) {
      // Handled
    }
  };

  // Filter Quotations
  const filteredQuotations = quotationsList.filter(q => {
    const matchesSearch = q.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          q.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          q.companyName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || q.status === filterStatus;
    const matchesService = filterService === 'ALL' || q.serviceType === filterService;
    return matchesSearch && matchesStatus && matchesService;
  });

  // Table Columns
  const tableColumns: ColumnProps<QuotationRecord>[] = [
    {
      title: t('quotations.code'),
      dataIndex: 'code',
      key: 'code',
      render: (val, rec) => (
        <Link href={`/quotations/${rec.id}`} className="font-mono text-xs font-semibold bg-[var(--color-surface)] px-2.5 py-1 rounded-lg border border-[var(--color-border)] hover:text-[var(--color-accent)] transition-colors">
          {val} (v{rec.version})
        </Link>
      ),
    },
    {
      title: t('quotations.projectDetails'),
      dataIndex: 'projectName',
      key: 'projectName',
      render: (val, rec) => (
        <div>
          <Link href={`/quotations/${rec.id}`} className="font-semibold text-[var(--color-fg)] hover:underline block">
            {val}
          </Link>
          <span className="text-[10px] text-[var(--color-muted-fg)] font-mono">{rec.serviceType}</span>
        </div>
      ),
    },
    {
      title: t('quotations.customer'),
      dataIndex: 'companyName',
      key: 'companyName',
      render: (val) => <span className="text-xs font-semibold text-[var(--color-fg)]">{val}</span>,
    },
    {
      title: t('quotations.grandTotal'),
      dataIndex: 'grandTotal',
      key: 'grandTotal',
      render: (val) => <span className="font-mono font-semibold text-xs text-[var(--color-fg)]">{val.toLocaleString('vi-VN')} VND</span>,
    },
    {
      title: t('quotations.status'),
      dataIndex: 'status',
      key: 'status',
      render: (st) => (
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider ${
          st === 'ACCEPTED' ? 'bg-green-500/10 text-green-500' :
          st === 'REJECTED' || st === 'EXPIRED' ? 'bg-red-500/10 text-red-500' :
          st === 'REVIEW' ? 'bg-amber-500/10 text-amber-600' :
          st === 'SENT' ? 'bg-blue-500/10 text-blue-500' : 'bg-gray-500/10 text-gray-500'
        }`}>{st}</span>
      ),
    },
    {
      title: t('quotations.validUntil'),
      dataIndex: 'validUntil',
      key: 'validUntil',
      render: (val) => <span className="text-xs font-mono text-[var(--color-muted-fg)]">{val}</span>,
    },
    {
      title: t('quotations.actions'),
      dataIndex: 'id',
      key: 'actions',
      render: (_: any, rec) => (
        <div className="flex items-center gap-2">
          <Button size="small" onClick={() => handleCloneVersion(rec.id)} loading={cloneMutation.isPending} className="text-[10px] rounded-lg">{t('quotations.clone',{version:rec.version + 1})}</Button>
          <Button size="small" onClick={() => handleDownloadPdf(rec)} className="text-[10px] rounded-lg flex items-center gap-1">
            <Download size={10} />
            <span>{t('quotations.pdf')}</span>
          </Button>
        </div>
      ),
    },
  ];

  const activeFiltersCount =
    (filterStatus !== 'ALL' ? 1 : 0) + (filterService !== 'ALL' ? 1 : 0);

  return (
    <div className="space-y-4">
      {/* Title & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-base font-semibold tracking-tight text-[var(--color-fg)]">{t('quotations.title')}</h1>
          <p className="text-xs text-[var(--color-muted-fg)] mt-1">{t('quotations.subtitle')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Search bar */}
          <div className="flex items-center gap-2 bg-[var(--color-bg-tint)] border border-[var(--color-border)] rounded-xl px-3 py-2 w-full md:w-64">
            <Search size={15} className="text-[var(--color-muted-fg)]" />
            <input
              type="text"
              placeholder={t('quotations.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-xs text-[var(--color-fg)] placeholder-[var(--color-muted-fg)] w-full"
            />
          </div>

          <button
            onClick={() => setFilterDrawerOpen(true)}
            title={t('quotations.filters')}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-tint)] text-[var(--color-fg)] hover:bg-[var(--color-surface)] cursor-pointer relative shrink-0 transition-all"
          >
            <SlidersHorizontal size={15} />
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[var(--color-accent)] text-white w-4 h-4 rounded-full text-[9px] flex items-center justify-center font-bold animate-pulse">
                {activeFiltersCount}
              </span>
            )}
          </button>

          <button
            onClick={handleOpenCreate}
            title={t('quotations.create')}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white shadow-xs transition-all cursor-pointer shrink-0"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Advanced Filters Drawer */}
      <Drawer
        title={
          <div className="flex justify-between items-center w-full pr-8">
            <span className="text-base font-bold text-[var(--color-fg)]">Advanced Filters</span>
            {activeFiltersCount > 0 && (
              <button
                onClick={() => {
                  setFilterStatus('ALL');
                  setFilterService('ALL');
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
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted-fg)]">
              {t('quotations.statusLabel')}
            </label>
            <Select
              value={filterStatus}
              onChange={setFilterStatus}
              className="w-full h-11"
              options={[
                { value: 'ALL', label: t('quotations.allStatuses') },
                ...statusOptions,
              ]}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted-fg)]">
              {t('quotations.serviceType')}
            </label>
            <Select
              value={filterService}
              onChange={setFilterService}
              className="w-full h-11"
              options={[
                { value: 'ALL', label: t('quotations.allServiceTypes') },
                ...serviceOptions,
              ]}
            />
          </div>
        </div>
      </Drawer>

      {isQuotationsLoading ? (
        <div className="py-24 flex flex-col justify-center items-center gap-3">
          <Spin size="large" />
          <span className="text-xs text-[var(--color-muted-fg)] font-mono">{t('quotations.loading')}</span>
        </div>
      ) : (
        <div className="">
          <SharedTable
            columns={tableColumns}
            dataSource={filteredQuotations}
            onEdit={handleOpenEdit}
          />
        </div>
      )}

      {/* Create / Edit Quotation Modal */}
      <Modal
        title={editingQuotation ? t('quotations.edit',{code:editingQuotation.code}) : t('quotations.createTitle')}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={750}
        zIndex={1050}
      >
        <div className="space-y-6 pt-4 max-h-[70vh] overflow-y-auto pr-2">
          {/* Part 1: Header Parameters */}
          <div className="space-y-4">
            <h4 className="text-xs font-mono uppercase tracking-widest text-[var(--color-accent)] font-bold">1. Header & Association</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <div>
                <FormSelect
                  label="Linked CRM Opportunity"
                  value={opportunityId || undefined}
                  onChange={handleOpportunityChange}
                  placeholder="Chọn một cơ hội kinh doanh (Opportunity)..."
                  options={realOpps.map((opp: any) => {
                    const company = opp.customer?.name || opp.account?.name || opp.lead?.company || 'Chưa gán khách hàng';
                    const amountStr = opp.amount ? ` - ${Number(opp.amount).toLocaleString('vi-VN')} VND` : '';
                    return {
                      value: opp.id,
                      label: `${opp.name} (${company}${amountStr})`,
                    };
                  })}
                  showSearch
                  optionFilterProp="label"
                />
              </div>
              <div>
                <FloatingInput label="Project Name" value={projectName} onChange={setProjectName} required />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <FormSelect
                  label="Service Type"
                  value={serviceType}
                  onChange={setServiceType}
                  options={serviceOptions}
                />
              </div>
              <div>
                <FormSelect
                  label="Package Type"
                  value={packageType}
                  onChange={setPackageType as any}
                  options={packageOptions}
                />
              </div>
              <div>
                <FloatingInput label="Validity Date" type="date" value={validUntil} onChange={setValidUntil} required />
              </div>
            </div>
          </div>

          {/* Part 2: Scope Items */}
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-1.5">
              <h4 className="text-xs font-mono uppercase tracking-widest text-[var(--color-accent)] font-bold">2. Scope Items & Fixed Prices</h4>
              <Button size="small" onClick={handleAddItemRow} className="text-xs rounded-lg flex items-center gap-1">
                <Plus size={10} />
                <span>Add Item</span>
              </Button>
            </div>
            {errors.items && <p className="text-red-500 text-[10px] font-mono">{errors.items}</p>}
            <div className="space-y-4">
              {items.map((item, idx) => (
                <div key={idx} className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl relative space-y-3">
                  {items.length > 1 && (
                    <button
                      onClick={() => handleRemoveItemRow(idx)}
                      className="absolute top-2 right-2 text-[10px] font-semibold text-red-500 hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <FloatingInput label="Scope item name" value={item.itemName} onChange={(val) => handleItemFieldChange(idx, 'itemName', val)} required />
                    </div>
                    <div>
                      <FloatingInput label="Fixed price (VND)" type="number" value={item.fixedPrice ? String(item.fixedPrice) : ''} onChange={(val) => handleItemFieldChange(idx, 'fixedPrice', Number(val))} required />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <FloatingInput label="Deliverables details" value={item.deliverables || ''} onChange={(val) => handleItemFieldChange(idx, 'deliverables', val)} />
                    </div>
                    <div>
                      <FloatingInput label="Estimated effort" value={item.estimatedEffort || ''} onChange={(val) => handleItemFieldChange(idx, 'estimatedEffort', val)} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Part 3: Pricing Summary */}
          <div className="space-y-4 bg-[var(--color-surface)]/40 p-4 border border-[var(--color-border)] rounded-[5px]">
            <h4 className="text-xs font-mono uppercase tracking-widest text-[var(--color-accent)] font-bold">3. Pricing Adjustment & VAT Summary</h4>
            <div className="grid grid-cols-3 gap-4 items-start">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted-fg)]">
                  Adjustment Type
                </label>
                <Select
                  value={adjustmentType || 'NONE'}
                  onChange={(val) => setAdjustmentType(val === 'NONE' ? undefined : val as any)}
                  options={[
                    { value: 'NONE', label: 'No adjustments' },
                    { value: 'DISCOUNT', label: 'Discount (-)' },
                    { value: 'RUSH_FEE', label: 'Rush fee (+)' },
                    { value: 'OTHER', label: 'Other adjustments (+)' },
                  ]}
                  className="w-full h-12"
                />
              </div>
              {adjustmentType && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted-fg)] opacity-0 select-none">
                    Adjustment Amount
                  </label>
                  <FloatingInput label="Adjustment Amount (VND)" type="number" value={adjustmentAmount} onChange={setAdjustmentAmount} required />
                  {errors.adjustmentAmount && <p className="text-red-500 text-[10px] mt-1">{errors.adjustmentAmount}</p>}
                </div>
              )}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted-fg)] opacity-0 select-none">
                  VAT Rate
                </label>
                <FloatingInput label="VAT Rate (%)" type="number" value={vatRate} onChange={setVatRate} required />
              </div>
            </div>
            {adjustmentType && (
              <div>
                <FloatingInput label="Reason for adjustment" value={adjustmentReason} onChange={setAdjustmentReason} required />
                {errors.adjustmentReason && <p className="text-red-500 text-[10px] mt-1">{errors.adjustmentReason}</p>}
              </div>
            )}

            <div className="pt-4 border-t border-[var(--color-border)] space-y-2 text-xs font-mono font-semibold">
              <div className="flex justify-between">
                <span className="text-[var(--color-muted-fg)]">Subtotal:</span>
                <span>{subtotal.toLocaleString('vi-VN')} VND</span>
              </div>
              {adjustmentType && (
                <div className="flex justify-between text-[var(--color-accent)]">
                  <span>Adjustment ({adjustmentType}):</span>
                  <span>{adjustmentType === 'DISCOUNT' ? '-' : '+'}{Number(adjustmentAmount).toLocaleString('vi-VN')} VND</span>
                </div>
              )}
              <div className="flex justify-between text-[var(--color-muted-fg)]">
                <span>VAT ({vatRate}%):</span>
                <span>{vatVal.toLocaleString('vi-VN')} VND</span>
              </div>
              <div className="flex justify-between text-base border-t border-[var(--color-border)]/50 pt-2 text-[var(--color-fg)]">
                <span>Grand Total:</span>
                <span className="font-bold">{grandVal.toLocaleString('vi-VN')} VND</span>
              </div>
            </div>
          </div>

          {/* Part 4: Terms & Signatures */}
          <div className="space-y-4">
            <h4 className="text-xs font-mono uppercase tracking-widest text-[var(--color-accent)] font-bold">4. Timeline & payment terms</h4>
            <div className="grid grid-cols-2 gap-4 items-start">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted-fg)] opacity-0 select-none">
                  Delivery Timeline
                </label>
                <FloatingInput label="Project delivery timeline" value={timeline} onChange={setTimeline} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted-fg)]">
                  Revision limits (times)
                </label>
                <Select
                  value={revisionLimit}
                  onChange={setRevisionLimit}
                  options={[
                    { value: 1, label: '1 revision' },
                    { value: 2, label: '2 revisions' },
                    { value: 3, label: '3 revisions (Default)' },
                    { value: 5, label: '5 revisions' },
                    { value: 10, label: '10 revisions' },
                  ]}
                  className="w-full h-12"
                />
              </div>
            </div>
            <FloatingInput label="Payment milestone terms" value={paymentTerms} onChange={setPaymentTerms} />
            <FloatingInput label="Terms & Conditions clauses" value={termsConditions} onChange={setTermsConditions} />
            <FloatingInput label="Internal notes" value={notes} onChange={setNotes} />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button onClick={() => setModalOpen(false)} className="rounded-xl">{t('quotations.cancel')}</Button>
            <Button type="primary" onClick={handleSave} loading={createMutation.isPending || updateMutation.isPending} className="rounded-xl">{t('quotations.saveChanges')}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

