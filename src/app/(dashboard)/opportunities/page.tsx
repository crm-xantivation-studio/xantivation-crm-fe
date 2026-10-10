'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal, Progress, Select, message, Tag, Drawer, Spin } from 'antd';
import { Plus, Search, Layers, List, ChevronRight, CheckCircle2, XCircle, AlertCircle, SlidersHorizontal } from 'lucide-react';
import SharedTable from '@/components/SharedTable';
import type { ColumnProps } from '@/components/SharedTable';
import { FloatingInput } from '@/components/FloatingInput';
import { FormSelect } from '@/components/FormSelect';
import Link from 'next/link';
import { useOpportunities, useCreateOpportunity, useUpdateOpportunity, useCloseLostOpportunity } from '@/hooks/api/useOpportunity';
import { useCustomers, useContacts } from '@/hooks/api/useCustomer';
import { useUsers } from '@/hooks/api/useUser';
import { OpportunityStage } from '@/types/opportunity.types';

interface OpportunityRecord {
  id: string;
  code: string;
  name: string;
  amount: number;
  stage: 'QUALIFICATION' | 'PROPOSAL' | 'NEGOTIATION' | 'CLOSED_WON' | 'CLOSED_LOST';
  probability: number;
  closeDate: string;
  companyId: string;
  companyName: string;
  contactId: string;
  contactName: string;
  serviceInterest: string;
  description: string;
  assignedTo: string;
  lostReason?: string;
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

const stages: ('QUALIFICATION' | 'PROPOSAL' | 'NEGOTIATION' | 'CLOSED_WON' | 'CLOSED_LOST')[] = [
  'QUALIFICATION',
  'PROPOSAL',
  'NEGOTIATION',
  'CLOSED_WON',
  'CLOSED_LOST',
];

export default function Opportunities() {
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const { t } = useTranslation();

  // API Queries
  const { data: oppsRes, isLoading: isOppsLoading } = useOpportunities({ limit: 100 });
  const { data: accountsRes } = useCustomers();
  const { data: contactsRes } = useContacts();
  const { data: usersRes } = useUsers();

  // API Mutations
  const createMutation = useCreateOpportunity();
  const updateMutation = useUpdateOpportunity();
  const closeLostMutation = useCloseLostOpportunity();

  const rawOpps = Array.isArray(oppsRes?.data) ? oppsRes.data : ((oppsRes?.data as any)?.items || []);
  const realAccounts = accountsRes?.data || [];
  const realContacts = contactsRes?.data || [];
  const realUsers = usersRes?.data || [];

  // Helpers for mapping
  const getStageLabel = (st: string) => {
    switch (st) {
      case 'QUALIFICATION':
        return t('opportunities.stageQualification');
      case 'PROPOSAL':
        return t('opportunities.stageProposal');
      case 'NEGOTIATION':
        return t('opportunities.stageNegotiation');
      case 'WON':
        return t('opportunities.stageWon');
      case 'LOST':
        return t('opportunities.stageLost');
      default:
        return st;
    }
  };

  // Map API response to local record format
  const oppsList: OpportunityRecord[] = rawOpps.map((opp: any) => ({
    id: opp.id,
    code: opp.oppCode || '',
    name: opp.name,
    amount: Number(opp.amount) || 0,
    stage: opp.stage as any,
    probability: opp.probability || 0,
    closeDate: opp.closeDate ? opp.closeDate.substring(0, 10) : '',
    companyId: opp.customer?.id || opp.customerId || opp.account?.id || opp.customer?.id || '',
    companyName: opp.customer?.name || opp.customer?.name || '',
    contactId: opp.contact?.id || '',
    contactName: opp.contact ? (opp.contact.name || opp.contact.fullName || `${opp.contact.firstName || ''} ${opp.contact.lastName || ''}`.trim() || '—') : '—',
    serviceInterest: opp.serviceInterest || 'WEBSITE',
    description: opp.description || '',
    assignedTo: opp.assignedTo ? (opp.owner?.name || opp.assignedTo?.name || `${opp.assignedTo?.firstName || ''} ${opp.assignedTo?.lastName || ''}`.trim() || 'System Admin') : (opp.owner?.name || 'System Admin'),
    lostReason: opp.lostReason || '',
  }));

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStage, setFilterStage] = useState('ALL');
  const [filterInterest, setFilterInterest] = useState('ALL');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Modal Open states
  const [modalOpen, setModalOpen] = useState(false);
  const [lostModalOpen, setLostModalOpen] = useState(false);
  const [editingOpp, setEditingOpp] = useState<OpportunityRecord | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [stage, setStage] = useState<'QUALIFICATION' | 'PROPOSAL' | 'NEGOTIATION'>('QUALIFICATION');
  const [probability, setProbability] = useState<number>(20);
  const [closeDate, setCloseDate] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [contactId, setContactId] = useState('');
  const [serviceInterest, setServiceInterest] = useState('WEBSITE');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState(''); // Owner ID
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Drag and drop states
  const [draggedOppId, setDraggedOppId] = useState<string | null>(null);
  const [lostReason, setLostReason] = useState('');

