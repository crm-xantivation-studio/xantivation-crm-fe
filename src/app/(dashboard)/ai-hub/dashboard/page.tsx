'use client';

import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, 
  Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { 
  Bot, Shield, Terminal, Settings, RefreshCw, Cpu, Database, 
  AlertCircle, Activity, Play, ChevronDown, ChevronRight, CheckCircle2, Clock
} from 'lucide-react';
import { Button, message, Tag } from 'antd';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

// Mock charts data
const requestsData = [
  { day: '07/05', requests: 120 },
  { day: '07/06', requests: 180 },
  { day: '07/07', requests: 150 },
  { day: '07/08', requests: 210 },
  { day: '07/09', requests: 280 },
  { day: '07/10', requests: 310 },
  { day: '07/11', requests: 420 },
];

const tokensData = [
  { day: '07/05', input: 300000, output: 120000 },
  { day: '07/06', input: 450000, output: 180000 },
  { day: '07/07', input: 410000, output: 160000 },
  { day: '07/08', input: 580000, output: 220000 },
  { day: '07/09', input: 710000, output: 290000 },
  { day: '07/10', input: 820000, output: 350000 },
  { day: '07/11', input: 980000, output: 420000 },
];

const toolUsageData = [
  { name: 'queryDatabase', value: 45 },
  { name: 'generateContract', value: 25 },
  { name: 'riskAnalysis', value: 15 },
  { name: 'sendTelegram', value: 15 },
];

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444'];

