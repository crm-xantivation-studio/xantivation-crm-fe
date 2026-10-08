'use client';

import React from 'react';
import { Check, XCircle } from 'lucide-react';

interface LeadProgressStepperProps {
  status: string;
  bantScore?: number;
  activeStep?: number;
}

const STAGES = [
  { step: 1, key: 'NEW', title: '1. Tiếp nhận Lead', subtitle: 'Thông tin cá nhân & DN' },
  { step: 2, key: 'CONTACTED', title: '2. Tương tác & BANT', subtitle: 'Nhật ký & Đánh giá' },
  { step: 3, key: 'CONVERT_SETUP', title: '3. Thiết lập Chuyển đổi', subtitle: 'Phân loại & Kiểm trùng' },
  { step: 4, key: 'QUALIFIED', title: '4. Đã Chuyển đổi', subtitle: 'Customer & Opportunity' },
];

export function LeadProgressStepper({ status, bantScore = 0, activeStep }: LeadProgressStepperProps) {
  const getStepIndex = (currentStatus: string) => {
    switch (currentStatus) {
      case 'NEW': return 1;
      case 'CONTACTED': return 2;
      case 'QUALIFIED':
      case 'CONVERTED':
        return 4; // SCRUM-38: QUALIFIED / CONVERTED means lead conversion completed (Step 4)
      case 'UNQUALIFIED': return -1;
      default: return 1;
    }
  };

  const statusStep = getStepIndex(status);
  const currentStep = activeStep !== undefined ? Math.max(statusStep, activeStep) : statusStep;
  const isUnqualified = status === 'UNQUALIFIED';

  return (
    <div className="bg-[var(--color-bg-tint)] border border-[var(--color-border)]/40 rounded-[5px] p-3.5 shadow-sm space-y-3">
      {/* Header Title & Score */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-[var(--color-fg)] uppercase tracking-wider font-mono">Tiến trình Phễu chuyển đổi</span>
          {isUnqualified && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/10 text-red-500 flex items-center gap-1 border border-red-500/20">
              <XCircle size={11} />
              Không đạt chuẩn (Unqualified)
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-xs font-mono">
          <span className="text-[var(--color-muted-fg)] text-[10px]">BANT SCORE:</span>
          <span className={`text-xs font-bold ${bantScore >= 75 ? 'text-green-500' : bantScore >= 50 ? 'text-amber-500' : 'text-[var(--color-muted-fg)]'}`}>
            {bantScore} / 100
          </span>
        </div>
      </div>

      {/* Sleek Frameless Timeline Stepper (1 ------- 2 ------- 3 ------- 4) */}
      <div className="relative px-2 py-0.5">
        <div className="flex items-center justify-between w-full relative">
          
          {/* Hairline Background Connecting Line */}
          <div className="absolute top-3.5 left-[4%] right-[4%] h-[2px] bg-[var(--color-border)]/50 -z-0" />

          {/* Active Colored Progress Line */}
          {!isUnqualified && currentStep > 1 && (
            <div
              className="absolute top-3.5 left-[4%] h-[2px] bg-green-500 transition-all duration-500 -z-0"
              style={{
                width: `${((Math.min(currentStep, 4) - 1) / 3) * 92}%`,
              }}
            />
          )}

          {/* 4 Step Nodes */}
          {STAGES.map((s) => {
            const isConverted = currentStep >= 4;
            const isDone = !isUnqualified && (currentStep > s.step || (isConverted && s.step === 4));
            const isCurrent = !isUnqualified && !isConverted && currentStep === s.step;

            return (
              <div key={s.step} className="flex flex-col items-center relative z-10 select-none">
                {/* Node Circle */}
                <div
                  className={`w-7 h-7 rounded-full font-bold text-[11px] font-mono flex items-center justify-center transition-all shadow-sm ${
                    isDone
                      ? 'bg-green-500 text-white shadow-green-500/20 ring-2 ring-green-500/20'
                      : isCurrent
                      ? 'bg-[var(--color-accent)] text-white ring-2 ring-[var(--color-accent)]/30 scale-105'
                      : 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-muted-fg)]'
                  }`}
                >
                  {isDone ? <Check size={13} /> : s.step}
                </div>

                {/* Node Labels */}
                <div className="text-center mt-1.5 max-w-[120px]">
                  <p className={`text-[11px] leading-tight font-medium ${isCurrent ? 'text-[var(--color-accent)] font-bold' : isDone ? 'text-green-600 font-bold' : 'text-[var(--color-muted-fg)]'}`}>
                    {s.title}
                  </p>
                  <p className="text-[9px] text-[var(--color-muted-fg)] mt-0.5 hidden sm:block">
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

