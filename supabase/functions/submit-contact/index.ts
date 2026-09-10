import { corsHeaders, isAllowedOrigin, json, readJson } from '../_shared/http.ts';
import { cleanText, rateLimit, serviceClient } from '../_shared/security.ts';

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(request) });
  if (request.method !== 'POST') return json(request, { ok: false, error: 'METHOD_NOT_ALLOWED' }, 405);
  if (!isAllowedOrigin(request)) return json(request, { ok: false, error: 'ORIGIN_NOT_ALLOWED' }, 403);
  try {
    if (!await rateLimit(request, 'submit_contact', 4, 600)) return json(request, { ok: false, error: 'RATE_LIMITED' }, 429);
    const body = await readJson(request, 8_192) as Record<string, unknown>;
    if (cleanText(body.website, 200)) return json(request, { ok: true }, 200);
    const name = cleanText(body.name, 100); const email = cleanText(body.email, 160);
    const phone = cleanText(body.phone, 30); const message = cleanText(body.message, 2000);
    if (name.length < 2 || message.length < 5 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json(request, { ok: false, error: 'VALIDATION_FAILED' }, 400);
    const { data, error } = await serviceClient().rpc('submit_contact_internal', { p_name: name, p_email: email, p_phone: phone, p_message: message });
    if (error || !data) return json(request, { ok: false, error: 'UNABLE_TO_COMPLETE' }, 500);
    return json(request, { ok: true }, 201);
  } catch (error) {
    if (error instanceof SyntaxError || ['INVALID_PAYLOAD','PAYLOAD_TOO_LARGE','INVALID_CONTENT_TYPE'].includes((error as Error).message)) return json(request, { ok: false, error: 'VALIDATION_FAILED' }, 400);
    console.error('submit-contact failed', (error as Error).name);
    return json(request, { ok: false, error: 'UNABLE_TO_COMPLETE' }, 500);
  }
});
