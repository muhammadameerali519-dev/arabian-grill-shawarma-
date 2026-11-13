import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUpRight, Search, X } from 'lucide-react';
import { useMenu } from '../context/MenuContext';
import { SmartImage } from './SmartImage';
import { SquircleIcon } from './SquircleIcon';

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const { menuItems } = useMenu();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 60);
    } else {
      setQuery('');
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return menuItems.slice(0, 6);
    return menuItems.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.categoryName.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
    );
  }, [menuItems, query]);

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-28 px-3 sm:px-4 no-print"
          role="dialog"
          aria-modal="true"
          aria-label="Search Arabian Grill House Menu"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/75 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-2xl rounded-[24px] sm:rounded-[28px] glass-dark bg-[#0b0b0b]/95 text-white overflow-hidden"
          >
            <div className="p-3.5 sm:p-5 border-b border-white/10 flex items-center gap-2.5 sm:gap-3">
              <SquircleIcon size="sm" tone="dark">
                <Search className="w-4 h-4" />
              </SquircleIcon>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search shawarma, platters..."
                className="flex-1 min-w-0 bg-transparent text-white placeholder:text-white/40 text-base focus:outline-none"
              />
              <button
                type="button"
                onClick={onClose}
                aria-label="Close search"
                className="w-10 h-10 rounded-[13px] border border-white/12 bg-white/5 hover:bg-white/12 inline-flex items-center justify-center transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-[65svh] overflow-y-auto p-2.5 sm:p-4 space-y-1.5 sm:space-y-2">
              {results.length === 0 ? (
                <p className="text-center py-10 text-sm text-white/55">
                  No menu dishes matched “{query}”.
                </p>
              ) : (
                results.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onClose();
                      navigate(`/menu/${item.id}`);
                    }}
                    className="w-full p-2.5 sm:p-3 rounded-[16px] sm:rounded-[18px] hover:bg-white/[0.07] transition-colors flex items-center gap-3 text-left group"
                  >
                    <SmartImage
                      src={item.imageUrl}
                      alt={item.name}
                      fallbackTitle={item.name}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-[12px] sm:rounded-[13px] object-cover shrink-0 border border-white/10"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-white/50 truncate">
                        <span className="truncate">{item.categoryName}</span>
                        <span aria-hidden="true">·</span>
                        <span className="shrink-0">{item.available ? 'Available' : 'Unavailable'}</span>
                      </div>
                      <p className="text-sm font-semibold text-white truncate mt-0.5">
                        {item.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                      <span className="font-mono-nums text-xs sm:text-sm font-semibold text-white">
                        Rs. {item.pricePkr.toLocaleString('en-PK')}
                      </span>
                      <span className="hidden min-[380px]:inline-flex w-8 h-8 rounded-[11px] border border-white/12 bg-white/5 items-center justify-center group-hover:bg-white group-hover:text-[#050505] transition-colors">
                        <ArrowUpRight className="w-4 h-4" />
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
