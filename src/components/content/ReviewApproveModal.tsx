'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, Tag, DatePicker, message } from 'antd';
import {
  CheckCircle,
  Send,
  Sparkles,
  ExternalLink,
  Bot,
  Calendar,
} from 'lucide-react';
import { useApproveSocialPost } from '@/hooks/api/useMessagingConfig';

const { TextArea } = Input;

interface ReviewApproveModalProps {
  post: any | null;
  onClose: () => void;
  onRegenerate: (post: any) => void;
  onSuccess?: () => void;
}

export default function ReviewApproveModal({
  post,
  onClose,
  onRegenerate,
  onSuccess,
}: ReviewApproveModalProps) {
  const approveMutation = useApproveSocialPost();

  const [editedTitle, setEditedTitle] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [scheduleDate, setScheduleDate] = useState<any>(null);

  useEffect(() => {
    if (post) {
      setEditedTitle(post.title || '');
      setEditedContent(post.content || '');
      setScheduleDate(post.scheduledAt ? new Date(post.scheduledAt) : null);
    }
  }, [post]);

  if (!post) return null;

  const handleApprove = async (action: 'approve' | 'approve_and_publish') => {
    if (!editedContent.trim()) {
      message.warning('Nội dung bài viết không được để trống');
      return;
    }
    try {
      await approveMutation.mutateAsync({
        id: post.id,
        payload: {
          action,
          editedTitle: editedTitle !== post.title ? editedTitle : undefined,
          editedContent: editedContent !== post.content ? editedContent : undefined,
          scheduledAt: scheduleDate ? scheduleDate.toISOString() : undefined,
        },
      });

      message.success(
        action === 'approve_and_publish'
          ? 'Đã duyệt và đăng bài viết thành công lên Facebook'
          : 'Đã duyệt bài viết thành công'
      );
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      message.error(err.message || 'Lỗi khi duyệt bài viết');
    }
  };

  return (
    <Modal
      open={!!post}
      onCancel={onClose}
      width={720}
      footer={null}
      title={
        <div className="flex items-center gap-2 text-sm font-semibold text-[var(--color-fg)]">
          <Bot className="w-5 h-5 text-purple-600" />
          <span>Duyệt Bài Viết Đề Xuất Từ Hermes AI</span>
        </div>
      }
      className="review-approve-modal"
    >
      <div className="space-y-4 py-3">
        {/* Metadata Badges Header */}
        <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50 rounded-xl p-3 space-y-2">
          <div className="text-[11px] font-semibold text-purple-800 dark:text-purple-300 uppercase tracking-wider">
            Thông Tin Chiến Lược & Định Hướng
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            {post.topicCategory && (
              <Tag color="purple" className="text-xs rounded-md">
                📌 Chủ đề: {post.topicCategory}
              </Tag>
            )}
            {post.targetAudience && (
              <Tag color="cyan" className="text-xs rounded-md">
                🎯 Đối tượng: {post.targetAudience}
              </Tag>
            )}
            {post.contentPillar && (
              <Tag color="geekblue" className="text-xs rounded-md">
                📊 Pillar: {post.contentPillar}
              </Tag>
            )}
            {post.copywritingFramework && (
              <Tag color="magenta" className="text-xs rounded-md">
                ✍️ Framework: {post.copywritingFramework}
              </Tag>
            )}
          </div>
        </div>

        {/* Editable Title */}
        <div>
          <label className="block text-xs font-semibold text-[var(--color-fg)] mb-1">
            Tiêu Đề Bài Viết (Có thể chỉnh sửa)
          </label>
          <Input
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            className="rounded-xl text-xs font-medium"
            placeholder="Nhập tiêu đề..."
          />
        </div>

        {/* Editable Content */}
        <div>
          <label className="block text-xs font-semibold text-[var(--color-fg)] mb-1 flex items-center justify-between">
            <span>Nội Dung Bài Viết (Có thể chỉnh sửa)</span>
            <span className="text-[11px] text-[var(--color-muted-fg)]">
              {editedContent.length} ký tự
            </span>
          </label>
          <TextArea
            rows={8}
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="rounded-xl text-xs font-sans p-3"
            placeholder="Nhập nội dung bài viết..."
          />
        </div>

        {/* Hashtags */}
        {post.hashtags && post.hashtags.length > 0 && (
          <div>
            <label className="block text-[11px] font-medium text-[var(--color-muted-fg)] mb-1">
              Hashtags đề xuất
            </label>
            <div className="flex flex-wrap gap-1.5">
              {post.hashtags.map((tag: string, idx: number) => (
                <Tag key={idx} color="geekblue" className="text-xs font-mono rounded-md">
                  {tag}
                </Tag>
              ))}
            </div>
          </div>
        )}

        {/* Sources Reference */}
        {post.sources && post.sources.length > 0 && (
          <div className="border border-[var(--color-border)] rounded-xl p-3 space-y-1.5 bg-[var(--color-bg-subtle)]">
            <label className="block text-xs font-semibold text-[var(--color-fg)]">
              📎 Nguồn Tài Liệu Tham Khảo ({post.sources.length} nguồn):
            </label>
            <div className="space-y-1 text-xs">
              {post.sources.map((s: any, idx: number) => (
                <div key={idx} className="flex items-center gap-1.5 text-[11px] text-[var(--color-muted-fg)]">
                  <span>•</span>
                  <span className="font-medium text-[var(--color-fg)]">{s.title || 'Nguồn tin tức'}:</span>
                  {s.url ? (
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-500 hover:underline flex items-center gap-0.5 truncate max-w-md"
                    >
                      {s.url} <ExternalLink size={10} />
                    </a>
                  ) : (
                    <span>Tài liệu nội bộ Studio</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Schedule DatePicker */}
        <div>
          <label className="block text-xs font-semibold text-[var(--color-fg)] mb-1">
            Lên Lịch Đăng Bài (Tùy chọn)
          </label>
          <DatePicker
            showTime
            value={scheduleDate}
            onChange={(d) => setScheduleDate(d)}
            placeholder="Chọn ngày giờ xuất bản tự động..."
            className="w-full rounded-xl text-xs"
          />
        </div>

        {/* Modal Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[var(--color-border)]">
          <Button
            danger
            icon={<Sparkles size={14} />}
            onClick={() => onRegenerate(post)}
            className="rounded-xl text-xs"
          >
            Yêu Cầu AI Tạo Lại
          </Button>

          <div className="flex items-center gap-2">
            <Button onClick={onClose} className="rounded-xl text-xs">
              Đóng
            </Button>
            <Button
              icon={<CheckCircle size={14} />}
              loading={approveMutation.isPending}
              onClick={() => handleApprove('approve')}
              className="rounded-xl text-xs"
            >
              Chỉ Duyệt (Lưu Nháp)
            </Button>
            <Button
              type="primary"
              icon={<Send size={14} />}
              loading={approveMutation.isPending}
              onClick={() => handleApprove('approve_and_publish')}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-medium"
            >
              Duyệt & Đăng Ngay
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
