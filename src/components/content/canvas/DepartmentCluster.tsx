'use client';

import React, { memo } from 'react';
import { NodeProps, NodeResizer } from '@xyflow/react';
import {
  Layers,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Users,
  Power,
  Maximize2,
} from 'lucide-react';
import { Tooltip } from 'antd';

export interface DepartmentClusterData {
  department: 'marketing' | 'sales' | 'tech';
  title: string;
  agentCount: number;
  isActive: boolean;
  isCollapsed?: boolean;
  hasRunningAgent?: boolean;
  memberIds?: string[];
  onToggleCollapse?: (clusterId: string) => void;
  onToggleActive?: (department: string) => void;
  onOpenContextMenu?: (e: React.MouseEvent, clusterId: string) => void;
}

function DepartmentClusterComponent({ id, data, selected }: NodeProps) {
  const clusterData = data as unknown as DepartmentClusterData;
  const isMarketing = clusterData.department === 'marketing';
  const isSales = clusterData.department === 'sales';
  const isTech = clusterData.department === 'tech';
  const isCollapsed = clusterData.isCollapsed ?? false;
  const hasRunning = clusterData.hasRunningAgent ?? false;

  const getDepartmentStyles = () => {
    if (isMarketing) {
      return {
        border: 'border-purple-500/40 bg-purple-950/15 text-purple-300',
        header: 'bg-purple-900/30 border-purple-500/30 text-purple-200',
        badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
        activeGlow: 'shadow-lg shadow-purple-500/5',
        resizerColor: '!border-purple-500 !bg-purple-500',
      };
    }
    if (isSales) {
      return {
        border: 'border-emerald-500/40 bg-emerald-950/15 text-emerald-300',
        header: 'bg-emerald-900/30 border-emerald-500/30 text-emerald-200',
        badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        activeGlow: 'shadow-lg shadow-emerald-500/5',
        resizerColor: '!border-emerald-500 !bg-emerald-500',
      };
    }
    if (isTech) {
      return {
        border: 'border-blue-500/40 bg-blue-950/15 text-blue-300',
        header: 'bg-blue-900/30 border-blue-500/30 text-blue-200',
        badge: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
        activeGlow: 'shadow-lg shadow-blue-500/5',
        resizerColor: '!border-blue-500 !bg-blue-500',
      };
    }
    return {
      border: 'border-neutral-700/60 bg-neutral-900/30 text-neutral-400',
      header: 'bg-neutral-800/40 border-neutral-700/40 text-neutral-300',
      badge: 'bg-neutral-800 text-neutral-400 border-neutral-700',
      activeGlow: '',
      resizerColor: '!border-indigo-500 !bg-indigo-500',
    };
  };

  const styles = getDepartmentStyles();

  return (
    <div
      className={`group relative w-full h-full rounded-2xl border-2 transition-all duration-200 backdrop-blur-md select-none ${
        styles.border
      } ${styles.activeGlow} ${
        clusterData.isActive ? 'border-dashed' : 'border-dashed opacity-45'
      } ${hasRunning ? 'cluster-running ring-2 ring-purple-500/60' : ''} ${
        selected ? 'ring-2 ring-indigo-400 border-indigo-400 shadow-xl shadow-indigo-500/20' : ''
      }`}
    >
      {/* n8n Style Node Resizer: Drag edges or corners to scale cluster */}
      <NodeResizer
        isVisible={selected}
        minWidth={360}
        minHeight={180}
        lineClassName="!border-indigo-500/80 !border-dashed"
        handleClassName={`!h-3 !w-3 !rounded-sm !border-2 !border-neutral-950 ${styles.resizerColor} transition-transform hover:scale-125`}
      />

      {/* Title Bar Header */}
      <div
        className={`flex items-center justify-between gap-2 px-3 py-2 rounded-t-xl border-b transition-colors ${
          styles.header
        } ${isCollapsed ? 'rounded-b-xl border-b-0' : ''}`}
      >
        {/* Left: Icon, Department Name, Member Count */}
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-neutral-950/80 border border-neutral-800 text-neutral-300 shadow-inner shrink-0">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-xs uppercase tracking-wider truncate text-neutral-100 font-sans">
            {clusterData.title}
          </span>
          <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-neutral-950/80 font-mono text-neutral-300 border border-neutral-800 shrink-0">
            <Users size={10} className="text-neutral-400" />
            {clusterData.agentCount} nhân sự
          </span>
        </div>

        {/* Right: Status Pill & Collapse / Context Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${
              clusterData.isActive
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-neutral-900 text-neutral-500 border-neutral-800'
            }`}
          >
            {clusterData.isActive ? 'Active' : 'Khung Sẵn Sàng'}
          </span>

          {/* Collapse/Expand Button */}
          <Tooltip
            title={isCollapsed ? 'Mở rộng phòng ban' : 'Thu gọn phòng ban'}
            placement="top"
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                clusterData.onToggleCollapse?.(id);
              }}
              className="flex h-6 w-6 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-950/80 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-neutral-200 active:scale-95"
            >
              {isCollapsed ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
            </button>
          </Tooltip>

          {/* More Options / Context Menu */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              clusterData.onOpenContextMenu?.(e, id);
            }}
            className="flex h-6 w-6 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-950/80 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-neutral-200 active:scale-95"
          >
            <MoreVertical size={13} />
          </button>
        </div>
      </div>

      {/* Collapsed Hint */}
      {isCollapsed && (
        <div className="p-4 text-center text-[11px] text-neutral-500 italic">
          (Phòng ban đã thu gọn — Nhấn nút [+] để hiển thị các Sub-Agent)
        </div>
      )}

      {/* Bottom Corner Resize Grip Hint */}
      {selected && !isCollapsed && (
        <div className="absolute bottom-1 right-1 text-neutral-500 opacity-60 pointer-events-none">
          <Maximize2 size={10} className="rotate-90" />
        </div>
      )}
    </div>
  );
}

export const DepartmentCluster = memo(DepartmentClusterComponent);

