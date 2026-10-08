# Production Readiness Engine — Specification & Audit Matrix

The **Production Readiness Engine** is the signature differentiator of LaunchFlow.

Instead of deploying broken code and presenting generic runtime 500 errors, LaunchFlow boots the application inside an isolated preview environment, interrogates the running application, audits client-side bundles, and calculates a rigorous, deterministic score (0 - 100).

---

## 1. The 10-Point Audit Matrix

| # | Check Name | Weight | Pass Criteria | Typical Failure Diagnosis |
|---|------------|--------|---------------|---------------------------|
| 1 | **Build Artifact Integrity** | 15 pts | Output directory (`dist/`, `.next/`, `build/`) exists and has valid assets. | Missing build script in `package.json` or compilation abort. |
| 2 | **Application Server Boot** | 15 pts | Server binds to assigned port and returns response within 4000ms. | Port conflict, crash on boot, unhandled exception in `server.js`. |
| 3 | **Homepage Root (/)** | 15 pts | Root `/` route returns HTTP 200 OK with non-empty payload (>50 bytes). | Router misconfiguration or missing root page component. |
| 4 | **Route Crawl & Discovery** | 10 pts | Sampled subpages (`/about`, `/contact`, `/pricing`, `/login`) resolve without 500s. | Broken server routes or unhandled dynamic route segments. |
| 5 | **Static Asset Integrity** | 10 pts | Referenced `<script>`, `<link>`, and `<img>` tags load with 200 OK. | Hardcoded absolute paths or missing files in `public/`. |
| 6 | **Localhost URL Leak Detection** | 15 pts | No hardcoded `http://localhost:*` or `127.0.0.1:*` in rendered HTML or bundled JavaScript. | Frontend fetching `http://localhost:5000` which fails in production. |
| 7 | **Environment Variable Parity** | 10 pts | All required variables detected in source code (`DATABASE_URL`, `API_URL`, etc.) are configured. | Missing cloud database connection or API token. |
| 8 | **API Endpoint Health** | 5 pts | Discoverable `/api/*` endpoints respond with 200/204 and no unhandled 500 crashes. | API controller throwing unhandled database exception. |
| 9 | **Database Reachability** | 5 pts | `DATABASE_URL` uses a remote cloud host (not `localhost`), valid format. | Local Postgres or MySQL connection string passed to cloud container. |
| 10 | **Security & Production Headers** | 5 pts | Headers like `X-Content-Type-Options: nosniff` present. | Missing basic production HTTP security headers. |

---

## 2. Objective Score Calculation
- **Score (0 to 100)**: Computed as `sum(passed_checks.scoreEarned)`.
- **Pass Gate**: Score $\ge$ 80 **AND** zero critical issues.
- **Fail / Warning**: Any critical issue (such as hardcoded localhost leak, failed build, or missing required env var) blocks immediate deployment and initiates the **Fix-Retest Loop**.

---

## 3. The Fix-Retest Loop
When an issue is detected:
1. LaunchFlow displays the **Intelligent Problem Explanation**:
   - **What Happened**
   - **Why It Breaks in Production**
   - **Recommended Fix**
2. The user modifies the configuration or environment variables with 1 click.
3. LaunchFlow re-triggers the sandbox build and audits the new preview without restarting from step 1.
4. Once all critical checks pass, the deployment button unlocks!
