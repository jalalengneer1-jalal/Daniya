import React, { useMemo, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAsync } from '@/hooks/useAsync';
import { deleteRow, listAdminRows } from '@/services/adminService';
import { AdminBusy, AdminError, AdminNotice, AdminPageHeader, ConfirmDeleteButton } from '@/components/admin/AdminCommon';

export default function ContactsAdmin() {
  const { t, language } = useLanguage(); const rows = useAsync(() => listAdminRows('contacts'), []); const [search, setSearch] = useState(''); const [busy, setBusy] = useState(false); const [notice, setNotice] = useState(null);
  const filtered = useMemo(() => (rows.data || []).filter((item) => [item.name, item.email, item.phone, item.message].join(' ').toLowerCase().includes(search.toLowerCase())), [rows.data, search]);
  async function remove(id) { setBusy(true); try { await deleteRow('contacts', id); await rows.reload(); setNotice({ type: 'success', message: t('success') }); } catch { setNotice({ type: 'error', message: t('unable') }); } finally { setBusy(false); } }
  return <><AdminPageHeader title={t('contacts')} /><AdminNotice state={notice} /><input value={search} onChange={(event) => setSearch(event.target.value)} className="form-control mb-5 mt-4 max-w-md" placeholder={t('searchAdmin')} />{rows.status === 'loading' && <AdminBusy />}{rows.status === 'error' && <AdminError onRetry={rows.reload} />}{rows.status === 'success' && <div className="grid gap-4">{filtered.map((item) => <article key={item.id} className="surface-card p-5"><div className="flex flex-col justify-between gap-3 sm:flex-row"><div><h2 className="text-lg font-bold">{item.name}</h2><div className="mt-1 flex flex-wrap gap-x-4 text-sm text-muted-foreground"><a href={`mailto:${item.email}`}>{item.email || '—'}</a><a dir="ltr" href={`tel:${item.phone}`}>{item.phone || '—'}</a><span>{new Date(item.created_at).toLocaleString(language)}</span></div></div><ConfirmDeleteButton disabled={busy} onConfirm={() => remove(item.id)} /></div><p className="mt-4 whitespace-pre-wrap rounded-xl bg-muted/55 p-4 leading-7">{item.message}</p></article>)}{filtered.length === 0 && <p className="surface-card p-6 text-center text-muted-foreground">{t('noData')}</p>}</div>}</>;
}
