import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Expand, X } from 'lucide-react';
import { SmartImage } from '../components/SmartImage';
import { GALLERY_PHOTOS } from '../data/seedData';
import { GalleryPhoto } from '../types/restaurant';

const GALLERY_FILTERS = [
  'All',
  'Special Shawarma',
  'Platter',
  'Burgers',
  'Snack Pack',
  'Sides & Dips',
  'Atmosphere',
] as const;

export const GalleryPage: React.FC = () => {
  const [filter, setFilter] = useState<(typeof GALLERY_FILTERS)[number]>('All');
  const [activePhoto, setActivePhoto] = useState<GalleryPhoto | null>(null);

  const visiblePhotos = useMemo(() => {
    if (filter === 'All') return GALLERY_PHOTOS;
    return GALLERY_PHOTOS.filter((p) => p.category === filter);
  }, [filter]);

  return (
    <div className="bg-white text-[#050505] min-h-screen pt-24 sm:pt-32 pb-24 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="pb-8 sm:pb-10 border-b border-black/10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-xs tracking-[0.24em] uppercase text-neutral-500 mb-3">
              Photography Showcase
            </p>
            <h1 className="font-editorial text-fluid-h1 font-semibold tracking-tight">
              The Culinary Gallery
            </h1>
            <p className="mt-3 text-sm sm:text-base text-neutral-600 max-w-xl">
              An intimate look at our slow-roasted shawarma, open-fire skewers, handmade dips, and evening dining room.
            </p>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar max-w-full">
            {GALLERY_FILTERS.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFilter(cat)}
                className={`min-h-[42px] px-4 py-2 rounded-[14px] text-xs font-semibold tracking-wider uppercase transition-colors whitespace-nowrap shrink-0 border ${
                  filter === cat
                    ? 'bg-[#050505] text-white border-[#050505]'
                    : 'bg-black/[0.04] text-neutral-700 border-black/10 hover:bg-black/[0.08]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 sm:mt-10 grid grid-cols-1 min-[375px]:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
          {visiblePhotos.map((photo) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => setActivePhoto(photo)}
              className="group text-left rounded-[20px] sm:rounded-[26px] overflow-hidden glass-light flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <SmartImage
                  src={photo.imageUrl}
                  alt={photo.title}
                  fallbackTitle={photo.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute top-3 right-3 w-9 h-9 sm:w-10 sm:h-10 rounded-[12px] sm:rounded-[13px] bg-black/70 text-white backdrop-blur-md inline-flex items-center justify-center sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <Expand className="w-4 h-4" />
                </span>
              </div>
              <div className="p-3.5 sm:p-5">
                <p className="text-[10px] sm:text-[11px] uppercase tracking-wider text-neutral-500">
                  {photo.category}
                </p>
                <h2 className="mt-1 text-sm sm:text-lg font-semibold text-neutral-950 line-clamp-1">
                  {photo.title}
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-neutral-600 leading-relaxed line-clamp-2">
                  {photo.caption}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {activePhoto && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-8"
            role="dialog"
            aria-modal="true"
            aria-label={activePhoto.title}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActivePhoto(null)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="relative z-10 max-w-4xl w-full rounded-[24px] sm:rounded-[28px] overflow-hidden bg-[#0a0a0a] text-white border border-white/15 shadow-2xl"
            >
              <button
                type="button"
                onClick={() => setActivePhoto(null)}
                aria-label="Close lightbox"
                className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 w-10 h-10 sm:w-11 sm:h-11 rounded-[13px] sm:rounded-[14px] bg-black/75 border border-white/20 text-white inline-flex items-center justify-center hover:bg-black transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="aspect-[4/3] sm:aspect-[16/10] w-full bg-black">
                <SmartImage
                  src={activePhoto.imageUrl}
                  alt={activePhoto.title}
                  fallbackTitle={activePhoto.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-5 sm:p-7">
                <p className="text-xs uppercase tracking-widest text-white/50">
                  {activePhoto.category}
                </p>
                <h3 className="font-editorial text-xl sm:text-2xl font-semibold mt-1">
                  {activePhoto.title}
                </h3>
                <p className="text-sm text-white/70 mt-2">{activePhoto.caption}</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
