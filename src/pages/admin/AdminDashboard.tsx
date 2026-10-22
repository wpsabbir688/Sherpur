import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Copy,
  Layers,
  MapPin,
  Sparkles,
  Database,
  RefreshCw,
  Mail,
  AlertTriangle,
  Upload,
  Image as ImageIcon,
  Check,
  X,
  ExternalLink,
  Activity,
  Users,
  Smartphone,
  Monitor,
  KeyRound,
  Shield,
  Clock,
  UserPlus,
  UserCheck,
  UserX,
  Lock,
  Bell,
  Calendar,
  BarChart3,
  UserCircle,
  ChevronRight,
  LogOut,
  Menu,
  MessageCircle,
  Flag,
} from 'lucide-react';
import { Destination, Category, UpazilaId, ContactMessage, AdminUser, EventNotification, NotificationCategory } from '../../types';
import { UPAZILAS } from '../../data/initialData';
import { normalizeAdminUsername, getAdminProfile } from '../../services/adminProfileService';
import {
  saveDestination,
  deleteDestination,
  toggleDestinationStatus,
  seedInitialDestinations,
} from '../../services/destinationService';
import {
  saveCategory,
  deleteCategory,
  seedInitialCategories,
} from '../../services/categoryService';
import { getContactMessages, deleteContactMessage } from '../../services/contactService';
import {
  getNotifications,
  saveNotification,
  deleteNotification,
} from '../../services/notificationService';
import { useAuth } from '../../context/AuthContext';
import {
  changeAdminPassword,
  getAllSubAdmins,
  createSubAdmin,
  deleteSubAdmin,
  toggleSubAdminStatus,
} from '../../services/adminAuthService';
import { subscribeLiveVisitors, ActiveSessionData } from '../../services/analyticsService';
import { AnalyticsDashboardView } from './AnalyticsDashboardView';
import { TeamManagementView } from './TeamManagementView';
import { AdminProfileView } from './AdminProfileView';
import { AdminChatInboxView } from './AdminChatInboxView';
import { CommunityModerationView } from './CommunityModerationView';
import { ErrorBoundary } from '../../components/common/ErrorBoundary';
import { getTeamMembers } from '../../services/teamService';

