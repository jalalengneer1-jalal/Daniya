import React, { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Image as ImageIcon, PlayCircle } from 'lucide-react';
import { EmptyState, ErrorState, LoadingState } from '@/components/AsyncState';
import { useLanguage } from '@/contexts/LanguageContext';
import { localizeGallery } from '@/lib/catalog';
import { useAsync } from '@/hooks/useAsync';
import { listGallery } from '@/services/galleryService';

export default function Gallery() {
  const { t, language } = useLanguage();
  const gallery = useAsync(listGallery, []);
  const [category, setCategory] = useState('all');
  const categories = useMemo(() => ['all', ...new Set((gallery.data || []).map((item) => item.category || 'products'))], [gallery.data]);
  const filtered = (gallery.data || []).filter((item) => category === 'all' || item.category === category);
  return (
    <>
      <Helmet><title>{t('galleryTitle')} | Daniya</title><meta name="description" content={t('gallerySubtitle')} /></Helmet>
      <div className="page-shell">
        <section className="hero-pattern border-b border-border/70 py-12 sm:py-16"><div className="content-shell text-center"><span className="section-kicker">Daniya</span><h1 className="section-title">{t('galleryTitle')}</h1><p className="section-copy mx-auto">{t('gallerySubtitle')}</p></div></section>
        <section className="section-space"><div className="content-shell"><div className="no-scrollbar mb-8 flex gap-2 overflow-x-auto pb-2">{categories.map((item) => <button type="button" key={item} onClick={() => setCategory(item)} className={`shrink-0 rounded-full border px-5 py-2 text-sm font-semibold ${category === item ? 'border-primary bg-primary text-primary-foreground' : 'bg-card hover:border-primary/60'}`}>{item === 'all' ? t('all') : t(`category_${item}`)}</button>)}</div>{gallery.status === 'loading' && <LoadingState />}{gallery.status === 'error' && <ErrorState onRetry={gallery.reload} />}{gallery.status === 'success' && filtered.length === 0 && <EmptyState message={t('galleryEmpty')} />}{gallery.status === 'success' && filtered.length > 0 && <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">{filtered.map((raw) => { const item = localizeGallery(raw, language); return <figure key={item.id} className="surface-card mb-5 break-inside-avoid overflow-hidden"><div className="relative min-h-48 bg-muted">{item.media_type === 'video' ? <video src={item.publicUrl} controls preload="metadata" playsInline className="max-h-[34rem] w-full object-cover">{t('mediaUnavailable')}</video> : <img src={item.publicUrl} alt={item.displayTitle} loading="lazy" decoding="async" className="max-h-[34rem] w-full object-cover" />}<span className="absolute top-3 rounded-full bg-black/55 p-2 text-white [inset-inline-end:.75rem]">{item.media_type === 'video' ? <PlayCircle className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}</span></div>{item.displayTitle && <figcaption className="p-5 text-lg font-bold">{item.displayTitle}</figcaption>}</figure>; })}</div>}</div></section>
      </div>
    </>
  );
}
