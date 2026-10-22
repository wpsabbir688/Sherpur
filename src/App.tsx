import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { HomePage } from './pages/HomePage';
import { PlacesPage } from './pages/PlacesPage';
import { DestinationDetailPage } from './pages/DestinationDetailPage';
import { UpazilasPage } from './pages/UpazilasPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { GuidesPage } from './pages/GuidesPage';
import { CommunityPage } from './pages/CommunityPage';
import { TripPlannerPage } from './pages/TripPlannerPage';
import { SherpurMapPage } from './pages/SherpurMapPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { PublicTeamPage } from './pages/PublicTeamPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminLoginModal } from './pages/admin/AdminLoginModal';
import { UserAuthModal } from './components/common/UserAuthModal';
import { FloatingChatWidget } from './components/common/FloatingChatWidget';
import { NotFoundPage } from './pages/NotFoundPage';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Destination, Category, EventNotification } from './types';
import { getDestinations } from './services/destinationService';
import { getCategories } from './services/categoryService';
import { getNotifications, getReadNotificationIds } from './services/notificationService';
import { NotificationDrawer } from './components/notifications/NotificationDrawer';
import { FestivalAlertBanner } from './components/notifications/FestivalAlertBanner';
import { testConnection } from './lib/firebase/config';
import { updateMetaTags } from './utils/seo';
import { startPresenceHeartbeat, recordPageView } from './services/analyticsService';

