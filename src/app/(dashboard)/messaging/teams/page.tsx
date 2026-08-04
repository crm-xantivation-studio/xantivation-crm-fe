'use client';

import React, { useState } from 'react';
import { Button, Modal, Form, Input, Tag, message, Card } from 'antd';
import { Plus, RefreshCw, Users, Shield } from 'lucide-react';
import { useMessagingResource } from '@/hooks/api/useMessagingConfig';

export default function TeamsPage() {
  const { items: teams, isLoading, refetch, createItem, isCreating } = useMessagingResource('teams');
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleCreate = async (values: any) => {
    try {
      await createItem(values);
      message.success('Tạo nhóm CSKH thành công!');
      setModalOpen(false);
      form.resetFields();
    } catch (err: any) {
      message.error('Không thể tạo nhóm');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-fg)]">Nhóm CSKH (Teams)</h1>
          <p className="text-xs text-[var(--color-muted-fg)]">Phân nhóm tư vấn viên và gán quyền tự động theo chuyên môn</p>
        </div>
        <div className="flex gap-2">
          <Button icon={<RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />} onClick={() => refetch()}>
            Làm mới
          </Button>
          <Button type="primary" icon={<Plus size={14} />} onClick={() => setModalOpen(true)} className="bg-[var(--color-accent)]">
            Thêm Nhóm
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams.map((team: any) => (
          <Card key={team.id} className="bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-accent)] transition-all">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500">
                  <Users size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-[var(--color-fg)]">{team.name}</h3>
                  <p className="text-[11px] text-[var(--color-muted-fg)]">{team.description || 'Đội ngũ tư vấn viên'}</p>
                </div>
              </div>
              <Tag color="blue">Team</Tag>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        title="Thêm Nhóm CSKH Mới"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={isCreating}
        okText="Tạo Nhóm"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleCreate} className="pt-2">
          <Form.Item name="name" label="Tên Nhóm" rules={[{ required: true, message: 'Nhập tên nhóm' }]}>
            <Input placeholder="VD: Đội Sales Chăm Sóc VIP" />
          </Form.Item>
          <Form.Item name="description" label="Mô Tả Nhóm">
            <Input.TextArea rows={2} placeholder="Mô tả chức năng nhiệm vụ của nhóm" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