  // Handle stage change auto-suggest probability
  const handleStageChange = (val: 'QUALIFICATION' | 'PROPOSAL' | 'NEGOTIATION') => {
    setStage(val);
    if (val === 'QUALIFICATION') setProbability(20);
    else if (val === 'PROPOSAL') setProbability(50);
    else if (val === 'NEGOTIATION') setProbability(75);
  };

  // Handle company change auto-load associated contacts and auto-select primary contact
  const handleCompanyChange = (val: string) => {
    setCompanyId(val);
    const relatedContacts = realContacts.filter((c: any) => {
      const accId = c.accountId || c.customerId || c.account?.id || c.customer?.id || c.account_id || c.customer_id;
      return !val || accId === val;
    });
    const primary = relatedContacts.find((c: any) => c.isPrimary) || relatedContacts[0];
    if (primary) {
      setContactId(primary.id);
    } else {
      setContactId('');
    }
  };

  const handleOpenCreate = () => {
    setEditingOpp(null);
    setName('');
    setAmount('');
    setStage('QUALIFICATION');
    setProbability(20);
    setCloseDate('');
    setCompanyId(realAccounts[0]?.id || '');
    if (realAccounts[0]?.id) {
      handleCompanyChange(realAccounts[0].id);
    } else {
      setContactId('');
    }
    setServiceInterest('WEBSITE');
    setDescription('');
    setAssignedTo(realUsers[0]?.id || '');
    setErrors({});
    setModalOpen(true);
  };

  const handleOpenEdit = (rec: OpportunityRecord) => {
    setEditingOpp(rec);
    setName(rec.name);
    setAmount(String(rec.amount));
    setStage(rec.stage as any);
    setProbability(rec.probability);
    setCloseDate(rec.closeDate);
    setCompanyId(rec.companyId);
    setContactId(rec.contactId);
    setServiceInterest(rec.serviceInterest);
    setDescription(rec.description);

    // Look up owner id matching user name
    const foundUser = realUsers.find(
      (u) => `${u.name || ''}`.trim().toLowerCase() === rec.assignedTo.trim().toLowerCase()
    );
    setAssignedTo(foundUser ? foundUser.id : '');
    setErrors({});
    setModalOpen(true);
  };

  const handleSave = async () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Opportunity name is required';
    if (!amount || Number(amount) < 0) newErrors.amount = 'Please enter a valid amount';
    if (!closeDate) newErrors.closeDate = 'Expected close date is required';

    const duplicateOpp = oppsList.find(o => o.name.trim().toLowerCase() === name.trim().toLowerCase() && o.companyId === companyId && o.id !== editingOpp?.id);
    if (duplicateOpp) newErrors.name = `Cơ hội với tên "${name}" đã tồn tại dưới khách hàng này`;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload = {
      name: name.trim(),
      customerId: companyId,
      contactId: contactId || undefined,
      amount: Number(amount),
      stage: stage as any,
      probability,
      closeDate: closeDate,
      serviceInterest: serviceInterest as any,
      description: description.trim(),
      assignedToId: assignedTo || undefined,
    };

