import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Clock, Minus, Plus, ShoppingBag, Sparkles } from 'lucide-react';
import { MenuCard } from '../components/MenuCard';
import { SmartImage } from '../components/SmartImage';
import { SquircleIcon } from '../components/SquircleIcon';
import { useCart } from '../context/CartContext';
import { useMenu } from '../context/MenuContext';

export const FoodDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { menuItems } = useMenu();
  const { addToCart, setDrawerOpen } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [addedFeedback, setAddedFeedback] = useState(false);

  const item = useMemo(() => menuItems.find((m) => m.id === id), [menuItems, id]);

  const relatedItems = useMemo(() => {
    if (!item) return [];
    return menuItems
      .filter((m) => m.id !== item.id && m.categoryId === item.categoryId)
      .slice(0, 3);
  }, [menuItems, item]);

  if (!item) {
    return (
      <div className="bg-[#050505] text-white min-h-screen pt-28 sm:pt-32 pb-20 px-4 sm:px-6 flex items-center justify-center">
        <div className="max-w-md text-center space-y-5">
          <h1 className="font-editorial text-fluid-h2 font-semibold">Dish Not Found</h1>
          <p className="text-sm text-white/65">
            This item may have been removed or updated by the restaurant.
          </p>
          <Link
            to="/menu"
            className="min-h-[46px] inline-flex items-center gap-2 px-5 py-3 rounded-[16px] bg-white text-[#050505] text-xs font-semibold uppercase tracking-wider"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Menu</span>
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!item.available) return;
    addToCart(item, quantity);
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 1200);
    setDrawerOpen(true);
  };

  return (
    <div className="bg-[#050505] text-white min-h-screen pt-24 sm:pt-32 pb-24 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2.5 text-xs font-semibold uppercase tracking-wider text-white/65 hover:text-white mb-6 sm:mb-8 transition-colors min-h-[44px]"
        >
          <SquircleIcon size="sm" tone="dark">
            <ArrowLeft className="w-4 h-4" />
          </SquircleIcon>
          <span>Back to Menu</span>
        </button>

        {/* Contiguous Purchase Module */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 items-stretch">
          <div className="lg:col-span-6">
            <div className="rounded-[22px] sm:rounded-[28px] overflow-hidden border border-white/14 aspect-[4/3] lg:h-full">
              <SmartImage
                src={item.imageUrl}
                alt={item.name}
                fallbackTitle={item.name}
                className="w-full h-full object-cover"
                loading="eager"
              />
            </div>
          </div>

          <div className="lg:col-span-6 rounded-[24px] sm:rounded-[28px] glass-dark p-5 sm:p-10 flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-white/55 mb-3">
                <span>{item.categoryName}</span>
                <span aria-hidden="true">·</span>
                <span>{item.available ? 'Available Today' : 'Currently Unavailable'}</span>
              </div>

              <h1 className="font-editorial text-fluid-h2 font-semibold tracking-tight text-balance">
                {item.name}
              </h1>

              <div className="mt-4 sm:mt-5 flex flex-wrap items-baseline gap-2.5 sm:gap-3">
                <span className="font-mono-nums text-2xl sm:text-3xl font-bold text-amber-400">
                  Rs. {item.pricePkr.toLocaleString('en-PK')}
                </span>
              </div>

              <p className="mt-5 sm:mt-6 text-sm sm:text-base text-white/75 leading-relaxed">
                {item.description}
              </p>

              <div className="mt-7 sm:mt-8 grid grid-cols-1 min-[375px]:grid-cols-2 gap-3.5 sm:gap-4">
                <div className="rounded-[18px] p-4 bg-white/[0.04] border border-white/10 flex items-center gap-3">
                  <SquircleIcon size="sm" tone="dark">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                  </SquircleIcon>
                  <div>
                    <p className="text-[11px] text-white/50">Spice Level</p>
                    <p className="text-sm font-medium">{item.spiceLevel}</p>
                  </div>
                </div>
                <div className="rounded-[18px] p-4 bg-white/[0.04] border border-white/10 flex items-center gap-3">
                  <SquircleIcon size="sm" tone="dark">
                    <Clock className="w-4 h-4 text-amber-400" />
                  </SquircleIcon>
                  <div>
                    <p className="text-[11px] text-white/50">Prep Time</p>
                    <p className="text-sm font-medium font-mono-nums">
                      ~{item.prepTimeMinutes} min
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 sm:mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 sm:gap-4">
              <div className="inline-flex items-center justify-between sm:justify-start gap-2 rounded-[16px] bg-white/[0.06] border border-white/14 p-1.5">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="w-11 h-11 sm:w-10 sm:h-10 rounded-[12px] hover:bg-white/12 inline-flex items-center justify-center transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-mono-nums font-semibold text-base">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(50, q + 1))}
                  aria-label="Increase quantity"
                  className="w-11 h-11 sm:w-10 sm:h-10 rounded-[12px] hover:bg-white/12 inline-flex items-center justify-center transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                disabled={!item.available}
                onClick={handleAddToCart}
                className="flex-1 min-h-[48px] py-3.5 px-6 rounded-[16px] bg-gradient-to-r from-amber-400 to-orange-500 text-[#050505] hover:from-amber-300 hover:to-orange-400 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold tracking-[0.12em] uppercase inline-flex items-center justify-center gap-2.5 transition-all"
              >
                {addedFeedback ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <ShoppingBag className="w-4 h-4" />
                )}
                <span>
                  {!item.available
                    ? 'Currently Unavailable'
                    : addedFeedback
                      ? 'Added to Bag'
                      : `Add to Bag · Rs. ${(item.pricePkr * quantity).toLocaleString('en-PK')}`}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Related */}
        {relatedItems.length > 0 && (
          <section className="mt-16 sm:mt-20 pt-12 sm:pt-14 border-t border-white/10">
            <h2 className="font-editorial text-fluid-h2 font-semibold mb-6 sm:mb-8">
              More from {item.categoryName}
            </h2>
            <div className="grid grid-cols-1 min-[375px]:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
              {relatedItems.map((rel) => (
                <MenuCard key={rel.id} item={rel} tone="dark" />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
