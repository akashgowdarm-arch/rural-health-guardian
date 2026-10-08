import React, { useEffect, useRef, useState } from 'react';
import { Terminal, Copy, Check, ArrowDown, Search } from 'lucide-react';

interface BuildLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'stdout' | 'stderr';
  message: string;
}

interface TerminalLogViewerProps {
  buildId?: string;
  initialLogs?: BuildLog[];
  status?: string;
  title?: string;
}

export const TerminalLogViewer: React.FC<TerminalLogViewerProps> = ({
  buildId,
  initialLogs = [],
  status = 'building',
  title = 'Real-time Build & Deployment Logs',
}) => {
  const [logs, setLogs] = useState<BuildLog[]>(initialLogs);
  const [filter, setFilter] = useState('');
  const [copied, setCopied] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Sync initial logs
  useEffect(() => {
    if (initialLogs.length > 0) {
      setLogs(initialLogs);
    }
  }, [initialLogs]);

  // Connect WebSocket for live logs
  useEffect(() => {
    if (!buildId) return;

    const ws = new WebSocket(`ws://localhost:4000/ws/logs/${buildId}`);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'history' && Array.isArray(data.logs)) {
          setLogs(data.logs);
        } else if (data.type === 'log' && data.log) {
          setLogs((prev) => [...prev, data.log]);
        }
      } catch (err) {}
    };

    return () => {
      ws.close();
    };
  }, [buildId]);

  useEffect(() => {
    if (autoScroll) {
      terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const copyLogs = () => {
    const text = logs.map((l) => `[${l.timestamp.split('T')[1]?.slice(0, 8)}] [${l.level.toUpperCase()}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredLogs = logs.filter((l) =>
    filter ? l.message.toLowerCase().includes(filter.toLowerCase()) : true
  );

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col font-mono text-xs">
      {/* Terminal Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5">
            <div className="w-3 h-3 rounded-full bg-rose-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>
          <div className="flex items-center space-x-2 text-slate-300 font-medium">
            <Terminal className="w-4 h-4 text-blue-400" />
            <span>{title}</span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="Search logs..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1 text-slate-300 text-xs focus:outline-none focus:border-blue-500 w-32 sm:w-48"
            />
          </div>

          <button
            onClick={copyLogs}
            title="Copy Logs"
            className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`p-1.5 rounded-lg border border-slate-800 transition ${
              autoScroll ? 'bg-blue-900/30 text-blue-400 border-blue-700/40' : 'text-slate-500 hover:bg-slate-800'
            }`}
            title="Auto-scroll"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Output Body */}
      <div className="p-4 bg-slate-950/90 overflow-y-auto max-h-96 min-h-64 space-y-1 select-text">
        {filteredLogs.length === 0 ? (
          <div className="text-slate-500 italic py-8 text-center">
            {status === 'building' ? 'Initializing isolated build sandbox...' : 'No logs recorded.'}
          </div>
        ) : (
          filteredLogs.map((log, index) => {
            let color = 'text-slate-300';
            if (log.level === 'error') color = 'text-rose-400 font-semibold';
            else if (log.level === 'warn') color = 'text-amber-300';
            else if (log.level === 'info') color = 'text-blue-400';
            else if (log.message.startsWith('✓')) color = 'text-emerald-400 font-semibold';
            else if (log.message.startsWith('✕')) color = 'text-rose-400 font-semibold';

            const time = log.timestamp ? log.timestamp.split('T')[1]?.slice(0, 8) : '--:--:--';

            return (
              <div key={log.id || index} className="flex items-start space-x-3 leading-relaxed hover:bg-slate-900/50 px-1 py-0.5 rounded">
                <span className="text-slate-600 select-none text-[11px] shrink-0 font-mono">
                  {time}
                </span>
                <span className={`break-all ${color}`}>
                  {log.message}
                </span>
              </div>
            );
          })
        )}
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
};
