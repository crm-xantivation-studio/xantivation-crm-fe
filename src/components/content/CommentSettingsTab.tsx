'use client';

import React from 'react';
import { Card, Button, Input, Switch, Form, message } from 'antd';
import { Link as LinkIcon } from 'lucide-react';
import { useCommentSettings, useUpdateCommentSettings } from '@/hooks/api/useMessagingConfig';

const { TextArea } = Input;

export default function CommentSettingsTab() {
  const commentSettingsQuery = useCommentSettings();
  const updateCommentSettingsMutation = useUpdateCommentSettings();
  const [settingsForm] = Form.useForm();

  // Populate settings form
  React.useEffect(() => {
    if (commentSettingsQuery.data) {
      settingsForm.setFieldsValue({
        autoReplyEnabled: commentSettingsQuery.data.autoReplyEnabled,
        template: commentSettingsQuery.data.template,
        portfolioContactLink: commentSettingsQuery.data.portfolioContactLink,
      });
    }
  }, [commentSettingsQuery.data, settingsForm]);

  // Handler: Save Comment Settings
  const handleSaveSettings = async (values: any) => {
    try {
      await updateCommentSettingsMutation.mutateAsync(values);
      message.success('Đã lưu cấu hình phản hồi bình luận tự động');
    } catch (err: any) {
      message.error(err.message || 'Cập nhật cấu hình thất bại');
    }
  };

  return (
    <Card className="rounded-2xl shadow-sm border border-[var(--color-border)] mt-2 max-w-3xl">
      <Form
        form={settingsForm}
        layout="vertical"
        onFinish={handleSaveSettings}
        className="space-y-4"
      >
        <Form.Item
          name="autoReplyEnabled"
          valuePropName="checked"
          label={
            <span className="font-semibold text-xs text-[var(--color-fg)]">
              Bật Tự Động Trả Lời Bình Luận Trên Facebook
            </span>
          }
        >
          <Switch className="bg-gray-300" />
        </Form.Item>

        <Form.Item
          name="template"
          label={
            <span className="font-semibold text-xs text-[var(--color-fg)]">
              Mẫu Câu Trả Lời Tự Động (Template)
            </span>
          }
          extra="Sử dụng từ khóa {contact_link} để gán liên kết Form Contact tự động."
        >
          <TextArea
            rows={4}
            placeholder="Cảm ơn bạn đã quan tâm. Bạn có thể gửi thông tin yêu cầu tư vấn trực tiếp qua liên kết sau: {contact_link}"
            className="rounded-xl text-xs p-3 font-sans"
          />
        </Form.Item>

        <Form.Item
          name="portfolioContactLink"
          label={
            <span className="font-semibold text-xs text-[var(--color-fg)] flex items-center gap-1.5">
              <LinkIcon size={14} className="text-indigo-500" />
              Đường Dẫn Form Liên Hệ (Portfolio Contact Form Link)
            </span>
          }
        >
          <Input
            placeholder="https://xantivation.com/contact"
            className="rounded-xl text-xs font-mono"
          />
        </Form.Item>

        <div className="pt-3 border-t border-[var(--color-border)]">
          <Button
            type="primary"
            htmlType="submit"
            loading={updateCommentSettingsMutation.isPending}
            className="rounded-xl bg-indigo-600 hover:bg-indigo-700 h-10 px-6 text-xs font-medium"
          >
            Lưu Cấu Hình
          </Button>
        </div>
      </Form>
    </Card>
  );
}
