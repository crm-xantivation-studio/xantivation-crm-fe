'use client';

import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, Checkbox, message, Alert } from 'antd';
import { useSaveMessagingChannel, useRegisterWebhook, useSystemSettings, useMessagingResource, useInboxMembers, useSaveInboxMembers } from '@/hooks/api/useMessagingConfig';
import { FacebookIcon, TelegramIcon, ZaloIcon, WhatsAppIcon, WebIcon } from '@/components/icons/SocialIcons';

interface InboxFormModalProps {
  visible: boolean;
  channelToEdit?: any | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function InboxFormModal({ visible, channelToEdit, onClose, onSuccess }: InboxFormModalProps) {
  const [form] = Form.useForm();
  const { settings } = useSystemSettings();
  const saveChannelMutation = useSaveMessagingChannel();
  const registerWebhookMutation = useRegisterWebhook();
  const agentsResource = useMessagingResource('agents');
  const inboxMembersQuery = useInboxMembers(channelToEdit?.inboxId);
  const saveInboxMembersMutation = useSaveInboxMembers();

  const [botTokenValue, setBotTokenValue] = useState('');
  const [autoRegister, setAutoRegister] = useState(true);

  const tunnelUrl = settings?.CHATWOOT_TUNNEL_URL?.value || '';

  useEffect(() => {
    if (visible) {
      if (channelToEdit) {
        let rawPlatform = channelToEdit.channelType || 'telegram';
        if (rawPlatform.includes('Telegram')) rawPlatform = 'telegram';
        if (rawPlatform.includes('WebWidget')) rawPlatform = 'web_widget';

        form.setFieldsValue({
          name: channelToEdit.channelName,
          platform: rawPlatform,
          botToken: '',
        });
        setBotTokenValue('');
        if (inboxMembersQuery.data) {
          form.setFieldValue(
            'assignedAgents',
            inboxMembersQuery.data.map((m: any) => m.id || m.user_id)
          );
        }
      } else {
        form.resetFields();
        setBotTokenValue('');
      }
    }
  }, [visible, channelToEdit, inboxMembersQuery.data]);

  const handleFinish = async (values: any) => {
    try {
      const isLinked = !!channelToEdit?.id;
      let rawPlatform = values.platform || 'telegram';
      if (rawPlatform.includes('Telegram')) rawPlatform = 'telegram';

      const payload: any = {
        name: values.name,
        platform: rawPlatform,
      };

      if (values.botToken) {
        payload.botToken = values.botToken;
      }

      if (values.pageId) {
        payload.pageId = values.pageId;
      }

      if (!isLinked && !values.botToken) {
        message.error('Vui lòng nhập Token kết nối');
        return;
      }

      if (channelToEdit?.inboxId) {
        payload.inboxId = channelToEdit.inboxId;
      }

      const savedChannel = await saveChannelMutation.mutateAsync({
        id: channelToEdit?.id || undefined,
        payload,
      });

      const channelId = savedChannel?.id || channelToEdit?.id;
      const inboxId = savedChannel?.inboxId || channelToEdit?.inboxId;

      // Register Webhook if Telegram platform and requested
      if (rawPlatform === 'telegram' && autoRegister && channelId) {
        await registerWebhookMutation.mutateAsync(channelId).catch(() => {});
      }

      // Save Inbox Members if selected
      if (inboxId && values.assignedAgents) {
        await saveInboxMembersMutation.mutateAsync({
          inboxId,
          agentIds: values.assignedAgents,
        }).catch(() => {});
      }

      message.success(channelToEdit ? 'Đã cập nhật kênh kết nối' : 'Đã tạo kênh kết nối mới');
      form.resetFields();
      onSuccess();
      onClose();
    } catch (err: any) {
      message.error(err.message || 'Lưu kênh kết nối thất bại');
    }
  };

  const calculatedWebhookUrl = tunnelUrl && botTokenValue ? `${tunnelUrl.replace(/\/+$/, '')}/webhooks/telegram/${botTokenValue}` : null;
  const selectedPlatform = Form.useWatch('platform', form) || 'telegram';
  const isFacebook = selectedPlatform.startsWith('facebook');

  const getTokenLabel = () => {
    if (channelToEdit) return 'Bot API Token / Access Token Mới (Bỏ trống nếu giữ nguyên)';
    if (selectedPlatform === 'telegram') return 'Telegram Bot API Token';
    if (isFacebook) return 'Facebook Page Access Token';
    if (selectedPlatform === 'zalo') return 'Zalo OA Access Token';
    return 'Bot API Token / Access Token';
  };

  const getTokenPlaceholder = () => {
    if (channelToEdit) return 'Để trống nếu không đổi token';
    if (selectedPlatform === 'telegram') return 'Ví dụ: 8971498174:AAFw-xhMOIFv3OLhSk...';
    if (isFacebook) return 'Ví dụ: EAANSIZCYNv9ABSIx7SXmAHLE91ZBB...';
    return 'Nhập Access Token...';
  };

  return (
    <Modal
      title={
        <span className="font-bold text-sm text-[var(--color-fg)]">
          {channelToEdit ? `Chỉnh Sửa Kênh #${channelToEdit.inboxId}` : 'Thêm Kênh Kết Nối Mới (Telegram / Facebook / Zalo)'}
        </span>
      }
      open={visible}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      onOk={() => form.submit()}
      confirmLoading={saveChannelMutation.isPending || registerWebhookMutation.isPending}
      okText={channelToEdit ? 'Lưu Thay Đổi' : 'Tạo Kênh'}
      cancelText="Hủy"
      className="rounded-[5px]"
    >
      <Form form={form} layout="vertical" onFinish={handleFinish} className="mt-4 space-y-3">
        <Form.Item name="name" label="Tên Kênh Hiển Thị" rules={[{ required: true, message: 'Nhập tên kênh' }]}>
          <Input placeholder="Ví dụ: FB CSKH Bot / Telegram Support" className="rounded-xl text-xs" />
        </Form.Item>

        <Form.Item name="platform" label="Loại Nền Tảng" initialValue="telegram">
          <Select
            options={[
              { value: 'telegram', label: <div className="flex items-center gap-2"><TelegramIcon size={14} /><span>Telegram Bot</span></div> },
              { value: 'facebook_messenger', label: <div className="flex items-center gap-2"><FacebookIcon size={14} /><span>Facebook Messenger Bot</span></div> },
              { value: 'facebook_post', label: <div className="flex items-center gap-2"><FacebookIcon size={14} /><span>Facebook Auto-Post Bot</span></div> },
              { value: 'facebook_reels', label: <div className="flex items-center gap-2"><FacebookIcon size={14} /><span>Facebook Reels Bot</span></div> },
              { value: 'zalo', label: <div className="flex items-center gap-2"><ZaloIcon size={14} /><span>Zalo Official Account</span></div> },
              { value: 'whatsapp', label: <div className="flex items-center gap-2"><WhatsAppIcon size={14} /><span>WhatsApp Business</span></div> },
              { value: 'web_widget', label: <div className="flex items-center gap-2"><WebIcon size={14} /><span>Website Live Chat Widget</span></div> },
            ]}
            className="rounded-xl text-xs"
          />
        </Form.Item>

        <Form.Item
          name="botToken"
          label={getTokenLabel()}
          rules={channelToEdit ? [] : [{ required: true, message: 'Nhập Token kết nối' }]}
        >
          <Input.Password
            onChange={(e) => setBotTokenValue(e.target.value)}
            placeholder={getTokenPlaceholder()}
            className="rounded-xl font-mono text-xs"
          />
        </Form.Item>

        {isFacebook && (
          <Form.Item
            name="pageId"
            label="Facebook Page ID"
            rules={[{ required: true, message: 'Nhập Facebook Page ID (dãy số bên dưới tên Page)' }]}
          >
            <Input
              placeholder="Ví dụ: 134110882402917"
              className="rounded-xl font-mono text-xs"
            />
          </Form.Item>
        )}

        {selectedPlatform === 'telegram' && calculatedWebhookUrl && (
          <Alert
            title="Đường Dẫn Webhook Sẽ Đăng Ký Tới Telegram"
            description={<span className="font-mono text-[11px] break-all">{calculatedWebhookUrl}</span>}
            type="info"
            showIcon
            className="rounded-xl"
          />
        )}

        <Form.Item name="assignedAgents" label="Gán Nhân Viên Phụ Trách Kênh (Inbox Members)">
          <Select
            mode="multiple"
            placeholder="Chọn nhân viên CSKH phụ trách..."
            className="rounded-xl text-xs"
            loading={agentsResource.isLoading}
            options={agentsResource.items.map((agent: any) => ({
              value: agent.id,
              label: `${agent.name || agent.email} (${agent.role || 'agent'})`,
            }))}
          />
        </Form.Item>

        {selectedPlatform === 'telegram' && !channelToEdit && (
          <Form.Item className="mb-0">
            <Checkbox 
              checked={autoRegister} 
              onChange={(e) => setAutoRegister(e.target.checked)}
              className="text-xs text-[var(--color-muted-fg)]"
            >
              Tự động đăng ký Telegram Webhook ngay sau khi lưu
            </Checkbox>
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
}
