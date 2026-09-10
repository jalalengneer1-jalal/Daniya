import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Grid2X2, List, Search, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '@/components/ProductCard';
import { EmptyState, ErrorState, LoadingState } from '@/components/AsyncState';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { CATEGORIES, localizeProduct, normalizeCategory } from '@/lib/catalog';
import { useAsync } from '@/hooks/useAsync';
import { listProducts } from '@/services/productService';
import { trackEvent } from '@/services/analyticsService';

export default function Products() {
  const { t, language } = useLanguage();
  const [params, setParams] = useSearchParams();
  const initialCategory = normalizeCategory(params.get('category'));
  const [search, setSearch] = useState((params.get('search') || '').slice(0, 80));
  const [category, setCategory] = useState(CATEGORIES.includes(initialCategory) ? initialCategory : 'all');
  const [mode, setMode] = useState('grid');
  const products = useAsync(listProducts, []);

  useEffect(() => {
    const query = (params.get('search') || '').slice(0, 80);
    const nextCategory = normalizeCategory(params.get('category'));
    setSearch(query);
    setCategory(CATEGORIES.includes(nextCategory) ? nextCategory : 'all');
  }, [params]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const next = new URLSearchParams();
      if (search.trim()) next.set('search', search.trim());
      if (category !== 'all') next.set('category', category);
      if (next.toString() !== params.toString()) setParams(next, { replace: true });
      if (search.trim().length >= 2) trackEvent('product_search', { metadata: { query_length: search.trim().length } });
    }, 350);
    return () => window.clearTimeout(timer);
  }, [category, params, search, setParams]);

  const filtered = useMemo(() => (products.data || []).filter((product) => {
    const localized = localizeProduct(product, language);
    const haystack = [product.name, product.name_en, product.name_fr, localized.displayDescription].filter(Boolean).join(' ').toLocaleLowerCase(language);
    return (!search.trim() || haystack.includes(search.trim().toLocaleLowerCase(language))) && (category === 'all' || normalizeCategory(product.category) === category);
  }), [category, language, products.data, search]);

  function selectCategory(next) {
    setCategory(next);
    if (next !== 'all') trackEvent('category_filter', { category: next });
  }

  return (
    <>
      <Helmet><title>{t('productsTitle')} | Daniya</title><meta name="description" content={t('productsSubtitle')} /></Helmet>
      <div className="page-shell">
        <section className="hero-pattern border-b border-border/70 py-12 sm:py-16"><div className="content-shell text-center"><span className="section-kicker">Daniya</span><h1 className="section-title">{t('productsTitle')}</h1><p className="section-copy mx-auto">{t('productsSubtitle')}</p></div></section>
        <section className="sticky top-20 z-30 border-b border-border bg-background/95 py-4 backdrop-blur"><div className="content-shell"><div className="flex flex-col gap-4 lg:flex-row lg:items-center"><div className="relative min-w-0 flex-1"><Search className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground [inset-inline-start:.85rem]" /><label htmlFor="product-search" className="sr-only">{t('searchProducts')}</label><input id="product-search" value={search} maxLength="80" onChange={(event) => setSearch(event.target.value)} placeholder={t('searchProducts')} className="form-control [padding-inline-start:2.5rem]" />{search && <button type="button" onClick={() => setSearch('')} aria-label={t('clearFilters')} className="absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground [inset-inline-end:.8rem]"><X className="h-4 w-4" /></button>}</div><div className="no-scrollbar flex max-w-full gap-2 overflow-x-auto pb-1">{['all', ...CATEGORIES].map((item) => <button key={item} type="button" onClick={() => selectCategory(item)} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${category === item ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card hover:border-primary/60'}`}>{item === 'all' ? t('all') : t(`category_${item}`)}</button>)}</div><div className="flex shrink-0 gap-1 self-end rounded-xl border border-border bg-card p-1 lg:self-auto"><Button type="button" size="icon" variant={mode === 'grid' ? 'default' : 'ghost'} onClick={() => setMode('grid')} aria-label={t('gridView')}><Grid2X2 className="h-4 w-4" /></Button><Button type="button" size="icon" variant={mode === 'list' ? 'default' : 'ghost'} onClick={() => setMode('list')} aria-label={t('listView')}><List className="h-4 w-4" /></Button></div></div></div></section>
        <section className="section-space"><div className="content-shell">{products.status === 'loading' && <LoadingState />}{products.status === 'error' && <ErrorState onRetry={products.reload} />}{products.status === 'success' && filtered.length === 0 && <EmptyState message={t('noProducts')} action={<Button type="button" variant="outline" onClick={() => { setSearch(''); setCategory('all'); }}>{t('clearFilters')}</Button>} />}{products.status === 'success' && filtered.length > 0 && <div className={mode === 'grid' ? 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3' : 'grid gap-5'}>{filtered.map((product) => <ProductCard key={product.id} product={{ ...product, category: normalizeCategory(product.category) }} mode={mode} />)}</div>}</div></section>
      </div>
    </>
  );
}
