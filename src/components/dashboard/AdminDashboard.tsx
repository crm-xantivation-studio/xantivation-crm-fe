'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Table, Switch, Tag, message } from 'antd';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import {
  useDashboardSystemOverview,
  useDashboardRecentAuditLogs,
  useDashboardIntegrationStatus
} from '@/hooks/api/useDashboard';
import {
  Users,
  Shield,
  Bot,
  Activity,
  Layers,
} from 'lucide-react';
import { motion } from 'framer-motion';
import AnimatedCounter from '@/components/AnimatedCounter';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { data: overviewData, isLoading: overviewLoading } = useDashboardSystemOverview();
  const { data: logsData, isLoading: logsLoading } = useDashboardRecentAuditLogs();
  const { data: integrationsData, isLoading: integrationsLoading } = useDashboardIntegrationStatus();

  const overview = overviewData?.data;
  const logs = logsData?.data || [];
  const integrations = integrationsData?.data || [];

  // User activity mockup data
  const userActivityData = [
    { name: t('adminDashboard.mon'), logins: 18, actions: 82 },
    { name: t('adminDashboard.tue'), logins: 24, actions: 110 },
    { name: t('adminDashboard.wed'), logins: 22, actions: 95 },
    { name: t('adminDashboard.thu'), logins: 29, actions: 132 },
    { name: t('adminDashboard.fri'), logins: 27, actions: 120 },
    { name: t('adminDashboard.sat'), logins: 12, actions: 40 },
    { name: t('adminDashboard.sun'), logins: 5, actions: 12 },
  ];

  const logColumns = [
    {
      title: t('adminDashboard.time'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (val: string) => <span className="font-mono text-[10px] text-[var(--color-muted-fg)]">{new Date(val).toLocaleString()}</span>,
    },
    {
      title: 'Action',
      dataIndex: 'type',
      key: 'type',
      width: 110,
      render: (type: string) => {
        const colors: Record<string, string> = {
          LOGIN: 'blue',
          LEAD_CREATE: 'cyan',
          CONTRACT_SIGN: 'green'
        };
        return <Tag color={colors[type] || 'default'} style={{ fontSize: '9px', fontWeight: 'bold' }}>{type}</Tag>;
      }
    },
    {
      title: t('adminDashboard.description'),
      dataIndex: 'description',
      key: 'description',
      render: (val: string) => <span className="text-xs text-[var(--color-fg)] font-medium">{val}</span>,
    },
  ];

  const handleToggleGov = (checked: boolean, field: string) => {
    message.success(t('adminDashboard.aiGovernanceUpdated', { field, status: checked ? 'ON' : 'OFF' }));
  };

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.06 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] as const } }
  };

  if (overviewLoading || logsLoading || integrationsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array(4).fill(null).map((_, idx) => (
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
      {/* 4 Bento Overview Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div variants={itemVariants} className="az-card p-6 flex flex-col justify-between h-28">
          <div className="flex justify-between items-start">
            <span className="text-xs font-sans font-medium text-[var(--color-muted-fg)]">{t('adminDashboard.leadSystem')}</span>
            <Users size={16} className="text-indigo-500" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--color-fg)]">
            <AnimatedCounter value={overview?.leads ?? 0} />
          </h2>
        </motion.div>

        <motion.div variants={itemVariants} className="az-card p-6 flex flex-col justify-between h-28">
          <div className="flex justify-between items-start">
            <span className="text-xs font-sans font-medium text-[var(--color-muted-fg)]">{t('adminDashboard.customer')}</span>
            <Shield size={16} className="text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--color-fg)]">
            <AnimatedCounter value={overview?.customers ?? 0} />
          </h2>
        </motion.div>

        <motion.div variants={itemVariants} className="az-card p-6 flex flex-col justify-between h-28">
          <div className="flex justify-between items-start">
            <span className="text-xs font-sans font-medium text-[var(--color-muted-fg)]">{t('adminDashboard.opportunity')}</span>
            <Layers size={16} className="text-amber-500" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--color-fg)]">
            <AnimatedCounter value={overview?.opportunities ?? 0} />
          </h2>
        </motion.div>

        <motion.div variants={itemVariants} className="az-card p-6 flex flex-col justify-between h-28">
          <div className="flex justify-between items-start">
            <span className="text-xs font-sans font-medium text-[var(--color-muted-fg)]">{t('adminDashboard.activeContracts')}</span>
            <Activity size={16} className="text-purple-500" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--color-fg)]">
            <AnimatedCounter value={overview?.contracts ?? 0} />
          </h2>
        </motion.div>
      </div>

      {/* Row 2: User Activity & AI Governance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Activity Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2 az-card p-6">
          <h3 className="text-sm font-semibold text-[var(--color-fg)] mb-6">{t('adminDashboard.weeklyActivity')}</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={userActivityData} margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
                <defs>
                  <linearGradient id="loginsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#818CF8" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#818CF8" stopOpacity={0.4} />
                  </linearGradient>
                  <linearGradient id="actionsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34D399" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#34D399" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="var(--color-muted-fg)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-fg)" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: 'var(--color-surface)', opacity: 0.15 }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="custom-recharts-tooltip space-y-1">
                          <p className="text-xs font-semibold text-[var(--color-fg)] mb-1">{payload[0].payload.name}</p>
                          {payload.map((p, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.fill === 'url(#loginsGrad)' ? '#818CF8' : '#34D399' }}></span>
                              <span className="text-[10px] text-[var(--color-muted-fg)]">{p.name}:</span>
                              <span className="text-[10px] font-mono text-[var(--color-fg)] font-semibold">{t('adminDashboard.actions', {count: p.value})}</span>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar name={t('adminDashboard.logins')} dataKey="logins" fill="url(#loginsGrad)" radius={[4, 4, 0, 0]} />
                <Bar name={t('adminDashboard.actionsLabel')} dataKey="actions" fill="url(#actionsGrad)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* AI Governance Toggles */}
        <motion.div variants={itemVariants} className="az-card p-6">
          <h3 className="text-sm font-semibold text-[var(--color-fg)] mb-6 flex items-center gap-1.5">
            <Bot size={16} /> AI Governance Controls
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-[var(--color-bg)] border border-[var(--color-border)] p-3 rounded-lg hover:border-[var(--color-accent)]/20 transition-all duration-200">
              <div>
                <p className="text-xs font-semibold text-[var(--color-fg)]">Lead BANT scoring</p>
                <p className="text-[10px] text-[var(--color-muted-fg)] mt-0.5">{t('adminDashboard.aiLeadScoring')}</p>
              </div>
              <Switch defaultChecked onChange={(chk) => handleToggleGov(chk, 'Lead BANT scoring')} />
            </div>
            <div className="flex justify-between items-center bg-[var(--color-bg)] border border-[var(--color-border)] p-3 rounded-lg hover:border-[var(--color-accent)]/20 transition-all duration-200">
              <div>
                <p className="text-xs font-semibold text-[var(--color-fg)]">Opp Coach assistant</p>
                <p className="text-[10px] text-[var(--color-muted-fg)] mt-0.5">{t('adminDashboard.aiDealAnalysis')}</p>
              </div>
              <Switch defaultChecked onChange={(chk) => handleToggleGov(chk, 'Opp Coach assistant')} />
            </div>
            <div className="flex justify-between items-center bg-[var(--color-bg)] border border-[var(--color-border)] p-3 rounded-lg hover:border-[var(--color-accent)]/20 transition-all duration-200">
              <div>
                <p className="text-xs font-semibold text-[var(--color-fg)]">Contract Risk Audit</p>
                <p className="text-[10px] text-[var(--color-muted-fg)] mt-0.5">{t('adminDashboard.aiContractRisk')}</p>
              </div>
              <Switch defaultChecked onChange={(chk) => handleToggleGov(chk, 'Contract Risk Audit')} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Row 3: Audit Logs & Integration Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Audit Logs */}
        <motion.div variants={itemVariants} className="lg:col-span-2 az-card p-6">
          <h3 className="text-sm font-semibold text-[var(--color-fg)] mb-6">{t('adminDashboard.auditLogs')}</h3>
          <Table
            dataSource={logs}
            columns={logColumns}
            rowKey="id"
            pagination={{ pageSize: 5 }}
            loading={logsLoading}
            size="small"
            className="border-none bg-transparent"
          />
        </motion.div>

        {/* Integration Connection status */}
        <motion.div variants={itemVariants} className="az-card p-6">
          <h3 className="text-sm font-semibold text-[var(--color-fg)] mb-6">{t('adminDashboard.serviceStatus')}</h3>
          <div className="space-y-3">
            {integrations.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center bg-[var(--color-bg)] border border-[var(--color-border)] p-3 rounded-lg hover:border-[var(--color-accent)]/20 transition-all duration-200">
                <span className="text-xs font-semibold text-[var(--color-fg)]">{item.name}</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 block shrink-0 animate-pulse"></span>
                  <span className="text-[9px] font-mono text-emerald-500 font-bold uppercase">{item.status}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
