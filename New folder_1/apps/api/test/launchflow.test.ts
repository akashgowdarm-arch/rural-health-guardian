import { test } from 'node:test';
import assert from 'node:assert';
import path from 'node:path';
import fs from 'node:fs';

import { db } from '../src/db/database.ts';
import { ProjectAnalyzer } from '../src/services/ProjectAnalyzer.ts';
import { BuildSandbox } from '../src/services/BuildSandbox.ts';
import { PreviewManager } from '../src/services/PreviewManager.ts';
import { ReadinessEngine } from '../src/services/ReadinessEngine.ts';
import { DeploymentEngine } from '../src/services/DeploymentEngine.ts';
import { AgentTunnelServer } from '../src/services/AgentTunnelServer.ts';
import { IntelligentExplanationEngine } from '../src/services/IntelligentExplanationEngine.ts';

const FIXTURES_DIR = path.resolve(process.cwd(), 'test-fixtures');

test('Test 1 — Working project: full pipeline to live', async () => {
  const workingPath = path.join(FIXTURES_DIR, 'working-app');

  // 1. Project Analysis
  const analysis = await ProjectAnalyzer.analyze(workingPath);
  assert.strictEqual(analysis.buildCommand, 'npm run build');

  // 2. Build in Isolated Sandbox
  const user = db.getUserByEmail('demo@launchflow.app')!;
  const project = db.createProject(user.id, {
    name: 'Production Working App',
    buildCommand: 'node build.js',
    startCommand: 'echo "Started"',
    framework: 'static-html',
  });
  const deployment = db.createDeployment(project.id, 'main');
  const build = db.createBuild(project.id, deployment.id);

  const buildResult = await BuildSandbox.executeBuild({
    buildId: build.id,
    projectId: project.id,
    sourcePath: workingPath,
    buildCommand: 'node build.js',
    envVars: {},
  });

  assert.strictEqual(buildResult.success, true);
  assert.strictEqual(fs.existsSync(path.join(buildResult.sandboxDir, 'dist', 'index.html')), true);

  // 3. Isolated Preview
  const preview = await PreviewManager.startPreview({
    projectId: project.id,
    deploymentId: deployment.id,
    sandboxDir: buildResult.sandboxDir,
    startCommand: 'echo "Started"',
    framework: 'static-html',
    envVars: {},
  });

  assert.ok(preview.previewUrl.includes('/preview/prv_'));

  // 4. Production Readiness Engine Audit
  const audit = await ReadinessEngine.runAudit({
    projectId: project.id,
    deploymentId: deployment.id,
    internalPort: preview.internalPort,
    sandboxDir: buildResult.sandboxDir,
    configuredEnvVars: {},
    sourceAnalysis: analysis,
  });

  assert.ok(audit.totalScore >= 80, `Expected score >= 80, got ${audit.totalScore}`);
  assert.strictEqual(audit.passed, true);

  // 5. Deploy Live
  const live = await DeploymentEngine.deploy({
    projectId: project.id,
    deploymentId: deployment.id,
    sandboxDir: buildResult.sandboxDir,
    framework: 'static-html',
    subdomain: project.subdomain,
  });

  assert.ok(live.productionUrl.includes(`/live/${project.subdomain}/`));

  // Clean up preview
  PreviewManager.stopPreview(preview.previewId);
});

test('Test 2 — Broken build: failure and intelligent explanation', async () => {
  const brokenPath = path.join(FIXTURES_DIR, 'broken-build');
  const user = db.getUserByEmail('demo@launchflow.app')!;
  const project = db.createProject(user.id, {
    name: 'Broken Build Project',
    buildCommand: 'node build.js',
    framework: 'nextjs',
  });
  const deployment = db.createDeployment(project.id, 'main');
  const build = db.createBuild(project.id, deployment.id);

  const result = await BuildSandbox.executeBuild({
    buildId: build.id,
    projectId: project.id,
    sourcePath: brokenPath,
    buildCommand: 'node build.js',
    envVars: {},
  });

  assert.strictEqual(result.success, false);
  const updatedBuild = db.getBuildById(build.id);
  assert.ok(updatedBuild.errorExplanation);
  assert.strictEqual(updatedBuild.errorExplanation.code, 'MODULE_NOT_FOUND');
  assert.ok(updatedBuild.errorExplanation.whatHappened.includes('@auth/nextjs'));
});

