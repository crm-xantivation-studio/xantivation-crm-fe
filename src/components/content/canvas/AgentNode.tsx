'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import {
  Crown,
  Search,
  PenTool,
  ShieldCheck,
  Target,
  MessageSquare,
  FileSpreadsheet,
  Calculator,
  Code2,
  Cpu,
  Sparkles,
  Bot,
  Terminal,
  Globe,
  GitBranch,
  FileText,
  Link as LinkIcon,
  Wrench,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Tooltip } from 'antd';
import { AgentNodeToolbar } from './AgentNodeToolbar';

export interface AgentNodeData {
  id?: string;
  slug: string;
  name: string;
  role: string;
  agentType: 'gateway' | 'department_lead' | 'sub_agent';
  department: 'marketing' | 'sales' | 'tech' | null;
  status: 'idle' | 'running' | 'completed' | 'failed';
  isActive: boolean;
  model?: string;
  lastGoal?: string;
  toolCallName?: string;
  durationMs?: number;
  toolsets?: string[];
  onRun?: (slug: string) => void;
  onDetail?: (data: AgentNodeData) => void;
  onToggleActive?: (slug: string) => void;
  onDelete?: (slug: string) => void;
}

const getRoleIcon = (slug: string, role: string, agentType: string) => {
  if (agentType === 'gateway' || slug === 'hermes' || role === 'CEO_GATEWAY') {
    return <Crown className="h-5 w-5 text-amber-400" />;
  }
  if (agentType === 'department_lead') {
    return <Sparkles className="h-5 w-5 text-purple-400" />;
  }
  if (slug.includes('researcher') || role.includes('researcher')) {
    return <Search className="h-5 w-5 text-emerald-400" />;
  }
  if (slug.includes('writer') || role.includes('copywriter')) {
    return <PenTool className="h-5 w-5 text-sky-400" />;
  }
  if (slug.includes('auditor') || role.includes('auditor')) {
    return <ShieldCheck className="h-5 w-5 text-pink-400" />;
  }
  if (slug.includes('scorer')) return <Target className="h-5 w-5 text-rose-400" />;
  if (slug.includes('advisor')) return <MessageSquare className="h-5 w-5 text-indigo-400" />;
  if (slug.includes('drafter')) return <FileSpreadsheet className="h-5 w-5 text-teal-400" />;
  if (slug.includes('estimator')) return <Calculator className="h-5 w-5 text-orange-400" />;
  if (slug.includes('reviewer')) return <Code2 className="h-5 w-5 text-cyan-400" />;
  return <Bot className="h-5 w-5 text-neutral-400" />;
};

const getToolIcon = (toolName: string) => {
  switch (toolName) {
    case 'delegation':
      return <GitBranch className="h-3 w-3 text-purple-400" />;
    case 'web':
      return <Globe className="h-3 w-3 text-emerald-400" />;
    case 'http_tool':
      return <LinkIcon className="h-3 w-3 text-blue-400" />;
    case 'file':
      return <FileText className="h-3 w-3 text-amber-400" />;
    default:
      return <Wrench className="h-3 w-3 text-neutral-400" />;
  }
};

const getStatusBadge = (status: AgentNodeData['status']) => {
  switch (status) {
    case 'running':
      return (
        <span className="flex items-center gap-1.5 rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-semibold text-blue-400 border border-blue-500/40">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          Running
        </span>
      );
    case 'completed':
      return (
        <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/30">
          <CheckCircle2 size={11} className="text-emerald-400" />
          Done
        </span>
      );
    case 'failed':
      return (
        <span className="flex items-center gap-1 rounded-full bg-rose-500/15 px-2 py-0.5 text-[10px] font-semibold text-rose-400 border border-rose-500/30">
          <AlertCircle size={11} className="text-rose-400" />
          Failed
        </span>
      );
    default:
      return (
        <span className="flex items-center gap-1 rounded-full bg-neutral-800/80 px-2 py-0.5 text-[10px] font-medium text-neutral-400 border border-neutral-700/50">
          <span className="inline-flex rounded-full h-1.5 w-1.5 bg-neutral-500"></span>
          Idle
        </span>
      );
  }
};

