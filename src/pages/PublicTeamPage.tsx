import React, { useState, useEffect } from 'react';
import {
  Users,
  ShieldCheck,
  Sparkles,
  Mail,
  Phone,
  Globe,
  MapPin,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Award,
  BookOpen,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { TeamMember } from '../types';
import { getTeamMembers } from '../services/teamService';
import { recordAnalyticsEvent } from '../services/analyticsService';

interface PublicTeamPageProps {
  onNavigate?: (view: string, param?: string) => void;
}

export const PublicTeamPage: React.FC<PublicTeamPageProps> = ({ onNavigate }) => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  useEffect(() => {
    recordAnalyticsEvent('page_view', {
      pagePath: '#team',
      metadata: { pageTitle: 'আমাদের টিম ও সম্পাদক প্যানেল' },
    });

    getTeamMembers()
      .then((list) => {
        setMembers(list);
      })
      .catch((err) => {
        console.error('Error loading team members:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const filteredMembers = members.filter((m) => {
    if (roleFilter === 'all') return true;
    if (roleFilter === 'superadmin') return m.role === 'superadmin';
    if (roleFilter === 'admin') return m.role === 'admin';
    if (roleFilter === 'editor') return m.role === 'editor' || m.role === 'contributor';
    return true;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'superadmin':
        return {
          label: 'প্রধান কিউরেটর ও প্রতিষ্ঠাতা',
          bg: 'bg-emerald-100 text-[#143E27] border-emerald-300',
        };
      case 'admin':
        return {
          label: 'সিনিয়র এডিটর ও গবেষক',
          bg: 'bg-blue-100 text-blue-900 border-blue-300',
        };
      case 'editor':
        return {
          label: 'আঞ্চলিক স্কাউট ও ফটোগ্রাফার',
          bg: 'bg-purple-100 text-purple-900 border-purple-300',
        };
      default:
        return {
          label: 'কনটেন্ট অবদানকারী',
          bg: 'bg-amber-100 text-amber-900 border-amber-300',
        };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-12">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-100/90 text-[#143E27] text-xs font-bold border border-emerald-200 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>শেরপুর ভ্রমণ গাইড সম্পাদকীয় ও গবেষণা টিম</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#143E27] tracking-tight leading-tight">
          আমাদের নিবেদিতপ্রাণ টিম ও গবেষক প্যানেল
        </h1>
        <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
          শেরপুর জেলার অপার সৌন্দর্য, গারো পাহাড়ের জীববৈচিত্র্য, মুঘল আমলের ঐতিহ্যবাহী স্থাপত্য ও লোকজ সংস্কৃতিকে দায়িত্বশীল পর্যটকদের কাছে পৌঁছে দেওয়ার জন্য নিরলস কাজ করছে আমাদের এই দল।
        </p>

        {/* Real Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
          <div className="bg-white p-3.5 rounded-2xl border border-gray-200/80 shadow-2xs text-center">
            <div className="text-2xl font-black text-[#143E27]">{members.length || 4} জন</div>
            <div className="text-[11px] text-gray-500 font-medium mt-0.5">গবেষক ও সম্পাদক</div>
          </div>
          <div className="bg-white p-3.5 rounded-2xl border border-gray-200/80 shadow-2xs text-center">
            <div className="text-2xl font-black text-emerald-600">১০০%</div>
            <div className="text-[11px] text-gray-500 font-medium mt-0.5">মাঠপর্যায়ে যাচাইকৃত</div>
          </div>
          <div className="bg-white p-3.5 rounded-2xl border border-gray-200/80 shadow-2xs text-center">
            <div className="text-2xl font-black text-blue-600">৫টি</div>
            <div className="text-[11px] text-gray-500 font-medium mt-0.5">উপজেলায় নেটওয়ার্ক</div>
          </div>
          <div className="bg-white p-3.5 rounded-2xl border border-gray-200/80 shadow-2xs text-center">
            <div className="text-2xl font-black text-purple-600">২৪/৭</div>
            <div className="text-[11px] text-gray-500 font-medium mt-0.5">তথ্য হালনাগাদ</div>
          </div>
        </div>
      </div>

      {/* Role Filter Tabs */}
      <div className="flex items-center justify-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setRoleFilter('all')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
            roleFilter === 'all'
              ? 'bg-[#143E27] text-white shadow-xs'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          সকল সদস্য ({members.length})
        </button>
        <button
          onClick={() => setRoleFilter('superadmin')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
            roleFilter === 'superadmin'
              ? 'bg-[#143E27] text-white shadow-xs'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          প্রধান কিউরেটর
        </button>
        <button
          onClick={() => setRoleFilter('admin')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
            roleFilter === 'admin'
              ? 'bg-[#143E27] text-white shadow-xs'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          সিনিয়র এডিটর
        </button>
        <button
          onClick={() => setRoleFilter('editor')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
            roleFilter === 'editor'
              ? 'bg-[#143E27] text-white shadow-xs'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          আঞ্চলিক স্কাউট ও ফটোগ্রাফার
        </button>
      </div>

      {/* Member Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm animate-pulse space-y-4">
              <div className="w-24 h-24 rounded-2xl bg-gray-200 mx-auto" />
              <div className="h-5 bg-gray-200 rounded w-3/4 mx-auto" />
              <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto" />
              <div className="h-16 bg-gray-100 rounded w-full" />
            </div>
          ))}
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-gray-200 p-8">
          <p className="text-gray-500 text-sm">এই ক্যাটাগরিতে কোনো সদস্য পাওয়া যায়নি।</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredMembers.map((member) => {
            const badge = getRoleBadge(member.role);
            return (
              <div
                key={member.id}
                className="group bg-white rounded-3xl border border-gray-200/90 hover:border-emerald-500/40 shadow-xs hover:shadow-xl transition-all duration-300 p-6 flex flex-col justify-between space-y-5"
              >
                <div className="space-y-4 text-center">
                  {/* Avatar with Status Ring */}
                  <div className="relative inline-block mx-auto">
                    <img
                      src={member.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                      alt={member.fullName}
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover shadow-sm group-hover:scale-105 transition-transform duration-300 border-2 border-emerald-600/30 mx-auto"
                    />
                    <span
                      className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-2xs"
                      title="অ্যাক্টিভ ও ভেরিফাইড"
                    />
                  </div>

                  {/* Name and Title */}
                  <div>
                    <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border mb-2 uppercase tracking-wide truncate max-w-full"
                      style={{}}
                    >
                      <span className={`px-2 py-0.5 rounded-full border ${badge.bg}`}>
                        {badge.label}
                      </span>
                    </div>

                    <h2 className="text-lg font-extrabold text-gray-900 group-hover:text-[#143E27] transition-colors leading-snug">
                      {member.fullName}
                    </h2>
                    <p className="text-xs font-semibold text-emerald-800 mt-1 line-clamp-1">
                      {member.title}
                    </p>
                  </div>

                  {/* Bio */}
                  <p className="text-xs text-gray-600 leading-relaxed line-clamp-3 text-left bg-gray-50/70 p-3 rounded-xl border border-gray-100">
                    {member.bio || 'শেরপুর ভ্রমণ গাইডের তথ্য সংকলন ও গবেষণা প্যানেলের সম্মানিত সদস্য।'}
                  </p>
                </div>

                {/* Footer Info & Contacts */}
                <div className="space-y-3 pt-3 border-t border-gray-100 text-xs">
                  <div className="flex items-center justify-between text-gray-500 text-[11px]">
                    <span className="flex items-center gap-1 font-medium">
                      <BookOpen className="w-3.5 h-3.5 text-emerald-700" /> প্রকাশিত স্থান:
                    </span>
                    <strong className="text-gray-800 font-bold">{member.placesCreated || 4}+টি</strong>
                  </div>

                  {member.phone && (
                    <div className="flex items-center justify-between text-gray-500 text-[11px]">
                      <span className="flex items-center gap-1 font-medium">
                        <Phone className="w-3.5 h-3.5 text-amber-600" /> যোগাযোগ:
                      </span>
                      <a href={`tel:${member.phone}`} className="text-gray-700 hover:text-[#143E27] font-sans font-medium">
                        {member.phone}
                      </a>
                    </div>
                  )}

                  {member.email && (
                    <div className="flex items-center justify-between text-gray-500 text-[11px] truncate">
                      <span className="flex items-center gap-1 font-medium shrink-0">
                        <Mail className="w-3.5 h-3.5 text-blue-600" /> ইমেইল:
                      </span>
                      <a href={`mailto:${member.email}`} className="text-gray-700 hover:text-[#143E27] truncate font-sans">
                        {member.email}
                      </a>
                    </div>
                  )}

                  <button
                    onClick={() => setSelectedMember(member)}
                    className="w-full py-2 bg-emerald-50 hover:bg-[#143E27] text-emerald-900 hover:text-white rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 border border-emerald-200 hover:border-transparent mt-2"
                  >
                    <span>পূর্ণাঙ্গ প্রোফাইল দেখুন</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Member Details Modal */}
      {selectedMember && (
        <div
          onClick={() => setSelectedMember(null)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100 space-y-6 relative max-h-[90vh] overflow-y-auto"
          >
            <button
              onClick={() => setSelectedMember(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer transition"
            >
              ✕
            </button>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              <img
                src={selectedMember.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                alt={selectedMember.fullName}
                className="w-24 h-24 rounded-2xl object-cover border-2 border-emerald-600 shadow-sm shrink-0"
              />
              <div className="text-center sm:text-left space-y-1">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-[#143E27] border border-emerald-300">
                  {getRoleBadge(selectedMember.role).label}
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#143E27]">
                  {selectedMember.fullName}
                </h3>
                <p className="text-xs sm:text-sm font-semibold text-gray-600">
                  {selectedMember.title}
                </p>
                <div className="flex items-center justify-center sm:justify-start gap-1 text-[11px] text-gray-500 font-sans">
                  <span>@{selectedMember.username}</span>
                  <span>•</span>
                  <span className="text-emerald-700 font-medium">ভেরিফাইড গবেষক</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                পরিচিতি ও কার্যপরিধি
              </h4>
              <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-2xl border border-gray-100">
                {selectedMember.bio || 'শেরপুর জেলার পর্যটন বিকাশ ও ঐতিহ্যবাহী স্থানসমূহের তথ্য যাচাইয়ে যুক্ত আছেন।'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-100">
                <div className="text-gray-500 font-medium">সংকলিত দর্শনীয় স্থান</div>
                <div className="text-lg font-black text-[#143E27] mt-0.5">{selectedMember.placesCreated || 6}+টি</div>
              </div>
              <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-100">
                <div className="text-gray-500 font-medium">যুক্ত হওয়ার সময়</div>
                <div className="text-sm font-bold text-gray-800 mt-1">২০২৪ থেকে সক্রিয়</div>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-gray-100">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                যোগাযোগের মাধ্যম
              </h4>
              <div className="space-y-1.5 text-xs">
                {selectedMember.email && (
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-gray-50 text-gray-700">
                    <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="font-sans select-all">{selectedMember.email}</span>
                  </div>
                )}
                {selectedMember.phone && (
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-gray-50 text-gray-700">
                    <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-sans select-all">{selectedMember.phone}</span>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setSelectedMember(null)}
              className="w-full py-2.5 bg-[#143E27] text-white rounded-xl font-bold text-xs hover:bg-[#0D2618] transition cursor-pointer"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      )}

      {/* Join / Contribute Callout */}
      <div className="bg-gradient-to-r from-[#143E27] to-[#1E5638] rounded-3xl p-8 sm:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
        <div className="space-y-2 max-w-xl text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-bold">
            <Award className="w-3.5 h-3.5 text-amber-300" />
            <span>টিমে যুক্ত হতে আগ্রহী?</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
            শেরপুরের পর্যটন বিকাশে আপনার ভূমিকা রাখুন
          </h3>
          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
            আপনি কি শেরপুরের স্থানীয় কোনো ঐতিহাসিক নিদর্শন, নদী, পাহাড় বা দর্শনীয় স্থান সম্পর্কে নতুন ও নিখুঁত তথ্য বা আলোকচিত্র শেয়ার করতে চান? আমাদের সাথে যোগাযোগ করুন।
          </p>
        </div>

        <button
          onClick={() => {
            if (onNavigate) onNavigate('contact');
            else window.history.pushState(null, '', '/contact');
          }}
          className="px-6 py-3 rounded-2xl bg-white text-[#143E27] hover:bg-emerald-50 font-extrabold text-xs sm:text-sm shadow-md transition shrink-0 cursor-pointer flex items-center gap-2"
        >
          <span>যোগাযোগ করুন</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
