import React, { useState } from 'react';
import { BookOpen, Clock, Calendar, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { INITIAL_ARTICLES } from '../data/initialData';
import { TravelArticle } from '../types';

export const GuidesPage: React.FC = () => {
  const [selectedArticle, setSelectedArticle] = useState<TravelArticle | null>(null);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-[#143E27] text-xs font-semibold">
          <BookOpen className="w-3.5 h-3.5" /> ভ্রমণ পরিকল্পনা ও টিপস
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#143E27] tracking-tight">
          শেরপুর ভ্রমণ সহায়িকা ও নির্দেশিকা
        </h1>
        <p className="text-sm sm:text-base text-gray-600 max-w-2xl">
          যাতায়াত রুট, সীমান্ত এলাকার জরুরি নিরাপত্তা পরামর্শ এবং একদিনের বাস্তবসম্মত ট্যুর প্ল্যান।
        </p>
      </div>

      {selectedArticle ? (
        <div className="max-w-4xl mx-auto space-y-5 sm:space-y-6 bg-white p-5 sm:p-10 rounded-2xl sm:rounded-3xl border border-gray-200 shadow-xs">
          <button
            onClick={() => setSelectedArticle(null)}
            className="text-xs font-bold text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer"
          >
            ← সকল আর্টিকেলে ফিরে যান
          </button>

          <div className="space-y-3">
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold">
              {selectedArticle.categoryBn}
            </span>
            <h2 className="text-xl sm:text-3xl font-extrabold text-[#143E27]">
              {selectedArticle.titleBn}
            </h2>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> পড়ার সময়: {selectedArticle.readTimeBn}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> প্রকাশ: {selectedArticle.publishedAt}
              </span>
              <span>•</span>
              <span>লেখক: {selectedArticle.authorBn}</span>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden h-52 sm:h-72 bg-gray-100">
            <img
              src={selectedArticle.coverImage}
              alt={selectedArticle.titleBn}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="text-gray-800 text-base leading-relaxed whitespace-pre-line space-y-4 pt-4 border-t border-gray-100">
            {selectedArticle.contentBn}
          </div>

          <div className="p-4 rounded-xl bg-emerald-50 text-emerald-900 text-xs flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>
              তথ্যসূত্র ও রুট তথ্য নিয়মিত মাঠপর্যায় থেকে যাচাইকৃত। ভ্রমণকালে স্থানীয় আবহাওয়া ও পরিস্থিতি বিবেচনায় রাখুন।
            </span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {INITIAL_ARTICLES.map((article) => (
            <div
              key={article.id}
              onClick={() => setSelectedArticle(article)}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-lg transition cursor-pointer flex flex-col group hover:border-emerald-600/40"
            >
              <div className="h-48 overflow-hidden bg-gray-100">
                <img
                  src={article.coverImage}
                  alt={article.titleBn}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-emerald-800 font-semibold">
                    <span>{article.categoryBn}</span>
                    <span className="text-gray-400 font-normal">{article.readTimeBn}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#143E27] transition-colors leading-snug">
                    {article.titleBn}
                  </h3>
                  <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                    {article.summaryBn}
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-[#143E27] font-semibold">
                  <span>সম্পূর্ণ পড়ুন</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
