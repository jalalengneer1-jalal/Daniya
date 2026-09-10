import React from 'react';
import { Boxes, ClipboardList, DollarSign, Eye, MessageSquare, ShoppingBag } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatMoney } from '@/lib/catalog';
import { useAsync } from '@/hooks/useAsync';
import { getDashboardSummary } from '@/services/adminService';
import { AdminBusy, AdminError, AdminPageHeader } from '@/components/admin/AdminCommon';

export default function Dashboard() {
  const { t, language } = useLanguage();
  const summary = useAsync(getDashboardSummary, []);
  if (summary.status === 'loading') return <AdminBusy />;
  if (summary.status === 'error') return <><AdminPageHeader title={t('dashboard')} description={t('adminWelcome')} /><AdminError onRetry={summary.reload} /></>;
  const data = summary.data || {};
  const cards = [[Eye, 'visitorsToday', data.visitors_today || 0], [ShoppingBag, 'ordersToday', data.orders_today || 0], [DollarSign, 'revenueToday', formatMoney(data.revenue_today || 0, language)], [ClipboardList, 'newOrders', data.new_orders || 0], [Boxes, 'totalProducts', data.total_products || 0], [MessageSquare, 'totalContacts', data.total_contacts || 0]];
  return <><AdminPageHeader title={t('dashboard')} description={t('adminWelcome')} /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{cards.map(([Icon, label, value]) => <article key={label} className="surface-card flex items-center gap-4 p-5"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/15 text-primary"><Icon className="h-6 w-6" /></span><div><span className="text-sm text-muted-foreground">{t(label)}</span><strong className="mt-1 block text-2xl" dir={label === 'revenueToday' ? 'ltr' : undefined}>{value}</strong></div></article>)}</div><div className="mt-8 grid gap-6 xl:grid-cols-2"><section><h2 className="mb-4 text-xl font-bold">{t('recentOrders')}</h2><div className="surface-card divide-y divide-border">{(data.recent_orders || []).length ? data.recent_orders.map((order) => <div key={order.id} className="flex items-center justify-between gap-4 p-4"><div><strong>#{order.id} — {order.customer_name}</strong><span className="mt-1 block text-sm text-muted-foreground">{new Date(order.created_at).toLocaleString(language)}</span></div><div className="text-end"><strong className="text-primary" dir="ltr">{formatMoney(order.total_amount, language)}</strong><span className="mt-1 block text-xs">{t(`status_${order.status}`)}</span></div></div>) : <p className="p-5 text-muted-foreground">{t('noData')}</p>}</div></section><section><h2 className="mb-4 text-xl font-bold">{t('recentContacts')}</h2><div className="surface-card divide-y divide-border">{(data.recent_contacts || []).length ? data.recent_contacts.map((contact) => <div key={contact.id} className="p-4"><div className="flex justify-between gap-4"><strong>{contact.name}</strong><span className="text-xs text-muted-foreground">{new Date(contact.created_at).toLocaleDateString(language)}</span></div><p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{contact.message}</p></div>) : <p className="p-5 text-muted-foreground">{t('noData')}</p>}</div></section></div></>;
}
