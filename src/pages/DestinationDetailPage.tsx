import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Clock,
  Ticket,
  Calendar,
  Navigation,
  ExternalLink,
  ShieldAlert,
  Accessibility,
  Share2,
  Check,
  ChevronLeft,
  Sparkles,
  ArrowRight,
  Info,
  Compass,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Users,
} from 'lucide-react';
import { Destination, Category } from '../types';
import { UPAZILAS } from '../data/initialData';
import { recordAnalyticsEvent } from '../services/analyticsService';
import { getDestinationAuthor } from '../utils/authorHelper';
import { SherpurGoogleMap } from '../components/map/SherpurGoogleMap';

interface DestinationDetailPageProps {
  destination: Destination;
  allDestinations: Destination[];
  categories: Category[];
  onSelectDestination: (slug: string) => void;
  onBack: () => void;
  onNavigate?: (view: string, param?: string) => void;
}

export const DestinationDetailPage: React.FC<DestinationDetailPageProps> = ({
  destination,
  allDestinations,
  categories,
  onSelectDestination,
  onBack,
  onNavigate,
}) => {
  const [copied, setCopied] = useState(false);
  const [selectedGalleryImg, setSelectedGalleryImg] = useState<string | null>(null);

  // Track destination view
  useEffect(() => {
    if (destination?.id) {
      recordAnalyticsEvent('destination_view', {
        destinationId: destination.id,
        pagePath: `#places/${destination.slug}`,
        metadata: { titleBn: destination.titleBn, upazila: destination.upazilaId },
      });
    }
  }, [destination?.id, destination?.slug]);

  const upazila = UPAZILAS.find((u) => u.id === destination.upazilaId);
  const author = getDestinationAuthor(destination);

  const categoryNames = (destination.categoryIds || [])
    .map((catId) => categories.find((c) => c.id === catId)?.nameBn)
    .filter(Boolean);

  // Nearby destinations (same upazila, excluding self)
  const nearbyDestinations = allDestinations
    .filter((d) => d.upazilaId === destination.upazilaId && d.id !== destination.id && d.status === 'published')
    .slice(0, 3);

  const handleShare = (platform: 'copy' | 'whatsapp' | 'facebook') => {
    const url = window.location.href;
    const title = `${destination.titleBn} - শেরপুর ভ্রমণ গাইড`;

    recordAnalyticsEvent('share_click', {
      destinationId: destination.id,
      metadata: { platform, slug: destination.slug },
    });

    if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } else if (platform === 'whatsapp') {
      try {
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`${title} : ${url}`)}`, '_blank', 'noopener,noreferrer');
      } catch (e) {
        console.warn('Cannot open window:', e);
      }
    } else if (platform === 'facebook') {
      try {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank', 'noopener,noreferrer');
      } catch (e) {
        console.warn('Cannot open window:', e);
      }
    }
  };

  return (
    <article className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-gray-500 font-medium">
        <button
          onClick={onBack}
          className="hover:text-[#143E27] flex items-center gap-1 transition"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>সকল দর্শনীয় স্থান</span>
        </button>
        <span>/</span>
        <span className="text-gray-400">{upazila?.nameBn || destination.upazilaId}</span>
        <span>/</span>
        <span className="text-gray-900 font-semibold truncate max-w-[200px]">{destination.titleBn}</span>
      </nav>

      {/* Header section with titles and badges */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-[#143E27] text-xs font-bold border border-emerald-200">
            <MapPin className="w-3.5 h-3.5 text-emerald-700" />
            {upazila?.nameBn}
          </span>
          {categoryNames.map((name, idx) => (
            <span
              key={idx}
              className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium"
            >
              {name}
            </span>
          ))}
          {destination.isFeatured && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-bold shadow-xs">
              <Sparkles className="w-3.5 h-3.5" /> নির্বাচিত স্থান
            </span>
          )}
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#143E27] tracking-tight leading-tight">
              {destination.titleBn}
            </h1>
            {destination.titleEn && (
              <p className="text-base sm:text-lg text-gray-400 font-sans mt-1">
                {destination.titleEn}
              </p>
            )}
            <p className="text-sm text-gray-600 mt-2 flex items-center gap-1.5 font-medium">
              <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{destination.locationName}</span>
            </p>

            {/* Author / Publisher Byline */}
            <div className="flex items-center gap-2.5 mt-3 pt-3 border-t border-gray-100">
              <img
                src={author.avatarUrl}
                alt={author.name}
                className="w-8 h-8 rounded-full object-cover border border-emerald-600 shadow-2xs shrink-0"
              />
              <div className="text-xs">
                <span className="text-gray-500">সংকলন ও সম্পাদনা: </span>
                <strong className="text-gray-900 font-bold">{author.name}</strong>
                <span className="text-emerald-700 font-medium ml-1">({author.role})</span>
              </div>
            </div>
          </div>

          {/* Share buttons */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => handleShare('copy')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50 transition cursor-pointer"
              title="লিঙ্ক কপি করুন"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'কপি হয়েছে!' : 'শেয়ার করুন'}</span>
            </button>
            <button
              onClick={() => handleShare('whatsapp')}
              className="px-2.5 py-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition border border-emerald-200 cursor-pointer text-xs font-bold"
              title="হোয়াটসঅ্যাপে শেয়ার করুন"
            >
              WhatsApp
            </button>
            <button
              onClick={() => handleShare('facebook')}
              className="px-2.5 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition border border-blue-200 cursor-pointer text-xs font-bold"
              title="ফেসবুকে শেয়ার করুন"
            >
              Facebook
            </button>
          </div>
        </div>
      </div>

      {/* Large Scenic Hero Cover Image */}
      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-md bg-gray-100 h-64 sm:h-80 md:h-[450px]">
        <img
          src={destination.coverImage || 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=1400&q=80'}
          alt={destination.coverImageAlt || destination.titleBn}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 text-white text-xs flex justify-between items-end gap-2">
          <span className="bg-black/50 backdrop-blur-md px-2.5 sm:px-3 py-1 rounded-lg truncate text-[11px] sm:text-xs">
            {destination.coverImageAlt || destination.titleBn}
          </span>
          <span className="bg-black/50 backdrop-blur-md px-2.5 sm:px-3 py-1 rounded-lg shrink-0 text-[11px] sm:text-xs">
            শেরপুর জেলা
          </span>
        </div>
      </div>

      {/* Practical Quick Info Cards (Only real verified data) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {destination.bestSeasonBn && (
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-semibold">
              <Calendar className="w-4 h-4 text-emerald-700" />
              <span>উপযুক্ত সময়</span>
            </div>
            <p className="text-sm font-bold text-gray-900">{destination.bestSeasonBn}</p>
          </div>
        )}

        {destination.openingHours && (
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-semibold">
              <Clock className="w-4 h-4 text-emerald-700" />
              <span>পরিদর্শনের সময়সূচি</span>
            </div>
            <p className="text-sm font-bold text-gray-900">{destination.openingHours}</p>
          </div>
        )}

        {destination.entryFee && (
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-semibold">
              <Ticket className="w-4 h-4 text-emerald-700" />
              <span>প্রবেশ ফি</span>
            </div>
            <p className="text-sm font-bold text-gray-900">{destination.entryFee}</p>
          </div>
        )}

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-semibold">
            <Navigation className="w-4 h-4 text-emerald-700" />
            <span>অবস্থান ও ডিরেকশন</span>
          </div>
          {destination.googleMapsUrl ? (
            <a
              href={destination.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                recordAnalyticsEvent('map_link_click', {
                  destinationId: destination.id,
                  metadata: { titleBn: destination.titleBn },
                })
              }
              className="text-sm font-bold text-[#1E5638] hover:underline flex items-center gap-1"
            >
              <span>গুগল ম্যাপসে দেখুন</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          ) : (
            <p className="text-sm font-bold text-gray-900">{upazila?.nameBn}</p>
          )}
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left 2 Cols: Description, highlights, how to reach */}
        <div className="lg:col-span-2 space-y-8">
          {/* Summary Box */}
          <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-5 text-gray-800 text-base leading-relaxed font-medium">
            {destination.summaryBn}
          </div>

          {/* Full Detailed Description */}
          {destination.descriptionBn && (
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-[#143E27] flex items-center gap-2">
                <Compass className="w-5 h-5 text-emerald-700" />
                <span>স্থানটির বিস্তারিত বর্ণনা ও আকর্ষণ</span>
              </h2>
              <div className="text-gray-700 text-base leading-relaxed whitespace-pre-line space-y-4">
                {destination.descriptionBn}
              </div>
            </section>
          )}

          {/* How to get there */}
          {destination.howToGetThereBn && (
            <section className="space-y-4 bg-white rounded-2xl border border-gray-200 p-6 shadow-2xs">
              <h2 className="text-xl font-bold text-[#143E27] flex items-center gap-2">
                <Navigation className="w-5 h-5 text-emerald-700" />
                <span>যাতায়াত ব্যবস্থা ও পথনির্দেশনা</span>
              </h2>
              <div className="text-gray-700 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                {destination.howToGetThereBn}
              </div>
            </section>
          )}

          {/* Interactive Google Map of Location */}
          {destination.latitude && destination.longitude && (
            <section className="space-y-4 bg-white rounded-2xl border border-gray-200 p-6 shadow-2xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-xl font-bold text-[#143E27] flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-emerald-700" />
                  <span>গুগল ম্যাপে সুনির্দিষ্ট অবস্থান ও রুট</span>
                </h2>
                <a
                  href={
                    destination.googleMapsUrl ||
                    `https://www.google.com/maps/dir/?api=1&destination=${destination.latitude},${destination.longitude}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200"
                >
                  <span>গুগল ম্যাপসে খুলুন</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <SherpurGoogleMap
                destinations={[
                  destination,
                  ...allDestinations
                    .filter((d) => d.id !== destination.id && typeof d.latitude === 'number')
                    .slice(0, 5),
                ]}
                selectedDestinationId={destination.id}
                onSelectDestination={(d) => {
                  if (d.id !== destination.id) {
                    onSelectDestination(d.slug);
                  }
                }}
                onNavigateToDetail={(slug) => onSelectDestination(slug)}
                height="380px"
                zoom={13}
                center={{ lat: destination.latitude, lng: destination.longitude }}
              />
              <p className="text-xs text-gray-500">
                ম্যাপের মার্কার টেনে বা জুম করে আশেপাশের রাস্তা ও পরিবেশ দেখুন। সরাসরি লাইভ জিপিএস নেভিগেশনের জন্য 'গুগল ম্যাপসে খুলুন' বাটনে চাপ দিন।
              </p>
            </section>
          )}

          {/* Travel Tips */}
          {destination.travelTipsBn && (
            <section className="space-y-4 bg-amber-50/70 rounded-2xl border border-amber-200 p-6">
              <h2 className="text-xl font-bold text-amber-950 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-600" />
                <span>ভ্রমণ পরামর্শ ও করণীয়</span>
              </h2>
              <div className="text-amber-950/90 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                {destination.travelTipsBn}
              </div>
            </section>
          )}

          {/* Additional Gallery */}
          {destination.gallery && destination.gallery.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-[#143E27]">
                ফটোগ্যালারি
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {destination.gallery.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedGalleryImg(img.url)}
                    className="group relative rounded-2xl overflow-hidden h-48 bg-gray-100 cursor-pointer shadow-2xs"
                  >
                    <img
                      src={img.url}
                      alt={img.alt || 'শেরপুরের পর্যটন দৃশ্য'}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {img.caption && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-3">
                        <span className="text-white text-xs font-medium">{img.caption}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Col: Safety notes, accessibility, verification date, nearby */}
        <div className="space-y-6">
          {/* Border Safety & Warnings */}
          {destination.safetyNotesBn && (
            <div className="bg-red-50/80 border border-red-200 rounded-2xl p-5 space-y-2.5">
              <div className="flex items-center gap-2 text-red-900 font-bold text-sm">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>সতর্কতা ও নিরাপত্তা নির্দেশিকা</span>
              </div>
              <p className="text-xs sm:text-sm text-red-950/80 leading-relaxed">
                {destination.safetyNotesBn}
              </p>
            </div>
          )}

          {/* Accessibility notes */}
          {destination.accessibilityNotesBn && (
            <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-5 space-y-2">
              <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
                <Accessibility className="w-4 h-4 text-blue-600 shrink-0" />
                <span>সুবিধাসমূহ ও প্রবেশযোগ্যতা</span>
              </div>
              <p className="text-xs sm:text-sm text-blue-950/80 leading-relaxed">
                {destination.accessibilityNotesBn}
              </p>
            </div>
          )}

          {/* Verification & Source */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3 text-xs text-gray-500 shadow-2xs">
            <div className="font-semibold text-gray-700 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-emerald-700" />
              <span>তথ্য যাচাইয়ের বিবরণ</span>
            </div>
            <div>
              <span className="text-gray-400">সর্বশেষ তথ্য যাচাই:</span>{' '}
              <strong className="text-gray-700">{destination.lastVerifiedAt}</strong>
            </div>
            <div>
              <span className="text-gray-400">ভৌগোলিক স্থানাঙ্ক:</span>{' '}
              <span className="text-gray-600 font-mono">
                {destination.latitude && destination.longitude
                  ? `${destination.latitude}° N, ${destination.longitude}° E`
                  : 'যাচাই সাপেক্ষে সংযোজিত'}
              </span>
            </div>
            {destination.sourceUrls && destination.sourceUrls.length > 0 && (
              <div>
                <span className="text-gray-400">তথ্যসূত্র:</span>{' '}
                <span className="text-gray-600">{destination.sourceUrls.join(', ')}</span>
              </div>
            )}
          </div>

          {/* Dedicated Author & Publisher Profile Card */}
          <div className="bg-white rounded-3xl border border-gray-200/90 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                এই গাইডের গবেষক ও কিউরেটর
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#143E27] text-[10px] font-bold">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> ভেরিফাইড
              </span>
            </div>

            <div className="flex items-center gap-4">
              <img
                src={author.avatarUrl}
                alt={author.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-600 shadow-2xs shrink-0"
              />
              <div className="space-y-0.5 min-w-0">
                <h4 className="text-base font-extrabold text-gray-900 truncate">
                  {author.name}
                </h4>
                <p className="text-xs font-semibold text-emerald-800 line-clamp-1">
                  {author.role}
                </p>
                <div className="text-[11px] text-gray-400 font-sans">
                  @{author.username}
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed bg-gray-50/80 p-3 rounded-xl border border-gray-100">
              {author.bio}
            </p>

            <button
              onClick={() => {
                if (onNavigate) onNavigate('team');
                else window.history.pushState(null, '', '/team');
              }}
              className="w-full py-2 bg-emerald-50 hover:bg-[#143E27] text-emerald-900 hover:text-white rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 border border-emerald-200 hover:border-transparent"
            >
              <Users className="w-3.5 h-3.5" />
              <span>আমাদের টিম ও গবেষক প্যানেল দেখুন</span>
            </button>
          </div>

          {/* Nearby places in this upazila */}
          {nearbyDestinations.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4 shadow-2xs">
              <h3 className="font-bold text-gray-900 text-sm flex items-center justify-between">
                <span>{upazila?.nameBn}-র অন্যান্য আকর্ষণ</span>
                <span className="text-xs font-normal text-emerald-800">
                  {nearbyDestinations.length}টি স্থান
                </span>
              </h3>
              <div className="space-y-3">
                {nearbyDestinations.map((nearby) => (
                  <div
                    key={nearby.id}
                    onClick={() => onSelectDestination(nearby.slug)}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-emerald-50 transition cursor-pointer group"
                  >
                    <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                      <img
                        src={nearby.coverImage || 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=200&q=80'}
                        alt={nearby.titleBn}
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-gray-900 group-hover:text-[#143E27] truncate">
                        {nearby.titleBn}
                      </h4>
                      <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                        {nearby.summaryBn}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Gallery modal viewer */}
      {selectedGalleryImg && (
        <div
          onClick={() => setSelectedGalleryImg(null)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs"
        >
          <div className="relative max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden bg-black">
            <img
              src={selectedGalleryImg}
              alt="বড় দৃশ্য"
              className="w-full h-full object-contain"
            />
            <button
              onClick={() => setSelectedGalleryImg(null)}
              className="absolute top-4 right-4 text-white bg-black/50 p-2 rounded-full hover:bg-black"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </article>
  );
};
