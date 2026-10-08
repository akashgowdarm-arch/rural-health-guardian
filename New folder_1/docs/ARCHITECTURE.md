# LaunchFlow Architecture & System Design

## 1. System Philosophy
LaunchFlow is designed on the foundational premise:
> *"A website works on localhost. LaunchFlow checks whether it will actually work online, identifies what could break in production, guides the user through fixing those problems, retests everything, and then deploys the website."*

---

## 2. Component Topology

```
+-------------------------------------------------------------+
|                     USER MACHINE                            |
|                                                             |
|  +--------------------+         +-----------------------+   |
|  | localhost:3000     | <-----> | LaunchFlow Agent CLI  |   |
|  | (User Dev Server)  |  HTTP   | (launchflow connect)  |   |
|  +--------------------+         +-----------+-----------+   |
+---------------------------------------------|---------------+
                                              | Outbound WebSocket Tunnel
                                              | (/ws/tunnel?token=lft_...)
                                              v
+-------------------------------------------------------------+
|                     LAUNCHFLOW CLOUD                        |
|                                                             |
|  +-------------------------------------------------------+  |
|  | Agent Tunnel Server & Localhost Probe Controller      |  |
|  +-------------------------------------------------------+  |
|                             |                               |
|                             v                               |
|  +-------------------------------------------------------+  |
|  | Project Analyzer (AST / Regex / Env / Framework)      |  |
|  +-------------------------------------------------------+  |
|                             |                               |
|                             v                               |
|  +-------------------------------------------------------+  |
|  | Isolated Build Sandbox (Quotas, Scrubbed Env, Logs)   |  |
|  +-------------------------------------------------------+  |
|                             |                               |
|                             v                               |
|  +-------------------------------------------------------+  |
|  | Preview Environment & Dynamic Reverse Proxy Router    |  |
|  +-------------------------------------------------------+  |
|                             |                               |
|                             v                               |
|  +=======================================================+  |
|  |            PRODUCTION READINESS ENGINE                |  |
|  |   - Build Integrity Check                             |  |
|  |   - Server Boot & Response Time                       |  |
|  |   - Root (/) 200 OK Content Verification              |  |
|  |   - Route Discovery & Crawl                           |  |
|  |   - Asset & Bundle Integrity (CSS/JS 404 detector)    |  |
|  |   - Localhost & Private IP Leak Detector              |  |
|  |   - Environment Variable Parity Verification          |  |
|  |   - Discoverable API Health Probes                    |  |
|  |   - Cloud Database Reachability                       |  |
|  |   - Security & Production Headers Audit               |  |
|  +=======================================================+  |
|                             |                               |
|               [ Fix <---> Retest Loop ]                     |
|                             |                               |
|                             v                               |
|  +-------------------------------------------------------+  |
|  | Production Deployment & Subdomain Routing Engine      |  |
|  | (my-app.launchflow.app / reverse proxy)               |  |
|  +-------------------------------------------------------+  |
|                             |                               |
|                             v                               |
|  +-------------------------------------------------------+  |
|  | Live Health Probes, Metrics, & Rollback System        |  |
|  +-------------------------------------------------------+  |
+-------------------------------------------------------------+
```

---

## 3. Security & Sandboxing Model
1. **Zero Inbound Port Exposure**: The local agent uses outbound WebSocket connections only (`ws://localhost:4000/ws/tunnel`). No inbound firewall holes are created.
2. **Authorized Port Restraints**: The local agent strictly restricts local requests to the port explicitly authorized by the developer (`launchflow connect 3000`).
3. **Secret Encryption**: All environment secrets are encrypted using AES-256-GCM before database writes. Decrypted secrets are only injected into runtime process execution environments.
4. **Cross-User Authorization**: Every query to projects, deployments, environments, builds, and logs verifies matching `userId`.
5. **Execution Quotas**: Sandbox builds enforce execution timeouts (120s default) and sanitized process environments.
