'use client';

import React, { useState } from 'react';
import { Button, Select, Progress, Modal, message } from 'antd';
import { Bot, Plus, ArrowRight, ShieldCheck, XCircle, MessageSquare } from 'lucide-react';
import { FloatingInput } from '@/components/FloatingInput';

interface LeadStepBantProps {
  lead: any;
  activities: any[];
  onUpdateLead: (dto: any) => Promise<any>;
  onAddActivity: (type: string, notes: string) => Promise<any>;
  onAutoQualify: () => void;
  onAdvanceToNextStep: () => void;
  isUpdating: boolean;
  isAutoQualifying: boolean;
}

export function LeadStepBant({
  lead,
  activities,
  onUpdateLead,
  onAddActivity,
  onAutoQualify,
  onAdvanceToNextStep,
  isUpdating,
  isAutoQualifying,
}: LeadStepBantProps) {
  const [budget, setBudget] = useState(String(lead.budget || ''));
  const [need, setNeed] = useState(lead.need || '');
  const [timeline, setTimeline] = useState(lead.timeline || '');
  const [authorityConfirmed, setAuthorityConfirmed] = useState(lead.bantScore >= 75 ? 'YES' : 'NO');

  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [actType, setActType] = useState<'CALL' | 'EMAIL' | 'MEETING' | 'NOTE'>('CALL');
  const [actNotes, setActNotes] = useState('');

  const handleAddAct = async () => {
    if (!actNotes.trim()) return;
    try {
      await onAddActivity(actType, actNotes);
      setActNotes('');
      setActivityModalOpen(false);
      message.success('Đã ghi nhận tương tác');
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Ghi nhận thất bại');
    }
  };

  const handleMarkQualified = async () => {
    try {
      await onUpdateLead({
        budget: Number(budget) || 0,
        need,
        timeline,
        bantScore: Math.max(lead.bantScore || 50, 75),
        status: 'QUALIFIED',
      });
      message.success('Đã xác nhận Lead Đạt chuẩn BANT');
      onAdvanceToNextStep();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Cập nhật thất bại');
    }
  };

  const handleMarkUnqualified = async () => {
    try {
      await onUpdateLead({ status: 'UNQUALIFIED' });
      message.success('Đã chuyển Lead sang Không đạt chuẩn');
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Cập nhật thất bại');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="border-b border-[var(--color-border)]/40 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-[var(--color-fg)]">
            Bước 2: Tương tác & Đánh giá Tiêu chuẩn BANT
          </h3>
          <p className="text-xs text-[var(--color-muted-fg)] mt-0.5">
            Ghi nhận lịch sử làm việc và xác minh các tham số Ngân sách, Thẩm quyền, Nhu cầu & Thời gian.
          </p>
        </div>

        <Button
          onClick={onAutoQualify}
          loading={isAutoQualifying}
          className="flex items-center gap-1.5 h-9 px-4 rounded-xl cursor-pointer border-[var(--color-accent)] text-[var(--color-accent)] shrink-0"
        >
          <Bot size={14} />
          <span>AI Auto-Qualify</span>
        </Button>
      </div>

      {/* Main Grid: Clean Flat Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* BANT Parameters Evaluation Form */}
        <div className="space-y-4">
          <h4 className="text-xs font-mono uppercase tracking-widest text-[var(--color-muted-fg)] flex items-center gap-1.5 border-b border-[var(--color-border)]/30 pb-2">
            <ShieldCheck size={14} className="text-[var(--color-accent)]" />
            <span>Tham số BANT</span>
          </h4>

          <div className="space-y-3">
            <FloatingInput label="Ngân sách dự kiến (VND)" type="number" value={budget} onChange={setBudget} />

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted-fg)]">
                Xác nhận Thẩm quyền người quyết định (Authority)
              </label>
              <Select
                value={authorityConfirmed}
                onChange={setAuthorityConfirmed}
                options={[
                  { value: 'YES', label: 'Đã xác nhận: Người quyết định trực tiếp (CEO / Founder / Director)' },
                  { value: 'NO', label: 'Chưa xác nhận / Người đại diện tìm hiểu hộ' },
                ]}
                className="w-full h-11"
              />
            </div>

            <FloatingInput label="Mô tả nhu cầu cụ thể (Need)" value={need} onChange={setNeed} />
            <FloatingInput label="Thời gian triển khai mong muốn (Timeline)" value={timeline} onChange={setTimeline} />
          </div>

          {lead.aiScore !== null && (
            <div className="pt-3 border-t border-[var(--color-border)]/30 space-y-1.5">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-[var(--color-muted-fg)]">Đánh giá từ AI:</span>
                <span className="font-bold text-[var(--color-accent)]">{lead.aiScore * 10} / 100</span>
              </div>
              <Progress percent={lead.aiScore * 10} strokeColor="#4F46E5" size="small" />
            </div>
          )}
        </div>

        {/* Activity Log Recorder */}
        <div className="space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-[var(--color-border)]/30 pb-2">
              <h4 className="text-xs font-mono uppercase tracking-widest text-[var(--color-muted-fg)] flex items-center gap-1.5">
                <MessageSquare size={14} className="text-[var(--color-accent)]" />
                <span>Nhật ký tương tác</span>
              </h4>
              <Button
                type="primary"
                size="small"
                onClick={() => setActivityModalOpen(true)}
                className="flex items-center gap-1.5 text-xs rounded-lg cursor-pointer"
              >
                <Plus size={12} />
                <span>Ghi tương tác</span>
              </Button>
            </div>

            <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
              {activities.length > 0 ? (
                activities.map((act) => (
                  <div key={act.id} className="p-3 bg-[var(--color-bg-tint)] border border-[var(--color-border)]/40 rounded-xl space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-xs text-[var(--color-accent)] font-mono">{act.type}</span>
                      <span className="text-[10px] text-[var(--color-muted-fg)] font-mono">{act.createdAt}</span>
                    </div>
                    <p className="text-xs text-[var(--color-fg)]">{act.description}</p>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-xs text-[var(--color-muted-fg)] font-mono border border-dashed border-[var(--color-border)]/40 rounded-xl">
                  Chưa có tương tác nào. Bấm "Ghi tương tác" để lưu nhật ký làm việc.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Footer Action Toolbar */}
      <div className="pt-6 border-t border-[var(--color-border)]/40 flex justify-between items-center">
        <Button
          danger
          onClick={handleMarkUnqualified}
          loading={isUpdating}
          className="flex items-center gap-1.5 h-10 px-4 rounded-xl cursor-pointer"
        >
          <XCircle size={16} />
          <span>Không đạt chuẩn (Unqualify)</span>
        </Button>

        <Button
          type="primary"
          onClick={handleMarkQualified}
          loading={isUpdating}
          className="flex items-center gap-2 h-10 px-6 rounded-xl cursor-pointer bg-green-600 hover:bg-green-700 border-none font-semibold"
        >
          <ShieldCheck size={16} />
          <span>Xác nhận Đạt chuẩn BANT (Bước 3)</span>
          <ArrowRight size={16} />
        </Button>
      </div>

      {/* Activity Modal */}
      <Modal
        title="Ghi nhận tương tác với Lead"
        open={activityModalOpen}
        onCancel={() => setActivityModalOpen(false)}
        onOk={handleAddAct}
        okText="Lưu tương tác"
        cancelText="Hủy"
      >
        <div className="space-y-4 pt-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted-fg)]">Loại tương tác</label>
            <Select
              value={actType}
              onChange={setActType}
              options={[
                { value: 'CALL', label: 'Cuộc gọi điện' },
                { value: 'EMAIL', label: 'Email trao đổi' },
                { value: 'MEETING', label: 'Cuộc họp / Demo' },
                { value: 'NOTE', label: 'Ghi chú nội bộ' },
              ]}
              className="h-10"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted-fg)]">Nội dung trao đổi</label>
            <textarea
              value={actNotes}
              onChange={(e) => setActNotes(e.target.value)}
              className="w-full h-24 p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-fg)] focus:outline-none"
              placeholder="Nhập chi tiết thông tin trao đổi..."
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
