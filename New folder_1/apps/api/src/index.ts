import express from 'express';
import http from 'node:http';
import cors from 'cors';
import { WebSocketServer, WebSocket } from 'ws';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import path from 'node:path';
import fs from 'node:fs';

import { db } from './db/database.ts';
import { BuildSandbox } from './services/BuildSandbox.ts';
import { PreviewManager } from './services/PreviewManager.ts';
import { ReadinessEngine } from './services/ReadinessEngine.ts';
import { DeploymentEngine } from './services/DeploymentEngine.ts';
import { AgentTunnelServer } from './services/AgentTunnelServer.ts';
import { ProjectAnalyzer } from './services/ProjectAnalyzer.ts';
import { IntelligentExplanationEngine } from './services/IntelligentExplanationEngine.ts';

const PORT = parseInt(process.env.PORT || '4000', 10);
const JWT_SECRET = process.env.JWT_SECRET || 'launchflow_super_secret_jwt_2026';

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Initialize agent tunnel server
AgentTunnelServer.initialize(wss);

// WebSocket subscriptions for live build logs
const logSubscribers: Map<string, Set<WebSocket>> = new Map();

wss.on('connection', (ws, req) => {
  const url = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
  if (url.pathname.startsWith('/ws/logs/')) {
    const buildId = url.pathname.replace('/ws/logs/', '');
    if (!logSubscribers.has(buildId)) {
      logSubscribers.set(buildId, new Set());
    }
    logSubscribers.get(buildId)!.add(ws);

    // Send existing logs immediately
    const existing = db.getBuildLogs(buildId);
    ws.send(JSON.stringify({ type: 'history', logs: existing }));

    ws.on('close', () => {
      logSubscribers.get(buildId)?.delete(ws);
    });
  }
});

// Broadcast build logs in real time
BuildSandbox.setLogEmitter((buildId, log) => {
  const subscribers = logSubscribers.get(buildId);
  if (subscribers) {
    const msg = JSON.stringify({ type: 'log', log });
    subscribers.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(msg);
      }
    });
  }
});

