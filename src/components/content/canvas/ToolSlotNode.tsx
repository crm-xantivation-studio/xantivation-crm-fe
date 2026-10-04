'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import {
  Globe,
  Link as LinkIcon,
  FileText,
  GitBranch,
  Wrench,
} from 'lucide-react';
import { Tooltip } from 'antd';

export interface ToolSlotNodeData {
  toolType: 'delegation' | 'web' | 'http_tool' | 'file' | string;
  name: string;
  description?: string;
  parentAgentSlug?: string;
  isActive?: boolean;
}

const getToolMeta = (toolType: string) => {
  switch (toolType) {
    case 'delegation':
      return {
        icon: <GitBranch className="h-3.5 w-3.5 text-purple-400" />,
        label: 'Delegation (Phân Công)',
        desc: 'Ủy quyền và phân bổ sub-goals cho các Sub-Agent cấp dưới',
        border: 'border-purple-500/40 bg-purple-950/40 text-purple-300',
        dot: 'bg-purple-400',
      };
    case 'web':
      return {
        icon: <Globe className="h-3.5 w-3.5 text-emerald-400" />,
        label: 'Web Scraper Tool',
        desc: 'Cào dữ liệu từ URL, tìm kiếm bài viết tham khảo & tin tức trên web',
        border: 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300',
        dot: 'bg-emerald-400',
      };
    case 'http_tool':
      return {
        icon: <LinkIcon className="h-3.5 w-3.5 text-blue-400" />,
        label: 'HTTP Connector',
        desc: 'Gọi webhook, kết nối API ngoài và hệ thống mạng xã hội',
        border: 'border-blue-500/40 bg-blue-950/40 text-blue-300',
        dot: 'bg-blue-400',
      };
    case 'file':
      return {
        icon: <FileText className="h-3.5 w-3.5 text-amber-400" />,
        label: 'File & Storage',
        desc: 'Đọc/ghi tài liệu, template Markdown, cấu trúc bài viết',
        border: 'border-amber-500/40 bg-amber-950/40 text-amber-300',
        dot: 'bg-amber-400',
      };
    default:
      return {
        icon: <Wrench className="h-3.5 w-3.5 text-neutral-400" />,
        label: toolType,
        desc: 'Công cụ bổ trợ cho Agent',
        border: 'border-neutral-700/60 bg-neutral-900/60 text-neutral-300',
        dot: 'bg-neutral-400',
      };
  }
};

function ToolSlotNodeComponent({ data, selected }: NodeProps) {
  const nodeData = data as unknown as ToolSlotNodeData;
  const meta = getToolMeta(nodeData.toolType);

  return (
    <Tooltip title={nodeData.description || meta.desc} placement="bottom">
      <div
        className={`group relative flex items-center gap-2 rounded-xl border px-2.5 py-1.5 shadow-md backdrop-blur-md transition-all duration-150 select-none ${
          meta.border
        } ${selected ? 'ring-2 ring-indigo-400/80' : ''}`}
      >
        {/* Top Target Handle to receive edge from Agent Node bottom */}
        <Handle
          type="target"
          position={Position.Top}
          className="!h-2 !w-2 !border !border-neutral-950 !bg-neutral-400 transition-transform hover:scale-125"
        />

        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-neutral-900/80 border border-neutral-800 shadow-inner">
          {meta.icon}
        </div>

        <div className="flex flex-col overflow-hidden">
          <span className="font-mono text-[10px] font-semibold truncate leading-tight text-neutral-200">
            {nodeData.name || meta.label}
          </span>
          <span className="text-[8px] text-neutral-400 truncate uppercase tracking-wider">
            {nodeData.toolType}
          </span>
        </div>

        <span className={`h-1.5 w-1.5 rounded-full ${meta.dot} ml-auto shrink-0`} />
      </div>
    </Tooltip>
  );
}

export const ToolSlotNode = memo(ToolSlotNodeComponent);
