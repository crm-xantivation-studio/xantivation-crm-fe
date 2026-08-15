export interface LlmProvider {
  id: string;
  name: string;
  slug?: string;
  type: 'CLOUD' | 'LOCAL' | 'CUSTOM';
  baseUrl: string;
  apiFormat?: string;
  isOpenAiCompatible?: boolean;
  supportsFetchModels?: boolean;
  iconSlug?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  apiKeys?: ApiKey[];
  models?: LlmModel[];
}

export interface ApiKey {
  id: string;
  providerId: string;
  label: string;
  encryptedKey?: string;
  maskedKey: string;
  isActive: boolean;
  failCount?: number;
  lastUsedAt?: string;
  createdAt: string;
  provider?: LlmProvider;
}

export interface LlmModel {
  id: string;
  providerId: string;
  modelName: string;
  displayName?: string;
  contextWindow?: number;
  metadata?: Record<string, any>;
  isDefault: boolean;
  isCustom?: boolean;
  createdAt: string;
  provider?: LlmProvider;
}

export interface Agent {
  id: string;
  name: string;
  slug: string;
  role: string;
  description?: string;
  systemPrompt: string;
  providerId?: string;
  modelId: string;
  parentAgentId?: string;
  apiKeyId?: string;
  autonomyLevel: 'FULL' | 'SEMI' | 'MANUAL' | string;
  maxTokensPerRequest?: number;
  temperature?: number;
  reportingMode?: 'REALTIME' | 'BATCH' | 'SILENT' | string;
  reportingTarget?: string;
  version?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  provider?: LlmProvider;
  model?: LlmModel;
  parentAgent?: Agent;
  subAgents?: Agent[];
  apiKey?: ApiKey;
}

export interface AgentExecutionLog {
  id: string;
  agentId: string;
  trigger: string;
  action: string;
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
  inputSummary?: string;
  outputSummary?: string;
  tokensUsed?: number;
  durationMs?: number;
  errorMessage?: string;
  entityType?: string;
  entityId?: string;
  createdAt: string;
  completedAt?: string;
  agent?: Agent;
}

export interface CreateProviderDto {
  name: string;
  type: 'CLOUD' | 'LOCAL' | 'CUSTOM';
  baseUrl: string;
  isOpenAiCompatible?: boolean;
  iconSlug?: string;
  isActive?: boolean;
}

export interface CreateApiKeyDto {
  providerId: string;
  label: string;
  key: string;
  isActive?: boolean;
}

export interface CreateModelDto {
  providerId: string;
  modelName: string;
  displayName?: string;
  contextWindow?: number;
  isDefault?: boolean;
}

export interface CreateAgentDto {
  name: string;
  slug: string;
  role: string;
  description?: string;
  systemPrompt: string;
  providerId?: string;
  modelId: string;
  parentAgentId?: string;
  apiKeyId?: string;
  autonomyLevel?: 'FULL' | 'SEMI' | 'MANUAL';
  maxTokensPerRequest?: number;
  temperature?: number;
  reportingMode?: 'REALTIME' | 'BATCH' | 'SILENT';
  reportingTarget?: string;
  isActive?: boolean;
}
