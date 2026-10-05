const fs = require('fs');
const path = require('path');

// 1. Update canvasData.ts layout (Spacious Hierarchical Layout as per User Image)
const dataPath = path.join('src', 'components', 'content', 'canvas', 'canvasData.ts');
let dataCode = fs.readFileSync(dataPath, 'utf8');

const newNodesStr = `export const INITIAL_NODES: Node[] = [
  // Gateway CEO (Top Center)
  {
    id: 'hermes',
    type: 'agentNode',
    position: { x: 800, y: 50 },
    data: {
      slug: 'hermes',
      name: 'Hermes Master Gateway (CEO)',
      role: 'CEO_GATEWAY',
      agentType: 'gateway',
      department: null,
      status: 'idle',
      isActive: true,
      model: 'Groq / Claude 3.7',
      toolsets: ['delegation'],
    },
  },

  // === MARKETING DEPARTMENT CLUSTER ===
  {
    id: 'cluster-marketing',
    type: 'departmentCluster',
    position: { x: 50, y: 250 },
    style: { width: 500, height: 800 },
    data: {
      department: 'marketing',
      title: 'Ban Marketing (CMO Unit)',
      agentCount: 5,
      isActive: true,
      isCollapsed: false,
      memberIds: [
        'hermes-marketing-lead',
        'mkt-researcher',
        'mkt-writer-01',
        'mkt-writer-02',
        'mkt-auditor',
        'tool-mkt-web',
        'tool-mkt-file',
      ],
    },
  },
  {
    id: 'hermes-marketing-lead',
    type: 'agentNode',
    parentId: 'cluster-marketing',
    position: { x: 125, y: 50 },
    data: {
      slug: 'hermes-marketing-lead',
      name: 'CMO Marketing Lead',
      role: 'department_lead',
      agentType: 'department_lead',
      department: 'marketing',
      status: 'idle',
      isActive: true,
      toolsets: ['delegation', 'web', 'file'],
    },
  },
  {
    id: 'mkt-researcher',
    type: 'agentNode',
    parentId: 'cluster-marketing',
    position: { x: 125, y: 220 },
    data: {
      slug: 'mkt-researcher',
      name: 'Market Researcher Sub-Agent',
      role: 'researcher',
      agentType: 'sub_agent',
      department: 'marketing',
      status: 'idle',
      isActive: true,
      toolsets: ['web', 'file'],
    },
  },
  {
    id: 'tool-mkt-web',
    type: 'toolSlotNode',
    parentId: 'cluster-marketing',
    position: { x: 15, y: 350 },
    data: {
      toolType: 'web',
      name: 'Web Scraper',
      description: 'Tìm kiếm dữ liệu thị trường',
      parentAgentSlug: 'mkt-researcher',
    },
  },
  {
    id: 'tool-mkt-file',
    type: 'toolSlotNode',
    parentId: 'cluster-marketing',
    position: { x: 300, y: 350 },
    data: {
      toolType: 'file',
      name: 'Vector DB',
      description: 'Lưu trữ tài liệu và insight',
      parentAgentSlug: 'mkt-researcher',
    },
  },
  {
    id: 'mkt-writer-01',
    type: 'agentNode',
    parentId: 'cluster-marketing',
    position: { x: 125, y: 460 },
    data: {
      slug: 'mkt-writer-01',
      name: 'Copywriter #1 (PAS/BAB)',
      role: 'copywriter',
      agentType: 'sub_agent',
      department: 'marketing',
      status: 'idle',
      isActive: true,
      toolsets: ['file'],
    },
  },
  {
    id: 'mkt-auditor',
    type: 'agentNode',
    parentId: 'cluster-marketing',
    position: { x: 125, y: 640 },
    data: {
      slug: 'mkt-auditor',
      name: 'Brand Voice Auditor Sub-Agent',
      role: 'auditor',
      agentType: 'sub_agent',
      department: 'marketing',
      status: 'idle',
      isActive: true,
      toolsets: ['file'],
    },
  },
  {
    id: 'mkt-writer-02',
    type: 'agentNode',
    position: { x: -1000, y: -1000 },
    hidden: true,
    data: {
      slug: 'mkt-writer-02',
      name: 'Copywriter #2 (Case/Contrarian)',
      role: 'copywriter',
      agentType: 'sub_agent',
      department: 'marketing',
      status: 'idle',
      isActive: true,
      toolsets: ['file'],
    },
  },

  // === SALES DEPARTMENT CLUSTER ===
  {
    id: 'cluster-sales',
    type: 'departmentCluster',
    position: { x: 650, y: 250 },
    style: { width: 500, height: 800 },
    data: {
      department: 'sales',
      title: 'Ban Kinh Doanh & Sales',
      agentCount: 4,
      isActive: false,
      isCollapsed: false,
      memberIds: ['hermes-sales-lead', 'sales-lead-scorer', 'sales-chat-advisor', 'sales-quotation-drafter'],
    },
  },
  {
    id: 'hermes-sales-lead',
    type: 'agentNode',
    parentId: 'cluster-sales',
    position: { x: 125, y: 50 },
    data: {
      slug: 'hermes-sales-lead',
      name: 'Head of Sales Lead',
      role: 'department_lead',
      agentType: 'department_lead',
      department: 'sales',
      status: 'idle',
      isActive: false,
      toolsets: ['delegation', 'http_tool'],
    },
  },
  {
    id: 'sales-lead-scorer',
    type: 'agentNode',
    parentId: 'cluster-sales',
    position: { x: 20, y: 250 },
    data: {
      slug: 'sales-lead-scorer',
      name: 'Lead Scoring Sub-Agent',
      role: 'scorer',
      agentType: 'sub_agent',
      department: 'sales',
      status: 'idle',
      isActive: false,
      toolsets: ['http_tool'],
    },
  },
  {
    id: 'sales-chat-advisor',
    type: 'agentNode',
    parentId: 'cluster-sales',
    position: { x: 240, y: 400 },
    data: {
      slug: 'sales-chat-advisor',
      name: 'Chat Sales Advisor Sub-Agent',
      role: 'advisor',
      agentType: 'sub_agent',
      department: 'sales',
      status: 'idle',
      isActive: false,
      toolsets: ['web'],
    },
  },
  {
    id: 'sales-quotation-drafter',
    type: 'agentNode',
    parentId: 'cluster-sales',
    position: { x: 20, y: 580 },
    data: {
      slug: 'sales-quotation-drafter',
      name: 'Quotation Drafter Sub-Agent',
      role: 'drafter',
      agentType: 'sub_agent',
      department: 'sales',
      status: 'idle',
      isActive: false,
      toolsets: ['http_tool', 'file'],
    },
  },

  // === TECH DEPARTMENT CLUSTER ===
  {
    id: 'cluster-tech',
    type: 'departmentCluster',
    position: { x: 1250, y: 250 },
    style: { width: 500, height: 800 },
    data: {
      department: 'tech',
      title: 'Ban Kỹ Thuật & Dự Án',
      agentCount: 3,
      isActive: false,
      isCollapsed: false,
      memberIds: ['hermes-tech-lead', 'tech-estimator', 'tech-code-reviewer'],
    },
  },
  {
    id: 'hermes-tech-lead',
    type: 'agentNode',
    parentId: 'cluster-tech',
    position: { x: 125, y: 50 },
    data: {
      slug: 'hermes-tech-lead',
      name: 'CTO / Tech Lead',
      role: 'department_lead',
      agentType: 'department_lead',
      department: 'tech',
      status: 'idle',
      isActive: false,
      toolsets: ['delegation', 'http_tool'],
    },
  },
  {
    id: 'tech-estimator',
    type: 'agentNode',
    parentId: 'cluster-tech',
    position: { x: 240, y: 250 },
    data: {
      slug: 'tech-estimator',
      name: 'Tech Estimator Sub-Agent',
      role: 'estimator',
      agentType: 'sub_agent',
      department: 'tech',
      status: 'idle',
      isActive: false,
      toolsets: ['file'],
    },
  },
  {
    id: 'tech-code-reviewer',
    type: 'agentNode',
    parentId: 'cluster-tech',
    position: { x: 20, y: 450 },
    data: {
      slug: 'tech-code-reviewer',
      name: 'Code Quality Reviewer Sub-Agent',
      role: 'reviewer',
      agentType: 'sub_agent',
      department: 'tech',
      status: 'idle',
      isActive: false,
      toolsets: ['file'],
    },
  },
];`;

