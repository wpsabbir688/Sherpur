import React, { useState } from 'react';
import { Compass, Mountain, Trees, Waves, Landmark, Sun, ChevronRight, Layers } from 'lucide-react';
import { Destination, Category } from '../types';
import { DestinationCard } from '../components/destinations/DestinationCard';

interface CategoriesPageProps {
  destinations: Destination[];
  categories: Category[];
  initialCategoryId?: string;
  onSelectDestination: (slug: string) => void;
}

export const CategoriesPage: React.FC<CategoriesPageProps> = ({
  destinations,
  categories,
  initialCategoryId = 'all',
  onSelectDestination,
}) => {
  const [selectedCatId, setSelectedCatId] = useState<string>(initialCategoryId);

  const categoryNameMap = categories.reduce((acc, cat) => {
    acc[cat.id] = cat.nameBn;
    return acc;
  }, {} as Record<string, string>);

  const filteredDestinations = selectedCatId === 'all'
    ? destinations.filter((d) => d.status === 'published')
    : destinations.filter((d) => d.status === 'published' && d.categoryIds?.includes(selectedCatId));

  const activeCategory = categories.find((c) => c.id === selectedCatId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-[#143E27] text-xs font-semibold">
          <Layers className="w-3.5 h-3.5" /> থিম ও আকর্ষণ অনুযায়ী
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#143E27] tracking-tight">
          পর্যটন ক্যাটাগরি সমূহ
        </h1>
        <p className="text-sm sm:text-base text-gray-600 max-w-2xl">
          পাহাড়, বন, নদী, ঐতিহাসিক স্থাপত্য বা পিকনিক স্পট—আপনার ভ্রমণের ধরন অনুযায়ী বেছে নিন।
        </p>
      </div>

      {/* Categories Grid Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <button
          onClick={() => setSelectedCatId('all')}
          className={`p-3.5 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center gap-2 ${
            selectedCatId === 'all'
              ? 'bg-[#143E27] text-white border-[#143E27] shadow-sm'
              : 'bg-white border-gray-200 text-gray-700 hover:bg-emerald-50'
          }`}
        >
          <Layers className="w-6 h-6" />
          <span className="text-xs font-bold">সকল ক্যাটাগরি</span>
        </button>
        {categories.map((cat) => {
          const isActive = selectedCatId === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCatId(cat.id)}
              className={`p-3.5 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center gap-2 ${
                isActive
                  ? 'bg-[#143E27] text-white border-[#143E27] shadow-sm'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-emerald-50'
              }`}
            >
              {cat.slug === 'hills-forests' && <Mountain className="w-6 h-6" />}
              {cat.slug === 'eco-parks' && <Trees className="w-6 h-6" />}
              {cat.slug === 'rivers-wetlands' && <Waves className="w-6 h-6" />}
              {cat.slug === 'historical-heritage' && <Landmark className="w-6 h-6" />}
              {cat.slug === 'picnic-nature' && <Sun className="w-6 h-6" />}
              {cat.slug !== 'hills-forests' && cat.slug !== 'eco-parks' && cat.slug !== 'rivers-wetlands' && cat.slug !== 'historical-heritage' && cat.slug !== 'picnic-nature' && (
                <Compass className="w-6 h-6" />
              )}
              <span className="text-xs font-bold line-clamp-1">{cat.nameBn}</span>
            </button>
          );
        })}
      </div>

      {activeCategory && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-[#143E27] space-y-1">
          <h2 className="text-lg font-bold">{activeCategory.nameBn}</h2>
          <p className="text-xs sm:text-sm text-gray-700">{activeCategory.descriptionBn}</p>
        </div>
      )}

      {/* Destinations List */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-[#143E27]">
          অন্তর্ভুক্ত স্থানসমূহ ({filteredDestinations.length}টি)
        </h3>

        {filteredDestinations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDestinations.map((dest) => (
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
            এই ক্যাটাগরিতে এখনও কোনো স্থান পাওয়া যায়নি।
          </div>
        )}
      </div>
    </div>
  );
};
