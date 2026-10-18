import React from 'react';
import { Compass, ArrowLeft, Home, Search } from 'lucide-react';

interface NotFoundPageProps {
  onNavigate: (view: string) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
      <div className="w-20 h-20 rounded-3xl bg-emerald-50 text-[#143E27] flex items-center justify-center mx-auto border border-emerald-100 shadow-sm">
        <Compass className="w-10 h-10 animate-spin text-emerald-800" style={{ animationDuration: '8s' }} />
      </div>

      <div className="space-y-2">
        <span className="text-emerald-800 font-bold text-xs uppercase tracking-widest">
          ৪০৪ ত্রুটি (Error 404)
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#143E27]">
          কাঙ্ক্ষিত পৃষ্ঠাটি পাওয়া যায়নি
        </h1>
        <p className="text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
          আপনি যে পর্যটন স্থান বা পৃষ্ঠাটি খুঁজছেন তা হয়তো সরানো হয়েছে অথবা ঠিকানাটি ভুল হতে পারে।
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
        <button
          onClick={() => onNavigate('home')}
          className="px-5 py-2.5 rounded-xl bg-[#143E27] text-white font-bold text-sm hover:bg-[#0D2618] transition flex items-center gap-2 cursor-pointer shadow-sm"
        >
          <Home className="w-4 h-4" />
          <span>হোমপেজে ফিরে যান</span>
        </button>

        <button
          onClick={() => onNavigate('places')}
          className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-800 font-bold text-sm hover:bg-gray-50 transition flex items-center gap-2 cursor-pointer"
        >
          <Search className="w-4 h-4" />
          <span>সকল পর্যটন স্থান দেখুন</span>
        </button>
      </div>
    </div>
  );
};
