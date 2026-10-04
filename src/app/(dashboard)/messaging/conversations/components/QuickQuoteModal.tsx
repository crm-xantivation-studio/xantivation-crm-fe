'use client';

import React, { useState } from 'react';
import { Modal, Form, Input, InputNumber, Button, message } from 'antd';
import { Plus, Trash2, Sparkles, FileText } from 'lucide-react';
import { useCreateQuickQuote, useSuggestQuickQuote } from '@/hooks/api/useConversation';
import { formatVND } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface QuickQuoteModalProps {
  visible: boolean;
  onClose: () => void;
  conversationId: number;
  matchedProfile?: any;
}

export default function QuickQuoteModal({ visible, onClose, conversationId, matchedProfile }: QuickQuoteModalProps) {
  const [items, setItems] = useState<Array<{ productName: string; quantity: number; unitPrice: number }>>([
    { productName: 'Gói Giải Pháp CRM Cloud', quantity: 1, unitPrice: 12000000 },
  ]);

  const router = useRouter();
  const createQuoteMutation = useCreateQuickQuote(conversationId);
  const suggestQuoteMutation = useSuggestQuickQuote(conversationId);

  const handleAddItem = () => {
    setItems([...items, { productName: '', quantity: 1, unitPrice: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    setItems(newItems);
  };

  const handleAISuggest = async () => {
    try {
      const res = await suggestQuoteMutation.mutateAsync();
      const suggestedItems = res?.data?.items;
      if (suggestedItems && Array.isArray(suggestedItems) && suggestedItems.length > 0) {
        setItems(suggestedItems);
        message.success('AI đã gợi ý danh sách sản phẩm từ nội dung chat!');
      } else {
        message.info('AI chưa tìm thấy chi tiết báo giá cụ thể trong đoạn chat.');
      }
    } catch (e) {
      message.error('Không thể lấy gợi ý AI');
    }
  };

  const grandTotal = items.reduce((sum, item) => sum + (item.quantity || 1) * (item.unitPrice || 0), 0);

  const handleSubmit = async () => {
    if (items.some((i) => !i.productName.trim())) {
      message.error('Vui lòng điền tên sản phẩm / dịch vụ');
      return;
    }

    try {
      const leadId = matchedProfile?.type === 'lead' ? matchedProfile.profile?.id : undefined;
      const customerId = matchedProfile?.type === 'customer' ? matchedProfile.profile?.id : undefined;

      const res = await createQuoteMutation.mutateAsync({
        leadId,
        customerId,
        items,
      });

      message.success('Tạo báo giá nhanh thành công!');
      onClose();
      if (res?.data?.id) {
        router.push(`/quotations`);
      }
    } catch (e) {
      message.error('Tạo báo giá thất bại');
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-sm font-bold">
          <FileText size={16} className="text-indigo-500" />
          <span>Tạo Báo Giá Nhanh Từ Conversation #{conversationId}</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose} className="rounded-xl text-xs">
          Hủy
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleSubmit}
          loading={createQuoteMutation.isPending}
          className="rounded-xl text-xs bg-indigo-600 hover:bg-indigo-700 cursor-pointer"
        >
          Tạo Báo Giá
        </Button>,
      ]}
      className="rounded-[5px]"
      width={560}
    >
      <div className="space-y-4 my-3 text-xs">
        {/* Customer Context */}
        {matchedProfile?.profile && (
          <div className="bg-[var(--color-surface)]/60 p-3 rounded-xl border border-[var(--color-border)] flex items-center justify-between">
            <span className="text-[var(--color-muted-fg)]">Khách Hàng Nguồn:</span>
            <span className="font-bold text-[var(--color-fg)]">
              {matchedProfile.profile.name || matchedProfile.profile.companyName}
            </span>
          </div>
        )}

        {/* AI Suggest Button */}
        <div className="flex justify-end">
          <Button
            type="dashed"
            size="small"
            icon={<Sparkles size={13} className="text-amber-500" />}
            onClick={handleAISuggest}
            loading={suggestQuoteMutation.isPending}
            className="rounded-lg text-xs cursor-pointer border-amber-500/40 text-amber-600 dark:text-amber-400 hover:border-amber-500"
          >
            AI Gợi Ý Từ Nội Dung Chat
          </Button>
        </div>

        {/* Items List */}
        <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 bg-[var(--color-surface)] p-2.5 rounded-xl border border-[var(--color-border)]">
              <Input
                placeholder="Tên sản phẩm / dịch vụ"
                value={item.productName}
                onChange={(e) => handleItemChange(idx, 'productName', e.target.value)}
                className="flex-1 text-xs rounded-lg"
              />
              <InputNumber
                min={1}
                placeholder="SL"
                value={item.quantity}
                onChange={(val) => handleItemChange(idx, 'quantity', val || 1)}
                className="w-16 text-xs rounded-lg"
              />
              <InputNumber
                min={0}
                step={500000}
                placeholder="Đơn giá"
                value={item.unitPrice}
                formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                onChange={(val) => handleItemChange(idx, 'unitPrice', val || 0)}
                className="w-32 text-xs rounded-lg"
              />
              <Button
                type="text"
                danger
                icon={<Trash2 size={14} />}
                onClick={() => handleRemoveItem(idx)}
                disabled={items.length <= 1}
                className="shrink-0"
              />
            </div>
          ))}
        </div>

        <Button
          type="dashed"
          block
          icon={<Plus size={14} />}
          onClick={handleAddItem}
          className="rounded-xl text-xs"
        >
          Thêm Sản Phẩm / Dịch Vụ
        </Button>

        {/* Grand Total */}
        <div className="border-t border-[var(--color-border)] pt-3 flex justify-between items-center text-sm font-bold">
          <span>Tổng Cộng:</span>
          <span className="text-indigo-600 dark:text-indigo-400 font-mono text-base">
            {formatVND(grandTotal)}
          </span>
        </div>
      </div>
    </Modal>
  );
}
