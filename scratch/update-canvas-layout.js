const fs = require('fs');
const path = require('path');

// 1. Update Canvas page.tsx (Navbar positioning & glassmorphism)
const pagePath = path.join('src', 'app', '(dashboard)', 'content', 'posts', 'canvas', 'page.tsx');
let pageCode = fs.readFileSync(pagePath, 'utf8');

const oldHeaderClass = `className="absolute top-4 left-4 right-4 z-20 flex flex-col gap-3 bg-neutral-900/90 backdrop-blur-md border border-neutral-800 rounded-xl p-3.5 shadow-xl shrink-0"`;
const newHeaderClass = `className="absolute top-0 left-0 right-0 z-20 flex flex-col gap-3 bg-neutral-950/60 backdrop-blur-xl border-b border-neutral-800 p-3.5 shadow-xl shrink-0"`;

pageCode = pageCode.replace(oldHeaderClass, newHeaderClass);
fs.writeFileSync(pagePath, pageCode);


// 2. Update canvasData.ts layout (Vertical hierarchical layout)
const dataPath = path.join('src', 'components', 'content', 'canvas', 'canvasData.ts');
let dataCode = fs.readFileSync(dataPath, 'utf8');

const newNodesStr = `export const INITIAL_NODES: Node[] = [
  // Gateway CEO (Top Center)
  {
    id: 'hermes',
    type: 'agentNode',
    position: { x: 550, y: 150 },
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
    position: { x: 20, y: 350 },
    style: { width: 380, height: 600 },
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
    position: { x: 75, y: 50 },
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
    position: { x: 75, y: 190 },
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
    position: { x: 10, y: 190 },
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
    position: { x: 310, y: 190 },
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
    position: { x: 75, y: 330 },
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
    position: { x: 75, y: 470 },
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
  // Place writer 2 next to writer 1 if possible, but vertical stack is safer.
  // We'll leave writer 2 out or place it side by side with writer 1 if width permits. Let's stack it.
  {
    id: 'mkt-writer-02',
    type: 'agentNode',
    position: { x: -1000, y: -1000 }, // hide for now, or just leave it
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
    position: { x: 440, y: 350 },
    style: { width: 380, height: 600 },
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
    position: { x: 75, y: 50 },
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
    position: { x: 75, y: 190 },
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
    position: { x: 75, y: 330 },
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
    position: { x: 75, y: 470 },
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
    position: { x: 860, y: 350 },
    style: { width: 380, height: 450 },
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
    position: { x: 75, y: 50 },
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
    position: { x: 75, y: 190 },
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
    position: { x: 75, y: 330 },
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

// 3. Improve AgentNode UI styling (clean, modern glassmorphism)
const agentNodePath = path.join('src', 'components', 'content', 'canvas', 'AgentNode.tsx');
let agentNodeCode = fs.readFileSync(agentNodePath, 'utf8');

const oldBorderStyles = `  const getBorderStyles = () => {
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
  };`;

const newBorderStyles = `  const getBorderStyles = () => {
    if (isGateway) {
      return 'border-amber-500/40 bg-neutral-950/70 backdrop-blur-xl shadow-lg shadow-amber-500/10';
    }
    if (isLead) {
      if (deptColor === 'purple') return 'border-purple-500/40 bg-neutral-950/70 backdrop-blur-xl shadow-lg shadow-purple-500/10';
      if (deptColor === 'emerald') return 'border-emerald-500/40 bg-neutral-950/70 backdrop-blur-xl shadow-lg shadow-emerald-500/10';
      return 'border-blue-500/40 bg-neutral-950/70 backdrop-blur-xl shadow-lg shadow-blue-500/10';
    }
    // Sub-agents
    if (deptColor === 'purple') return 'border-purple-500/20 hover:border-purple-400/50 bg-neutral-950/70 backdrop-blur-md';
    if (deptColor === 'emerald') return 'border-emerald-500/20 hover:border-emerald-400/50 bg-neutral-950/70 backdrop-blur-md';
    if (deptColor === 'blue') return 'border-blue-500/20 hover:border-blue-400/50 bg-neutral-950/70 backdrop-blur-md';
    return 'border-neutral-800 hover:border-neutral-700 bg-neutral-950/70 backdrop-blur-md';
  };`;

agentNodeCode = agentNodeCode.replace(oldBorderStyles, newBorderStyles);
agentNodeCode = agentNodeCode.replace(
  /className=\{`agent-node-card group relative select-none rounded-xl border p-3 shadow-lg backdrop-blur-xl transition-all duration-200 \$\{/,
  'className={`agent-node-card group relative select-none rounded-2xl border p-3.5 transition-all duration-200 ${'
);

