import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  MapPin,
  Navigation,
  Phone,
} from 'lucide-react';
import { GOOGLE_MAPS_DIRECTIONS_URL, RestaurantMap } from '../components/RestaurantMap';
import { SquircleIcon } from '../components/SquircleIcon';
import { WhatsAppIcon } from '../components/WhatsAppIcon';
import { useMenu } from '../context/MenuContext';
import { RESTAURANT_INFO } from '../data/seedData';
import { buildGeneralWhatsAppUrl } from '../utils/whatsapp';

export const ContactPage: React.FC = () => {
  const { settings } = useMenu();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    const text = `Assalam-o-Alaikum Arabian Grill House,\nName: ${name.trim()}\nPhone: ${phone.trim() || 'N/A'}\nInquiry: ${message.trim()}`;
    setSent(true);
    window.open(buildGeneralWhatsAppUrl(text), '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-white text-[#050505] min-h-screen pt-24 sm:pt-32 pb-24 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="pb-8 sm:pb-10 border-b border-black/10 max-w-3xl">
          <p className="text-xs tracking-[0.24em] uppercase text-neutral-500 mb-3">
            Location & Contact
          </p>
          <h1 className="font-editorial text-fluid-h1 font-semibold tracking-tight">
            Visit Arabian Grill House
          </h1>
          <p className="mt-3 text-sm sm:text-base text-neutral-600 leading-relaxed">
            Shop #135 Mumtaz Market, G.T Road Gujranwala, Pakistan. Reach us directly by phone or WhatsApp (+92 331 1073628) for table questions, pickup, or delivery.
          </p>
        </div>

        <div className="mt-8 sm:mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 items-start">
          {/* Info & Map */}
          <div className="lg:col-span-7 space-y-5 sm:space-y-6">
            <RestaurantMap tone="light" />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <a
                href={GOOGLE_MAPS_DIRECTIONS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[48px] p-3.5 sm:p-4 rounded-[16px] sm:rounded-[18px] bg-[#050505] text-white text-xs font-semibold uppercase tracking-wider inline-flex items-center justify-center gap-2 hover:bg-neutral-800 transition-colors"
              >
                <Navigation className="w-4 h-4" />
                <span>Get Directions</span>
              </a>

              <a
                href={`tel:${RESTAURANT_INFO.phoneTel}`}
                className="min-h-[48px] p-3.5 sm:p-4 rounded-[16px] sm:rounded-[18px] glass-light text-neutral-950 text-xs font-semibold uppercase tracking-wider inline-flex items-center justify-center gap-2 hover:bg-black/5 transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>Call {RESTAURANT_INFO.phoneDisplay}</span>
              </a>

              <a
                href={buildGeneralWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[48px] p-3.5 sm:p-4 rounded-[16px] sm:rounded-[18px] glass-light text-neutral-950 text-xs font-semibold uppercase tracking-wider inline-flex items-center justify-center gap-2 hover:bg-black/5 transition-colors"
              >
                <WhatsAppIcon className="w-4 h-4" />
                <span>WhatsApp Order</span>
              </a>
            </div>
          </div>

          {/* Details + Message Form */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-[24px] sm:rounded-[26px] glass-light p-5 sm:p-6 space-y-5">
              <div className="flex items-start gap-3.5 sm:gap-4">
                <SquircleIcon size="md" tone="light">
                  <MapPin className="w-5 h-5" />
                </SquircleIcon>
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wider text-neutral-500">
                    Restaurant Address
                  </p>
                  <p className="text-sm font-medium text-neutral-950 mt-1 leading-relaxed">
                    {RESTAURANT_INFO.address}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 sm:gap-4">
                <SquircleIcon size="md" tone="light">
                  <Phone className="w-5 h-5" />
                </SquircleIcon>
                <div>
                  <p className="text-xs uppercase tracking-wider text-neutral-500">
                    Phone / WhatsApp
                  </p>
                  <a
                    href={`tel:${RESTAURANT_INFO.phoneTel}`}
                    className="font-mono-nums text-sm font-semibold text-neutral-950 mt-1 block hover:underline"
                  >
                    {RESTAURANT_INFO.phoneDisplay}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3.5 sm:gap-4">
                <SquircleIcon size="md" tone="light">
                  <Clock className="w-5 h-5" />
                </SquircleIcon>
                <div>
                  <p className="text-xs uppercase tracking-wider text-neutral-500">
                    Opening Information
                  </p>
                  <p className="text-sm font-medium text-neutral-950 mt-1">
                    Opens at {settings.openTime} and closes at {settings.closeTime}
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">
                    Opening hours may change.
                  </p>
                </div>
              </div>
            </div>

            <form
              onSubmit={handleInquiry}
              className="rounded-[24px] sm:rounded-[26px] glass-light p-5 sm:p-6 space-y-4"
            >
              <h2 className="font-editorial text-2xl font-semibold">
                Send a Message via WhatsApp
              </h2>
              {sent && (
                <div className="p-3.5 rounded-[14px] bg-black/[0.05] border border-black/10 text-xs text-neutral-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>WhatsApp window opened with your message.</span>
                </div>
              )}
              <div>
                <label
                  htmlFor="contact-name"
                  className="block text-xs uppercase tracking-wider text-neutral-500 mb-1.5"
                >
                  Your Name *
                </label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  className="w-full min-h-[46px] px-4 py-3 rounded-[14px] bg-white border border-black/12 text-base sm:text-sm focus:outline-none focus:border-black"
                />
              </div>
              <div>
                <label
                  htmlFor="contact-phone"
                  className="block text-xs uppercase tracking-wider text-neutral-500 mb-1.5"
                >
                  Mobile Number
                </label>
                <input
                  id="contact-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="03XX XXXXXXX"
                  className="w-full min-h-[46px] px-4 py-3 rounded-[14px] bg-white border border-black/12 text-base sm:text-sm font-mono-nums focus:outline-none focus:border-black"
                />
              </div>
              <div>
                <label
                  htmlFor="contact-msg"
                  className="block text-xs uppercase tracking-wider text-neutral-500 mb-1.5"
                >
                  Message *
                </label>
                <textarea
                  id="contact-msg"
                  required
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Table booking inquiry, bulk shawarma pack request, or feedback..."
                  className="w-full px-4 py-3 rounded-[14px] bg-white border border-black/12 text-base sm:text-sm focus:outline-none focus:border-black"
                />
              </div>
              <button
                type="submit"
                className="w-full min-h-[48px] py-3.5 px-5 rounded-[15px] bg-[#050505] text-white text-xs font-semibold uppercase tracking-wider inline-flex items-center justify-center gap-2 hover:bg-neutral-800 transition-colors"
              >
                <WhatsAppIcon className="w-4 h-4" />
                <span>Send via WhatsApp</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
