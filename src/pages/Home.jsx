import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Award, ArrowUpRight, HeartHandshake, Leaf, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import AdvertisementSlider from '@/components/AdvertisementSlider';
import ProductCard from '@/components/ProductCard';
import { EmptyState, ErrorState, LoadingState } from '@/components/AsyncState';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAsync } from '@/hooks/useAsync';
import { listAdvertisements } from '@/services/advertisementService';
import { listFeaturedProducts } from '@/services/productService';
import storyImage from '../../img/story-image.jpg';

const reveal = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.2 }, transition: { duration: 0.55 } };

export default function Home() {
  const { t, direction } = useLanguage();
  const products = useAsync(listFeaturedProducts, []);
  const advertisements = useAsync(listAdvertisements, []);
  const benefits = [
    [Leaf, 'natural', 'naturalDescription'], [Award, 'quality', 'qualityDescription'], [HeartHandshake, 'trusted', 'trustedDescription'],
  ];

  return (
    <>
      <Helmet>
        <title>{t('welcomeTitle')} | Daniya</title>
        <meta name="description" content={t('welcomeSubtitle')} />
        <link rel="canonical" href={`${import.meta.env.VITE_SITE_URL || 'https://daniaspices.shop'}/`} />
      </Helmet>
      <div className="page-shell">
        <section className="hero-pattern relative overflow-hidden border-b border-border/70 py-14 sm:py-20 lg:py-24">
          <div className="content-shell grid items-center gap-12 lg:grid-cols-[.9fr_1.1fr]">
            <motion.div initial={{ opacity: 0, x: direction === 'rtl' ? 30 : -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .65 }} className="text-center lg:text-start">
              <span className="section-kicker">{t('heroEyebrow')}</span>
              <h1 className="text-balance text-4xl font-extrabold leading-[1.12] tracking-tight sm:text-6xl lg:text-7xl">{t('welcomeTitle')}</h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground lg:mx-0 sm:text-xl">{t('welcomeSubtitle')}</p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
                <Button asChild size="lg" className="gap-2 rounded-full px-7"><Link to="/products"><ShoppingBag className="h-5 w-5" />{t('exploreProducts')}</Link></Button>
                <Button asChild size="lg" variant="outline" className="gap-2 rounded-full px-7"><Link to="/about">{t('learnMore')}<ArrowUpRight className="h-5 w-5" /></Link></Button>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .65, delay: .1 }}>
              {advertisements.status === 'loading' && <LoadingState className="surface-card aspect-[16/10]" />}
              {advertisements.status === 'error' && <ErrorState className="aspect-[16/10]" onRetry={advertisements.reload} />}
              {advertisements.status === 'success' && advertisements.data.length > 0 && <AdvertisementSlider advertisements={advertisements.data} />}
              {advertisements.status === 'success' && advertisements.data.length === 0 && <div className="surface-card aspect-[16/10] overflow-hidden"><img src={storyImage} alt="Daniya natural products" className="h-full w-full object-cover" fetchPriority="high" /></div>}
            </motion.div>
          </div>
        </section>

        <section className="section-space">
          <div className="content-shell">
            <motion.div {...reveal} className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div><span className="section-kicker">{t('featuredProducts')}</span><h2 className="section-title">{t('productsTitle')}</h2><p className="section-copy">{t('featuredProductsText')}</p></div>
              <Button asChild variant="outline" className="w-fit rounded-full"><Link to="/products">{t('viewAll')}<ArrowUpRight className="ms-2 h-4 w-4" /></Link></Button>
            </motion.div>
            {products.status === 'loading' && <LoadingState />}
            {products.status === 'error' && <ErrorState onRetry={products.reload} />}
            {products.status === 'success' && products.data.length === 0 && <EmptyState message={t('noProducts')} />}
            {products.status === 'success' && products.data.length > 0 && <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{products.data.map((product) => <motion.div key={product.id} {...reveal}><ProductCard product={product} /></motion.div>)}</div>}
          </div>
        </section>

        <section className="section-space border-y border-border/70 bg-secondary/35">
          <div className="content-shell">
            <motion.div {...reveal} className="mx-auto max-w-2xl text-center"><span className="section-kicker">Daniya</span><h2 className="section-title">{t('whyChooseUs')}</h2><p className="section-copy mx-auto">{t('whyChooseUsDesc')}</p></motion.div>
            <div className="mt-10 grid gap-5 md:grid-cols-3">{benefits.map(([Icon, title, copy]) => <motion.article key={title} {...reveal} className="surface-card p-7"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/15 text-primary"><Icon className="h-6 w-6" /></span><h3 className="mt-5 text-xl font-bold">{t(title)}</h3><p className="mt-3 leading-7 text-muted-foreground">{t(copy)}</p></motion.article>)}</div>
          </div>
        </section>

        <section className="section-space">
          <motion.div {...reveal} className="content-shell"><div className="overflow-hidden rounded-3xl bg-gradient-to-br from-dark-wood to-charcoal-black px-6 py-12 text-center text-ivory-white shadow-2xl sm:px-12"><h2 className="text-balance text-3xl font-bold sm:text-4xl">{t('ctaTitle')}</h2><p className="mx-auto mt-4 max-w-2xl text-lg text-ivory-white/75">{t('ctaText')}</p><div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row"><Button asChild size="lg" className="rounded-full"><Link to="/products">{t('exploreProducts')}</Link></Button><Button asChild size="lg" variant="outline" className="rounded-full border-white/35 bg-white/5 text-white hover:bg-white/15 hover:text-white"><Link to="/contact">{t('contact')}</Link></Button></div></div></motion.div>
        </section>
      </div>
    </>
  );
}
