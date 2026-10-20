import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, googleProvider, db, ADMIN_EMAILS } from '../lib/firebase/config';
import { verifyAdminCredentials } from '../services/adminAuthService';
import { UserProfile } from '../types/community';
import { getUserProfile, createUserProfile } from '../services/userService';

const ADMIN_SESSION_KEY = 'sherpur_admin_active_session';

export type AdminRole = 'superadmin' | 'editor';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  adminUsername: string | null;
  adminName: string | null;
  adminRole: AdminRole | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isEditor: boolean;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string, username: string) => Promise<boolean>;
  signInWithEmail: (email: string, pass: string) => Promise<boolean>;
  sendPasswordReset: (email: string) => Promise<boolean>;
  loginWithCredentials: (username: string, pass: string) => Promise<boolean>;
  refreshUserProfile: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  adminUsername: null,
  adminName: null,
  adminRole: null,
  isAdmin: false,
  isSuperAdmin: false,
  isEditor: false,
  loading: true,
  error: null,
  signInWithGoogle: async () => {},
  signUpWithEmail: async () => false,
  signInWithEmail: async () => false,
  sendPasswordReset: async () => false,
  loginWithCredentials: async () => false,
  refreshUserProfile: async () => {},
  signOut: async () => {},
  clearError: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [adminUsername, setAdminUsername] = useState<string | null>(null);
  const [adminName, setAdminName] = useState<string | null>(null);
  const [adminRole, setAdminRole] = useState<AdminRole | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Helper to resolve nice display name
  const resolveAdminName = (rawName?: string | null, rawUser?: string | null): string => {
    try {
      const cleanUser = rawUser ? rawUser.replace(/[^a-z0-9_-]/gi, '').toLowerCase() : 'sabbir';
      const cached =
        localStorage.getItem(`sherpur_admin_profile_${cleanUser}`) ||
        localStorage.getItem('sherpur_admin_profile_sabbir');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.fullName && parsed.fullName.trim() && !parsed.fullName.includes('প্রধান প্রশাসক')) {
          return parsed.fullName.trim();
        }
      }
    } catch {}
    if (
      rawName &&
      rawName !== 'sabbir' &&
      !rawName.includes('@') &&
      !rawName.includes('প্রধান প্রশাসক') &&
      !rawName.includes('superadmin')
    ) {
      return rawName.trim();
    }
    return 'মো. সাব্বির হোসেন';
  };

  // Check saved admin credentials session on mount
  useEffect(() => {
    const savedSession = localStorage.getItem(ADMIN_SESSION_KEY);
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        if (parsed.username && parsed.isLoggedIn) {
          setAdminUsername(parsed.username);
          setAdminName(resolveAdminName(parsed.name, parsed.username));
          setAdminRole(parsed.role || 'superadmin');
          setIsAdmin(true);
        }
      } catch {
        localStorage.removeItem(ADMIN_SESSION_KEY);
      }
    }

    const handleProfileUpdate = (e: any) => {
      if (e.detail && e.detail.fullName) {
        setAdminName(e.detail.fullName);
      }
    };
    window.addEventListener('sherpur_profile_updated', handleProfileUpdate);
    return () => window.removeEventListener('sherpur_profile_updated', handleProfileUpdate);
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Load or create UserProfile
        try {
          let profile = await getUserProfile(currentUser.uid);
          if (!profile) {
            const rawUsername =
              currentUser.email?.split('@')[0] ||
              currentUser.displayName?.toLowerCase().replace(/\s+/g, '_') ||
              `traveler_${currentUser.uid.slice(0, 5)}`;
            profile = await createUserProfile({
              uid: currentUser.uid,
              displayName: currentUser.displayName || 'শেরপুর ভ্রমণকারী',
              username: rawUsername,
              email: currentUser.email || undefined,
              photoURL: currentUser.photoURL || undefined,
              savedDestinationIds: [],
              followersCount: 0,
              followingCount: 0,
              postsCount: 0,
              createdAt: new Date().toISOString(),
            });
          }
          setUserProfile(profile);
        } catch (err) {
          console.warn('Error loading user profile:', err);
        }

        // Check if user is also in Admin Allowlist
        if (currentUser.email) {
          const emailLower = currentUser.email.toLowerCase();
          if (ADMIN_EMAILS.map((e) => e.toLowerCase()).includes(emailLower)) {
            setIsAdmin(true);
            setAdminRole('superadmin');
            setAdminUsername(currentUser.email);
            setAdminName(resolveAdminName(currentUser.displayName, currentUser.email));
          } else {
            try {
              const adminDocRef = doc(db, 'admins', currentUser.uid);
              const adminSnap = await getDoc(adminDocRef);
              if (adminSnap.exists()) {
                const data = adminSnap.data();
                setIsAdmin(true);
                setAdminRole(data.role || 'editor');
                setAdminUsername(currentUser.email);
                setAdminName(resolveAdminName(data.name || currentUser.displayName, currentUser.email));
              }
            } catch {
              // Keep credential login if active
            }
          }
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const refreshUserProfile = async () => {
    if (user) {
      const p = await getUserProfile(user.uid);
      if (p) setUserProfile(p);
    }
  };

  const signUpWithEmail = async (
    email: string,
    pass: string,
    name: string,
    usernameInput: string
  ): Promise<boolean> => {
    setError(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      const cleanUser = usernameInput.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
      await updateProfile(cred.user, {
        displayName: name.trim(),
      });
      const profile = await createUserProfile({
        uid: cred.user.uid,
        displayName: name.trim(),
        username: cleanUser || `user_${cred.user.uid.slice(0, 6)}`,
        email: email.trim(),
        savedDestinationIds: [],
        followersCount: 0,
        followingCount: 0,
        postsCount: 0,
        createdAt: new Date().toISOString(),
      });
      setUserProfile(profile);
      return true;
    } catch (err: any) {
      console.error('Email Sign-Up error:', err);
      let msg = 'রেজিস্ট্রেশন সম্পন্ন করা সম্ভব হয়নি।';
      if (err.code === 'auth/email-already-in-use') {
        msg = 'এই ইমেইল দিয়ে ইতোমধ্যে একটি অ্যাকাউন্ট রয়েছে।';
      } else if (err.code === 'auth/weak-password') {
        msg = 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'ইমেইল ঠিকানাটি সঠিক নয়।';
      }
      setError(msg);
      return false;
    }
  };

  const signInWithEmail = async (email: string, pass: string): Promise<boolean> => {
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), pass);
      return true;
    } catch (err: any) {
      console.error('Email Sign-In error:', err);
      let msg = 'ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        msg = 'ইমেইল অথবা পাসওয়ার্ড ভুল হয়েছে।';
      }
      setError(msg);
      return false;
    }
  };

  const sendPasswordReset = async (email: string): Promise<boolean> => {
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      return true;
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError('পাসওয়ার্ড রিসেট ইমেইল পাঠাতে সমস্যা হয়েছে। সঠিক ইমেইল দিন।');
      return false;
    }
  };

  const loginWithCredentials = async (usernameInput: string, passwordInput: string): Promise<boolean> => {
    setError(null);
    try {
      const result = await verifyAdminCredentials(usernameInput, passwordInput);
      if (result.isValid) {
        setIsAdmin(true);
        const role = result.role || 'editor';
        const uName = result.username || usernameInput.trim();
        const dName = resolveAdminName(result.name, uName);

        setAdminUsername(uName);
        setAdminName(dName);
        setAdminRole(role);

        localStorage.setItem(
          ADMIN_SESSION_KEY,
          JSON.stringify({
            username: uName,
            name: dName,
            role,
            isLoggedIn: true,
            time: Date.now(),
          })
        );
        return true;
      } else {
        setError(result.error || 'ইউজারনেম অথবা পাসওয়ার্ড সঠিক নয়।');
        return false;
      }
    } catch (err: any) {
      console.error('Credentials login error:', err);
      setError('লগইন প্রক্রিয়ায় ত্রুটি ঘটেছে।');
      return false;
    }
  };

  const signInWithGoogle = async () => {
    try {
      setError(null);
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      setError(err?.message || 'গুগল সাইন-ইন সম্পন্ন করা সম্ভব হয়নি।');
    }
  };

  const signOut = async () => {
    try {
      if (user) {
        await fbSignOut(auth);
      }
      localStorage.removeItem(ADMIN_SESSION_KEY);
      setUser(null);
      setUserProfile(null);
      setAdminUsername(null);
      setAdminName(null);
      setAdminRole(null);
      setIsAdmin(false);
      setError(null);
    } catch (err: any) {
      console.error('Sign-Out Error:', err);
      setError(err?.message || 'লগআউট করতে সমস্যা হয়েছে।');
    }
  };

  const clearError = () => setError(null);

  const isSuperAdmin = isAdmin && adminRole === 'superadmin';
  const isEditor = isAdmin && adminRole === 'editor';

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        adminUsername,
        adminName,
        adminRole,
        isAdmin,
        isSuperAdmin,
        isEditor,
        loading,
        error,
        signInWithGoogle,
        signUpWithEmail,
        signInWithEmail,
        sendPasswordReset,
        loginWithCredentials,
        refreshUserProfile,
        signOut,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
