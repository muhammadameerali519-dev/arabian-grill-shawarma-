import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  MapPin,
  Phone,
  Store,
  Truck,
  User,
} from 'lucide-react';
import { SquircleIcon } from '../components/SquircleIcon';
import { WhatsAppIcon } from '../components/WhatsAppIcon';
import { useCart } from '../context/CartContext';
import { useMenu } from '../context/MenuContext';
import { OrderType } from '../types/restaurant';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { settings } = useMenu();
  const { items, subtotalPkr, calculateDeliveryFee, placeOrder } = useCart();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderType, setOrderType] = useState<OrderType>('Delivery');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [instructions, setInstructions] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const deliveryFee = calculateDeliveryFee(orderType);
  const grandTotal = subtotalPkr + deliveryFee;

  if (items.length === 0) {
    return (
      <div className="bg-[#050505] text-white min-h-screen pt-28 sm:pt-32 pb-20 px-4 sm:px-6 flex items-center justify-center">
        <div className="max-w-md text-center space-y-5">
          <h1 className="font-editorial text-fluid-h2 font-semibold">No Items in Bag</h1>
          <p className="text-sm text-white/65">
            Add dishes from our menu before proceeding to checkout.
          </p>
          <Link
            to="/menu"
            className="min-h-[46px] inline-flex items-center gap-2 px-6 py-3.5 rounded-[16px] bg-white text-[#050505] text-xs font-semibold uppercase tracking-wider"
          >
            Browse Menu
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (customerName.trim().length < 2) {
      setErrorMsg('Please enter your full name (at least 2 characters).');
      return;
    }
    const digits = customerPhone.replace(/\D/g, '');
    if (digits.length < 10) {
      setErrorMsg('Please enter a valid mobile number (e.g., 0331 1073628).');
      return;
    }
    if (orderType === 'Delivery' && deliveryAddress.trim().length < 6) {
      setErrorMsg('Please enter your full Gujranwala delivery address.');
      return;
    }

    setSubmitting(true);
    try {
      const order = await placeOrder({
        customerName,
        customerPhone,
        orderType,
        deliveryAddress,
        instructions,
      });
      navigate(`/receipt/${order.id}`, { state: { order, justPlaced: true } });
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? 'Could not record order right now. Please verify your details and try again.'
          : 'Could not place order.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#050505] text-white min-h-screen pt-24 sm:pt-32 pb-24 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <Link
          to="/cart"
          className="inline-flex items-center gap-2.5 text-xs font-semibold uppercase tracking-wider text-white/65 hover:text-white mb-5 sm:mb-6 transition-colors min-h-[44px]"
        >
          <SquircleIcon size="sm" tone="dark">
            <ArrowLeft className="w-4 h-4" />
          </SquircleIcon>
          <span>Back to Bag</span>
        </Link>

        <div className="pb-6 sm:pb-8 border-b border-white/10">
          <p className="text-xs tracking-[0.24em] uppercase text-white/55 mb-2">
            Direct Restaurant Order
          </p>
          <h1 className="font-editorial text-fluid-h1 font-semibold tracking-tight">
            Checkout & Receipt Generation
          </h1>
        </div>

        {!settings.isAcceptingOrders && (
          <div className="mt-6 rounded-[20px] p-4 bg-white/[0.06] border border-white/20 flex items-center gap-3 text-sm text-white/85">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>
              Online ordering is currently marked as paused by the restaurant. You can still generate a receipt or reach out via WhatsApp for availability.
            </span>
          </div>
        )}

        <div className="mt-8 sm:mt-10 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-7 rounded-[24px] sm:rounded-[28px] glass-dark p-4 min-[375px]:p-6 sm:p-8 space-y-5 sm:space-y-6"
          >
            <h2 className="font-editorial text-2xl font-semibold">Customer Details</h2>

            {errorMsg && (
              <div
                role="alert"
                className="p-4 rounded-[16px] bg-white/10 border border-white/30 text-sm text-white flex items-start gap-3"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Order Type Squircle Selector */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-white/60 mb-2.5">
                Order Type
              </label>
              <div className="grid grid-cols-1 min-[375px]:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setOrderType('Delivery')}
                  className={`p-3.5 sm:p-4 rounded-[18px] border text-left transition-all flex items-center gap-3 min-h-[64px] ${
                    orderType === 'Delivery'
                      ? 'bg-white text-[#050505] border-white'
                      : 'bg-white/[0.04] text-white/75 border-white/12 hover:bg-white/[0.08]'
                  }`}
                >
                  <SquircleIcon
                    size="sm"
                    tone={orderType === 'Delivery' ? 'solid-dark' : 'dark'}
                  >
                    <Truck className="w-4 h-4" />
                  </SquircleIcon>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold">Delivery</div>
                    <div className="text-[11px] opacity-70 truncate">Cash on Delivery</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setOrderType('Pickup')}
                  className={`p-3.5 sm:p-4 rounded-[18px] border text-left transition-all flex items-center gap-3 min-h-[64px] ${
                    orderType === 'Pickup'
                      ? 'bg-white text-[#050505] border-white'
                      : 'bg-white/[0.04] text-white/75 border-white/12 hover:bg-white/[0.08]'
                  }`}
                >
                  <SquircleIcon
                    size="sm"
                    tone={orderType === 'Pickup' ? 'solid-dark' : 'dark'}
                  >
                    <Store className="w-4 h-4" />
                  </SquircleIcon>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold">Pickup</div>
                    <div className="text-[11px] opacity-70 truncate">Mumtaz Market</div>
                  </div>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="checkout-name"
                  className="block text-xs uppercase tracking-wider text-white/60 mb-2"
                >
                  Customer Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-white/45 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="checkout-name"
                    type="text"
                    required
                    maxLength={80}
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Hamza Tariq"
                    className="w-full min-h-[48px] pl-11 pr-4 py-3 rounded-[16px] bg-white/[0.06] border border-white/14 text-base sm:text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-white/45"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="checkout-phone"
                  className="block text-xs uppercase tracking-wider text-white/60 mb-2"
                >
                  Mobile Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-white/45 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="checkout-phone"
                    type="tel"
                    required
                    maxLength={24}
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="03XX XXXXXXX"
                    className="w-full min-h-[48px] pl-11 pr-4 py-3 rounded-[16px] bg-white/[0.06] border border-white/14 text-base sm:text-sm font-mono-nums text-white placeholder:text-white/35 focus:outline-none focus:border-white/45"
                  />
                </div>
              </div>
            </div>

            {orderType === 'Delivery' && (
              <div>
                <label
                  htmlFor="checkout-address"
                  className="block text-xs uppercase tracking-wider text-white/60 mb-2"
                >
                  Delivery Address (Gujranwala) *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-white/45 absolute left-4 top-4 pointer-events-none" />
                  <textarea
                    id="checkout-address"
                    required
                    rows={3}
                    maxLength={250}
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="House / Street / Sector or Block in Gujranwala"
                    className="w-full pl-11 pr-4 py-3.5 rounded-[16px] bg-white/[0.06] border border-white/14 text-base sm:text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-white/45"
                  />
                </div>
              </div>
            )}

            <div>
              <label
                htmlFor="checkout-notes"
                className="block text-xs uppercase tracking-wider text-white/60 mb-2"
              >
                Additional Instructions (Optional)
              </label>
              <textarea
                id="checkout-notes"
                rows={2}
                maxLength={300}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="e.g. Extra garlic toum on the side, ring doorbell upon arrival..."
                className="w-full px-4 py-3.5 rounded-[16px] bg-white/[0.06] border border-white/14 text-base sm:text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-white/45"
              />
            </div>

            <div className="p-4 rounded-[18px] bg-white/[0.04] border border-white/10 text-xs text-white/70 leading-relaxed flex items-start gap-3">
              <WhatsAppIcon className="w-4 h-4 shrink-0 mt-0.5 text-white" />
              <span>
                Confirming generates your official digital receipt and prepares your pre-filled WhatsApp order to{' '}
                <strong className="text-white font-mono-nums">+92 331 1073628</strong>. Orders remain{' '}
                <strong className="text-white">Awaiting Restaurant Confirmation</strong> until confirmed directly by Arabian Grill House.
              </span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full min-h-[52px] py-3.5 px-5 rounded-[18px] bg-white text-[#050505] hover:bg-neutral-200 disabled:opacity-50 text-xs font-semibold tracking-[0.1em] sm:tracking-[0.14em] uppercase inline-flex items-center justify-center gap-2.5 transition-colors text-center"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>
                {submitting
                  ? 'Generating Receipt...'
                  : `Confirm Order · Rs. ${grandTotal.toLocaleString('en-PK')}`}
              </span>
            </button>
          </form>

          {/* Summary */}
          <aside className="lg:col-span-5 rounded-[24px] sm:rounded-[28px] glass-dark p-5 sm:p-8 space-y-5 sm:space-y-6">
            <h2 className="font-editorial text-2xl font-semibold">Order Summary</h2>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {items.map(({ item, quantity }) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 py-2.5 border-b border-white/10 text-sm"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-white truncate">{item.name}</p>
                    <p className="text-xs text-white/50 font-mono-nums">
                      {quantity} × Rs. {item.pricePkr.toLocaleString('en-PK')}
                    </p>
                  </div>
                  <span className="font-mono-nums font-semibold shrink-0 whitespace-nowrap">
                    Rs. {(item.pricePkr * quantity).toLocaleString('en-PK')}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-white/70">
                <span>Subtotal</span>
                <span className="font-mono-nums text-white">
                  Rs. {subtotalPkr.toLocaleString('en-PK')}
                </span>
              </div>
              <div className="flex justify-between text-white/70">
                <span>
                  {orderType === 'Pickup' ? 'Pickup Fee' : 'Delivery Charges'}
                </span>
                <span className="font-mono-nums text-white">
                  Rs. {deliveryFee.toLocaleString('en-PK')}
                </span>
              </div>
              <div className="flex justify-between text-white/70">
                <span>Payment Method</span>
                <span className="text-white">
                  {orderType === 'Pickup' ? 'Pay at Pickup' : 'Cash on Delivery'}
                </span>
              </div>
              <div className="pt-3 border-t border-white/12 flex justify-between items-baseline">
                <span className="text-base font-semibold">Grand Total</span>
                <span className="font-mono-nums text-2xl font-semibold text-white">
                  Rs. {grandTotal.toLocaleString('en-PK')}
                </span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
