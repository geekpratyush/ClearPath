import { useState, useEffect } from 'react';
import LeftPanel from './components/LeftPanel';
import MiddlePanel from './components/MiddlePanel';
import RightPanel from './components/RightPanel';
import HelpModal from './components/HelpModal';
import { ShieldCheck, Moon, Sun, HelpCircle } from 'lucide-react';
import { useStore } from './store/useStore';

function App() {
  const { theme, setTheme } = useStore();
  const [showHelp, setShowHelp] = useState(false);

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

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-200 overflow-hidden transition-colors duration-300">
      {/* Header */}
      <header className="h-14 border-b border-slate-800 bg-slate-900 flex items-center justify-between px-6 shrink-0 z-10 transition-colors duration-300">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-1.5 rounded-lg shadow-[0_0_15px_rgba(79,70,229,0.4)]">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-blue-400">
            ClearPath Simulator
          </h1>
          <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 uppercase tracking-wider border border-slate-700">Enterprise</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowHelp(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-slate-800 hover:bg-indigo-600/20 text-slate-300 hover:text-indigo-400 border border-slate-700 hover:border-indigo-500/50 rounded-md transition-colors"
            title="Help Manual"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="font-medium">Help</span>
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
          <LeftPanel />
        </div>
        <div className="flex-1 min-w-[500px] h-full border-r border-slate-800 relative">
          <MiddlePanel />
        </div>
        <div className="w-[450px] shrink-0 h-full">
          <RightPanel />
        </div>
      </main>

      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
    </div>
  );
}

export default App;
