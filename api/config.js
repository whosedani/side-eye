// Vercel Serverless Function — /api/config
// GET: returns public config (ca, twitter, community)
// POST: updates config (requires X-Admin-Hash header matching ADMIN_HASH env)

const KV_URL = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;
const ADMIN_HASH = process.env.ADMIN_HASH; // SHA-256 hex of admin password

const KV_KEY = 'seye:config';

async function kvGet() {
  const res = await fetch(`${KV_URL}/get/${KV_KEY}`, {
    headers: { Authorization: `Bearer ${KV_TOKEN}` }
  });
  if (!res.ok) return { ca: '', twitter: '', community: '' };
  const data = await res.json();
  if (data.result) {
    try {
      return JSON.parse(data.result);
    } catch (_) {
      return { ca: '', twitter: '', community: '' };
    }
  }
  return { ca: '', twitter: '', community: '' };
}

async function kvSet(value) {
  const encoded = JSON.stringify(value);
  const res = await fetch(`${KV_URL}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${KV_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(["SET", KV_KEY, encoded])
  });
  if (!res.ok) {
    throw new Error('KV write failed');
  }
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Hash');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET — public, no auth needed
  if (req.method === 'GET') {
    const hash = req.headers['x-admin-hash'];

    // If auth header present, verify it (for admin panel login check)
    if (hash) {
      if (!ADMIN_HASH || hash !== ADMIN_HASH) {
        return res.status(401).json({ error: 'unauthorized' });
      }
    }

    try {
      const config = await kvGet();
      return res.status(200).json(config);
    } catch (e) {
      return res.status(200).json({ ca: '', twitter: '', community: '' });
    }
  }

  // POST — requires auth
  if (req.method === 'POST') {
    const hash = req.headers['x-admin-hash'];
    if (!ADMIN_HASH || !hash || hash !== ADMIN_HASH) {
      return res.status(401).json({ error: 'unauthorized' });
    }

    try {
      const { ca, twitter, community } = req.body || {};
      const config = {
        ca: (ca || '').slice(0, 256),
        twitter: (twitter || '').slice(0, 512),
        community: (community || '').slice(0, 512)
      };
      await kvSet(config);
      return res.status(200).json({ ok: true });
    } catch (e) {
      return res.status(500).json({ error: 'failed to save' });
    }
  }

  return res.status(405).json({ error: 'method not allowed' });
};
