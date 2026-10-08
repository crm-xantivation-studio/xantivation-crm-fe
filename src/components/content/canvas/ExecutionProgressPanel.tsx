'use client';

import React, { useEffect, useRef } from 'react';
import { Button, Tag, Badge, Tooltip } from 'antd';
import {
  Activity,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileText,
  Clock,
  ExternalLink,
  X,
  Minimize2,
  Maximize2,
  Terminal,
  Search,
  PenTool,
  ShieldCheck,
  Crown,
  Target,
} from 'lucide-react';
import { CanvasExecutionEvent } from '@/hooks/useCanvasSSE';

interface ExecutionProgressPanelProps {
  visible: boolean;
  isExecuting: boolean;
  events: CanvasExecutionEvent[];
  elapsedSeconds: number;
  onOpenResult: () => void;
  onClose: () => void;
  hasResult: boolean;
}

const getEventIcon = (event: CanvasExecutionEvent) => {
  if (event.status === 'running') {
    return <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-400" />;
  }
  if (event.status === 'failed') {
    return <AlertCircle className="h-3.5 w-3.5 text-rose-400" />;
  }
  if (event.role === 'orchestrator') {
    return <Crown className="h-3.5 w-3.5 text-amber-400" />;
  }
  if (event.role === 'researcher') {
    return <Search className="h-3.5 w-3.5 text-emerald-400" />;
  }
  if (event.role === 'copywriter') {
    return <PenTool className="h-3.5 w-3.5 text-blue-400" />;
  }
  if (event.role === 'auditor') {
    return <ShieldCheck className="h-3.5 w-3.5 text-pink-400" />;
  }
  return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />;
};

export function ExecutionProgressPanel({
  visible,
  isExecuting,
  events,
  elapsedSeconds,
  onOpenResult,
  onClose,
  hasResult,
}: ExecutionProgressPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events]);

  if (!visible) return null;

  const latestEvent = events[events.length - 1];
  const executionId = latestEvent?.executionId || 'pipeline-active';

  return (
    <div className="absolute right-4 top-20 z-20 w-80 max-h-[calc(100vh-240px)] flex flex-col rounded-2xl border border-neutral-800 bg-neutral-950/95 backdrop-blur-xl shadow-2xl overflow-hidden transition-all duration-300 select-none animate-in fade-in slide-in-from-right-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-800/80 px-3.5 py-2.5 bg-neutral-900/60">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            {isExecuting ? (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </>
            ) : (
              <span className="inline-flex rounded-full h-2 w-2 bg-neutral-500"></span>
            )}
          </span>
          <span className="font-bold text-xs text-neutral-100">
            {isExecuting ? 'Hermes Đang Thực Thi...' : 'Tiến Trình Pipeline'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-neutral-400 flex items-center gap-1 bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800">
            <Clock size={10} />
            {Math.floor(elapsedSeconds / 60)}:
            {(elapsedSeconds % 60).toString().padStart(2, '0')}s
          </span>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Events List / Timeline */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 space-y-2.5 max-h-[360px] text-[11px]"
      >
        {events.length === 0 ? (
          <div className="text-center py-6 text-neutral-500 italic">
            Đang khởi tạo phiên làm việc của Hermes...
          </div>
        ) : (
          events.map((event, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-neutral-800/80 bg-neutral-900/40 p-2 space-y-1 transition-all"
            >
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1.5 overflow-hidden">
                  {getEventIcon(event)}
                  <span className="font-mono font-bold text-neutral-200 truncate">
                    {event.subagentId}
                  </span>
                </div>
                <span
                  className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded border ${
                    event.status === 'running'
                      ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                      : event.status === 'completed'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                  }`}
                >
                  {event.eventType}
                </span>
              </div>

              {/* Goal or Tool Call Snippet */}
              {event.goal && (
                <div className="flex items-center gap-1.5 text-neutral-400 line-clamp-2 text-[10px] pl-5">
                  <Target size={11} className="shrink-0 text-indigo-400" />
                  <span>{event.goal}</span>
                </div>
              )}

              {event.toolCallName && (
                <div className="flex items-center gap-1 text-[10px] font-mono text-cyan-400 bg-neutral-950/80 px-2 py-1 rounded-md border border-neutral-800">
                  <Terminal size={10} className="shrink-0" />
                  <span className="truncate">{event.toolCallName}</span>
                </div>
              )}

              {/* Metadata Highlights */}
              {event.metadata?.draftTitle && (
                <div className="flex items-center gap-1.5 text-[10px] text-amber-300 bg-amber-950/20 px-2 py-0.5 rounded border border-amber-500/20 truncate">
                  <FileText size={11} className="shrink-0 text-amber-400" />
                  <span className="truncate">Bản thảo: "{event.metadata.draftTitle}"</span>
                </div>
              )}
              {event.metadata?.auditPassed !== undefined && (
                <div className="flex items-center gap-1.5 text-[10px] text-pink-300 bg-pink-950/20 px-2 py-0.5 rounded border border-pink-500/20">
                  <ShieldCheck size={11} className="shrink-0 text-pink-400" />
                  <span>Brand Voice Audit: {event.metadata.auditPassed ? 'ĐẠT CHUẨN' : 'CẦN CHỈNH SỬA'}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer Actions */}
      <div className="border-t border-neutral-800 p-2.5 bg-neutral-900/60">
        <Button
          type="primary"
          icon={<FileText size={14} />}
          onClick={onOpenResult}
          disabled={!hasResult && isExecuting}
          className="w-full bg-indigo-600 hover:bg-indigo-500 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5"
        >
          {hasResult ? 'Xem Bài Viết Đã Tạo' : isExecuting ? 'Đang Soạn Bài Viết...' : 'Xem Kết Quả'}
        </Button>
      </div>
    </div>
  );
}
