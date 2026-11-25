/**
 * Platform-Independent Local & Production Server for Urban Air Quality Assistant.
 * Uses native Node.js HTTP module with zero external dependencies.
 * Dispatches API routes to /api handlers and serves static assets from /public.
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import chatHandler from './api/chat.js';
import routineHandler from './api/routine.js';
import hacksHandler from './api/hacks.js';
import impactHandler from './api/impact.js';
import aqiHandler from './api/aqi.js';
import { applySecurityHeaders, sendJson } from './lib/http.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.resolve(__dirname, 'public');

const PORT = Number(process.env.PORT) || 3000;

const API_ROUTES = new Map([
  ['/api/chat', chatHandler],
  ['/api/routine', routineHandler],
  ['/api/hacks', hacksHandler],
  ['/api/impact', impactHandler],
  ['/api/aqi', aqiHandler]
]);

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

function streamFile(res, filePath, contentType, cacheControl) {
  res.statusCode = 200;
  res.setHeader('Content-Type', contentType);
  if (cacheControl) {
    res.setHeader('Cache-Control', cacheControl);
  }

  const stream = fs.createReadStream(filePath);
  stream.on('error', () => {
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    }
    res.end('500 Internal Server Error');
  });
  stream.pipe(res);
}

const server = http.createServer(async (req, res) => {
  applySecurityHeaders(res);

  let pathname;
  try {
    const parsedUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    pathname = parsedUrl.pathname;
  } catch {
    return sendJson(res, 400, { error: 'Invalid request URL' });
  }

  if (pathname.startsWith('/api/')) {
    const handler = API_ROUTES.get(pathname);
    if (handler) {
      return handler(req, res);
    }
    return sendJson(res, 404, { error: `API route not found: ${pathname}` });
  }

  const relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  let filePath = path.resolve(PUBLIC_DIR, relativePath);

  // Enforce strict directory containment inside PUBLIC_DIR
  if (filePath !== PUBLIC_DIR && !filePath.startsWith(`${PUBLIC_DIR}${path.sep}`)) {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.end('403 Forbidden');
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      const indexPath = path.join(PUBLIC_DIR, 'index.html');
      if (fs.existsSync(indexPath)) {
        return streamFile(res, indexPath, 'text/html; charset=utf-8');
      }
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.end('404 Not Found');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const cacheControl = (ext === '.css' || ext === '.js' || ext === '.svg')
      ? 'public, max-age=86400'
      : 'no-cache';

    return streamFile(res, filePath, contentType, cacheControl);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('=======================================================');
  console.log(' Urban Air Quality Assistant Server Running');
  console.log(` Local URL: http://localhost:${PORT}`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(' Vercel-Ready & Platform-Independent');
  console.log('=======================================================');
});

process.on('SIGINT', () => {
  server.close(() => process.exit(0));
});
process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});
