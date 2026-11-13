import React from 'react';
import { WhatsAppIcon } from './WhatsAppIcon';
import { buildGeneralWhatsAppUrl } from '../utils/whatsapp';

export const FloatingWhatsApp: React.FC = () => {
  return (
    <a
      href={buildGeneralWhatsAppUrl()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Order or chat with Arabian Grill House on WhatsApp"
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-30 no-print group flex items-center gap-2.5 p-1.5 sm:p-2 sm:pr-4 rounded-[18px] sm:rounded-[20px] bg-[#080808]/92 text-white border border-white/25 backdrop-blur-xl shadow-[0_18px_40px_rgba(0,0,0,0.5)] hover:border-amber-400/60 hover:scale-[1.03] transition-all duration-200"
    >
      <span className="w-11 h-11 rounded-[12px] sm:rounded-[13px] overflow-hidden border border-white/20 inline-flex items-center justify-center shrink-0 bg-black">
        <WhatsAppIcon tile className="w-full h-full" />
      </span>
      <span className="hidden sm:inline text-xs font-semibold tracking-wider uppercase whitespace-nowrap">
        WhatsApp Order
      </span>
    </a>
  );
};
