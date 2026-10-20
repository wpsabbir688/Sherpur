import React, { useState, useEffect } from 'react';
import {
  User,
  MapPin,
  Bookmark,
  Camera,
  Calendar,
  Edit3,
  Heart,
  MessageCircle,
  Share2,
  CheckCircle2,
  Users,
  Compass,
  ArrowRight,
  Shield,
  LogOut,
  X,
  Plus,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserProfile, SavedItem, CommunityPost } from '../types/community';
import { Destination } from '../types';
import {
  getUserProfile,
  getUserProfileByUsername,
  updateUserProfile,
  getSavedItems,
  toggleFollowUser,
  checkIsFollowing,
} from '../services/userService';
import { getCommunityPosts } from '../services/communityService';
import { handleImageError } from '../utils/imageFallback';

interface UserProfilePageProps {
  destinations: Destination[];
  viewUsername?: string;
  onSelectDestination: (slug: string) => void;
  onNavigate: (view: string, param?: string) => void;
  onOpenAuthModal: () => void;
}

export const UserProfilePage: React.FC<UserProfilePageProps> = ({
  destinations,
  viewUsername,
  onSelectDestination,
  onNavigate,
  onOpenAuthModal,
}) => {
  const { user, userProfile, refreshUserProfile, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'saved' | 'about'>('posts');

  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [userPosts, setUserPosts] = useState<CommunityPost[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);

  // Edit profile modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editPhotoUrl, setEditPhotoUrl] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const isOwnProfile =
    (!viewUsername && user) ||
    (user && (viewUsername === userProfile?.username || viewUsername === user.uid));

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        let targetProfile: UserProfile | null = null;
        if (viewUsername && viewUsername !== userProfile?.username) {
          targetProfile = await getUserProfileByUsername(viewUsername);
          if (!targetProfile && viewUsername.startsWith('user_')) {
            targetProfile = await getUserProfile(viewUsername);
          }
        } else if (user) {
          targetProfile = userProfile || (await getUserProfile(user.uid));
        }

        if (targetProfile) {
          setProfile(targetProfile);
          setEditDisplayName(targetProfile.displayName || '');
          setEditBio(targetProfile.bio || '');
          setEditLocation(targetProfile.location || '');
          setEditPhotoUrl(targetProfile.photoURL || '');

          // Load user posts & saved items
          const [posts, items] = await Promise.all([
            getCommunityPosts({ authorId: targetProfile.uid }),
            getSavedItems(targetProfile.uid),
          ]);
          setUserPosts(posts);
          setSavedItems(items);

          if (user && user.uid !== targetProfile.uid) {
            const following = await checkIsFollowing(user.uid, targetProfile.uid);
            setIsFollowing(following);
          }
        }
      } catch (err) {
        console.error('Error loading profile:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [viewUsername, user, userProfile]);

  const handleFollowToggle = async () => {
    if (!user) {
      onOpenAuthModal();
      return;
    }
    if (!profile) return;
    const newStatus = await toggleFollowUser(user.uid, profile.uid);
    setIsFollowing(newStatus);
    setProfile((prev) =>
      prev
        ? {
            ...prev,
            followersCount: Math.max(0, prev.followersCount + (newStatus ? 1 : -1)),
          }
        : null
    );
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;
    setSavingProfile(true);
    try {
      await updateUserProfile(user.uid, {
        displayName: editDisplayName.trim(),
        bio: editBio.trim(),
        location: editLocation.trim(),
        photoURL: editPhotoUrl.trim() || undefined,
      });
      await refreshUserProfile();
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              displayName: editDisplayName.trim(),
              bio: editBio.trim(),
              location: editLocation.trim(),
              photoURL: editPhotoUrl.trim() || undefined,
            }
          : null
      );
      setIsEditModalOpen(false);
    } finally {
      setSavingProfile(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-emerald-200 border-t-[#143E27] rounded-full animate-spin" />
        <p className="text-xs font-semibold text-gray-500">প্রোফাইল তথ্য লোড হচ্ছে...</p>
      </div>
    );
  }

  if (!profile && !user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-[#143E27] flex items-center justify-center mx-auto border border-emerald-200">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">প্রোফাইলে প্রবেশ করুন</h2>
        <p className="text-xs text-gray-600">
          আপনার সংরক্ষিত প্রিয় স্থান ও ভ্রমণ গল্পসমূহ দেখতে অনুগ্রহ করে সাইন-ইন বা নিবন্ধন করুন।
        </p>
        <button
          onClick={onOpenAuthModal}
          className="px-6 py-2.5 rounded-xl bg-[#143E27] text-white font-bold text-xs hover:bg-[#0E2C1C] transition cursor-pointer shadow-sm"
        >
          লগইন / রেজিস্টার করুন
        </button>
      </div>
    );
  }

  const currentDisplayProfile = profile || {
    uid: user?.uid || '',
    displayName: user?.displayName || 'ভ্রমণকারী',
    username: 'traveler',
    photoURL: user?.photoURL || undefined,
    bio: 'গারো পাহাড় ও শেরপুরের নিসর্গপ্রেমী ভ্রমণকারী।',
    savedDestinationIds: [],
    followersCount: 0,
    followingCount: 0,
    postsCount: 0,
    createdAt: new Date().toISOString(),
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl border border-gray-200/90 shadow-2xs overflow-hidden">
        {/* Banner */}
        <div className="h-32 sm:h-44 bg-gradient-to-r from-[#143E27] via-[#1E5638] to-[#0D2618]" />

        {/* Profile Details Container */}
        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 -mt-16 sm:-mt-20">
            {/* Avatar & Basic Info */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
              <div className="relative">
                <img
                  src={
                    currentDisplayProfile.photoURL ||
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80'
                  }
                  alt={currentDisplayProfile.displayName}
                  onError={(e) => handleImageError(e)}
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover border-4 border-white shadow-md bg-gray-100"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                    {currentDisplayProfile.displayName}
                  </h1>
                  {currentDisplayProfile.isVerified && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  )}
                </div>
                <p className="text-xs text-gray-500 font-sans">
                  @{currentDisplayProfile.username}
                </p>
                {currentDisplayProfile.location && (
                  <p className="text-xs text-gray-600 flex items-center justify-center sm:justify-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{currentDisplayProfile.location}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Actions: Edit or Follow */}
            <div className="flex items-center gap-2">
              {isOwnProfile ? (
                <>
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>প্রোফাইল এডিট</span>
                  </button>
                  <button
                    onClick={() => signOut()}
                    className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 border border-gray-200 transition cursor-pointer"
                    title="সাইন-আউট"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <button
                  onClick={handleFollowToggle}
                  className={`px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
                    isFollowing
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                      : 'bg-[#143E27] text-white hover:bg-[#0E2C1C]'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>{isFollowing ? 'অনুসরণ করছেন' : 'অনুসরণ করুন'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Bio & Stats */}
          <div className="mt-6 pt-5 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-xs sm:text-sm text-gray-700 max-w-xl leading-relaxed">
              {currentDisplayProfile.bio || 'গারো পাহাড় ও শেরপুরের ভ্রমণ অনুরাগী।'}
            </p>

            <div className="flex items-center gap-4 text-xs font-semibold text-gray-700 shrink-0">
              <div className="text-center sm:text-left">
                <span className="font-extrabold text-sm text-[#143E27] block">
                  {userPosts.length}
                </span>
                <span className="text-[11px] text-gray-500">পোস্ট</span>
              </div>
              <div className="h-6 w-px bg-gray-200" />
              <div className="text-center sm:text-left">
                <span className="font-extrabold text-sm text-[#143E27] block">
                  {currentDisplayProfile.followersCount}
                </span>
                <span className="text-[11px] text-gray-500">অনুসারী</span>
              </div>
              <div className="h-6 w-px bg-gray-200" />
              <div className="text-center sm:text-left">
                <span className="font-extrabold text-sm text-[#143E27] block">
                  {savedItems.length}
                </span>
                <span className="text-[11px] text-gray-500">সংরক্ষিত স্থান</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab('posts')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'posts'
              ? 'bg-[#143E27] text-white shadow-2xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>ভ্রমণ গল্প ({userPosts.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'saved'
              ? 'bg-[#143E27] text-white shadow-2xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span>সংরক্ষিত প্রিয় স্থান ({savedItems.length})</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'posts' && (
        <div className="space-y-4">
          {userPosts.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center space-y-3">
              <Camera className="w-8 h-8 text-gray-400 mx-auto" />
              <h4 className="font-bold text-gray-900 text-sm">কোনো গল্প পোস্ট করা হয়নি</h4>
              <p className="text-xs text-gray-500">
                শেরপুর ভ্রমণের সুন্দর মুহূর্তগুলো শেয়ার করতে কমিউনিটি পেজে পোস্ট করুন।
              </p>
              {isOwnProfile && (
                <button
                  onClick={() => onNavigate('community')}
                  className="px-4 py-2 bg-[#143E27] text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  কমিউনিটিতে পোস্ট করুন
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userPosts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3 shadow-2xs"
                >
                  {post.photos && post.photos[0] && (
                    <img
                      src={post.photos[0]}
                      alt={post.caption}
                      onError={(e) => handleImageError(e)}
                      className="w-full h-44 rounded-xl object-cover"
                    />
                  )}
                  <h4 className="font-bold text-sm text-gray-900">{post.caption}</h4>
                  {post.destinationTitle && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                      <MapPin className="w-3 h-3" />
                      {post.destinationTitle}
                    </span>
                  )}
                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5 text-rose-500" />
                      {post.likesCount} লাইক
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-700" />
                      {post.commentsCount} মন্তব্য
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'saved' && (
        <div className="space-y-4">
          {savedItems.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center space-y-3">
              <Bookmark className="w-8 h-8 text-gray-400 mx-auto" />
              <h4 className="font-bold text-gray-900 text-sm">কোনো স্থান বুকমার্ক করা নেই</h4>
              <p className="text-xs text-gray-500">
                যেকোনো দর্শনীয় স্থান পেজে গিয়ে বুকমার্ক আইকনে ক্লিক করে প্রিয় তালিকায় সংরক্ষণ করুন।
              </p>
              <button
                onClick={() => onNavigate('places')}
                className="px-4 py-2 bg-[#143E27] text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                স্থানসমূহ দেখুন
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {savedItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    if (item.slug) onSelectDestination(item.slug);
                    else onNavigate('places');
                  }}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs hover:shadow-md transition cursor-pointer group"
                >
                  <img
                    src={
                      item.image ||
                      'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=400&q=80'
                    }
                    alt={item.title}
                    onError={(e) => handleImageError(e)}
                    className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="p-3.5 space-y-1">
                    <h5 className="font-bold text-sm text-gray-900 group-hover:text-[#143E27] truncate">
                      {item.title}
                    </h5>
                    {item.subtitle && (
                      <p className="text-[11px] text-gray-500 truncate flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-600" />
                        <span>{item.subtitle}</span>
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-base text-gray-900">প্রোফাইল তথ্য সংশোধন</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">পূর্ণ নাম</label>
                <input
                  type="text"
                  required
                  value={editDisplayName}
                  onChange={(e) => setEditDisplayName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#143E27]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">বায়ো / সংক্ষিপ্ত পরিচিতি</label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="আপনার সম্পর্কে লিখুন..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#143E27]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">লোকেশন / জেলা</label>
                <input
                  type="text"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  placeholder="যেমন: শেরপুর সদর অথবা ঢাকা"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#143E27]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">প্রোফাইল ছবির লিংক (URL)</label>
                <input
                  type="url"
                  value={editPhotoUrl}
                  onChange={(e) => setEditPhotoUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#143E27]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-5 py-2.5 rounded-xl bg-[#143E27] text-white font-bold hover:bg-[#0E2C1C] transition disabled:opacity-50"
                >
                  {savingProfile ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
