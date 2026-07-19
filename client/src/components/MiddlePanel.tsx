import { useRef, useEffect, useState } from 'react';
import { ChevronDown, ArrowUp, ArrowDown, Plus, Play, CheckCircle2, XCircle, AlertCircle, Clock, Upload, Download, Layers, Code, LayoutTemplate, Maximize2, Minimize2, ChevronsUpDown, ChevronsDownUp, AlignJustify, Lock, Unlock, MessageSquareText } from 'lucide-react';
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
  const { stages, updateStageExpression, updateStageName, updateStageDescription, setStageApprovalState, updateStageShape, addStage, removeStage, moveStage, importPipeline, activeContext, theme } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const monaco = useMonaco();
  const [activeTab, setActiveTab] = useState<'visual' | 'json'>('visual');
  const [pipelineJsonText, setPipelineJsonText] = useState(JSON.stringify(stages, null, 2));

  const [maximizedStages, setMaximizedStages] = useState<Record<string, boolean>>({});
  const [collapsedStages, setCollapsedStages] = useState<Record<string, boolean>>({});
  const [collapsedOutputs, setCollapsedOutputs] = useState<Record<string, boolean>>({});
  const [showReq, setShowReq] = useState<Record<string, boolean>>({});

  // Sync json text when stages change from visual mode
  useEffect(() => {
    if (activeTab === 'visual') {
      setPipelineJsonText(JSON.stringify(stages, null, 2));
    }
  }, [stages, activeTab]);

  const handleExpandAll = () => {
    setCollapsedStages({});
    setCollapsedOutputs({});
    setMaximizedStages({});
  };

  const handleCollapseAll = () => {
    const allCollapsed: Record<string, boolean> = {};
    stages.forEach(s => allCollapsed[s.id] = true);
    setCollapsedStages(allCollapsed);
  };

  const handleCompact = () => {
    const allOutputsCollapsed: Record<string, boolean> = {};
    stages.forEach(s => allOutputsCollapsed[s.id] = true);
    setCollapsedStages({}); // expand all stages
    setCollapsedOutputs(allOutputsCollapsed); // hide outputs
    setMaximizedStages({});
  };

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
      (monaco.languages.typescript as any).javascriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: false,
        noSyntaxValidation: false,
      });

      (monaco.languages.typescript as any).javascriptDefaults.setCompilerOptions({
        target: (monaco.languages.typescript as any).ScriptTarget.ES2020,
        allowNonTsExtensions: true,
      });
      
      // Merge active context with all available output contexts from simulation runs
      let mergedContext = { ...activeContext };
      stages.forEach(stage => {
        if (stage.outputContext) {
          mergedContext = { ...mergedContext, ...stage.outputContext };
        }
      });
      
      const typeDef = `
        /** 
         * Global Context Object for Pipeline Execution 
         */
        declare var context: ${JSON.stringify(mergedContext, null, 2)};
        
        /**
         * Replaces the entire root context object with a new object structure.
         * Useful for unwrapping payloads.
         */
        declare function replaceContext(newContext: any): void;
      `;

      // Clear previous extra libs to prevent duplicates when context updates
      (monaco.languages.typescript as any).javascriptDefaults.getExtraLibs();
      (monaco.languages.typescript as any).javascriptDefaults.setExtraLibs([{
        content: typeDef,
        filePath: 'ts:filename/context.d.ts'
      }]);
    }
  }, [monaco, activeContext, stages]);

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
          <div className="h-4 w-px bg-slate-700 mx-1"></div>
          <button 
            onClick={handleExpandAll}
            className="flex items-center gap-1 px-2 py-1.5 text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition-colors"
            title="Expand All"
          >
            <ChevronsUpDown className="w-4 h-4" />
          </button>
          <button 
            onClick={handleCompact}
            className="flex items-center gap-1 px-2 py-1.5 text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition-colors"
            title="Compact (Show Code)"
          >
            <AlignJustify className="w-4 h-4" />
          </button>
          <button 
            onClick={handleCollapseAll}
            className="flex items-center gap-1 px-2 py-1.5 text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition-colors"
            title="Collapse All"
          >
            <ChevronsDownUp className="w-4 h-4" />
          </button>
          <div className="h-4 w-px bg-slate-700 mx-1"></div>
          <button 
            onClick={addStage}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded-md transition-colors ml-1"
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
            <div key={`${stage.id}-${index}`} className="relative">
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
                      disabled={stage.approvalState === 'approved'}
                      className="font-medium text-slate-200 bg-transparent border-b border-transparent hover:border-slate-700 focus:border-indigo-500 focus:outline-none w-full transition-colors disabled:opacity-70 disabled:hover:border-transparent disabled:cursor-not-allowed"
                      placeholder="Stage Name..."
                    />
                    <p className="text-xs text-slate-500 capitalize flex items-center gap-2">
                      Status: {stage.status}
                      <span className="text-slate-700">|</span>
                      <select 
                        value={stage.shape || 'rectangle'} 
                        onChange={(e) => updateStageShape(stage.id, e.target.value as any)}
                        disabled={stage.approvalState === 'approved'}
                        className="bg-transparent border-none text-slate-400 focus:ring-0 p-0 text-xs cursor-pointer hover:text-indigo-400 outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        <option value="rectangle">Rectangle (Process)</option>
                        <option value="diamond">Diamond (Decision)</option>
                        <option value="ellipse">Ellipse (Start/End)</option>
                        <option value="parallelogram">Parallelogram (I/O)</option>
                      </select>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-4">
                  <button 
                    onClick={() => moveStage(stage.id, 'up')}
                    disabled={index === 0}
                    className="text-slate-500 hover:text-indigo-400 disabled:opacity-30 transition-colors p-1"
                    title="Move Up"
                  >
                    <ArrowUp className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => moveStage(stage.id, 'down')}
                    disabled={index === stages.length - 1}
                    className="text-slate-500 hover:text-indigo-400 disabled:opacity-30 transition-colors p-1"
                    title="Move Down"
                  >
                    <ArrowDown className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => setShowReq(prev => ({ ...prev, [stage.id]: !prev[stage.id] }))}
                    className={cn("transition-colors p-1 ml-1", stage.description ? "text-indigo-400 hover:text-indigo-300" : "text-slate-500 hover:text-indigo-400")}
                    title={stage.description ? "Edit Requirement" : "Add Requirement"}
                  >
                    <MessageSquareText className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setCollapsedStages(prev => ({ ...prev, [stage.id]: !prev[stage.id] }))}
                    className="text-slate-500 hover:text-indigo-400 transition-colors p-1 ml-1"
                    title={collapsedStages[stage.id] ? "Expand Stage" : "Collapse Stage"}
                  >
                    <ChevronDown className={cn("w-5 h-5 transition-transform", collapsedStages[stage.id] && "-rotate-90")} />
                  </button>
                  <select 
                    value={stage.approvalState || 'draft'}
                    onChange={(e) => setStageApprovalState(stage.id, e.target.value as any)}
                    className={cn(
                      "text-[10px] font-bold uppercase px-2 py-1 rounded border appearance-none cursor-pointer outline-none ml-2",
                      stage.approvalState === 'approved' ? 'bg-emerald-950 text-emerald-400 border-emerald-800' :
                      stage.approvalState === 'review' ? 'bg-amber-950 text-amber-400 border-amber-800' :
                      'bg-slate-800 text-slate-400 border-slate-700'
                    )}
                    title="Stage Approval Workflow"
                  >
                    <option value="draft">Draft</option>
                    <option value="review">Review</option>
                    <option value="approved">Approved</option>
                  </select>
                  <button 
                    onClick={() => removeStage(stage.id)}
                    disabled={stage.approvalState === 'approved'}
                    className="text-slate-500 hover:text-rose-400 disabled:opacity-30 disabled:hover:text-slate-500 transition-colors p-1 ml-1"
                    title="Remove Stage"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {!collapsedStages[stage.id] && (
              <div className="space-y-4">
                {(showReq[stage.id] || stage.description) && (
                  <div className="bg-slate-950/50 border border-slate-800/80 rounded-lg p-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="block text-[10px] font-semibold text-indigo-400/80 mb-2 uppercase tracking-wider flex justify-between items-center">
                      Business Requirement
                      <button onClick={() => setShowReq(prev => ({ ...prev, [stage.id]: false }))} className="text-slate-500 hover:text-slate-300"><XCircle className="w-3 h-3" /></button>
                    </label>
                    <textarea 
                      value={stage.description || ''}
                      onChange={(e) => updateStageDescription(stage.id, e.target.value)}
                      disabled={stage.approvalState === 'approved'}
                      placeholder="Describe the business rules, eligibility criteria, or required operations for this stage..."
                      className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded p-2 text-xs text-slate-300 resize-none h-12 focus:outline-none transition-colors disabled:opacity-80 disabled:cursor-not-allowed"
                    />
                  </div>
                )}
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
                      path={`stage-${stage.id}.js`}
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
                        suggestOnTriggerCharacters: true,
                        readOnly: stage.approvalState === 'approved'
                      }}
                    />
                  </div>
                </div>

                {stage.outputContext && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs text-slate-400">Output Context (Diff)</label>
                      <button 
                        onClick={() => setCollapsedOutputs(prev => ({ ...prev, [stage.id]: !prev[stage.id] }))}
                        className="text-slate-500 hover:text-indigo-400 transition-colors p-1 text-xs flex items-center gap-1"
                      >
                        {collapsedOutputs[stage.id] ? 'Expand Details' : 'Collapse Details'}
                      </button>
                    </div>
                    {!collapsedOutputs[stage.id] && (
                      <div className="bg-slate-950 rounded-lg p-3 border border-slate-800/80 overflow-x-auto">
                        <pre className="text-xs font-mono text-emerald-400">
                          {JSON.stringify(stage.outputContext, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
                {stage.errorMessage && (
                  <div className="bg-rose-950/30 border border-rose-900/50 rounded-lg p-3 text-xs text-rose-400">
                    {stage.errorMessage}
                  </div>
                )}
              </div>
              )}
            </div>
          </div>
        )))}
      </div>
    </div>
  );
}