test('Test 3 — Missing environment variable: detection and fix-retest loop', async () => {
  const missingEnvPath = path.join(FIXTURES_DIR, 'missing-env');

  // 1. Analyze: Should detect DATABASE_URL and STRIPE_SECRET_KEY
  const analysis = await ProjectAnalyzer.analyze(missingEnvPath);
  const detectedKeys = analysis.detectedEnvVars.map(v => v.key);
  assert.ok(detectedKeys.includes('DATABASE_URL'));
  assert.ok(detectedKeys.includes('STRIPE_SECRET_KEY'));

  const dbVar = analysis.detectedEnvVars.find(v => v.key === 'DATABASE_URL')!;
  assert.strictEqual(dbVar.category, 'required');

  // 2. Audit without env vars configured -> must fail
  const user = db.getUserByEmail('demo@launchflow.app')!;
  const project = db.createProject(user.id, { name: 'Env Dependent App' });
  const deployment = db.createDeployment(project.id, 'main');

  const auditWithout = await ReadinessEngine.runAudit({
    projectId: project.id,
    deploymentId: deployment.id,
    internalPort: 54321, // dummy
    sandboxDir: missingEnvPath,
    configuredEnvVars: {},
    sourceAnalysis: analysis,
  });

  const missingIssue = auditWithout.issues.find(i => i.category === 'env_vars');
  assert.ok(missingIssue, 'Readiness engine must flag missing env vars');
  assert.ok(missingIssue.message.includes('DATABASE_URL'));

  // 3. User fixes it by configuring DATABASE_URL
  db.setEnvVar(project.id, 'DATABASE_URL', 'postgresql://cloud.supabase.co:5432/mydb', 'required', true);
  const configuredMap = db.getRawEnvMap(project.id);
  assert.strictEqual(configuredMap['DATABASE_URL'], 'postgresql://cloud.supabase.co:5432/mydb');

  // 4. Retest -> Env check now passes
  const auditWith = await ReadinessEngine.runAudit({
    projectId: project.id,
    deploymentId: deployment.id,
    internalPort: 54321,
    sandboxDir: missingEnvPath,
    configuredEnvVars: configuredMap,
    sourceAnalysis: analysis,
  });

  const envCheck = auditWith.checks.find(c => c.category === 'env_vars');
  assert.strictEqual(envCheck?.passed, true);
});

test('Test 4 — Localhost API URL leak: detection and production blocker', async () => {
  const leakPath = path.join(FIXTURES_DIR, 'localhost-leak');
  const user = db.getUserByEmail('demo@launchflow.app')!;
  const project = db.createProject(user.id, { name: 'Leak Project' });
  const deployment = db.createDeployment(project.id, 'main');
  const build = db.createBuild(project.id, deployment.id);

  const buildResult = await BuildSandbox.executeBuild({
    buildId: build.id,
    projectId: project.id,
    sourcePath: leakPath,
    buildCommand: 'node build.js',
    envVars: {},
  });

  const preview = await PreviewManager.startPreview({
    projectId: project.id,
    deploymentId: deployment.id,
    sandboxDir: buildResult.sandboxDir,
    startCommand: 'echo "Started"',
    framework: 'static-html',
    envVars: {},
  });

  const audit = await ReadinessEngine.runAudit({
    projectId: project.id,
    deploymentId: deployment.id,
    internalPort: preview.internalPort,
    sandboxDir: buildResult.sandboxDir,
    configuredEnvVars: {},
  });

  const leakIssue = audit.issues.find(i => i.category === 'localhost_leak');
  assert.ok(leakIssue, 'Expected localhost leak issue');
  assert.strictEqual(leakIssue.severity, 'critical');
  assert.ok(leakIssue.message.includes('localhost'));

  PreviewManager.stopPreview(preview.previewId);
});

test('Test 5 — Wrong localhost port: connection refusal and explanation', async () => {
  const user = db.getUserByEmail('demo@launchflow.app')!;
  // Probe port 59999 which is unlikely to have any service running
  const probe = await AgentTunnelServer.probeLocalhost({
    userId: user.id,
    agentToken: user.agentToken,
    port: 59999,
  });

  assert.strictEqual(probe.reachable, false);
  assert.ok(probe.details?.includes('Could not connect') || probe.details?.includes('ECONNREFUSED'));
});

