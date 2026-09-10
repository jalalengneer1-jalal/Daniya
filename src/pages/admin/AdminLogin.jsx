import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { LockKeyhole } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import logo from '../../../img/DANIA LOGO PNG-01.png';

export default function AdminLogin() {
  const { t } = useLanguage();
  const { signIn, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [status, setStatus] = useState('idle');
  useEffect(() => { if (!loading && isAdmin) navigate(location.state?.from || '/admin', { replace: true }); }, [isAdmin, loading, location.state, navigate]);
  async function submit(event) {
    event.preventDefault();
    if (status === 'submitting') return;
    setStatus('submitting');
    const result = await signIn(form.email.trim(), form.password);
    if (result.ok) navigate(location.state?.from || '/admin', { replace: true }); else setStatus('error');
  }
  return <><Helmet><title>{t('loginTitle')} | Daniya</title><meta name="robots" content="noindex,nofollow" /></Helmet><div className="hero-pattern grid min-h-screen place-items-center p-4"><main className="surface-card w-full max-w-md p-7 sm:p-9"><img src={logo} alt="Daniya" className="mx-auto h-16 w-auto" /><div className="mt-6 text-center"><span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary/15 text-primary"><LockKeyhole className="h-6 w-6" /></span><h1 className="mt-4 text-3xl font-bold">{t('loginTitle')}</h1><p className="mt-2 text-muted-foreground">{t('loginSubtitle')}</p></div><form onSubmit={submit} className="mt-7 grid gap-5"><div><label htmlFor="admin-email" className="form-label">{t('email')}</label><input id="admin-email" type="email" autoComplete="username" required maxLength="160" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="form-control" dir="ltr" /></div><div><label htmlFor="admin-password" className="form-label">{t('password')}</label><input id="admin-password" type="password" autoComplete="current-password" required minLength="8" maxLength="128" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="form-control" dir="ltr" /></div>{status === 'error' && <p role="alert" className="text-sm text-destructive">{t('invalidLogin')}</p>}<Button type="submit" size="lg" disabled={status === 'submitting'}>{status === 'submitting' ? t('signingIn') : t('login')}</Button></form></main></div></>;
}
