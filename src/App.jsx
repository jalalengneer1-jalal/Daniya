import React, { Suspense } from 'react';
import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { CartProvider } from '@/contexts/CartContext';
import { AuthProvider } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageTracker from '@/components/PageTracker';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminShell from '@/components/admin/AdminShell';
import { Toaster } from '@/components/ui/toaster';
import { LoadingState } from '@/components/AsyncState';

const Home = React.lazy(() => import('@/pages/Home'));
const About = React.lazy(() => import('@/pages/About'));
const Products = React.lazy(() => import('@/pages/Products'));
const Gallery = React.lazy(() => import('@/pages/Gallery'));
const Contact = React.lazy(() => import('@/pages/Contact'));
const Cart = React.lazy(() => import('@/pages/Cart'));
const Checkout = React.lazy(() => import('@/pages/Checkout'));
const NotFound = React.lazy(() => import('@/pages/NotFound'));
const AdminLogin = React.lazy(() => import('@/pages/admin/AdminLogin'));
const Dashboard = React.lazy(() => import('@/pages/admin/Dashboard'));
const ProductsAdmin = React.lazy(() => import('@/pages/admin/ProductsAdmin'));
const OrdersAdmin = React.lazy(() => import('@/pages/admin/OrdersAdmin'));
const AdvertisementsAdmin = React.lazy(() => import('@/pages/admin/AdvertisementsAdmin'));
const GalleryAdmin = React.lazy(() => import('@/pages/admin/GalleryAdmin'));
const ContactsAdmin = React.lazy(() => import('@/pages/admin/ContactsAdmin'));
const AnalyticsAdmin = React.lazy(() => import('@/pages/admin/AnalyticsAdmin'));

function PublicLayout() {
  return <div className="flex min-h-screen flex-col"><Header /><main className="min-w-0 flex-1"><Outlet /></main><Footer /></div>;
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <CartProvider>
            <BrowserRouter>
              <PageTracker />
              <Suspense fallback={<div className="grid min-h-screen place-items-center"><LoadingState /></div>}>
              <Routes>
                <Route element={<PublicLayout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/gallery" element={<Gallery />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<ProtectedRoute><AdminShell /></ProtectedRoute>}>
                  <Route index element={<Dashboard />} />
                  <Route path="products" element={<ProductsAdmin />} />
                  <Route path="orders" element={<OrdersAdmin />} />
                  <Route path="advertisements" element={<AdvertisementsAdmin />} />
                  <Route path="gallery" element={<GalleryAdmin />} />
                  <Route path="contacts" element={<ContactsAdmin />} />
                  <Route path="analytics" element={<AnalyticsAdmin />} />
                </Route>
              </Routes>
              </Suspense>
              <Toaster />
            </BrowserRouter>
          </CartProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
