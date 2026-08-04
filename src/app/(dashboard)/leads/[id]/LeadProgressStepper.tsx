'use client';

import React from 'react';
import { Check, XCircle } from 'lucide-react';

interface LeadProgressStepperProps {
  status: string;
  bantScore?: number;
}

const STAGES = [
  { step: 1, key: 'NEW', title: '1. Tiếp nhận Lead', subtitle: 'Thông tin cá nhân & DN' },
  { step: 2, key: 'CONTACTED', title: '2. Tương tác & BANT', subtitle: 'Nhật ký & Đánh giá BANT' },
  { step: 3, key: 'QUALIFIED', title: '3. Thiết lập Chuyển đổi', subtitle: 'Phân loại KH & Kiểm trùng' },
  { step: 4, key: 'CONVERTED', title: '4. Đã Chuyển đổi', subtitle: 'Tạo Customer & Opportunity' },
];

export function LeadProgressStepper({ status, bantScore = 0 }: LeadProgressStepperProps) {
  const getStepIndex = (currentStatus: string) => {
    switch (currentStatus) {
      case 'NEW': return 1;
      case 'CONTACTED': return 2;
      case 'QUALIFIED': return 3;
      case 'CONVERTED': return 4;
      case 'UNQUALIFIED': return -1;
      default: return 1;
    }
  };

  const currentStep = getStepIndex(status);
  const isUnqualified = status === 'UNQUALIFIED';

  return (
    <div className="bg-[var(--color-bg-tint)] border border-[var(--color-border)]/40 rounded-2xl p-5 shadow-sm space-y-5">
      {/* Header Title & Score */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[var(--color-fg)] uppercase tracking-wider font-mono">Tiến trình Phễu chuyển đổi</span>
          {isUnqualified && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-500 flex items-center gap-1 border border-red-500/20">
              <XCircle size={12} />
              Không đạt chuẩn (Unqualified)
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-[var(--color-muted-fg)] text-[11px]">BANT SCORE:</span>
          <span className={`font-bold ${bantScore >= 75 ? 'text-green-500' : bantScore >= 50 ? 'text-amber-500' : 'text-[var(--color-muted-fg)]'}`}>
            {bantScore} / 100
          </span>
        </div>
      </div>

      {/* Sleek Frameless Timeline Stepper (1 ------- 2 ------- 3 ------- 4) */}
      <div className="relative px-4 py-1">
        <div className="flex items-center justify-between w-full relative">
          
          {/* Hairline Background Connecting Line */}
          <div className="absolute top-4 left-[5%] right-[5%] h-[2px] bg-[var(--color-border)]/50 -z-0" />

          {/* Active Colored Progress Line */}
          {!isUnqualified && currentStep > 1 && (
            <div
              className="absolute top-4 left-[5%] h-[2px] bg-green-500 transition-all duration-500 -z-0"
              style={{
                width: `${((Math.min(currentStep, 4) - 1) / 3) * 90}%`,
              }}
            />
          )}

          {/* 4 Step Nodes */}
          {STAGES.map((s) => {
            const isDone = !isUnqualified && currentStep > s.step;
            const isCurrent = !isUnqualified && currentStep === s.step;

            return (
              <div key={s.step} className="flex flex-col items-center relative z-10 select-none">
                {/* Node Circle */}
                <div
                  className={`w-8 h-8 rounded-full font-bold text-xs font-mono flex items-center justify-center transition-all shadow-sm ${
                    isDone
                      ? 'bg-green-500 text-white shadow-green-500/20'
                      : isCurrent
                      ? 'bg-[var(--color-accent)] text-white ring-4 ring-[var(--color-accent)]/20 scale-105'
                      : 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-muted-fg)]'
                  }`}
                >
                  {isDone ? <Check size={14} /> : s.step}
                </div>

                {/* Node Labels */}
                <div className="text-center mt-2.5 max-w-[130px]">
                  <p className={`text-xs font-semibold ${isCurrent ? 'text-[var(--color-accent)] font-bold' : isDone ? 'text-green-600' : 'text-[var(--color-muted-fg)]'}`}>
                    {s.title}
                  </p>
                  <p className="text-[10px] text-[var(--color-muted-fg)] mt-0.5 hidden sm:block">
                    {s.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
