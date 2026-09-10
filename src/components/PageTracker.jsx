import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackEvent } from '@/services/analyticsService';

export default function PageTracker() {
  const location = useLocation();
  useEffect(() => {
    trackEvent('page_view', { page: `${location.pathname}${location.search}` });
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [location.pathname, location.search]);
  return null;
}
