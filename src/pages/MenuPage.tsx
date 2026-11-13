import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  LayoutGrid,
  List,
  MapPin,
  Plus,
  Search,
  ShoppingBag,
  SlidersHorizontal,
} from 'lucide-react';
import { MenuCard } from '../components/MenuCard';
import { ShawarmaLoader, ShawarmaLogo3D } from '../components/ShawarmaLogo3D';
import { WhatsAppIcon } from '../components/WhatsAppIcon';
import { useCart } from '../context/CartContext';
import { useMenu } from '../context/MenuContext';
import { RESTAURANT_INFO } from '../data/seedData';
import { MenuItem, SpiceLevel } from '../types/restaurant';
import { buildGeneralWhatsAppUrl } from '../utils/whatsapp';

const PAGE_1_CATEGORY_IDS = new Set(['cat-burgers', 'cat-snack-pack', 'cat-fries']);
const PAGE_2_CATEGORY_IDS = new Set([
  'cat-special-shawarma-platter',
  'cat-sauces',
  'cat-beverages',
  'cat-add-ons',
]);

export const MenuPage: React.FC = () => {
  const { categories, menuItems, loading, settings } = useMenu();
  const { totalItems, subtotalPkr, setDrawerOpen, addToCart } = useCart();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [spiceFilter, setSpiceFilter] = useState<'all' | SpiceLevel>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'board'>('grid');

  const activeCategories = useMemo(
    () => categories.filter((c) => c.active),
    [categories]
  );

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return menuItems.filter((item) => {
      if (selectedCategoryId !== 'all' && item.categoryId !== selectedCategoryId) {
        return false;
      }
      if (spiceFilter !== 'all' && item.spiceLevel !== spiceFilter) {
        return false;
      }
      if (onlyAvailable && !item.available) {
        return false;
      }
      if (q) {
        return (
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.categoryName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [menuItems, selectedCategoryId, spiceFilter, onlyAvailable, searchQuery]);

  const sectionsToRender = useMemo(() => {
    const grouped = new Map<string, MenuItem[]>();
    for (const item of filteredItems) {
      const list = grouped.get(item.categoryId) || [];
      list.push(item);
      grouped.set(item.categoryId, list);
    }

    const ordered = activeCategories
      .filter((c) => grouped.has(c.id))
      .map((cat) => ({
        category: cat,
        items: grouped.get(cat.id) || [],
        pageGroup: PAGE_1_CATEGORY_IDS.has(cat.id)
          ? 'page1'
          : PAGE_2_CATEGORY_IDS.has(cat.id)
            ? 'page2'
            : 'other',
      }));

    // Handle any custom categories added in Admin Dashboard
    for (const [catId, list] of grouped.entries()) {
      if (!ordered.some((o) => o.category.id === catId)) {
        ordered.push({
          category: {
            id: catId,
            name: list[0]?.categoryName || 'Specialty',
            slug: catId,
            sortOrder: 99,
            active: true,
          },
          items: list,
          pageGroup: 'other',
        });
      }
    }

    return ordered;
  }, [activeCategories, filteredItems]);

  const page1Sections = sectionsToRender.filter((s) => s.pageGroup === 'page1');
  const page2Sections = sectionsToRender.filter((s) => s.pageGroup !== 'page1');

  const renderSectionBlock = (
    section: { category: { id: string; name: string; description?: string }; items: MenuItem[] }
  ) => (
    <div key={section.category.id} className="space-y-4 sm:space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-3 border-b border-amber-400/20">
        <div>
          <h3 className="font-editorial text-2xl sm:text-3xl font-semibold tracking-tight text-white">
            {section.category.name}
          </h3>
          {section.category.description && (
            <p className="text-xs sm:text-sm text-white/55 mt-1">
              {section.category.description}
            </p>
          )}
        </div>
        <span className="font-mono-nums text-xs uppercase tracking-widest text-amber-400 font-semibold shrink-0">
          {section.items.length} {section.items.length === 1 ? 'Item' : 'Items'}
        </span>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 min-[375px]:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
          {section.items.map((item) => (
            <MenuCard key={item.id} item={item} tone="dark" />
          ))}
        </div>
      ) : (
        <div className="rounded-[22px] glass-dark border border-white/12 divide-y divide-white/10 overflow-hidden">
          {section.items.map((item) => (
            <div
              key={item.id}
              className="p-4 sm:px-6 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.03] transition-colors"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-4">
                  <h4 className="text-base sm:text-lg font-semibold text-white">
                    {item.name}
                  </h4>
                  <span className="sm:hidden font-mono-nums text-base font-bold text-amber-400 whitespace-nowrap shrink-0">
                    Rs. {item.pricePkr.toLocaleString('en-PK')}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-white/60 mt-1 max-w-2xl">
                  {item.description}
                </p>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                <span className="hidden sm:inline font-mono-nums text-lg font-bold text-amber-400 whitespace-nowrap">
                  Rs. {item.pricePkr.toLocaleString('en-PK')}
                </span>
                <button
                  type="button"
                  disabled={!item.available}
                  onClick={() => addToCart(item, 1)}
                  className="w-full sm:w-auto min-h-[40px] px-4 py-2 rounded-[12px] bg-gradient-to-r from-amber-400 to-orange-500 text-[#050505] hover:from-amber-300 hover:to-orange-400 disabled:opacity-40 text-xs font-semibold uppercase tracking-wider inline-flex items-center justify-center gap-1.5 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{item.available ? 'Add to Cart' : 'Unavailable'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-[#050505] text-white min-h-screen pt-24 sm:pt-32 pb-24 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Luxury Black, White & Golden/Orange Menu Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-[24px] sm:rounded-[30px] glass-dark border border-amber-400/20 p-5 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="shrink-0 self-start sm:self-center">
              <ShawarmaLogo3D
                size="sm"
                tone="dark"
                showWordmark
                wordmarkSize="sm"
                animateEntrance={false}
              />
            </div>

            <div>
              <p className="text-xs tracking-[0.24em] uppercase text-amber-400 font-semibold mb-2">
                Official Restaurant Menu · PKR
              </p>
              <h1 className="font-editorial text-fluid-h1 font-semibold tracking-tight text-white">
                Arabian Grill House Menu
              </h1>
              <p className="mt-2.5 text-xs sm:text-sm text-white/70 max-w-2xl leading-relaxed">
                Burgers, Loaded Snack Packs, Crispy Fries, Special Shawarma &amp; Platter, House Sauces, Beverages, and Add-Ons — prepared fresh in Gujranwala.
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-white/80">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{RESTAURANT_INFO.address}</span>
                </span>
                <a
                  href={buildGeneralWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-mono-nums font-semibold text-amber-400 hover:text-amber-300 transition-colors"
                >
                  <WhatsAppIcon className="w-3.5 h-3.5 shrink-0" />
                  <span>WhatsApp: {RESTAURANT_INFO.phoneDisplay}</span>
                </a>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-3 shrink-0">
            <div className="px-4 py-3 rounded-[16px] bg-white/[0.04] border border-white/12 text-xs text-white/80 text-center sm:text-left">
              <span>Hours: {settings.openTime} – {settings.closeTime}</span>
              <span className="mx-2 text-amber-400/50">·</span>
              <span className="text-amber-400 font-semibold">
                {settings.isAcceptingOrders ? 'Accepting Orders' : 'Paused'}
              </span>
            </div>

            {totalItems > 0 && (
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="min-h-[44px] inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-[16px] bg-gradient-to-r from-amber-400 to-orange-500 text-[#050505] text-xs font-bold uppercase tracking-wider hover:from-amber-300 hover:to-orange-400 transition-all"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>
                  Bag ({totalItems}) · Rs. {subtotalPkr.toLocaleString('en-PK')}
                </span>
              </button>
            )}
          </div>
        </motion.div>

        {/* Controls Bar */}
        <div className="mt-7 sm:mt-8 space-y-4 sm:space-y-5">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3.5 sm:gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-amber-400/75 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search burgers, snack pack, shawarma, sauces..."
                aria-label="Search full menu"
                className="w-full min-h-[46px] pl-11 pr-4 py-3 rounded-[16px] bg-white/[0.06] border border-white/14 text-base sm:text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-amber-400/60"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* View Switch */}
              <div className="inline-flex items-center p-1 rounded-[14px] bg-white/[0.05] border border-white/12">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`min-h-[36px] px-3 rounded-[10px] text-xs font-semibold inline-flex items-center gap-1.5 transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-[#050505]'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Photo Grid</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('board')}
                  className={`min-h-[36px] px-3 rounded-[10px] text-xs font-semibold inline-flex items-center gap-1.5 transition-colors ${
                    viewMode === 'board'
                      ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-[#050505]'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  <span>Menu Board</span>
                </button>
              </div>

              <div className="inline-flex items-center gap-2 px-3 min-h-[44px] rounded-[14px] bg-white/[0.04] border border-white/12 text-xs text-white/70">
                <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
                <select
                  value={spiceFilter}
                  onChange={(e) => setSpiceFilter(e.target.value as 'all' | SpiceLevel)}
                  aria-label="Filter by spice profile"
                  className="bg-transparent text-white text-sm sm:text-xs focus:outline-none cursor-pointer"
                >
                  <option value="all" className="bg-neutral-900">
                    All Spice Profiles
                  </option>
                  <option value="Mild" className="bg-neutral-900">
                    Mild
                  </option>
                  <option value="Signature Blend" className="bg-neutral-900">
                    Signature Blend
                  </option>
                  <option value="Medium" className="bg-neutral-900">
                    Medium
                  </option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => setOnlyAvailable((prev) => !prev)}
                className={`min-h-[44px] px-4 py-2.5 rounded-[14px] text-xs font-medium border transition-colors ${
                  onlyAvailable
                    ? 'bg-white text-[#050505] border-white'
                    : 'bg-white/[0.04] text-white/75 border-white/12 hover:bg-white/[0.08]'
                }`}
              >
                Available Only
              </button>
            </div>
          </div>

          {/* Category Squircle Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar max-w-full">
            <button
              type="button"
              onClick={() => setSelectedCategoryId('all')}
              className={`min-h-[42px] px-4 py-2 rounded-[14px] text-xs font-semibold tracking-wider uppercase transition-all whitespace-nowrap shrink-0 border ${
                selectedCategoryId === 'all'
                  ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-[#050505] border-amber-400'
                  : 'bg-white/[0.05] text-white/75 border-white/12 hover:bg-white/[0.1] hover:text-white'
              }`}
            >
              All ({menuItems.length})
            </button>
            {activeCategories.map((cat) => {
              const count = menuItems.filter((i) => i.categoryId === cat.id).length;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={`min-h-[42px] px-4 py-2 rounded-[14px] text-xs font-semibold tracking-wider uppercase transition-all whitespace-nowrap shrink-0 border ${
                    selectedCategoryId === cat.id
                      ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-[#050505] border-amber-400'
                      : 'bg-white/[0.05] text-white/75 border-white/12 hover:bg-white/[0.1] hover:text-white'
                  }`}
                >
                  {cat.name} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Organized 2-Page Menu Presentation */}
        <div className="mt-8 sm:mt-10">
          {loading ? (
            <ShawarmaLoader label="Loading Arabian Grill House menu..." tone="dark" />
          ) : filteredItems.length === 0 ? (
            <div className="rounded-[24px] glass-dark p-10 sm:p-12 text-center">
              <p className="text-lg font-medium mb-2">No matching items found</p>
              <p className="text-sm text-white/60 mb-6">
                Try clearing your search or selecting another menu section.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategoryId('all');
                  setSpiceFilter('all');
                  setSearchQuery('');
                  setOnlyAvailable(false);
                }}
                className="min-h-[44px] px-5 py-3 rounded-[14px] bg-gradient-to-r from-amber-400 to-orange-500 text-[#050505] text-xs font-semibold uppercase tracking-wider"
              >
                Show Complete Menu
              </button>
            </div>
          ) : (
            <div className="space-y-12 sm:space-y-16">
              {page1Sections.length > 0 && (
                <section className="space-y-8 sm:space-y-10">
                  <div className="rounded-[20px] px-5 py-4 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent border border-amber-400/30 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-amber-400">
                        Menu Page 1
                      </p>
                      <h2 className="font-editorial text-2xl sm:text-3xl font-semibold text-white mt-0.5">
                        Burgers &amp; Fast Food
                      </h2>
                    </div>
                    <span className="text-xs text-white/70 font-medium">
                      Burgers · Snack Pack · Fries
                    </span>
                  </div>

                  <div className="space-y-10">
                    {page1Sections.map((sec) => renderSectionBlock(sec))}
                  </div>
                </section>
              )}

              {page2Sections.length > 0 && (
                <section className="space-y-8 sm:space-y-10">
                  <div className="rounded-[20px] px-5 py-4 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent border border-amber-400/30 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-amber-400">
                        Menu Page 2
                      </p>
                      <h2 className="font-editorial text-2xl sm:text-3xl font-semibold text-white mt-0.5">
                        Special Shawarma &amp; Platter
                      </h2>
                    </div>
                    <span className="text-xs text-white/70 font-medium">
                      Shawarma &amp; Platter · Sauces · Beverages · Add-Ons
                    </span>
                  </div>

                  <div className="space-y-10">
                    {page2Sections.map((sec) => renderSectionBlock(sec))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
