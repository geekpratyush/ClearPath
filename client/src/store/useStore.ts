import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type PipelineStatus = 'idle' | 'processing' | 'passed' | 'breached' | 'amber';

export interface ContextData {
  clearing?: {
    system: string;
    country: string;
    isOpen: boolean;
  };
  limits?: {
    pool: number;
    facility: number;
    sublimit: {
      available: number;
      functionalRestriction: string;
    };
    dodl: number;
    eligibility: boolean;
  };
  transaction?: {
    amount: number;
    currency: string;
    valueDate: string;
    senderBic: string;
    receiverBic: string;
  };
  [key: string]: any; // Allow dynamic mutation
}

export interface PipelineStage {
  id: string;
  name: string;
  expression: string;
  status: PipelineStatus;
  outputContext?: ContextData;
  errorMessage?: string;
  routing?: {
    passed?: string[];
    breached?: string[];
    amber?: string[];
  };
}

interface StoreState {
  initialContext: ContextData;
  activeContext: ContextData;
  stages: PipelineStage[];
  isSimulating: boolean;
  activeTemplateName: string;
  customTemplates: Record<string, { context: ContextData, stages: PipelineStage[] }>;
  setInitialContext: (context: ContextData) => void;
  updateContextField: (path: string, value: any) => void;
  updateStageExpression: (id: string, expression: string) => void;
  updateStageName: (id: string, name: string) => void;
  updateStageStatus: (id: string, status: PipelineStatus, outputContext?: ContextData, errorMessage?: string) => void;
  addStage: () => void;
  removeStage: (id: string) => void;
  moveStage: (id: string, direction: 'up' | 'down') => void;
  loadTemplate: (templateId: string) => void;
  saveTemplate: (name: string) => void;
  deleteTemplate: (name: string) => void;
  resetTemplates: () => void;
  importContext: (context: ContextData) => void;
  importPipeline: (stages: PipelineStage[]) => void;
  runSimulation: () => void;
  resetSimulation: () => void;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
}

