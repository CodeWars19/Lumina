/**
 * Proxies Gemini generateContent. Key from Vercel env GEMINI_API_KEY.
 * POST JSON: { model?: string, payload: object }
 * Optional env: GEMINI_MODEL (overrides client model).
 */

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    if (Buffer.isBuffer(req.body)) {
      try {
        resolve(req.body.length ? JSON.parse(req.body.toString('utf8')) : {});
      } catch (e) {
        reject(e);
      }
      return;
    }
    if (typeof req.body === 'string') {
      try {
        resolve(req.body ? JSON.parse(req.body) : {});
      } catch (e) {
        reject(e);
      }
      return;
    }
    if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
      resolve(req.body);
      return;
    }
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8');
        if (raw) {
          resolve(JSON.parse(raw));
          return;
        }
        resolve(req.body && typeof req.body === 'object' ? req.body : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey) {
    return res.status(500).json({
      error: 'GEMINI_API_KEY is not set in Vercel environment variables.'
    });
  }

  let body;
  try {
    body = await readRequestBody(req);
  } catch {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  const payload = body?.payload;
  if (!payload || typeof payload !== 'object') {
    return res.status(400).json({
      error: 'Missing payload. Expected { model?, payload: { contents, ... } }'
    });
  }

  const model = (process.env.GEMINI_MODEL || body.model || 'gemini-2.5-flash').trim();
  const keyQs = `key=${encodeURIComponent(apiKey)}`;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?${keyQs}`;

  const upstream = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey
    },
    body: JSON.stringify(payload)
  });

  const text = await upstream.text();
  res.status(upstream.status);
  res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json');
  return res.send(text);
};