    try {
      if (editingOpp) {
        await updateMutation.mutateAsync({
          id: editingOpp.id,
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

  // Drag and Drop Logic
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    setDraggedOppId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetStage: typeof stages[number]) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain') || draggedOppId;
    if (!id) return;

    if (targetStage === 'CLOSED_LOST') {
      setDraggedOppId(id);
      setLostReason('');
      setLostModalOpen(true);
      return;
    }

    let prob = 10;
    if (targetStage === 'CLOSED_WON') prob = 100;
    else if (targetStage === 'NEGOTIATION') prob = 80;
    else if (targetStage === 'PROPOSAL') prob = 50;
    else if (targetStage === 'QUALIFICATION') prob = 20;

    try {
      await updateMutation.mutateAsync({
        id,
        dto: {
          stage: targetStage as any,
          probability: prob,
        },
      });
      message.success(t('opportunities.statusChanged',{stage:targetStage}));
    } catch (err) {
      // Handled
    }
    setDraggedOppId(null);
  };

  const handleSaveLost = async () => {
    if (!lostReason.trim()) {
      message.error(t('opportunities.lostReasonRequired'));
      return;
    }
    if (!draggedOppId) return;

    try {
      await closeLostMutation.mutateAsync({
        id: draggedOppId,
        lostReason,
      });
      setLostModalOpen(false);
    } catch (err) {
      // Handled
    }
    setDraggedOppId(null);
  };

  // Filter Opps
  const filteredOpps = oppsList.filter(o => {
    const matchesSearch = o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          o.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          o.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStage = filterStage === 'ALL' || o.stage === filterStage;
    const matchesInterest = filterInterest === 'ALL' || o.serviceInterest === filterInterest;
    return matchesSearch && matchesStage && matchesInterest;
  });

  // Table Columns
  const tableColumns: ColumnProps<OpportunityRecord>[] = [
    {
      title: t('opportunities.code'),
      dataIndex: 'code',
      key: 'code',
      render: (val, rec) => (
        <Link href={`/opportunities/${rec.id}`} className="font-mono text-xs font-semibold bg-[var(--color-surface)] px-2.5 py-1 rounded-lg border border-[var(--color-border)] hover:text-[var(--color-accent)] transition-colors">
          {val}
        </Link>
      ),
    },
    {
      title: t('opportunities.name'),
      dataIndex: 'name',
      key: 'name',
      render: (val, rec) => (
        <div>
          <Link href={`/opportunities/${rec.id}`} className="font-semibold text-[var(--color-fg)] hover:underline block">
            {val}
          </Link>
          <span className="text-[10px] text-[var(--color-muted-fg)] font-mono">{rec.serviceInterest}</span>
        </div>
      ),
    },
    {
      title: t('opportunities.customer'),
      dataIndex: 'companyName',
      key: 'companyName',
      render: (val, rec) => (
        <Link href={`/customers/accounts/${rec.companyId}`} className="text-xs font-semibold text-[var(--color-accent)] hover:underline">
          {val}
        </Link>
      ),
    },
    {
      title: t('opportunities.estimatedValue'),
      dataIndex: 'amount',
      key: 'amount',
      render: (val) => <span className="font-mono font-semibold text-xs text-[var(--color-fg)]">{val.toLocaleString('vi-VN')} VND</span>,
    },
    {
      title: t('opportunities.status'),
      dataIndex: 'stage',
      key: 'stage',
      render: (st) => (
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider ${
          st === 'CLOSED_WON' ? 'bg-green-500/10 text-green-500' :
          st === 'CLOSED_LOST' ? 'bg-red-500/10 text-red-500' :
          st === 'NEGOTIATION' ? 'bg-amber-500/10 text-amber-600' :
          st === 'PROPOSAL' ? 'bg-blue-500/10 text-blue-500' : 'bg-purple-500/10 text-purple-500'
        }`}>{getStageLabel(st)}</span>
      ),
    },
    {
      title: t('opportunities.closeProbability'),
      dataIndex: 'probability',
      key: 'probability',
      render: (val) => (
        <div className="flex items-center gap-2 min-w-[80px]">
          <Progress percent={val} size="small" showInfo={false} strokeColor="var(--color-accent)" />
          <span className="text-xs font-semibold font-mono">{val}%</span>
        </div>
      ),
    },
    {
      title: t('opportunities.expectedCloseDate'),
      dataIndex: 'closeDate',
      key: 'closeDate',
      render: (val) => <span className="text-xs font-mono text-[var(--color-muted-fg)]">{val}</span>,
    },
  ];

  const activeFiltersCount =
    (filterStage !== 'ALL' ? 1 : 0) + (filterInterest !== 'ALL' ? 1 : 0);

  return (
    <div className="space-y-4">
      {/* Title & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-base font-semibold sm: tracking-tight text-[var(--color-fg)]">{t('opportunities.title')}</h1>
          <p className="text-xs sm:text-xs text-[var(--color-muted-fg)] mt-0.5">{t('opportunities.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Search bar */}
          <div className="flex items-center gap-2 bg-[var(--color-bg-tint)] border border-[var(--color-border)] rounded-xl px-3 py-1.5 w-44 sm:w-64">
            <Search size={14} className="text-[var(--color-muted-fg)] shrink-0" />
            <input
              type="text"
              placeholder={t('opportunities.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-xs text-[var(--color-fg)] placeholder-[var(--color-muted-fg)] w-full"
            />
          </div>

          {/* Toggle View Mode */}
          <div className="bg-[var(--color-bg-tint)] p-1 rounded-xl border border-[var(--color-border)] flex h-9 items-center shrink-0">
            <button
              onClick={() => setViewMode('kanban')}
              title="Kanban View"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'kanban' ? 'bg-[var(--color-surface)] text-[var(--color-fg)] shadow-sm' : 'text-[var(--color-muted-fg)] hover:text-[var(--color-fg)]'
              }`}
            >
              <Layers size={15} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              title="Table View"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-[var(--color-surface)] text-[var(--color-fg)] shadow-sm' : 'text-[var(--color-muted-fg)] hover:text-[var(--color-fg)]'
              }`}
            >
              <List size={15} />
            </button>
          </div>

          {/* Filters Icon Button */}
          <button
            onClick={() => setFilterDrawerOpen(true)}
            title="Filters"
            className="w-9 h-9 flex items-center justify-center border border-[var(--color-border)] bg-[var(--color-bg-tint)] text-[var(--color-fg)] hover:bg-[var(--color-surface)] rounded-xl cursor-pointer relative shrink-0 transition-all"
          >
            <SlidersHorizontal size={15} />
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[var(--color-accent)] text-white w-4 h-4 rounded-full text-[9px] flex items-center justify-center font-bold animate-pulse">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* New Opportunity Icon Button */}
          <button
            onClick={handleOpenCreate}
            title={t('opportunities.createOpportunity')}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-gradient-to-r from-[var(--color-accent)] to-cyan-500 hover:opacity-90 text-white shadow-md cursor-pointer transition-all shrink-0"
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
                  setFilterStage('ALL');
                  setFilterInterest('ALL');
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
              {t('opportunities.salesStage')}
            </label>
            <Select
              value={filterStage}
              onChange={setFilterStage}
              className="w-full h-11"
              options={[
                { value: 'ALL', label: t('opportunities.allStages') },
                { value: 'QUALIFICATION', label: 'Qualification' },
                { value: 'PROPOSAL', label: 'Proposal' },
                { value: 'NEGOTIATION', label: 'Negotiation' },
                { value: 'CLOSED_WON', label: 'Won' },
                { value: 'CLOSED_LOST', label: 'Lost' },
              ]}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted-fg)]">
              {t('opportunities.serviceInterest')}
            </label>
            <Select
              value={filterInterest}
              onChange={setFilterInterest}
              className="w-full h-11"
              options={[
                { value: 'ALL', label: t('opportunities.allServices') },
                ...serviceOptions,
              ]}
            />
          </div>
        </div>
      </Drawer>

      {isOppsLoading ? (
        <div className="py-24 flex flex-col justify-center items-center gap-3">
          <Spin size="large" />
          <span className="text-xs text-[var(--color-muted-fg)] font-mono">{t('opportunities.loading')}</span>
        </div>
      ) : (
        /* Kanban Board View */
        viewMode === 'kanban' ? (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto min-h-[500px]">
            {stages.map(st => {
              const stageOpps = filteredOpps.filter(o => o.stage === st);
              const stageTotal = stageOpps.reduce((sum, o) => sum + o.amount, 0);

              return (
                <div
                  key={st}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, st)}
                  className="flex flex-col min-h-[450px]"
                >
                  {/* Column Header */}
                  <div className={`mb-4 pb-2 space-y-1 border-t-2 ${
                    st === 'QUALIFICATION' ? 'border-amber-400' :
                    st === 'PROPOSAL' ? 'border-blue-400' :
                    st === 'NEGOTIATION' ? 'border-purple-400' :
                    st === 'CLOSED_WON' ? 'border-emerald-400' : 'border-rose-400'
                  } pt-2`}>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold tracking-wider uppercase text-[var(--color-fg)]">
                        {st === 'QUALIFICATION' ? 'Qualification' :
                         st === 'PROPOSAL' ? 'Proposal' :
                         st === 'NEGOTIATION' ? 'Negotiation' :
                         st === 'CLOSED_WON' ? 'Closed Won' : 'Closed Lost'}
                      </span>
                      <span className="text-[10px] bg-[var(--color-surface)] text-[var(--color-muted-fg)] font-semibold font-mono px-2 py-0.5 rounded-full border border-[var(--color-border)]">
                        {stageOpps.length}
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-[var(--color-muted-fg)] font-semibold">
                      {stageTotal.toLocaleString('vi-VN')} VND
                    </p>
                  </div>

                  {/* Cards Container */}
                  <div className="flex-1 space-y-3 overflow-y-auto max-h-[500px] pr-1">
                    {stageOpps.map(opp => (
                      <div
                        key={opp.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, opp.id)}
                        className="bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)] rounded-xl p-4 shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing transition-all space-y-3 group relative"
                      >
                        <div>
                          <Link href={`/opportunities/${opp.id}`} className="font-semibold text-xs text-[var(--color-fg)] hover:underline block mb-0.5">
                            {opp.name}
                          </Link>
                          <span className="text-[10px] text-[var(--color-muted-fg)] font-semibold">{opp.companyName}</span>
                        </div>

                        <div className="flex justify-between items-center text-[10px] text-[var(--color-muted-fg)] font-mono">
                          <span>{opp.closeDate}</span>
                          <span className="font-semibold text-[var(--color-fg)]">{opp.amount.toLocaleString('vi-VN')} VND</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Progress percent={opp.probability} size="small" showInfo={false} strokeColor="var(--color-accent)" className="m-0" />
                          <span className="text-[10px] font-mono font-semibold">{opp.probability}%</span>
                        </div>

                        {opp.lostReason && (
                          <div className="text-[10px] text-red-500 bg-red-500/5 p-1.5 rounded-lg border border-red-500/10 flex items-start gap-1 font-mono">
                            <AlertCircle size={10} className="shrink-0 mt-0.5" />
                            <span>{opp.lostReason}</span>
                          </div>
                        )}
                      </div>
                    ))}
                    {stageOpps.length === 0 && (
                      <div className="h-28 border border-dashed border-[var(--color-border)] rounded-xl flex items-center justify-center text-[10px] text-[var(--color-muted-fg)]">
                        Drag here
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table View */
          <div className="">
          <SharedTable
              columns={tableColumns}
              dataSource={filteredOpps}
              onEdit={handleOpenEdit}
            />
          </div>
        )
      )}

      {/* Create / Edit Opportunity Modal */}
      <Modal
        title={editingOpp ? t('opportunities.edit') : t('opportunities.createTitle')}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={600} centered
        zIndex={1050}
      >
        <div className="space-y-6 pt-4">
          <FloatingInput label={t('opportunities.name')} value={name} onChange={setName} required />
          {errors.name && <p className="text-red-500 text-[10px] mt-1">{errors.name}</p>}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <FloatingInput label={t('opportunities.estimatedValueVnd')} type="number" value={amount} onChange={setAmount} required />
              {errors.amount && <p className="text-red-500 text-[10px] mt-1">{errors.amount}</p>}
            </div>
            <div>
              <FloatingInput label={t('opportunities.expectedCloseDateFormat')} type="date" value={closeDate} onChange={setCloseDate} required />
              {errors.closeDate && <p className="text-red-500 text-[10px] mt-1">{errors.closeDate}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormSelect
              label={t('opportunities.customerAccount')}
              required
              value={companyId}
              onChange={handleCompanyChange}
              options={realAccounts.map(a => ({ value: a.id, label: a.name }))}
            />
            <FormSelect
              label={t('opportunities.contactPerson')}
              value={contactId}
              onChange={(val) => setContactId(val as string)}
              placeholder="Select contact..."
              options={realContacts
                .filter((c: any) => {
                  if (!companyId) return true;
                  const accId = c.accountId || c.customerId || c.account?.id || c.customer?.id || c.account_id || c.customer_id;
                  return accId === companyId;
                })
                .map((c: any) => ({
                  value: c.id,
                  label: c.name || c.fullName || `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.email || 'Unnamed Contact',
                }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormSelect
              label={t('opportunities.salesStage')}
              required
              value={stage}
              onChange={(val) => handleStageChange(val as any)}
              options={[
                { value: 'QUALIFICATION', label: 'Qualification (20%)' },
                { value: 'PROPOSAL', label: 'Proposal (50%)' },
                { value: 'NEGOTIATION', label: 'Negotiation (75%)' },
              ]}
            />
            <FormSelect
              label={t('opportunities.serviceInterest')}
              value={serviceInterest}
              onChange={(val) => setServiceInterest(val as string)}
              options={serviceOptions}
            />
          </div>

          <FormSelect
            label={t('opportunities.owner')}
            required
            value={assignedTo}
            onChange={(val) => setAssignedTo(val as string)}
            options={realUsers.map(u => ({ value: u.id, label: u.name }))}
          />

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted-fg)]">
              {t('opportunities.scopeDescription')}
            </label>
            <textarea
              placeholder="Describe scope, notes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full min-h-[100px] p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-fg)] focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button onClick={() => setModalOpen(false)} className="rounded-xl">{t('opportunities.cancel')}</Button>
            <Button type="primary" onClick={handleSave} loading={createMutation.isPending || updateMutation.isPending} className="rounded-xl">{t('opportunities.saveChanges')}</Button>
          </div>
        </div>
      </Modal>

      {/* Closed Lost Reason Modal */}
      <Modal
        title={t('opportunities.closeLost')}
        open={lostModalOpen}
        onCancel={() => { setLostModalOpen(false); setDraggedOppId(null); }}
        onOk={handleSaveLost}
        confirmLoading={closeLostMutation.isPending}
        okText={t('opportunities.confirmCloseLost')}
        cancelText={t('opportunities.cancel')}
        zIndex={1050}
      >
        <div className="space-y-4 pt-4">
          <p className="text-xs text-[var(--color-muted-fg)]">{t('opportunities.closeLostReason')}</p>
          <textarea
            placeholder={t('opportunities.lostReasonPlaceholder')}
            value={lostReason}
            onChange={(e) => setLostReason(e.target.value)}
            className="w-full min-h-[100px] p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-fg)] focus:outline-none"
          />
        </div>
      </Modal>
    </div>
  );
}
