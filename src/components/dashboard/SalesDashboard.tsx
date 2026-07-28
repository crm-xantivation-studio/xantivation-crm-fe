'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Empty, Timeline } from 'antd';
import { ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import {
  useDashboardMetrics,
  useDashboardPipelineFunnel,
  useDashboardMyLeads,
  useDashboardExpiringQuotations
} from '@/hooks/api/useDashboard';
import { formatVND, formatDate } from '@/lib/utils';
import { Target, Clock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import AnimatedCounter from '@/components/AnimatedCounter';

export default function SalesDashboard() {
  const { t } = useTranslation();
  const { data: metricsData, isLoading: metricsLoading } = useDashboardMetrics();
  const { data: funnelData, isLoading: funnelLoading } = useDashboardPipelineFunnel();
  const { data: leadsData, isLoading: leadsLoading } = useDashboardMyLeads();
  const { data: quotesData, isLoading: quotesLoading } = useDashboardExpiringQuotations();

  const metrics = metricsData?.data;
  const funnel = funnelData?.data || [];
  const leads = leadsData?.data || [];
  const quotes = quotesData?.data || [];

  const activeStages = funnel.filter(f => ['Prospecting', 'Qualification', 'Proposal', 'Negotiation'].includes(f.stage));

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.06 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] as const } }
  };

  if (metricsLoading || funnelLoading || leadsLoading || quotesLoading) {
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
          <div className="lg:col-span-2 bg-[var(--color-bg-tint)] border border-[var(--color-border)] rounded-2xl p-6 h-80 shimmer-skeleton"></div>
          <div className="bg-[var(--color-bg-tint)] border border-[var(--color-border)] rounded-2xl p-6 h-80 shimmer-skeleton"></div>
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
            <span className="text-xs font-mono font-semibold uppercase text-[var(--color-muted-fg)]">{t('salesDashboard.openOpportunities')}</span>
            <Target size={16} className="text-[var(--color-accent)]" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--color-fg)]">
            <AnimatedCounter value={metrics?.activeOpportunities ?? 0} />
          </h2>
        </motion.div>

        <motion.div variants={itemVariants} className="az-card h-28 p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-mono font-semibold uppercase text-[var(--color-muted-fg)]">{t('salesDashboard.opportunityValue')}</span>
            <Clock size={16} className="text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--color-fg)]">
            <AnimatedCounter value={metrics?.pipelineValue ?? 0} formatter={(v) => formatVND(v)} />
          </h2>
        </motion.div>

        <motion.div variants={itemVariants} className="az-card h-28 p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-mono font-semibold uppercase text-[var(--color-muted-fg)]">{t('salesDashboard.forecast30d')}</span>
            <Target size={16} className="text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--color-fg)]">
            <AnimatedCounter value={metrics?.revenueForecast30Days ?? 0} formatter={(v) => formatVND(v)} />
          </h2>
        </motion.div>
      </div>

      {/* Asymmetric Bento Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline funnel sparklines */}
        <motion.div variants={itemVariants} className="lg:col-span-2 az-card p-6">
          <h3 className="text-sm font-bold text-[var(--color-fg)] mb-6">{t('salesDashboard.myPipeline')}</h3>
          <div className="space-y-4">
            {activeStages.map((stg, idx) => (
              <div key={idx} className="flex items-center justify-between border-b border-[var(--color-border)] pb-3 last:border-0 last:pb-0">
                <div className="space-y-1">
                  <p className="text-sm font-bold text-[var(--color-fg)]">{stg.stage}</p>
                  <p className="text-xs text-[var(--color-muted-fg)]">{t('salesDashboard.opportunitiesCount', {count: stg.count})}</p>
                </div>
                <div className="flex items-center gap-6">
                  <span className="text-sm font-mono font-semibold text-[var(--color-fg)]">{formatVND(stg.value)}</span>
                  <div className="w-16 h-8">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[stg]}>
                        <defs>
                          <linearGradient id={`sparkGrad-${idx}`} x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="var(--color-accent)" />
                            <stop offset="100%" stopColor="#87a7f5" />
                          </linearGradient>
                        </defs>
                        <Bar dataKey="value" fill={`url(#sparkGrad-${idx})`} radius={[4, 4, 4, 4]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Expiring quotations */}
        <motion.div variants={itemVariants} className="az-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[var(--color-fg)]">{t('salesDashboard.quotationsExpiring')}</h3>
            <AlertCircle size={16} className="text-amber-500 animate-pulse" />
          </div>
          {quotes.length === 0 ? (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('salesDashboard.noQuotationsExpiring')} />
          ) : (
            <div className="space-y-3">
              {quotes.map((q, idx) => (
                <div key={idx} className="bg-[var(--color-bg)]/80 border border-[var(--color-border)] rounded-lg p-3 flex flex-col justify-between hover:border-amber-500/40 transition-colors duration-200">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-mono font-bold text-[var(--color-accent)]">{q.code}</span>
                    <span className="text-[10px] text-rose-400 font-medium bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">{t('salesDashboard.due')}: {formatDate(q.validUntil)}</span>
                  </div>
                  <p className="text-xs font-semibold text-[var(--color-fg)] mt-1 truncate">{q.projectName}</p>
                  <p className="text-xs font-mono text-emerald-400 font-semibold mt-1">{formatVND(q.grandTotal)}</p>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leads today list */}
        <motion.div variants={itemVariants} className="az-card p-6">
          <h3 className="text-sm font-bold text-[var(--color-fg)] mb-6">{t('salesDashboard.newLeads')}</h3>
          {leads.length === 0 ? (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('salesDashboard.noNewLeads')} />
          ) : (
            <div className="space-y-3">
              {leads.map((l, idx) => (
                <div key={idx} className="flex justify-between items-center bg-[var(--color-bg)]/80 border border-[var(--color-border)] p-3 rounded-lg hover:border-[var(--color-accent)]/30 transition-all duration-200">
                  <div>
                    <h4 className="text-xs font-bold text-[var(--color-fg)]">{l.name}</h4>
                    <p className="text-[10px] text-[var(--color-muted-fg)] mt-0.5">{l.company || t('salesDashboard.individual')}</p>
                  </div>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono font-semibold border border-emerald-500/20">
                    {l.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Activity feed */}
        <motion.div variants={itemVariants} className="az-card p-6">
          <h3 className="text-sm font-bold text-[var(--color-fg)] mb-6">{t('salesDashboard.recentActivity')}</h3>
          <Timeline
            className="mt-2 text-xs"
            items={[
              { children: <span className="text-[var(--color-fg)]">Sent quotation to CyberCore LLC worth 350,000,000 VND</span>, color: 'green' },
              { children: <span className="text-[var(--color-fg)]">Updated Lead status: Trần Thị B {"->"} CONTACTED</span>, color: 'blue' },
              { children: <span className="text-[var(--color-fg)]">Scheduled consultation call with TechAsia at 14:00</span>, color: 'gray' },
              { children: <span className="text-[var(--color-fg)]">Created new opportunity for Web App Vintech project</span>, color: 'green' },
            ]}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}
