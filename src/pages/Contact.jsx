import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Clock, Mail, MapPin, Phone, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { submitContact } from '@/services/contactService';

const initialForm = { name: '', email: '', phone: '', message: '', website: '' };

export default function Contact() {
  const { t } = useLanguage();
  const [form, setForm] = useState(initialForm);
  const [state, setState] = useState({ status: 'idle', message: '' });
  const info = [
    [MapPin, 'addressTitle', 'address', 'https://www.google.com/maps/search/?api=1&query=Hamoudi+Market+Djibouti'],
    [Phone, 'phoneTitle', 'phoneValue', `tel:${t('phoneValue')}`],
    [Mail, 'emailTitle', 'emailValue', `mailto:${t('emailValue')}`],
    [Clock, 'workingHoursTitle', 'workingHours', null],
  ];

  function update(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    if (state.status === 'submitting') return;
    const invalid = form.name.trim().length < 2 || form.name.length > 100
      || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) || form.email.length > 160
      || form.phone.length > 30 || form.message.trim().length < 5 || form.message.length > 2000;
    if (invalid) {
      setState({ status: 'error', message: t('invalidForm') });
      return;
    }
    setState({ status: 'submitting', message: '' });
    try {
      await submitContact({
        ...form,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        message: form.message.trim(),
      });
      setForm(initialForm);
      setState({ status: 'success', message: t('messageSent') });
    } catch {
      setState({ status: 'error', message: t('unable') });
    }
  }

  return (
    <>
      <Helmet>
        <title>{t('contactTitle')} | Daniya</title>
        <meta name="description" content={t('contactSubtitle')} />
      </Helmet>
      <div className="page-shell">
        <section className="hero-pattern border-b border-border/70 py-12 sm:py-16">
          <div className="content-shell text-center">
            <span className="section-kicker">Daniya</span>
            <h1 className="section-title">{t('contactTitle')}</h1>
            <p className="section-copy mx-auto">{t('contactSubtitle')}</p>
          </div>
        </section>

        <section className="section-space">
          <div className="content-shell grid gap-8 lg:grid-cols-[1.15fr_.85fr]">
            <div className="surface-card p-6 sm:p-8">
              <h2 className="text-2xl font-bold">{t('sendMessage')}</h2>
              <form onSubmit={submit} className="mt-6 grid gap-5" noValidate>
                <div>
                  <label className="form-label" htmlFor="contact-name">{t('name')} *</label>
                  <input className="form-control" id="contact-name" name="name" value={form.name} onChange={update} minLength="2" maxLength="100" required autoComplete="name" />
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="form-label" htmlFor="contact-email">{t('email')} *</label>
                    <input className="form-control" id="contact-email" name="email" value={form.email} onChange={update} maxLength="160" type="email" required autoComplete="email" />
                  </div>
                  <div>
                    <label className="form-label" htmlFor="contact-phone">{t('phoneOptional')}</label>
                    <input className="form-control" id="contact-phone" name="phone" value={form.phone} onChange={update} maxLength="30" type="tel" autoComplete="tel" dir="ltr" />
                  </div>
                </div>
                <div>
                  <label className="form-label" htmlFor="contact-message">{t('message')} *</label>
                  <textarea className="form-control min-h-36 resize-y" id="contact-message" name="message" value={form.message} onChange={update} minLength="5" maxLength="2000" required />
                </div>
                <div className="absolute -left-[10000px]" aria-hidden="true">
                  <label htmlFor="contact-website">Website</label>
                  <input id="contact-website" name="website" value={form.website} onChange={update} tabIndex="-1" autoComplete="off" />
                </div>
                {state.message && (
                  <p role={state.status === 'error' ? 'alert' : 'status'} className={state.status === 'success' ? 'text-green-700 dark:text-green-400' : 'text-destructive'}>
                    {state.message}
                  </p>
                )}
                <Button type="submit" size="lg" disabled={state.status === 'submitting'} className="w-full gap-2 sm:w-fit">
                  <Send className="h-4 w-4" />
                  {state.status === 'submitting' ? t('sending') : t('send')}
                </Button>
              </form>
            </div>

            <div className="grid content-start gap-4">
              {info.map(([Icon, title, value, href]) => (
                <article key={title} className="surface-card flex gap-4 p-5">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="font-bold">{t(title)}</h2>
                    {href ? (
                      <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noopener noreferrer' : undefined} className="mt-1 block whitespace-pre-line text-muted-foreground hover:text-primary">
                        {t(value)}
                      </a>
                    ) : <p className="mt-1 whitespace-pre-line text-muted-foreground">{t(value)}</p>}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="pb-16 sm:pb-20">
          <div className="content-shell">
            <h2 className="mb-5 text-2xl font-bold">{t('ourLocation')}</h2>
            <div className="surface-card overflow-hidden">
              <iframe title={t('ourLocation')} src="https://www.google.com/maps?q=Hamoudi%20Market%2C%20Djibouti&output=embed" className="h-80 w-full border-0 sm:h-96" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
