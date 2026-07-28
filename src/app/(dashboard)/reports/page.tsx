'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, Skeleton } from 'antd';
import {
  BarChart3,
  TrendingUp,
  CreditCard,
  Target,
  ArrowRight,
  LineChart,
  PieChart
} from 'lucide-react';
import { useReportSummary } from '@/hooks/api/useReport';
import { formatVND } from '@/lib/utils';

export default function ReportsOverview() {
  const { t } = useTranslation();
  const { data, isLoading } = useReportSummary();

  const summary = data?.data;

  // Stagger container
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] as const } }
  };

  const reportLinks = [
    {
      title: t('reports.pipelineTitle'),
      desc: t('reports.pipelineDesc'),
      path: '/reports/pipeline',
      icon: PieChart,
      color: 'bg-indigo-500/10 text-indigo-500',
    },
    {
      title: t('reports.forecastTitle'),
      desc: t('reports.forecastDesc'),
      path: '/reports/sales-forecast',
      icon: LineChart,
      color: 'bg-emerald-500/10 text-emerald-500',
    },
    {
      title: t('reports.cashFlowTitle'),
      desc: t('reports.cashFlowDesc'),
      path: '/reports/payment',
      icon: CreditCard,
      color: 'bg-amber-500/10 text-amber-500',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Editorial Title */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--color-fg)]">{t('reports.title')}</h1>
        <p className="text-sm text-[var(--color-muted-fg)]">{t('reports.subtitle')}</p>
      </div>

      {/* Bento Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          Array(4).fill(null).map((_, idx) => (
            <div key={idx} className="bg-[var(--color-bg-tint)] border border-[var(--color-border)] rounded-lg p-6 h-28 flex flex-col justify-between">
              <Skeleton.Input active size="small" style={{ width: 120 }} />
              <Skeleton.Input active size="default" style={{ width: 80 }} />
            </div>
          ))
        ) : (
          <>
            {/* Total Pipeline */}
            <div className="bg-[var(--color-bg-tint)] border border-[var(--color-border)] rounded-lg p-6 hover-action flex flex-col justify-between h-28">
              <div className="flex justify-between items-start">
                <span className="text-xs font-mono uppercase tracking-wider text-[var(--color-muted-fg)]">{t('reports.totalPipeline')}</span>
                <Target size={16} className="text-indigo-500" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight mt-2 text-[var(--color-fg)]">
                {formatVND(summary?.totalPipelineValue)}
              </h2>
            </div>

            {/* Won this month */}
            <div className="bg-[var(--color-bg-tint)] border border-[var(--color-border)] rounded-lg p-6 hover-action flex flex-col justify-between h-28">
              <div className="flex justify-between items-start">
                <span className="text-xs font-mono uppercase tracking-wider text-[var(--color-muted-fg)]">{t('reports.monthlySales')}</span>
                <TrendingUp size={16} className="text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight mt-2 text-[var(--color-fg)]">
                {formatVND(summary?.wonThisMonth)}
              </h2>
            </div>

            {/* Overdue Payments */}
            <div className="bg-[var(--color-bg-tint)] border border-[var(--color-border)] rounded-lg p-6 hover-action flex flex-col justify-between h-28">
              <div className="flex justify-between items-start">
                <span className="text-xs font-mono uppercase tracking-wider text-[var(--color-muted-fg)]">{t('reports.overdueDebt')}</span>
                <CreditCard size={16} className="text-rose-500" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight mt-2 text-[var(--color-fg)]">
                {formatVND(summary?.overdueAmount)}
              </h2>
            </div>

            {/* Forecast */}
            <div className="bg-[var(--color-bg-tint)] border border-[var(--color-border)] rounded-lg p-6 hover-action flex flex-col justify-between h-28">
              <div className="flex justify-between items-start">
                <span className="text-xs font-mono uppercase tracking-wider text-[var(--color-muted-fg)]">{t('reports.thirtyDayForecast')}</span>
                <BarChart3 size={16} className="text-amber-500" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight mt-2 text-[var(--color-fg)]">
                {formatVND(summary?.forecast30Days)}
              </h2>
            </div>
          </>
        )}
      </div>

      {/* Navigation Cards with Staggered Entrance */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
      >
        {reportLinks.map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.div key={idx} variants={itemVariants}>
              <Link href={item.path}>
                <Card className="h-full bg-[var(--color-bg-tint)] border border-[var(--color-border)] hover:border-[var(--color-accent)] rounded-lg cursor-pointer hover-action group transition-all duration-300">
                  <div className="flex flex-col h-full justify-between space-y-6">
                    <div className="space-y-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.color}`}>
                        <Icon size={24} />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-bold text-[var(--color-fg)]">{item.title}</h3>
                        <p className="text-xs text-[var(--color-muted-fg)] leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[var(--color-accent)] font-semibold group-hover:gap-2.5 transition-all">
                      <span>{t('reports.viewDetails')}</span>
                      <ArrowRight size={14} />
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
