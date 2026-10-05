const fs = require('fs');
const file = 'src/components/content/canvas/AgentDetailDrawer.tsx';
let code = fs.readFileSync(file, 'utf8');

const oldImport = `import {
  ExternalLink,
  Clock,
  Terminal,
  FileText,
  Activity,
} from 'lucide-react';`;

const newImport = `import {
  ExternalLink,
  Clock,
  Terminal,
  FileText,
  Activity,
  Shield,
  Link as LinkIcon,
  Code
} from 'lucide-react';`;

// Simple string replacement using a more flexible regex to handle CRLF vs LF
code = code.replace(/import\s*\{\s*ExternalLink,\s*Clock,\s*Terminal,\s*FileText,\s*Activity,?\s*\}\s*from\s*'lucide-react';/s, newImport);

fs.writeFileSync(file, code);
console.log('Fixed imports in AgentDetailDrawer.tsx');
