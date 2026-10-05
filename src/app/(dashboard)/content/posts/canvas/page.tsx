'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
  Node,
  Edge,
  Connection,
  addEdge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import '@/components/content/canvas/canvas.css';

import { Card, Button, Tag, Badge, Tooltip, message, Segmented, Input } from 'antd';
import {
  Play,
  Pause,
  RefreshCw,
  Layers,
  ArrowLeft,
  Shuffle,
  Maximize2,
  Sparkles,
  FileText,
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

import { AgentNode, AgentNodeData } from '@/components/content/canvas/AgentNode';
import { DepartmentCluster } from '@/components/content/canvas/DepartmentCluster';
import { ToolSlotNode } from '@/components/content/canvas/ToolSlotNode';
import { AnimatedAgentEdge } from '@/components/content/canvas/AnimatedAgentEdge';
import {
  CanvasContextMenu,
  ContextMenuState,
} from '@/components/content/canvas/CanvasContextMenu';
import AgentDetailDrawer from '@/components/content/canvas/AgentDetailDrawer';
import { PromptTriggerModal } from '@/components/content/canvas/PromptTriggerModal';
import { ExecutionProgressPanel } from '@/components/content/canvas/ExecutionProgressPanel';
import { ExecutionResultDrawer } from '@/components/content/canvas/ExecutionResultDrawer';

import { INITIAL_NODES, INITIAL_EDGES } from '@/components/content/canvas/canvasData';
import { useCanvasSSE, CanvasExecutionEvent } from '@/hooks/useCanvasSSE';
import { useAgents } from '@/hooks/api/useAiSettings';
import { useCanvasKeyboard } from '@/hooks/useCanvasKeyboard';
import { useGroupDrag } from '@/hooks/useGroupDrag';
import { useCanvasExecution } from '@/hooks/useCanvasExecution';

const nodeTypes = {
  agentNode: AgentNode,
  departmentCluster: DepartmentCluster,
  toolSlotNode: ToolSlotNode,
};

const edgeTypes = {
  animatedAgentEdge: AnimatedAgentEdge,
};

function CanvasInner() {
  const [nodes, setNodes, onNodesChange] = useNodesState(INITIAL_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(INITIAL_EDGES);
  const [selectedAgent, setSelectedAgent] = useState<AgentNodeData | null>(null);
  const [viewMode, setViewMode] = useState<'architecture' | 'runtime' | 'executions'>('runtime');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals and Panels State
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [isResultDrawerOpen, setIsResultDrawerOpen] = useState(false);
  const [isProgressPanelVisible, setIsProgressPanelVisible] = useState(false);

  // Group Drag Synchronization Hook
  const { onNodeDragStart, onNodeDrag, onNodeDragStop } = useGroupDrag(nodes, setNodes);

  // Context Menu State
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    isOpen: false,
    x: 0,
    y: 0,
    type: 'canvas',
  });

  const { fitView, zoomIn, zoomOut, setViewport, getNodes } = useReactFlow();

  // SSE Stream
  const { events, latestEvent, isConnected, isPaused, pause, resume, clearEvents } =
    useCanvasSSE();

  // Execution Orchestrator Hook
  const {
    isExecuting,
    executionPhase,
    generatedPost,
    elapsedSeconds,
    triggerExecution,
    approvePost,
    regeneratePost,
    resetExecution,
  } = useCanvasExecution();

  // Load Seeded Agent Data from CRM API
  const { data: dbAgents } = useAgents();

  // Node Action Handlers
  const handleRunAgent = useCallback(
    (slug: string) => {
      if (slug === 'hermes' || slug === 'hermes-marketing-lead') {
        setIsPromptModalOpen(true);
      } else {
        message.info(`Đang kích hoạt tác vụ riêng cho Agent: ${slug}`);
      }
    },
    []
  );

  const handleOpenDetail = useCallback((agentData: AgentNodeData) => {
    setSelectedAgent(agentData);
  }, []);

  const handleToggleActive = useCallback(
    (slug: string) => {
      setNodes((prev) =>
        prev.map((n) => {
          if (n.id === slug || (n.data as any).slug === slug) {
            const newActive = !(n.data as any).isActive;
            message.success(
              `${newActive ? 'Đã kích hoạt' : 'Đã tắt'} Agent: ${(n.data as any).name || slug}`
            );
            return {
              ...n,
              data: { ...n.data, isActive: newActive },
            };
          }
          return n;
        })
      );
    },
    [setNodes]
  );

  const handleDeleteNode = useCallback(
    (slug: string) => {
      setNodes((prev) => prev.filter((n) => n.id !== slug && (n.data as any).slug !== slug));
      setEdges((prev) => prev.filter((e) => e.source !== slug && e.target !== slug));
      message.success(`Đã xóa Agent ${slug} khỏi Canvas`);
    },
    [setNodes, setEdges]
  );

  // Cluster Action Handlers (Collapse / Expand)
  const handleToggleClusterCollapse = useCallback(
    (clusterId: string) => {
      setNodes((prev) => {
        const cluster = prev.find((n) => n.id === clusterId);
        if (!cluster) return prev;
        const willCollapse = !(cluster.data as any).isCollapsed;

        return prev.map((n) => {
          if (n.id === clusterId) {
            return {
              ...n,
              style: {
                ...n.style,
                height: willCollapse ? 70 : n.id === 'cluster-marketing' ? 350 : 430,
              },
              data: {
                ...n.data,
                isCollapsed: willCollapse,
              },
            };
          }
          // Hide/Show member nodes
          if (n.parentId === clusterId) {
            return {
              ...n,
              hidden: willCollapse,
            };
          }
          return n;
        });
      });
    },
    [setNodes]
  );

  const handleToggleClusterActive = useCallback(
    (department: string) => {
      setNodes((prev) =>
        prev.map((n) => {
          if ((n.data as any).department === department) {
            return {
              ...n,
              data: {
                ...n.data,
                isActive: !(n.data as any).isActive,
              },
            };
          }
          return n;
        })
      );
      message.success(`Đã thay đổi trạng thái hoạt động của ban: ${department}`);
    },
    [setNodes]
  );

  // Edge Action Handlers
  const handleAddNodeBetween = useCallback((edgeId: string) => {
    message.info(`Tính năng chèn Sub-Agent vào luồng (Edge: ${edgeId})`);
  }, []);

  const handleDeleteEdge = useCallback(
    (edgeId: string) => {
      setEdges((prev) => prev.filter((e) => e.id !== edgeId));
      message.success('Đã xóa kết nối');
    },
    [setEdges]
  );

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: 'animatedAgentEdge',
            animated: true,
            style: { stroke: '#a855f7', strokeWidth: 2 },
          },
          eds
        )
      ),
    [setEdges]
  );

  // Tidy Up / Auto Layout
  const handleAutoLayout = useCallback(() => {
    setNodes(INITIAL_NODES);
    setEdges(INITIAL_EDGES);
    setTimeout(() => {
      fitView({ duration: 400, padding: 0.2 });
    }, 50);
    message.success('Đã tự động sắp xếp lại vị trí toàn bộ Agent Canvas (Tidy Up)');
  }, [fitView, setNodes, setEdges]);

  // Context Menu Action Dispatcher
  const handleContextMenuAction = useCallback(
    (action: string, targetId?: string, targetData?: any) => {
      switch (action) {
        case 'detail':
          if (targetData) setSelectedAgent(targetData);
          break;
        case 'run':
          if (targetId) handleRunAgent(targetId);
          break;
        case 'toggleActive':
          if (targetId) handleToggleActive(targetId);
          break;
        case 'copySlug':
          if (targetData?.slug || targetId) {
            navigator.clipboard.writeText(targetData?.slug || targetId || '');
            message.success('Đã sao chép mã Slug vào Clipboard');
          }
          break;
        case 'delete':
          if (targetId) handleDeleteNode(targetId);
          break;
        case 'toggleClusterCollapse':
          if (targetId) handleToggleClusterCollapse(targetId);
          break;
        case 'toggleClusterActive':
          if (targetData?.department) handleToggleClusterActive(targetData.department);
          break;
        case 'fitView':
          fitView({ duration: 300, padding: 0.2 });
          break;
        case 'autoLayout':
          handleAutoLayout();
          break;
        case 'collapseAllClusters':
          ['cluster-marketing', 'cluster-sales', 'cluster-tech'].forEach((cid) =>
            handleToggleClusterCollapse(cid)
          );
          break;
        case 'expandAllClusters':
          setNodes((prev) =>
            prev.map((n) => {
              if (n.type === 'departmentCluster') {
                return {
                  ...n,
                  style: {
                    ...n.style,
                    height: n.id === 'cluster-marketing' ? 350 : 430,
                  },
                  data: { ...n.data, isCollapsed: false },
                };
              }
              return { ...n, hidden: false };
            })
          );
          break;
        case 'refresh':
          clearEvents();
          resetExecution();
          setNodes(INITIAL_NODES);
          setEdges(INITIAL_EDGES);
          message.success('Đã làm mới Canvas');
          break;
        default:
          break;
      }
    },
    [
      handleRunAgent,
      handleToggleActive,
      handleDeleteNode,
      handleToggleClusterCollapse,
      handleToggleClusterActive,
      fitView,
      handleAutoLayout,
      setNodes,
      setEdges,
      clearEvents,
      resetExecution,
    ]
  );

  // Keyboard Shortcuts Hook (n8n standard)
  useCanvasKeyboard({
    onFitView: () => fitView({ duration: 300, padding: 0.2 }),
    onZoomIn: () => zoomIn({ duration: 200 }),
    onZoomOut: () => zoomOut({ duration: 200 }),
    onResetZoom: () => setViewport({ x: 0, y: 0, zoom: 1 }, { duration: 200 }),
    onDeleteSelected: () => {
      const selected = getNodes().filter((n) => n.selected);
      if (selected.length > 0) {
        selected.forEach((n) => handleDeleteNode(n.id));
      }
    },
    onSelectAll: () => {
      setNodes((prev) => prev.map((n) => ({ ...n, selected: true })));
    },
    onAutoLayout: handleAutoLayout,
  });

  // Handle Pipeline Submission from Modal
  const handleExecutePrompt = async (
    prompt: string,
    options: {
      autoPublish: boolean;
      autonomous: boolean;
      framework?: 'PAS' | 'AIDA' | 'BAB' | '4P' | 'StoryBrand' | 'auto';
      targetAudience?: string;
      tone?: string;
    }
  ) => {
    setIsPromptModalOpen(false);
    setIsProgressPanelVisible(true);

    // Step 1: Animate Gateway & Marketing Pipeline to running
    setNodes((prev) =>
      prev.map((n) => {
        if (
          n.id === 'hermes' ||
          n.id === 'hermes-marketing-lead' ||
          n.id === 'mkt-researcher'
        ) {
          return {
            ...n,
            data: { ...n.data, status: 'running', lastGoal: prompt.slice(0, 60) },
          };
        }
        return n;
      })
    );

    // Step 2: Trigger AI execution
    await triggerExecution(prompt, options);

    // Step 3: Mark nodes completed
    setNodes((prev) =>
      prev.map((n) => {
        if (
          n.id === 'hermes' ||
          n.id === 'hermes-marketing-lead' ||
          n.id === 'mkt-researcher' ||
          n.id === 'mkt-writer-01' ||
          n.id === 'mkt-auditor'
        ) {
          return {
            ...n,
            data: { ...n.data, status: 'completed' },
          };
        }
        return n;
      })
    );
  };

  // Inject callbacks into nodes data
  useEffect(() => {
    setNodes((prev) =>
      prev.map((node) => {
        if (node.type === 'agentNode') {
          return {
            ...node,
            data: {
              ...node.data,
              onRun: handleRunAgent,
              onDetail: handleOpenDetail,
              onToggleActive: handleToggleActive,
              onDelete: handleDeleteNode,
            },
          };
        }
        if (node.type === 'departmentCluster') {
          return {
            ...node,
            data: {
              ...node.data,
              onToggleCollapse: handleToggleClusterCollapse,
              onToggleActive: handleToggleClusterActive,
              onOpenContextMenu: (e: React.MouseEvent, cid: string) => {
                setContextMenu({
                  isOpen: true,
                  x: e.clientX,
                  y: e.clientY,
                  type: 'cluster',
                  targetId: cid,
                  targetData: node.data,
                });
              },
            },
          };
        }
        return node;
      })
    );
  }, [
    handleRunAgent,
    handleOpenDetail,
    handleToggleActive,
    handleDeleteNode,
    handleToggleClusterCollapse,
    handleToggleClusterActive,
    setNodes,
  ]);

  // Inject callbacks into edges data
  useEffect(() => {
    setEdges((prev) =>
      prev.map((edge) => ({
        ...edge,
        data: {
          ...edge.data,
          onAddNodeBetween: handleAddNodeBetween,
          onDeleteEdge: handleDeleteEdge,
        },
      }))
    );
  }, [handleAddNodeBetween, handleDeleteEdge, setEdges]);

  // Synchronize DB agent metadata into nodes
  useEffect(() => {
    if (dbAgents && Array.isArray(dbAgents)) {
      setNodes((prevNodes) =>
        prevNodes.map((node) => {
          if (node.type === 'agentNode') {
            const dbAgent = dbAgents.find(
              (a: any) => a.slug === node.id || a.slug === (node.data as any).slug
            );
            if (dbAgent) {
              return {
                ...node,
                data: {
                  ...node.data,
                  name: dbAgent.name,
                  role: dbAgent.role,
                  department: dbAgent.department,
                  agentType: dbAgent.agentType,
                  isActive: dbAgent.isActive,
                  toolsets: dbAgent.toolsets || (node.data as any).toolsets || [],
                  model:
                    typeof dbAgent.model === 'object' && dbAgent.model !== null
                      ? (dbAgent.model as any).displayName ||
                        (dbAgent.model as any).modelName ||
                        'Groq / LLM'
                      : String(dbAgent.model || 'Groq / LLM'),
                },
              };
            }
          }
          return node;
        })
      );
    }
  }, [dbAgents, setNodes]);

  // Realtime update node and edge status when SSE events arrive
  useEffect(() => {
    if (!latestEvent) return;

    // Update node status
    setNodes((prevNodes) =>
      prevNodes.map((node) => {
        if (
          node.type === 'agentNode' &&
          (node.id === latestEvent.subagentId ||
            (node.data as any).slug === latestEvent.subagentId)
        ) {
          return {
            ...node,
            data: {
              ...node.data,
              status: latestEvent.status,
              lastGoal: latestEvent.goal || (node.data as any).lastGoal,
              toolCallName: latestEvent.toolCallName,
              durationMs: latestEvent.metadata?.durationMs,
            },
          };
        }
        return node;
      })
    );

    // Update edge status
    setEdges((prevEdges) =>
      prevEdges.map((edge) => {
        if (
          edge.target === latestEvent.subagentId ||
          edge.source === latestEvent.subagentId
        ) {
          return {
            ...edge,
            data: {
              ...edge.data,
              status: latestEvent.status,
            },
          };
        }
        return edge;
      })
    );
  }, [latestEvent, setNodes, setEdges]);

  // Context Menu Handlers
  const onNodeContextMenu = useCallback((e: MouseEvent | React.MouseEvent, node: Node) => {
    e.preventDefault();
    setContextMenu({
      isOpen: true,
      x: e.clientX,
      y: e.clientY,
      type: 'node',
      targetId: node.id,
      targetData: node.data,
    });
  }, []);

  const onPaneContextMenu = useCallback((e: MouseEvent | React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({
      isOpen: true,
      x: e.clientX,
      y: e.clientY,
      type: 'canvas',
    });
  }, []);

  const onPaneClick = useCallback(() => {
    if (contextMenu.isOpen) {
      setContextMenu((prev) => ({ ...prev, isOpen: false }));
    }
  }, [contextMenu.isOpen]);

  // Stats calculation
  const runningCount = useMemo(
    () =>
      nodes.filter(
        (n) => n.type === 'agentNode' && (n.data as any).status === 'running'
      ).length,
    [nodes]
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45 }}
      className="flex flex-col select-none h-full w-full relative"
    >
      {/* Top Header Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-900/90 backdrop-blur-md border border-neutral-800 rounded-xl p-3.5 shadow-xl shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/content/posts">
            <Button icon={<ArrowLeft size={14} />} size="small" className="rounded-lg">
              Quay Lại
            </Button>
          </Link>
          <div>
            <h1 className="text-base font-semibold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-500" />
              Hermes Agent Canvas — Giám Sát & Kích Hoạt Tự Chủ Realtime
            </h1>
            <p className="text-[11px] text-neutral-400">
              Mô hình 3 Ban Doanh Nghiệp (Marketing, Sales, Tech) với 13 Agents & Sub-Agents tự chủ.
            </p>
          </div>
        </div>

        {/* Realtime Status Badge & Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
          {/* Main Trigger Button */}
          <Button
            type="primary"
            icon={<Sparkles size={14} />}
            onClick={() => setIsPromptModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-xs h-8 shadow-md shadow-indigo-500/20"
          >
            Kích Hoạt Hermes Pipeline
          </Button>

          {generatedPost && (
            <Button
              icon={<FileText size={14} className="text-emerald-400" />}
              onClick={() => setIsResultDrawerOpen(true)}
              className="bg-neutral-900 border-emerald-500/40 text-emerald-300 rounded-xl text-xs h-8"
            >
              Xem Bài Viết Đã Tạo
            </Button>
          )}

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-neutral-900 border border-neutral-800 text-[11px]">
            <Badge status={isConnected ? 'processing' : 'default'} />
            <span className={isConnected ? 'text-emerald-400 font-medium' : 'text-neutral-500'}>
              {isConnected ? 'SSE Live Stream' : 'Chưa kết nối SSE'}
            </span>
            {runningCount > 0 && (
              <Tag color="blue" className="ml-1 text-[10px] rounded">
                {runningCount} running
              </Tag>
            )}
          </div>

          <Tooltip title={isPaused ? 'Tiếp tục nhận luồng sự kiện' : 'Tạm dừng luồng sự kiện'}>
            <Button
              size="small"
              icon={isPaused ? <Play size={12} className="text-emerald-500" /> : <Pause size={12} />}
              onClick={isPaused ? resume : pause}
              className="rounded-lg text-xs"
            >
              {isPaused ? 'Tiếp Tục' : 'Tạm Dừng'}
            </Button>
          </Tooltip>

          <Tooltip title="Tự động sắp xếp sơ đồ ngay hàng thẳng lối (Shift+Alt+T)">
            <Button
              size="small"
              icon={<Shuffle size={12} className="text-indigo-400" />}
              onClick={handleAutoLayout}
              className="rounded-lg text-xs"
            >
              Tidy Up
            </Button>
          </Tooltip>

          <Tooltip title="Thu phóng vừa màn hình (Phím 1)">
            <Button
              size="small"
              icon={<Maximize2 size={12} />}
              onClick={() => fitView({ duration: 300, padding: 0.2 })}
              className="rounded-lg text-xs"
            >
              Fit View
            </Button>
          </Tooltip>

          <Button
            size="small"
            icon={<RefreshCw size={12} />}
            onClick={() => {
              clearEvents();
              resetExecution();
              setNodes(INITIAL_NODES);
              setEdges(INITIAL_EDGES);
            }}
            className="rounded-lg text-xs"
          >
            Làm Mới
          </Button>
        </div>
      </div>

      {/* Main ReactFlow Canvas */}
      <Card
        styles={{ body: { height: '100%', padding: 0 } }}
        className="flex-1 w-full h-full overflow-hidden p-0 m-0 border-0 rounded-none bg-neutral-950 shadow-none relative"
      >
        <div style={{ width: '100%', height: '100%' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeDragStart={onNodeDragStart}
            onNodeDrag={onNodeDrag}
            onNodeDragStop={onNodeDragStop}
            onNodeContextMenu={onNodeContextMenu}
            onPaneContextMenu={onPaneContextMenu}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            snapToGrid
            snapGrid={[20, 20]}
            minZoom={0.15}
            maxZoom={2.5}
            connectionRadius={60}
            panOnScroll
            className="bg-neutral-950"
          >
            <Background color="#334155" gap={20} size={1} />
            <Controls className="!bg-neutral-900 !border-neutral-800 !text-neutral-300 rounded-xl" />
            <MiniMap
              nodeStrokeColor="#64748b"
              nodeColor="#1e293b"
              maskColor="rgba(0, 0, 0, 0.75)"
              className="!bg-neutral-900 !border-neutral-800 rounded-xl"
              pannable
              zoomable
            />
          </ReactFlow>
        </div>

        {/* Floating Execution Progress Panel */}
        <ExecutionProgressPanel
          visible={isProgressPanelVisible}
          isExecuting={isExecuting}
          events={events}
          elapsedSeconds={elapsedSeconds}
          onOpenResult={() => setIsResultDrawerOpen(true)}
          onClose={() => setIsProgressPanelVisible(false)}
          hasResult={!!generatedPost}
        />

        {/* Floating Canvas Footer Legend & Quick Shortcuts */}
        <div className="absolute bottom-4 left-4 z-10 bg-neutral-900/90 backdrop-blur-md border border-neutral-800 rounded-xl px-3.5 py-2 flex items-center gap-4 text-[11px] text-neutral-300 shadow-xl">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-amber-500/50 shadow-sm"></span>
            <span>Gateway CEO</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-purple-500/50 shadow-sm"></span>
            <span>Ban Marketing (Active)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 opacity-60"></span>
            <span>Ban Sales (Khung)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 opacity-60"></span>
            <span>Ban Kỹ Thuật (Khung)</span>
          </div>
          <div className="h-3 w-[1px] bg-neutral-700" />
          <span className="text-[10px] text-neutral-500">
            Phím tắt: [1] Fit | [+/-] Zoom | [Chuột phải] Menu | [Del] Xóa
          </span>
        </div>
      </Card>

      {/* Canvas Floating Context Menu */}
      <CanvasContextMenu
        menuState={contextMenu}
        onClose={() => setContextMenu((prev) => ({ ...prev, isOpen: false }))}
        onAction={handleContextMenuAction}
      />

      {/* Agent Detail Drawer */}
      <AgentDetailDrawer
        agent={selectedAgent}
        events={events}
        open={!!selectedAgent}
        onClose={() => setSelectedAgent(null)}
      />

      {/* Prompt Trigger Modal */}
      <PromptTriggerModal
        open={isPromptModalOpen}
        onClose={() => setIsPromptModalOpen(false)}
        onSubmit={handleExecutePrompt}
        isLoading={isExecuting}
      />

      {/* Execution Result Drawer */}
      <ExecutionResultDrawer
        open={isResultDrawerOpen}
        onClose={() => setIsResultDrawerOpen(false)}
        postData={generatedPost}
        onApprove={approvePost}
        onRegenerate={regeneratePost}
      />
    </motion.div>
  );
}

export default function CanvasDashboardPage() {
  return (
    <ReactFlowProvider>
      <CanvasInner />
    </ReactFlowProvider>
  );
}
