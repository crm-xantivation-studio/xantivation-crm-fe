'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, Workflow, Radio, Send, UploadCloud, FileText, 
  Sparkles, Search, Plus, Pin, Trash2, Edit2, CheckCircle2, 
  X, AlertTriangle, Paperclip, MoreVertical, Terminal, 
  Brain, HelpCircle, ArrowRight, BookOpen, Clock, Activity, Settings, Cpu, Check, Play, Server, Layers
} from 'lucide-react';
import { Button, message, Steps, Tooltip, Badge } from 'antd';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

// React Flow Imports
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// AI Settings execution logs query hook
import { useExecutionLogs } from '@/hooks/api/useAiSettings';

interface Message {
  role: 'user' | 'assistant';
  sender: 'assistant' | 'deerflow' | 'hermes' | 'user';
  content: string;
  timestamp: string;
  dividerText?: string;
}

interface Conversation {
  id: string;
  title: string;
  agentType: 'assistant' | 'deerflow' | 'hermes';
  isPinned: boolean;
  lastMessage: string;
  updatedAt: string;
  messages: Message[];
}

interface RagDoc {
  name: string;
  size: string;
  uploadedAt: string;
  status: 'indexing' | 'ready' | 'error';
}

const initialConversations: Conversation[] = [
  {
    id: 'conv-1',
    title: 'CRM Assistant introductory chat',
    agentType: 'assistant',
    isPinned: true,
    lastMessage: 'Hello! I am the CRM Assistant. How can I help you today?',
    updatedAt: '10:30',
    messages: [
      { role: 'assistant', sender: 'assistant', content: 'Hello! I am the CRM Assistant. How can I help you today?', timestamp: '10:30' }
    ]
  },
  {
    id: 'conv-2',
    title: 'Contract risk audit CON-2026-00005',
    agentType: 'deerflow',
    isPinned: true,
    lastMessage: 'Risk analysis complete. Found 2 clauses with medium risk level.',
    updatedAt: '10:15',
    messages: [
      { role: 'user', sender: 'user', content: 'Please analyze the penalty clauses in contract CON-2026-00005', timestamp: '10:14' },
      { role: 'assistant', sender: 'deerflow', content: 'Risk analysis complete. Found 2 clauses with medium risk level related to damages compensation and project handover timeline.', timestamp: '10:15' }
    ]
  },
  {
    id: 'conv-3',
    title: 'Telegram lead status notify campaign',
    agentType: 'hermes',
    isPinned: false,
    lastMessage: 'Successfully notified 5 Sales team members.',
    updatedAt: 'Yesterday',
    messages: [
      { role: 'user', sender: 'user', content: 'Send today Lead status report via Telegram', timestamp: 'Yesterday' },
      { role: 'assistant', sender: 'hermes', content: 'Successfully notified 5 Sales team members via Telegram Bot.', timestamp: 'Yesterday' }
    ]
  }
];


const slashCommands = [
  { cmd: '/create-lead', desc: 'Create new Lead in the system', agent: 'assistant' },
  { cmd: '/create-opportunity', desc: 'Create new business opportunity', agent: 'assistant' },
  { cmd: '/generate-quotation', desc: 'Generate quotation from deal history', agent: 'deerflow' },
  { cmd: '/generate-contract', desc: 'Generate legal contract draft', agent: 'deerflow' },
  { cmd: '/forecast', desc: 'Forecast sales revenue for 30 days', agent: 'deerflow' },
  { cmd: '/risk-analysis', desc: 'Analyze contract clause risks', agent: 'deerflow' },
  { cmd: '/send-telegram', desc: 'Send Telegram notification', agent: 'hermes' },
  { cmd: '/send-zalo', desc: 'Send Zalo OA notification', agent: 'hermes' }
];

const entityMentions = [
  { id: '@lead:LEAD-2026-00001', name: 'Lead: CRM Integration Project - Phan Manh' },
  { id: '@customer:ACC-2026-00001', name: 'Client Account: Xantivation Dev' },
  { id: '@opportunity:OPP-2026-00001', name: 'Opportunity: CRM Phase 1' },
  { id: '@contract:CON-2026-00001', name: 'Contract: Service Agreement - Xantivation' },
  { id: '@deal:DEAL-2026-00001', name: 'Deal: CRM Enterprise Setup' }
];

