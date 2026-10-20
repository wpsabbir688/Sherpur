import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../lib/firebase/config';
import { AdminUser } from '../types';

const CREDENTIALS_DOC = 'settings/admin_credentials';
const LOCAL_STORAGE_KEY = 'sherpur_admin_auth_data';
const SUB_ADMINS_LOCAL_KEY = 'sherpur_sub_admins_cache';

export interface AdminCredentials {
  username: string;
  passwordHash: string;
  updatedAt: string;
}

const DEFAULT_CREDENTIALS: AdminCredentials = {
  username: 'sabbir',
  passwordHash: 'Sabbir.0',
  updatedAt: new Date().toISOString(),
};

export async function getAdminCredentials(): Promise<AdminCredentials> {
  const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
  let creds: AdminCredentials = DEFAULT_CREDENTIALS;

  if (localData) {
    try {
      creds = JSON.parse(localData);
    } catch {
      creds = DEFAULT_CREDENTIALS;
    }
  }

  try {
    const docRef = doc(db, 'settings', 'admin_credentials');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const remoteData = snap.data() as AdminCredentials;
      if (remoteData.username && remoteData.passwordHash) {
        creds = remoteData;
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(creds));
      }
    } else {
      await setDoc(docRef, DEFAULT_CREDENTIALS);
    }
  } catch (e) {
    console.warn('Could not sync admin credentials from Firestore, using local:', e);
  }

  return creds;
}

export interface VerifyResult {
  isValid: boolean;
  role?: 'superadmin' | 'editor';
  name?: string;
  username?: string;
  error?: string;
}

export async function verifyAdminCredentials(usernameInput: string, passwordInput: string): Promise<VerifyResult> {
  const cleanUser = usernameInput.trim().toLowerCase();
  const cleanPass = passwordInput.trim();

  // 1. Check Super Admin credentials
  const superCreds = await getAdminCredentials();
  if (cleanUser === superCreds.username.trim().toLowerCase() && cleanPass === superCreds.passwordHash.trim()) {
    return {
      isValid: true,
      role: 'superadmin',
      name: 'মো. সাব্বির হোসেন',
      username: superCreds.username,
    };
  }

  // 2. Check Sub-Admins in Firestore `/admins` collection
  try {
    const docRef = doc(db, 'admins', cleanUser);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const adminData = snap.data() as AdminUser;
      if (adminData.password === cleanPass) {
        if (adminData.status === 'inactive') {
          return { isValid: false, error: 'এই অ্যাকাউন্টটি বর্তমানে নিষ্ক্রিয় রয়েছে।' };
        }
        return {
          isValid: true,
          role: adminData.role || 'editor',
          name: adminData.name || adminData.username,
          username: adminData.username,
        };
      }
    }
  } catch (e) {
    console.warn('Error checking sub-admin from Firestore:', e);
  }

  // 3. Fallback check local storage cache for sub-admins
  const cachedSubAdminsStr = localStorage.getItem(SUB_ADMINS_LOCAL_KEY);
  if (cachedSubAdminsStr) {
    try {
      const cachedList: AdminUser[] = JSON.parse(cachedSubAdminsStr);
      const found = cachedList.find(
        (a) => a.username.toLowerCase() === cleanUser && a.password === cleanPass
      );
      if (found) {
        if (found.status === 'inactive') {
          return { isValid: false, error: 'এই অ্যাকাউন্টটি বর্তমানে নিষ্ক্রিয় রয়েছে।' };
        }
        return {
          isValid: true,
          role: found.role || 'editor',
          name: found.name,
          username: found.username,
        };
      }
    } catch {}
  }

  return { isValid: false, error: 'ইউজারনেম অথবা পাসওয়ার্ড সঠিক নয়।' };
}

