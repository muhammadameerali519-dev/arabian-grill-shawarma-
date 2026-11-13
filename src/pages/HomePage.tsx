import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useMotionValueEvent, useScroll, useTransform } from 'motion/react';
import {
  ArrowDown,
  ArrowRight,
  Award,
  ChefHat,
  Clock,
  MapPin,
  Navigation,
  Phone,
  Quote,
  Search,
  Sparkles,
  Star,
  Utensils,
} from 'lucide-react';
import { AnimatedCounter } from '../components/AnimatedCounter';
import { MagneticButton } from '../components/MagneticButton';
import { MenuCard } from '../components/MenuCard';
import { GOOGLE_MAPS_DIRECTIONS_URL, RestaurantMap } from '../components/RestaurantMap';
import { ShawarmaLogo3D } from '../components/ShawarmaLogo3D';
import { SmartImage } from '../components/SmartImage';
import { SquircleIcon } from '../components/SquircleIcon';
import { WhatsAppIcon } from '../components/WhatsAppIcon';
import { BRAND_ASSETS } from '../data/assets';
import { GALLERY_PHOTOS, RESTAURANT_INFO } from '../data/seedData';
import { useMenu } from '../context/MenuContext';
import { buildGeneralWhatsAppUrl } from '../utils/whatsapp';

