import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../lib/firebase/config';
import { TeamMember, TeamRole, AccountStatus } from '../types';

const TEAM_MEMBERS_LOCAL_KEY = 'sherpur_team_members_cache';

// Curated avatars for default / easy selection
export const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80',
];

const DEFAULT_TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'sabbir',
    username: 'sabbir',
    fullName: 'মো. সাব্বির হোসেন',
    firstName: 'সাব্বির',
    lastName: 'হোসেন',
    title: 'প্রতিষ্ঠাতা ও প্রধান পর্যটন গবেষক (Lead Curator)',
    bio: 'শেরপুরের রূপলাবণ্য, ঐতিহ্যবাহী প্রত্নতত্ত্ব ও গারো পাহাড়ের জীববৈচিত্র্যকে ডিজিটাল প্ল্যাটফর্মে তুলে ধরার জন্য নিরলস কাজ করে যাচ্ছেন।',
    role: 'superadmin',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    email: 'wpsabbir688@gmail.com',
    phone: '+8801944460344',
    joinedDate: '2024-01-15T00:00:00.000Z',
    lastActive: new Date().toISOString(),
    placesCreated: 14,
    placesUpdated: 28,
    isPrimaryOwner: true,
  },
  {
    id: 'tanvir_editor',
    username: 'tanvir_editor',
    fullName: 'তানভীর আহমেদ',
    firstName: 'তানভীর',
    lastName: 'আহমেদ',
    title: 'সিনিয়র কনটেন্ট এডিটর ও রুট বিশ্লেষক',
    bio: 'ঝিনাইগাতী ও নালিতাবাড়ীর সীমান্ত সড়ক এবং জলজ ইকোপার্ক পরিভ্রমণের তথ্য যাচাই ও সম্পাদনা করেন।',
    role: 'admin',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    email: 'tanvir.sherpur@gmail.com',
    phone: '+8801712345678',
    joinedDate: '2024-04-10T00:00:00.000Z',
    lastActive: new Date(Date.now() - 3600000 * 4).toISOString(),
    placesCreated: 6,
    placesUpdated: 12,
  },
  {
    id: 'farhana_scout',
    username: 'farhana_scout',
    fullName: 'ফারহানা রহমান',
    firstName: 'ফারহানা',
    lastName: 'রহমান',
    title: 'গারো পাহাড় আঞ্চলিক স্কাউট ও ফটোগ্রাফার',
    bio: 'শ্রীবরদী ও রাজার পাহাড়ের প্রাকৃতিক নিসর্গ, পাহাড়ি নদী এবং আদিবাসী সংস্কৃতি বিষয়ক তথ্য সংগ্রহ করেন।',
    role: 'editor',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    email: 'farhana.scout@gmail.com',
    joinedDate: '2024-06-20T00:00:00.000Z',
    lastActive: new Date(Date.now() - 3600000 * 18).toISOString(),
    placesCreated: 4,
    placesUpdated: 8,
  },
  {
    id: 'mahfuz_nakla',
    username: 'mahfuz_nakla',
    fullName: 'মাহফুজুর রহমান',
    firstName: 'মাহফুজ',
    lastName: 'রহমান',
    title: 'নকলা ও সদর ঐতিহ্য গবেষক',
    bio: 'মাইসাহেবা জামে মসজিদ, ঘাঘড়া লস্কর খান বাড়ি মসজিদ এবং নকলা ব্রহ্মপুত্র অববাহিকার তথ্য সংকলক।',
    role: 'contributor',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    email: 'mahfuz.nakla@gmail.com',
    joinedDate: '2024-08-01T00:00:00.000Z',
    lastActive: new Date(Date.now() - 3600000 * 48).toISOString(),
    placesCreated: 2,
    placesUpdated: 5,
  },
];

export async function getTeamMembers(): Promise<TeamMember[]> {
  // 1. Try fetching from Firestore
  try {
    const colRef = collection(db, 'teamMembers');
    const snap = await getDocs(colRef);
    const list: TeamMember[] = [];
    snap.forEach((d) => {
      list.push({ id: d.id, ...d.data() } as TeamMember);
    });

    if (list.length > 0) {
      localStorage.setItem(TEAM_MEMBERS_LOCAL_KEY, JSON.stringify(list));
      return list;
    } else {
      // Seed default team members if empty
      for (const m of DEFAULT_TEAM_MEMBERS) {
        await setDoc(doc(db, 'teamMembers', m.id), m);
      }
      localStorage.setItem(TEAM_MEMBERS_LOCAL_KEY, JSON.stringify(DEFAULT_TEAM_MEMBERS));
      return DEFAULT_TEAM_MEMBERS;
    }
  } catch (e) {
    console.warn('Error fetching team members from Firestore, using local cache:', e);
  }

  // 2. Fallback to local storage
  const cached = localStorage.getItem(TEAM_MEMBERS_LOCAL_KEY);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {}
  }

  // 3. Fallback to default
  localStorage.setItem(TEAM_MEMBERS_LOCAL_KEY, JSON.stringify(DEFAULT_TEAM_MEMBERS));
  return DEFAULT_TEAM_MEMBERS;
}

