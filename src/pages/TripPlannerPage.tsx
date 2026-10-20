import React, { useState } from 'react';
import {
  Compass,
  Calendar,
  DollarSign,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Share2,
  Users,
  Footprints,
  Car,
  Utensils,
  Home,
  Check,
} from 'lucide-react';
import { CURATED_TRIP_PLANS } from '../services/tripPlannerService';
import { Destination } from '../types';
import { TripPlan, TravelStyle } from '../types/community';
import { handleImageError } from '../utils/imageFallback';

interface TripPlannerPageProps {
  destinations: Destination[];
  onSelectDestination: (slug: string) => void;
  onNavigate: (view: string, param?: string) => void;
}

export const TripPlannerPage: React.FC<TripPlannerPageProps> = ({
  destinations,
  onSelectDestination,
  onNavigate,
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState<string>(CURATED_TRIP_PLANS[0].id);
  const [customTravelers, setCustomTravelers] = useState<number>(2);
  const [copiedLink, setCopiedLink] = useState(false);

  const activePlan = CURATED_TRIP_PLANS.find((p) => p.id === selectedPlanId) || CURATED_TRIP_PLANS[0];

  const planDestinations = activePlan.destinationIds
    .map((id) => destinations.find((d) => d.id === id || d.slug === id))
    .filter(Boolean) as Destination[];

  const calculatedTotalBudget = activePlan.estimatedBudgetTotal * customTravelers;

  const handleSharePlan = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: `${activePlan.title} | শেরপুর ভ্রমণ গাইড`,
        text: activePlan.description,
        url,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-[#143E27] via-[#1E5638] to-[#0D2618] rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden shadow-sm">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold backdrop-blur-md border border-emerald-400/20">
            <Compass className="w-3.5 h-3.5" />
            <span>স্মার্ট ভ্রমণ সহায়িকা ও বাজেট প্ল্যানার</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            শেরপুর ট্রিপ প্ল্যানার ও বাজেট
          </h1>
          <p className="text-emerald-100/90 text-xs sm:text-sm leading-relaxed">
            ঢাকা থেকে রওনা দিয়ে শেরপুরের গারো পাহাড়, শালবন, লেক ও প্রত্নতত্ত্ব ঘুরে আসার জন্য তৈরি করা নির্ভরযোগ্য ও বাস্তবমুখী ভ্রমণ পরিকল্পনা।
          </p>
        </div>
      </div>

      {/* Plan Selection Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-800" />
            <span>উপযুক্ত ভ্রমণ পরিকল্পনা বেছে নিন</span>
          </h2>
          <span className="text-xs text-gray-500 font-medium">৩টি যাচাইকৃত রুট</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {CURATED_TRIP_PLANS.map((plan) => {
            const isSelected = plan.id === selectedPlanId;
            return (
              <div
                key={plan.id}
                onClick={() => setSelectedPlanId(plan.id)}
                className={`p-5 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                  isSelected
                    ? 'border-[#143E27] bg-emerald-50/40 shadow-md ring-2 ring-[#143E27]/20'
                    : 'border-gray-200 bg-white hover:border-emerald-300 hover:shadow-xs'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-[#143E27]">
                      {plan.durationDays} দিন
                    </span>
                    <span className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {plan.travelStyle === 'family'
                        ? 'পারিবারিক'
                        : plan.travelStyle === 'friends'
                        ? 'বন্ধুমহল'
                        : 'একক ভ্রমণ'}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-gray-900 leading-snug">{plan.title}</h3>
                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                    {plan.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-gray-400 block">আনুমানিক বাজেট (জনপ্রতি)</span>
                    <span className="text-base font-extrabold text-[#143E27]">
                      ৳ {plan.estimatedBudgetTotal.toLocaleString('bn-BD')}
                    </span>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      isSelected ? 'bg-[#143E27] text-white' : 'border border-gray-300'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Plan Details & Daily Itinerary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Itinerary & Route */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-gray-200/90 p-6 sm:p-8 space-y-6 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-5">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{activePlan.title}</h3>
                <p className="text-xs text-gray-500 mt-1">{activePlan.description}</p>
              </div>
              <button
                onClick={handleSharePlan}
                className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copiedLink ? 'লিঙ্ক কপি হয়েছে!' : 'শেয়ার করুন'}</span>
              </button>
            </div>

            {/* Highlights */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>ট্যুরের প্রধান আকর্ষণসমূহ:</span>
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-700">
                {activePlan.highlights.map((h, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100/60"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Days Flow */}
            <div className="space-y-6 pt-2">
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-700" />
                <span>দৈনিক ভ্রমণ প্রবাহ ও নির্দেশিকা:</span>
              </h4>

              {activePlan.itineraryDays.map((day) => (
                <div
                  key={day.day}
                  className="relative pl-6 sm:pl-8 border-l-2 border-emerald-600/40 space-y-3 pb-6 last:pb-0"
                >
                  <div className="absolute -left-3.5 top-0 w-7 h-7 rounded-full bg-[#143E27] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    {day.day}
                  </div>

                  <div>
                    <h5 className="font-bold text-base text-gray-900">{day.title}</h5>
                    <p className="text-xs text-gray-600 leading-relaxed mt-2 bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                      {day.travelNotes}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Linked Places Cards */}
            <div className="pt-4 border-t border-gray-100 space-y-3">
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                <span>এই প্ল্যানে অন্তর্ভুক্ত দর্শনীয় স্থানসমূহ:</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {planDestinations.map((d) => (
                  <div
                    key={d.id}
                    onClick={() => onSelectDestination(d.slug)}
                    className="p-3 rounded-2xl border border-gray-200 hover:border-emerald-500 hover:shadow-xs transition cursor-pointer flex items-center gap-3 group bg-white"
                  >
                    <img
                      src={d.coverImage}
                      alt={d.titleBn}
                      onError={(e) => handleImageError(e)}
                      className="w-14 h-14 rounded-xl object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h6 className="font-bold text-xs text-gray-900 group-hover:text-[#143E27] truncate">
                        {d.titleBn}
                      </h6>
                      <p className="text-[11px] text-gray-500 truncate">{d.locationName}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#143E27] group-hover:translate-x-1 transition-transform shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Budget Estimator */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-gray-200/90 p-6 shadow-2xs space-y-6 sticky top-24">
            <div>
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block mb-1">
                বাজেট ক্যালকুলেটর
              </span>
              <h3 className="text-xl font-bold text-gray-900">আনুমানিক খরচের বিবরণ</h3>
            </div>

            {/* Travelers counter */}
            <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-200 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700">ভ্রমণকারীর সংখ্যা:</span>
              <div className="flex items-center gap-2">
                {[1, 2, 4, 6].map((num) => (
                  <button
                    key={num}
                    onClick={() => setCustomTravelers(num)}
                    className={`w-8 h-8 rounded-xl text-xs font-bold transition cursor-pointer ${
                      customTravelers === num
                        ? 'bg-[#143E27] text-white shadow-2xs'
                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Total Budget Card */}
            <div className="p-4 rounded-2xl bg-[#143E27] text-white space-y-1">
              <span className="text-xs text-emerald-300">
                মোট আনুমানিক খরচ ({customTravelers} জনের জন্য):
              </span>
              <div className="text-2xl font-black">
                ৳ {calculatedTotalBudget.toLocaleString('bn-BD')}
              </div>
              <p className="text-[10px] text-emerald-200/80">
                জনপ্রতি প্রায় ৳ {activePlan.estimatedBudgetTotal.toLocaleString('bn-BD')}
              </p>
            </div>

            {/* Expense breakdown */}
            <div className="space-y-2.5 text-xs text-gray-600">
              <div className="flex items-center justify-between p-2 rounded-xl bg-gray-50">
                <span className="flex items-center gap-2">
                  <Car className="w-3.5 h-3.5 text-emerald-700" /> যাতায়াত (বাস ও সিএনজি)
                </span>
                <span className="font-bold text-gray-900">
                  ৳ {(activePlan.budgetBreakdown.transport * customTravelers).toLocaleString('bn-BD')}
                </span>
              </div>

              {activePlan.budgetBreakdown.accommodation > 0 && (
                <div className="flex items-center justify-between p-2 rounded-xl bg-gray-50">
                  <span className="flex items-center gap-2">
                    <Home className="w-3.5 h-3.5 text-emerald-700" /> হোটেল ও রাত্রিযাপন
                  </span>
                  <span className="font-bold text-gray-900">
                    ৳ {(activePlan.budgetBreakdown.accommodation * Math.ceil(customTravelers / 2)).toLocaleString('bn-BD')}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between p-2 rounded-xl bg-gray-50">
                <span className="flex items-center gap-2">
                  <Utensils className="w-3.5 h-3.5 text-emerald-700" /> খাবার ও জলখাবার
                </span>
                <span className="font-bold text-gray-900">
                  ৳ {(activePlan.budgetBreakdown.food * customTravelers).toLocaleString('bn-BD')}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-gray-50">
                <span className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-700" /> এন্ট্রি টিকিট ও রাইড
                </span>
                <span className="font-bold text-gray-900">
                  ৳ {(activePlan.budgetBreakdown.entryAndActivities * customTravelers).toLocaleString('bn-BD')}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-gray-50">
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" /> জরুরি ও বিবিধ
                </span>
                <span className="font-bold text-gray-900">
                  ৳ {(activePlan.budgetBreakdown.emergency * customTravelers).toLocaleString('bn-BD')}
                </span>
              </div>
            </div>

            {/* Disclaimer & Transparency Note */}
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-900 leading-relaxed flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>সতর্কবার্তা:</strong> সকল খরচ ও ভাড়া স্থানীয় সাম্প্রতিক তথ্যের ভিত্তিতে আনুমানিক। সিজন, উৎসব বা দরদামের ওপর নির্ভর করে ভাড়া কিছুটা কম-বেশি হতে পারে।
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
