import { useState, useEffect } from 'react';
import LeftPanel from './components/LeftPanel';
import MiddlePanel from './components/MiddlePanel';
import RightPanel from './components/RightPanel';
import HelpModal from './components/HelpModal';
import DocumentationModal from './components/DocumentationModal';
import { Moon, Sun, HelpCircle, Upload, Bot, Database, BookOpen } from 'lucide-react';
import { useStore } from './store/useStore';
import { useRef } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  const { theme, setTheme, initialContext, stages, workspaceNotes } = useStore();
  const [showHelp, setShowHelp] = useState(false);
  const [showDocs, setShowDocs] = useState(false);
  const workspaceInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleExportWorkspace = () => {
    const data = {
      notes: workspaceNotes,
      context: initialContext,
      stages: stages
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "clearpath_workspace.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleExportPrompt = () => {
    const prompt = `Here is a context and pipeline definition from ClearPath Simulator.

## Context (JSON)
\`\`\`json
${JSON.stringify(initialContext, null, 2)}
\`\`\`

## Pipeline Stages (JSON)
\`\`\`json
${JSON.stringify(stages, null, 2)}
\`\`\`

## Notes / Requirements
${workspaceNotes || 'No additional notes provided.'}

Please analyze this pipeline, summarize its functionality, and generate any relevant implementation code or Mermaid.js diagrams that accurately represent this flow.`;

    const dataStr = "data:text/plain;charset=utf-8," + encodeURIComponent(prompt);
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "ai_prompt.txt");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImportWorkspace = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.context && json.stages) {
          useStore.getState().importContext(json.context);
          useStore.getState().importPipeline(json.stages);
          if (json.notes !== undefined) {
            useStore.getState().updateWorkspaceNotes(json.notes);
          }
        } else {
          alert("Invalid Workspace file format.");
        }
      } catch (err) {
        alert("Error parsing file.");
      }
    };
    reader.readAsText(file);
    if (workspaceInputRef.current) workspaceInputRef.current.value = '';
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-200 overflow-hidden transition-colors duration-300">
      {/* Header */}
      <header className="h-14 border-b border-slate-800 bg-slate-900 flex items-center justify-between px-6 shrink-0 z-10 transition-colors duration-300">
        <div className="flex items-center gap-3">
          <img src="logo.svg" alt="ClearPath Logo" className="h-8" />
          <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 uppercase tracking-wider border border-slate-700">Enterprise</span>
        </div>
        <div className="flex items-center gap-2">
          <input type="file" ref={workspaceInputRef} onChange={handleImportWorkspace} accept=".json" className="hidden" />
          <button 
            onClick={() => workspaceInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-slate-800 hover:bg-indigo-600/20 text-slate-300 hover:text-indigo-400 border border-slate-700 hover:border-indigo-500/50 rounded-md transition-colors mr-2"
            title="Import Full Workspace"
          >
            <Upload className="w-4 h-4" />
            <span className="font-medium hidden sm:inline">Import Workspace</span>
          </button>
          
          <button 
            onClick={handleExportWorkspace}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-slate-800 hover:bg-indigo-600/20 text-slate-300 hover:text-indigo-400 border border-slate-700 hover:border-indigo-500/50 rounded-md transition-colors"
            title="Export Full Workspace"
          >
            <Database className="w-4 h-4" />
            <span className="font-medium hidden sm:inline">Export Workspace</span>
          </button>
          
          <button 
            onClick={handleExportPrompt}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-slate-800 hover:bg-emerald-600/20 text-emerald-400 hover:text-emerald-300 border border-slate-700 hover:border-emerald-500/50 rounded-md transition-colors ml-2"
            title="Export as AI Prompt"
          >
            <Bot className="w-4 h-4" />
            <span className="font-medium hidden sm:inline">AI Prompt</span>
          </button>

          <div className="w-px h-6 bg-slate-700 mx-2"></div>

          <button 
            onClick={() => setShowHelp(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-slate-800 hover:bg-indigo-600/20 text-slate-300 hover:text-indigo-400 border border-slate-700 hover:border-indigo-500/50 rounded-md transition-colors"
            title="Help Manual"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="font-medium">Help</span>
          </button>
          <button 
            onClick={() => setShowDocs(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-slate-800 hover:bg-indigo-600/20 text-slate-300 hover:text-indigo-400 border border-slate-700 hover:border-indigo-500/50 rounded-md transition-colors ml-2"
            title="Documentation"
          >
            <BookOpen className="w-4 h-4" />
            <span className="font-medium">Docs</span>
          </button>
          <button 
            onClick={toggleTheme}
            className="text-slate-400 hover:text-indigo-400 transition-colors p-2 rounded-full hover:bg-slate-800 ml-2"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 flex overflow-hidden">
        <div className="w-[350px] shrink-0 h-full">
          <ErrorBoundary name="LeftPanel">
            <LeftPanel />
          </ErrorBoundary>
        </div>
        <div className="flex-1 min-w-[500px] h-full border-r border-slate-800 relative">
          <ErrorBoundary name="MiddlePanel">
            <MiddlePanel />
          </ErrorBoundary>
        </div>
        <div className="w-[450px] shrink-0 h-full">
          <ErrorBoundary name="RightPanel">
            <RightPanel />
          </ErrorBoundary>
        </div>
      </main>

      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
      {showDocs && <DocumentationModal onClose={() => setShowDocs(false)} />}
    </div>
  );
}

export default App;