test('Test 6 — Cross-user authorization: User A cannot access User B resources', async () => {
  // Create User A and User B with unique test timestamps
  const ts = Date.now();
  const userA = await db.createUser(`usera_${ts}@test.com`, 'PassA123!', 'User Alpha');
  const userB = await db.createUser(`userb_${ts}@test.com`, 'PassB123!', 'User Beta');

  // User A creates a project with secret env var
  const projA = db.createProject(userA.id, { name: 'Alpha Secret Project' });
  db.setEnvVar(projA.id, 'STRIPE_SECRET', 'sk_live_alpha_secret_key', 'secret', true);

  // User B tries to read project A
  const accessedByB = db.getProjectById(projA.id, userB.id);
  assert.strictEqual(accessedByB, null, 'User B must not be able to get User A project');

  // User B tries to update project A
  assert.throws(() => {
    db.updateProject(projA.id, { name: 'Hacked by B' }, userB.id);
  }, /Unauthorized/);

  // User B tries to delete project A
  assert.throws(() => {
    db.deleteProject(projA.id, userB.id);
  }, /Unauthorized/);
});

test('Test 7 — Broken API: preview 500 error detection and readiness failure', async () => {
  const user = db.getUserByEmail('demo@launchflow.app')!;
  const project = db.createProject(user.id, { name: 'Broken API App' });
  const deployment = db.createDeployment(project.id, 'main');

  // Spawn an internal server where / returns 200, but /api/health returns 500
  const http = await import('node:http');
  const server = http.createServer((req, res) => {
    if (req.url === '/api/health') {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Database connection failed: ECONNREFUSED' }));
    } else {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end('<h1>Broken API Frontend</h1>');
    }
  });

  let port = 0;
  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      port = (server.address() as any).port;
      resolve();
    });
  });

  const audit = await ReadinessEngine.runAudit({
    projectId: project.id,
    deploymentId: deployment.id,
    internalPort: port,
    sandboxDir: FIXTURES_DIR,
    configuredEnvVars: {},
  });

  const apiCheck = audit.checks.find(c => c.category === 'api');
  assert.ok(apiCheck);
  assert.strictEqual(apiCheck.passed, false, 'API check must fail when /api/health returns 500');

  const apiIssue = audit.issues.find(i => i.category === 'api');
  assert.ok(apiIssue);
  assert.strictEqual(apiIssue.severity, 'critical');

  server.close();
});

test('Test 8 — Project in Current Directory / OneDrive: isolated sandbox creation outside project without recursive self-copy error', async () => {
  const user = db.getUserByEmail('demo@launchflow.app')!;
  const project = db.createProject(user.id, {
    name: 'OneDrive Root App',
    buildCommand: 'echo "Built in external sandbox" > build.output',
  });
  const deployment = db.createDeployment(project.id, 'main');
  const build = db.createBuild(project.id, deployment.id);

  // Test with a directory that could be in OneDrive or the project source itself
  const sourceDir = path.join(FIXTURES_DIR, 'working-app');

  const result = await BuildSandbox.executeBuild({
    buildId: build.id,
    projectId: project.id,
    sourcePath: sourceDir,
    buildCommand: 'echo "Built in external sandbox" > build.output',
    envVars: {},
  });

  // Verify build succeeded
  assert.strictEqual(result.success, true);
  assert.ok(result.sandboxDir);

  // CRITICAL ASSERTION: Sandbox must NEVER be inside the source project directory
  const relFromSource = path.relative(path.resolve(sourceDir).toLowerCase(), path.resolve(result.sandboxDir).toLowerCase());
  const isInsideSource = !relFromSource.startsWith('..') && !path.isAbsolute(relFromSource);
  assert.strictEqual(isInsideSource, false, 'Sandbox directory must not be inside source directory');

  // Verify that data/sandboxes was NOT created inside the source project
  assert.strictEqual(fs.existsSync(path.join(process.cwd(), 'data', 'sandboxes')), false, 'data/sandboxes must not exist inside project root');

  // Verify build output exists in external sandbox
  assert.strictEqual(fs.existsSync(path.join(result.sandboxDir, 'build.output')), true);

  // Clean up test sandbox
  try {
    fs.rmSync(result.sandboxDir, { recursive: true, force: true });
  } catch (e) {}
});

