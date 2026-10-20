import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase/config';
import { AdminProfile } from '../types';
import { PRESET_AVATARS, saveTeamMember } from './teamService';

export const ADMIN_PROFILE_LOCAL_KEY_PREFIX = 'sherpur_admin_profile_';

/**
 * Normalizes username variations to ensure consistent document IDs.
 * The primary administrator account (wpsabbir688@gmail.com, wpsabbir44@gmail.com, sabbir)
 * always maps to the canonical 'sabbir' ID.
 */
export function normalizeAdminUsername(raw?: string | null): string {
  if (!raw) return 'sabbir';
  const trimmed = raw.trim().toLowerCase();
  if (
    trimmed === 'sabbir' ||
    trimmed === 'wpsabbir688@gmail.com' ||
    trimmed === 'wpsabbir44@gmail.com' ||
    trimmed.startsWith('wpsabbir') ||
    trimmed.includes('sabbir')
  ) {
    return 'sabbir';
  }
  // Sanitize for clean ID
  const clean = trimmed.replace(/[^a-z0-9_-]/g, '_');
  return clean || 'sabbir';
}

/**
 * Returns the default initial profile for the given administrator.
 */
export function getDefaultAdminProfile(username: string): AdminProfile {
  const cleanUser = normalizeAdminUsername(username);
  const isMainAdmin = cleanUser === 'sabbir';

  return {
    id: cleanUser,
    username: cleanUser,
    fullName: isMainAdmin ? 'মো. সাব্বির হোসেন' : cleanUser,
    firstName: isMainAdmin ? 'সাব্বির' : cleanUser,
    lastName: isMainAdmin ? 'হোসেন' : '',
    title: isMainAdmin
      ? 'প্রতিষ্ঠাতা ও প্রধান পর্যটন গবেষক (Lead Curator)'
      : 'অ্যাডমিনিস্ট্রেটর ও কনটেন্ট মডারেটর',
    bio: isMainAdmin
      ? 'শেরপুরের প্রাকৃতিক রূপ, ঐতিহ্যবাহী স্থাপত্য ও লোকজ সংস্কৃতিকে জাতীয় ও আন্তর্জাতিক পরিমণ্ডলে ইতিবাচকভাবে তুলে ধরার লক্ষ্যে এই গাইডের পরিচালনা ও তথ্যের বিশুদ্ধতা নিশ্চিত করছি।'
      : 'শেরপুর জেলার পর্যটন সম্ভাবনা বিকাশে নিয়মিত তথ্য ও আলোকচিত্র সংযোগ এবং নিয়মিত পর্যবেক্ষণ করছি।',
    email: isMainAdmin ? 'wpsabbir688@gmail.com' : `${cleanUser}@sherpurtravel.com`,
    phone: isMainAdmin ? '+8801944460344' : '+8801700000000',
    location: 'শেরপুর সদর, শেরপুর, ময়মনসিংহ বিভাগ, বাংলাদেশ',
    avatarUrl: PRESET_AVATARS[0],
    socialLinks: {
      facebook: 'https://facebook.com',
      linkedin: 'https://linkedin.com',
      website: 'https://sherpur-travel.web.app',
      github: '',
    },
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Retrieves the administrator profile.
 * Resilient against Firestore offline/latency by checking localStorage cache,
 * and avoids ever overwriting user data with blank defaults.
 */
export async function getAdminProfile(username: string): Promise<AdminProfile> {
  const cleanUser = normalizeAdminUsername(username);
  const cacheKey = `${ADMIN_PROFILE_LOCAL_KEY_PREFIX}${cleanUser}`;
  const defaultProfile = getDefaultAdminProfile(cleanUser);

  // Check local cache first
  let cachedData: AdminProfile | null = null;
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      cachedData = JSON.parse(cached);
    } catch {
      cachedData = null;
    }
  }

  // Also check sabbir cache if this is the main admin
  if (!cachedData && cleanUser === 'sabbir') {
    const sabbirCached = localStorage.getItem(`${ADMIN_PROFILE_LOCAL_KEY_PREFIX}sabbir`);
    if (sabbirCached) {
      try {
        cachedData = JSON.parse(sabbirCached);
      } catch {}
    }
  }

  // 1. Try fetching from Firestore
  try {
    const docRef = doc(db, 'adminProfiles', cleanUser);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as AdminProfile;
      const merged: AdminProfile = {
        ...defaultProfile,
        ...cachedData,
        ...data,
        id: cleanUser,
        username: cleanUser,
      };
      localStorage.setItem(cacheKey, JSON.stringify(merged));
      return merged;
    } else {
      // Document does not exist in Firestore yet
      // If we have cached user edits in localStorage, persist THAT to Firestore!
      const profileToSeed = cachedData ? { ...defaultProfile, ...cachedData } : defaultProfile;
      try {
        await setDoc(docRef, profileToSeed, { merge: true });
      } catch (err) {
        console.warn('Could not seed profile to Firestore:', err);
      }
      localStorage.setItem(cacheKey, JSON.stringify(profileToSeed));
      return profileToSeed;
    }
  } catch (e) {
    console.warn('Error fetching admin profile from Firestore, using local cache:', e);
  }

  // 2. Fallback to cached data if Firestore failed
  if (cachedData) {
    return { ...defaultProfile, ...cachedData };
  }

  return defaultProfile;
}

