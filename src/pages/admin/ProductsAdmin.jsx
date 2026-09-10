import React, { useMemo, useState } from 'react';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { CATEGORIES, formatMoney, localizeProduct } from '@/lib/catalog';
import { useAsync } from '@/hooks/useAsync';
import { deleteRow, listAdminRows, saveProduct } from '@/services/adminService';
import { AdminBusy, AdminError, AdminNotice, AdminPageHeader, ConfirmDeleteButton } from '@/components/admin/AdminCommon';

const blank = { id: null, name: '', name_en: '', name_fr: '', description: '', description_en: '', description_fr: '', category: 'spices', price: '', image: '' };

export default function ProductsAdmin() {
  const { t, language } = useLanguage();
  const rows = useAsync(() => listAdminRows('products'), []);
  const [form, setForm] = useState(blank);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);
  const filtered = useMemo(() => (rows.data || []).filter((item) => {
    const text = [item.name, item.name_en, item.name_fr].join(' ').toLowerCase();
    return (!search || text.includes(search.toLowerCase())) && (category === 'all' || item.category === category);
  }), [category, rows.data, search]);
  const change = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  function open(item = blank) { setForm({ ...blank, ...item }); setShowForm(true); setNotice(null); }
  async function submit(event) { event.preventDefault(); setBusy(true); setNotice(null); try { await saveProduct(form); setNotice({ type: 'success', message: t('success') }); setShowForm(false); setForm(blank); await rows.reload(); } catch { setNotice({ type: 'error', message: t('unable') }); } finally { setBusy(false); } }
  async function remove(id) { setBusy(true); try { await deleteRow('products', id); await rows.reload(); setNotice({ type: 'success', message: t('success') }); } catch { setNotice({ type: 'error', message: t('unable') }); } finally { setBusy(false); } }
  return <><AdminPageHeader title={t('products')} onAdd={() => open()} addLabel={t('addProduct')} /><AdminNotice state={notice} />{showForm && <form onSubmit={submit} className="surface-card mb-7 mt-4 grid gap-5 p-5 sm:p-7"><h2 className="text-xl font-bold">{form.id ? t('editProduct') : t('addProduct')}</h2><div className="grid gap-4 lg:grid-cols-3"><Field label={t('nameAr')} name="name" value={form.name} onChange={change} required maxLength="160" /><Field label={t('nameEn')} name="name_en" value={form.name_en} onChange={change} maxLength="160" dir="ltr" /><Field label={t('nameFr')} name="name_fr" value={form.name_fr} onChange={change} maxLength="160" dir="ltr" /></div><div className="grid gap-4 lg:grid-cols-3"><Area label={t('descriptionAr')} name="description" value={form.description} onChange={change} maxLength="2000" /><Area label={t('descriptionEn')} name="description_en" value={form.description_en} onChange={change} maxLength="2000" dir="ltr" /><Area label={t('descriptionFr')} name="description_fr" value={form.description_fr} onChange={change} maxLength="2000" dir="ltr" /></div><div className="grid gap-4 md:grid-cols-3"><div><label className="form-label" htmlFor="product-category">{t('category')}</label><select id="product-category" name="category" value={form.category} onChange={change} className="form-control">{CATEGORIES.map((item) => <option key={item} value={item}>{t(`category_${item}`)}</option>)}</select></div><Field label={t('price')} name="price" value={form.price} onChange={change} type="number" min="0" max="100000000" step="0.01" required dir="ltr" /><Field label={t('imageUrl')} name="image" value={form.image} onChange={change} type="url" maxLength="1000" required dir="ltr" /></div>{form.image && <img src={form.image} alt={t('preview')} className="h-28 w-40 rounded-xl object-cover" />}<div className="flex flex-wrap gap-3"><Button type="submit" disabled={busy}>{busy ? t('loading') : t('save')}</Button><Button type="button" variant="outline" onClick={() => setShowForm(false)}>{t('cancel')}</Button></div></form>}<div className="mb-5 mt-5 flex flex-col gap-3 sm:flex-row"><input value={search} onChange={(event) => setSearch(event.target.value)} className="form-control sm:max-w-sm" placeholder={t('searchAdmin')} /><select value={category} onChange={(event) => setCategory(event.target.value)} className="form-control sm:max-w-56"><option value="all">{t('all')}</option>{CATEGORIES.map((item) => <option key={item} value={item}>{t(`category_${item}`)}</option>)}</select></div>{rows.status === 'loading' && <AdminBusy />}{rows.status === 'error' && <AdminError onRetry={rows.reload} />}{rows.status === 'success' && <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>{t('item')}</th><th>{t('category')}</th><th>{t('price')}</th><th>{t('date')}</th><th>{t('actions')}</th></tr></thead><tbody>{filtered.map((item) => { const product = localizeProduct(item, language); return <tr key={item.id}><td><div className="flex min-w-60 items-center gap-3"><img src={item.image} alt="" className="h-12 w-12 rounded-lg object-cover" /><div><strong>{product.displayName}</strong><span className="block text-xs text-muted-foreground">#{item.id}</span></div></div></td><td>{t(`category_${item.category}`)}</td><td dir="ltr">{formatMoney(item.price, language)}</td><td>{new Date(item.created_at).toLocaleDateString(language)}</td><td><div className="flex gap-2"><Button type="button" size="sm" variant="outline" onClick={() => open(item)}><Pencil className="h-4 w-4" /><span className="sr-only">{t('edit')}</span></Button><ConfirmDeleteButton disabled={busy} onConfirm={() => remove(item.id)} /></div></td></tr>; })}{filtered.length === 0 && <tr><td colSpan="5" className="text-center text-muted-foreground">{t('noData')}</td></tr>}</tbody></table></div>}</>;
}

function Field({ label, name, ...props }) { return <div><label className="form-label" htmlFor={`product-${name}`}>{label}</label><input id={`product-${name}`} name={name} className="form-control" {...props} /></div>; }
function Area({ label, name, ...props }) { return <div><label className="form-label" htmlFor={`product-${name}`}>{label}</label><textarea id={`product-${name}`} name={name} className="form-control min-h-28" {...props} /></div>; }
