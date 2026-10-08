import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'launchflow_db.json');

// AES-256-GCM encryption key for secrets (default or from env)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY 
  ? Buffer.from(process.env.ENCRYPTION_KEY, 'hex') 
  : crypto.createHash('sha256').update('launchflow_dev_master_key_2026').digest();

export function encryptSecret(plainText: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

export function decryptSecret(cipherText: string): string {
  try {
    const parts = cipherText.split(':');
    if (parts.length !== 3) return cipherText; // Fallback if plain
    const [ivHex, authTagHex, encrypted] = parts;
    const decipher = crypto.createDecipheriv('aes-256-gcm', ENCRYPTION_KEY, Buffer.from(ivHex, 'hex'));
    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    return '***decryption_failed***';
  }
}

export interface DBData {
  users: Record<string, any>;
  repositories: Record<string, any>;
  projects: Record<string, any>;
  deployments: Record<string, any>;
  builds: Record<string, any>;
  buildLogs: Record<string, any[]>;
  environmentVariables: Record<string, any[]>;
  previewEnvironments: Record<string, any>;
  readinessReports: Record<string, any[]>;
  tunnelSessions: Record<string, any>;
  healthChecks: Record<string, any[]>;
  domains: Record<string, any[]>;
}

class Database {
  private data: DBData;

  constructor() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    this.data = this.load();
    this.seedDefaultUser();
  }

  private load(): DBData {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      } catch (err) {
        console.error('Failed to parse database file, initializing fresh db:', err);
      }
    }
    return {
      users: {},
      repositories: {},
      projects: {},
      deployments: {},
      builds: {},
      buildLogs: {},
      environmentVariables: {},
      previewEnvironments: {},
      readinessReports: {},
      tunnelSessions: {},
      healthChecks: {},
      domains: {},
    };
  }

  public save(): void {
    fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
  }

  private seedDefaultUser() {
    const defaultEmail = 'demo@launchflow.app';
    const exists = Object.values(this.data.users).find((u: any) => u.email === defaultEmail);
    if (!exists) {
      const salt = bcrypt.genSaltSync(10);
      const passwordHash = bcrypt.hashSync('LaunchFlow2026!', salt);
      const user = {
        id: 'usr_demo_launchflow',
        email: defaultEmail,
        name: 'LaunchFlow Developer',
        passwordHash,
        agentToken: 'lft_dev_' + crypto.randomBytes(16).toString('hex'),
        createdAt: new Date().toISOString(),
      };
      this.data.users[user.id] = user;
      this.save();
    }
  }

  // --- Users ---
  public async createUser(email: string, password: string,name: string) {
    const existing = Object.values(this.data.users).find((u: any) => u.email === email);
    if (existing) throw new Error('User already exists');
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);
    const user = {
      id: 'usr_' + crypto.randomUUID(),
      email,
      name,
      passwordHash,
      agentToken: 'lft_' + crypto.randomBytes(16).toString('hex'),
      createdAt: new Date().toISOString(),
    };
    this.data.users[user.id] = user;
    this.save();
    return { id: user.id, email: user.email, name: user.name, agentToken: user.agentToken, createdAt: user.createdAt };
  }

  public getUserByEmail(email: string) {
    return Object.values(this.data.users).find((u: any) => u.email === email);
  }

  public getUserById(id: string) {
    const u = this.data.users[id];
    if (!u) return null;
    return { id: u.id, email: u.email, name: u.name, agentToken: u.agentToken, createdAt: u.createdAt };
  }

  public getUserByAgentToken(token: string) {
    const u = Object.values(this.data.users).find((user: any) => user.agentToken === token);
    if (!u) return null;
    return { id: u.id, email: u.email, name: u.name, agentToken: u.agentToken, createdAt: u.createdAt };
  }

  // --- Projects ---
  public createProject(userId: string, data: any) {
    const id = 'prj_' + crypto.randomUUID();
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + crypto.randomBytes(3).toString('hex');
    const project = {
      id,
      userId,
      name: data.name,
      slug,
      repositoryId: data.repositoryId || null,
      framework: data.framework || 'nextjs',
      language: data.language || 'typescript',
      packageManager: data.packageManager || 'npm',
      buildCommand: data.buildCommand || 'npm run build',
      startCommand: data.startCommand || 'npm start',
      port: data.port || 3000,
      subdomain: data.subdomain || slug,
      customDomain: data.customDomain || null,
      status: 'pending',
      currentDeploymentId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.projects[id] = project;
    this.save();
    return project;
  }

  public getProjectsByUser(userId: string) {
    return Object.values(this.data.projects).filter((p: any) => p.userId === userId);
  }

  public getProjectById(id: string, userId?: string) {
    const p = this.data.projects[id];
    if (!p) return null;
    if (userId && p.userId !== userId) return null; // Cross-user isolation
    return p;
  }

  public getProjectBySubdomain(subdomain: string) {
    return Object.values(this.data.projects).find((p: any) => p.subdomain === subdomain || p.slug === subdomain);
  }

  public updateProject(id: string, updates: any, userId?: string) {
    const p = this.data.projects[id];
    if (!p) return null;
    if (userId && p.userId !== userId) throw new Error('Unauthorized');
    this.data.projects[id] = {
      ...p,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.data.projects[id];
  }

  public deleteProject(id: string, userId: string) {
    const p = this.data.projects[id];
    if (!p || p.userId !== userId) throw new Error('Unauthorized');
    delete this.data.projects[id];
    this.save();
    return true;
  }

  public getAllProjects(): any[] {
    return Object.values(this.data.projects);
  }

  // --- Repositories ---
  public createRepository(userId: string, data: any) {
    const id = 'repo_' + crypto.randomUUID();
    const repo = {
      id,
      userId,
      name: data.name,
      fullName: data.fullName || data.name,
      defaultBranch: data.defaultBranch || 'main',
      selectedBranch: data.selectedBranch || 'main',
      cloneUrl: data.cloneUrl || '',
      sourceType: data.sourceType || 'github',
      localPath: data.localPath || '',
      createdAt: new Date().toISOString(),
    };
    this.data.repositories[id] = repo;
    this.save();
    return repo;
  }

  public getRepositoriesByUser(userId: string) {
    return Object.values(this.data.repositories).filter((r: any) => r.userId === userId);
  }

  public getRepositoryById(id: string, userId?: string) {
    const r = this.data.repositories[id];
    if (!r) return null;
    if (userId && r.userId !== userId) return null;
    return r;
  }

  // --- Deployments ---
  public createDeployment(projectId: string, branch: string = 'main') {
    const project = this.data.projects[projectId];
    if (!project) throw new Error('Project not found');
    const existing = Object.values(this.data.deployments).filter((d: any) => d.projectId === projectId);
    const version = existing.length + 1;
    const id = 'dpl_' + crypto.randomUUID();
    const deployment = {
      id,
      projectId,
      version,
      status: 'pending',
      branch,
      previewUrl: null,
      productionUrl: null,
      readinessScore: null,
      commitHash: crypto.randomBytes(4).toString('hex'),
      commitMessage: `Deployment #${version} via LaunchFlow`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      liveAt: null,
    };
    this.data.deployments[id] = deployment;
    this.save();
    return deployment;
  }

  public getDeploymentsByProject(projectId: string) {
    return Object.values(this.data.deployments)
      .filter((d: any) => d.projectId === projectId)
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getDeploymentById(id: string) {
    return this.data.deployments[id] || null;
  }

  public updateDeployment(id: string, updates: any) {
    const d = this.data.deployments[id];
    if (!d) return null;
    this.data.deployments[id] = {
      ...d,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.data.deployments[id];
  }

  // --- Builds ---
  public createBuild(projectId: string, deploymentId: string) {
    const id = 'bld_' + crypto.randomUUID();
    const build = {
      id,
      projectId,
      deploymentId,
      status: 'pending',
      startedAt: new Date().toISOString(),
      completedAt: null,
      exitCode: null,
      durationMs: null,
      errorSummary: null,
      errorExplanation: null,
    };
    this.data.builds[id] = build;
    this.data.buildLogs[id] = [];
    this.save();
    return build;
  }

  public getBuildById(id: string) {
    return this.data.builds[id] || null;
  }

  public getBuildsByDeployment(deploymentId: string) {
    return Object.values(this.data.builds)
      .filter((b: any) => b.deploymentId === deploymentId)
      .sort((a: any, b: any) => new Date(b.startedAt || 0).getTime() - new Date(a.startedAt || 0).getTime());
  }

  public updateBuild(id: string, updates: any) {
    const b = this.data.builds[id];
    if (!b) return null;
    this.data.builds[id] = {
      ...b,
      ...updates,
    };
    this.save();
    return this.data.builds[id];
  }

  // --- Build Logs ---
  public addBuildLog(buildId: string, level: 'info' | 'warn' | 'error' | 'stdout' | 'stderr', message: string) {
    if (!this.data.buildLogs[buildId]) {
      this.data.buildLogs[buildId] = [];
    }
    const log = {
      id: 'log_' + crypto.randomUUID(),
      buildId,
      timestamp: new Date().toISOString(),
      level,
      message,
    };
    this.data.buildLogs[buildId].push(log);
    this.save();
    return log;
  }

  public getBuildLogs(buildId: string) {
    return this.data.buildLogs[buildId] || [];
  }

  // --- Environment Variables ---
  public setEnvVar(projectId: string, key: string, value: string, category: string = 'optional', isSecret: boolean = false) {
    if (!this.data.environmentVariables[projectId]) {
      this.data.environmentVariables[projectId] = [];
    }
    const list = this.data.environmentVariables[projectId];
    const encrypted = isSecret ? encryptSecret(value) : value;
    const existingIndex = list.findIndex((e: any) => e.key === key);
    const item = {
      id: existingIndex >= 0 ? list[existingIndex].id : 'env_' + crypto.randomUUID(),
      projectId,
      key,
      value: encrypted,
      isSecret,
      category,
      createdAt: existingIndex >= 0 ? list[existingIndex].createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    if (existingIndex >= 0) {
      list[existingIndex] = item;
    } else {
      list.push(item);
    }
    this.save();
    return { ...item, value: isSecret ? '••••••••' : value };
  }

  public getEnvVarsByProject(projectId: string, revealSecrets: boolean = false) {
    const list = this.data.environmentVariables[projectId] || [];
    return list.map((item: any) => ({
      ...item,
      value: item.isSecret 
        ? (revealSecrets ? decryptSecret(item.value) : '••••••••')
        : item.value,
    }));
  }

  public getRawEnvMap(projectId: string): Record<string, string> {
    const list = this.data.environmentVariables[projectId] || [];
    const map: Record<string, string> = {};
    for (const item of list) {
      map[item.key] = item.isSecret ? decryptSecret(item.value) : item.value;
    }
    return map;
  }

  public deleteEnvVar(projectId: string, key: string) {
    if (!this.data.environmentVariables[projectId]) return false;
    this.data.environmentVariables[projectId] = this.data.environmentVariables[projectId].filter((e: any) => e.key !== key);
    this.save();
    return true;
  }

  // --- Previews ---
  public createPreview(projectId: string, deploymentId: string, internalPort: number, previewUrl: string, pid?: number, sandboxDir?: string) {
    const id = 'prv_' + crypto.randomUUID();
    const preview = {
      id,
      projectId,
      deploymentId,
      internalPort,
      previewUrl,
      sandboxDir: sandboxDir || null,
      pid: pid || null,
      status: 'healthy',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    };
    this.data.previewEnvironments[id] = preview;
    this.save();
    return preview;
  }

  public getPreviewById(id: string) {
    return this.data.previewEnvironments[id] || null;
  }

  public getPreviewByDeployment(deploymentId: string) {
    return Object.values(this.data.previewEnvironments).find((p: any) => p.deploymentId === deploymentId) || null;
  }

  public updatePreview(id: string, updates: any) {
    const p = this.data.previewEnvironments[id];
    if (!p) return null;
    this.data.previewEnvironments[id] = { ...p, ...updates };
    this.save();
    return this.data.previewEnvironments[id];
  }

  // --- Readiness Reports ---
  public createReadinessReport(projectId: string, deploymentId: string, totalScore: number, passed: boolean, checks: any[], issues: any[]) {
    if (!this.data.readinessReports[projectId]) {
      this.data.readinessReports[projectId] = [];
    }
    const id = 'rep_' + crypto.randomUUID();
    const report = {
      id,
      projectId,
      deploymentId,
      totalScore,
      passed,
      checks,
      issues,
      createdAt: new Date().toISOString(),
    };
    this.data.readinessReports[projectId].unshift(report);
    this.save();
    return report;
  }

  public getReportsByProject(projectId: string) {
    return this.data.readinessReports[projectId] || [];
  }

  public getLatestReport(projectId: string) {
    const reports = this.data.readinessReports[projectId] || [];
    return reports[0] || null;
  }

  // --- Tunnel Sessions ---
  public createTunnelSession(userId: string, localPort: number, agentToken: string) {
    const id = 'tun_' + crypto.randomUUID();
    const session = {
      id,
      userId,
      localPort,
      agentToken,
      status: 'connected',
      connectedAt: new Date().toISOString(),
      lastPingAt: new Date().toISOString(),
    };
    this.data.tunnelSessions[id] = session;
    this.save();
    return session;
  }

  public getTunnelSession(id: string) {
    return this.data.tunnelSessions[id] || null;
  }

  public getTunnelSessionByToken(token: string) {
    return Object.values(this.data.tunnelSessions).find((t: any) => t.agentToken === token && t.status === 'connected') || null;
  }

  public updateTunnelSession(id: string, updates: any) {
    const s = this.data.tunnelSessions[id];
    if (!s) return null;
    this.data.tunnelSessions[id] = { ...s, ...updates };
    this.save();
    return this.data.tunnelSessions[id];
  }

  // --- Health Checks & Metrics ---
  public recordHealthCheck(projectId: string, deploymentId: string, result: { statusCode: number; responseTimeMs: number; isHealthy: boolean; errorMessage?: string }) {
    if (!this.data.healthChecks[projectId]) {
      this.data.healthChecks[projectId] = [];
    }
    const check = {
      id: 'chk_' + crypto.randomUUID(),
      projectId,
      deploymentId,
      ...result,
      checkedAt: new Date().toISOString(),
    };
    this.data.healthChecks[projectId].unshift(check);
    // Keep last 100
    if (this.data.healthChecks[projectId].length > 100) {
      this.data.healthChecks[projectId] = this.data.healthChecks[projectId].slice(0, 100);
    }
    this.save();
    return check;
  }

  public getHealthMetrics(projectId: string) {
    const checks = this.data.healthChecks[projectId] || [];
    if (checks.length === 0) {
      return {
        uptime: 100,
        averageResponseTimeMs: 42,
        totalRequests: 0,
        status: 'online',
        recentChecks: [],
      };
    }
    const healthyCount = checks.filter((c: any) => c.isHealthy).length;
    const uptime = Math.round((healthyCount / checks.length) * 100);
    const avgLatency = Math.round(checks.reduce((acc: number, c: any) => acc + (c.responseTimeMs || 0), 0) / checks.length);
    return {
      uptime,
      averageResponseTimeMs: avgLatency,
      totalRequests: checks.length * 12,
      status: checks[0].isHealthy ? 'online' : 'offline',
      recentChecks: checks.slice(0, 20),
    };
  }

  // --- Domains ---
  public addDomain(projectId: string, domain: string, isCustom: boolean = false) {
    if (!this.data.domains[projectId]) {
      this.data.domains[projectId] = [];
    }
    const d = {
      id: 'dom_' + crypto.randomUUID(),
      projectId,
      domain,
      isCustom,
      verified: !isCustom, // LaunchFlow domains verified immediately
      sslStatus: 'active',
      createdAt: new Date().toISOString(),
    };
    this.data.domains[projectId].push(d);
    this.save();
    return d;
  }

  public getDomains(projectId: string) {
    return this.data.domains[projectId] || [];
  }
}

export const db = new Database();
