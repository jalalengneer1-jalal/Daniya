import { createClient } from 'npm:@supabase/supabase-js@2.50.3';

export function serviceClient() {
  const url = Deno.env.get('SUPABASE_URL');
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) throw new Error('SERVER_CONFIG');
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

async function sha256(value: string) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function requestAddress(request: Request) {
  return request.headers.get('cf-connecting-ip') || request.headers.get('x-real-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}

export async function rateLimit(request: Request, scope: string, limit: number, windowSeconds: number) {
  const salt = Deno.env.get('RATE_LIMIT_SALT');
  if (!salt || salt.length < 32) throw new Error('SERVER_CONFIG');
  const keyHash = await sha256(`${salt}:${requestAddress(request)}`);
  const { data, error } = await serviceClient().rpc('consume_rate_limit', {
    p_scope: scope, p_key_hash: keyHash, p_limit: limit, p_window_seconds: windowSeconds,
  });
  return !error && data === true;
}

export function cleanText(value: unknown, maxLength: number) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLength);
}
