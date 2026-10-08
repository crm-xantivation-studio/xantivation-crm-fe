'use client';

import React from 'react';
import { Check, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface LeadProgressStepperProps {
  status: string;
  bantScore?: number;
  activeStep?: number;
}

const STAGES = [
  { step: 1, key: 'NEW', titleKey: 'leads.step1', defaultTitle: '1. Tiếp nhận Lead' },
  { step: 2, key: 'CONTACTED', titleKey: 'leads.step2', defaultTitle: '2. Tương tác & BANT' },
  { step: 3, key: 'QUALIFIED', titleKey: 'leads.step3', defaultTitle: '3. Chuyển đổi Lead' },
];

export function LeadProgressStepper({ status, bantScore = 0, activeStep }: LeadProgressStepperProps) {
  const { t } = useTranslation();

  const getStepIndex = (currentStatus: string) => {
    switch (currentStatus) {
      case 'NEW': return 1;
      case 'CONTACTED': return 2;
      case 'QUALIFIED':
      case 'CONVERTED':
        return 4;
      case 'UNQUALIFIED': return -1;
      default: return 1;
    }
  };

  const statusStep = getStepIndex(status);
  const currentStep = activeStep !== undefined ? Math.max(statusStep, activeStep) : statusStep;
  const isUnqualified = status === 'UNQUALIFIED';

  return (
    <div className="w-full space-y-2">
      {/* Header Title & Score */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isUnqualified && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/10 text-red-500 flex items-center gap-1 border border-red-500/20">
              <XCircle size={11} />
              {t('leads.unqualifiedStatus') || 'Không đạt chuẩn (Unqualified)'}
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
      <div className="relative py-0.5">
        <div className="flex items-start justify-between w-full relative">
          
          {/* 3 Step Nodes */}
          {STAGES.map((s, index) => {
            const isConverted = currentStep >= 4;
            const isDone = !isUnqualified && (currentStep > s.step || (isConverted && s.step === 3));
            const isCurrent = !isUnqualified && !isConverted && currentStep === s.step;
            const isLast = index === STAGES.length - 1;

            return (
              <div key={s.step} className="flex-1 flex flex-col items-center relative z-10 select-none">
                
                {/* Connecting Line (drawn from this node to the next) */}
                {!isLast && (
                  <div className="absolute top-[13px] left-[50%] w-full h-[2px] bg-[var(--color-border)]/50 -z-10">
                    <div 
                      className="h-full bg-green-500 transition-all duration-500"
                      style={{ width: (!isUnqualified && currentStep > s.step) ? '100%' : '0%' }}
                    />
                  </div>
                )}

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
                <div className="text-center mt-1.5 px-1 w-full max-w-[120px]">
                  <p className={`text-[10px] leading-tight font-medium break-words ${isCurrent ? 'text-[var(--color-accent)] font-bold' : isDone ? 'text-green-600 font-bold' : 'text-[var(--color-muted-fg)]'}`}>
                    {t(s.titleKey) || s.defaultTitle}
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

