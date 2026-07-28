'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, message, Tag, Pagination, Spin, Tooltip } from 'antd';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type NodeTypes,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Play, AlertCircle, CheckCircle2, Clock, Loader2,
  ChevronRight, ChevronDown, Activity, RefreshCw, Cpu,
  Terminal, Server, Layers, BrainCircuit, Webhook,
} from 'lucide-react';
import { useExecutionLogs } from '@/hooks/api/useAiSettings';
import type { AgentExecutionLog } from '@/types/ai-settings.types';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Map status to display colors
const statusConfig: Record<string, { color: string; label: string; icon: React.ReactNode }> = {
  PENDING: { color: 'default', label: 'Pending', icon: <Clock size={12} /> },
  RUNNING: { color: 'processing', label: 'Running', icon: <Loader2 size={12} className="animate-spin" /> },
  SUCCESS: { color: 'success', label: 'Success', icon: <CheckCircle2 size={12} /> },
  FAILED: { color: 'error', label: 'Failed', icon: <AlertCircle size={12} /> },
  CANCELLED: { color: 'warning', label: 'Cancelled', icon: <AlertCircle size={12} /> },
};

// Generate ReactFlow nodes from an execution log entry
function buildFlowNodesAndEdges(log: AgentExecutionLog): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Trigger node
  nodes.push({
    id: 'trigger',
    type: 'input',
    position: { x: 250, y: 0 },
    data: {
      label: (
        <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold">
          <Terminal size={14} />
          <span>{log.trigger || 'Manual Trigger'}</span>
        </div>
      ),
    },
    style: {
      background: '#1e1e2e',
      border: '1px solid #4F46E5',
      borderRadius: 12,
      color: '#e0e0e0',
      padding: 4,
    },
  });

  // Agent node
  nodes.push({
    id: 'agent',
    position: { x: 250, y: 120 },
    data: {
      label: (
        <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold">
          <BrainCircuit size={14} />
          <span>{log.agent?.name || `Agent ${log.agentId?.substring(0, 8)}`}</span>
        </div>
      ),
    },
    style: {
      background: '#1e1e2e',
      border: '1px solid #10B981',
      borderRadius: 12,
      color: '#e0e0e0',
      padding: 4,
    },
  });

  edges.push({
    id: 'trigger→agent',
    source: 'trigger',
    target: 'agent',
    animated: log.status === 'RUNNING',
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { stroke: '#4F46E5', strokeWidth: 2 },
  });

  // Action node
  nodes.push({
    id: 'action',
    position: { x: 250, y: 240 },
    data: {
      label: (
        <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold">
          <Play size={14} />
          <span>{log.action || 'Execute Action'}</span>
        </div>
      ),
    },
    style: {
      background: '#1e1e2e',
      border: '1px solid #F59E0B',
      borderRadius: 12,
      color: '#e0e0e0',
      padding: 4,
    },
  });

  edges.push({
    id: 'agent→action',
    source: 'agent',
    target: 'action',
    animated: log.status === 'RUNNING',
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { stroke: '#10B981', strokeWidth: 2 },
  });

  // Result node
  const statusColor = log.status === 'SUCCESS' ? '#10B981' : log.status === 'FAILED' ? '#EF4444' : '#6B7280';
  nodes.push({
    id: 'result',
    type: 'output',
    position: { x: 250, y: 360 },
    data: {
      label: (
        <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold">
          <CheckCircle2 size={14} />
          <span>{log.status === 'SUCCESS' ? 'Completed' : log.status === 'FAILED' ? 'Failed' : log.status}</span>
        </div>
      ),
    },
    style: {
      background: '#1e1e2e',
      border: `1px solid ${statusColor}`,
      borderRadius: 12,
      color: '#e0e0e0',
      padding: 4,
    },
  });

  edges.push({
    id: 'action→result',
    source: 'action',
    target: 'result',
    animated: log.status === 'RUNNING',
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { stroke: statusColor, strokeWidth: 2 },
  });

  return { nodes, edges };
}

