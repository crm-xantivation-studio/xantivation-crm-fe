'use client';

import React from 'react';
import { Modal, Button, Tag, Spin, Tooltip } from 'antd';
import { CheckCircle2, XCircle, RefreshCw, Activity, Server, Network, Bot, Cpu, ArrowRight } from 'lucide-react';
import { useDiagnostics } from '@/hooks/api/useMessagingConfig';

interface DiagnosticsPanelProps {
  visible: boolean;
  onClose: () => void;
}

export default function DiagnosticsPanel({ visible, onClose }: DiagnosticsPanelProps) {
  const { data: report, isLoading, refetch, isFetching } = useDiagnostics();

  React.useEffect(() => {
    if (visible) {
      refetch();
    }
  }, [visible]);

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 font-bold text-sm text-[var(--color-fg)]">
          <Activity className="text-emerald-500" size={18} />
          <span>Báo Cáo Sức Khỏe Toàn Tuyến Tin Nhắn (Pipeline Diagnostics)</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      width={750}
      footer={[
        <Button
          key="refresh"
          onClick={() => refetch()}
          loading={isFetching}
          icon={<RefreshCw size={14} />}
          className="rounded-xl"
        >
          Kiểm Tra Lại
        </Button>,
        <Button key="close" type="primary" onClick={onClose} className="rounded-xl">
          Đóng
        </Button>,
      ]}
      className="rounded-[5px]"
    >
      {isLoading || isFetching ? (
        <div className="p-12 text-center">
          <Spin size="large" />
          <p className="text-xs text-[var(--color-muted-fg)] mt-3 font-mono">Đang kiểm tra kết nối toàn tuyến...</p>
        </div>
      ) : !report ? (
        <div className="p-6 text-center text-xs text-[var(--color-muted-fg)]">Không có dữ liệu báo cáo.</div>
      ) : (
        <div className="space-y-4 my-3 text-xs">
          {/* Pipeline Visual Flow */}
          <div className="bg-[var(--color-bg-tint)] border border-[var(--color-border)] rounded-[5px] p-4 flex items-center justify-between gap-2 overflow-x-auto font-mono text-[11px]">
            {/* Step 1: Tunnel */}
            <div className="flex flex-col items-center text-center p-2">
              <Network size={20} className={report.tunnel?.reachable ? 'text-emerald-500' : 'text-rose-500'} />
              <span className="font-bold mt-1">Tunnel</span>
              <Tag color={report.tunnel?.reachable ? 'success' : 'error'} className="mt-1">
                {report.tunnel?.reachable ? `${report.tunnel.latencyMs}ms` : 'FAIL'}
              </Tag>
            </div>

            <ArrowRight size={16} className="text-[var(--color-muted-fg)]" />

            {/* Step 2: Chatwoot */}
            <div className="flex flex-col items-center text-center p-2">
              <Server size={20} className={report.chatwoot?.reachable ? 'text-emerald-500' : 'text-rose-500'} />
              <span className="font-bold mt-1">Chatwoot</span>
              <Tag color={report.chatwoot?.reachable ? 'success' : 'error'} className="mt-1">
                {report.chatwoot?.reachable ? `${report.chatwoot.latencyMs}ms` : 'FAIL'}
              </Tag>
            </div>

            <ArrowRight size={16} className="text-[var(--color-muted-fg)]" />

            {/* Step 3: Telegram Bots */}
            <div className="flex flex-col items-center text-center p-2">
              <Bot size={20} className="text-cyan-500" />
              <span className="font-bold mt-1">Bots ({report.bots?.length || 0})</span>
              <Tag color="cyan" className="mt-1">
                OK
              </Tag>
            </div>

            <ArrowRight size={16} className="text-[var(--color-muted-fg)]" />

            {/* Step 4: Ollama */}
            <div className="flex flex-col items-center text-center p-2">
              <Cpu size={20} className={report.ollama?.reachable ? 'text-emerald-500' : 'text-rose-500'} />
              <span className="font-bold mt-1">Ollama AI</span>
              <Tag color={report.ollama?.reachable ? 'success' : 'error'} className="mt-1">
                {report.ollama?.reachable ? `${report.ollama.models?.length || 0} Models` : 'OFF'}
              </Tag>
            </div>
          </div>

          {/* Details Sections */}
          <div className="space-y-3">
            {/* 1. Public Tunnel */}
            <div className="p-3 border border-[var(--color-border)] rounded-xl flex justify-between items-center bg-[var(--color-surface)]">
              <div>
                <span className="font-bold text-[var(--color-fg)]">1. Public Tunnel URL:</span>
                <p className="font-mono text-[11px] text-[var(--color-muted-fg)]">{report.tunnel?.url || 'Chưa cấu hình'}</p>
                <p className="text-[10px] opacity-80">{report.tunnel?.message}</p>
              </div>
              {report.tunnel?.reachable ? <CheckCircle2 className="text-emerald-500" size={20} /> : <XCircle className="text-rose-500" size={20} />}
            </div>

            {/* 2. Chatwoot Engine */}
            <div className="p-3 border border-[var(--color-border)] rounded-xl flex justify-between items-center bg-[var(--color-surface)]">
              <div>
                <span className="font-bold text-[var(--color-fg)]">2. Chatwoot Server Connection:</span>
                <p className="font-mono text-[11px] text-[var(--color-muted-fg)]">{report.chatwoot?.baseUrl} (Accounts Inbox: {report.chatwoot?.inboxCount})</p>
                <p className="text-[10px] opacity-80">{report.chatwoot?.message}</p>
              </div>
              {report.chatwoot?.reachable ? <CheckCircle2 className="text-emerald-500" size={20} /> : <XCircle className="text-rose-500" size={20} />}
            </div>

            {/* 3. Telegram Webhooks per Bot */}
            <div className="p-3 border border-[var(--color-border)] rounded-xl space-y-2 bg-[var(--color-surface)]">
              <span className="font-bold text-[var(--color-fg)]">3. Trạng Thái Telegram Webhooks ({report.bots?.length || 0} Bot):</span>
              <div className="space-y-1.5">
                {report.bots?.map((bot: any, idx: number) => (
                  <div key={idx} className="p-2 rounded-lg bg-[var(--color-bg-tint)] border border-[var(--color-border)]/50 flex justify-between items-center font-mono text-[11px]">
                    <div>
                      <span className="font-bold text-[var(--color-fg)]">#{bot.inboxId} - {bot.channelName}</span>
                      <p className="text-[10px] text-[var(--color-muted-fg)] break-all">{bot.webhookUrl || 'Chưa có Webhook URL'}</p>
                      {bot.webhookStatus?.lastErrorMessage && (
                        <p className="text-[10px] text-rose-400">Lỗi: {bot.webhookStatus.lastErrorMessage}</p>
                      )}
                    </div>
                    <div>
                      {bot.webhookStatus?.ok ? (
                        <Tag color="success">OK (Pending: {bot.webhookStatus.pendingUpdateCount})</Tag>
                      ) : (
                        <Tag color="error">Webhook Lỗi</Tag>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Ollama AI Engine */}
            <div className="p-3 border border-[var(--color-border)] rounded-xl flex justify-between items-center bg-[var(--color-surface)]">
              <div>
                <span className="font-bold text-[var(--color-fg)]">4. Ollama LLM Engine:</span>
                <p className="font-mono text-[11px] text-[var(--color-muted-fg)]">
                  Models: {report.ollama?.models?.join(', ') || 'Không tìm thấy model'}
                </p>
              </div>
              {report.ollama?.reachable ? <CheckCircle2 className="text-emerald-500" size={20} /> : <XCircle className="text-rose-500" size={20} />}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
