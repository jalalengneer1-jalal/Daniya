import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

export default function NotFound() {
  const { t } = useLanguage();
  return <div className="page-shell grid min-h-[70vh] place-items-center"><div className="text-center"><span className="text-7xl font-black text-primary">404</span><h1 className="mt-4 text-3xl font-bold">{t('notFoundTitle')}</h1><Button asChild className="mt-7"><Link to="/">{t('backHome')}</Link></Button></div></div>;
}