const templates: Record<string, { context: ContextData, stages: PipelineStage[] }> = {
  standard: {
    context: {
      clearing: { system: 'Fedwire', country: 'US', isOpen: true },
      limits: { pool: 100000000, facility: 50000000, sublimit: { available: 20000000, functionalRestriction: 'Trade Finance' }, dodl: 10000000, eligibility: true },
      transaction: { amount: 5000000, currency: 'USD', valueDate: new Date().toISOString().split('T')[0], senderBic: 'CHASUS33', receiverBic: 'BOFAUS3N' }
    },
    stages: [
      { id: 'stage-1', name: 'Ingress Mapping', expression: 'context.transaction.amount > 0 ? "PASSED" : "FAILED"', status: 'idle', routing: { passed: ['stage-2'] } },
      { id: 'stage-2', name: 'Limit Check', expression: 'context.transaction.amount <= context.limits.sublimit.available && context.limits.eligibility == true ? "PASSED" : "FAILED"', status: 'idle', routing: { passed: ['stage-3'] } },
      { id: 'stage-3', name: 'Compliance', expression: 'context.clearing.isOpen == true && context.transaction.amount <= context.limits.dodl ? "PASSED" : "AMBER"', status: 'idle', routing: { passed: ['stage-4'] } },
      { id: 'stage-4', name: 'Dispatch', expression: 'context.transaction.amount > 10000000 ? "ROUTE_TO_PARTNER" : "APPROVE"', status: 'idle' }
    ]
  },
  parallel: {
    context: {
      clearing: { system: 'TARGET2', country: 'DE', isOpen: true },
      limits: { pool: 50000, facility: 50000, sublimit: { available: 50000, functionalRestriction: 'General' }, dodl: 0, eligibility: true },
      transaction: { amount: 20000, currency: 'EUR', valueDate: new Date().toISOString().split('T')[0], senderBic: 'DEUTDEFF', receiverBic: 'BNPAFRPP' }
    },
    stages: [
      { id: 's1', name: 'Initial Intake', expression: 'context.transaction.amount > 0 ? "PASSED" : "FAILED"', status: 'idle', routing: { passed: ['s2a', 's2b'] } },
      { id: 's2a', name: 'Sanctions Check', expression: 'context.transaction.currency == "EUR" ? "PASSED" : "AMBER"', status: 'idle', routing: { passed: ['s3'] } },
      { id: 's2b', name: 'Liquidity Check', expression: 'context.transaction.amount < context.limits.pool ? "PASSED" : "FAILED"', status: 'idle', routing: { passed: ['s3'] } },
      { id: 's3', name: 'Final Settlement', expression: '"APPROVE"', status: 'idle' }
    ]
  },
  loopback: {
    context: {
      clearing: { system: 'CHIPS', country: 'US', isOpen: false },
      limits: { pool: 0, facility: 0, sublimit: { available: 0, functionalRestriction: 'None' }, dodl: 0, eligibility: false },
      transaction: { amount: 1000, currency: 'USD', valueDate: new Date().toISOString().split('T')[0], senderBic: 'TEST', receiverBic: 'TEST' },
      retries: 0
    },
    stages: [
      { id: 't1', name: 'Window Check', expression: 'context.clearing.isOpen ? "PASSED" : "AMBER"', status: 'idle', routing: { passed: ['t3'], amber: ['t2'] } },
      { id: 't2', name: 'Wait / Loop', expression: 'context.retries = context.retries + 1; context.retries < 3 ? "PASSED" : "FAILED"', status: 'idle', routing: { passed: ['t1'], breached: [] } },
      { id: 't3', name: 'Execute', expression: '"APPROVE"', status: 'idle' }
    ]
  },
  scratchpad: {
    context: {
      newPayload: {
        customString: "example",
        customNumber: 100,
        customBoolean: true
      }
    },
    stages: [
      { id: 'custom-1', name: 'Custom Stage', expression: 'context.newPayload.customBoolean ? "PASSED" : "FAILED"', status: 'idle' }
    ]
  },
  richui: {
    context: {
      riskSettings: {
        riskScore: { _type: "slider", value: 75, min: 0, max: 100, step: 5 },
        region: { _type: "select", value: "EMEA", options: ["NAM", "EMEA", "APAC", "LATAM"] },
        tier: { _type: "radio", value: "Tier 1", options: ["Tier 1", "Tier 2", "Tier 3"] }
      },
      validation: {
        requireManualReview: true
      }
    },
    stages: [
      { id: 'r1', name: 'Risk Assessment', expression: 'context.riskSettings.riskScore.value > 80 ? "AMBER" : "PASSED"', status: 'idle', routing: { passed: ['r2'], amber: ['r3'] } },
      { id: 'r2', name: 'Auto Approval', expression: '"APPROVE"', status: 'idle' },
      { id: 'r3', name: 'Manual Review', expression: 'context.validation.requireManualReview ? "AMBER" : "APPROVE"', status: 'idle' }
    ]
  },
  transform: {
    context: {
      apiWrapper: {
        metadata: { requestTime: "2026-07-17T12:00:00Z", source: "MobileApp" },
        actualData: { id: 1054, status: "pending", amount: 2500 }
      }
    },
    stages: [
      { 
        id: 'stage-unwrap', 
        name: 'Payload Unwrapping', 
        expression: 'const child = context.apiWrapper.actualData;\nreplaceContext(child);\n"PASSED"', 
        status: 'idle', 
        routing: { passed: ['stage-eval'] } 
      },
      { 
        id: 'stage-eval', 
        name: 'Evaluate Unwrapped Data', 
        expression: 'context.amount > 1000 ? "PASSED" : "FAILED"', 
        status: 'idle' 
      }
    ]
  }
};

const defaultContext = templates.standard.context;
const defaultStages = templates.standard.stages;

