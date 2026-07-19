import { useState, useRef } from 'react';
import { useStore } from '../store/useStore';
import { Database, SlidersHorizontal, Code, Upload, Download, FileText, Wrench, Plus, Trash2 } from 'lucide-react';

export default function LeftPanel() {
  const [activeTab, setActiveTab] = useState<'json' | 'form' | 'notes' | 'builder'>('form');
  const { initialContext, updateContextField, setInitialContext, importContext, customTemplates, saveTemplate, deleteTemplate, resetTemplates, activeTemplateName, workspaceNotes, updateWorkspaceNotes } = useStore();
  const [jsonText, setJsonText] = useState(JSON.stringify(initialContext, null, 2));
  const [isSavingAs, setIsSavingAs] = useState(false);
  const [saveAsName, setSaveAsName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonText(e.target.value);
    try {
      const parsed = JSON.parse(e.target.value);
      setInitialContext(parsed);
    } catch (err) {
      // Ignore invalid JSON while typing
    }
  };

  const handleExportContext = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(initialContext, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "clearpath_context.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImportContext = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        importContext(json);
        setJsonText(JSON.stringify(json, null, 2));
      } catch (err) {
        alert("Invalid Context JSON file.");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const renderFormFields = (obj: any, path = '') => {
    return Object.entries(obj).map(([key, rawValue]) => {
      const value = rawValue as any;
      const currentPath = path ? `${path}.${key}` : key;
      const type = typeof value;

      if (type === 'object' && value !== null) {
        // Check if it's a rich field definition
        if (value._type !== undefined) {
          if (value._type === 'slider') {
            return (
              <div key={currentPath}>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs text-slate-500 capitalize">{key}</label>
                  <span className="text-xs text-indigo-400 font-mono">{value.value}</span>
                </div>
                <input 
                  type="range" 
                  min={value.min || 0} 
                  max={value.max || 100}
                  step={value.step || 1}
                  value={value.value} 
                  onChange={(e) => updateContextField(`${currentPath}.value`, Number(e.target.value))} 
                  className="w-full accent-indigo-500" 
                />
              </div>
            );
          }
          if (value._type === 'select') {
            return (
              <div key={currentPath}>
                <label className="block text-xs text-slate-500 mb-1 capitalize">{key}</label>
                <select 
                  value={value.value}
                  onChange={(e) => updateContextField(`${currentPath}.value`, e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 text-slate-200"
                >
                  {value.options?.map((opt: string) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            );
          }
          if (value._type === 'radio') {
            return (
              <div key={currentPath}>
                <label className="block text-xs text-slate-500 mb-2 capitalize">{key}</label>
                <div className="space-y-2">
                  {value.options?.map((opt: string) => (
                    <label key={opt} className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name={currentPath}
                        value={opt}
                        checked={value.value === opt}
                        onChange={(e) => updateContextField(`${currentPath}.value`, e.target.value)}
                        className="text-indigo-500 focus:ring-indigo-500 bg-slate-950 border-slate-700"
                      />
                      <span className="text-sm text-slate-300">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            );
          }
        }

        return (
          <section key={currentPath} className="mb-6">
            <h3 className="text-sm font-medium text-slate-400 mb-3 uppercase tracking-wider">
              {key}
            </h3>
            <div className="space-y-3 pl-4 border-l border-slate-800">
              {renderFormFields(value, currentPath)}
            </div>
          </section>
        );
      }

      if (type === 'boolean') {
        return (
          <div key={currentPath} className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded px-3 py-2">
            <span className="text-sm text-slate-300 capitalize">{key}</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={value as boolean} 
                onChange={(e) => updateContextField(currentPath, e.target.checked)} 
                className="sr-only peer" 
              />
              <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-500"></div>
            </label>
          </div>
        );
      }

      if (type === 'number') {
        return (
          <div key={currentPath}>
            <label className="block text-xs text-slate-500 mb-1 capitalize">{key}</label>
            <input 
              type="number" 
              value={value as number} 
              onChange={(e) => updateContextField(currentPath, Number(e.target.value))} 
              className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" 
            />
          </div>
        );
      }

      // Default string input
      return (
        <div key={currentPath}>
          <label className="block text-xs text-slate-500 mb-1 capitalize">{key}</label>
          <input 
            type="text" 
            value={value as string} 
            onChange={(e) => updateContextField(currentPath, e.target.value)} 
            className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" 
          />
        </div>
      );
    });
  };

  const renderSchemaBuilderNode = (obj: any, path: string[]) => {
    return (
      <div className="space-y-2">
        {Object.entries(obj).map(([key, value]) => {
          const isGroup = typeof value === 'object' && value !== null && value._type === undefined;
          return (
            <div 
              key={key} 
              className="border border-slate-800 rounded p-2 bg-slate-950 group/node transition-colors hover:border-slate-600"
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', JSON.stringify({ key, path }));
                e.stopPropagation();
              }}
              onDragEnter={(e) => e.preventDefault()}
              onDragOver={(e) => {
                e.preventDefault(); 
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                try {
                  const data = JSON.parse(e.dataTransfer.getData('text/plain'));
                  if (data.key === key) return;
                  if (JSON.stringify(data.path) !== JSON.stringify(path)) return; 
                  
                  const newContext = JSON.parse(JSON.stringify(initialContext));
                  let curr = newContext;
                  for (const p of path) curr = curr[p];
                  
                  const keys = Object.keys(curr);
                  const sourceIdx = keys.indexOf(data.key);
                  
                  if (sourceIdx >= 0) {
                    keys.splice(sourceIdx, 1);
                    const targetIdx = keys.indexOf(key);
                    
                    if (targetIdx >= 0) {
                      keys.splice(targetIdx, 0, data.key);
                      
                      const newObj: any = {};
                      for (const k of keys) {
                        newObj[k] = curr[k];
                      }
                      
                      if (path.length === 0) {
                        setInitialContext(newObj);
                      } else {
                        let parent = newContext;
                        for (let i = 0; i < path.length - 1; i++) {
                           parent = parent[path[i]];
                        }
                        parent[path[path.length - 1]] = newObj;
                        setInitialContext(newContext);
                      }
                    }
                  }
                } catch(err) {
                  console.error("Drop error", err);
                }
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="cursor-grab active:cursor-grabbing text-slate-600 hover:text-indigo-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>
                  </div>
                  <span className="text-sm text-slate-300 font-medium">{key}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded uppercase">{isGroup ? 'group' : value?._type || typeof value}</span>
                  <button 
                    onClick={() => {
                      const newContext = JSON.parse(JSON.stringify(initialContext));
                      if (path.length === 0) {
                        delete newContext[key];
                      } else {
                        let curr = newContext;
                        for (const p of path) curr = curr[p];
                        delete curr[key];
                      }
                      setInitialContext(newContext);
                    }} 
                    className="text-rose-500 hover:text-rose-400 opacity-0 group-hover/node:opacity-100 transition-opacity"
                    title="Delete field"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              {isGroup && (
                <div className="mt-2 pl-6 border-l border-slate-700/50">
                  {renderSchemaBuilderNode(value, [...path, key])}
                  <BuilderAddField 
                    onAdd={(k, t) => {
                      const newContext = JSON.parse(JSON.stringify(initialContext));
                      let curr = newContext;
                      for (const p of [...path, key]) curr = curr[p];
                      
                      let defaultVal: any = "";
                      if (t === 'number') defaultVal = 0;
                      else if (t === 'boolean') defaultVal = false;
                      else if (t === 'group') defaultVal = {};
                      else if (t === 'slider') defaultVal = { _type: "slider", value: 50, min: 0, max: 100, step: 1 };
                      else if (t === 'select') defaultVal = { _type: "select", value: "Option 1", options: ["Option 1", "Option 2"] };
                      else if (t === 'radio') defaultVal = { _type: "radio", value: "Option 1", options: ["Option 1", "Option 2"] };
                      
                      curr[k] = defaultVal;
                      setInitialContext(newContext);
                    }} 
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800">
      {/* Workspace Templates Panel */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/50">
        <h3 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">Workspace Templates</h3>
        <div className="flex flex-col gap-2">
          <select 
            value={activeTemplateName}
            onChange={(e) => {
              const template = e.target.value;
              useStore.getState().loadTemplate(template);
              setJsonText(JSON.stringify(useStore.getState().initialContext, null, 2));
            }}
            className="bg-slate-800 text-sm text-slate-300 border border-slate-700 rounded px-2 py-1.5 outline-none focus:border-indigo-500 w-full"
          >
            <optgroup label="System Templates">
              <option value="clearingLimits">Clearing Limits (Financial)</option>
              <option value="earmarkingApproval">Earmarking Approval</option>
              <option value="facilityEligibility">Facility Eligibility</option>
              <option value="onboarding">User Onboarding Flow</option>
              <option value="interactiveRisk">Interactive UI Example</option>
              <option value="scratchpad">Blank Scratchpad</option>
            </optgroup>
            {Object.keys(customTemplates).length > 0 && (
              <optgroup label="Saved Templates">
                {Object.keys(customTemplates).map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </optgroup>
            )}
          </select>
          <div className="flex gap-1 w-full justify-end mt-1">
            {isSavingAs ? (
              <div className="flex gap-1 w-full">
                <input 
                  type="text" 
                  value={saveAsName}
                  onChange={e => setSaveAsName(e.target.value)}
                  placeholder="Template Name..."
                  className="text-xs bg-slate-900 border border-slate-700 rounded px-2 py-1 flex-1 text-slate-200 outline-none focus:border-indigo-500"
                  autoFocus
                  onKeyDown={e => {
                    if (e.key === 'Enter' && saveAsName) {
                      saveTemplate(saveAsName);
                      setIsSavingAs(false);
                      setSaveAsName('');
                    }
                  }}
                />
                <button 
                  onClick={() => {
                    if (saveAsName) saveTemplate(saveAsName);
                    setIsSavingAs(false);
                    setSaveAsName('');
                  }}
                  className="text-[10px] font-medium bg-indigo-600 hover:bg-indigo-500 px-2 py-1 rounded text-white transition-colors"
                >
                  Confirm
                </button>
                <button 
                  onClick={() => setIsSavingAs(false)}
                  className="text-[10px] font-medium bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <button 
                  onClick={() => {
                    const richContext = {
                      configuration: {
                        threshold: { _type: "slider", value: 50, min: 0, max: 100, step: 1 },
                        mode: { _type: "select", value: "Standard", options: ["Standard", "Advanced", "Strict"] },
                        environment: { _type: "radio", value: "Production", options: ["Production", "UAT", "Dev"] },
                        enableLogging: true
                      },
                      data: {
                        referenceId: "NEW-1234"
                      }
                    };
                    useStore.getState().setInitialContext(richContext);
                    useStore.getState().importPipeline([{
                      id: `stage-${Date.now()}`,
                      name: 'Initial Stage',
                      expression: 'context.configuration.threshold.value > 0 ? "PASSED" : "FAILED"',
                      status: 'idle',
                      shape: 'ellipse'
                    }]);
                    useStore.getState().updateWorkspaceNotes('New workspace initialized with rich UI components. Edit this note to document your requirements.');
                    
                    setSaveAsName('New Workspace');
                    setIsSavingAs(true);
                  }}
                  className="text-[10px] font-medium bg-emerald-900/50 hover:bg-emerald-600 px-2 py-1 rounded text-emerald-400 hover:text-white transition-colors border border-emerald-800/50"
                  title="Create a new workspace with rich components"
                >
                  New
                </button>
                <button 
                  onClick={() => {
                    if (customTemplates[activeTemplateName]) {
                      saveTemplate(activeTemplateName);
                    } else {
                      setSaveAsName('');
                      setIsSavingAs(true);
                    }
                  }}
                  className="text-[10px] font-medium bg-slate-800 hover:bg-indigo-600 px-2 py-1 rounded text-slate-300 hover:text-white transition-colors border border-slate-700"
                  title="Save changes to this template"
                >
                  Save
                </button>
                <button 
                  onClick={() => {
                    setSaveAsName('');
                    setIsSavingAs(true);
                  }}
                  className="text-[10px] font-medium bg-slate-800 hover:bg-indigo-600 px-2 py-1 rounded text-slate-300 hover:text-white transition-colors border border-slate-700"
                  title="Save as a new template"
                >
                  Save As
                </button>
                <button 
                  onClick={() => {
                    if (customTemplates[activeTemplateName]) {
                      deleteTemplate(activeTemplateName);
                    } else {
                      alert("You cannot delete a System Template.");
                    }
                  }}
                  className="text-[10px] font-medium bg-slate-800 hover:bg-rose-600 px-2 py-1 rounded text-slate-300 hover:text-white transition-colors border border-slate-700"
                  title="Delete current template"
                >
                  Del
                </button>
                <button 
                  onClick={() => {
                    if (confirm("Reset and delete all saved templates?")) resetTemplates();
                  }}
                  className="text-[10px] font-medium bg-slate-800 hover:bg-rose-600 px-2 py-1 rounded text-slate-300 hover:text-white transition-colors border border-slate-700"
                  title="Wipe all custom templates"
                >
                  Reset
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-semibold">Context Payload</h2>
          <div className="flex items-center ml-2 border-l border-slate-700 pl-2 gap-1">
            <input type="file" ref={fileInputRef} onChange={handleImportContext} accept=".json" className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded transition-colors" title="Import Context JSON">
              <Upload className="w-4 h-4" />
            </button>
            <button onClick={handleExportContext} className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded transition-colors" title="Export Context JSON">
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between p-2 border-b border-slate-800 bg-slate-900/50">
        <div className="flex bg-slate-800 rounded-lg p-1 w-full">
          <button 
            onClick={() => setActiveTab('form')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${activeTab === 'form' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            <SlidersHorizontal className="w-4 h-4 inline-block mr-1" />
            Form
          </button>
          <button 
            onClick={() => setActiveTab('json')}
            className={`px-3 py-1 text-sm rounded-md transition-colors flex-1 ${activeTab === 'json' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            <Code className="w-4 h-4 inline-block mr-1" />
            JSON
          </button>
          <button 
            onClick={() => setActiveTab('notes')}
            className={`px-2 py-1 text-xs rounded-md transition-colors flex-1 flex items-center justify-center ${activeTab === 'notes' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            <FileText className="w-3.5 h-3.5 mr-1" />
            Notes
          </button>
          <button 
            onClick={() => setActiveTab('builder')}
            className={`px-2 py-1 text-xs rounded-md transition-colors flex-1 flex items-center justify-center ${activeTab === 'builder' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            <Wrench className="w-3.5 h-3.5 mr-1" />
            Builder
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
        {activeTab === 'json' ? (
          <textarea
            value={jsonText}
            onChange={handleJsonChange}
            className="w-full h-full bg-slate-950 text-emerald-400 p-4 rounded-lg font-mono text-sm border border-slate-800 focus:outline-none focus:border-indigo-500 resize-none"
            spellCheck={false}
          />
        ) : activeTab === 'notes' ? (
          <textarea
            value={workspaceNotes}
            onChange={(e) => updateWorkspaceNotes(e.target.value)}
            placeholder="Add pipeline requirements, documentation, or sticky notes here..."
            className="w-full h-full bg-slate-950/80 text-amber-100 p-4 rounded-lg font-sans text-sm border border-amber-900/30 focus:outline-none focus:border-amber-500/50 resize-none shadow-inner"
          />
        ) : activeTab === 'builder' ? (
          <div className="space-y-4">
            {renderSchemaBuilderNode(initialContext, [])}
            <BuilderAddField 
              onAdd={(k, t) => {
                const newContext = JSON.parse(JSON.stringify(initialContext));
                let defaultVal: any = "";
                if (t === 'number') defaultVal = 0;
                else if (t === 'boolean') defaultVal = false;
                else if (t === 'group') defaultVal = {};
                else if (t === 'slider') defaultVal = { _type: "slider", value: 50, min: 0, max: 100, step: 1 };
                else if (t === 'select') defaultVal = { _type: "select", value: "Option 1", options: ["Option 1", "Option 2"] };
                else if (t === 'radio') defaultVal = { _type: "radio", value: "Option 1", options: ["Option 1", "Option 2"] };
                
                newContext[k] = defaultVal;
                setInitialContext(newContext);
              }} 
            />
          </div>
        ) : (
          <div className="space-y-4">
            {renderFormFields(initialContext)}
          </div>
        )}
      </div>
    </div>
  );
}

function BuilderAddField({ onAdd }: { onAdd: (key: string, type: string) => void }) {
  const [key, setKey] = useState('');
  const [type, setType] = useState('string');
  return (
    <div className="flex gap-2 items-center mt-2 p-2 border border-dashed border-slate-700 rounded bg-slate-900/50">
      <input type="text" value={key} onChange={e => setKey(e.target.value)} placeholder="Field name" className="flex-1 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 outline-none focus:border-indigo-500 w-20" />
      <select value={type} onChange={e => setType(e.target.value)} className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 outline-none focus:border-indigo-500 w-24">
        <option value="string">String</option>
        <option value="number">Number</option>
        <option value="boolean">Boolean</option>
        <option value="group">Group</option>
        <option value="slider">Slider</option>
        <option value="select">Dropdown</option>
        <option value="radio">Radio</option>
      </select>
      <button onClick={() => { if (key) { onAdd(key, type); setKey(''); } }} className="bg-indigo-600 hover:bg-indigo-500 text-white p-1 rounded shrink-0">
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}
