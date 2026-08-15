'use client';

import React, { useState, useEffect } from 'react';
import { Button, Tag, Progress, Input, Form, message } from 'antd';
import { CheckCircle2, XCircle, Edit3, Sparkles, Clock, User, Phone, Mail, Building, AlertTriangle } from 'lucide-react';
import { useApproveDraftLead, useRejectDraftLead, useUpdateDraftLead } from '@/hooks/api/useConversation';

interface DraftLeadCardProps {
  draft: any;
  conversationId: number;
}

export default function DraftLeadCard({ draft, conversationId }: DraftLeadCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [form] = Form.useForm();

  const approveMutation = useApproveDraftLead(conversationId);
  const rejectMutation = useRejectDraftLead(conversationId);
  const updateMutation = useUpdateDraftLead(conversationId);

  // Realtime countdown timer
  useEffect(() => {
    if (!draft?.autoApproveAt) return;

    const interval = setInterval(() => {
      const target = new Date(draft.autoApproveAt).getTime();
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft('Đang tự động duyệt...');
        clearInterval(interval);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [draft?.autoApproveAt]);

  const handleApprove = async () => {
    try {
      await approveMutation.mutateAsync({ draftId: draft.id });
      message.success('Đã duyệt Lead thành công!');
    } catch (e) {
      message.error('Không thể duyệt Lead');
    }
  };

  const handleReject = async () => {
    try {
      await rejectMutation.mutateAsync(draft.id);
      message.info('Đã từ chối Draft Lead');
    } catch (e) {
      message.error('Không thể từ chối');
    }
  };

  const handleSaveEdit = async (values: any) => {
    try {
      await updateMutation.mutateAsync({
        draftId: draft.id,
        updates: values,
      });
      message.success('Đã cập nhật thông tin Draft Lead!');
      setIsEditing(false);
    } catch (e) {
      message.error('Cập nhật thất bại');
    }
  };

  const confidencePct = Math.round((draft.aiScore || draft.aiConfidence || 0.8) * 100);

  return (
    <div className="bg-amber-500/5 border border-amber-500/30 rounded-xl p-4 space-y-3 shadow-sm relative overflow-hidden">
      {/* Returning Rejected Lead Warning Banner */}
      {draft.previousLead && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-2.5 text-xs text-amber-500 space-y-1">
          <div className="flex items-center gap-1.5 font-bold">
            <AlertTriangle size={14} />
            <span>KHÁCH HÀNG ĐÃ TỪNG BỊ TỪ CHỐI</span>
          </div>
          <p className="text-[11px] text-[var(--color-muted-fg)]">
            Lần trước từ chối: {new Date(draft.previousLead.draftReviewedAt || draft.previousLead.createdAt).toLocaleDateString('vi-VN')}
          </p>
        </div>
      )}

      {/* Header Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-mono text-[10px] font-bold uppercase tracking-wider">
          <Sparkles size={13} />
          <span>Hồ Sơ Lead Dự Thảo (AI)</span>
        </div>
        <Tag color="gold" className="rounded-full text-[10px] border-none font-semibold">
          Chờ Duyệt
        </Tag>
      </div>

      {!isEditing ? (
        <>
          {/* Main Info */}
          <div className="space-y-1.5 text-xs text-[var(--color-fg)] bg-[var(--color-surface)]/60 p-3 rounded-lg border border-[var(--color-border)]/50">
            <div className="flex items-center gap-2">
              <User size={13} className="text-[var(--color-muted-fg)] shrink-0" />
              <span className="font-bold truncate">{draft.name}</span>
            </div>
            {draft.phone && (
              <div className="flex items-center gap-2">
                <Phone size={13} className="text-[var(--color-muted-fg)] shrink-0" />
                <span className="font-mono">{draft.phone}</span>
              </div>
            )}
            {draft.email && (
              <div className="flex items-center gap-2">
                <Mail size={13} className="text-[var(--color-muted-fg)] shrink-0" />
                <span className="font-mono text-[11px] truncate">{draft.email}</span>
              </div>
            )}
            {draft.companyName && (
              <div className="flex items-center gap-2">
                <Building size={13} className="text-[var(--color-muted-fg)] shrink-0" />
                <span>{draft.companyName}</span>
              </div>
            )}
            {draft.need && (
              <div className="pt-1.5 border-t border-[var(--color-border)]/40 text-[11px] text-[var(--color-muted-fg)]">
                <span className="font-semibold text-[var(--color-fg)]">Nhu cầu:</span> {draft.need}
              </div>
            )}
          </div>

          {/* AI Confidence Meter */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-mono text-[var(--color-muted-fg)]">
              <span>Độ tin cậy AI:</span>
              <span className="font-bold text-amber-500">{confidencePct}%</span>
            </div>
            <Progress
              percent={confidencePct}
              showInfo={false}
              size="small"
              strokeColor={confidencePct > 80 ? '#10b981' : confidencePct > 60 ? '#f59e0b' : '#ef4444'}
            />
          </div>

          {/* Realtime Countdown */}
          {draft.autoApproveAt && (
            <div className="flex items-center justify-between text-[10px] font-mono text-[var(--color-muted-fg)] bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
              <span className="flex items-center gap-1">
                <Clock size={12} /> Tự động duyệt sau:
              </span>
              <span className="font-bold text-amber-600 dark:text-amber-400">{timeLeft || '---'}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-1.5 pt-1">
            <Button
              type="primary"
              size="small"
              icon={<CheckCircle2 size={13} />}
              onClick={handleApprove}
              loading={approveMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700 border-none rounded-lg text-xs h-8 cursor-pointer px-1 text-center font-medium"
            >
              Duyệt
            </Button>
            <Button
              size="small"
              icon={<Edit3 size={13} />}
              onClick={() => {
                form.setFieldsValue({
                  name: draft.name,
                  phone: draft.phone,
                  email: draft.email,
                  companyName: draft.companyName,
                  need: draft.need,
                });
                setIsEditing(true);
              }}
              className="rounded-lg text-xs h-8 cursor-pointer px-1 text-center font-medium"
            >
              Sửa
            </Button>
            <Button
              danger
              size="small"
              icon={<XCircle size={13} />}
              onClick={handleReject}
              loading={rejectMutation.isPending}
              className="rounded-lg text-xs h-8 cursor-pointer px-1 text-center font-medium"
            >
              Bỏ Qua
            </Button>
          </div>
        </>
      ) : (
        /* Edit Form */
        <Form form={form} layout="vertical" onFinish={handleSaveEdit} className="space-y-2 pt-1">
          <Form.Item name="name" label={<span className="text-[10px] uppercase font-mono">Tên Khách</span>} rules={[{ required: true }]} className="mb-1">
            <Input size="small" className="rounded-lg text-xs" />
          </Form.Item>
          <Form.Item name="phone" label={<span className="text-[10px] uppercase font-mono">Số Điện Thoại</span>} className="mb-1">
            <Input size="small" className="rounded-lg text-xs" />
          </Form.Item>
          <Form.Item name="email" label={<span className="text-[10px] uppercase font-mono">Email</span>} className="mb-1">
            <Input size="small" className="rounded-lg text-xs" />
          </Form.Item>
          <Form.Item name="companyName" label={<span className="text-[10px] uppercase font-mono">Công Ty</span>} className="mb-1">
            <Input size="small" className="rounded-lg text-xs" />
          </Form.Item>
          <Form.Item name="need" label={<span className="text-[10px] uppercase font-mono">Nhu Cầu</span>} className="mb-2">
            <Input.TextArea rows={2} size="small" className="rounded-lg text-xs" />
          </Form.Item>
          <div className="flex gap-2">
            <Button size="small" onClick={() => setIsEditing(false)} className="flex-1 rounded-lg text-xs cursor-pointer">
              Hủy
            </Button>
            <Button type="primary" size="small" htmlType="submit" loading={updateMutation.isPending} className="flex-1 rounded-lg text-xs cursor-pointer">
              Lưu Thay Đổi
            </Button>
          </div>
        </Form>
      )}
    </div>
  );
}
