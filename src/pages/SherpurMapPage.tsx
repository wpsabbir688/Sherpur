import React, { useState, useMemo } from 'react';
import { Destination, Category } from '../types';
import { UPAZILAS } from '../data/initialData';
import { SherpurGoogleMap } from '../components/map/SherpurGoogleMap';
import {
  MapPin,
  Search,
  Compass,
  Navigation,
  Mountain,
  Trees,
  Landmark,
  Waves,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Route,
  Info,
  Calendar,
  Layers,
  Filter,
} from 'lucide-react';

interface SherpurMapPageProps {
  destinations: Destination[];
  categories: Category[];
  onNavigate: (view: string, param?: string) => void;
}

// Approximate driving distances & routes from Sherpur Sadar Central
const POPULAR_ROUTES = [
  {
    titleBn: 'শেরপুর সদর → গজনী অবকাশ কেন্দ্র',
    upazilaBn: 'ঝিনাইগাতী',
    distanceBn: 'প্রায় ৩০ কিমি (৪০-৫০ মিনিট)',
    routeGuideBn: 'শেরপুর জেলা শহর থেকে খোয়ারপাড় মোড় হয়ে সরাসরি ঝিনাইগাতী বাজার। সেখান থেকে সোজা উত্তরে কাংশা ইউনিয়ন দিয়ে গজনী অবকাশ। সড়ক পাকা ও মনোরম শালবনের মধ্য দিয়ে প্রসারিত।',
    destinationId: 'gajni-abakash-kendra',
  },
  {
    titleBn: 'শেরপুর সদর → মধুটিলা ইকো পার্ক',
    upazilaBn: 'নালিতাবাড়ী',
    distanceBn: 'প্রায় ৩৫ কিমি (৪৫-৫৫ মিনিট)',
    routeGuideBn: 'শেরপুর শহর থেকে নালিতাবাড়ী হয়ে ভোগাই ব্রিজ পার হয়ে সোজা উত্তরে সমশ্চূড়া বাজার। এরপর মধুটিলা ইকো পার্কের প্রধান ফটক। বাস, সিএনজি বা নিজস্ব প্রাইভেট কারে অনায়াসে যাওয়া যায়।',
    destinationId: 'madhutila-eco-park',
  },
  {
    titleBn: 'শেরপুর সদর → নাকুগাঁও স্থলবন্দর ও সীমান্ত',
    upazilaBn: 'নালিতাবাড়ী',
    distanceBn: 'প্রায় ৩২ কিমি (৪০-৪৫ মিনিট)',
    routeGuideBn: 'নালিতাবাড়ী পৌরসভা থেকে সোজা উত্তরে পাকা সড়ক ধরে ভারত-বাংলাদেশ সীমান্ত সংলগ্ন নাকুগাঁও বন্দর ও বর্ডার রোড। মেঘালয়ের পাহাড় পরিষ্কার দেখা যায়।',
    destinationId: 'nakugaon-land-port',
  },
  {
    titleBn: 'শেরপুর সদর → রাজার পাহাড় ও বালিজুড়ি রেঞ্জ',
    upazilaBn: 'শ্রীবরদী',
    distanceBn: 'প্রায় ২৮ কিমি (৩৫-৪৫ মিনিট)',
    routeGuideBn: 'শেরপুর পৌর শহর থেকে শ্রীবরদী উপজেলা সদর হয়ে বালিজুড়ি পাহাড়ি ফরেস্ট রেঞ্জের দিকে মনোরম গ্রামীণ ও পাহাড়ি পথ।',
    destinationId: 'rajar-pahar-sreebardi',
  },
  {
    titleBn: 'শেরপুর সদর → পানিহাটা-তারানি পাহাড় ও নদী',
    upazilaBn: 'নালিতাবাড়ী',
    distanceBn: 'প্রায় ৩৭ কিমি (৫০-৬০ মিনিট)',
    routeGuideBn: 'নালিতাবাড়ী থেকে রামচন্দ্রকুড়া হয়ে পানিহাটা খ্রিস্টান মিশনারি সংলগ্ন পাহাড়ি উপত্যকা। স্বচ্ছ পানির পাহাড়ি ছড়া ও সবুজ টিলার সমাহার।',
    destinationId: 'panihata-tarani-pahar',
  },
];

