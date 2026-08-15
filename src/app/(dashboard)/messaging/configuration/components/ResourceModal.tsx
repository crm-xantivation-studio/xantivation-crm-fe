'use client';

import React from 'react';
import { Modal, Form, Input, Select, ColorPicker, message } from 'antd';

interface ResourceModalProps {
  visible: boolean;
  resourceType: 'agents' | 'agent-bots' | 'teams' | 'labels' | 'canned-responses' | 'webhooks' | null;
  onClose: () => void;
  onSubmit: (payload: any) => Promise<void>;
  loading: boolean;
}

export default function ResourceModal({
  visible,
  resourceType,
  onClose,
  onSubmit,
  loading,
}: ResourceModalProps) {
  const [form] = Form.useForm();

  const getTitle = () => {
    switch (resourceType) {
      case 'agents': return 'Thêm Nhân Viên CSKH Mới (Human Agent)';
      case 'agent-bots': return 'Tạo Agent Bot AI Mới';
      case 'teams': return 'Thêm Nhóm Hỗ Trợ CSKH';
      case 'labels': return 'Tạo Nhãn Phân Loại Mới';
      case 'canned-responses': return 'Thêm Mẫu Trả Lời Nhanh';
      case 'webhooks': return 'Tạo & Đăng Ký Webhook Endpoint Mới';
      default: return 'Thêm Mới Cấu Hình';
    }
  };

  const handleFinish = async (values: any) => {
    try {
      let payload = { ...values };

      if (resourceType === 'labels' && typeof values.color === 'object') {
        payload.color = values.color.toHexString();
      } else if (resourceType === 'webhooks') {
        payload.subscriptions = values.subscriptions || ['message_created', 'message_updated', 'conversation_created'];
      }

      await onSubmit(payload);
      form.resetFields();
      onClose();
    } catch (err: any) {
      message.error(err.message || 'Tạo dữ liệu thất bại');
    }
  };

  return (
    <Modal
      title={<span className="font-bold text-sm text-[var(--color-fg)]">{getTitle()}</span>}
      open={visible}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      onOk={() => form.submit()}
      confirmLoading={loading}
      okText="Xác Nhận Tạo"
      cancelText="Hủy"
      className="rounded-2xl"
    >
      <Form form={form} layout="vertical" onFinish={handleFinish} className="mt-4 space-y-3">
        {/* AGENTS (Human CSKH) FORM */}
        {resourceType === 'agents' && (
          <>
            <Form.Item name="name" label="Tên Nhân Viên" rules={[{ required: true, message: 'Nhập tên nhân viên' }]}>
              <Input placeholder="Ví dụ: Nguyễn Văn A" className="rounded-xl text-xs" />
            </Form.Item>
            <Form.Item name="email" label="Email Đăng Nhập / Liên Hệ" rules={[{ required: true, type: 'email', message: 'Nhập email hợp lệ' }]}>
              <Input placeholder="sales@xantivation.com" className="rounded-xl text-xs" />
            </Form.Item>
            <Form.Item name="role" label="Vai Trò / Phân Quyền" initialValue="agent">
              <Select
                options={[
                  { value: 'agent', label: '👤 Agent (Tư vấn viên)' },
                  { value: 'administrator', label: '👑 Administrator (Quản trị viên)' },
                ]}
                className="rounded-xl text-xs"
              />
            </Form.Item>
          </>
        )}

        {/* AGENT BOTS FORM */}
        {resourceType === 'agent-bots' && (
          <>
            <Form.Item name="name" label="Tên Bot AI" rules={[{ required: true, message: 'Nhập tên Bot' }]}>
              <Input placeholder="Ví dụ: Hermes AI Assistant" className="rounded-xl text-xs" />
            </Form.Item>
            <Form.Item name="description" label="Mô Tả Bot">
              <Input placeholder="Ví dụ: Bot tự động tư vấn CRM Cloud" className="rounded-xl text-xs" />
            </Form.Item>
            <Form.Item name="outgoing_url" label="Outgoing Webhook URL" initialValue="http://host.docker.internal:3001/api/v1/integrations/chatwoot/agent-bot-webhook">
              <Input placeholder="http://..." className="rounded-xl text-xs font-mono" />
            </Form.Item>
          </>
        )}

        {/* TEAMS FORM */}
        {resourceType === 'teams' && (
          <>
            <Form.Item name="name" label="Tên Nhóm" rules={[{ required: true, message: 'Nhập tên nhóm' }]}>
              <Input placeholder="Ví dụ: Nhóm Tư Vấn Sales" className="rounded-xl text-xs" />
            </Form.Item>
            <Form.Item name="description" label="Mô Tả Chức Năng">
              <Input placeholder="Ví dụ: Phụ trách hỗ trợ chốt hợp đồng CRM" className="rounded-xl text-xs" />
            </Form.Item>
          </>
        )}

        {/* LABELS FORM */}
        {resourceType === 'labels' && (
          <>
            <Form.Item name="title" label="Tên Nhãn Phân Loại" rules={[{ required: true, message: 'Nhập tên nhãn' }]}>
              <Input placeholder="Ví dụ: Khách Hàng Tiềm Năng" className="rounded-xl text-xs" />
            </Form.Item>
            <Form.Item name="color" label="Mã Màu Đại Diện" initialValue="#10b981">
              <ColorPicker showText className="rounded-xl text-xs" />
            </Form.Item>
            <Form.Item name="description" label="Mô Tả Nhãn">
              <Input placeholder="Mô tả nhãn phân loại..." className="rounded-xl text-xs" />
            </Form.Item>
          </>
        )}

        {/* CANNED RESPONSES FORM */}
        {resourceType === 'canned-responses' && (
          <>
            <Form.Item name="short_code" label="Mã Trả Lời Nhanh (Gõ /code)" rules={[{ required: true, message: 'Nhập mã nhanh' }]}>
              <Input placeholder="Ví dụ: chao hoặc baogia" addonBefore="/" className="rounded-xl font-mono text-xs" />
            </Form.Item>
            <Form.Item name="content" label="Nội Dung Mẫu Trả Lời" rules={[{ required: true, message: 'Nhập nội dung mẫu' }]}>
              <Input.TextArea rows={3} placeholder="Nhập nội dung trả lời sẵn cho khách hàng..." className="rounded-xl text-xs" />
            </Form.Item>
          </>
        )}

        {/* WEBHOOKS FORM */}
        {resourceType === 'webhooks' && (
          <>
            <Form.Item name="url" label="Target Webhook URL" rules={[{ required: true, message: 'Nhập URL Webhook' }]} initialValue="http://host.docker.internal:3001/api/v1/integrations/chatwoot/webhook">
              <Input placeholder="http://host.docker.internal:3001/..." className="rounded-xl font-mono text-xs" />
            </Form.Item>
            <Form.Item name="subscriptions" label="Các Sự Kiện Theo Dõi" initialValue={['message_created', 'message_updated', 'conversation_created', 'conversation_updated']}>
              <Select
                mode="multiple"
                options={[
                  { value: 'message_created', label: 'Tạo tin nhắn mới (message_created)' },
                  { value: 'message_updated', label: 'Cập nhật tin nhắn (message_updated)' },
                  { value: 'conversation_created', label: 'Tạo cuộc hội thoại mới (conversation_created)' },
                  { value: 'conversation_updated', label: 'Cập nhật hội thoại (conversation_updated)' },
                  { value: 'conversation_status_changed', label: 'Đổi trạng thái (conversation_status_changed)' },
                ]}
                className="rounded-xl text-xs"
              />
            </Form.Item>
          </>
        )}
      </Form>
    </Modal>
  );
}
