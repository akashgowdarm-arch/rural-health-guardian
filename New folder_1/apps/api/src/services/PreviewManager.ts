import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs';
import { spawn, ChildProcess } from 'node:child_process';
import { db } from '../db/database.ts';

interface RunningPreview {
  previewId: string;
  projectId: string;
  deploymentId: string;
  internalPort: number;
  process?: ChildProcess;
  httpServer?: http.Server;
  createdAt: number;
  sandboxDir: string;
}

export class PreviewManager {
  private static activePreviews: Map<string, RunningPreview> = new Map();
  private static nextPort = 51000;

  private static getAvailablePort(): number {
    const port = this.nextPort;
    this.nextPort = (this.nextPort + 1) % 59000;
    if (this.nextPort < 51000) this.nextPort = 51000;
    return port;
  }

  public static getPreview(previewId: string): RunningPreview | undefined {
    return this.activePreviews.get(previewId);
  }

  public static async startPreview(params: {
    projectId: string;
    deploymentId: string;
    sandboxDir: string;
    startCommand: string;
    framework: string;
    envVars: Record<string, string>;
    apiBaseUrl?: string;
  }): Promise<{ previewId: string; internalPort: number; previewUrl: string }> {
    const { projectId, deploymentId, sandboxDir, startCommand, framework, envVars, apiBaseUrl = 'http://localhost:4000' } = params;

    // Check if there is already an existing active preview for this deployment and clean it up
    const existingPrv = db.getPreviewByDeployment(deploymentId);
    if (existingPrv && this.activePreviews.has(existingPrv.id)) {
      this.stopPreview(existingPrv.id);
    }

    const internalPort = this.getAvailablePort();
    const previewId = 'prv_' + Math.random().toString(36).substring(2, 10);
    const previewUrl = `${apiBaseUrl}/preview/${previewId}/`;

    // Determine how to run the preview
    // Case A: React/Vite/Static with dist directory: serve directly with internal http server or static runner
    const distPath = path.join(sandboxDir, 'dist');
    const isStaticDist = (framework === 'react-vite' || framework === 'static-html') && fs.existsSync(distPath);

    if (isStaticDist) {
      // Create high-performance internal static server for preview
      const server = http.createServer((req, res) => {
        let reqPath = req.url?.split('?')[0] || '/';
        if (reqPath === '/' || !path.extname(reqPath)) {
          reqPath = '/index.html';
        }
        const filePath = path.join(distPath, reqPath.replace(/^\//, ''));
        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
          const ext = path.extname(filePath).toLowerCase();
          const mimeTypes: Record<string, string> = {
            '.html': 'text/html',
            '.js': 'application/javascript',
            '.css': 'text/css',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.svg': 'image/svg+xml',
            '.woff2': 'font/woff2',
          };
          res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
          fs.createReadStream(filePath).pipe(res);
        } else {
          // Fallback to index.html for SPA client-side routing
          const fallback = path.join(distPath, 'index.html');
          if (fs.existsSync(fallback)) {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            fs.createReadStream(fallback).pipe(res);
          } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found in Preview');
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

      this.activePreviews.set(previewId, {
        previewId,
        projectId,
        deploymentId,
        internalPort: allocatedPort,
        httpServer: server,
        createdAt: Date.now(),
        sandboxDir,
      });
      db.createPreview(projectId, deploymentId, allocatedPort, previewUrl, undefined, sandboxDir);
      return { previewId, internalPort: allocatedPort, previewUrl };
    } else {
      // Case B: Node.js / Next.js app running start command
      const isWin = process.platform === 'win32';
      const shell = isWin ? 'cmd.exe' : '/bin/sh';
      const shellArgs = isWin ? ['/c', startCommand] : ['-c', startCommand];

      const child = spawn(shell, shellArgs, {
        cwd: sandboxDir,
        env: {
          ...process.env,
          ...envVars,
          PORT: String(internalPort),
          NODE_ENV: 'production',
        },
        windowsHide: true,
      });

      this.activePreviews.set(previewId, {
        previewId,
        projectId,
        deploymentId,
        internalPort,
        process: child,
        createdAt: Date.now(),
        sandboxDir,
      });

      // Poll until port is responding (up to 15s)
      await this.waitForPort(internalPort, 15000);
    }

    db.createPreview(projectId, deploymentId, internalPort, previewUrl, undefined, sandboxDir);
    return { previewId, internalPort, previewUrl };
  }

  public static stopPreview(previewId: string): boolean {
    const running = this.activePreviews.get(previewId);
    if (!running) return false;

    if (running.httpServer) {
      running.httpServer.close();
    }
    if (running.process) {
      try {
        running.process.kill('SIGTERM');
      } catch (err) {
        // Ignore kill errors
      }
    }
    this.activePreviews.delete(previewId);
    return true;
  }

  private static async waitForPort(port: number, timeoutMs: number): Promise<boolean> {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const ready = await new Promise<boolean>((resolve) => {
        const req = http.get(`http://127.0.0.1:${port}/`, (res) => {
          resolve(true);
        });
        req.on('error', () => resolve(false));
        req.setTimeout(1000, () => {
          req.destroy();
          resolve(false);
        });
      });
      if (ready) return true;
      await new Promise((r) => setTimeout(r, 400));
    }
    return false;
  }
}
