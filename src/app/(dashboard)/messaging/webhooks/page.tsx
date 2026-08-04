'use client';

import React, { useState } from 'react';
import { Button, Modal, Form, Input, Tag, message, Card } from 'antd';
import { Plus, RefreshCw, Link as LinkIcon, ShieldCheck } from 'lucide-react';
import { useMessagingResource } from '@/hooks/api/useMessagingConfig';

export default function WebhooksPage() {
  const { items: webhooks, isLoading, refetch, createItem, isCreating } = useMessagingResource('webhooks');
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleCreate = async (values: any) => {
    try {
      await createItem(values);
      message.success('Tạo Webhook thành công!');
      setModalOpen(false);
      form.resetFields();
    } catch (err: any) {
      message.error('Không thể tạo Webhook');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-fg)]">Cấu Hình Webhooks</h1>
          <p className="text-xs text-[var(--color-muted-fg)]">Đẩy dữ liệu sự kiện hội thoại sang hệ thống bên ngoài (NestJS Backend, Zapier, Custom Server)</p>
        </div>
        <div className="flex gap-2">
          <Button icon={<RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />} onClick={() => refetch()}>
            Làm mới
          </Button>
          <Button type="primary" icon={<Plus size={14} />} onClick={() => setModalOpen(true)} className="bg-[var(--color-accent)]">
            Thêm Webhook
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {webhooks.map((wh: any) => (
          <Card key={wh.id} className="bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-accent)] transition-all">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-500">
                  <LinkIcon size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-xs font-mono text-[var(--color-fg)] truncate max-w-[200px]">{wh.url}</h3>
                  <p className="text-[10px] text-[var(--color-muted-fg)]">ID: #{wh.id}</p>
                </div>
              </div>
              <Tag color="cyan">Active</Tag>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        title="Thêm Webhook Outbound Mới"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={isCreating}
        okText="Tạo Webhook"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleCreate} className="pt-2">
          <Form.Item
            name="url"
            label="Webhook URL (Nơi nhận dữ liệu POST)"
            rules={[{ required: true, message: 'Nhập URL' }]}
            initialValue="http://localhost:3001/api/v1/integrations/chatwoot/webhook"
          >
            <Input placeholder="https://your-server.com/api/webhook" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
