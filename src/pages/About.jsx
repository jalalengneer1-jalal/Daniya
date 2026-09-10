import React from 'react';
import { Helmet } from 'react-helmet';
import { Award, Eye, Gem, HeartHandshake, Languages, Layers3, Leaf, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import storyImage from '../../img/story-image.jpg';

export default function About() {
  const { t } = useLanguage();
  const values = [[Leaf, 'authenticity', 'authenticityText'], [HeartHandshake, 'care', 'careText'], [Award, 'quality', 'qualityDescription'], [Gem, 'excellence', 'excellenceText']];
  const stats = [[6, 'productCategories', Layers3], [3, 'language', Languages], ['100%', 'natural', Leaf]];
  return (
    <>
      <Helmet><title>{t('about')} | Daniya</title><meta name="description" content={t('aboutDescription')} /></Helmet>
      <div className="page-shell">
        <section className="section-space hero-pattern border-b border-border/70"><div className="content-shell grid items-center gap-12 lg:grid-cols-2"><motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}><span className="section-kicker">{t('about')}</span><h1 className="section-title">{t('aboutTitle')}</h1><div className="gold-rule" /><p className="section-copy max-w-none">{t('aboutDescription')}</p></motion.div><motion.div initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }} className="relative"><div className="absolute -inset-4 -z-10 rounded-[2rem] bg-primary/15 blur-2xl" /><img src={storyImage} alt="Daniya story" className="aspect-[4/3] w-full rounded-3xl object-cover shadow-2xl" /></motion.div></div></section>
        <section className="section-space"><div className="content-shell grid gap-5 sm:grid-cols-3">{stats.map(([number, label, Icon]) => <article key={label} className="surface-card p-7 text-center"><Icon className="mx-auto h-6 w-6 text-primary" /><strong className="mt-3 block text-4xl text-primary">{number}</strong><span className="mt-2 block text-muted-foreground">{t(label)}</span></article>)}</div></section>
        <section className="section-space border-y border-border/70 bg-secondary/35"><div className="content-shell"><div className="grid gap-6 lg:grid-cols-2">{[[Eye, 'ourVision', 'visionText'], [Target, 'ourMission', 'missionText']].map(([Icon, title, text]) => <article key={title} className="surface-card p-8 sm:p-10"><span className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/15 text-primary"><Icon className="h-7 w-7" /></span><h2 className="mt-6 text-3xl font-bold">{t(title)}</h2><p className="mt-4 text-lg leading-8 text-muted-foreground">{t(text)}</p></article>)}</div></div></section>
        <section className="section-space"><div className="content-shell"><div className="mx-auto max-w-2xl text-center"><span className="section-kicker">Daniya</span><h2 className="section-title">{t('coreValues')}</h2><p className="section-copy mx-auto">{t('coreValuesDesc')}</p></div><div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{values.map(([Icon, title, text]) => <article key={title} className="surface-card p-6"><Icon className="h-7 w-7 text-primary" /><h3 className="mt-5 text-xl font-bold">{t(title)}</h3><p className="mt-3 leading-7 text-muted-foreground">{t(text)}</p></article>)}</div></div></section>
      </div>
    </>
  );
}