function AgentNodeComponent({ data, selected }: NodeProps) {
  const nodeData = data as unknown as AgentNodeData;
  const isGateway = nodeData.agentType === 'gateway';
  const isLead = nodeData.agentType === 'department_lead';
  const isRunning = nodeData.status === 'running';
  const toolsets = nodeData.toolsets || [];

  const getDepartmentColor = () => {
    if (isGateway) return 'amber';
    if (nodeData.department === 'marketing') return 'purple';
    if (nodeData.department === 'sales') return 'emerald';
    if (nodeData.department === 'tech') return 'blue';
    return 'neutral';
  };

  const deptColor = getDepartmentColor();

  const getBorderStyles = () => {
    if (isGateway) {
      return 'border-amber-500/60 bg-gradient-to-b from-amber-950/20 via-neutral-900/95 to-neutral-950/95 shadow-amber-500/10';
    }
    if (isLead) {
      if (deptColor === 'purple') return 'border-purple-500/50 bg-gradient-to-b from-purple-950/20 via-neutral-900/95 to-neutral-950/95 shadow-purple-500/10';
      if (deptColor === 'emerald') return 'border-emerald-500/50 bg-gradient-to-b from-emerald-950/20 via-neutral-900/95 to-neutral-950/95 shadow-emerald-500/10';
      return 'border-blue-500/50 bg-gradient-to-b from-blue-950/20 via-neutral-900/95 to-neutral-950/95 shadow-blue-500/10';
    }
    // Sub-agents
    if (deptColor === 'purple') return 'border-purple-500/30 hover:border-purple-400/60 bg-neutral-900/95';
    if (deptColor === 'emerald') return 'border-emerald-500/30 hover:border-emerald-400/60 bg-neutral-900/95';
    if (deptColor === 'blue') return 'border-blue-500/30 hover:border-blue-400/60 bg-neutral-900/95';
    return 'border-neutral-800 hover:border-neutral-700 bg-neutral-900/95';
  };

  return (
    <div
      className={`agent-node-card group relative select-none rounded-2xl border p-3.5 transition-all duration-200 ${
        isGateway
          ? 'min-w-[250px] max-w-[270px]'
          : isLead
          ? 'min-w-[230px] max-w-[250px]'
          : 'min-w-[210px] max-w-[230px]'
      } ${getBorderStyles()} ${
        isRunning ? 'agent-node-running ring-2 ring-blue-500/80' : ''
      } ${selected ? 'ring-2 ring-indigo-400 shadow-indigo-500/20' : ''} ${
        !nodeData.isActive ? 'opacity-40 grayscale-[50%]' : ''
      }`}
    >
      {/* Floating Action Toolbar on Node Hover */}
      <AgentNodeToolbar
        agentName={nodeData.name}
        isActive={nodeData.isActive}
        onRun={() => nodeData.onRun?.(nodeData.slug)}
        onDetail={() => nodeData.onDetail?.(nodeData)}
        onToggleActive={() => nodeData.onToggleActive?.(nodeData.slug)}
        onDelete={() => nodeData.onDelete?.(nodeData.slug)}
      />

      {/* Clean Single Input Handle (Top) */}
      <Handle
        type="target"
        position={Position.Top}
        className="!h-3 !w-3 !border-2 !border-neutral-950 !bg-indigo-400 transition-transform hover:scale-125 !-top-1.5"
      />

      {/* Card Header: n8n Square Icon + Name & Status */}
      <div className="flex items-start gap-2.5 mb-2">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border shadow-inner ${
            isGateway
              ? 'border-amber-500/40 bg-amber-500/20'
              : isLead
              ? 'border-purple-500/40 bg-purple-500/20'
              : 'border-neutral-700/60 bg-neutral-800/90'
          }`}
        >
          {getRoleIcon(nodeData.slug, nodeData.role, nodeData.agentType)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className="font-mono text-[9px] font-semibold text-neutral-400 truncate">
              {nodeData.slug}
            </span>
            {getStatusBadge(nodeData.status)}
          </div>
          <div className="text-xs font-bold text-neutral-100 truncate leading-snug mt-0.5">
            {nodeData.name}
          </div>
        </div>
      </div>

      {/* Live Activity / Goal / Tool Call */}
      <div className="mb-2 rounded-lg bg-neutral-950/80 border border-neutral-800/70 px-2 py-1.5 text-[10px] leading-tight text-neutral-300">
        {nodeData.toolCallName ? (
          <div className="flex items-center gap-1.5 font-mono text-[10px] text-cyan-400">
            <Terminal size={11} className="shrink-0 animate-spin" />
            <span className="truncate">{nodeData.toolCallName}</span>
          </div>
        ) : (
          <span className="line-clamp-2 text-neutral-300 font-sans">
            {nodeData.lastGoal || nodeData.role}
          </span>
        )}
      </div>

      {/* Toolset Badges (Clean n8n style without extra handle dots) */}
      {toolsets.length > 0 && (
        <div className="mb-2 flex items-center gap-1 flex-wrap">
          {toolsets.map((tool, idx) => (
            <Tooltip key={idx} title={`Công cụ tích hợp: ${tool}`} placement="top">
              <div className="flex items-center gap-1 rounded bg-neutral-950 border border-neutral-800/80 px-1.5 py-0.5 text-[9px] text-neutral-400 font-mono">
                {getToolIcon(tool)}
                <span className="capitalize">{tool}</span>
              </div>
            </Tooltip>
          ))}
        </div>
      )}

      {/* Footer Meta: Model Pill + Department Tag */}
      <div className="flex items-center justify-between border-t border-neutral-800/60 pt-1.5 text-[9px] text-neutral-400 font-mono">
        <div className="flex items-center gap-1 rounded bg-neutral-800/60 px-1.5 py-0.5 border border-neutral-700/40 text-[9px] truncate max-w-[120px]">
          <Cpu size={10} className="shrink-0 text-neutral-400" />
          <span className="truncate">
            {typeof nodeData.model === 'object' && nodeData.model !== null
              ? (nodeData.model as any).displayName || (nodeData.model as any).modelName || 'Groq / LLM'
              : String(nodeData.model || 'Groq / LLM')}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {nodeData.durationMs ? (
            <span className="text-emerald-400 font-semibold">
              {(nodeData.durationMs / 1000).toFixed(1)}s
            </span>
          ) : (
            <span className="capitalize text-neutral-500">
              {nodeData.department || 'Gateway'}
            </span>
          )}
        </div>
      </div>

      {/* Clean Single Output Handle (Bottom) */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-2.5 !w-2.5 !border-2 !border-neutral-950 !bg-indigo-400 transition-transform hover:scale-125 !-bottom-1.5"
      />
    </div>
  );
}

export const AgentNode = memo(AgentNodeComponent);

