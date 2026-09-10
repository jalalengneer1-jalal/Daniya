import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/AsyncState';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatMoney, localizeProduct } from '@/lib/catalog';
import { trackEvent } from '@/services/analyticsService';

export default function Cart() {
  const { t, language } = useLanguage();
  const { items, setQuantity, removeItem, subtotal } = useCart();
  useEffect(() => { trackEvent('cart_view'); }, []);
  return (
    <>
      <Helmet><title>{t('cartTitle')} | Daniya</title><meta name="robots" content="noindex,follow" /></Helmet>
      <div className="page-shell"><section className="section-space"><div className="content-shell"><div className="mb-8"><span className="section-kicker"><ShoppingBag className="me-1 h-4 w-4" />Daniya</span><h1 className="section-title">{t('cartTitle')}</h1></div>{items.length === 0 ? <EmptyState message={t('cartEmpty')} action={<Button asChild><Link to="/products">{t('continueShopping')}</Link></Button>} /> : <div className="grid items-start gap-8 lg:grid-cols-[1fr_340px]"><div className="grid gap-4">{items.map((item) => { const localized = localizeProduct(item, language); return <article key={item.id} className="surface-card grid gap-4 p-4 sm:grid-cols-[110px_1fr_auto] sm:items-center"><img src={item.image} alt={localized.displayName} className="aspect-square w-full rounded-xl object-cover sm:w-[110px]" /><div><h2 className="text-lg font-bold">{localized.displayName}</h2><strong className="mt-1 block text-primary" dir="ltr">{formatMoney(item.price, language)}</strong><div className="mt-4 flex w-fit items-center rounded-full border border-border bg-background p-1"><button type="button" onClick={() => setQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1} aria-label={`${t('quantity')} -`} className="grid h-9 w-9 place-items-center rounded-full hover:bg-accent disabled:opacity-35"><Minus className="h-4 w-4" /></button><span className="min-w-9 text-center font-bold" aria-live="polite">{item.quantity}</span><button type="button" onClick={() => setQuantity(item.id, item.quantity + 1)} disabled={item.quantity >= 50} aria-label={`${t('quantity')} +`} className="grid h-9 w-9 place-items-center rounded-full hover:bg-accent disabled:opacity-35"><Plus className="h-4 w-4" /></button></div></div><div className="flex items-center justify-between gap-3 sm:block sm:text-end"><strong dir="ltr">{formatMoney(item.price * item.quantity, language)}</strong><button type="button" onClick={() => removeItem(item.id)} className="mt-0 inline-flex items-center gap-1 text-sm text-destructive hover:underline sm:mt-5" aria-label={`${t('remove')} ${localized.displayName}`}><Trash2 className="h-4 w-4" />{t('remove')}</button></div></article>; })}</div><aside className="surface-card sticky top-28 p-6"><h2 className="text-xl font-bold">{t('orderSummary')}</h2><div className="mt-5 flex justify-between border-b border-border pb-4 text-muted-foreground"><span>{t('subtotal')}</span><span dir="ltr">{formatMoney(subtotal, language)}</span></div><div className="mt-4 flex justify-between text-xl font-bold"><span>{t('total')}</span><span className="text-primary" dir="ltr">{formatMoney(subtotal, language)}</span></div><Button asChild size="lg" className="mt-6 w-full"><Link to="/checkout">{t('checkout')}</Link></Button><Button asChild variant="ghost" className="mt-2 w-full"><Link to="/products">{t('continueShopping')}</Link></Button></aside></div>}</div></section></div>
    </>
  );
}
