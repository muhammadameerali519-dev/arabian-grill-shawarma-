import React, { Component, ErrorInfo, ReactNode, useCallback, useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { CartDrawer } from './components/CartDrawer';
import { CinematicIntro } from './components/CinematicIntro';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { Footer } from './components/Footer';
import { Navbar } from './components/Navbar';
import { OfflineIndicator } from './components/PWAInstallButton';
import { SearchModal } from './components/SearchModal';
import { SignaturePromoModal } from './components/SignaturePromoModal';
import { CartProvider } from './context/CartContext';
import { MenuProvider } from './context/MenuContext';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { ContactPage } from './pages/ContactPage';
import { FoodDetailPage } from './pages/FoodDetailPage';
import { GalleryPage } from './pages/GalleryPage';
import { HomePage } from './pages/HomePage';
import { MenuPage } from './pages/MenuPage';
import { OurStoryPage } from './pages/OurStoryPage';
import { ReceiptPage } from './pages/ReceiptPage';

const INTRO_STORAGE_KEY = 'agh_intro_seen_v1';
const PROMO_STORAGE_KEY = 'agh_super_shawarma_promo_v1';

class AppErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; message: string }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Application ErrorBoundary:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6 text-center">
          <div className="max-w-md rounded-[24px] glass-dark p-8 space-y-4">
            <h1 className="font-editorial text-2xl font-semibold">
              Something went wrong
            </h1>
            <p className="text-sm text-white/65">
              Please reload the page to restore your Arabian Grill House session.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-5 py-3 rounded-[14px] bg-white text-[#050505] text-xs font-semibold uppercase tracking-wider"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);
  return null;
};

const AppShell: React.FC = () => {
  const location = useLocation();
  const [introVisible, setIntroVisible] = useState<boolean>(() => {
    try {
      return !sessionStorage.getItem(INTRO_STORAGE_KEY);
    } catch {
      return true;
    }
  });
  const [promoOpen, setPromoOpen] = useState<boolean>(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [homeLightNav, setHomeLightNav] = useState(false);
  const [mapsQuotaExceeded, setMapsQuotaExceeded] = useState(false);

  useEffect(() => {
    const onQuota = () => setMapsQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', onQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', onQuota);
  }, []);

  // Show Signature Promotion Popup once per browsing session when not inside intro
  useEffect(() => {
    if (introVisible) return;
    if (location.pathname === '/menu/item-arabian-special-super-shawarma') return;

    try {
      if (sessionStorage.getItem(PROMO_STORAGE_KEY)) return;
    } catch {
      // Ignore storage errors
    }

    const timer = window.setTimeout(() => {
      setPromoOpen(true);
    }, 350);

    return () => window.clearTimeout(timer);
  }, [introVisible, location.pathname]);

  const handleClosePromo = useCallback(() => {
    try {
      sessionStorage.setItem(PROMO_STORAGE_KEY, '1');
    } catch {
      // Ignore storage errors
    }
    setPromoOpen(false);
  }, []);

  const handleEnterIntro = useCallback(() => {
    try {
      sessionStorage.setItem(INTRO_STORAGE_KEY, '1');
    } catch {
      // Ignore storage errors
    }
    setIntroVisible(false);
  }, []);

  const handleReplayIntro = useCallback(() => {
    setIntroVisible(true);
  }, []);

  const isLightRoute =
    location.pathname === '/gallery' ||
    location.pathname === '/contact' ||
    (location.pathname === '/' && homeLightNav);

  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />

      {mapsQuotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm no-print">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      <CinematicIntro visible={introVisible} onEnter={handleEnterIntro} />

      <SignaturePromoModal open={promoOpen} onClose={handleClosePromo} />

      <Navbar
        onOpenSearch={() => setSearchOpen(true)}
        lightSurface={isLightRoute}
      />

      <main className="flex-1">
        <Routes>
          <Route
            path="/"
            element={<HomePage onNavbarThemeChange={setHomeLightNav} />}
          />
          <Route path="/our-story" element={<OurStoryPage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/menu/:id" element={<FoodDetailPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/receipt/:orderId" element={<ReceiptPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer onReplayIntro={handleReplayIntro} />
      <FloatingWhatsApp />
      <OfflineIndicator />
      <CartDrawer />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <AppErrorBoundary>
      <MenuProvider>
        <CartProvider>
          <BrowserRouter>
            <AppShell />
          </BrowserRouter>
        </CartProvider>
      </MenuProvider>
    </AppErrorBoundary>
  );
}