dataCode = dataCode.replace(/export const INITIAL_NODES: Node\[\] = \[([\s\S]*?)\];/, newNodesStr);
fs.writeFileSync(dataPath, dataCode);

// 2. Remove opacity-0 from Handles in AgentNode.tsx so they are always visible
const agentNodePath = path.join('src', 'components', 'content', 'canvas', 'AgentNode.tsx');
let agentNodeCode = fs.readFileSync(agentNodePath, 'utf8');

agentNodeCode = agentNodeCode.replace(
  /className="!h-3 !w-3 !border-2 !border-neutral-950 !bg-indigo-400 transition-transform hover:scale-125 !-top-1\.5 opacity-0 group-hover:opacity-100"/g,
  'className="!h-3 !w-3 !border-2 !border-neutral-950 !bg-indigo-400 transition-transform hover:scale-125 !-top-1.5"'
);

agentNodeCode = agentNodeCode.replace(
  /className="!h-3 !w-3 !border-2 !border-neutral-950 !bg-emerald-400 transition-transform hover:scale-125 !-bottom-1\.5 opacity-0 group-hover:opacity-100"/g,
  'className="!h-3 !w-3 !border-2 !border-neutral-950 !bg-emerald-400 transition-transform hover:scale-125 !-bottom-1.5"'
);

fs.writeFileSync(agentNodePath, agentNodeCode);

console.log('Successfully applied spacious hierarchical layout and fixed handle visibility.');
