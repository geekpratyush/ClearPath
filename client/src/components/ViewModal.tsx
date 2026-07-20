import { X, Copy, Check } from 'lucide-react';
import { useState } from 'react';

export default function ViewModal({ 
  title, 
  content, 
  onClose 
}: { 
  title: string; 
  content: string; 
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="glass-panel border border-slate-700/50 rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/50 shrink-0">
          <h2 className="text-lg font-bold text-slate-100">{title}</h2>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleCopy} 
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-rose-400 transition-colors p-1.5 rounded-md hover:bg-slate-800">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-900">
          <pre className="text-sm font-mono text-emerald-300 whitespace-pre-wrap break-all">
            {content}
          </pre>
        </div>
      </div>
    </div>
  );
}
