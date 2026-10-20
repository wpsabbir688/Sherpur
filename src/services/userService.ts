import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  increment,
} from 'firebase/firestore';
import { db } from '../lib/firebase/config';
import { handleFirestoreError, OperationType } from '../lib/firebase/firestoreError';
import { UserProfile, SavedItem } from '../types/community';
import { Destination } from '../types';

const USERS_COL = 'users';
const SAVED_ITEMS_COL = 'saved_items';
const FOLLOWS_COL = 'follows';

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (!uid) return null;
  const localKey = `sherpur_user_profile_${uid}`;

  try {
    const docRef = doc(db, USERS_COL, uid);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as UserProfile;
      localStorage.setItem(localKey, JSON.stringify(data));
      return data;
    }
  } catch (err) {
    console.warn('Could not read user profile from Firestore, checking local cache:', err);
  }

  // Fallback to cache
  const cached = localStorage.getItem(localKey);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {}
  }
  return null;
}

export async function getUserProfileByUsername(username: string): Promise<UserProfile | null> {
  const clean = username.trim().toLowerCase().replace(/^@/, '');
  try {
    const colRef = collection(db, USERS_COL);
    const q = query(colRef, where('username', '==', clean));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs[0].data() as UserProfile;
    }
  } catch (err) {
    console.warn('Error fetching user by username:', err);
  }
  return null;
}

export async function createUserProfile(profile: UserProfile): Promise<UserProfile> {
  const cleanProfile: UserProfile = {
    ...profile,
    username: profile.username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_'),
    savedDestinationIds: profile.savedDestinationIds || [],
    followersCount: profile.followersCount || 0,
    followingCount: profile.followingCount || 0,
    postsCount: profile.postsCount || 0,
    createdAt: profile.createdAt || new Date().toISOString(),
  };

  const localKey = `sherpur_user_profile_${profile.uid}`;
  localStorage.setItem(localKey, JSON.stringify(cleanProfile));

  try {
    const docRef = doc(db, USERS_COL, profile.uid);
    await setDoc(docRef, cleanProfile, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, USERS_COL);
  }

  return cleanProfile;
}

export async function updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
  const localKey = `sherpur_user_profile_${uid}`;
  const existing = await getUserProfile(uid);
  const updated: UserProfile = {
    ...(existing || {
      uid,
      displayName: 'ভ্রমণকারী',
      username: `user_${uid.slice(0, 6)}`,
      savedDestinationIds: [],
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
      createdAt: new Date().toISOString(),
    }),
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(localKey, JSON.stringify(updated));

  try {
    const docRef = doc(db, USERS_COL, uid);
    await setDoc(docRef, updated, { merge: true });
  } catch (err) {
    console.warn('Warning updating profile on Firestore:', err);
  }
}

/**
 * Toggle follow/unfollow between two users
 */
export async function toggleFollowUser(followerId: string, followingId: string): Promise<boolean> {
  if (!followerId || !followingId || followerId === followingId) return false;
  const followId = `${followerId}_${followingId}`;
  const docRef = doc(db, FOLLOWS_COL, followId);

  try {
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      // Unfollow
      await deleteDoc(docRef);
      // Decrement counts
      await updateDoc(doc(db, USERS_COL, followerId), { followingCount: increment(-1) }).catch(() => {});
      await updateDoc(doc(db, USERS_COL, followingId), { followersCount: increment(-1) }).catch(() => {});
      return false;
    } else {
      // Follow
      await setDoc(docRef, {
        id: followId,
        followerId,
        followingId,
        createdAt: new Date().toISOString(),
      });
      await updateDoc(doc(db, USERS_COL, followerId), { followingCount: increment(1) }).catch(() => {});
      await updateDoc(doc(db, USERS_COL, followingId), { followersCount: increment(1) }).catch(() => {});
      return true;
    }
  } catch (err) {
    console.warn('Follow error:', err);
    return false;
  }
}

export async function checkIsFollowing(followerId?: string | null, followingId?: string | null): Promise<boolean> {
  if (!followerId || !followingId || followerId === followingId) return false;
  try {
    const docRef = doc(db, FOLLOWS_COL, `${followerId}_${followingId}`);
    const snap = await getDoc(docRef);
    return snap.exists();
  } catch {
    return false;
  }
}

/**
 * Save or un-save a destination for a user
 */
export async function toggleSaveDestination(
  userId: string,
  destination: Destination
): Promise<{ isSaved: boolean; count: number }> {
  const saveId = `${userId}_${destination.id}`;
  const docRef = doc(db, SAVED_ITEMS_COL, saveId);
  const userRef = doc(db, USERS_COL, userId);

  // Local storage cache for instant offline responsiveness
  const localSavedKey = `sherpur_saved_dest_${userId}`;
  let localList: string[] = [];
  try {
    localList = JSON.parse(localStorage.getItem(localSavedKey) || '[]');
  } catch {}

  const existsLocally = localList.includes(destination.id);

  if (existsLocally) {
    localList = localList.filter((id) => id !== destination.id);
  } else {
    localList.push(destination.id);
  }
  localStorage.setItem(localSavedKey, JSON.stringify(localList));

  try {
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      await deleteDoc(docRef);
      await updateDoc(userRef, {
        savedDestinationIds: localList,
      }).catch(() => {});
      return { isSaved: false, count: localList.length };
    } else {
      const item: SavedItem = {
        id: saveId,
        userId,
        targetType: 'destination',
        targetId: destination.id,
        title: destination.titleBn,
        subtitle: destination.locationName,
        image: destination.coverImage,
        slug: destination.slug,
        createdAt: new Date().toISOString(),
      };
      await setDoc(docRef, item);
      await updateDoc(userRef, {
        savedDestinationIds: localList,
      }).catch(() => {});
      return { isSaved: true, count: localList.length };
    }
  } catch (err) {
    console.warn('Error saving destination to Firestore, saved locally:', err);
    return { isSaved: !existsLocally, count: localList.length };
  }
}

export async function getSavedItems(userId: string): Promise<SavedItem[]> {
  if (!userId) return [];
  try {
    const q = query(collection(db, SAVED_ITEMS_COL), where('userId', '==', userId));
    const snap = await getDocs(q);
    const list: SavedItem[] = [];
    snap.forEach((d) => list.push(d.data() as SavedItem));
    return list;
  } catch (err) {
    console.warn('Error fetching saved items:', err);
    return [];
  }
}

export function isDestinationSavedLocally(userId: string | null | undefined, destinationId: string): boolean {
  if (!userId) return false;
  try {
    const localSavedKey = `sherpur_saved_dest_${userId}`;
    const list = JSON.parse(localStorage.getItem(localSavedKey) || '[]');
    return list.includes(destinationId);
  } catch {
    return false;
  }
}
