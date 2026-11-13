import React, { useEffect, useState } from 'react';
import {
  APIProvider,
  APILoadingStatus,
  AdvancedMarker,
  InfoWindow,
  Map as GoogleMap,
  Pin,
  useAdvancedMarkerRef,
  useApiLoadingStatus,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import { ExternalLink, MapPin } from 'lucide-react';
import { RESTAURANT_INFO } from '../data/seedData';
import { SquircleIcon } from './SquircleIcon';

const MAPS_API_KEY = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || '';

export const GOOGLE_MAPS_DIRECTIONS_URL =
  'https://www.google.com/maps/search/?api=1&query=Arabian+Grill+House+Shop+135+Mumtaz+Market+GT+Rd+Civil+Lines+Gujranwala+52250+Pakistan';

// Default regional viewport center (Gujranwala GT Road / Civil Lines corridor)
// Refined dynamically via Places API (New) Place.searchByText at runtime.
const INITIAL_VIEWPORT_CENTER = { lat: 32.1617, lng: 74.1883 };

interface RestaurantMapProps {
  tone?: 'dark' | 'light';
}

const MapContent: React.FC<{ tone: 'dark' | 'light' }> = ({ tone }) => {
  const map = useMap();
  const placesLib = useMapsLibrary('places');
  const status = useApiLoadingStatus();
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [position, setPosition] = useState<{ lat: number; lng: number }>(
    INITIAL_VIEWPORT_CENTER
  );
  const [resolvedLabel, setResolvedLabel] = useState<string>(RESTAURANT_INFO.address);
  const [infoOpen, setInfoOpen] = useState(true);

  useEffect(() => {
    if (!placesLib || !map) return;
    let cancelled = false;

    async function locateRestaurant() {
      try {
        const request = {
          textQuery:
            'Arabian Grill House Mumtaz Market GT Rd Civil Lines Gujranwala Pakistan',
          fields: ['displayName', 'location', 'formattedAddress'],
          maxResultCount: 1,
        };
        const { places } = await placesLib.Place.searchByText(request);
        if (cancelled) return;
        const match = places?.[0];
        if (match?.location) {
          const coords = {
            lat: match.location.lat(),
            lng: match.location.lng(),
          };
          setPosition(coords);
          map.panTo(coords);
          map.setZoom(16);
          if (match.formattedAddress) {
            setResolvedLabel(match.formattedAddress);
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (
          msg.includes('RESOURCE_EXHAUSTED') ||
          msg.includes('OVER_QUERY_LIMIT') ||
          msg.includes('429')
        ) {
          window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
        }
      }
    }

    void locateRestaurant();
    return () => {
      cancelled = true;
    };
  }, [placesLib, map]);

  if (
    status === APILoadingStatus.FAILED ||
    status === APILoadingStatus.AUTH_FAILURE
  ) {
    return (
      <div
        className={`w-full h-full flex flex-col items-center justify-center p-6 text-center ${
          tone === 'light'
            ? 'bg-neutral-100 text-neutral-900'
            : 'bg-neutral-950 text-white'
        }`}
      >
        <SquircleIcon size="lg" tone={tone === 'light' ? 'light' : 'dark'} className="mb-3">
          <MapPin className="w-6 h-6" />
        </SquircleIcon>
        <p className="font-semibold text-base mb-1">{RESTAURANT_INFO.name}</p>
        <p className="text-sm opacity-70 max-w-sm mb-4">{RESTAURANT_INFO.address}</p>
        <a
          href={GOOGLE_MAPS_DIRECTIONS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-[14px] text-xs font-semibold uppercase tracking-wider ${
            tone === 'light'
              ? 'bg-neutral-950 text-white'
              : 'bg-white text-neutral-950'
          }`}
        >
          <span>Open in Google Maps</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    );
  }

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={position}
        title={RESTAURANT_INFO.name}
        onClick={() => setInfoOpen((prev) => !prev)}
      >
        <Pin
          background="#050505"
          borderColor="#FFFFFF"
          glyphColor="#FFFFFF"
          scale={1.15}
        />
      </AdvancedMarker>

      {infoOpen && marker && (
        <InfoWindow
          anchor={marker}
          maxWidth={260}
          onCloseClick={() => setInfoOpen(false)}
        >
          <div className="p-1 text-neutral-950 font-sans">
            <p className="font-semibold text-sm">{RESTAURANT_INFO.name}</p>
            <p className="text-xs text-neutral-600 mt-1 leading-snug">
              {resolvedLabel}
            </p>
            <a
              href={GOOGLE_MAPS_DIRECTIONS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-2 text-xs font-semibold text-neutral-950 underline"
            >
              <span>Get Directions</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </InfoWindow>
      )}
    </>
  );
};

export const RestaurantMap: React.FC<RestaurantMapProps> = ({ tone = 'light' }) => {
  if (!MAPS_API_KEY) {
    return (
      <div
        className={`w-full h-[300px] sm:h-[440px] rounded-[24px] border flex flex-col items-center justify-center p-6 text-center ${
          tone === 'light'
            ? 'bg-neutral-100 border-black/10 text-neutral-900'
            : 'bg-white/[0.04] border-white/15 text-white'
        }`}
      >
        <SquircleIcon size="lg" tone={tone === 'light' ? 'light' : 'dark'} className="mb-3">
          <MapPin className="w-6 h-6" />
        </SquircleIcon>
        <p className="font-semibold text-base mb-1">{RESTAURANT_INFO.name}</p>
        <p className="text-sm opacity-70 max-w-sm mb-4">{RESTAURANT_INFO.address}</p>
        <a
          href={GOOGLE_MAPS_DIRECTIONS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-2 px-5 py-3 rounded-[14px] text-xs font-semibold uppercase tracking-wider ${
            tone === 'light'
              ? 'bg-neutral-950 text-white'
              : 'bg-white text-neutral-950'
          }`}
        >
          <span>Open in Google Maps</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    );
  }

  return (
    <div
      className={`w-full h-[300px] sm:h-[440px] rounded-[24px] overflow-hidden border ${
        tone === 'light' ? 'border-black/10 shadow-lg' : 'border-white/15'
      }`}
    >
      <APIProvider apiKey={MAPS_API_KEY} language="en" region="PK" libraries={['places', 'marker']}>
        <GoogleMap
          defaultCenter={INITIAL_VIEWPORT_CENTER}
          defaultZoom={15}
          mapId="DEMO_MAP_ID"
          gestureHandling="cooperative"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          style={{ width: '100%', height: '100%' }}
        >
          <MapContent tone={tone} />
        </GoogleMap>
      </APIProvider>
    </div>
  );
};
