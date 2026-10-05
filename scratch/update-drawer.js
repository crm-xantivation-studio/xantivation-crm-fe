const fs = require('fs');
const filePath = 'src/components/content/canvas/AgentDetailDrawer.tsx';
let code = fs.readFileSync(filePath, 'utf8');

const importReplacement = `import {
  ExternalLink,
  Clock,
  Terminal,
  FileText,
  Activity,
  Shield,
  Link as LinkIcon,
  Code
} from 'lucide-react';`;

code = code.replace(/import {\n  ExternalLink,\n  Clock,\n  Terminal,\n  FileText,\n  Activity,\n} from 'lucide-react';/, importReplacement);

const newSection = `        {/* Architecture Info: Responsibilities & Connections */}
        <div className="space-y-3">
          <div className="border border-[var(--color-border)] rounded-xl p-3 bg-neutral-900/50">
            <span className="text-[11px] font-bold text-[var(--color-fg)] flex items-center gap-1.5 mb-2">
              <Shield size={13} className="text-purple-400" /> Nhiệm vụ & Quyền hạn
            </span>
            <ul className="list-disc pl-4 text-[10px] text-[var(--color-muted-fg)] space-y-1">
              <li>{agent.role || 'Phân tích và xử lý luồng công việc'}</li>
              <li>Chỉ được phép truy cập vào các công cụ thuộc quyền hạn của {agent.department || 'Ban điều hành'}</li>
              <li>{agent.slug === 'hermes' ? 'Điều phối các Agents khác' : 'Thực thi các lệnh được giao từ quản lý'}</li>
            </ul>
          </div>

          <div className="border border-[var(--color-border)] rounded-xl p-3 bg-neutral-900/50">
            <span className="text-[11px] font-bold text-[var(--color-fg)] flex items-center gap-1.5 mb-2">
              <LinkIcon size={13} className="text-blue-400" /> Kết nối & Giao tiếp (Topology)
            </span>
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-neutral-500">Incoming:</span>
                <span className="font-mono text-neutral-300 bg-neutral-800 px-1.5 py-0.5 rounded">EventStream / WebSocket</span>
              </div>
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-neutral-500">Outgoing:</span>
                <span className="font-mono text-neutral-300 bg-neutral-800 px-1.5 py-0.5 rounded">REST API / Database</span>
              </div>
            </div>
          </div>
          
          <div className="border border-[var(--color-border)] rounded-xl p-3 bg-neutral-900/50">
            <span className="text-[11px] font-bold text-[var(--color-fg)] flex items-center gap-1.5 mb-2">
              <Code size={13} className="text-emerald-400" /> Source Repository
            </span>
            <div className="font-mono text-[9px] text-neutral-500 break-all bg-black/40 p-1.5 rounded border border-neutral-800">
              src/ai/agents/{agent.department ? agent.department.toLowerCase() : 'core'}/{agent.slug}.ts
            </div>
          </div>
        </div>

        {/* Goal Description */}`;

code = code.replace(/\{\/\* Goal Description \*\/\}/, newSection);

fs.writeFileSync(filePath, code);
console.log('Successfully updated AgentDetailDrawer with Architecture capabilities.');
