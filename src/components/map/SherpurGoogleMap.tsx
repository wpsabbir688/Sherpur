import React, { useState, useEffect, useCallback } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useMap,
} from '@vis.gl/react-google-maps';
import { Destination } from '../../types';
import { UPAZILAS } from '../../data/initialData';
import {
  MapPin,
  Navigation,
  ExternalLink,
  Clock,
  Ticket,
  ChevronRight,
  Sparkles,
  Layers,
} from 'lucide-react';

interface SherpurGoogleMapProps {
  destinations: Destination[];
  selectedDestinationId?: string | null;
  onSelectDestination?: (destination: Destination) => void;
  onNavigateToDetail?: (slug: string) => void;
  height?: string;
  zoom?: number;
  center?: { lat: number; lng: number };
  showSingleDestinationOnly?: boolean;
}

// Sherpur District Center approx (Sherpur Sadar / Central)
const DEFAULT_SHERPUR_CENTER = { lat: 25.08, lng: 90.12 };
const GOOGLE_MAPS_API_KEY =
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyCzHRZpbW0i7PygmcpeKHcNav4Hm79Uzsw';

// Category color mappings for distinct pins
const getCategoryPinTheme = (categoryIds?: string[]) => {
  if (!categoryIds || categoryIds.length === 0) {
    return { background: '#143E27', glyphColor: '#FFFFFF', borderColor: '#0B2416' };
  }
  if (categoryIds.includes('hills-forests')) {
    return { background: '#0F766E', glyphColor: '#FFFFFF', borderColor: '#115E59' }; // Teal / Mountain
  }
  if (categoryIds.includes('eco-parks')) {
    return { background: '#15803D', glyphColor: '#FFFFFF', borderColor: '#166534' }; // Emerald Green
  }
  if (categoryIds.includes('rivers-wetlands')) {
    return { background: '#0284C7', glyphColor: '#FFFFFF', borderColor: '#0369A1' }; // Sky Blue
  }
  if (categoryIds.includes('historical-heritage')) {
    return { background: '#D97706', glyphColor: '#FFFFFF', borderColor: '#B45309' }; // Amber
  }
  if (categoryIds.includes('cultural-religious')) {
    return { background: '#7C3AED', glyphColor: '#FFFFFF', borderColor: '#6D28D9' }; // Violet
  }
  return { background: '#1E5638', glyphColor: '#FFFFFF', borderColor: '#143E27' };
};

// Inner component to handle programmatic camera moves
const MapController: React.FC<{
  targetCenter?: { lat: number; lng: number };
  targetZoom?: number;
}> = ({ targetCenter, targetZoom }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !targetCenter) return;
    map.panTo(targetCenter);
    if (targetZoom) {
      map.setZoom(targetZoom);
    }
  }, [map, targetCenter, targetZoom]);

  return null;
};

