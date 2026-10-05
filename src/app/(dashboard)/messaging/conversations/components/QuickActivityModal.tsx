'use client';

import React from 'react';
import { Modal, Form, Input, Select, DatePicker, Button, message } from 'antd';
import { Calendar, PhoneCall, Users, CheckSquare } from 'lucide-react';
import { useCreateQuickActivity } from '@/hooks/api/useConversation';

interface QuickActivityModalProps {
  visible: boolean;
  onClose: () => void;
  conversationId: number;
  matchedProfile?: any;
}

export default function QuickActivityModal({ visible, onClose, conversationId, matchedProfile }: QuickActivityModalProps) {
  const [form] = Form.useForm();
  const createActivityMutation = useCreateQuickActivity(conversationId);

  const handleFinish = async (values: any) => {
    try {
      const leadId = matchedProfile?.type === 'lead' ? matchedProfile.profile?.id : undefined;
      const customerId = matchedProfile?.type === 'customer' ? matchedProfile.profile?.id : undefined;

      await createActivityMutation.mutateAsync({
        type: values.type || 'CALL',
        title: values.title,
        scheduledAt: values.scheduledAt ? values.scheduledAt.toISOString() : undefined,
        leadId,
        customerId,
      });

      message.success('Đã tạo lịch hẹn / công việc thành công!');
      form.resetFields();
      onClose();
    } catch (e) {
      message.error('Không thể tạo công việc');
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-sm font-bold">
          <Calendar size={16} className="text-emerald-500" />
          <span>Tạo Lịch Hẹn / Công Việc Nhắc Gọi</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      className="rounded-[5px]"
      width={460}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{ type: 'CALL' }}
        className="space-y-3 my-2 text-xs"
      >
        <Form.Item
          name="type"
          label={<span className="text-[10px] uppercase font-mono text-[var(--color-muted-fg)]">Loại Hoạt Động</span>}
          rules={[{ required: true }]}
        >
          <Select className="rounded-lg text-xs">
            <Select.Option value="CALL">📞 Điện Thoại / Call</Select.Option>
            <Select.Option value="MEETING">🤝 Cuộc Hẹn / Meeting</Select.Option>
            <Select.Option value="TASK">📋 Task Nhắc Việc</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="title"
          label={<span className="text-[10px] uppercase font-mono text-[var(--color-muted-fg)]">Tiêu Đề Cong Việc</span>}
          rules={[{ required: true, message: 'Nhập tiêu đề' }]}
        >
          <Input placeholder="Vd: Gọi tư vấn báo giá gói CRM Cloud" className="rounded-lg text-xs" />
        </Form.Item>

        <Form.Item
          name="scheduledAt"
          label={<span className="text-[10px] uppercase font-mono text-[var(--color-muted-fg)]">Thời Gian Thực Hiện</span>}
        >
          <DatePicker showTime className="w-full rounded-lg text-xs" placeholder="Chọn ngày & giờ" />
        </Form.Item>

        <div className="flex justify-end gap-2 pt-2 border-t border-[var(--color-border)]">
          <Button onClick={onClose} className="rounded-xl text-xs">
            Hủy
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={createActivityMutation.isPending}
            className="rounded-xl text-xs bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
          >
            Tạo Lịch Hẹn
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
