import React, { useState, useEffect } from 'react';
import {
  Server, Lock, Rocket, CheckCircle2, AlertTriangle,
  RefreshCw, ArrowRight, ArrowLeft, ExternalLink, Play,
  Copy, Check, Database, CreditCard, ChevronDown, ChevronUp,
  Terminal, ShieldCheck, Sparkles, Globe, Eye, HelpCircle, KeyRound
} from 'lucide-react';
import { api } from '../services/api';
import { TerminalLogViewer } from './TerminalLogViewer';
import { ReadinessReportCard } from './ReadinessReportCard';

// Platform-Internal variables that must NEVER be shown to normal users
const PLATFORM_INTERNAL_VARS = new Set([
  'LAUNCHFLOW',
  'LAUNCHFLOW_API_URL',
  'LAUNCHFLOW_AGENT_TOKEN',
  'ENCRYPTION_KEY',
  'JWT_SECRET',
  'APP_URL',
  'DEPLOYMENT_DOMAIN',
  'GITHUB_CLIENT_ID',
  'GITHUB_CLIENT_SECRET',
  'REDIS_URL',
  'NODE_ENV',
  'PORT',
  'CI',
  'PATH',
  'HOME',
  'USERPROFILE',
  'TMP',
  'TEMP',
  'SYSTEMROOT',
  'TERM',
  'SHELL',
  'PWD',
]);

function isPlatformInternal(key: string): boolean {
  if (PLATFORM_INTERNAL_VARS.has(key)) return true;
  if (key.startsWith('LAUNCHFLOW_')) return true;
  if (key.startsWith('npm_')) return true;
  return false;
}

interface StepWizardProps {
  onDeploymentComplete: (projectId: string) => void;
}

