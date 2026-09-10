import { requireSupabase } from '@/lib/supabase';

export class PublicServiceError extends Error {
  constructor(code = 'REQUEST_FAILED') {
    super(code);
    this.name = 'PublicServiceError';
  }
}

export function client() {
  try {
    return requireSupabase();
  } catch {
    throw new PublicServiceError('NOT_CONFIGURED');
  }
}

export function assertSuccess(error) {
  if (error) {
    if (import.meta.env.DEV) console.error('[Daniya data error]', error.code || error.name || 'unknown');
    throw new PublicServiceError();
  }
}
