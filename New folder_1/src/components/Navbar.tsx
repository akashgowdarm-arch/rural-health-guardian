import React, { useEffect, useState } from 'react';
import { Rocket, Terminal, ShieldCheck, Activity, FolderGit2, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const [tunnelStatus, setTunnelStatus] = useState<{ connected: boolean; agentToken: string }>({
    connected: false,
    agentToken: '',
  });

  const checkStatus = async () => {
    try {
      const res = await api.getTunnelStatus();
      setTunnelStatus(res);
    } catch (err) {}
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center space-x-3 text-white font-bold text-xl tracking-tight focus:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <span>LaunchFlow</span>
          </button>

          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => onNavigate('dashboard')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                currentView === 'dashboard'
                  ? 'bg-slate-800 text-blue-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => onNavigate('wizard')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                currentView === 'wizard'
                  ? 'bg-slate-800 text-blue-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              New Deployment
            </button>
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          {/* Local Agent Status Indicator */}
          <div
            className={`flex items-center space-x-2 text-xs px-3 py-1.5 rounded-full border ${
              tunnelStatus.connected
                ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-400'
                : 'bg-slate-800/60 border-slate-700/60 text-slate-400'
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                tunnelStatus.connected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'
              }`}
            />
            <span className="font-mono">
              Agent: {tunnelStatus.connected ? 'Connected' : 'Offline'}
            </span>
          </div>

          <button
            onClick={() => onNavigate('wizard')}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition shadow-md shadow-blue-600/20 flex items-center space-x-1.5"
          >
            <Rocket className="w-3.5 h-3.5" />
            <span>Deploy Project</span>
          </button>
        </div>
      </div>
    </header>
  );
};
