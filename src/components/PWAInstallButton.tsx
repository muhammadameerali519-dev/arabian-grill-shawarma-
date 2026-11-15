import React, { useState } from 'react';
import { Download, Smartphone, WifiOff, X } from 'lucide-react';
import { useOnlineStatus, usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  compact?: boolean;
  onAction?: () => void;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  compact = false,
  onAction,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  const handleTrigger = async () => {
    if (isInstallable) {
      await install();
      onAction?.();
      return;
    }
    setShowGuide(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => void handleTrigger()}
        className={
          compact
            ? 'w-full min-h-[44px] px-4 rounded-[14px] border border-amber-400/35 bg-amber-400/10 text-amber-300 hover:bg-amber-400/20 text-xs font-semibold uppercase tracking-wider inline-flex items-center justify-center gap-2 transition-colors'
            : 'min-h-[42px] px-4 py-2 rounded-[14px] border border-amber-400/35 bg-amber-400/10 text-amber-300 hover:bg-amber-400/20 text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-2 transition-colors'
        }
      >
        {isInstallable ? <Download className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
        <span>{isIOS ? 'Add to iPhone' : 'Install Phone App'}</span>
      </button>

      {showGuide && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Install Arabian Grill House on Phone"
        >
          <div className="w-full max-w-sm rounded-[24px] glass-dark bg-[#0a0a0a]/95 border border-white/15 p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-amber-400 font-semibold">
                  Mobile Phone App
                </p>
                <h3 className="font-editorial text-xl font-semibold mt-1">
                  Install on Your Phone
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                aria-label="Close install instructions"
                className="w-9 h-9 rounded-[11px] border border-white/15 bg-white/5 inline-flex items-center justify-center text-white/80 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isIOS ? (
              <ol className="space-y-2 text-xs text-white/75 leading-relaxed list-decimal pl-4">
                <li>
                  Open this website in <strong className="text-white">Safari</strong> on your iPhone or iPad.
                </li>
                <li>
                  Tap the <strong className="text-white">Share</strong> button at the bottom of Safari.
                </li>
                <li>
                  Scroll down and tap <strong className="text-white">Add to Home Screen</strong>.
                </li>
              </ol>
            ) : (
              <ol className="space-y-2 text-xs text-white/75 leading-relaxed list-decimal pl-4">
                <li>
                  Open this link in <strong className="text-white">Google Chrome</strong> on your Android phone.
                </li>
                <li>
                  Tap the <strong className="text-white">three-dot menu (⋮)</strong> at the top-right.
                </li>
                <li>
                  Tap <strong className="text-white">Add to Home screen</strong> or <strong className="text-white">Install app</strong>.
                </li>
              </ol>
            )}

            <button
              type="button"
              onClick={() => setShowGuide(false)}
              className="w-full min-h-[44px] rounded-[14px] bg-gradient-to-r from-amber-400 to-orange-500 text-[#050505] text-xs font-bold uppercase tracking-wider"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 no-print flex items-center gap-2 rounded-[14px] bg-neutral-950/95 border border-amber-400/40 px-3.5 py-2 text-xs font-medium text-amber-300 shadow-lg backdrop-blur-md">
      <WifiOff className="w-3.5 h-3.5 shrink-0" />
      <span>Offline Mode — Menu cached on device</span>
    </div>
  );
};
