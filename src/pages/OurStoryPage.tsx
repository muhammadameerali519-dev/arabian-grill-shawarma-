import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, ChefHat, ShieldCheck, Sparkles, Utensils } from 'lucide-react';
import { SmartImage } from '../components/SmartImage';
import { SquircleIcon } from '../components/SquircleIcon';
import { BRAND_ASSETS } from '../data/assets';
import { RESTAURANT_INFO } from '../data/seedData';

export const OurStoryPage: React.FC = () => {
  return (
    <div className="bg-[#050505] text-white min-h-screen pt-24 sm:pt-32">
      {/* Header */}
      <section className="px-4 sm:px-6 pb-14 sm:pb-24 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl"
        >
          <p className="text-xs tracking-[0.24em] uppercase text-white/55 mb-3 sm:mb-4">
            Our Story · Gujranwala
          </p>
          <h1 className="font-editorial text-fluid-h1 font-semibold tracking-tight text-balance">
            Crafted to bring genuine Arabian grill culture to Gujranwala.
          </h1>
          <p className="mt-5 sm:mt-6 text-sm sm:text-lg text-white/70 leading-relaxed">
            Located in Mumtaz Market on GT Road, Civil Lines, Arabian Grill House was shaped around a clear philosophy: authentic Levantine marinades, gentle spice balance, and zero heavy grease.
          </p>
        </motion.div>

        <div className="mt-8 sm:mt-12 rounded-[22px] sm:rounded-[32px] overflow-hidden border border-white/12 aspect-[16/10] sm:aspect-[16/8]">
          <SmartImage
            src={BRAND_ASSETS.restaurantInterior}
            alt="Arabian Grill House dining space"
            fallbackTitle="Arabian Grill House Interior"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* Culinary Pillars */}
      <section className="bg-white text-[#050505] py-16 sm:py-28 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-12 items-stretch">
            <div className="lg:col-span-6 space-y-6 sm:space-y-8">
              <div>
                <p className="text-xs tracking-[0.24em] uppercase text-neutral-500 mb-3">
                  Culinary Discipline
                </p>
                <h2 className="font-editorial text-fluid-h2 font-semibold tracking-tight text-balance">
                  Three principles behind every platter and wrap.
                </h2>
              </div>

              <div className="space-y-4">
                <div className="rounded-[20px] sm:rounded-[22px] p-5 sm:p-6 glass-light flex items-start gap-4">
                  <SquircleIcon size="md" tone="light">
                    <ChefHat className="w-5 h-5" />
                  </SquircleIcon>
                  <div>
                    <h3 className="font-semibold text-base">01. Controlled Charcoal & Spit Heat</h3>
                    <p className="mt-1.5 text-sm text-neutral-600 leading-relaxed">
                      Every skewer and vertical spit roast is monitored so exterior caramelization never dries the tender center.
                    </p>
                  </div>
                </div>

                <div className="rounded-[20px] sm:rounded-[22px] p-5 sm:p-6 glass-light flex items-start gap-4">
                  <SquircleIcon size="md" tone="light">
                    <Sparkles className="w-5 h-5" />
                  </SquircleIcon>
                  <div>
                    <h3 className="font-semibold text-base">02. Light, Mild Arabian Balance</h3>
                    <p className="mt-1.5 text-sm text-neutral-600 leading-relaxed">
                      Guests note our clean finish — aromatic spice blends and whipped garlic toum that highlight the grill without excess oil.
                    </p>
                  </div>
                </div>

                <div className="rounded-[20px] sm:rounded-[22px] p-5 sm:p-6 glass-light flex items-start gap-4">
                  <SquircleIcon size="md" tone="light">
                    <ShieldCheck className="w-5 h-5" />
                  </SquircleIcon>
                  <div>
                    <h3 className="font-semibold text-base">03. Prepared to Order</h3>
                    <p className="mt-1.5 text-sm text-neutral-600 leading-relaxed">
                      From toasted shawarma rolls to open platters, dishes are assembled fresh for dine-in, pickup, and Gujranwala delivery.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 flex flex-col gap-5 sm:gap-6">
              <div className="rounded-[24px] sm:rounded-[28px] overflow-hidden border border-black/10 flex-1 aspect-[4/3] sm:aspect-auto sm:min-h-[300px]">
                <SmartImage
                  src={BRAND_ASSETS.dishGrilledSpecialties}
                  alt="Charcoal grilled shish tawook and kebab skewers"
                  fallbackTitle="Charcoal Specialties"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="rounded-[22px] sm:rounded-[24px] p-6 sm:p-7 bg-[#050505] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                    {RESTAURANT_INFO.googleRating} / 5 Google Rating
                  </p>
                  <p className="font-editorial text-xl mt-1">
                    Experience the menu tonight.
                  </p>
                </div>
                <Link
                  to="/menu"
                  className="w-full sm:w-auto min-h-[46px] inline-flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-[16px] bg-white text-[#050505] text-xs font-semibold uppercase tracking-wider hover:bg-neutral-200 transition-colors whitespace-nowrap"
                >
                  <Utensils className="w-4 h-4" />
                  <span>Explore Menu</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