function AppContent() {
  const { user, isAdmin } = useAuth();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Notifications & Festivals state
  const [notifications, setNotifications] = useState<EventNotification[]>([]);
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);

  // Routing state
  const [currentView, setCurrentView] = useState<string>('home');
  const [viewParam, setViewParam] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isUserAuthModalOpen, setIsUserAuthModalOpen] = useState(false);

  // Load festival & event notifications
  const loadNotifications = useCallback(async () => {
    try {
      const list = await getNotifications(true);
      setNotifications(list);
      setReadNotificationIds(getReadNotificationIds());
    } catch (e) {
      console.error('Error loading notifications:', e);
    }
  }, []);

  // Load initial data from Firestore / fallback
  const loadData = useCallback(async () => {
    try {
      const [dests, cats] = await Promise.all([
        getDestinations(true), // include drafts for admin view if authenticated
        getCategories(),
      ]);
      setDestinations(dests);
      setCategories(cats);
    } catch (e) {
      console.error('Error loading data:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Google Maps Platform Quota Defense listener state
  const [isGmpQuotaExceeded, setIsGmpQuotaExceeded] = useState(false);

  useEffect(() => {
    testConnection();
    loadData();
    loadNotifications();
    const stopHeartbeat = startPresenceHeartbeat();

    const handleQuotaExceeded = () => setIsGmpQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuotaExceeded);

    return () => {
      stopHeartbeat();
      window.removeEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    };
  }, [loadData, loadNotifications]);

  // URL Path router sync (Clean HTML5 History API - no '#' in URLs)
  const parsePath = useCallback(() => {
    // If user arrived with an old hash URL (e.g. /#places or /#admin/team), smoothly migrate to clean path
    if (window.location.hash && window.location.hash.length > 1) {
      const rawHash = window.location.hash.replace(/^#\/?/, '');
      if (rawHash && !rawHash.startsWith('featured-')) {
        const cleanPath = `/${rawHash}`;
        window.history.replaceState(null, '', cleanPath);
      }
    }

    const pathname = window.location.pathname.replace(/^\/+|\/+$/g, '');
    if (!pathname) {
      setCurrentView('home');
      setViewParam('');
      return;
    }

    const parts = pathname.split('/');
    const mainView = parts[0];
    const subParam = parts.slice(1).join('/');

    if (mainView === 'places' && subParam) {
      setCurrentView('place-detail');
      setViewParam(subParam);
    } else if (mainView === 'profile') {
      setCurrentView('profile');
      setViewParam(subParam || '');
    } else if (['places', 'upazilas', 'map', 'categories', 'guides', 'community', 'trips', 'profile', 'team', 'about', 'contact', 'admin'].includes(mainView)) {
      setCurrentView(mainView);
      setViewParam(subParam || '');
    } else {
      setCurrentView('404');
    }
  }, []);

  useEffect(() => {
    parsePath();
    window.addEventListener('popstate', parsePath);
    window.addEventListener('hashchange', parsePath);
    return () => {
      window.removeEventListener('popstate', parsePath);
      window.removeEventListener('hashchange', parsePath);
    };
  }, [parsePath]);

  // Navigate helper (Clean URLs like /places, /community, /trips, /profile, /places/madhutila-eco-park)
  const navigate = (view: string, param?: string) => {
    let newPath = '/';
    if (view === 'home') {
      newPath = '/';
    } else if (view === 'place-detail' && param) {
      newPath = `/places/${param}`;
    } else if (view === 'profile' && param) {
      newPath = `/profile/${param}`;
    } else if (view === 'profile') {
      newPath = '/profile';
    } else if (param) {
      newPath = `/${view}/${param}`;
    } else {
      newPath = `/${view}`;
    }

    if (window.location.pathname !== newPath || window.location.hash) {
      window.history.pushState(null, '', newPath);
    }
    setCurrentView(view);
    setViewParam(param || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // SEO Update on View Change
  useEffect(() => {
    if (currentView === 'home') {
      updateMetaTags(
        'শেরপুর ভ্রমণ গাইড | Sherpur Travel Guide',
        'শেরপুরের পাহাড়, বন, নদী ও লুকিয়ে থাকা সৌন্দর্য আবিষ্কার করুন। নিখুঁত তথ্য ও ভ্রমণ সহায়িকা।'
      );
    } else if (currentView === 'places') {
      updateMetaTags(
        'সকল দর্শনীয় স্থান | শেরপুর ভ্রমণ গাইড',
        'শেরপুর জেলার সকল পর্যটন আকর্ষণ, পাহাড়, ইকোপার্ক ও ঐতিহাসিক স্থানসমূহের বিস্তারিত তালিকা।'
      );
    } else if (currentView === 'place-detail' && viewParam) {
      const dest = destinations.find((d) => d.slug === viewParam);
      if (dest) {
        updateMetaTags(
          `${dest.titleBn} | শেরপুর ভ্রমণ গাইড`,
          dest.summaryBn || 'শেরপুরের আকর্ষণীয় পর্যটন স্থান'
        );
      }
    } else if (currentView === 'upazilas') {
      updateMetaTags(
        'উপজেলা সমূহ | শেরপুর ভ্রমণ গাইড',
        'শেরপুর সদর, নালিতাবাড়ী, ঝিনাইগাতী, শ্রীবরদী ও নকলা উপজেলার দর্শনীয় স্থানসমূহ।'
      );
    } else if (currentView === 'community') {
      updateMetaTags(
        'ট্রাভেলার্স কমিউনিটি ও গল্প | শেরপুর ভ্রমণ গাইড',
        'শেরপুরের পাহাড় ও দর্শনীয় স্থানের আসল ভ্রমণ গল্প, পর্যটকদের অভিজ্ঞতা ও ছবি।'
      );
    } else if (currentView === 'trips') {
      updateMetaTags(
        'ট্রিপ প্ল্যানার ও বাজেট ক্যালকুলেটর | শেরপুর ভ্রমণ গাইড',
        'শেরপুর জেলার ১ ও ২ দিনের সেরা ভ্রমণ পরিকল্পনা, দিনভিত্তিক রুট ও বাজেট।'
      );
    } else if (currentView === 'profile') {
      updateMetaTags(
        'ভ্রমণকারী প্রোফাইল | শেরপুর ভ্রমণ গাইড',
        'সংরক্ষিত স্থান ও শেরপুর ট্রাভেল কমিউনিটিতে আপনার অবদান ও গল্প।'
      );
    } else if (currentView === 'guides') {
      updateMetaTags(
        'ভ্রমণ সহায়িকা ও রুট | শেরপুর ভ্রমণ গাইড',
        'ঢাকা থেকে শেরপুর যাতায়াত এবং গারো পাহাড় সীমান্ত ভ্রমণের প্রয়োজনীয় তথ্য ও পরামর্শ।'
      );
    } else if (currentView === 'team') {
      updateMetaTags(
        'আমাদের টিম ও সম্পাদক প্যানেল | শেরপুর ভ্রমণ গাইড',
        'শেরপুর ভ্রমণ গাইডের তথ্য সংকলক, পর্যটন গবেষক ও সম্পাদকীয় পর্ষদের পরিচিতি।'
      );
    } else if (currentView === 'about') {
      updateMetaTags(
        'আমাদের সম্পর্কে | শেরপুর ভ্রমণ গাইড',
        'শেরপুর ভ্রমণ গাইডের উদ্দেশ্য, নির্ভরযোগ্য তথ্য সংকলন ও দায়িত্বশীল পর্যটন নীতি।'
      );
    } else if (currentView === 'contact') {
      updateMetaTags(
        'যোগাযোগ | শেরপুর ভ্রমণ গাইড',
        'ফোন: +8801944460344, ইমেইল: wpsabbir44@gmail.com - যেকোনো মতামত বা তথ্যের জন্য যোগাযোগ করুন।'
      );
    } else if (currentView === 'admin') {
      const pageTitle =
        viewParam === 'analytics'
          ? 'অ্যানালিটিক্স ড্যাশবোর্ড | শেরপুর ভ্রমণ গাইড'
          : viewParam === 'team'
          ? 'টিম ও সম্পাদক প্যানেল | শেরপুর ভ্রমণ গাইড'
          : viewParam === 'profile'
          ? 'অ্যাডমিন প্রোফাইল | শেরপুর ভ্রমণ গাইড'
          : 'অ্যাডমিন ড্যাশবোর্ড | শেরপুর ভ্রমণ গাইড';
      updateMetaTags(
        pageTitle,
        'শেরপুর ভ্রমণ গাইড ওয়েবসাইট ব্যবস্থাপনা ও বিজনেস ইন্টেলিজেন্স'
      );
    }
    recordPageView(window.location.pathname || '/');
  }, [currentView, viewParam, destinations]);

  // Destination selection
  const handleSelectDestination = (slug: string) => {
    navigate('place-detail', slug);
  };

  // Render view
  const renderCurrentView = () => {
    if (loading) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-emerald-200 border-t-[#143E27] animate-spin" />
          <p className="text-sm font-semibold text-[#143E27]">শেরপুরের তথ্যমালা প্রস্তুত হচ্ছে...</p>
        </div>
      );
    }

    if (currentView === 'home') {
      return (
        <HomePage
          destinations={destinations}
          categories={categories}
          onSelectDestination={handleSelectDestination}
          onNavigate={(view, param) => navigate(view, param)}
          onSearch={(query) => {
            setSearchQuery(query);
            navigate('places');
          }}
        />
      );
    }

    if (currentView === 'places') {
      return (
        <PlacesPage
          destinations={destinations}
          categories={categories}
          initialSearch={searchQuery}
          onSelectDestination={handleSelectDestination}
        />
      );
    }

    if (currentView === 'place-detail') {
      const dest = destinations.find((d) => d.slug === viewParam);
      if (!dest) {
        return <NotFoundPage onNavigate={(v) => navigate(v)} />;
      }
      return (
        <DestinationDetailPage
          destination={dest}
          allDestinations={destinations}
          categories={categories}
          onSelectDestination={handleSelectDestination}
          onBack={() => navigate('places')}
          onNavigate={(view, param) => navigate(view, param)}
        />
      );
    }

    if (currentView === 'upazilas') {
      return (
        <UpazilasPage
          destinations={destinations}
          categories={categories}
          initialUpazilaId={viewParam || 'sherpur-sadar'}
          onSelectDestination={handleSelectDestination}
        />
      );
    }

    if (currentView === 'map') {
      return (
        <SherpurMapPage
          destinations={destinations}
          categories={categories}
          onNavigate={(view, param) => navigate(view, param)}
        />
      );
    }

    if (currentView === 'categories') {
      return (
        <CategoriesPage
          destinations={destinations}
          categories={categories}
          initialCategoryId={viewParam || 'all'}
          onSelectDestination={handleSelectDestination}
        />
      );
    }

    if (currentView === 'guides') {
      return <GuidesPage />;
    }

    if (currentView === 'community') {
      return (
        <CommunityPage
          destinations={destinations}
          onSelectDestination={handleSelectDestination}
          onNavigate={(view, param) => navigate(view, param)}
          onOpenAuthModal={() => setIsUserAuthModalOpen(true)}
        />
      );
    }

    if (currentView === 'trips') {
      return (
        <TripPlannerPage
          destinations={destinations}
          onSelectDestination={handleSelectDestination}
          onNavigate={(view, param) => navigate(view, param)}
        />
      );
    }

    if (currentView === 'profile') {
      return (
        <UserProfilePage
          destinations={destinations}
          viewUsername={viewParam}
          onSelectDestination={handleSelectDestination}
          onNavigate={(view, param) => navigate(view, param)}
          onOpenAuthModal={() => setIsUserAuthModalOpen(true)}
        />
      );
    }

    if (currentView === 'team') {
      return <PublicTeamPage onNavigate={(view, param) => navigate(view, param)} />;
    }

    if (currentView === 'about') {
      return <AboutPage />;
    }

    if (currentView === 'contact') {
      return <ContactPage />;
    }

    if (currentView === 'admin') {
      if (!isAdmin) {
        return (
          <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto border border-amber-200">
              🔒
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              {viewParam === 'chat' ? 'লাইভ চ্যাট ইনবক্স অ্যাক্সেস' : 'অনুমোদিত প্রবেশাধিকার প্রয়োজন'}
            </h2>
            <p className="text-xs text-gray-600">
              {viewParam === 'chat'
                ? 'শেরপুর ভ্রমণ ডেস্কের লাইভ চ্যাট ইনবক্স দেখার জন্য অনুমোদিত অ্যাডমিন হিসেবে সাইন-ইন করুন।'
                : 'অ্যাডমিন ড্যাশবোর্ড ব্যবহারের জন্য অনুমোদিত অ্যাকাউন্ট দিয়ে সাইন-ইন করতে হবে।'}
            </p>
            <button
              onClick={() => setIsAdminLoginOpen(true)}
              className="px-6 py-2.5 rounded-xl bg-[#143E27] text-white font-bold text-xs hover:bg-[#0D2618] transition cursor-pointer shadow-xs"
            >
              অ্যাডমিন সাইন-ইন করুন
            </button>
          </div>
        );
      }
      return (
        <ErrorBoundary fallbackTitle="অ্যাডমিন ড্যাশবোর্ড লোড করতে সমস্যা হয়েছে">
          <AdminDashboard
            destinations={destinations}
            categories={categories}
            initialTab={viewParam || 'destinations'}
            onRefreshData={loadData}
            onPreviewDestination={(slug) => navigate('place-detail', slug)}
          />
        </ErrorBoundary>
      );
    }

    return <NotFoundPage onNavigate={(v) => navigate(v)} />;
  };

  const unreadNotificationsCount = notifications.filter(
    (n) => n.isActive && !readNotificationIds.includes(n.id)
  ).length;

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBFA] text-[#1D2924]">
      {isGmpQuotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-xs">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      <Header
        currentView={currentView}
        onNavigate={(view, param) => navigate(view, param)}
        onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
        onOpenUserAuth={() => setIsUserAuthModalOpen(true)}
        unreadNotificationsCount={unreadNotificationsCount}
        onOpenNotifications={() => setIsNotificationDrawerOpen(true)}
      />

      <FestivalAlertBanner
        notifications={notifications}
        onOpenNotifications={() => setIsNotificationDrawerOpen(true)}
      />

      <main className="flex-1">
        {renderCurrentView()}
      </main>

      <Footer onNavigate={(view, param) => navigate(view, param)} />

      <FloatingChatWidget onOpenAuthModal={() => setIsUserAuthModalOpen(true)} />

      <NotificationDrawer
        isOpen={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
        notifications={notifications}
        readIds={readNotificationIds}
        onRefreshNotifications={loadNotifications}
        onNavigateToUpazila={(upId) => navigate('upazilas', upId)}
      />

      <UserAuthModal
        isOpen={isUserAuthModalOpen}
        onClose={() => setIsUserAuthModalOpen(false)}
        onOpenAdminLogin={() => {
          setIsUserAuthModalOpen(false);
          setIsAdminLoginOpen(true);
        }}
      />

      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={() => {
          setIsAdminLoginOpen(false);
          navigate('admin', viewParam || undefined);
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
