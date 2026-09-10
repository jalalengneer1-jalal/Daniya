const defaults = [
  'https://daniaspices.shop',
  'https://www.daniaspices.shop',
  'http://127.0.0.1:5173',
  'http://localhost:5173',
];

function origins() {
  const configured = Deno.env.get('ALLOWED_ORIGINS')?.split(',').map((item) => item.trim()).filter(Boolean);
  return new Set(configured?.length ? configured : defaults);
}

export function corsHeaders(request: Request) {
  const origin = request.headers.get('origin');
  const allowed = origins();
  return {
    ...(origin && allowed.has(origin) ? { 'Access-Control-Allow-Origin': origin } : {}),
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  };
}

export function isAllowedOrigin(request: Request) {
  const origin = request.headers.get('origin');
  return !origin || origins().has(origin);
}

export function json(request: Request, body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders(request) });
}

export async function readJson(request: Request, maxBytes = 16_384) {
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) throw new Error('INVALID_CONTENT_TYPE');
  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > maxBytes) throw new Error('PAYLOAD_TOO_LARGE');
  const text = await request.text();
  if (!text || new TextEncoder().encode(text).byteLength > maxBytes) throw new Error('INVALID_PAYLOAD');
  return JSON.parse(text);
}
