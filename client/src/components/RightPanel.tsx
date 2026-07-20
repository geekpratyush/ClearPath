import { useCallback, useRef, useEffect } from 'react';
import { useStore, type PipelineStatus } from '../store/useStore';
import { Play, Image as ImageIcon, PlayCircle } from 'lucide-react';
import { ReactFlow, Controls, Background, useNodesState, useEdgesState, MarkerType, Handle, Position, useReactFlow, ReactFlowProvider, getNodesBounds } from '@xyflow/react';
import { toPng, toSvg } from 'html-to-image';
import dagre from 'dagre';
import '@xyflow/react/dist/style.css';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const getLayoutedElements = (nodes: any[], edges: any[], direction = 'TB') => {
  dagreGraph.setGraph({ rankdir: direction, ranksep: 80, nodesep: 60 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 140, height: 60 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const newNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      targetPosition: 'top' as Position,
      sourcePosition: 'bottom' as Position,
      position: {
        x: nodeWithPosition.x - 70,
        y: nodeWithPosition.y - 30,
      },
    };
  });

  return { nodes: newNodes, edges };
};

// Custom Shape Node Component
const ShapeNode = ({ data }: any) => {
  const shape = data.shape || 'rectangle';
  const label = data.label;
  const status = data.status;

  const baseStyle = {
    background: status === 'passed' ? 'var(--color-emerald-900, #064e3b)' :
               status === 'breached' ? 'var(--color-rose-900, #7f1d1d)' :
               status === 'amber' ? 'var(--color-amber-900, #78350f)' :
               status === 'processing' ? 'var(--color-blue-900, #1e3a8a)' :
               'var(--color-slate-900, #1e293b)',
    color: 'var(--color-slate-200, #f8fafc)',
    border: `1px solid ${status === 'passed' ? 'var(--color-emerald-500, #10b981)' : status === 'breached' ? 'var(--color-rose-500, #f43f5e)' : status === 'amber' ? 'var(--color-amber-500, #f59e0b)' : 'var(--color-blue-500, #3b82f6)'}`,
    transition: 'background-color 0.3s, color 0.3s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center' as const,
    fontSize: '11px',
    fontWeight: '500',
    padding: '6px'
  };

  let specificStyle: any = { width: 130, height: 45, borderRadius: 6 };

  if (shape === 'ellipse') {
    specificStyle = { width: 130, height: 50, borderRadius: '50%' };
  } else if (shape === 'diamond') {
    specificStyle = { width: 85, height: 85, transform: 'rotate(45deg)', padding: 0 };
  } else if (shape === 'parallelogram') {
    specificStyle = { width: 130, height: 45, transform: 'skew(-15deg)', borderRadius: 0 };
  }

  return (
    <div className="relative group">
      <Handle type="target" position={Position.Top} className="opacity-0 group-hover:opacity-100" />
      <div style={{ ...baseStyle, ...specificStyle }} className="shadow-md">
        <div style={{ transform: shape === 'diamond' ? 'rotate(-45deg)' : shape === 'parallelogram' ? 'skew(15deg)' : 'none', width: '100%' }}>
          {label}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="opacity-0 group-hover:opacity-100" />
    </div>
  );
};

const nodeTypes = {
  customShape: ShapeNode,
};