export const StepWizard: React.FC<StepWizardProps> = ({ onDeploymentComplete }) => {
  // 3-Step Wizard: 1 = CONNECT, 2 = CONFIGURE, 3 = DEPLOY
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // STEP 1: CONNECT STATE
  const [localhostUrl, setLocalhostUrl] = useState('http://localhost:3000');
  const [isProbing, setIsProbing] = useState(false);
  const [probeResult, setProbeResult] = useState<any>(null);
  const [tunnelStatus, setTunnelStatus] = useState<any>(null);
  const [copiedCmd, setCopiedCmd] = useState(false);

  // STEP 2: CONFIGURE STATE
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [projectConfig, setProjectConfig] = useState({
    name: 'my-project',
    framework: 'react-vite',
    language: 'typescript',
    packageManager: 'npm',
    buildCommand: 'npm run build',
    startCommand: 'npm start',
    port: 3000,
    subdomain: 'my-project',
    database: 'None',
  });
  const [envVars, setEnvVars] = useState<Array<{
    key: string;
    value: string;
    category: string;
    group?: string;
    isSecret: boolean;
    description?: string;
    placeholder?: string;
    docUrl?: string;
    helpText?: string;
  }>>([]);
  const [showDbHelp, setShowDbHelp] = useState(false);
  const [showAdvancedConfig, setShowAdvancedConfig] = useState(false);
  const [customKey, setCustomKey] = useState('');
  const [customValue, setCustomValue] = useState('');
  const [visibleSecrets, setVisibleSecrets] = useState<Set<string>>(new Set());

  const toggleSecretVisibility = (key: string) => {
    setVisibleSecrets((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  // STEP 3: DEPLOY & AUTOMATED PIPELINE STATE
  const [isDeployingPipeline, setIsDeployingPipeline] = useState(false);
  const [pipelineStage, setPipelineStage] = useState<'idle' | 'building' | 'previewing' | 'auditing' | 'deploying' | 'live' | 'failed'>('idle');
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [activeDeploymentId, setActiveDeploymentId] = useState<string | null>(null);
  const [activeBuildId, setActiveBuildId] = useState<string | null>(null);
  const [buildLogs, setBuildLogs] = useState<any[]>([]);
  const [readinessReport, setReadinessReport] = useState<any>(null);
  const [pipelineError, setPipelineError] = useState<any>(null);
  const [liveUrl, setLiveUrl] = useState<string | null>(null);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  // Check agent tunnel status periodically
  useEffect(() => {
    const fetchStatus = () => {
      api.getTunnelStatus().then(setTunnelStatus).catch(() => {});
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 4000);
    return () => clearInterval(interval);
  }, []);

  const copyAgentCommand = () => {
    const port = localhostUrl ? new URL(localhostUrl).port || '3000' : '3000';
    const cmd = `node agent/bin/launchflow.js connect ${port}`;
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  // STEP 1 HANDLER: Check website and automatically analyze project
  const handleCheckAndAnalyze = async () => {
    setIsProbing(true);
    setProbeResult(null);

    try {
      const parsedUrl = new URL(localhostUrl);
      const port = parseInt(parsedUrl.port || '3000', 10);

      // 1. Probe localhost
      const probe = await api.probeLocalhost(port, parsedUrl.pathname || '/');
      setProbeResult(probe);

      if (!probe.reachable) {
        setIsProbing(false);
        return;
      }

      // 2. Automatically analyze source code without separate manual steps
      setIsAnalyzing(true);
      const analyzed = await api.analyzeProject();
      setAnalysis(analyzed);

      const detectedName = 'app-' + Math.random().toString(36).substring(2, 7);
      const subdomain = detectedName;

      setProjectConfig({
        name: detectedName,
        framework: analyzed.framework,
        language: analyzed.language,
        packageManager: analyzed.packageManager,
        buildCommand: analyzed.buildCommand,
        startCommand: analyzed.startCommand,
        port: analyzed.port,
        subdomain,
        database: analyzed.database || 'None',
      });

      // Filter OUT any LaunchFlow platform-internal variables completely
      const userProjectVars = (analyzed.detectedEnvVars || [])
        .filter((v: any) => !isPlatformInternal(v.key))
        .map((v: any) => ({
          key: v.key,
          value: '',
          category: v.category || 'optional',
          group: v.group || (v.key === 'DATABASE_URL' ? 'Database' : v.key.includes('STRIPE') ? 'Payments' : 'General'),
          isSecret: v.isSecret || false,
          description: v.description,
          placeholder: v.placeholder || 'Value',
          docUrl: v.docUrl,
          helpText: v.helpText,
        }));

      setEnvVars(userProjectVars);

      // Transition straight to Step 2 (CONFIGURE)
      setCurrentStep(2);
    } catch (err: any) {
      setProbeResult({
        reachable: false,
        details: err.message,
        explanation: {
          title: "Couldn't Connect to Localhost",
          whatHappened: err.message,
          whyItBreaksInProduction: 'LaunchFlow must verify your website operates properly locally before validating production readiness.',
          recommendedFix: 'Make sure your dev server is running on localhost (e.g. npm run dev) and that the LaunchFlow Local Agent is connected.',
        },
      });
    } finally {
      setIsProbing(false);
      setIsAnalyzing(false);
    }
  };

  // STEP 3 HANDLER: Run entire deployment pipeline automatically in background
  const handleDeployPipeline = async () => {
    setIsDeployingPipeline(true);
    setPipelineError(null);
    setPipelineStage('building');

    try {
      // 1. Create or update project
      let pId = activeProjectId;
      if (!pId) {
        const created = await api.createProject({
          name: projectConfig.name,
          framework: projectConfig.framework,
          language: projectConfig.language,
          packageManager: projectConfig.packageManager,
          buildCommand: projectConfig.buildCommand,
          startCommand: projectConfig.startCommand,
          port: projectConfig.port,
          subdomain: projectConfig.subdomain,
        });
        pId = created.id;
        setActiveProjectId(created.id);
      }

      if (!pId) {
        throw new Error('Project could not be initialized');
      }
      const projectId = pId;

      // 2. Save configured environment variables
      for (const env of envVars) {
        if (env.value && env.value.trim().length > 0) {
          await api.setEnvironment(projectId, env);
        }
      }

      // 3. Trigger isolated sandbox build
      const buildRes = await api.triggerBuild(projectId, {
        buildCommand: projectConfig.buildCommand,
        branch: 'main',
      });

      setActiveDeploymentId(buildRes.deploymentId);
      setActiveBuildId(buildRes.buildId);

      // Poll build status until succeeded or failed
      const buildSuccess = await new Promise<boolean>((resolve) => {
        const interval = setInterval(async () => {
          try {
            const b = await api.getBuild(buildRes.buildId);
            setBuildLogs(b.logs || []);

            if (b.status === 'succeeded') {
              clearInterval(interval);
              resolve(true);
            } else if (b.status === 'failed') {
              clearInterval(interval);
              setPipelineError(b.errorExplanation || {
                title: 'Build Failed',
                whatHappened: b.errorSummary || 'Process returned non-zero exit code.',
                whyItBreaksInProduction: 'Production builders need cleanly bundled assets.',
                recommendedFix: 'Review the build logs below to fix the dependency or compilation error.',
              });
              resolve(false);
            }
          } catch (e) {
            clearInterval(interval);
            resolve(false);
          }
        }, 800);
      });

      if (!buildSuccess) {
        setPipelineStage('failed');
        setIsDeployingPipeline(false);
        setShowTechnicalDetails(true);
        return;
      }

      // 4. Start Preview & Run 10-Point Readiness Engine Checks
      setPipelineStage('auditing');
      await new Promise((r) => setTimeout(r, 600));

      const report = await api.runReadiness(projectId, buildRes.deploymentId);
      setReadinessReport(report);

      if (!report.passed) {
        setPipelineStage('failed');
        setIsDeployingPipeline(false);
        setShowTechnicalDetails(true);
        const topIssue = report.issues?.[0];
        setPipelineError({
          title: topIssue?.title || 'Production Readiness Verification Blocked',
          whatHappened: topIssue?.message || 'One or more critical checks did not pass.',
          whyItBreaksInProduction: 'Deploying with this issue would cause broken assets or runtime crashes for real users.',
          recommendedFix: topIssue?.recommendedFix || 'Correct the configuration and click Deploy again.',
          fixAction: topIssue?.fixAction,
        });
        return;
      }

      // 5. Deploy Live to Production
      setPipelineStage('deploying');
      const deployed = await api.deploy(projectId, buildRes.deploymentId);
      setLiveUrl(deployed.productionUrl);
      setPipelineStage('live');
    } catch (err: any) {
      setPipelineStage('failed');
      setPipelineError({
        title: 'Deployment Failed',
        whatHappened: err.message,
        whyItBreaksInProduction: 'An unexpected exception occurred during deployment.',
        recommendedFix: 'Check the logs or configuration and try again.',
      });
      setShowTechnicalDetails(true);
    } finally {
      setIsDeployingPipeline(false);
    }
  };

  // Only display user-project variables in the primary UI
  const userProjectVars = envVars.filter((e) => !isPlatformInternal(e.key));

  const getCategoryLabel = (env: any): string => {
    if (env.key === 'DATABASE_URL' || env.key === 'POSTGRES_URL' || env.key === 'MONGODB_URI' || env.group === 'Database') {
      return 'DATABASE';
    }
    if (env.key.includes('STRIPE') || env.group === 'Payments') {
      return 'PAYMENTS';
    }
    if (env.key === 'NEXT_PUBLIC_API_URL' || env.key === 'API_URL' || env.key === 'VITE_API_URL' || env.key === 'REACT_APP_API_URL' || env.group === 'API') {
      return 'API';
    }
    if (env.key.includes('SUPABASE') || env.key.includes('AUTH') || env.group === 'Authentication') {
      return 'AUTHENTICATION';
    }
    return (env.group || 'GENERAL').toUpperCase();
  };

  const getVariableExplanation = (env: any): string => {
    if (env.key === 'DATABASE_URL' || env.key === 'POSTGRES_URL') {
      return 'PostgreSQL database used by your application.';
    }
    if (env.key === 'STRIPE_SECRET_KEY') {
      return 'Used to securely process Stripe payments.';
    }
    if (env.key === 'NEXT_PUBLIC_API_URL' || env.key === 'API_URL' || env.key === 'VITE_API_URL') {
      return 'Where your frontend connects to your API.';
    }
    if (env.key === 'STRIPE_PUBLISHABLE_KEY') {
      return 'Used by the browser to initialize Stripe Checkout.';
    }
    return env.description || `Configuration setting for ${env.key}.`;
  };

  const getVariablePlaceholder = (env: any): string => {
    if (env.key === 'DATABASE_URL' || env.key === 'POSTGRES_URL') {
      return 'postgresql://username:password@host:5432/database';
    }
    if (env.key === 'STRIPE_SECRET_KEY') {
      return '•••••••••••••••••••';
    }
    if (env.key === 'NEXT_PUBLIC_API_URL' || env.key === 'API_URL' || env.key === 'VITE_API_URL') {
      return 'https://api.example.com';
    }
    return env.placeholder || 'Value';
  };

  const getVariableStatus = (env: any): 'Configured' | 'Required' | 'Optional' => {
    if (env.value && env.value.trim().length > 0) {
      return 'Configured';
    }
    if (env.category === 'required' || env.key === 'DATABASE_URL' || env.key === 'POSTGRES_URL') {
      return 'Required';
    }
    return 'Optional';
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* 3-STEP PROGRESS HEADER */}
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          {[
            { num: 1, label: 'Connect', icon: Server },
            { num: 2, label: 'Configure', icon: Lock },
            { num: 3, label: 'Deploy', icon: Rocket },
          ].map((s, idx) => {
            const Icon = s.icon;
            const isPassed = currentStep > s.num || (pipelineStage === 'live' && s.num === 3);
            const isCurrent = currentStep === s.num && pipelineStage !== 'live';

            return (
              <React.Fragment key={s.num}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold transition-all shadow-md ${
                      isPassed
                        ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                        : isCurrent
                        ? 'bg-blue-600 text-white ring-4 ring-blue-600/20 shadow-blue-600/30'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {isPassed ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span
                    className={`text-xs font-semibold mt-2 tracking-wide uppercase ${
                      isCurrent ? 'text-blue-400 font-bold' : isPassed ? 'text-slate-300' : 'text-slate-500'
                    }`}
                  >
                    {s.num}. {s.label}
                  </span>
                </div>

                {idx < 2 && (
                  <div
                    className={`flex-1 h-0.5 mx-4 transition-colors ${
                      currentStep > idx + 1 ? 'bg-emerald-600' : 'bg-slate-800'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* STEP 1: CONNECT                                                           */}
      {/* ========================================================================= */}
      {currentStep === 1 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl">
          <div className="max-w-md mx-auto text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-4 text-blue-400 shadow-lg shadow-blue-600/10">
              <Server className="w-7 h-7" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Connect your local website
            </h1>
            <p className="text-slate-400 text-sm mt-2">
              Enter your localhost address. LaunchFlow will securely check it and detect what it needs.
            </p>
          </div>

          <div className="max-w-md mx-auto space-y-6">
            {/* Local URL Input */}
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={localhostUrl}
                onChange={(e) => setLocalhostUrl(e.target.value)}
                placeholder="http://localhost:3000"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3.5 text-white font-mono text-sm focus:outline-none focus:border-blue-500 transition shadow-inner"
              />

              <button
                onClick={handleCheckAndAnalyze}
                disabled={isProbing || isAnalyzing}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3.5 rounded-xl transition shadow-lg shadow-blue-600/25 flex items-center justify-center space-x-2 disabled:opacity-50 shrink-0"
              >
                {isProbing || isAnalyzing ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                <span>{isProbing ? 'Connecting...' : isAnalyzing ? 'Inspecting...' : 'Check Website'}</span>
              </button>
            </div>

            {/* LaunchFlow Local Agent Helper */}
            <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-5 text-xs text-slate-400 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200">LaunchFlow Local Agent</span>
                <span
                  className={`font-mono text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                    tunnelStatus?.connected
                      ? 'bg-emerald-950/60 border-emerald-800/60 text-emerald-400'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  {tunnelStatus?.connected ? '● Connected' : '○ Standby'}
                </span>
              </div>

              <p className="leading-relaxed">
                If the agent is not running, connect your local port with this one command:
              </p>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between font-mono text-slate-200">
                <code className="text-blue-400 truncate pr-2">
                  node agent/bin/launchflow.js connect {localhostUrl ? new URL(localhostUrl).port || '3000' : '3000'}
                </code>
                <button
                  onClick={copyAgentCommand}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition shrink-0"
                  title="Copy Command"
                >
                  {copiedCmd ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Probe Error Alert */}
            {probeResult && !probeResult.reachable && (
              <div className="p-5 rounded-2xl bg-rose-950/20 border border-rose-900/50 space-y-3 text-left">
                <div className="flex items-center space-x-2 text-rose-400 font-bold text-sm">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <span>{probeResult.explanation?.title || "We Couldn't Connect to Your Website"}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {probeResult.explanation?.whatHappened || probeResult.details}
                </p>
                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 font-mono">
                  <span className="text-blue-400 font-bold">Try: </span> npm run dev
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: CONFIGURE                                                         */}
      {/* ========================================================================= */}
      {currentStep === 2 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
          <div className="border-b border-slate-800 pb-4">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Configure your app
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {userProjectVars.length > 0
                ? "We've detected the configuration settings your app needs."
                : "Your project doesn't require any additional configuration."}
            </p>
          </div>

          {/* ZERO REQUIRED VARS STATE */}
          {userProjectVars.length === 0 ? (
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-6 text-center space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Your project doesn't require any additional configuration.</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  No database connections or external secret keys were found in your source code. You're ready to deploy!
                </p>
              </div>
              <button
                onClick={() => setCurrentStep(3)}
                className="mt-1 bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2.5 rounded-xl transition shadow-lg shadow-blue-600/25 inline-flex items-center space-x-2 text-sm"
              >
                <span>Continue →</span>
              </button>
            </div>
          ) : (
            /* DETECTED USER-PROJECT VARIABLES ONLY */
            <div className="space-y-3">
              {userProjectVars.map((env) => {
                const categoryLabel = getCategoryLabel(env);
                const explanation = getVariableExplanation(env);
                const placeholder = getVariablePlaceholder(env);
                const status = getVariableStatus(env);

                const isDatabase = env.key === 'DATABASE_URL' || env.key === 'POSTGRES_URL';
                const isStripeSecret = env.key === 'STRIPE_SECRET_KEY';
                const isSensitive = env.isSecret || isDatabase || isStripeSecret;

                return (
                  <div
                    key={env.key}
                    className="bg-slate-950/80 border border-slate-800/90 hover:border-slate-700/80 rounded-xl p-3.5 sm:p-4 space-y-2 transition shadow-sm"
                  >
                    {/* Header: Friendly Category + Variable Name + Status */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center space-x-2 min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
                          {categoryLabel}
                        </span>
                        <span className="font-mono font-bold text-sm text-white truncate">
                          {env.key}
                        </span>
                      </div>

                      <div className="shrink-0">
                        {status === 'Configured' && (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <Check className="w-3 h-3" />
                            <span>Configured</span>
                          </span>
                        )}
                        {status === 'Required' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            Required
                          </span>
                        )}
                        {status === 'Optional' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-800/80 text-slate-400 border border-slate-700/60">
                            Optional
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Short Explanation */}
                    <p className="text-xs text-slate-400 leading-snug">
                      {explanation}
                    </p>

                    {/* Compact Input Field */}
                    <div className="relative flex items-center">
                      <input
                        type={isStripeSecret ? 'password' : isSensitive && !visibleSecrets.has(env.key) ? 'password' : 'text'}
                        value={env.value}
                        placeholder={placeholder}
                        autoComplete="off"
                        spellCheck={false}
                        onChange={(e) => {
                          const updated = [...envVars];
                          const targetIdx = updated.findIndex((item) => item.key === env.key);
                          if (targetIdx >= 0) {
                            updated[targetIdx].value = e.target.value;
                            setEnvVars(updated);
                          }
                        }}
                        className="w-full bg-slate-900/90 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-3 py-2 text-xs sm:text-sm font-mono text-white placeholder:text-slate-600 focus:outline-none transition shadow-inner"
                      />
                      {isSensitive && !isStripeSecret && (
                        <button
                          type="button"
                          onClick={() => toggleSecretVisibility(env.key)}
                          className="absolute right-2.5 text-slate-500 hover:text-slate-300 transition p-1"
                          title={visibleSecrets.has(env.key) ? 'Hide value' : 'Show value'}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Contextual Helpers */}
                    {isDatabase && (
                      <div className="pt-0.5">
                        <button
                          type="button"
                          onClick={() => setShowDbHelp(!showDbHelp)}
                          className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center space-x-1 focus:outline-none"
                        >
                          <HelpCircle className="w-3 h-3" />
                          <span>Where do I get this?</span>
                        </button>

                        {showDbHelp && (
                          <div className="mt-1.5 text-[11px] text-slate-300 bg-slate-900/95 border border-indigo-900/50 rounded-lg p-2.5 space-y-1 leading-relaxed">
                            <p className="font-semibold text-white">Hosted PostgreSQL Providers:</p>
                            <p>• <strong>Supabase</strong>: Project Settings → Database → Connection string (URI)</p>
                            <p>• <strong>Neon</strong>: Project Dashboard → Connection Details (<code className="text-indigo-300 font-mono">postgres://...</code>)</p>
                            <p>• <strong>AWS RDS / Railway / Render</strong>: Copy the remote PostgreSQL database URL.</p>
                            <p className="text-slate-400 text-[10px] pt-0.5">
                              <em>Note: Deployed cloud containers cannot connect to your laptop's localhost.</em>
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {isStripeSecret && (
                      <div className="pt-0.5">
                        <a
                          href="https://dashboard.stripe.com/apikeys"
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-violet-400 hover:text-violet-300 font-medium inline-flex items-center space-x-1 underline"
                        >
                          <span>Get Stripe key ↗</span>
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Navigation Action */}
              <div className="pt-3 flex items-center justify-between border-t border-slate-800/80">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-3.5 py-2 text-slate-400 hover:text-white text-xs font-semibold flex items-center space-x-1.5 transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>

                <button
                  onClick={() => setCurrentStep(3)}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-7 py-2.5 rounded-xl transition shadow-lg shadow-blue-600/25 flex items-center space-x-2 text-sm"
                >
                  <span>Continue →</span>
                </button>
              </div>
            </div>
          )}

          {/* ADVANCED CONFIGURATION (COLLAPSED BY DEFAULT) */}
          <div className="pt-2 border-t border-slate-800/60">
            <button
              type="button"
              onClick={() => setShowAdvancedConfig(!showAdvancedConfig)}
              className="w-full text-left py-1.5 flex items-center justify-between text-xs font-semibold text-slate-400 hover:text-slate-200 transition focus:outline-none"
            >
              <span>Advanced configuration {showAdvancedConfig ? '▴' : '▾'}</span>
              {showAdvancedConfig ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showAdvancedConfig && (
              <div className="mt-2 bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3 text-xs">
                {/* Platform note */}
                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 text-slate-400 text-[11px] leading-relaxed">
                  <span className="font-semibold text-slate-300">Platform-Internal Infrastructure: </span>
                  LaunchFlow platform variables (encryption keys, JWT secrets, container routing ports, outbound tunnel tokens) are automatically managed by the platform and injected at runtime.
                </div>

                {/* Add Custom Variable */}
                <div>
                  <span className="font-semibold text-slate-300 uppercase tracking-wider text-[11px] block mb-1.5">
                    Add Custom Variable
                  </span>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      placeholder="CUSTOM_KEY"
                      value={customKey}
                      onChange={(e) => setCustomKey(e.target.value.toUpperCase())}
                      className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 font-mono text-white text-xs sm:w-1/3 focus:outline-none focus:border-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Value"
                      value={customValue}
                      onChange={(e) => setCustomValue(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 font-mono text-white text-xs flex-1 focus:outline-none focus:border-blue-500"
                    />
                    <button
                      onClick={() => {
                        if (customKey.trim() && !isPlatformInternal(customKey.trim())) {
                          setEnvVars([
                            ...envVars,
                            {
                              key: customKey.trim(),
                              value: customValue.trim(),
                              category: 'optional',
                              isSecret: /SECRET|KEY|PASSWORD|TOKEN/i.test(customKey),
                            },
                          ]);
                          setCustomKey('');
                          setCustomValue('');
                        }
                      }}
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg border border-slate-700 transition text-xs"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Build Command & Subdomain */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-slate-400 font-semibold uppercase text-[10px]">Build Command</label>
                    <input
                      type="text"
                      value={projectConfig.buildCommand}
                      onChange={(e) => setProjectConfig({ ...projectConfig, buildCommand: e.target.value })}
                      className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg p-2 font-mono text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 font-semibold uppercase text-[10px]">Subdomain</label>
                    <input
                      type="text"
                      value={projectConfig.subdomain}
                      onChange={(e) => setProjectConfig({ ...projectConfig, subdomain: e.target.value })}
                      className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg p-2 font-mono text-white text-xs"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: DEPLOY & AUTOMATED PIPELINE                                       */}
      {/* ========================================================================= */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6">
            {pipelineStage === 'live' ? (
              // SUCCESS SCREEN
              <div className="text-center space-y-6 py-4">
                <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400 shadow-xl shadow-emerald-500/10">
                  <Rocket className="w-8 h-8" />
                </div>

                <div>
                  <div className="inline-flex items-center space-x-2 text-emerald-400 font-bold text-sm bg-emerald-950/60 border border-emerald-800/60 px-3 py-1 rounded-full mb-3">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Deployment Successful</span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                    Your website is live
                  </h1>
                  <p className="text-slate-400 text-sm mt-2 max-w-md mx-auto">
                    Validated locally, audited across the 10-Point Readiness Engine, and live in cloud production.
                  </p>
                </div>

                {/* Live URL Card */}
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl inline-flex items-center space-x-3 font-mono text-sm text-blue-400 shadow-inner">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <a
                    href={liveUrl || `http://localhost:4000/live/${projectConfig.subdomain}/`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold hover:underline"
                  >
                    {liveUrl || `http://localhost:4000/live/${projectConfig.subdomain}/`}
                  </a>
                </div>

                {/* Success Action Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <a
                    href={liveUrl || `http://localhost:4000/live/${projectConfig.subdomain}/`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/25 flex items-center space-x-2 transition"
                  >
                    <span>Open Website</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  <button
                    onClick={() => onDeploymentComplete(activeProjectId!)}
                    className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl border border-slate-700 transition"
                  >
                    View Deployment
                  </button>

                  <button
                    onClick={() => {
                      setCurrentStep(1);
                      setPipelineStage('idle');
                      setLiveUrl(null);
                      setActiveProjectId(null);
                      setActiveDeploymentId(null);
                    }}
                    className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl border border-slate-700 transition"
                  >
                    Deploy Another Project
                  </button>
                </div>
              </div>
            ) : (
              // SUMMARY & IN-PLACE DEPLOYMENT PIPELINE
              <>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    Deploy to Production
                  </h1>
                  <p className="text-slate-400 text-sm mt-1">
                    Everything has been inspected and prepared. Click deploy to build and launch your site.
                  </p>
                </div>

                {/* CLEAN SUMMARY CARD */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-mono shadow-inner">
                  <div>
                    <span className="text-slate-500 block uppercase font-sans text-[11px]">Project</span>
                    <span className="font-bold text-white text-sm">{projectConfig.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase font-sans text-[11px]">Website</span>
                    <span className="font-bold text-blue-400 text-sm truncate block">{localhostUrl}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase font-sans text-[11px]">Framework</span>
                    <span className="font-bold text-white text-sm capitalize">{projectConfig.framework}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase font-sans text-[11px]">Database</span>
                    <span className="font-bold text-white text-sm">{projectConfig.database}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase font-sans text-[11px]">Environment</span>
                    <span className="font-bold text-white text-sm">
                      {userProjectVars.filter((e) => e.value.trim().length > 0).length} of {userProjectVars.length} set
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase font-sans text-[11px]">Build</span>
                    <span className="font-bold text-white text-sm truncate block">{projectConfig.buildCommand}</span>
                  </div>
                </div>

                {/* IN-PLACE AUTOMATED PROGRESS */}
                {isDeployingPipeline && (
                  <div className="bg-slate-950 border border-blue-500/30 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-blue-400 flex items-center space-x-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>
                          {pipelineStage === 'building' && '1/3: Running isolated sandbox build...'}
                          {pipelineStage === 'auditing' && '2/3: Running 10-point Production Readiness Engine...'}
                          {pipelineStage === 'deploying' && '3/3: Publishing to production servers & routing...'}
                        </span>
                      </span>
                      <span className="text-slate-500 font-mono">Automated Pipeline</span>
                    </div>

                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{
                          width:
                            pipelineStage === 'building'
                              ? '33%'
                              : pipelineStage === 'auditing'
                              ? '66%'
                              : '90%',
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* ERROR & DIAGNOSIS */}
                {pipelineStage === 'failed' && pipelineError && (
                  <div className="bg-rose-950/30 border border-rose-900/60 rounded-2xl p-6 space-y-3 text-left">
                    <div className="flex items-center space-x-2 text-rose-400 font-bold text-base">
                      <AlertTriangle className="w-5 h-5 shrink-0" />
                      <span>{pipelineError.title}</span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {pipelineError.whatHappened}
                    </p>

                    <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                      <div className="text-amber-400 font-semibold uppercase tracking-wider text-[11px]">
                        Why it breaks in production:
                      </div>
                      <p className="text-slate-300 leading-relaxed">
                        {pipelineError.whyItBreaksInProduction}
                      </p>

                      <div className="text-blue-400 font-semibold uppercase tracking-wider text-[11px] pt-1">
                        Recommended Fix:
                      </div>
                      <p className="text-slate-200 font-mono leading-relaxed">
                        {pipelineError.recommendedFix}
                      </p>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => setCurrentStep(2)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition"
                      >
                        Fix Configuration
                      </button>
                      <button
                        onClick={handleDeployPipeline}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition"
                      >
                        Retry Deployment
                      </button>
                    </div>
                  </div>
                )}

                {/* PRIMARY ACTION BUTTON */}
                <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800">
                  <button
                    onClick={() => setCurrentStep(2)}
                    disabled={isDeployingPipeline}
                    className="text-slate-400 hover:text-white text-sm font-semibold flex items-center space-x-1.5 transition disabled:opacity-50"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Configure</span>
                  </button>

                  <button
                    onClick={handleDeployPipeline}
                    disabled={isDeployingPipeline}
                    className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold px-8 py-3.5 rounded-xl transition shadow-xl shadow-blue-600/30 flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <Rocket className={`w-5 h-5 ${isDeployingPipeline ? 'animate-bounce' : ''}`} />
                    <span>{isDeployingPipeline ? 'Deploying...' : 'Deploy to Production 🚀'}</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* ADVANCED DETAILS & LIVE LOGS ACCORDION */}
          {(pipelineStage !== 'idle' || activeBuildId) && (
            <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/60 shadow-lg">
              <button
                onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                className="w-full px-6 py-4 flex items-center justify-between text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/40 transition"
              >
                <div className="flex items-center space-x-2">
                  <Terminal className="w-4 h-4 text-blue-400" />
                  <span>View Technical Details & Build Logs</span>
                  {readinessReport && (
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                      Score: {readinessReport.totalScore}/100
                    </span>
                  )}
                </div>
                {showTechnicalDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showTechnicalDetails && (
                <div className="p-6 border-t border-slate-800 space-y-6">
                  {readinessReport && (
                    <ReadinessReportCard
                      report={readinessReport}
                      onRetest={handleDeployPipeline}
                      onFixIssue={() => setCurrentStep(2)}
                      isRetesting={isDeployingPipeline}
                    />
                  )}

                  <TerminalLogViewer
                    buildId={activeBuildId || undefined}
                    initialLogs={buildLogs}
                    status={pipelineStage === 'building' ? 'building' : 'completed'}
                    title="Real-Time Isolated Build & Sandbox Execution Logs"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
