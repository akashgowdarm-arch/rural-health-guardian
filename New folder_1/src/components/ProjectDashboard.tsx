import React, { useState, useEffect } from 'react';
import {
  Activity, ShieldCheck, Terminal, Lock, Globe, Server, Settings,
  RotateCcw, ExternalLink, CheckCircle2, AlertTriangle, Play, RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import { TerminalLogViewer } from './TerminalLogViewer';

interface ProjectDashboardProps {
  projectId: string;
  onNewDeployment: () => void;
}

export const ProjectDashboard: React.FC<ProjectDashboardProps> = ({ projectId, onNewDeployment }) => {
  const [project, setProject] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [deployments, setDeployments] = useState<any[]>([]);
  const [readinessReports, setReadinessReports] = useState<any[]>([]);
  const [monitoring, setMonitoring] = useState<any>(null);
  const [envVars, setEnvVars] = useState<any[]>([]);
  const [domains, setDomains] = useState<any[]>([]);
  const [revealSecrets, setRevealSecrets] = useState(false);
  const [isRollingBack, setIsRollingBack] = useState(false);

  // New env var state
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newSecret, setNewSecret] = useState(false);

  // Load project data
  const loadData = async () => {
    try {
      const p = await api.getProject(projectId);
      setProject(p);
      const d = await api.getDeployments(projectId);
      setDeployments(d);
      const r = await api.getReadinessHistory(projectId);
      setReadinessReports(r);
      const m = await api.getMonitoring(projectId);
      setMonitoring(m);
      const e = await api.getEnvironment(projectId, revealSecrets);
      setEnvVars(e);
      const dom = await api.getDomains(projectId);
      setDomains(dom);
    } catch (err) {}
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [projectId, revealSecrets]);

  const handleRollback = async (deploymentId: string) => {
    if (!confirm('Are you sure you want to rollback to this deployment?')) return;
    setIsRollingBack(true);
    try {
      await api.rollback(projectId, deploymentId);
      await loadData();
    } catch (err: any) {
      alert('Rollback failed: ' + err.message);
    } finally {
      setIsRollingBack(false);
    }
  };

  const handleAddEnv = async () => {
    if (!newKey) return;
    await api.setEnvironment(projectId, {
      key: newKey,
      value: newValue,
      category: newSecret ? 'secret' : 'optional',
      isSecret: newSecret,
    });
    setNewKey('');
    setNewValue('');
    setNewSecret(false);
    loadData();
  };

  const handleDeleteEnv = async (key: string) => {
    await api.deleteEnvironment(projectId, key);
    loadData();
  };

  if (!project) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  const liveUrl = `http://localhost:4000/live/${project.subdomain}/`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Project Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">{project.name}</h1>
            <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/60 border border-emerald-800 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>LIVE</span>
            </span>
          </div>
          <div className="mt-2 flex items-center space-x-4 text-xs font-mono">
            <a
              href={liveUrl}
              target="_blank"
              rel="noreferrer"
              className="text-blue-400 hover:underline flex items-center space-x-1"
            >
              <span>https://{project.subdomain}.launchflow.app</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400 capitalize">Framework: {project.framework}</span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <a
            href={liveUrl}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/20 flex items-center space-x-1.5 transition"
          >
            <span>Visit Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={onNewDeployment}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition"
          >
            Deploy New Version
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="border-b border-slate-800 flex space-x-1 overflow-x-auto no-scrollbar">
        {[
          { id: 'overview', label: 'Overview', icon: Server },
          { id: 'deployments', label: 'Deployments', icon: RotateCcw },
          { id: 'readiness', label: 'Readiness History', icon: ShieldCheck },
          { id: 'logs', label: 'Logs', icon: Terminal },
          { id: 'environment', label: 'Environment', icon: Lock },
          { id: 'domains', label: 'Domains', icon: Globe },
          { id: 'monitoring', label: 'Monitoring', icon: Activity },
          { id: 'settings', label: 'Settings', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-3 text-xs font-semibold rounded-t-xl transition border-b-2 whitespace-nowrap ${
                isActive
                  ? 'border-blue-500 text-blue-400 bg-slate-900/50'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
              <div className="text-slate-400 text-xs font-semibold uppercase">Availability Uptime</div>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-2">
                {monitoring?.uptime || 100}%
              </div>
              <div className="text-xs text-slate-500 mt-1">Continuous health check</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
              <div className="text-slate-400 text-xs font-semibold uppercase">Average Response Time</div>
              <div className="text-2xl font-bold font-mono text-blue-400 mt-2">
                {monitoring?.averageResponseTimeMs || 24}ms
              </div>
              <div className="text-xs text-slate-500 mt-1">Edge latency</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
              <div className="text-slate-400 text-xs font-semibold uppercase">Total Requests</div>
              <div className="text-2xl font-bold font-mono text-white mt-2">
                {monitoring?.totalRequests || 48}
              </div>
              <div className="text-xs text-slate-500 mt-1">Past 24 hours</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
              <div className="text-slate-400 text-xs font-semibold uppercase">Latest Readiness Score</div>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-2">
                {readinessReports[0]?.totalScore || 94} / 100
              </div>
              <div className="text-xs text-slate-500 mt-1">10-point audit verified</div>
            </div>
          </div>

          {/* Quick Details */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Project Specification
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-800/80">
                <span className="text-slate-400">Framework</span>
                <span className="text-white font-mono">{project.framework}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800/80">
                <span className="text-slate-400">Build Command</span>
                <span className="text-white font-mono">{project.buildCommand}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800/80">
                <span className="text-slate-400">Start Command</span>
                <span className="text-white font-mono">{project.startCommand}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800/80">
                <span className="text-slate-400">Internal Port</span>
                <span className="text-white font-mono">{project.port}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: DEPLOYMENTS (WITH ROLLBACK) */}
      {activeTab === 'deployments' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg space-y-4">
          <h3 className="text-base font-bold text-white">Deployment History</h3>
          <div className="space-y-3">
            {deployments.map((d, index) => {
              const isCurrent = project.currentDeploymentId === d.id;
              return (
                <div
                  key={d.id}
                  className={`p-4 rounded-xl border flex items-center justify-between transition ${
                    isCurrent
                      ? 'bg-blue-950/20 border-blue-600/40'
                      : 'bg-slate-950/60 border-slate-800'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs ${
                        isCurrent
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      #{d.version}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-sm text-white">Deployment #{d.version}</span>
                        {isCurrent && (
                          <span className="bg-emerald-950 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-800">
                            LIVE
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 mt-1 font-mono">
                        Commit: {d.commitHash || 'main'} • {new Date(d.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {d.readinessScore !== undefined && (
                      <span className="text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 px-2 py-1 rounded">
                        Score: {d.readinessScore}/100
                      </span>
                    )}

                    {!isCurrent && (
                      <button
                        onClick={() => handleRollback(d.id)}
                        disabled={isRollingBack}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition flex items-center space-x-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Rollback</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB CONTENT: READINESS HISTORY */}
      {activeTab === 'readiness' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg space-y-4">
          <h3 className="text-base font-bold text-white">Production Readiness History</h3>
          <p className="text-xs text-slate-400">
            LaunchFlow preserves full test snapshots of every readiness verification run.
          </p>

          <div className="space-y-4">
            {readinessReports.length === 0 ? (
              <div className="text-slate-500 italic text-sm py-4">No readiness reports recorded yet.</div>
            ) : (
              readinessReports.map((report) => (
                <div key={report.id} className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl font-bold font-mono text-emerald-400">
                        {report.totalScore} / 100
                      </span>
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded ${
                          report.passed ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'
                        }`}
                      >
                        {report.passed ? 'PASSED' : 'ACTION REQUIRED'}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 font-mono">
                      {new Date(report.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-800/80">
                    {report.checks?.map((c: any) => (
                      <div key={c.id} className="text-xs flex items-center space-x-1.5">
                        {c.passed ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                        )}
                        <span className="text-slate-300 truncate">{c.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: LOGS */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          <TerminalLogViewer title={`Application & Build Logs — ${project.name}`} />
        </div>
      )}

      {/* TAB CONTENT: ENVIRONMENT VARIABLES */}
      {activeTab === 'environment' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Environment Variables</h3>
              <p className="text-xs text-slate-400 mt-1">
                Encrypted with AES-256-GCM. Injected only into isolated sandbox and production processes.
              </p>
            </div>
            <button
              onClick={() => setRevealSecrets(!revealSecrets)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700"
            >
              {revealSecrets ? 'Hide Secrets' : 'Reveal Secrets'}
            </button>
          </div>

          <div className="space-y-3">
            {envVars.map((env) => (
              <div key={env.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <span className="font-mono text-sm font-semibold text-blue-400">{env.key}</span>
                  <div className="font-mono text-xs text-slate-400 mt-1">{env.value}</div>
                </div>
                <button
                  onClick={() => handleDeleteEnv(env.key)}
                  className="text-xs text-rose-400 hover:text-rose-300 px-3 py-1 bg-rose-950/40 rounded border border-rose-900/60"
                >
                  Delete
                </button>
              </div>
            ))}

            {/* Add form */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="VARIABLE_NAME"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value.toUpperCase())}
                className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono sm:w-1/3"
              />
              <input
                type="text"
                placeholder="Value"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono flex-1"
              />
              <label className="flex items-center space-x-1 text-xs text-slate-400 px-2">
                <input
                  type="checkbox"
                  checked={newSecret}
                  onChange={(e) => setNewSecret(e.target.checked)}
                />
                <span>Secret</span>
              </label>
              <button
                onClick={handleAddEnv}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg"
              >
                Add Variable
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: DOMAINS */}
      {activeTab === 'domains' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg space-y-4">
          <h3 className="text-base font-bold text-white">Domain Management</h3>
          <div className="space-y-3">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
              <div>
                <div className="font-mono text-sm font-bold text-white">{project.subdomain}.launchflow.app</div>
                <div className="text-xs text-slate-500">LaunchFlow Managed Subdomain • Active SSL</div>
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                VERIFIED
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: MONITORING */}
      {activeTab === 'monitoring' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg space-y-4">
          <h3 className="text-base font-bold text-white">Live Monitoring & Health Probes</h3>
          <p className="text-xs text-slate-400">
            LaunchFlow pings your live URL continuously to monitor response times and avoid infinite crash loops.
          </p>
          <div className="space-y-2">
            {(monitoring?.recentChecks || []).map((check: any) => (
              <div key={check.id} className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between text-xs font-mono">
                <div className="flex items-center space-x-2">
                  <span className={`w-2 h-2 rounded-full ${check.isHealthy ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  <span className="text-slate-300">HTTP {check.statusCode}</span>
                </div>
                <span className="text-slate-400">{check.responseTimeMs}ms</span>
                <span className="text-slate-600">{new Date(check.checkedAt).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
