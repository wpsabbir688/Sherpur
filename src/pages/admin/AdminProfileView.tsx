import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Shield,
  KeyRound,
  Mail,
  Phone,
  MapPin,
  Globe,
  Camera,
  Upload,
  Check,
  AlertTriangle,
  Lock,
  Save,
  Compass,
  Calendar,
  Sparkles,
  ExternalLink,
  Image as ImageIcon,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { AdminProfile } from '../../types';
import {
  getAdminProfile,
  saveAdminProfile,
  normalizeAdminUsername,
} from '../../services/adminProfileService';
import { changeAdminPassword } from '../../services/adminAuthService';
import { PRESET_AVATARS } from '../../services/teamService';
import { formatInDhakaTime } from '../../services/analyticsService';
import { uploadAvatarImage } from '../../utils/imageUploadHelper';

interface AdminProfileViewProps {
  currentUsername: string | null;
  adminName: string | null;
  adminRole: string | null;
  isSuperAdmin: boolean;
  totalDestinationsCount: number;
}

export const AdminProfileView: React.FC<AdminProfileViewProps> = ({
  currentUsername,
  adminName,
  adminRole,
  isSuperAdmin,
  totalDestinationsCount,
}) => {
  const username = normalizeAdminUsername(currentUsername || 'sabbir');

  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);

  // Avatar upload & options state
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);
  const [passError, setPassError] = useState<string | null>(null);

  // Load profile
  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const data = await getAdminProfile(username);
        if (isMounted) {
          setProfile(data);
          if (data.updatedAt) {
            setLastSavedTime(data.updatedAt);
          }
        }
      } catch (e) {
        console.error('Error loading admin profile:', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();

    return () => {
      isMounted = false;
    };
  }, [username]);

  // Keyboard shortcut Ctrl+S / Cmd+S to save profile
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (profile && !isSaving) {
          handleExecuteSave(profile);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [profile, isSaving]);

  // Execute Save Logic
  const handleExecuteSave = async (profileToSave: AdminProfile) => {
    if (!profileToSave) return;
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(null);

    try {
      const saved = await saveAdminProfile(profileToSave);
      setProfile(saved);
      setLastSavedTime(saved.updatedAt || new Date().toISOString());
      setSaveSuccess('প্রোফাইলের তথ্য সফলভাবে সংরক্ষিত ও আপডেট হয়েছে!');
      setTimeout(() => setSaveSuccess(null), 4500);
    } catch (err: any) {
      console.error('Save profile error:', err);
      setSaveError(err?.message || 'প্রোফাইল সংরক্ষণ ব্যর্থ হয়েছে।');
    } finally {
      setIsSaving(false);
    }
  };

  // Form Submit Handler
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    await handleExecuteSave(profile);
  };

  // File Upload Handler (Image File Picker or Drag & Drop)
  const handleFileProcess = async (file: File) => {
    if (!profile) return;
    if (!file.type.startsWith('image/')) {
      setUploadError('অনুগ্রহ করে শুধুমাত্র ছবি ফাইল (JPG, PNG, WebP) নির্বাচন করুন।');
      return;
    }

    setIsUploadingImage(true);
    setUploadError(null);

    try {
      const avatarUrl = await uploadAvatarImage(file, profile.username || 'sabbir');
      const updated = {
        ...profile,
        avatarUrl,
      };
      setProfile(updated);
      setIsAvatarPickerOpen(false);

      // Auto-save the new avatar immediately
      await handleExecuteSave(updated);
    } catch (err: any) {
      console.error('Avatar upload failed:', err);
      setUploadError(err?.message || 'ছবি আপলোড করতে সমস্যা হয়েছে।');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileProcess(files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileProcess(files[0]);
    }
  };

  // Handle Password Change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(null);

    if (!currentPassword) {
      setPassError('বর্তমান পাসওয়ার্ড প্রদান করুন।');
      return;
    }
    if (newPassword.length < 5) {
      setPassError('নতুন পাসওয়ার্ড কমপক্ষে ৫ অক্ষরের হতে হবে।');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassError('নতুন পাসওয়ার্ড এবং নিশ্চিতকরণ পাসওয়ার্ড মেলেনি।');
      return;
    }

    setIsChangingPass(true);
    try {
      const result = await changeAdminPassword(currentPassword, newPassword);
      if (result.success) {
        setPassSuccess('পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPassSuccess(null), 4000);
      } else {
        setPassError(result.error || 'পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে।');
      }
    } catch (err: any) {
      setPassError('পাসওয়ার্ড পরিবর্তনের সময় অপ্রত্যাশিত ত্রুটি ঘটেছে।');
    } finally {
      setIsChangingPass(false);
    }
  };

  if (loading || !profile) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 rounded-full border-4 border-emerald-200 border-t-[#143E27] animate-spin" />
        <p className="text-xs font-semibold text-gray-500">প্রোফাইল তথ্য লোড হচ্ছে...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hidden File Input for Device Photo Upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/png, image/jpeg, image/webp, image/gif, image/heic"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Profile Hero Header Banner */}
      <div className="bg-white rounded-3xl border border-gray-200/90 shadow-2xs overflow-hidden">
        {/* Decorative Top Bar */}
        <div className="h-32 sm:h-40 bg-gradient-to-r from-[#143E27] via-[#1c5636] to-[#0D2618] relative">
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
          <div className="absolute right-4 top-4 flex items-center gap-2">
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-black/30 backdrop-blur-md text-emerald-200 border border-emerald-400/30">
              অ্যাডমিন প্রোফাইল নিয়ন্ত্রণ
            </span>
          </div>
        </div>

        {/* Profile Card Body */}
        <div className="px-6 pb-6 sm:px-8 sm:pb-8 pt-0 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
              {/* Avatar Container with Drag-Drop and Upload Trigger - only this has negative margin */}
              <div
                className={`-mt-14 sm:-mt-20 relative z-10 shrink-0 group cursor-pointer transition ${
                  isDragging ? 'ring-4 ring-emerald-500 scale-105' : ''
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                title="ডিভাইস থেকে নতুন ছবি আপলোড করতে ক্লিক করুন"
              >
                <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-3xl overflow-hidden border-4 border-white shadow-xl bg-emerald-950">
                  <img
                    src={profile.avatarUrl || PRESET_AVATARS[0]}
                    alt={profile.fullName}
                    className={`w-full h-full object-cover transition duration-300 ${
                      isUploadingImage ? 'opacity-40 blur-xs' : 'group-hover:scale-105'
                    }`}
                  />
                  {isUploadingImage && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mb-1" />
                      <span className="text-[10px] font-bold">আপলোড হচ্ছে...</span>
                    </div>
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center text-white text-[11px] font-bold gap-1">
                    <Upload className="w-5 h-5" />
                    <span>ছবি আপলোড</span>
                  </div>
                </div>

                {/* Floating Camera Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="absolute bottom-1 right-1 p-2.5 rounded-2xl bg-[#143E27] text-white hover:bg-[#0D2618] shadow-md transition cursor-pointer border-2 border-white"
                  title="কম্পিউটার বা মোবাইল থেকে ছবি আপলোড করুন"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              {/* Profile Details strictly below the dark banner in white card */}
              <div className="pt-2 sm:pt-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight leading-tight">
                    {profile.fullName || adminName || 'মো. সাব্বির হোসেন'}
                  </h1>
                  <span className="inline-block text-xs font-mono text-gray-600 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-lg self-center sm:self-auto font-semibold">
                    @{profile.username}
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-emerald-600" />
                    {isSuperAdmin ? 'প্রধান সুপার অ্যাডমিন' : 'সহকারী অ্যাডমিন'}
                  </span>
                  <span className="text-xs text-gray-600 font-semibold">{profile.title}</span>
                </div>

                {/* Direct Action Buttons for Photo */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingImage}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition shadow-2xs cursor-pointer disabled:opacity-50"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>ডিভাইস থেকে ছবি আপলোড</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsAvatarPickerOpen(!isAvatarPickerOpen)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition cursor-pointer"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-gray-500" />
                    <span>অবতার গ্যালারি বা লিংক</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Last Saved Badge */}
            <div className="text-center sm:text-right text-xs text-gray-500 space-y-1">
              <div className="font-semibold text-gray-700 flex items-center justify-center sm:justify-end gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>ক্লাউড ও লোকাল স্টোরেজে সিঙ্কড</span>
              </div>
              <div className="text-[11px] font-mono text-gray-400">
                সর্বশেষ সংরক্ষণ: {formatInDhakaTime(lastSavedTime || profile.updatedAt, 'short')}
              </div>
            </div>
          </div>

          {/* Upload Error Alert */}
          {uploadError && (
            <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* Avatar Selector Dropdown / Tray */}
          {isAvatarPickerOpen && (
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3 pt-3 transition">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-gray-700">ডিফল্ট অবতার নির্বাচন করুন:</div>
                <button
                  type="button"
                  onClick={() => setIsAvatarPickerOpen(false)}
                  className="text-xs text-gray-500 hover:text-gray-800 cursor-pointer"
                >
                  বন্ধ করুন ✕
                </button>
              </div>

              <div className="flex items-center gap-2.5 overflow-x-auto pb-2">
                {PRESET_AVATARS.map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt="Preset"
                    onClick={() => {
                      const updated = { ...profile, avatarUrl: url };
                      setProfile(updated);
                      handleExecuteSave(updated);
                    }}
                    className={`w-12 h-12 rounded-2xl object-cover cursor-pointer border-2 transition hover:scale-105 shrink-0 ${
                      profile.avatarUrl === url
                        ? 'border-[#143E27] ring-2 ring-emerald-500 shadow-md'
                        : 'border-transparent'
                    }`}
                  />
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-gray-200">
                <input
                  type="text"
                  value={profile.avatarUrl || ''}
                  onChange={(e) => setProfile({ ...profile, avatarUrl: e.target.value })}
                  placeholder="অথবা আপনার যেকোনো অনলাইন ইমেজ URL পেস্ট করুন..."
                  className="flex-1 p-2.5 bg-white rounded-xl border border-gray-200 text-xs outline-none focus:border-emerald-600 font-mono"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleExecuteSave(profile)}
                    className="px-4 py-2 bg-[#143E27] text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-[#0D2618]"
                  >
                    লিংক সংরক্ষণ
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = { ...profile, avatarUrl: PRESET_AVATARS[0] };
                      setProfile(updated);
                      handleExecuteSave(updated);
                    }}
                    className="px-3 py-2 bg-gray-200 text-gray-700 rounded-xl text-xs font-bold cursor-pointer hover:bg-gray-300 flex items-center gap-1"
                    title="ডিফল্ট অবতারে রিসেট করুন"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>রিসেট</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: Edit Info + Security & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Editable Profile Details */}
        <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/90 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-4 gap-2">
            <div>
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-700" />
                <span>ব্যক্তিগত ও দাপ্তরিক তথ্যাবলী</span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                আপনার নাম, পদবি, যোগাযোগের তথ্য ও পরিচয়বৃত্তান্ত হালনাগাদ করুন। (Ctrl+S চাপলেও সেভ হবে)
              </p>
            </div>

            {/* Quick Top Save Button */}
            <button
              type="button"
              onClick={() => handleExecuteSave(profile)}
              disabled={isSaving}
              className="self-start sm:self-auto flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#143E27] text-white font-bold text-xs hover:bg-[#0D2618] transition shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}</span>
            </button>
          </div>

          {/* Feedback Banners */}
          {saveSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-xs sm:text-sm text-emerald-900 font-semibold flex items-center gap-3 animate-fade-in shadow-2xs">
              <Check className="w-5 h-5 text-emerald-700 shrink-0" />
              <div className="flex-1">
                <span>{saveSuccess}</span>
              </div>
            </div>
          )}
          {saveError && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-300 text-xs sm:text-sm text-red-700 flex items-center gap-3 animate-fade-in shadow-2xs">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
              <div className="flex-1">
                <span>{saveError}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs sm:text-sm">
            {/* First & Last Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  নামের প্রথমাংশ (First Name)
                </label>
                <input
                  type="text"
                  value={profile.firstName || ''}
                  onChange={(e) => {
                    const fName = e.target.value;
                    const lName = profile.lastName || '';
                    setProfile({
                      ...profile,
                      firstName: fName,
                      fullName: `${fName} ${lName}`.trim(),
                    });
                  }}
                  placeholder="যেমন: সাব্বির"
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10 transition"
                />
              </div>
              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  নামের শেষাংশ (Last Name)
                </label>
                <input
                  type="text"
                  value={profile.lastName || ''}
                  onChange={(e) => {
                    const lName = e.target.value;
                    const fName = profile.firstName || '';
                    setProfile({
                      ...profile,
                      lastName: lName,
                      fullName: `${fName} ${lName}`.trim(),
                    });
                  }}
                  placeholder="যেমন: হোসেন"
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10 transition"
                />
              </div>
            </div>

            {/* Display Full Name & Username */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  পূর্ণ প্রদর্শিত নাম (Full Name) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={profile.fullName || ''}
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  placeholder="যেমন: মো. সাব্বির হোসেন"
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10 font-bold transition"
                />
              </div>
              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  অ্যাডমিন ইউজারনেম (Username)
                </label>
                <input
                  type="text"
                  disabled
                  value={profile.username}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm bg-gray-100 font-mono text-gray-500 cursor-not-allowed"
                />
                <span className="text-[10px] text-gray-400 mt-0.5 block">
                  ইউজারনেম অ্যাকাউন্টের স্থায়ী আইডি হিসেবে ব্যবহৃত হয়।
                </span>
              </div>
            </div>

            {/* Designation & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  দাপ্তরিক পদবি (Professional Title)
                </label>
                <input
                  type="text"
                  value={profile.title || ''}
                  onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                  placeholder="যেমন: প্রতিষ্ঠাতা ও প্রধান পর্যটন গবেষক (Lead Curator)"
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10 transition"
                />
              </div>
              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  অবস্থান / সদর দপ্তর (Location)
                </label>
                <input
                  type="text"
                  value={profile.location || ''}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  placeholder="যেমন: শেরপুর সদর, শেরপুর, ময়মনসিংহ বিভাগ"
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10 transition"
                />
              </div>
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  যোগাযোগের ইমেইল (Official Email)
                </label>
                <input
                  type="email"
                  value={profile.email || ''}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  placeholder="wpsabbir688@gmail.com"
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10 transition"
                />
              </div>
              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  মোবাইল নম্বর (Phone)
                </label>
                <input
                  type="text"
                  value={profile.phone || ''}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="+8801944460344"
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10 font-mono transition"
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="font-bold text-gray-700 block mb-1">
                আত্মপরিচয় ও বায়ো (About Me / Bio)
              </label>
              <textarea
                rows={3}
                value={profile.bio || ''}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                placeholder="শেরপুর ভ্রমণ গাইডে আপনার ভূমিকা, অভিজ্ঞতা এবং পর্যটন উন্নয়নের অঙ্গীকার..."
                className="w-full p-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10 leading-relaxed transition"
              />
            </div>

            {/* Social Links */}
            <div className="space-y-3 pt-2 border-t border-gray-100">
              <span className="font-bold text-gray-700 block">সামাজিক যোগাযোগ ও ওয়েব লিংক</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center rounded-xl border border-gray-200 bg-white px-2.5 focus-within:border-emerald-600">
                  <span className="text-gray-400 text-xs mr-1 font-mono">fb.com/</span>
                  <input
                    type="text"
                    value={profile.socialLinks?.facebook || ''}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        socialLinks: { ...profile.socialLinks, facebook: e.target.value },
                      })
                    }
                    placeholder="ফেসবুক প্রোফাইল URL"
                    className="w-full py-2 text-xs outline-none"
                  />
                </div>
                <div className="flex items-center rounded-xl border border-gray-200 bg-white px-2.5 focus-within:border-emerald-600">
                  <span className="text-gray-400 text-xs mr-1 font-mono">linkedin/</span>
                  <input
                    type="text"
                    value={profile.socialLinks?.linkedin || ''}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        socialLinks: { ...profile.socialLinks, linkedin: e.target.value },
                      })
                    }
                    placeholder="লিঙ্কডইন প্রোফাইল URL"
                    className="w-full py-2 text-xs outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[11px] text-gray-400 font-medium hidden sm:inline">
                টিপ: তথ্য পরিবর্তন শেষে সংরক্ষণ বাটনে ক্লিক করুন।
              </span>
              <button
                type="submit"
                disabled={isSaving}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-[#143E27] text-white font-bold text-xs sm:text-sm hover:bg-[#0D2618] shadow-md transition cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>সংরক্ষণ হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>প্রোফাইল পরিবর্তন সংরক্ষণ করুন</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right 1 Col: Security, Password Change & System Stats */}
        <div className="space-y-6">
          {/* Security & Password Change Card */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200/90 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-amber-600" />
              <span>নিরাপত্তা ও পাসওয়ার্ড পরিবর্তন</span>
            </h3>
            <p className="text-xs text-gray-500">
              আপনার অ্যাডমিন অ্যাকাউন্ট সুরক্ষার জন্য নিয়মিত পাসওয়ার্ড পরিবর্তন করুন।
            </p>

            {passSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-semibold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{passSuccess}</span>
              </div>
            )}
            {passError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{passError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">বর্তমান পাসওয়ার্ড</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="বর্তমান পাসওয়ার্ড দিন"
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">নতুন পাসওয়ার্ড</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="কমপক্ষে ৫ অক্ষর"
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">পাসওয়ার্ড নিশ্চিতকরণ</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="পুনরায় নতুন পাসওয়ার্ড লিখুন"
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs outline-none focus:border-amber-600"
                />
              </div>

              <button
                type="submit"
                disabled={isChangingPass}
                className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition cursor-pointer disabled:opacity-50 mt-1"
              >
                {isChangingPass ? 'পরিবর্তন হচ্ছে...' : 'পাসওয়ার্ড হালনাগাদ করুন'}
              </button>
            </form>
          </div>

          {/* Contribution & System Access Summary Card */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200/90 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>ব্যক্তিগত অবদান ও অধিকার স্তর</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-gray-600 font-medium">নিরাপত্তা স্তর</span>
                <span className="font-bold text-emerald-800">
                  {isSuperAdmin ? 'Full SuperAdmin (Tier 1)' : 'Standard Editor (Tier 2)'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-gray-600 font-medium">মোট পর্যটন স্পট পরিচালনা</span>
                <span className="font-bold text-gray-900">{totalDestinationsCount}টি স্থান</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-gray-600 font-medium">স্টোরেজ সিঙ্ক্রোনাইজেশন</span>
                <span className="font-bold text-emerald-700">ফায়ারস্টোর ও লোকাল স্টোরেজ</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-gray-600 font-medium">সেশন সিকিউরিটি</span>
                <span className="font-bold text-emerald-700">এনক্রিপ্টেড ও সুরক্ষিত</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
