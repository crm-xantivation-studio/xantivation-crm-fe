'use client';

import React, { useState } from 'react';
import { Button, Modal, Form, Input, Tag, message, Card } from 'antd';
import { Plus, RefreshCw, Tag as TagIcon } from 'lucide-react';
import { useMessagingResource } from '@/hooks/api/useMessagingConfig';

export default function LabelsPage() {
  const { items: labels, isLoading, refetch, createItem, isCreating } = useMessagingResource('labels');
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleCreate = async (values: any) => {
    try {
      await createItem(values);
      message.success('Tạo nhãn phân loại thành công!');
      setModalOpen(false);
      form.resetFields();
    } catch (err: any) {
      message.error('Không thể tạo nhãn');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-fg)]">Nhãn Phân Loại (Labels)</h1>
          <p className="text-xs text-[var(--color-muted-fg)]">Gán nhãn phân loại mức độ ưu tiên và chủ đề cho hội thoại</p>
        </div>
        <div className="flex gap-2">
          <Button icon={<RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />} onClick={() => refetch()}>
            Làm mới
          </Button>
          <Button type="primary" icon={<Plus size={14} />} onClick={() => setModalOpen(true)} className="bg-[var(--color-accent)]">
            Thêm Nhãn
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {labels.map((labelItem: any) => (
          <Card key={labelItem.id} className="bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-accent)] transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: labelItem.color || '#1890ff' }}>
                  <TagIcon size={14} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-[var(--color-fg)]">{labelItem.title}</h3>
                  <p className="text-[11px] text-[var(--color-muted-fg)]">{labelItem.description || 'Nhãn phân loại'}</p>
                </div>
              </div>
              <Tag color={labelItem.color || 'blue'}>{labelItem.title}</Tag>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        title="Thêm Nhãn Phân Loại Mới"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={isCreating}
        okText="Tạo Nhãn"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleCreate} className="pt-2">
          <Form.Item name="title" label="Tên Nhãn" rules={[{ required: true, message: 'Nhập tên nhãn' }]}>
            <Input placeholder="VD: VIP-Enterprise" />
          </Form.Item>
          <Form.Item name="color" label="Mã Màu (HEX)" initialValue="#ff4d4f">
            <Input type="color" className="h-10 w-full cursor-pointer" />
          </Form.Item>
          <Form.Item name="description" label="Mô Tả">
            <Input.TextArea rows={2} placeholder="Mô tả trường hợp sử dụng nhãn này" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
