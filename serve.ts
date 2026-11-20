// A small static server for the guide's app/ folder (Node 22, standard library
// only), so the guide can be tried locally with no build step:
//   node serve.ts            serves app/ at http://127.0.0.1:8080
//   node serve.ts --port 3000   serves it on port 3000 instead
// It only ever serves files under app/, sends the MIME types a browser needs,
// and does nothing else: this is a development convenience, not a server for
// the internet.
import { createReadStream, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = resolve(fileURLToPath(new URL("./app", import.meta.url)));

function pickPort() {
  const args = process.argv.slice(2);
  const at = args.indexOf("--port");
  const wanted = at === -1 ? 8080 : Number(args[at + 1]);
  return Number.isInteger(wanted) && wanted > 0 && wanted < 65536 ? wanted : 8080;
}

const port = pickPort();

const mimeFor = (file) =>
  ({
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".mjs": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".ico": "image/x-icon",
    ".woff2": "font/woff2",
  })[extname(file).toLowerCase()] ?? "application/octet-stream";

function resolveInside(requestPath) {
  let path = requestPath;
  if (path.endsWith("/")) path += "index.html";
  const file = resolve(join(appRoot, normalize(path)));
  if (file !== appRoot && !file.startsWith(appRoot + sep)) return null;
  return file;
}

createServer((req, res) => {
  let path;
  try {
    path = decodeURIComponent(new URL(req.url ?? "/", "http://localhost").pathname);
  } catch {
    res.writeHead(400).end("bad request");
    return;
  }
  const file = resolveInside(path);
  if (file === null) {
    res.writeHead(403).end("forbidden");
    return;
  }
  let size;
  try {
    const info = statSync(file);
    if (!info.isFile()) throw new Error("not a file");
    size = info.size;
  } catch {
    res.writeHead(404).end("not found");
    return;
  }
  res.writeHead(200, {
    "content-type": mimeFor(file),
    "content-length": size,
    "cache-control": "no-store",
  });
  createReadStream(file).pipe(res);
}).listen(port, "127.0.0.1", () => {
  console.log("Leonida Trophy Guide: app/ is on http://127.0.0.1:" + port);
});
