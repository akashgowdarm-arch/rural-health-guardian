import React from 'react';
import { ShieldCheck, AlertTriangle, XCircle, CheckCircle2, RefreshCw, ArrowRight, Wrench, ExternalLink } from 'lucide-react';

interface ReadinessReportCardProps {
  report: {
    totalScore: number;
    passed: boolean;
    checks: Array<{
      id: string;
      name: string;
      category: string;
      passed: boolean;
      scoreEarned: number;
      weight: number;
      details: string;
      latencyMs?: number;
    }>;
    issues: Array<{
      category: string;
      severity: 'critical' | 'warning' | 'info';
      title: string;
      message: string;
      detectedValue?: string;
      recommendedFix: string;
      fixAction?: {
        type: string;
        field?: string;
        suggestedValue?: string;
      };
    }>;
  };
  onRetest: () => void;
  onFixIssue: (issue: any) => void;
  onProceedDeploy?: () => void;
  isRetesting?: boolean;
}

export const ReadinessReportCard: React.FC<ReadinessReportCardProps> = ({
  report,
  onRetest,
  onFixIssue,
  onProceedDeploy,
  isRetesting = false,
}) => {
  const scoreColor = report.totalScore >= 80 ? 'text-emerald-400' : report.totalScore >= 50 ? 'text-amber-400' : 'text-rose-400';
  const scoreBg = report.totalScore >= 80 ? 'border-emerald-500/30 bg-emerald-950/20' : report.totalScore >= 50 ? 'border-amber-500/30 bg-amber-950/20' : 'border-rose-500/30 bg-rose-950/20';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Header with Score */}
      <div className="p-6 sm:p-8 border-b border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-5">
          <div className={`w-20 h-20 rounded-2xl border-2 flex flex-col items-center justify-center ${scoreBg}`}>
            <span className={`text-3xl font-extrabold font-mono ${scoreColor}`}>
              {report.totalScore}
            </span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              / 100
            </span>
          </div>

          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-xl font-bold text-white">Production Readiness Engine</h2>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                  report.passed
                    ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/60'
                    : 'bg-rose-900/60 text-rose-300 border border-rose-700/60'
                }`}
              >
                {report.passed ? 'Ready to Deploy 🚀' : 'Action Required ⚠️'}
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              {report.passed
                ? 'All critical runtime, network, bundle, and configuration checks have passed.'
                : 'Issues detected that could cause runtime crashes or broken assets in production.'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <button
            onClick={onRetest}
            disabled={isRetesting}
            className="flex-1 md:flex-initial flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-sm font-medium transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRetesting ? 'animate-spin' : ''}`} />
            <span>{isRetesting ? 'Auditing...' : 'Run Tests Again'}</span>
          </button>

          {report.passed && onProceedDeploy && (
            <button
              onClick={onProceedDeploy}
              className="flex-1 md:flex-initial flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-sm font-bold shadow-lg shadow-emerald-600/25 transition"
            >
              <span>Deploy Website</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Critical Issues Section */}
      {report.issues.length > 0 && (
        <div className="p-6 sm:p-8 border-b border-slate-800 bg-rose-950/10">
          <div className="flex items-center space-x-2 text-rose-400 font-semibold text-sm mb-4">
            <AlertTriangle className="w-4 h-4" />
            <span>Problems Found ({report.issues.length})</span>
          </div>

          <div className="space-y-4">
            {report.issues.map((issue, idx) => (
              <div
                key={idx}
                className="bg-slate-900/90 border border-rose-900/40 rounded-xl p-5 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800/50">
                        {issue.category.toUpperCase()}
                      </span>
                      <h4 className="text-base font-bold text-white">{issue.title}</h4>
                    </div>

                    <p className="text-sm text-slate-300 mt-2">{issue.message}</p>

                    {issue.detectedValue && (
                      <div className="mt-2 font-mono text-xs text-rose-300 bg-rose-950/30 border border-rose-900/30 px-3 py-1.5 rounded-md inline-block">
                        Detected: {issue.detectedValue}
                      </div>
                    )}

                    <div className="mt-3 bg-slate-950/60 border border-slate-800/80 rounded-lg p-3">
                      <div className="text-xs font-semibold text-blue-400 flex items-center space-x-1">
                        <Wrench className="w-3.5 h-3.5" />
                        <span>Recommended Fix:</span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1">{issue.recommendedFix}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => onFixIssue(issue)}
                    className="self-start sm:self-center px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition shadow-md shadow-blue-600/20 whitespace-nowrap"
                  >
                    Fix Configuration
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 10-Point Readiness Verification Checklist */}
      <div className="p-6 sm:p-8">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">
          Automated 10-Point Readiness Audit
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {report.checks.map((check) => (
            <div
              key={check.id}
              className={`p-4 rounded-xl border flex items-start space-x-3 transition ${
                check.passed
                  ? 'bg-slate-800/30 border-slate-800/70 hover:border-slate-700'
                  : 'bg-rose-950/20 border-rose-900/40'
              }`}
            >
              <div className="mt-0.5">
                {check.passed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-400" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-slate-200 truncate">{check.name}</h4>
                  <span className="text-xs font-mono text-slate-400">
                    {check.scoreEarned} / {check.weight} pts
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{check.details}</p>
                {check.latencyMs !== undefined && (
                  <span className="inline-block mt-1 text-[11px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                    {check.latencyMs}ms response
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
