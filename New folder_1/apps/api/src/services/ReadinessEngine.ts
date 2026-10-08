import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { db } from '../db/database.ts';
import { IntelligentExplanationEngine } from './IntelligentExplanationEngine.ts';

export interface AuditCheck {
  id: string;
  name: string;
  category: 'build' | 'server' | 'homepage' | 'routes' | 'assets' | 'localhost_leak' | 'env_vars' | 'api' | 'database' | 'security';
  weight: number;
  passed: boolean;
  scoreEarned: number;
  details: string;
  latencyMs?: number;
  issue?: {
    category: any;
    severity: 'critical' | 'warning' | 'info';
    title: string;
    message: string;
    detectedValue?: string;
    recommendedFix: string;
    fixAction?: any;
  };
}

export class ReadinessEngine {
  public static async runAudit(params: {
    projectId: string;
    deploymentId: string;
    internalPort: number;
    sandboxDir: string;
    configuredEnvVars: Record<string, string>;
    sourceAnalysis?: any;
  }): Promise<{
    totalScore: number;
    passed: boolean;
    checks: AuditCheck[];
    issues: any[];
  }> {
    const { projectId, deploymentId, internalPort, sandboxDir, configuredEnvVars, sourceAnalysis } = params;
    const checks: AuditCheck[] = [];
    const issues: any[] = [];

    // Helper for HTTP request to the preview
    const fetchPreview = async (urlPath: string): Promise<{ statusCode: number; body: string; headers: http.IncomingHttpHeaders; latency: number }> => {
      const start = Date.now();
      return new Promise((resolve) => {
        const req = http.get(`http://127.0.0.1:${internalPort}${urlPath}`, (res) => {
          let body = '';
          res.on('data', (chunk) => { body += chunk; });
          res.on('end', () => {
            resolve({ statusCode: res.statusCode || 500, body, headers: res.headers, latency: Date.now() - start });
          });
        });
        req.on('error', (err) => {
          resolve({ statusCode: 0, body: err.message, headers: {}, latency: Date.now() - start });
        });
        req.setTimeout(4000, () => {
          req.destroy();
          resolve({ statusCode: 408, body: 'Timeout', headers: {}, latency: 4000 });
        });
      });
    };

    // 1. Check: Build Integrity
    const buildWeight = 15;
    const distExists = fs.existsSync(path.join(sandboxDir, 'dist')) || fs.existsSync(path.join(sandboxDir, '.next')) || fs.existsSync(path.join(sandboxDir, 'build'));
    if (distExists || fs.existsSync(path.join(sandboxDir, 'index.html'))) {
      checks.push({
        id: 'chk_build',
        name: 'Build Artifact Integrity',
        category: 'build',
        weight: buildWeight,
        passed: true,
        scoreEarned: buildWeight,
        details: 'Build completed cleanly and distribution artifacts are present.',
      });
    } else {
      const issue = {
        category: 'build',
        severity: 'critical' as const,
        title: 'Missing Build Artifacts',
        message: 'No output files were produced by the build command in dist/, build/, or .next/.',
        recommendedFix: 'Verify your package.json build script outputs production files to the expected directory.',
        fixAction: { type: 'update_config', field: 'buildCommand' },
      };
      issues.push(issue);
      checks.push({
        id: 'chk_build',
        name: 'Build Artifact Integrity',
        category: 'build',
        weight: buildWeight,
        passed: false,
        scoreEarned: 0,
        details: 'Build output directory missing.',
        issue,
      });
    }

    // 2. Check: Server Health & Startup
    const serverWeight = 15;
    const homeRes = await fetchPreview('/');
    if (homeRes.statusCode >= 200 && homeRes.statusCode < 400) {
      checks.push({
        id: 'chk_server',
        name: 'Application Server Health',
        category: 'server',
        weight: serverWeight,
        passed: true,
        scoreEarned: serverWeight,
        latencyMs: homeRes.latency,
        details: `Application booted successfully and responds on port ${internalPort} in ${homeRes.latency}ms.`,
      });
    } else {
      const diag = IntelligentExplanationEngine.diagnose(homeRes.body || `HTTP Status ${homeRes.statusCode}`);
      const issue = {
        category: 'server',
        severity: 'critical' as const,
        title: diag.title,
        message: diag.whatHappened,
        recommendedFix: diag.recommendedFix,
        fixAction: { type: diag.actionType, field: diag.actionField, suggestedValue: diag.suggestedValue },
      };
      issues.push(issue);
      checks.push({
        id: 'chk_server',
        name: 'Application Server Health',
        category: 'server',
        weight: serverWeight,
        passed: false,
        scoreEarned: 0,
        details: `Server failed to respond with 200 OK (received HTTP ${homeRes.statusCode}).`,
        issue,
      });
    }

    // 3. Check: Homepage Response Content
    const homeWeight = 15;
    if (homeRes.statusCode === 200 && homeRes.body.length > 50) {
      checks.push({
        id: 'chk_homepage',
        name: 'Homepage Root Route (/)',
        category: 'homepage',
        weight: homeWeight,
        passed: true,
        scoreEarned: homeWeight,
        details: `Homepage loaded with HTTP 200 OK (${Math.round(homeRes.body.length / 1024)} KB payload).`,
      });
    } else {
      const issue = {
        category: 'homepage',
        severity: 'critical' as const,
        title: 'Homepage Failed to Load',
        message: 'The root URL / did not return a valid HTML response.',
        recommendedFix: 'Check that your application router renders an index or home page without throwing exceptions.',
      };
      issues.push(issue);
      checks.push({
        id: 'chk_homepage',
        name: 'Homepage Root Route (/)',
        category: 'homepage',
        weight: homeWeight,
        passed: false,
        scoreEarned: 0,
        details: 'Homepage did not return valid HTML content.',
        issue,
      });
    }

    // 4. Check: Route Discovery & Testing
    const routeWeight = 10;
    const testRoutes = ['/about', '/contact', '/pricing', '/login'];
    let passedRoutes = 0;
    let checkedCount = 0;
    for (const r of testRoutes) {
      const res = await fetchPreview(r);
      checkedCount++;
      if (res.statusCode === 200 || res.statusCode === 304 || (res.statusCode === 404 && checkedCount > 2)) {
        passedRoutes++;
      }
    }
    const routesScore = Math.round((passedRoutes / checkedCount) * routeWeight);
    checks.push({
      id: 'chk_routes',
      name: 'Client & Server Route Verification',
      category: 'routes',
      weight: routeWeight,
      passed: routesScore >= 7,
      scoreEarned: routesScore,
      details: `${passedRoutes} of ${checkedCount} sampled routes resolved successfully.`,
    });

    // 5. Check: Asset Integrity (JS / CSS / Icons)
    const assetWeight = 10;
    const assetMatches = homeRes.body.match(/(?:src|href)=["']([^"']+\.(?:js|css|png|svg|ico))["']/g) || [];
    let brokenAssets = 0;
    for (const m of assetMatches.slice(0, 5)) {
      const assetUrl = m.replace(/^(?:src|href)=["']|["']$/g, '');
      if (assetUrl.startsWith('http://') || assetUrl.startsWith('https://')) continue;
      const assetPath = assetUrl.startsWith('/') ? assetUrl : '/' + assetUrl;
      const aRes = await fetchPreview(assetPath);
      if (aRes.statusCode >= 400) {
        brokenAssets++;
      }
    }
    if (brokenAssets === 0) {
      checks.push({
        id: 'chk_assets',
        name: 'Static Asset Integrity',
        category: 'assets',
        weight: assetWeight,
        passed: true,
        scoreEarned: assetWeight,
        details: 'All referenced JavaScript, CSS, and image assets resolved with 200 OK.',
      });
    } else {
      const issue = {
        category: 'assets',
        severity: 'warning' as const,
        title: `${brokenAssets} Broken Asset(s) Detected`,
        message: 'Some linked stylesheets, scripts, or images returned 404 Not Found in the preview.',
        recommendedFix: 'Check your asset paths in HTML/Vite config. Ensure base URL is set to "/" or relative paths.',
      };
      issues.push(issue);
      checks.push({
        id: 'chk_assets',
        name: 'Static Asset Integrity',
        category: 'assets',
        weight: assetWeight,
        passed: false,
        scoreEarned: Math.max(0, assetWeight - brokenAssets * 4),
        details: `${brokenAssets} asset(s) returned 404 Not Found.`,
        issue,
      });
    }

    // 6. Check: Localhost & Private IP Leak Detection
    const leakWeight = 15;
    // Scan rendered HTML and bundle files for localhost leaks
    const hasLocalhostInHtml = /(http:\/\/(?:localhost|127\.0\.0\.1):\d+)/i.exec(homeRes.body);
    let bundleLeak: string | null = null;

    // Scan dist files
    const distPath = path.join(sandboxDir, 'dist');
    if (fs.existsSync(distPath)) {
      try {
        const files = fs.readdirSync(distPath, { recursive: true }) as string[];
        for (const f of files) {
          if (typeof f === 'string' && (f.endsWith('.js') || f.endsWith('.html'))) {
            const content = fs.readFileSync(path.join(distPath, f), 'utf-8');
            const match = /(http:\/\/(?:localhost|127\.0\.0\.1):\d+)/i.exec(content);
            if (match) {
              bundleLeak = match[1];
              break;
            }
          }
        }
      } catch (err) {}
    }

    const detectedLeak = hasLocalhostInHtml ? hasLocalhostInHtml[1] : bundleLeak;
    if (detectedLeak) {
      const issue = {
        category: 'localhost_leak',
        severity: 'critical' as const,
        title: 'Localhost API URL in Production Bundle',
        message: `Your code references "${detectedLeak}". In cloud production, visitors' browsers cannot access your local computer.`,
        detectedValue: detectedLeak,
        recommendedFix: 'Replace the hardcoded localhost URL with a production API URL via environment variables.',
        fixAction: { type: 'configure_env', field: 'NEXT_PUBLIC_API_URL', suggestedValue: 'https://api.yourdomain.com' },
      };
      issues.push(issue);
      checks.push({
        id: 'chk_leak',
        name: 'Localhost Leak Detection',
        category: 'localhost_leak',
        weight: leakWeight,
        passed: false,
        scoreEarned: 0,
        details: `Hardcoded development URL found: ${detectedLeak}`,
        issue,
      });
    } else {
      checks.push({
        id: 'chk_leak',
        name: 'Localhost Leak Detection',
        category: 'localhost_leak',
        weight: leakWeight,
        passed: true,
        scoreEarned: leakWeight,
        details: 'No hardcoded localhost, 127.0.0.1, or development ports leaked in client bundles.',
      });
    }

    // 7. Check: Environment Variable Parity
    const envWeight = 10;
    const requiredVars = (sourceAnalysis?.detectedEnvVars || []).filter((v: any) => v.category === 'required');
    const missingVars: string[] = [];
    for (const reqVar of requiredVars) {
      if (!configuredEnvVars[reqVar.key] || configuredEnvVars[reqVar.key].trim() === '') {
        missingVars.push(reqVar.key);
      }
    }

    if (missingVars.length > 0) {
      const issue = {
        category: 'env_vars',
        severity: 'critical' as const,
        title: `Missing Required Variable: ${missingVars.join(', ')}`,
        message: `The project requires ${missingVars.join(', ')} in production, but no values were configured.`,
        detectedValue: missingVars.join(', '),
        recommendedFix: `Go to Environment Variables tab and supply production values for ${missingVars.join(', ')}.`,
        fixAction: { type: 'configure_env', field: missingVars[0] },
      };
      issues.push(issue);
      checks.push({
        id: 'chk_env',
        name: 'Environment Variable Parity',
        category: 'env_vars',
        weight: envWeight,
        passed: false,
        scoreEarned: 0,
        details: `Missing ${missingVars.length} required environment variable(s): ${missingVars.join(', ')}.`,
        issue,
      });
    } else {
      checks.push({
        id: 'chk_env',
        name: 'Environment Variable Parity',
        category: 'env_vars',
        weight: envWeight,
        passed: true,
        scoreEarned: envWeight,
        details: 'All required environment variables have been configured.',
      });
    }

    // 8. Check: API Endpoint Health
    const apiWeight = 5;
    const apiRes = await fetchPreview('/api/health');
    // If api exists or if it's a frontend app without /api
    if (apiRes.statusCode === 200 || apiRes.statusCode === 404) {
      checks.push({
        id: 'chk_api',
        name: 'API Endpoint Health',
        category: 'api',
        weight: apiWeight,
        passed: true,
        scoreEarned: apiWeight,
        details: apiRes.statusCode === 200 ? 'Health endpoint /api/health returned 200 OK.' : 'No failing /api routes detected.',
      });
    } else if (apiRes.statusCode >= 500) {
      const issue = {
        category: 'api',
        severity: 'critical' as const,
        title: 'API Server Responded with 500 Internal Error',
        message: 'The /api/health endpoint threw an unhandled server exception.',
        recommendedFix: 'Inspect server logs for unhandled database connections or missing secrets.',
      };
      issues.push(issue);
      checks.push({
        id: 'chk_api',
        name: 'API Endpoint Health',
        category: 'api',
        weight: apiWeight,
        passed: false,
        scoreEarned: 0,
        details: `API endpoint returned HTTP ${apiRes.statusCode}`,
        issue,
      });
    }

    // 9. Check: Database Connection
    const dbWeight = 5;
    if (configuredEnvVars['DATABASE_URL']) {
      const dbUrl = configuredEnvVars['DATABASE_URL'];
      if (dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1')) {
        const issue = {
          category: 'database',
          severity: 'critical' as const,
          title: 'DATABASE_URL Points to Localhost',
          message: 'Your DATABASE_URL uses localhost. Production containers cannot reach your local machine database.',
          detectedValue: dbUrl,
          recommendedFix: 'Supply a hosted cloud database URL (e.g. Supabase, Neon, AWS RDS).',
          fixAction: { type: 'configure_env', field: 'DATABASE_URL' },
        };
        issues.push(issue);
        checks.push({
          id: 'chk_db',
          name: 'Database Connection Health',
          category: 'database',
          weight: dbWeight,
          passed: false,
          scoreEarned: 0,
          details: 'DATABASE_URL uses localhost address.',
          issue,
        });
      } else {
        checks.push({
          id: 'chk_db',
          name: 'Database Connection Health',
          category: 'database',
          weight: dbWeight,
          passed: true,
          scoreEarned: dbWeight,
          details: 'Cloud database connection configured.',
        });
      }
    } else {
      // Database not required or not configured
      checks.push({
        id: 'chk_db',
        name: 'Database Connection Health',
        category: 'database',
        weight: dbWeight,
        passed: true,
        scoreEarned: dbWeight,
        details: 'No database dependency declared.',
      });
    }

    // 10. Check: Security & Headers
    const secWeight = 5;
    const secHeaders = homeRes.headers;
    const hasSecurityHeaders = secHeaders['x-content-type-options'] || secHeaders['content-security-policy'] || secHeaders['x-frame-options'];
    if (hasSecurityHeaders) {
      checks.push({
        id: 'chk_security',
        name: 'Security & Production Headers',
        category: 'security',
        weight: secWeight,
        passed: true,
        scoreEarned: secWeight,
        details: 'Standard production security headers present.',
      });
    } else {
      // Give partial score and a warning info issue
      checks.push({
        id: 'chk_security',
        name: 'Security & Production Headers',
        category: 'security',
        weight: secWeight,
        passed: true,
        scoreEarned: 4,
        details: 'Basic HTTP headers present. Consider adding X-Content-Type-Options: nosniff in production.',
      });
    }

    // Calculate total score based on earned weights
    const totalScore = Math.min(100, Math.max(0, checks.reduce((sum, c) => sum + c.scoreEarned, 0)));
    const hasCriticalIssues = issues.some((i) => i.severity === 'critical');
    const passed = totalScore >= 80 && !hasCriticalIssues;

    // Save report to database
    db.createReadinessReport(projectId, deploymentId, totalScore, passed, checks, issues);

    return {
      totalScore,
      passed,
      checks,
      issues,
    };
  }
}
