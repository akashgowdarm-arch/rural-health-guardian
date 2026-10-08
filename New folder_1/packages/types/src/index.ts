export type FrameworkType = 'nextjs' | 'react-vite' | 'nodejs-express' | 'static-html';

export type BuildStatus = 'pending' | 'installing' | 'building' | 'succeeded' | 'failed';
export type DeploymentStatus = 'pending' | 'building' | 'previewing' | 'ready' | 'deploying' | 'live' | 'failed' | 'offline';
export type ReadinessStatus = 'pending' | 'running' | 'passed' | 'warning' | 'failed';
export type ReadinessSeverity = 'critical' | 'warning' | 'info';

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  slug: string;
  repositoryId?: string;
  framework: FrameworkType;
  language: 'javascript' | 'typescript';
  packageManager: 'npm' | 'yarn' | 'pnpm' | 'bun';
  buildCommand: string;
  startCommand: string;
  port: number;
  subdomain: string;
  customDomain?: string;
  status: DeploymentStatus;
  currentDeploymentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Repository {
  id: string;
  userId: string;
  name: string;
  fullName: string;
  defaultBranch: string;
  selectedBranch: string;
  cloneUrl?: string;
  sourceType: 'github' | 'zip' | 'cli';
  createdAt: string;
}

export interface EnvironmentVariable {
  id: string;
  projectId: string;
  key: string;
  value: string; // Encrypted or masked
  isSecret: boolean;
  category: 'required' | 'optional' | 'public' | 'secret';
  detectedLocation?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Build {
  id: string;
  projectId: string;
  deploymentId: string;
  status: BuildStatus;
  startedAt: string;
  completedAt?: string;
  exitCode?: number;
  durationMs?: number;
  errorSummary?: string;
  errorExplanation?: IntelligentExplanation;
}

export interface BuildLog {
  id: string;
  buildId: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'stdout' | 'stderr';
  message: string;
}

export interface PreviewEnvironment {
  id: string;
  projectId: string;
  deploymentId: string;
  internalPort: number;
  previewUrl: string;
  status: 'starting' | 'healthy' | 'unhealthy' | 'stopped';
  createdAt: string;
  expiresAt: string;
}

export interface ReadinessIssue {
  id: string;
  reportId: string;
  category: 'build' | 'server' | 'routes' | 'assets' | 'localhost_leak' | 'env_vars' | 'api' | 'database' | 'security' | 'runtime';
  severity: ReadinessSeverity;
  title: string;
  message: string;
  detectedValue?: string;
  recommendedFix: string;
  fixAction?: {
    type: 'configure_env' | 'update_config' | 'change_port' | 'fix_code';
    field?: string;
    suggestedValue?: string;
  };
}

export interface ReadinessCheckResult {
  id: string;
  name: string;
  category: string;
  passed: boolean;
  scoreWeight: number;
  scoreEarned: number;
  details: string;
  latencyMs?: number;
  issue?: ReadinessIssue;
}

export interface ReadinessReport {
  id: string;
  projectId: string;
  deploymentId: string;
  totalScore: number; // 0 - 100
  passed: boolean;
  checks: ReadinessCheckResult[];
  issues: ReadinessIssue[];
  createdAt: string;
}

export interface Deployment {
  id: string;
  projectId: string;
  version: number;
  status: DeploymentStatus;
  previewUrl?: string;
  productionUrl?: string;
  readinessScore?: number;
  commitHash?: string;
  commitMessage?: string;
  branch: string;
  createdAt: string;
  updatedAt: string;
  liveAt?: string;
}

export interface TunnelSession {
  id: string;
  userId: string;
  localPort: number;
  status: 'connected' | 'disconnected' | 'error';
  agentToken: string;
  connectedAt: string;
  lastPingAt: string;
}

export interface IntelligentExplanation {
  title: string;
  whatHappened: string;
  whyItBreaksInProduction: string;
  recommendedFix: string;
  learnMoreUrl?: string;
  suggestedAction?: {
    type: string;
    payload?: any;
  };
}

export interface LocalhostProbeResult {
  reachable: boolean;
  statusCode?: number;
  statusText?: string;
  responseTimeMs?: number;
  frameworkDetected?: FrameworkType;
  headers?: Record<string, string>;
  error?: string;
  errorExplanation?: IntelligentExplanation;
}

export interface ProjectAnalysisResult {
  framework: FrameworkType;
  language: 'javascript' | 'typescript';
  packageManager: 'npm' | 'yarn' | 'pnpm' | 'bun';
  buildCommand: string;
  startCommand: string;
  port: number;
  database: 'PostgreSQL' | 'MySQL' | 'MongoDB' | 'SQLite' | 'None';
  detectedEnvVars: Array<{
    key: string;
    category: 'required' | 'optional' | 'public' | 'secret';
    isSecret?: boolean;
    sampleValue?: string;
    description?: string;
    placeholder?: string;
    docUrl?: string;
  }>;
  confidence?: number;
}
