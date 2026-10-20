import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Compass,
  Phone,
  Mail,
  Menu,
  X,
  ShieldCheck,
  LogIn,
  LogOut,
  MapPin,
  Sparkles,
  ChevronDown,
  Layers,
  BookOpen,
  Info,
  Send,
  Home,
  ChevronRight,
  Bell,
  Users,
  User,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UPAZILAS } from '../../data/initialData';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string, param?: string) => void;
  onOpenAdminLogin: () => void;
  onOpenUserAuth?: () => void;
  unreadNotificationsCount?: number;
  onOpenNotifications?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  onOpenAdminLogin,
  onOpenUserAuth,
  unreadNotificationsCount = 0,
  onOpenNotifications,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [upazilaDropdownOpen, setUpazilaDropdownOpen] = useState(false);
  const [mobileUpazilaExpanded, setMobileUpazilaExpanded] = useState(true);
  const { user, userProfile, adminUsername, adminName, isAdmin, isSuperAdmin, signOut } = useAuth();

  // Prevent background scrolling and handle Escape key when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setMobileMenuOpen(false);
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [mobileMenuOpen]);

  const handleNavClick = (view: string, param?: string) => {
    onNavigate(view, param);
    setMobileMenuOpen(false);
    setUpazilaDropdownOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-950/10 shadow-xs">
        {/* Top Hotline & Announcement Bar */}
        <div className="bg-[#143E27] text-white text-[11px] sm:text-xs py-1.5 px-3 sm:px-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 truncate">
              <span className="inline-flex items-center gap-1 bg-[#1E5638] px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-medium text-emerald-200 shrink-0">
                <Sparkles className="w-3 h-3 text-amber-300" /> শেরপুর গাইড
              </span>
              <span className="text-white/80 truncate text-[11px] hidden sm:inline">
                পাহাড়, শালবন ও নদী বাতায়ন
              </span>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 shrink-0 text-[11px] sm:text-[12px]">
              <a
                href="tel:+8801944460344"
                className="flex items-center gap-1.5 hover:text-amber-300 transition-colors font-sans font-medium bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-700/50"
                title="যোগাযোগের জন্য কল করুন"
              >
                <Phone className="w-3 h-3 text-amber-300 shrink-0" />
                <span>+8801944460344</span>
              </a>
              <a
                href="mailto:wpsabbir44@gmail.com"
                className="hidden md:flex items-center gap-1 hover:text-amber-300 transition-colors"
                title="ইমেইল করুন"
              >
                <Mail className="w-3 h-3 text-amber-300 shrink-0" />
                <span className="font-sans">wpsabbir44@gmail.com</span>
              </a>
            </div>
          </div>
        </div>

        {/* Main navigation bar */}
        <div className="max-w-[1600px] mx-auto px-3 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-2">
          {/* Logo / Brand - non-shrinking, clean */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2 sm:gap-3 text-left group transition shrink-0 cursor-pointer touch-manipulation"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#1E5638] to-[#123923] flex items-center justify-center text-white shadow-sm shadow-emerald-900/20 group-hover:scale-105 transition-transform shrink-0">
              <Compass className="w-4.5 h-4.5 sm:w-6 sm:h-6 text-emerald-300" />
            </div>
            <div className="min-w-0">
              <div className="text-sm sm:text-base xl:text-lg font-bold tracking-tight text-[#143E27] flex items-center gap-1.5 leading-tight whitespace-nowrap">
                <span>শেরপুর ভ্রমণ গাইড</span>
                <span className="hidden 2xl:inline-block text-[10px] bg-emerald-100 text-[#143E27] px-1.5 py-0.5 rounded font-semibold border border-emerald-200 shrink-0">
                  Sherpur
                </span>
              </div>
              <p className="text-[10px] text-[#556960] tracking-wide font-medium truncate hidden 2xl:block">
                Sherpur District Travel Guide & Directory
              </p>
            </div>
          </button>

          {/* Desktop Nav Links - xl:flex prevents crowded wrapping on medium laptop screens */}
          <nav className="hidden xl:flex items-center gap-0.5 2xl:gap-1 text-xs 2xl:text-sm font-semibold text-[#2C4035] whitespace-nowrap">
            <button
              onClick={() => handleNavClick('home')}
              className={`px-2.5 2xl:px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                currentView === 'home'
                  ? 'bg-[#1E5638]/10 text-[#143E27] font-bold'
                  : 'hover:bg-gray-100 hover:text-black'
              }`}
            >
              হোম
            </button>
            <button
              onClick={() => handleNavClick('places')}
              className={`px-2.5 2xl:px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                currentView === 'places'
                  ? 'bg-[#1E5638]/10 text-[#143E27] font-bold'
                  : 'hover:bg-gray-100 hover:text-black'
              }`}
            >
              সকল দর্শনীয় স্থান
            </button>

            {/* Upazilas dropdown */}
            <div className="relative group">
              <button
                onClick={() => setUpazilaDropdownOpen(!upazilaDropdownOpen)}
                onMouseEnter={() => setUpazilaDropdownOpen(true)}
                className={`px-2.5 2xl:px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap ${
                  currentView === 'upazilas'
                    ? 'bg-[#1E5638]/10 text-[#143E27] font-bold'
                    : 'hover:bg-gray-100 hover:text-black'
                }`}
              >
                <span>উপজেলাসমূহ</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-500 group-hover:rotate-180 transition-transform" />
              </button>
              {upazilaDropdownOpen && (
                <div
                  onMouseLeave={() => setUpazilaDropdownOpen(false)}
                  className="absolute top-full left-0 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-2 mt-1 z-50 animate-in fade-in slide-in-from-top-2"
                >
                  <div className="px-3 py-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    ৫টি উপজেলা
                  </div>
                  {UPAZILAS.map((up) => (
                    <button
                      key={up.id}
                      onClick={() => handleNavClick('upazilas', up.id)}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-[#143E27] flex items-center justify-between cursor-pointer"
                    >
                      <span>{up.nameBn}</span>
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 opacity-60" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => handleNavClick('categories')}
              className={`px-2.5 2xl:px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                currentView === 'categories'
                  ? 'bg-[#1E5638]/10 text-[#143E27] font-bold'
                  : 'hover:bg-gray-100 hover:text-black'
              }`}
            >
              ক্যাটাগরি
            </button>
            <button
              onClick={() => handleNavClick('community')}
              className={`px-2.5 2xl:px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                currentView === 'community'
                  ? 'bg-[#1E5638]/10 text-[#143E27] font-bold'
                  : 'hover:bg-gray-100 hover:text-black'
              }`}
            >
              কমিউনিটি
            </button>
            <button
              onClick={() => handleNavClick('trips')}
              className={`px-2.5 2xl:px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                currentView === 'trips'
                  ? 'bg-[#1E5638]/10 text-[#143E27] font-bold'
                  : 'hover:bg-gray-100 hover:text-black'
              }`}
            >
              ট্রিপ প্ল্যানার
            </button>
            <button
              onClick={() => handleNavClick('guides')}
              className={`px-2.5 2xl:px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                currentView === 'guides'
                  ? 'bg-[#1E5638]/10 text-[#143E27] font-bold'
                  : 'hover:bg-gray-100 hover:text-black'
              }`}
            >
              ভ্রমণ সহায়িকা
            </button>
            <button
              onClick={() => handleNavClick('team')}
              className={`px-2.5 2xl:px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                currentView === 'team'
                  ? 'bg-[#1E5638]/10 text-[#143E27] font-bold'
                  : 'hover:bg-gray-100 hover:text-black'
              }`}
            >
              <Users className="w-4 h-4 text-emerald-700" />
              <span>আমাদের টিম</span>
            </button>
            <button
              onClick={() => handleNavClick('about')}
              className={`px-2.5 2xl:px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                currentView === 'about'
                  ? 'bg-[#1E5638]/10 text-[#143E27] font-bold'
                  : 'hover:bg-gray-100 hover:text-black'
              }`}
            >
              পরিচিতি
            </button>
            <button
              onClick={() => handleNavClick('contact')}
              className={`px-2.5 2xl:px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                currentView === 'contact'
                  ? 'bg-[#1E5638]/10 text-[#143E27] font-bold'
                  : 'hover:bg-gray-100 hover:text-black'
              }`}
            >
              যোগাযোগ
            </button>
          </nav>

          {/* Action Buttons: Admin Login & Notification & Hamburger */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {isAdmin ? (
              <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                <button
                  onClick={() => handleNavClick('admin')}
                  className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 min-h-[38px] sm:min-h-[40px] rounded-xl text-xs font-bold transition cursor-pointer touch-manipulation whitespace-nowrap ${
                    currentView === 'admin'
                      ? 'bg-[#143E27] text-white shadow-xs'
                      : 'bg-emerald-50 text-[#143E27] hover:bg-emerald-100 border border-emerald-200'
                  }`}
                  title="অ্যাডমিন ড্যাশবোর্ড"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span className="font-bold max-w-[85px] sm:max-w-[130px] truncate">
                    {adminName || 'মো. সাব্বির হোসেন'}
                  </span>
                  <span className="hidden sm:inline-block text-[10px] bg-emerald-200/90 text-emerald-950 px-1.5 py-0.5 rounded font-mono font-bold">
                    {isSuperAdmin ? 'Admin' : 'Editor'}
                  </span>
                </button>
                <button
                  onClick={() => signOut()}
                  className="p-2 min-h-[38px] min-w-[38px] text-gray-400 hover:text-red-600 rounded-xl hover:bg-gray-100 transition cursor-pointer touch-manipulation flex items-center justify-center shrink-0"
                  title="লগআউট"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : user ? (
              <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                <button
                  onClick={() => handleNavClick('profile')}
                  className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 min-h-[38px] sm:min-h-[40px] rounded-xl text-xs font-bold transition cursor-pointer touch-manipulation whitespace-nowrap ${
                    currentView === 'profile'
                      ? 'bg-[#143E27] text-white shadow-xs'
                      : 'bg-emerald-50 text-[#143E27] hover:bg-emerald-100 border border-emerald-200'
                  }`}
                  title="আমার প্রোফাইল"
                >
                  <User className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span className="font-bold max-w-[85px] sm:max-w-[120px] truncate">
                    {userProfile?.displayName || user.displayName || 'আমার প্রোফাইল'}
                  </span>
                </button>
                <button
                  onClick={() => signOut()}
                  className="p-2 min-h-[38px] min-w-[38px] text-gray-400 hover:text-red-600 rounded-xl hover:bg-gray-100 transition cursor-pointer touch-manipulation flex items-center justify-center shrink-0"
                  title="লগআউট"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenUserAuth || onOpenAdminLogin}
                className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 min-h-[38px] sm:min-h-[40px] text-xs font-bold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 border border-emerald-200 rounded-xl transition cursor-pointer touch-manipulation shrink-0"
                title="লগইন / রেজিস্টার"
              >
                <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-700 shrink-0" />
                <span className="hidden sm:inline">লগইন</span>
              </button>
            )}

            {/* Notification Bell Button */}
            {onOpenNotifications && (
              <button
                onClick={onOpenNotifications}
                className="relative p-2 min-h-[38px] min-w-[38px] sm:min-h-[40px] sm:min-w-[40px] flex items-center justify-center rounded-xl text-emerald-900 bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 active:scale-95 transition border border-emerald-200 cursor-pointer touch-manipulation shadow-2xs shrink-0"
                title="উৎসব ও অনুষ্ঠান নোটিফিকেশন"
                aria-label="উৎসব ও অনুষ্ঠান নোটিফিকেশন"
                type="button"
              >
                <Bell className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-emerald-800" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-600 text-white font-extrabold text-[10px] shadow-xs animate-pulse">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>
            )}

            {/* Mobile / Tablet hamburger menu button (shown when width < xl: 1280px) */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="xl:hidden p-2 min-h-[38px] min-w-[38px] sm:min-h-[40px] sm:min-w-[40px] flex items-center justify-center rounded-xl text-[#143E27] bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 active:scale-95 transition border border-emerald-200 focus:outline-none cursor-pointer touch-manipulation shadow-2xs shrink-0"
              aria-label="মোবাইল মেনু খুলুন"
              type="button"
            >
              <Menu className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-[#143E27]" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer (Rendered in React Portal to escape any backdrop-filter or header clipping constraints) */}
      {mobileMenuOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] xl:hidden flex justify-end">
          {/* Backdrop overlay */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 cursor-pointer"
            aria-hidden="true"
          />

          {/* Sliding Panel */}
          <div
            className="relative w-full max-w-[320px] sm:max-w-sm h-full bg-white shadow-2xl flex flex-col justify-between overflow-hidden z-10 transition-transform duration-300 ease-out"
            role="dialog"
            aria-modal="true"
            aria-label="মোবাইল নেভিগেশন মেনু"
          >
            {/* Drawer Header */}
            <div className="p-3.5 sm:p-4 border-b border-emerald-950/10 flex items-center justify-between gap-2 bg-emerald-50/80 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="w-9 h-9 rounded-xl bg-[#143E27] flex items-center justify-center text-emerald-300 shadow-sm shrink-0">
                  <Compass className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-[#143E27] text-sm leading-tight truncate">
                    শেরপুর ভ্রমণ গাইড
                  </h3>
                  <p className="text-[10px] text-gray-500 font-sans truncate">
                    Sherpur District Travel Guide
                  </p>
                </div>
              </div>

              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-600 hover:text-gray-950 active:bg-gray-100 transition cursor-pointer touch-manipulation shrink-0"
                aria-label="মেনু বন্ধ করুন"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Navigation Links */}
            <div className="p-3 sm:p-4 space-y-1.5 flex-1 overflow-y-auto overscroll-contain">
              <button
                onClick={() => handleNavClick('home')}
                className={`w-full text-left px-3.5 py-2.5 sm:py-3 rounded-xl text-sm font-semibold flex items-center justify-between transition cursor-pointer touch-manipulation ${
                  currentView === 'home'
                    ? 'bg-emerald-100 text-[#143E27]'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <Home className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>হোম পেজ</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>

              {/* Mobile Notification Button */}
              {onOpenNotifications && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenNotifications();
                  }}
                  className="w-full text-left px-3.5 py-2.5 sm:py-3 rounded-xl text-sm font-semibold flex items-center justify-between transition cursor-pointer touch-manipulation bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-amber-950 hover:bg-amber-100 active:bg-amber-200 shadow-2xs gap-2"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative shrink-0">
                      <Bell className="w-4 h-4 text-amber-700" />
                      {unreadNotificationsCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-2 w-2 rounded-full bg-rose-600 animate-ping"></span>
                      )}
                    </div>
                    <span className="font-bold truncate text-xs sm:text-sm">উৎসব ও অনুষ্ঠান বার্তা</span>
                  </div>
                  {unreadNotificationsCount > 0 ? (
                    <span className="text-[10px] sm:text-[11px] font-black bg-amber-500 text-white px-2 py-0.5 rounded-full shadow-2xs shrink-0">
                      {unreadNotificationsCount} নতুন
                    </span>
                  ) : (
                    <ChevronRight className="w-4 h-4 text-amber-700 shrink-0" />
                  )}
                </button>
              )}

              <button
                onClick={() => handleNavClick('places')}
                className={`w-full text-left px-3.5 py-3 rounded-xl text-sm font-semibold flex items-center justify-between transition cursor-pointer touch-manipulation ${
                  currentView === 'places'
                    ? 'bg-emerald-100 text-[#143E27]'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Compass className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>সকল দর্শনীয় স্থান</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>

              {/* Upazilas Section in Mobile */}
              <div className="bg-emerald-50/70 rounded-2xl p-3 border border-emerald-100 space-y-2 my-2">
                <button
                  onClick={() => setMobileUpazilaExpanded(!mobileUpazilaExpanded)}
                  className="w-full flex items-center justify-between text-xs font-bold text-emerald-950 uppercase tracking-wider py-1 cursor-pointer touch-manipulation"
                  type="button"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span>শেরপুরের ৫টি উপজেলা</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-emerald-700 transition-transform duration-200 ${
                      mobileUpazilaExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {mobileUpazilaExpanded && (
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    {UPAZILAS.map((up) => (
                      <button
                        key={up.id}
                        onClick={() => handleNavClick('upazilas', up.id)}
                        className="text-left px-2.5 py-2 rounded-xl text-xs font-medium bg-white text-gray-800 border border-emerald-100 hover:bg-emerald-100 hover:text-emerald-950 transition cursor-pointer touch-manipulation truncate"
                      >
                        {up.nameBn}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => handleNavClick('categories')}
                className={`w-full text-left px-3.5 py-3 rounded-xl text-sm font-semibold flex items-center justify-between transition cursor-pointer touch-manipulation ${
                  currentView === 'categories'
                    ? 'bg-emerald-100 text-[#143E27]'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Layers className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>ক্যাটাগরি সমূহ</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>

              <button
                onClick={() => handleNavClick('community')}
                className={`w-full text-left px-3.5 py-3 rounded-xl text-sm font-semibold flex items-center justify-between transition cursor-pointer touch-manipulation ${
                  currentView === 'community'
                    ? 'bg-emerald-100 text-[#143E27]'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>ট্রাভেলার্স কমিউনিটি</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>

              <button
                onClick={() => handleNavClick('trips')}
                className={`w-full text-left px-3.5 py-3 rounded-xl text-sm font-semibold flex items-center justify-between transition cursor-pointer touch-manipulation ${
                  currentView === 'trips'
                    ? 'bg-emerald-100 text-[#143E27]'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Compass className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>ট্রিপ প্ল্যানার ও বাজেট</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>

              <button
                onClick={() => handleNavClick('guides')}
                className={`w-full text-left px-3.5 py-3 rounded-xl text-sm font-semibold flex items-center justify-between transition cursor-pointer touch-manipulation ${
                  currentView === 'guides'
                    ? 'bg-emerald-100 text-[#143E27]'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>ভ্রমণ সহায়িকা ও রুট</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>

              <button
                onClick={() => handleNavClick('team')}
                className={`w-full text-left px-3.5 py-3 rounded-xl text-sm font-semibold flex items-center justify-between transition cursor-pointer touch-manipulation ${
                  currentView === 'team'
                    ? 'bg-emerald-100 text-[#143E27]'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>আমাদের টিম ও গবেষক প্যানেল</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>

              <button
                onClick={() => handleNavClick('about')}
                className={`w-full text-left px-3.5 py-3 rounded-xl text-sm font-semibold flex items-center justify-between transition cursor-pointer touch-manipulation ${
                  currentView === 'about'
                    ? 'bg-emerald-100 text-[#143E27]'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Info className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>আমাদের সম্পর্কে</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>

              <button
                onClick={() => handleNavClick('contact')}
                className={`w-full text-left px-3.5 py-3 rounded-xl text-sm font-semibold flex items-center justify-between transition cursor-pointer touch-manipulation ${
                  currentView === 'contact'
                    ? 'bg-emerald-100 text-[#143E27]'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Send className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>যোগাযোগ ও মতামত</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>

              {isAdmin ? (
                <div className="space-y-2 mt-3 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleNavClick('admin');
                    }}
                    className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold bg-[#143E27] text-white flex items-center justify-between shadow-xs cursor-pointer touch-manipulation"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0" />
                      <span className="truncate">{adminName || 'মো. সাব্বির হোসেন'}</span>
                    </div>
                    <span className="text-[10px] bg-emerald-700 text-emerald-100 px-2 py-0.5 rounded font-mono shrink-0">
                      {isSuperAdmin ? 'Super Admin' : 'Editor'}
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      signOut();
                    }}
                    className="w-full py-2 px-3 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 flex items-center justify-center gap-1.5 transition cursor-pointer touch-manipulation"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>লগআউট করুন</span>
                  </button>
                </div>
              ) : user ? (
                <div className="space-y-2 mt-3 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleNavClick('profile');
                    }}
                    className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold bg-[#143E27] text-white flex items-center justify-between shadow-xs cursor-pointer touch-manipulation"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <User className="w-4 h-4 text-emerald-300 shrink-0" />
                      <span className="truncate">{userProfile?.displayName || user.displayName || 'আমার প্রোফাইল'}</span>
                    </div>
                    <span className="text-[10px] bg-emerald-700 text-emerald-100 px-2 py-0.5 rounded shrink-0">
                      ভ্রমণকারী
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      signOut();
                    }}
                    className="w-full py-2 px-3 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 flex items-center justify-center gap-1.5 transition cursor-pointer touch-manipulation"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>লগআউট করুন</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2 mt-3 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      if (onOpenUserAuth) onOpenUserAuth();
                      else onOpenAdminLogin();
                    }}
                    className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold bg-[#143E27] text-white flex items-center justify-between shadow-xs cursor-pointer touch-manipulation"
                  >
                    <div className="flex items-center gap-2">
                      <LogIn className="w-4 h-4 text-emerald-300 shrink-0" />
                      <span>লগইন / রেজিস্টার করুন</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-emerald-300" />
                  </button>

                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAdminLogin();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:text-emerald-900 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-gray-400" />
                    <span>অ্যাডমিন প্যানেলে লগইন</span>
                  </button>
                </div>
              )}
            </div>

            {/* Direct Contact Action in Drawer Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/90 space-y-2 shrink-0">
              <a
                href="tel:+8801944460344"
                className="w-full py-2.5 px-3 rounded-xl bg-white border border-emerald-200 text-emerald-900 font-bold text-xs flex items-center justify-center gap-2 hover:bg-emerald-50 transition shadow-2xs font-sans touch-manipulation"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>কল করুন: +8801944460344</span>
              </a>
              <div className="text-[11px] text-gray-400 text-center font-sans">
                শেরপুর ভ্রমণ গাইড • Sherpur Travel Guide
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
