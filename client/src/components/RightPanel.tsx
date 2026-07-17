import React, { useState, useCallback } from 'react';
import { useStore, type ContextData, type PipelineStatus } from '../store/useStore';
import { Play, Download, Image as ImageIcon, FileJson, PlayCircle } from 'lucide-react';
import { ReactFlow, MiniMap, Controls, Background, useNodesState, useEdgesState, MarkerType } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Parser } from 'expr-eval';

export default function RightPanel() {
  const { initialContext, activeContext, stages, isSimulating, updateStageStatus, resetSimulation, theme } = useStore();
  const [isExporting, setIsExporting] = useState(false);

  // Generate nodes from stages for React Flow
  const initialNodes = stages.map((stage, index) => ({
    id: stage.id,
    position: { x: 50, y: 50 + index * 100 },
    data: { label: stage.name },
    style: {
      background: stage.status === 'passed' ? '#064e3b' :
                 stage.status === 'breached' ? '#7f1d1d' :
                 stage.status === 'amber' ? '#78350f' :
                 stage.status === 'processing' ? '#1e3a8a' :
                 '#1e293b',
      color: '#f8fafc',
      border: `1px solid ${stage.status === 'passed' ? '#10b981' : stage.status === 'breached' ? '#f43f5e' : stage.status === 'amber' ? '#f59e0b' : '#3b82f6'}`,
      borderRadius: '8px',
      width: 200,
    }
  }));

  const initialEdges = stages.slice(0, -1).map((stage, index) => ({
    id: `e-${stage.id}-${stages[index + 1].id}`,
    source: stage.id,
    target: stages[index + 1].id,
    animated: isSimulating,
    style: { stroke: '#475569' },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#475569',
    },
  }));

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Sync React Flow when stages change
  React.useEffect(() => {
    setNodes(stages.map((stage, index) => ({
      id: stage.id,
      position: { x: 50, y: 50 + index * 100 },
      data: { label: stage.name },
      style: {
        background: stage.status === 'passed' ? 'var(--color-emerald-900, #064e3b)' :
                   stage.status === 'breached' ? 'var(--color-rose-900, #7f1d1d)' :
                   stage.status === 'amber' ? 'var(--color-amber-900, #78350f)' :
                   stage.status === 'processing' ? 'var(--color-blue-900, #1e3a8a)' :
                   'var(--color-slate-900, #1e293b)',
        color: 'var(--color-slate-200, #f8fafc)',
        border: `1px solid ${stage.status === 'passed' ? 'var(--color-emerald-500, #10b981)' : stage.status === 'breached' ? 'var(--color-rose-500, #f43f5e)' : stage.status === 'amber' ? 'var(--color-amber-500, #f59e0b)' : 'var(--color-blue-500, #3b82f6)'}`,
        borderRadius: '8px',
        width: 200,
        transition: 'background-color 0.3s, color 0.3s'
      }
    })));

    const newEdges: any[] = [];
    stages.forEach((stage, index) => {
      if (stage.routing) {
        if (stage.routing.passed) {
          stage.routing.passed.forEach(targetId => {
            newEdges.push({ id: `e-${stage.id}-${targetId}-passed`, source: stage.id, target: targetId, animated: isSimulating, style: { stroke: 'var(--color-emerald-500, #10b981)' }, markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--color-emerald-500, #10b981)' } });
          });
        }
        if (stage.routing.breached) {
          stage.routing.breached.forEach(targetId => {
            newEdges.push({ id: `e-${stage.id}-${targetId}-breached`, source: stage.id, target: targetId, animated: isSimulating, style: { stroke: 'var(--color-rose-500, #f43f5e)' }, markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--color-rose-500, #f43f5e)' } });
          });
        }
        if (stage.routing.amber) {
          stage.routing.amber.forEach(targetId => {
            newEdges.push({ id: `e-${stage.id}-${targetId}-amber`, source: stage.id, target: targetId, animated: isSimulating, style: { stroke: 'var(--color-amber-500, #f59e0b)' }, markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--color-amber-500, #f59e0b)' } });
          });
        }
      } else if (index < stages.length - 1) {
        // Fallback to linear if no routing defined
        newEdges.push({
          id: `e-${stage.id}-${stages[index + 1].id}`,
          source: stage.id,
          target: stages[index + 1].id,
          animated: isSimulating,
          style: { stroke: 'var(--color-slate-500, #475569)' },
          markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--color-slate-500, #475569)' },
        });
      }
    });
    setEdges(newEdges);
  }, [stages, isSimulating, setNodes, setEdges]);

  const executeSimulation = async () => {
    resetSimulation();
    useStore.setState({ isSimulating: true });
    let currentContext = JSON.parse(JSON.stringify(initialContext));

    const processStage = async (stageId: string, contextSnapshot: any): Promise<void> => {
      const stage = useStore.getState().stages.find(s => s.id === stageId);
      if (!stage) return;
      
      updateStageStatus(stage.id, 'processing');
      await new Promise(resolve => setTimeout(resolve, 800)); // artificial delay
      
      let newStatus: PipelineStatus = 'idle';
      try {
        let currentContextRef = contextSnapshot;
        
        // Expose a helper to completely replace the root context object
        const replaceContext = (newObj: any) => {
          currentContextRef = JSON.parse(JSON.stringify(newObj));
        };

        // Use a native evaluator to support assignment mutations and complex JS expressions
        const evaluator = new Function('context', 'replaceContext', `
          "use strict";
          return eval(${JSON.stringify(stage.expression)});
        `);
        
        const result = evaluator(currentContextRef, replaceContext);
        
        if (result === 'PASSED' || result === 'APPROVE') newStatus = 'passed';
        else if (result === 'FAILED' || result === 'BREACHED') newStatus = 'breached';
        else if (result === 'AMBER' || result === 'ROUTE_TO_PARTNER') newStatus = 'amber';
        else newStatus = 'passed'; // fallback
        
        // Capture the new context state (whether mutated directly or via replaceContext)
        const outputContext = JSON.parse(JSON.stringify(currentContextRef));
        
        // Update contextSnapshot for the next stages recursively
        contextSnapshot = outputContext;
        
        updateStageStatus(stage.id, newStatus, outputContext);
      } catch (error) {
        newStatus = 'breached';
        updateStageStatus(stage.id, 'breached', undefined, (error as Error).message);
      }

      // Determine next stages
      let nextStageIds: string[] = [];
      if (stage.routing) {
        if (newStatus === 'passed' && stage.routing.passed) nextStageIds = stage.routing.passed;
        else if (newStatus === 'breached' && stage.routing.breached) nextStageIds = stage.routing.breached;
        else if (newStatus === 'amber' && stage.routing.amber) nextStageIds = stage.routing.amber;
      } else {
        // Linear fallback
        const index = useStore.getState().stages.findIndex(s => s.id === stage.id);
        if (index !== -1 && index < useStore.getState().stages.length - 1 && newStatus !== 'breached') {
          nextStageIds = [useStore.getState().stages[index + 1].id];
        }
      }

      // Execute next stages in parallel
      await Promise.all(nextStageIds.map(nextId => processStage(nextId, JSON.parse(JSON.stringify(contextSnapshot)))));
    };

    if (stages.length > 0) {
      await processStage(stages[0].id, currentContext);
    }
    useStore.setState({ isSimulating: false });
  };

  const exportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ initialContext, stages }, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "clearpath-simulation.json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-l border-slate-800">
      <div className="flex items-center justify-between p-4 border-b border-slate-800">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <PlayCircle className="w-5 h-5 text-indigo-400" />
          Simulation & Export
        </h2>
        <button
          onClick={executeSimulation}
          disabled={isSimulating}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            isSimulating 
              ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)]'
          }`}
        >
          <Play className="w-4 h-4 fill-current" />
          {isSimulating ? 'Running...' : 'Run Simulation'}
        </button>
      </div>

      <div className="flex-1 relative h-1/2 min-h-[300px] border-b border-slate-800 bg-slate-950">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
          colorMode={theme}
          className="bg-transparent"
        >
          <Background color={theme === 'dark' ? '#334155' : '#cbd5e1'} gap={16} />
          <Controls className="bg-slate-800 border-slate-700 fill-slate-300" />
        </ReactFlow>
      </div>

      <div className="p-6 h-1/3 bg-slate-900">
        <h3 className="text-sm font-medium text-slate-400 mb-4 uppercase tracking-wider">Export Center</h3>
        <div className="grid grid-cols-1 gap-3">
          <button 
            onClick={exportJSON}
            className="flex items-center justify-between p-4 rounded-xl border border-slate-700 bg-slate-800/50 hover:bg-slate-800 hover:border-slate-600 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-900/30 rounded-lg group-hover:bg-blue-900/50 transition-colors">
                <FileJson className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-left">
                <div className="font-medium text-slate-200">Export Simulation JSON</div>
                <div className="text-xs text-slate-500">Full configuration & context payload</div>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
          </button>

          <button className="flex items-center justify-between p-4 rounded-xl border border-slate-700 bg-slate-800/50 hover:bg-slate-800 hover:border-slate-600 transition-all group">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-900/30 rounded-lg group-hover:bg-emerald-900/50 transition-colors">
                <FileJson className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="text-left">
                <div className="font-medium text-slate-200">Generate AI-Ready Spec</div>
                <div className="text-xs text-slate-500">Markdown requirement document</div>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
          </button>

          <button className="flex items-center justify-between p-4 rounded-xl border border-slate-700 bg-slate-800/50 hover:bg-slate-800 hover:border-slate-600 transition-all group">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-900/30 rounded-lg group-hover:bg-purple-900/50 transition-colors">
                <ImageIcon className="w-5 h-5 text-purple-400" />
              </div>
              <div className="text-left">
                <div className="font-medium text-slate-200">Save Diagram (PNG)</div>
                <div className="text-xs text-slate-500">Visual data flow map</div>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
          </button>
        </div>
      </div>
    </div>
  );
}
