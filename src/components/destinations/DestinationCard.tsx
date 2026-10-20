import React from 'react';
import { MapPin, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { Destination } from '../../types';
import { UPAZILAS } from '../../data/initialData';
import { getDestinationAuthor } from '../../utils/authorHelper';
import { handleImageError } from '../../utils/imageFallback';

interface DestinationCardProps {
  destination: Destination;
  onSelect: (slug: string) => void;
  categoryNameMap?: Record<string, string>;
  viewMode?: 'grid' | 'list';
}

export const DestinationCard: React.FC<DestinationCardProps> = ({
  destination,
  onSelect,
  categoryNameMap = {},
  viewMode = 'grid',
}) => {
  const upazila = UPAZILAS.find((u) => u.id === destination.upazilaId);
  const author = getDestinationAuthor(destination);

  if (viewMode === 'list') {
    return (
      <div
        onClick={() => onSelect(destination.slug)}
        className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden cursor-pointer flex flex-col md:flex-row gap-5 p-4 hover:border-emerald-600/30"
      >
        <div className="relative md:w-64 h-48 rounded-xl overflow-hidden shrink-0 bg-gray-100">
          <img
            src={destination.coverImage || 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=600&q=80'}
            alt={destination.coverImageAlt || destination.titleBn}
            loading="lazy"
            onError={(e) => handleImageError(e, 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80')}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {destination.isFeatured && (
            <span className="absolute top-2.5 left-2.5 bg-amber-500/95 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
              <Sparkles className="w-3 h-3" /> নির্বাচিত স্থান
            </span>
          )}
        </div>

        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-md bg-emerald-50 text-[#143E27] border border-emerald-200">
                <MapPin className="w-3 h-3 text-emerald-600" />
                {upazila ? upazila.nameBn : destination.upazilaId}
              </span>
              {destination.categoryIds && destination.categoryIds[0] && (
                <span className="text-xs px-2.5 py-0.5 rounded-md bg-gray-100 text-gray-700">
                  {categoryNameMap[destination.categoryIds[0]] || 'দর্শনীয় স্থান'}
                </span>
              )}
            </div>

            <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#143E27] transition-colors flex items-center gap-2">
              <span>{destination.titleBn}</span>
              {destination.titleEn && (
                <span className="text-xs font-normal text-gray-400 hidden sm:inline">
                  ({destination.titleEn})
                </span>
              )}
            </h3>

            <p className="text-sm text-gray-600 mt-2 line-clamp-2 leading-relaxed">
              {destination.summaryBn}
            </p>
          </div>

          <div className="pt-4 mt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-emerald-700 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> যাচাইকৃত তথ্য
              </span>
              <span className="text-gray-300">•</span>
              <div className="flex items-center gap-1.5 text-gray-600">
                <img
                  src={author.avatarUrl}
                  alt=""
                  className="w-4 h-4 rounded-full object-cover shrink-0 border border-emerald-600/40"
                />
                <span className="text-[11px] font-medium text-gray-700">{author.name}</span>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-[#143E27] font-semibold group-hover:translate-x-1 transition-transform">
              বিস্তারিত দেখুন <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Grid mode
  return (
    <div
      onClick={() => onSelect(destination.slug)}
      className="group bg-white rounded-2xl border border-gray-100 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer flex flex-col hover:-translate-y-1 hover:border-emerald-600/30"
    >
      <div className="relative h-52 w-full overflow-hidden bg-gray-100">
        <img
          src={destination.coverImage || 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=600&q=80'}
          alt={destination.coverImageAlt || destination.titleBn}
          loading="lazy"
          onError={(e) => handleImageError(e, 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80')}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

        {destination.isFeatured && (
          <span className="absolute top-3 left-3 bg-amber-500/95 text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
            <Sparkles className="w-3 h-3" /> নির্বাচিত স্থান
          </span>
        )}

        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/40 backdrop-blur-md border border-white/20 font-medium">
            <MapPin className="w-3 h-3 text-emerald-300" />
            {upazila ? upazila.nameBn : destination.upazilaId}
          </span>
          {destination.categoryIds && destination.categoryIds[0] && (
            <span className="px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-md text-[11px]">
              {categoryNameMap[destination.categoryIds[0]] || 'দর্শনীয় স্থান'}
            </span>
          )}
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#143E27] transition-colors">
            {destination.titleBn}
          </h3>
          {destination.titleEn && (
            <p className="text-xs text-gray-400 font-sans mt-0.5">{destination.titleEn}</p>
          )}

          <p className="text-sm text-gray-600 mt-2.5 line-clamp-2 leading-relaxed">
            {destination.summaryBn}
          </p>
        </div>

        <div className="pt-3.5 mt-3.5 border-t border-gray-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-gray-600 text-[11px] truncate max-w-[62%]">
            <img
              src={author.avatarUrl}
              alt=""
              className="w-4 h-4 rounded-full object-cover shrink-0 border border-emerald-600/40"
            />
            <span className="truncate font-medium">{author.name}</span>
          </div>
          <span className="inline-flex items-center gap-1 font-semibold text-[#143E27] group-hover:translate-x-1 transition-transform shrink-0">
            বিস্তারিত <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
};
