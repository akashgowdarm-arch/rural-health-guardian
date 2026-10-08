import React from 'react';
import { Rocket, Plus, ExternalLink, ShieldCheck, Activity, Terminal, FolderGit2 } from 'lucide-react';

interface ProjectListProps {
  projects: any[];
  onSelectProject: (id: string) => void;
  onNewProject: () => void;
}

export const ProjectList: React.FC<ProjectListProps> = ({ projects, onSelectProject, onNewProject }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Production Readiness Engine Active</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            From Localhost to Live — With Proof It Works
          </h1>
          <p className="text-slate-400 text-sm mt-2 max-w-2xl leading-relaxed">
            LaunchFlow verifies your local application, isolates it in a real sandbox, audits it across 10 critical production checkpoints, and deploys it live.
          </p>
        </div>

        <button
          onClick={onNewProject}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl transition shadow-xl shadow-blue-600/25 flex items-center space-x-2 shrink-0"
        >
          <Plus className="w-5 h-5" />
          <span>New Deployment</span>
        </button>
      </div>

      {/* Projects Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Your Projects ({projects.length})</h2>
        </div>

        {projects.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center shadow-xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mx-auto text-blue-400">
              <Rocket className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">No deployed projects yet</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              Start by checking your website on localhost:3000. LaunchFlow will test and prepare your production deployment.
            </p>
            <button
              onClick={onNewProject}
              className="mt-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-blue-600/20 transition"
            >
              Start First Deployment
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => onSelectProject(project.id)}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 shadow-xl transition cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 capitalize">
                      {project.framework}
                    </span>
                    <span className="flex items-center space-x-1 text-xs text-emerald-400 font-semibold">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>LIVE</span>
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition">
                    {project.name}
                  </h3>

                  <div className="font-mono text-xs text-blue-400 mt-1 truncate">
                    https://{project.subdomain}.launchflow.app
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span>Port: {project.port}</span>
                  <span className="text-blue-400 font-semibold group-hover:underline flex items-center space-x-1">
                    <span>Manage</span>
                    <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