export default function AIHub() {
  const { t } = useTranslation();
  const agents = [
    { id: 'assistant', name: t('aiHub.agentAssistant'), description: t('aiHub.descAssistant'), icon: Bot, color: 'indigo', border: 'border-indigo-500/30', bg: 'bg-indigo-500/10', text: 'text-indigo-500', dot: 'bg-indigo-500' },
    { id: 'deerflow', name: t('aiHub.agentDeerflow'), description: t('aiHub.descDeerflow'), icon: Workflow, color: 'emerald', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10', text: 'text-emerald-500', dot: 'bg-emerald-500' },
    { id: 'hermes', name: t('aiHub.agentHermes'), description: t('aiHub.descHermes'), icon: Radio, color: 'amber', border: 'border-amber-500/30', bg: 'bg-amber-500/10', text: 'text-amber-500', dot: 'bg-amber-500' },
  ];
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [activeConvId, setActiveConvId] = useState('conv-1');
  const [activeAgent, setActiveAgent] = useState<'assistant' | 'deerflow' | 'hermes'>('assistant');
  const [autoRoute, setAutoRoute] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [showMentionMenu, setShowMentionMenu] = useState(false);
  const [rightPanelTab, setRightPanelTab] = useState<'execution' | 'context' | 'tools' | 'knowledge' | 'memory'>('context');
  
  // Input search fields
  const [searchConvQuery, setSearchConvQuery] = useState('');
  const [filterAgentType, setFilterAgentType] = useState('ALL');

  // Streaming mock state
  const [streamingMessage, setStreamingMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [executionStep, setExecutionStep] = useState(0);

  // RAG mock store
  const [documents, setDocuments] = useState<RagDoc[]>([
    { name: 'Xantivation_Studio_Branding_Guidelines_2026.pdf', size: '2.4 MB', uploadedAt: '2026-07-01', status: 'ready' },
    { name: 'CRM_Service_Agreement_Template.docx', size: '154 KB', uploadedAt: '2026-07-05', status: 'ready' }
  ]);

  // Memory items mock state
  const [memoryItems, setMemoryItems] = useState([
    { key: 'Client preference', value: 'Prefers VND currency for all pricing agreements.' },
    { key: 'Payment policy', value: 'Defaults to 50% deposit / 50% delivery terms.' },
    { key: 'Support contact', value: 'Primary legal counsel is contact@xantivation.com.' }
  ]);

  // --- AI Settings Workflow States ---
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'chat' | 'workflow'>('chat');
  const [selectedExecutionLog, setSelectedExecutionLog] = useState<any>(null);
  const [liveLogs, setLiveLogs] = useState<any[]>([]);

  // API Execution Log queries
  const [logPage, setLogPage] = useState(1);
  const { data: dbLogsRes, refetch: refetchExecutionLogs } = useExecutionLogs(logPage, 20);
  const dbLogsList = dbLogsRes?.data?.data || [];

  // SSE Listener for real-time workflow monitoring events
  useEffect(() => {
    if (activeWorkspaceTab !== 'workflow') return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
    const sseUrl = `${apiUrl}/ai-settings/execution-logs/stream`;
    let eventSource: EventSource | null = null;

    try {
      eventSource = new EventSource(sseUrl);
      eventSource.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          setLiveLogs((prev) => [parsed, ...prev].slice(0, 100));
          refetchExecutionLogs();
          message.info(t('aiHub.workflowNotification', { agent: parsed.agentName || t('aiHub.aiAgent'), status: parsed.status }));
        } catch (e) {}
      };
    } catch (e) {}

    return () => {
      if (eventSource) eventSource.close();
    };
  }, [activeWorkspaceTab, refetchExecutionLogs]);

  const activeConv = conversations.find(c => c.id === activeConvId) || conversations[0];
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv?.messages, streamingMessage]);

  // Handle command triggering or selection
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);

    // Show popup lists dynamically
    if (val.endsWith('/')) {
      setShowSlashMenu(true);
      setShowMentionMenu(false);
    } else if (val.includes('/') && !val.endsWith(' ')) {
      setShowSlashMenu(true);
    } else {
      setShowSlashMenu(false);
    }

    if (val.endsWith('@')) {
      setShowMentionMenu(true);
      setShowSlashMenu(false);
    } else if (val.includes('@') && !val.endsWith(' ')) {
      setShowMentionMenu(true);
    } else {
      setShowMentionMenu(false);
    }
  };

  const handleSelectSlashCommand = (cmd: string, agent: string) => {
    setInputValue(cmd + ' ');
    setShowSlashMenu(false);
    if (autoRoute) {
      setActiveAgent(agent as any);
      message.info(t('aiHub.autoModeSwitched', { agent: agent.toUpperCase() }));
    }
  };

  const handleSelectMention = (mentionId: string) => {
    const parts = inputValue.split('@');
    parts[parts.length - 1] = mentionId;
    setInputValue(parts.join('') + ' ');
    setShowMentionMenu(false);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim() || loading) return;

    const prompt = inputValue.trim();
    setInputValue('');
    setShowSlashMenu(false);
    setShowMentionMenu(false);

    // Add user message
    const updatedMessages = [
      ...activeConv.messages,
      {
        role: 'user' as const,
        sender: 'user' as const,
        content: prompt,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];

    setConversations(
      conversations.map(c => 
        c.id === activeConv.id 
          ? { ...c, messages: updatedMessages, lastMessage: prompt, updatedAt: t('aiHub.justNow') }
          : c
      )
    );

    setLoading(true);
    setStreamingMessage('');
    setExecutionStep(1); // planner active

    // Simulate Agent Step-by-Step execution (vertical stepper updates)
    let currentStep = 1;
    const interval = setInterval(() => {
      currentStep++;
      setExecutionStep(Math.min(currentStep, 7));
    }, 400);

    // Call real backend SSE streaming API
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
    const sseUrl = `${apiUrl}/integrations/ai-hub/chat?prompt=${encodeURIComponent(prompt)}&agent=${activeAgent}`;
    
    let eventSource: EventSource | null = null;
    let accumulatedText = '';
    let hasReceivedData = false;

    try {
      eventSource = new EventSource(sseUrl);
      
      eventSource.onmessage = (event) => {
        hasReceivedData = true;
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.content) {
            accumulatedText += parsed.content;
            setStreamingMessage(accumulatedText);
          }
        } catch (err) {
          // fallback to reading raw text if not JSON
          accumulatedText += event.data;
          setStreamingMessage(accumulatedText);
        }
      };

      eventSource.onerror = () => {
        if (eventSource) eventSource.close();
        clearInterval(interval);
        
        if (hasReceivedData) {
          // Stream completed successfully or ended
          finalizeChat(accumulatedText, updatedMessages);
        } else {
          // Backend offline or error, fallback to client mock simulation
          triggerAiResponseFallback(prompt, updatedMessages);
        }
      };
    } catch (e) {
      clearInterval(interval);
      triggerAiResponseFallback(prompt, updatedMessages);
    }
  };

  const finalizeChat = (content: string, messageHistory: Message[]) => {
    setConversations(
      conversations.map(c => 
        c.id === activeConv.id 
          ? {
              ...c,
              messages: [
                ...messageHistory,
                {
                  role: 'assistant',
                  sender: activeAgent,
                  content,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
              ],
              lastMessage: content.substring(0, 60) + '...',
              updatedAt: 'Just now'
            }
          : c
      )
    );
    setStreamingMessage('');
    setLoading(false);
    setExecutionStep(8); // completed
  };

  const triggerAiResponseFallback = (prompt: string, messageHistory: Message[]) => {
    let responseText = `I have received your request "${prompt}". As a ${activeAgent === 'assistant' ? t('aiHub.agentAssistant') : activeAgent === 'deerflow' ? t('aiHub.agentDeerflow') : t('aiHub.agentHermes')}, I am analyzing the relevant resources...`;
    
    if (prompt.startsWith('/forecast')) {
      responseText = `### 30-Day Revenue Forecast Report (Weighted Forecast)
Based on Xantivation Studio's pipeline and opportunity probabilities:

| Stage | Count | Total Value (VND) | Weight (%) | Forecast Value |
|---|---|---|---|---|
| Discovery | 5 | 120,000,000 | 10% | 12,000,000 |
| Proposal | 3 | 450,000,000 | 50% | 225,000,000 |
| Negotiation | 2 | 200,000,000 | 80% | 160,000,000 |
| **Total** | **10** | **770,000,000** | - | **397,000,000 VND** |

Actual cash flow forecast peaks on 05/08/2026 when the acceptance milestone for the **CRM Setup** opportunity is completed.`;
    } else if (prompt.startsWith('/risk-analysis')) {
      responseText = `### Contract Legal Risk Review Results
I have reviewed the agreement file and found:
- **Payment Terms**: Missing late payment penalty clause (Overdue interest rate). *Risk Level: Medium*.
- **Liability Limitations**: Studio's compensation liability is not limited to 100% of the actual contract value. *Risk Level: High*.

*Recommendation*: Add liability limitation clause in Section 7.2 before activating DocuSign to send to partner.`;
    }

    let words = responseText.split(' ');
    let wordIdx = 0;
    let accumulatedText = '';
    
    const streamInterval = setInterval(() => {
      if (wordIdx < words.length) {
        accumulatedText += words[wordIdx] + ' ';
        setStreamingMessage(accumulatedText);
        wordIdx++;
      } else {
        clearInterval(streamInterval);
        finalizeChat(accumulatedText, messageHistory);
      }
    }, 60);
  };

  const handleCreateNewChat = () => {
    const newId = `conv-${Date.now()}`;
    const newChat: Conversation = {
      id: newId,
      title: t('aiHub.newChatTitle', { count: conversations.length + 1 }),
      agentType: activeAgent,
      isPinned: false,
      lastMessage: t('aiHub.newChatActiveMessage', { agent: activeAgent.toUpperCase() }),
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      messages: [
        {
          role: 'assistant',
          sender: activeAgent,
          content: t('aiHub.newChatWelcome', { agentName: agents.find(a => a.id === activeAgent)?.name }),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]
    };
    setConversations([newChat, ...conversations]);
    setActiveConvId(newId);
    message.success(t('aiHub.newConversationInit'));
  };

  const handlePinChat = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConversations(
      conversations.map(c => c.id === id ? { ...c, isPinned: !c.isPinned } : c)
    );
    message.success(t('aiHub.conversationStatusUpdated'));
  };

  const handleDeleteChat = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (conversations.length <= 1) {
      message.error(t('aiHub.atLeastOneConversation'));
      return;
    }
    const remaining = conversations.filter(c => c.id !== id);
    setConversations(remaining);
    if (activeConvId === id) {
      setActiveConvId(remaining[0].id);
    }
    message.warning(t('aiHub.conversationDeleted'));
  };

  const handleUploadRag = () => {
    message.loading(t('aiHub.scanningPdf'));
    setTimeout(() => {
      setDocuments([
        ...documents,
        { name: `Sales_Brief_Draft_${documents.length + 1}.pdf`, size: '820 KB', uploadedAt: new Date().toISOString().substring(0, 10), status: 'ready' }
      ]);
      message.success(t('aiHub.vectorMappingSuccess'));
    }, 1500);
  };

  // Filter conversations
  const filteredConversations = conversations.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchConvQuery.toLowerCase()) || 
                          c.lastMessage.toLowerCase().includes(searchConvQuery.toLowerCase());
    const matchesAgent = filterAgentType === 'ALL' || c.agentType === filterAgentType;
    return matchesSearch && matchesAgent;
  });

  const pinnedConvs = filteredConversations.filter(c => c.isPinned);
  const recentConvs = filteredConversations.filter(c => !c.isPinned);

  const selectedAgentData = agents.find(a => a.id === activeAgent) || agents[0];

  return (
    <div className="h-full w-full flex overflow-hidden">
      {/* Column 1: Conversations History Sidebar */}
      <div className="w-80 flex flex-col bg-[var(--color-bg)] border-r border-[var(--color-border)] shrink-0">
        
        {/* Title Header (Merged into Sidebar) */}
        <div className="p-4 border-b border-[var(--color-border)] shrink-0 bg-[var(--color-bg)]">
          <h1 className="text-base font-bold text-[var(--color-fg)] flex items-center gap-2">
            <span>{t('aiHub.title')}</span>
            <span className="text-[10px] bg-[var(--color-accent)]/10 text-[var(--color-accent)] px-1.5 py-0.5 rounded-md border border-[var(--color-accent)]/20 font-mono">
              {t('aiHub.v3Pipeline')}
            </span>
          </h1>
          <p className="text-[11px] text-[var(--color-muted-fg)] mt-1">{t('aiHub.subtitle')}</p>
        </div>

        {/* Header search & create */}
        <div className="p-3 border-b border-[var(--color-border)] space-y-2 shrink-0 bg-[var(--color-surface)]/30">
          <div className="flex justify-between items-center px-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted-fg)] font-semibold">
              {t('aiHub.chatHistory')}
            </span>
            <button
              onClick={handleCreateNewChat}
              className="flex items-center gap-1 text-[10px] font-semibold text-[var(--color-accent)] hover:underline cursor-pointer"
            >
              <Plus size={12} />
              <span>{t('aiHub.newChat')}</span>
              </button>
            </div>

            <div className="flex items-center gap-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-2.5 py-1.5">
              <Search size={14} className="text-[var(--color-muted-fg)]" />
              <input
                type="text"
                placeholder={t('aiHub.searchChats')}
                value={searchConvQuery}
                onChange={(e) => setSearchConvQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-xs text-[var(--color-fg)] placeholder-[var(--color-muted-fg)] w-full"
              />
            </div>

            {/* Agent filter tab dropdown */}
            <select
              value={filterAgentType}
              onChange={(e) => setFilterAgentType(e.target.value)}
              className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] p-1.5 rounded-lg text-[10px] text-[var(--color-fg)] outline-none"
            >
              <option value="ALL">{t('aiHub.allAgents')}</option>
              <option value="assistant">{t('aiHub.filterAssistant')}</option>
              <option value="deerflow">{t('aiHub.filterDeerflow')}</option>
              <option value="hermes">{t('aiHub.filterHermes')}</option>
            </select>
          </div>

          {/* Conversations list container */}
          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {/* Pinned section */}
            {pinnedConvs.length > 0 && (
              <div className="space-y-1">
                <p className="text-[9px] font-mono text-[var(--color-muted-fg)] uppercase px-2 flex items-center gap-1">
                  <Pin size={10} className="rotate-45" /> {t('aiHub.pinned')}
                </p>
                {pinnedConvs.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => setActiveConvId(c.id)}
                    className={`group w-full p-2.5 rounded-xl border text-left cursor-pointer transition-all flex items-start gap-2 relative ${
                      activeConvId === c.id
                        ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/5'
                        : 'border-transparent hover:bg-[var(--color-surface)]'
                    }`}
                  >
                    <span className={`p-1.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] ${
                      c.agentType === 'assistant' ? 'text-indigo-500' : c.agentType === 'deerflow' ? 'text-emerald-500' : 'text-amber-500'
                    }`}>
                      {c.agentType === 'assistant' ? <Bot size={12} /> : c.agentType === 'deerflow' ? <Workflow size={12} /> : <Radio size={12} />}
                    </span>
                    <div className="truncate flex-1">
                      <p className="text-xs font-semibold text-[var(--color-fg)] truncate pr-4">{c.title}</p>
                      <p className="text-[10px] text-[var(--color-muted-fg)] truncate mt-0.5">{c.lastMessage}</p>
                    </div>
                    <div className="absolute right-2 top-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => handlePinChat(c.id, e)} className="p-0.5 text-[var(--color-muted-fg)] hover:text-[var(--color-fg)]">
                        <Pin size={10} className="rotate-45" />
                      </button>
                      <button onClick={(e) => handleDeleteChat(c.id, e)} className="p-0.5 text-red-500 hover:text-red-700">
                        <Trash2 size={10} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Recent section */}
            <div className="space-y-1">
              <p className="text-[9px] font-mono text-[var(--color-muted-fg)] uppercase px-2">{t('aiHub.recentChats')}</p>
              {recentConvs.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setActiveConvId(c.id)}
                  className={`group w-full p-2.5 rounded-xl border text-left cursor-pointer transition-all flex items-start gap-2 relative ${
                    activeConvId === c.id
                      ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/5'
                      : 'border-transparent hover:bg-[var(--color-surface)]'
                  }`}
                >
                  <span className={`p-1.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] ${
                    c.agentType === 'assistant' ? 'text-indigo-500' : c.agentType === 'deerflow' ? 'text-emerald-500' : 'text-amber-500'
                  }`}>
                    {c.agentType === 'assistant' ? <Bot size={12} /> : c.agentType === 'deerflow' ? <Workflow size={12} /> : <Radio size={12} />}
                  </span>
                  <div className="truncate flex-1">
                    <p className="text-xs font-semibold text-[var(--color-fg)] truncate pr-4">{c.title}</p>
                    <p className="text-[10px] text-[var(--color-muted-fg)] truncate mt-0.5">{c.lastMessage}</p>
                  </div>
                  <div className="absolute right-2 top-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => handlePinChat(c.id, e)} className="p-0.5 text-[var(--color-muted-fg)] hover:text-[var(--color-fg)]">
                      <Pin size={10} />
                    </button>
                    <button onClick={(e) => handleDeleteChat(c.id, e)} className="p-0.5 text-red-500 hover:text-red-700">
                      <Trash2 size={10} />
                    </button>
                  </div>
                </div>
              ))}
              {recentConvs.length === 0 && pinnedConvs.length === 0 && (
                <p className="text-[10px] text-[var(--color-muted-fg)] text-center py-4">{t('aiHub.noConversations')}</p>
              )}
            </div>
          </div>
        </div>

        {/* Column 2: Chat Panel (Center) */}
        <div className="flex-1 flex flex-col relative bg-[var(--color-bg-tint)]">
          {/* Top Selector Bar */}
          <div className="p-3 border-b border-[var(--color-border)] bg-[var(--color-surface)]/20 flex items-center justify-between gap-4 shrink-0">
            <div className="flex gap-2">
              {agents.map((agent) => {
                const Icon = agent.icon;
                const isSelected = activeAgent === agent.id;
                return (
                  <button
                    key={agent.id}
                    onClick={() => {
                      setActiveAgent(agent.id as any);
                      // Add system divider when switching agents mid-conversation
                      if (activeConv.messages.length > 0 && activeConv.messages[activeConv.messages.length - 1].sender !== agent.id) {
                        setConversations(
                          conversations.map(c => 
                            c.id === activeConv.id 
                              ? {
                                  ...c,
                                  messages: [
                                    ...c.messages,
                                    {
                                      role: 'assistant',
                                      sender: agent.id as any,
                                      content: t('aiHub.switchedDivider', { agentName: agent.name }),
                                      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                      dividerText: t('aiHub.switchedTo', { name: agent.name })
                                    }
                                  ]
                                }
                              : c
                          )
                        );
                      }
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? `border-${agent.color}-500 bg-${agent.color}-500/10 ${agent.text} shadow-sm`
                        : 'border-[var(--color-border)] hover:bg-[var(--color-surface)] text-[var(--color-muted-fg)]'
                    }`}
                  >
                    <Icon size={12} />
                    <span>{agent.name.split(' ')[0]}</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                  </button>
                );
              })}
            </div>

            {/* Auto Mode Mode Toggle */}
            <div className="flex items-center gap-2 border-l border-[var(--color-border)] pl-4">
              <span className="text-[10px] font-mono text-[var(--color-muted-fg)] uppercase">{t('aiHub.autoMode')}</span>
              <button
                onClick={() => setAutoRoute(!autoRoute)}
                className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                  autoRoute 
                    ? 'border-indigo-500/30 bg-indigo-500/10 text-indigo-500' 
                    : 'border-[var(--color-border)] text-[var(--color-muted-fg)]'
                }`}
                title={t('aiHub.autoRouteTitle')}
              >
                <Sparkles size={13} />
              </button>
            </div>
          </div>

          {/* Agent Status Bar */}
          <div className="bg-[var(--color-bg)]/40 px-6 py-2 border-b border-[var(--color-border)]/50 text-[10px] font-mono text-[var(--color-muted-fg)] flex justify-between items-center">
            <span className="flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${selectedAgentData.dot}`} />
              <span>{t('aiHub.activeRouting', { name: selectedAgentData.name })}</span>
            </span>
            <span>{t('aiHub.sseConnection')}</span>
          </div>

          {/* Messages Console */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6 min-h-0 bg-[var(--color-bg)]/20">
            {activeConv.messages.map((msg, idx) => {
              if (msg.dividerText) {
                return (
                  <div key={idx} className="flex justify-center my-4">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-[var(--color-muted-fg)] bg-[var(--color-surface)] border border-[var(--color-border)] px-3 py-1 rounded-full flex items-center gap-1.5">
                      <Terminal size={10} />
                      {msg.dividerText}
                    </span>
                  </div>
                );
              }

              const isUser = msg.role === 'user';
              const agentData = agents.find(a => a.id === msg.sender);
              const Icon = agentData?.icon || Bot;

              return (
                <div key={idx} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
                  {!isUser && (
                    <span className={`p-2 rounded-xl h-9 w-9 flex items-center justify-center shrink-0 border border-[var(--color-border)] ${agentData?.bg} ${agentData?.text}`}>
                      <Icon size={16} />
                    </span>
                  )}

                  <div className={`max-w-[75%] space-y-1`}>
                    <div className="flex items-center gap-2 px-1">
                      <span className="text-[10px] font-semibold text-[var(--color-fg)]">
                        {isUser ? t('aiHub.you') : agentData?.name}
                      </span>
                      <span className="text-[8px] font-mono text-[var(--color-muted-fg)]">
                        {msg.timestamp}
                      </span>
                    </div>

                    <div className={`p-4 rounded-[5px] text-xs leading-relaxed ${
                      isUser
                        ? 'bg-[var(--color-accent)] text-white shadow-sm rounded-tr-none'
                        : `bg-[var(--color-surface)] text-[var(--color-fg)] border border-[var(--color-border)] rounded-tl-none border-l-4 ${agentData?.border || 'border-indigo-500/30'}`
                    }`}>
                      {/* Simple custom markdown renderer for tables & lists */}
                      {msg.content.includes('|') ? (
                        <div className="space-y-3 overflow-x-auto">
                          <p className="font-semibold">{msg.content.split('\n')[0]}</p>
                          <table className="min-w-full divide-y divide-[var(--color-border)] text-[10px]">
                            <thead>
                              <tr className="bg-[var(--color-bg)]">
                                {msg.content.split('\n')[2].split('|').filter(x => x.trim()).map((cell, cIdx) => (
                                  <th key={cIdx} className="px-2 py-1.5 text-left font-mono font-bold uppercase">{cell.trim()}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--color-border)]/50">
                              {msg.content.split('\n').slice(4).filter(line => line.includes('|')).map((line, lIdx) => (
                                <tr key={lIdx}>
                                  {line.split('|').filter(x => x.trim()).map((cell, cIdx) => (
                                    <td key={cIdx} className="px-2 py-1.5 font-mono">{cell.trim()}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="whitespace-pre-line">{msg.content}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Streaming block display */}
            {streamingMessage && (
              <div className="flex gap-3 justify-start">
                <span className={`p-2 rounded-xl h-9 w-9 flex items-center justify-center shrink-0 border border-[var(--color-border)] ${selectedAgentData.bg} ${selectedAgentData.text}`}>
                  {React.createElement(selectedAgentData.icon, { size: 16 })}
                </span>
                <div className="max-w-[75%] space-y-1">
                  <div className="flex items-center gap-2 px-1">
                    <span className="text-[10px] font-semibold text-[var(--color-fg)]">
                      {selectedAgentData.name}
                    </span>
                    <span className="text-[8px] font-mono text-[var(--color-muted-fg)]">{t('aiHub.streaming')}</span>
                  </div>
                  <div className={`p-4 rounded-[5px] text-xs leading-relaxed bg-[var(--color-surface)] text-[var(--color-fg)] border border-[var(--color-border)] rounded-tl-none border-l-4 ${selectedAgentData.border}`}>
                    <p className="whitespace-pre-line">{streamingMessage}</p>
                    <span className="inline-block w-1.5 h-3.5 bg-[var(--color-accent)] animate-pulse ml-0.5" />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Autocomplete overlays */}
          <div className="relative">
            {showSlashMenu && (
              <div className="absolute bottom-4 left-4 right-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-lg p-2 max-h-[160px] overflow-y-auto z-50 text-xs">
                <p className="text-[9px] font-mono uppercase tracking-widest text-[var(--color-muted-fg)] px-3 py-1 border-b border-[var(--color-border)]/50">{t('aiHub.slashCommands')}</p>
                {slashCommands.map((item) => (
                  <div
                    key={item.cmd}
                    onClick={() => handleSelectSlashCommand(item.cmd, item.agent)}
                    className="p-2 hover:bg-[var(--color-bg)] rounded-lg cursor-pointer flex justify-between items-center"
                  >
                    <span className="font-mono font-semibold text-[var(--color-accent)]">{item.cmd}</span>
                    <span className="text-[10px] text-[var(--color-muted-fg)]">{item.desc} ({item.agent})</span>
                  </div>
                ))}
              </div>
            )}

            {showMentionMenu && (
              <div className="absolute bottom-4 left-4 right-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-lg p-2 max-h-[160px] overflow-y-auto z-50 text-xs">
                <p className="text-[9px] font-mono uppercase tracking-widest text-[var(--color-muted-fg)] px-3 py-1 border-b border-[var(--color-border)]/50">{t('aiHub.referenceCrmEntities')}</p>
                {entityMentions.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelectMention(item.id)}
                    className="p-2 hover:bg-[var(--color-bg)] rounded-lg cursor-pointer flex justify-between items-center"
                  >
                    <span className="font-mono font-semibold text-indigo-500">{item.id}</span>
                    <span className="text-[10px] text-[var(--color-muted-fg)]">{item.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Chat input block */}
          <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-bg-tint)] flex items-center gap-3 shrink-0">
            {/* mini selector */}
            <div className="relative">
              <span className={`p-2.5 rounded-xl border border-[var(--color-border)] flex items-center justify-center bg-[var(--color-surface)] ${selectedAgentData.text}`}>
                {React.createElement(selectedAgentData.icon, { size: 14 })}
              </span>
            </div>

            <input
              type="text"
              placeholder={t('aiHub.inputPlaceholder', { name: selectedAgentData.name })}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-xs text-[var(--color-fg)] placeholder-[var(--color-muted-fg)] focus:outline-none focus:border-[var(--color-accent)] transition-all"
            />

            <button
              onClick={handleUploadRag}
              className="p-2.5 text-[var(--color-muted-fg)] hover:text-[var(--color-fg)] hover:bg-[var(--color-surface)] rounded-xl transition-all cursor-pointer"
              title={t('aiHub.attachDocument')}
            >
              <Paperclip size={14} />
            </button>

            <button
              onClick={handleSendMessage}
              disabled={loading}
              className="p-2.5 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white rounded-xl transition-all cursor-pointer disabled:opacity-50"
            >
              <Send size={14} />
            </button>
          </div>
        </div>

        {/* Column 3: Right Panel Context / Steppers */}
        <div className="w-80 bg-[var(--color-bg)] border-l border-[var(--color-border)] flex flex-col overflow-hidden shrink-0">
          {/* Tabs header */}
          <div className="flex border-b border-[var(--color-border)] p-1.5 gap-0.5 bg-[var(--color-bg)] overflow-x-auto shrink-0 scrollbar-none">
            {[
              { id: 'context' },
              { id: 'execution' },
              { id: 'tools' },
              { id: 'knowledge' },
              { id: 'memory' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setRightPanelTab(tab.id as any)}
                className={`px-2.5 py-1 text-[9px] font-mono uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                  rightPanelTab === tab.id
                    ? 'bg-[var(--color-bg)] text-[var(--color-fg)] border border-[var(--color-border)] font-bold'
                    : 'text-[var(--color-muted-fg)] hover:text-[var(--color-fg)]'
                }`}
              >
                {tab.id === 'context' ? t('aiHub.tabContext') : tab.id === 'execution' ? t('aiHub.tabExec') : tab.id === 'tools' ? t('aiHub.tabTools') : tab.id === 'knowledge' ? t('aiHub.tabRag') : t('aiHub.tabMemory')}
              </button>
            ))}
          </div>

          {/* Panel content body */}
          <div className="flex-1 p-4 overflow-y-auto text-xs space-y-4 min-h-0">
            
            {rightPanelTab === 'context' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted-fg)]">
                    {t('aiHub.activeBusinessContext')}
                  </h4>
                  <span className="text-[8px] bg-green-500/10 text-green-500 px-1.5 py-0.5 rounded font-mono font-bold">
                    {t('aiHub.detected')}
                  </span>
                </div>

                <div className="p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl space-y-2">
                  <p className="text-[9px] font-mono text-[var(--color-muted-fg)] uppercase">{t('aiHub.accountContext')}</p>
                  <p className="font-semibold text-[var(--color-fg)]">CyberCore LLC</p>
                  <p className="text-[10px] text-[var(--color-muted-fg)]">{t('aiHub.clientInfo', { taxCode: '010928811' })}</p>
                  <div className="flex gap-2 pt-1 border-t border-[var(--color-border)]/50 mt-2">
                    <Link href="/customers" className="text-[10px] text-[var(--color-accent)] hover:underline flex items-center gap-0.5 font-bold">
                      <span>{t('aiHub.viewAccount')}</span>
                      <ArrowRight size={10} />
                    </Link>
                  </div>
                </div>

                <div className="p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl space-y-2">
                  <p className="text-[9px] font-mono text-[var(--color-muted-fg)] uppercase">{t('aiHub.linkedDealScore')}</p>
                  <p className="font-semibold text-[var(--color-fg)]">CyberCore Brand Strategy Setup</p>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-[var(--color-muted-fg)]">{t('aiHub.bantStatus')}</span>
                    <span className="font-mono text-emerald-500 font-bold">{t('aiHub.percentQualified')}</span>
                  </div>
                </div>
              </div>
            )}

            {rightPanelTab === 'execution' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted-fg)]">
                    {t('aiHub.agentWorkflowSteps')}
                  </h4>
                  {loading && <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />}
                </div>

                <Steps
                  direction="vertical"
                  size="small"
                  current={executionStep - 1}
                  items={[
                    { title: t('aiHub.stepReceive'), description: t('aiHub.stepDescParser') },
                    { title: t('aiHub.stepPlanning'), description: t('aiHub.stepDescAssign') },
                    { title: t('aiHub.stepSearchDb'), description: t('aiHub.stepDescQuery') },
                    { title: t('aiHub.stepExecuteSql'), description: t('aiHub.stepDescRetrieve') },
                    { title: t('aiHub.stepInvokeGroq'), description: t('aiHub.stepDescInference') },
                    { title: t('aiHub.stepSidecar'), description: t('aiHub.stepDescWeights') },
                    { title: t('aiHub.stepFormat'), description: t('aiHub.stepDescTables') },
                    { title: t('aiHub.stepFinalize'), description: t('aiHub.stepDescDispatch') },
                  ]}
                  className="text-xs"
                />
              </div>
            )}

            {rightPanelTab === 'tools' && (
              <div className="space-y-3">
                <h4 className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted-fg)] mb-2">
                  {t('aiHub.executedCrmTools')}
                </h4>

                {[
                  { name: 'queryDatabase', status: 'success', time: '142ms', desc: 'Queried opportunities and clients matches' },
                  { name: 'estimateRevenue', status: 'success', time: '89ms', desc: 'Simulated cash flow weighting formulas' },
                  { name: 'vectorRAGSearch', status: 'success', time: '210ms', desc: 'Matched context terms with indexed files' }
                ].map((tool, idx) => (
                  <div key={idx} className="p-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-mono font-bold text-[var(--color-accent)]">{tool.name}</span>
                      <span className="text-[8px] font-mono text-[var(--color-muted-fg)]">{tool.time}</span>
                    </div>
                    <p className="text-[10px] text-[var(--color-muted-fg)]">{tool.desc}</p>
                    <span className="text-[8px] bg-green-500/10 text-green-500 px-1.5 py-0.2 rounded font-mono font-bold inline-block">{t('aiHub.success')}</span>
                  </div>
                ))}
              </div>
            )}

            {rightPanelTab === 'knowledge' && (
              <div className="space-y-4">
                <h4 className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted-fg)]">
                  {t('aiHub.vectorKnowledgeRag')}
                </h4>

                <div
                  onClick={handleUploadRag}
                  className="border-2 border-dashed border-[var(--color-border)] hover:border-[var(--color-accent)] rounded-xl p-4 text-center cursor-pointer transition-colors"
                >
                  <UploadCloud size={20} className="mx-auto text-[var(--color-muted-fg)] mb-1" />
                  <p className="text-[10px] font-semibold text-[var(--color-fg)]">{t('aiHub.addPdfReference')}</p>
                </div>

                <div className="space-y-2">
                  {documents.map((doc, idx) => (
                    <div key={idx} className="p-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl space-y-1">
                      <div className="flex items-center gap-1.5 truncate">
                        <FileText size={10} className="text-[var(--color-accent)]" />
                        <span className="font-bold truncate text-[10px]">{doc.name}</span>
                      </div>
                      <div className="flex justify-between text-[9px] text-[var(--color-muted-fg)]">
                        <span>{doc.size}</span>
                        <span className="text-green-500 font-bold">{t('aiHub.ready')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {rightPanelTab === 'memory' && (
              <div className="space-y-3">
                <h4 className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted-fg)]">
                  {t('aiHub.agentMemoryItems')}
                </h4>

                {memoryItems.map((item, idx) => (
                  <div key={idx} className="p-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl space-y-1">
                    <p className="font-bold text-[10px] text-[var(--color-fg)]">{item.key}</p>
                    <p className="text-[10px] text-[var(--color-muted-fg)] leading-relaxed">{item.value}</p>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>

    </div>
  );
}
