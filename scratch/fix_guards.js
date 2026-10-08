const fs = require('fs');

// 1. ai-hub.controller.ts
const aiPath = '../xantivation-crm-be/src/features/integrations/controllers/ai-hub.controller.ts';
let aiContent = fs.readFileSync(aiPath, 'utf8');
aiContent = aiContent.replace(
  "import { Controller, Get, Post, Body, Query, Sse } from '@nestjs/common';",
  "import { Controller, Get, Post, Body, Query, Sse, UseGuards } from '@nestjs/common';"
);
fs.writeFileSync(aiPath, aiContent, 'utf8');

// 2. social-post.controller.ts
const spPath = '../xantivation-crm-be/src/features/integrations/controllers/social-post.controller.ts';
let spContent = fs.readFileSync(spPath, 'utf8');
spContent = spContent.replace(
  "import { Controller, Get, Post, Delete, Body, Param, Query, Sse } from '@nestjs/common';",
  "import { Controller, Get, Post, Delete, Body, Param, Query, Sse, UseGuards } from '@nestjs/common';"
);
fs.writeFileSync(spPath, spContent, 'utf8');

console.log('Fixed imports in controllers successfully');
