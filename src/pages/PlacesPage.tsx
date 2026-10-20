import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  LayoutGrid,
  List,
  RotateCcw,
  MapPin,
  Sparkles,
  SlidersHorizontal,
  ChevronDown,
  Info,
} from 'lucide-react';
import { Destination, Category } from '../types';
import { UPAZILAS } from '../data/initialData';
import { DestinationCard } from '../components/destinations/DestinationCard';
import { recordAnalyticsEvent } from '../services/analyticsService';

interface PlacesPageProps {
  destinations: Destination[];
  categories: Category[];
  initialSearch?: string;
  initialUpazila?: string;
  initialCategory?: string;
  onSelectDestination: (slug: string) => void;
}

export const PlacesPage: React.FC<PlacesPageProps> = ({
  destinations,
  categories,
  initialSearch = '',
  initialUpazila = 'all',
  initialCategory = 'all',
  onSelectDestination,
}) => {
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedUpazila, setSelectedUpazila] = useState(initialUpazila);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState<'featured' | 'newest' | 'alphabetical'>('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Track search
  React.useEffect(() => {
    if (searchTerm.trim().length >= 3) {
      const handler = setTimeout(() => {
        recordAnalyticsEvent('destination_search', {
          metadata: { query: searchTerm.trim() },
        });
      }, 1000);
      return () => clearTimeout(handler);
    }
  }, [searchTerm]);

  // Track upazila filter
  React.useEffect(() => {
    if (selectedUpazila && selectedUpazila !== 'all') {
      recordAnalyticsEvent('upazila_filter', {
        metadata: { upazilaId: selectedUpazila },
      });
    }
  }, [selectedUpazila]);

  // Track category filter
  React.useEffect(() => {
    if (selectedCategory && selectedCategory !== 'all') {
      recordAnalyticsEvent('category_filter', {
        metadata: { categoryId: selectedCategory },
      });
    }
  }, [selectedCategory]);

  const categoryNameMap = useMemo(() => {
    return categories.reduce((acc, cat) => {
      acc[cat.id] = cat.nameBn;
      return acc;
    }, {} as Record<string, string>);
  }, [categories]);

  // Filter & sort logic
  const filteredDestinations = useMemo(() => {
    let result = destinations.filter((d) => d.status === 'published');

    // Search query
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter(
        (d) =>
          d.titleBn.toLowerCase().includes(q) ||
          (d.titleEn && d.titleEn.toLowerCase().includes(q)) ||
          d.summaryBn.toLowerCase().includes(q) ||
          d.locationName.toLowerCase().includes(q) ||
          (d.descriptionBn && d.descriptionBn.toLowerCase().includes(q))
      );
    }

    // Upazila filter
    if (selectedUpazila !== 'all') {
      result = result.filter((d) => d.upazilaId === selectedUpazila);
    }

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter((d) => d.categoryIds?.includes(selectedCategory));
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'featured') {
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return a.titleBn.localeCompare(b.titleBn, 'bn');
      } else if (sortBy === 'alphabetical') {
        return a.titleBn.localeCompare(b.titleBn, 'bn');
      } else if (sortBy === 'newest') {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      }
      return 0;
    });

    return result;
  }, [destinations, searchTerm, selectedUpazila, selectedCategory, sortBy]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedUpazila('all');
    setSelectedCategory('all');
    setSortBy('featured');
  };

  const hasActiveFilters =
    searchTerm !== '' || selectedUpazila !== 'all' || selectedCategory !== 'all';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-[#143E27] text-xs font-semibold">
          <MapPin className="w-3.5 h-3.5" /> শেরপুর জেলা পর্যটন ডিরেক্টরি
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#143E27] tracking-tight">
          সকল দর্শনীয় ও পর্যটন স্থান
        </h1>
        <p className="text-sm sm:text-base text-gray-600 max-w-2xl">
          পাহাড়, বন, নদী, ঐতিহাসিক প্রাচীন নিদর্শন ও বিনোদন কেন্দ্রের পূর্ণাঙ্গ তালিকা।
        </p>
      </div>

      {/* Search & Control Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="স্থানের নাম, বিবরণ বা উপজেলা লিখে খুঁজুন..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-sm outline-none"
            />
          </div>

          {/* Upazila Select */}
          <div className="w-full sm:w-52">
            <select
              value={selectedUpazila}
              onChange={(e) => setSelectedUpazila(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl border border-gray-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-sm bg-white outline-none cursor-pointer"
            >
              <option value="all">সকল উপজেলা (৫টি)</option>
              {UPAZILAS.map((up) => (
                <option key={up.id} value={up.id}>
                  {up.nameBn} ({up.nameEn})
                </option>
              ))}
            </select>
          </div>

          {/* Category Select */}
          <div className="w-full sm:w-56">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl border border-gray-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-sm bg-white outline-none cursor-pointer"
            >
              <option value="all">সকল ক্যাটাগরি</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nameBn}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Select */}
          <div className="w-full sm:w-48">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full py-2.5 px-3 rounded-xl border border-gray-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-sm bg-white outline-none cursor-pointer"
            >
              <option value="featured">নির্বাচিত স্থান আগে</option>
              <option value="alphabetical">বর্ণানুক্রমিক (ক-হ)</option>
              <option value="newest">নতুন সংযোজিত আগে</option>
            </select>
          </div>
        </div>

        {/* View toggle and active filters summary */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-gray-500 font-medium">
              মোট <strong>{filteredDestinations.length}</strong>টি স্থান পাওয়া গেছে
            </span>

            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition cursor-pointer font-medium"
              >
                <RotateCcw className="w-3 h-3" /> ফিল্টার মুছুন
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-gray-400">ভিউ:</span>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg border transition ${
                viewMode === 'grid'
                  ? 'bg-emerald-50 border-emerald-300 text-[#143E27]'
                  : 'border-gray-200 text-gray-400 hover:text-gray-700'
              }`}
              title="গ্রিড ভিউ"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg border transition ${
                viewMode === 'list'
                  ? 'bg-emerald-50 border-emerald-300 text-[#143E27]'
                  : 'border-gray-200 text-gray-400 hover:text-gray-700'
              }`}
              title="লিস্ট ভিউ"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Destinations Results */}
      {filteredDestinations.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDestinations.map((dest) => (
              <DestinationCard
                key={dest.id}
                destination={dest}
                onSelect={onSelectDestination}
                categoryNameMap={categoryNameMap}
                viewMode="grid"
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDestinations.map((dest) => (
              <DestinationCard
                key={dest.id}
                destination={dest}
                onSelect={onSelectDestination}
                categoryNameMap={categoryNameMap}
                viewMode="list"
              />
            ))}
          </div>
        )
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center max-w-lg mx-auto space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto">
            <Info className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">কোনো ফলাফল পাওয়া যায়নি</h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            আপনার অনুসন্ধান বা ফিল্টারের সাথে মিলে এমন কোনো পর্যটন স্থান শেরপুর ডিরেক্টরিতে পাওয়া যায়নি। অনুগ্রহ করে ফিল্টার পরিবর্তন করুন।
          </p>
          <button
            onClick={handleClearFilters}
            className="px-5 py-2.5 rounded-xl bg-[#143E27] text-white font-medium text-sm hover:bg-[#0D2618] transition cursor-pointer"
          >
            সকল স্থান প্রদর্শন করুন
          </button>
        </div>
      )}
    </div>
  );
};
