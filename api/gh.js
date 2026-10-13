// Password login for the admin panel.
// The GitHub token never reaches the browser: it lives in the host's environment variables, and this
// function forwards the few GitHub calls the panel needs once the visitor has proved the password.
//
// Environment variables (set them in Vercel → Project → Settings → Environment Variables):
//   ADMIN_PASSWORD  the password given to the site owner
//   GITHUB_TOKEN    fine-grained token for this repository with "Contents: Read and write"
//   GITHUB_REPO     optional, defaults to the repository below
import crypto from 'node:crypto';

const REPO = process.env.GITHUB_REPO || 'dolsekashow-create/Luxury-Travel-Service-';
const SESSION_HOURS = 12;
// Only what the panel uses: read the repo, read/write git objects, move the branch, read the data files.
const ALLOWED = [
  /^$/,
  /^\/git\/ref\/heads\/[\w./-]+$/,
  /^\/git\/refs\/heads\/[\w./-]+$/,
  /^\/git\/commits(\/[0-9a-f]{40})?$/,
  /^\/git\/trees(\/[0-9a-f]{40})?$/,
  /^\/git\/blobs$/,
  /^\/contents\/src\/data\/[\w.-]+\.json$/,
];

const key = () => crypto.createHash('sha256').update(`${process.env.ADMIN_PASSWORD}\n${process.env.GITHUB_TOKEN}`).digest();
const sign = (value) => crypto.createHmac('sha256', key()).update(value).digest('base64url');
const equal = (a, b) => {
  const x = crypto.createHash('sha256').update(String(a)).digest();
  const y = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(x, y);
};
function validSession(header) {
  const [exp, mac] = String(header || '').replace(/^Bearer /, '').split('.');
  return !!exp && !!mac && equal(mac, sign(exp)) && Number(exp) > Date.now();
}
const send = (res, status, body) => res.status(status).setHeader('Cache-Control', 'no-store').json(body);

export default async function handler(req, res) {
  if (!process.env.ADMIN_PASSWORD || !process.env.GITHUB_TOKEN) {
    return send(res, 501, { message: 'Password login is not set up yet: add ADMIN_PASSWORD and GITHUB_TOKEN to the hosting environment variables, then redeploy.' });
  }
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};

  if (req.query.login !== undefined) {
    if (req.method !== 'POST') return send(res, 405, { message: 'POST only' });
    if (!equal(body.password ?? '', process.env.ADMIN_PASSWORD)) {
      await new Promise((r) => setTimeout(r, 1200)); // slows down guessing
      return send(res, 401, { message: 'Wrong password.' });
    }
    const exp = String(Date.now() + SESSION_HOURS * 3600 * 1000);
    return send(res, 200, { session: `${exp}.${sign(exp)}`, repo: REPO });
  }

  if (!validSession(req.headers.authorization)) return send(res, 401, { message: 'Session expired. Please sign in again.' });
  const path = String(req.query.path ?? '');
  const [pathname, search = ''] = path.split('?');
  if (pathname.includes('..') || !ALLOWED.some((re) => re.test(pathname)) || !/^[\w=&.-]*$/.test(search)) return send(res, 403, { message: 'This request is not allowed.' });
  if (!['GET', 'POST', 'PATCH'].includes(req.method)) return send(res, 405, { message: 'Method not allowed' });

  const upstream = await fetch(`https://api.github.com/repos/${REPO}${pathname}${search ? '?' + search : ''}`, {
    method: req.method,
    headers: {
      Accept: req.query.raw ? 'application/vnd.github.raw+json' : 'application/vnd.github+json',
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'lts-admin',
      ...(req.method === 'GET' ? {} : { 'Content-Type': 'application/json' }),
    },
    body: req.method === 'GET' ? undefined : JSON.stringify(body),
  });
  res.status(upstream.status).setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json');
  res.send(await upstream.text());
}
