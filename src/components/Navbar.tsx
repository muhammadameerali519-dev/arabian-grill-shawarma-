import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Menu, Search, ShoppingBag, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { buildGeneralWhatsAppUrl } from '../utils/whatsapp';
import { ShawarmaLogo3D } from './ShawarmaLogo3D';
import { WhatsAppIcon } from './WhatsAppIcon';

interface NavbarProps {
  onOpenSearch: () => void;
  lightSurface?: boolean;
}

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Our Story', to: '/our-story' },
  { label: 'Menu', to: '/menu' },
  { label: 'Gallery', to: '/gallery' },
  { label: 'Contact', to: '/contact' },
];

export const Navbar: React.FC<NavbarProps> = ({ onOpenSearch, lightSurface = false }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { totalItems, subtotalPkr, setDrawerOpen } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 36);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const shellClass = lightSurface
    ? scrolled
      ? 'bg-white/80 border-black/10 text-neutral-950 shadow-[0_14px_38px_-14px_rgba(0,0,0,0.12)]'
      : 'bg-white/92 border-black/10 text-neutral-950 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.08)]'
    : scrolled
      ? 'bg-[#080808]/72 border-white/15 text-white shadow-[0_18px_46px_-16px_rgba(0,0,0,0.85)]'
      : 'bg-[#080808]/88 border-white/14 text-white shadow-[0_14px_36px_-14px_rgba(0,0,0,0.75)]';

  const iconBtnClass = lightSurface
    ? 'bg-black/[0.04] hover:bg-black/[0.09] border border-black/10 text-neutral-900'
    : 'bg-white/[0.06] hover:bg-white/[0.14] border border-white/14 text-white';

  const ctaClass = lightSurface
    ? 'bg-neutral-950 text-white hover:bg-neutral-800'
    : 'bg-white text-[#050505] hover:bg-neutral-200';

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-40 px-2.5 min-[375px]:px-4 sm:px-6 pt-2.5 sm:pt-4 pointer-events-none no-print">
        <div
          className={`max-w-7xl mx-auto pointer-events-auto rounded-[18px] sm:rounded-[22px] border backdrop-blur-xl transition-all duration-300 px-3 min-[375px]:px-4 sm:px-6 h-13 sm:h-16 flex items-center justify-between gap-2 min-[375px]:gap-3 lg:gap-8 ${shellClass}`}
        >
          {/* Zone 1: 3D Shawarma Brand Wordmark */}
          <Link
            to="/"
            className="flex items-center gap-2 min-[375px]:gap-2.5 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current rounded-[14px] min-w-0"
          >
            <ShawarmaLogo3D
              size="xs"
              tone={lightSurface ? 'light' : 'dark'}
              animateEntrance={false}
              priority
              className="shrink-0"
            />
            <span className="font-semibold text-[11px] min-[375px]:text-xs sm:text-[15px] tracking-[0.08em] min-[375px]:tracking-[0.12em] uppercase whitespace-nowrap shrink-0">
              Arabian Grill House
            </span>
          </Link>

          {/* Zone 2: Navigation Links */}
          <nav
            aria-label="Primary Navigation"
            className="hidden lg:flex items-center gap-7 text-sm font-medium"
          >
            {NAV_LINKS.map((link) => {
              const active = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`relative py-1 whitespace-nowrap shrink-0 transition-opacity duration-200 hover:opacity-100 ${
                    active ? 'opacity-100' : 'opacity-65'
                  }`}
                >
                  {link.label}
                  <span
                    className={`absolute left-0 right-0 -bottom-0.5 h-[1.5px] transition-transform duration-200 origin-left ${
                      lightSurface ? 'bg-neutral-950' : 'bg-white'
                    } ${active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Zone 3: Right Actions */}
          <div className="flex items-center gap-1.5 min-[375px]:gap-2 sm:gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onOpenSearch}
              aria-label="Search menu"
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-[12px] sm:rounded-[13px] inline-flex items-center justify-center transition-colors shrink-0 ${iconBtnClass}`}
            >
              <Search className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label={`Open shopping bag (${totalItems} items)`}
              className={`relative w-9 h-9 sm:w-10 sm:h-10 rounded-[12px] sm:rounded-[13px] inline-flex items-center justify-center transition-colors shrink-0 ${iconBtnClass}`}
            >
              <ShoppingBag className="w-4 h-4" />
              {totalItems > 0 && (
                <motion.span
                  key={totalItems}
                  initial={{ scale: 0.7 }}
                  animate={{ scale: 1 }}
                  className={`absolute -top-1.5 -right-1.5 min-w-[18px] sm:min-w-[20px] h-[18px] sm:h-5 px-1 rounded-[7px] text-[10px] sm:text-[11px] font-mono-nums font-semibold flex items-center justify-center shadow-sm ${
                    lightSurface
                      ? 'bg-neutral-950 text-white'
                      : 'bg-white text-[#050505]'
                  }`}
                >
                  {totalItems}
                </motion.span>
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate('/menu')}
              className={`hidden sm:inline-flex items-center justify-center px-4 h-10 rounded-[13px] text-xs font-semibold tracking-[0.08em] uppercase transition-colors whitespace-nowrap shrink-0 ${ctaClass}`}
            >
              Order Now
            </button>

            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileOpen}
              className={`lg:hidden w-9 h-9 sm:w-10 sm:h-10 rounded-[12px] sm:rounded-[13px] inline-flex items-center justify-center transition-colors shrink-0 ${iconBtnClass}`}
            >
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Glassmorphism Navigation Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-40 lg:hidden no-print">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="absolute inset-0 bg-black/65 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: -14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -14, scale: 0.98 }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-x-2.5 min-[375px]:inset-x-4 top-[66px] sm:top-20 z-40 rounded-[24px] glass-dark bg-[#0a0a0a]/95 text-white p-4 min-[375px]:p-5 border border-white/15 shadow-2xl max-h-[calc(100svh-84px)] overflow-y-auto"
            >
              {/* Visible Restaurant Branding inside Mobile Menu */}
              <div className="flex items-center justify-between gap-3 pb-4 mb-3 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <ShawarmaLogo3D
                    size="xs"
                    tone="dark"
                    animateEntrance={false}
                    priority
                  />
                  <div>
                    <p className="text-xs font-semibold tracking-[0.16em] uppercase text-white">
                      Arabian Grill House
                    </p>
                    <p className="text-[11px] text-white/55">
                      Mumtaz Market, Gujranwala
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close mobile menu"
                  className="w-9 h-9 rounded-[11px] border border-white/15 bg-white/5 inline-flex items-center justify-center text-white/80"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="flex flex-col gap-1.5" aria-label="Mobile Navigation">
                {NAV_LINKS.map((link) => {
                  const active = location.pathname === link.to;
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`px-4 min-h-[46px] rounded-[14px] text-sm font-medium transition-colors flex items-center justify-between ${
                        active ? 'bg-white text-[#050505]' : 'text-white/85 hover:bg-white/10'
                      }`}
                    >
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* One-Handed Bottom Thumb Actions: Cart, Order, WhatsApp */}
              <div className="mt-4 pt-4 border-t border-white/10 space-y-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    setDrawerOpen(true);
                  }}
                  className="w-full min-h-[46px] px-4 rounded-[14px] bg-white/[0.08] border border-white/15 text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-between"
                >
                  <span className="inline-flex items-center gap-2.5">
                    <ShoppingBag className="w-4 h-4" />
                    <span>Shopping Bag ({totalItems})</span>
                  </span>
                  <span className="font-mono-nums">
                    Rs. {subtotalPkr.toLocaleString('en-PK')}
                  </span>
                </button>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileOpen(false);
                      navigate('/menu');
                    }}
                    className="min-h-[46px] px-3 rounded-[14px] bg-white text-[#050505] text-xs font-semibold uppercase tracking-wider text-center"
                  >
                    Order Now
                  </button>
                  <a
                    href={buildGeneralWhatsAppUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMobileOpen(false)}
                    className="min-h-[46px] px-3 rounded-[14px] border border-white/15 bg-white/[0.06] text-white text-xs font-semibold uppercase tracking-wider inline-flex items-center justify-center gap-1.5"
                  >
                    <WhatsAppIcon className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </a>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    navigate('/admin');
                  }}
                  className="w-full min-h-[42px] px-4 rounded-[12px] text-white/60 hover:text-white text-[11px] font-medium uppercase tracking-wider text-center"
                >
                  Admin Portal
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
