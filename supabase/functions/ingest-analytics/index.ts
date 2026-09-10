import { corsHeaders, isAllowedOrigin, json, readJson } from '../_shared/http.ts';
import { cleanText, rateLimit, serviceClient } from '../_shared/security.ts';

const events = new Set(['page_view','product_view','product_click','product_search','category_filter','add_to_cart','remove_from_cart','cart_view','checkout_started','whatsapp_order_opened']);
const languages = new Set(['ar','en','fr']); const devices = new Set(['mobile','tablet','desktop']);

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(request) });
  if (request.method !== 'POST') return json(request, { ok: false, error: 'METHOD_NOT_ALLOWED' }, 405);
  if (!isAllowedOrigin(request)) return json(request, { ok: false, error: 'ORIGIN_NOT_ALLOWED' }, 403);
  try {
    if (!await rateLimit(request, 'analytics', 240, 60)) return json(request, { ok: false, error: 'RATE_LIMITED' }, 429);
    const body = await readJson(request, 4_096) as Record<string, unknown>;
    const eventType = cleanText(body.event_type, 40);
    const sessionId = cleanText(body.session_id, 36);
    if (!events.has(eventType) || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(sessionId)) return json(request, { ok: false, error: 'VALIDATION_FAILED' }, 400);
    const productId = body.product_id == null ? null : Number(body.product_id);
    if (productId != null && (!Number.isSafeInteger(productId) || productId < 1)) return json(request, { ok: false, error: 'VALIDATION_FAILED' }, 400);
    const rawMetadata = body.metadata && typeof body.metadata === 'object' && !Array.isArray(body.metadata) ? body.metadata as Record<string, unknown> : {};
    const metadata: Record<string, string | number> = {};
    if (eventType === 'product_search' && Number.isInteger(Number(rawMetadata.query_length))) metadata.query_length = Math.min(80, Number(rawMetadata.query_length));
    if (eventType === 'whatsapp_order_opened' && Number.isSafeInteger(Number(rawMetadata.order_id))) metadata.order_id = Number(rawMetadata.order_id);
    const row = {
      event_type: eventType, product_id: productId, category: cleanText(body.category, 40) || null,
      page: cleanText(body.page, 180) || null, session_id: sessionId,
      language: languages.has(body.language as string) ? body.language : null,
      device_type: devices.has(body.device_type as string) ? body.device_type : null,
      referrer: cleanText(body.referrer, 180) || null, metadata,
    };
    const { error } = await serviceClient().from('analytics_events').insert(row);
    if (error) return json(request, { ok: false, error: 'UNABLE_TO_COMPLETE' }, 500);
    return json(request, { ok: true }, 201);
  } catch (error) {
    if (error instanceof SyntaxError || ['INVALID_PAYLOAD','PAYLOAD_TOO_LARGE','INVALID_CONTENT_TYPE'].includes((error as Error).message)) return json(request, { ok: false, error: 'VALIDATION_FAILED' }, 400);
    console.error('ingest-analytics failed', (error as Error).name);
    return json(request, { ok: false, error: 'UNABLE_TO_COMPLETE' }, 500);
  }
});
