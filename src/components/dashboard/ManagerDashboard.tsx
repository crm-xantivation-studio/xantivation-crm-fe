'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Table } from 'antd';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import {
  useDashboardMetrics,
  useDashboardPipelineFunnel,
  useDashboardRevenueForecast,
  useDashboardLeadSources,
  useDashboardTopPerformers
} from '@/hooks/api/useDashboard';
import { formatVND } from '@/lib/utils';
import { Users, BarChart3, TrendingUp, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import AnimatedCounter from '@/components/AnimatedCounter';

export default function ManagerDashboard() {
  const { t } = useTranslation();
  const { data: metricsData, isLoading: metricsLoading } = useDashboardMetrics();
  const { data: funnelData, isLoading: funnelLoading } = useDashboardPipelineFunnel();
  const { data: forecastData, isLoading: forecastLoading } = useDashboardRevenueForecast();
  const { data: sourcesData, isLoading: sourcesLoading } = useDashboardLeadSources();
  const { data: performersData, isLoading: performersLoading } = useDashboardTopPerformers();

  const metrics = metricsData?.data;
  const funnel = funnelData?.data || [];
  const forecast = forecastData?.data || [];
  const sources = sourcesData?.data || [];
  const performers = performersData?.data || [];

  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  const performerColumns = [
    {
      title: t('managerDashboard.rank'),
      key: 'rank',
      width: 60,
      align: 'center' as const,
      render: (_: any, __: any, index: number) => (
        <span className="font-mono font-bold text-xs text-[var(--color-accent)]">#{index + 1}</span>
      ),
    },
    {
      title: t('managerDashboard.employeeName'),
      dataIndex: 'name',
      key: 'name',
      render: (val: string) => <span className="font-semibold text-[var(--color-fg)] text-xs">{val}</span>,
    },
    {
      title: t('managerDashboard.closedOpportunities'),
      dataIndex: 'count',
      key: 'count',
      align: 'center' as const,
      render: (val: number) => <span className="font-mono text-xs">{val} deal</span>,
    },
    {
      title: t('managerDashboard.revenue'),
      dataIndex: 'wonAmount',
      key: 'wonAmount',
      render: (val: number) => <span className="font-mono text-emerald-500 font-semibold text-xs">{formatVND(val)}</span>,
    },
  ];

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.06 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] as const } }
  };

  if (metricsLoading || funnelLoading || forecastLoading || sourcesLoading || performersLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array(3).fill(null).map((_, idx) => (
            <div key={idx} className="bg-[var(--color-bg-tint)] border border-[var(--color-border)] rounded-2xl p-6 h-28 flex flex-col justify-between shimmer-skeleton">
              <div className="h-3.5 bg-[var(--color-surface)] w-28 rounded-md"></div>
              <div className="h-7 bg-[var(--color-surface)] w-40 rounded-md"></div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-[var(--color-bg-tint)] border border-[var(--color-border)] rounded-2xl p-6 h-[400px] shimmer-skeleton"></div>
          <div className="bg-[var(--color-bg-tint)] border border-[var(--color-border)] rounded-2xl p-6 h-[400px] shimmer-skeleton"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="az-card h-28 p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-mono font-semibold uppercase text-[var(--color-muted-fg)]">{t('managerDashboard.totalPipelineValue')}</span>
            <TrendingUp size={16} className="text-[var(--color-accent)]" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--color-fg)]">
            <AnimatedCounter value={metrics?.pipelineValue ?? 0} formatter={(v) => formatVND(v)} />
          </h2>
        </motion.div>

        <motion.div variants={itemVariants} className="az-card h-28 p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-mono font-semibold uppercase text-[var(--color-muted-fg)]">{t('managerDashboard.forecast30d')}</span>
            <BarChart3 size={16} className="text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--color-fg)]">
            <AnimatedCounter value={metrics?.revenueForecast30Days ?? 0} formatter={(v) => formatVND(v)} />
          </h2>
        </motion.div>

        <motion.div variants={itemVariants} className="az-card h-28 p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-mono font-semibold uppercase text-[var(--color-muted-fg)]">{t('managerDashboard.activeContracts')}</span>
            <Users size={16} className="text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--color-fg)]">
            <AnimatedCounter value={metrics?.activeContracts ?? 0} />
          </h2>
        </motion.div>
      </div>

      {/* Charts Bento Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Value chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2 az-card p-6">
          <h3 className="text-sm font-bold text-[var(--color-fg)] mb-6">{t('managerDashboard.pipelineByStage')}</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnel} layout="vertical" margin={{ left: 10, right: 30, top: 10, bottom: 10 }}>
                <defs>
                  {funnel.map((_, index) => (
                    <linearGradient key={`barGrad-${index}`} id={`barGrad-${index}`} x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.85} />
                      <stop offset="100%" stopColor={COLORS[index % COLORS.length]} stopOpacity={1} />
                    </linearGradient>
                  ))}
                </defs>
                <XAxis type="number" stroke="var(--color-muted-fg)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis dataKey="stage" type="category" stroke="var(--color-muted-fg)" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: 'var(--color-surface)', opacity: 0.15 }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="custom-recharts-tooltip">
                          <p className="text-xs font-semibold text-[var(--color-fg)]">{payload[0].payload.stage}</p>
                          <p className="text-xs text-[var(--color-accent)] font-mono mt-1">
                            {formatVND(Number(payload[0].value))}
                          </p>
                          <p className="text-[10px] text-[var(--color-muted-fg)] mt-0.5">
                            {t('managerDashboard.opportunities', {count: payload[0].payload.count})}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={14}>
                  {funnel.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`url(#barGrad-${index})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Lead source Pie chart */}
        <motion.div variants={itemVariants} className="az-card p-6">
          <h3 className="text-sm font-bold text-[var(--color-fg)] mb-6">{t('managerDashboard.leadSources')}</h3>
          <div className="h-72 flex flex-col justify-between">
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sources}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {sources.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="var(--color-bg-tint)" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="custom-recharts-tooltip">
                            <p className="text-xs font-semibold text-[var(--color-fg)]">{payload[0].name}</p>
                            <p className="text-xs text-[var(--color-accent)] font-mono mt-1">
                              {payload[0].value} Leads
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Custom mini legend */}
            <div className="grid grid-cols-3 gap-2 text-[9px] font-mono text-[var(--color-muted-fg)]">
              {sources.slice(0, 6).map((src, idx) => (
                <div key={idx} className="flex items-center gap-1.5 truncate">
                  <span className="w-2 h-2 rounded-full block shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                  <span className="truncate">{src.name} ({src.value})</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Forecast chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2 az-card p-6">
          <h3 className="text-sm font-bold text-[var(--color-fg)] mb-6">{t('managerDashboard.forecast6m')}</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecast} margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
                <defs>
                  <linearGradient id="foreGradM" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="actGradM" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="var(--color-muted-fg)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-fg)" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="custom-recharts-tooltip space-y-1">
                          <p className="text-xs font-semibold text-[var(--color-fg)] mb-1">{payload[0].payload.date}</p>
                          {payload.map((p, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.stroke }}></span>
                              <span className="text-[10px] text-[var(--color-muted-fg)]">{p.name}:</span>
                              <span className="text-[10px] font-mono text-[var(--color-fg)] font-semibold">{formatVND(Number(p.value))}</span>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area name={t('managerDashboard.forecast')} type="monotone" dataKey="forecast" stroke="var(--color-accent)" strokeWidth={2.5} fillOpacity={1} fill="url(#foreGradM)" />
                <Area name={t('managerDashboard.actual')} type="monotone" dataKey="actual" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#actGradM)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Top Performers */}
        <motion.div variants={itemVariants} className="az-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[var(--color-fg)]">{t('managerDashboard.salesTeamRanking')}</h3>
            <Award size={16} className="text-amber-500" />
          </div>
          <Table
            dataSource={performers}
            columns={performerColumns}
            rowKey="email"
            pagination={false}
            loading={performersLoading}
            size="small"
            className="border-none bg-transparent"
          />
        </motion.div>
      </div>
    </motion.div>
  );
}
