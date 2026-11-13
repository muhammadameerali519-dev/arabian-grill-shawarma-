import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Minus, Plus, Receipt, ShoppingBag, Trash2 } from 'lucide-react';
import { SmartImage } from '../components/SmartImage';
import { SquircleIcon } from '../components/SquircleIcon';
import { useCart } from '../context/CartContext';
import { useMenu } from '../context/MenuContext';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { settings } = useMenu();
  const {
    items,
    totalItems,
    subtotalPkr,
    updateQuantity,
    removeItem,
    clearCart,
    recentReceipts,
  } = useCart();

  return (
    <div className="bg-[#050505] text-white min-h-screen pt-24 sm:pt-32 pb-24 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="pb-6 sm:pb-8 border-b border-white/10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-xs tracking-[0.24em] uppercase text-white/55 mb-2">
              Order Bag
            </p>
            <h1 className="font-editorial text-fluid-h1 font-semibold tracking-tight">
              Shopping Bag
            </h1>
          </div>
          {items.length > 0 && (
            <button
              type="button"
              onClick={clearCart}
              className="text-xs uppercase tracking-wider text-white/55 hover:text-white transition-colors self-start sm:self-auto min-h-[40px]"
            >
              Clear All Items
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="mt-8 sm:mt-12 rounded-[24px] sm:rounded-[28px] glass-dark p-8 sm:p-12 text-center">
            <SquircleIcon size="lg" tone="dark" className="mx-auto mb-5">
              <ShoppingBag className="w-6 h-6 text-white/75" />
            </SquircleIcon>
            <h2 className="font-editorial text-2xl font-semibold mb-2">
              Your shopping bag is currently empty
            </h2>
            <p className="text-sm text-white/60 max-w-md mx-auto mb-7">
              Browse our Arabian shawarma, platters, and charcoal-grilled dishes to begin your order.
            </p>
            <Link
              to="/menu"
              className="min-h-[48px] inline-flex items-center gap-2.5 px-6 py-3.5 rounded-[16px] bg-white text-[#050505] text-xs font-semibold uppercase tracking-wider hover:bg-neutral-200 transition-colors"
            >
              <span>Explore Menu</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="mt-8 sm:mt-10 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
            <div className="lg:col-span-8 space-y-4">
              {items.map(({ item, quantity }) => (
                <div
                  key={item.id}
                  className="rounded-[22px] sm:rounded-[24px] glass-dark p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4"
                >
                  <Link
                    to={`/menu/${item.id}`}
                    className="w-full sm:w-28 h-44 sm:h-24 rounded-[16px] overflow-hidden shrink-0 border border-white/10"
                  >
                    <SmartImage
                      src={item.imageUrl}
                      alt={item.name}
                      fallbackTitle={item.name}
                      className="w-full h-full object-cover"
                    />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white/50">{item.categoryName}</p>
                    <Link
                      to={`/menu/${item.id}`}
                      className="text-base sm:text-lg font-semibold hover:opacity-80 transition-opacity block mt-0.5"
                    >
                      {item.name}
                    </Link>
                    <p className="font-mono-nums text-xs text-white/60 mt-1">
                      Rs. {item.pricePkr.toLocaleString('en-PK')} each
                    </p>
                  </div>

                  <div className="w-full sm:w-auto flex flex-wrap items-center justify-between sm:justify-end gap-3 sm:gap-5 pt-3 sm:pt-0 border-t sm:border-t-0 border-white/10">
                    <div className="inline-flex items-center gap-1 rounded-[14px] bg-white/[0.06] border border-white/14 p-1">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, quantity - 1)}
                        aria-label={`Decrease ${item.name} quantity`}
                        className="w-9 h-9 rounded-[10px] hover:bg-white/12 inline-flex items-center justify-center transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-7 text-center font-mono-nums text-sm font-semibold">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, quantity + 1)}
                        aria-label={`Increase ${item.name} quantity`}
                        className="w-9 h-9 rounded-[10px] hover:bg-white/12 inline-flex items-center justify-center transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3 ml-auto sm:ml-0">
                      <div className="text-right">
                        <div className="font-mono-nums text-sm sm:text-base font-semibold whitespace-nowrap">
                          Rs. {(item.pricePkr * quantity).toLocaleString('en-PK')}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        aria-label={`Remove ${item.name}`}
                        className="w-10 h-10 rounded-[12px] border border-white/12 bg-white/[0.04] hover:bg-white/[0.12] text-white/60 hover:text-white inline-flex items-center justify-center transition-colors shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <aside className="lg:col-span-4 rounded-[24px] sm:rounded-[26px] glass-dark p-5 sm:p-7 space-y-5 sm:space-y-6 lg:sticky lg:top-28">
              <h2 className="font-editorial text-2xl font-semibold">Order Summary</h2>

              <div className="space-y-3 text-sm border-b border-white/10 pb-5">
                <div className="flex justify-between text-white/70">
                  <span>Items ({totalItems})</span>
                  <span className="font-mono-nums text-white">
                    Rs. {subtotalPkr.toLocaleString('en-PK')}
                  </span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>Standard Delivery</span>
                  <span className="font-mono-nums text-white">
                    {settings.freeDeliveryThresholdPkr > 0 &&
                    subtotalPkr >= settings.freeDeliveryThresholdPkr
                      ? 'Free'
                      : `Rs. ${settings.deliveryChargePkr.toLocaleString('en-PK')}`}
                  </span>
                </div>
                <p className="text-xs text-white/50">
                  Pickup orders incur zero delivery charges. Final total confirmed at checkout.
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate('/checkout')}
                className="w-full min-h-[48px] py-3.5 px-6 rounded-[16px] bg-white text-[#050505] hover:bg-neutral-200 text-xs font-semibold tracking-[0.14em] uppercase inline-flex items-center justify-center gap-2.5 transition-colors"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <Link
                to="/menu"
                className="block text-center text-xs uppercase tracking-wider text-white/60 hover:text-white transition-colors py-1"
              >
                Add More Dishes
              </Link>
            </aside>
          </div>
        )}

        {/* Recent Local Receipts */}
        {recentReceipts.length > 0 && (
          <section className="mt-14 sm:mt-16 pt-10 sm:pt-12 border-t border-white/10">
            <h2 className="font-editorial text-2xl font-semibold mb-5">
              Recent Order Receipts
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentReceipts.slice(0, 3).map((rec) => (
                <Link
                  key={rec.id}
                  to={`/receipt/${rec.id}`}
                  className="rounded-[20px] glass-dark p-4 sm:p-5 hover:border-white/25 transition-colors flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <SquircleIcon size="sm" tone="dark">
                      <Receipt className="w-4 h-4" />
                    </SquircleIcon>
                    <div className="min-w-0">
                      <p className="font-mono-nums text-sm font-semibold truncate">
                        {rec.orderNumber}
                      </p>
                      <p className="text-xs text-white/55 truncate">
                        {rec.orderType} · Rs. {rec.totalPkr.toLocaleString('en-PK')}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-white/55 shrink-0" />
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
