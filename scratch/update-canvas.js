const fs = require('fs');
const filePath = 'src/app/(dashboard)/content/posts/canvas/page.tsx';
let code = fs.readFileSync(filePath, 'utf8');

// 1. Add Segmented and Input imports
code = code.replace(
  /import { Card, Button, Tag, Badge, Tooltip, message } from 'antd';/,
  "import { Card, Button, Tag, Badge, Tooltip, message, Segmented, Input } from 'antd';"
);

// 2. Add icons imports
code = code.replace(
  /Sparkles,\n  FileText,\n} from 'lucide-react';/,
  "Sparkles,\n  FileText,\n  Search,\n  Activity,\n  Component,\n  Clock\n} from 'lucide-react';"
);

// 3. Add states to CanvasInner
code = code.replace(
  /const \[selectedAgent, setSelectedAgent\] = useState<AgentNodeData \| null>\(null\);/,
  "const [selectedAgent, setSelectedAgent] = useState<AgentNodeData | null>(null);\n  const [viewMode, setViewMode] = useState<'architecture' | 'runtime' | 'executions'>('runtime');\n  const [searchQuery, setSearchQuery] = useState('');"
);

// 4. Update Header
const oldHeader = `      {/* Top Header Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-900/90 backdrop-blur-md border border-neutral-800 rounded-xl p-3.5 shadow-xl shrink-0">`;
const newHeader = `      {/* Top Header Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-col gap-3 bg-neutral-900/90 backdrop-blur-md border border-neutral-800 rounded-xl p-3.5 shadow-xl shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">`;

const oldControls = `          {generatedPost && (
            <Button
              icon={<FileText size={14} className="text-emerald-400" />}
              onClick={() => setIsResultDrawerOpen(true)}
              className="bg-neutral-900 border-emerald-500/40 text-emerald-300 rounded-xl text-xs h-8"
            >
              Xem Bài Viết Đã Tạo
            </Button>
          )}

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-neutral-900 border border-neutral-800 text-[11px]">`;

const newControls = `          {generatedPost && (
            <Button
              icon={<FileText size={14} className="text-emerald-400" />}
              onClick={() => setIsResultDrawerOpen(true)}
              className="bg-neutral-900 border-emerald-500/40 text-emerald-300 rounded-xl text-xs h-8"
            >
              Xem Bài Viết Đã Tạo
            </Button>
          )}
          
          <Segmented
            options={[
              { label: <div className="flex items-center gap-1.5"><Component size={14} /><span>Architecture</span></div>, value: 'architecture' },
              { label: <div className="flex items-center gap-1.5"><Activity size={14} /><span>Runtime</span></div>, value: 'runtime' },
              { label: <div className="flex items-center gap-1.5"><Clock size={14} /><span>Timeline Replay</span></div>, value: 'executions' },
            ]}
            value={viewMode}
            onChange={(val) => setViewMode(val as any)}
            className="bg-neutral-950 text-neutral-400 border border-neutral-800"
          />

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-neutral-900 border border-neutral-800 text-[11px]">`;

const closingHeader = `          <Button
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
      </div>`;

const newClosingHeader = `          <Button
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
        {/* Search and Filters */}
        <div className="flex items-center gap-3 pt-2 border-t border-neutral-800">
          <Input 
            prefix={<Search size={14} className="text-neutral-500" />} 
            placeholder="Search agents, tools, roles..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64 bg-neutral-950 border-neutral-800 text-neutral-300 placeholder:text-neutral-600 rounded-lg text-xs"
            allowClear
          />
          <div className="flex gap-2">
            <Tag className="bg-neutral-950 border-neutral-800 text-neutral-400 cursor-pointer hover:text-white transition-colors">Layer: All</Tag>
            <Tag className="bg-neutral-950 border-neutral-800 text-neutral-400 cursor-pointer hover:text-white transition-colors">Type: Agent</Tag>
            <Tag className="bg-neutral-950 border-neutral-800 text-neutral-400 cursor-pointer hover:text-white transition-colors">Status: Any</Tag>
          </div>
        </div>
      </div>`;

code = code.replace(oldHeader, newHeader);
code = code.replace(oldControls, newControls);
code = code.replace(closingHeader, newClosingHeader);

// 5. Add useEffect to handle Search Query highlighting/dimming
const oldSyncDB = `  // Synchronize DB agent metadata into nodes
  useEffect(() => {`;

const newSyncDB = `  // Filter nodes based on search query
  useEffect(() => {
    setNodes((prevNodes) =>
      prevNodes.map((node) => {
        if (node.type === 'agentNode') {
          const nodeData = node.data as any;
          const searchLower = searchQuery.toLowerCase();
          const match = !searchQuery || 
            (nodeData.name && nodeData.name.toLowerCase().includes(searchLower)) ||
            (nodeData.role && nodeData.role.toLowerCase().includes(searchLower)) ||
            (nodeData.slug && nodeData.slug.toLowerCase().includes(searchLower));
          
          return {
            ...node,
            style: {
              ...node.style,
              opacity: match ? 1 : 0.2,
              pointerEvents: match ? 'auto' : 'none',
              transition: 'all 0.3s ease',
            }
          };
        }
        return node;
      })
    );
  }, [searchQuery, setNodes]);

  // Synchronize DB agent metadata into nodes
  useEffect(() => {`;

code = code.replace(oldSyncDB, newSyncDB);

fs.writeFileSync(filePath, code);
console.log('Successfully updated page.tsx with search and viewmode capabilities.');