export default function WorkflowMonitor() {
  const { t } = useTranslation();
  const [logPage, setLogPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<AgentExecutionLog | null>(null);
  const [sseConnected, setSseConnected] = useState(false);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const sseRef = useRef<EventSource | null>(null);

  const { data: logsRes, isLoading, refetch } = useExecutionLogs(logPage, 20);
  const logs = (logsRes?.data?.data || []) as AgentExecutionLog[];
  const total = logsRes?.data?.total || 0;

  // SSE connection for real-time updates
  useEffect(() => {
    const sse = new EventSource(`${apiUrl}/ai-settings/execution-logs/stream`);
    sseRef.current = sse;

    sse.onopen = () => setSseConnected(true);
    sse.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        if (parsed.type === 'LOG_UPDATE' || parsed.data) {
          refetch();
        }
      } catch { /* ignore */ }
    };
    sse.onerror = () => {
      setSseConnected(false);
    };

    return () => {
      sse.close();
      sseRef.current = null;
      setSseConnected(false);
    };
  }, [refetch]);

  // When a log is selected, build the flow graph
  useEffect(() => {
    if (selectedLog) {
      const { nodes: flowNodes, edges: flowEdges } = buildFlowNodesAndEdges(selectedLog);
      setNodes(flowNodes);
      setEdges(flowEdges);
    } else {
      setNodes([]);
      setEdges([]);
    }
  }, [selectedLog, setNodes, setEdges]);

  const handleSelectLog = useCallback((log: AgentExecutionLog) => {
    setSelectedLog(log);
  }, []);

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-6">
      {/* Title */}
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--color-fg)]">
            Workflow Monitor
          </h1>
          <p className="text-sm text-[var(--color-muted-fg)]">
            Real-time execution flow monitoring for AI agents and background jobs
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`flex items-center gap-1.5 text-[10px] font-mono ${sseConnected ? 'text-green-500' : 'text-red-500'}`}>
            <span className={`w-2 h-2 rounded-full ${sseConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            {sseConnected ? 'SSE Connected' : 'SSE Disconnected'}
          </span>
          <Button size="small" icon={<RefreshCw size={12} />} onClick={() => refetch()}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        {/* Left: Execution Logs List */}
        <div className="lg:col-span-1 bg-[var(--color-bg-tint)] border border-[var(--color-border)] rounded-2xl flex flex-col overflow-hidden">
          <div className="p-4 border-b border-[var(--color-border)]">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted-fg)]">
              {t('aiHub.executionHistory')}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Spin size="small" />
              </div>
            ) : logs.length === 0 ? (
              <p className="text-[10px] text-center py-8 text-[var(--color-muted-fg)]">
                No execution logs yet
              </p>
            ) : (
              logs.map((log) => {
                const cfg = statusConfig[log.status] || statusConfig.PENDING;
                return (
                  <div
                    key={log.id}
                    onClick={() => handleSelectLog(log)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all text-xs space-y-1.5 ${
                      selectedLog?.id === log.id
                        ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/5'
                        : 'border-[var(--color-border)] hover:bg-[var(--color-surface)]'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-mono font-semibold text-[var(--color-fg)] text-[10px]">
                        {log.action || 'Action'}
                      </span>
                      <Tag color={cfg.color as any} className="text-[9px] m-0 flex items-center gap-1">
                        {cfg.icon}
                        {cfg.label}
                      </Tag>
                    </div>
                    <p className="text-[10px] text-[var(--color-muted-fg)] line-clamp-1">
                      {log.inputSummary || log.outputSummary || '—'}
                    </p>
                    <div className="flex justify-between text-[8px] font-mono text-[var(--color-muted-fg)]">
                      <span>{log.createdAt ? new Date(log.createdAt).toLocaleString() : '—'}</span>
                      {log.durationMs !== undefined && log.durationMs !== null && (
                        <span>{log.durationMs}ms</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination */}
          <div className="p-3 border-t border-[var(--color-border)] flex justify-center">
            <Pagination
              size="small"
              current={logPage}
              total={total}
              pageSize={20}
              onChange={setLogPage}
              showSizeChanger={false}
              className="text-[10px]"
            />
          </div>
        </div>

        {/* Right: Flow Graph Canvas (2 cols) */}
        <div className="lg:col-span-2 bg-[var(--color-bg-tint)] border border-[var(--color-border)] rounded-2xl overflow-hidden flex flex-col">
          {selectedLog ? (
            <>
              {/* Selected execution header */}
              <div className="p-4 border-b border-[var(--color-border)] flex justify-between items-center shrink-0">
                <div>
                  <span className="text-xs font-semibold text-[var(--color-fg)]">
                    {selectedLog.action || 'Execution Flow'}
                  </span>
                  <p className="text-[10px] text-[var(--color-muted-fg)] font-mono">
                    ID: {selectedLog.id}
                  </p>
                </div>
                <Tag color={(statusConfig[selectedLog.status]?.color || 'default') as any}>
                  {selectedLog.status}
                </Tag>
              </div>

              {/* ReactFlow Canvas */}
              <div className="flex-1 min-h-0">
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  fitView
                  attributionPosition="bottom-left"
                  minZoom={0.5}
                  maxZoom={2}
                  defaultEdgeOptions={{
                    type: 'smoothstep',
                    animated: true,
                  }}
                >
                  <MiniMap
                    nodeColor="#1e1e2e"
                    maskColor="rgba(0,0,0,0.7)"
                    style={{ background: '#111' }}
                  />
                  <Controls />
                  <Background color="var(--color-border)" gap={20} />
                </ReactFlow>
              </div>

              {/* Output summary footer */}
              {selectedLog.outputSummary && (
                <div className="p-3 border-t border-[var(--color-border)] bg-[var(--color-surface)]/20 shrink-0">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-[var(--color-muted-fg)]">
                    Output Summary
                  </span>
                  <p className="text-[10px] text-[var(--color-fg)] mt-1 font-mono">
                    {selectedLog.outputSummary}
                  </p>
                  {selectedLog.tokensUsed !== undefined && selectedLog.tokensUsed !== null && (
                    <span className="text-[8px] text-[var(--color-muted-fg)] font-mono mt-1 block">
                      Tokens: {selectedLog.tokensUsed}
                    </span>
                  )}
                </div>
              )}
            </>
          ) : (
            /* Empty state */
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-3 max-w-sm">
                <Activity size={40} className="mx-auto text-[var(--color-muted-fg)] opacity-40" />
                <p className="text-sm text-[var(--color-muted-fg)]">
                  Select an execution log from the left panel to visualize its flow
                </p>
                <p className="text-[10px] text-[var(--color-muted-fg)] font-mono">
                  The graph shows: Trigger → Agent → Action → Result
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
