export const CATEGORIES = ['dates', 'honey', 'nuts', 'spices', 'food', 'oils'];

const aliases = {
  date: 'dates', dates: 'dates', tamr: 'dates',
  honey: 'honey',
  nut: 'nuts', nuts: 'nuts',
  spice: 'spices', spices: 'spices',
  food: 'food', 'food items': 'food', fooditems: 'food',
  oil: 'oils', oils: 'oils', naturaloils: 'oils', 'natural oils': 'oils',
};

export function normalizeCategory(value) {
  const key = String(value || '').trim().toLowerCase();
  return aliases[key] || key;
}

export function localizeProduct(product, language) {
  if (!product) return null;
  const name = language === 'en'
    ? product.name_en?.trim() || product.name?.trim()
    : language === 'fr'
      ? product.name_fr?.trim() || product.name_en?.trim() || product.name?.trim()
      : product.name?.trim() || product.name_en?.trim() || product.name_fr?.trim();
  const description = language === 'en'
    ? product.description_en?.trim() || product.description?.trim()
    : language === 'fr'
      ? product.description_fr?.trim() || product.description_en?.trim() || product.description?.trim()
      : product.description?.trim() || product.description_en?.trim() || product.description_fr?.trim();
  return { ...product, displayName: name || '', displayDescription: description || '' };
}

export function localizeGallery(item, language) {
  const title = language === 'en'
    ? item.translation_en?.trim() || item.title?.trim()
    : language === 'fr'
      ? item.translation_fr?.trim() || item.translation_en?.trim() || item.title?.trim()
      : item.title?.trim() || item.translation_en?.trim() || item.translation_fr?.trim();
  return { ...item, displayTitle: title || '' };
}

export function formatMoney(amount, language = 'en') {
  const locale = language === 'ar' ? 'ar-DJ' : language === 'fr' ? 'fr-DJ' : 'en-DJ';
  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(Number(amount) || 0)} DJF`;
}

export function isSafeHttpUrl(value, { allowEmpty = true } = {}) {
  if (!value && allowEmpty) return true;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}
