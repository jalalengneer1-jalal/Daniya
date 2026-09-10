import { CATEGORIES, isSafeHttpUrl } from '@/lib/catalog';
import { assertSuccess, client, PublicServiceError } from './serviceUtils';

const entityConfig = {
  products: { order: 'created_at' }, advertisements: { order: 'created_at' }, gallery: { order: 'created_at' },
  contacts: { order: 'created_at' }, orders: { order: 'created_at' }, admin_audit_logs: { order: 'created_at' },
};

export async function listAdminRows(entity, select = '*') {
  if (!entityConfig[entity]) throw new PublicServiceError();
  const { data, error } = await client().from(entity).select(select)
    .order(entityConfig[entity].order, { ascending: false });
  assertSuccess(error);
  return data || [];
}

export async function saveProduct(product) {
  const payload = {
    name: product.name.trim(), name_en: product.name_en.trim(), name_fr: product.name_fr.trim(),
    description: product.description.trim(), description_en: product.description_en.trim(), description_fr: product.description_fr.trim(),
    category: product.category, price: Number(product.price), image: product.image.trim(),
  };
  if (!payload.name || !CATEGORIES.includes(payload.category) || !Number.isFinite(payload.price) || payload.price < 0 || !isSafeHttpUrl(payload.image, { allowEmpty: false })) throw new PublicServiceError('VALIDATION');
  const query = product.id
    ? client().from('products').update(payload).eq('id', product.id).select().single()
    : client().from('products').insert(payload).select().single();
  const { data, error } = await query;
  assertSuccess(error);
  return data;
}

export async function saveAdvertisement(advertisement) {
  const payload = { image_url: advertisement.image_url.trim(), link: advertisement.link.trim() || null };
  if (!isSafeHttpUrl(payload.image_url, { allowEmpty: false }) || !isSafeHttpUrl(payload.link)) throw new PublicServiceError('VALIDATION');
  const query = advertisement.id
    ? client().from('advertisements').update(payload).eq('id', advertisement.id).select().single()
    : client().from('advertisements').insert(payload).select().single();
  const { data, error } = await query;
  assertSuccess(error);
  return data;
}

export async function deleteRow(entity, id) {
  if (!['products', 'advertisements', 'contacts'].includes(entity)) throw new PublicServiceError();
  const { error } = await client().from(entity).delete().eq('id', id);
  assertSuccess(error);
}

const imageTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
const videoTypes = new Set(['video/mp4', 'video/webm']);
const extensionByMime = {
  'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/avif': 'avif',
  'video/mp4': 'mp4', 'video/webm': 'webm',
};

function validateGalleryFile(file, mediaType) {
  const allowed = mediaType === 'video' ? videoTypes : imageTypes;
  const max = mediaType === 'video' ? 25 * 1024 * 1024 : 5 * 1024 * 1024;
  if (!file || !allowed.has(file.type) || file.size <= 0 || file.size > max) throw new PublicServiceError('VALIDATION');
}

export async function saveGalleryItem(item, file) {
  const supabase = client();
  let uploadedPath = '';
  if (file) {
    validateGalleryFile(file, item.media_type);
    const extension = extensionByMime[file.type];
    uploadedPath = `${item.media_type}/${new Date().getUTCFullYear()}/${crypto.randomUUID()}.${extension}`;
    const { error } = await supabase.storage.from('gallery').upload(uploadedPath, file, { contentType: file.type, upsert: false });
    assertSuccess(error);
  }
  const oldPath = item.storage_path;
  const payload = {
    title: item.title.trim(), translation_en: item.translation_en.trim(), translation_fr: item.translation_fr.trim(),
    category: item.category.trim() || 'products', media_type: item.media_type,
    storage_path: uploadedPath || oldPath,
  };
  if (!payload.title || !['image', 'video'].includes(payload.media_type) || !payload.storage_path) {
    if (uploadedPath) await supabase.storage.from('gallery').remove([uploadedPath]);
    throw new PublicServiceError('VALIDATION');
  }
  const query = item.id
    ? supabase.from('gallery').update(payload).eq('id', item.id).select().single()
    : supabase.from('gallery').insert(payload).select().single();
  const { data, error } = await query;
  if (error) {
    if (uploadedPath) await supabase.storage.from('gallery').remove([uploadedPath]);
    assertSuccess(error);
  }
  if (uploadedPath && oldPath && oldPath !== uploadedPath) await supabase.storage.from('gallery').remove([oldPath]);
  return data;
}

export async function deleteGalleryItem(item) {
  const supabase = client();
  const { error } = await supabase.from('gallery').delete().eq('id', item.id);
  assertSuccess(error);
  if (item.storage_path) await supabase.storage.from('gallery').remove([item.storage_path]);
}

export async function updateOrderStatus(id, status) {
  if (!['new', 'confirmed', 'preparing', 'completed', 'cancelled'].includes(status)) throw new PublicServiceError('VALIDATION');
  const { data, error } = await client().from('orders').update({ status }).eq('id', id).select().single();
  assertSuccess(error);
  return data;
}

export async function getDashboardSummary() {
  const { data, error } = await client().rpc('admin_dashboard_summary');
  assertSuccess(error);
  return data;
}

export async function getAnalyticsReport(from, to) {
  const { data, error } = await client().rpc('admin_analytics_report', { p_from: from, p_to: to });
  assertSuccess(error);
  return data;
}
