'use client';

import React, { useState } from 'react';
import { Button, Modal, Form, Input, Tag, message, Card } from 'antd';
import { Plus, RefreshCw, MessageSquareQuote } from 'lucide-react';
import { useMessagingResource } from '@/hooks/api/useMessagingConfig';

export default function CannedResponsesPage() {
  const { items: cannedResponses, isLoading, refetch, createItem, isCreating } = useMessagingResource('canned-responses');
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleCreate = async (values: any) => {
    try {
      await createItem(values);
      message.success('Thêm mẫu trả lời nhanh thành công!');
      setModalOpen(false);
      form.resetFields();
    } catch (err: any) {
      message.error('Không thể tạo mẫu trả lời');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-base font-semibold tracking-tight text-[var(--color-fg)]">Mẫu Trả Lời Nhanh (Canned Responses)</h1>
          <p className="text-xs text-[var(--color-muted-fg)]">Soạn sẵn các câu trả lời ngắn (gõ `/` trong chat để chọn nhanh)</p>
        </div>
        <div className="flex gap-2">
          <Button icon={<RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />} onClick={() => refetch()}>
            Làm mới
          </Button>
          <Button type="primary" icon={<Plus size={14} />} onClick={() => setModalOpen(true)} className="bg-[var(--color-accent)]">
            Thêm Mẫu Mới
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cannedResponses.map((item: any) => (
          <Card key={item.id} className="bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-accent)] transition-all">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <MessageSquareQuote size={18} className="text-[var(--color-accent)]" />
                <span className="font-mono text-xs font-bold text-[var(--color-accent)]">/{item.short_code}</span>
              </div>
              <Tag color="orange">Template</Tag>
            </div>
            <p className="mt-3 text-xs text-[var(--color-fg)] bg-[var(--color-bg-tint)] p-2.5 rounded-lg border border-[var(--color-border)] leading-relaxed">
              {item.content}
            </p>
          </Card>
        ))}
      </div>

      <Modal
        title="Thêm Mẫu Trả Lời Nhanh Mới"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={isCreating}
        okText="Tạo Mẫu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleCreate} className="pt-2">
          <Form.Item name="short_code" label="Mã Ngắn (Short Code)" rules={[{ required: true, message: 'Nhập mã ngắn' }]}>
            <Input placeholder="VD: chao (gõ /chao để gọi mẫu)" prefix="/" />
          </Form.Item>
          <Form.Item name="content" label="Nội Dung Trả Lời Mẫu" rules={[{ required: true, message: 'Nhập nội dung' }]}>
            <Input.TextArea rows={4} placeholder="Xin chào anh/chị! Em có thể tư vấn gói CRM nào cho mình ạ?" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
