import { isSupabaseConfigured, supabase } from '@/lib/supabase';

const allowedEvents = new Set([
  'page_view', 'product_view', 'product_click', 'product_search', 'category_filter',
  'add_to_cart', 'remove_from_cart', 'cart_view', 'checkout_started',
  'whatsapp_order_opened',
]);

export function getAnalyticsSessionId() {
  const key = 'daniya-analytics-session';
  let value = sessionStorage.getItem(key);
  if (!value) {
    value = crypto.randomUUID();
    sessionStorage.setItem(key, value);
  }
  return value;
}

function deviceType() {
  if (window.matchMedia('(max-width: 639px)').matches) return 'mobile';
  if (window.matchMedia('(max-width: 1023px)').matches) return 'tablet';
  return 'desktop';
}

export function trackEvent(eventType, options = {}) {
  if (!isSupabaseConfigured || !allowedEvents.has(eventType)) return;
  const payload = {
    event_type: eventType,
    product_id: options.productId ?? null,
    category: options.category ? String(options.category).slice(0, 40) : null,
    page: String(options.page || `${window.location.pathname}${window.location.search}`).slice(0, 180),
    session_id: getAnalyticsSessionId(),
    language: document.documentElement.lang || 'ar',
    device_type: deviceType(),
    referrer: document.referrer ? new URL(document.referrer).origin.slice(0, 180) : null,
    metadata: options.metadata && typeof options.metadata === 'object' ? options.metadata : {},
  };
  supabase.functions.invoke('ingest-analytics', { body: payload }).catch(() => {});
}
