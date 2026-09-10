import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { BarChart3, Boxes, ClipboardList, Image, LayoutDashboard, LogOut, Menu, MessageSquare, Megaphone, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import logo from '../../../img/DANIA LOGO PNG-01.png';
import { Moon, Sun } from 'lucide-react';

export default function AdminShell() {
  const { t } = useLanguage();
  const { signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const links = [[LayoutDashboard, 'dashboard', '/admin'], [Boxes, 'products', '/admin/products'], [ClipboardList, 'orders', '/admin/orders'], [Megaphone, 'advertisements', '/admin/advertisements'], [Image, 'gallery', '/admin/gallery'], [MessageSquare, 'contacts', '/admin/contacts'], [BarChart3, 'analytics', '/admin/analytics']];
  const navigation = <><div className="flex h-20 items-center justify-between border-b border-border px-5"><img src={logo} alt="Daniya" className="h-11 w-auto" /><Button type="button" variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(false)} aria-label={t('close')}><X className="h-5 w-5" /></Button></div><nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label={t('admin')}>{links.map(([Icon, label, href]) => <NavLink end={href === '/admin'} key={href} to={href} onClick={() => setOpen(false)} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-4 py-3 font-semibold ${isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground'}`}><Icon className="h-5 w-5" />{t(label)}</NavLink>)}</nav><div className="space-y-2 border-t border-border p-3"><Button type="button" variant="ghost" onClick={toggleTheme} className="w-full justify-start gap-3">{theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}{theme === 'dark' ? t('lightMode') : t('darkMode')}</Button><Button type="button" variant="ghost" onClick={signOut} className="w-full justify-start gap-3 text-destructive hover:text-destructive"><LogOut className="h-5 w-5" />{t('logout')}</Button></div></>;
  return <div className="min-h-screen bg-background"><aside className="fixed inset-y-0 z-50 hidden w-64 border-e border-border bg-card lg:flex lg:flex-col [inset-inline-start:0]">{navigation}</aside>{open && <><button type="button" className="fixed inset-0 z-40 bg-black/45 lg:hidden" onClick={() => setOpen(false)} aria-label={t('close')} /><aside className="fixed inset-y-0 z-50 flex w-72 flex-col bg-card shadow-2xl lg:hidden [inset-inline-start:0]">{navigation}</aside></>}<div className="min-h-screen lg:[margin-inline-start:16rem]"><header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur sm:px-6"><Button type="button" variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(true)} aria-label={t('menu')}><Menu className="h-5 w-5" /></Button><span className="text-sm font-semibold text-muted-foreground">{t('admin')}</span></header><main className="p-4 sm:p-6 lg:p-8"><Outlet /></main></div></div>;
}
