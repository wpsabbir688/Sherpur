import { TeamMember, Destination } from '../types';

export interface AuthorInfo {
  name: string;
  role: string;
  avatarUrl: string;
  bio: string;
  username: string;
}

export function getDestinationAuthor(dest?: Destination | null, teamMembers?: TeamMember[]): AuthorInfo {
  // If destination explicitly has author fields:
  if (dest?.authorName) {
    return {
      name: dest.authorName,
      role: dest.authorRole || 'পর্যটন গবেষক ও কন্টেন্ট কিউরেটর',
      avatarUrl: dest.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      bio: dest.authorBio || 'শেরপুরের পর্যটন সম্ভাবনা ও ঐতিহাসিক নিদর্শনসমূহ সরেজমিনে পরিদর্শন ও তথ্যের বিশুদ্ধতা নিশ্চিত করেছেন।',
      username: dest.createdBy || 'sabbir',
    };
  }

  const creatorId = dest?.createdBy || 'sabbir';
  if (teamMembers && teamMembers.length > 0) {
    const member = teamMembers.find((m) => m.username === creatorId || m.id === creatorId);
    if (member) {
      return {
        name: member.fullName,
        role: member.title,
        avatarUrl: member.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        bio: member.bio || 'শেরপুর ভ্রমণ গাইডের তথ্য সংকলন ও সম্পাদন প্যানেলের সম্মানিত সদস্য।',
        username: member.username,
      };
    }
  }

  // Check cached admin profile from localStorage
  try {
    const cached = localStorage.getItem('sherpur_admin_profile_sabbir');
    if (cached) {
      const p = JSON.parse(cached);
      return {
        name: p.fullName || 'মো. সাব্বির হোসেন',
        role: p.title || 'প্রতিষ্ঠাতা ও প্রধান পর্যটন গবেষক (Lead Curator)',
        avatarUrl: p.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        bio: p.bio || 'শেরপুরের রূপলাবণ্য, ঐতিহ্যবাহী প্রত্নতত্ত্ব ও গারো পাহাড়ের জীববৈচিত্র্যকে ডিজিটাল প্ল্যাটফর্মে তুলে ধরার জন্য নিরলস কাজ করে যাচ্ছেন।',
        username: 'sabbir',
      };
    }
  } catch {}

  // Canonical default author
  return {
    name: 'মো. সাব্বির হোসেন',
    role: 'প্রতিষ্ঠাতা ও প্রধান পর্যটন গবেষক (Lead Curator)',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    bio: 'শেরপুরের রূপলাবণ্য, ঐতিহ্যবাহী প্রত্নতত্ত্ব ও গারো পাহাড়ের জীববৈচিত্র্যকে ডিজিটাল প্ল্যাটফর্মে তুলে ধরার জন্য নিরলস কাজ করে যাচ্ছেন।',
    username: 'sabbir',
  };
}
