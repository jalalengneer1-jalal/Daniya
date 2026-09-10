import React, { useMemo, useState } from 'react';
import { BarChart3, Eye, Percent, ShoppingBag, TrendingUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatMoney, localizeProduct } from '@/lib/catalog';
import { AdminBusy, AdminError, AdminPageHeader } from '@/components/admin/AdminCommon';
import { getAnalyticsReport } from '@/services/adminService';

function datesFor(preset) {
  const now = new Date(); const end = new Date(now); const start = new Date(now);
  if (preset === 'today') start.setHours(0, 0, 0, 0);
  if (preset === 'last7') start.setDate(start.getDate() - 6);
  if (preset === 'last30') start.setDate(start.getDate() - 29);
  if (preset === 'month') start.setDate(1);
  end.setHours(23, 59, 59, 999);
  return { from: start.toISOString(), to: end.toISOString() };
}

export default function AnalyticsAdmin() {
  const { t, language } = useLanguage();
  const [preset, setPreset] = useState('last30');
  const initial = datesFor('last30');
  const [range, setRange] = useState(initial);
  const [report, setReport] = useState(null);
  const [status, setStatus] = useState('loading');
  const load = React.useCallback(async (nextRange = range) => { setStatus('loading'); try { setReport(await getAnalyticsReport(nextRange.from, nextRange.to)); setStatus('success'); } catch { setStatus('error'); } }, [range]);
  React.useEffect(() => { load(initial); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  function choose(next) { const nextRange = datesFor(next); setPreset(next); setRange(nextRange); load(nextRange); }
  const kpis = report?.kpis || {};
  const cards = [[Users, 'visitors', kpis.visitors || 0], [Eye, 'productViews', kpis.product_views || 0], [ShoppingBag, 'cartAdds', kpis.cart_adds || 0], [TrendingUp, 'orders', kpis.orders || 0], [BarChart3, 'revenue', formatMoney(kpis.revenue || 0, language)], [Percent, 'conversionRate', `${Number(kpis.conversion_rate || 0).toFixed(1)}%`]];
  return <><AdminPageHeader title={t('analytics')} /><div className="mb-6 flex flex-wrap gap-2">{[['today', 'today'], ['last7', 'last7'], ['last30', 'last30'], ['month', 'thisMonth']].map(([value, label]) => <Button key={value} type="button" size="sm" variant={preset === value ? 'default' : 'outline'} onClick={() => choose(value)}>{t(label)}</Button>)}</div>{status === 'loading' && <AdminBusy />}{status === 'error' && <AdminError onRetry={() => load()} />}{status === 'success' && <><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{cards.map(([Icon, label, value]) => <article key={label} className="surface-card flex items-center gap-4 p-5"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/15 text-primary"><Icon className="h-6 w-6" /></span><div><span className="text-sm text-muted-foreground">{t(label)}</span><strong className="mt-1 block text-2xl" dir={['revenue', 'conversionRate'].includes(label) ? 'ltr' : undefined}>{value}</strong></div></article>)}</div><div className="mt-7 grid gap-6 xl:grid-cols-2"><Chart title={t('visitorsOverTime')} data={report?.daily || []} valueKey="visitors" language={language} /><Chart title={t('ordersOverTime')} data={report?.daily || []} valueKey="orders" language={language} /></div><section className="mt-7"><h2 className="mb-4 text-xl font-bold">{t('topProducts')}</h2><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>{t('item')}</th><th>{t('views')}</th><th>{t('clicks')}</th><th>{t('cartAdds')}</th><th>{t('cartRemovals')}</th><th>{t('unitsSold')}</th><th>{t('orders')}</th><th>{t('revenue')}</th><th>{t('conversionRate')}</th></tr></thead><tbody>{(report?.products || []).map((raw) => { const product = localizeProduct(raw, language); return <tr key={raw.product_id}><td><strong>{product.displayName}</strong></td><td>{raw.views}</td><td>{raw.clicks}</td><td>{raw.cart_adds}</td><td>{raw.cart_removals}</td><td>{raw.ordered_units}</td><td>{raw.orders}</td><td dir="ltr">{formatMoney(raw.revenue, language)}</td><td dir="ltr">{Number(raw.overall_conversion || 0).toFixed(1)}%</td></tr>; })}{!(report?.products || []).length && <tr><td colSpan="9" className="text-center text-muted-foreground">{t('noAnalytics')}</td></tr>}</tbody></table></div></section><section className="mt-7"><h2 className="mb-4 text-xl font-bold">{t('categoryPerformance')}</h2><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{(report?.categories || []).map((item) => <article key={item.category} className="surface-card p-5"><h3 className="font-bold">{t(`category_${item.category}`)}</h3><dl className="mt-4 grid grid-cols-2 gap-3 text-sm"><Metric label={t('views')} value={item.views} /><Metric label={t('cartAdds')} value={item.cart_adds} /><Metric label={t('orders')} value={item.orders} /><Metric label={t('revenue')} value={formatMoney(item.revenue, language)} /></dl></article>)}</div></section><section className="mt-7"><h2 className="mb-4 text-xl font-bold">{t('opportunities')}</h2><div className="grid gap-4 lg:grid-cols-2">{(report?.opportunities || []).map((item) => <article key={`${item.product_id}-${item.reason}`} className="surface-card border-amber-500/30 p-5"><strong>{localizeProduct(item, language).displayName}</strong><p className="mt-2 text-sm text-muted-foreground">{item.reason === 'high_views_low_carts' ? `${t('views')}: ${item.views} · ${t('cartAdds')}: ${item.cart_adds}` : `${t('cartAdds')}: ${item.cart_adds} · ${t('orders')}: ${item.orders}`}</p></article>)}{!(report?.opportunities || []).length && <p className="surface-card p-5 text-muted-foreground">{t('noAnalytics')}</p>}</div></section></>}</>;
}

function Metric({ label, value }) { return <div><dt className="text-muted-foreground">{label}</dt><dd className="mt-1 font-bold" dir="ltr">{value}</dd></div>; }
function Chart({ title, data, valueKey, language }) { const max = useMemo(() => Math.max(1, ...data.map((item) => Number(item[valueKey]) || 0)), [data, valueKey]); return <section className="surface-card p-5"><h2 className="text-lg font-bold">{title}</h2>{data.length ? <div className="mt-6 flex h-52 items-end gap-1.5 overflow-hidden" aria-label={title}>{data.map((item) => { const value = Number(item[valueKey]) || 0; return <div key={item.day} className="group relative flex min-w-0 flex-1 flex-col justify-end" title={`${new Date(item.day).toLocaleDateString(language)}: ${value}`}><div className="min-h-1 rounded-t bg-primary/75 transition-colors group-hover:bg-primary" style={{ height: `${Math.max(2, value / max * 100)}%` }} /><span className="mt-2 hidden truncate text-center text-[10px] text-muted-foreground sm:block">{new Date(item.day).toLocaleDateString(language, { day: '2-digit' })}</span></div>; })}</div> : <p className="mt-6 text-muted-foreground">{title}</p>}</section>; }