export const SherpurMapPage: React.FC<SherpurMapPageProps> = ({
  destinations,
  categories,
  onNavigate,
}) => {
  const [selectedUpazila, setSelectedUpazila] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeDestinationId, setActiveDestinationId] = useState<string | null>(
    destinations[0]?.id || null
  );

  const publishedDestinations = useMemo(
    () => destinations.filter((d) => d.status === 'published'),
    [destinations]
  );

  const filteredDestinations = useMemo(() => {
    return publishedDestinations.filter((dest) => {
      const matchUpazila = selectedUpazila === 'all' || dest.upazilaId === selectedUpazila;
      const matchCategory =
        selectedCategory === 'all' ||
        (dest.categoryIds && dest.categoryIds.includes(selectedCategory));
      const matchSearch =
        !searchQuery.trim() ||
        dest.titleBn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (dest.titleEn && dest.titleEn.toLowerCase().includes(searchQuery.toLowerCase())) ||
        dest.locationName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchUpazila && matchCategory && matchSearch;
    });
  }, [publishedDestinations, selectedUpazila, selectedCategory, searchQuery]);

  const activeDestination = useMemo(() => {
    return (
      destinations.find((d) => d.id === activeDestinationId) ||
      filteredDestinations[0] ||
      destinations[0]
    );
  }, [destinations, activeDestinationId, filteredDestinations]);

  const getUpazilaName = (id: string) => {
    const u = UPAZILAS.find((item) => item.id === id);
    return u ? u.nameBn : 'শেরপুর';
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Page Header */}
      <section className="bg-gradient-to-b from-emerald-950/10 via-emerald-950/5 to-transparent pt-8 sm:pt-12 pb-6 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-semibold">
              <Compass className="w-3.5 h-3.5 text-emerald-700" />
              <span>ইন্টারেক্টিভ গুগল ম্যাপস ও ট্রাভেল এক্সপ্লোরার</span>
            </div>
            <div className="text-xs text-gray-500 font-medium">
              সর্বমোট চিহ্নিত স্থান: <strong className="text-emerald-800">{publishedDestinations.length}টি</strong> | ৫টি উপজেলা
            </div>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#143E27] tracking-tight">
            শেরপুর জেলা পর্যটন মানচিত্র
          </h1>
          <p className="text-sm sm:text-base text-gray-600 max-w-3xl leading-relaxed">
            গারো পাহাড়, সুবিশাল শালবন, ঐতিহাসিক প্রত্নতাত্ত্বিক নিদর্শন এবং মেঘালয় সীমান্তবর্তী সকল দর্শনীয় স্থানের সমন্বিত ডিজিটাল ম্যাপ। যেকোনো স্থানে ক্লিক করে সরাসরি পথনির্দেশ ও তথ্য জানুন।
          </p>

          {/* Search & Filter Bar */}
          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-gray-200 shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row gap-3 items-stretch">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="স্থান বা এলাকার নাম লিখুন (যেমন: গজনী, মধুটিলা, রাজার পাহাড়, মসজিদ)..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:border-emerald-600 focus:bg-white transition"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs cursor-pointer"
                  >
                    মুছুন
                  </button>
                )}
              </div>

              {/* Upazila Quick Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                <button
                  type="button"
                  onClick={() => setSelectedUpazila('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    selectedUpazila === 'all'
                      ? 'bg-[#143E27] text-white shadow-xs'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  সব উপজেলা
                </button>
                {UPAZILAS.map((up) => (
                  <button
                    key={up.id}
                    type="button"
                    onClick={() => setSelectedUpazila(up.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                      selectedUpazila === up.id
                        ? 'bg-[#143E27] text-white shadow-xs'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {up.nameBn}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Map + Directory Split View */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Places Directory List (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between text-xs font-bold text-gray-700 px-1">
              <span>পাওয়া গেছে: {filteredDestinations.length}টি স্থান</span>
              <span className="text-gray-400">ক্লিক করে ম্যাপে ফোকাস করুন</span>
            </div>

            <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
              {filteredDestinations.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center space-y-2">
                  <MapPin className="w-8 h-8 text-gray-300 mx-auto" />
                  <p className="text-sm font-semibold text-gray-700">কোনো স্থান খুঁজে পাওয়া যায়নি</p>
                  <p className="text-xs text-gray-500">অন্য কোনো নাম বা ফিল্টার নির্বাচন করুন।</p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedUpazila('all');
                      setSelectedCategory('all');
                    }}
                    className="text-xs font-bold text-emerald-800 hover:underline pt-2 cursor-pointer"
                  >
                    সকল ফিল্টার রিসেট করুন
                  </button>
                </div>
              ) : (
                filteredDestinations.map((dest) => {
                  const isActive = activeDestinationId === dest.id;
                  return (
                    <div
                      key={dest.id}
                      onClick={() => setActiveDestinationId(dest.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex gap-3.5 items-center ${
                        isActive
                          ? 'bg-emerald-50/90 border-emerald-600/50 shadow-sm ring-1 ring-emerald-600/30'
                          : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-xs'
                      }`}
                    >
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0 relative">
                        <img
                          src={
                            dest.coverImage ||
                            'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=300&q=80'
                          }
                          alt={dest.titleBn}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 font-semibold mb-0.5">
                          <span className="bg-emerald-100/80 px-2 py-0.2 rounded text-[10px]">
                            {getUpazilaName(dest.upazilaId)}
                          </span>
                          {dest.isFeatured && (
                            <span className="bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded text-[10px]">
                              জনপ্রিয়
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-sm text-gray-900 truncate">{dest.titleBn}</h3>
                        <p className="text-xs text-gray-500 truncate mt-0.5">{dest.locationName}</p>
                      </div>

                      <div className="shrink-0 flex flex-col gap-1 items-end">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigate('places', dest.slug);
                          }}
                          className="p-2 rounded-lg bg-gray-100 hover:bg-[#143E27] hover:text-white text-gray-600 transition cursor-pointer"
                          title="বিস্তারিত পেজে যান"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Google Maps Container (7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            <SherpurGoogleMap
              destinations={filteredDestinations}
              selectedDestinationId={activeDestinationId}
              onSelectDestination={(dest) => setActiveDestinationId(dest.id)}
              onNavigateToDetail={(slug) => onNavigate('places', slug)}
              height="600px"
              zoom={10}
            />

            {/* Active Destination Quick Info Card */}
            {activeDestination && (
              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-gray-600">
                <div className="space-y-0.5">
                  <div className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>{activeDestination.titleBn}</span>
                    <span className="text-xs font-normal text-gray-500">
                      ({getUpazilaName(activeDestination.upazilaId)})
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate max-w-lg">
                    {activeDestination.summaryBn}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                  <button
                    onClick={() => onNavigate('places', activeDestination.slug)}
                    className="flex-1 sm:flex-none px-3.5 py-2 bg-[#143E27] hover:bg-[#0D2618] text-white font-bold rounded-xl transition cursor-pointer"
                  >
                    সম্পূর্ণ বিবরণ
                  </button>
                  <a
                    href={
                      activeDestination.googleMapsUrl ||
                      `https://www.google.com/maps/dir/?api=1&destination=${activeDestination.latitude},${activeDestination.longitude}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none px-3 py-2 bg-blue-50 text-blue-800 hover:bg-blue-100 font-semibold rounded-xl flex items-center justify-center gap-1 border border-blue-200 transition"
                  >
                    <span>গুগল ম্যাপে ডিরেকশন</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Verified Travel Routes from Sherpur Sadar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
        <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 uppercase tracking-wider">
              <Route className="w-3.5 h-3.5 text-emerald-700" /> শেরপুর জেলা সড়ক ও রুট নির্দেশিকা
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-[#143E27]">
              শেরপুর জেলা শহর থেকে প্রধান পর্যটন কেন্দ্রগুলোর রুট ও দূরত্ব
            </h2>
            <p className="text-xs sm:text-sm text-gray-600">
              শেরপুর সদর থেকে বিভিন্ন পাহাড়ি ও প্রত্নতাত্ত্বিক দর্শনীয় স্থানে যাওয়ার সুনির্দিষ্ট পথনির্দেশনা
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {POPULAR_ROUTES.map((route, idx) => (
              <div
                key={idx}
                className="bg-emerald-950/3 p-4 rounded-2xl border border-emerald-900/10 hover:border-emerald-600/30 transition flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-800">
                    <span className="bg-emerald-100 px-2 py-0.5 rounded">{route.upazilaBn}</span>
                    <span className="text-gray-500">{route.distanceBn}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm">{route.titleBn}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{route.routeGuideBn}</p>
                </div>

                <div className="pt-2 border-t border-emerald-900/10 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setActiveDestinationId(route.destinationId);
                      window.scrollTo({ top: 300, behavior: 'smooth' });
                    }}
                    className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer"
                  >
                    <span>ম্যাপে দেখুন</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <a
                    href={`https://www.google.com/maps/dir/?api=1&origin=Sherpur+Sadar&destination=${encodeURIComponent(
                      route.titleBn.split('→')[1]?.trim() || 'Sherpur'
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-medium text-blue-700 hover:underline flex items-center gap-1"
                  >
                    <span>গুগল ম্যাপস নেভিগেশন</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
