'use client';

import React, { useState } from 'react';
import { Button, Modal, Form, Input, Tag, message, Card } from 'antd';
import { Plus, RefreshCw, Bot, Cpu, CheckCircle2 } from 'lucide-react';
import { useMessagingResource } from '@/hooks/api/useMessagingConfig';

export default function AgentBotsPage() {
  const { items: bots, isLoading, refetch, createItem, isCreating } = useMessagingResource('agent-bots');
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleCreate = async (values: any) => {
    try {
      await createItem(values);
      message.success('Thêm Agent Bot thành công!');
      setModalOpen(false);
      form.resetFields();
    } catch (err: any) {
      message.error('Không thể tạo Agent Bot');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-base font-semibold tracking-tight text-[var(--color-fg)]">Bot AI (Agent Bots)</h1>
          <p className="text-xs text-[var(--color-muted-fg)]">Quản lý các Bot AI xử lý tin nhắn tự động (Hermes Agent, Dialogflow, Webhook Bot)</p>
        </div>
        <div className="flex gap-2">
          <Button icon={<RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />} onClick={() => refetch()}>
            Làm mới
          </Button>
          <Button type="primary" icon={<Plus size={14} />} onClick={() => setModalOpen(true)} className="bg-[var(--color-accent)]">
            Thêm Agent Bot
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bots.map((bot: any) => (
          <Card key={bot.id} className="bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-accent)] transition-all">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-500">
                  <Bot size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-[var(--color-fg)]">{bot.name}</h3>
                  <p className="text-[11px] text-[var(--color-muted-fg)]">{bot.description || 'Auto-responder AI Agent'}</p>
                </div>
              </div>
              <Tag color="purple" icon={<CheckCircle2 size={12} className="inline mr-1" />}>Active</Tag>
            </div>

            <div className="mt-4 p-2.5 rounded-lg bg-[var(--color-bg-tint)] border border-[var(--color-border)] space-y-1">
              <span className="text-[10px] font-mono text-[var(--color-muted-fg)] uppercase">Webhook Target URL:</span>
              <p className="text-xs font-mono text-[var(--color-fg)] truncate">{bot.outgoing_url || 'http://localhost:3001/api/v1/integrations/chatwoot/agent-bot-webhook'}</p>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        title="Thêm Agent Bot Mới"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={isCreating}
        okText="Thêm Bot"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleCreate} className="pt-2">
          <Form.Item name="name" label="Tên Bot" rules={[{ required: true, message: 'Nhập tên bot' }]} initialValue="Hermes AI Agent">
            <Input placeholder="VD: Hermes Sales AI" />
          </Form.Item>
          <Form.Item name="description" label="Mô Tả Bot" initialValue="Autonomous AI Agent powered by Hermes + Ollama">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item
            name="outgoing_url"
            label="Webhook Outgoing URL (URL nhận tin nhắn từ Chatwoot)"
            initialValue="http://localhost:3001/api/v1/integrations/chatwoot/agent-bot-webhook"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
