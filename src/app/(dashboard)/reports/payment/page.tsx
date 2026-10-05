'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Table, Select, Skeleton, Tag } from 'antd';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { usePaymentReport } from '@/hooks/api/useReport';
import { formatVND, formatDate, getStatusColor } from '@/lib/utils';
import { Filter, AlertTriangle, Calendar, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PaymentReport() {
  const { t } = useTranslation();
  const [period, setPeriod] = useState('Month');
  const { data, isLoading } = usePaymentReport({ period });

  const report = data?.data;

  const tableColumns = [
    {
      title: t('reports.invoiceNumber'),
      dataIndex: 'invoiceCode',
      key: 'invoiceCode',
      render: (val: string) => <span className="font-mono text-xs">{val}</span>,
    },
    {
      title: t('reports.customer'),
      dataIndex: 'account',
      key: 'account',
    },
    {
      title: t('reports.paymentMilestone'),
      dataIndex: 'milestone',
      key: 'milestone',
      render: (val: string) => <span className="text-xs text-[var(--color-muted-fg)] font-medium">{val}</span>,
    },
    {
      title: t('reports.amount'),
      dataIndex: 'amount',
      key: 'amount',
      render: (val: number) => <span className="font-mono font-semibold">{formatVND(val)}</span>,
    },
    {
      title: t('reports.dueDate'),
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (val: string) => <span className="font-mono">{formatDate(val)}</span>,
    },
    {
      title: t('reports.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const color = getStatusColor(status);
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: t('reports.overdueDays'),
      dataIndex: 'daysOverdue',
      key: 'daysOverdue',
      align: 'center' as const,
      render: (val: number) => (
        <span className={`font-mono ${val > 0 ? 'text-rose-500 font-semibold' : 'text-[var(--color-muted-fg)]'}`}>
          {val > 0 ? `${val} days` : '-'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-base font-semibold tracking-tight text-[var(--color-fg)]">{t('reports.cashFlowTitle')}</h1>
          <p className="text-xs text-[var(--color-muted-fg)]">{t('reports.cashFlowDesc')}</p>
        </div>
        
        <div className="flex items-center gap-3 bg-[var(--color-bg-tint)] border border-[var(--color-border)] px-4 py-2 rounded-xl">
          <Filter size={14} className="text-[var(--color-muted-fg)]" />
          <span className="text-xs text-[var(--color-muted-fg)] font-mono">{t('reports.viewBy')}:</span>
          <Select
            value={period}
            onChange={setPeriod}
            bordered={false}
            dropdownStyle={{ minWidth: 120 }}
            options={[
              { value: 'Month', label: t('reports.monthly') },
              { value: 'Quarter', label: t('reports.quarterly') },
            ]}
            className="text-xs text-[var(--color-fg)] font-semibold"
          />
        </div>
      </div>

      {/* Overdue Alerts Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[var(--color-bg-tint)] border border-[var(--color-border)] rounded-[5px] p-6 flex items-center gap-4 hover-action border-l-4 border-l-rose-500">
          <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl animate-pulse">
            <AlertTriangle size={20} />
          </div>
          <div>
            <p className="text-xs font-mono uppercase tracking-wider text-[var(--color-muted-fg)]">{t('reports.overdueInvoices')}</p>
            <h2 className="text-base sm:text-lg font-semibold text-rose-500 mt-1">
              {isLoading ? <Skeleton.Input active size="small" style={{ width: 60 }} /> : `${report?.overdueSummary?.count} invoices`}
            </h2>
          </div>
        </div>

        <div className="bg-[var(--color-bg-tint)] border border-[var(--color-border)] rounded-[5px] p-6 flex items-center gap-4 hover-action">
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
            <Wallet size={20} />
          </div>
          <div>
            <p className="text-xs font-mono uppercase tracking-wider text-[var(--color-muted-fg)]">{t('reports.totalOverdueAmount')}</p>
            <h2 className="text-base sm:text-lg font-semibold text-[var(--color-fg)] mt-1">
              {isLoading ? <Skeleton.Input active size="small" style={{ width: 60 }} /> : formatVND(report?.overdueSummary?.amount)}
            </h2>
          </div>
        </div>

        <div className="bg-[var(--color-bg-tint)] border border-[var(--color-border)] rounded-[5px] p-6 flex items-center gap-4 hover-action">
          <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl">
            <Calendar size={20} />
          </div>
          <div>
            <p className="text-xs font-mono uppercase tracking-wider text-[var(--color-muted-fg)]">{t('reports.avgDaysOverdue')}</p>
            <h2 className="text-base sm:text-lg font-semibold text-[var(--color-fg)] mt-1">
              {isLoading ? <Skeleton.Input active size="small" style={{ width: 60 }} /> : `${report?.overdueSummary?.avgDays} days`}
            </h2>
          </div>
        </div>
      </div>

      {/* Cash Flow Chart */}
      <div className="bg-[var(--color-bg-tint)] border border-[var(--color-border)] rounded-[5px] p-6">
        <h3 className="text-sm font-mono uppercase tracking-wider text-[var(--color-muted-fg)] mb-6">{t('reports.cashFlowPlannedVsActual')}</h3>
        {isLoading ? (
          <Skeleton active paragraph={{ rows: 5 }} />
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={report?.cashFlow}>
                <defs>
                  <linearGradient id="planGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818CF8" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#818CF8" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="paidGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="period" stroke="var(--color-muted-fg)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-fg)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  formatter={(value: any) => [formatVND(Number(value)), t('reports.value')]}
                  contentStyle={{
                    backgroundColor: 'var(--color-bg-tint)',
                    borderColor: 'var(--color-border)',
                    borderRadius: '12px',
                    color: 'var(--color-fg)'
                  }}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Area name={t('reports.plannedRevenue')} type="monotone" dataKey="planned" stroke="#818CF8" strokeWidth={2} fillOpacity={1} fill="url(#planGrad)" />
                <Area name={t('reports.actualRevenue')} type="monotone" dataKey="actual" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#paidGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Invoice list */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <Card className="bg-[var(--color-bg-tint)] border border-[var(--color-border)] rounded-[5px]">
          <h3 className="text-sm font-mono uppercase tracking-wider text-[var(--color-muted-fg)] mb-6">{t('reports.invoicePaymentTracking')}</h3>
          <Table
            dataSource={report?.invoices}
            columns={tableColumns}
            rowKey="invoiceCode"
            pagination={{ pageSize: 5 }}
            loading={isLoading}
            className="border-none"
          />
        </Card>
      </motion.div>
    </div>
  );
}
