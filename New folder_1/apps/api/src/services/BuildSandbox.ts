import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawn } from 'node:child_process';
import { db } from '../db/database.ts';
import { IntelligentExplanationEngine } from './IntelligentExplanationEngine.ts';

export class BuildSandbox {
  private static logEmitter: ((buildId: string, log: any) => void) | null = null;

  public static setLogEmitter(emitter: (buildId: string, log: any) => void) {
    this.logEmitter = emitter;
  }

  private static emitLog(buildId: string, level: 'info' | 'warn' | 'error' | 'stdout' | 'stderr', message: string) {
    const log = db.addBuildLog(buildId, level, message);
    if (this.logEmitter) {
      this.logEmitter(buildId, log);
    }
  }

  /**
   * Returns a safe base directory for build sandboxes that is guaranteed
   * to be OUTSIDE of the project source repository (avoiding recursive self-copying).
   */
  public static getSandboxBaseDir(sourcePath?: string): string {
    const candidates: string[] = [];

    if (process.env.LAUNCHFLOW_SANDBOX_DIR) {
      candidates.push(path.resolve(process.env.LAUNCHFLOW_SANDBOX_DIR));
    }

    if (process.platform === 'win32') {
      candidates.push('C:\\LaunchFlow\\sandboxes');
    }

    candidates.push(path.join(os.tmpdir(), 'launchflow', 'sandboxes'));

    if (sourcePath) {
      const parentDir = path.dirname(path.resolve(sourcePath));
      candidates.push(path.join(parentDir, '.launchflow_sandboxes'));
    }

    const resolvedSource = sourcePath ? path.resolve(sourcePath).toLowerCase() : null;

    for (const candidate of candidates) {
      try {
        const resolvedCandidate = path.resolve(candidate).toLowerCase();

        // Ensure candidate is NEVER inside sourcePath, nor identical to sourcePath
        if (resolvedSource) {
          const relFromSource = path.relative(resolvedSource, resolvedCandidate);
          const isInsideSource = !relFromSource.startsWith('..') && !path.isAbsolute(relFromSource);
          if (isInsideSource || resolvedCandidate === resolvedSource) {
            continue;
          }

          // Also ensure sourcePath is not inside candidate
          const relFromCandidate = path.relative(resolvedCandidate, resolvedSource);
          const isSourceInside = !relFromCandidate.startsWith('..') && !path.isAbsolute(relFromCandidate);
          if (isSourceInside) {
            continue;
          }
        }

        if (!fs.existsSync(candidate)) {
          fs.mkdirSync(candidate, { recursive: true });
        }

        // Test write permissions
        const probeFile = path.join(candidate, `.probe_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`);
        fs.writeFileSync(probeFile, 'ok');
        fs.unlinkSync(probeFile);

        return path.resolve(candidate);
      } catch (err) {
        // Candidate not usable, try next
      }
    }

    // Fallback to timestamped tmpdir
    const fallback = path.join(os.tmpdir(), `launchflow_sandboxes_${Date.now()}`);
    fs.mkdirSync(fallback, { recursive: true });
    return fallback;
  }

  public static getSandboxDir(id: string, sourcePath?: string): string {
    const base = this.getSandboxBaseDir(sourcePath);
    return path.join(base, id);
  }

