import React, { useState } from 'react';
import { LogIn, X, AlertCircle, Lock, User, KeyRound, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user, isAdmin, loginWithCredentials, signInWithGoogle, error, clearError } = useAuth();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!username.trim() || !password) {
      setLocalError('অনুগ্রহ করে ইউজারনেম ও পাসওয়ার্ড প্রদান করুন।');
      return;
    }

    setIsSubmitting(true);
    const success = await loginWithCredentials(username, password);
    setIsSubmitting(false);

    if (success) {
      onSuccess();
      onClose();
    }
  };

  const handleGoogleSignIn = async () => {
    await signInWithGoogle();
    if (isAdmin) {
      onSuccess();
      onClose();
    }
  };

  const activeError = localError || error;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full p-5 sm:p-8 shadow-2xl border border-gray-100 relative space-y-5 sm:space-y-6 my-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 p-1 rounded-lg"
          aria-label="বন্ধ করুন"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-[#143E27] flex items-center justify-center mx-auto border border-emerald-100">
            <Lock className="w-7 h-7 text-emerald-800" />
          </div>
          <h2 className="text-2xl font-bold text-[#143E27]">
            অ্যাডমিন প্যানেল লগইন
          </h2>
          <p className="text-xs text-gray-500 max-w-xs mx-auto">
            শেরপুর ভ্রমণ গাইডের তথ্য ব্যবস্থাপনা ও পর্যালোচনার জন্য প্রবেশ করুন।
          </p>
        </div>

        {activeError && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
            <div className="flex-1">
              <span>{activeError}</span>
            </div>
          </div>
        )}

        {/* Username & Password Form - Fully Manual */}
        <form onSubmit={handleCredentialsSubmit} className="space-y-4 text-xs sm:text-sm">
          <div className="space-y-1.5">
            <label className="font-bold text-gray-700 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-700" />
              <span>ইউজারনেম (Username)</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ইউজারনেম লিখুন"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-gray-700 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-emerald-700" />
              <span>পাসওয়ার্ড (Password)</span>
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="পাসওয়ার্ড লিখুন"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-[#143E27] hover:bg-[#0D2618] text-white font-bold text-sm transition shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            <span>{isSubmitting ? 'যাচাই করা হচ্ছে...' : 'লগইন করুন'}</span>
          </button>
        </form>

        <div className="relative flex items-center justify-center my-3">
          <div className="border-t border-gray-200 w-full" />
          <span className="bg-white px-3 text-xs text-gray-400 absolute">অথবা</span>
        </div>

        {/* Google sign-in alternative */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <svg className="w-4 h-4 fill-current text-red-500" viewBox="0 0 24 24">
            <path d="M12.24 10.285V13.4h6.887C18.2 16.14 15.645 18 12.24 18c-3.315 0-6-2.685-6-6s2.685-6 6-6c1.464 0 2.809.528 3.856 1.402l2.357-2.357C16.896 3.513 14.685 2.5 12.24 2.5 7.025 2.5 2.8 6.725 2.8 11.94s4.225 9.44 9.44 9.44c5.452 0 9.07-3.834 9.07-9.24 0-.621-.067-1.226-.192-1.855H12.24z" />
          </svg>
          <span>Google অ্যাকাউন্ট দিয়ে প্রবেশ</span>
        </button>

        <div className="text-[11px] text-gray-400 text-center flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
          <span>নিরাপদ এনক্রিপ্টেড অ্যাডমিন অ্যাক্সেস</span>
        </div>
      </div>
    </div>
  );
};
