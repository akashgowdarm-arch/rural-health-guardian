import { WebSocket, WebSocketServer } from 'ws';
import http from 'node:http';
import { db } from '../db/database.ts';
import { IntelligentExplanationEngine } from './IntelligentExplanationEngine.ts';

interface AgentConnection {
  userId: string;
  agentToken: string;
  ws: WebSocket;
  authorizedPort: number;
  connectedAt: string;
}

export class AgentTunnelServer {
  private static connections: Map<string, AgentConnection> = new Map(); // keyed by agentToken
  private static pendingProbes: Map<string, (res: any) => void> = new Map();

  public static initialize(wss: WebSocketServer) {
    wss.on('connection', (ws: WebSocket, req: http.IncomingMessage) => {
      const url = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
      if (!url.pathname.startsWith('/ws/tunnel')) return;

      const token = url.searchParams.get('token');
      const portStr = url.searchParams.get('port');
      const localPort = portStr ? parseInt(portStr, 10) : 3000;

      if (!token) {
        ws.close(4001, 'Missing agent authentication token');
        return;
      }

      const user = db.getUserByAgentToken(token);
      if (!user) {
        ws.close(4003, 'Invalid agent token');
        return;
      }

      const conn: AgentConnection = {
        userId: user.id,
        agentToken: token,
        ws,
        authorizedPort: localPort,
        connectedAt: new Date().toISOString(),
      };

      this.connections.set(token, conn);
      db.createTunnelSession(user.id, localPort, token);
      console.log(`[AgentTunnel] Connected agent for user ${user.name} (authorized port ${localPort})`);

      ws.send(JSON.stringify({
        type: 'connected',
        message: `Successfully connected to LaunchFlow Cloud. Tunneling port ${localPort}.`,
        user: { id: user.id, name: user.name },
      }));

      ws.on('message', (data: Buffer) => {
        try {
          const msg = JSON.parse(data.toString());
          if (msg.type === 'probe_response' && msg.id) {
            const resolver = this.pendingProbes.get(msg.id);
            if (resolver) {
              resolver(msg);
              this.pendingProbes.delete(msg.id);
            }
          } else if (msg.type === 'ping') {
            ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
          }
        } catch (err) {
          console.error('[AgentTunnel] Malformed message from agent:', err);
        }
      });

      ws.on('close', () => {
        this.connections.delete(token);
        console.log(`[AgentTunnel] Disconnected agent for user ${user.name}`);
      });
    });
  }

  public static isAgentConnected(agentToken: string): boolean {
    return this.connections.has(agentToken);
  }

  public static async probeLocalhost(params: {
    userId: string;
    agentToken: string;
    port: number;
    urlPath?: string;
  }): Promise<{
    reachable: boolean;
    statusCode?: number;
    responseTimeMs?: number;
    frameworkDetected?: string;
    details?: string;
    explanation?: any;
  }> {
    const { userId, agentToken, port, urlPath = '/' } = params;

    // 1. If an active WebSocket tunnel connection exists for this user's agent:
    const conn = this.connections.get(agentToken);
    if (conn && conn.ws.readyState === WebSocket.OPEN) {
      const probeId = 'prb_' + Math.random().toString(36).substring(2, 9);
      const start = Date.now();

      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          this.pendingProbes.delete(probeId);
          resolve({
            reachable: false,
            details: `Agent connection timed out probing port ${port}.`,
            explanation: {
              title: "Couldn't Connect to Localhost Port",
              whatHappened: `The agent sent an HTTP request to localhost:${port}, but the port did not respond.`,
              whyItBreaksInProduction: 'If the app is not running locally, LaunchFlow cannot analyze its behavior or verify its start scripts.',
              recommendedFix: `Ensure your local dev server is running on port ${port} (e.g. npm run dev).`,
            },
          });
        }, 5000);

        this.pendingProbes.set(probeId, (response: any) => {
          clearTimeout(timeout);
          resolve({
            reachable: response.reachable,
            statusCode: response.statusCode,
            responseTimeMs: response.responseTimeMs || Date.now() - start,
            frameworkDetected: response.frameworkDetected,
            details: response.details,
            explanation: response.explanation,
          });
        });

        conn.ws.send(JSON.stringify({
          type: 'probe_request',
          id: probeId,
          port,
          path: urlPath,
        }));
      });
    }

    // 2. Direct probe fallback (when API runs on the same machine or during local dev test):
    const start = Date.now();
    return new Promise((resolve) => {
      const req = http.get(`http://127.0.0.1:${port}${urlPath}`, (res) => {
        let body = '';
        res.on('data', (d) => { body += d; });
        res.on('end', () => {
          let framework = 'Static / Other';
          const headers = res.headers;
          if (headers['x-powered-by']?.includes('Next.js') || body.includes('__NEXT_DATA__')) {
            framework = 'Next.js';
          } else if (body.includes('/@vite/client') || body.includes('vite')) {
            framework = 'React (Vite)';
          } else if (headers['x-powered-by']?.includes('Express')) {
            framework = 'Express.js';
          }

          resolve({
            reachable: true,
            statusCode: res.statusCode,
            responseTimeMs: Date.now() - start,
            frameworkDetected: framework,
            details: `Port ${port} responded with HTTP ${res.statusCode} in ${Date.now() - start}ms`,
          });
        });
      });

      req.on('error', (err) => {
        resolve({
          reachable: false,
          details: `Could not connect to http://localhost:${port}: ${err.message}`,
          explanation: {
            title: "We Couldn't Connect to Your Website",
            whatHappened: `Connection to http://localhost:${port} was refused.`,
            whyItBreaksInProduction: 'LaunchFlow must verify your website operates properly locally before validating production readiness.',
            recommendedFix: `Make sure your dev server is running on port ${port} (e.g., npm run dev) or connect the LaunchFlow Agent CLI.`,
          },
        });
      });

      req.setTimeout(3000, () => {
        req.destroy();
        resolve({
          reachable: false,
          details: `Connection to localhost:${port} timed out after 3000ms`,
        });
      });
    });
  }
}
