import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  Compass,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface UserAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAdminLogin?: () => void;
  initialMode?: 'login' | 'register' | 'forgot';
}

export const UserAuthModal: React.FC<UserAuthModalProps> = ({
  isOpen,
  onClose,
  onOpenAdminLogin,
  initialMode = 'login',
}) => {
  const { signInWithEmail, signUpWithEmail, sendPasswordReset, signInWithGoogle, error, clearError } =
    useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setSuccessMsg(null);
    clearError();
    setLoading(true);

    try {
      if (mode === 'login') {
        if (!email.trim() || !password) {
          setLocalError('ইমেইল ও পাসওয়ার্ড উভয়ই প্রদান করুন।');
          setLoading(false);
          return;
        }
        const success = await signInWithEmail(email, password);
        if (success) {
          onClose();
        }
      } else if (mode === 'register') {
        if (!name.trim() || !username.trim() || !email.trim() || !password) {
          setLocalError('সবগুলো প্রয়োজনীয় তথ্য পূরণ করুন।');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setLocalError('পাসওয়ার্ড ন্যূনতম ৬ অক্ষরের হতে হবে।');
          setLoading(false);
          return;
        }
        const success = await signUpWithEmail(email, password, name, username);
        if (success) {
          onClose();
        }
      } else if (mode === 'forgot') {
        if (!email.trim()) {
          setLocalError('আপনার নিবন্ধিত ইমেইল ঠিকানাটি লিখুন।');
          setLoading(false);
          return;
        }
        const success = await sendPasswordReset(email);
        if (success) {
          setSuccessMsg('আপনার ইমেইলে পাসওয়ার্ড রিসেট লিংক পাঠানো হয়েছে! ইনবক্স বা স্প্যাম ফোল্ডার চেক করুন।');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLocalError(null);
    clearError();
    setLoading(true);
    try {
      await signInWithGoogle();
      onClose();
    } catch {
      setLocalError('গুগল সাইন-ইন সম্পন্ন করা যায়নি।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-emerald-950/10"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#143E27] via-[#1c5636] to-[#0D2618] p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-black/20 hover:bg-black/30 text-emerald-200 transition cursor-pointer"
            aria-label="বন্ধ করুন"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
              <Compass className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              শেরপুর ভ্রমণ গাইড কমিউনিটি
            </span>
          </div>

          <h2 className="text-xl font-extrabold tracking-tight">
            {mode === 'login' && 'ভ্রমণকারী অ্যাকাউন্টে লগইন'}
            {mode === 'register' && 'নতুন ভ্রমণকারী অ্যাকাউন্ট তৈরি'}
            {mode === 'forgot' && 'পাসওয়ার্ড পুনরুদ্ধার'}
          </h2>
          <p className="text-xs text-emerald-100/80 mt-1">
            {mode === 'login' && 'আপনার পছন্দের স্থান সংরক্ষণ, অভিজ্ঞতা শেয়ার ও কমিউনিটিতে যুক্ত হোন।'}
            {mode === 'register' && 'শেরপুর ভ্রমণ কমিউনিটির অংশ হতে কয়েক সেকেন্ডেই ফ্রি অ্যাকাউন্ট খুলুন।'}
            {mode === 'forgot' && 'আপনার নিবন্ধিত ইমেইলে পাসওয়ার্ড রিসেট করার নিরাপদ লিংক পাঠানো হবে।'}
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {/* Tabs */}
          {mode !== 'forgot' && (
            <div className="grid grid-cols-2 p-1 bg-gray-100 rounded-2xl text-xs font-bold text-gray-600">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setLocalError(null);
                  clearError();
                }}
                className={`py-2 rounded-xl transition cursor-pointer ${
                  mode === 'login' ? 'bg-white text-[#143E27] shadow-xs' : 'hover:text-gray-900'
                }`}
              >
                লগইন করুন
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setLocalError(null);
                  clearError();
                }}
                className={`py-2 rounded-xl transition cursor-pointer ${
                  mode === 'register' ? 'bg-white text-[#143E27] shadow-xs' : 'hover:text-gray-900'
                }`}
              >
                রেজিস্ট্রেশন
              </button>
            </div>
          )}

          {/* Feedback messages */}
          {(localError || error) && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{localError || error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Quick Google Login */}
          {mode !== 'forgot' && (
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl border border-gray-300 hover:bg-gray-50 active:bg-gray-100 text-gray-700 font-bold text-xs flex items-center justify-center gap-2.5 transition cursor-pointer shadow-2xs"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>গুগল অ্যাকাউন্ট দিয়ে এক ক্লিকে এগিয়ে যান</span>
            </button>
          )}

          {mode !== 'forgot' && (
            <div className="relative flex items-center justify-center">
              <div className="border-t border-gray-200 w-full" />
              <span className="bg-white px-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider absolute">
                অথবা ইমেইল দিয়ে
              </span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3 pt-1">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">আপনার পূর্ণ নাম</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="যেমন: তারেক মাহমুদ"
                      className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm outline-none focus:border-emerald-600 focus:bg-white transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    ইউজারনেম (Username)
                  </label>
                  <div className="relative">
                    <span className="text-gray-400 absolute left-3 top-2.5 text-xs font-mono">@</span>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      placeholder="tarek_travels"
                      className="w-full pl-7 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-mono outline-none focus:border-emerald-600 focus:bg-white transition"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">ইমেইল ঠিকানা</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@gmail.com"
                  className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm outline-none focus:border-emerald-600 focus:bg-white transition"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-gray-700">পাসওয়ার্ড</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot');
                        setLocalError(null);
                        clearError();
                      }}
                      className="text-[11px] font-semibold text-emerald-700 hover:underline cursor-pointer"
                    >
                      পাসওয়ার্ড ভুলে গেছেন?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="কমপক্ষে ৬ অক্ষর"
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm outline-none focus:border-emerald-600 focus:bg-white transition"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-[#143E27] hover:bg-[#0D2618] active:bg-black text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-md disabled:opacity-50 mt-2"
            >
              <span>{loading ? 'অনুগ্রহ করে অপেক্ষা করুন...' : mode === 'login' ? 'লগইন করুন' : mode === 'register' ? 'অ্যাকাউন্ট তৈরি করুন' : 'রিসেট লিংক পাঠান'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Bottom Switcher */}
          <div className="pt-2 border-t border-gray-100 flex flex-col items-center justify-center gap-2 text-xs text-gray-500 text-center">
            {mode === 'forgot' ? (
              <button
                type="button"
                onClick={() => setMode('login')}
                className="font-bold text-emerald-800 hover:underline cursor-pointer"
              >
                ← লগইনে ফিরে যান
              </button>
            ) : mode === 'login' ? (
              <div>
                অ্যাকাউন্ট নেই?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="font-bold text-[#143E27] hover:underline cursor-pointer ml-1"
                >
                  ফ্রি রেজিস্ট্রেশন করুন
                </button>
              </div>
            ) : (
              <div>
                ইতোমধ্যে অ্যাকাউন্ট আছে?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="font-bold text-[#143E27] hover:underline cursor-pointer ml-1"
                >
                  লগইন করুন
                </button>
              </div>
            )}

            {/* Admin Login Link */}
            {onOpenAdminLogin && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAdminLogin();
                }}
                className="inline-flex items-center gap-1.5 text-[11px] text-gray-400 hover:text-emerald-800 transition pt-1 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>ম্যানেজমেন্ট বা অ্যাডমিন প্যানেল লগইন</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
