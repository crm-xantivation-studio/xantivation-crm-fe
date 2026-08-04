import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface AiConfigState {
  // === Feature Toggles ===
  leadBantSync: boolean;
  oppCoach: boolean;
  quoFollowUp: boolean;
  contractRisk: boolean;
  sensitivityThreshold: 'HIGH' | 'MEDIUM' | 'LOW';

  // === Safety & Approval (Hermes Governance) ===
  approvalMode: 'MANUAL' | 'SMART' | 'OFF';
  actionAllowlist: string[];
  redactSensitiveData: boolean;
  dataCheckpoints: boolean;
  allowDatabaseWrite: boolean;
  maxStepsPerTurn: number;
  maxConcurrentSubagents: number;
  subagentTimeoutSec: number;

  // === Advanced Intelligence Features ===
  memoryEnabled: boolean;
  userProfileEnabled: boolean;
  memoryCharLimit: number;
  userCharLimit: number;
  memoryNudgeInterval: number;

  autoCompression: boolean;
  contextEngine: 'compressor' | 'default';
  compressionThreshold: number; // 0.20 to 0.90 (fraction)
  compressionTargetRatio: number; // 0.10 to 0.80
  compressionProtectLastN: number;
  compressionMaxAttempts: number;

  churnPredictionEnabled: boolean;
  salesForecastEnabled: boolean;
  stalledDealDetection: boolean;
  stalledDealDays: number;

  updateAiConfig: (config: Partial<Omit<AiConfigState, 'updateAiConfig' | 'setFullConfig'>>) => void;
  setFullConfig: (config: Record<string, any>) => void;
}

export const useAiConfigStore = create<AiConfigState>()(
  persist(
    (set) => ({
      // Defaults
      leadBantSync: true,
      oppCoach: true,
      quoFollowUp: true,
      contractRisk: true,
      sensitivityThreshold: 'MEDIUM',

      approvalMode: 'SMART',
      actionAllowlist: [
        'lead.qualify',
        'activity.log',
        'lead.enrich',
        'opportunity.coach',
        'quotation.draft',
        'contract.audit'
      ],
      redactSensitiveData: true,
      dataCheckpoints: true,
      allowDatabaseWrite: true,
      maxStepsPerTurn: 15,
      maxConcurrentSubagents: 3,
      subagentTimeoutSec: 120,

      memoryEnabled: true,
      userProfileEnabled: true,
      memoryCharLimit: 2200,
      userCharLimit: 1375,
      memoryNudgeInterval: 10,

      autoCompression: true,
      contextEngine: 'compressor',
      compressionThreshold: 0.50,
      compressionTargetRatio: 0.20,
      compressionProtectLastN: 20,
      compressionMaxAttempts: 3,

      churnPredictionEnabled: false,
      salesForecastEnabled: false,
      stalledDealDetection: true,
      stalledDealDays: 7,

      updateAiConfig: (newConfig) => set((state) => ({ ...state, ...newConfig })),
      setFullConfig: (config) => set((state) => ({ ...state, ...config })),
    }),
    {
      name: 'crm-ai-config-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