export async function saveTeamMember(
  data: Partial<TeamMember> & { username: string; fullName: string }
): Promise<TeamMember> {
  const cleanUsername = data.username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
  if (!cleanUsername || cleanUsername.length < 3) {
    throw new Error('ইউজারনেম কমপক্ষে ৩ অক্ষরের (ইংরেজি অক্ষর ও সংখ্যা) হতে হবে।');
  }
  if (!data.fullName.trim()) {
    throw new Error('টিম মেম্বারের পূর্ণ নাম আবশ্যক।');
  }

  const existingList = await getTeamMembers();
  const existing = existingList.find((m) => m.username === cleanUsername || m.id === data.id);

  const memberToSave: TeamMember = {
    id: cleanUsername,
    username: cleanUsername,
    fullName: data.fullName.trim(),
    firstName: data.firstName?.trim() || data.fullName.split(' ')[0] || '',
    lastName: data.lastName?.trim() || data.fullName.split(' ').slice(1).join(' ') || '',
    title: data.title?.trim() || 'কন্টেন্ট কন্ট্রিবিউটর',
    bio: data.bio?.trim() || '',
    role: data.role || (existing ? existing.role : 'editor'),
    status: data.status || (existing ? existing.status : 'active'),
    avatarUrl: data.avatarUrl || existing?.avatarUrl || PRESET_AVATARS[0],
    email: data.email?.trim() || existing?.email || '',
    phone: data.phone?.trim() || existing?.phone || '',
    joinedDate: existing?.joinedDate || new Date().toISOString(),
    lastActive: new Date().toISOString(),
    placesCreated: existing?.placesCreated || 0,
    placesUpdated: existing?.placesUpdated || 0,
    isPrimaryOwner: cleanUsername === 'sabbir' || existing?.isPrimaryOwner,
  };

  // Save to Firestore
  try {
    const docRef = doc(db, 'teamMembers', cleanUsername);
    await setDoc(docRef, memberToSave, { merge: true });
  } catch (e) {
    console.warn('Firestore write error for team member, saving locally:', e);
  }

  // Update local cache
  const updatedList = existingList.filter((m) => m.username !== cleanUsername && m.id !== cleanUsername);
  updatedList.push(memberToSave);
  localStorage.setItem(TEAM_MEMBERS_LOCAL_KEY, JSON.stringify(updatedList));

  return memberToSave;
}

export async function deleteTeamMember(id: string): Promise<void> {
  if (id === 'sabbir') {
    throw new Error('প্রধান সুপার অ্যাডমিন ও সিস্টেম প্রতিষ্ঠাতা অ্যাকাউন্ট মুছে ফেলা যাবে না।');
  }

  try {
    const docRef = doc(db, 'teamMembers', id);
    await deleteDoc(docRef);
  } catch (e) {
    console.warn('Firestore delete error for team member:', e);
  }

  const existingList = await getTeamMembers();
  const filtered = existingList.filter((m) => m.id !== id && m.username !== id);
  localStorage.setItem(TEAM_MEMBERS_LOCAL_KEY, JSON.stringify(filtered));
}

export async function toggleTeamMemberStatus(id: string, currentStatus: AccountStatus): Promise<AccountStatus> {
  if (id === 'sabbir') {
    throw new Error('প্রধান সুপার অ্যাডমিন অ্যাকাউন্ট নিষ্ক্রিয় করা যাবে না।');
  }

  const nextStatus: AccountStatus = currentStatus === 'active' ? 'inactive' : 'active';
  try {
    const docRef = doc(db, 'teamMembers', id);
    await updateDoc(docRef, { status: nextStatus, lastActive: new Date().toISOString() });
  } catch (e) {
    console.warn('Firestore toggle status error:', e);
  }

  const existingList = await getTeamMembers();
  const updated = existingList.map((m) =>
    m.id === id || m.username === id ? { ...m, status: nextStatus } : m
  );
  localStorage.setItem(TEAM_MEMBERS_LOCAL_KEY, JSON.stringify(updated));
  return nextStatus;
}
