'use client';

import React, { useEffect } from 'react';
import { Card, Button, Input, Switch, Form, Select, InputNumber, message } from 'antd';
import { Bot, Save, Clock, Globe } from 'lucide-react';
import { useAutoPostConfig, useUpdateAutoPostConfig } from '@/hooks/api/useMessagingConfig';

export default function AutoConfigTab() {
  const configQuery = useAutoPostConfig();
  const updateConfigMutation = useUpdateAutoPostConfig();
  const [form] = Form.useForm();

  useEffect(() => {
    if (configQuery.data && Object.keys(configQuery.data).length > 0) {
      form.setFieldsValue({
        enabled: configQuery.data.enabled ?? true,
        cronSchedule: configQuery.data.cronSchedule || '0 8 * * 1,3,5',
        timezone: configQuery.data.timezone || 'Asia/Ho_Chi_Minh',
        postCount: configQuery.data.postCount || 3,
        platform: configQuery.data.platform || 'facebook_post',
        defaultFocusTopic: configQuery.data.defaultFocusTopic || '',
        deliverPlatform: configQuery.data.deliverPlatform || 'telegram',
      });
    }
  }, [configQuery.data, form]);

  const handleSave = async (values: any) => {
    try {
      await updateConfigMutation.mutateAsync(values);
      message.success('Đã lưu cấu hình Hermes Auto Post thành công');
    } catch (err: any) {
      message.error(err.message || 'Lỗi khi cập nhật cấu hình');
    }
  };

  return (
    <Card className="rounded-2xl shadow-sm border border-[var(--color-border)] mt-2 max-w-3xl">
      <div className="flex items-center gap-2 pb-4 mb-4 border-b border-[var(--color-border)]">
        <Bot className="w-5 h-5 text-purple-600" />
        <div>
          <h3 className="text-sm font-bold text-[var(--color-fg)]">
            Cấu Hình Tự Động Tạo Nội Dung (Hermes Auto Post)
          </h3>
          <p className="text-xs text-[var(--color-muted-fg)]">
            Thiết lập lịch chạy tự động, số lượng bài viết và kênh phân phối cho CMO Marketing Unit.
          </p>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        initialValues={{
          enabled: true,
          cronSchedule: '0 8 * * 1,3,5',
          timezone: 'Asia/Ho_Chi_Minh',
          postCount: 3,
          platform: 'facebook_post',
          deliverPlatform: 'telegram',
        }}
        className="space-y-4"
      >
        <Form.Item
          name="enabled"
          valuePropName="checked"
          label={
            <span className="font-semibold text-xs text-[var(--color-fg)]">
              Kích Hoạt Tự Động Sinh Nội Dung Định Kỳ
            </span>
          }
        >
          <Switch className="bg-gray-300" />
        </Form.Item>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Form.Item
            name="cronSchedule"
            label={
              <span className="font-semibold text-xs text-[var(--color-fg)] flex items-center gap-1">
                <Clock size={12} className="text-indigo-500" /> Lịch Chạy Cron (Expression)
              </span>
            }
            extra="Mặc định: 08:00 các ngày Thứ 2, 4, 6 hàng tuần (0 8 * * 1,3,5)"
          >
            <Input className="rounded-xl text-xs font-mono" placeholder="0 8 * * 1,3,5" />
          </Form.Item>

          <Form.Item
            name="timezone"
            label={
              <span className="font-semibold text-xs text-[var(--color-fg)] flex items-center gap-1">
                <Globe size={12} className="text-blue-500" /> Múi Giờ Vận Hành
              </span>
            }
          >
            <Select
              className="rounded-xl text-xs"
              options={[
                { value: 'Asia/Ho_Chi_Minh', label: 'Asia/Ho_Chi_Minh (GMT+7)' },
                { value: 'UTC', label: 'UTC (GMT+0)' },
                { value: 'America/New_York', label: 'America/New_York (EST)' },
              ]}
            />
          </Form.Item>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Form.Item
            name="postCount"
            label={
              <span className="font-semibold text-xs text-[var(--color-fg)]">
                Số Bài Viết Đề Xuất Mỗi Lần Chạy
              </span>
            }
          >
            <InputNumber min={1} max={5} className="w-full rounded-xl text-xs" />
          </Form.Item>

          <Form.Item
            name="platform"
            label={
              <span className="font-semibold text-xs text-[var(--color-fg)]">
                Nền Tảng Đăng Mục Tiêu
              </span>
            }
          >
            <Select
              className="rounded-xl text-xs"
              options={[
                { value: 'facebook_post', label: 'Facebook Page — Content Post' },
                { value: 'instagram', label: 'Instagram Feed' },
                { value: 'linkedin', label: 'LinkedIn Company Page' },
              ]}
            />
          </Form.Item>
        </div>

        <Form.Item
          name="defaultFocusTopic"
          label={
            <span className="font-semibold text-xs text-[var(--color-fg)]">
              Chủ Đề Định Hướng Mặc Định (Tùy chọn)
            </span>
          }
          extra="Để trống để Agent tự do nghiên cứu xu hướng công nghệ mới nhất trên Internet"
        >
          <Input
            className="rounded-xl text-xs"
            placeholder="Ví dụ: Giới thiệu giải pháp CRM Đa Kênh cho SME"
          />
        </Form.Item>

        <Form.Item
          name="deliverPlatform"
          label={
            <span className="font-semibold text-xs text-[var(--color-fg)]">
              Thông Báo Kết Quả Tới
            </span>
          }
        >
          <Select
            className="rounded-xl text-xs"
            options={[
              { value: 'telegram', label: 'Telegram Topic Thread' },
              { value: 'none', label: 'Không gửi thông báo (Chỉ lưu CRM)' },
            ]}
          />
        </Form.Item>

        <div className="pt-3 border-t border-[var(--color-border)]">
          <Button
            type="primary"
            htmlType="submit"
            icon={<Save size={14} />}
            loading={updateConfigMutation.isPending}
            className="rounded-xl bg-purple-600 hover:bg-purple-700 h-10 px-6 text-xs font-medium"
          >
            Lưu Cấu Hình Tự Động
          </Button>
        </div>
      </Form>
    </Card>
  );
}
