import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Bell,
  X,
  Calendar,
  MapPin,
  Sparkles,
  Share2,
  Check,
  CheckCheck,
  Volume2,
  Filter,
  ExternalLink,
  Info,
} from 'lucide-react';
import { EventNotification, NotificationCategory } from '../../types';
import {
  markNotificationAsRead,
  markAllNotificationsAsRead,
  requestBrowserNotificationPermission,
  getBrowserNotificationPermission,
} from '../../services/notificationService';
import { UPAZILAS } from '../../data/initialData';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: EventNotification[];
  readIds: string[];
  onRefreshNotifications: () => void;
  onNavigateToUpazila?: (upazilaId: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  readIds,
  onRefreshNotifications,
  onNavigateToUpazila,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedUpazila, setSelectedUpazila] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<string>(getBrowserNotificationPermission());

  if (!isOpen || typeof document === 'undefined') return null;

  const handleMarkAsRead = (id: string) => {
    markNotificationAsRead(id);
    onRefreshNotifications();
  };

  const handleMarkAllRead = () => {
    markAllNotificationsAsRead(notifications.map((n) => n.id));
    onRefreshNotifications();
  };

  const handleEnablePush = async () => {
    const granted = await requestBrowserNotificationPermission();
    setPermissionStatus(granted ? 'granted' : 'denied');
  };

  const handleShare = (notif: EventNotification) => {
    const text = `🎉 শেরপুর উৎসব ও অনুষ্ঠান বিজ্ঞপ্তি:\n${notif.title}\n📍 স্থান: ${notif.location || 'শেরপুর'}\n📅 তারিখ: ${notif.startDate || ''} ${notif.endDate ? 'থেকে ' + notif.endDate : ''}\n\n${notif.message}\n\nবিস্তারিত শেরপুর ভ্রমণ গাইডে দেখুন।`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(notif.id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  const filteredNotifications = notifications.filter((item) => {
    if (!item.isActive) return false;
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'big') {
        if (!item.isBigEvent) return false;
      } else if (item.category !== selectedCategory) {
        return false;
      }
    }
    if (selectedUpazila !== 'all' && item.upazilaId !== selectedUpazila) {
      return false;
    }
    return true;
  });

  const unreadCount = notifications.filter((n) => n.isActive && !readIds.includes(n.id)).length;

  const getCategoryBadge = (category: NotificationCategory, isBig?: boolean) => {
    if (isBig) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs shrink-0">
          <Sparkles className="w-3 h-3 text-amber-600 animate-pulse" /> বড় উৎসব
        </span>
      );
    }
    switch (category) {
      case 'festival':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-200 shrink-0">
            উৎসব
          </span>
        );
      case 'fair':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-purple-100 text-purple-900 border border-purple-200 shrink-0">
            ঐতিহ্যবাহী মেলা
          </span>
        );
      case 'event':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-blue-100 text-blue-900 border border-blue-200 shrink-0">
            সাংস্কৃতিক আয়োজন
          </span>
        );
      case 'alert':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-rose-100 text-rose-900 border border-rose-200 shrink-0">
            জরুরি সতর্কতা
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-gray-100 text-gray-800 shrink-0">
            বিজ্ঞপ্তি
          </span>
        );
    }
  };

  const getUpazilaName = (upId?: string) => {
    if (!upId || upId === 'all') return 'জেলাব্যাপী';
    const found = UPAZILAS.find((u) => u.id === upId);
    return found ? found.nameBn : upId;
  };

  return createPortal(
    <div className="fixed inset-0 z-[10001] flex justify-end">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 cursor-pointer"
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <div
        className="relative w-full max-w-lg h-full bg-white shadow-2xl flex flex-col justify-between overflow-hidden z-10 transition-transform duration-300 ease-out"
        role="dialog"
        aria-modal="true"
        aria-label="শেরপুর উৎসব ও অনুষ্ঠান নোটিফিকেশন"
      >
        {/* Responsive Header */}
        <div className="p-3.5 sm:p-4 border-b border-emerald-900/40 bg-[#143E27] text-white flex items-center justify-between gap-2.5 shrink-0 shadow-sm">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-amber-300 shadow-xs shrink-0">
              <Bell className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-extrabold text-white text-sm sm:text-base leading-tight truncate">
                  উৎসব ও অনুষ্ঠান বার্তা
                </h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-400 text-emerald-950 font-black text-[10px] sm:text-xs shrink-0 shadow-2xs">
                    {unreadCount}টি নতুন
                  </span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-emerald-200/90 font-medium truncate mt-0.5">
                শেরপুর জেলার সকল মেলা, উৎসব ও উদযাপনের খবর
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 min-h-[38px] min-w-[38px] rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 text-white transition cursor-pointer touch-manipulation shrink-0 ml-1 flex items-center justify-center"
            aria-label="বন্ধ করুন"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Push Notification Bar & Mark Read Actions */}
        <div className="bg-emerald-50/90 px-3.5 sm:px-4 py-2 border-b border-emerald-100 flex items-center justify-between gap-2 shrink-0">
          {permissionStatus !== 'granted' ? (
            <button
              onClick={handleEnablePush}
              className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-emerald-800 bg-white hover:bg-emerald-100 active:bg-emerald-200 px-2.5 sm:px-3 py-1.5 rounded-lg border border-emerald-300 transition cursor-pointer shadow-2xs touch-manipulation truncate max-w-[210px] sm:max-w-none"
              title="ব্রাউজারে সরাসরি নোটিফিকেশন পেতে অন করুন"
            >
              <Volume2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">ব্রাউজার নোটিফিকেশন অন করুন</span>
            </button>
          ) : (
            <div className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium truncate">
              <Check className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
              <span className="truncate">নোটিফিকেশন সক্রিয় রয়েছে</span>
            </div>
          )}

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-gray-600 hover:text-emerald-900 active:text-emerald-950 transition ml-auto cursor-pointer touch-manipulation shrink-0 py-1"
            >
              <CheckCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>সব পড়া হয়েছে</span>
            </button>
          )}
        </div>

        {/* Responsive Category Filter Bar */}
        <div className="px-3.5 sm:px-4 py-2 border-b border-gray-100 bg-gray-50 flex items-center gap-1.5 overflow-x-auto text-xs shrink-0 scrollbar-none touch-pan-x">
          <Filter className="w-3.5 h-3.5 text-gray-400 shrink-0 ml-0.5" />
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-2.5 py-1 rounded-lg font-medium transition shrink-0 cursor-pointer touch-manipulation text-[11px] sm:text-xs ${
              selectedCategory === 'all'
                ? 'bg-[#143E27] text-white font-bold shadow-2xs'
                : 'bg-white text-gray-600 hover:bg-gray-200 border border-gray-200'
            }`}
          >
            সকল ({notifications.filter((n) => n.isActive).length})
          </button>
          <button
            onClick={() => setSelectedCategory('big')}
            className={`px-2.5 py-1 rounded-lg font-medium transition shrink-0 cursor-pointer touch-manipulation text-[11px] sm:text-xs flex items-center gap-1 ${
              selectedCategory === 'big'
                ? 'bg-amber-500 text-white font-bold shadow-2xs'
                : 'bg-white text-gray-600 hover:bg-amber-50 border border-gray-200'
            }`}
          >
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>বড় উৎসব</span>
          </button>
          <button
            onClick={() => setSelectedCategory('festival')}
            className={`px-2.5 py-1 rounded-lg font-medium transition shrink-0 cursor-pointer touch-manipulation text-[11px] sm:text-xs ${
              selectedCategory === 'festival'
                ? 'bg-[#143E27] text-white font-bold shadow-2xs'
                : 'bg-white text-gray-600 hover:bg-gray-200 border border-gray-200'
            }`}
          >
            উৎসব
          </button>
          <button
            onClick={() => setSelectedCategory('fair')}
            className={`px-2.5 py-1 rounded-lg font-medium transition shrink-0 cursor-pointer touch-manipulation text-[11px] sm:text-xs ${
              selectedCategory === 'fair'
                ? 'bg-[#143E27] text-white font-bold shadow-2xs'
                : 'bg-white text-gray-600 hover:bg-gray-200 border border-gray-200'
            }`}
          >
            ঐতিহ্যবাহী মেলা
          </button>
          <button
            onClick={() => setSelectedCategory('event')}
            className={`px-2.5 py-1 rounded-lg font-medium transition shrink-0 cursor-pointer touch-manipulation text-[11px] sm:text-xs ${
              selectedCategory === 'event'
                ? 'bg-[#143E27] text-white font-bold shadow-2xs'
                : 'bg-white text-gray-600 hover:bg-gray-200 border border-gray-200'
            }`}
          >
            সাংস্কৃতিক আয়োজন
          </button>
        </div>

        {/* Upazila Selector */}
        <div className="px-3.5 sm:px-4 py-1.5 bg-white border-b border-gray-100 flex items-center justify-between gap-2 text-xs shrink-0">
          <span className="text-gray-500 font-medium shrink-0 text-[11px] sm:text-xs">উপজেলা ফিল্টার:</span>
          <select
            value={selectedUpazila}
            onChange={(e) => setSelectedUpazila(e.target.value)}
            className="px-2.5 py-1 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 bg-gray-50 focus:outline-none focus:border-emerald-600 cursor-pointer flex-1 sm:flex-initial max-w-[210px]"
          >
            <option value="all">সমগ্র শেরপুর জেলা</option>
            {UPAZILAS.map((up) => (
              <option key={up.id} value={up.id}>
                {up.nameBn}
              </option>
            ))}
          </select>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-3.5 overscroll-contain">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-16 px-4 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
                <Bell className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-gray-800">কোনো নোটিফিকেশন পাওয়া যায়নি</h4>
              <p className="text-xs text-gray-500 max-w-xs mx-auto">
                এই ফিল্টারে বর্তমানে কোনো উৎসব বা অনুষ্ঠানের নোটিফিকেশন নেই। অন্য ফিল্টার বেছে নিন।
              </p>
            </div>
          ) : (
            filteredNotifications.map((notif) => {
              const isUnread = !readIds.includes(notif.id);
              return (
                <div
                  key={notif.id}
                  onClick={() => handleMarkAsRead(notif.id)}
                  className={`relative p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                    isUnread
                      ? 'bg-emerald-50/50 border-emerald-200 shadow-xs'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {/* Unread indicator pip */}
                  {isUnread && (
                    <span className="absolute top-3.5 right-3.5 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
                    </span>
                  )}

                  <div className="space-y-2">
                    {/* Header badges */}
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pr-6">
                      {getCategoryBadge(notif.category, notif.isBigEvent)}
                      <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full shrink-0">
                        <MapPin className="w-3 h-3 text-emerald-600" />
                        {getUpazilaName(notif.upazilaId)}
                      </span>
                    </div>

                    {/* Title */}
                    <h4 className="text-sm sm:text-base font-extrabold text-[#143E27] leading-snug">
                      {notif.title}
                    </h4>

                    {/* Location & Dates */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-gray-600 pt-0.5">
                      {notif.location && (
                        <div className="flex items-center gap-1.5 text-gray-600 truncate">
                          <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                          <span className="truncate">{notif.location}</span>
                        </div>
                      )}
                      {(notif.startDate || notif.endDate) && (
                        <div className="flex items-center gap-1.5 text-gray-600 font-sans truncate">
                          <Calendar className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                          <span className="truncate">
                            {notif.startDate} {notif.endDate ? `থেকে ${notif.endDate}` : ''}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Message */}
                    <p className="text-xs sm:text-sm text-gray-700 leading-relaxed bg-white/80 p-2.5 rounded-xl border border-gray-100 font-normal">
                      {notif.message}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-1 text-xs gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {notif.upazilaId && notif.upazilaId !== 'all' && onNavigateToUpazila && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onNavigateToUpazila(notif.upazilaId!);
                              onClose();
                            }}
                            className="inline-flex items-center gap-1 text-emerald-700 font-bold hover:underline cursor-pointer touch-manipulation text-xs shrink-0"
                          >
                            <span>উপজেলা দেখুন</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShare(notif);
                        }}
                        className="inline-flex items-center gap-1.5 text-gray-600 hover:text-emerald-800 bg-white px-2.5 py-1 rounded-lg border border-gray-200 transition cursor-pointer shadow-2xs font-medium touch-manipulation text-xs shrink-0"
                      >
                        {copiedId === notif.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700 font-bold">কপি হয়েছে!</span>
                          </>
                        ) : (
                          <>
                            <Share2 className="w-3.5 h-3.5 text-gray-500" />
                            <span>শেয়ার করুন</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 sm:p-3.5 border-t border-gray-200 bg-gray-50 flex items-center justify-between gap-2 text-[11px] text-gray-500 shrink-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <Info className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span className="truncate">অ্যাডমিন প্যানেল থেকে নতুন উৎসবের বার্তা প্রকাশ করা হয়।</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-white border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-100 transition cursor-pointer touch-manipulation shrink-0 text-xs"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
