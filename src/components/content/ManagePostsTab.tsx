'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Tag, Table, Modal, Tooltip, Radio } from 'antd';
import {
  Send,
  Trash2,
  ExternalLink,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  RotateCcw,
  Archive,
  Sparkles,
  CheckSquare,
  Bot,
  User,
} from 'lucide-react';
import {
  useSocialPostsFiltered,
  usePublishSocialPost,
  useDeleteSocialPost,
  useRestoreSocialPost,
} from '@/hooks/api/useMessagingConfig';

interface ManagePostsTabProps {
  onOpenReview: (post: any) => void;
  onOpenRegenerate: (post: any) => void;
  deepLinkPostId?: string | null;
}

export default function ManagePostsTab({
  onOpenReview,
  onOpenRegenerate,
  deepLinkPostId,
}: ManagePostsTabProps) {
  const [filterKey, setFilterKey] = useState<string>('all');

  // Compute query filters based on active filter key
  const queryFilters = React.useMemo(() => {
    switch (filterKey) {
      case 'pending_approval':
        return { status: 'pending_approval' };
      case 'published':
        return { status: 'published' };
      case 'archived':
        return { includeArchived: true, status: 'archived' };
      default:
        return { includeArchived: false };
    }
  }, [filterKey]);

  const postsQuery = useSocialPostsFiltered(queryFilters);
  const publishPostMutation = usePublishSocialPost();
  const deletePostMutation = useDeleteSocialPost();
  const restorePostMutation = useRestoreSocialPost();

  // Deep-link auto-open review modal
  useEffect(() => {
    if (deepLinkPostId && postsQuery.data) {
      const targetPost = postsQuery.data.find((p: any) => p.id === deepLinkPostId);
      if (targetPost) {
        onOpenReview(targetPost);
      }
    }
  }, [deepLinkPostId, postsQuery.data, onOpenReview]);

  // Counts for each tab
  const postsList: any[] = postsQuery.data || [];

  const columns = [
    {
      title: 'Mã Bài Viết',
      dataIndex: 'id',
      key: 'id',
      width: 110,
      render: (id: string) => (
        <span className="font-mono text-xs text-[var(--color-muted-fg)]">
          #{id.slice(0, 8)}
        </span>
      ),
    },
    {
      title: 'Nguồn',
      dataIndex: 'origin',
      key: 'origin',
      width: 130,
      render: (origin: string) => {
        if (origin === 'hermes_agent') {
          return (
            <Tag color="purple" className="flex items-center gap-1 w-fit text-[11px] font-medium rounded-md px-2 py-0.5">
              <Bot size={12} /> Hermes AI
            </Tag>
          );
        }
        return (
          <Tag color="blue" className="flex items-center gap-1 w-fit text-[11px] font-medium rounded-md px-2 py-0.5">
            <User size={12} /> Thủ công
          </Tag>
        );
      },
    },
    {
      title: 'Tiêu Đề & Nội Dung',
      dataIndex: 'title',
      key: 'title',
      render: (_: any, record: any) => (
        <div className="space-y-1.5">
          <div className="font-medium text-xs text-[var(--color-fg)]">
            {record.title}
          </div>
          <div className="text-[11px] text-[var(--color-muted-fg)] line-clamp-2">
            {record.content}
          </div>
          {record.origin === 'hermes_agent' && (
            <div className="flex flex-wrap items-center gap-1 pt-0.5">
              {record.topicCategory && (
                <Tag color="default" className="text-[10px] rounded px-1.5 py-0">
                  📌 {record.topicCategory}
                </Tag>
              )}
              {record.contentPillar && (
                <Tag color="geekblue" className="text-[10px] rounded px-1.5 py-0">
                  📊 {record.contentPillar}
                </Tag>
              )}
              {record.sources && record.sources.length > 0 && (
                <Tooltip
                  title={
                    <div className="text-xs space-y-1">
                      <div className="font-semibold">Nguồn trích dẫn:</div>
                      {record.sources.map((s: any, idx: number) => (
                        <div key={idx} className="truncate max-w-xs">
                          • {s.title || s.url}
                        </div>
                      ))}
                    </div>
                  }
                >
                  <Tag color="cyan" className="text-[10px] rounded px-1.5 py-0 cursor-help">
                    📎 {record.sources.length} nguồn
                  </Tag>
                </Tooltip>
              )}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Kênh Xuất Bản',
      dataIndex: 'channelName',
      key: 'channelName',
      width: 170,
      render: (val: string, record: any) => (
        <Tag
          color={
            record.platform === 'facebook_post'
              ? 'orange'
              : record.platform === 'facebook_reels'
              ? 'purple'
              : 'blue'
          }
          className="text-[11px] font-medium"
        >
          {val || record.platform}
        </Tag>
      ),
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status: string) => {
        if (status === 'pending_approval')
          return (
            <Tag color="gold" className="flex items-center gap-1 w-fit text-[11px]">
              <Clock size={12} /> Chờ duyệt
            </Tag>
          );
        if (status === 'approved')
          return (
            <Tag color="cyan" className="flex items-center gap-1 w-fit text-[11px]">
              <CheckCircle size={12} /> Đã duyệt
            </Tag>
          );
        if (status === 'published')
          return (
            <Tag color="success" className="flex items-center gap-1 w-fit text-[11px]">
              <CheckCircle size={12} /> Đã Đăng
            </Tag>
          );
        if (status === 'scheduled')
          return (
            <Tag color="processing" className="flex items-center gap-1 w-fit text-[11px]">
              <Clock size={12} /> Chờ Đăng
            </Tag>
          );
        if (status === 'archived')
          return (
            <Tag color="warning" className="flex items-center gap-1 w-fit text-[11px]">
              <Archive size={12} /> Lưu Trữ
            </Tag>
          );
        if (status === 'failed')
          return (
            <Tag color="error" className="flex items-center gap-1 w-fit text-[11px]">
              <AlertCircle size={12} /> Lỗi Đăng
            </Tag>
          );
        return <Tag color="default" className="text-[11px]">Bản Nháp</Tag>;
      },
    },
    {
      title: 'Thời Gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (val: string, record: any) => (
        <span className="text-[11px] text-[var(--color-muted-fg)] font-mono">
          {new Date(record.publishedAt || record.scheduledAt || val).toLocaleString('vi-VN')}
        </span>
      ),
    },
    {
      title: 'Thao Tác',
      key: 'actions',
      width: 160,
      render: (_: any, record: any) => (
        <div className="flex items-center gap-1.5">
          {record.status === 'archived' ? (
            <Tooltip title="Khôi phục bài viết">
              <Button
                type="text"
                size="small"
                icon={<RotateCcw size={14} className="text-indigo-500" />}
                loading={restorePostMutation.isPending}
                onClick={async () => {
                  await restorePostMutation.mutateAsync(record.id);
                  postsQuery.refetch();
                }}
              />
            </Tooltip>
          ) : (
            <>
              {record.status === 'pending_approval' && (
                <>
                  <Tooltip title="Duyệt bài viết & Đăng">
                    <Button
                      type="text"
                      size="small"
                      icon={<CheckSquare size={14} className="text-emerald-600" />}
                      onClick={() => onOpenReview(record)}
                    />
                  </Tooltip>
                  <Tooltip title="Yêu cầu AI tạo lại bài">
                    <Button
                      type="text"
                      size="small"
                      icon={<Sparkles size={14} className="text-purple-600" />}
                      onClick={() => onOpenRegenerate(record)}
                    />
                  </Tooltip>
                </>
              )}
              {record.status !== 'published' && record.status !== 'pending_approval' && (
                <Tooltip title="Đăng ngay lên Facebook">
                  <Button
                    type="text"
                    size="small"
                    icon={<Send size={14} className="text-emerald-500" />}
                    loading={publishPostMutation.isPending}
                    onClick={async () => {
                      await publishPostMutation.mutateAsync(record.id);
                      postsQuery.refetch();
                    }}
                  />
                </Tooltip>
              )}
              {record.externalPostId && (
                <Tooltip title="Xem bài viết trên Facebook">
                  <Button
                    type="text"
                    size="small"
                    icon={<ExternalLink size={14} className="text-blue-500" />}
                    onClick={() =>
                      window.open(`https://facebook.com/${record.externalPostId}`, '_blank')
                    }
                  />
                </Tooltip>
              )}
              <Tooltip title="Đưa vào lưu trữ (Xoá mềm)">
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<Trash2 size={14} />}
                  onClick={() => {
                    Modal.confirm({
                      title: 'Xác nhận đưa vào lưu trữ (Xoá mềm)',
                      content:
                        'Bài viết sẽ được đưa vào mục Lưu Trữ và tự động xoá vĩnh viễn sau 30 ngày nếu không khôi phục.',
                      okText: 'Đưa Vào Lưu Trữ',
                      okType: 'danger',
                      cancelText: 'Hủy',
                      onOk: async () => {
                        await deletePostMutation.mutateAsync(record.id);
                        postsQuery.refetch();
                      },
                    });
                  }}
                />
              </Tooltip>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <Card className="rounded-2xl shadow-sm border border-[var(--color-border)] mt-2">
      {/* Top Filter Tabs Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-3 border-b border-[var(--color-border)]">
        <Radio.Group
          value={filterKey}
          onChange={(e) => setFilterKey(e.target.value)}
          buttonStyle="solid"
          size="middle"
          className="custom-radio-group"
        >
          <Radio.Button value="all">Tất Cả ({filterKey === 'all' ? postsList.length : '—'})</Radio.Button>
          <Radio.Button value="pending_approval">
            🤖 Đề Xuất Agent ({filterKey === 'pending_approval' ? postsList.length : '—'})
          </Radio.Button>
          <Radio.Button value="published">
            🟢 Đã Đăng ({filterKey === 'published' ? postsList.length : '—'})
          </Radio.Button>
          <Radio.Button value="archived">
            📦 Lưu Trữ ({filterKey === 'archived' ? postsList.length : '—'})
          </Radio.Button>
        </Radio.Group>

        <Button
          size="small"
          icon={<RefreshCw size={12} />}
          onClick={() => postsQuery.refetch()}
          className="rounded-lg text-xs self-end sm:self-auto"
        >
          Làm Mới
        </Button>
      </div>

      <Table
        dataSource={postsList}
        columns={columns}
        rowKey="id"
        loading={postsQuery.isLoading}
        pagination={{ pageSize: 8 }}
        size="small"
        className="rounded-xl overflow-hidden text-xs"
      />
    </Card>
  );
}
