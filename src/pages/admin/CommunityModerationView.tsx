import React, { useState, useEffect } from 'react';
import {
  Users,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Eye,
  EyeOff,
  Flag,
  MessageCircle,
  Heart,
  ShieldCheck,
  Filter,
  Check,
  X,
  Clock,
  Sparkles,
} from 'lucide-react';
import { CommunityPost, ContentReport, ReportStatus } from '../../types/community';
import {
  getAllPostsForAdmin,
  updatePostStatus,
  deletePost,
} from '../../services/communityService';
import {
  getReportsForAdmin,
  resolveReport,
  dismissReport,
} from '../../services/reportService';
import { useAuth } from '../../context/AuthContext';

export const CommunityModerationView: React.FC = () => {
  const { adminName } = useAuth();
  const [activeTab, setActiveTab] = useState<'posts' | 'reports'>('posts');
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [reports, setReports] = useState<ContentReport[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [postStatusFilter, setPostStatusFilter] = useState<'all' | 'published' | 'hidden' | 'flagged'>('all');
  const [reportStatusFilter, setReportStatusFilter] = useState<'all' | ReportStatus>('pending');

  const loadData = async () => {
    setLoading(true);
    try {
      const [allPosts, allReports] = await Promise.all([
        getAllPostsForAdmin(),
        getReportsForAdmin(),
      ]);
      setPosts(allPosts);
      setReports(allReports);
    } catch (e) {
      console.error('Error loading moderation data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTogglePostVisibility = async (post: CommunityPost) => {
    const nextStatus = post.status === 'published' ? 'hidden' : 'published';
    await updatePostStatus(post.id, nextStatus);
    setPosts((prev) =>
      prev.map((p) => (p.id === post.id ? { ...p, status: nextStatus } : p))
    );
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm('আপনি কি নিশ্চিত যে এই পোস্টটি সম্পূর্ণ মুছে ফেলতে চান?')) return;
    await deletePost(postId);
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const handleResolveReport = async (reportId: string) => {
    await resolveReport(reportId, adminName || 'Admin', 'যথাযথ ব্যবস্থা নেওয়া হয়েছে');
    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? { ...r, status: 'resolved', resolvedBy: adminName || 'Admin' }
          : r
      )
    );
  };

  const handleDismissReport = async (reportId: string) => {
    await dismissReport(reportId, adminName || 'Admin');
    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? { ...r, status: 'dismissed', resolvedBy: adminName || 'Admin' }
          : r
      )
    );
  };

  const filteredPosts = posts.filter(
    (p) => postStatusFilter === 'all' || p.status === postStatusFilter
  );

  const filteredReports = reports.filter(
    (r) => reportStatusFilter === 'all' || r.status === reportStatusFilter
  );

  return (
    <div className="space-y-6">
      {/* Moderation Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-gray-200 shadow-2xs">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-800" />
            <span>কমিউনিটি ও কনটেন্ট মডারেশন</span>
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            ইউজারদের ভ্রমণ গল্প, ছবি, মন্তব্য ও রিপোর্টের সত্যতা যাচাই এবং সুরক্ষা নীতি কার্যকর করুন।
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-2xl shrink-0">
          <button
            onClick={() => setActiveTab('posts')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'posts'
                ? 'bg-white text-gray-900 shadow-2xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-emerald-800" />
            <span>সকল পোস্ট ({posts.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'reports'
                ? 'bg-white text-gray-900 shadow-2xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Flag className="w-3.5 h-3.5 text-rose-600" />
            <span>অভিযোগ ও রিপোর্ট ({reports.filter((r) => r.status === 'pending').length})</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-200 border-t-[#143E27] rounded-full animate-spin" />
          <p className="text-xs font-semibold text-gray-500">মডারেশন তথ্য লোড হচ্ছে...</p>
        </div>
      ) : activeTab === 'posts' ? (
        <div className="space-y-4">
          {/* Post Filter Controls */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-semibold">স্ট্যাটাস অনুযায়ী:</span>
            {(['all', 'published', 'hidden', 'flagged'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setPostStatusFilter(st)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                  postStatusFilter === st
                    ? 'bg-[#143E27] text-white'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {st === 'all'
                  ? 'সকল পোস্ট'
                  : st === 'published'
                  ? 'প্রকাশিত'
                  : st === 'hidden'
                  ? 'লুকানো'
                  : 'রিপোর্টেড / ফ্ল্যাগড'}
              </button>
            ))}
          </div>

          {/* Posts Table / Card List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-3xl border border-gray-200/90 p-5 space-y-3 shadow-2xs flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                        {post.authorName.slice(0, 1)}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-gray-900">{post.authorName}</h4>
                        <span className="text-[10px] text-gray-400">@{post.authorUsername}</span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        post.status === 'published'
                          ? 'bg-emerald-100 text-emerald-800'
                          : post.status === 'hidden'
                          ? 'bg-gray-100 text-gray-600'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {post.status === 'published'
                        ? 'প্রকাশিত'
                        : post.status === 'hidden'
                        ? 'লুকানো'
                        : 'ফ্ল্যাগড'}
                    </span>
                  </div>

                  <p className="text-xs text-gray-800 font-medium leading-relaxed">
                    {post.caption}
                  </p>

                  {post.photos && post.photos[0] && (
                    <img
                      src={post.photos[0]}
                      alt=""
                      className="w-full h-36 rounded-xl object-cover"
                    />
                  )}

                  <div className="flex items-center gap-3 text-[11px] text-gray-500">
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3 text-rose-500" /> {post.likesCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3 text-emerald-700" /> {post.commentsCount}
                    </span>
                    {post.destinationTitle && (
                      <span className="truncate text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                        {post.destinationTitle}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <button
                    onClick={() => handleTogglePostVisibility(post)}
                    className="px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-semibold text-gray-700 flex items-center gap-1.5 transition cursor-pointer"
                  >
                    {post.status === 'published' ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                        <span>লুকিয়ে রাখুন</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5 text-emerald-600" />
                        <span>উন্মুক্ত করুন</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="p-1.5 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                    title="পোস্ট মুছুন"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Reports tab */
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-semibold">রিপোর্ট অবস্থা:</span>
            {(['all', 'pending', 'resolved', 'dismissed'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setReportStatusFilter(st)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                  reportStatusFilter === st
                    ? 'bg-[#143E27] text-white'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {st === 'all'
                  ? 'সকল রিপোর্ট'
                  : st === 'pending'
                  ? 'অপেক্ষমাণ'
                  : st === 'resolved'
                  ? 'মীমাংসিত'
                  : 'বাতিলকৃত'}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-3xl border border-gray-200/90 shadow-2xs overflow-hidden">
            {filteredReports.length === 0 ? (
              <div className="p-12 text-center text-xs text-gray-400">
                কোনো অভিযোগ বা রিপোর্ট জমা পড়েনি।
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredReports.map((report) => (
                  <div key={report.id} className="p-5 flex flex-col sm:flex-row items-start justify-between gap-4">
                    <div className="space-y-1.5 max-w-xl">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                          {report.targetType === 'post' ? 'পোস্ট' : report.targetType}
                        </span>
                        <span className="text-xs font-bold text-gray-900">
                          কারণ: {report.reason}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {new Date(report.createdAt).toLocaleDateString('bn-BD')}
                        </span>
                      </div>

                      {report.targetTitle && (
                        <p className="text-xs font-semibold text-gray-800 bg-gray-50 p-2 rounded-lg">
                          “{report.targetTitle}”
                        </p>
                      )}

                      {report.details && (
                        <p className="text-xs text-gray-600">{report.details}</p>
                      )}

                      <p className="text-[11px] text-gray-400">
                        রিপোর্টকারী: {report.reportedByName || report.reportedBy}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {report.status === 'pending' ? (
                        <>
                          <button
                            onClick={() => handleResolveReport(report.id)}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center gap-1 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>সমাধান করুন</span>
                          </button>
                          <button
                            onClick={() => handleDismissReport(report.id)}
                            className="px-3.5 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-gray-600 font-bold text-xs transition cursor-pointer"
                          >
                            <span>বাতিল</span>
                          </button>
                        </>
                      ) : (
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                            report.status === 'resolved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {report.status === 'resolved' ? 'মীমাংসিত' : 'বাতিলকৃত'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
