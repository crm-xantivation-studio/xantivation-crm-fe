'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Select, Tag, message, Drawer, Spin } from 'antd';
import { Search, ChevronRight, PenTool, AlertCircle, FileText, SlidersHorizontal } from 'lucide-react';
import SharedTable from '@/components/SharedTable';
import type { ColumnProps } from '@/components/SharedTable';
import Link from 'next/link';
import { useContracts, useForceSignContract } from '@/hooks/api/useContract';

interface ContractRecord {
  id: string;
  code: string;
  title: string;
  contractValue: number;
  contractType: 'SERVICE_AGREEMENT' | 'NDA' | 'SOW' | 'AMENDMENT';
  signingDeadline?: string;
  docusignEnvelopeId?: string;
  status: 'DRAFT' | 'SENT' | 'SIGNED' | 'EXPIRED' | 'DECLINED' | 'VOIDED';
  signedAt?: string;
  dealId: string;
  dealName: string;
  companyName: string;
}

export default function Contracts() {
  const { t } = useTranslation();

  const typeOptions = [
    { value: 'SERVICE_AGREEMENT', label: t('contracts.typeServiceAgreement') },
    { value: 'NDA', label: t('contracts.typeNda') },
    { value: 'SOW', label: t('contracts.typeSow') },
    { value: 'AMENDMENT', label: t('contracts.typeAmendment') },
  ];

  const statusOptions = [
    { value: 'DRAFT', label: t('contracts.statusDraft') },
    { value: 'SENT', label: t('contracts.statusSent') },
    { value: 'SIGNED', label: t('contracts.statusSigned') },
    { value: 'EXPIRED', label: t('contracts.statusExpired') },
    { value: 'DECLINED', label: t('contracts.statusDeclined') },
    { value: 'VOIDED', label: t('contracts.statusVoided') },
  ];

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // API Queries
  const { data: contractsRes, isLoading } = useContracts({ limit: 100 });
  const forceSignMutation = useForceSignContract();

  const rawContracts = contractsRes?.data?.items || [];

  const contractsList: ContractRecord[] = rawContracts.map((c: any) => ({
    id: c.id,
    code: c.contractCode,
    title: c.title,
    contractValue: Number(c.contractValue) || 0,
    contractType: c.contractType as any,
    signingDeadline: c.signingDeadline ? c.signingDeadline.substring(0, 10) : '',
    docusignEnvelopeId: c.esignEnvelopeId || '',
    status: c.status as any,
    signedAt: c.signedDate ? c.signedDate.substring(0, 16).replace('T', ' ') : undefined,
    dealId: c.dealId,
    dealName: c.deal?.projectName || '',
    companyName: c.account?.name || '',
  }));

  const handleDocuSignSign = async (rec: ContractRecord) => {
    try {
      await forceSignMutation.mutateAsync(rec.id);
    } catch (err) {
      // Handled
    }
  };

  const filteredContracts = contractsList.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.companyName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || c.status === filterStatus;
    const matchesType = filterType === 'ALL' || c.contractType === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const columns: ColumnProps<ContractRecord>[] = [
    {
      title: t('contracts.contractCode'),
      dataIndex: 'code',
      key: 'code',
      render: (val, rec) => (
        <Link
          href={`/contracts/${rec.id}`}
          className="font-mono text-xs font-semibold bg-[var(--color-surface)] px-2.5 py-1 rounded-lg border border-[var(--color-border)] hover:text-[var(--color-accent)] transition-colors"
        >
          {val}
        </Link>
      ),
    },
    {
      title: t('contracts.titleCustomer'),
      dataIndex: 'title',
      key: 'title',
      render: (val, rec) => (
        <div>
          <Link href={`/contracts/${rec.id}`} className="font-semibold text-[var(--color-fg)] hover:underline block mb-0.5 max-w-sm truncate">
            {val}
          </Link>
          <span className="text-[10px] text-[var(--color-muted-fg)]">{rec.companyName}</span>
        </div>
      ),
    },
    {
      title: t('contracts.type'),
      dataIndex: 'contractType',
      key: 'contractType',
      render: (val) => {
        let typeText = t('contracts.typeServiceAgreement');
        if (val === 'NDA') typeText = t('contracts.typeNda');
        if (val === 'SOW') typeText = t('contracts.typeSow');
        if (val === 'AMENDMENT') typeText = t('contracts.typeAmendment');
        return (
          <span className="text-xs px-2 py-0.5 rounded bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-fg)]">
            {typeText}
          </span>
        );
      },
    },
    {
      title: t('contracts.value'),
      dataIndex: 'contractValue',
      key: 'contractValue',
      render: (val: number) => (
        <span className="font-mono font-semibold text-xs text-[var(--color-fg)]">
          {val.toLocaleString('vi-VN')} VND
        </span>
      ),
    },
    {
      title: t('contracts.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'bg-gray-500/10 text-gray-500';
        if (status === 'SIGNED') color = 'bg-green-500/10 text-green-500';
        if (status === 'SENT') color = 'bg-blue-500/10 text-blue-500';
        if (status === 'DECLINED') color = 'bg-red-500/10 text-red-500';
        if (status === 'VOIDED') color = 'bg-red-900/10 text-red-600';
        if (status === 'EXPIRED') color = 'bg-amber-500/10 text-amber-600';
        return <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider ${color}`}>{status}</span>;
      },
    },
    {
      title: t('contracts.signingDeadline'),
      dataIndex: 'signingDeadline',
      key: 'signingDeadline',
      render: (val) => <span className="text-xs font-mono text-[var(--color-muted-fg)]">{val || 'N/A'}</span>,
    },
    {
      title: t('contracts.actions'),
      dataIndex: 'id',
      key: 'actions',
      render: (_, rec) => (
        <div className="flex items-center gap-2">
          {rec.status === 'SENT' && (
            <button
              onClick={() => handleDocuSignSign(rec)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white transition-all cursor-pointer"
            >
              <PenTool size={12} />
              <span>{t('contracts.signDigitally')}</span>
            </button>
          )}
          <Link
            href={`/contracts/${rec.id}`}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-surface)] text-[var(--color-muted-fg)] hover:text-[var(--color-fg)] transition-all cursor-pointer"
          >
            <span>{t('contracts.manage')}</span>
            <ChevronRight size={12} />
          </Link>
        </div>
      ),
    },
  ];

  const activeFiltersCount =
    (filterStatus !== 'ALL' ? 1 : 0) + (filterType !== 'ALL' ? 1 : 0);

  return (
    <div className="space-y-4">
      {/* Title & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-base font-semibold tracking-tight text-[var(--color-fg)]">{t('contracts.title')}</h1>
          <p className="text-xs text-[var(--color-muted-fg)] mt-1">
            {t('contracts.subtitle')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Search bar */}
          <div className="flex items-center gap-2 bg-[var(--color-bg-tint)] border border-[var(--color-border)] rounded-xl px-3 py-2 w-full md:w-64">
            <Search size={15} className="text-[var(--color-muted-fg)]" />
            <input
              type="text"
              placeholder={t('contracts.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-xs text-[var(--color-fg)] placeholder-[var(--color-muted-fg)] w-full"
            />
          </div>

          {/* Filters Button */}
          <button
            onClick={() => setFilterDrawerOpen(true)}
            title={t('contracts.filters')}
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

          <div className="text-xs bg-[var(--color-accent)]/10 text-[var(--color-accent)] px-3 py-2 rounded-xl border border-[var(--color-accent)]/20 font-medium">
            {t('contracts.autoCreate')}
          </div>
        </div>
      </div>

      {/* Advanced Filter Drawer */}
      <Drawer
        title={
          <div className="flex items-center justify-between w-full pr-4">
            <span className="text-base font-bold text-[var(--color-fg)]">{t('contracts.advancedFilters')}</span>
            {activeFiltersCount > 0 && (
              <button
                onClick={() => {
                  setFilterStatus('ALL');
                  setFilterType('ALL');
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
              {t('contracts.contractStatus')}
            </label>
            <Select
              value={filterStatus}
              onChange={setFilterStatus}
              className="w-full h-11"
              options={[
                { value: 'ALL', label: t('contracts.allStatuses') },
                ...statusOptions,
              ]}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted-fg)]">
              {t('contracts.contractType')}
            </label>
            <Select
              value={filterType}
              onChange={setFilterType}
              className="w-full h-11"
              options={[
                { value: 'ALL', label: t('contracts.allTypes') },
                ...typeOptions,
              ]}
            />
          </div>
        </div>
      </Drawer>

      {isLoading ? (
        <div className="py-24 flex flex-col justify-center items-center gap-3">
          <Spin size="large" />
          <span className="text-xs text-[var(--color-muted-fg)] font-mono">{t('contracts.loading')}</span>
        </div>
      ) : (
        <div className="">
          <SharedTable
            columns={columns}
            dataSource={filteredContracts}
          />
        </div>
      )}
    </div>
  );
}
