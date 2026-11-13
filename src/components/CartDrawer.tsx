import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useMenu } from '../context/MenuContext';
import { SmartImage } from './SmartImage';
import { SquircleIcon } from './SquircleIcon';

export const CartDrawer: React.FC = () => {
  const navigate = useNavigate();
  const { settings } = useMenu();
  const {
    items,
    isDrawerOpen,
    setDrawerOpen,
    totalItems,
    subtotalPkr,
    updateQuantity,
    removeItem,
  } = useCart();

  const remainingForFreeDelivery = Math.max(
    0,
    settings.freeDeliveryThresholdPkr - subtotalPkr
  );

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end no-print" role="dialog" aria-modal="true" aria-label="Shopping Bag">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-full sm:max-w-md h-full bg-[#0a0a0a] text-white sm:border-l border-white/12 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <SquircleIcon size="sm" tone="dark">
                  <ShoppingBag className="w-4 h-4" />
                </SquircleIcon>
                <div>
                  <h2 className="text-base font-semibold tracking-tight">Your Order Bag</h2>
                  <p className="text-xs text-white/55 font-mono-nums">
                    {totalItems} {totalItems === 1 ? 'item' : 'items'} selected
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close bag"
                className="w-10 h-10 rounded-[13px] border border-white/12 bg-white/5 hover:bg-white/12 inline-flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5 space-y-3.5 sm:space-y-4">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <SquircleIcon size="lg" tone="dark" className="mb-4">
                    <ShoppingBag className="w-6 h-6 text-white/70" />
                  </SquircleIcon>
                  <p className="font-editorial text-xl text-white mb-2">Your bag is empty</p>
                  <p className="text-sm text-white/55 max-w-xs mb-6">
                    Explore our Arabian shawarma, platters, and charcoal-grilled specialties to begin your order.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setDrawerOpen(false);
                      navigate('/menu');
                    }}
                    className="px-5 py-3.5 min-h-[44px] rounded-[16px] bg-white text-[#050505] text-xs font-semibold uppercase tracking-wider hover:bg-neutral-200 transition-colors"
                  >
                    Browse Full Menu
                  </button>
                </div>
              ) : (
                <>
                  {settings.freeDeliveryThresholdPkr > 0 && (
                    <div className="p-3.5 rounded-[16px] bg-white/[0.04] border border-white/10 text-xs text-white/75">
                      {remainingForFreeDelivery > 0 ? (
                        <span>
                          Add{' '}
                          <strong className="text-white font-mono-nums">
                            Rs. {remainingForFreeDelivery.toLocaleString('en-PK')}
                          </strong>{' '}
                          more for complimentary Gujranwala delivery.
                        </span>
                      ) : (
                        <span className="text-white">
                          Complimentary Gujranwala delivery unlocked on this order.
                        </span>
                      )}
                    </div>
                  )}

                  {items.map(({ item, quantity }) => (
                    <div
                      key={item.id}
                      className="p-3 sm:p-3.5 rounded-[20px] glass-dark flex gap-3 items-center"
                    >
                      <SmartImage
                        src={item.imageUrl}
                        alt={item.name}
                        fallbackTitle={item.name}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-[13px] object-cover shrink-0 border border-white/10"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-white truncate">
                          {item.name}
                        </h3>
                        <p className="text-xs text-white/55 font-mono-nums mt-0.5">
                          Rs. {item.pricePkr.toLocaleString('en-PK')} each
                        </p>

                        <div className="mt-2.5 flex items-center justify-between gap-2 flex-wrap">
                          <div className="inline-flex items-center gap-0.5 rounded-[12px] bg-white/[0.06] border border-white/12 p-0.5">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, quantity - 1)}
                              aria-label={`Decrease ${item.name} quantity`}
                              className="w-8 h-8 rounded-[9px] hover:bg-white/12 inline-flex items-center justify-center transition-colors"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-6 text-center text-xs font-mono-nums font-semibold">
                              {quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, quantity + 1)}
                              aria-label={`Increase ${item.name} quantity`}
                              className="w-8 h-8 rounded-[9px] hover:bg-white/12 inline-flex items-center justify-center transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className="text-xs sm:text-sm font-mono-nums font-semibold text-white whitespace-nowrap">
                              Rs. {(item.pricePkr * quantity).toLocaleString('en-PK')}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              aria-label={`Remove ${item.name}`}
                              className="w-8 h-8 rounded-[10px] hover:bg-white/10 text-white/55 hover:text-white inline-flex items-center justify-center transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-4 sm:p-6 border-t border-white/10 bg-black/50 space-y-4">
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-white/65">
                    <span>Subtotal</span>
                    <span className="font-mono-nums text-white font-semibold">
                      Rs. {subtotalPkr.toLocaleString('en-PK')}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-white/50">
                    <span>Delivery Fee</span>
                    <span>Calculated at checkout</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setDrawerOpen(false);
                      navigate('/cart');
                    }}
                    className="py-3.5 px-4 rounded-[16px] border border-white/15 bg-white/[0.06] hover:bg-white/[0.12] text-xs font-semibold uppercase tracking-wider transition-colors"
                  >
                    View Bag
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDrawerOpen(false);
                      navigate('/checkout');
                    }}
                    className="py-3.5 px-4 rounded-[16px] bg-white text-[#050505] hover:bg-neutral-200 text-xs font-semibold uppercase tracking-wider inline-flex items-center justify-center gap-2 transition-colors"
                  >
                    <span>Checkout</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
};
