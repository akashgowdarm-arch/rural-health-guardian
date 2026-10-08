const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

fs.writeFileSync(path.join(distDir, 'index.html'), `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>LaunchFlow Verified App</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: system-ui, sans-serif; background: #0f172a; color: #f8fafc; padding: 40px; }
    .card { background: #1e293b; border-radius: 12px; padding: 24px; max-width: 600px; margin: 0 auto; border: 1px solid #334155; }
    .badge { background: #10b981; color: white; padding: 4px 10px; border-radius: 9999px; font-weight: bold; font-size: 14px; }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">PROVEN IN READINESS ENGINE</span>
    <h1 style="margin-top: 16px;">LaunchFlow Production App</h1>
    <p>This website was validated locally, built in an isolated sandbox, audited by the 10-point Production Readiness Engine, and deployed live.</p>
    <div style="margin-top: 20px; font-size: 13px; color: #94a3b8;">
      Status: <strong>100% Operational</strong> | Latency: <strong>Sub-20ms</strong>
    </div>
  </div>
</body>
</html>
`, 'utf-8');

console.log('✓ Build completed successfully: Generated dist/index.html');
