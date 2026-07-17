import React, { useState } from 'react';
import { X, Book, Database, Code, Zap, Grid, Maximize2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function HelpModal({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState('pipeline');

  const tabs = [
    { id: 'pipeline', icon: <Grid className="w-4 h-4" />, title: 'Orchestration Pipeline' },
    { id: 'context', icon: <Database className="w-4 h-4" />, title: 'Context & Payloads' },
    { id: 'expression', icon: <Code className="w-4 h-4" />, title: 'Expression Language' },
    { id: 'routing', icon: <Zap className="w-4 h-4" />, title: 'Advanced Routing' },
    { id: 'richui', icon: <Maximize2 className="w-4 h-4" />, title: 'Rich UI Fields' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="glass-panel border border-slate-700/50 rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/50 shrink-0">
          <div className="flex items-center gap-2 text-indigo-400">
            <Book className="w-5 h-5" />
            <h2 className="text-lg font-bold text-slate-100">ClearPath Help Center</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-rose-400 transition-colors p-1 rounded-md hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* Sidebar Navigation */}
          <div className="w-64 border-r border-slate-800 bg-slate-950/50 p-4 shrink-0 overflow-y-auto">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Topics</h3>
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
                  {tab.title}
                </button>
              ))}
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-8 bg-slate-900 text-slate-300">
            {activeTab === 'pipeline' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-slate-100 border-b border-slate-800 pb-2">Orchestration Pipeline</h3>
                <p>The Middle Panel is where you architect the validation flow for your transactions.</p>
                
                <h4 className="text-lg font-semibold text-indigo-300 mt-4">Managing Stages</h4>
                <ul className="list-disc pl-5 space-y-2 text-sm">
                  <li><strong>Add a Stage:</strong> Click the <code className="bg-slate-800 px-1 rounded text-indigo-200">+ Add Stage</code> button in the top right.</li>
                  <li><strong>Remove a Stage:</strong> Click the <code className="bg-slate-800 px-1 rounded text-rose-200">X</code> button on a stage card.</li>
                  <li><strong>Reorder Stages:</strong> Use the <code className="bg-slate-800 px-1 rounded text-slate-200">^</code> and <code className="bg-slate-800 px-1 rounded text-slate-200">v</code> buttons to shift stages up and down. The React Flow diagram on the right will auto-sync to reflect these changes.</li>
                  <li><strong>Rename Stages:</strong> Click directly on a stage's title (e.g., "Custom Stage") to rename it inline.</li>
                </ul>
              </div>
            )}

            {activeTab === 'context' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-slate-100 border-b border-slate-800 pb-2">Context & Payloads</h3>
                <p>The Left Panel contains the <strong>Context</strong> (the raw JSON payload variables) that your pipeline will evaluate.</p>
                
                <h4 className="text-lg font-semibold text-indigo-300 mt-4">Creating Context</h4>
                <ul className="list-disc pl-5 space-y-2 text-sm">
                  <li><strong>From Scratch:</strong> Switch to the <strong>JSON Tab</strong>, delete the contents, and paste your own custom JSON string. When you switch back to the <strong>Form Tab</strong>, ClearPath will automatically generate interactive inputs for every field you defined!</li>
                  <li><strong>Using Templates:</strong> Use the Dropdown selector at the top to load predefined business scenarios.</li>
                </ul>

                <h4 className="text-lg font-semibold text-indigo-300 mt-4">Import / Export</h4>
                <p className="text-sm">You can upload a custom <code>.json</code> file using the <code className="bg-slate-800 px-1 rounded text-indigo-200">Upload</code> icon, or download your current state using the <code className="bg-slate-800 px-1 rounded text-indigo-200">Download</code> icon to save your schemas.</p>
              </div>
            )}

            {activeTab === 'expression' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-slate-100 border-b border-slate-800 pb-2">Expression Language (JavaScript)</h3>
                <p>ClearPath evaluates rules using standard, native JavaScript. You have full access to VS Code-powered <strong>IntelliSense</strong>.</p>
                
                <h4 className="text-lg font-semibold text-indigo-300 mt-4">Basic Rules</h4>
                <ul className="list-disc pl-5 space-y-2 text-sm">
                  <li>Start by typing <code>context.</code> and the IntelliSense engine will suggest variables based on your JSON schema.</li>
                  <li>Use standard JS operators (<code>===</code>, <code>&&</code>, <code>||</code>, <code>&gt;</code>).</li>
                  <li>Your block must evaluate to a status string like <code>"PASSED"</code>, <code>"FAILED"</code>, or <code>"AMBER"</code>. (You don't need to write the `return` keyword, the engine captures the last line).</li>
                </ul>

                <h4 className="text-lg font-semibold text-indigo-300 mt-4">Mutating State</h4>
                <p className="text-sm">You can change context variables mid-flight to pass data to subsequent stages:</p>
                <pre className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-sm font-mono text-emerald-300">
                  {`// Calculate a fee
context.transaction.fee = 500;

// Update retries
context.retries = context.retries + 1;

// Return status
context.retries < 3 ? "PASSED" : "FAILED"`}
                </pre>
              </div>
            )}

            {activeTab === 'routing' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-slate-100 border-b border-slate-800 pb-2">Advanced Routing</h3>
                <p>Stages do not have to execute linearly. By exporting your Pipeline JSON, you can define explicit routing paths.</p>
                
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                  <pre className="text-sm font-mono text-emerald-300">
                    {`"routing": {
  "passed": ["stage-2", "stage-3"], // Runs in parallel
  "amber": ["stage-1"],             // Loops back
  "breached": []                    // Halts
}`}
                  </pre>
                </div>

                <h4 className="text-lg font-semibold text-indigo-300 mt-4">Context Replacement Function</h4>
                <p className="text-sm mb-2">If you want to completely discard the outer context JSON and replace it with a child payload, you can use the built-in <code>replaceContext()</code> function inside your expression:</p>
                <pre className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-sm font-mono text-emerald-300">
                  {`// Strip the 'apiWrapper' and elevate 'actualData' to the root
const child = context.apiWrapper.actualData;
replaceContext(child);
"PASSED"`}
                </pre>
              </div>
            )}

            {activeTab === 'richui' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-white border-b border-slate-800 pb-2">Rich UI Fields</h3>
                <p>You can force the Context Editor to render advanced HTML components (like sliders or dropdowns) by adding a <code>_type</code> schema to your JSON.</p>
                
                <h4 className="text-lg font-semibold text-indigo-300 mt-4">Slider Example</h4>
                <pre className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-sm font-mono text-emerald-300">
{`"riskScore": {
  "_type": "slider",
  "value": 75,
  "min": 0,
  "max": 100,
  "step": 5
}`}
                </pre>

                <h4 className="text-lg font-semibold text-indigo-300 mt-4">Dropdown Example</h4>
                <pre className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-sm font-mono text-emerald-300">
{`"region": {
  "_type": "select",
  "value": "US",
  "options": ["US", "EU", "APAC"]
}`}
                </pre>
                <p className="text-xs text-slate-400 mt-2"><strong>Important:</strong> When writing expressions against rich fields, remember to target the <code>.value</code> property (e.g., <code>context.region.value == "US"</code>).</p>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
