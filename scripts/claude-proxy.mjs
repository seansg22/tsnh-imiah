// Run on your laptop: PROXY_SECRET=xxx ALLOW_ORIGIN=https://your-app.vercel.app node scripts/claude-proxy.mjs
// Then expose it: tailscale funnel 8787
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';

const { PROXY_SECRET, ALLOW_ORIGIN = '*', PORT = 8787 } = process.env;
if (!PROXY_SECRET) throw new Error('Set PROXY_SECRET');

const cors = {
  'Access-Control-Allow-Origin': ALLOW_ORIGIN,
  'Access-Control-Allow-Headers': 'Content-Type, X-Proxy-Secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function askClaude(system, messages) {
  const prompt = messages.map(m => `${m.role === 'assistant' ? 'Assistant' : 'User'}: ${m.content}`).join('\n\n');
  return new Promise((resolve, reject) => {
    // ponytail: no timeout/queue here, the FE times out and falls back
    const p = spawn('claude', ['-p', '--system-prompt', system, '--tools', ''], { stdio: ['pipe', 'pipe', 'pipe'] });
    let out = '';
    let err = '';
    p.stdout.on('data', d => (out += d));
    p.stderr.on('data', d => (err += d));
    p.on('close', code => (code === 0 ? resolve(out.trim()) : reject(new Error(err || `exit ${code}`))));
    p.stdin.end(prompt);
  });
}

createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return res.writeHead(204, cors).end();
  if (req.method !== 'POST' || req.headers['x-proxy-secret'] !== PROXY_SECRET) {
    return res.writeHead(401, cors).end();
  }
  try {
    let body = '';
    for await (const chunk of req) body += chunk;
    const { system = '', messages } = JSON.parse(body);
    const text = await askClaude(system, messages);
    res.writeHead(200, { ...cors, 'Content-Type': 'application/json' }).end(JSON.stringify({ text }));
  } catch (e) {
    res.writeHead(500, cors).end(String(e.message));
  }
}).listen(PORT, () => console.log(`claude proxy on :${PORT}`));
