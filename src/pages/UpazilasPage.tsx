import React, { useState } from 'react';
import { MapPin, Navigation, Sparkles, Building2, Trees, Waves } from 'lucide-react';
import { Destination, UpazilaId, Category } from '../types';
import { UPAZILAS } from '../data/initialData';
import { DestinationCard } from '../components/destinations/DestinationCard';
import { SherpurGoogleMap } from '../components/map/SherpurGoogleMap';

interface UpazilasPageProps {
  destinations: Destination[];
  categories: Category[];
  initialUpazilaId?: string;
  onSelectDestination: (slug: string) => void;
}

export const UpazilasPage: React.FC<UpazilasPageProps> = ({
  destinations,
  categories,
  initialUpazilaId = 'sherpur-sadar',
  onSelectDestination,
}) => {
  const [activeUpazilaId, setActiveUpazilaId] = useState<string>(initialUpazilaId);

  const activeUpazila = UPAZILAS.find((u) => u.id === activeUpazilaId) || UPAZILAS[0];

  const categoryNameMap = categories.reduce((acc, cat) => {
    acc[cat.id] = cat.nameBn;
    return acc;
  }, {} as Record<string, string>);

  const upazilaDestinations = destinations.filter(
    (d) => d.status === 'published' && d.upazilaId === activeUpazila.id
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-[#143E27] text-xs font-semibold">
          <MapPin className="w-3.5 h-3.5" /> শেরপুরের প্রশাসনিক অঞ্চল
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#143E27] tracking-tight">
          উপজেলা ভিত্তিক পর্যটন গাইড
        </h1>
        <p className="text-sm sm:text-base text-gray-600 max-w-2xl">
          শেরপুর জেলার ৫টি উপজেলার প্রাকৃতিক সৌন্দর্য, ইতিহাস ও দর্শনীয় স্থানগুলোর সুনির্দিষ্ট বিবরণ।
        </p>
      </div>

      {/* Upazila Tabs */}
      <div className="flex flex-wrap gap-1.5 sm:gap-2 border-b border-gray-200 pb-4">
        {UPAZILAS.map((up) => {
          const count = destinations.filter((d) => d.status === 'published' && d.upazilaId === up.id).length;
          const isActive = activeUpazila.id === up.id;
          return (
            <button
              key={up.id}
              onClick={() => setActiveUpazilaId(up.id)}
              className={`px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 sm:gap-2 cursor-pointer ${
                isActive
                  ? 'bg-[#143E27] text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-emerald-50 hover:text-[#143E27]'
              }`}
            >
              <span>{up.nameBn}</span>
              <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full ${
                isActive ? 'bg-emerald-800 text-white' : 'bg-gray-100 text-gray-600'
              }`}>
                {count}টি স্থান
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Upazila Profile Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-[#123923] to-[#0A2215] text-white rounded-3xl p-6 sm:p-8 shadow-md">
        <div className="max-w-3xl space-y-3">
          <div className="flex items-center gap-2 text-xs text-amber-300 font-semibold tracking-wide uppercase">
            <Building2 className="w-4 h-4" />
            <span>প্রশাসনিক কেন্দ্র: {activeUpazila.hqBn}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            {activeUpazila.nameBn} ({activeUpazila.nameEn})
          </h2>
          <p className="text-emerald-100 text-base leading-relaxed">
            {activeUpazila.descriptionBn}
          </p>
          <div className="pt-2 text-xs text-emerald-200">
            <strong>প্রধান পরিচিতি ও আকর্ষণ:</strong> {activeUpazila.popularForBn}
          </div>
        </div>
      </div>

      {/* Upazila Google Map Overview */}
      {upazilaDestinations.length > 0 && (
        <div className="bg-white rounded-3xl border border-gray-200 p-5 sm:p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-700" />
              <span>{activeUpazila.nameBn} উপজেলার পর্যটন মানচিত্র</span>
            </span>
            <span className="hidden sm:inline text-gray-400">
              পিনে ক্লিক করে রুট ও বিস্তারিত জানুন
            </span>
          </div>
          <SherpurGoogleMap
            destinations={upazilaDestinations}
            onSelectDestination={(dest) => onSelectDestination(dest.slug)}
            onNavigateToDetail={(slug) => onSelectDestination(slug)}
            height="360px"
            zoom={11}
            center={
              upazilaDestinations[0]?.latitude && upazilaDestinations[0]?.longitude
                ? {
                    lat: upazilaDestinations[0].latitude,
                    lng: upazilaDestinations[0].longitude,
                  }
                : undefined
            }
          />
        </div>
      )}

      {/* Upazila Destinations Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-[#143E27] flex items-center gap-2">
            <span>{activeUpazila.nameBn} উপজেলার দর্শনীয় স্থানসমূহ</span>
            <span className="text-xs bg-emerald-100 text-emerald-900 px-2.5 py-1 rounded-full font-bold">
              {upazilaDestinations.length}টি
            </span>
          </h3>
        </div>

        {upazilaDestinations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {upazilaDestinations.map((dest) => (
              <DestinationCard
                key={dest.id}
                destination={dest}
                onSelect={onSelectDestination}
                categoryNameMap={categoryNameMap}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-500">
            এই উপজেলায় এখনও কোনো স্থান তালিকাভুক্ত করা হয়নি।
          </div>
        )}
      </div>
    </div>
  );
};
