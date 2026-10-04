'use client';

import React, { useState } from 'react';
import { Modal, Button, Input, Checkbox, message } from 'antd';
import { Sparkles, RotateCcw } from 'lucide-react';
import { useRegenerateSocialPost } from '@/hooks/api/useMessagingConfig';

const { TextArea } = Input;

interface RegenerateModalProps {
  post: any | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function RegenerateModal({
  post,
  onClose,
  onSuccess,
}: RegenerateModalProps) {
  const regenerateMutation = useRegenerateSocialPost();
  const [feedback, setFeedback] = useState('');
  const [keepTopicCategory, setKeepTopicCategory] = useState(true);

  if (!post) return null;

  const handleRegenerate = async () => {
    try {
      await regenerateMutation.mutateAsync({
        id: post.id,
        payload: {
          feedback: feedback.trim() || undefined,
          keepTopicCategory,
        },
      });

      message.success('Đã gửi yêu cầu tạo lại bài viết tới Hermes AI');
      setFeedback('');
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      message.error(err.message || 'Lỗi khi gửi yêu cầu tạo lại bài');
    }
  };

  return (
    <Modal
      open={!!post}
      onCancel={onClose}
      width={520}
      footer={null}
      title={
        <div className="flex items-center gap-2 text-sm font-semibold text-[var(--color-fg)]">
          <RotateCcw className="w-4 h-4 text-purple-600" />
          <span>Yêu Cầu Hermes AI Tạo Lại Bài Viết</span>
        </div>
      }
      className="regenerate-modal"
    >
      <div className="space-y-4 py-3">
        <div className="text-xs text-[var(--color-muted-fg)] leading-relaxed">
          Bài viết hiện tại sẽ được lưu trữ và Hermes AI sẽ tự động sinh một bài viết mới với các điều chỉnh theo phản hồi của bạn.
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--color-fg)] mb-1">
            Góp Ý / Hướng Dẫn Điều Chỉnh Cho Agent:
          </label>
          <TextArea
            rows={4}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Ví dụ: Bài viết cần ngắn gọn hơn, tập trung vào giải pháp CRM đa kênh và tối ưu chi phí cho startup..."
            className="rounded-xl text-xs font-sans p-3"
          />
        </div>

        <div className="pt-1">
          <Checkbox
            checked={keepTopicCategory}
            onChange={(e) => setKeepTopicCategory(e.target.checked)}
            className="text-xs text-[var(--color-fg)]"
          >
            Giữ nguyên chủ đề hiện tại ({post.topicCategory || 'Mặc định'})
          </Checkbox>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--color-border)]">
          <Button onClick={onClose} className="rounded-xl text-xs">
            Hủy Bỏ
          </Button>
          <Button
            type="primary"
            icon={<Sparkles size={14} />}
            loading={regenerateMutation.isPending}
            onClick={handleRegenerate}
            className="rounded-xl bg-purple-600 hover:bg-purple-700 text-xs font-medium"
          >
            Gửi Yêu Cầu Tạo Lại
          </Button>
        </div>
      </div>
    </Modal>
  );
}
