/**
 * Proxies Gemini generateContent so the API key stays in Vercel env (GEMINI_API_KEY).
 * POST body: { model: string, payload: object } — payload is the Gemini JSON body.
 */
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey) {
    return res.status(500).json({
      error: 'GEMINI_API_KEY is not set. Add it under Vercel → Project → Settings → Environment Variables.'
    });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: 'Invalid JSON body' });
    }
  }

  const payload = body?.payload;
  if (!payload || typeof payload !== 'object') {
    return res.status(400).json({ error: 'Missing payload' });
  }

  // Prefer GEMINI_MODEL from Vercel so you can fix 403s without redeploying the HTML.
  const model = (process.env.GEMINI_MODEL || body.model || '').trim();
  if (!model) {
    return res.status(400).json({ error: 'Missing model (set GEMINI_MODEL in Vercel or send model in body)' });
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

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
