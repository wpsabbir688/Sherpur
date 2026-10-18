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
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminLoginModal } from './pages/admin/AdminLoginModal';
import { NotFoundPage } from './pages/NotFoundPage';
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

  // Modal
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);

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

  useEffect(() => {
    testConnection();
    loadData();
    loadNotifications();
    const stopHeartbeat = startPresenceHeartbeat();
    return () => {
      stopHeartbeat();
    };
  }, [loadData, loadNotifications]);

  // URL Hash router sync
  const parseHash = useCallback(() => {
    const hash = window.location.hash.replace(/^#\/?/, '');
    if (!hash) {
      setCurrentView('home');
      setViewParam('');
      return;
    }

    const parts = hash.split('/');
    const mainView = parts[0];
    const subParam = parts.slice(1).join('/');

    if (mainView === 'places' && subParam) {
      setCurrentView('place-detail');
      setViewParam(subParam);
    } else if (['places', 'upazilas', 'categories', 'guides', 'about', 'contact', 'admin'].includes(mainView)) {
      setCurrentView(mainView);
      setViewParam(subParam || '');
    } else {
      setCurrentView('404');
    }
  }, []);

  useEffect(() => {
    parseHash();
    window.addEventListener('hashchange', parseHash);
    return () => window.removeEventListener('hashchange', parseHash);
  }, [parseHash]);

  // Navigate helper
  const navigate = (view: string, param?: string) => {
    let newHash = '';
    if (view === 'home') {
      newHash = '';
    } else if (view === 'place-detail' && param) {
      newHash = `places/${param}`;
    } else if (param) {
      newHash = `${view}/${param}`;
    } else {
      newHash = view;
    }

    window.location.hash = newHash;
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
    } else if (currentView === 'guides') {
      updateMetaTags(
        'ভ্রমণ সহায়িকা ও রুট | শেরপুর ভ্রমণ গাইড',
        'ঢাকা থেকে শেরপুর যাতায়াত এবং গারো পাহাড় সীমান্ত ভ্রমণের প্রয়োজনীয় তথ্য ও পরামর্শ।'
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
      updateMetaTags(
        'অ্যাডমিন ড্যাশবোর্ড | শেরপুর ভ্রমণ গাইড',
        'শেরপুর ভ্রমণ গাইড ওয়েবসাইট ব্যবস্থাপনা'
      );
    }
    recordPageView(window.location.hash || '#home');
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
            <h2 className="text-2xl font-bold text-gray-900">অনুমোদিত প্রবেশাধিকার প্রয়োজন</h2>
            <p className="text-xs text-gray-600">
              অ্যাডমিন ড্যাশবোর্ড ব্যবহারের জন্য অনুমোদিত গুগল অ্যাকাউন্ট দিয়ে সাইন-ইন করতে হবে।
            </p>
            <button
              onClick={() => setIsAdminLoginOpen(true)}
              className="px-6 py-2.5 rounded-xl bg-[#143E27] text-white font-bold text-xs hover:bg-[#0D2618] transition cursor-pointer"
            >
              সাইন-ইন করুন
            </button>
          </div>
        );
      }
      return (
        <AdminDashboard
          destinations={destinations}
          categories={categories}
          onRefreshData={loadData}
          onPreviewDestination={(slug) => navigate('place-detail', slug)}
        />
      );
    }

    return <NotFoundPage onNavigate={(v) => navigate(v)} />;
  };

  const unreadNotificationsCount = notifications.filter(
    (n) => n.isActive && !readNotificationIds.includes(n.id)
  ).length;

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBFA] text-[#1D2924]">
      <Header
        currentView={currentView}
        onNavigate={(view, param) => navigate(view, param)}
        onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
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

      <NotificationDrawer
        isOpen={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
        notifications={notifications}
        readIds={readNotificationIds}
        onRefreshNotifications={loadNotifications}
        onNavigateToUpazila={(upId) => navigate('upazilas', upId)}
      />

      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={() => {
          setIsAdminLoginOpen(false);
          navigate('admin');
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