  public static async executeBuild(params: {
    buildId: string;
    projectId: string;
    sourcePath: string;
    buildCommand: string;
    envVars: Record<string, string>;
    timeoutMs?: number;
  }): Promise<{ success: boolean; sandboxDir: string; exitCode?: number; error?: string }> {
    const { buildId, projectId, sourcePath, buildCommand, envVars, timeoutMs = 120000 } = params;

    const sandboxDir = BuildSandbox.getSandboxDir(buildId, sourcePath);
    if (!fs.existsSync(sandboxDir)) {
      fs.mkdirSync(sandboxDir, { recursive: true });
    }

    db.updateBuild(buildId, { sandboxDir, status: 'installing', startedAt: new Date().toISOString() });
    this.emitLog(buildId, 'info', `[LaunchFlow Sandbox] Preparing isolated environment for build ${buildId} at ${sandboxDir}...`);

    // 1. Copy source files into isolated sandbox directory (excluding heavy/temp files)
    try {
      this.emitLog(buildId, 'info', `[LaunchFlow Sandbox] Copying source repository to isolated workspace...`);
      
      const resolvedSandbox = path.resolve(sandboxDir).toLowerCase();

      fs.cpSync(sourcePath, sandboxDir, {
        recursive: true,
        filter: (src) => {
          const rel = path.basename(src).toLowerCase();
          // Never copy VCS, logs, internal caches, or old sandbox directories
          if (['.git', 'coverage', '.system_generated', 'sandboxes', '.launchflow_sandboxes', 'node_modules'].includes(rel)) {
            return false;
          }
          // Never copy destination into itself
          const resolvedCurrent = path.resolve(src).toLowerCase();
          if (resolvedCurrent === resolvedSandbox || resolvedCurrent.startsWith(resolvedSandbox + path.sep)) {
            return false;
          }
          return true;
        },
      });

      // If source project had node_modules, link or copy into sandbox for build execution
      const srcNodeModules = path.join(sourcePath, 'node_modules');
      const dstNodeModules = path.join(sandboxDir, 'node_modules');
      if (fs.existsSync(srcNodeModules) && !fs.existsSync(dstNodeModules)) {
        try {
          if (process.platform === 'win32') {
            fs.symlinkSync(srcNodeModules, dstNodeModules, 'junction');
          } else {
            fs.symlinkSync(srcNodeModules, dstNodeModules, 'dir');
          }
        } catch (linkErr) {
          try {
            fs.cpSync(srcNodeModules, dstNodeModules, { recursive: true });
          } catch (cpErr) {}
        }
      }

      this.emitLog(buildId, 'info', `✓ Repository cloned into isolated sandbox: ${sandboxDir}`);
    } catch (err: any) {
      const msg = `Failed to create sandbox workspace: ${err.message}`;
      this.emitLog(buildId, 'error', msg);
      db.updateBuild(buildId, {
        status: 'failed',
        completedAt: new Date().toISOString(),
        errorSummary: msg,
        errorExplanation: IntelligentExplanationEngine.diagnose(msg),
      });
      return { success: false, sandboxDir, error: msg };
    }

    // 2. Prepare Sanitized Environment
    const sanitizedEnv: NodeJS.ProcessEnv = {
      PATH: process.env.PATH,
      NODE_ENV: 'production',
      CI: 'true',
      LAUNCHFLOW: '1',
      HOME: process.env.HOME || process.env.USERPROFILE,
      TMP: process.env.TMP,
      TEMP: process.env.TEMP,
      ...envVars,
    };

    // 3. Execute Build in isolated directory
    db.updateBuild(buildId, { status: 'building' });
    this.emitLog(buildId, 'info', `[LaunchFlow Sandbox] Running build command: "${buildCommand}"`);

    const startTime = Date.now();

    return new Promise((resolve) => {
      // Use shell invocation suitable for OS
      const isWin = process.platform === 'win32';
      const shell = isWin ? 'cmd.exe' : '/bin/sh';
      const shellArgs = isWin ? ['/c', buildCommand] : ['-c', buildCommand];

      let rawCombinedOutput = '';
      let timer: NodeJS.Timeout | null = null;
      let killed = false;

      const child = spawn(shell, shellArgs, {
        cwd: sandboxDir,
        env: sanitizedEnv,
        windowsHide: true,
      });

      if (timeoutMs > 0) {
        timer = setTimeout(() => {
          killed = true;
          this.emitLog(buildId, 'error', `✕ Build timed out after ${timeoutMs / 1000}s`);
          child.kill('SIGTERM');
        }, timeoutMs);
      }

      child.stdout.on('data', (data) => {
        const text = data.toString();
        rawCombinedOutput += text;
        const lines = text.split(/\r?\n/).filter((l: string) => l.trim().length > 0);
        for (const line of lines) {
          this.emitLog(buildId, 'stdout', line);
        }
      });

      child.stderr.on('data', (data) => {
        const text = data.toString();
        rawCombinedOutput += text;
        const lines = text.split(/\r?\n/).filter((l: string) => l.trim().length > 0);
        for (const line of lines) {
          this.emitLog(buildId, 'stderr', line);
        }
      });

      child.on('error', (err) => {
        if (timer) clearTimeout(timer);
        const durationMs = Date.now() - startTime;
        const explanation = IntelligentExplanationEngine.diagnose(err.message + '\n' + rawCombinedOutput);
        this.emitLog(buildId, 'error', `✕ Build execution error: ${err.message}`);
        db.updateBuild(buildId, {
          status: 'failed',
          completedAt: new Date().toISOString(),
          durationMs,
          errorSummary: err.message,
          errorExplanation: explanation,
        });
        resolve({ success: false, sandboxDir, error: err.message });
      });

      child.on('close', (code) => {
        if (timer) clearTimeout(timer);
        const durationMs = Date.now() - startTime;
        const exitCode = killed ? -1 : (code ?? 0);

        if (exitCode === 0) {
          this.emitLog(buildId, 'info', `✓ Build succeeded in ${(durationMs / 1000).toFixed(2)}s`);
          db.updateBuild(buildId, {
            status: 'succeeded',
            completedAt: new Date().toISOString(),
            exitCode: 0,
            durationMs,
          });
          resolve({ success: true, sandboxDir, exitCode: 0 });
        } else {
          this.emitLog(buildId, 'error', `✕ Build failed with exit code ${exitCode}`);
          const explanation = IntelligentExplanationEngine.diagnose(rawCombinedOutput);
          this.emitLog(buildId, 'warn', `[Diagnosis] ${explanation.title}: ${explanation.whatHappened}`);
          db.updateBuild(buildId, {
            status: 'failed',
            completedAt: new Date().toISOString(),
            exitCode,
            durationMs,
            errorSummary: `Process exited with code ${exitCode}`,
            errorExplanation: explanation,
          });
          resolve({ success: false, sandboxDir, exitCode, error: rawCombinedOutput });
        }
      });
    });
  }
}
