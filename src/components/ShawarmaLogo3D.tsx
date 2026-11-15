import React from 'react';
import { motion } from 'motion/react';
import { BRAND_ASSETS } from '../data/assets';

export type ShawarmaSize = 'xs' | 'sm' | 'md' | 'lg' | 'hero';

interface ShawarmaLogo3DProps {
  size?: ShawarmaSize;
  tone?: 'dark' | 'light';
  showWordmark?: boolean;
  wordmarkSize?: 'sm' | 'md' | 'lg';
  className?: string;
  animateEntrance?: boolean;
  priority?: boolean;
}

const SIZE_CLASSES: Record<ShawarmaSize, string> = {
  xs: 'h-9 w-6 min-[375px]:h-10 min-[375px]:w-7',
  sm: 'h-16 w-10 sm:h-20 sm:w-12',
  md: 'h-32 w-20 sm:h-40 sm:w-24',
  lg: 'h-[clamp(140px,24svh,210px)] w-[clamp(75px,13svh,112px)]',
  hero: 'h-[clamp(220px,36svh,380px)] lg:h-[clamp(320px,46vh,460px)] w-auto max-w-full',
};

export const ShawarmaLogo3D: React.FC<ShawarmaLogo3DProps> = ({
  size = 'md',
  tone = 'dark',
  showWordmark = false,
  wordmarkSize = 'md',
  className = '',
  animateEntrance = true,
  priority = false,
}) => {
  const isCompact = size === 'xs' || size === 'sm';
  const isDark = tone === 'dark';

  const wordmarkClasses =
    wordmarkSize === 'lg'
      ? 'text-sm sm:text-base tracking-[0.34em]'
      : wordmarkSize === 'sm'
        ? 'text-[11px] sm:text-xs tracking-[0.22em]'
        : 'text-xs sm:text-sm tracking-[0.28em]';

  return (
    <motion.div
      initial={animateEntrance ? { opacity: 0, scale: 0.9, y: 12 } : false}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
      className={`inline-flex flex-col items-center justify-center select-none ${className}`}
      style={{ perspective: '900px' }}
    >
      <div className="relative flex flex-col items-center justify-center">
        {/* Subtle studio radial highlight behind the 3D shawarma (no rectangular frame) */}
        {!isCompact && (
          <div
            aria-hidden="true"
            className={`absolute inset-0 -m-6 rounded-full blur-2xl pointer-events-none ${
              isDark
                ? 'bg-[radial-gradient(circle,rgba(255,255,255,0.14)_0%,rgba(255,255,255,0)_70%)]'
                : 'bg-[radial-gradient(circle,rgba(0,0,0,0.08)_0%,rgba(0,0,0,0)_70%)]'
            }`}
          />
        )}

        {/* Rotating & floating 3D transparent PNG shawarma */}
        <div className={isCompact ? 'animate-shawarma-compact' : 'animate-shawarma-3d'}>
          <img
            src={BRAND_ASSETS.shawarma3dLogo}
            alt="Arabian Grill House 3D Shawarma Emblem"
            referrerPolicy="no-referrer"
            loading="eager"
            decoding="async"
            className={`${SIZE_CLASSES[size]} object-contain pointer-events-none ${
              isCompact
                ? 'drop-shadow-[0_6px_12px_rgba(0,0,0,0.45)]'
                : isDark
                  ? 'drop-shadow-[0_22px_32px_rgba(0,0,0,0.85)]'
                  : 'drop-shadow-[0_18px_28px_rgba(0,0,0,0.22)]'
            }`}
          />
        </div>

        {/* Soft dynamic ground shadow */}
        {!isCompact && (
          <div
            aria-hidden="true"
            className={`mt-2 h-2.5 w-20 sm:w-28 rounded-full blur-md animate-shawarma-shadow pointer-events-none ${
              isDark ? 'bg-black/90' : 'bg-black/25'
            }`}
          />
        )}
      </div>

      {showWordmark && (
        <span
          className={`mt-3 font-semibold uppercase text-center whitespace-nowrap ${wordmarkClasses} ${
            isDark ? 'text-white' : 'text-[#050505]'
          }`}
        >
          ARABIAN GRILL HOUSE
        </span>
      )}
    </motion.div>
  );
};

interface ShawarmaLoaderProps {
  label?: string;
  tone?: 'dark' | 'light';
  className?: string;
}

export const ShawarmaLoader: React.FC<ShawarmaLoaderProps> = ({
  label = 'Preparing the grill...',
  tone = 'dark',
  className = '',
}) => {
  const isDark = tone === 'dark';

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}
    >
      <ShawarmaLogo3D
        size="md"
        tone={tone}
        showWordmark
        wordmarkSize="md"
        priority
      />
      <p
        className={`mt-3 text-xs tracking-[0.2em] uppercase ${
          isDark ? 'text-white/60' : 'text-neutral-500'
        }`}
      >
        {label}
      </p>
    </div>
  );
};
