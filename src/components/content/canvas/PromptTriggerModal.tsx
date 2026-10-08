'use client';

import React, { useState } from 'react';
import { Modal, Input, Button, Tag, Space, Checkbox, Select, Tooltip, Tabs, Spin } from 'antd';
import {
  Sparkles,
  Play,
  Flame,
  Wand2,
  Bot,
  Layers,
  Target,
  Compass,
  TrendingUp,
  Zap,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';

const { TextArea } = Input;

const FRAMEWORK_OPTIONS = [
  { value: 'auto', label: 'Tự động chọn (Auto Detect)' },
  { value: 'PAS', label: 'PAS (Problem - Agitate - Solve)' },
  { value: 'AIDA', label: 'AIDA (Attention - Interest - Desire - Action)' },
  { value: 'BAB', label: 'BAB (Before - After - Bridge)' },
  { value: '4P', label: '4P (Promise - Picture - Proof - Push)' },
  { value: 'StoryBrand', label: 'StoryBrand (Hero - Guide - Plan)' },
];

const AUDIENCE_OPTIONS = [
  { value: 'Chủ doanh nghiệp SMEs, Ban Giám Đốc', label: 'Chủ doanh nghiệp SMEs & Ban Giám Đốc' },
  { value: 'Giám đốc Kinh doanh (CCO) & Sales Leader', label: 'Giám đốc Kinh doanh (CCO) & Sales Leader' },
  { value: 'Trưởng phòng Marketing (CMO) & Growth Team', label: 'Trưởng phòng Marketing (CMO) & Growth' },
  { value: 'Doanh nghiệp B2B, Bán buôn & Dịch vụ chuyên nghiệp', label: 'Doanh nghiệp B2B & Dịch vụ chuyên sâu' },
];

interface PromptTriggerModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (
    prompt: string,
    options: {
      autoPublish: boolean;
      autonomous: boolean;
      framework?: 'PAS' | 'AIDA' | 'BAB' | '4P' | 'StoryBrand' | 'auto';
      targetAudience?: string;
      tone?: string;
    }
  ) => void;
  isLoading: boolean;
}

