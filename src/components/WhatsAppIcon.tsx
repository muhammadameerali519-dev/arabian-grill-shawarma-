import React from 'react';
import { BRAND_ASSETS } from '../data/assets';

interface WhatsAppIconProps {
  className?: string;
}

export const WhatsAppIcon: React.FC<WhatsAppIconProps> = ({
  className = 'w-4 h-4',
}) => {
  return (
    <img
      src={BRAND_ASSETS.whatsappLogo}
      alt=""
      aria-hidden="true"
      className={`object-contain select-none pointer-events-none ${className}`}
    />
  );
};
