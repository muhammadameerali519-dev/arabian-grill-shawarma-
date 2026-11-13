import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, Volume2, VolumeX } from 'lucide-react';
import { BRAND_ASSETS } from '../data/assets';
import { ShawarmaLogo3D } from './ShawarmaLogo3D';
import { SquircleIcon } from './SquircleIcon';

interface CinematicIntroProps {
  visible: boolean;
  onEnter: () => void;
}

export const CinematicIntro: React.FC<CinematicIntroProps> = ({ visible, onEnter }) => {
  const [stage, setStage] = useState<'black' | 'logo' | 'ready'>('black');
  const [soundEnabled, setSoundEnabled] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  useEffect(() => {
    if (!visible) return;
    setStage('black');
    const t1 = setTimeout(() => setStage('logo'), 280);
    const t2 = setTimeout(() => setStage('ready'), 950);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [visible]);

  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        void audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
    };
  }, []);

  const toggleSound = () => {
    if (!soundEnabled) {
      try {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!audioCtxRef.current) {
          const ctx = new AudioCtx();
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const filter = ctx.createBiquadFilter();
          const gain = ctx.createGain();

          osc1.type = 'sine';
          osc1.frequency.setValueAtTime(110, ctx.currentTime);
          osc2.type = 'triangle';
          osc2.frequency.setValueAtTime(164.81, ctx.currentTime);

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(340, ctx.currentTime);

          gain.gain.setValueAtTime(0.0001, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.045, ctx.currentTime + 0.8);

          osc1.connect(filter);
          osc2.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);

          osc1.start();
          osc2.start();

          audioCtxRef.current = ctx;
          gainNodeRef.current = gain;
        } else {
          void audioCtxRef.current.resume();
          if (gainNodeRef.current) {
            gainNodeRef.current.gain.setTargetAtTime(0.045, audioCtxRef.current.currentTime, 0.25);
          }
        }
        setSoundEnabled(true);
      } catch {
        setSoundEnabled(false);
      }
    } else {
      if (audioCtxRef.current && gainNodeRef.current) {
        gainNodeRef.current.gain.setTargetAtTime(0.0001, audioCtxRef.current.currentTime, 0.2);
      }
      setSoundEnabled(false);
    }
  };

  const handleEnter = () => {
    if (audioCtxRef.current && gainNodeRef.current) {
      gainNodeRef.current.gain.setTargetAtTime(0.0001, audioCtxRef.current.currentTime, 0.15);
    }
    setSoundEnabled(false);
    onEnter();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] } }}
          className="fixed inset-0 z-[100] bg-[#050505] text-white flex flex-col justify-between overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Welcome to Arabian Grill House"
        >
          {/* Background close-up reveal */}
          <motion.div
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{
              opacity: stage === 'ready' ? 0.45 : stage === 'logo' ? 0.16 : 0,
              scale: stage === 'ready' ? 1.01 : 1.06,
            }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 pointer-events-none"
          >
            <img
              src={BRAND_ASSETS.welcomeShawarmaCloseup}
              alt="Authentic Arabian grilled shawarma over glowing embers"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/75 to-[#050505]/65" />
          </motion.div>

          {/* Top Bar Controls */}
          <div className="relative z-10 flex items-center justify-between gap-2 px-4 sm:px-10 pt-4 sm:pt-8">
            <div className="text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.28em] uppercase text-white/60 truncate">
              Gujranwala · Pakistan
            </div>
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <button
                type="button"
                onClick={toggleSound}
                aria-label={soundEnabled ? 'Mute ambient sound' : 'Unmute ambient sound'}
                className="inline-flex items-center gap-1.5 sm:gap-2.5 text-[11px] sm:text-xs tracking-wider uppercase text-white/80 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded-[13px] pr-2.5 sm:pr-3 min-h-[40px] glass-dark transition-colors"
              >
                <SquircleIcon size="sm" tone="dark" className="border-0 bg-transparent shadow-none">
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </SquircleIcon>
                <span className="whitespace-nowrap hidden min-[360px]:inline">
                  {soundEnabled ? 'Sound On' : 'Muted'}
                </span>
              </button>
              <button
                type="button"
                onClick={handleEnter}
                className="px-3.5 sm:px-4 min-h-[40px] text-[11px] sm:text-xs tracking-wider uppercase text-white/75 hover:text-white rounded-[13px] border border-white/15 bg-white/[0.04] hover:bg-white/[0.1] transition-colors whitespace-nowrap"
              >
                Skip
              </button>
            </div>
          </div>

          {/* Centerpiece 3D Shawarma & Tagline */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 sm:px-6 max-w-4xl mx-auto my-auto py-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.86, y: 14 }}
              animate={{
                opacity: stage === 'black' ? 0 : 1,
                scale: stage === 'black' ? 0.86 : 1,
                y: stage === 'black' ? 14 : 0,
              }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="mb-4 sm:mb-6"
            >
              <ShawarmaLogo3D
                size="lg"
                tone="dark"
                showWordmark
                wordmarkSize="lg"
                animateEntrance={false}
                priority
              />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{
                opacity: stage === 'ready' ? 1 : 0,
                y: stage === 'ready' ? 0 : 16,
              }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="font-editorial text-[clamp(1.35rem,5.2vw,3.35rem)] font-semibold tracking-tight text-white leading-[1.14] max-w-3xl text-balance mb-6 sm:mb-9"
            >
              UNWRAP THE MAGIC OF ARABIAN SHAWARMA
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{
                opacity: stage === 'ready' ? 1 : 0,
                y: stage === 'ready' ? 0 : 14,
              }}
              transition={{ duration: 0.65, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            >
              <button
                type="button"
                onClick={handleEnter}
                className="group inline-flex items-center gap-3.5 sm:gap-4 px-6 sm:px-7 py-3.5 sm:py-4 min-h-[48px] rounded-[18px] sm:rounded-[20px] bg-white text-[#050505] font-semibold text-xs sm:text-sm tracking-[0.14em] uppercase hover:bg-neutral-200 transition-all duration-200 shadow-[0_20px_50px_rgba(255,255,255,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white whitespace-nowrap"
              >
                <span>ENTER WEBSITE</span>
                <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-[10px] sm:rounded-[11px] bg-[#050505] text-white inline-flex items-center justify-center transition-transform duration-200 group-hover:translate-x-1">
                  <ArrowRight className="w-4 h-4" />
                </span>
              </button>
            </motion.div>
          </div>

          {/* Bottom Hairline */}
          <div className="relative z-10 px-4 sm:px-10 pb-4 sm:pb-8 flex flex-wrap items-center justify-between gap-2 text-[11px] sm:text-xs text-white/45">
            <span className="truncate">Shop #135, Mumtaz Market, Civil Lines</span>
            <span className="font-mono-nums whitespace-nowrap">4:00 PM – 2:00 AM</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