function FlowPanel() {
  const { initialContext, stages, isSimulating, updateStageStatus, resetSimulation, theme } = useStore();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { fitView, getNodes } = useReactFlow();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Sync React Flow when stages change
  useEffect(() => {
    let rawNodes = stages.map((stage) => ({
      id: stage.id,
      type: 'customShape',
      position: { x: 0, y: 0 },
      data: { label: stage.name, status: stage.status, shape: stage.shape }
    }));

    let rawEdges: any[] = [];
    stages.forEach((stage, index) => {
      const edgeBase = {
        type: 'smoothstep',
        animated: isSimulating,
      };

      if (stage.routing) {
        if (stage.routing.passed) {
          stage.routing.passed.forEach(targetId => {
            rawEdges.push({ ...edgeBase, id: `e-${stage.id}-${targetId}-passed`, source: stage.id, target: targetId, style: { stroke: 'var(--color-emerald-500, #10b981)', strokeWidth: 1.5 }, markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--color-emerald-500, #10b981)' } });
          });
        }
        if (stage.routing.breached) {
          stage.routing.breached.forEach(targetId => {
            rawEdges.push({ ...edgeBase, id: `e-${stage.id}-${targetId}-breached`, source: stage.id, target: targetId, style: { stroke: 'var(--color-rose-500, #f43f5e)', strokeWidth: 1.5 }, markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--color-rose-500, #f43f5e)' } });
          });
        }
        if (stage.routing.amber) {
          stage.routing.amber.forEach(targetId => {
            rawEdges.push({ ...edgeBase, id: `e-${stage.id}-${targetId}-amber`, source: stage.id, target: targetId, style: { stroke: 'var(--color-amber-500, #f59e0b)', strokeWidth: 1.5 }, markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--color-amber-500, #f59e0b)' } });
          });
        }
      } else if (index < stages.length - 1) {
        rawEdges.push({
          ...edgeBase,
          id: `e-${stage.id}-${stages[index + 1].id}`,
          source: stage.id,
          target: stages[index + 1].id,
          style: { stroke: 'var(--color-slate-500, #64748b)', strokeWidth: 1.5 },
          markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--color-slate-500, #64748b)' },
        });
      }
    });

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(rawNodes, rawEdges);
    
    setNodes([...layoutedNodes] as any);
    setEdges([...layoutedEdges] as any);

    // Delay fitView slightly to ensure React Flow has rendered the new positions
    setTimeout(() => {
      fitView({ padding: 0.2, duration: 400 });
    }, 50);
  }, [stages, isSimulating, setNodes, setEdges, fitView]);

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



  const downloadImage = useCallback((format: 'png' | 'svg' = 'png') => {
    const nodes = getNodes();
    if (nodes.length === 0) return;
    
    const nodesBounds = getNodesBounds(nodes);
    // Use 50px padding to ensure rotated shapes (like diamond) and curved edges are not cropped
    const padding = 50;
    const imageWidth = nodesBounds.width + padding * 2;
    const imageHeight = nodesBounds.height + padding * 2;

    const transform = {
      x: -nodesBounds.x + padding,
      y: -nodesBounds.y + padding,
      zoom: 1,
    };

    const viewport = document.querySelector('.react-flow__viewport') as HTMLElement;
    if (!viewport) return;

    const config = {
      backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff', // slate-900 or white
      width: imageWidth,
      height: imageHeight,
      style: {
        width: `${imageWidth}px`,
        height: `${imageHeight}px`,
        transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.zoom})`,
      },
      filter: (node: HTMLElement) => {
        if (node?.classList?.contains('react-flow__minimap') || node?.classList?.contains('react-flow__controls')) {
          return false;
        }
        return true;
      }
    };

    if (format === 'png') {
      toPng(viewport, config).then((dataUrl) => {
        const a = document.createElement('a');
        a.setAttribute('download', 'pipeline-diagram.png');
        a.setAttribute('href', dataUrl);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      });
    } else {
      toSvg(viewport, config).then((dataUrl) => {
        const a = document.createElement('a');
        a.setAttribute('download', 'pipeline-diagram.svg');
        a.setAttribute('href', dataUrl);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      });
    }
  }, [getNodes, theme]);

  return (
    <div className="flex flex-col h-full bg-slate-900 border-l border-slate-800">
      <div className="flex items-center justify-between p-4 border-b border-slate-800 shrink-0 flex-wrap gap-2">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <PlayCircle className="w-5 h-5 text-indigo-400" />
          Simulation
        </h2>
        
        <div className="flex items-center gap-2 ml-auto">

          <button 
            onClick={() => downloadImage('svg')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 hover:border-slate-600 transition-all text-slate-300"
            title="Export Diagram as SVG"
          >
            <ImageIcon className="w-4 h-4 text-pink-400" />
            SVG
          </button>

          <button 
            onClick={() => downloadImage('png')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 hover:border-slate-600 transition-all text-slate-300"
            title="Export Diagram as PNG"
          >
            <ImageIcon className="w-4 h-4 text-purple-400" />
            PNG
          </button>

          <button
            onClick={executeSimulation}
            disabled={isSimulating}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all text-sm ${
              isSimulating 
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)]'
            }`}
          >
            <Play className="w-4 h-4 fill-current" />
            {isSimulating ? 'Running...' : 'Run Simulation'}
          </button>
        </div>
      </div>

      <div className="flex-1 relative h-full min-h-[300px] bg-slate-950" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
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
    </div>
  );
}

export default function RightPanel() {
  return (
    <ReactFlowProvider>
      <FlowPanel />
    </ReactFlowProvider>
  );
}