export function PromptTriggerModal({
  open,
  onClose,
  onSubmit,
  isLoading,
}: PromptTriggerModalProps) {
  const [activeTab, setActiveTab] = useState<'market_intel' | 'custom'>('market_intel');
  const [customPrompt, setCustomPrompt] = useState('');
  const [framework, setFramework] = useState<'PAS' | 'AIDA' | 'BAB' | '4P' | 'StoryBrand' | 'auto'>('auto');
  const [targetAudience, setTargetAudience] = useState<string>('Chủ doanh nghiệp SMEs, Ban Giám Đốc');
  const [autoPublish, setAutoPublish] = useState(false);

  // Fetch Market Intelligence Topics analyzed by Hermes
  const { data: marketTrends, isLoading: isLoadingTrends } = useQuery({
    queryKey: ['market-trends'],
    queryFn: async () => {
      try {
        const res = await api.get('/integrations/social-posts/market-trends');
        return res.data?.data || [];
      } catch {
        return [];
      }
    },
    enabled: open,
  });

  const handleSelectTrend = (trend: any) => {
    onSubmit(trend.prompt, {
      autoPublish,
      autonomous: true,
      framework: trend.framework || 'auto',
      targetAudience: trend.targetAudience,
    });
  };

  const handleAutoPilot = () => {
    if (marketTrends && marketTrends.length > 0) {
      // Pick the top viral score trend
      const bestTrend = marketTrends[0];
      handleSelectTrend(bestTrend);
    } else {
      onSubmit('Viết bài phân tích xu hướng chuyển đổi số và ứng dụng AI CRM 2026 cho doanh nghiệp B2B.', {
        autoPublish,
        autonomous: true,
        framework: 'AIDA',
        targetAudience: 'Chủ doanh nghiệp SMEs, Ban Giám Đốc',
      });
    }
  };

  const handleCustomSubmit = () => {
    if (!customPrompt.trim()) return;
    onSubmit(customPrompt.trim(), {
      autoPublish,
      autonomous: false,
      framework,
      targetAudience,
    });
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={680}
      centered
      title={
        <div className="flex items-center justify-between w-full pr-6">
          <div className="flex items-center gap-2.5 text-base font-bold text-[var(--color-fg)]">
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400">
              <Sparkles size={16} />
            </div>
            <span>Hermes AI Content Studio (Tự Chủ Toàn Quyền)</span>
          </div>
          <Button
            type="primary"
            size="small"
            icon={<Zap size={13} />}
            onClick={handleAutoPilot}
            loading={isLoading}
            className="bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 border-none rounded-lg text-xs font-bold shadow-md shadow-amber-500/20"
          >
            Auto Pilot 1-Click
          </Button>
        </div>
      }
      className="prompt-trigger-modal"
    >
      <div className="py-2 text-xs space-y-3">
        <div className="flex items-center justify-between bg-indigo-950/30 border border-indigo-500/30 rounded-xl p-3">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-indigo-400 shrink-0" />
            <p className="text-neutral-300 text-xs leading-relaxed">
              <strong className="text-indigo-300">Hermes Market Researcher</strong> đã tự động quét dữ liệu ngành và tối ưu sẵn đề tài, framework & đối tượng. Bạn chỉ cần bấm <strong>1-Click</strong> để AI tạo bài và duyệt!
            </p>
          </div>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={(k) => setActiveTab(k as any)}
          items={[
            {
              key: 'market_intel',
              label: (
                <span className="flex items-center gap-1.5 font-semibold text-xs">
                  <TrendingUp size={13} className="text-emerald-400" />
                  Đề Xuất Tự Động Từ Thị Trường ({marketTrends?.length || 4})
                </span>
              ),
              children: (
                <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                  {isLoadingTrends ? (
                    <div className="py-12 text-center">
                      <Spin tip="Hermes đang quét dữ liệu thị trường..." />
                    </div>
                  ) : (
                    (marketTrends || []).map((trend: any) => (
                      <div
                        key={trend.id}
                        onClick={() => handleSelectTrend(trend)}
                        className="group relative rounded-xl bg-neutral-900/80 hover:bg-neutral-800/90 border border-neutral-800 hover:border-indigo-500/80 p-3 transition-all cursor-pointer shadow-sm hover:shadow-indigo-500/10 space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-neutral-100 text-xs group-hover:text-indigo-300 transition-colors">
                                {trend.title}
                              </span>
                              <Tag color="cyan" className="rounded-md text-[10px] py-0 px-1.5 border-none font-semibold">
                                {trend.framework} Framework
                              </Tag>
                              <Tag color="purple" className="rounded-md text-[10px] py-0 px-1.5 border-none">
                                {trend.category}
                              </Tag>
                            </div>
                            <p className="text-neutral-400 text-[11px] leading-relaxed line-clamp-2">
                              {trend.marketInsight}
                            </p>
                          </div>
                          <div className="flex flex-col items-end shrink-0 gap-1.5">
                            <span className="font-mono font-bold text-amber-400 text-[11px] bg-amber-400/10 border border-amber-400/20 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                              <Flame size={12} className="text-amber-500" />
                              {trend.viralScore}/100
                            </span>
                            <Button
                              type="primary"
                              size="small"
                              icon={<Play size={11} />}
                              loading={isLoading}
                              className="bg-indigo-600 hover:bg-indigo-500 rounded-lg text-[11px] h-6 px-2 font-semibold"
                            >
                              Tạo Bài
                            </Button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-neutral-500 pt-1 border-t border-neutral-800/60">
                          <span className="flex items-center gap-1">
                            <Target size={11} className="text-emerald-400" />
                            {trend.targetAudience}
                          </span>
                          <span className="flex items-center gap-1 text-neutral-400">
                            <Clock size={11} />
                            {trend.recommendedSlot}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ),
            },
            {
              key: 'custom',
              label: (
                <span className="flex items-center gap-1.5 font-semibold text-xs">
                  <Wand2 size={13} className="text-indigo-400" />
                  Tùy Chỉnh Prompt Riêng
                </span>
              ),
              children: (
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block mb-1 font-semibold text-neutral-300">
                      Nhập yêu cầu bài viết tùy chọn:
                    </label>
                    <TextArea
                      rows={3}
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="VD: Viết bài phân tích lợi ích của việc tích hợp Omni-Channel vào CRM..."
                      className="!bg-neutral-950 !border-neutral-800 !text-neutral-100 rounded-xl text-xs"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="flex items-center gap-1 mb-1 font-semibold text-neutral-300">
                        <Compass size={12} className="text-indigo-400" />
                        Copywriting Framework:
                      </label>
                      <Select
                        value={framework}
                        onChange={(val) => setFramework(val as any)}
                        className="w-full"
                        options={FRAMEWORK_OPTIONS}
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-1 mb-1 font-semibold text-neutral-300">
                        <Target size={12} className="text-emerald-400" />
                        Đối tượng mục tiêu:
                      </label>
                      <Select
                        value={targetAudience}
                        onChange={(val) => setTargetAudience(val)}
                        className="w-full"
                        options={AUDIENCE_OPTIONS}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button
                      type="primary"
                      icon={<Play size={13} />}
                      onClick={handleCustomSubmit}
                      loading={isLoading}
                      disabled={!customPrompt.trim()}
                      className="bg-indigo-600 hover:bg-indigo-500 rounded-xl font-semibold"
                    >
                      Chạy Pipeline Sáng Tạo
                    </Button>
                  </div>
                </div>
              ),
            },
          ]}
        />

        {/* Global Auto-Publish Switch */}
        <div className="flex items-center justify-between rounded-xl bg-neutral-900/60 border border-neutral-800 p-2.5 mt-2">
          <Checkbox
            checked={autoPublish}
            onChange={(e) => setAutoPublish(e.target.checked)}
            className="text-neutral-300 text-xs"
          >
            Tự động xuất bản ngay sau khi AI hoàn tất (Bỏ qua bước xem nháp)
          </Checkbox>
          <span className="text-[10px] text-neutral-500">Mặc định: Chờ quản trị viên duyệt</span>
        </div>
      </div>
    </Modal>
  );
}
