export const CONFIG = {
  APP_NAME: 'LaunchFlow',
  TAGLINE: 'From localhost to live — with proof that it works.',
  DEFAULT_API_PORT: 4000,
  DEFAULT_WEB_PORT: 3000,
  BASE_DOMAIN: 'launchflow.app',
  PREVIEW_TIMEOUT_MS: 30000,
  BUILD_TIMEOUT_MS: 120000,
  MAX_LOG_HISTORY: 500,
  READINESS_PASS_THRESHOLD: 80,
  DEFAULT_REGION: 'Global (Auto)',
};

export const FRAMEWORK_PRESETS = {
  nextjs: {
    name: 'Next.js',
    buildCommand: 'npm run build',
    startCommand: 'npm start',
    defaultPort: 3000,
    configFiles: ['next.config.js', 'next.config.mjs', 'next.config.ts'],
  },
  'react-vite': {
    name: 'React (Vite)',
    buildCommand: 'npm run build',
    startCommand: 'npx serve -s dist -l 3000',
    defaultPort: 3000,
    configFiles: ['vite.config.js', 'vite.config.ts'],
  },
  'nodejs-express': {
    name: 'Node.js / Express',
    buildCommand: 'npm run build || echo "No build required"',
    startCommand: 'npm start',
    defaultPort: 5000,
    configFiles: ['server.js', 'app.js', 'index.js', 'src/server.ts'],
  },
  'static-html': {
    name: 'Static HTML/CSS/JS',
    buildCommand: 'echo "Static build complete"',
    startCommand: 'npx serve . -l 3000',
    defaultPort: 3000,
    configFiles: ['index.html'],
  },
};
