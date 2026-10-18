import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, googleProvider, db, ADMIN_EMAILS } from '../lib/firebase/config';
import { verifyAdminCredentials } from '../services/adminAuthService';

const ADMIN_SESSION_KEY = 'sherpur_admin_active_session';

export type AdminRole = 'superadmin' | 'editor';

interface AuthContextType {
  user: User | null;
  adminUsername: string | null;
  adminName: string | null;
  adminRole: AdminRole | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isEditor: boolean;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  loginWithCredentials: (username: string, pass: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  adminUsername: null,
  adminName: null,
  adminRole: null,
  isAdmin: false,
  isSuperAdmin: false,
  isEditor: false,
  loading: true,
  error: null,
  signInWithGoogle: async () => {},
  loginWithCredentials: async () => false,
  signOut: async () => {},
  clearError: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [adminUsername, setAdminUsername] = useState<string | null>(null);
  const [adminName, setAdminName] = useState<string | null>(null);
  const [adminRole, setAdminRole] = useState<AdminRole | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check saved admin credentials session on mount
  useEffect(() => {
    const savedSession = localStorage.getItem(ADMIN_SESSION_KEY);
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        if (parsed.username && parsed.isLoggedIn) {
          setAdminUsername(parsed.username);
          setAdminName(parsed.name || parsed.username);
          setAdminRole(parsed.role || 'superadmin');
          setIsAdmin(true);
        }
      } catch {
        localStorage.removeItem(ADMIN_SESSION_KEY);
      }
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser && currentUser.email) {
        const emailLower = currentUser.email.toLowerCase();
        // Check primary allowlist -> always superadmin
        if (ADMIN_EMAILS.map((e) => e.toLowerCase()).includes(emailLower)) {
          setIsAdmin(true);
          setAdminRole('superadmin');
          setAdminUsername(currentUser.email);
          setAdminName(currentUser.displayName || currentUser.email);
        } else {
          try {
            const adminDocRef = doc(db, 'admins', currentUser.uid);
            const adminSnap = await getDoc(adminDocRef);
            if (adminSnap.exists()) {
              const data = adminSnap.data();
              setIsAdmin(true);
              setAdminRole(data.role || 'editor');
              setAdminUsername(currentUser.email);
              setAdminName(currentUser.displayName || currentUser.email);
            }
          } catch {
            // Keep credential login if active
          }
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithCredentials = async (usernameInput: string, passwordInput: string): Promise<boolean> => {
    setError(null);
    try {
      const result = await verifyAdminCredentials(usernameInput, passwordInput);
      if (result.isValid) {
        setIsAdmin(true);
        const role = result.role || 'editor';
        const uName = result.username || usernameInput.trim();
        const dName = result.name || uName;

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
        adminUsername,
        adminName,
        adminRole,
        isAdmin,
        isSuperAdmin,
        isEditor,
        loading,
        error,
        signInWithGoogle,
        loginWithCredentials,
        signOut,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
