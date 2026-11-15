import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, ShoppingBag, X } from 'lucide-react';
import { useMenu } from '../context/MenuContext';
import { SmartImage } from './SmartImage';

interface SignaturePromoModalProps {
  open: boolean;
  onClose: () => void;
}

const FEATURED_PRODUCT_ID = 'item-arabian-special-super-shawarma';

export const SignaturePromoModal: React.FC<SignaturePromoModalProps> = ({
  open,
  onClose,
}) => {
  const navigate = useNavigate();
  const { menuItems } = useMenu();

  const product = menuItems.find((item) => item.id === FEATURED_PRODUCT_ID);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!product) return null;

  const handleOrderNow = () => {
    onClose();
    navigate(`/menu/${product.id}`);
  };

  const handleExploreMenu = () => {
    onClose();
    navigate('/menu');
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 min-[375px]:p-4 sm:p-6 bg-black/85 backdrop-blur-xl no-print"
          role="dialog"
          aria-modal="true"
          aria-labelledby="promo-modal-heading"
          onClick={onClose}
        >
          {/* Ambient subtle crimson & white studio highlights */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[540px] h-[540px] rounded-full bg-red-600/14 blur-[120px]" />
            <div className="absolute top-1/4 right-1/4 w-[280px] h-[280px] rounded-full bg-white/[0.06] blur-[90px]" />
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl max-h-[92svh] overflow-y-auto rounded-[24px] sm:rounded-[32px] bg-[#080808]/95 border border-white/15 shadow-[0_32px_90px_rgba(0,0,0,0.85)] ring-1 ring-red-500/20"
          >
            {/* Light sweep accent border */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/70 to-transparent" />

            {/* Top-Right Squircle Close Button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close promotion"
              className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-[13px] bg-white/[0.08] hover:bg-white/[0.16] border border-white/20 text-white inline-flex items-center justify-center transition-colors shadow-lg"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
              {/* Left: Animated Signature Shawarma Image Showcase */}
              <div className="lg:col-span-6 relative p-4 sm:p-6 flex items-center justify-center bg-gradient-to-br from-black via-[#120707] to-[#080808] border-b lg:border-b-0 lg:border-r border-white/10 overflow-hidden">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.18),transparent_68%)]" />

                <motion.div
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
                  className="relative w-full max-w-[380px] aspect-[4/3] rounded-[20px] sm:rounded-[24px] overflow-hidden border border-white/20 shadow-[0_24px_60px_rgba(0,0,0,0.75)] shawarma-float-compact"
                >
                  <SmartImage
                    src={product.imageUrl}
                    alt={product.name}
                    fallbackTitle={product.name}
                    loading="eager"
                    className="w-full h-full object-cover"
                  />
                  {/* Subtle glass highlight overlay */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/35 via-transparent to-white/15" />
                </motion.div>
              </div>

              {/* Right: Editorial Copy & Squircle CTAs */}
              <div className="lg:col-span-6 p-5 min-[375px]:p-6 sm:p-9 lg:p-10 flex flex-col justify-between">
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
                  className="pr-8 sm:pr-10"
                >
                  <p className="text-[11px] sm:text-xs font-bold tracking-[0.24em] uppercase text-red-400">
                    MEET OUR SIGNATURE SPECIAL!
                  </p>

                  <h2
                    id="promo-modal-heading"
                    className="mt-2.5 sm:mt-3 font-editorial text-2xl min-[375px]:text-3xl sm:text-4xl font-semibold tracking-tight text-white leading-[1.1] text-balance"
                  >
                    ARABIAN SPECIAL SUPER SHAWARMA
                  </h2>

                  <div className="mt-3.5 sm:mt-4 flex flex-wrap items-baseline gap-3">
                    <span className="font-mono-nums text-xl sm:text-2xl font-bold text-white">
                      Rs. {product.pricePkr.toLocaleString('en-PK')}
                    </span>
                    <span className="text-xs text-white/60">
                      {product.available ? 'Available Now' : 'Currently Unavailable'}
                    </span>
                  </div>

                  <p className="mt-4 text-xs sm:text-sm text-white/75 leading-relaxed">
                    Experience the ultimate Arabian flavour. Delicious, satisfying, and crafted to make every bite unforgettable.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
                  className="mt-6 sm:mt-8 pt-5 border-t border-white/10 flex flex-col sm:flex-row gap-3"
                >
                  <button
                    type="button"
                    onClick={handleOrderNow}
                    className="w-full sm:flex-1 min-h-[48px] px-5 py-3.5 rounded-[16px] bg-white text-[#050505] hover:bg-neutral-200 border border-red-500/35 text-xs font-bold tracking-[0.14em] uppercase inline-flex items-center justify-center gap-2 transition-colors shadow-[0_10px_30px_rgba(220,38,38,0.22)]"
                  >
                    <ShoppingBag className="w-4 h-4 text-red-600" />
                    <span>ORDER NOW</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExploreMenu}
                    className="w-full sm:flex-1 min-h-[48px] px-5 py-3.5 rounded-[16px] bg-white/[0.06] hover:bg-white/[0.12] border border-white/20 text-white text-xs font-semibold tracking-[0.14em] uppercase inline-flex items-center justify-center gap-2 transition-colors"
                  >
                    <span>EXPLORE MENU</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
