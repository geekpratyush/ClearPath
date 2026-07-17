import { useRef, useEffect, useState } from 'react';
import { ChevronDown, Plus, Play, CheckCircle2, XCircle, AlertCircle, Clock, Upload, Download, Layers, Code, LayoutTemplate, Maximize2, Minimize2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Editor, { useMonaco } from '@monaco-editor/react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const statusColors: any = {
  idle: 'text-slate-500 border-slate-700',
  processing: 'text-blue-400 border-blue-400 bg-blue-400/10 animate-pulse',
  passed: 'text-emerald-400 border-emerald-400 bg-emerald-400/10',
  breached: 'text-rose-400 border-rose-400 bg-rose-400/10',
  amber: 'text-amber-400 border-amber-400 bg-amber-400/10'
};

const statusIcons: any = {
  idle: <Clock className="w-5 h-5" />,
  processing: <Play className="w-5 h-5" />,
  passed: <CheckCircle2 className="w-5 h-5" />,
  breached: <XCircle className="w-5 h-5" />,
  amber: <AlertCircle className="w-5 h-5" />
};

export default function MiddlePanel() {
  const { stages, updateStageExpression, updateStageName, addStage, removeStage, moveStage, importPipeline, activeContext, theme } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const monaco = useMonaco();
  const [activeTab, setActiveTab] = useState<'visual' | 'json'>('visual');
  const [pipelineJsonText, setPipelineJsonText] = useState(JSON.stringify(stages, null, 2));

  const [maximizedStages, setMaximizedStages] = useState<Record<string, boolean>>({});

  // Sync json text when stages change from visual mode
  useEffect(() => {
    if (activeTab === 'visual') {
      setPipelineJsonText(JSON.stringify(stages, null, 2));
    }
  }, [stages, activeTab]);

  const handlePipelineJsonChange = (val: string | undefined) => {
    const text = val || '';
    setPipelineJsonText(text);
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        importPipeline(parsed);
      }
    } catch (e) {
      // ignore invalid json during typing
    }
  };

  useEffect(() => {
    if (monaco) {
      monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: false,
        noSyntaxValidation: false,
      });

      monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
        target: monaco.languages.typescript.ScriptTarget.ES2020,
        allowNonTsExtensions: true,
      });
      
      const typeDef = `
        /** 
         * Global Context Object for Pipeline Execution 
         */
        declare var context: ${JSON.stringify(activeContext, null, 2)};
        
        /**
         * Replaces the entire root context object with a new object structure.
         * Useful for unwrapping payloads.
         */
        declare function replaceContext(newContext: any): void;
      `;

      monaco.languages.typescript.javascriptDefaults.addExtraLib(typeDef, 'ts:filename/context.d.ts');
    }
  }, [monaco, activeContext]);

  const handleExportPipeline = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(stages, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "clearpath_pipeline.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImportPipeline = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json)) {
          importPipeline(json);
        } else {
          alert("Invalid Pipeline JSON file. Expected an array of stages.");
        }
      } catch (err) {
        alert("Invalid Pipeline JSON file.");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/50">
      <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            Orchestration Pipeline
          </h2>
          <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-800">
            <button 
              onClick={() => setActiveTab('visual')}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors",
                activeTab === 'visual' ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
              )}
            >
              <LayoutTemplate className="w-3.5 h-3.5" />
              Visual
            </button>
            <button 
              onClick={() => setActiveTab('json')}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors",
                activeTab === 'json' ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
              )}
            >
              <Code className="w-3.5 h-3.5" />
              JSON
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input type="file" ref={fileInputRef} onChange={handleImportPipeline} accept=".json" className="hidden" />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition-colors"
            title="Import Pipeline"
          >
            <Upload className="w-4 h-4" />
          </button>
          <button 
            onClick={handleExportPipeline}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition-colors"
            title="Export Pipeline"
          >
            <Download className="w-4 h-4" />
          </button>
          <button 
            onClick={addStage}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded-md transition-colors ml-2"
          >
            <Plus className="w-4 h-4" />
            Add Stage
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
        {activeTab === 'json' ? (
          <div className="h-full w-full border border-slate-800 rounded-xl overflow-hidden glass-panel">
            <Editor
              height="100%"
              defaultLanguage="json"
              theme={theme === 'dark' ? 'vs-dark' : 'light'}
              value={pipelineJsonText}
              onChange={handlePipelineJsonChange}
              options={{
                minimap: { enabled: false },
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                padding: { top: 16, bottom: 16 },
                fontSize: 13,
                fontFamily: 'monospace',
                formatOnPaste: true,
              }}
            />
          </div>
        ) : (
          stages.map((stage, index) => (
            <div key={stage.id} className="relative">
            {index !== stages.length - 1 && (
              <div className="absolute left-6 top-16 bottom-[-24px] w-0.5 bg-slate-800 z-0"></div>
            )}
            
            <div className={cn(
              "relative z-10 rounded-xl border p-5 transition-all duration-300 glass-panel",
              stage.status === 'passed' ? 'border-emerald-500/30' :
              stage.status === 'breached' ? 'border-rose-500/30' :
              stage.status === 'amber' ? 'border-amber-500/30' :
              stage.status === 'processing' ? 'border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]' :
              'border-slate-700/50'
            )}>
                <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full border shrink-0",
                    statusColors[stage.status]
                  )}>
                    {statusIcons[stage.status]}
                  </div>
                  <div className="flex-1">
                    <input 
                      type="text"
                      value={stage.name}
                      onChange={(e) => updateStageName(stage.id, e.target.value)}
                      className="font-medium text-slate-200 bg-transparent border-b border-transparent hover:border-slate-700 focus:border-indigo-500 focus:outline-none w-full transition-colors"
                    />
                    <p className="text-xs text-slate-500 capitalize">Status: {stage.status}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-4">
                  <button 
                    onClick={() => moveStage(stage.id, 'up')}
                    disabled={index === 0}
                    className="text-slate-500 hover:text-indigo-400 disabled:opacity-30 transition-colors p-1"
                    title="Move Up"
                  >
                    <ChevronDown className="w-5 h-5 rotate-180" />
                  </button>
                  <button 
                    onClick={() => moveStage(stage.id, 'down')}
                    disabled={index === stages.length - 1}
                    className="text-slate-500 hover:text-indigo-400 disabled:opacity-30 transition-colors p-1"
                    title="Move Down"
                  >
                    <ChevronDown className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => removeStage(stage.id)}
                    className="text-slate-500 hover:text-rose-400 transition-colors p-1 ml-2"
                    title="Remove Stage"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs text-slate-400">Expression Logic Rule</label>
                    <button 
                      onClick={() => setMaximizedStages(prev => ({ ...prev, [stage.id]: !prev[stage.id] }))}
                      className="text-slate-500 hover:text-indigo-400 transition-colors p-1"
                      title={maximizedStages[stage.id] ? "Restore size" : "Maximize editor"}
                    >
                      {maximizedStages[stage.id] ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div className={cn(
                    "border border-slate-800 rounded-lg overflow-hidden transition-all duration-300",
                    maximizedStages[stage.id] ? "h-[500px]" : "h-32"
                  )}>
                    <Editor
                      height="100%"
                      defaultLanguage="javascript"
                      theme={theme === 'dark' ? 'vs-dark' : 'light'}
                      value={stage.expression}
                      onChange={(val) => updateStageExpression(stage.id, val || '')}
                      options={{
                        minimap: { enabled: true, scale: 0.75 },
                        lineNumbers: 'on',
                        scrollBeyondLastLine: false,
                        wordWrap: 'on',
                        padding: { top: 12, bottom: 12 },
                        fontSize: 13,
                        fontFamily: 'monospace',
                        bracketPairColorization: { enabled: true },
                        formatOnPaste: true,
                        suggestOnTriggerCharacters: true
                      }}
                    />
                  </div>
                </div>

                {stage.outputContext && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="block text-xs text-slate-400 mb-1">Output Context (Diff)</label>
                    <div className="bg-slate-950 rounded-lg p-3 border border-slate-800/80 overflow-x-auto">
                      <pre className="text-xs font-mono text-emerald-400">
                        {JSON.stringify(stage.outputContext, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
                {stage.errorMessage && (
                  <div className="bg-rose-950/30 border border-rose-900/50 rounded-lg p-3 text-xs text-rose-400">
                    {stage.errorMessage}
                  </div>
                )}
              </div>
            </div>
          </div>
        )))}
      </div>
    </div>
  );
}
