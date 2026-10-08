import fs from 'node:fs';
import path from 'node:path';

// LaunchFlow Platform-Internal Variables (never exposed to end users)
export const PLATFORM_INTERNAL_VARIABLES = new Set([
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

export function isPlatformInternalVariable(key: string): boolean {
  if (PLATFORM_INTERNAL_VARIABLES.has(key)) return true;
  if (key.startsWith('LAUNCHFLOW_')) return true;
  if (key.startsWith('npm_')) return true;
  return false;
}

export interface DetectedEnvVar {
  key: string;
  category: 'required' | 'optional' | 'public' | 'secret';
  group?: 'Database' | 'Payments' | 'Authentication' | 'AI Services' | 'Email' | 'General';
  isSecret: boolean;
  sampleValue?: string;
  foundInFile?: string;
  description?: string;
  placeholder?: string;
  docUrl?: string;
  helpText?: string;
}

export interface AnalysisResult {
  framework: 'nextjs' | 'react-vite' | 'nodejs-express' | 'static-html';
  language: 'javascript' | 'typescript';
  packageManager: 'npm' | 'yarn' | 'pnpm' | 'bun';
  buildCommand: string;
  startCommand: string;
  port: number;
  database: 'PostgreSQL' | 'MySQL' | 'MongoDB' | 'SQLite' | 'None';
  detectedEnvVars: DetectedEnvVar[];
  localhostLeaks: Array<{ file: string; url: string; line: number }>;
}

export class ProjectAnalyzer {
  public static async analyze(projectPath: string): Promise<AnalysisResult> {
    if (!fs.existsSync(projectPath)) {
      throw new Error(`Project path does not exist: ${projectPath}`);
    }

    const packageJsonPath = path.join(projectPath, 'package.json');
    let pkg: any = {};
    if (fs.existsSync(packageJsonPath)) {
      try {
        pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      } catch (err) {
        console.warn('Failed to parse package.json:', err);
      }
    }

    const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };

    // 1. Detect Package Manager
    let packageManager: 'npm' | 'yarn' | 'pnpm' | 'bun' = 'npm';
    if (fs.existsSync(path.join(projectPath, 'bun.lockb')) || fs.existsSync(path.join(projectPath, 'bun.lock'))) {
      packageManager = 'bun';
    } else if (fs.existsSync(path.join(projectPath, 'pnpm-lock.yaml'))) {
      packageManager = 'pnpm';
    } else if (fs.existsSync(path.join(projectPath, 'yarn.lock'))) {
      packageManager = 'yarn';
    }

    // 2. Detect Language
    const hasTsConfig = fs.existsSync(path.join(projectPath, 'tsconfig.json'));
    let language: 'javascript' | 'typescript' = hasTsConfig ? 'typescript' : 'javascript';

    // 3. Detect Framework
    let framework: 'nextjs' | 'react-vite' | 'nodejs-express' | 'static-html' = 'static-html';
    let buildCommand = 'echo "Static build complete"';
    let startCommand = 'npx serve -s . -l 3000';
    let port = 3000;

    if (deps['next']) {
      framework = 'nextjs';
      buildCommand = pkg.scripts?.build ? `${packageManager} run build` : 'npx next build';
      startCommand = pkg.scripts?.start ? `${packageManager} start` : 'npx next start -p 3000';
      port = 3000;
    } else if (deps['vite'] || deps['@vitejs/plugin-react']) {
      framework = 'react-vite';
      buildCommand = pkg.scripts?.build ? `${packageManager} run build` : 'npx vite build';
      startCommand = 'npx serve -s dist -l 3000';
      port = 3000;
    } else if (deps['express'] || deps['fastify'] || pkg.main || fs.existsSync(path.join(projectPath, 'server.js')) || fs.existsSync(path.join(projectPath, 'app.js'))) {
      framework = 'nodejs-express';
      buildCommand = pkg.scripts?.build ? `${packageManager} run build` : 'echo "No build step required"';
      startCommand = pkg.scripts?.start ? `${packageManager} start` : `node ${pkg.main || 'server.js'}`;
      port = 5000;
    } else if (fs.existsSync(path.join(projectPath, 'index.html'))) {
      framework = 'static-html';
      buildCommand = 'echo "Static site ready"';
      startCommand = 'npx serve -s . -l 3000';
      port = 3000;
    }

    if (pkg.scripts?.build) {
      buildCommand = `${packageManager} run build`;
    }
    if (pkg.scripts?.start) {
      startCommand = `${packageManager} run start`;
    }

    // 4. Scan for User-Project Environment Variables and Localhost leaks
    const envVarsMap = new Map<string, DetectedEnvVar>();
    const localhostLeaks: Array<{ file: string; url: string; line: number }> = [];

    // Internal directories that belong to LaunchFlow platform itself (do not scan as user code)
    const ignoredDirs = new Set([
      'node_modules', '.git', 'dist', 'build', '.next', '.cache',
      'coverage', '.system_generated', 'infrastructure', 'agent', 'data'
    ]);

    const walkDir = (dir: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          if (ignoredDirs.has(entry.name)) continue;
          walkDir(path.join(dir, entry.name));
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase();
          if (['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.json', '.html'].includes(ext)) {
            const filePath = path.join(dir, entry.name);
            const relativePath = path.relative(projectPath, filePath);
            try {
              const content = fs.readFileSync(filePath, 'utf-8');
              const lines = content.split('\n');

              // Find process.env or import.meta.env
              const envRegex = /(?:process\.env\.|import\.meta\.env\.)([A-Z0-9_]+)/g;
              let match;
              while ((match = envRegex.exec(content)) !== null) {
                const key = match[1];

                // CRITICAL FILTER: Exclude LaunchFlow internal variables completely
                if (isPlatformInternalVariable(key)) continue;

                let category: 'required' | 'optional' | 'public' | 'secret' = 'optional';
                let group: DetectedEnvVar['group'] = 'General';
                let isSecret = false;
                let description = `Configuration variable for ${key}`;
                let placeholder = 'Value';
                let docUrl: string | undefined = undefined;
                let helpText: string | undefined = undefined;

                if (key === 'DATABASE_URL' || key === 'POSTGRES_URL' || key === 'MONGODB_URI') {
                  category = 'required';
                  group = 'Database';
                  isSecret = true;
                  description = 'PostgreSQL database used by your application.';
                  placeholder = 'postgresql://username:password@host:5432/database';
                  helpText = 'Hosted cloud databases like Supabase, Neon, or AWS RDS provide this connection string.';
                } else if (key === 'STRIPE_SECRET_KEY') {
                  category = 'secret';
                  group = 'Payments';
                  isSecret = true;
                  description = 'Used to securely process Stripe payments.';
                  placeholder = '•••••••••••••••••••';
                  docUrl = 'https://dashboard.stripe.com/apikeys';
                  helpText = 'Get Stripe key ↗';
                } else if (key === 'STRIPE_PUBLISHABLE_KEY') {
                  category = 'public';
                  group = 'Payments';
                  isSecret = false;
                  description = 'Used by the browser to initialize Stripe Checkout.';
                  placeholder = 'pk_live_... or pk_test_...';
                  docUrl = 'https://dashboard.stripe.com/apikeys';
                } else if (key === 'NEXT_PUBLIC_API_URL' || key === 'API_URL' || key === 'VITE_API_URL' || key === 'REACT_APP_API_URL') {
                  category = 'optional';
                  group = 'API';
                  isSecret = false;
                  description = 'Where your frontend connects to your API.';
                  placeholder = 'https://api.example.com';
                } else if (key.includes('SUPABASE')) {
                  category = key.includes('SERVICE') ? 'secret' : 'public';
                  group = 'Authentication';
                  isSecret = key.includes('KEY') || key.includes('SECRET');
                  description = `Supabase ${key.includes('URL') ? 'Project URL' : 'API key'}.`;
                  placeholder = key.includes('URL') ? 'https://xyzcompany.supabase.co' : 'eyJhbGciOi...';
                } else if (key.includes('OPENAI')) {
                  category = 'secret';
                  group = 'AI Services';
                  isSecret = true;
                  description = 'OpenAI API key for language model completions.';
                  placeholder = 'sk-...';
                  docUrl = 'https://platform.openai.com/api-keys';
                } else if (key.includes('RESEND') || key.includes('SENDGRID')) {
                  category = 'secret';
                  group = 'Email';
                  isSecret = true;
                  description = 'API key for transactional email delivery.';
                } else if (key.startsWith('NEXT_PUBLIC_') || key.startsWith('VITE_') || key.startsWith('REACT_APP_')) {
                  category = 'public';
                  description = `Public client-side variable for ${key}`;
                } else if (/SECRET|KEY|PASSWORD|TOKEN|AUTH|CREDENTIAL|PRIVATE/i.test(key)) {
                  category = 'secret';
                  isSecret = true;
                  description = `Secret credentials or token for ${key}`;
                } else if (/DATABASE_URL|API_URL|DB_/i.test(key)) {
                  category = 'required';
                  isSecret = /DATABASE_URL|DB_/i.test(key);
                  description = `Service endpoint or connection string for ${key}`;
                }

                if (!envVarsMap.has(key)) {
                  envVarsMap.set(key, {
                    key,
                    category,
                    group,
                    isSecret,
                    foundInFile: relativePath,
                    description,
                    placeholder,
                    docUrl,
                    helpText,
                  });
                }
              }

              // Scan for hardcoded localhost URLs
              lines.forEach((lineText, idx) => {
                const urlMatch = lineText.match(/(https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?(?:\/[^\s"')`]+)?)/i);
                if (urlMatch && !relativePath.includes('test') && !relativePath.includes('setup')) {
                  localhostLeaks.push({
                    file: relativePath,
                    url: urlMatch[1],
                    line: idx + 1,
                  });
                }
              });
            } catch (err) {}
          }
        }
      }
    };

    walkDir(projectPath);

    // 5. Detect Database
    let database: 'PostgreSQL' | 'MySQL' | 'MongoDB' | 'SQLite' | 'None' = 'None';
    if (deps['pg'] || deps['postgres'] || deps['@prisma/client'] || envVarsMap.has('DATABASE_URL')) {
      database = 'PostgreSQL';
    } else if (deps['mysql'] || deps['mysql2']) {
      database = 'MySQL';
    } else if (deps['mongoose'] || deps['mongodb']) {
      database = 'MongoDB';
    } else if (deps['sqlite3'] || deps['better-sqlite3']) {
      database = 'SQLite';
    }

    return {
      framework,
      language,
      packageManager,
      buildCommand,
      startCommand,
      port,
      database,
      detectedEnvVars: Array.from(envVarsMap.values()),
      localhostLeaks,
    };
  }
}
