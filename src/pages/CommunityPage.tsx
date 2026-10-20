import React, { useState, useEffect } from 'react';
import {
  Users,
  Camera,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Sparkles,
  MapPin,
  Plus,
  Send,
  Flag,
  CheckCircle2,
  Clock,
  Compass,
  Filter,
  Image as ImageIcon,
  X,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CommunityPost, PostComment } from '../types/community';
import { Destination } from '../types';
import {
  getCommunityPosts,
  createCommunityPost,
  toggleLikePost,
  isPostLikedLocally,
  addCommentToPost,
  getCommentsForPost,
} from '../services/communityService';
import { submitContentReport } from '../services/reportService';
import { handleImageError } from '../utils/imageFallback';

interface CommunityPageProps {
  destinations: Destination[];
  onSelectDestination: (slug: string) => void;
  onNavigate: (view: string, param?: string) => void;
  onOpenAuthModal: () => void;
}

export const CommunityPage: React.FC<CommunityPageProps> = ({
  destinations,
  onSelectDestination,
  onNavigate,
  onOpenAuthModal,
}) => {
  const { user, userProfile } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSort, setFilterSort] = useState<'newest' | 'popular'>('newest');
  const [selectedDestinationFilter, setSelectedDestinationFilter] = useState<string>('all');

  // Active comments drawer/expansion
  const [expandedCommentsPostId, setExpandedCommentsPostId] = useState<string | null>(null);
  const [commentsMap, setCommentsMap] = useState<Record<string, PostComment[]>>({});
  const [commentInputMap, setCommentInputMap] = useState<Record<string, string>>({});
  const [commentLoading, setCommentLoading] = useState(false);

  // New Post modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newCaption, setNewCaption] = useState('');
  const [newTravelStory, setNewTravelStory] = useState('');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newDestinationId, setNewDestinationId] = useState('');
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);

  // Report modal
  const [reportingPost, setReportingPost] = useState<CommunityPost | null>(null);
  const [reportReason, setReportReason] = useState('spam');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);

  // Toast message
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const loadPosts = async () => {
    setLoading(true);
    try {
      const list = await getCommunityPosts({
        sort: filterSort,
        destinationId: selectedDestinationFilter !== 'all' ? selectedDestinationFilter : undefined,
      });
      setPosts(list);
    } catch (e) {
      console.error('Error loading community posts:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [filterSort, selectedDestinationFilter]);

  const handleLike = async (post: CommunityPost) => {
    if (!user) {
      showToast('লাইক দিতে সাইন-ইন করুন');
      onOpenAuthModal();
      return;
    }

    const res = await toggleLikePost(post.id, user.uid);
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === post.id) {
          const delta = res.newCount;
          return {
            ...p,
            likesCount: Math.max(0, p.likesCount + delta),
          };
        }
        return p;
      })
    );
  };

  const handleToggleComments = async (postId: string) => {
    if (expandedCommentsPostId === postId) {
      setExpandedCommentsPostId(null);
      return;
    }
    setExpandedCommentsPostId(postId);
    if (!commentsMap[postId]) {
      const comments = await getCommentsForPost(postId);
      setCommentsMap((prev) => ({ ...prev, [postId]: comments }));
    }
  };

  const handleAddComment = async (postId: string) => {
    const text = (commentInputMap[postId] || '').trim();
    if (!text) return;

    if (!user) {
      showToast('মন্তব্য করতে অনুগ্রহ করে সাইন-ইন করুন');
      onOpenAuthModal();
      return;
    }

    setCommentLoading(true);
    try {
      const authorName = userProfile?.displayName || user.displayName || 'ভ্রমণকারী';
      const authorUsername = userProfile?.username || `user_${user.uid.slice(0, 6)}`;
      const authorAvatar = userProfile?.photoURL || user.photoURL || undefined;

      const newC = await addCommentToPost(
        postId,
        {
          authorId: user.uid,
          authorName,
          authorUsername,
          authorAvatar,
        },
        text
      );

      setCommentsMap((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] || []), newC],
      }));

      setCommentInputMap((prev) => ({ ...prev, [postId]: '' }));

      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p))
      );
      showToast('আপনার মন্তব্য প্রকাশিত হয়েছে!');
    } finally {
      setCommentLoading(false);
    }
  };

  const handleShare = async (post: CommunityPost) => {
    const shareUrl = `${window.location.origin}/community#${post.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${post.authorName} এর শেরপুর ভ্রমণ অভিজ্ঞতা`,
          text: post.caption,
          url: shareUrl,
        });
        showToast('শেয়ার করা হয়েছে!');
      } catch {}
    } else {
      navigator.clipboard.writeText(shareUrl);
      showToast('পোস্টের লিঙ্ক কপি করা হয়েছে!');
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCaption.trim()) return;

    if (!user) {
      onOpenAuthModal();
      return;
    }

    setIsSubmittingPost(true);
    try {
      const targetDest = destinations.find((d) => d.id === newDestinationId);
      const authorName = userProfile?.displayName || user.displayName || 'ভ্রমণকারী';
      const authorUsername = userProfile?.username || `user_${user.uid.slice(0, 6)}`;
      const authorAvatar = userProfile?.photoURL || user.photoURL || undefined;

      const created = await createCommunityPost({
        authorId: user.uid,
        authorName,
        authorUsername,
        authorAvatar,
        authorRole: 'শেরপুর পর্যটক',
        caption: newCaption.trim(),
        travelStory: newTravelStory.trim() || undefined,
        photos: newPhotoUrl.trim()
          ? [newPhotoUrl.trim()]
          : ['https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=1200&q=80'],
        destinationId: targetDest?.id,
        destinationTitle: targetDest?.titleBn,
        upazilaId: targetDest?.upazilaId,
      });

      setPosts((prev) => [created, ...prev]);
      setIsCreateModalOpen(false);
      setNewCaption('');
      setNewTravelStory('');
      setNewPhotoUrl('');
      setNewDestinationId('');
      showToast('আপনার ভ্রমণ গল্প সফলভাবে প্রকাশিত হয়েছে!');
    } finally {
      setIsSubmittingPost(false);
    }
  };

  const handleReportPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingPost) return;

    await submitContentReport({
      targetType: 'post',
      targetId: reportingPost.id,
      targetTitle: reportingPost.caption.slice(0, 60),
      reason: reportReason,
      details: reportDetails,
      reportedBy: user?.uid || 'guest_reporter',
      reportedByName: userProfile?.displayName || user?.displayName || 'ভ্রমণকারী',
    });

    setReportSubmitted(true);
    setTimeout(() => {
      setReportSubmitted(false);
      setReportingPost(null);
      setReportDetails('');
      showToast('আপনার রিপোর্ট পর্যালোচনা করা হবে। ধন্যবাদ!');
    }, 1500);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#143E27] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-4 text-xs sm:text-sm font-semibold border border-emerald-500/30">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-br from-[#143E27] via-[#1E5638] to-[#0F291B] rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden shadow-sm">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold backdrop-blur-md border border-emerald-400/20">
            <Users className="w-3.5 h-3.5" />
            <span>ভ্রমণকারীদের সামাজিক প্ল্যাটফর্ম</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            শেরপুর ট্রাভেল কমিউনিটি
          </h1>
          <p className="text-emerald-100/90 text-xs sm:text-sm leading-relaxed">
            গারো পাহাড় ও শেরপুরের নয়নাভিরাম স্থানসমূহের আসল ভ্রমণ অভিজ্ঞতা, তাজা ছবি, ও মূল্যবান পরামর্শ শেয়ার করুন।
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                if (!user) {
                  onOpenAuthModal();
                } else {
                  setIsCreateModalOpen(true);
                }
              }}
              className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-xs sm:text-sm transition flex items-center gap-2 shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>আপনার ভ্রমণ গল্প পোস্ট করুন</span>
            </button>
            <button
              onClick={() => onNavigate('places')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm transition border border-white/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              <span>স্থানসমূহ ব্রাউজ করুন</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters & Controls */}
      <div className="bg-white rounded-2xl border border-gray-200/90 p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Sort Filter */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setFilterSort('newest')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              filterSort === 'newest'
                ? 'bg-[#143E27] text-white shadow-2xs'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>সর্বশেষ পোস্ট</span>
          </button>
          <button
            onClick={() => setFilterSort('popular')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              filterSort === 'popular'
                ? 'bg-[#143E27] text-white shadow-2xs'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>জনপ্রিয় গল্পসমূহ</span>
          </button>
        </div>

        {/* Destination Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-gray-500 font-medium shrink-0">স্থান:</span>
          <select
            value={selectedDestinationFilter}
            onChange={(e) => setSelectedDestinationFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-1.5 rounded-xl border border-gray-200 bg-gray-50 text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#143E27]"
          >
            <option value="all">সকল স্থান</option>
            {destinations.map((d) => (
              <option key={d.id} value={d.id}>
                {d.titleBn}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Posts List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-200 border-t-[#143E27] rounded-full animate-spin" />
          <p className="text-xs font-semibold text-gray-500">ভ্রমণ গল্প লোড হচ্ছে...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center space-y-3 max-w-md mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto">
            <Camera className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">এখনো কোনো গল্প নেই</h3>
          <p className="text-xs text-gray-600">
            এই স্থানে আপনার ভ্রমণ অভিজ্ঞতা সবার সাথে শেয়ার করে প্রথম অবদানকারী হোন!
          </p>
          <button
            onClick={() => {
              if (!user) onOpenAuthModal();
              else setIsCreateModalOpen(true);
            }}
            className="px-5 py-2 rounded-xl bg-[#143E27] text-white text-xs font-bold hover:bg-[#0E2C1C] transition cursor-pointer"
          >
            প্রথম গল্প পোস্ট করুন
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => {
            const isLiked = isPostLikedLocally(post.id, user?.uid);
            const isCommentsOpen = expandedCommentsPostId === post.id;
            const comments = commentsMap[post.id] || [];

            return (
              <article
                key={post.id}
                id={post.id}
                className="bg-white rounded-3xl border border-gray-200/90 shadow-2xs overflow-hidden transition-all hover:shadow-md"
              >
                {/* Author Bar */}
                <div className="p-4 sm:p-5 flex items-center justify-between border-b border-gray-100">
                  <div
                    onClick={() => onNavigate('profile', post.authorUsername)}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <img
                      src={
                        post.authorAvatar ||
                        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
                      }
                      alt={post.authorName}
                      onError={(e) => handleImageError(e)}
                      className="w-10 h-10 rounded-full object-cover border border-emerald-600/30 group-hover:scale-105 transition-transform"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-gray-900 group-hover:text-[#143E27] transition">
                          {post.authorName}
                        </span>
                        {post.authorRole && (
                          <span className="text-[10px] bg-emerald-50 text-[#143E27] font-semibold px-2 py-0.5 rounded-full border border-emerald-200/60">
                            {post.authorRole}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-gray-400 font-sans flex items-center gap-2">
                        <span>@{post.authorUsername}</span>
                        <span>•</span>
                        <span>
                          {new Date(post.createdAt).toLocaleDateString('bn-BD', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Destination Tag & Report button */}
                  <div className="flex items-center gap-2">
                    {post.destinationTitle && (
                      <button
                        onClick={() => {
                          const d = destinations.find((x) => x.id === post.destinationId);
                          if (d) onSelectDestination(d.slug);
                          else onNavigate('places');
                        }}
                        className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 transition cursor-pointer"
                      >
                        <MapPin className="w-3 h-3 text-emerald-600" />
                        <span>{post.destinationTitle}</span>
                      </button>
                    )}
                    <button
                      onClick={() => setReportingPost(post)}
                      className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                      title="রিপোর্ট বা অভিযোগ করুন"
                    >
                      <Flag className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Post Content */}
                <div className="p-4 sm:p-5 space-y-3">
                  <p className="text-sm sm:text-base text-gray-800 leading-relaxed font-medium">
                    {post.caption}
                  </p>

                  {post.travelStory && (
                    <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100/80 text-xs sm:text-sm text-gray-700 leading-relaxed">
                      <div className="text-[11px] font-bold text-emerald-900 mb-1 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-500" /> ভ্রমণ অভিজ্ঞতা:
                      </div>
                      {post.travelStory}
                    </div>
                  )}

                  {/* Photos */}
                  {post.photos && post.photos.length > 0 && (
                    <div
                      className={`grid gap-2 rounded-2xl overflow-hidden mt-3 ${
                        post.photos.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
                      }`}
                    >
                      {post.photos.map((imgUrl, idx) => (
                        <div key={idx} className="relative h-60 sm:h-72 bg-gray-100 overflow-hidden">
                          <img
                            src={imgUrl}
                            alt="ভ্রমণ ছবি"
                            loading="lazy"
                            onError={(e) => handleImageError(e)}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Destination pill for mobile */}
                  {post.destinationTitle && (
                    <div className="sm:hidden pt-1">
                      <button
                        onClick={() => {
                          const d = destinations.find((x) => x.id === post.destinationId);
                          if (d) onSelectDestination(d.slug);
                          else onNavigate('places');
                        }}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200"
                      >
                        <MapPin className="w-3 h-3" />
                        <span>{post.destinationTitle}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Social Actions */}
                <div className="px-4 sm:px-5 py-3 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
                  <div className="flex items-center gap-4">
                    {/* Like button */}
                    <button
                      onClick={() => handleLike(post)}
                      className={`flex items-center gap-1.5 font-bold transition cursor-pointer ${
                        isLiked ? 'text-rose-600' : 'hover:text-rose-600 text-gray-600'
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 ${isLiked ? 'fill-rose-600 text-rose-600' : ''}`}
                      />
                      <span>{post.likesCount} লাইক</span>
                    </button>

                    {/* Comment button */}
                    <button
                      onClick={() => handleToggleComments(post.id)}
                      className="flex items-center gap-1.5 font-bold hover:text-[#143E27] transition cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4 text-emerald-700" />
                      <span>{post.commentsCount} মন্তব্য</span>
                    </button>

                    {/* Share button */}
                    <button
                      onClick={() => handleShare(post)}
                      className="flex items-center gap-1.5 font-bold hover:text-[#143E27] transition cursor-pointer"
                    >
                      <Share2 className="w-4 h-4 text-gray-500" />
                      <span>শেয়ার</span>
                    </button>
                  </div>

                  <span className="text-[11px] text-gray-400">
                    {post.photos.length > 0 ? `${post.photos.length}টি ছবি` : 'গল্প'}
                  </span>
                </div>

                {/* Comments Section */}
                {isCommentsOpen && (
                  <div className="p-4 sm:p-5 bg-gray-50/60 border-t border-gray-200/80 space-y-3 animate-in fade-in">
                    {/* Comments list */}
                    <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                      {comments.length === 0 ? (
                        <p className="text-xs text-gray-400 text-center py-2">
                          এখনো কোনো মন্তব্য নেই। প্রথম মন্তব্যটি আপনি করুন!
                        </p>
                      ) : (
                        comments.map((c) => (
                          <div
                            key={c.id}
                            className="bg-white p-3 rounded-xl border border-gray-200/70 text-xs space-y-1"
                          >
                            <div className="flex items-center justify-between font-semibold text-gray-800">
                              <span className="text-[#143E27]">{c.authorName}</span>
                              <span className="text-[10px] text-gray-400">
                                {new Date(c.createdAt).toLocaleDateString('bn-BD')}
                              </span>
                            </div>
                            <p className="text-gray-700 leading-relaxed">{c.text}</p>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Add comment input */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        value={commentInputMap[post.id] || ''}
                        onChange={(e) =>
                          setCommentInputMap((prev) => ({ ...prev, [post.id]: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddComment(post.id);
                        }}
                        placeholder="মন্তব্য লিখুন..."
                        className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#143E27]"
                      />
                      <button
                        onClick={() => handleAddComment(post.id)}
                        disabled={commentLoading}
                        className="px-3.5 py-2 bg-[#143E27] text-white rounded-xl text-xs font-bold hover:bg-[#0E2C1C] transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>পাঠান</span>
                      </button>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      {/* Create Post Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-emerald-700" />
                <h3 className="text-lg font-bold text-gray-900">ভ্রমণ গল্প প্রকাশ করুন</h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  ক্যাপশন বা শিরোনাম <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newCaption}
                  onChange={(e) => setNewCaption(e.target.value)}
                  placeholder="যেমন: শীতের সকালে মধুটিলা ইকোপার্কে অসাধারণ সময় কাটল..."
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#143E27] focus:outline-none text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  সম্পূর্ণ ভ্রমণ গল্প ও অভিজ্ঞতা
                </label>
                <textarea
                  rows={4}
                  value={newTravelStory}
                  onChange={(e) => setNewTravelStory(e.target.value)}
                  placeholder="কীভাবে গেলেন, খরচ কেমন হলো, কী কী ভালো লাগল এবং অন্যদের জন্য কোনো প্রয়োজনীয় টিপস থাকলে লিখুন..."
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#143E27] focus:outline-none text-xs leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  সম্পর্কিত দর্শনীয় স্থান (ঐচ্ছিক)
                </label>
                <select
                  value={newDestinationId}
                  onChange={(e) => setNewDestinationId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#143E27] focus:outline-none text-xs bg-white"
                >
                  <option value="">কোনো স্থান নির্দিষ্ট নয়</option>
                  {destinations.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.titleBn} ({d.locationName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  ছবির ওয়েব লিংক (URL)
                </label>
                <input
                  type="url"
                  value={newPhotoUrl}
                  onChange={(e) => setNewPhotoUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#143E27] focus:outline-none text-xs"
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  ছবি না দিলে একটি ডিফল্ট গারো পাহাড়ের ছবি যুক্ত হবে।
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPost || !newCaption.trim()}
                  className="px-5 py-2.5 rounded-xl bg-[#143E27] text-white font-bold hover:bg-[#0E2C1C] transition disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  {isSubmittingPost ? 'প্রকাশ হচ্ছে...' : 'প্রকাশ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {reportingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertCircle className="w-5 h-5" />
                <h3 className="text-base font-bold text-gray-900">পোস্ট রিপোর্ট করুন</h3>
              </div>
              <button
                onClick={() => setReportingPost(null)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {reportSubmitted ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <p className="font-bold text-sm text-gray-900">রিপোর্ট গ্রহণ করা হয়েছে</p>
                <p className="text-xs text-gray-500">আমাদের অ্যাডমিন টিম এটি পর্যালোচনা করবে।</p>
              </div>
            ) : (
              <form onSubmit={handleReportPost} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">অভিযোগের কারণ</label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none"
                  >
                    <option value="spam">স্প্যাম বা অপ্রাসঙ্গিক বিজ্ঞাপন</option>
                    <option value="misleading">ভুল বা বিভ্রান্তিকর তথ্য</option>
                    <option value="inappropriate">অশ্লীল বা অশালীন ছবি/ভাষা</option>
                    <option value="harassment">ব্যক্তিগত আক্রমণ বা হয়রানি</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">বিস্তারিত বিবরণ (ঐচ্ছিক)</label>
                  <textarea
                    rows={3}
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    placeholder="সুনির্দিষ্ট কারণ উল্লেখ করুন..."
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setReportingPost(null)}
                    className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-semibold"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 transition"
                  >
                    জমা দিন
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
