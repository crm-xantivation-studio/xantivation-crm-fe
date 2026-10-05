'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Table, Select, Skeleton } from 'antd';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { useSalesForecast } from '@/hooks/api/useReport';
import { formatVND } from '@/lib/utils';
import { Filter, TrendingUp, Calendar, Compass } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SalesForecast() {
  const { t } = useTranslation();
  const [horizon, setHorizon] = useState(30);
  const { data, isLoading } = useSalesForecast({ horizon });

  const report = data?.data;

  const tableColumns = [
    {
      title: t('reports.oppCode'),
      dataIndex: 'code',
      key: 'code',
      render: (val: string) => <span className="font-mono text-xs">{val}</span>,
    },
    {
      title: t('reports.oppName'),
      dataIndex: 'name',
      key: 'name',
      render: (val: string) => <span className="font-semibold text-[var(--color-fg)]">{val}</span>,
    },
    {
      title: t('reports.customer'),
      dataIndex: 'account',
      key: 'account',
    },
    {
      title: t('reports.stage'),
      dataIndex: 'stage',
      key: 'stage',
      render: (stage: string) => (
        <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 font-medium">
          {stage}
        </span>
      ),
    },
    {
      title: t('reports.probability'),
      dataIndex: 'probability',
      key: 'probability',
      align: 'center' as const,
      render: (val: number) => <span className="font-mono">{val}%</span>,
    },
    {
      title: t('reports.expectedValue'),
      dataIndex: 'amount',
      key: 'amount',
      render: (val: number) => <span className="font-mono">{formatVND(val)}</span>,
    },
    {
      title: t('reports.weightedValue'),
      dataIndex: 'weightedValue',
      key: 'weightedValue',
      render: (val: number) => <span className="font-mono text-emerald-500 font-semibold">{formatVND(val)}</span>,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-base font-semibold tracking-tight text-[var(--color-fg)]">{t('reports.salesForecastTitle')}</h1>
          <p className="text-xs text-[var(--color-muted-fg)]">{t('reports.salesForecastDesc')}</p>
        </div>
        
        <div className="flex items-center gap-3 bg-[var(--color-bg-tint)] border border-[var(--color-border)] px-4 py-2 rounded-xl">
          <Filter size={14} className="text-[var(--color-muted-fg)]" />
          <span className="text-xs text-[var(--color-muted-fg)] font-mono">{t('reports.forecastPeriod')}</span>
          <Select
            value={horizon}
            onChange={setHorizon}
            bordered={false}
            dropdownStyle={{ minWidth: 120 }}
            options={[
              { value: 30, label: t('reports.period30d') },
              { value: 60, label: t('reports.period60d') },
              { value: 90, label: t('reports.period90d') },
            ]}
            className="text-xs text-[var(--color-fg)] font-semibold"
          />
        </div>
      </div>

      {/* Analytical Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Forecast trend line chart */}
        <div className="bg-[var(--color-bg-tint)] border border-[var(--color-border)] rounded-[5px] p-6">
          <h3 className="text-sm font-mono uppercase tracking-wider text-[var(--color-muted-fg)] mb-6">{t('reports.forecastVsActual')}</h3>
          {isLoading ? (
            <Skeleton active paragraph={{ rows: 5 }} />
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={report?.monthlyForecast}>
                  <defs>
                    <linearGradient id="foreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="actGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="period" stroke="var(--color-muted-fg)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--color-muted-fg)" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    formatter={(value: any) => [formatVND(Number(value)), 'Value']}
                    contentStyle={{
                      backgroundColor: 'var(--color-bg-tint)',
                      borderColor: 'var(--color-border)',
                      borderRadius: '12px',
                      color: 'var(--color-fg)'
                    }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Area name={t('reports.forecastRevenue')} type="monotone" dataKey="weightedValue" stroke="#4F46E5" strokeWidth={2} fillOpacity={1} fill="url(#foreGrad)" />
                  <Area name={t('reports.actualSales')} type="monotone" dataKey="actualValue" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#actGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Stacked bar breakdown */}
        <div className="bg-[var(--color-bg-tint)] border border-[var(--color-border)] rounded-[5px] p-6">
          <h3 className="text-sm font-mono uppercase tracking-wider text-[var(--color-muted-fg)] mb-6">{t('reports.pipelineWeighted')}</h3>
          {isLoading ? (
            <Skeleton active paragraph={{ rows: 5 }} />
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={report?.monthlyForecast}>
                  <XAxis dataKey="period" stroke="var(--color-muted-fg)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--color-muted-fg)" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    formatter={(value: any) => [formatVND(Number(value)), 'Weighted']}
                    contentStyle={{
                      backgroundColor: 'var(--color-bg-tint)',
                      borderColor: 'var(--color-border)',
                      borderRadius: '12px',
                      color: 'var(--color-fg)'
                    }}
                  />
                  <Bar name={t('reports.weightedRevenue')} dataKey="weightedValue" fill="#818CF8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Top pipeline items table */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <Card className="bg-[var(--color-bg-tint)] border border-[var(--color-border)] rounded-[5px]">
          <h3 className="text-sm font-mono uppercase tracking-wider text-[var(--color-muted-fg)] mb-6">{t('reports.topOpportunities')}</h3>
          <Table
            dataSource={report?.topOpportunities}
            columns={tableColumns}
            rowKey="id"
            pagination={{ pageSize: 5 }}
            loading={isLoading}
            className="border-none"
          />
        </Card>
      </motion.div>
    </div>
  );
}
