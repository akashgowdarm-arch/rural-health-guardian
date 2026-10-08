#!/usr/bin/env node

/**
 * LaunchFlow Local Agent CLI
 * 
 * Secure outbound agent for verifying local websites and tunneling readiness probes
 * without exposing your machine or requiring firewall inbound ports.
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { WebSocket } from 'ws';

const CONFIG_DIR = path.join(os.homedir(), '.launchflow');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
    }
  } catch (err) {}
  return {
    serverUrl: process.env.LAUNCHFLOW_API_URL || 'http://localhost:4000',
    token: null,
  };
}

function saveConfig(cfg) {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(cfg, null, 2), 'utf-8');
}

async function login(tokenArg) {
  const cfg = loadConfig();
  if (tokenArg) {
    cfg.token = tokenArg;
    saveConfig(cfg);
    console.log(`\x1b[32m✓ LaunchFlow Agent token saved: ${tokenArg}\x1b[0m`);
    return;
  }

  // Quick interactive or dev token login
  console.log('\n\x1b[36m=== LaunchFlow Local Agent Login ===\x1b[0m');
  console.log('To authenticate your agent, run:');
  console.log('  \x1b[33mlaunchflow login <YOUR_AGENT_TOKEN>\x1b[0m\n');
  console.log('You can find your Agent Token in the LaunchFlow Dashboard under Settings.');
}

async function connect(portArg) {
  const port = parseInt(portArg || '3000', 10);
  const cfg = loadConfig();
  const token = cfg.token || process.env.LAUNCHFLOW_AGENT_TOKEN || 'lft_dev_default';
  const serverUrl = cfg.serverUrl || 'http://localhost:4000';
  const wsUrl = serverUrl.replace(/^http/, 'ws') + `/ws/tunnel?token=${encodeURIComponent(token)}&port=${port}`;

  console.log(`\n\x1b[34m[LaunchFlow Agent]\x1b[0m Connecting outbound tunnel to ${serverUrl}...`);
  console.log(`\x1b[34m[LaunchFlow Agent]\x1b[0m Authorized target: http://localhost:${port}`);
  console.log(`\x1b[90mSecurity: Outbound only. Only port ${port} is authorized.\x1b[0m\n`);

  const ws = new WebSocket(wsUrl);

  ws.on('open', () => {
    console.log(`\x1b[32m✓ Agent connected successfully to LaunchFlow Cloud!\x1b[0m`);
    console.log(`\x1b[32m✓ Monitoring localhost:${port} for readiness verification...\x1b[0m`);
    console.log(`\x1b[90mPress Ctrl+C to disconnect.\x1b[0m\n`);
  });

  ws.on('message', async (data) => {
    try {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'connected') {
        console.log(`\x1b[36m[Server]\x1b[0m ${msg.message}`);
      } else if (msg.type === 'probe_request') {
        const probePath = msg.path || '/';
        const start = Date.now();

        // Safe local probe to authorized port ONLY
        const req = http.get(`http://127.0.0.1:${port}${probePath}`, (res) => {
          let body = '';
          res.on('data', (c) => { body += c; });
          res.on('end', () => {
            let framework = 'Static / Other';
            if (res.headers['x-powered-by']?.includes('Next.js') || body.includes('__NEXT_DATA__')) {
              framework = 'Next.js';
            } else if (body.includes('/@vite/client') || body.includes('vite')) {
              framework = 'React (Vite)';
            } else if (res.headers['x-powered-by']?.includes('Express')) {
              framework = 'Express.js';
            }

            console.log(`\x1b[32m✓ Probe received for ${probePath} → HTTP ${res.statusCode} (${Date.now() - start}ms)\x1b[0m`);
            ws.send(JSON.stringify({
              type: 'probe_response',
              id: msg.id,
              reachable: true,
              statusCode: res.statusCode,
              responseTimeMs: Date.now() - start,
              frameworkDetected: framework,
              details: `Port ${port} responded with HTTP ${res.statusCode}`,
            }));
          });
        });

        req.on('error', (err) => {
          console.log(`\x1b[31m✕ Probe failed: Local port ${port} not reachable (${err.message})\x1b[0m`);
          ws.send(JSON.stringify({
            type: 'probe_response',
            id: msg.id,
            reachable: false,
            statusCode: 0,
            details: `Cannot connect to localhost:${port}: ${err.message}`,
            explanation: {
              title: "Development Server Isn't Running",
              whatHappened: `LaunchFlow could not connect to port ${port} on your machine.`,
              whyItBreaksInProduction: 'Without a running local server, LaunchFlow cannot probe your application routes.',
              recommendedFix: `Start your local server with "npm run dev" or check that it is listening on port ${port}.`,
            },
          }));
        });

        req.setTimeout(3000, () => {
          req.destroy();
          ws.send(JSON.stringify({
            type: 'probe_response',
            id: msg.id,
            reachable: false,
            statusCode: 408,
            details: `Timeout probing localhost:${port}`,
          }));
        });
      }
    } catch (err) {
      console.error('[LaunchFlow Agent] Error processing message:', err);
    }
  });

  ws.on('close', (code, reason) => {
    console.log(`\x1b[33m! Agent disconnected: ${reason?.toString() || code}\x1b[0m`);
    process.exit(0);
  });

  ws.on('error', (err) => {
    console.error(`\x1b[31m✕ Connection error: ${err.message}\x1b[0m`);
    console.log(`Make sure the LaunchFlow server is running at ${serverUrl}`);
  });
}

// CLI Argument Dispatcher
const args = process.argv.slice(2);
const command = args[0] || 'help';

switch (command) {
  case 'login':
    login(args[1]);
    break;
  case 'connect':
    connect(args[1] || '3000');
    break;
  case 'status':
    console.log('LaunchFlow Local Agent v1.0.0');
    console.log(`Config: ${JSON.stringify(loadConfig(), null, 2)}`);
    break;
  default:
    console.log(`
\x1b[1mLaunchFlow Local Agent CLI\x1b[0m
"From localhost to live — with proof that it works."

\x1b[36mUsage:\x1b[0m
  launchflow login [token]       Authenticate the local agent
  launchflow connect [port]      Securely connect a local port (e.g. 3000)
  launchflow status              Show agent configuration and status
`);
    break;
}
