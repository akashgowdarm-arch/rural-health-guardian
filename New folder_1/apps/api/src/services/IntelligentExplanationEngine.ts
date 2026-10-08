export interface IntelligentExplanation {
  code: string;
  title: string;
  whatHappened: string;
  whyItBreaksInProduction: string;
  recommendedFix: string;
  actionType?: 'configure_env' | 'update_config' | 'change_port' | 'fix_code';
  actionField?: string;
  suggestedValue?: string;
}

export class IntelligentExplanationEngine {
  public static diagnose(rawError: string, context?: { envVars?: Record<string, string>; framework?: string }): IntelligentExplanation {
    const text = rawError || '';

    // 1. Hardcoded Localhost API URL
    if (text.includes('localhost:') || text.includes('127.0.0.1:') || text.includes('LOCALHOST_LEAK')) {
      const match = text.match(/(http:\/\/(?:localhost|127\.0\.0\.1):\d+)/i);
      const url = match ? match[1] : 'http://localhost:5000';
      return {
        code: 'LOCALHOST_URL_IN_PRODUCTION',
        title: 'Production Localhost Leak Detected',
        whatHappened: `Your client-side code is referencing a local URL: "${url}".`,
        whyItBreaksInProduction: 'On a user\'s device or in cloud production, "localhost" refers to the user\'s own computer, NOT your backend server. Visitors won\'t be able to fetch data or authenticate.',
        recommendedFix: 'Replace the hardcoded localhost URL with an environment variable (e.g. process.env.NEXT_PUBLIC_API_URL or VITE_API_URL) pointing to your production API.',
        actionType: 'configure_env',
        actionField: 'NEXT_PUBLIC_API_URL',
        suggestedValue: 'https://api.yourdomain.com',
      };
    }

    // 2. Connection Refused / Database connection failed
    if (text.includes('ECONNREFUSED') || text.includes('SequelizeConnectionRefusedError') || text.includes('P1001') || text.includes('connect ECONNREFUSED')) {
      return {
        code: 'CONNECTION_REFUSED',
        title: 'Database or Service Connection Failed',
        whatHappened: 'Your application attempted to connect to an external service or database, but the server rejected the connection (ECONNREFUSED).',
        whyItBreaksInProduction: 'In production environments, localhost databases do not exist. Your cloud instance cannot reach a database running on your local machine unless a managed production database URL is supplied.',
        recommendedFix: 'Supply a valid cloud database connection string (e.g., PostgreSQL / Neon / Supabase / PlanetScale) in your project Environment Variables under DATABASE_URL.',
        actionType: 'configure_env',
        actionField: 'DATABASE_URL',
        suggestedValue: 'postgresql://user:password@cloud-db.provider.com/dbname',
      };
    }

    // 3. Missing Required Environment Variable
    if (text.includes('MISSING_ENV') || text.includes('Missing required environment variable') || text.includes('DATABASE_URL is not set') || text.includes('is not defined in process.env')) {
      const varMatch = text.match(/([A-Z0-9_]{3,}_(?:URL|KEY|SECRET|TOKEN|ID|ENV|PORT))/);
      const varName = varMatch ? varMatch[1] : 'DATABASE_URL';
      return {
        code: 'MISSING_ENVIRONMENT_VARIABLE',
        title: `Missing Required Variable: ${varName}`,
        whatHappened: `Your application code or start script threw an error because "${varName}" was not provided.`,
        whyItBreaksInProduction: 'Unlike your local computer which may read from an untracked .env file, production containers start with a clean slate. Without this variable, runtime initializers will crash immediately.',
        recommendedFix: `Navigate to Environment Variables tab and supply a production value for ${varName}.`,
        actionType: 'configure_env',
        actionField: varName,
      };
    }

    // 4. Missing Build Script
    if (text.includes('missing script: "build"') || text.includes('npm ERR! missing script: build')) {
      return {
        code: 'MISSING_BUILD_SCRIPT',
        title: 'Missing "build" Script in package.json',
        whatHappened: 'LaunchFlow ran "npm run build", but no "build" command was found in your package.json scripts.',
        whyItBreaksInProduction: 'Production builders need a defined compilation step to bundle assets and optimize code before serving.',
        recommendedFix: 'Add a "build" script to your package.json (for example: "build": "next build" or "build": "vite build") or customize the Build Command in Project Settings.',
        actionType: 'update_config',
        actionField: 'buildCommand',
        suggestedValue: 'npm run build',
      };
    }

    // 5. Port Collision / EADDRINUSE
    if (text.includes('EADDRINUSE') || text.includes('address already in use')) {
      return {
        code: 'PORT_IN_USE',
        title: 'Port Already in Use (EADDRINUSE)',
        whatHappened: 'The application tried to bind to a port that is already occupied by another running process.',
        whyItBreaksInProduction: 'In production containers, the server should bind to the dynamic port passed via process.env.PORT rather than hardcoding port 3000 or 8080.',
        recommendedFix: 'Ensure your server listens on process.env.PORT: const port = process.env.PORT || 3000; server.listen(port);',
        actionType: 'update_config',
        actionField: 'port',
      };
    }

    // 6. Missing Dependency / MODULE_NOT_FOUND
    if (text.includes('MODULE_NOT_FOUND') || text.includes('Cannot find module') || text.includes('Module not found')) {
      const modMatch = text.match(/Cannot find module '([^']+)'/) || text.match(/Module not found: Can't resolve '([^']+)'/);
      const modName = modMatch ? modMatch[1] : 'unresolved dependency';
      return {
        code: 'MODULE_NOT_FOUND',
        title: `Missing Module: ${modName}`,
        whatHappened: `The build failed because code imports "${modName}", which is not installed or not listed in package.json.`,
        whyItBreaksInProduction: 'In development, packages might be globally installed or cached. In isolated production builds, only dependencies explicitly listed in dependencies or devDependencies are installed.',
        recommendedFix: `Run "npm install ${modName}" in your project and commit package.json and package-lock.json.`,
        actionType: 'fix_code',
      };
    }

    // 7. TypeScript Compilation Error
    if (text.includes('error TS') || text.includes('TypeScript error')) {
      return {
        code: 'TYPESCRIPT_COMPILATION_ERROR',
        title: 'TypeScript Type Checking Failed',
        whatHappened: 'TypeScript encountered type errors during "tsc" or build compilation.',
        whyItBreaksInProduction: 'Production builds run strict type checks to prevent unpredictable runtime crashes for real users.',
        recommendedFix: 'Inspect the build logs above to see the exact file and line number where type validation failed. Fix the type mismatch or run "npm run build" locally to verify.',
        actionType: 'fix_code',
      };
    }

    // 8. Out of Memory
    if (text.includes('JavaScript heap out of memory') || text.includes('CALL_AND_RETRY_LAST Allocation failed')) {
      return {
        code: 'OUT_OF_MEMORY',
        title: 'Build Exceeded Memory Limit',
        whatHappened: 'The build process ran out of RAM while bundling assets.',
        whyItBreaksInProduction: 'Complex bundles, unoptimized source maps, or recursive imports can exhaust allocated memory.',
        recommendedFix: 'Increase Node memory allocation or disable source maps in production build (e.g. NODE_OPTIONS="--max-old-space-size=4096").',
        actionType: 'configure_env',
        actionField: 'NODE_OPTIONS',
        suggestedValue: '--max-old-space-size=4096',
      };
    }

    // Default Fallback Explanation
    return {
      code: 'GENERIC_RUNTIME_ISSUE',
      title: 'Unexpected Execution Failure',
      whatHappened: 'The build or startup command returned a non-zero exit code.',
      whyItBreaksInProduction: 'The command terminated prematurely before the web server could start and respond to health checks.',
      recommendedFix: 'Review the stdout/stderr build logs above to identify the root error, correct the configuration, and trigger a retest.',
      actionType: 'update_config',
    };
  }
}
