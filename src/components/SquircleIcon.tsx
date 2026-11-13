import React from 'react';

interface SquircleIconProps {
  children: React.ReactNode;
  tone?: 'dark' | 'light' | 'solid-dark' | 'solid-light';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const SquircleIcon: React.FC<SquircleIconProps> = ({
  children,
  tone = 'dark',
  size = 'md',
  className = '',
}) => {
  const sizeClass =
    size === 'sm'
      ? 'w-9 h-9 rounded-[12px]'
      : size === 'lg'
        ? 'w-14 h-14 rounded-[18px]'
        : 'w-11 h-11 rounded-[14px]';

  const toneClass =
    tone === 'light'
      ? 'bg-black/[0.04] border border-black/10 text-neutral-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]'
      : tone === 'solid-light'
        ? 'bg-white text-neutral-950 border border-white/80 shadow-md'
        : tone === 'solid-dark'
          ? 'bg-neutral-950 text-white border border-neutral-800 shadow-md'
          : 'bg-white/[0.06] border border-white/15 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.16)] backdrop-blur-md';

  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 transition-transform duration-200 ${sizeClass} ${toneClass} ${className}`}
    >
      {children}
    </span>
  );
};
