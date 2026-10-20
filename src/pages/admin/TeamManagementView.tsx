import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Compass,
  MapPin,
  Calendar,
  Clock,
  Mail,
  Phone,
  LayoutGrid,
  List,
  AlertTriangle,
  X,
  Check,
  Sparkles,
  Upload,
  Camera,
} from 'lucide-react';
import { TeamMember, TeamRole, AccountStatus } from '../../types';
import {
  getTeamMembers,
  saveTeamMember,
  deleteTeamMember,
  toggleTeamMemberStatus,
  PRESET_AVATARS,
} from '../../services/teamService';
import { formatInDhakaTime } from '../../services/analyticsService';
import { uploadAvatarImage } from '../../utils/imageUploadHelper';

interface TeamManagementViewProps {
  currentUsername: string | null;
  isSuperAdmin: boolean;
  onRefreshData?: () => void;
}

export const TeamManagementView: React.FC<TeamManagementViewProps> = ({
  currentUsername,
  isSuperAdmin,
  onRefreshData,
}) => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | TeamRole>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | AccountStatus>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Partial<TeamMember> | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Delete confirm state
  const [deleteConfirmMember, setDeleteConfirmMember] = useState<TeamMember | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast message
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Load team members
  const loadMembers = async () => {
    setLoading(true);
    try {
      const data = await getTeamMembers();
      setMembers(data);
    } catch (e) {
      console.error('Error fetching team members:', e);
      showToast('টিম মেম্বারদের তালিকা লোড করতে ব্যর্থ হয়েছে', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  // Filter members
  const filteredMembers = members.filter((m) => {
    if (roleFilter !== 'all' && m.role !== roleFilter) return false;
    if (statusFilter !== 'all' && m.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = m.fullName.toLowerCase().includes(q);
      const matchUser = m.username.toLowerCase().includes(q);
      const matchTitle = m.title.toLowerCase().includes(q);
      if (!matchName && !matchUser && !matchTitle) return false;
    }
    return true;
  });

  // Open modal to add member
  const handleOpenAdd = () => {
    setEditingMember({
      username: '',
      fullName: '',
      firstName: '',
      lastName: '',
      title: 'কন্টেন্ট কন্ট্রিবিউটর ও লোকাল স্কাউট',
      bio: '',
      role: 'editor',
      status: 'active',
      email: '',
      phone: '',
      avatarUrl: PRESET_AVATARS[Math.floor(Math.random() * PRESET_AVATARS.length)],
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  // Open modal to edit member
  const handleOpenEdit = (m: TeamMember) => {
    setEditingMember({ ...m });
    setModalError(null);
    setIsModalOpen(true);
  };

  // Save member
  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember?.username?.trim()) {
      setModalError('ইউজারনেম আবশ্যক।');
      return;
    }
    if (!editingMember?.fullName?.trim()) {
      setModalError('পূর্ণ নাম আবশ্যক।');
      return;
    }

    setIsSaving(true);
    setModalError(null);
    try {
      await saveTeamMember({
        ...editingMember,
        username: editingMember.username.trim(),
        fullName: editingMember.fullName.trim(),
      });
      await loadMembers();
      if (onRefreshData) onRefreshData();
      setIsModalOpen(false);
      setEditingMember(null);
      showToast('টিম মেম্বারের তথ্য সফলভাবে সংরক্ষিত হয়েছে!');
    } catch (err: any) {
      setModalError(err?.message || 'সংরক্ষণ ব্যর্থ হয়েছে।');
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle status
  const handleToggleStatus = async (m: TeamMember) => {
    if (!isSuperAdmin) {
      showToast('শুধুমাত্র সুপার অ্যাডমিন স্ট্যাটাস পরিবর্তন করতে পারেন।', 'error');
      return;
    }
    if (m.username === 'sabbir') {
      showToast('প্রধান সুপার অ্যাডমিন অ্যাকাউন্ট নিষ্ক্রিয় করা যাবে না।', 'error');
      return;
    }
    try {
      const next = await toggleTeamMemberStatus(m.id, m.status);
      await loadMembers();
      showToast(`সদস্যের অ্যাকাউন্ট ${next === 'active' ? 'সক্রিয়' : 'নিষ্ক্রিয়'} করা হয়েছে।`);
    } catch (err: any) {
      showToast(err?.message || 'স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে।', 'error');
    }
  };

  // Delete member
  const handleDeleteConfirm = async () => {
    if (!deleteConfirmMember) return;
    setIsDeleting(true);
    try {
      await deleteTeamMember(deleteConfirmMember.id);
      await loadMembers();
      if (onRefreshData) onRefreshData();
      setDeleteConfirmMember(null);
      showToast('টিম মেম্বারকে তালিকা থেকে অপসারন করা হয়েছে।');
    } catch (err: any) {
      showToast(err?.message || 'মুছে ফেলতে ব্যর্থ হয়েছে।', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Helper for role badge
  const renderRoleBadge = (role: TeamRole) => {
    switch (role) {
      case 'superadmin':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200">
            <ShieldAlert className="w-3 h-3 text-purple-600" />
            সুপার অ্যাডমিন
          </span>
        );
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
            <ShieldCheck className="w-3 h-3 text-blue-600" />
            অ্যাডমিনিস্ট্রেটর
          </span>
        );
      case 'editor':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            <Shield className="w-3 h-3 text-emerald-600" />
            কনটেন্ট এডিটর
          </span>
        );
      case 'contributor':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
            <Compass className="w-3 h-3 text-amber-600" />
            তথ্য সংগ্রাহক
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-bold border transition-all ${
            toast.type === 'success'
              ? 'bg-emerald-900 text-white border-emerald-700'
              : 'bg-red-900 text-white border-red-700'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-300" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-300" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-gray-200/90 shadow-2xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-100">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                টিম ও সম্পাদক প্যানেল ব্যবস্থাপনা
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                  {members.length} জন সদস্য
                </span>
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                শেরপুর ভ্রমণ গাইড সমৃদ্ধকরণে নিয়োজিত গবেষক, এডিটর ও আঞ্চলিক স্কাউটদের তালিকা ও দায়িত্ব নির্ধারণ।
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        {isSuperAdmin && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#143E27] text-white font-bold text-xs hover:bg-[#0D2618] shadow-2xs transition cursor-pointer self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4" />
            <span>নতুন মেম্বার যুক্ত করুন</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 bg-white p-4 rounded-2xl border border-gray-200/90 shadow-2xs">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="নাম, ইউজারনেম বা পদবি দিয়ে খুঁজুন..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm outline-none focus:border-purple-600"
          />
        </div>

        {/* Role Filter */}
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as any)}
          className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold outline-none focus:border-purple-600 bg-white"
        >
          <option value="all">সকল পদমর্যাদা (All Roles)</option>
          <option value="superadmin">সুপার অ্যাডমিন</option>
          <option value="admin">অ্যাডমিনিস্ট্রেটর</option>
          <option value="editor">কনটেন্ট এডিটর</option>
          <option value="contributor">তথ্য সংগ্রাহক</option>
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold outline-none focus:border-purple-600 bg-white"
        >
          <option value="all">সকল স্ট্যাটাস (All Status)</option>
          <option value="active">সক্রিয় (Active)</option>
          <option value="inactive">নিষ্ক্রিয় (Inactive)</option>
        </select>

        {/* Grid vs Table View Mode */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg transition cursor-pointer ${
              viewMode === 'grid' ? 'bg-white shadow-2xs text-[#143E27]' : 'text-gray-500'
            }`}
            title="গ্রিড ভিউ"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-lg transition cursor-pointer ${
              viewMode === 'table' ? 'bg-white shadow-2xs text-[#143E27]' : 'text-gray-500'
            }`}
            title="টেবিল ভিউ"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Members Content View */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 bg-gray-200/70 rounded-3xl" />
          ))}
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              className={`bg-white rounded-3xl border p-5 shadow-2xs space-y-4 transition hover:shadow-md ${
                member.status === 'inactive' ? 'opacity-70 border-gray-200 bg-gray-50/50' : 'border-gray-200/90'
              }`}
            >
              {/* Member Top Bar */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={member.avatarUrl || PRESET_AVATARS[0]}
                      alt={member.fullName}
                      className="w-13 h-13 rounded-2xl object-cover border-2 border-white shadow-2xs"
                    />
                    <span
                      className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                        member.status === 'active' ? 'bg-emerald-500' : 'bg-gray-400'
                      }`}
                      title={member.status === 'active' ? 'সক্রিয় একাউন্ট' : 'নিষ্ক্রিয় একাউন্ট'}
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 leading-tight">
                      {member.fullName}
                    </h3>
                    <div className="text-[11px] font-mono text-gray-500">@{member.username}</div>
                    <div className="mt-1">{renderRoleBadge(member.role)}</div>
                  </div>
                </div>

                {/* Status Toggle & Actions */}
                {isSuperAdmin && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(member)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-[#143E27] hover:bg-emerald-50 transition cursor-pointer"
                      title="তথ্য সম্পাদন করুন"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {member.username !== 'sabbir' && (
                      <button
                        onClick={() => setDeleteConfirmMember(member)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Title & Bio */}
              <div className="space-y-1">
                <div className="text-xs font-semibold text-emerald-900">{member.title}</div>
                {member.bio && (
                  <p className="text-[11px] text-gray-600 line-clamp-2 leading-relaxed">
                    {member.bio}
                  </p>
                )}
              </div>

              {/* Contact Info (if available) */}
              {(member.email || member.phone) && (
                <div className="pt-2 border-t border-gray-100 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-500">
                  {member.email && (
                    <span className="flex items-center gap-1 truncate max-w-[200px]">
                      <Mail className="w-3 h-3 text-gray-400" />
                      {member.email}
                    </span>
                  )}
                  {member.phone && (
                    <span className="flex items-center gap-1 font-mono">
                      <Phone className="w-3 h-3 text-gray-400" />
                      {member.phone}
                    </span>
                  )}
                </div>
              )}

              {/* Stats Footer */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                <div className="flex items-center gap-3">
                  <span title="যুক্ত করা পর্যটন স্থান">
                    <strong className="text-gray-900 font-bold">{member.placesCreated}</strong> স্থান যুক্ত
                  </span>
                  <span title="হালনাগাদ করা পর্যটন স্থান">
                    <strong className="text-gray-900 font-bold">{member.placesUpdated}</strong> এডিট
                  </span>
                </div>

                {isSuperAdmin && member.username !== 'sabbir' && (
                  <button
                    onClick={() => handleToggleStatus(member)}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md cursor-pointer transition ${
                      member.status === 'active'
                        ? 'text-red-700 bg-red-50 hover:bg-red-100'
                        : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                    }`}
                  >
                    {member.status === 'active' ? 'নিষ্ক্রিয় করুন' : 'সক্রিয় করুন'}
                  </button>
                )}
              </div>
            </div>
          ))}

          {filteredMembers.length === 0 && (
            <div className="col-span-full py-16 text-center text-xs text-gray-400">
              কোনো টিম মেম্বার খুঁজে পাওয়া যায়নি।
            </div>
          )}
        </div>
      ) : (
        /* TABLE LIST VIEW */
        <div className="bg-white rounded-3xl border border-gray-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 text-gray-600 uppercase text-[10px] font-bold border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">মেম্বার</th>
                  <th className="py-3 px-4">পদবি ও রোল</th>
                  <th className="py-3 px-4">স্ট্যাটাস</th>
                  <th className="py-3 px-4">অবদান (Places)</th>
                  <th className="py-3 px-4">যোগদানের তারিখ</th>
                  <th className="py-3 px-4 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50/80 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={member.avatarUrl || PRESET_AVATARS[0]}
                          alt={member.fullName}
                          className="w-10 h-10 rounded-xl object-cover border border-gray-200"
                        />
                        <div>
                          <div className="font-bold text-gray-900">{member.fullName}</div>
                          <div className="text-[11px] font-mono text-gray-500">@{member.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-gray-800">{member.title}</div>
                      <div className="mt-0.5">{renderRoleBadge(member.role)}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          member.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        ● {member.status === 'active' ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      <div><strong className="text-gray-900">{member.placesCreated}</strong>টি স্থান তৈরি</div>
                      <div className="text-[11px] text-gray-400">{member.placesUpdated}টি আপডেট</div>
                    </td>
                    <td className="py-3 px-4 text-gray-500 font-mono text-[11px]">
                      {formatInDhakaTime(member.joinedDate, 'date')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {isSuperAdmin && (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(member)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-[#143E27] hover:bg-emerald-50 transition cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {member.username !== 'sabbir' && (
                            <button
                              onClick={() => setDeleteConfirmMember(member)}
                              className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl w-full max-w-lg overflow-hidden my-8">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-600" />
                <span>
                  {editingMember.id ? 'টিম মেম্বারের তথ্য পরিবর্তন' : 'নতুন টিম মেম্বার সংযোজন'}
                </span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMember} className="p-5 space-y-4 text-xs sm:text-sm">
              {modalError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold">
                  {modalError}
                </div>
              )}

              {/* Avatar Selector */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-gray-700 block">প্রোফাইল ছবি (Avatar)</label>
                  <label className="text-xs text-purple-700 font-bold hover:underline cursor-pointer flex items-center gap-1 bg-purple-50 px-2 py-0.5 rounded-lg border border-purple-200">
                    <Upload className="w-3.5 h-3.5" />
                    <span>ডিভাইস থেকে আপলোড</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file && editingMember) {
                          try {
                            const url = await uploadAvatarImage(file, editingMember.username || 'member');
                            setEditingMember({ ...editingMember, avatarUrl: url });
                          } catch (err) {
                            console.error(err);
                          }
                        }
                      }}
                    />
                  </label>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {editingMember.avatarUrl && (
                    <div className="relative shrink-0">
                      <img
                        src={editingMember.avatarUrl}
                        alt="Current"
                        className="w-12 h-12 rounded-xl object-cover border-2 border-purple-600 shadow-md"
                      />
                      <span className="absolute -bottom-1 -right-1 bg-purple-600 text-white rounded-full p-0.5 text-[8px]">
                        ✓
                      </span>
                    </div>
                  )}
                  {PRESET_AVATARS.map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt="Preset"
                      onClick={() => setEditingMember({ ...editingMember, avatarUrl: url })}
                      className={`w-11 h-11 rounded-xl object-cover cursor-pointer border-2 transition ${
                        editingMember.avatarUrl === url
                          ? 'border-purple-600 scale-105 shadow-md'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
                <input
                  type="text"
                  value={editingMember.avatarUrl || ''}
                  onChange={(e) => setEditingMember({ ...editingMember, avatarUrl: e.target.value })}
                  placeholder="অথবা কাস্টম ইমেজ URL প্রদান করুন..."
                  className="w-full mt-1.5 p-2 rounded-xl border border-gray-200 text-xs outline-none focus:border-purple-600 font-mono"
                />
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">পূর্ণ নাম (Full Name) *</label>
                  <input
                    type="text"
                    required
                    value={editingMember.fullName || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, fullName: e.target.value })}
                    placeholder="যেমন: মো. সাব্বির হোসেন"
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm outline-none focus:border-purple-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">ইউজারনেম (Username) *</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingMember.id}
                    value={editingMember.username || ''}
                    onChange={(e) =>
                      setEditingMember({
                        ...editingMember,
                        username: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''),
                      })
                    }
                    placeholder="যেমন: sabbir_curator"
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm outline-none focus:border-purple-600 font-mono disabled:bg-gray-100"
                  />
                </div>
              </div>

              {/* Title & Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">পদবি (Title / Designation)</label>
                  <input
                    type="text"
                    value={editingMember.title || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, title: e.target.value })}
                    placeholder="যেমন: কনটেন্ট এডিটর ও রুট বিশ্লেষক"
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm outline-none focus:border-purple-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">পদমর্যাদা (Role Level)</label>
                  <select
                    value={editingMember.role || 'editor'}
                    disabled={editingMember.username === 'sabbir'}
                    onChange={(e) => setEditingMember({ ...editingMember, role: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm outline-none focus:border-purple-600 bg-white"
                  >
                    <option value="contributor">তথ্য সংগ্রাহক (Contributor)</option>
                    <option value="editor">কনটেন্ট এডিটর (Editor)</option>
                    <option value="admin">অ্যাডমিনিস্ট্রেটর (Admin)</option>
                    <option value="superadmin">সুপার অ্যাডমিন (Super Admin)</option>
                  </select>
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">ইমেইল ঠিকানা</label>
                  <input
                    type="email"
                    value={editingMember.email || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, email: e.target.value })}
                    placeholder="user@example.com"
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm outline-none focus:border-purple-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">ফোন নম্বর</label>
                  <input
                    type="text"
                    value={editingMember.phone || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, phone: e.target.value })}
                    placeholder="+8801..."
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm outline-none focus:border-purple-600 font-mono"
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="font-bold text-gray-700 block mb-1">সংক্ষিপ্ত পরিচিতি (Short Bio)</label>
                <textarea
                  rows={2}
                  value={editingMember.bio || ''}
                  onChange={(e) => setEditingMember({ ...editingMember, bio: e.target.value })}
                  placeholder="টিম মেম্বারের অভিজ্ঞতা ও দায়িত্ব সম্পর্কে সংক্ষেপে লিখুন..."
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm outline-none focus:border-purple-600"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-[#143E27] text-white text-xs font-bold hover:bg-[#0D2618] transition cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-2xl max-w-sm w-full space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="text-base font-bold text-gray-900">টিম মেম্বার অপসারন</h4>
              <p className="text-xs text-gray-500">
                আপনি কি নিশ্চিতভাবে <strong>{deleteConfirmMember.fullName}</strong> (@{deleteConfirmMember.username})-কে টিম তালিকা থেকে মুছে ফেলতে চান?
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmMember(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                না, রাখুন
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'অপসারন হচ্ছে...' : 'হ্যাঁ, মুছে ফেলুন'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
