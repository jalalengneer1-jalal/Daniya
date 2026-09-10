import React from 'react';
import { AlertCircle, Inbox, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

export function LoadingState({ className = '' }) {
  const { t } = useLanguage();
  return (
    <div className={`flex min-h-40 items-center justify-center gap-3 text-muted-foreground ${className}`} role="status">
      <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
      <span>{t('loading')}</span>
    </div>
  );
}

export function ErrorState({ onRetry, message, className = '' }) {
  const { t } = useLanguage();
  return (
    <div className={`surface-card flex min-h-40 flex-col items-center justify-center gap-3 p-6 text-center ${className}`} role="alert">
      <AlertCircle className="h-7 w-7 text-destructive" aria-hidden="true" />
      <p>{message || t('unable')}</p>
      {onRetry && <Button type="button" variant="outline" onClick={onRetry}>{t('retry')}</Button>}
    </div>
  );
}

export function EmptyState({ message, action, className = '' }) {
  const { t } = useLanguage();
  return (
    <div className={`surface-card flex min-h-40 flex-col items-center justify-center gap-3 p-6 text-center text-muted-foreground ${className}`}>
      <Inbox className="h-7 w-7" aria-hidden="true" />
      <p>{message || t('noData')}</p>
      {action}
    </div>
  );
}
