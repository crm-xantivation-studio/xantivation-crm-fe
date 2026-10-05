'use client';

import React, { useState, use } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Steps, Progress, message, Table, Spin, Modal } from 'antd';
import { ArrowLeft, User, Calendar, Plus, PenTool, ArrowRight, ShieldCheck, FileText, CheckCircle2, AlertTriangle, Landmark, Send, Ban } from 'lucide-react';
import Link from 'next/link';
import { useContract, useStartContractSigning, useForceSignContract, useVoidContract, useConfirmPayment } from '@/hooks/api/useContract';
import { FloatingInput } from '@/components/FloatingInput';

interface PaymentScheduleRecord {
  id: string;
  invoiceNumber: string;
  amount: number;
  dueDate: string;
  paidAt?: string;
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  milestoneName: string;
  milestonePercentage: number;
}

export default function ContractDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');

  // API Queries
  const { data: contractRes, isLoading } = useContract(id);

  // API Mutations
  const startSigningMutation = useStartContractSigning();
  const forceSignMutation = useForceSignContract();
  const voidMutation = useVoidContract();
  const confirmPaymentMutation = useConfirmPayment();

  const c = contractRes?.data;

  // Local state for sending envelope inputs
  const [signerModalOpen, setSignerModalOpen] = useState(false);
  const [companySignerName, setCompanySignerName] = useState('Luu The Man');
  const [companySignerEmail, setCompanySignerEmail] = useState('manh.lt@xantivation.com');
  const [customerSignerName, setCustomerSignerName] = useState('');
  const [customerSignerEmail, setCustomerSignerEmail] = useState('');

  // Hydrate fields once data is loaded
  React.useEffect(() => {
    if (c) {
      setCustomerSignerName(c.contact ? `${c.contact.firstName || ''} ${c.contact.lastName || ''}`.trim() : '');
      setCustomerSignerEmail(c.contact?.email || '');
    }
  }, [c]);

  if (isLoading) {
    return (
      <div className="py-32 flex flex-col justify-center items-center gap-3">
        <Spin size="large" />
        <span className="text-xs text-[var(--color-muted-fg)] font-mono">{t('contracts.loading')}</span>
      </div>
    );
  }

  if (!c) {
    return <div className="p-8 text-center text-red-500 font-bold">{t('contracts.notFound')}</div>;
  }

  // Stepper helper
  const getStepIndex = (st: string) => {
    const steps = ['DRAFT', 'SENT', 'SIGNED'];
    if (st === 'VOIDED' || st === 'DECLINED' || st === 'EXPIRED') return 2;
    return steps.indexOf(st) !== -1 ? steps.indexOf(st) : 0;
  };

  const handleSendSigning = async () => {
    if (!customerSignerName.trim() || !customerSignerEmail.trim()) {
      message.error(t('contracts.signerError'));
      return;
    }

    try {
      await startSigningMutation.mutateAsync({
        id: c.id,
        dto: {
          companySignerName,
          companySignerEmail,
          customerSignerName,
          customerSignerEmail,
        }
      });
      setSignerModalOpen(false);
    } catch (err) {
      // Handled
    }
  };

  const handleForceSign = async () => {
    try {
      await forceSignMutation.mutateAsync(c.id);
    } catch (err) {
      // Handled
    }
  };

  const handleVoid = async () => {
    try {
      await voidMutation.mutateAsync(c.id);
    } catch (err) {
      // Handled
    }
  };

  const handleConfirmPaymentRow = async (paymentId: string) => {
    try {
      await confirmPaymentMutation.mutateAsync(paymentId);
    } catch (err) {
      // Handled
    }
  };

  // Convert payments from API format
  const paymentsList: PaymentScheduleRecord[] = (c.payments || []).map((p) => ({
    id: p.id,
    invoiceNumber: p.invoiceCode || '',
    amount: Number(p.amount) || 0,
    dueDate: p.dueDate ? p.dueDate.substring(0, 10) : '',
    paidAt: p.paidDate ? p.paidDate.substring(0, 16).replace('T', ' ') : undefined,
    status: p.status as any,
    milestoneName: p.milestoneName,
    milestonePercentage: p.milestonePercentage,
  }));

  const paymentColumns = [
    {
      title: t('contracts.colInvoiceCode'),
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
      render: (val: string) => <span className="font-mono text-xs font-semibold">{val}</span>
    },
    {
      title: t('contracts.colPaymentMilestone'),
      dataIndex: 'milestoneName',
      key: 'milestoneName',
      render: (val: string, rec: any) => (
        <div>
          <p className="font-semibold text-xs text-[var(--color-fg)]">{val}</p>
          <span className="px-2 py-0.2 rounded-full font-bold bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-[9px] font-mono">
            {rec.milestonePercentage}%
          </span>
        </div>
      )
    },
    {
      title: t('contracts.colPaymentDueDate'),
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (val: string) => <span className="text-xs font-mono text-[var(--color-muted-fg)]">{val}</span>
    },
    {
      title: t('contracts.colAmount'),
      dataIndex: 'amount',
      key: 'amount',
      render: (val: number) => <span className="font-mono font-semibold text-xs">{(Number(val) || 0).toLocaleString('vi-VN')} VND</span>
    },
    {
      title: t('contracts.colStatus'),
      dataIndex: 'status',
      key: 'status',
      render: (st: string) => (
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider ${
          st === 'PAID' ? 'bg-green-500/10 text-green-500' :
          st === 'OVERDUE' ? 'bg-red-500/10 text-red-500' :
          st === 'CANCELLED' ? 'bg-gray-500/10 text-gray-500' : 'bg-amber-500/10 text-amber-600'
        }`}>{st}</span>
      )
    },
    {
      title: t('contracts.colPaymentDate'),
      dataIndex: 'paidAt',
      key: 'paidAt',
      render: (val: string) => <span className="text-xs font-mono text-[var(--color-muted-fg)]">{val || '-'}</span>
    },
    {
      title: t('contracts.colActions'),
      key: 'action',
      render: (_: any, rec: any) => (
        rec.status === 'PENDING' ? (
          <Button size="small" type="primary" onClick={() => handleConfirmPaymentRow(rec.id)} loading={confirmPaymentMutation.isPending} className="text-[10px] rounded-lg">
            {t('contracts.confirmPayment')}
          </Button>
        ) : null
      )
    }
  ];

  // Visual calculation of total payments paid
  const totalPaid = paymentsList.filter(p => p.status === 'PAID').reduce((sum, p) => sum + p.amount, 0);
  const paidPercent = c.contractValue ? Math.round((totalPaid / c.contractValue) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Breadcrumbs & Title */}
      <div className="flex justify-between items-start shrink-0">
        <div>
          <div className="text-xs text-[var(--color-muted-fg)] flex items-center gap-1.5 mb-2 font-mono">
            <Link href="/contracts" className="hover:underline">{t('contracts.breadcrumbContracts')}</Link>
            <span>&gt;</span>
            <span className="text-[var(--color-fg)] font-semibold">{c.contractCode}</span>
          </div>
          <h1 className="text-base font-semibold sm: tracking-tight text-[var(--color-fg)]">
            {c.title}
          </h1>
          <p className="text-xs text-[var(--color-muted-fg)]">{t('contracts.contractCode')}: {c.contractCode} &bull; {t('contracts.value')}: {(c.contractValue || 0).toLocaleString('vi-VN')} VND</p>
        </div>

        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            c.status === 'SIGNED' ? 'bg-green-500/10 text-green-500' :
            c.status === 'VOIDED' || c.status === 'DECLINED' ? 'bg-red-500/10 text-red-500' :
            'bg-blue-500/10 text-blue-500'
          }`}>
            {t('contracts.status')}: {c.status}
          </span>
        </div>
      </div>

      {/* Visual Stepper */}
      {c.status !== 'VOIDED' && c.status !== 'DECLINED' && c.status !== 'EXPIRED' ? (
        <div className="bg-[var(--color-bg-tint)] border border-[var(--color-border)] p-6 rounded-lg">
          <Steps
            current={getStepIndex(c.status)}
            items={[
              { title: t('contracts.stepDraft'), description: t('contracts.legalClauses') },
              { title: t('contracts.stepSentToSign'), description: t('contracts.docuSignConnect') },
              { title: t('contracts.stepSigned'), description: t('contracts.activated') },
            ]}
          />
        </div>
      ) : (
        <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-xl flex items-center gap-3">
          <AlertTriangle className="text-red-500 shrink-0" size={20} />
          <div className="text-xs text-red-800 font-mono">
            <span className="font-bold uppercase block">{t('contracts.status')}: {c.status}</span>
            <span>{t('contracts.legalNotes')}: {c.legalNotes || t('contracts.noLegalNotes')}</span>
          </div>
        </div>
      )}

      {/* Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* Left Side (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex gap-6 border-b border-[var(--color-border)] pb-px">
            {[
              { id: 'overview', name: t('contracts.tabOverview') },
              { id: 'payments', name: t('contracts.tabPaymentSchedule') },
              { id: 'clauses', name: t('contracts.tabLegalClauses') },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
                    : 'border-transparent text-[var(--color-muted-fg)] hover:text-[var(--color-fg)]'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>

          <div className="bg-[var(--color-bg-tint)] border border-[var(--color-border)] rounded-[5px] p-6 min-h-[300px]">
            {activeTab === 'overview' && (
              <div className="space-y-4">
                {/* Revenue collection progress */}
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[5px] p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-1">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted-fg)]">{t('contracts.revenueCollected')}</p>
                    <p className="text-base sm:text-lg font-semibold tracking-tight text-[var(--color-fg)] font-mono">{totalPaid.toLocaleString('vi-VN')} VND</p>
                  </div>
                  <div className="flex-1 max-w-xs space-y-1">
                    <div className="flex justify-between text-xs font-mono text-[var(--color-muted-fg)]">
                      <span>{t('contracts.paymentProgress')}</span>
                      <span className="font-bold">{paidPercent}%</span>
                    </div>
                    <Progress percent={paidPercent} size="small" showInfo={false} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 text-sm">
                  <div className="space-y-3">
                    <h3 className="text-xs font-mono uppercase tracking-widest text-[var(--color-muted-fg)]">{t('contracts.dealInformation')}</h3>
                    <div className="flex justify-between border-b border-[var(--color-border)] pb-2">
                      <span className="text-[var(--color-muted-fg)]">{t('contracts.originalDeal')}</span>
                      <Link href={`/deals/${c.dealId}`} className="font-semibold text-[var(--color-accent)] hover:underline">
                        {c.deal?.projectName || t('contracts.dealDetails')}
                      </Link>
                    </div>
                    <div className="flex justify-between border-b border-[var(--color-border)] pb-2">
                      <span className="text-[var(--color-muted-fg)]">{t('contracts.contractValue')}</span>
                      <span className="font-semibold font-mono">{(Number(c.contractValue) || 0).toLocaleString('vi-VN')} VND</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xs font-mono uppercase tracking-widest text-[var(--color-muted-fg)]">{t('contracts.legalEntityCustomer')}</h3>
                    <div className="flex justify-between border-b border-[var(--color-border)] pb-2">
                      <span className="text-[var(--color-muted-fg)]">{t('contracts.company')}</span>
                      <span className="font-semibold">{c.account?.name || '-'}</span>
                    </div>
                    <div className="flex justify-between border-b border-[var(--color-border)] pb-2">
                      <span className="text-[var(--color-muted-fg)]">{t('contracts.authorizedSignatory')}</span>
                      <span className="font-semibold">{c.contact ? `${c.contact.firstName || ''} ${c.contact.lastName || ''}`.trim() : '-'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'payments' && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-[var(--color-fg)]">{t('contracts.invoicePaymentSchedule')}</h3>
                <Table
                  columns={paymentColumns}
                  dataSource={paymentsList}
                  pagination={false}
                  rowKey="id"
                  className="border border-[var(--color-border)] rounded-xl overflow-hidden text-xs"
                />
              </div>
            )}

            {activeTab === 'clauses' && (
              <div className="space-y-6 text-xs text-[var(--color-fg)] font-mono leading-relaxed">
                <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl whitespace-pre-wrap">
                  {c.termsConditions || t('contracts.defaultTerms')}
                </div>
                {c.legalNotes && (
                  <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl space-y-2">
                    <h4 className="text-[10px] uppercase font-mono tracking-widest text-amber-600 font-bold">{t('contracts.additionalLegalNotes')}</h4>
                    <p className="text-[11px]">{c.legalNotes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar Control */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[var(--color-bg-tint)] border border-[var(--color-border)] rounded-[5px] p-6 space-y-6">
            <h3 className="text-xs font-mono uppercase tracking-widest text-[var(--color-muted-fg)]">
              {t('contracts.docuSignControls')}
            </h3>

            <div className="space-y-3">
              {c.status === 'DRAFT' && (
                <Button type="primary" onClick={() => setSignerModalOpen(true)} className="w-full flex items-center justify-center gap-1.5 h-10 rounded-xl cursor-pointer">
                  <Send size={14} />
                  <span>{t('contracts.startEnvelopeSign')}</span>
                </Button>
              )}

              {c.status === 'SENT' && (
                <>
                  <Button type="primary" onClick={handleForceSign} loading={forceSignMutation.isPending} className="w-full bg-green-600 hover:bg-green-700 border-green-600 flex items-center justify-center gap-1.5 h-10 rounded-xl cursor-pointer">
                    <PenTool size={14} />
                    <span>{t('contracts.forceSignContract')}</span>
                  </Button>
                  <Button danger onClick={handleVoid} loading={voidMutation.isPending} className="w-full flex items-center justify-center gap-1.5 h-10 rounded-xl cursor-pointer">
                    <Ban size={14} />
                    <span>{t('contracts.voidContract')}</span>
                  </Button>
                </>
              )}
            </div>

            <div className="space-y-4 border-t border-[var(--color-border)]/50 pt-4 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-[var(--color-muted-fg)]">{t('contracts.envelopeId')}:</span>
                <span className="font-semibold text-right max-w-[120px] truncate">{c.esignEnvelopeId || t('contracts.notGenerated')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-muted-fg)]">{t('contracts.createdDate')}:</span>
                <span className="font-semibold">{c.createdAt ? c.createdAt.substring(0, 10) : ''}</span>
              </div>
              {c.signedDate && (
                <div className="flex justify-between">
                  <span className="text-[var(--color-muted-fg)]">{t('contracts.signedDate')}:</span>
                  <span className="font-semibold">{c.signedDate.substring(0, 10)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Start Envelope Sign Modal */}
      <Modal
        title={t('contracts.startEnvelopeSignTitle')}
        open={signerModalOpen}
        onCancel={() => setSignerModalOpen(false)}
        onOk={handleSendSigning}
        confirmLoading={startSigningMutation.isPending}
        okText={t('contracts.generateEnvelope')}
        cancelText={t('contracts.cancel')}
      >
        <div className="space-y-4 pt-4">
          <p className="text-xs text-[var(--color-muted-fg)]">{t('contracts.signerModalDescription')}</p>
          <div className="grid grid-cols-2 gap-4">
            <FloatingInput label={t('contracts.xantivationRepName')} value={companySignerName} onChange={setCompanySignerName} required />
            <FloatingInput label={t('contracts.xantivationRepEmail')} value={companySignerEmail} onChange={setCompanySignerEmail} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FloatingInput label={t('contracts.customerRepName')} value={customerSignerName} onChange={setCustomerSignerName} required />
            <FloatingInput label={t('contracts.customerRepEmail')} value={customerSignerEmail} onChange={setCustomerSignerEmail} required />
          </div>
        </div>
      </Modal>
    </div>
  );
}
