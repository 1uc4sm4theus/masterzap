import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';
import { fileURLToPath } from 'node:url';

const UPSTREAM_URL =
  process.env.MASTER_IA_UPSTREAM_URL ||
  'https://4En3bRYyfZ7s7DL7amhdTwAELdZsWywxSMusuchVtihc.node.k8s.prd.nos.ci/v1/chat/completions';

const ALLOWED_ORIGINS = new Set([
  'https://masterwhats.recomendeme.com.br',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
]);

const DIST = path.join(path.dirname(fileURLToPath(import.meta.url)), 'dist');
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.ico': 'image/x-icon', '.txt': 'text/plain', '.xml': 'application/xml',
  '.md': 'text/markdown', '.zip': 'application/zip',
};

function applyCors(req, res) {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
  res.setHeader('Access-Control-Max-Age', '86400');
}

function readBody(req, limit = 1_000_000) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (c) => {
      size += c.length;
      if (size > limit) { reject(new Error('too large')); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

async function masterIA(req, res) {
  applyCors(req, res);
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
  if (req.method !== 'POST') {
    res.writeHead(405, { Allow: 'POST, OPTIONS', 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Método não permitido.' }));
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);
  try {
    const body = await readBody(req);
    const upstream = await fetch(UPSTREAM_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      signal: controller.signal,
    });
    res.writeHead(upstream.status, {
      'Content-Type': upstream.headers.get('content-type') || 'application/json',
      'Cache-Control': 'no-cache',
    });
    if (!upstream.body) return res.end();
    Readable.fromWeb(upstream.body).pipe(res); // repassa streaming se houver
  } catch (error) {
    const message = error?.name === 'AbortError'
      ? 'A análise demorou mais que o tempo esperado.'
      : 'Não foi possível concluir a resposta da Master IA.';
    if (!res.headersSent) res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: message }));
  } finally {
    clearTimeout(timeout);
  }
}

http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x');

  if (url.pathname === '/api/master-ia') return masterIA(req, res);

  let file = path.join(DIST, decodeURIComponent(url.pathname));
  if (!file.startsWith(DIST + path.sep) && file !== DIST) { res.writeHead(403); return res.end(); }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!fs.existsSync(file)) { res.writeHead(404); return res.end('Not found'); }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
}).listen(process.env.PORT || 3000);