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
  shape?: 'rectangle' | 'diamond' | 'ellipse' | 'parallelogram';
  routing?: {
    passed?: string[];
    breached?: string[];
    amber?: string[];
  };
  description?: string;
  approvalState?: 'draft' | 'review' | 'approved';
}

interface StoreState {
  initialContext: ContextData;
  activeContext: ContextData;
  stages: PipelineStage[];
  isSimulating: boolean;
  workspaceNotes: string;
  activeTemplateName: string;
  customTemplates: Record<string, { notes?: string, context: ContextData, stages: PipelineStage[] }>;
  setInitialContext: (context: ContextData) => void;
  updateWorkspaceNotes: (notes: string) => void;
  updateContextField: (path: string, value: any) => void;
  updateStageExpression: (id: string, expression: string) => void;
  updateStageName: (id: string, name: string) => void;
  updateStageDescription: (id: string, description: string) => void;
  setStageApprovalState: (id: string, state: 'draft' | 'review' | 'approved') => void;
  updateStageShape: (id: string, shape: 'rectangle' | 'diamond' | 'ellipse' | 'parallelogram') => void;
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

const templates: Record<string, { notes: string, context: ContextData, stages: PipelineStage[] }> = {
  clearingLimits: {
    notes: "This pipeline demonstrates a Clearing approval flow based on different credit limits. It checks facility eligibility, daily overdraft limit (DOL), applies an earmark, and evaluates against available pool limits. It uses a Diamond shape for decision branching and Parallelogram for system dispatch.",
    context: {
      clearing: { system: 'Fedwire', country: 'US', isOpen: true },
      limits: { 
        facilityEligible: true,
        poolLimit: 100000000, 
        availableFacilityLimit: 5000000, 
        earmarkedAmount: 1000000,
        dodl: 20000000 
      },
      transaction: { amount: 3500000, currency: 'USD' }
    },
    stages: [
      { id: 'c1', name: 'Intake & Eligibility', expression: 'context.limits.facilityEligible ? "PASSED" : "FAILED"', status: 'idle', shape: 'ellipse', routing: { passed: ['c-dol'] } },
      { id: 'c-dol', name: 'Check Overdraft Limit (DOL)', expression: 'context.transaction.amount <= context.limits.dodl ? "PASSED" : "FAILED"', status: 'idle', shape: 'diamond', routing: { passed: ['c2'] } },
      { id: 'c2', name: 'Check Facility Limit', expression: '(context.transaction.amount + context.limits.earmarkedAmount) <= context.limits.availableFacilityLimit ? "PASSED" : "AMBER"', status: 'idle', shape: 'diamond', routing: { passed: ['c-approve'], amber: ['c-manual'] } },
      { id: 'c-approve', name: 'Auto Approve', expression: '"APPROVE"', status: 'idle', shape: 'rectangle', routing: { passed: ['c-dispatch'] } },
      { id: 'c-manual', name: 'Manual Credit Review', expression: '(context.transaction.amount + context.limits.earmarkedAmount) <= context.limits.poolLimit ? "AMBER" : "FAILED"', status: 'idle', shape: 'rectangle', routing: { passed: ['c-dispatch'] } },
      { id: 'c-dispatch', name: 'Dispatch to Clearing', expression: '"PASSED"', status: 'idle', shape: 'parallelogram' }
    ]
  },
  earmarkingApproval: {
    notes: "An Earmarking approval system. It actively mutates the context to reserve (earmark) funds before proceeding to final clearing. If the transaction exceeds the limit, it enters an AMBER state representing a queue.",
    context: {
      account: { balance: 50000, earmarked: 10000 },
      transaction: { amount: 25000, id: "TX123" }
    },
    stages: [
      { id: 'e1', name: 'Receive Request', expression: '"PASSED"', status: 'idle', shape: 'ellipse', routing: { passed: ['e2'] } },
      { id: 'e2', name: 'Balance Verification', expression: '(context.account.balance - context.account.earmarked) >= context.transaction.amount ? "PASSED" : "FAILED"', status: 'idle', shape: 'diamond', routing: { passed: ['e3'], breached: ['e-queue'] } },
      { id: 'e3', name: 'Apply Earmark', expression: 'context.account.earmarked = context.account.earmarked + context.transaction.amount; "PASSED"', status: 'idle', shape: 'rectangle', routing: { passed: ['e4'] } },
      { id: 'e4', name: 'Proceed to Clearing', expression: '"APPROVE"', status: 'idle', shape: 'parallelogram' },
      { id: 'e-queue', name: 'Queue for Funds', expression: '"AMBER"', status: 'idle', shape: 'rectangle' }
    ]
  },
  facilityEligibility: {
    notes: "A complex multi-stage pipeline checking facility eligibility, geographical restrictions, and returning detailed JSON structures. Demonstrates how to handle multi-conditional logic.",
    context: {
      facility: { id: "F-991", status: "Active", maxLimit: 5000000, allowedRegions: ["US", "UK", "EU"] },
      client: { riskScore: 85, region: "UK" },
      request: { amount: 1200000 }
    },
    stages: [
      { id: 'f1', name: 'Facility Active Check', expression: 'context.facility.status === "Active" ? "PASSED" : "FAILED"', status: 'idle', shape: 'diamond', routing: { passed: ['f2'] } },
      { id: 'f2', name: 'Region Eligibility', expression: 'context.facility.allowedRegions.includes(context.client.region) ? "PASSED" : "FAILED"', status: 'idle', shape: 'diamond', routing: { passed: ['f3'] } },
      { id: 'f3', name: 'Risk Assessment', expression: 'context.client.riskScore > 80 ? "PASSED" : "AMBER"', status: 'idle', shape: 'diamond', routing: { passed: ['f-approve'], amber: ['f-review'] } },
      { id: 'f-approve', name: 'Approve Drawdown', expression: 'context.request.amount <= context.facility.maxLimit ? "APPROVE" : "FAILED"', status: 'idle', shape: 'rectangle' },
      { id: 'f-review', name: 'Risk Review', expression: '"AMBER"', status: 'idle', shape: 'rectangle' }
    ]
  },
  onboarding: {
    notes: "Standard Onboarding Flow. Demonstrates data mutation and parallel branching for KYC and Risk checks.",
    context: {
      user: { age: 24, emailVerified: true, documentScore: 95 }
    },
    stages: [
      { id: 'o1', name: 'Start Onboarding', expression: '"PASSED"', status: 'idle', shape: 'ellipse', routing: { passed: ['o2'] } },
      { id: 'o2', name: 'Age >= 18?', expression: 'context.user.age >= 18 ? "PASSED" : "FAILED"', status: 'idle', shape: 'diamond', routing: { passed: ['o3', 'o4'], breached: ['o-reject'] } },
      { id: 'o3', name: 'Email Verification', expression: 'context.user.emailVerified ? "PASSED" : "AMBER"', status: 'idle', shape: 'rectangle', routing: { passed: ['o-approve'] } },
      { id: 'o4', name: 'KYC Check', expression: 'context.user.documentScore > 90 ? "PASSED" : "FAILED"', status: 'idle', shape: 'rectangle', routing: { passed: ['o-approve'] } },
      { id: 'o-approve', name: 'Activate Account', expression: '"APPROVE"', status: 'idle', shape: 'rectangle' },
      { id: 'o-reject', name: 'Decline', expression: '"FAILED"', status: 'idle', shape: 'rectangle' }
    ]
  },
  interactiveRisk: {
    notes: "A stunning demonstration of the platform's rich UI capabilities. It uses sliders, dropdowns, radio buttons, toggle switches, and standard text inputs to drive a dynamic risk assessment pipeline.",
    context: {
      profile: {
        clientName: "Acme Corp Ltd.",
        accountActive: true
      },
      riskParameters: {
        riskScore: { _type: "slider", value: 75, min: 0, max: 100, step: 1 },
        operatingRegion: { _type: "select", value: "EMEA", options: ["NAM", "EMEA", "APAC", "LATAM"] },
        kycTier: { _type: "radio", value: "Tier 1", options: ["Tier 1", "Tier 2", "Tier 3"] }
      },
      compliance: {
        requireManualSignoff: false,
        sanctionsListMatch: false
      }
    },
    stages: [
      { id: 'ir1', name: 'Account Verification', expression: 'context.profile.accountActive ? "PASSED" : "FAILED"', status: 'idle', shape: 'diamond', routing: { passed: ['ir2'] } },
      { id: 'ir2', name: 'Sanctions Check', expression: 'context.compliance.sanctionsListMatch ? "FAILED" : "PASSED"', status: 'idle', shape: 'diamond', routing: { passed: ['ir3'] } },
      { id: 'ir3', name: 'Risk Score Eval', expression: 'context.riskParameters.riskScore.value > 80 ? "AMBER" : "PASSED"', status: 'idle', shape: 'diamond', routing: { passed: ['ir4'], amber: ['ir-manual'] } },
      { id: 'ir4', name: 'Tier Strategy', expression: 'context.riskParameters.kycTier.value === "Tier 1" ? "APPROVE" : "PASSED"', status: 'idle', shape: 'rectangle', routing: { passed: ['ir-manual'] } },
      { id: 'ir-manual', name: 'Compliance Review', expression: 'context.compliance.requireManualSignoff ? "AMBER" : "APPROVE"', status: 'idle', shape: 'parallelogram' }
    ]
  },
  scratchpad: {
    notes: "A blank canvas to write your own custom stages and context.",
    context: {
      customData: {
        value: 100,
        flag: true
      }
    },
    stages: [
      { id: 'custom-1', name: 'Custom Stage', expression: 'context.customData.flag ? "PASSED" : "FAILED"', status: 'idle', shape: 'ellipse' }
    ]
  }
};

const defaultContext = templates.clearingLimits.context;
const defaultStages = templates.clearingLimits.stages;

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
      workspaceNotes: templates.clearingLimits.notes,
      isSimulating: false,
      activeTemplateName: 'clearingLimits',
      customTemplates: {},

      setInitialContext: (context) => set({ initialContext: context, activeContext: context }),
      
      updateWorkspaceNotes: (notes) => set({ workspaceNotes: notes }),

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

      updateStageDescription: (id, description) => set((state) => ({
        stages: state.stages.map(stage => stage.id === id ? { ...stage, description } : stage)
      })),

      setStageApprovalState: (id, approvalState) => set((state) => ({
        stages: state.stages.map(stage => stage.id === id ? { ...stage, approvalState } : stage)
      })),

      updateStageShape: (id, shape) => set((state) => ({
        stages: state.stages.map(stage => stage.id === id ? { ...stage, shape } : stage)
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
            workspaceNotes: template.notes || '',
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
            notes: state.workspaceNotes,
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
