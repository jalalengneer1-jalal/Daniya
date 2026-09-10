import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { isSafeHttpUrl } from '@/lib/catalog';

export default function AdvertisementSlider({ advertisements = [] }) {
  const { t, direction } = useLanguage();
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const ads = advertisements.filter((item) => isSafeHttpUrl(item.image_url, { allowEmpty: false }));

  useEffect(() => {
    if (index >= ads.length) setIndex(0);
  }, [ads.length, index]);

  useEffect(() => {
    if (!playing || ads.length < 2) return undefined;
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % ads.length), 5500);
    return () => window.clearInterval(timer);
  }, [ads.length, playing]);

  if (!ads.length) return null;
  const current = ads[index];
  const previous = () => setIndex((value) => (value - 1 + ads.length) % ads.length);
  const next = () => setIndex((value) => (value + 1) % ads.length);
  const image = <img key={current.id} src={current.image_url} alt={`${t('brand')} — ${index + 1}`} className="h-full w-full object-cover" decoding="async" fetchPriority={index === 0 ? 'high' : 'auto'} />;

  return (
    <div className="relative aspect-[16/10] overflow-hidden rounded-3xl bg-muted shadow-2xl" role="region" aria-roledescription="carousel" aria-label={t('advertisements')} onKeyDown={(event) => { if (event.key === 'ArrowLeft') (direction === 'rtl' ? next : previous)(); if (event.key === 'ArrowRight') (direction === 'rtl' ? previous : next)(); }} tabIndex="0">
      {isSafeHttpUrl(current.link) && current.link ? <a href={current.link} target="_blank" rel="noopener noreferrer" className="block h-full">{image}</a> : image}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
      {ads.length > 1 && <>
        <Button type="button" variant="ghost" size="icon" onClick={previous} aria-label={t('previous')} className="absolute top-1/2 -translate-y-1/2 rounded-full bg-black/35 text-white hover:bg-black/55 [inset-inline-start:1rem]">
          {direction === 'rtl' ? <ChevronRight /> : <ChevronLeft />}
        </Button>
        <Button type="button" variant="ghost" size="icon" onClick={next} aria-label={t('next')} className="absolute top-1/2 -translate-y-1/2 rounded-full bg-black/35 text-white hover:bg-black/55 [inset-inline-end:1rem]">
          {direction === 'rtl' ? <ChevronLeft /> : <ChevronRight />}
        </Button>
        <div className="absolute bottom-4 flex items-center gap-2 [inset-inline-start:1rem]">
          <Button type="button" variant="ghost" size="icon" onClick={() => setPlaying((value) => !value)} aria-label={playing ? t('pause') : t('play')} className="h-9 w-9 rounded-full bg-black/35 text-white hover:bg-black/55">
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
        </div>
        <div className="absolute bottom-5 flex gap-2 [inset-inline-end:1rem]">
          {ads.map((ad, dot) => <button key={ad.id} type="button" onClick={() => setIndex(dot)} aria-label={`${dot + 1}`} aria-current={dot === index ? 'true' : undefined} className={`h-2.5 rounded-full transition-all ${dot === index ? 'w-7 bg-white' : 'w-2.5 bg-white/55 hover:bg-white'}`} />)}
        </div>
      </>}
    </div>
  );
}