// Auth Middleware & Cross-User Isolation
function authenticate(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // If no token provided in demo/dev mode, fallback to demo user
    const demoUser = db.getUserByEmail('demo@launchflow.app');
    if (demoUser) {
      req.user = demoUser;
      return next();
    }
    return res.status(401).json({ error: 'Unauthorized. Bearer token required.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const user = db.getUserById(decoded.userId);
    if (!user) return res.status(401).json({ error: 'User not found' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Root & Health Check Endpoints
app.get('/', (req, res) => {
  res.json({
    service: 'LaunchFlow Production Engine & API',
    status: 'online',
    version: '1.0.0',
    port: PORT,
    endpoints: {
      health: '/api/health',
      projects: '/api/projects',
      repositories: '/api/repositories',
      tunnels: '/api/tunnels/status',
      preview: '/preview/:previewId/',
      live: '/live/:subdomain/',
    },
  });
});

app.get(['/health', '/api/health'], (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// -------------------------------------------------------------
// REVERSE PROXY ROUTING FOR PREVIEWS AND LIVE DEPLOYMENTS
// -------------------------------------------------------------

// Route: /preview/:previewId/*
app.use('/preview/:previewId', (req, res) => {
  const previewId = req.params.previewId;
  const running = PreviewManager.getPreview(previewId);
  if (!running) {
    return res.status(404).send(`
      <!DOCTYPE html>
      <html>
        <head><title>Preview Not Found - LaunchFlow</title><meta charset="utf-8"></head>
        <body style="font-family: sans-serif; text-align: center; padding: 50px;">
          <h2>Preview Environment Not Running</h2>
          <p>Preview session <code>${previewId}</code> has expired or was terminated.</p>
          <p><a href="/dashboard">Return to Dashboard</a></p>
        </body>
      </html>
    `);
  }

  // Strip prefix for proxied target
  const targetUrl = `http://127.0.0.1:${running.internalPort}${req.url}`;
  const proxyReq = http.request(targetUrl, {
    method: req.method,
    headers: { ...req.headers, host: `127.0.0.1:${running.internalPort}` },
  }, (proxyRes) => {
    res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    res.status(502).send(`Preview Proxy Error: ${err.message}`);
  });

  req.pipe(proxyReq);
});

// Route: /live/:subdomain/*
app.use('/live/:subdomain', (req, res) => {
  const subdomain = req.params.subdomain;
  const live = DeploymentEngine.getLiveInstance(subdomain);
  if (!live) {
    return res.status(404).send(`
      <!DOCTYPE html>
      <html>
        <head><title>Site Not Live - LaunchFlow</title><meta charset="utf-8"></head>
        <body style="font-family: sans-serif; text-align: center; padding: 50px;">
          <h2>Deployment Not Found</h2>
          <p>No live instance is currently registered for <strong>${subdomain}.launchflow.app</strong>.</p>
        </body>
      </html>
    `);
  }

  const targetUrl = `http://127.0.0.1:${live.internalPort}${req.url}`;
  const proxyReq = http.request(targetUrl, {
    method: req.method,
    headers: { ...req.headers, host: `127.0.0.1:${live.internalPort}` },
  }, (proxyRes) => {
    res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    res.status(502).send(`Live Deployment Proxy Error: ${err.message}`);
  });

  req.pipe(proxyReq);
});

// -------------------------------------------------------------
// REST API ENDPOINTS
// -------------------------------------------------------------

// 1. Auth APIs
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    const user = await db.createUser(email, password, name || email.split('@')[0]);
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = db.getUserByEmail(email);
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
  res.json({
    token,
    user: { id: user.id, email: user.email, name: user.name, agentToken: user.agentToken },
  });
});

app.get('/api/auth/me', authenticate, (req: any, res) => {
  res.json({ user: req.user });
});

// 2. Localhost Agent & Tunnels API
app.post('/api/tunnels/probe', authenticate, async (req: any, res) => {
  const { port = 3000, path = '/' } = req.body;
  const result = await AgentTunnelServer.probeLocalhost({
    userId: req.user.id,
    agentToken: req.user.agentToken,
    port: parseInt(port, 10),
    urlPath: path,
  });
  res.json(result);
});

app.get('/api/tunnels/status', authenticate, (req: any, res) => {
  const isConnected = AgentTunnelServer.isAgentConnected(req.user.agentToken);
  res.json({
    connected: isConnected,
    agentToken: req.user.agentToken,
    connectCommand: `launchflow connect 3000`,
  });
});

// 3. Repositories API
app.get('/api/repositories', authenticate, (req: any, res) => {
  const repos = db.getRepositoriesByUser(req.user.id);
  // If empty, provide standard mock/connected repositories for immediate selection
  if (repos.length === 0) {
    const demoRepos = [
      { name: 'my-portfolio', fullName: 'user/my-portfolio', defaultBranch: 'main', sourceType: 'github' },
      { name: 'ecommerce-store', fullName: 'user/ecommerce-store', defaultBranch: 'main', sourceType: 'github' },
      { name: 'saas-dashboard', fullName: 'user/saas-dashboard', defaultBranch: 'main', sourceType: 'github' },
    ];
    for (const r of demoRepos) {
      db.createRepository(req.user.id, r);
    }
  }
  res.json(db.getRepositoriesByUser(req.user.id));
});

app.post('/api/repositories', authenticate, (req: any, res) => {
  const repo = db.createRepository(req.user.id, req.body);
  res.json(repo);
});

// 4. Projects API
app.get('/api/projects', authenticate, (req: any, res) => {
  const projects = db.getProjectsByUser(req.user.id);
  res.json(projects);
});

app.post('/api/projects', authenticate, (req: any, res) => {
  try {
    const project = db.createProject(req.user.id, req.body);
    res.status(201).json(project);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/projects/:id', authenticate, (req: any, res) => {
  const project = db.getProjectById(req.params.id, req.user.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  res.json(project);
});

app.patch('/api/projects/:id', authenticate, (req: any, res) => {
  try {
    const updated = db.updateProject(req.params.id, req.body, req.user.id);
    res.json(updated);
  } catch (err: any) {
    res.status(403).json({ error: err.message });
  }
});

app.delete('/api/projects/:id', authenticate, (req: any, res) => {
  try {
    db.deleteProject(req.params.id, req.user.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(403).json({ error: err.message });
  }
});

// 5. Source Code Analysis API
app.post('/api/projects/analyze', authenticate, async (req: any, res) => {
  const { path: sourcePath } = req.body;
  // Default to current workspace if not specified
  const targetDir = sourcePath || process.cwd();
  try {
    const analysis = await ProjectAnalyzer.analyze(targetDir);
    res.json(analysis);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 6. Environment Variables API
app.get('/api/projects/:id/environment', authenticate, (req: any, res) => {
  const project = db.getProjectById(req.params.id, req.user.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  const reveal = req.query.reveal === 'true';
  res.json(db.getEnvVarsByProject(req.params.id, reveal));
});

app.post('/api/projects/:id/environment', authenticate, (req: any, res) => {
  const project = db.getProjectById(req.params.id, req.user.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  const { key, value, category, isSecret } = req.body;
  if (!key) return res.status(400).json({ error: 'Variable key is required' });
  const env = db.setEnvVar(req.params.id, key, value || '', category, isSecret);
  res.json(env);
});

app.delete('/api/projects/:id/environment/:key', authenticate, (req: any, res) => {
  const project = db.getProjectById(req.params.id, req.user.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  db.deleteEnvVar(req.params.id, req.params.key);
  res.json({ success: true });
});

// 7. Builds & Executions API
app.post('/api/projects/:id/build', authenticate, async (req: any, res) => {
  const project = db.getProjectById(req.params.id, req.user.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  // Get or create active deployment
  let deployment = db.getDeploymentsByProject(project.id)[0];
  if (!deployment || deployment.status === 'live') {
    deployment = db.createDeployment(project.id, req.body.branch || 'main');
  }

  const build = db.createBuild(project.id, deployment.id);
  const envVars = db.getRawEnvMap(project.id);
  const sourcePath = req.body.sourcePath || process.cwd();

  // Run build asynchronously in background sandbox
  BuildSandbox.executeBuild({
    buildId: build.id,
    projectId: project.id,
    sourcePath,
    buildCommand: req.body.buildCommand || project.buildCommand,
    envVars,
  }).then(async (result) => {
    if (result.success) {
      // Automatically start preview upon successful build
      try {
        const preview = await PreviewManager.startPreview({
          projectId: project.id,
          deploymentId: deployment.id,
          sandboxDir: result.sandboxDir,
          startCommand: project.startCommand,
          framework: project.framework,
          envVars,
        });

        db.updateDeployment(deployment.id, {
          status: 'previewing',
          previewUrl: preview.previewUrl,
        });
      } catch (err) {
        console.error('Failed to start preview:', err);
      }
    }
  });

  res.status(202).json({
    buildId: build.id,
    deploymentId: deployment.id,
    status: 'pending',
  });
});

app.get('/api/builds/:id', authenticate, (req: any, res) => {
  const build = db.getBuildById(req.params.id);
  if (!build) return res.status(404).json({ error: 'Build not found' });
  const logs = db.getBuildLogs(req.params.id);
  res.json({ ...build, logs });
});

// 8. Previews API
app.get('/api/deployments/:id/preview', authenticate, (req: any, res) => {
  const preview = db.getPreviewByDeployment(req.params.id);
  if (!preview) return res.status(404).json({ error: 'Preview not found for this deployment' });
  res.json(preview);
});

// 9. Production Readiness Engine API
app.post('/api/projects/:id/readiness', authenticate, async (req: any, res) => {
  const project = db.getProjectById(req.params.id, req.user.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const deploymentId = req.body.deploymentId || project.currentDeploymentId;
  const preview = db.getPreviewByDeployment(deploymentId);

  if (!preview) {
    return res.status(400).json({ error: 'Cannot run readiness audit without an active preview environment.' });
  }

  const configuredEnvVars = db.getRawEnvMap(project.id);
  const latestBuild = db.getBuildsByDeployment(deploymentId)[0];
  const candidateSandbox = preview.sandboxDir || latestBuild?.sandboxDir || BuildSandbox.getSandboxDir(deploymentId);
  const targetDir = (candidateSandbox && fs.existsSync(candidateSandbox)) ? candidateSandbox : process.cwd();
  const sourceAnalysis = await ProjectAnalyzer.analyze(targetDir);

  const auditReport = await ReadinessEngine.runAudit({
    projectId: project.id,
    deploymentId,
    internalPort: preview.internalPort,
    sandboxDir: targetDir,
    configuredEnvVars,
    sourceAnalysis,
  });

  // Update deployment readiness score
  db.updateDeployment(deploymentId, {
    readinessScore: auditReport.totalScore,
    status: auditReport.passed ? 'ready' : 'previewing',
  });

  res.json(auditReport);
});

app.get('/api/projects/:id/readiness/history', authenticate, (req: any, res) => {
  const project = db.getProjectById(req.params.id, req.user.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  res.json(db.getReportsByProject(req.params.id));
});

// 10. Production Deployments API
app.post('/api/projects/:id/deploy', authenticate, async (req: any, res) => {
  const project = db.getProjectById(req.params.id, req.user.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const deploymentId = req.body.deploymentId || project.currentDeploymentId;
  const deployment = db.getDeploymentById(deploymentId);
  if (!deployment) return res.status(404).json({ error: 'Deployment not found' });

  const latestBuild = db.getBuildsByDeployment(deploymentId)[0];
  const preview = db.getPreviewByDeployment(deploymentId);
  const candidateSandbox = preview?.sandboxDir || latestBuild?.sandboxDir || BuildSandbox.getSandboxDir(deploymentId);
  const targetDir = (candidateSandbox && fs.existsSync(candidateSandbox)) ? candidateSandbox : process.cwd();

  const live = await DeploymentEngine.deploy({
    projectId: project.id,
    deploymentId,
    sandboxDir: targetDir,
    framework: project.framework,
    subdomain: project.subdomain,
  });

  res.json({
    success: true,
    productionUrl: live.productionUrl,
    deployment: db.getDeploymentById(deploymentId),
  });
});

app.get('/api/projects/:id/deployments', authenticate, (req: any, res) => {
  const project = db.getProjectById(req.params.id, req.user.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  res.json(db.getDeploymentsByProject(req.params.id));
});

app.post('/api/projects/:id/rollback', authenticate, async (req: any, res) => {
  const { targetDeploymentId } = req.body;
  try {
    const rolledBack = await DeploymentEngine.rollback(req.params.id, targetDeploymentId);
    res.json(rolledBack);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 11. Monitoring & Metrics API
app.get('/api/projects/:id/monitoring', authenticate, (req: any, res) => {
  const project = db.getProjectById(req.params.id, req.user.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  const metrics = db.getHealthMetrics(req.params.id);
  res.json(metrics);
});

// 12. Domains API
app.get('/api/projects/:id/domains', authenticate, (req: any, res) => {
  const project = db.getProjectById(req.params.id, req.user.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  res.json(db.getDomains(req.params.id));
});

app.post('/api/projects/:id/domains', authenticate, (req: any, res) => {
  const project = db.getProjectById(req.params.id, req.user.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  const { domain, isCustom } = req.body;
  const d = db.addDomain(req.params.id, domain, isCustom);
  res.json(d);
});

// Start Server
server.listen(PORT, async () => {
  console.log(`[LaunchFlow API] Server listening on http://localhost:${PORT}`);
  console.log(`[LaunchFlow API] WebSocket Server ready for agent tunnels and live logs`);

  // Restore live deployments across server restarts
  try {
    const projects = db.getAllProjects();
    for (const p of projects) {
      if (p.status === 'live' && p.currentDeploymentId) {
        const d = db.getDeploymentById(p.currentDeploymentId);
        if (d) {
          const builds = db.getBuildsByDeployment(d.id);
          const latestBuild = builds[0];
          if (latestBuild && latestBuild.sandboxDir && fs.existsSync(latestBuild.sandboxDir)) {
            await DeploymentEngine.deploy({
              projectId: p.id,
              deploymentId: d.id,
              sandboxDir: latestBuild.sandboxDir,
              framework: p.framework,
              subdomain: p.subdomain,
              apiBaseUrl: `http://localhost:${PORT}`,
            }).catch((err) => console.error(`[Restore] Failed to restore ${p.subdomain}:`, err.message));
            console.log(`[Restore] Restored live deployment for ${p.subdomain} at http://localhost:${PORT}/live/${p.subdomain}/`);
          }
        }
      }
    }
  } catch (err: any) {
    console.error('[Restore] Error restoring live instances:', err.message);
  }
});
