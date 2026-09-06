import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';

const here = resolve(fileURLToPath(new URL('.', import.meta.url)));
const root = resolve(here, '..');
// Host is explicit and allow-listed. Local tooling defaults to loopback; the Windows launcher passes 0.0.0.0 for same-Wi-Fi phone play.
const requestedHost = String(process.argv[3] ?? process.env.TUTIEN_HOST ?? '127.0.0.1').trim();
const host = requestedHost === '0.0.0.0' ? '0.0.0.0' : '127.0.0.1';
const requestedPort = String(process.argv[2] ?? process.env.TUTIEN_PORT ?? '4173').trim();
const port = Math.max(1, Math.min(65535, Number(requestedPort) || 4173));
const launcherVersion = 'V129-PERFORMANCE-WIP3-HOTFIX4';
const compressedStaticCache = new Map();

const mime = new Map([
  ['.html','text/html; charset=utf-8'],['.js','text/javascript; charset=utf-8'],['.mjs','text/javascript; charset=utf-8'],
  ['.css','text/css; charset=utf-8'],['.json','application/json; charset=utf-8'],['.svg','image/svg+xml'],
  ['.png','image/png'],['.jpg','image/jpeg'],['.jpeg','image/jpeg'],['.webp','image/webp'],['.gif','image/gif'],
  ['.ico','image/x-icon'],['.woff','font/woff'],['.woff2','font/woff2'],['.txt','text/plain; charset=utf-8'],
]);

function send(res,status,headers,body='') { res.writeHead(status,headers); res.end(body); }
function safePath(pathname) {
  let decoded;
  try { decoded = decodeURIComponent(pathname); } catch { return null; }
  if (decoded === '/') decoded = '/index.html';
  const candidate = resolve(root, '.' + decoded);
  if (candidate !== root && !candidate.startsWith(root + sep)) return null;
  return candidate;
}

const server = createServer(async (req,res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || `${host}:${port}`}`);
  if (url.pathname === '/__tutien_launcher_health') {
    return send(res,200,{'content-type':'application/json; charset=utf-8','cache-control':'no-store'},JSON.stringify({ok:true,launcherVersion,host,port}));
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') return send(res,405,{'content-type':'text/plain; charset=utf-8'},'Method Not Allowed');
  let path = safePath(url.pathname);
  if (!path) return send(res,403,{'content-type':'text/plain; charset=utf-8'},'Forbidden');
  try {
    let s = await stat(path);
    if (s.isDirectory()) { path = resolve(path,'index.html'); s = await stat(path); }
    const type = mime.get(extname(path).toLowerCase()) || 'application/octet-stream';
    // V129 HOTFIX1: ETag must represent file CONTENT, not only size+mtime. Patch ZIPs can
    // legitimately preserve timestamps and produce equal-sized modules; stat-only ETags can
    // then return 304 for an older JS module and mix incompatible builds in one page load.
    const raw = await readFile(path);
    const contentHash = createHash('sha256').update(raw).digest('base64url');
    const etag = `W/\"sha256-${contentHash}\"`;
    const baseHeaders = {'content-type':type,'cache-control':'public, max-age=0, must-revalidate','etag':etag,'vary':'Accept-Encoding'};
    if (req.headers['if-none-match'] === etag) return send(res,304,baseHeaders);
    if (req.method === 'HEAD') return send(res,200,{...baseHeaders,'content-length':String(raw.length)});
    const acceptsGzip = /(?:^|,)\s*gzip(?:\s*(?:;|,|$))/i.test(String(req.headers['accept-encoding']||''));
    const compressible = /^(?:text\/|application\/(?:json|javascript)|image\/svg\+xml)/i.test(type);
    if (acceptsGzip && compressible && raw.length >= 1024) {
      let cached = compressedStaticCache.get(path);
      if (!cached || cached.etag !== etag) {
        cached = {etag,data:gzipSync(raw,{level:6})};
        compressedStaticCache.set(path,cached);
      }
      return send(res,200,{...baseHeaders,'content-encoding':'gzip','vary':'Accept-Encoding','content-length':String(cached.data.length)},cached.data);
    }
    return send(res,200,{...baseHeaders,'content-length':String(raw.length)},raw);
  } catch {
    return send(res,404,{'content-type':'text/plain; charset=utf-8','cache-control':'no-store'},'Not Found');
  }
});

server.listen(port,host,() => {
  console.log(`TU TIEN NHAN ROI ${launcherVersion}`);
  console.log(`Game: http://${host}:${port}/`);
  console.log('Giu cua so nay MO trong luc choi. Nhan Ctrl+C de tat server.');
});
server.on('error',error => { console.error(`[LOI SERVER] ${error?.message || error}`); process.exitCode = 1; });
