import React, { useEffect, useRef } from 'react';
import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { formatMoney, localizeProduct } from '@/lib/catalog';
import { trackEvent } from '@/services/analyticsService';
import { toast } from '@/components/ui/use-toast';

export default function ProductCard({ product, mode = 'grid' }) {
  const { language, t } = useLanguage();
  const { addItem } = useCart();
  const ref = useRef(null);
  const localized = localizeProduct(product, language);

  useEffect(() => {
    const element = ref.current;
    if (!element || !('IntersectionObserver' in window)) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        trackEvent('product_view', { productId: product.id, category: product.category });
        observer.disconnect();
      }
    }, { threshold: 0.55 });
    observer.observe(element);
    return () => observer.disconnect();
  }, [product.category, product.id]);

  function add() {
    trackEvent('product_click', { productId: product.id, category: product.category });
    addItem(product);
    toast({ title: t('addedToCart'), description: localized.displayName });
  }

  return (
    <article ref={ref} className={`surface-card group overflow-hidden ${mode === 'list' ? 'grid sm:grid-cols-[220px_1fr]' : 'flex h-full flex-col'}`}>
      <div className={`overflow-hidden bg-muted ${mode === 'list' ? 'min-h-48' : 'aspect-[4/3]'}`}>
        <img src={product.image} alt={localized.displayName} loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.035]" />
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <span className="mb-2 text-xs font-bold uppercase tracking-wider text-primary">{t(`category_${product.category}`)}</span>
        <h2 className="text-xl font-bold">{localized.displayName}</h2>
        {localized.displayDescription && <p className="mt-2 line-clamp-3 leading-7 text-muted-foreground">{localized.displayDescription}</p>}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-5">
          <strong className="text-lg text-primary" dir="ltr">{formatMoney(product.price, language)}</strong>
          <Button type="button" onClick={add} className="gap-2"><ShoppingBag className="h-4 w-4" />{t('addToCart')}</Button>
        </div>
      </div>
    </article>
  );
}
