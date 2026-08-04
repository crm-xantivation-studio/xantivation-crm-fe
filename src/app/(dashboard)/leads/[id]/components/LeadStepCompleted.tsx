'use client';

import React from 'react';
import { Button } from 'antd';
import { CheckCircle2, Lock, ExternalLink, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface LeadStepCompletedProps {
  lead: any;
}

export function LeadStepCompleted({ lead }: LeadStepCompletedProps) {
  return (
    <div className="space-y-6 text-center py-6">
      {/* Success Badge */}
      <div className="flex flex-col items-center justify-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center border border-green-500/30 shadow-sm">
          <CheckCircle2 size={36} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-[var(--color-fg)]">
            Đã chuyển đổi Lead thành công!
          </h3>
          <p className="text-xs text-[var(--color-muted-fg)] mt-1">
            Đầu mối {lead.firstName} {lead.lastName} đã hoàn tất quy trình phễu và tạo Hồ sơ Khách hàng.
          </p>
        </div>
      </div>

      {/* Locked Notice (flow.md section 3.3) */}
      <div className="max-w-md mx-auto p-4 bg-purple-500/5 border border-purple-500/20 rounded-2xl flex items-center gap-3 text-left">
        <Lock size={20} className="text-purple-500 shrink-0" />
        <p className="text-xs text-purple-700 dark:text-purple-300">
          Theo quy tắc nghiệp vụ (Mục 3.3 flow.md), Lead ở trạng thái <strong>CONVERTED</strong> bị khóa dữ liệu toàn bộ ở chế độ Read-Only để đảm bảo tính toàn vẹn báo cáo KPI.
        </p>
      </div>

      {/* Direct Links to Created Assets */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
        <Link href="/customers">
          <Button type="primary" className="flex items-center gap-2 h-10 px-6 rounded-xl cursor-pointer bg-[var(--color-accent)]">
            <span>Đến danh sách Khách hàng</span>
            <ExternalLink size={14} />
          </Button>
        </Link>

        <Link href="/opportunities">
          <Button className="flex items-center gap-2 h-10 px-6 rounded-xl cursor-pointer">
            <span>Đến Cơ hội Kinh doanh</span>
            <ArrowRight size={14} />
          </Button>
        </Link>
      </div>
    </div>
  );
}
