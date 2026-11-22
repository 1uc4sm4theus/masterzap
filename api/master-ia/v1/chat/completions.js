const DEFAULT_UPSTREAM_URL =
  'https://4En3bRYyfZ7s7DL7amhdTwAELdZsWywxSMusuchVtihc.node.k8s.prd.nos.ci/v1/chat/completions';

const ALLOWED_ORIGINS = new Set([
  'https://masterwhats.recomendeme.com.br',
  'https://www.masterwhats.com.br',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
]);

function applyCors(req, res) {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');
}

export default async function handler(req, res) {
  applyCors(req, res);

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    res.status(405).json({ error: 'Método não permitido.' });
    return;
  }

  const upstreamUrl =
    process.env.MASTER_IA_UPSTREAM_URL || DEFAULT_UPSTREAM_URL;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const upstream = await fetch(upstreamUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
      signal: controller.signal,
    });
    const contentType =
      upstream.headers.get('content-type') || 'application/json';
    const body = await upstream.text();

    res.setHeader('Content-Type', contentType);
    res.status(upstream.status).send(body);
  } catch (error) {
    const message =
      error?.name === 'AbortError'
        ? 'A análise demorou mais que o tempo esperado.'
        : 'Não foi possível concluir a resposta da Master IA.';
    res.status(502).json({ error: message });
  } finally {
    clearTimeout(timeout);
  }
}
