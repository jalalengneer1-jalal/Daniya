import { assertSuccess, client } from './serviceUtils';

export async function listGallery() {
  const supabase = client();
  const { data, error } = await supabase.from('gallery')
    .select('id,title,translation_en,translation_fr,category,media_type,storage_path,created_at')
    .order('created_at', { ascending: false });
  assertSuccess(error);
  return (data || []).map((item) => ({
    ...item,
    publicUrl: item.storage_path
      ? supabase.storage.from('gallery').getPublicUrl(item.storage_path).data.publicUrl
      : '',
  }));
}
