import React, { useState, useEffect, useMemo } from 'react';
import {
  Activity,
  Users,
  Eye,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  RefreshCw,
  Smartphone,
  Monitor,
  Tablet,
  Globe,
  MapPin,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Compass,
} from 'lucide-react';
import {
  DateRangeFilter,
  DateRangePreset,
  AnalyticsSummaryMetrics,
  TrafficDataPoint,
  PageRankItem,
  DestinationRankItem,
  TrafficSourceItem,
  DeviceBreakdownItem,
  AnalyticsEvent,
  Destination,
} from '../../types';
import {
  fetchAnalyticsData,
  exportAnalyticsToCSV,
  formatInDhakaTime,
  subscribeLiveVisitors,
  ActiveSessionData,
} from '../../services/analyticsService';

interface AnalyticsDashboardViewProps {
  destinations: Destination[];
  totalTeamMembersCount: number;
  onPreviewDestination?: (slug: string) => void;
}

export const AnalyticsDashboardView: React.FC<AnalyticsDashboardViewProps> = ({
  destinations,
  totalTeamMembersCount,
  onPreviewDestination,
}) => {
  // Date filter state
  const [filter, setFilter] = useState<DateRangeFilter>({
    preset: '7d',
    startDate: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  const [customStart, setCustomStart] = useState(
    new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString().split('T')[0]
  );
  const [customEnd, setCustomEnd] = useState(new Date().toISOString().split('T')[0]);
  const [isCustomDropdownOpen, setIsCustomDropdownOpen] = useState(false);
  const [customDateError, setCustomDateError] = useState<string | null>(null);

  // Live visitors real-time
  const [liveCount, setLiveCount] = useState<number>(1);
  const [liveSessions, setLiveSessions] = useState<ActiveSessionData[]>([]);

  // Analytics query results
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<AnalyticsSummaryMetrics | null>(null);
  const [trafficChart, setTrafficChart] = useState<TrafficDataPoint[]>([]);
  const [topDestinations, setTopDestinations] = useState<DestinationRankItem[]>([]);
  const [topPages, setTopPages] = useState<PageRankItem[]>([]);
  const [sources, setSources] = useState<TrafficSourceItem[]>([]);
  const [devices, setDevices] = useState<DeviceBreakdownItem[]>([]);
  const [recentEvents, setRecentEvents] = useState<AnalyticsEvent[]>([]);

  // Chart hover state
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [activeChartMetric, setActiveChartMetric] = useState<'pageViews' | 'uniqueVisitors' | 'sessions'>('pageViews');

  // Real-time live presence subscription (5-min window)
  useEffect(() => {
    const unsubscribe = subscribeLiveVisitors((count, sessions) => {
      setLiveCount(count);
      setLiveSessions(sessions);
    });
    return () => unsubscribe();
  }, []);

  // Fetch analytics metrics whenever filter changes
  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAnalyticsData(
        filter,
        destinations,
        totalTeamMembersCount,
        liveCount
      );
      setMetrics(data.metrics);
      setTrafficChart(data.trafficChart);
      setTopDestinations(data.topDestinations);
      setTopPages(data.topPages);
      setSources(data.sources);
      setDevices(data.devices);
      setRecentEvents(data.recentEvents);
    } catch (err: any) {
      console.error('Error loading analytics:', err);
      setError('অ্যানালিটিক্স তথ্য লোড করতে সমস্যা হয়েছে। দয়া করে পুনরায় চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [filter, destinations, totalTeamMembersCount]);

  // Handle Preset Selection
  const handlePresetChange = (preset: DateRangePreset) => {
    const now = new Date();
    let sDate = '';
    const eDate = now.toISOString().split('T')[0];

    if (preset === 'today' || preset === '24h') {
      sDate = eDate;
    } else if (preset === '7d') {
      sDate = new Date(now.getTime() - 7 * 24 * 3600 * 1000).toISOString().split('T')[0];
    } else if (preset === '30d') {
      sDate = new Date(now.getTime() - 30 * 24 * 3600 * 1000).toISOString().split('T')[0];
    } else if (preset === '90d') {
      sDate = new Date(now.getTime() - 90 * 24 * 3600 * 1000).toISOString().split('T')[0];
    }

    if (preset === 'custom') {
      setIsCustomDropdownOpen(true);
    } else {
      setIsCustomDropdownOpen(false);
      setFilter({ preset, startDate: sDate, endDate: eDate });
    }
  };

  // Apply Custom Date Range
  const handleApplyCustomRange = () => {
    if (!customStart || !customEnd) {
      setCustomDateError('শুরু ও শেষের তারিখ নির্বাচন করুন');
      return;
    }
    if (new Date(customStart) > new Date(customEnd)) {
      setCustomDateError('শেষের তারিখ শুরুর তারিখের আগের হতে পারে না');
      return;
    }
    setCustomDateError(null);
    setFilter({
      preset: 'custom',
      startDate: customStart,
      endDate: customEnd,
    });
    setIsCustomDropdownOpen(false);
  };

  // CSV Export
  const handleExportCSV = () => {
    if (!metrics) return;
    exportAnalyticsToCSV(filter, {
      metrics,
      trafficChart,
      topDestinations,
      topPages,
      sources,
      devices,
    });
  };

  // Traffic Chart Maximum calculation for SVG scaling
  const maxChartVal = useMemo(() => {
    if (trafficChart.length === 0) return 20;
    const vals = trafficChart.map((d) => d[activeChartMetric]);
    const max = Math.max(...vals, 5);
    return Math.ceil(max * 1.15);
  }, [trafficChart, activeChartMetric]);

  return (
    <div className="space-y-6">
      {/* Top Header & Date Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-gray-200/90 shadow-2xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
              <Activity className="w-5 h-5 text-emerald-600 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                অ্যানালিটিক্স ড্যাশবোর্ড
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Business Intelligence
                </span>
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                শেরপুর ভ্রমণ গাইডের দর্শক উপস্থিতি, ব্রাউজিং প্রবণতা ও পর্যটন আগ্রহের পূর্ণাঙ্গ বিশ্লেষণ।
              </p>
            </div>
          </div>
        </div>

        {/* Filter Controls & Actions */}
        <div className="flex flex-wrap items-center gap-2 relative">
          {/* Preset Buttons */}
          <div className="inline-flex bg-gray-100/90 p-1 rounded-2xl border border-gray-200 text-xs font-semibold">
            {(
              [
                { id: 'today', label: 'আজ' },
                { id: '24h', label: '২৪ ঘণ্টা' },
                { id: '7d', label: '৭ দিন' },
                { id: '30d', label: '৩০ দিন' },
                { id: '90d', label: '৯০ দিন' },
                { id: 'custom', label: 'কাস্টম' },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                onClick={() => handlePresetChange(item.id)}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                  filter.preset === item.id
                    ? 'bg-white text-[#143E27] font-bold shadow-2xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Custom Date Range Picker Modal / Dropdown */}
          {isCustomDropdownOpen && (
            <div className="absolute right-0 top-12 z-40 bg-white p-4 rounded-2xl border border-gray-200 shadow-xl w-72 space-y-3">
              <div className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>তারিখ পরিসীমা নির্ধারণ (Asia/Dhaka)</span>
              </div>
              <div className="space-y-2 text-xs">
                <div>
                  <label className="text-gray-500 font-medium block mb-1">শুরুর তারিখ</label>
                  <input
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="w-full p-2 border border-gray-200 rounded-xl outline-none focus:border-emerald-600 font-mono"
                  />
                </div>
                <div>
                  <label className="text-gray-500 font-medium block mb-1">শেষের তারিখ</label>
                  <input
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="w-full p-2 border border-gray-200 rounded-xl outline-none focus:border-emerald-600 font-mono"
                  />
                </div>
                {customDateError && (
                  <p className="text-[11px] text-red-600 font-medium">{customDateError}</p>
                )}
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  onClick={() => setIsCustomDropdownOpen(false)}
                  className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  onClick={handleApplyCustomRange}
                  className="px-4 py-1.5 rounded-xl bg-[#143E27] text-white text-xs font-bold hover:bg-[#0D2618] transition cursor-pointer"
                >
                  প্রয়োগ করুন
                </button>
              </div>
            </div>
          )}

          {/* Refresh Button */}
          <button
            onClick={loadAnalytics}
            disabled={loading}
            title="রিফ্রেশ করুন"
            className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          </button>

          {/* CSV Export Button */}
          <button
            onClick={handleExportCSV}
            disabled={loading || !metrics}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#143E27] text-white text-xs font-bold hover:bg-[#0D2618] shadow-2xs transition cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV রিপোর্ট</span>
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={loadAnalytics}
            className="px-3 py-1 bg-white border border-red-200 rounded-lg text-red-700 font-bold hover:bg-red-100"
          >
            পুনরায় চেষ্টা
          </button>
        </div>
      )}

      {/* Skeleton Loading State */}
      {loading && !metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-32 bg-gray-200/80 rounded-3xl" />
          ))}
        </div>
      )}

      {/* SECTION 1.2: Analytics Summary Cards */}
      {metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {/* 1. Live Visitors Now */}
          <div className="bg-white p-5 rounded-3xl border border-gray-200/90 shadow-2xs space-y-2 hover:border-emerald-300 transition group">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                লাইভ ভিজিটর এখন
              </span>
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600"></span>
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-[#143E27] tracking-tight">
                {liveCount}
              </span>
              <span className="text-xs font-semibold text-emerald-700">জন সক্রিয়</span>
            </div>
            <p className="text-[11px] text-gray-400">গত ৫ মিনিটে সাইটে সক্রিয় ব্রাউজার</p>
          </div>

          {/* 2. Unique Users - Last 24 Hours */}
          <div className="bg-white p-5 rounded-3xl border border-gray-200/90 shadow-2xs space-y-2 hover:border-emerald-300 transition">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                ইউনিক ইউজার (২৪ ঘণ্টা)
              </span>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                {metrics.uniqueUsers24h}
              </span>
              <span className="text-xs font-medium text-gray-500">অনন্য ব্যক্তি</span>
            </div>
            <p className="text-[11px] text-gray-400">স্বতন্ত্র অজ্ঞাত ভিজিটর আইডি</p>
          </div>

          {/* 3. Unique Users - Last 7 Days */}
          <div className="bg-white p-5 rounded-3xl border border-gray-200/90 shadow-2xs space-y-2 hover:border-emerald-300 transition">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                ইউনিক ইউজার (৭ দিন)
              </span>
              <Users className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                {metrics.uniqueUsers7d}
              </span>
              <span className="text-xs font-medium text-gray-500">অনন্য ব্যক্তি</span>
            </div>
            <p className="text-[11px] text-gray-400">গত ১ সপ্তাহের সামগ্রিক দর্শক</p>
          </div>

          {/* 4. Unique Users - Last 30 Days */}
          <div className="bg-white p-5 rounded-3xl border border-gray-200/90 shadow-2xs space-y-2 hover:border-emerald-300 transition">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                ইউনিক ইউজার (৩০ দিন)
              </span>
              <Users className="w-4 h-4 text-purple-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                {metrics.uniqueUsers30d}
              </span>
              <span className="text-xs font-medium text-gray-500">অনন্য ব্যক্তি</span>
            </div>
            <p className="text-[11px] text-gray-400">মাসিক অনন্য পাঠক ভিত্তি</p>
          </div>

          {/* 5. Total Page Views & Period Comparison */}
          <div className="bg-white p-5 rounded-3xl border border-gray-200/90 shadow-2xs space-y-2 hover:border-emerald-300 transition">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                নির্বাচিত সময়ের ভিউ
              </span>
              <Eye className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                {metrics.periodPageViews}
              </span>
              {metrics.pageViewsChangePercent !== null && (
                <span
                  className={`inline-flex items-center gap-0.5 text-xs font-bold px-1.5 py-0.5 rounded-md ${
                    metrics.pageViewsChangePercent >= 0
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-red-50 text-red-600'
                  }`}
                >
                  {metrics.pageViewsChangePercent >= 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {Math.abs(metrics.pageViewsChangePercent)}%
                </span>
              )}
            </div>
            <p className="text-[11px] text-gray-400">পূর্ববর্তী সমতুল্য সময়ের তুলনায়</p>
          </div>

          {/* 6. Total Published Tourist Places */}
          <div className="bg-white p-5 rounded-3xl border border-gray-200/90 shadow-2xs space-y-2 hover:border-emerald-300 transition">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                প্রকাশিত দর্শনীয় স্থান
              </span>
              <Compass className="w-4 h-4 text-emerald-700" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-emerald-900 tracking-tight">
                {metrics.totalPublishedPlaces}
              </span>
              <span className="text-xs font-semibold text-gray-500">টি পর্যটন স্পট</span>
            </div>
            <p className="text-[11px] text-gray-400">৫টি উপজেলার পূর্ণাঙ্গ কভারেজ</p>
          </div>

          {/* 7. Tourist Places Added in Period */}
          <div className="bg-white p-5 rounded-3xl border border-gray-200/90 shadow-2xs space-y-2 hover:border-emerald-300 transition">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                এই সময়ে নতুন যুক্ত স্থান
              </span>
              <MapPin className="w-4 h-4 text-amber-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                +{metrics.placesAddedInPeriod}
              </span>
              <span className="text-xs font-semibold text-gray-500">টি নতুন</span>
            </div>
            <p className="text-[11px] text-gray-400">নির্বাচিত তারিখ পরিসীমায় সংগৃহীত</p>
          </div>

          {/* 8. Total Registered Team Members */}
          <div className="bg-white p-5 rounded-3xl border border-gray-200/90 shadow-2xs space-y-2 hover:border-emerald-300 transition">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                টিম মেম্বার ও প্রশাসক
              </span>
              <ShieldCheck className="w-4 h-4 text-[#143E27]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                {metrics.totalTeamMembers}
              </span>
              <span className="text-xs font-semibold text-gray-500">জন সক্রিয়</span>
            </div>
            <p className="text-[11px] text-gray-400">পরিচালক, এডিটর ও আঞ্চলিক স্কাউট</p>
          </div>
        </div>
      )}

      {/* SECTION 1.5: Interactive Traffic Over Time Chart */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200/90 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>ট্রাফিক ও দর্শন প্রবণতা (Traffic Over Time)</span>
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              বাংলাদেশ সময় (Asia/Dhaka) অনুযায়ী দর্শক, সেশন ও পেজ ভিউ ট্রেন্ড।
            </p>
          </div>

          {/* Chart Metric Toggle */}
          <div className="inline-flex bg-gray-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setActiveChartMetric('pageViews')}
              className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                activeChartMetric === 'pageViews'
                  ? 'bg-white text-emerald-800 shadow-2xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              পেজ ভিউ (Views)
            </button>
            <button
              onClick={() => setActiveChartMetric('uniqueVisitors')}
              className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                activeChartMetric === 'uniqueVisitors'
                  ? 'bg-white text-emerald-800 shadow-2xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              ইউনিক ভিজিটর
            </button>
            <button
              onClick={() => setActiveChartMetric('sessions')}
              className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                activeChartMetric === 'sessions'
                  ? 'bg-white text-emerald-800 shadow-2xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              সেশন (Sessions)
            </button>
          </div>
        </div>

        {/* SVG Interactive Visual Chart */}
        {trafficChart.length > 0 ? (
          <div className="space-y-3">
            <div className="relative h-64 sm:h-72 w-full pt-4">
              <svg
                viewBox="0 0 1000 240"
                className="w-full h-full overflow-visible"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#143E27" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="#143E27" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Grid lines */}
                {[0, 60, 120, 180, 240].map((y, idx) => (
                  <line
                    key={idx}
                    x1="0"
                    y1={y}
                    x2="1000"
                    y2={y}
                    stroke="#F1F5F9"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                ))}

                {/* Construct Path points */}
                {(() => {
                  const n = trafficChart.length;
                  const stepX = n > 1 ? 1000 / (n - 1) : 500;
                  const pts = trafficChart.map((d, i) => {
                    const x = i * stepX;
                    const val = d[activeChartMetric];
                    const y = 240 - (val / (maxChartVal || 1)) * 220;
                    return { x, y, data: d };
                  });

                  const lineCmd = pts.reduce(
                    (acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)},${p.y.toFixed(1)}`,
                    ''
                  );
                  const areaCmd = `${lineCmd} L 1000,240 L 0,240 Z`;

                  return (
                    <>
                      {/* Gradient Area Fill */}
                      <path d={areaCmd} fill="url(#chartGradient)" />

                      {/* Smooth Foreground Stroke */}
                      <path
                        d={lineCmd}
                        fill="none"
                        stroke="#143E27"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Interactive Point Dots */}
                      {pts.map((p, idx) => {
                        const isHovered = hoveredIndex === idx;
                        return (
                          <g key={idx}>
                            <circle
                              cx={p.x}
                              cy={p.y}
                              r={isHovered ? 6 : 3.5}
                              className="fill-white stroke-[#143E27] stroke-[2.5] cursor-pointer transition-all"
                              onMouseEnter={() => setHoveredIndex(idx)}
                              onMouseLeave={() => setHoveredIndex(null)}
                            />
                            {/* Hover Tooltip in SVG */}
                            {isHovered && (
                              <g>
                                <rect
                                  x={Math.max(Math.min(p.x - 70, 860), 0)}
                                  y={Math.max(p.y - 65, 5)}
                                  width="140"
                                  height="55"
                                  rx="10"
                                  className="fill-gray-900/95 shadow-xl"
                                />
                                <text
                                  x={Math.max(Math.min(p.x, 930), 70)}
                                  y={Math.max(p.y - 45, 25)}
                                  textAnchor="middle"
                                  className="fill-gray-300 text-[10px] font-sans"
                                >
                                  {p.data.label}
                                </text>
                                <text
                                  x={Math.max(Math.min(p.x, 930), 70)}
                                  y={Math.max(p.y - 25, 45)}
                                  textAnchor="middle"
                                  className="fill-white text-xs font-bold font-sans"
                                >
                                  {p.data[activeChartMetric]} {activeChartMetric === 'pageViews' ? 'ভিউ' : 'জন'}
                                </text>
                              </g>
                            )}
                          </g>
                        );
                      })}
                    </>
                  );
                })()}
              </svg>
            </div>

            {/* X-axis labels */}
            <div className="flex justify-between text-[11px] font-mono text-gray-400 px-1 pt-1 border-t border-gray-100">
              <span>{trafficChart[0]?.label}</span>
              {trafficChart.length > 2 && (
                <span>{trafficChart[Math.floor(trafficChart.length / 2)]?.label}</span>
              )}
              <span>{trafficChart[trafficChart.length - 1]?.label}</span>
            </div>
          </div>
        ) : (
          <div className="py-16 text-center text-xs text-gray-400">
            নির্বাচিত সময়ের জন্য এখনও কোনো ট্রাফিক রেকর্ড নেই।
          </div>
        )}
      </div>

      {/* SECTION 1.3 & 1.5: Live Visitor Presence & Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-time Live Visitors Stream */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
              </span>
              <span>লাইভ পরিদর্শক সেশন তালিকা ({liveSessions.length}টি সক্রিয়)</span>
            </h3>
            <span className="text-[11px] text-gray-400 font-mono">সর্বশেষ ৫ মিনিট উইন্ডো</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 text-gray-600 uppercase text-[10px] font-bold border-b border-gray-200">
                <tr>
                  <th className="py-2.5 px-3">সেশন আইডি</th>
                  <th className="py-2.5 px-3">বর্তমান পৃষ্ঠা (Path)</th>
                  <th className="py-2.5 px-3">ডিভাইস</th>
                  <th className="py-2.5 px-3">উৎস</th>
                  <th className="py-2.5 px-3 text-right">সর্বশেষ সংকেত</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {liveSessions.map((s, idx) => (
                  <tr key={s.sessionId || idx} className="hover:bg-gray-50/80 transition">
                    <td className="py-2.5 px-3 font-mono text-gray-600 truncate max-w-[120px]">
                      {s.sessionId.replace('sess_', '')}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-[#143E27]">
                      {s.currentPath || '#home'}
                    </td>
                    <td className="py-2.5 px-3 text-gray-600">
                      {s.device === 'Mobile' ? '📱 Mobile' : s.device === 'Tablet' ? '📟 Tablet' : '💻 Desktop'}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-100 text-gray-700">
                        {s.source}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right text-gray-500 font-mono text-[11px]">
                      {formatInDhakaTime(s.lastActive, 'time')}
                    </td>
                  </tr>
                ))}
                {liveSessions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-400">
                      বর্তমানে কোনো লাইভ পাবলিক ভিজিটর সক্রিয় নেই।
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Traffic Sources & Device Breakdown */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200/90 shadow-2xs space-y-6">
          {/* Traffic Sources */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              <span>ট্রাফিক উৎস (Traffic Sources)</span>
            </h4>
            <div className="space-y-2">
              {sources.map((s) => (
                <div key={s.source} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-gray-700">{s.source}</span>
                    <span className="text-gray-500 font-mono">{s.count} ভিউ ({s.percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#143E27] h-full rounded-full transition-all"
                      style={{ width: `${Math.max(s.percentage, 4)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Device Breakdown */}
          <div className="space-y-3 pt-4 border-t border-gray-100">
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
              <span>ডিভাইস বিভাজন (Device Breakdown)</span>
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {devices.map((d) => (
                <div
                  key={d.device}
                  className="p-3 rounded-2xl bg-gray-50 border border-gray-200/70 text-center space-y-1"
                >
                  <div className="text-gray-600 flex justify-center">
                    {d.device === 'Mobile' ? (
                      <Smartphone className="w-4 h-4 text-emerald-600" />
                    ) : d.device === 'Tablet' ? (
                      <Tablet className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Monitor className="w-4 h-4 text-purple-600" />
                    )}
                  </div>
                  <div className="text-xs font-bold text-gray-900">{d.percentage}%</div>
                  <div className="text-[10px] text-gray-500">{d.device}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1.5: Top Visited Places & Most Visited Pages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Tourist Places */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-700" />
              <span>শীর্ষ দর্শনীয় স্থানসমূহ (Top Places)</span>
            </h3>
            <span className="text-xs text-gray-500">ভিউ ভিত্তিতে র‍্যাংকিং</span>
          </div>

          <div className="space-y-3">
            {topDestinations.map((item, idx) => (
              <div
                key={item.id || idx}
                className="flex items-center justify-between p-3 rounded-2xl bg-gray-50/80 hover:bg-gray-100/80 transition"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-gray-900 hover:text-emerald-800 cursor-pointer">
                      {item.titleBn}
                    </h4>
                    <span className="text-[11px] text-gray-500">{item.upazilaName}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs sm:text-sm font-extrabold text-[#143E27]">
                    {item.views} <span className="text-[10px] font-normal text-gray-500">ভিউ</span>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-700">{item.percentage}% ট্রাফিক</span>
                </div>
              </div>
            ))}
            {topDestinations.length === 0 && (
              <p className="py-6 text-center text-xs text-gray-400">কোনো তথ্য পাওয়া যায়নি।</p>
            )}
          </div>
        </div>

        {/* Most Visited Pages */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-600" />
              <span>জনপ্রিয় পাবলিক পেইজসমূহ (Top Pages)</span>
            </h3>
            <span className="text-xs text-gray-500">সবচেয়ে বেশি ভিজিট</span>
          </div>

          <div className="space-y-3">
            {topPages.map((page, idx) => (
              <div
                key={page.path || idx}
                className="flex items-center justify-between p-3 rounded-2xl bg-gray-50/80 hover:bg-gray-100/80 transition"
              >
                <div className="flex-1 min-w-0 pr-4">
                  <div className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                    {page.title}
                  </div>
                  <div className="text-[11px] font-mono text-gray-400 truncate">{page.path}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs sm:text-sm font-extrabold text-blue-900">
                    {page.views} <span className="text-[10px] font-normal text-gray-500">বার</span>
                  </div>
                  <div className="text-[10px] text-gray-500">{page.uniqueVisitors} জন ভিজিটর</div>
                </div>
              </div>
            ))}
            {topPages.length === 0 && (
              <p className="py-6 text-center text-xs text-gray-400">কোনো তথ্য পাওয়া যায়নি।</p>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 1.5 & 1.6: Recent Real Activity Event Log */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>সাম্প্রতিক ওয়েবসাইট ইভেন্ট স্ট্রিম (Recent Event Stream)</span>
          </h3>
          <span className="text-xs text-gray-500">গোপনীয়তা-সংবেদনশীল নামবিহীন লগ</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 text-gray-600 uppercase text-[10px] font-bold border-b border-gray-200">
              <tr>
                <th className="py-2.5 px-3">ইভেন্ট ধরন</th>
                <th className="py-2.5 px-3">পৃষ্ঠা (Page Path)</th>
                <th className="py-2.5 px-3">অজ্ঞাত সেশন আইডি</th>
                <th className="py-2.5 px-3">ডিভাইস ও উৎস</th>
                <th className="py-2.5 px-3 text-right">বাংলাদেশ সময় (Dhaka)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentEvents.map((ev, idx) => (
                <tr key={ev.id || idx} className="hover:bg-gray-50/80 transition">
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        ev.eventType === 'destination_view'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : ev.eventType === 'page_view'
                          ? 'bg-blue-50 text-blue-800 border border-blue-200'
                          : ev.eventType === 'destination_search'
                          ? 'bg-purple-50 text-purple-800 border border-purple-200'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {ev.eventType}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-medium text-gray-800 truncate max-w-[200px]">
                    {ev.pagePath}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-gray-500 text-[11px]">
                    {(ev.sessionId || 'sess_anon').substring(0, 16)}...
                  </td>
                  <td className="py-2.5 px-3 text-gray-600">
                    {ev.device} • {ev.source}
                  </td>
                  <td className="py-2.5 px-3 text-right text-gray-500 font-mono text-[11px]">
                    {formatInDhakaTime(ev.timestamp, 'short')}
                  </td>
                </tr>
              ))}
              {recentEvents.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">
                    কোনো সাম্প্রতিক ইভেন্ট সংরক্ষিত নেই।
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
