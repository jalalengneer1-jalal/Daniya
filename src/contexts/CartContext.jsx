import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { trackEvent } from '@/services/analyticsService';

const CartContext = createContext(null);
const STORAGE_KEY = 'daniya-cart-v1';

function readCart() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) =>
      item && item.id != null && Number.isFinite(Number(item.price)) && Number(item.price) >= 0 &&
      Number.isInteger(Number(item.quantity)) && Number(item.quantity) >= 1 && Number(item.quantity) <= 50
    ).map((item) => ({ ...item, price: Number(item.price), quantity: Number(item.quantity) }));
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readCart);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((product) => {
    const price = Number(product?.price);
    if (product?.id == null || !Number.isFinite(price) || price < 0) return;
    setItems((current) => {
      const found = current.find((item) => String(item.id) === String(product.id));
      if (found) {
        return current.map((item) => String(item.id) === String(product.id)
          ? { ...item, quantity: Math.min(item.quantity + 1, 50) }
          : item);
      }
      return [...current, {
        id: product.id,
        name: String(product.name || ''),
        name_en: String(product.name_en || ''),
        name_fr: String(product.name_fr || ''),
        category: String(product.category || ''),
        image: String(product.image || ''),
        price,
        quantity: 1,
      }];
    });
    trackEvent('add_to_cart', { productId: product.id, category: product.category });
  }, []);

  const setQuantity = useCallback((productId, quantity) => {
    const next = Math.max(1, Math.min(50, Number(quantity) || 1));
    setItems((current) => current.map((item) =>
      String(item.id) === String(productId) ? { ...item, quantity: next } : item
    ));
  }, []);

  const removeItem = useCallback((productId) => {
    setItems((current) => {
      const item = current.find((candidate) => String(candidate.id) === String(productId));
      if (item) trackEvent('remove_from_cart', { productId: item.id, category: item.category });
      return current.filter((candidate) => String(candidate.id) !== String(productId));
    });
  }, []);

  const clearCart = useCallback(() => setItems([]), []);
  const itemCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);

  const value = useMemo(() => ({
    items, addItem, setQuantity, removeItem, clearCart, itemCount, subtotal,
  }), [addItem, clearCart, itemCount, items, removeItem, setQuantity, subtotal]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
