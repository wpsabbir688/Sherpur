import React from 'react';
import {
  Compass,
  Phone,
  Mail,
  MapPin,
  Heart,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { UPAZILAS } from '../../data/initialData';

interface FooterProps {
  onNavigate: (view: string, param?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-[#0D2618] text-white pt-14 pb-8 border-t border-emerald-900/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-emerald-900/40">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Compass className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold tracking-tight text-white">শেরপুর ভ্রমণ গাইড</h3>
                <p className="text-xs text-emerald-400 font-medium">Sherpur Travel Guide</p>
              </div>
            </div>
            <p className="text-sm text-emerald-200/80 leading-relaxed">
              শেরপুরের নৈসর্গিক গারো পাহাড়, নিবিড় শালবন, পাহাড়ি নদী, ঐতিহাসিক প্রত্নতত্ত্ব ও পর্যটন স্থানসমূহের নির্ভরযোগ্য ডিজিটাল গাইড।
            </p>
            <div className="pt-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-800/40 text-xs text-emerald-300">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>শেরপুর জেলা, ময়মনসিংহ বিভাগ, বাংলাদেশ</span>
              </div>
            </div>
          </div>

          {/* Upazilas */}
          <div>
            <h4 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              উপজেলাসমূহ
            </h4>
            <ul className="space-y-2.5 text-sm text-emerald-200/80">
              {UPAZILAS.map((up) => (
                <li key={up.id}>
                  <button
                    onClick={() => onNavigate('upazilas', up.id)}
                    className="hover:text-amber-300 transition-colors flex items-center gap-2 text-left"
                  >
                    <span className="text-emerald-500">•</span>
                    <span>{up.nameBn} ({up.nameEn})</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick links & Guides */}
          <div>
            <h4 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              গুরুত্বপূর্ণ লিঙ্ক
            </h4>
            <ul className="space-y-2.5 text-sm text-emerald-200/80">
              <li>
                <button
                  onClick={() => onNavigate('places')}
                  className="hover:text-amber-300 transition-colors"
                >
                  সকল দর্শনীয় স্থান ডিরেক্টরি
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('categories')}
                  className="hover:text-amber-300 transition-colors"
                >
                  পর্যটন ক্যাটাগরি
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('guides')}
                  className="hover:text-amber-300 transition-colors"
                >
                  ভ্রমণ পরিকল্পনা ও নিরাপত্তা টিপস
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-amber-300 transition-colors"
                >
                  আমাদের লক্ষ্য ও তথ্য যাচাই নীতি
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contact')}
                  className="hover:text-amber-300 transition-colors"
                >
                  যোগাযোগ ও মতামত
                </button>
              </li>
            </ul>
          </div>

          {/* Official Contact Info */}
          <div className="space-y-4">
            <h4 className="text-base font-semibold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              যোগাযোগ ও সহায়তা
            </h4>
            <p className="text-xs text-emerald-200/70">
              পর্যটন তথ্য, সংশোধন বা নতুন কোনো স্থানের সংযোজনের জন্য যোগাযোগ করতে পারেন:
            </p>
            <div className="space-y-3 text-sm">
              <a
                href="tel:+8801944460344"
                className="flex items-center gap-3 p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-800/40 hover:border-amber-400/60 hover:text-amber-300 transition group"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-800/50 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] text-emerald-400">হটলাইন / কল করুন</div>
                  <div className="font-semibold text-white">+8801944460344</div>
                </div>
              </a>

              <a
                href="mailto:wpsabbir44@gmail.com"
                className="flex items-center gap-3 p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-800/40 hover:border-amber-400/60 hover:text-amber-300 transition group"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-800/50 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] text-emerald-400">ইমেইল ঠিকানা</div>
                  <div className="font-semibold text-white break-all">wpsabbir44@gmail.com</div>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Disclaimer & Copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-emerald-300/70">
          <div className="flex items-center gap-2 text-center md:text-left">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              অনানুষ্ঠানিক পর্যটন তথ্যভাণ্ডার। কোনো সরকারি বা দাপ্তরিক সংস্থার মালিকানা দাবি করা হয় না।
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span>© ২০২৬ শেরপুর ভ্রমণ গাইড | Sherpur Travel Guide. সর্বস্বত্ব সংরক্ষিত।</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
