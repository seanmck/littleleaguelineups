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
  try {
    const parsed = url.parse(req.url);
    const pathname = decodeURIComponent(parsed.pathname || '/');
    let filePath = path.join(STATIC_DIR, pathname === '/' ? 'index.html' : pathname);

    // Prevent path traversal
    if (!filePath.startsWith(STATIC_DIR)) {
      filePath = path.join(STATIC_DIR, 'index.html');
    }

    const ext = path.extname(filePath);

    if (!ext || !fs.existsSync(filePath)) {
      filePath = path.join(STATIC_DIR, 'index.html');
    }

    const contentType = MIME_TYPES[path.extname(filePath)] || 'application/octet-stream';
    const content = fs.readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  } catch (err) {
    console.error('Static file error:', err.message);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal server error');
  }
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
  console.log(`${req.method} ${req.url}`);
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('ok');
  } else if (req.url.startsWith('/api/')) {
    proxyToApi(req, res);
  } else {
    serveStatic(req, res);
  }
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Web server running on port ${PORT}, proxying /api/ to ${API_URL}`);
  console.log(`Static files from ${STATIC_DIR}`);
  console.log(`Directory exists: ${fs.existsSync(STATIC_DIR)}`);
  if (fs.existsSync(STATIC_DIR)) {
    console.log(`Files: ${fs.readdirSync(STATIC_DIR).join(', ')}`);
  }
});
