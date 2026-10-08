import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs';
import { db } from '../db/database.ts';

interface LiveInstance {
  projectId: string;
  deploymentId: string;
  subdomain: string;
  internalPort: number;
  server?: http.Server;
  createdAt: number;
}

export class DeploymentEngine {
  private static liveInstances: Map<string, LiveInstance> = new Map(); // keyed by subdomain and projectId
  private static nextPort = 53000;

  private static getAvailablePort(): number {
    const port = this.nextPort;
    this.nextPort = (this.nextPort + 1) % 59000;
    if (this.nextPort < 53000) this.nextPort = 53000;
    return port;
  }

  public static getLiveInstance(identifier: string): LiveInstance | undefined {
    return this.liveInstances.get(identifier);
  }

  public static async deploy(params: {
    projectId: string;
    deploymentId: string;
    sandboxDir: string;
    framework: string;
    subdomain: string;
    apiBaseUrl?: string;
  }): Promise<{ productionUrl: string; internalPort: number }> {
    const { projectId, deploymentId, sandboxDir, framework, subdomain, apiBaseUrl = 'http://localhost:4000' } = params;

    // 1. Stage: Preparing & Validating
    db.updateDeployment(deploymentId, { status: 'deploying' });
    db.updateProject(projectId, { status: 'deploying' });

    // Stop previous live instance for this project if running
    const prevInstance = this.liveInstances.get(subdomain) || this.liveInstances.get(projectId);
    if (prevInstance && prevInstance.server) {
      try {
        prevInstance.server.close();
      } catch (e) {}
    }

    // 2. Stage: Creating production server & routing
    const internalPort = this.getAvailablePort();
    const productionUrl = `${apiBaseUrl}/live/${subdomain}/`;

    const distPath = path.join(sandboxDir, 'dist');
    const hasDist = fs.existsSync(distPath);
    const rootPath = hasDist ? distPath : sandboxDir;

    // Create production static & SPA reverse-routed server
    const server = http.createServer((req, res) => {
      let reqPath = req.url?.split('?')[0] || '/';
      if (reqPath === '/' || !path.extname(reqPath)) {
        reqPath = '/index.html';
      }
      const filePath = path.join(rootPath, reqPath.replace(/^\//, ''));
      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath).toLowerCase();
        const mimeTypes: Record<string, string> = {
          '.html': 'text/html; charset=utf-8',
          '.js': 'application/javascript; charset=utf-8',
          '.css': 'text/css; charset=utf-8',
          '.json': 'application/json; charset=utf-8',
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
          '.svg': 'image/svg+xml',
          '.woff2': 'font/woff2',
        };
        res.writeHead(200, {
          'Content-Type': mimeTypes[ext] || 'application/octet-stream',
          'X-Powered-By': 'LaunchFlow Production Engine',
          'X-Content-Type-Options': 'nosniff',
        });
        fs.createReadStream(filePath).pipe(res);
      } else {
        const fallback = path.join(rootPath, 'index.html');
        if (fs.existsSync(fallback)) {
          res.writeHead(200, {
            'Content-Type': 'text/html; charset=utf-8',
            'X-Powered-By': 'LaunchFlow Production Engine',
            'X-Content-Type-Options': 'nosniff',
          });
          fs.createReadStream(fallback).pipe(res);
        } else {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('404 Not Found');
        }
      }
    });

    let allocatedPort = internalPort;
    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', () => {
        allocatedPort = (server.address() as any).port;
        resolve();
      });
    });

    const instance: LiveInstance = {
      projectId,
      deploymentId,
      subdomain,
      internalPort: allocatedPort,
      server,
      createdAt: Date.now(),
    };

    this.liveInstances.set(subdomain, instance);
    this.liveInstances.set(projectId, instance);

    // Initial Health Check
    const startHealth = Date.now();
    const isHealthy = await new Promise<boolean>((resolve) => {
      const checkReq = http.get(`http://127.0.0.1:${internalPort}/`, (res) => {
        resolve(res.statusCode === 200);
      });
      checkReq.on('error', () => resolve(false));
      checkReq.setTimeout(2000, () => resolve(false));
    });

    db.recordHealthCheck(projectId, deploymentId, {
      statusCode: isHealthy ? 200 : 503,
      responseTimeMs: Date.now() - startHealth,
      isHealthy,
    });

    // Mark deployment and project LIVE
    db.updateDeployment(deploymentId, {
      status: 'live',
      productionUrl,
      liveAt: new Date().toISOString(),
    });

    db.updateProject(projectId, {
      status: 'live',
      currentDeploymentId: deploymentId,
      subdomain,
    });

    // Ensure default domain registered
    db.addDomain(projectId, `${subdomain}.launchflow.app`, false);

    return { productionUrl, internalPort };
  }

  public static async rollback(projectId: string, targetDeploymentId: string, apiBaseUrl?: string) {
    const deployment = db.getDeploymentById(targetDeploymentId);
    if (!deployment || deployment.projectId !== projectId) {
      throw new Error('Target deployment not found');
    }
    const project = db.getProjectById(projectId);
    if (!project) throw new Error('Project not found');

    const sandboxDir = path.resolve(process.cwd(), 'data', 'sandboxes', targetDeploymentId);
    return this.deploy({
      projectId,
      deploymentId: targetDeploymentId,
      sandboxDir,
      framework: project.framework,
      subdomain: project.subdomain,
      apiBaseUrl,
    });
  }
}
