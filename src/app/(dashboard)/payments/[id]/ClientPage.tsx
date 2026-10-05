'use client';

import React, { useState, use } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Steps, Modal, Input, message, Spin } from 'antd';
import { ArrowLeft, User, Calendar, CreditCard, ArrowRight, ShieldCheck, FileText, CheckCircle2, AlertTriangle, Landmark, Ban, Printer, FileDown } from 'lucide-react';
import Link from 'next/link';
import { usePayment, useConfirmPayment } from '@/hooks/api/useContract';

interface PaymentRecord {
  id: string;
  invoiceNumber: string;
  amount: number;
  dueDate: string;
  paidAt?: string;
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  milestoneName: string;
  milestonePercentage: number;
  notes?: string;
  contractId: string;
  contractCode: string;
  contractTitle: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  createdAt: string;
}

export default function PaymentDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');

  // API Queries & Mutations
  const { data: paymentRes, isLoading } = usePayment(id);
  const confirmPaymentMutation = useConfirmPayment();

  const p = paymentRes?.data as any;

  if (isLoading) {
    return (
      <div className="py-32 flex flex-col justify-center items-center gap-3">
        <Spin size="large" />
        <span className="text-xs text-[var(--color-muted-fg)] font-mono">{t('payments.loading')}</span>
      </div>
    );
  }

  if (!p) {
    return <div className="p-8 text-center text-red-500 font-bold">{t('payments.notFound')}</div>;
  }

  const handleConfirmPayment = async () => {
    try {
      await confirmPaymentMutation.mutateAsync(p.id);
    } catch (err) {
      // Handled
    }
  };

  // Stepper helper
  const getStepIndex = (st: string) => {
    switch (st) {
      case 'PENDING': return 0;
      case 'OVERDUE': return 0;
      case 'PAID': return 1;
      case 'CANCELLED': return 1;
      default: return 0;
    }
  };

  const handlePrint = () => {
    message.info(t('payments.generatingPrint'));
    window.print();
  };

  const invoiceNumber = p.invoiceCode;
  const amount = Number(p.amount) || 0;
  const dueDate = p.dueDate ? p.dueDate.substring(0, 10) : '';
  const paidAt = p.paidDate ? p.paidDate.substring(0, 16).replace('T', ' ') : undefined;
  const createdAt = p.invoiceDate ? p.invoiceDate.substring(0, 10) : '';

  return (
    <div className="space-y-4">
      {/* Breadcrumb Header */}
      <div className="flex justify-between items-start shrink-0">
        <div>
          <div className="text-xs text-[var(--color-muted-fg)] flex items-center gap-1.5 mb-2 font-mono">
            <Link href="/payments" className="hover:underline">{t('payments.breadcrumbPayments')}</Link>
            <span>&gt;</span>
            <span className="text-[var(--color-fg)] font-semibold">{invoiceNumber}</span>
          </div>
          <h1 className="text-base font-semibold sm: tracking-tight text-[var(--color-fg)]">
            {t('payments.invoice')}: {invoiceNumber}
          </h1>
          <p className="text-xs text-[var(--color-muted-fg)]">{t('payments.milestoneBilling')}: {p.milestoneName} ({p.milestonePercentage}%) • {t('payments.client')}: {p.notes || t('payments.studioClient')}</p>
        </div>

        <div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            p.status === 'PAID' ? 'bg-green-500/10 text-green-500' :
            p.status === 'PENDING' ? 'bg-blue-500/10 text-blue-500' :
            p.status === 'OVERDUE' ? 'bg-red-500/10 text-red-500' : 'bg-gray-500/10 text-gray-500'
          }`}>
            {t('payments.status')}: {p.status}
          </span>
        </div>
      </div>

      {/* Stepper progress */}
      <div className="bg-[var(--color-bg-tint)] border border-[var(--color-border)] rounded-lg p-6">
        <Steps
          current={getStepIndex(p.status)}
          items={[
            { title: t('payments.awaitingPayment'), description: `${t('payments.dueBy')} ${dueDate}` },
            { title: p.status === 'CANCELLED' ? t('payments.cancelledVoid') : t('payments.clearedPayment'), description: p.status === 'CANCELLED' ? t('payments.invoiceCancelled') : (paidAt ? `${t('payments.paidOn')} ${paidAt}` : t('payments.cleared')) },
          ]}
          status={p.status === 'OVERDUE' ? 'error' : 'process'}
        />
      </div>

      {/* Main Grid 3:1 */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Side (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex gap-6 border-b border-[var(--color-border)] pb-px">
            {[
              { id: 'overview', name: t('payments.tabInvoiceInfo') },
              { id: 'preview', name: t('payments.tabInvoiceStatement') },
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

          <div className="bg-[var(--color-bg-tint)] border border-[var(--color-border)] rounded-[5px] p-6 min-h-[350px]">
            {activeTab === 'overview' && (
              <div className="space-y-4">
                {/* Meta details */}
                <div className="grid grid-cols-2 gap-6 text-xs border-b border-[var(--color-border)]/50 pb-6">
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted-fg)]">
                      {t('payments.paymentDetails')}
                    </h4>
                    <div className="flex justify-between border-b border-[var(--color-border)] pb-1.5">
                      <span className="text-[var(--color-muted-fg)]">{t('payments.amountDue')}</span>
                      <span className="font-semibold font-mono text-[var(--color-accent)]">{amount.toLocaleString('vi-VN')} VND</span>
                    </div>
                    <div className="flex justify-between border-b border-[var(--color-border)] pb-1.5">
                      <span className="text-[var(--color-muted-fg)]">{t('payments.dueDate')}</span>
                      <span className="font-semibold font-mono">{dueDate}</span>
                    </div>
                    <div className="flex justify-between border-b border-[var(--color-border)] pb-1.5">
                      <span className="text-[var(--color-muted-fg)]">{t('payments.paymentTerm')}</span>
                      <span className="font-semibold">{p.milestoneName} ({p.milestonePercentage}%)</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted-fg)]">
                      {t('payments.attachments')}
                    </h4>
                    <div className="flex justify-between border-b border-[var(--color-border)] pb-1.5">
                      <span className="text-[var(--color-muted-fg)]">{t('payments.customerNotes')}</span>
                      <span className="font-semibold">{p.notes || '-'}</span>
                    </div>
                  </div>
                </div>

                {/* Contract context */}
                <div className="space-y-3 text-xs">
                  <h4 className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted-fg)]">{t('payments.relatedEContract')}</h4>
                  <div className="p-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[5px] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="text-[var(--color-accent)]" size={24} />
                      <div>
                        <p className="font-semibold text-xs text-[var(--color-fg)]">{t('payments.relatedContractCode')}</p>
                        <p className="text-[10px] text-[var(--color-muted-fg)]">{t('payments.generatedFromDeal')}</p>
                      </div>
                    </div>
                    {p.contract?.id && (
                      <Link
                        href={`/contracts/${p.contract.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-surface)] text-[var(--color-fg)] transition-all"
                      >
                        <span>{t('payments.viewContract')}</span>
                        <ArrowRight size={12} />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'preview' && (
              <div className="space-y-6 text-xs text-[var(--color-fg)] font-mono max-w-xl mx-auto p-8 border border-[var(--color-border)] rounded-[5px] bg-[var(--color-surface)]/20 shadow-sm relative">
                {/* Print button overlay */}
                <button
                  onClick={handlePrint}
                  className="absolute top-4 right-4 p-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-muted-fg)] hover:text-[var(--color-fg)] cursor-pointer"
                  title={t('payments.printStatement')}
                >
                  <Printer size={14} />
                </button>

                <div className="flex justify-between items-start border-b border-[var(--color-border)] pb-6">
                  <div>
                    <h3 className="font-extrabold text-sm tracking-widest text-[var(--color-fg)] uppercase">{t('payments.companyName')}</h3>
                    <p className="text-[10px] text-[var(--color-muted-fg)] mt-1">{t('payments.companyAddress')}</p>
                    <p className="text-[10px] text-[var(--color-muted-fg)]">{t('payments.companyContact')}</p>
                  </div>
                  <div className="text-right">
                    <h4 className="font-extrabold text-[var(--color-accent)] text-base">{t('payments.invoiceStatement')}</h4>
                    <p className="text-[10px] text-[var(--color-muted-fg)] font-bold mt-1">{t('payments.number')}: {invoiceNumber}</p>
                    <p className="text-[10px] text-[var(--color-muted-fg)]">{t('payments.date')}: {createdAt}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 text-[11px] border-b border-[var(--color-border)] pb-6">
                  <div>
                    <p className="text-[10px] uppercase font-mono tracking-widest text-[var(--color-muted-fg)] mb-1">{t('payments.billedTo')}:</p>
                    <p className="font-bold">{p.notes || t('payments.xantivationClient')}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-mono tracking-widest text-[var(--color-muted-fg)] mb-1">{t('payments.paymentMethod')}:</p>
                    <p className="font-bold">{t('payments.bankTransfer')}</p>
                  </div>
                </div>

                <table className="w-full text-left text-[11px] border-b border-[var(--color-border)] pb-6">
                  <thead>
                    <tr className="border-b border-[var(--color-border)] text-[var(--color-muted-fg)]">
                      <th className="pb-2 font-mono font-bold uppercase text-[9px] tracking-wider">{t('payments.serviceDescription')}</th>
                      <th className="pb-2 text-right font-mono font-bold uppercase text-[9px] tracking-wider">{t('payments.total')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-3 font-semibold">
                        {p.milestoneName} {t('payments.billingMilestone')} ({p.milestonePercentage}% {t('payments.contractValue')})
                      </td>
                      <td className="py-3 text-right font-bold font-mono">
                        {amount.toLocaleString('vi-VN')} VND
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div className="flex justify-between items-center text-xs font-mono font-semibold pt-4">
                  <span className="text-[var(--color-muted-fg)]">{t('payments.totalBill')}:</span>
                  <span className="text-sm font-bold text-[var(--color-fg)]">{amount.toLocaleString('vi-VN')} VND</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar Control */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[var(--color-bg-tint)] border border-[var(--color-border)] rounded-[5px] p-6 space-y-6">
            <h3 className="text-xs font-mono uppercase tracking-widest text-[var(--color-muted-fg)]">
              {t('payments.financeControls')}
            </h3>

            <div className="space-y-3">
              {p.status === 'PENDING' && (
                <Button type="primary" onClick={handleConfirmPayment} loading={confirmPaymentMutation.isPending} className="w-full flex items-center justify-center gap-1.5 h-10 rounded-xl cursor-pointer">
                  <CreditCard size={14} />
                  <span>{t('payments.confirmPayment')}</span>
                </Button>
              )}
            </div>

            <div className="space-y-4 border-t border-[var(--color-border)]/50 pt-4 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-[var(--color-muted-fg)]">{t('payments.percentage')}:</span>
                <span className="font-semibold">{p.milestonePercentage}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-muted-fg)]">{t('payments.createdDate')}:</span>
                <span className="font-semibold">{createdAt}</span>
              </div>
              {paidAt && (
                <div className="flex justify-between">
                  <span className="text-[var(--color-muted-fg)]">{t('payments.receivedDate')}:</span>
                  <span className="font-semibold">{paidAt}</span>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
