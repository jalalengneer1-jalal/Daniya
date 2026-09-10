import React from 'react';
import { AlertCircle, Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

export function AdminPageHeader({ title, description, onAdd, addLabel }) {
  return <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><h1 className="text-3xl font-bold">{title}</h1>{description && <p className="mt-2 text-muted-foreground">{description}</p>}</div>{onAdd && <Button type="button" onClick={onAdd} className="w-fit gap-2"><Plus className="h-4 w-4" />{addLabel}</Button>}</div>;
}

export function AdminBusy() {
  const { t } = useLanguage();
  return <div className="surface-card flex min-h-52 items-center justify-center gap-3 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" />{t('loading')}</div>;
}

export function AdminError({ onRetry }) {
  const { t } = useLanguage();
  return <div className="surface-card flex min-h-52 flex-col items-center justify-center gap-3 p-6 text-center"><AlertCircle className="h-7 w-7 text-destructive" /><p>{t('unable')}</p>{onRetry && <Button type="button" variant="outline" onClick={onRetry}>{t('retry')}</Button>}</div>;
}

export function AdminNotice({ state }) {
  if (!state?.message) return null;
  return <p role="status" className={`rounded-xl border p-3 text-sm ${state.type === 'error' ? 'border-destructive/30 bg-destructive/10 text-destructive' : 'border-green-600/25 bg-green-600/10 text-green-700 dark:text-green-400'}`}>{state.message}</p>;
}

export function ConfirmDeleteButton({ onConfirm, label, disabled }) {
  const { t } = useLanguage();
  return <Button type="button" size="sm" variant="destructive" disabled={disabled} onClick={() => { if (window.confirm(t('confirmDelete'))) onConfirm(); }}>{label || t('delete')}</Button>;
}
