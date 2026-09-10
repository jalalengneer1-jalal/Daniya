import { assertSuccess, client } from './serviceUtils';
import { getAnalyticsSessionId } from './analyticsService';

export async function createOrder({ customerName, customerPhone, customerAddress, notes, items, language, honeypot = '' }) {
  const payload = {
    customer_name: customerName,
    customer_phone: customerPhone,
    customer_address: customerAddress,
    notes,
    language,
    session_id: getAnalyticsSessionId(),
    website: honeypot,
    items: items.map((item) => ({ product_id: item.id, quantity: item.quantity })),
  };
  const { data, error } = await client().functions.invoke('create-order', { body: payload });
  assertSuccess(error || (!data?.ok ? new Error('order rejected') : null));
  return data.order;
}

export function buildWhatsAppMessage(order, language) {
  const lines = language === 'ar'
    ? [
        'دانية - طلب جديد', '', `رقم الطلب: #${order.id}`, '', 'العميل:',
        `الاسم: ${order.customer_name}`, `الهاتف: ${order.customer_phone}`, '', 'المنتجات:', '',
        ...order.items.flatMap((item, index) => [
          `${index + 1}. ${item.product_name}`,
          `الكمية: ${item.quantity}`,
          `سعر الوحدة: ${item.unit_price} DJF`,
          `الإجمالي: ${item.line_total} DJF`, '',
        ]),
        `إجمالي الطلب: ${order.total_amount} DJF`, '',
        `العنوان: ${order.customer_address || '—'}`, '', `ملاحظات: ${order.notes || '—'}`, '',
        `تاريخ الطلب: ${new Date(order.created_at).toLocaleString('ar-DJ')}`,
      ]
    : [
        'Daniya - New Order', '', `Order Number: #${order.id}`, '', 'Customer:',
        `Name: ${order.customer_name}`, `Phone: ${order.customer_phone}`, '', 'Products:', '',
        ...order.items.flatMap((item, index) => [
          `${index + 1}. ${item.product_name}`,
          `Quantity: ${item.quantity}`,
          `Unit Price: ${item.unit_price} DJF`,
          `Total: ${item.line_total} DJF`, '',
        ]),
        `Order Total: ${order.total_amount} DJF`, '',
        `Address: ${order.customer_address || '—'}`, '', `Notes: ${order.notes || '—'}`, '',
        `Order Date: ${new Date(order.created_at).toLocaleString(language === 'fr' ? 'fr-DJ' : 'en-DJ')}`,
      ];
  return lines.join('\n');
}

export function getWhatsAppUrl(message) {
  const number = String(import.meta.env.VITE_WHATSAPP_ORDER_NUMBER || '').replace(/\D/g, '');
  if (!number) return '';
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