export const SherpurGoogleMap: React.FC<SherpurGoogleMapProps> = ({
  destinations,
  selectedDestinationId,
  onSelectDestination,
  onNavigateToDetail,
  height = '520px',
  zoom = 10,
  center = DEFAULT_SHERPUR_CENTER,
  showSingleDestinationOnly = false,
}) => {
  const [activePlace, setActivePlace] = useState<Destination | null>(null);
  const [cameraCenter, setCameraCenter] = useState<{ lat: number; lng: number }>(center);
  const [cameraZoom, setCameraZoom] = useState<number>(zoom);

  // Sync external selection
  useEffect(() => {
    if (selectedDestinationId) {
      const found = destinations.find((d) => d.id === selectedDestinationId);
      if (found && found.latitude && found.longitude) {
        setActivePlace(found);
        setCameraCenter({ lat: found.latitude, lng: found.longitude });
        setCameraZoom(14);
      }
    }
  }, [selectedDestinationId, destinations]);

  const handleMarkerClick = useCallback(
    (dest: Destination) => {
      setActivePlace(dest);
      if (dest.latitude && dest.longitude) {
        setCameraCenter({ lat: dest.latitude, lng: dest.longitude });
        setCameraZoom(13);
      }
      onSelectDestination?.(dest);
    },
    [onSelectDestination]
  );

  const getUpazilaName = (id: string) => {
    const u = UPAZILAS.find((item) => item.id === id);
    return u ? u.nameBn : 'শেরপুর';
  };

  const validDestinations = destinations.filter(
    (d) => typeof d.latitude === 'number' && typeof d.longitude === 'number'
  );

  return (
    <div
      style={{ height, width: '100%' }}
      className="relative rounded-2xl overflow-hidden border border-emerald-900/15 shadow-sm bg-gray-100"
    >
      <APIProvider apiKey={GOOGLE_MAPS_API_KEY} libraries={['marker']}>
        <Map
          mapId="DEMO_MAP_ID"
          defaultCenter={center}
          defaultZoom={zoom}
          gestureHandling="greedy"
          disableDefaultUI={false}
          className="w-full h-full"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
        >
          <MapController targetCenter={cameraCenter} targetZoom={cameraZoom} />

          {validDestinations.map((dest) => {
            const isSelected = activePlace?.id === dest.id;
            const theme = getCategoryPinTheme(dest.categoryIds);

            return (
              <AdvancedMarker
                key={dest.id}
                position={{ lat: dest.latitude!, lng: dest.longitude! }}
                title={`${dest.titleBn} (${getUpazilaName(dest.upazilaId)})`}
                onClick={() => handleMarkerClick(dest)}
              >
                <Pin
                  background={isSelected ? '#F59E0B' : theme.background}
                  glyphColor={theme.glyphColor}
                  borderColor={isSelected ? '#78350F' : theme.borderColor}
                  scale={isSelected ? 1.25 : 1.0}
                />
              </AdvancedMarker>
            );
          })}

          {activePlace && activePlace.latitude && activePlace.longitude && (
            <InfoWindow
              position={{ lat: activePlace.latitude, lng: activePlace.longitude }}
              onCloseClick={() => setActivePlace(null)}
              headerContent={
                <div className="font-bold text-gray-900 text-sm flex items-center gap-1.5 pr-2">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span className="truncate">{activePlace.titleBn}</span>
                </div>
              }
            >
              <div className="max-w-[280px] sm:max-w-[310px] space-y-2.5 p-1 text-gray-800">
                {activePlace.coverImage && (
                  <div className="relative h-28 w-full rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={activePlace.coverImage}
                      alt={activePlace.titleBn}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-1.5 left-1.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-0.5 rounded">
                      {getUpazilaName(activePlace.upazilaId)}
                    </div>
                  </div>
                )}

                <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                  {activePlace.summaryBn}
                </p>

                <div className="grid grid-cols-2 gap-1.5 text-[11px] bg-emerald-50/70 p-2 rounded-lg border border-emerald-100 text-emerald-950">
                  {activePlace.entryFee && (
                    <div className="flex items-center gap-1">
                      <Ticket className="w-3 h-3 text-emerald-700 shrink-0" />
                      <span className="truncate">{activePlace.entryFee}</span>
                    </div>
                  )}
                  {activePlace.openingHours && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-emerald-700 shrink-0" />
                      <span className="truncate">{activePlace.openingHours}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
                  {onNavigateToDetail && (
                    <button
                      type="button"
                      onClick={() => onNavigateToDetail(activePlace.slug)}
                      className="flex-1 py-1.5 px-3 bg-[#143E27] hover:bg-[#0D2618] text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>বিস্তারিত</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <a
                    href={
                      activePlace.googleMapsUrl ||
                      `https://www.google.com/maps/dir/?api=1&destination=${activePlace.latitude},${activePlace.longitude}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-1.5 px-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-medium rounded-lg flex items-center justify-center gap-1 transition-colors"
                    title="গুগল ম্যাপসে ডিরেকশন ও রুট দেখুন"
                  >
                    <Navigation className="w-3.5 h-3.5 text-blue-600" />
                    <span className="hidden sm:inline">ডিরেকশন</span>
                  </a>
                </div>
              </div>
            </InfoWindow>
          )}
        </Map>
      </APIProvider>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl shadow-md border border-gray-200 text-[11px] text-gray-700 flex flex-wrap items-center gap-3 z-10 hidden sm:flex">
        <span className="font-bold text-gray-900 flex items-center gap-1">
          <Layers className="w-3.5 h-3.5 text-emerald-700" /> নির্দেশিকা:
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#0F766E]" /> পাহাড় ও বন
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#15803D]" /> ইকো পার্ক
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#D97706]" /> ঐতিহ্যবাহী স্থান
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#0284C7]" /> নদী ও জলাশয়
        </span>
      </div>
    </div>
  );
};
