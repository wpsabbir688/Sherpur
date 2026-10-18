import React, { useState } from 'react';
import { Sparkles, X, ChevronRight, Bell } from 'lucide-react';
import { EventNotification } from '../../types';

interface FestivalAlertBannerProps {
  notifications: EventNotification[];
  onOpenNotifications: () => void;
}

export const FestivalAlertBanner: React.FC<FestivalAlertBannerProps> = ({
  notifications,
  onOpenNotifications,
}) => {
  const [dismissed, setDismissed] = useState(false);

  // Find the most recent active big event
  const bigEvent = notifications.find((n) => n.isActive && n.isBigEvent);

  if (!bigEvent || dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-700 text-white py-1.5 sm:py-2 px-3 sm:px-6 relative shadow-xs z-30 animate-in fade-in">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-3 text-xs sm:text-sm">
        {/* Banner Left: Clickable Event info */}
        <div
          onClick={onOpenNotifications}
          className="flex items-center gap-1.5 sm:gap-2 truncate cursor-pointer group flex-1 min-w-0 touch-manipulation"
          title="উৎসবের বিস্তারিত দেখতে ক্লিক করুন"
        >
          <span className="inline-flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider shrink-0 text-amber-100 shadow-2xs">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-200 animate-spin" />
            <span className="truncate">উৎসব বার্তা</span>
          </span>

          <span className="font-bold truncate text-xs sm:text-sm text-white group-hover:underline">
            {bigEvent.title}
          </span>

          {bigEvent.startDate && (
            <span className="hidden md:inline-block text-white/90 text-xs font-sans bg-black/20 px-2 py-0.5 rounded shrink-0">
              {bigEvent.startDate}
            </span>
          )}

          <span className="hidden sm:inline-flex items-center gap-0.5 text-amber-100 font-semibold text-xs shrink-0 group-hover:translate-x-1 transition-transform">
            <span>বিস্তারিত</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* Banner Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={onOpenNotifications}
            className="px-2 sm:px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 active:bg-white/40 text-white font-bold text-xs flex items-center gap-1 transition cursor-pointer touch-manipulation"
            title="সকল উৎসব ও অনুষ্ঠান তালিকা"
          >
            <Bell className="w-3.5 h-3.5 text-amber-200 shrink-0" />
            <span className="hidden sm:inline">সব উৎসব</span>
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 sm:p-1.5 rounded-lg hover:bg-white/20 active:bg-white/30 text-white/90 hover:text-white transition cursor-pointer touch-manipulation flex items-center justify-center min-h-[28px] min-w-[28px]"
            aria-label="নোটিফিকেশন ব্যানার বন্ধ করুন"
          >
            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
