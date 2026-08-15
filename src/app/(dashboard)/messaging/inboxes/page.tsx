'use client';

import React, { useState } from 'react';
import { Button, Modal, Form, Input, Select, Tag, message, Card } from 'antd';
import { Plus, RefreshCw, Radio, Globe, Send, Mail, MessageSquare } from 'lucide-react';
import { useMessagingResource } from '@/hooks/api/useMessagingConfig';

export default function InboxesPage() {
  const { items: inboxes, isLoading, refetch, createItem, isCreating } = useMessagingResource('inboxes');
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleCreate = async (values: any) => {
    try {
      await createItem(values);
      message.success('Tạo kênh kết nối thành công!');
      setModalOpen(false);
      form.resetFields();
    } catch (err: any) {
      message.error('Không thể tạo kênh kết nối');
    }
  };

  const getChannelIcon = (type: string) => {
    if (type?.includes('Telegram')) return <Send className="text-sky-500" size={20} />;
    if (type?.includes('Email')) return <Mail className="text-amber-500" size={20} />;
    if (type?.includes('WebWidget')) return <Globe className="text-emerald-500" size={20} />;
    return <Radio className="text-purple-500" size={20} />;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-fg)]">Kênh Kết Nối (Inboxes)</h1>
          <p className="text-xs text-[var(--color-muted-fg)]">Quản lý các kênh tương tác: Telegram Bot, Web Widget, Email, WhatsApp...</p>
        </div>
        <div className="flex gap-2">
          <Button icon={<RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />} onClick={() => refetch()}>
            Làm mới
          </Button>
          <Button type="primary" icon={<Plus size={14} />} onClick={() => setModalOpen(true)} className="bg-[var(--color-accent)]">
            Thêm Kênh Kết Nối
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {inboxes.map((inbox: any) => (
          <Card key={inbox.id} className="bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-accent)] transition-all">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[var(--color-bg-tint)] border border-[var(--color-border)]">
                  {getChannelIcon(inbox.channel_type || inbox.name)}
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-[var(--color-fg)]">{inbox.name}</h3>
                  <p className="text-[11px] text-[var(--color-muted-fg)] font-mono">{inbox.channel_type || 'Custom Channel'}</p>
                </div>
              </div>
              <Tag color="green">Hoạt động</Tag>
            </div>
            <div className="mt-4 pt-3 border-t border-[var(--color-border)] flex justify-between items-center text-xs text-[var(--color-muted-fg)]">
              <span>ID: #{inbox.id}</span>
              <span className="text-emerald-500 font-medium">Auto-sync ON</span>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        title="Thêm Kênh Kết Nối Mới"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={isCreating}
        okText="Tạo Kênh"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleCreate} className="pt-2">
          <Form.Item name="name" label="Tên Kênh" rules={[{ required: true, message: 'Nhập tên kênh' }]}>
            <Input placeholder="VD: Telegram Sales Bot" />
          </Form.Item>
          <Form.Item name="channel_type" label="Loại Kênh" initialValue="telegram">
            <Select
              options={[
                { value: 'telegram', label: '✈️ Telegram Bot' },
                { value: 'facebook_messenger', label: '🔵 Facebook Messenger Bot' },
                { value: 'facebook_post', label: '📰 Facebook Auto-Post Bot' },
                { value: 'facebook_reels', label: '🎬 Facebook Reels Bot' },
                { value: 'zalo', label: '💬 Zalo Official Account' },
                { value: 'whatsapp', label: '💚 WhatsApp Business' },
                { value: 'web_widget', label: '🌐 Website Live Chat Widget' },
                { value: 'email', label: '📧 Email Support (IMAP/SMTP)' },
                { value: 'api', label: '🔌 Custom REST API Channel' },
              ]}
            />
          </Form.Item>
          <Form.Item name="bot_token" label="Telegram Bot Token (nếu chọn Telegram)">
            <Input.Password placeholder="123456789:ABCdef..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
