import React, { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import {
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  Printer,
  Share2,
} from 'lucide-react';
import { ShawarmaLogo3D } from '../components/ShawarmaLogo3D';
import { SquircleIcon } from '../components/SquircleIcon';
import { WhatsAppIcon } from '../components/WhatsAppIcon';
import { useCart } from '../context/CartContext';
import { RESTAURANT_INFO } from '../data/seedData';
import { db } from '../firebase';
import { OrderStatus, RestaurantOrder } from '../types/restaurant';
import { downloadOrderReceiptPdf } from '../utils/pdfReceipt';
import { buildWhatsAppOrderUrl, formatWhatsAppOrderMessage } from '../utils/whatsapp';

export const ReceiptPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const location = useLocation();
  const { getLocalReceipt } = useCart();

  const stateOrder = (location.state as { order?: RestaurantOrder; justPlaced?: boolean } | null)
    ?.order;

  const order = stateOrder || (orderId ? getLocalReceipt(orderId) : null);
  const [liveStatus, setLiveStatus] = useState<OrderStatus>(
    order?.status || 'New Order'
  );
  const [whatsappOpened, setWhatsappOpened] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    const unsub = onSnapshot(
      doc(db, 'order_tracking', orderId),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as { status?: OrderStatus };
          if (data.status) setLiveStatus(data.status);
        }
      },
      () => {
        // Ignore non-critical tracking listener failures
      }
    );
    return () => unsub();
  }, [orderId]);

  if (!order) {
    return (
      <div className="bg-[#050505] text-white min-h-screen pt-28 sm:pt-32 pb-20 px-4 sm:px-6 flex items-center justify-center">
        <div className="max-w-md text-center space-y-5">
          <h1 className="font-editorial text-fluid-h2 font-semibold">Receipt Unavailable</h1>
          <p className="text-sm text-white/65">
            For customer privacy, full order receipts are only stored on the device that placed the order. Contact Arabian Grill House on WhatsApp at {RESTAURANT_INFO.phoneDisplay} to verify an order.
          </p>
          <Link
            to="/menu"
            className="min-h-[46px] inline-flex items-center gap-2 px-6 py-3.5 rounded-[16px] bg-white text-[#050505] text-xs font-semibold uppercase tracking-wider"
          >
            Return to Menu
          </Link>
        </div>
      </div>
    );
  }

  const effectiveOrder: RestaurantOrder = { ...order, status: liveStatus };
  const whatsappUrl = buildWhatsAppOrderUrl(effectiveOrder);
  const displayStatus =
    liveStatus === 'New Order'
      ? 'Awaiting Restaurant Confirmation'
      : liveStatus;

  const handleOpenWhatsApp = () => {
    setWhatsappOpened(true);
  };

  const handleShareReceipt = async () => {
    const text = formatWhatsAppOrderMessage(effectiveOrder);
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Arabian Grill House Receipt ${effectiveOrder.orderNumber}`,
          text,
        });
        return;
      } catch {
        // Fallback to WhatsApp link
      }
    }
    window.location.href = whatsappUrl;
  };

  return (
    <div className="bg-[#050505] text-white min-h-screen pt-24 sm:pt-32 pb-24 px-3.5 sm:px-6 print:bg-white print:text-black print:pt-4">
      <div className="max-w-3xl mx-auto">
        {/* WhatsApp Dispatch Banner */}
        <div className="rounded-[22px] sm:rounded-[26px] glass-dark p-5 sm:p-7 mb-6 sm:mb-7 no-print">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-start gap-3.5 sm:gap-4">
              <SquircleIcon size="md" tone="solid-light">
                {liveStatus === 'New Order' ? (
                  <Clock className="w-5 h-5" />
                ) : (
                  <CheckCircle2 className="w-5 h-5" />
                )}
              </SquircleIcon>
              <div className="min-w-0">
                <p className="text-[11px] sm:text-xs uppercase tracking-widest text-white/55">
                  Order Status: {displayStatus}
                </p>
                <h1 className="font-editorial text-xl sm:text-2xl font-semibold mt-1">
                  Send Order {effectiveOrder.orderNumber} via WhatsApp
                </h1>
                <p className="text-xs text-white/65 mt-1.5 leading-relaxed max-w-lg">
                  {whatsappOpened
                    ? 'WhatsApp was opened with your formatted order details. Your order remains Awaiting Restaurant Confirmation until Arabian Grill House replies and accepts it.'
                    : 'Tap below to send your pre-filled order directly to Arabian Grill House (+92 331 1073628).'}
                </p>
              </div>
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleOpenWhatsApp}
              className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-[16px] bg-white text-[#050505] text-xs font-semibold uppercase tracking-wider hover:bg-neutral-200 transition-colors whitespace-nowrap shrink-0"
            >
              <WhatsAppIcon className="w-4 h-4" />
              <span>Send on WhatsApp</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Official Digital Receipt Card */}
        <article className="rounded-[24px] sm:rounded-[30px] bg-white text-[#050505] p-5 min-[375px]:p-6 sm:p-10 shadow-2xl border border-black/10">
          {/* Receipt Header with 3D Shawarma Brand Emblem */}
          <div className="pb-5 sm:pb-6 border-b border-black/12 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ShawarmaLogo3D
                size="xs"
                tone="light"
                animateEntrance={false}
                className="shrink-0"
              />
              <div>
                <h2 className="font-semibold tracking-[0.12em] sm:tracking-[0.14em] uppercase text-sm">
                  ARABIAN GRILL HOUSE
                </h2>
                <p className="text-xs text-neutral-500">Order Receipt · Gujranwala</p>
              </div>
            </div>

            <div className="sm:text-right">
              <div className="font-mono-nums text-lg font-bold">
                {effectiveOrder.orderNumber}
              </div>
              <div className="text-xs text-neutral-500 font-mono-nums">
                {new Date(effectiveOrder.createdAtMs).toLocaleString('en-PK', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </div>
            </div>
          </div>

          {/* Status Strip */}
          <div className="py-3.5 sm:py-4 border-b border-black/10 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-neutral-500 uppercase tracking-wider">Order Status</span>
            <span className="font-semibold text-neutral-950">{displayStatus}</span>
          </div>

          {/* Customer Details */}
          <div className="py-5 sm:py-6 border-b border-black/10 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs uppercase tracking-wider text-neutral-500">Customer</p>
              <p className="font-semibold mt-0.5">{effectiveOrder.customerName}</p>
              <p className="font-mono-nums text-neutral-600 mt-0.5">
                {effectiveOrder.customerPhone}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-neutral-500">
                {effectiveOrder.orderType} · {effectiveOrder.paymentMethod}
              </p>
              <p className="text-neutral-800 mt-0.5 leading-snug break-words">
                {effectiveOrder.orderType === 'Pickup'
                  ? 'Self-Pickup at Shop #135 Mumtaz Market, G.T Road Gujranwala, Pakistan.'
                  : effectiveOrder.deliveryAddress}
              </p>
              {effectiveOrder.instructions && (
                <p className="text-xs text-neutral-500 mt-1.5 break-words">
                  Note: {effectiveOrder.instructions}
                </p>
              )}
            </div>
          </div>

          {/* Line Items (Mobile-safe from 320px upwards) */}
          <div className="py-5 sm:py-6 border-b border-black/10">
            <div className="hidden min-[400px]:grid grid-cols-12 text-[11px] uppercase tracking-wider text-neutral-500 pb-3">
              <span className="col-span-5">Item</span>
              <span className="col-span-2 text-right">Qty</span>
              <span className="col-span-2 text-right">Price</span>
              <span className="col-span-3 text-right">Total</span>
            </div>
            <div className="space-y-3">
              {effectiveOrder.items.map((line) => (
                <div
                  key={line.itemId}
                  className="flex flex-col min-[400px]:grid min-[400px]:grid-cols-12 min-[400px]:items-center text-xs sm:text-sm gap-1 min-[400px]:gap-2 pb-2.5 min-[400px]:pb-0 border-b border-black/5 min-[400px]:border-b-0 last:border-b-0"
                >
                  <span className="min-[400px]:col-span-5 font-medium text-neutral-950">
                    {line.name}
                  </span>
                  <div className="flex items-center justify-between min-[400px]:contents text-xs sm:text-sm">
                    <span className="min-[400px]:col-span-2 min-[400px]:text-right font-mono-nums text-neutral-600">
                      <span className="min-[400px]:hidden">Qty </span>
                      {line.quantity}
                      <span className="min-[400px]:hidden"> × Rs. {line.pricePkr.toLocaleString('en-PK')}</span>
                    </span>
                    <span className="hidden min-[400px]:block min-[400px]:col-span-2 text-right font-mono-nums text-neutral-600">
                      {line.pricePkr.toLocaleString('en-PK')}
                    </span>
                    <span className="min-[400px]:col-span-3 text-right font-mono-nums font-semibold">
                      Rs. {line.lineTotal.toLocaleString('en-PK')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="pt-5 sm:pt-6 space-y-2 text-sm">
            <div className="flex justify-between text-neutral-600">
              <span>Subtotal</span>
              <span className="font-mono-nums text-neutral-950">
                Rs. {effectiveOrder.subtotalPkr.toLocaleString('en-PK')}
              </span>
            </div>
            <div className="flex justify-between text-neutral-600">
              <span>Delivery Charges</span>
              <span className="font-mono-nums text-neutral-950">
                Rs. {effectiveOrder.deliveryChargePkr.toLocaleString('en-PK')}
              </span>
            </div>
            <div className="pt-3 border-t border-black/12 flex justify-between items-baseline">
              <span className="text-base font-bold">Grand Total</span>
              <span className="font-mono-nums text-xl sm:text-2xl font-bold">
                Rs. {effectiveOrder.totalPkr.toLocaleString('en-PK')}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-7 sm:mt-8 pt-6 border-t border-black/10 grid grid-cols-1 sm:grid-cols-3 gap-3 no-print">
            <button
              type="button"
              onClick={() => downloadOrderReceiptPdf(effectiveOrder)}
              className="min-h-[46px] py-3 px-4 rounded-[15px] bg-[#050505] text-white hover:bg-neutral-800 text-xs font-semibold uppercase tracking-wider inline-flex items-center justify-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="min-h-[46px] py-3 px-4 rounded-[15px] border border-black/15 bg-black/[0.04] hover:bg-black/[0.08] text-neutral-950 text-xs font-semibold uppercase tracking-wider inline-flex items-center justify-center gap-2 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print Receipt</span>
            </button>

            <button
              type="button"
              onClick={handleShareReceipt}
              className="min-h-[46px] py-3 px-4 rounded-[15px] border border-black/15 bg-black/[0.04] hover:bg-black/[0.08] text-neutral-950 text-xs font-semibold uppercase tracking-wider inline-flex items-center justify-center gap-2 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Receipt</span>
            </button>
          </div>
        </article>
      </div>
    </div>
  );
};
