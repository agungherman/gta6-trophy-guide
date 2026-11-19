// Tiny static server for the Leonida Trophy Guide, for local play-testing.
// Serves app/ on 127.0.0.1, default port 8080 (override with --port <n>).
// Usage: node serve.ts [--port 8081]  then open http://localhost:8081/
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));
const appDir = join(here, 'app');
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
};

const portIndex = process.argv.indexOf('--port');
const port = portIndex >= 0 ? Number(process.argv[portIndex + 1]) : 8080;

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? '/', 'http://127.0.0.1');
    let path = decodeURIComponent(url.pathname);
    if (path === '/') path = '/index.html';
    const file = join(appDir, path);
    if (!file.startsWith(appDir)) { res.writeHead(403); res.end('forbidden'); return; }
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end('not found');
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Leonida Trophy Guide at http://127.0.0.1:${port}/`);
});
