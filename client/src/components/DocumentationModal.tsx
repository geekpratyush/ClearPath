import { X, BookOpen, Code, Grid, Database, Zap, Maximize2, Layers } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useState } from 'react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function DocumentationModal({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', icon: <Layers className="w-4 h-4" />, title: 'System Overview' },
    { id: 'es6', icon: <Code className="w-4 h-4" />, title: 'ES6 & Evaluation' },
    { id: 'components', icon: <Grid className="w-4 h-4" />, title: 'Component Anatomy' },
    { id: 'context', icon: <Database className="w-4 h-4" />, title: 'Context Engine' },
    { id: 'stages', icon: <Zap className="w-4 h-4" />, title: 'Stages & Flow' },
    { id: 'demo', icon: <Maximize2 className="w-4 h-4" />, title: 'Demo Recording' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="glass-panel border border-slate-700/50 rounded-xl shadow-2xl w-full max-w-6xl h-[95vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/50 shrink-0">
          <div className="flex items-center gap-2 text-indigo-400">
            <BookOpen className="w-5 h-5" />
            <h2 className="text-xl font-bold text-slate-100">ClearPath Official Documentation</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-rose-400 transition-colors p-1 rounded-md hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 border-r border-slate-800 bg-slate-950/50 p-4 shrink-0 overflow-y-auto">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Documentation</h3>
            <div className="space-y-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors text-left",
                    activeTab === tab.id
                      ? "bg-indigo-600/20 text-indigo-400 font-medium border border-indigo-500/30"
                      : "text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent"
                  )}
                >
                  {tab.icon}
                  <span>{tab.title}</span>
                </button>
              ))}
            </div>
          </div>
          {/* Content */}
          <div className="flex-1 overflow-y-auto p-8 bg-slate-900 text-slate-300">
            
            {activeTab === 'overview' && (
              <section className="space-y-6">
                <h3 className="text-3xl font-bold text-slate-100 border-b border-slate-800 pb-2">System Overview</h3>
                <p className="text-lg">
                  ClearPath is a robust, versatile orchestration platform designed for gathering requirements, defining computational logic, and designing pipeline flows across any domain. 
                  It provides an interactive, drag-and-drop workspace for building and simulating complex business rules without needing back-end deployments.
                </p>
                
                <h4 className="text-xl font-semibold text-indigo-300 mt-6">The Complete Application View</h4>
                <p>The screenshot below shows the primary layout of the ClearPath workspace. It is structured into three main panels to keep Context, Flow, and Outputs distinctly organized.</p>
                <img src="real_app_view.png" alt="ClearPath Application Workspace" className="w-full rounded-lg shadow-lg border border-slate-700" />
                
                <h4 className="text-xl font-semibold text-indigo-300 mt-6">Key Capabilities</h4>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Real-time validation:</strong> Test your validation rules instantaneously across all stages.</li>
                  <li><strong>Export/Import:</strong> Entire environments (contexts, structures, pipelines, and notes) can be packaged into simple JSON configurations and shared with other BAs.</li>
                  <li><strong>AI Prompts:</strong> Create fully optimized AI prompts out of your workspace to send to LLMs for deeper insight generation.</li>
                </ul>
              </section>
            )}

            {activeTab === 'es6' && (
              <section className="space-y-6">
                <h3 className="text-3xl font-bold text-slate-100 border-b border-slate-800 pb-2">ES6 Rules & Pipeline Evaluation</h3>
                <p className="text-lg">
                  Every pipeline stage in ClearPath processes its logic using native ES6 (ECMAScript 2015+) syntax. This provides maximum flexibility for writing expressive business logic to validate, transform, and route data payloads.
                </p>

                <h4 className="text-xl font-semibold text-indigo-300 mt-4">1. Accessing & Mutating Context</h4>
                <p>The global `context` object represents the payload defined in the Left Panel. You can dynamically modify it to pass data downstream to subsequent stages.</p>
                <pre className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-sm font-mono text-emerald-300">
{`// Example: Basic validation and state mutation
const transactionFee = context.transaction.amount * 0.015;

// Inject calculated data back into the pipeline context
context.calculatedFee = Math.max(transactionFee, 25.00); 

// The last evaluated line dictates the routing outcome
context.transaction.currency === "USD" ? "PASSED" : "FAILED";`}
                </pre>

                <h4 className="text-xl font-semibold text-indigo-300 mt-4">2. Optional Chaining & Nullish Coalescing</h4>
                <p>When dealing with deeply nested JSON where some fields might be undefined, use `?.` (optional chaining) and `??` (nullish coalescing) to prevent runtime crashes.</p>
                <pre className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-sm font-mono text-emerald-300">
{`// Safely access deeply nested properties
const customerTier = context.customer?.profile?.tier ?? "Standard";
const discountCode = context.metadata?.promoCode?.toUpperCase();

if (customerTier === "Platinum" && discountCode === "SAVE20") {
    context.appliedDiscount = 0.20;
    return "PASSED";
}
return "AMBER";`}
                </pre>

                <h4 className="text-xl font-semibold text-indigo-300 mt-4">3. Array Manipulation (Map, Filter, Reduce)</h4>
                <p>Use modern ES6 array methods to aggregate data, filter out invalid records, or transform lists within your pipeline.</p>
                <pre className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-sm font-mono text-emerald-300">
{`// Assuming context.cart.items is an array of objects
const items = context.cart?.items || [];

// 1. FILTER: Get only active items
const activeItems = items.filter(item => item.status === 'active');

// 2. MAP: Extract just the IDs for an API call
context.activeItemIds = activeItems.map(item => item.id);

// 3. REDUCE: Calculate the total cost
const totalCost = activeItems.reduce((sum, item) => sum + item.cost, 0);
context.cartTotal = totalCost;

// 4. FIND: Look for restricted items
const hasRestrictedItem = items.find(item => item.category === 'restricted');

if (hasRestrictedItem) return "FAILED";
return totalCost > 1000 ? "AMBER" : "PASSED";`}
                </pre>

                <h4 className="text-xl font-semibold text-indigo-300 mt-4">4. Object Destructuring & Spread Syntax</h4>
                <p>Destructuring is perfect for extracting multiple variables from the context efficiently, while spread operators (`...`) allow you to merge payloads easily.</p>
                <pre className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-sm font-mono text-emerald-300">
{`// Destructure complex objects instantly
const { amount, currency, merchantId } = context.transaction;
const { isVerified, kycStatus } = context.customer;

// Merge arrays using the spread operator
const legacyFlags = context.legacySystem?.flags || [];
context.allFlags = [...legacyFlags, "NEW_SYSTEM_PROCESSED"];

// Merge objects
context.enrichedPayload = {
    ...context.transaction,
    processedAt: new Date().toISOString(),
    verification: kycStatus
};

(amount > 50000 && !isVerified) ? "AMBER" : "PASSED";`}
                </pre>
              </section>
            )}

            {activeTab === 'components' && (
              <section className="space-y-6">
                <h3 className="text-3xl font-bold text-slate-100 border-b border-slate-800 pb-2">Component Anatomy</h3>
                <p className="text-lg">ClearPath is divided into three purpose-built architectural domains to streamline rule orchestration.</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  <div className="space-y-3">
                    <h4 className="text-lg font-bold text-indigo-400">1. Context Panel (Left)</h4>
                    <p className="text-sm">Manages the input payload and definitions. Features a dynamic JSON editor and automatic rich Form generation.</p>
                    <img src="real_left_panel.png" alt="Left Panel" className="w-full rounded-md shadow-md border border-slate-700" />
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="text-lg font-bold text-indigo-400">2. Pipeline Flow (Middle)</h4>
                    <p className="text-sm">The React Flow visual diagrammer. BAs build their node graphs here to visualize exact logic paths.</p>
                    <img src="real_middle_panel.png" alt="Middle Panel" className="w-full rounded-md shadow-md border border-slate-700" />
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-lg font-bold text-indigo-400">3. Execution & AI (Right)</h4>
                    <p className="text-sm">Hosts workspace requirements/notes and the execution output. Features the AI Export capability.</p>
                    <img src="real_right_panel.png" alt="Right Panel" className="w-full rounded-md shadow-md border border-slate-700" />
                  </div>
                </div>
              </section>
            )}

            {activeTab === 'context' && (
              <section className="space-y-6">
                <h3 className="text-3xl font-bold text-slate-100 border-b border-slate-800 pb-2">Context Engine</h3>
                <p className="text-lg">The Context serves as the single source of truth for the payload injected into the pipeline simulation.</p>
                
                <h4 className="text-xl font-semibold text-indigo-300 mt-4">Creating & Modifying Context Dynamically</h4>
                <p>You can create a new context simply by navigating to the <strong>JSON Tab</strong> in the Left Panel and pasting a new JSON structure. The system parses it instantly and dynamically builds a new Form interface.</p>
                <ol className="list-decimal pl-5 space-y-2">
                  <li><strong>Importing:</strong> Use the `Upload` button in the header to upload an existing environment configuration.</li>
                  <li><strong>Appending Groups:</strong> If you want to add a new "group", just edit the JSON directly: <code className="text-emerald-400">"newGroup": {'{"key": "value"}'}</code>.</li>
                  <li><strong>Rich UI Types:</strong> ClearPath automatically maps data types. If it sees a boolean, it renders a Toggle. Strings render Text Inputs. You can force rich types by passing a `_type` property.</li>
                </ol>

                <h4 className="text-xl font-semibold text-indigo-300 mt-4">Rich Field Configuration Example</h4>
                <pre className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-sm font-mono text-emerald-300">
{`"customerData": {
  "riskRating": {
    "_type": "slider",
    "value": 35,
    "min": 0,
    "max": 100,
    "step": 1
  },
  "tier": {
    "_type": "select",
    "value": "Gold",
    "options": ["Standard", "Silver", "Gold", "Platinum"]
  }
}`}
                </pre>
              </section>
            )}

            {activeTab === 'stages' && (
              <section className="space-y-6">
                <h3 className="text-3xl font-bold text-slate-100 border-b border-slate-800 pb-2">Stages & Flow</h3>
                <p className="text-lg">Stages represent discrete decision nodes inside the pipeline. Each stage contains independent ES6 logic evaluated against the current state of the Context.</p>
                
                <h4 className="text-xl font-semibold text-indigo-300 mt-4">Building a Simulation Flow</h4>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Adding Stages:</strong> Click the <code className="bg-slate-800 px-1 rounded text-indigo-200">+ Add Stage</code> button to append a node to the graph.</li>
                  <li><strong>Renaming:</strong> Click directly on the title (e.g., "Custom Stage") in the UI to give it a business-friendly name like "AML Check".</li>
                  <li><strong>Reordering:</strong> Use the <code className="bg-slate-800 px-1 rounded text-slate-200">^ / v</code> buttons to dynamically shift stages up and down. The flowchart will animate to reflect the new hierarchy.</li>
                </ul>

                <h4 className="text-xl font-semibold text-indigo-300 mt-4">Branch Routing Output</h4>
                <p>When you export the workspace, the pipeline stages are serialized into a strict JSON DAG format. Your ES6 logic should return one of three statuses which dictate routing:</p>
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                  <pre className="text-sm font-mono text-emerald-300">
                    {`"routing": {
  "PASSED": ["next-stage-id"], // Flow continues normally
  "AMBER": ["manual-review"],  // Diverts to human verification
  "FAILED": []                 // Terminates pipeline execution
}`}
                  </pre>
                </div>
              </section>
            )}

            {activeTab === 'demo' && (
              <section className="space-y-6">
                <h3 className="text-3xl font-bold text-slate-100 border-b border-slate-800 pb-2">Interactive Demo & Export</h3>
                <p className="text-lg">
                  Below is an actual animated recording (WebP) showing a business analyst building a rule, navigating the Context form, and successfully running a full Pipeline simulation.
                </p>
                
                {/* The actual video / animated image captured via playwright/browser subagent */}
                <div className="relative">
                  <video src="clearpath_demo.mp4" autoPlay loop muted playsInline className="w-full rounded-lg shadow-2xl border border-indigo-500/30" />
                  <div className="absolute top-2 right-2 bg-indigo-600/90 text-white text-xs font-bold px-2 py-1 rounded backdrop-blur-sm shadow-md">Live Capture</div>
                </div>
                
                <p className="text-sm text-slate-400 mt-2">
                  <strong>Watch how:</strong> Context is modified dynamically, stages update in real time, and the execution engine processes the pipeline when `Run` is clicked.
                </p>

                <h4 className="text-xl font-semibold text-indigo-300 mt-6">Exporting the Work</h4>
                <p>Once you finish building the flow:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Click <strong>Export Workspace</strong> to save an exact replica of the environment (including all stages and modified context JSON) directly to your local file system.</li>
                  <li>Click <strong>AI Prompt</strong> to dump the workspace structure into a pre-engineered textual prompt, specifically formatted for ChatGPT/Claude to assist in drawing Mermaid.js diagrams or analyzing missing test cases!</li>
                </ul>
              </section>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
