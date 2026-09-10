import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { CheckCircle2, MessageCircle, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/AsyncState';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatMoney, localizeProduct } from '@/lib/catalog';
import { buildWhatsAppMessage, createOrder, getWhatsAppUrl } from '@/services/orderService';
import { trackEvent } from '@/services/analyticsService';

const initial = { customerName: '', customerPhone: '', customerAddress: '', notes: '', website: '' };

export default function Checkout() {
  const { t, language } = useLanguage();
  const { items, subtotal, clearCart } = useCart();
  const [form, setForm] = useState(initial);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [completed, setCompleted] = useState(null);
  useEffect(() => { if (items.length) trackEvent('checkout_started'); }, [items.length]);

  function update(event) { setForm((value) => ({ ...value, [event.target.name]: event.target.value })); }
  async function submit(event) {
    event.preventDefault();
    if (status === 'submitting') return;
    const name = form.customerName.trim(); const phone = form.customerPhone.trim();
    if (name.length < 2 || name.length > 100 || phone.length < 6 || phone.length > 30 || form.customerAddress.length > 300 || form.notes.length > 1000 || items.length === 0) { setError(t('invalidForm')); return; }
    setStatus('submitting'); setError('');
    try {
      const order = await createOrder({ customerName: name, customerPhone: phone, customerAddress: form.customerAddress.trim(), notes: form.notes.trim(), items, language, honeypot: form.website });
      const message = buildWhatsAppMessage(order, language); const url = getWhatsAppUrl(message);
      setCompleted({ order, url }); clearCart(); setStatus('success');
      if (url) { const opened = window.open(url, '_blank', 'noopener,noreferrer'); if (opened) trackEvent('whatsapp_order_opened', { metadata: { order_id: order.id } }); }
    } catch { setStatus('error'); setError(t('unable')); }
  }
  function openWhatsApp() { if (!completed?.url) return; trackEvent('whatsapp_order_opened', { metadata: { order_id: completed.order.id } }); window.open(completed.url, '_blank', 'noopener,noreferrer'); }

  if (completed) return <div className="page-shell"><section className="section-space"><div className="content-shell max-w-2xl"><div className="surface-card p-7 text-center sm:p-10"><CheckCircle2 className="mx-auto h-14 w-14 text-green-600 dark:text-green-400" /><h1 className="mt-5 text-3xl font-bold">{t('orderSuccess')}</h1><p className="mt-3 text-lg text-muted-foreground">{t('orderNumber')}: <strong dir="ltr">#{completed.order.id}</strong></p><p className="mt-2 text-2xl font-bold text-primary" dir="ltr">{formatMoney(completed.order.total_amount, language)}</p>{completed.url && <Button type="button" onClick={openWhatsApp} size="lg" className="mt-7 w-full gap-2 sm:w-auto"><MessageCircle className="h-5 w-5" />{t('openWhatsApp')}</Button>}<p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-muted-foreground">{t('whatsappHint')}</p><div className="mt-6"><Button asChild variant="ghost"><Link to="/products">{t('continueShopping')}</Link></Button></div></div></div></section></div>;
  if (!items.length) return <><Helmet><title>{t('checkoutTitle')} | Daniya</title><meta name="robots" content="noindex,nofollow" /></Helmet><div className="page-shell"><section className="section-space"><div className="content-shell"><EmptyState message={t('cartEmpty')} action={<Button asChild><Link to="/products">{t('continueShopping')}</Link></Button>} /></div></section></div></>;

  return (
    <>
      <Helmet><title>{t('checkoutTitle')} | Daniya</title><meta name="robots" content="noindex,nofollow" /></Helmet>
      <div className="page-shell"><section className="section-space"><div className="content-shell"><div className="mb-8"><span className="section-kicker"><ShieldCheck className="me-1 h-4 w-4" />Daniya</span><h1 className="section-title">{t('checkoutTitle')}</h1><p className="section-copy">{t('checkoutSubtitle')}</p></div><form onSubmit={submit} className="grid items-start gap-8 lg:grid-cols-[1fr_380px]" noValidate><div className="surface-card grid gap-5 p-6 sm:p-8"><div><label className="form-label" htmlFor="customer-name">{t('customerName')} *</label><input id="customer-name" name="customerName" value={form.customerName} onChange={update} className="form-control" minLength="2" maxLength="100" autoComplete="name" required /></div><div><label className="form-label" htmlFor="customer-phone">{t('customerPhone')} *</label><input id="customer-phone" name="customerPhone" value={form.customerPhone} onChange={update} className="form-control" minLength="6" maxLength="30" autoComplete="tel" type="tel" dir="ltr" required /></div><div><label className="form-label" htmlFor="customer-address">{t('customerAddress')}</label><textarea id="customer-address" name="customerAddress" value={form.customerAddress} onChange={update} className="form-control min-h-24" maxLength="300" autoComplete="street-address" /></div><div><label className="form-label" htmlFor="customer-notes">{t('notes')}</label><textarea id="customer-notes" name="notes" value={form.notes} onChange={update} className="form-control min-h-28" maxLength="1000" /></div><div className="absolute -left-[10000px]" aria-hidden="true"><label htmlFor="checkout-website">Website</label><input id="checkout-website" name="website" value={form.website} onChange={update} tabIndex="-1" autoComplete="off" /></div>{error && <p role="alert" className="text-destructive">{error}</p>}</div><aside className="surface-card sticky top-28 p-6"><h2 className="text-xl font-bold">{t('orderSummary')}</h2><ul className="mt-5 divide-y divide-border">{items.map((item) => { const product = localizeProduct(item, language); return <li key={item.id} className="flex justify-between gap-4 py-3 text-sm"><span>{product.displayName} × {item.quantity}</span><span className="shrink-0" dir="ltr">{formatMoney(item.price * item.quantity, language)}</span></li>; })}</ul><div className="mt-4 flex justify-between border-t border-border pt-4 text-xl font-bold"><span>{t('total')}</span><span className="text-primary" dir="ltr">{formatMoney(subtotal, language)}</span></div><Button type="submit" size="lg" disabled={status === 'submitting'} className="mt-6 w-full">{status === 'submitting' ? t('placingOrder') : t('placeOrder')}</Button><p className="mt-3 text-xs leading-5 text-muted-foreground">{t('whatsappHint')}</p></aside></form></div></section></div>
    </>
  );
}
