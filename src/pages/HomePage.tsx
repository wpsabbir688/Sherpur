import React, { useState } from 'react';
import {
  Search,
  MapPin,
  Sparkles,
  ArrowRight,
  Compass,
  Mountain,
  Trees,
  Waves,
  Landmark,
  ShieldCheck,
  Calendar,
  Camera,
  ChevronRight,
  Info,
} from 'lucide-react';
import { Destination, Category } from '../types';
import { UPAZILAS } from '../data/initialData';
import { DestinationCard } from '../components/destinations/DestinationCard';

interface HomePageProps {
  destinations: Destination[];
  categories: Category[];
  onSelectDestination: (slug: string) => void;
  onNavigate: (view: string, param?: string) => void;
  onSearch: (query: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  destinations,
  categories,
  onSelectDestination,
  onNavigate,
  onSearch,
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [selectedUpazila, setSelectedUpazila] = useState<string>('all');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearch(searchInput.trim());
      onNavigate('places');
    }
  };

  const publishedDestinations = destinations.filter((d) => d.status === 'published');
  const featuredDestinations = publishedDestinations.filter((d) => d.isFeatured);
  
  const filteredByUpazila = selectedUpazila === 'all'
    ? publishedDestinations
    : publishedDestinations.filter((d) => d.upazilaId === selectedUpazila);

  const categoryNameMap = categories.reduce((acc, cat) => {
    acc[cat.id] = cat.nameBn;
    return acc;
  }, {} as Record<string, string>);

  const getUpazilaCount = (id: string) => {
    return publishedDestinations.filter((d) => d.upazilaId === id).length;
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Scenic Hero Section */}
      <section className="relative min-h-[580px] flex items-center justify-center bg-[#0F291B] text-white overflow-hidden py-16 px-4 sm:px-6">
        {/* Background photo with subtle tint & vignette */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=1920&q=85"
            alt="শেরপুরের সবুজ গারো পাহাড় ও বনভূমি"
            className="w-full h-full object-cover opacity-35 scale-105 animate-in fade-in duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B2115]/80 via-[#0B2115]/70 to-[#FBFBFA]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-4 sm:space-y-6 pt-2 sm:pt-4">
          <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs sm:text-sm font-medium backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300" />
            <span>গারো পাহাড়ের পাদদেশে প্রকৃতির অপরূপ লীলাভূমি</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight text-white drop-shadow-sm">
            “চলো, শেরপুর ঘুরি”
          </h1>

          <p className="text-sm sm:text-lg md:text-xl text-emerald-100/90 max-w-2xl mx-auto font-normal leading-relaxed px-2">
            শেরপুরের পাহাড়, বন, নদী ও লুকিয়ে থাকা সৌন্দর্য আবিষ্কার করুন। যাচাইকৃত পর্যটন তথ্য ও নিখুঁত ভ্রমণ গাইড।
          </p>

          {/* Prominent Search Field */}
          <form
            onSubmit={handleSearchSubmit}
            className="max-w-2xl mx-auto bg-white/95 backdrop-blur-md p-1.5 sm:p-2 rounded-2xl shadow-2xl flex flex-col sm:flex-row items-center gap-2 border border-white/40"
          >
            <div className="flex-1 flex items-center gap-2 px-3 w-full">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-700 shrink-0" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="মধুটিলা, গজনী, রাজার পাহাড়..."
                className="w-full py-2 bg-transparent text-gray-800 placeholder-gray-400 text-xs sm:text-base outline-none focus:ring-0"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2.5 sm:py-3 bg-[#1E5638] hover:bg-[#143E27] text-white font-semibold text-xs sm:text-sm rounded-xl transition shadow-md flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <span>স্থান খুঁজুন</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 pt-1">
            <button
              onClick={() => onNavigate('places')}
              className="w-full xs:w-auto px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-emerald-600/90 hover:bg-emerald-600 text-white font-medium text-xs sm:text-sm transition backdrop-blur-md flex items-center justify-center gap-2"
            >
              <Compass className="w-4 h-4" />
              <span>পর্যটন স্থান খুঁজুন</span>
            </button>
            <a
              href="#featured-destinations"
              className="w-full xs:w-auto px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs sm:text-sm transition backdrop-blur-md border border-white/20 flex items-center justify-center"
            >
              জনপ্রিয় জায়গাগুলো দেখুন
            </a>
          </div>

          {/* Real counts only (No fake numbers) */}
          <div className="pt-4 sm:pt-6 grid grid-cols-3 gap-1.5 sm:gap-2 max-w-lg mx-auto text-emerald-900 bg-white/95 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 border border-emerald-200/50 shadow-md">
            <div className="text-center px-1">
              <div className="text-xl sm:text-2xl font-bold text-[#143E27]">{publishedDestinations.length}টি</div>
              <div className="text-[10px] sm:text-xs text-gray-600 font-medium leading-tight">যাচাইকৃত স্থান</div>
            </div>
            <div className="text-center border-x border-gray-200 px-1">
              <div className="text-xl sm:text-2xl font-bold text-[#143E27]">৫টি</div>
              <div className="text-[10px] sm:text-xs text-gray-600 font-medium leading-tight">উপজেলা</div>
            </div>
            <div className="text-center px-1">
              <div className="text-xl sm:text-2xl font-bold text-[#143E27]">{categories.length}টি</div>
              <div className="text-[10px] sm:text-xs text-gray-600 font-medium leading-tight">ক্যাটাগরি</div>
            </div>
          </div>
        </div>
      </section>

      {/* Upazila Quick Explorer */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              ভৌগোলিক বিন্যাস
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#143E27] mt-1">
              উপজেলা অনুযায়ী স্থানসমূহ
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              শেরপুরের ৫টি উপজেলার দর্শনীয় স্থান এক নজরে বেছে নিন
            </p>
          </div>
          <button
            onClick={() => onNavigate('upazilas')}
            className="text-sm font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 group"
          >
            <span>সকল উপজেলার বিস্তারিত</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Upazila Pill Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setSelectedUpazila('all')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition cursor-pointer ${
              selectedUpazila === 'all'
                ? 'bg-[#143E27] text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            সকল উপজেলা ({publishedDestinations.length})
          </button>
          {UPAZILAS.map((up) => (
            <button
              key={up.id}
              onClick={() => setSelectedUpazila(up.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition flex items-center gap-1.5 cursor-pointer ${
                selectedUpazila === up.id
                  ? 'bg-[#143E27] text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span>{up.nameBn}</span>
              <span className={`text-xs px-1.5 py-0.2 rounded-full ${
                selectedUpazila === up.id ? 'bg-emerald-800 text-white' : 'bg-gray-100 text-gray-600'
              }`}>
                {getUpazilaCount(up.id)}
              </span>
            </button>
          ))}
        </div>

        {/* Cards for Upazila Filter */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredByUpazila.slice(0, 6).map((dest) => (
            <DestinationCard
              key={dest.id}
              destination={dest}
              onSelect={onSelectDestination}
              categoryNameMap={categoryNameMap}
            />
          ))}
        </div>

        {filteredByUpazila.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 p-8">
            <Info className="w-10 h-10 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 font-medium">এই উপজেলায় এখনও কোনো স্থান তালিকাভুক্ত হয়নি।</p>
          </div>
        )}
      </section>

      {/* Featured Destinations */}
      <section id="featured-destinations" className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> নির্বাচিত পর্যটন স্থান
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#143E27] mt-1">
              শেরপুরের শীর্ষ আকর্ষণসমূহ
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              পর্যটকদের সবচেয়ে বেশি পছন্দের ও বহুল পরিদর্শিত নৈসর্গিক স্থান
            </p>
          </div>
          <button
            onClick={() => onNavigate('places')}
            className="text-sm font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 group"
          >
            <span>সকল স্থান দেখুন ({publishedDestinations.length})</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredDestinations.map((dest) => (
            <DestinationCard
              key={dest.id}
              destination={dest}
              onSelect={onSelectDestination}
              categoryNameMap={categoryNameMap}
            />
          ))}
        </div>
      </section>

      {/* Browse by Category */}
      <section className="bg-emerald-950/5 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              ক্যাটাগরি ভিত্তিক ব্রাউজ
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#143E27] mt-1">
              আপনার পছন্দের পরিবেশে ভ্রমণ করুন
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              পাহাড়ের চূড়া, বনাঞ্চলের নির্জনতা কিংবা প্রাচীন ঐতিহ্যের সন্ধানে
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => {
              const count = publishedDestinations.filter(d => d.categoryIds?.includes(cat.id)).length;
              return (
                <div
                  key={cat.id}
                  onClick={() => onNavigate('categories', cat.id)}
                  className="bg-white p-5 rounded-2xl border border-gray-100 hover:border-emerald-600/40 shadow-xs hover:shadow-md transition-all cursor-pointer group flex items-start gap-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#143E27] flex items-center justify-center shrink-0 group-hover:bg-[#143E27] group-hover:text-white transition-colors">
                    {cat.slug === 'hills-forests' && <Mountain className="w-6 h-6" />}
                    {cat.slug === 'eco-parks' && <Trees className="w-6 h-6" />}
                    {cat.slug === 'rivers-wetlands' && <Waves className="w-6 h-6" />}
                    {cat.slug === 'historical-heritage' && <Landmark className="w-6 h-6" />}
                    {cat.slug !== 'hills-forests' && cat.slug !== 'eco-parks' && cat.slug !== 'rivers-wetlands' && cat.slug !== 'historical-heritage' && (
                      <Compass className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 group-hover:text-[#143E27] transition-colors flex items-center gap-2">
                      <span>{cat.nameBn}</span>
                      <span className="text-xs font-normal text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
                        {count}টি স্থান
                      </span>
                    </h3>
                    <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">
                      {cat.descriptionBn}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Travel Tips & Responsible Tourism Guide */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-br from-[#123923] to-[#0A2215] text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-xl">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-amber-300" /> দায়িত্বশীল পর্যটন ও সচেতনতা
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight">
                শেরপুর ভ্রমণের কিছু জরুরি পরামর্শ
              </h2>
              <p className="text-sm text-emerald-100/80 leading-relaxed">
                গারো পাহাড় ও সীমান্তবর্তী দর্শনীয় স্থানগুলো অত্যন্ত পরিবেশসংবেদনশীল। প্রাকৃতিক ভারসাম্য ও স্থানীয় সংস্কৃতিকে শ্রদ্ধা জানিয়ে ভ্রমণ করুন:
              </p>
              <ul className="space-y-2.5 text-xs sm:text-sm text-emerald-100/90">
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span><strong>সীমান্ত সতর্কতা:</strong> জিরো পয়েন্ট ও আন্তর্জাতিক সীমানা পিলার অতিক্রম করবেন না। বিজিবি নির্দেশনা মেনে চলুন।</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span><strong>পরিবেশ সুরক্ষা:</strong> পাহাড় বা শালবনে প্লাস্টিক, পলিথিন ও পানির বোতল ফেলা থেকে বিরত থাকুন।</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span><strong>আদিবাসী সংস্কৃতি:</strong> স্থানীয় গারো ও কোচ জাতিগোষ্ঠীর মানুষের প্রতি শ্রদ্ধাশীল থাকুন।</span>
                </li>
              </ul>

              <div className="pt-2">
                <button
                  onClick={() => onNavigate('guides')}
                  className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-sm transition shadow-md flex items-center gap-2"
                >
                  <span>সম্পূর্ণ ভ্রমণ নির্দেশিকা পড়ুন</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl overflow-hidden h-44 shadow-lg border border-white/10">
                <img
                  src="https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=600&q=80"
                  alt="শেরপুরের শালবন ট্রেইল"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="rounded-2xl overflow-hidden h-44 shadow-lg border border-white/10 mt-6">
                <img
                  src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&q=80"
                  alt="শেরপুর পাহাড় ও মেঘালয় ভিউ"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Scenic Photo Gallery */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-8">
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center justify-center gap-1">
            <Camera className="w-3.5 h-3.5" /> ফটো গ্যালারি
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#143E27] mt-1">
            এক ঝলকে শেরপুরের নিসর্গ
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            পাহাড়, জলপ্রপাত, হ্রদ ও সবুজের অপরূপ দৃশ্যমালা
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="group relative h-48 sm:h-64 rounded-2xl overflow-hidden bg-gray-100">
            <img
              src="https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=600&q=80"
              alt="মধুটিলা শালবন"
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-3">
              <span className="text-white text-xs font-medium">মধুটিলা বন ও লেক</span>
            </div>
          </div>
          <div className="group relative h-48 sm:h-64 rounded-2xl overflow-hidden bg-gray-100">
            <img
              src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80"
              alt="গজনী অবকাশ কেন্দ্র পাহাড়"
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-3">
              <span className="text-white text-xs font-medium">গজনীর গারো পাহাড় ভিউ</span>
            </div>
          </div>
          <div className="group relative h-48 sm:h-64 rounded-2xl overflow-hidden bg-gray-100">
            <img
              src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80"
              alt="রাজার পাহাড় শ্রীবরদী"
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-3">
              <span className="text-white text-xs font-medium">রাজার পাহাড়ের উঁচু টিলা</span>
            </div>
          </div>
          <div className="group relative h-48 sm:h-64 rounded-2xl overflow-hidden bg-gray-100">
            <img
              src="https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=600&q=80"
              alt="ঐতিহাসিক স্থাপত্য"
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-3">
              <span className="text-white text-xs font-medium">ঐতিহাসিক স্থাপত্য</span>
            </div>
          </div>
        </div>
      </section>

      {/* Direct Contact CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl border border-emerald-900/10 p-8 sm:p-10 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-[#143E27]">
              নতুন কোনো স্থান সংযোজন কিংবা তথ্য সংশোধন করতে চান?
            </h3>
            <p className="text-sm text-gray-600 max-w-xl">
              শেরপুরের যেকোনো নতুন পর্যটন সম্ভাবনা কিংবা বর্তমান তথ্য হালনাগাদের জন্য আমাদের সাথে সরাসরি যোগাযোগ করতে পারেন।
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <a
              href="tel:+8801944460344"
              className="px-5 py-2.5 rounded-xl bg-[#143E27] hover:bg-[#0D2618] text-white font-semibold text-sm transition shadow-sm flex items-center justify-center gap-2 font-sans"
            >
              <span>কল করুন: +8801944460344</span>
            </a>
            <button
              onClick={() => onNavigate('contact')}
              className="px-5 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-50 text-gray-800 font-semibold text-sm transition text-center cursor-pointer"
            >
              বার্তা পাঠান
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
