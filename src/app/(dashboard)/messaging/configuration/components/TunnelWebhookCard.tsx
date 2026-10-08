'use client';

import React, { useState, useEffect } from 'react';
import { Button, Input, message, Tag, Modal, Spin } from 'antd';
import { Network, RefreshCw, Send, Activity, CheckCircle2, XCircle, ShieldAlert } from 'lucide-react';
import { useSystemSettings, useTunnelTest, useRegisterAllWebhooks } from '@/hooks/api/useMessagingConfig';

interface TunnelWebhookCardProps {
  onOpenDiagnostics?: () => void;
}

export default function TunnelWebhookCard({ onOpenDiagnostics }: TunnelWebhookCardProps) {
  const { settings, saveSettings, isSaving } = useSystemSettings();
  const tunnelTestMutation = useTunnelTest();
  const registerAllMutation = useRegisterAllWebhooks();

  const [tunnelUrl, setTunnelUrl] = useState('');
  const [testResult, setTestResult] = useState<{ reachable: boolean; latencyMs: number; message: string; httpStatus: number } | null>(null);
  const [registerResults, setRegisterResults] = useState<any[] | null>(null);

  useEffect(() => {
    if (settings?.CHATWOOT_TUNNEL_URL?.value) {
      setTunnelUrl(settings.CHATWOOT_TUNNEL_URL.value);
    }
  }, [settings]);

  const handleSaveTunnelUrl = async () => {
    try {
      await saveSettings([
        {
          key: 'CHATWOOT_TUNNEL_URL',
          value: tunnelUrl.trim(),
          description: 'Public Tunnel URL dùng chung cho Telegram Bots',
        },
      ]);
      message.success('Đã lưu Public Tunnel URL dùng chung thành công!');
    } catch {
      message.error('Không thể lưu Tunnel URL');
    }
  };

  const handleTestTunnel = async () => {
    if (!tunnelUrl.trim()) {
      message.warning('Hãy nhập Tunnel URL trước khi kiểm tra');
      return;
    }
    setTestResult(null);
    try {
      const res = await tunnelTestMutation.mutateAsync(tunnelUrl.trim());
      setTestResult(res);
      if (res?.reachable) {
        message.success(res.message);
      } else {
        message.error(res?.message || 'Không thể kết nối tới Tunnel');
      }
    } catch (e: any) {
      setTestResult({ reachable: false, latencyMs: 0, httpStatus: 0, message: e.message || 'Lỗi kiểm tra Tunnel' });
      message.error('Lỗi kết nối tới Tunnel URL');
    }
  };

  const handleRegisterAll = async () => {
    try {
      const results = await registerAllMutation.mutateAsync();
      setRegisterResults(results);
      message.success('Đã gửi yêu cầu đăng ký webhook cho tất cả các Bot!');
    } catch (e: any) {
      message.error('Lỗi khi đăng ký webhook cho các Bot');
    }
  };

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[5px] p-5 space-y-4 shadow-sm">
      <div className="flex justify-between items-center pb-3 border-b border-[var(--color-border)]/50">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-500">
            <Network size={20} />
          </div>
          <div>
            <h3 className="font-bold text-sm text-[var(--color-fg)] flex items-center gap-2">
              Public Tunnel URL & Webhook Gateway
              <Tag color="cyan" className="rounded-full px-2 py-0.5 text-[10px] font-mono">
                Dùng Chung Mọi Bot
              </Tag>
            </h3>
            <p className="text-[11px] text-[var(--color-muted-fg)]">
              Định tuyến webhook từ Telegram qua Tunnel công khai (Localtunnel / Pinggy) về Chatwoot Server.
            </p>
          </div>
        </div>

        {onOpenDiagnostics && (
          <Button
            type="default"
            onClick={onOpenDiagnostics}
            icon={<Activity size={14} className="text-emerald-500" />}
            className="rounded-xl text-xs flex items-center gap-1.5 cursor-pointer hover:border-emerald-500"
          >
            Chạy Diagnostics Sức Khỏe
          </Button>
        )}
      </div>

      {/* Input & Action buttons */}
      <div className="space-y-3">
        <div className="flex gap-3 items-center">
          <div className="flex-1">
            <Input
              value={tunnelUrl}
              onChange={(e) => setTunnelUrl(e.target.value)}
              placeholder="Ví dụ: https://plastic-penguin-73.loca.lt"
              className="h-10 rounded-xl text-xs font-mono bg-[var(--color-bg-tint)]"
            />
          </div>

          <Button
            onClick={handleSaveTunnelUrl}
            loading={isSaving}
            className="rounded-xl text-xs h-10 px-4 bg-[var(--color-accent)] text-white hover:opacity-90 cursor-pointer"
          >
            Lưu Tunnel URL
          </Button>

          <Button
            onClick={handleTestTunnel}
            loading={tunnelTestMutation.isPending}
            icon={<RefreshCw size={14} />}
            className="rounded-xl text-xs h-10 cursor-pointer"
          >
            Test Tunnel
          </Button>

          <Button
            type="primary"
            onClick={handleRegisterAll}
            loading={registerAllMutation.isPending}
            icon={<Send size={14} />}
            className="rounded-xl text-xs h-10 bg-indigo-600 hover:bg-indigo-700 cursor-pointer"
          >
            Đăng Ký Tất Cả Webhook
          </Button>
        </div>

        {/* Test Result Indicator */}
        {testResult && (
          <div
            className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-mono ${
              testResult.reachable
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-500'
            }`}
          >
            {testResult.reachable ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
            <span>{testResult.message}</span>
          </div>
        )}
      </div>

      {/* Modal Results for Register All */}
      <Modal
        title="Kết Quả Đăng Ký Webhook Telegram Tất Cả Bot"
        open={registerResults !== null}
        onOk={() => setRegisterResults(null)}
        onCancel={() => setRegisterResults(null)}
        footer={[
          <Button key="close" type="primary" onClick={() => setRegisterResults(null)} className="rounded-xl">
            Đóng
          </Button>,
        ]}
        className="rounded-[5px]"
      >
        <div className="space-y-3 mt-4">
          {registerResults?.map((r, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs ${
                r.ok ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-rose-500/10 border-rose-500/30 text-rose-500'
              }`}
            >
              {r.ok ? <CheckCircle2 size={16} className="mt-0.5" /> : <ShieldAlert size={16} className="mt-0.5" />}
              <div className="flex-1 font-mono">
                <p className="font-bold">{r.channelId ? `Kênh ID: #${r.channelId}` : 'Chưa liên kết Telegram Bot Token'}</p>
                <p className="text-[11px] break-all">{r.webhookUrl || r.message}</p>
                {!r.channelId && (
                  <p className="text-[11px] font-sans font-medium text-rose-600 dark:text-rose-400 mt-1">
                    Hãy bấm nút Sửa ở bảng bên dưới để nhập Telegram Bot Token cho từng kênh trước khi đăng ký Webhook.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