/**
 * Saves the administrator profile to Firestore, local storage, team roster, and active session.
 */
export async function saveAdminProfile(profile: AdminProfile): Promise<AdminProfile> {
  const cleanUser = normalizeAdminUsername(profile.username);
  const cacheKey = `${ADMIN_PROFILE_LOCAL_KEY_PREFIX}${cleanUser}`;

  const updatedProfile: AdminProfile = {
    ...profile,
    id: cleanUser,
    username: cleanUser,
    fullName: profile.fullName?.trim() || 'অ্যাডমিন',
    updatedAt: new Date().toISOString(),
  };

  // 1. Save directly to localStorage immediately
  localStorage.setItem(cacheKey, JSON.stringify(updatedProfile));
  if (cleanUser === 'sabbir') {
    localStorage.setItem(`${ADMIN_PROFILE_LOCAL_KEY_PREFIX}sabbir`, JSON.stringify(updatedProfile));
  }

  // Update active session display name if it matches
  try {
    const sessionStr = localStorage.getItem('sherpur_admin_active_session');
    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      session.name = updatedProfile.fullName;
      session.avatarUrl = updatedProfile.avatarUrl;
      localStorage.setItem('sherpur_admin_active_session', JSON.stringify(session));
    }
  } catch (e) {
    console.warn('Could not update active session:', e);
  }

  // Dispatch custom event to notify app of updated profile
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('sherpur_profile_updated', {
        detail: updatedProfile,
      })
    );
  }

  // 2. Save to Firestore /adminProfiles
  try {
    const docRef = doc(db, 'adminProfiles', cleanUser);
    await setDoc(docRef, updatedProfile, { merge: true });
    console.log('Admin profile successfully saved to Firestore:', cleanUser);
  } catch (e) {
    console.warn('Firestore write warning for admin profile, but cached locally:', e);
  }

  // 3. Keep Team roster in sync with this profile
  try {
    await saveTeamMember({
      username: cleanUser,
      fullName: updatedProfile.fullName,
      firstName: updatedProfile.firstName,
      lastName: updatedProfile.lastName,
      title: updatedProfile.title,
      bio: updatedProfile.bio,
      avatarUrl: updatedProfile.avatarUrl,
      email: updatedProfile.email,
      phone: updatedProfile.phone,
    });
  } catch (e) {
    console.warn('Error syncing profile to team member:', e);
  }

  return updatedProfile;
}
