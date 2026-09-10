import { assertSuccess, client } from './serviceUtils';

export async function listAdvertisements() {
  const { data, error } = await client().from('advertisements')
    .select('id,image_url,link,created_at').order('created_at', { ascending: false });
  assertSuccess(error);
  return data || [];
}
