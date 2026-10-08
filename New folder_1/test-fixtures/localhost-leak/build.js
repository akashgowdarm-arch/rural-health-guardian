const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

fs.writeFileSync(path.join(distDir, 'index.html'), `
<!DOCTYPE html>
<html>
<head><title>Leaky App</title></head>
<body>
  <h1>Localhost Leaky App</h1>
  <script>
    // Leaked localhost API call
    fetch('http://localhost:5000/api/users')
      .then(res => res.json())
      .then(console.log);
  </script>
</body>
</html>
`, 'utf-8');

console.log('✓ Generated dist/index.html with localhost fetch');
