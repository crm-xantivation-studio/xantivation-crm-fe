'use client';

import React from 'react';
import { Drawer, Tag, Divider } from 'antd';
import {
  ExternalLink,
  Clock,
  Terminal,
  FileText,
  Activity,
  Shield,
  Link as LinkIcon,
  Code
} from 'lucide-react';
import { AgentNodeData } from './AgentNode';
import { CanvasExecutionEvent } from '@/hooks/useCanvasSSE';

interface AgentDetailDrawerProps {
  agent: AgentNodeData | null;
  events: CanvasExecutionEvent[];
  open: boolean;
  onClose: () => void;
}

export default function AgentDetailDrawer({
  agent,
  events,
  open,
  onClose,
}: AgentDetailDrawerProps) {
  if (!agent) return null;

  // Filter events related to this agent
  const agentEvents = events.filter(
    (e) => e.subagentId === agent.slug || e.subagentId === agent.id
  );

  const latestEvent = agentEvents[agentEvents.length - 1];

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={480}
      title={
        <div className="flex items-center gap-2 text-sm font-bold text-[var(--color-fg)]">
          <Activity className="w-4 h-4 text-indigo-500" />
          <span>Chi Tiết Hoạt Động Agent</span>
        </div>
      }
      className="agent-detail-drawer"
    >
      <div className="space-y-4 text-xs">
        {/* Agent Info Card */}
        <div className="bg-[var(--color-bg-subtle)] border border-[var(--color-border)] rounded-xl p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-[var(--color-fg)]">
              {agent.name}
            </span>
            <Tag color={agent.isActive ? 'green' : 'default'}>
              {agent.isActive ? 'Active' : 'Inactive'}
            </Tag>
          </div>
          <div className="font-mono text-[11px] text-[var(--color-muted-fg)]">
            Slug: {agent.slug}
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            <Tag color="purple">Phòng ban: {agent.department || 'Gateway'}</Tag>
            <Tag color="blue">Cấp bậc: {agent.agentType}</Tag>
            <Tag color="geekblue">Vai trò: {agent.role}</Tag>
          </div>
        </div>

        {/* Status & Timing */}
        <div className="grid grid-cols-2 gap-3">
          <div className="border border-[var(--color-border)] rounded-xl p-3">
            <span className="text-[11px] text-[var(--color-muted-fg)] block mb-1">
              Trạng Thái Thực Thi
            </span>
            <span className="font-bold capitalize text-[var(--color-fg)]">
              {agent.status === 'running'
                ? '🔵 Đang chạy'
                : agent.status === 'completed'
                ? '🟢 Hoàn tất'
                : agent.status === 'failed'
                ? '🔴 Thất bại'
                : '⚪ Đang chờ'}
            </span>
          </div>
          <div className="border border-[var(--color-border)] rounded-xl p-3">
            <span className="text-[11px] text-[var(--color-muted-fg)] block mb-1 flex items-center gap-1">
              <Clock size={11} /> Thời Gian Thực Thi
            </span>
            <span className="font-mono font-bold text-[var(--color-fg)]">
              {agent.durationMs ? `${(agent.durationMs / 1000).toFixed(2)}s` : '—'}
            </span>
          </div>
        </div>

                {/* Architecture Info: Responsibilities & Connections */}
        <div className="space-y-3">
          <div className="border border-[var(--color-border)] rounded-xl p-3 bg-neutral-900/50">
            <span className="text-[11px] font-bold text-[var(--color-fg)] flex items-center gap-1.5 mb-2">
              <Shield size={13} className="text-purple-400" /> Nhiệm vụ & Quyền hạn
            </span>
            <ul className="list-disc pl-4 text-[10px] text-[var(--color-muted-fg)] space-y-1">
              <li>{agent.role || 'Phân tích và xử lý luồng công việc'}</li>
              <li>Chỉ được phép truy cập vào các công cụ thuộc quyền hạn của {agent.department || 'Ban điều hành'}</li>
              <li>{agent.slug === 'hermes' ? 'Điều phối các Agents khác' : 'Thực thi các lệnh được giao từ quản lý'}</li>
            </ul>
          </div>

          <div className="border border-[var(--color-border)] rounded-xl p-3 bg-neutral-900/50">
            <span className="text-[11px] font-bold text-[var(--color-fg)] flex items-center gap-1.5 mb-2">
              <LinkIcon size={13} className="text-blue-400" /> Kết nối & Giao tiếp (Topology)
            </span>
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-neutral-500">Incoming:</span>
                <span className="font-mono text-neutral-300 bg-neutral-800 px-1.5 py-0.5 rounded">EventStream / WebSocket</span>
              </div>
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-neutral-500">Outgoing:</span>
                <span className="font-mono text-neutral-300 bg-neutral-800 px-1.5 py-0.5 rounded">REST API / Database</span>
              </div>
            </div>
          </div>
          
          <div className="border border-[var(--color-border)] rounded-xl p-3 bg-neutral-900/50">
            <span className="text-[11px] font-bold text-[var(--color-fg)] flex items-center gap-1.5 mb-2">
              <Code size={13} className="text-emerald-400" /> Source Repository
            </span>
            <div className="font-mono text-[9px] text-neutral-500 break-all bg-black/40 p-1.5 rounded border border-neutral-800">
              src/ai/agents/{agent.department ? agent.department.toLowerCase() : 'core'}/{agent.slug}.ts
            </div>
          </div>
        </div>

        {/* Goal Description */}
        {latestEvent?.goal && (
          <div>
            <label className="font-semibold text-[var(--color-fg)] block mb-1">
              🎯 Mục Tiêu Đang Thực Thi (Goal):
            </label>
            <div className="bg-[var(--color-bg-subtle)] border border-[var(--color-border)] rounded-xl p-3 text-[11px] leading-relaxed text-[var(--color-fg)] font-sans">
              {latestEvent.goal}
            </div>
          </div>
        )}

        {/* Tool Call History */}
        <div>
          <label className="font-semibold text-[var(--color-fg)] block mb-2 flex items-center gap-1.5">
            <Terminal size={14} className="text-cyan-500" />
            Lịch Sử Gọi Tool & Tác Vụ ({agentEvents.length} sự kiện):
          </label>

          {agentEvents.length === 0 ? (
            <div className="text-center py-6 text-[var(--color-muted-fg)] border border-dashed border-[var(--color-border)] rounded-xl">
              Chưa có sự kiện thực thi nào trong phiên này
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {agentEvents.map((evt, idx) => (
                <div
                  key={idx}
                  className="border border-[var(--color-border)] rounded-xl p-2.5 bg-[var(--color-bg-subtle)] space-y-1"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-mono font-semibold text-cyan-400">
                      {evt.toolCallName || evt.eventType}
                    </span>
                    <span className="text-[10px] text-[var(--color-muted-fg)] font-mono">
                      {new Date(evt.timestamp).toLocaleTimeString('vi-VN')}
                    </span>
                  </div>

                  {evt.toolCallInput && (
                    <div className="font-mono text-[10px] text-[var(--color-muted-fg)] truncate">
                      Input: {JSON.stringify(evt.toolCallInput)}
                    </div>
                  )}

                  {evt.toolCallResultSnippet && (
                    <div className="text-[10px] text-emerald-400 bg-neutral-950/80 rounded p-1.5 font-mono line-clamp-3">
                      {evt.toolCallResultSnippet}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Output Metadata */}
        {latestEvent?.metadata && (
          <>
            <Divider className="my-2" />
            <div className="space-y-2">
              <label className="font-semibold text-[var(--color-fg)] block flex items-center gap-1.5">
                <FileText size={14} className="text-amber-500" />
                Kết Quả & Metadata Xuất Bản:
              </label>

              {latestEvent.metadata.draftTitle && (
                <div className="border border-[var(--color-border)] rounded-xl p-2.5 bg-[var(--color-bg-subtle)]">
                  <span className="text-[10px] text-[var(--color-muted-fg)] block">
                    Tiêu Đề Bản Thảo:
                  </span>
                  <span className="font-medium text-[var(--color-fg)]">
                    {latestEvent.metadata.draftTitle}
                  </span>
                </div>
              )}

              {latestEvent.metadata.extractedUrls && (
                <div className="border border-[var(--color-border)] rounded-xl p-2.5 bg-[var(--color-bg-subtle)] space-y-1">
                  <span className="text-[10px] text-[var(--color-muted-fg)] block font-semibold">
                    URLs Đã Cào Dữ Liệu:
                  </span>
                  {latestEvent.metadata.extractedUrls.map((u, i) => (
                    <a
                      key={i}
                      href={u.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-blue-500 hover:underline flex items-center gap-1 truncate"
                    >
                      • {u.title || u.url} <ExternalLink size={10} />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Drawer>
  );
}