agentNodeCode = agentNodeCode.replace(
  /className="!h-2\.5 !w-2\.5 !border-2 !border-neutral-950 !bg-indigo-400 transition-transform hover:scale-125 !-top-1\.5"/,
  'className="!h-3 !w-3 !border-2 !border-neutral-950 !bg-indigo-400 transition-transform hover:scale-125 !-top-1.5 opacity-0 group-hover:opacity-100"'
);

// We should also add bottom handles for better edge connection aesthetics
const bottomHandleStr = `      {/* Bottom Output Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-3 !w-3 !border-2 !border-neutral-950 !bg-emerald-400 transition-transform hover:scale-125 !-bottom-1.5 opacity-0 group-hover:opacity-100"
      />
    </div>`;

agentNodeCode = agentNodeCode.replace(/    <\/div>\n\s*$/m, bottomHandleStr + "\n");
fs.writeFileSync(agentNodePath, agentNodeCode);

// 4. Update DepartmentCluster.tsx styling
const clusterPath = path.join('src', 'components', 'content', 'canvas', 'DepartmentCluster.tsx');
let clusterCode = fs.readFileSync(clusterPath, 'utf8');

const clusterOldStyle = `      className={\`department-cluster group relative flex flex-col rounded-3xl border-2 p-4 transition-all duration-300 \${
        deptData.isActive ? 'border-dashed' : 'border-dashed opacity-70 grayscale'
      } \${getClusterStyles()}\`}
      style={{ width: style?.width || 500, height: style?.height || 400 }}`;

const clusterNewStyle = `      className={\`department-cluster group relative flex flex-col rounded-3xl border p-5 transition-all duration-300 backdrop-blur-sm \${
        deptData.isActive ? 'border-solid shadow-2xl' : 'border-dashed opacity-70 grayscale'
      } \${getClusterStyles()}\`}
      style={{ width: style?.width || 380, height: style?.height || 600 }}`;

clusterCode = clusterCode.replace(clusterOldStyle, clusterNewStyle);

const clusterOldColor = `  const getClusterStyles = () => {
    if (deptData.department === 'marketing')
      return 'border-purple-500/30 bg-purple-950/10 shadow-purple-500/5';
    if (deptData.department === 'sales')
      return 'border-emerald-500/30 bg-emerald-950/10 shadow-emerald-500/5';
    if (deptData.department === 'tech')
      return 'border-blue-500/30 bg-blue-950/10 shadow-blue-500/5';
    return 'border-neutral-700 bg-neutral-900/50';
  };`;

const clusterNewColor = `  const getClusterStyles = () => {
    if (deptData.department === 'marketing')
      return 'border-purple-500/20 bg-purple-950/5 shadow-purple-500/5';
    if (deptData.department === 'sales')
      return 'border-emerald-500/20 bg-emerald-950/5 shadow-emerald-500/5';
    if (deptData.department === 'tech')
      return 'border-blue-500/20 bg-blue-950/5 shadow-blue-500/5';
    return 'border-neutral-700 bg-neutral-900/20';
  };`;

clusterCode = clusterCode.replace(clusterOldColor, clusterNewColor);
fs.writeFileSync(clusterPath, clusterCode);

console.log('Successfully updated layout and UI styling.');
