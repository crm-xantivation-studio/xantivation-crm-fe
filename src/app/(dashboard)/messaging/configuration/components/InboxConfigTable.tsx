'use client';

import React, { useState } from 'react';
import { Button, Tag, Tooltip, Popconfirm, message, Badge } from 'antd';
import { Eye, EyeOff, Edit, Trash2, RotateCw, CheckCircle2, AlertTriangle, XCircle, Plus, Info } from 'lucide-react';
import SharedTable from '@/components/SharedTable';
import { useMessagingChannels, useDeleteMessagingChannel, useRegisterWebhook } from '@/hooks/api/useMessagingConfig';
import { FacebookIcon, TelegramIcon, ZaloIcon, WhatsAppIcon, WebIcon } from '@/components/icons/SocialIcons';

interface InboxConfigTableProps {
  onOpenCreateModal: () => void;
  onOpenEditModal: (channel: any) => void;
}

export default function InboxConfigTable({ onOpenCreateModal, onOpenEditModal }: InboxConfigTableProps) {
  const { data: channels = [], isLoading, refetch } = useMessagingChannels(true);
  const deleteChannelMutation = useDeleteMessagingChannel();
  const registerWebhookMutation = useRegisterWebhook();

  const [visibleTokens, setVisibleTokens] = useState<Record<string, boolean>>({});

  const toggleTokenVisibility = (id: string) => {
    setVisibleTokens((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleRegisterSingleWebhook = async (id: string) => {
    try {
      const res = await registerWebhookMutation.mutateAsync(id);
      if (res?.ok) {
        message.success(res.message || 'Đã kiểm tra kết nối Webhook');
      } else {
        message.error(res?.message || 'Đăng ký Webhook thất bại');
      }
      refetch();
    } catch (e: any) {
      message.error(e.message || 'Lỗi đăng ký Webhook');
    }
  };

  const handleDeleteChannel = async (id: string) => {
    try {
      await deleteChannelMutation.mutateAsync(id);
      message.success('Đã xoá kênh kết nối thành công');
      refetch();
    } catch (e: any) {
      message.error(e.message || 'Xoá kênh kết nối thất bại');
    }
  };

  const renderWebhookStatusTag = (record: any) => {
    const status = record.webhookStatus;
    if (!record.linked) {
      return <Tag color="default">Chưa liên kết CRM</Tag>;
    }
    if (record.channelType !== 'telegram') {
      return (
        <Tag color="processing" className="flex items-center gap-1 w-fit">
          <CheckCircle2 size={12} /> Cấu Hình Meta / API
        </Tag>
      );
    }
    if (!record.webhookUrl) {
      return (
        <Tag color="warning" className="flex items-center gap-1 w-fit">
          <AlertTriangle size={12} /> Chưa Đăng Ký
        </Tag>
      );
    }
    if (!status || !status.ok) {
      return (
        <Tooltip title={status?.lastErrorMessage || 'Không kết nối được Telegram API'}>
          <Tag color="error" className="flex items-center gap-1 w-fit cursor-pointer">
            <XCircle size={12} /> Lỗi Webhook
          </Tag>
        </Tooltip>
      );
    }
    if (status.pendingUpdateCount > 0) {
      return (
        <Tooltip title={`Đang chờ xử lý ${status.pendingUpdateCount} tin nhắn kẹt`}>
          <Tag color="processing" className="flex items-center gap-1 w-fit cursor-pointer font-mono">
            <Badge status="processing" /> Pending {status.pendingUpdateCount}
          </Tag>
        </Tooltip>
      );
    }
    return (
      <Tag color="success" className="flex items-center gap-1 w-fit">
        <CheckCircle2 size={12} /> Hoạt Động (OK)
      </Tag>
    );
  };

  const columns = [
    {
      title: 'Inbox ID',
      dataIndex: 'inboxId',
      key: 'inboxId',
      render: (val: number) => <span className="font-mono text-xs font-bold text-[var(--color-muted-fg)]">#{val}</span>,
    },
    {
      title: 'Tên Kênh Kết Nối',
      dataIndex: 'channelName',
      key: 'channelName',
      render: (text: string, record: any) => (
        <div>
          <span className="font-bold text-xs text-[var(--color-fg)]">{text}</span>
          {record.orphan && <span className="ml-2 text-[10px] text-rose-400 font-mono">(Đã xoá trên Chatwoot)</span>}
        </div>
      ),
    },
    {
      title: 'Loại Kênh',
      dataIndex: 'channelType',
      key: 'channelType',
      render: (val: string) => {
        if (val === 'telegram' || val === 'Channel::Telegram') {
          return (
            <Tag color="cyan" className="inline-flex items-center gap-1.5">
              <TelegramIcon size={12} /> Telegram Bot
            </Tag>
          );
        }
        if (val === 'facebook_messenger' || val === 'facebook' || val === 'Channel::FacebookPage') {
          return (
            <Tag color="blue" className="inline-flex items-center gap-1.5">
              <FacebookIcon size={12} /> FB Messenger
            </Tag>
          );
        }
        if (val === 'facebook_post') {
          return (
            <Tag color="orange" className="inline-flex items-center gap-1.5">
              <FacebookIcon size={12} /> FB Auto-Post
            </Tag>
          );
        }
        if (val === 'facebook_reels') {
          return (
            <Tag color="purple" className="inline-flex items-center gap-1.5">
              <FacebookIcon size={12} /> FB Reels
            </Tag>
          );
        }
        if (val === 'zalo') {
          return (
            <Tag color="geekblue" className="inline-flex items-center gap-1.5">
              <ZaloIcon size={12} /> Zalo OA
            </Tag>
          );
        }
        if (val === 'whatsapp' || val === 'Channel::Whatsapp') {
          return (
            <Tag color="green" className="inline-flex items-center gap-1.5">
              <WhatsAppIcon size={12} /> WhatsApp
            </Tag>
          );
        }
        if (val === 'web_widget' || val === 'Channel::WebWidget') {
          return (
            <Tag color="blue" className="inline-flex items-center gap-1.5">
              <WebIcon size={12} /> Website Chat
            </Tag>
          );
        }
        return <Tag color="default">{val}</Tag>;
      },
    },
    {
      title: 'Bot Token',
      dataIndex: 'tokenMasked',
      key: 'tokenMasked',
      render: (val: string, record: any) => {
        if (!record.linked) return <span className="text-[11px] text-[var(--color-muted-fg)]">—</span>;
        const isVisible = visibleTokens[record.inboxId];
        return (
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span>{isVisible ? val : '••••••••••••••••'}</span>
            <button
              type="button"
              onClick={() => toggleTokenVisibility(record.inboxId)}
              className="text-[var(--color-muted-fg)] hover:text-[var(--color-fg)] cursor-pointer"
            >
              {isVisible ? <EyeOff size={13} /> : <Eye size={13} />}
            </button>
          </div>
        );
      },
    },
    {
      title: 'Trạng Thái Webhook',
      dataIndex: 'webhookStatus',
      key: 'webhookStatus',
      render: (_: any, record: any) => renderWebhookStatusTag(record),
    },
    {
      title: 'Hành Động',
      dataIndex: 'id',
      key: 'actions',
      render: (_: any, record: any) => (
        <div className="flex items-center gap-1.5">
          {record.linked && (
            <Tooltip title="Đăng ký lại Webhook với Tunnel hiện tại">
              <Button
                type="text"
                size="small"
                onClick={() => handleRegisterSingleWebhook(record.id)}
                loading={registerWebhookMutation.isPending}
                icon={<RotateCw size={14} className="text-cyan-500" />}
                className="cursor-pointer"
              />
            </Tooltip>
          )}

          <Tooltip title="Chỉnh sửa cấu hình kênh">
            <Button
              type="text"
              size="small"
              onClick={() => onOpenEditModal(record)}
              icon={<Edit size={14} className="text-indigo-500" />}
              className="cursor-pointer"
            />
          </Tooltip>

          <Popconfirm
            title="Xoá kênh kết nối này?"
            description="Thao tác này sẽ xoá cấu hình và Inbox tương ứng."
            onConfirm={() => handleDeleteChannel(record.id || record.inboxId)}
            okText="Xoá"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="text"
              size="small"
              icon={<Trash2 size={14} className="text-rose-500" />}
              className="cursor-pointer"
            />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-bold text-sm text-[var(--color-fg)]">Danh Sách Kênh Kết Nối (Inboxes & Telegram Bots)</h3>
          <p className="text-[11px] text-[var(--color-muted-fg)]">Quản lý Bot Token, Trạng thái Webhook Telegram và gán nhân viên phụ trách.</p>
        </div>
        <Button
          type="primary"
          onClick={onOpenCreateModal}
          icon={<Plus size={14} />}
          className="rounded-xl bg-[var(--color-accent)] cursor-pointer"
        >
          Thêm Kênh Mới
        </Button>
      </div>

      <SharedTable<any> columns={columns} dataSource={channels} />
    </div>
  );
}
