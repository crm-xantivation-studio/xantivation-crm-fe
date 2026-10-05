'use client';

import React, { useState } from 'react';
import { Button, Modal, Form, Input, Select, Tag, Switch, message, Card } from 'antd';
import { Plus, RefreshCw, Zap, Play } from 'lucide-react';
import { useMessagingResource } from '@/hooks/api/useMessagingConfig';

export default function AutomationRulesPage() {
  const { items: rules, isLoading, refetch, createItem, isCreating } = useMessagingResource('automation-rules');
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleCreate = async (values: any) => {
    try {
      await createItem(values);
      message.success('Tạo quy tắc tự động thành công!');
      setModalOpen(false);
      form.resetFields();
    } catch (err: any) {
      message.error('Không thể tạo quy tắc');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-base font-semibold tracking-tight text-[var(--color-fg)]">Quy Tắc Tự Động Hóa (Automation Rules)</h1>
          <p className="text-xs text-[var(--color-muted-fg)]">Tự động gán team, gán nhãn, phản hồi khi có sự kiện hội thoại mới</p>
        </div>
        <div className="flex gap-2">
          <Button icon={<RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />} onClick={() => refetch()}>
            Làm mới
          </Button>
          <Button type="primary" icon={<Plus size={14} />} onClick={() => setModalOpen(true)} className="bg-[var(--color-accent)]">
            Thêm Quy Tắc
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rules.map((rule: any) => (
          <Card key={rule.id} className="bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-accent)] transition-all">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
                  <Zap size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-[var(--color-fg)]">{rule.name}</h3>
                  <p className="text-[11px] font-mono text-[var(--color-muted-fg)]">Event: {rule.event_name || 'conversation_created'}</p>
                </div>
              </div>
              <Switch checked={rule.active !== false} size="small" />
            </div>
          </Card>
        ))}
      </div>

      <Modal
        title="Thêm Quy Tắc Tự Động Hóa Mới"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={isCreating}
        okText="Tạo Quy Tắc"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleCreate} className="pt-2">
          <Form.Item name="name" label="Tên Quy Tắc" rules={[{ required: true, message: 'Nhập tên quy tắc' }]}>
            <Input placeholder="VD: Tự gán nhãn VIP khi có từ khóa 'Enterprise'" />
          </Form.Item>
          <Form.Item name="event_name" label="Sự Kiện Kích Hoạt" initialValue="conversation_created">
            <Select
              options={[
                { value: 'conversation_created', label: 'Khi tạo cuộc hội thoại mới (conversation_created)' },
                { value: 'message_created', label: 'Khi có tin nhắn mới (message_created)' },
                { value: 'conversation_resolved', label: 'Khi giải quyết cuộc hội thoại (conversation_resolved)' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