interface HomePageProps {
  onNavbarThemeChange?: (isLight: boolean) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavbarThemeChange }) => {
  const navigate = useNavigate();
  const { categories, menuItems, settings } = useMenu();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const pageRef = useRef<HTMLDivElement>(null);
  const transitionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress: heroScroll } = useScroll();
  const heroParallaxY = useTransform(heroScroll, [0, 0.35], [0, 75]);
  const heroImageScale = useTransform(heroScroll, [0, 0.35], [1, 1.06]);

  const { scrollYProgress: bridgeProgress } = useScroll({
    target: transitionRef,
    offset: ['start 85%', 'end 20%'],
  });

  const bgColor = useTransform(
    bridgeProgress,
    [0, 0.45, 0.85, 1],
    ['#050505', '#1C1C1E', '#E4E4E7', '#FFFFFF']
  );
  const textColor = useTransform(
    bridgeProgress,
    [0, 0.45, 0.7, 1],
    ['#FFFFFF', '#F4F4F5', '#18181B', '#050505']
  );
  const bridgeParallaxY = useTransform(bridgeProgress, [0, 1], [-18, 18]);

  useMotionValueEvent(bridgeProgress, 'change', (latest) => {
    if (onNavbarThemeChange) {
      onNavbarThemeChange(latest >= 0.65);
    }
  });

  useEffect(() => {
    return () => {
      onNavbarThemeChange?.(false);
    };
  }, [onNavbarThemeChange]);

  const activeCategories = useMemo(
    () => categories.filter((c) => c.active),
    [categories]
  );

  const filteredMenuItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return menuItems
      .filter((item) => {
        const matchesCat =
          selectedCategoryId === 'all' || item.categoryId === selectedCategoryId;
        const matchesQuery =
          !q ||
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.categoryName.toLowerCase().includes(q);
        return matchesCat && matchesQuery;
      })
      .slice(0, 6);
  }, [menuItems, selectedCategoryId, searchQuery]);

  const scrollToMenu = () => {
    document.getElementById('home-menu-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div ref={pageRef} className="w-full overflow-x-clip">
      {/* ============================================================
          FIRST 50%: DEEP BLACK (#050505) LUXURY THEME
      ============================================================ */}
      <div className="bg-[#050505] text-white">
        {/* 1. HERO SECTION (MOBILE-FIRST + DESKTOP SPLIT) */}
        <section className="relative min-h-[100svh] flex items-center pt-24 sm:pt-28 pb-14 sm:pb-20 px-4 sm:px-6 overflow-hidden">
          <motion.div
            style={{ y: heroParallaxY, scale: heroImageScale }}
            className="absolute inset-0 pointer-events-none"
          >
            <img
              src={BRAND_ASSETS.heroArabianGrill}
              alt="Arabian Grill House authentic shawarma and charcoal grilled specialties"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover opacity-45 sm:opacity-55"
            />
            <div className="absolute inset-0 bg-gradient-to-b sm:bg-gradient-to-r from-[#050505]/95 via-[#050505]/80 to-[#050505]/45" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]/65" />
          </motion.div>

          <div className="relative z-10 max-w-7xl mx-auto w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
              {/* Hero Copy & CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="lg:col-span-7 min-w-0"
              >
                <p className="text-[11px] sm:text-xs tracking-[0.2em] sm:tracking-[0.26em] uppercase text-white/65 mb-4">
                  Unwrap the Magic of Arabian Shawarma · Gujranwala
                </p>

                <h1 className="font-editorial text-fluid-hero font-semibold tracking-tight text-white text-balance">
                  THE ART OF AUTHENTIC ARABIAN GRILL.
                </h1>

                <p className="mt-4 sm:mt-6 text-[15px] sm:text-lg text-white/75 leading-relaxed max-w-xl">
                  Discover authentic Arabian flavours, perfectly grilled ingredients, and unforgettable taste — crafted to bring the true spirit of Arabian cuisine to your table.
                </p>

                <div className="mt-7 sm:mt-9 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                  <MagneticButton
                    type="button"
                    onClick={scrollToMenu}
                    className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center gap-3 px-6 py-3.5 sm:py-4 rounded-[16px] sm:rounded-[18px] bg-white text-[#050505] text-xs font-semibold tracking-[0.14em] uppercase hover:bg-neutral-200 transition-colors shadow-[0_18px_40px_rgba(255,255,255,0.16)] whitespace-nowrap"
                  >
                    <span>EXPLORE OUR MENU</span>
                    <ArrowRight className="w-4 h-4" />
                  </MagneticButton>

                  <button
                    type="button"
                    onClick={() => navigate('/menu')}
                    className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center gap-3 px-6 py-3.5 sm:py-4 rounded-[16px] sm:rounded-[18px] glass-dark text-white text-xs font-semibold tracking-[0.14em] uppercase hover:bg-white/[0.12] transition-colors whitespace-nowrap"
                  >
                    <span>ORDER ONLINE</span>
                  </button>
                </div>
              </motion.div>

              {/* Dedicated 3D Shawarma Showcase (Never crops or covers text/buttons) */}
              <div className="lg:col-span-5 flex items-center justify-center py-2 sm:py-4">
                <ShawarmaLogo3D
                  size="hero"
                  tone="dark"
                  showWordmark
                  wordmarkSize="md"
                  priority
                />
              </div>
            </div>

            {/* Bottom Hero Bar + Scroll Indicator */}
            <div className="mt-10 sm:mt-16 pt-5 sm:pt-6 border-t border-white/12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-white/65">
                <span className="font-mono-nums text-white">
                  {RESTAURANT_INFO.googleRating} / 5 Google Rating
                </span>
                <span aria-hidden="true">·</span>
                <span>{RESTAURANT_INFO.googleReviewCount} Verified Google Reviews</span>
                <span aria-hidden="true">·</span>
                <span className="whitespace-nowrap">
                  {settings.openTime} – {settings.closeTime}
                </span>
              </div>

              <button
                type="button"
                onClick={scrollToMenu}
                aria-label="Scroll to restaurant highlights"
                className="inline-flex items-center gap-2.5 text-xs tracking-[0.2em] uppercase text-white/60 hover:text-white transition-colors min-h-[40px]"
              >
                <span>Scroll</span>
                <motion.span
                  animate={{ y: [0, 4, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-8 h-8 rounded-[11px] border border-white/15 bg-white/[0.05] inline-flex items-center justify-center"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </motion.span>
              </button>
            </div>
          </div>
        </section>

        {/* 2. RESTAURANT INFORMATION & TRUST */}
        <section className="py-16 sm:py-24 px-4 sm:px-6 border-t border-white/10">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-end mb-10 sm:mb-12">
              <div className="lg:col-span-7">
                <p className="text-xs tracking-[0.24em] uppercase text-white/50 mb-3">
                  Verified Guest Impressions
                </p>
                <h2 className="font-editorial text-fluid-h2 font-semibold tracking-tight text-balance">
                  Balanced spice, clean preparation, and genuine Arabian craft.
                </h2>
              </div>
              <div className="lg:col-span-5 lg:text-right">
                <p className="text-sm text-white/60 leading-relaxed">
                  Based on verified Google listing data for Arabian Grill House, Civil Lines, Gujranwala.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 min-[375px]:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
              <div className="rounded-[20px] sm:rounded-[24px] p-4 sm:p-6 glass-dark">
                <SquircleIcon size="md" tone="dark" className="mb-4 sm:mb-5">
                  <Star className="w-5 h-5" />
                </SquircleIcon>
                <div className="text-2xl sm:text-4xl font-semibold tracking-tight">
                  <AnimatedCounter target={4.8} decimals={1} />
                  <span className="text-base sm:text-lg text-white/45 font-mono-nums ml-1">/ 5</span>
                </div>
                <p className="mt-2 text-xs sm:text-sm text-white/75 font-medium">Google Rating</p>
                <p className="mt-1 text-[11px] sm:text-xs text-white/45">
                  Verified public guest score
                </p>
              </div>

              <div className="rounded-[20px] sm:rounded-[24px] p-4 sm:p-6 glass-dark">
                <SquircleIcon size="md" tone="dark" className="mb-4 sm:mb-5">
                  <Sparkles className="w-5 h-5" />
                </SquircleIcon>
                <div className="text-2xl sm:text-4xl font-semibold tracking-tight">
                  <AnimatedCounter target={5} decimals={0} />
                </div>
                <p className="mt-2 text-xs sm:text-sm text-white/75 font-medium">Google Reviews</p>
                <p className="mt-1 text-[11px] sm:text-xs text-white/45">
                  Authentic diner feedback
                </p>
              </div>

              <div className="rounded-[20px] sm:rounded-[24px] p-4 sm:p-6 glass-dark">
                <SquircleIcon size="md" tone="dark" className="mb-4 sm:mb-5">
                  <Utensils className="w-5 h-5" />
                </SquircleIcon>
                <div className="text-xl sm:text-3xl font-semibold tracking-tight font-mono-nums">
                  {RESTAURANT_INFO.averagePriceRange}
                </div>
                <p className="mt-2 text-xs sm:text-sm text-white/75 font-medium">
                  Avg. Price Per Person
                </p>
                <p className="mt-1 text-[11px] sm:text-xs text-white/45">
                  Reported Google price range
                </p>
              </div>

              <div className="rounded-[20px] sm:rounded-[24px] p-4 sm:p-6 glass-dark">
                <SquircleIcon size="md" tone="dark" className="mb-4 sm:mb-5">
                  <Award className="w-5 h-5" />
                </SquircleIcon>
                <div className="font-editorial text-lg sm:text-[26px] font-semibold tracking-tight leading-snug">
                  Authentic Arabian Taste
                </div>
                <p className="mt-2 text-[11px] sm:text-xs text-white/55 leading-relaxed">
                  Light, aromatic marinades without excess oil or overpowering heat.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. INTERACTIVE MENU PREVIEW (BLACK THEME) */}
        <section id="home-menu-section" className="py-16 sm:py-28 px-4 sm:px-6 border-t border-white/10">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8 sm:mb-10">
              <div>
                <p className="text-xs tracking-[0.24em] uppercase text-amber-400 font-semibold mb-3">
                  Interactive Ordering
                </p>
                <h2 className="font-editorial text-fluid-h1 font-semibold tracking-tight text-balance">
                  Official Culinary Menu
                </h2>
                <p className="mt-3 text-sm text-white/65 max-w-xl">
                  Burgers, Loaded Snack Packs, Fries, Arabian Special Shawarma &amp; Platter, House Sauces, Beverages, and Add-Ons.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-white/45 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter dishes..."
                    aria-label="Filter menu dishes"
                    className="w-full sm:w-64 min-h-[46px] pl-11 pr-4 py-3 rounded-[16px] bg-white/[0.06] border border-white/14 text-base sm:text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/40"
                  />
                </div>
                <Link
                  to="/menu"
                  className="min-h-[46px] inline-flex items-center justify-center gap-2 px-5 py-3 rounded-[16px] bg-white text-[#050505] text-xs font-semibold tracking-wider uppercase hover:bg-neutral-200 transition-colors whitespace-nowrap"
                >
                  <span>Full Menu</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Category Squircle Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-7 sm:mb-8 no-scrollbar max-w-full">
              <button
                type="button"
                onClick={() => setSelectedCategoryId('all')}
                className={`min-h-[42px] px-4 py-2 rounded-[14px] text-xs font-semibold tracking-wider uppercase transition-all whitespace-nowrap shrink-0 border ${
                  selectedCategoryId === 'all'
                    ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-[#050505] border-amber-400'
                    : 'bg-white/[0.05] text-white/75 border-white/12 hover:bg-white/[0.1] hover:text-white'
                }`}
              >
                All Highlights
              </button>
              {activeCategories.map((cat) => (
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
                  {cat.name}
                </button>
              ))}
            </div>

            {filteredMenuItems.length === 0 ? (
              <div className="rounded-[24px] glass-dark p-10 sm:p-12 text-center">
                <p className="text-base text-white/70 mb-4">
                  No dishes matched your current filter.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategoryId('all');
                    setSearchQuery('');
                  }}
                  className="px-5 py-3 min-h-[44px] rounded-[14px] bg-white text-[#050505] text-xs font-semibold uppercase tracking-wider"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 min-[375px]:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
                {filteredMenuItems.map((item) => (
                  <MenuCard key={item.id} item={item} tone="dark" />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* ============================================================
          SEAMLESS BLACK-TO-WHITE SCROLL TRANSITION BRIDGE
      ============================================================ */}
      <motion.section
        ref={transitionRef}
        style={{ backgroundColor: bgColor, color: textColor }}
        className="py-16 sm:py-32 px-4 sm:px-6 transition-colors"
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 items-center">
          <div className="lg:col-span-6 space-y-4 sm:space-y-5">
            <p className="text-xs tracking-[0.26em] uppercase opacity-60">
              From Fire To Table
            </p>
            <h2 className="font-editorial text-fluid-h1 font-semibold tracking-tight text-balance">
              Carved fresh, seasoned lightly, finished with composure.
            </h2>
            <p className="text-sm sm:text-base opacity-75 leading-relaxed max-w-lg">
              Where glowing charcoal craft meets serene Arabian hospitality. Every wrap and platter is prepared to feel refined, crisp, and effortless.
            </p>
          </div>
          <motion.div
            style={{ y: bridgeParallaxY }}
            className="lg:col-span-6"
          >
            <div className="rounded-[24px] sm:rounded-[32px] overflow-hidden shadow-2xl border border-current/10 aspect-[16/10]">
              <SmartImage
                src={BRAND_ASSETS.welcomeShawarmaCloseup}
                alt="Freshly carved Arabian shawarma over glowing coals"
                fallbackTitle="Arabian Grill Craft"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* ============================================================
          SECOND 50%: PURE WHITE (#FFFFFF) LUXURY THEME
      ============================================================ */}
      <div className="bg-white text-[#050505]">
        {/* A. OUR SIGNATURE EXPERIENCE */}
        <section className="py-16 sm:py-28 px-4 sm:px-6 border-t border-black/10">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-stretch">
              <div className="lg:col-span-6 flex flex-col justify-between">
                <div>
                  <p className="text-xs tracking-[0.26em] uppercase text-neutral-500 mb-3 sm:mb-4">
                    Our Signature Experience
                  </p>
                  <h2 className="font-editorial text-fluid-h1 font-semibold tracking-tight text-balance">
                    MORE THAN A MEAL. IT&apos;S AN ARABIAN EXPERIENCE.
                  </h2>
                  <p className="mt-4 sm:mt-6 text-sm sm:text-base text-neutral-600 leading-relaxed">
                    At Arabian Grill House, restraint defines quality. We roast slowly over controlled heat, balance garlic toum with clean citrus, and press every wrap so it arrives crisp rather than heavy or overly spiced.
                  </p>
                </div>

                <div className="mt-8 sm:mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-[20px] sm:rounded-[22px] p-5 glass-light">
                    <SquircleIcon size="sm" tone="light" className="mb-3">
                      <ChefHat className="w-4 h-4" />
                    </SquircleIcon>
                    <h3 className="font-semibold text-sm">Clean Grill Craft</h3>
                    <p className="mt-1.5 text-xs text-neutral-600 leading-relaxed">
                      Trimmed cuts and light, aromatic spices rather than excessive oil.
                    </p>
                  </div>
                  <div className="rounded-[20px] sm:rounded-[22px] p-5 glass-light">
                    <SquircleIcon size="sm" tone="light" className="mb-3">
                      <Clock className="w-4 h-4" />
                    </SquircleIcon>
                    <h3 className="font-semibold text-sm">Evening to Late Night</h3>
                    <p className="mt-1.5 text-xs text-neutral-600 leading-relaxed">
                      Serving Civil Lines, Gujranwala from {settings.openTime} until{' '}
                      {settings.closeTime}.
                    </p>
                  </div>
                </div>

                <div className="mt-7 sm:mt-8">
                  <Link
                    to="/our-story"
                    className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center gap-3 px-6 py-3.5 sm:py-4 rounded-[16px] sm:rounded-[18px] bg-[#050505] text-white text-xs font-semibold tracking-[0.14em] uppercase hover:bg-neutral-800 transition-colors"
                  >
                    <span>Read Our Story</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div className="rounded-[22px] sm:rounded-[26px] overflow-hidden border border-black/10 shadow-sm aspect-[4/3] sm:aspect-auto sm:min-h-[280px]">
                  <SmartImage
                    src={BRAND_ASSETS.dishShawarmaPlatter}
                    alt="Royal Arabian Shawarma Platter"
                    fallbackTitle="Shawarma Platter"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="rounded-[22px] sm:rounded-[26px] overflow-hidden border border-black/10 shadow-sm aspect-[4/3] sm:aspect-auto sm:min-h-[280px]">
                  <SmartImage
                    src={BRAND_ASSETS.restaurantInterior}
                    alt="Arabian Grill House dining interior"
                    fallbackTitle="Dining Room"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* B. FOOD GALLERY PREVIEW */}
        <section className="py-16 sm:py-24 px-4 sm:px-6 bg-neutral-50 border-t border-black/10">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10">
              <div>
                <p className="text-xs tracking-[0.24em] uppercase text-neutral-500 mb-3">
                  Visual Showcase
                </p>
                <h2 className="font-editorial text-fluid-h2 font-semibold tracking-tight">
                  From The Grill & Dining Room
                </h2>
              </div>
              <Link
                to="/gallery"
                className="w-full sm:w-auto min-h-[46px] inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-[15px] bg-[#050505] text-white text-xs font-semibold uppercase tracking-wider hover:bg-neutral-800 transition-colors"
              >
                <span>Open Full Gallery</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 min-[375px]:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
              {GALLERY_PHOTOS.map((photo) => (
                <Link
                  key={photo.id}
                  to="/gallery"
                  className="group rounded-[20px] sm:rounded-[24px] overflow-hidden glass-light flex flex-col"
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <SmartImage
                      src={photo.imageUrl}
                      alt={photo.title}
                      fallbackTitle={photo.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-3.5 sm:p-5">
                    <p className="text-[10px] sm:text-[11px] tracking-wider uppercase text-neutral-500">
                      {photo.category}
                    </p>
                    <h3 className="mt-1 text-sm sm:text-base font-semibold text-neutral-950 line-clamp-1">
                      {photo.title}
                    </h3>
                    <p className="mt-1 text-xs text-neutral-600 leading-relaxed line-clamp-2">
                      {photo.caption}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* C. VERIFIED CUSTOMER REVIEWS */}
        <section className="py-16 sm:py-24 px-4 sm:px-6 border-t border-black/10">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 sm:gap-6 mb-10 sm:mb-12">
              <div>
                <p className="text-xs tracking-[0.24em] uppercase text-neutral-500 mb-3">
                  Verified Google Feedback
                </p>
                <h2 className="font-editorial text-fluid-h2 font-semibold tracking-tight">
                  Words From Our Guests
                </h2>
              </div>
              <div className="rounded-[20px] px-4 sm:px-5 py-3.5 glass-light inline-flex items-center gap-3.5 sm:gap-4 self-start lg:self-auto">
                <SquircleIcon size="sm" tone="solid-dark">
                  <Star className="w-4 h-4 fill-white" />
                </SquircleIcon>
                <div>
                  <div className="text-sm font-semibold font-mono-nums">
                    {RESTAURANT_INFO.googleRating} / 5.0
                  </div>
                  <div className="text-xs text-neutral-500">
                    Based on {RESTAURANT_INFO.googleReviewCount} Google reviews
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              {RESTAURANT_INFO.verifiedReviews.map((rev) => (
                <blockquote
                  key={rev.id}
                  className="rounded-[22px] sm:rounded-[26px] p-6 sm:p-9 glass-light flex flex-col justify-between"
                >
                  <div>
                    <SquircleIcon size="md" tone="light" className="mb-5 sm:mb-6">
                      <Quote className="w-5 h-5" />
                    </SquircleIcon>
                    <p className="font-editorial text-lg sm:text-2xl font-medium text-neutral-950 leading-snug">
                      &ldquo;{rev.excerpt}&rdquo;
                    </p>
                  </div>
                  <footer className="mt-7 sm:mt-8 pt-4 border-t border-black/10 flex items-center justify-between text-xs text-neutral-500">
                    <span>{rev.source}</span>
                    <span className="font-mono-nums text-neutral-900 font-semibold">
                      5 / 5 Stars
                    </span>
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>

        {/* D. LOCATION & CONTACT */}
        <section className="py-16 sm:py-28 px-4 sm:px-6 bg-neutral-50 border-t border-black/10">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 items-stretch">
            <div className="lg:col-span-5 flex flex-col justify-between space-y-6 sm:space-y-8">
              <div>
                <p className="text-xs tracking-[0.24em] uppercase text-neutral-500 mb-3">
                  Visit Gujranwala
                </p>
                <h2 className="font-editorial text-fluid-h2 font-semibold tracking-tight text-balance">
                  Arabian Grill House
                </h2>
                <p className="mt-3 text-sm text-neutral-600 leading-relaxed">
                  Dine in at Mumtaz Market or order directly for delivery or pickup across Gujranwala.
                </p>
              </div>

              <div className="space-y-3.5 sm:space-y-4">
                <div className="rounded-[20px] p-4 glass-light flex items-start gap-3.5 sm:gap-4">
                  <SquircleIcon size="md" tone="light">
                    <MapPin className="w-5 h-5" />
                  </SquircleIcon>
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-wider text-neutral-500">
                      Address
                    </p>
                    <p className="text-sm font-medium text-neutral-950 mt-0.5 leading-relaxed">
                      {RESTAURANT_INFO.address}
                    </p>
                  </div>
                </div>

                <div className="rounded-[20px] p-4 glass-light flex items-start gap-3.5 sm:gap-4">
                  <SquircleIcon size="md" tone="light">
                    <Phone className="w-5 h-5" />
                  </SquircleIcon>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-neutral-500">
                      Phone & WhatsApp
                    </p>
                    <a
                      href={`tel:${RESTAURANT_INFO.phoneTel}`}
                      className="text-sm font-mono-nums font-semibold text-neutral-950 mt-0.5 block hover:underline"
                    >
                      {RESTAURANT_INFO.phoneDisplay}
                    </a>
                  </div>
                </div>

                <div className="rounded-[20px] p-4 glass-light flex items-start gap-3.5 sm:gap-4">
                  <SquircleIcon size="md" tone="light">
                    <Clock className="w-5 h-5" />
                  </SquircleIcon>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-neutral-500">
                      Opening Hours
                    </p>
                    <p className="text-sm font-medium text-neutral-950 mt-0.5">
                      Opens at {settings.openTime} and closes at {settings.closeTime}
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      Note: Opening hours may change.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 min-[420px]:grid-cols-2 sm:flex sm:flex-wrap gap-3">
                <a
                  href={GOOGLE_MAPS_DIRECTIONS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[46px] inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-[16px] bg-[#050505] text-white text-xs font-semibold uppercase tracking-wider hover:bg-neutral-800 transition-colors"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Get Directions</span>
                </a>

                <a
                  href={`tel:${RESTAURANT_INFO.phoneTel}`}
                  className="min-h-[46px] inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-[16px] glass-light text-neutral-950 text-xs font-semibold uppercase tracking-wider hover:bg-black/5 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call Now</span>
                </a>

                <a
                  href={buildGeneralWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-[420px]:col-span-2 sm:col-span-1 min-h-[46px] inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-[16px] glass-light text-neutral-950 text-xs font-semibold uppercase tracking-wider hover:bg-black/5 transition-colors"
                >
                  <WhatsAppIcon className="w-4 h-4" />
                  <span>WhatsApp Order</span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-7 flex flex-col justify-center">
              <RestaurantMap tone="light" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
