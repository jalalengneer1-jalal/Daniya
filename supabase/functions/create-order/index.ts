import { corsHeaders, isAllowedOrigin, json, readJson } from '../_shared/http.ts';
import { cleanText, rateLimit, serviceClient } from '../_shared/security.ts';

const languages = new Set(['ar', 'en', 'fr']);

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(request) });
  if (request.method !== 'POST') return json(request, { ok: false, error: 'METHOD_NOT_ALLOWED' }, 405);
  if (!isAllowedOrigin(request)) return json(request, { ok: false, error: 'ORIGIN_NOT_ALLOWED' }, 403);
  try {
    if (!await rateLimit(request, 'create_order', 5, 600)) return json(request, { ok: false, error: 'RATE_LIMITED' }, 429);
    const body = await readJson(request, 16_384) as Record<string, unknown>;
    if (cleanText(body.website, 200)) return json(request, { ok: false, error: 'INVALID_REQUEST' }, 400);
    const name = cleanText(body.customer_name, 100);
    const phone = cleanText(body.customer_phone, 30);
    const address = cleanText(body.customer_address, 300);
    const notes = cleanText(body.notes, 1000);
    const language = languages.has(body.language as string) ? body.language as string : 'ar';
    const sessionId = typeof body.session_id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.session_id) ? body.session_id : null;
    if (name.length < 2 || phone.length < 6 || !Array.isArray(body.items) || body.items.length < 1 || body.items.length > 25) return json(request, { ok: false, error: 'VALIDATION_FAILED' }, 400);
    const items = body.items.map((item) => {
      const candidate = item as Record<string, unknown>;
      const productId = Number(candidate?.product_id); const quantity = Number(candidate?.quantity);
      if (!Number.isSafeInteger(productId) || productId < 1 || !Number.isInteger(quantity) || quantity < 1 || quantity > 50) throw new Error('INVALID_ITEM');
      return { product_id: productId, quantity };
    });
    if (new Set(items.map((item) => item.product_id)).size !== items.length) return json(request, { ok: false, error: 'VALIDATION_FAILED' }, 400);
    const { data, error } = await serviceClient().rpc('create_order_internal', {
      p_customer_name: name, p_customer_phone: phone, p_customer_address: address,
      p_notes: notes, p_items: items, p_language: language, p_session_id: sessionId,
    });
    if (error || !data) return json(request, { ok: false, error: 'ORDER_REJECTED' }, 400);
    return json(request, { ok: true, order: data }, 201);
  } catch (error) {
    if (error instanceof SyntaxError || ['INVALID_ITEM','INVALID_PAYLOAD','PAYLOAD_TOO_LARGE','INVALID_CONTENT_TYPE'].includes((error as Error).message)) return json(request, { ok: false, error: 'VALIDATION_FAILED' }, 400);
    console.error('create-order failed', (error as Error).name);
    return json(request, { ok: false, error: 'UNABLE_TO_COMPLETE' }, 500);
  }
});
