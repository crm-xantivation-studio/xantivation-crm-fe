'use client';

import React, { useState, useEffect } from 'react';
import { Drawer, Input, Button, Tag, Space, Divider, message } from 'antd';
import {
  FileText,
  CheckCircle,
  Send,
  RefreshCw,
  Trash2,
  Sparkles,
  Hash,
  Share2,
  Copy,
} from 'lucide-react';

const { TextArea } = Input;

export interface GeneratedPostData {
  postId?: string;
  title: string;
  content: string;
  hashtags?: string[];
  platform?: string;
  durationMs?: number;
  copywritingFramework?: string;
  visualPrompt?: string;
  targetAudience?: string;
  estimatedReadingTime?: string;
}

interface ExecutionResultDrawerProps {
  open: boolean;
  onClose: () => void;
  postData: GeneratedPostData | null;
  onApprove: (action: 'approve' | 'approve_and_publish', edits?: { title: string; content: string }) => Promise<void>;
  onRegenerate: (feedback: string) => Promise<void>;
  onDiscard?: () => Promise<void>;
  isLoading?: boolean;
}

export function ExecutionResultDrawer({
  open,
  onClose,
  postData,
  onApprove,
  onRegenerate,
  onDiscard,
  isLoading = false,
}: ExecutionResultDrawerProps) {
  const [editedTitle, setEditedTitle] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (postData) {
      setEditedTitle(postData.title || '');
      setEditedContent(postData.content || '');
      setFeedback('');
    }
  }, [postData]);

  if (!postData) return null;

  const handleCopy = () => {
    const fullText = `${editedTitle}\n\n${editedContent}\n\n${(postData.hashtags || []).join(' ')}`;
    navigator.clipboard.writeText(fullText);
    message.success('Đã sao chép nội dung bài viết vào Clipboard');
  };

  const handleApproveAction = async (action: 'approve' | 'approve_and_publish') => {
    try {
      setIsSubmitting(true);
      await onApprove(action, {
        title: editedTitle,
        content: editedContent,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegenerateAction = async () => {
    try {
      setIsSubmitting(true);
      await onRegenerate(feedback);
      setFeedback('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const wordCount = editedContent.split(/\s+/).filter(Boolean).length;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={560}
      title={
        <div className="flex items-center justify-between w-full pr-4">
          <div className="flex items-center gap-2 text-sm font-bold text-[var(--color-fg)]">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>Nội Dung Bài Viết Tạo Bởi Hermes AI</span>
          </div>
          <Button
            size="small"
            icon={<Copy size={12} />}
            onClick={handleCopy}
            className="rounded-lg text-xs"
          >
            Sao Chép
          </Button>
        </div>
      }
      className="execution-result-drawer"
    >
      <div className="space-y-3.5 text-xs pb-10">
        {/* Post Metadata Summary */}
        <div className="flex items-center justify-between rounded-xl bg-neutral-900/70 border border-neutral-800 p-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Tag color="purple" className="rounded-md">
              Hermes AI
            </Tag>
            <Tag color="cyan" className="rounded-md font-semibold">
              {postData.copywritingFramework ? `${postData.copywritingFramework} Framework` : 'PAS Framework'}
            </Tag>
            <Tag color="blue" className="rounded-md">
              {postData.platform || 'Facebook Post'}
            </Tag>
          </div>
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span className="text-neutral-400">📝 {wordCount} từ</span>
            {postData.durationMs && (
              <span className="text-emerald-400">
                ⏱️ {(postData.durationMs / 1000).toFixed(1)}s
              </span>
            )}
          </div>
        </div>

        {/* Visual Prompt Suggestion (if available) */}
        {postData.visualPrompt && (
          <div className="rounded-xl bg-cyan-950/20 border border-cyan-500/30 p-2.5 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-cyan-400 text-[11px]">
              <Sparkles size={12} />
              <span>Gợi ý Visual / Infographic cho Designer:</span>
            </div>
            <p className="text-neutral-300 text-xs italic leading-relaxed">{postData.visualPrompt}</p>
          </div>
        )}

        {/* Title Input */}
        <div>
          <label className="block mb-1 font-semibold text-neutral-300">
            Tiêu đề bài viết:
          </label>
          <Input
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            className="!bg-neutral-950 !border-neutral-800 !text-neutral-100 font-bold rounded-xl text-xs"
          />
        </div>

        {/* Content TextArea */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="font-semibold text-neutral-300">
              Nội dung truyền thông (Có thể chỉnh sửa trực tiếp):
            </label>
            <span className="text-[10px] text-neutral-500">{wordCount} từ | {editedContent.length} ký tự</span>
          </div>
          <TextArea
            rows={11}
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="!bg-neutral-950 !border-neutral-800 !text-neutral-100 rounded-xl font-sans leading-relaxed text-xs"
          />
        </div>

        {/* Hashtags */}
        {postData.hashtags && postData.hashtags.length > 0 && (
          <div>
            <label className="flex items-center gap-1 mb-1 font-semibold text-neutral-400">
              <Hash size={12} />
              Hashtags:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {postData.hashtags.map((tag, idx) => (
                <Tag
                  key={idx}
                  className="bg-neutral-900 border-neutral-800 text-indigo-400 rounded-lg text-xs"
                >
                  {tag}
                </Tag>
              ))}
            </div>
          </div>
        )}

        <Divider className="!border-neutral-800" />

        {/* Revision / Feedback Section */}
        <div className="rounded-xl bg-neutral-900/50 border border-neutral-800/80 p-3 space-y-2">
          <label className="flex items-center gap-1.5 font-semibold text-neutral-300">
            <RefreshCw size={13} className="text-amber-400" />
            Yêu cầu Hermes viết lại với chỉnh sửa (Feedback):
          </label>
          <TextArea
            rows={2}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="VD: Viết ngắn hơn 20%, bổ sung lời kêu gọi hành động (CTA) liên hệ demo..."
            className="!bg-neutral-950 !border-neutral-800 !text-neutral-100 rounded-xl"
          />
          <Button
            icon={<RefreshCw size={13} />}
            onClick={handleRegenerateAction}
            loading={isSubmitting || isLoading}
            disabled={!feedback.trim()}
            className="w-full bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border-neutral-700 rounded-xl font-semibold text-xs"
          >
            Yêu Cầu Hermes Sáng Tạo Lại
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <Button
            type="primary"
            icon={<CheckCircle size={15} />}
            onClick={() => handleApproveAction('approve')}
            loading={isSubmitting || isLoading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold h-10 text-sm"
          >
            Duyệt & Lưu Vào Danh Sách Nháp (Draft)
          </Button>

          <Button
            type="primary"
            icon={<Send size={15} />}
            onClick={() => handleApproveAction('approve_and_publish')}
            loading={isSubmitting || isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold h-10 text-sm"
          >
            Duyệt & Đăng Trực Tiếp Lên Facebook
          </Button>

          {onDiscard && (
            <Button
              danger
              icon={<Trash2 size={14} />}
              onClick={onDiscard}
              className="w-full rounded-xl"
            >
              Hủy Bỏ Bản Thảo Này
            </Button>
          )}
        </div>
      </div>
    </Drawer>
  );
}
