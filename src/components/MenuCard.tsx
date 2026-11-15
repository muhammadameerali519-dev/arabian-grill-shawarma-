import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { MenuItem } from '../types/restaurant';
import { SmartImage } from './SmartImage';

interface MenuCardProps {
  item: MenuItem;
  tone?: 'dark' | 'light';
}

export const MenuCard: React.FC<MenuCardProps> = ({ item, tone = 'dark' }) => {
  const { items, addToCart, updateQuantity } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const cartEntry = items.find((entry) => entry.item.id === item.id);
  const quantityInCart = cartEntry?.quantity || 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!item.available) return;
    addToCart(item, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 900);
  };

  const isDark = tone === 'dark';

  return (
    <article
      className={`group rounded-[20px] sm:rounded-[24px] p-3 min-[430px]:p-4 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 min-w-0 ${
        isDark
          ? 'glass-dark text-white hover:border-amber-400/45'
          : 'glass-light text-neutral-950 hover:border-amber-500/45'
      }`}
    >
      <div className="min-w-0">
        <Link
          to={`/menu/${item.id}`}
          className="block relative overflow-hidden rounded-[14px] sm:rounded-[18px] aspect-[4/3] mb-3 sm:mb-4 border border-amber-400/15"
        >
          <SmartImage
            src={item.imageUrl}
            alt={item.name}
            fallbackTitle={item.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {!item.available && (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px] flex items-center justify-center p-2 text-center">
              <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-widest text-white">
                Unavailable
              </span>
            </div>
          )}
        </Link>

        <div
          className={`flex items-center gap-1.5 text-[10px] sm:text-[11px] tracking-wide mb-1 truncate ${
            isDark ? 'text-amber-400/90' : 'text-amber-700'
          }`}
        >
          <span className="truncate font-medium uppercase tracking-wider">{item.categoryName}</span>
          <span aria-hidden="true" className="opacity-50">·</span>
          <span className={`shrink-0 ${isDark ? 'text-white/50' : 'text-neutral-500'}`}>
            {item.prepTimeMinutes}m
          </span>
        </div>

        <Link to={`/menu/${item.id}`} className="block">
          <h3 className="text-sm min-[430px]:text-base sm:text-lg font-semibold leading-snug tracking-tight group-hover:text-amber-400 transition-colors">
            {item.name}
          </h3>
        </Link>

        <p
          className={`mt-1.5 sm:mt-2 text-xs sm:text-sm leading-relaxed line-clamp-3 ${
            isDark ? 'text-white/65' : 'text-neutral-600'
          }`}
        >
          {item.description}
        </p>
      </div>

      <div
        className={`mt-4 sm:mt-5 pt-3 sm:pt-4 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-3 ${
          isDark ? 'border-white/10' : 'border-black/10'
        }`}
      >
        <div className="min-w-0">
          <div
            className={`font-mono-nums text-base sm:text-lg font-bold whitespace-nowrap ${
              isDark ? 'text-amber-400' : 'text-amber-600'
            }`}
          >
            Rs. {item.pricePkr.toLocaleString('en-PK')}
          </div>
        </div>

        {!item.available ? (
          <span
            className={`px-3 py-2 rounded-[12px] text-[11px] font-medium text-center ${
              isDark ? 'bg-white/5 text-white/40' : 'bg-black/5 text-neutral-400'
            }`}
          >
            Unavailable
          </span>
        ) : quantityInCart > 0 ? (
          <div
            className={`inline-flex items-center justify-between sm:justify-start gap-1 rounded-[13px] p-1 border w-full sm:w-auto ${
              isDark
                ? 'bg-white/[0.08] border-amber-400/35'
                : 'bg-black/[0.05] border-amber-500/35'
            }`}
          >
            <button
              type="button"
              onClick={() => updateQuantity(item.id, quantityInCart - 1)}
              aria-label={`Decrease ${item.name} quantity`}
              className={`w-9 h-9 sm:w-8 sm:h-8 rounded-[10px] inline-flex items-center justify-center transition-colors ${
                isDark ? 'hover:bg-white/15' : 'hover:bg-black/10'
              }`}
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-7 text-center text-xs font-mono-nums font-semibold">
              {quantityInCart}
            </span>
            <button
              type="button"
              onClick={() => updateQuantity(item.id, quantityInCart + 1)}
              aria-label={`Increase ${item.name} quantity`}
              className={`w-9 h-9 sm:w-8 sm:h-8 rounded-[10px] inline-flex items-center justify-center transition-colors ${
                isDark ? 'hover:bg-white/15' : 'hover:bg-black/10'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleAdd}
            className={`w-full sm:w-auto min-h-[40px] inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-[13px] text-[11px] sm:text-xs font-semibold tracking-wider uppercase transition-all duration-200 whitespace-nowrap shrink-0 ${
              isDark
                ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-[#050505] hover:from-amber-300 hover:to-orange-400'
                : 'bg-[#050505] text-white hover:bg-neutral-800'
            }`}
          >
            {justAdded ? <Check className="w-3.5 h-3.5" /> : <ShoppingBag className="w-3.5 h-3.5" />}
            <span>{justAdded ? 'Added' : 'Add to Cart'}</span>
          </button>
        )}
      </div>
    </article>
  );
};
