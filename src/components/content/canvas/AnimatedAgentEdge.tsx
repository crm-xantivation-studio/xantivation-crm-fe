'use client';

import React, { memo } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
} from '@xyflow/react';
import { Plus, X } from 'lucide-react';
import { Tooltip } from 'antd';

export interface AnimatedAgentEdgeData {
  department?: 'marketing' | 'sales' | 'tech';
  status?: 'idle' | 'running' | 'completed' | 'failed';
  onAddNodeBetween?: (edgeId: string) => void;
  onDeleteEdge?: (edgeId: string) => void;
}

function AnimatedAgentEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
  selected,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const edgeData = data as AnimatedAgentEdgeData | undefined;
  const isRunning = edgeData?.status === 'running';
  const isCompleted = edgeData?.status === 'completed';
  const isFailed = edgeData?.status === 'failed';

  // Dynamic stroke color depending on status or department
  const getStrokeColor = () => {
    if (isRunning) return '#60a5fa'; // bright blue
    if (isCompleted) return '#34d399'; // bright emerald
    if (isFailed) return '#f43f5e'; // bright rose
    if (edgeData?.department === 'marketing') return '#a855f7';
    if (edgeData?.department === 'sales') return '#10b981';
    if (edgeData?.department === 'tech') return '#3b82f6';
    return (style.stroke as string) || '#64748b';
  };

  const strokeColor = getStrokeColor();

  return (
    <g className={`agent-edge-wrapper ${isRunning ? 'agent-edge-running' : ''}`}>
      {/* Invisible wider path for easier hovering */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={24}
        className="cursor-pointer"
      />

      {/* Base Visible SVG Edge */}
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: strokeColor,
          strokeWidth: isRunning || selected ? 2.5 : style.strokeWidth || 1.8,
          transition: 'stroke 0.2s ease, stroke-width 0.2s ease',
        }}
      />

      {/* Floating Edge Action Toolbar on Hover */}
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          <div className="agent-edge-toolbar flex items-center gap-1 rounded-full border border-neutral-700 bg-neutral-900/90 px-1.5 py-0.5 shadow-xl backdrop-blur-md">
            <Tooltip title="Chèn thêm Sub-Agent vào luồng" placement="top">
              <button
                type="button"
                onClick={() => edgeData?.onAddNodeBetween?.(id)}
                className="flex h-5 w-5 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-indigo-500/20 hover:text-indigo-400 active:scale-95"
              >
                <Plus size={11} />
              </button>
            </Tooltip>

            <div className="h-2.5 w-[1px] bg-neutral-700" />

            <Tooltip title="Xóa kết nối" placement="top">
              <button
                type="button"
                onClick={() => edgeData?.onDeleteEdge?.(id)}
                className="flex h-5 w-5 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-rose-500/20 hover:text-rose-400 active:scale-95"
              >
                <X size={11} />
              </button>
            </Tooltip>
          </div>
        </div>
      </EdgeLabelRenderer>
    </g>
  );
}

export const AnimatedAgentEdge = memo(AnimatedAgentEdgeComponent);
