import React from 'react';
import { Compass, ShieldCheck, CheckCircle2, Phone, Mail, MapPin, Heart, AlertCircle } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 sm:space-y-12">
      {/* Intro */}
      <div className="text-center space-y-3 sm:space-y-4">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-100 text-[#143E27] flex items-center justify-center mx-auto shadow-sm">
          <Compass className="w-7 h-7 sm:w-8 sm:h-8" />
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-[#143E27] tracking-tight">
          শেরপুর ভ্রমণ গাইড সম্পর্কে
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          শেরপুরের নৈসর্গিক রূপ, গারো পাহাড়, আদিবাসী সংস্কৃতি এবং ঐতিহাসিক ঐতিহ্যকে ভ্রমণপিপাসুদের কাছে পৌঁছে দেওয়ার একটি মুক্ত ডিজিটাল উদ্যোগ।
        </p>
      </div>

      {/* Purpose & Mission */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200 p-5 sm:p-10 shadow-xs space-y-4 sm:space-y-6">
        <h2 className="text-xl sm:text-2xl font-bold text-[#143E27] flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-700" />
          <span>আমাদের উদ্দেশ্য ও লক্ষ্য</span>
        </h2>
        <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
          শেরপুর জেলা তার অপরূপ পাহাড়ি সৌন্দর্য, শান্ত বনভূমি ও শতাব্দীর প্রাচীন ইতিহাসের জন্য অনন্য। কিন্তু অনেক পর্যটকই এখানকার নিখুঁত যাতায়াত ব্যবস্থা, সীমানাসংক্রান্ত বিধিনিষেধ বা প্রকৃত তথ্য না জানার কারণে বিভ্রান্ত হন। 
          <strong> "শেরপুর ভ্রমণ গাইড" (Sherpur Travel Guide)</strong>-এর মূল লক্ষ্য হলো একটি পরিচ্ছন্ন, নিরপেক্ষ ও তথ্যবহুল প্ল্যাটফর্ম তৈরি করা, যেখান থেকে যে কেউ শেরপুর ভ্রমণের বাস্তবসম্মত পরিকল্পনা তৈরি করতে পারেন।
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-2 sm:pt-4">
          <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-emerald-50/70 border border-emerald-100 space-y-1.5 sm:space-y-2">
            <h3 className="font-bold text-[#143E27] text-sm sm:text-base">১. নির্ভুল ও যাচাইকৃত তথ্য</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              শুধুমাত্র বাস্তবসম্মত এবং যাচাইকৃত প্রবেশ ফি, সময়সূচি ও দিকনির্দেশনা প্রকাশ করা হয়। কোনো কল্পনাপ্রসূত তথ্য উপস্থাপন করা হয় না।
            </p>
          </div>
          <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-emerald-50/70 border border-emerald-100 space-y-1.5 sm:space-y-2">
            <h3 className="font-bold text-[#143E27] text-sm sm:text-base">২. দায়িত্বশীল ও পরিবেশবান্ধব পর্যটন</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              সীমান্তবর্তী গারো পাহাড় ও শালবনের পরিবেশ ও পরিচ্ছন্নতা রক্ষা এবং আদিবাসী সংস্কৃতির মর্যাদা সমুন্নত রাখার আহ্বান জানাই।
            </p>
          </div>
        </div>
      </div>

      {/* Transparent Disclaimer Box */}
      <div className="bg-amber-50/80 border border-amber-200 rounded-2xl sm:rounded-3xl p-5 sm:p-8 space-y-3">
        <div className="flex items-center gap-2 text-amber-900 font-bold text-sm sm:text-base">
          <AlertCircle className="w-5 h-5 text-amber-700 shrink-0" />
          <span>দাপ্তরিক ও আইনি স্বচ্ছতা বার্তা</span>
        </div>
        <p className="text-xs sm:text-sm text-amber-950/90 leading-relaxed">
          এই ওয়েবসাইটটি একটি স্বাধীন ও অলাভজনক পর্যটন তথ্য বাতায়ন। আমরা বাংলাদেশ সরকার, বাংলাদেশ পর্যটন কর্পোরেশন বা শেরপুর জেলা প্রশাসনের কোনো আনুষ্ঠানিক অঙ্গপ্রতিষ্ঠান বা সরকারি সংস্থা নই। এখানে উপস্থাপিত সকল তথ্য পর্যটকদের সহায়তা ও পর্যটন প্রসারের উদ্দেশ্যে সদিচ্ছা নিয়ে সংকলিত।
        </p>
      </div>

      {/* Contact info */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200 p-5 sm:p-8 shadow-xs space-y-4">
        <h2 className="text-xl font-bold text-[#143E27]">
          যোগাযোগ ও পরিচালনা
        </h2>
        <p className="text-sm text-gray-600">
          যেকোনো তথ্য সংশোধন, নতুন পর্যটন স্থানের প্রস্তাব বা অনুসন্ধানের জন্য নির্দ্বিধায় আমাদের সাথে যোগাযোগ করতে পারেন:
        </p>
        <div className="flex flex-col sm:flex-row gap-4 pt-2">
          <a
            href="tel:+8801944460344"
            className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition text-[#143E27]"
          >
            <Phone className="w-5 h-5 text-emerald-700" />
            <div>
              <div className="text-xs text-gray-500">টেলিফোন / কল</div>
              <div className="font-bold text-sm">+8801944460344</div>
            </div>
          </a>

          <a
            href="mailto:wpsabbir44@gmail.com"
            className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition text-[#143E27]"
          >
            <Mail className="w-5 h-5 text-emerald-700" />
            <div>
              <div className="text-xs text-gray-500">ইমেইল ঠিকানা</div>
              <div className="font-bold text-sm">wpsabbir44@gmail.com</div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};
