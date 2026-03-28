const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 8080;
const API_URL = process.env.API_URL;

if (!API_URL) {
  console.error('ERROR: API_URL environment variable is not set');
  process.exit(1);
}

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

const STATIC_DIR = path.join(__dirname, 'dist');

function serveStatic(req, res) {
  let filePath = path.join(STATIC_DIR, req.url === '/' ? 'index.html' : req.url);
  const ext = path.extname(filePath);

  if (!fs.existsSync(filePath) || !ext) {
    filePath = path.join(STATIC_DIR, 'index.html');
  }

  const contentType = MIME_TYPES[path.extname(filePath)] || 'application/octet-stream';
  const content = fs.readFileSync(filePath);
  res.writeHead(200, { 'Content-Type': contentType });
  res.end(content);
}

function proxyToApi(req, res) {
  const targetUrl = API_URL.replace(/\/$/, '') + req.url;
  const parsed = url.parse(targetUrl);
  const transport = parsed.protocol === 'https:' ? https : http;

  const proxyReq = transport.request(
    {
      hostname: parsed.hostname,
      port: parsed.port,
      path: parsed.path,
      method: req.method,
      headers: {
        ...req.headers,
        host: parsed.host,
      },
    },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    }
  );

  proxyReq.on('error', (err) => {
    console.error('Proxy error:', err.message);
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'API unavailable' }));
  });

  req.pipe(proxyReq);
}

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('ok');
  } else if (req.url.startsWith('/api/')) {
    proxyToApi(req, res);
  } else {
    serveStatic(req, res);
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Web server running on port ${PORT}, proxying /api/ to ${API_URL}`);
});