interface AdminDashboardProps {
  destinations: Destination[];
  categories: Category[];
  initialTab?: string;
  onRefreshData: () => Promise<void>;
  onPreviewDestination: (slug: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  destinations,
  categories,
  initialTab,
  onRefreshData,
  onPreviewDestination,
}) => {
  const { user, adminUsername, adminName, adminRole, isSuperAdmin, isEditor, signOut } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  const [activeTab, setActiveTab] = useState<
    'destinations' | 'notifications' | 'analytics' | 'team' | 'profile' | 'admins' | 'security' | 'categories' | 'messages' | 'database' | 'chat' | 'moderation'
  >((initialTab as any) || 'destinations');

  const [teamMembersCount, setTeamMembersCount] = useState<number>(4);
  const [adminProfileData, setAdminProfileData] = useState<{ fullName?: string; avatarUrl?: string } | null>(null);

  useEffect(() => {
    getTeamMembers()
      .then((list) => setTeamMembersCount(list.length))
      .catch(() => {});
  }, []);

  useEffect(() => {
    getAdminProfile(adminUsername || 'sabbir')
      .then((p) => setAdminProfileData({ fullName: p.fullName, avatarUrl: p.avatarUrl }))
      .catch(() => {});

    const handleProfileUpdate = (e: any) => {
      if (e.detail) {
        setAdminProfileData({ fullName: e.detail.fullName, avatarUrl: e.detail.avatarUrl });
      }
    };
    window.addEventListener('sherpur_profile_updated', handleProfileUpdate);
    return () => window.removeEventListener('sherpur_profile_updated', handleProfileUpdate);
  }, [adminUsername]);

  useEffect(() => {
    if (
      initialTab &&
      [
        'destinations',
        'notifications',
        'analytics',
        'team',
        'profile',
        'admins',
        'security',
        'categories',
        'messages',
        'database',
        'chat',
        'moderation',
      ].includes(initialTab)
    ) {
      setActiveTab(initialTab as any);
    }
  }, [initialTab]);

  const handleTabClick = (tab: typeof activeTab) => {
    setActiveTab(tab);
    if (window.location.pathname !== `/admin/${tab}`) {
      window.history.pushState(null, '', `/admin/${tab}`);
    }
  };


  // Event & Festival Notifications State
  const [eventNotifications, setEventNotifications] = useState<EventNotification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const [editingNotif, setEditingNotif] = useState<Partial<EventNotification> | null>(null);
  const [savingNotif, setSavingNotif] = useState(false);
  const [notifError, setNotifError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [upazilaFilter, setUpazilaFilter] = useState<string>('all');

  // Form modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDestination, setEditingDestination] = useState<Partial<Destination> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete modal state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Category modal state
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);

  // Messages state
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Sub-Admins state (Super Admin only)
  const [subAdmins, setSubAdmins] = useState<AdminUser[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminUsername, setNewAdminUsername] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [createAdminLoading, setCreateAdminLoading] = useState(false);
  const [createAdminError, setCreateAdminError] = useState<string | null>(null);
  const [createAdminSuccess, setCreateAdminSuccess] = useState<string | null>(null);

  // Analytics Real-Time state
  const [liveVisitorsCount, setLiveVisitorsCount] = useState<number>(1);

  // Password Change state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passChangeLoading, setPassChangeLoading] = useState(false);
  const [passChangeSuccess, setPassChangeSuccess] = useState<string | null>(null);
  const [passChangeError, setPassChangeError] = useState<string | null>(null);

  // Notification state
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Seeding state
  const [isSeeding, setIsSeeding] = useState(false);

  // Subscribe to real-time live visitors (5-min window)
  useEffect(() => {
    const unsubscribe = subscribeLiveVisitors((count: number) => {
      setLiveVisitorsCount(count);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (activeTab === 'messages') {
      loadMessages();
    } else if (activeTab === 'admins' && isSuperAdmin) {
      loadSubAdmins();
    }
  }, [activeTab, isSuperAdmin]);

  const loadMessages = async () => {
    setLoadingMessages(true);
    try {
      const msgs = await getContactMessages();
      setMessages(msgs || []);
    } catch (e) {
      console.error('Error fetching messages:', e);
    } finally {
      setLoadingMessages(false);
    }
  };

  const loadSubAdmins = async () => {
    setLoadingAdmins(true);
    try {
      const adminsList = await getAllSubAdmins();
      setSubAdmins(adminsList || []);
    } catch (e) {
      console.error('Error fetching sub-admins:', e);
    } finally {
      setLoadingAdmins(false);
    }
  };

  const loadNotificationsList = async () => {
    setLoadingNotifications(true);
    try {
      const list = await getNotifications(false);
      setEventNotifications(list);
    } catch (e) {
      console.error('Error fetching notifications:', e);
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    loadNotificationsList();
  }, []);

  const handleOpenAddNotif = () => {
    setEditingNotif({
      title: '',
      message: '',
      category: 'festival',
      upazilaId: 'all',
      location: '',
      startDate: '',
      endDate: '',
      isBigEvent: false,
      isActive: true,
    });
    setNotifError(null);
    setIsNotifModalOpen(true);
  };

  const handleEditNotif = (item: EventNotification) => {
    setEditingNotif({ ...item });
    setNotifError(null);
    setIsNotifModalOpen(true);
  };

  const handleSaveNotif = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNotif?.title?.trim()) {
      setNotifError('অনুষ্ঠানের শিরোনাম আবশ্যক।');
      return;
    }
    if (!editingNotif?.message?.trim()) {
      setNotifError('বিস্তারিত বিবরণ বা বার্তা আবশ্যক।');
      return;
    }

    setSavingNotif(true);
    try {
      await saveNotification({
        id: editingNotif.id,
        title: editingNotif.title.trim(),
        message: editingNotif.message.trim(),
        category: (editingNotif.category as NotificationCategory) || 'festival',
        upazilaId: editingNotif.upazilaId || 'all',
        location: editingNotif.location?.trim() || '',
        startDate: editingNotif.startDate?.trim() || '',
        endDate: editingNotif.endDate?.trim() || '',
        isBigEvent: !!editingNotif.isBigEvent,
        isActive: editingNotif.isActive !== undefined ? editingNotif.isActive : true,
        createdBy: adminUsername || 'sabbir',
      });
      await loadNotificationsList();
      setIsNotifModalOpen(false);
      setEditingNotif(null);
      showToast('উৎসব ও নোটিফিকেশন সংরক্ষিত হয়েছে!');
    } catch (err: any) {
      setNotifError(err?.message || 'সংরক্ষণ ব্যর্থ হয়েছে।');
    } finally {
      setSavingNotif(false);
    }
  };

  const handleDeleteNotif = async (id: string) => {
    if (!window.confirm('আপনি কি নিশ্চিতভাবে এই উৎসব নোটিফিকেশনটি মুছে ফেলতে চান?')) return;
    try {
      await deleteNotification(id);
      await loadNotificationsList();
      showToast('নোটিফিকেশন সফলভাবে মুছে ফেলা হয়েছে।');
    } catch (err: any) {
      showToast(err?.message || 'মুছে ফেলতে ব্যর্থ হয়েছে।', 'error');
    }
  };

  const handleToggleNotifStatus = async (item: EventNotification) => {
    try {
      await saveNotification({
        ...item,
        isActive: !item.isActive,
      });
      await loadNotificationsList();
      showToast(`নোটিফিকেশন ${!item.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'} করা হয়েছে।`);
    } catch (err: any) {
      showToast('স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে।', 'error');
    }
  };

  // Metrics
  const totalDestinations = destinations.length;
  const publishedCount = destinations.filter((d) => d.status === 'published').length;
  const draftCount = destinations.filter((d) => d.status === 'draft').length;
  const totalCategories = categories.length;

  // Filtered destinations
  const filteredDestinations = destinations.filter((d) => {
    if (statusFilter !== 'all' && d.status !== statusFilter) return false;
    if (upazilaFilter !== 'all' && d.upazilaId !== upazilaFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        d.titleBn.toLowerCase().includes(q) ||
        (d.titleEn && d.titleEn.toLowerCase().includes(q)) ||
        d.slug.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Handlers for Destination CRUD
  const handleOpenAddForm = () => {
    setEditingDestination({
      titleBn: '',
      titleEn: '',
      slug: '',
      summaryBn: '',
      descriptionBn: '',
      upazilaId: 'sherpur-sadar',
      categoryIds: ['hills-forests'],
      coverImage: 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=1200&q=80',
      coverImageAlt: '',
      locationName: '',
      howToGetThereBn: '',
      bestSeasonBn: 'অক্টোবর থেকে মার্চ',
      openingHours: 'সকাল ৯:০০ টা থেকে বিকেল ৫:৩০ টা',
      entryFee: 'বিনামূল্যে',
      travelTipsBn: '',
      accessibilityNotesBn: '',
      safetyNotesBn: '',
      lastVerifiedAt: new Date().toISOString().split('T')[0],
      status: isEditor ? 'draft' : 'published', // sub-admin adds place as draft or published
      isFeatured: false,
    });
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleEdit = (dest: Destination) => {
    if (!isSuperAdmin) {
      showToast('সহকারী অ্যাডমিন শুধুমাত্র নতুন স্থান যোগ করতে পারেন। বিদ্যমান স্থান সম্পাদনার অধিকার কেবল প্রধান প্রশাসকের রয়েছে।', 'error');
      return;
    }
    setEditingDestination({ ...dest });
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleDuplicate = async (dest: Destination) => {
    const newSlug = `${dest.slug}-copy-${Date.now().toString().slice(-4)}`;
    const duplicate: Partial<Destination> = {
      ...dest,
      id: undefined,
      slug: newSlug,
      titleBn: `${dest.titleBn} (অনুলিপি)`,
      status: 'draft',
      isFeatured: false,
    };
    try {
      await saveDestination(duplicate);
      await onRefreshData();
      showToast(`'${duplicate.titleBn}' ড্রাফট হিসেবে কপি করা হয়েছে।`);
    } catch (e: any) {
      showToast('কপি করতে ব্যর্থ হয়েছে।', 'error');
    }
  };

  const handleToggleStatus = async (dest: Destination) => {
    const nextStatus = dest.status === 'published' ? 'draft' : 'published';
    try {
      await toggleDestinationStatus(dest.id, nextStatus);
      await onRefreshData();
      showToast(
        nextStatus === 'published'
          ? `'${dest.titleBn}' সফলভাবে প্রকাশিত হয়েছে।`
          : `'${dest.titleBn}' ড্রাফট করা হয়েছে।`
      );
    } catch (e: any) {
      showToast('স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে।', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmId) return;
    if (!isSuperAdmin) {
      showToast('শুধুমাত্র প্রধান সুপার অ্যাডমিন স্থান মুছে ফেলতে পারবেন।', 'error');
      setDeleteConfirmId(null);
      return;
    }
    try {
      await deleteDestination(deleteConfirmId);
      await onRefreshData();
      showToast('স্থানটি সফলভাবে মুছে ফেলা হয়েছে।');
      setDeleteConfirmId(null);
    } catch (e: any) {
      showToast('মুছে ফেলতে সমস্যা হয়েছে।', 'error');
    }
  };

  const handleSaveDestination = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDestination) return;

    if (!editingDestination.titleBn?.trim()) {
      setFormError('বাংলা শিরোনাম আবশ্যক।');
      return;
    }
    if (!editingDestination.slug?.trim()) {
      setFormError('ইউআরএল স্লাগ (slug) আবশ্যক।');
      return;
    }
    if (!editingDestination.summaryBn?.trim()) {
      setFormError('সংক্ষিপ্ত বিবরণ আবশ্যক।');
      return;
    }

    if (isEditor && editingDestination.id) {
      setFormError('সহকারী অ্যাডমিন শুধুমাত্র নতুন পর্যটন স্থান যোগ করতে পারেন। বিদ্যমান স্থান সম্পাদনার অধিকার কেবল প্রধান প্রশাসকের রয়েছে।');
      return;
    }

    setIsSaving(true);
    setFormError(null);

    try {
      await saveDestination(editingDestination);
      await onRefreshData();
      setIsFormOpen(false);
      setEditingDestination(null);
      showToast(
        isEditor
          ? 'নতুন স্থানটি সফলভাবে যুক্ত করা হয়েছে!'
          : 'দর্শনীয় স্থানটি সফলভাবে সংরক্ষিত হয়েছে!'
      );
    } catch (err: any) {
      console.error('Error saving destination:', err);
      setFormError(err?.message || 'তথ্য সংরক্ষণ করতে সমস্যা হয়েছে।');
    } finally {
      setIsSaving(false);
    }
  };

  // Seeding
  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    try {
      const destCount = await seedInitialDestinations();
      const catCount = await seedInitialCategories();
      await onRefreshData();
      showToast(`সফলভাবে ${destCount}টি স্থান এবং ${catCount}টি ক্যাটাগরি ফায়ারস্টোরে সিড করা হয়েছে!`);
    } catch (e) {
      showToast('সিডিং ব্যর্থ হয়েছে।', 'error');
    } finally {
      setIsSeeding(false);
    }
  };

  // Category save
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory?.nameBn || !editingCategory?.slug) return;
    try {
      await saveCategory(editingCategory as Category);
      await onRefreshData();
      setIsCatModalOpen(false);
      setEditingCategory(null);
      showToast('ক্যাটাগরি সংরক্ষিত হয়েছে।');
    } catch (e) {
      showToast('ক্যাটাগরি সংরক্ষণে সমস্যা হয়েছে।', 'error');
    }
  };

  const handleDeleteCategory = async (catId: string) => {
    const usedCount = destinations.filter((d) => d.categoryIds?.includes(catId)).length;
    if (usedCount > 0) {
      alert(`এই ক্যাটাগরিটি ${usedCount}টি স্থানে ব্যবহৃত হচ্ছে! আগে স্থানগুলো থেকে ক্যাটাগরি সরিয়ে নিন।`);
      return;
    }
    if (confirm('আপনি কি নিশ্চিতভাবে এই ক্যাটাগরিটি মুছে ফেলতে চান?')) {
      try {
        await deleteCategory(catId);
        await onRefreshData();
        showToast('ক্যাটাগরি মুছে ফেলা হয়েছে।');
      } catch (e) {
        showToast('ক্যাটাগরি মুছতে ব্যর্থ হয়েছে।', 'error');
      }
    }
  };

  // Password change handler (Super Admin)
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassChangeError(null);
    setPassChangeSuccess(null);

    if (newPassword !== confirmPassword) {
      setPassChangeError('নতুন পাসওয়ার্ড এবং নিশ্চিতকরণ পাসওয়ার্ড মিলছে না।');
      return;
    }

    if (newPassword.length < 5) {
      setPassChangeError('পাসওয়ার্ড কমপক্ষে ৫ অক্ষরের হতে হবে।');
      return;
    }

    setPassChangeLoading(true);
    const result = await changeAdminPassword(oldPassword, newPassword);
    setPassChangeLoading(false);

    if (result.success) {
      setPassChangeSuccess('পাসওয়ার্ড সফলভাবে পরিবর্তিত ও হালনাগাদ হয়েছে!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast('পাসওয়ার্ড পরিবর্তিত হয়েছে!');
    } else {
      setPassChangeError(result.error || 'পাসওয়ার্ড পরিবর্তনে ত্রুটি হয়েছে।');
    }
  };

  // Create Sub-Admin handler (Super Admin only)
  const handleCreateSubAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateAdminError(null);
    setCreateAdminSuccess(null);

    setCreateAdminLoading(true);
    const result = await createSubAdmin({
      name: newAdminName,
      username: newAdminUsername,
      password: newAdminPassword,
    });
    setCreateAdminLoading(false);

    if (result.success) {
      setCreateAdminSuccess(
        `সহকারী অ্যাডমিন '${newAdminName}' (ইউজারনেম: ${result.admin?.username}) সফলভাবে তৈরি হয়েছে!`
      );
      setNewAdminName('');
      setNewAdminUsername('');
      setNewAdminPassword('');
      loadSubAdmins();
      showToast('নতুন সহকারী অ্যাডমিন তৈরি হয়েছে!');
    } else {
      setCreateAdminError(result.error || 'সহকারী অ্যাডমিন তৈরি করতে সমস্যা হয়েছে।');
    }
  };

  const handleDeleteSubAdmin = async (adminId: string, name: string) => {
    if (confirm(`আপনি কি নিশ্চিতভাবে '${name}' অ্যাকাউন্টটি মুছে ফেলতে চান?`)) {
      try {
        await deleteSubAdmin(adminId);
        loadSubAdmins();
        showToast('অ্যাকাউন্ট মুছে ফেলা হয়েছে।');
      } catch (e) {
        showToast('মুছতে ব্যর্থ হয়েছে।', 'error');
      }
    }
  };

  const handleToggleSubAdminStatus = async (adminId: string, currentStatus: 'active' | 'inactive') => {
    try {
      await toggleSubAdminStatus(adminId, currentStatus);
      loadSubAdmins();
      showToast('স্ট্যাটাস পরিবর্তিত হয়েছে।');
    } catch (e) {
      showToast('স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে।', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/70 pb-16">
      {/* Toast Notification */}
      {toastMsg && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-2 text-sm font-semibold transition ${
            toastMsg.type === 'success'
              ? 'bg-emerald-900 text-white border-emerald-700'
              : 'bg-red-900 text-white border-red-700'
          }`}
        >
          {toastMsg.type === 'success' ? (
            <Check className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-300" />
          )}
          <span>{toastMsg.text}</span>
        </div>
      )}

      <div className="max-w-[1600px] mx-auto px-3 sm:px-6 py-6 space-y-6">
        {/* Editor Restriction Notice Banner */}
        {isEditor && (
          <div className="bg-amber-50 border border-amber-300 rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-amber-950 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm">
                  সহকারী অ্যাডমিন অ্যাক্সেস ({adminName || adminUsername})
                </div>
                <div className="text-xs text-amber-800 mt-0.5">
                  আপনার অনুমতি শুধুমাত্র <strong>নতুন দর্শনীয় স্থান যোগ করার</strong> জন্য নির্ধারিত। ডিলিট বা ক্যাটাগরি পরিবর্তনের ক্ষমতা নেই।
                </div>
              </div>
            </div>
            <button
              onClick={handleOpenAddForm}
              className="px-4 py-2 bg-[#143E27] hover:bg-[#0D2618] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন স্থান যোগ করুন</span>
            </button>
          </div>
        )}

        {/* Mobile Top Header with Menu Toggle */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs">
          <div className="flex items-center gap-3">
            <img
              src={adminProfileData?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
              alt=""
              className="w-10 h-10 rounded-xl object-cover border border-emerald-600 shadow-2xs"
            />
            <div>
              <div className="text-xs font-extrabold text-gray-900 truncate">
                {adminProfileData?.fullName || adminName || 'মো. সাব্বির হোসেন'}
              </div>
              <div className="text-[10px] text-emerald-800 font-semibold">
                {isSuperAdmin ? 'প্রধান অ্যাডমিন (Super Admin)' : 'সহকারী এডিটর'}
              </div>
            </div>
          </div>
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition flex items-center gap-1.5 text-xs font-bold cursor-pointer"
          >
            <Menu className="w-4 h-4" />
            <span>সাইডবার মেনু</span>
          </button>
        </div>

        {/* SaaS Dashboard 2-Column: Modern Sidebar + Main Area */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Modern Sidebar (সাইডবার) */}
          <aside
            className={`w-full lg:w-72 lg:shrink-0 bg-white rounded-3xl border border-gray-200/90 shadow-sm p-4 sm:p-5 lg:sticky lg:top-24 space-y-5 ${
              mobileSidebarOpen ? 'block' : 'hidden lg:block'
            }`}
          >
            {/* Admin Profile & Avatar Card */}
            <div
              onClick={() => {
                handleTabClick('profile');
                setMobileSidebarOpen(false);
              }}
              className="flex items-center gap-3.5 p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200 hover:bg-emerald-100/70 transition cursor-pointer group"
              title="প্রোফাইল সম্পাদন করতে ক্লিক করুন"
            >
              <div className="relative shrink-0">
                <img
                  src={adminProfileData?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                  alt=""
                  className="w-12 h-12 rounded-2xl object-cover border-2 border-emerald-600 shadow-2xs group-hover:scale-105 transition-transform"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-2xs" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-extrabold text-gray-900 group-hover:text-[#143E27] truncate">
                  {adminProfileData?.fullName || adminName || 'মো. সাব্বির হোসেন'}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="inline-block text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-950">
                    {isSuperAdmin ? 'Super Admin' : 'Editor'}
                  </span>
                  <span className="text-[10px] text-gray-400 font-sans truncate">
                    @{normalizeAdminUsername(adminUsername)}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-emerald-700 opacity-60 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </div>

            {/* Navigation Group 1: মূল ব্যবস্থাপনা */}
            <div className="space-y-1">
              <div className="px-3 py-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                মূল ব্যবস্থাপনা
              </div>

              <button
                onClick={() => {
                  handleTabClick('destinations');
                  setMobileSidebarOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-between transition cursor-pointer ${
                  activeTab === 'destinations'
                    ? 'bg-[#143E27] text-white shadow-xs'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-950'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <MapPin className={`w-4 h-4 ${activeTab === 'destinations' ? 'text-emerald-300' : 'text-emerald-700'}`} />
                  <span>দর্শনীয় স্থানসমূহ</span>
                </div>
                <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                  activeTab === 'destinations' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'
                }`}>
                  {destinations.length}
                </span>
              </button>

              <button
                onClick={() => {
                  handleTabClick('notifications');
                  setMobileSidebarOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-between transition cursor-pointer ${
                  activeTab === 'notifications'
                    ? 'bg-[#143E27] text-white shadow-xs'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-950'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Bell className={`w-4 h-4 ${activeTab === 'notifications' ? 'text-amber-300' : 'text-amber-600'}`} />
                  <span>উৎসব ও নোটিশ</span>
                </div>
                <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                  activeTab === 'notifications' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-900'
                }`}>
                  {eventNotifications.length}
                </span>
              </button>
            </div>

            {/* Navigation Group 2: ইন্টেলিজেন্স ও টিম */}
            <div className="space-y-1">
              <div className="px-3 py-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                ইন্টেলিজেন্স ও টিম
              </div>

              <button
                onClick={() => {
                  handleTabClick('analytics');
                  setMobileSidebarOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-between transition cursor-pointer ${
                  activeTab === 'analytics'
                    ? 'bg-[#143E27] text-white shadow-xs'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-950'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <BarChart3 className={`w-4 h-4 ${activeTab === 'analytics' ? 'text-emerald-300' : 'text-emerald-600'}`} />
                  <span>অ্যানালিটিক্স ড্যাশবোর্ড</span>
                </div>
                <span className="flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
                  Live
                </span>
              </button>

              <button
                onClick={() => {
                  handleTabClick('team');
                  setMobileSidebarOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-between transition cursor-pointer ${
                  activeTab === 'team'
                    ? 'bg-[#143E27] text-white shadow-xs'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-950'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Users className={`w-4 h-4 ${activeTab === 'team' ? 'text-purple-300' : 'text-purple-600'}`} />
                  <span>টিম ও সম্পাদক প্যানেল</span>
                </div>
                <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                  activeTab === 'team' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'
                }`}>
                  {teamMembersCount}
                </span>
              </button>

              <button
                onClick={() => {
                  handleTabClick('profile');
                  setMobileSidebarOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-between transition cursor-pointer ${
                  activeTab === 'profile'
                    ? 'bg-[#143E27] text-white shadow-xs'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-950'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <UserCircle className={`w-4 h-4 ${activeTab === 'profile' ? 'text-emerald-300' : 'text-emerald-700'}`} />
                  <span>অ্যাডমিন প্রোফাইল</span>
                </div>
              </button>
            </div>

            {/* Navigation Group 2.5: কমিউনিটি ও লাইভ সেবা */}
            <div className="space-y-1">
              <div className="px-3 py-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                কমিউনিটি ও গ্রাহক সেবা
              </div>

              <button
                onClick={() => {
                  handleTabClick('chat');
                  setMobileSidebarOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-between transition cursor-pointer ${
                  activeTab === 'chat'
                    ? 'bg-[#143E27] text-white shadow-xs'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-950'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <MessageCircle className={`w-4 h-4 ${activeTab === 'chat' ? 'text-emerald-300' : 'text-emerald-700'}`} />
                  <span>লাইভ চ্যাট ইনবক্স</span>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded-full">
                  Live
                </span>
              </button>

              <button
                onClick={() => {
                  handleTabClick('moderation');
                  setMobileSidebarOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-between transition cursor-pointer ${
                  activeTab === 'moderation'
                    ? 'bg-[#143E27] text-white shadow-xs'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-950'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Flag className={`w-4 h-4 ${activeTab === 'moderation' ? 'text-rose-300' : 'text-rose-600'}`} />
                  <span>কমিউনিটি ও রিপোর্ট</span>
                </div>
              </button>
            </div>

            {/* Navigation Group 3: সিস্টেম ও ডেটাবেজ (Superadmin) */}
            {isSuperAdmin && (
              <div className="space-y-1">
                <div className="px-3 py-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  সিস্টেম ও কনফিগারেশন
                </div>

                <button
                  onClick={() => {
                    handleTabClick('categories');
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-between transition cursor-pointer ${
                    activeTab === 'categories'
                      ? 'bg-[#143E27] text-white shadow-xs'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-950'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Layers className={`w-4 h-4 ${activeTab === 'categories' ? 'text-blue-300' : 'text-blue-600'}`} />
                    <span>ক্যাটাগরি ব্যবস্থাপনা</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                    activeTab === 'categories' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {categories.length}
                  </span>
                </button>

                <button
                  onClick={() => {
                    handleTabClick('messages');
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-between transition cursor-pointer ${
                    activeTab === 'messages'
                      ? 'bg-[#143E27] text-white shadow-xs'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-950'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Mail className={`w-4 h-4 ${activeTab === 'messages' ? 'text-amber-300' : 'text-amber-600'}`} />
                    <span>অনুসন্ধান ও বার্তা</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                    activeTab === 'messages' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {messages.length}
                  </span>
                </button>

                <button
                  onClick={() => {
                    handleTabClick('database');
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-between transition cursor-pointer ${
                    activeTab === 'database'
                      ? 'bg-[#143E27] text-white shadow-xs'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-950'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Database className={`w-4 h-4 ${activeTab === 'database' ? 'text-indigo-300' : 'text-indigo-600'}`} />
                    <span>ডাটাবেজ ও সিডিং</span>
                  </div>
                </button>
              </div>
            )}

            {/* Sidebar Footer: Live Visitor & Public Site Link */}
            <div className="pt-4 border-t border-gray-100 space-y-2.5">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 text-emerald-900 text-xs font-bold border border-emerald-200">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
                  </span>
                  <span>লাইভ ভিজিটর</span>
                </div>
                <span className="text-sm font-black">{liveVisitorsCount} জন</span>
              </div>

              <a
                href="/"
                className="w-full py-2 px-3 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold flex items-center justify-center gap-2 transition"
              >
                <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
                <span>ওয়েবসাইটে ফিরে যান</span>
              </a>

              <button
                onClick={() => signOut()}
                className="w-full py-2 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-red-600" />
                <span>লগআউট</span>
              </button>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0 w-full space-y-6">
            {/* Header Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-gray-200 shadow-xs">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-[#143E27] text-xs font-bold mb-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>{isSuperAdmin ? 'সুপার অ্যাডমিন নিয়ন্ত্রণ কক্ষ' : 'কন্টেন্ট ক্রিয়েটর ড্যাশবোর্ড'}</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-[#143E27]">
                  {activeTab === 'destinations' && 'দর্শনীয় স্থানসমূহ ব্যবস্থাপনা'}
                  {activeTab === 'analytics' && 'অ্যানালিটিক্স ও বিজনেস ইন্টেলিজেন্স'}
                  {activeTab === 'team' && 'টিম মেম্বার ও সম্পাদক প্যানেল'}
                  {activeTab === 'profile' && 'অ্যাডমিন প্রোফাইল ও নিরাপত্তা'}
                  {activeTab === 'notifications' && 'উৎসব ও নোটিফিকেশন সেন্টার'}
                  {activeTab === 'categories' && 'ক্যাটাগরি সমূহ ব্যবস্থাপনা'}
                  {activeTab === 'messages' && 'ব্যবহারকারীদের অনুসন্ধান ও বার্তা'}
                  {activeTab === 'database' && 'ক্লাউড ডাটাবেজ ব্যাকআপ ও সিডিং'}
                  {activeTab === 'chat' && 'লাইভ চ্যাট ইনবক্স ও গ্রাহক সহায়তা'}
                  {activeTab === 'moderation' && 'কমিউনিটি ও কনটেন্ট মডারেশন'}
                </h1>
                <p className="text-xs text-gray-500 mt-0.5">
                  অ্যাডমিন: <strong className="text-gray-800">{adminProfileData?.fullName || adminName || 'মো. সাব্বির হোসেন'}</strong> &nbsp;•&nbsp; 
                  পদবী: <span className="font-semibold text-emerald-800">{isSuperAdmin ? 'প্রধান অ্যাডমিন (Super Admin)' : 'সহকারী এডিটর'}</span>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  onClick={() => onRefreshData().then(() => showToast('তথ্য রিফ্রেশ হয়েছে!'))}
                  className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 transition cursor-pointer"
                  title="ডাটাবেজ রিফ্রেশ"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                {activeTab === 'destinations' && (
                  <button
                    onClick={handleOpenAddForm}
                    className="px-4 py-2.5 rounded-xl bg-[#143E27] hover:bg-[#0D2618] text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>নতুন স্থান যোগ করুন</span>
                  </button>
                )}
              </div>
            </div>

            {/* Quick Metrics Bar in Content Area (Only for Destinations) */}
            {activeTab === 'destinations' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white p-4 rounded-2xl border border-gray-200/90 shadow-2xs">
                  <div className="text-[11px] text-gray-500 font-semibold">মোট দর্শনীয় স্থান</div>
                  <div className="text-2xl font-black text-[#143E27] mt-0.5">{totalDestinations}টি</div>
                  <div className="text-[10px] text-emerald-700 font-medium">৫টি উপজেলায় বিস্তৃত</div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-gray-200/90 shadow-2xs">
                  <div className="text-[11px] text-gray-500 font-semibold">প্রকাশিত স্থান</div>
                  <div className="text-2xl font-black text-emerald-600 mt-0.5">{publishedCount}টি</div>
                  <div className="text-[10px] text-gray-400 font-medium">পাবলিক ভিউতে সচল</div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-gray-200/90 shadow-2xs">
                  <div className="text-[11px] text-gray-500 font-semibold">ড্রাফট বা পর্যালোচনায়</div>
                  <div className="text-2xl font-black text-amber-600 mt-0.5">{draftCount}টি</div>
                  <div className="text-[10px] text-gray-400 font-medium">অপ্রকাশিত অবস্থায় আছে</div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-gray-200/90 shadow-2xs">
                  <div className="text-[11px] text-gray-500 font-semibold">টিম মেম্বার</div>
                  <div className="text-2xl font-black text-purple-600 mt-0.5">{teamMembersCount} জন</div>
                  <div className="text-[10px] text-gray-400 font-medium">সম্পাদকীয় বোর্ডে যুক্ত</div>
                </div>
              </div>
            )}

      {/* Tab 1: Destinations Table */}
      {activeTab === 'destinations' && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="নাম বা স্লাগ দিয়ে ফিল্টার করুন..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm outline-none focus:border-emerald-600"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="py-2 px-3 rounded-xl border border-gray-200 text-xs sm:text-sm bg-white outline-none"
            >
              <option value="all">সকল স্ট্যাটাস</option>
              <option value="published">প্রকাশিত ({publishedCount})</option>
              <option value="draft">ড্রাফট ({draftCount})</option>
            </select>
            <select
              value={upazilaFilter}
              onChange={(e) => setUpazilaFilter(e.target.value)}
              className="py-2 px-3 rounded-xl border border-gray-200 text-xs sm:text-sm bg-white outline-none"
            >
              <option value="all">সকল উপজেলা</option>
              {UPAZILAS.map((up) => (
                <option key={up.id} value={up.id}>
                  {up.nameBn}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="min-w-[620px] w-full text-left text-xs sm:text-sm">
                <thead className="bg-gray-50 text-gray-600 uppercase text-[11px] font-bold border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4">ছবি ও স্থানের নাম</th>
                    <th className="py-3 px-4">উপজেলা</th>
                    <th className="py-3 px-4">স্ট্যাটাস</th>
                    <th className="py-3 px-4">ফিচার্ড</th>
                    <th className="py-3 px-4">তথ্য যাচাই</th>
                    <th className="py-3 px-4 text-right">পদক্ষেপ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredDestinations.map((dest) => {
                    const upazila = UPAZILAS.find((u) => u.id === dest.upazilaId);
                    return (
                      <tr key={dest.id} className="hover:bg-gray-50/80 transition">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={dest.coverImage || 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=100&q=80'}
                              alt=""
                              className="w-12 h-10 rounded-lg object-cover bg-gray-100 shrink-0"
                            />
                            <div>
                              <div className="font-bold text-gray-900">{dest.titleBn}</div>
                              <div className="text-[11px] text-gray-400 font-mono">{dest.slug}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {upazila ? upazila.nameBn : dest.upazilaId}
                        </td>
                        <td className="py-3 px-4">
                          {isSuperAdmin ? (
                            <button
                              onClick={() => handleToggleStatus(dest)}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition cursor-pointer ${
                                dest.status === 'published'
                                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                  : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                              }`}
                              title="ক্লিক করে স্ট্যাটাস পরিবর্তন করুন"
                            >
                              {dest.status === 'published' ? (
                                <>
                                  <CheckCircle className="w-3 h-3 text-emerald-600" /> প্রকাশিত
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-3 h-3 text-amber-600" /> ড্রাফট
                                </>
                              )}
                            </button>
                          ) : (
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                dest.status === 'published'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {dest.status === 'published' ? 'প্রকাশিত' : 'ড্রাফট'}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {dest.isFeatured ? (
                            <span className="text-amber-600 font-bold text-xs flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5" /> হ্যাঁ
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">না</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-gray-500 text-xs">
                          {dest.lastVerifiedAt || 'যাচাইযোগ্য'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onPreviewDestination(dest.slug)}
                              className="p-1.5 rounded-lg text-gray-500 hover:text-emerald-700 hover:bg-gray-100 transition"
                              title="ওয়েবসাইটে প্রিভিউ দেখুন"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {isSuperAdmin ? (
                              <>
                                <button
                                  onClick={() => handleEdit(dest)}
                                  className="p-1.5 rounded-lg text-gray-500 hover:text-blue-700 hover:bg-gray-100 transition"
                                  title="সম্পাদনা করুন"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDuplicate(dest)}
                                  className="p-1.5 rounded-lg text-gray-500 hover:text-amber-700 hover:bg-gray-100 transition"
                                  title="অনুলিপি তৈরি করুন"
                                >
                                  <Copy className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setDeleteConfirmId(dest.id)}
                                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                                  title="মুছে ফেলুন"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <span className="text-[10px] text-gray-400 font-medium px-1">
                                ভিউ অনলি
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredDestinations.length === 0 && (
              <div className="p-8 text-center text-gray-500 text-sm">
                কোনো দর্শনীয় স্থান খুঁজে পাওয়া যায়নি।
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Festival and Event Notifications Management */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-3xl border border-gray-200 shadow-xs">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>শেরপুর উৎসব ও বিশেষ আয়োজন বার্তা</span>
              </div>
              <h2 className="text-lg sm:text-2xl font-extrabold text-[#143E27]">
                উৎসব ও অনুষ্ঠান নোটিফিকেশন ব্যবস্থাপনা
              </h2>
              <p className="text-xs text-gray-500 max-w-xl">
                কোনো উপজেলায় মেলা, ওয়ানগালা, বৈশাখী উৎসব, গ্রামীণ ক্রীড়া প্রতিযোগিতা বা ধর্মীয় অনুষ্ঠান থাকলে এখানে নোটিফিকেশন যুক্ত করুন। ওয়েবসাইট ভিজিটররা তাৎক্ষণিকভাবে নোটিফিকেশন ও অ্যালার্ট দেখতে পাবেন।
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <button
                onClick={loadNotificationsList}
                className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 transition shrink-0"
                title="রিফ্রেশ"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={handleOpenAddNotif}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs cursor-pointer flex-1 sm:flex-initial"
              >
                <Plus className="w-4 h-4" />
                <span>নতুন উৎসব নোটিফিকেশন</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
              <div className="text-xs text-gray-500 font-medium">মোট নোটিফিকেশন</div>
              <div className="text-2xl font-extrabold text-[#143E27] mt-1">{eventNotifications.length}টি</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
              <div className="text-xs text-gray-500 font-medium">সক্রিয় (ওয়েবসাইটে দৃশ্যমান)</div>
              <div className="text-2xl font-extrabold text-emerald-600 mt-1">
                {eventNotifications.filter((n) => n.isActive).length}টি
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
              <div className="text-xs text-gray-500 font-medium">বড় উৎসব (টপ ব্যানার অ্যালার্ট)</div>
              <div className="text-2xl font-extrabold text-amber-600 mt-1">
                {eventNotifications.filter((n) => n.isBigEvent).length}টি
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
              <div className="text-xs text-gray-500 font-medium">উপজেলা কভারেজ</div>
              <div className="text-2xl font-extrabold text-blue-600 mt-1">৫টি উপজেলা</div>
            </div>
          </div>

          {/* Table / List */}
          <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-gray-50 text-gray-500 text-[11px] uppercase tracking-wider font-bold border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4">উৎসব/অনুষ্ঠানের শিরোনাম</th>
                    <th className="py-3 px-4">ক্যাটাগরি</th>
                    <th className="py-3 px-4">উপজেলা ও স্থান</th>
                    <th className="py-3 px-4">তারিখ</th>
                    <th className="py-3 px-4 text-center">বড় উৎসব</th>
                    <th className="py-3 px-4 text-center">ওয়েবসাইটে স্ট্যাটাস</th>
                    <th className="py-3 px-4 text-right">পদক্ষেপ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {eventNotifications.map((notif) => {
                    const upazila = UPAZILAS.find((u) => u.id === notif.upazilaId);
                    return (
                      <tr key={notif.id} className="hover:bg-gray-50/80 transition">
                        <td className="py-3 px-4">
                          <div className="font-bold text-gray-900 max-w-xs">{notif.title}</div>
                          <div className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                            {notif.message}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                            {notif.category === 'festival'
                              ? 'উৎসব'
                              : notif.category === 'fair'
                              ? 'ঐতিহ্যবাহী মেলা'
                              : notif.category === 'event'
                              ? 'সাংস্কৃতিক অনুষ্ঠান'
                              : notif.category === 'alert'
                              ? 'সতর্কতা'
                              : 'বিজ্ঞপ্তি'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          <div className="font-semibold text-emerald-900">
                            {upazila ? upazila.nameBn : notif.upazilaId === 'all' ? 'সমগ্র জেলা' : notif.upazilaId}
                          </div>
                          {notif.location && (
                            <div className="text-[11px] text-gray-400 truncate max-w-[150px]">
                              {notif.location}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 font-sans text-xs text-gray-600">
                          {notif.startDate || '—'} {notif.endDate ? `থেকে ${notif.endDate}` : ''}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {notif.isBigEvent ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                              <Sparkles className="w-3 h-3" /> হ্যাঁ
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">না</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleToggleNotifStatus(notif)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition cursor-pointer ${
                              notif.isActive
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                            title="ক্লিক করে দৃশ্যমান বা অদৃশ্য করুন"
                          >
                            {notif.isActive ? (
                              <>
                                <CheckCircle className="w-3 h-3 text-emerald-600" /> সক্রিয়
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3 text-gray-400" /> নিষ্ক্রিয়
                              </>
                            )}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleEditNotif(notif)}
                              className="p-1.5 rounded-lg text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 transition cursor-pointer"
                              title="সম্পাদনা করুন"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteNotif(notif.id)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                              title="মুছে ফেলুন"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {eventNotifications.length === 0 && (
              <div className="p-12 text-center text-gray-500 text-sm space-y-2">
                <Bell className="w-8 h-8 text-gray-300 mx-auto" />
                <p>বর্তমানে কোনো উৎসব নোটিফিকেশন যুক্ত নেই।</p>
                <button
                  onClick={handleOpenAddNotif}
                  className="text-emerald-700 font-bold hover:underline cursor-pointer"
                >
                  প্রথম নোটিফিকেশন যোগ করুন
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Sub-Admin Creation & Management (Super Admin Only) */}
      {activeTab === 'admins' && isSuperAdmin && (
        <div className="space-y-8">
          {/* Create Sub-Admin Form */}
          <div className="max-w-2xl bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xs space-y-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold">
                <UserPlus className="w-3.5 h-3.5" /> শুধুমাত্র প্রধান অ্যাডমিন অনুমোদিত
              </div>
              <h2 className="text-xl font-bold text-[#143E27]">
                নতুন সহকারী অ্যাডমিন (কন্টেন্ট ক্রিয়েটর) তৈরি করুন
              </h2>
              <p className="text-xs text-gray-500 leading-relaxed">
                তৈরি করা নতুন অ্যাডমিনরা তাদের ইউজারনেম ও পাসওয়ার্ড দিয়ে লগইন করে <strong>শুধুমাত্র নতুন দর্শনীয় স্থান যোগ করতে পারবে</strong>। তারা কোনো স্থান বা ক্যাটাগরি ডিলিট করতে পারবে না।
              </p>
            </div>

            {createAdminSuccess && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-semibold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{createAdminSuccess}</span>
              </div>
            )}

            {createAdminError && (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{createAdminError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubAdmin} className="space-y-4 text-xs sm:text-sm">
              <div className="space-y-1.5">
                <label className="font-bold text-gray-700">
                  সহকারী অ্যাডমিনের নাম <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newAdminName}
                  onChange={(e) => setNewAdminName(e.target.value)}
                  placeholder="যেমন: আহমদ হাসান বা শেরপুর এডিটর"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-gray-700">
                    ইউজারনেম (Username) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newAdminUsername}
                    onChange={(e) => setNewAdminUsername(e.target.value)}
                    placeholder="যেমন: hasan বা editor1"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none font-mono text-xs"
                  />
                  <span className="text-[11px] text-gray-400">লগইনের সময় এই ইউজারনেম ব্যবহার করবে</span>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-gray-700">
                    লগইন পাসওয়ার্ড <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    placeholder="কমপক্ষে ৪ অক্ষর"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none"
                  />
                </div>
              </div>

              {/* Role Indicator */}
              <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-600 flex items-center justify-between">
                <div>
                  <div className="font-bold text-gray-800">নির্ধারিত ভূমিকা:</div>
                  <div className="text-[11px] text-emerald-800">সহকারী অ্যাডমিন (কন্টেন্ট ক্রিয়েটর)</div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 text-[11px] font-bold">
                  শুধু স্থান যোগের অনুমতি
                </span>
              </div>

              <button
                type="submit"
                disabled={createAdminLoading}
                className="px-6 py-3 rounded-xl bg-[#143E27] hover:bg-[#0D2618] text-white font-bold text-sm transition shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <UserPlus className="w-4 h-4" />
                <span>{createAdminLoading ? 'তৈরি করা হচ্ছে...' : 'সহকারী অ্যাডমিন তৈরি করুন'}</span>
              </button>
            </form>
          </div>

          {/* Sub-Admins List Table */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#143E27]">
                  বিদ্যমান সহকারী অ্যাডমিন তালিকা ({subAdmins.length} জন)
                </h3>
                <p className="text-xs text-gray-500">
                  যাঁরা লগইন করে পর্যটন স্থান যোগ করতে পারেন।
                </p>
              </div>
              <button
                onClick={loadSubAdmins}
                className="text-xs text-emerald-800 font-semibold hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" /> রিফ্রেশ
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-[550px] w-full text-left text-xs sm:text-sm">
                <thead className="bg-gray-50 text-gray-600 uppercase text-[11px] font-bold border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4">নাম ও ইউজারনেম</th>
                    <th className="py-3 px-4">ভূমিকা / অনুমতি</th>
                    <th className="py-3 px-4">স্ট্যাটাস</th>
                    <th className="py-3 px-4">তৈরির তারিখ</th>
                    <th className="py-3 px-4 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {/* Super Admin Sabbir (Default) */}
                  <tr className="bg-emerald-50/40">
                    <td className="py-3 px-4">
                      <div className="font-bold text-gray-900">প্রধান প্রশাসক (সুপার অ্যাডমিন)</div>
                      <div className="text-xs text-gray-500 font-mono">sabbir</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold text-xs">
                        সর্বময় ক্ষমতা (Superadmin)
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-emerald-700 font-bold text-xs flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5" /> সক্রিয়
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-400">মূল অ্যাডমিন</td>
                    <td className="py-3 px-4 text-right text-xs text-gray-400 font-medium">
                      স্থায়ী মূল একাউন্ট
                    </td>
                  </tr>

                  {/* Sub-Admins */}
                  {subAdmins.map((adm) => (
                    <tr key={adm.id} className="hover:bg-gray-50/80">
                      <td className="py-3 px-4">
                        <div className="font-bold text-gray-900">{adm.name}</div>
                        <div className="text-xs text-gray-500 font-mono">{adm.username}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 text-[11px] font-semibold border border-blue-200">
                          শুধু নতুন স্থান যোগের অনুমতি (Editor)
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleSubAdminStatus(adm.id, adm.status)}
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold transition cursor-pointer ${
                            adm.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                        >
                          {adm.status === 'active' ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-500">
                        {adm.createdAt ? new Date(adm.createdAt).toLocaleDateString('bn-BD') : 'সংযোজিত'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeleteSubAdmin(adm.id, adm.name)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {subAdmins.length === 0 && (
              <div className="p-6 text-center text-gray-400 text-xs">
                এখনও কোনো সহকারী অ্যাডমিন তৈরি করা হয়নি। উপরের ফরম ব্যবহার করে সহজেই নতুন সহকারী অ্যাডমিন নিয়োগ করতে পারেন।
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODULE 1: Professional Analytics Dashboard */}
      {activeTab === 'analytics' && (
        <AnalyticsDashboardView
          destinations={destinations}
          totalTeamMembersCount={teamMembersCount}
          onPreviewDestination={onPreviewDestination}
        />
      )}

      {/* MODULE 2: Team Management Page */}
      {activeTab === 'team' && (
        <TeamManagementView
          currentUsername={adminUsername}
          isSuperAdmin={isSuperAdmin}
          onRefreshData={async () => {
            await onRefreshData();
            const list = await getTeamMembers();
            setTeamMembersCount(list.length);
          }}
        />
      )}

      {/* MODULE 3: Administrator Profile Page */}
      {activeTab === 'profile' && (
        <AdminProfileView
          currentUsername={adminUsername}
          adminName={adminName}
          adminRole={adminRole}
          isSuperAdmin={isSuperAdmin}
          totalDestinationsCount={destinations.length}
        />
      )}

      {/* MODULE 3.5: Live Chat Inbox */}
      {activeTab === 'chat' && (
        <ErrorBoundary fallbackTitle="লাইভ চ্যাট ইনবক্স লোড করতে সমস্যা হয়েছে">
          <AdminChatInboxView />
        </ErrorBoundary>
      )}

      {/* MODULE 3.6: Community and Report Moderation */}
      {activeTab === 'moderation' && (
        <CommunityModerationView />
      )}

      {/* Tab 4: Security & Password Change (Super Admin Only) */}
      {activeTab === 'security' && isSuperAdmin && (
        <div className="max-w-2xl bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xs space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-[#143E27] flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-emerald-700" />
              <span>প্রধান সুপার অ্যাডমিন পাসওয়ার্ড পরিবর্তন</span>
            </h2>
            <p className="text-xs text-gray-500">
              প্রধান সুপার অ্যাডমিন (<strong className="text-gray-800">sabbir</strong>)-এর পাসওয়ার্ড পরিবর্তন করুন।
            </p>
          </div>

          {passChangeSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{passChangeSuccess}</span>
            </div>
          )}

          {passChangeError && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{passChangeError}</span>
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4 text-xs sm:text-sm">
            <div className="space-y-1.5">
              <label className="font-bold text-gray-700">বর্তমান পাসওয়ার্ড (Current Password)</label>
              <input
                type="password"
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="যেমন: Sabbir.0"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-gray-700">নতুন পাসওয়ার্ড (New Password)</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="কমপক্ষে ৫ অক্ষর"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-gray-700">নতুন পাসওয়ার্ড নিশ্চিত করুন (Confirm Password)</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="নতুন পাসওয়ার্ড পুনরায় লিখুন"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={passChangeLoading}
              className="px-6 py-3 rounded-xl bg-[#143E27] hover:bg-[#0D2618] text-white font-bold text-sm transition shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Shield className="w-4 h-4" />
              <span>{passChangeLoading ? 'আপডেট করা হচ্ছে...' : 'পাসওয়ার্ড আপডেট করুন'}</span>
            </button>
          </form>

          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 text-xs text-gray-600 space-y-1">
            <div className="font-bold text-gray-700">পাসওয়ার্ড সংক্রান্ত তথ্য:</div>
            <p>
              পাসওয়ার্ড সফলভাবে পরিবর্তিত হলে ক্লাউড ফায়ারস্টোরে সংরক্ষিত হবে। পরবর্তী সময়ে লগইন করতে আপনার নতুন পাসওয়ার্ডটি ব্যবহার করবেন।
            </p>
          </div>
        </div>
      )}

      {/* Tab 5: Categories Management (Super Admin Only) */}
      {activeTab === 'categories' && isSuperAdmin && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#143E27]">
              পর্যটন ক্যাটাগরি তালিকা
            </h2>
            <button
              onClick={() => {
                setEditingCategory({
                  nameBn: '',
                  nameEn: '',
                  slug: '',
                  descriptionBn: '',
                  icon: 'Compass',
                  order: categories.length + 1,
                });
                setIsCatModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-[#143E27] text-white text-xs font-bold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন ক্যাটাগরি</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => {
              const assignedCount = destinations.filter((d) => d.categoryIds?.includes(cat.id)).length;
              return (
                <div
                  key={cat.id}
                  className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900">{cat.nameBn}</h3>
                      <div className="text-xs text-gray-400 font-mono">{cat.slug}</div>
                    </div>
                    <span className="text-xs bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                      {assignedCount}টি স্থান
                    </span>
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed">
                    {cat.descriptionBn || 'কোনো বিবরণ নেই'}
                  </p>

                  <div className="pt-2 border-t border-gray-100 flex items-center justify-end gap-2 text-xs">
                    <button
                      onClick={() => {
                        setEditingCategory(cat);
                        setIsCatModalOpen(true);
                      }}
                      className="px-2.5 py-1 text-gray-600 hover:text-blue-700 bg-gray-50 rounded-lg cursor-pointer"
                    >
                      সম্পাদনা
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="px-2.5 py-1 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                    >
                      মুছুন
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 6: Contact Messages (Super Admin Only) */}
      {activeTab === 'messages' && isSuperAdmin && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#143E27]">
              দর্শনার্থীদের অনুসন্ধান ও মতামত
            </h2>
            <button
              onClick={loadMessages}
              className="text-xs text-emerald-800 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> রিফ্রেশ
            </button>
          </div>

          {loadingMessages ? (
            <div className="p-8 text-center text-gray-400 text-sm">বার্তা লোড হচ্ছে...</div>
          ) : messages.length > 0 ? (
            <div className="space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-2"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-2">
                    <div>
                      <strong className="text-gray-900 text-sm">{msg.name}</strong>
                      <span className="text-xs text-gray-400 ml-2">({msg.email})</span>
                      {msg.phone && <span className="text-xs text-emerald-700 ml-2">ফোন: {msg.phone}</span>}
                    </div>
                    <span className="text-[11px] text-gray-400">{new Date(msg.createdAt).toLocaleString('bn-BD')}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                    {msg.message}
                  </p>
                  <div className="pt-2 text-right">
                    <button
                      onClick={async () => {
                        await deleteContactMessage(msg.id);
                        loadMessages();
                        showToast('বার্তা মুছে ফেলা হয়েছে।');
                      }}
                      className="text-xs text-red-600 hover:underline cursor-pointer"
                    >
                      মুছে ফেলুন
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-2xl border border-gray-200 text-gray-500 text-sm">
              এখনও কোনো নতুন বার্তা বা অনুসন্ধান জমা পড়েনি।
            </div>
          )}
        </div>
      )}

      {/* Tab 7: Database & Seeding (Super Admin Only) */}
      {activeTab === 'database' && isSuperAdmin && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xs space-y-6">
          <div>
            <h2 className="text-xl font-bold text-[#143E27] flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-700" />
              <span>ফায়ারস্টোর ডাটাবেজ প্রারম্ভিক সিডিং</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-xl">
              শেরপুরের ১০টি যাচাইকৃত দর্শনীয় স্থান (মধুটিলা, গজনী, রাজার পাহাড়, নাকুগাঁও, মাইসাহেবা জামে মসজিদ ইত্যাদি) ও ক্যাটাগরিগুলো আপনার ক্লাউড ফায়ারস্টোরে সরাসরি রাইট করতে নিচের বাটনে চাপুন।
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3">
            <div className="text-xs text-emerald-950 font-semibold">
              প্রস্তুতকৃত তথ্যমালা:
            </div>
            <ul className="text-xs text-emerald-900 space-y-1 list-disc pl-5">
              <li>১০টি প্রধান আকর্ষণীয় ও ঐতিহাসিক স্থান</li>
              <li>৬টি পূর্ণাঙ্গ পর্যটন ক্যাটাগরি</li>
              <li>শেরপুর জেলার ৫টি উপজেলার সুনির্দিষ্ট ভৌগোলিক তথ্য</li>
              <li>৩টি পূর্ণাঙ্গ রিসার্চ করা ভ্রমণ আর্টিকেল ও সেফটি গাইড</li>
            </ul>
          </div>

          <button
            onClick={handleSeedDatabase}
            disabled={isSeeding}
            className="px-6 py-3 rounded-xl bg-[#143E27] hover:bg-[#0D2618] text-white font-bold text-sm transition shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Database className="w-4 h-4 text-emerald-300" />
            <span>{isSeeding ? 'সিডিং চলমান রয়েছে...' : 'ক্লাউড ফায়ারস্টোরে সিড ডাটা সংরক্ষণ করুন'}</span>
          </button>
        </div>
      )}

          </main>
        </div>
      </div>

      {/* Add / Edit Destination Modal */}
      {isFormOpen && editingDestination && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-3xl w-full p-4 sm:p-8 shadow-2xl border border-gray-100 my-4 sm:my-8 space-y-4 sm:space-y-6 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-[#143E27]">
                  {editingDestination.id ? 'দর্শনীয় স্থান সম্পাদনা' : 'নতুন দর্শনীয় স্থান সংযোজন'}
                </h3>
                <p className="text-xs text-gray-500">
                  শেরপুর জেলার তথ্যসমৃদ্ধ ও নির্ভুল পর্যটন বিবরণ লিপিবদ্ধ করুন।
                </p>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveDestination} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">
                    বাংলা নাম <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingDestination.titleBn || ''}
                    onChange={(e) => {
                      const title = e.target.value;
                      const slug = title
                        .toLowerCase()
                        .trim()
                        .replace(/[^\w\s-]/g, '')
                        .replace(/[\s_-]+/g, '-')
                        .replace(/^-+|-+$/g, '');
                      setEditingDestination({
                        ...editingDestination,
                        titleBn: title,
                        slug: editingDestination.slug || slug || `place-${Date.now()}`,
                      });
                    }}
                    placeholder="যেমন: মধুটিলা ইকো পার্ক"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700">ইংরেজি নাম (ঐচ্ছিক)</label>
                  <input
                    type="text"
                    value={editingDestination.titleEn || ''}
                    onChange={(e) =>
                      setEditingDestination({ ...editingDestination, titleEn: e.target.value })
                    }
                    placeholder="e.g. Madhutila Eco Park"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">
                    ইউআরএল স্লাগ (slug) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingDestination.slug || ''}
                    onChange={(e) =>
                      setEditingDestination({ ...editingDestination, slug: e.target.value })
                    }
                    placeholder="madhutila-eco-park"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 outline-none focus:border-emerald-600 font-mono text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700">
                    উপজেলা <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={editingDestination.upazilaId || 'sherpur-sadar'}
                    onChange={(e) =>
                      setEditingDestination({
                        ...editingDestination,
                        upazilaId: e.target.value as UpazilaId,
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 outline-none focus:border-emerald-600 bg-white"
                  >
                    {UPAZILAS.map((up) => (
                      <option key={up.id} value={up.id}>
                        {up.nameBn} ({up.nameEn})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700">
                  সংক্ষিপ্ত বিবরণ <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={editingDestination.summaryBn || ''}
                  onChange={(e) =>
                    setEditingDestination({ ...editingDestination, summaryBn: e.target.value })
                  }
                  placeholder="১-২ বাক্যে স্থানটির মূল পরিচয় ও সৌন্দর্য..."
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 outline-none focus:border-emerald-600 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700">সম্পূর্ণ বিস্তারিত বিবরণ</label>
                <textarea
                  rows={4}
                  value={editingDestination.descriptionBn || ''}
                  onChange={(e) =>
                    setEditingDestination({ ...editingDestination, descriptionBn: e.target.value })
                  }
                  placeholder="ইতিহাস, প্রাকৃতিক উপাদান, আকর্ষণীয় স্থান ইত্যাদি বিস্তারিত..."
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">কভার ছবির লিংক (URL)</label>
                  <input
                    type="url"
                    value={editingDestination.coverImage || ''}
                    onChange={(e) =>
                      setEditingDestination({ ...editingDestination, coverImage: e.target.value })
                    }
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 outline-none focus:border-emerald-600 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700">ছবির অল্টারনেটিভ টেক্সট (Alt)</label>
                  <input
                    type="text"
                    value={editingDestination.coverImageAlt || ''}
                    onChange={(e) =>
                      setEditingDestination({ ...editingDestination, coverImageAlt: e.target.value })
                    }
                    placeholder="ছবির বর্ণনা"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">অবস্থানের বিবরণ</label>
                  <input
                    type="text"
                    value={editingDestination.locationName || ''}
                    onChange={(e) =>
                      setEditingDestination({ ...editingDestination, locationName: e.target.value })
                    }
                    placeholder="পোড়াগাঁও ইউনিয়ন, নালিতাবাড়ী"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700">গুগল ম্যাপস লিংক</label>
                  <input
                    type="url"
                    value={editingDestination.googleMapsUrl || ''}
                    onChange={(e) =>
                      setEditingDestination({ ...editingDestination, googleMapsUrl: e.target.value })
                    }
                    placeholder="https://maps.google.com/?q=..."
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 outline-none text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700">যাতায়াত ব্যবস্থা ও পথনির্দেশনা</label>
                <textarea
                  rows={2}
                  value={editingDestination.howToGetThereBn || ''}
                  onChange={(e) =>
                    setEditingDestination({ ...editingDestination, howToGetThereBn: e.target.value })
                  }
                  placeholder="ঢাকা থেকে এবং শেরপুর জেলা শহর থেকে কীভাবে যেতে হবে..."
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">পরিদর্শনের উপযুক্ত সময়</label>
                  <input
                    type="text"
                    value={editingDestination.bestSeasonBn || ''}
                    onChange={(e) =>
                      setEditingDestination({ ...editingDestination, bestSeasonBn: e.target.value })
                    }
                    placeholder="অক্টোবর থেকে মার্চ"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700">খোলার সময়সূচি</label>
                  <input
                    type="text"
                    value={editingDestination.openingHours || ''}
                    onChange={(e) =>
                      setEditingDestination({ ...editingDestination, openingHours: e.target.value })
                    }
                    placeholder="সকাল ৯:০০ - বিকেল ৫:৩০"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700">প্রবেশ ফি (যদি থাকে)</label>
                  <input
                    type="text"
                    value={editingDestination.entryFee || ''}
                    onChange={(e) =>
                      setEditingDestination({ ...editingDestination, entryFee: e.target.value })
                    }
                    placeholder="জনপ্রতি ২০ টাকা"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">ভ্রমণ টিপস ও পরামর্শ</label>
                  <textarea
                    rows={2}
                    value={editingDestination.travelTipsBn || ''}
                    onChange={(e) =>
                      setEditingDestination({ ...editingDestination, travelTipsBn: e.target.value })
                    }
                    placeholder="জরুরি করণীয় টিপস..."
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700">নিরাপত্তা ও সীমান্ত সতর্কতা</label>
                  <textarea
                    rows={2}
                    value={editingDestination.safetyNotesBn || ''}
                    onChange={(e) =>
                      setEditingDestination({ ...editingDestination, safetyNotesBn: e.target.value })
                    }
                    placeholder="সীমান্ত বা বনাঞ্চলের সতর্কতা..."
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <label className="font-bold text-gray-700">স্ট্যাটাস:</label>
                  <select
                    value={editingDestination.status || 'draft'}
                    onChange={(e) =>
                      setEditingDestination({
                        ...editingDestination,
                        status: e.target.value as any,
                      })
                    }
                    className="py-1.5 px-3 rounded-lg border border-gray-200 text-xs font-bold"
                  >
                    <option value="published">প্রকাশিত (পাবলিক)</option>
                    <option value="draft">ড্রাফট (অপ্রকাশিত)</option>
                  </select>
                </div>

                {isSuperAdmin && (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingDestination.isFeatured || false}
                      onChange={(e) =>
                        setEditingDestination({
                          ...editingDestination,
                          isFeatured: e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded text-emerald-800"
                    />
                    <span className="font-bold text-gray-700">হোমপেজে ফিচার্ড হিসেবে প্রদর্শন করুন</span>
                  </label>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-[#143E27] hover:bg-[#0D2618] text-white font-bold transition shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? 'সংরক্ষণ হচ্ছে...' : 'স্থানটি সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Add/Edit Modal (Super Admin Only) */}
      {isCatModalOpen && editingCategory && isSuperAdmin && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-[#143E27]">
              {editingCategory.id ? 'ক্যাটাগরি সম্পাদনা' : 'নতুন ক্যাটাগরি তৈরি'}
            </h3>
            <form onSubmit={handleSaveCategory} className="space-y-3 text-xs sm:text-sm">
              <div className="space-y-1">
                <label className="font-bold text-gray-700">বাংলা নাম</label>
                <input
                  type="text"
                  required
                  value={editingCategory.nameBn || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, nameBn: e.target.value })}
                  placeholder="পাহাড় ও ঝরনা"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-gray-700">স্লাগ (slug)</label>
                <input
                  type="text"
                  required
                  value={editingCategory.slug || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, slug: e.target.value })}
                  placeholder="hills-springs"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 outline-none font-mono text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-gray-700">বিবরণ</label>
                <textarea
                  rows={2}
                  value={editingCategory.descriptionBn || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, descriptionBn: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 outline-none resize-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCatModalOpen(false)}
                  className="px-4 py-2 border rounded-xl cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#143E27] text-white font-bold rounded-xl cursor-pointer"
                >
                  সংরক্ষণ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (Super Admin Only) */}
      {deleteConfirmId && isSuperAdmin && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              আপনি কি নিশ্চিতভাবে এই স্থানটি মুছে ফেলতে চান?
            </h3>
            <p className="text-xs text-gray-500">
              এই পদক্ষেপটি অপরিবর্তনীয়। ক্লাউড ফায়ারস্টোর থেকে সম্পূর্ণ রেকর্ড মুছে যাবে।
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                বাতিল
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
              >
                হ্যাঁ, মুছে ফেলুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Form Modal */}
      {isNotifModalOpen && editingNotif && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl my-8 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <Bell className="w-4 h-4" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-[#143E27]">
                  {editingNotif.id ? 'উৎসব নোটিফিকেশন সম্পাদনা' : 'নতুন উৎসব/অনুষ্ঠান নোটিফিকেশন'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsNotifModalOpen(false);
                  setEditingNotif(null);
                }}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {notifError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                {notifError}
              </div>
            )}

            <form onSubmit={handleSaveNotif} className="space-y-4 text-xs sm:text-sm">
              <div className="space-y-1">
                <label className="font-bold text-gray-700">
                  উৎসব বা অনুষ্ঠানের শিরোনাম <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingNotif.title || ''}
                  onChange={(e) => setEditingNotif({ ...editingNotif, title: e.target.value })}
                  placeholder="যেমন: নালিতাবাড়ীতে ঐতিহ্যবাহী গারো ওয়ানগালা উৎসব..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700">
                  বিস্তারিত বিবরণ বা বার্তা <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={editingNotif.message || ''}
                  onChange={(e) => setEditingNotif({ ...editingNotif, message: e.target.value })}
                  placeholder="উৎসবের উদ্দেশ্য, সাংস্কৃতিক তাৎপর্য, প্রধান আকর্ষণ ও দিকনির্দেশনা..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">ক্যাটাগরি</label>
                  <select
                    value={editingNotif.category || 'festival'}
                    onChange={(e) => setEditingNotif({ ...editingNotif, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 outline-none"
                  >
                    <option value="festival">উৎসব (Festival)</option>
                    <option value="fair">ঐতিহ্যবাহী মেলা (Fair)</option>
                    <option value="event">সাংস্কৃতিক অনুষ্ঠান (Cultural Event)</option>
                    <option value="notice">সাধারণ বিজ্ঞপ্তি (Notice)</option>
                    <option value="alert">জরুরি সতর্কতা (Alert)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700">উপজেলা</label>
                  <select
                    value={editingNotif.upazilaId || 'all'}
                    onChange={(e) => setEditingNotif({ ...editingNotif, upazilaId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 outline-none"
                  >
                    <option value="all">সমগ্র শেরপুর জেলা</option>
                    {UPAZILAS.map((up) => (
                      <option key={up.id} value={up.id}>
                        {up.nameBn}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700">সুনির্দিষ্ট স্থান / ভেন্যু</label>
                <input
                  type="text"
                  value={editingNotif.location || ''}
                  onChange={(e) => setEditingNotif({ ...editingNotif, location: e.target.value })}
                  placeholder="যেমন: বারমারী সাধু লিওর ধর্মপল্লী ও মধুটিলা মাঠ"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">শুরুর তারিখ</label>
                  <input
                    type="text"
                    value={editingNotif.startDate || ''}
                    onChange={(e) => setEditingNotif({ ...editingNotif, startDate: e.target.value })}
                    placeholder="যেমন: ২০২৬-১১-২০"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none font-sans"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">সমাপ্তির তারিখ (ঐচ্ছিক)</label>
                  <input
                    type="text"
                    value={editingNotif.endDate || ''}
                    onChange={(e) => setEditingNotif({ ...editingNotif, endDate: e.target.value })}
                    placeholder="যেমন: ২০২৬-১১-২২"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none font-sans"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100 space-y-2.5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingNotif.isBigEvent || false}
                    onChange={(e) => setEditingNotif({ ...editingNotif, isBigEvent: e.target.checked })}
                    className="w-4 h-4 text-amber-600 rounded"
                  />
                  <span className="font-bold text-gray-800 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    বড় উৎসব বা প্রধান আয়োজন হিসেবে চিহ্নিত করুন (টপ ব্যানার অ্যালার্ট ও পুশ নোটিফিকেশন প্রদর্শন করবে)
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingNotif.isActive !== false}
                    onChange={(e) => setEditingNotif({ ...editingNotif, isActive: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span className="font-bold text-gray-800">
                    ওয়েবসাইটে নোটিফিকেশনটি সক্রিয় ও দৃশ্যমান রাখুন
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsNotifModalOpen(false);
                    setEditingNotif(null);
                  }}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-gray-600 font-semibold hover:bg-gray-50 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={savingNotif}
                  className="px-5 py-2 bg-[#143E27] hover:bg-[#0D2618] text-white font-bold rounded-xl transition cursor-pointer"
                >
                  {savingNotif ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
