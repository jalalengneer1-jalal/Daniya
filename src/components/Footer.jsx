import React from 'react';
import { Facebook, Instagram, Mail, MapPin, MessageCircle, Phone, Youtube } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { CATEGORIES } from '@/lib/catalog';
import logo from '../../img/DANIA LOGO PNG-01.png';

const socials = [
  [MessageCircle, 'https://wa.me/25377760000', 'WhatsApp'],
  [Instagram, 'https://www.instagram.com/dania.spices/', 'Instagram'],
  [Youtube, 'https://www.youtube.com/@dania.spices', 'YouTube'],
  [Facebook, 'https://www.facebook.com/people/daniaspices/61571399192741/', 'Facebook'],
];

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="border-t border-border bg-card/70">
      <div className="content-shell grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <img src={logo} alt="Daniya" className="h-14 w-auto" loading="lazy" width="150" height="56" />
          <p className="mt-4 max-w-sm leading-7 text-muted-foreground">{t('footerText')}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {socials.map(([Icon, href, label]) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="grid h-10 w-10 place-items-center rounded-full border border-border bg-background text-muted-foreground hover:border-primary hover:text-primary">
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-lg font-bold">{t('quickLinks')}</h2>
          <ul className="mt-4 space-y-2 text-muted-foreground">
            {[['home', '/'], ['about', '/about'], ['products', '/products'], ['gallery', '/gallery'], ['contact', '/contact']].map(([label, href]) => <li key={href}><Link className="hover:text-primary" to={href}>{t(label)}</Link></li>)}
          </ul>
        </div>
        <div>
          <h2 className="text-lg font-bold">{t('productCategories')}</h2>
          <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-muted-foreground">
            {CATEGORIES.map((category) => <li key={category}><Link className="hover:text-primary" to={`/products?category=${category}`}>{t(`category_${category}`)}</Link></li>)}
          </ul>
        </div>
        <div>
          <h2 className="text-lg font-bold">{t('contact')}</h2>
          <ul className="mt-4 space-y-4 text-muted-foreground">
            <li className="flex gap-3"><MapPin className="mt-1 h-4 w-4 shrink-0 text-primary" /><a href="https://www.google.com/maps/search/?api=1&query=Hamoudi+Market+Djibouti" target="_blank" rel="noopener noreferrer" className="hover:text-primary">{t('address')}</a></li>
            <li className="flex gap-3"><Phone className="h-4 w-4 shrink-0 text-primary" /><a dir="ltr" href={`tel:${t('phoneValue')}`} className="hover:text-primary">{t('phoneValue')}</a></li>
            <li className="flex gap-3"><Mail className="h-4 w-4 shrink-0 text-primary" /><a href={`mailto:${t('emailValue')}`} className="break-all hover:text-primary">{t('emailValue')}</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/70 py-5 text-center text-sm text-muted-foreground">{t('copyright', { year: new Date().getFullYear() })}</div>
    </footer>
  );
}