export async function changeAdminPassword(oldPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  if (!newPassword || newPassword.length < 5) {
    return { success: false, error: 'নতুন পাসওয়ার্ড কমপক্ষে ৫ অক্ষরের হতে হবে।' };
  }

  const creds = await getAdminCredentials();
  if (oldPassword !== creds.passwordHash) {
    return { success: false, error: 'বর্তমান পাসওয়ার্ডটি সঠিক নয়।' };
  }

  const updated: AdminCredentials = {
    username: creds.username,
    passwordHash: newPassword,
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));

  try {
    const docRef = doc(db, 'settings', 'admin_credentials');
    await setDoc(docRef, updated, { merge: true });
  } catch (e) {
    console.error('Error saving updated credentials to Firestore:', e);
  }

  return { success: true };
}

// Sub-admin management (Super Admin only)
export async function getAllSubAdmins(): Promise<AdminUser[]> {
  try {
    const colRef = collection(db, 'admins');
    const snap = await getDocs(colRef);
    const list: AdminUser[] = [];
    snap.forEach((d) => {
      list.push({ id: d.id, ...d.data() } as AdminUser);
    });

    if (list.length > 0) {
      localStorage.setItem(SUB_ADMINS_LOCAL_KEY, JSON.stringify(list));
      return list;
    }
  } catch (e) {
    console.warn('Error fetching admins from Firestore:', e);
  }

  const cached = localStorage.getItem(SUB_ADMINS_LOCAL_KEY);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {}
  }
  return [];
}

export async function createSubAdmin(data: {
  username: string;
  name: string;
  password: string;
}): Promise<{ success: boolean; error?: string; admin?: AdminUser }> {
  const cleanUsername = data.username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
  if (!cleanUsername || cleanUsername.length < 3) {
    return { success: false, error: 'ইউজারনেম কমপক্ষে ৩ অক্ষরের (ইংরেজি) হতে হবে।' };
  }
  if (!data.name.trim()) {
    return { success: false, error: 'প্রশাসকের নাম আবশ্যক।' };
  }
  if (!data.password || data.password.length < 4) {
    return { success: false, error: 'পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে।' };
  }

  // Prevent overriding superadmin
  if (cleanUsername === 'sabbir') {
    return { success: false, error: "'sabbir' মূল সুপার অ্যাডমিনের সংরক্ষিত ইউজারনেম।" };
  }

  const newAdmin: AdminUser = {
    id: cleanUsername,
    username: cleanUsername,
    name: data.name.trim(),
    password: data.password.trim(),
    role: 'editor', // "ora sudu notun jaiga add korte parbe"
    status: 'active',
    createdAt: new Date().toISOString(),
  };

  try {
    const docRef = doc(db, 'admins', cleanUsername);
    await setDoc(docRef, newAdmin);
  } catch (e) {
    console.warn('Firestore write error for sub-admin, caching locally:', e);
  }

  // Update local cache
  const existing = await getAllSubAdmins();
  const updated = [...existing.filter((a) => a.username !== cleanUsername), newAdmin];
  localStorage.setItem(SUB_ADMINS_LOCAL_KEY, JSON.stringify(updated));

  return { success: true, admin: newAdmin };
}

export async function deleteSubAdmin(adminId: string): Promise<void> {
  try {
    const docRef = doc(db, 'admins', adminId);
    await deleteDoc(docRef);
  } catch (e) {
    console.warn('Error deleting sub-admin from Firestore:', e);
  }

  const existing = await getAllSubAdmins();
  const filtered = existing.filter((a) => a.id !== adminId && a.username !== adminId);
  localStorage.setItem(SUB_ADMINS_LOCAL_KEY, JSON.stringify(filtered));
}

export async function toggleSubAdminStatus(adminId: string, currentStatus: 'active' | 'inactive'): Promise<void> {
  const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';
  try {
    const docRef = doc(db, 'admins', adminId);
    await updateDoc(docRef, { status: nextStatus });
  } catch (e) {
    console.warn('Error toggling sub-admin status in Firestore:', e);
  }

  const existing = await getAllSubAdmins();
  const updated = existing.map((a) =>
    a.id === adminId || a.username === adminId ? { ...a, status: nextStatus } : a
  );
  localStorage.setItem(SUB_ADMINS_LOCAL_KEY, JSON.stringify(updated));
}
