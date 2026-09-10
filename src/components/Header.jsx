import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Globe2, Menu, Moon, Search, ShoppingBag, Sun, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import logo from '../../img/DANIA LOGO PNG-01.png';

export default function Header() {
  const { t, language, setLanguageDirect, supportedLanguages } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [languagesOpen, setLanguagesOpen] = useState(false);
  const [query, setQuery] = useState('');
  const languageMenu = useRef(null);

  const navigation = [
    ['home', '/'], ['about', '/about'], ['products', '/products'], ['gallery', '/gallery'], ['contact', '/contact'],
  ];

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const close = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false); setSearchOpen(false); setLanguagesOpen(false);
      }
      if (event.type === 'pointerdown' && languageMenu.current && !languageMenu.current.contains(event.target)) {
        setLanguagesOpen(false);
      }
    };
    document.addEventListener('keydown', close);
    document.addEventListener('pointerdown', close);
    return () => {
      document.removeEventListener('keydown', close);
      document.removeEventListener('pointerdown', close);
    };
  }, []);

  function submitSearch(event) {
    event.preventDefault();
    const clean = query.trim().slice(0, 80);
    navigate(clean ? `/products?search=${encodeURIComponent(clean)}` : '/products');
  }

  return (
    <header className="glass-effect fixed inset-x-0 top-0 z-50 border-b">
      <nav className="content-shell" aria-label={t('menu')}>
        <div className="flex h-20 items-center justify-between gap-2">
          <Link to="/" aria-label={`${t('brand')} — ${t('home')}`} className="shrink-0 rounded-lg">
            <img src={logo} alt="Daniya" className="h-10 w-auto sm:h-12" width="130" height="48" />
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {navigation.map(([label, href]) => (
              <NavLink key={href} to={href} end={href === '/'} className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-semibold transition-colors ${isActive ? 'bg-primary/15 text-primary' : 'text-foreground/75 hover:bg-accent hover:text-foreground'}`
              }>{t(label)}</NavLink>
            ))}
          </div>

          <div className="flex items-center gap-0.5 sm:gap-1">
            <Button type="button" variant="ghost" size="icon" onClick={() => setSearchOpen((open) => !open)} aria-label={t('search')} aria-expanded={searchOpen}>
              <Search className="h-5 w-5" />
            </Button>
            <Link to="/cart" className="relative grid h-10 w-10 place-items-center rounded-full hover:bg-accent" aria-label={`${t('cart')}: ${itemCount}`}>
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && <span className="absolute -end-0.5 -top-0.5 grid min-h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground">{itemCount > 99 ? '99+' : itemCount}</span>}
            </Link>
            <Button type="button" variant="ghost" size="icon" onClick={toggleTheme} aria-label={theme === 'dark' ? t('lightMode') : t('darkMode')}>
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <div className="relative" ref={languageMenu}>
              <Button type="button" variant="ghost" className="gap-1 px-2" onClick={() => setLanguagesOpen((open) => !open)} aria-label={t('language')} aria-expanded={languagesOpen}>
                <Globe2 className="hidden h-4 w-4 sm:block" /><span className="text-xs font-bold">{supportedLanguages.find((item) => item.code === language)?.short}</span>
              </Button>
              {languagesOpen && (
                <div className="absolute end-0 top-12 min-w-40 overflow-hidden rounded-xl border border-border bg-popover p-1 text-popover-foreground shadow-xl" role="menu">
                  {supportedLanguages.map((item) => (
                    <button key={item.code} type="button" role="menuitem" lang={item.code} dir={item.code === 'ar' ? 'rtl' : 'ltr'} onClick={() => { setLanguageDirect(item.code); setLanguagesOpen(false); }} className={`w-full rounded-lg px-3 py-2 text-start text-sm hover:bg-accent ${language === item.code ? 'bg-primary/15 text-primary' : ''}`}>
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Button type="button" variant="ghost" size="icon" className="lg:hidden" onClick={() => setMenuOpen((open) => !open)} aria-label={t('menu')} aria-expanded={menuOpen}>
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {searchOpen && (
          <form onSubmit={submitSearch} className="flex gap-2 border-t border-border/70 py-3" role="search">
            <label htmlFor="global-search" className="sr-only">{t('searchProducts')}</label>
            <input id="global-search" autoFocus value={query} onChange={(event) => setQuery(event.target.value)} maxLength="80" className="form-control" placeholder={t('searchProducts')} />
            <Button type="submit" className="shrink-0"><Search className="me-2 h-4 w-4" />{t('search')}</Button>
          </form>
        )}

        {menuOpen && (
          <div className="grid gap-1 border-t border-border/70 py-3 lg:hidden">
            {navigation.map(([label, href]) => (
              <NavLink key={href} to={href} end={href === '/'} className={({ isActive }) =>
                `rounded-xl px-4 py-3 font-semibold ${isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`
              }>{t(label)}</NavLink>
            ))}
          </div>
        )}
      </nav>
    </header>
  );
}