// Helper to set nested object properties
const setNestedProperty = (obj: any, path: string, value: any) => {
  const parts = path.split('.');
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!current[parts[i]]) current[parts[i]] = {};
    current = current[parts[i]];
  }
  current[parts[parts.length - 1]] = value;
  return obj;
};

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      initialContext: defaultContext,
      activeContext: defaultContext,
      stages: defaultStages,
      isSimulating: false,
      activeTemplateName: 'standard',
      customTemplates: {},

      setInitialContext: (context) => set({ initialContext: context, activeContext: context }),
      
      updateContextField: (path, value) => set((state) => {
        const newContext = JSON.parse(JSON.stringify(state.initialContext));
        setNestedProperty(newContext, path, value);
        return { initialContext: newContext, activeContext: newContext };
      }),

      updateStageExpression: (id, expression) => set((state) => ({
        stages: state.stages.map(stage => stage.id === id ? { ...stage, expression } : stage)
      })),

      updateStageName: (id, name) => set((state) => ({
        stages: state.stages.map(stage => stage.id === id ? { ...stage, name } : stage)
      })),

      updateStageStatus: (id, status, outputContext, errorMessage) => set((state) => ({
        stages: state.stages.map(stage => stage.id === id ? { ...stage, status, outputContext, errorMessage } : stage)
      })),

      addStage: () => set((state) => ({
        stages: [...state.stages, {
          id: `stage-${Date.now()}`,
          name: `Custom Stage ${state.stages.length + 1}`,
          expression: 'true ? "PASSED" : "FAILED"',
          status: 'idle'
        }]
      })),

      removeStage: (id) => set((state) => ({
        stages: state.stages.filter(s => s.id !== id)
      })),

      moveStage: (id, direction) => set((state) => {
        const index = state.stages.findIndex(s => s.id === id);
        if ((direction === 'up' && index === 0) || (direction === 'down' && index === state.stages.length - 1)) {
          return state;
        }
        const newStages = [...state.stages];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        const temp = newStages[index];
        newStages[index] = newStages[targetIndex];
        newStages[targetIndex] = temp;
        return { stages: newStages };
      }),

      loadTemplate: (templateId) => set((state) => {
        const template = templates[templateId] || state.customTemplates[templateId];
        if (template) {
          return {
            initialContext: JSON.parse(JSON.stringify(template.context)),
            activeContext: JSON.parse(JSON.stringify(template.context)),
            stages: JSON.parse(JSON.stringify(template.stages)),
            isSimulating: false,
            activeTemplateName: templateId
          };
        }
        return {};
      }),

      saveTemplate: (name) => set((state) => ({
        activeTemplateName: name,
        customTemplates: {
          ...state.customTemplates,
          [name]: {
            context: JSON.parse(JSON.stringify(state.initialContext)),
            stages: JSON.parse(JSON.stringify(state.stages))
          }
        }
      })),

      deleteTemplate: (name) => set((state) => {
        const newTemplates = { ...state.customTemplates };
        delete newTemplates[name];
        return { customTemplates: newTemplates };
      }),

      resetTemplates: () => set({ customTemplates: {} }),

      importContext: (context) => set(() => ({
        initialContext: JSON.parse(JSON.stringify(context)),
        activeContext: JSON.parse(JSON.stringify(context)),
        isSimulating: false
      })),

      importPipeline: (stages) => set(() => ({
        stages: JSON.parse(JSON.stringify(stages)),
        isSimulating: false
      })),

      resetSimulation: () => set((state) => ({
        activeContext: state.initialContext,
        isSimulating: false,
        stages: state.stages.map(s => ({ ...s, status: 'idle', outputContext: undefined, errorMessage: undefined }))
      })),

      runSimulation: () => {}, // Will be implemented in the component to handle async/delays

      theme: 'dark',
      setTheme: (theme) => set({ theme })
    }),
    {
      name: 'clearpath-storage',
      partialize: (state) => ({ customTemplates: state.customTemplates, theme: state.theme })
    }
  )
);
