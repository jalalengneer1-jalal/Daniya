import { assertSuccess, client } from './serviceUtils';

const fields = 'id,name,name_en,name_fr,description,description_en,description_fr,category,price,image,created_at';

export async function listProducts() {
  const { data, error } = await client().from('products').select(fields).order('created_at', { ascending: false });
  assertSuccess(error);
  return data || [];
}

export async function listFeaturedProducts(limit = 6) {
  const { data, error } = await client().from('products').select(fields).order('created_at', { ascending: false }).limit(limit);
  assertSuccess(error);
  return data || [];
}