export default function AiHubDashboard() {
  const { t } = useTranslation();
  const [activeAccordion, setActiveAccordion] = useState<string | null>('prompt');
  const [systemPrompt, setSystemPrompt] = useState('You are a premium CRM assistant for Xantivation Studio. Answer concisely, format numeric variables to VND currency.');
  const [testLogLoading, setTestLogLoading] = useState(false);

  const handleTestBullMqJob = () => {
    message.loading(t('aiHub.triggeringBullMq'));
    setTimeout(() => {
      message.success(t('aiHub.bullMqResult'));
    }, 1200);
  };

  const handleToggleAccordion = (key: string) => {
    setActiveAccordion(activeAccordion === key ? null : key);
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--color-fg)]">{t('aiHub.dashboardTitle')}</h1>
          <p className="text-sm text-[var(--color-muted-fg)]">{t('aiHub.dashboardSubtitle')}</p>
        </div>

      </div>

      {/* 6 Metrics cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {[
          { label: t('aiHub.metricTotalRequests'), val: '1,830', change: t('aiHub.changeRequests') },
          { label: t('aiHub.metricSuccessRate'), val: '98.5%', change: t('aiHub.changeSuccessRate') },
          { label: t('aiHub.metricTotalTokens'), val: '5.1M', change: t('aiHub.changeTokens') },
          { label: t('aiHub.metricEstCost'), val: '$10.20', change: t('aiHub.changeCost') },
          { label: t('aiHub.metricAvgLatency'), val: '280ms', change: t('aiHub.changeLatency') },
          { label: t('aiHub.metricQueueLoad'), val: '0 pending', change: t('aiHub.changeQueue') },
        ].map((item, idx) => (
          <div key={idx} className="p-4 bg-[var(--color-bg-tint)] border border-[var(--color-border)] rounded-2xl space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-muted-fg)]">{item.label}</span>
            <h3 className="text-xl font-bold text-[var(--color-fg)]">{item.val}</h3>
            <p className="text-[10px] text-[var(--color-muted-fg)]">{item.change}</p>
          </div>
        ))}
      </div>

      {/* Visual Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Requests Chart */}
        <div className="bg-[var(--color-bg-tint)] border border-[var(--color-border)] rounded-2xl p-4 space-y-3">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted-fg)] block">{t('aiHub.dailyRequests')}</span>
          <div className="h-64 text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={requestsData}>
                <defs>
                  <linearGradient id="colorReq" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="day" stroke="var(--color-muted-fg)" />
                <YAxis stroke="var(--color-muted-fg)" />
                <ChartTooltip />
                <Area type="monotone" dataKey="requests" stroke="#4F46E5" fillOpacity={1} fill="url(#colorReq)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tokens Chart */}
        <div className="bg-[var(--color-bg-tint)] border border-[var(--color-border)] rounded-2xl p-4 space-y-3">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted-fg)] block">{t('aiHub.tokenAllocation')}</span>
          <div className="h-64 text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tokensData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="day" stroke="var(--color-muted-fg)" />
                <YAxis stroke="var(--color-muted-fg)" />
                <ChartTooltip />
                <Legend />
                <Bar dataKey="input" fill="#4F46E5" radius={[4, 4, 0, 0]} name={t('aiHub.inputTokens')} />
                <Bar dataKey="output" fill="#10B981" radius={[4, 4, 0, 0]} name={t('aiHub.outputTokens')} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tool Distribution Chart */}
        <div className="bg-[var(--color-bg-tint)] border border-[var(--color-border)] rounded-2xl p-4 space-y-3">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted-fg)] block">{t('aiHub.toolTriggerFrequency')}</span>
          <div className="h-64 text-xs flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={toolUsageData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {toolUsageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip />
                <Legend formatter={(value) => <span className="text-[10px] text-[var(--color-muted-fg)]">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* BullMQ Jobs & Activity Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: BullMQ Jobs (2 cols) */}
        <div className="lg:col-span-2 bg-[var(--color-bg-tint)] border border-[var(--color-border)] rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-[var(--color-border)] pb-3">
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-fg)]">{t('aiHub.bullMqWorkers')}</h3>
              <p className="text-xs text-[var(--color-muted-fg)]">{t('aiHub.bullMqDescription')}</p>
            </div>
            <Button size="small" icon={<RefreshCw size={12} />} onClick={handleTestBullMqJob}>{t('aiHub.checkWorker')}</Button>
          </div>

          <div className="space-y-3">
            {[
              { id: 'job_lead_bant_qualification', progress: 100, status: t('aiHub.completed'), detail: 'Processed budget check for LEAD-2026-00001' },
              { id: 'job_docusign_webhook_receiver', progress: 100, status: t('aiHub.completed'), detail: 'Registered signed envelope status for CON-2026-00001' },
              { id: 'job_sales_forecast_weighting_calculation', progress: 100, status: t('aiHub.completed'), detail: 'Rendered weighted forecast matrix formulas' },
              { id: 'job_cron_overdue_payments_daily', progress: 0, status: t('aiHub.activeIdle'), detail: 'Trigger cron schedules check every 24 hours' }
            ].map((job, idx) => (
              <div key={idx} className="p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl flex justify-between items-center text-xs">
                <div>
                  <span className="font-mono font-semibold text-[var(--color-fg)] block">{job.id}</span>
                  <span className="text-[10px] text-[var(--color-muted-fg)] block mt-0.5">{job.detail}</span>
                </div>
                <Tag color={job.status === t('aiHub.completed') ? 'success' : 'processing'}>{job.status}</Tag>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Activity Timeline (1 col) */}
        <div className="bg-[var(--color-bg-tint)] border border-[var(--color-border)] rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-semibold text-[var(--color-fg)] border-b border-[var(--color-border)] pb-3">
            {t('aiHub.activityTimeline')}
          </h3>

          <div className="relative border-l border-[var(--color-border)] ml-3 pl-4 space-y-5 text-xs">
            {[
              { text: 'RAG Document embedded: Sales_Brief_2.pdf', time: '10:30', tag: t('aiHub.tagVectorRag') },
              { text: 'Tool queryDatabase executed: matches CON-001', time: '10:28', tag: t('aiHub.tagToolExecution') },
              { text: 'DocuSign Webhook processed: status completed', time: '10:15', tag: t('aiHub.tagEsignature') },
              { text: 'Cron overdue check triggered manually', time: '09:00', tag: t('aiHub.tagBullMq') }
            ].map((event, idx) => (
              <div key={idx} className="relative">
                <span className="absolute -left-[22px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-500 border-2 border-white" />
                <p className="font-semibold text-[var(--color-fg)]">{event.text}</p>
                <div className="flex gap-2 items-center text-[9px] text-[var(--color-muted-fg)] mt-1 font-mono">
                  <span>{event.time}</span>
                  <span>•</span>
                  <span>{event.tag}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Admin Debug Panel Accordion */}
      <div className="bg-[var(--color-bg-tint)] border border-[var(--color-border)] rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-[var(--color-fg)] flex items-center gap-1.5">
          <Shield size={16} className="text-red-500" />
          <span>{t('aiHub.adminDebugSettings')}</span>
        </h3>

        <div className="border border-[var(--color-border)] rounded-xl overflow-hidden divide-y divide-[var(--color-border)]">
          {/* Section 1: Prompt Editor */}
          <div>
            <button
              onClick={() => handleToggleAccordion('prompt')}
              className="w-full px-4 py-3 bg-[var(--color-surface)] flex justify-between items-center text-xs font-mono font-bold cursor-pointer text-[var(--color-fg)]"
            >
              <span>[01] {t('aiHub.sectionPrompt')}</span>
              {activeAccordion === 'prompt' ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            {activeAccordion === 'prompt' && (
              <div className="p-4 bg-[var(--color-bg)]/20 space-y-3">
                <textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  className="w-full min-h-[100px] p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-xs font-mono text-[var(--color-fg)] outline-none focus:border-[var(--color-accent)]"
                />
                <div className="flex justify-end gap-2">
                  <Button size="small" onClick={() => setSystemPrompt('You are a premium CRM assistant for Xantivation Studio. Answer concisely.')}>{t('aiHub.reset')}</Button>
                  <Button size="small" type="primary" onClick={() => message.success(t('aiHub.promptUpdated'))}>{t('aiHub.savePrompt')}</Button>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: retrieved RAG */}
          <div>
            <button
              onClick={() => handleToggleAccordion('rag')}
              className="w-full px-4 py-3 bg-[var(--color-surface)] flex justify-between items-center text-xs font-mono font-bold cursor-pointer text-[var(--color-fg)]"
            >
              <span>[02] {t('aiHub.sectionRag')}</span>
              {activeAccordion === 'rag' ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            {activeAccordion === 'rag' && (
              <div className="p-4 bg-[var(--color-bg)]/20 text-xs font-mono text-[var(--color-muted-fg)] space-y-2">
                <p className="text-[10px] text-green-500">// Last matched vectors query text: "legal liability limitation"</p>
                <div className="p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg space-y-2">
                  <p><strong>chunk_1 (Score: 0.89)</strong>: "Section 7.1: Maximum compensation liability of Studio..."</p>
                  <p><strong>chunk_2 (Score: 0.74)</strong>: "Section 7.2: Compensation agreement does not apply to..."</p>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Tool IO */}
          <div>
            <button
              onClick={() => handleToggleAccordion('tool-io')}
              className="w-full px-4 py-3 bg-[var(--color-surface)] flex justify-between items-center text-xs font-mono font-bold cursor-pointer text-[var(--color-fg)]"
            >
              <span>[03] {t('aiHub.sectionToolIo')}</span>
              {activeAccordion === 'tool-io' ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            {activeAccordion === 'tool-io' && (
              <div className="p-4 bg-[var(--color-bg)]/20 text-xs font-mono text-[var(--color-muted-fg)]">
                <pre className="p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg overflow-x-auto">
{`{
  "tool": "forecastRevenue",
  "input": {
    "timelineDays": 30,
    "confidenceScoreThreshold": 0.5
  },
  "output": {
    "totalWeightedValue": 397000000,
    "success": true
  }
}`}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
