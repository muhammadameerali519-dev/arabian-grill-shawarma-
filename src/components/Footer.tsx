import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, MapPin, Phone, RotateCcw } from 'lucide-react';
import { RESTAURANT_INFO } from '../data/seedData';
import { useMenu } from '../context/MenuContext';
import { ShawarmaLogo3D } from './ShawarmaLogo3D';
import { SquircleIcon } from './SquircleIcon';

interface FooterProps {
  onReplayIntro?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onReplayIntro }) => {
  const { settings } = useMenu();

  return (
    <footer className="bg-[#050505] text-white border-t border-white/10 pt-14 sm:pt-16 pb-20 md:pb-12 px-4 sm:px-6 no-print">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 pb-12 border-b border-white/10">
          {/* Brand with 3D Shawarma Visual */}
          <div className="space-y-4 flex flex-col items-start">
            <ShawarmaLogo3D
              size="sm"
              tone="dark"
              showWordmark
              wordmarkSize="sm"
              animateEntrance={false}
              className="items-start [&>span]:text-left [&>span]:mt-2.5"
            />
            <p className="text-[11px] sm:text-xs tracking-[0.16em] uppercase text-white/80 font-medium">
              Unwrap the Magic of Arabian Shawarma
            </p>
            <p className="text-sm text-white/60 leading-relaxed max-w-xs">
              Authentic Arabian shawarma, warm grilled platters, and charcoal specialties crafted fresh in Gujranwala.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-xs font-semibold tracking-[0.18em] uppercase text-white/45 mb-4">
              Explore
            </h3>
            <ul className="space-y-2.5 text-sm text-white/75">
              <li>
                <Link to="/" className="hover:text-white transition-colors inline-block py-0.5">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/our-story" className="hover:text-white transition-colors inline-block py-0.5">
                  Our Story
                </Link>
              </li>
              <li>
                <Link to="/menu" className="hover:text-white transition-colors inline-block py-0.5">
                  Full Menu
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="hover:text-white transition-colors inline-block py-0.5">
                  Gallery
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors inline-block py-0.5">
                  Contact & Location
                </Link>
              </li>
            </ul>
          </div>

          {/* Ordering & Management */}
          <div>
            <h3 className="text-xs font-semibold tracking-[0.18em] uppercase text-white/45 mb-4">
              Orders & Portal
            </h3>
            <ul className="space-y-2.5 text-sm text-white/75">
              <li>
                <Link to="/cart" className="hover:text-white transition-colors inline-block py-0.5">
                  Shopping Bag
                </Link>
              </li>
              <li>
                <Link to="/checkout" className="hover:text-white transition-colors inline-block py-0.5">
                  WhatsApp Checkout
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-white transition-colors inline-block py-0.5">
                  Admin Dashboard
                </Link>
              </li>
              {onReplayIntro && (
                <li>
                  <button
                    type="button"
                    onClick={onReplayIntro}
                    className="inline-flex items-center gap-2 text-white/65 hover:text-white transition-colors py-0.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Replay Welcome Intro</span>
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Location & Hours */}
          <div className="space-y-3.5 text-sm text-white/70">
            <h3 className="text-xs font-semibold tracking-[0.18em] uppercase text-white/45 mb-4">
              Visit Us
            </h3>
            <div className="flex items-start gap-3">
              <SquircleIcon size="sm" tone="dark" className="mt-0.5">
                <MapPin className="w-4 h-4" />
              </SquircleIcon>
              <span className="leading-relaxed text-xs sm:text-sm">{RESTAURANT_INFO.address}</span>
            </div>
            <div className="flex items-center gap-3">
              <SquircleIcon size="sm" tone="dark">
                <Phone className="w-4 h-4" />
              </SquircleIcon>
              <a
                href={`tel:${RESTAURANT_INFO.phoneTel}`}
                className="font-mono-nums hover:text-white transition-colors"
              >
                {RESTAURANT_INFO.phoneDisplay}
              </a>
            </div>
            <div className="flex items-start gap-3">
              <SquircleIcon size="sm" tone="dark" className="mt-0.5">
                <Clock className="w-4 h-4" />
              </SquircleIcon>
              <div>
                <p className="text-white">
                  {settings.openTime} – {settings.closeTime}
                </p>
                <p className="text-xs text-white/50 mt-0.5">
                  Opening hours may change
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-white/45">
          <p>© {new Date().getFullYear()} Arabian Grill House · Shop #135 Mumtaz Market, G.T Road Gujranwala, Pakistan.</p>
          <p>
            Official menu managed via the Arabian Grill House Admin Dashboard.
          </p>
        </div>
      </div>
    </footer>
  );
};
