'use client';

import React from 'react';
import { Tooltip } from 'antd';
import { Play, Eye, Power, Trash2 } from 'lucide-react';

interface AgentNodeToolbarProps {
  agentName: string;
  isActive: boolean;
  onRun?: () => void;
  onDetail?: () => void;
  onToggleActive?: () => void;
  onDelete?: () => void;
}

export function AgentNodeToolbar({
  agentName,
  isActive,
  onRun,
  onDetail,
  onToggleActive,
  onDelete,
}: AgentNodeToolbarProps) {
  return (
    <div
      className="agent-node-toolbar absolute left-1/2 top-0 z-30 flex items-center gap-1 rounded-xl border border-neutral-700/80 bg-neutral-900/95 px-2 py-1 shadow-2xl backdrop-blur-md"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Run Action */}
      <Tooltip title={`Chạy thử tác vụ với ${agentName}`} placement="top">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRun?.();
          }}
          className="flex h-6 w-6 items-center justify-center rounded-lg text-neutral-400 transition-colors duration-150 hover:bg-emerald-500/20 hover:text-emerald-400 active:scale-95"
        >
          <Play size={12} className="fill-current" />
        </button>
      </Tooltip>

      {/* Detail Action */}
      <Tooltip title="Xem chi tiết hoạt động & Logs" placement="top">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDetail?.();
          }}
          className="flex h-6 w-6 items-center justify-center rounded-lg text-neutral-400 transition-colors duration-150 hover:bg-indigo-500/20 hover:text-indigo-400 active:scale-95"
        >
          <Eye size={13} />
        </button>
      </Tooltip>

      <div className="h-3.5 w-[1px] bg-neutral-700/60" />

      {/* Toggle Active Action */}
      <Tooltip
        title={isActive ? 'Tắt hoạt động của Agent' : 'Kích hoạt Agent'}
        placement="top"
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleActive?.();
          }}
          className={`flex h-6 w-6 items-center justify-center rounded-lg transition-colors duration-150 active:scale-95 ${
            isActive
              ? 'text-emerald-400 hover:bg-rose-500/20 hover:text-rose-400'
              : 'text-neutral-500 hover:bg-emerald-500/20 hover:text-emerald-400'
          }`}
        >
          <Power size={12} />
        </button>
      </Tooltip>

      {/* Delete Action */}
      <Tooltip title="Xóa Agent khỏi Canvas" placement="top">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.();
          }}
          className="flex h-6 w-6 items-center justify-center rounded-lg text-neutral-400 transition-colors duration-150 hover:bg-rose-500/20 hover:text-rose-400 active:scale-95"
        >
          <Trash2 size={12} />
        </button>
      </Tooltip>
    </div>
  );
}
