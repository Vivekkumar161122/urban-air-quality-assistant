/**
 * Platform-Independent Local & Production Server for Urban Air Quality Assistant.
 * Uses native Node.js HTTP module with zero external dependencies.
 * Dispatches API routes to /api handlers and serves static assets from /public.
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// API Handlers
import chatHandler from './api/chat.js';
import routineHandler from './api/routine.js';
import hacksHandler from './api/hacks.js';
import impactHandler from './api/impact.js';
import aqiHandler from './api/aqi.js';
import { SECURITY_HEADERS } from './lib/security.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.join(__dirname, 'public');

const PORT = Number(process.env.PORT) || 3000;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8'
};

const server = http.createServer(async (req, res) => {
  // Apply standard security headers
  Object.entries(SECURITY_HEADERS).forEach(([key, val]) => res.setHeader(key, val));

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // Route API endpoints
  if (pathname.startsWith('/api/')) {
    if (pathname === '/api/chat') {
      return chatHandler(req, res);
    }
    if (pathname === '/api/routine') {
      return routineHandler(req, res);
    }
    if (pathname === '/api/hacks') {
      return hacksHandler(req, res);
    }
    if (pathname === '/api/impact') {
      return impactHandler(req, res);
    }
    if (pathname === '/api/aqi') {
      return aqiHandler(req, res);
    }

    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ error: `API route not found: ${pathname}` }));
  }

  // Serve static files from /public
  let relativePath = pathname === '/' ? 'index.html' : pathname;
  // Normalize and prevent directory traversal
  const safePath = path.normalize(relativePath).replace(/^(\.\.[\/\\])+/, '');
  let filePath = path.join(PUBLIC_DIR, safePath);

  // If pointing to directory without trailing file, try index.html
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback to index.html for Single Page Application navigation
      const indexPath = path.join(PUBLIC_DIR, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return fs.createReadStream(indexPath).pipe(res);
      }
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.end('404 Not Found');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    // Cache static assets (CSS, JS, SVG)
    if (ext === '.css' || ext === '.js' || ext === '.svg') {
      res.setHeader('Cache-Control', 'public, max-age=86400');
    } else {
      res.setHeader('Cache-Control', 'no-cache');
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', contentType);
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(` Urban Air Quality Assistant Server Running`);
  console.log(` Local URL: http://localhost:${PORT}`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(` Vercel-Ready & Platform-Independent`);
  console.log(`=======================================================`);
});

// Graceful termination
process.on('SIGINT', () => {
  server.close(() => process.exit(0));
});
process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});
