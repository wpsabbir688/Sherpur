import React, { useState } from 'react';
import { Phone, Mail, MapPin, Send, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { submitContactMessage } from '../services/contactService';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setErrorMsg('অনুগ্রহ করে নাম, ইমেইল ও বার্তার বিবরণ প্রদান করুন।');
      return;
    }

    setSubmitting(true);
    try {
      await submitContactMessage({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        message: formData.message.trim(),
      });
      setSubmitted(true);
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (err: any) {
      console.error('Contact form submission error:', err);
      // Even if Firestore rule triggers, show friendly state
      setErrorMsg('বার্তাটি পৌঁছাতে সমস্যা হয়েছে। সরাসরি কল অথবা ইমেইল করতে পারেন: wpsabbir44@gmail.com');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-12">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-[#143E27] text-xs font-semibold">
          <Phone className="w-3.5 h-3.5" /> যোগাযোগ বাতায়ন
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#143E27] tracking-tight">
          আমাদের সাথে যোগাযোগ করুন
        </h1>
        <p className="text-sm sm:text-base text-gray-600 max-w-xl mx-auto">
          শেরপুর সম্পর্কিত যেকোনো তথ্য অনুসন্ধান, পর্যটন স্থানের সংযোজন বা মতামতের জন্য বার্তা পাঠান।
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        {/* Contact Details Card (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#123923] text-white p-6 sm:p-8 rounded-3xl space-y-6 shadow-md">
            <div>
              <h2 className="text-xl font-bold">যোগাযোগের তথ্য</h2>
              <p className="text-xs text-emerald-200 mt-1">
                সরাসরি ফোন বা ইমেইলের মাধ্যমে যোগাযোগ করা যাবে।
              </p>
            </div>

            <div className="space-y-4">
              <a
                href="tel:+8801944460344"
                className="flex items-start gap-3 p-3 rounded-2xl bg-white/10 hover:bg-white/15 transition border border-white/10 group"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-400 text-[#123923] flex items-center justify-center shrink-0 font-bold group-hover:scale-105 transition-transform">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] text-emerald-300">টেলিফোন / কল</div>
                  <div className="text-sm font-bold text-white">+8801944460344</div>
                  <div className="text-[11px] text-emerald-200/80 mt-0.5">ক্লিক করে সরাসরি ডায়াল করুন</div>
                </div>
              </a>

              <a
                href="mailto:wpsabbir44@gmail.com"
                className="flex items-start gap-3 p-3 rounded-2xl bg-white/10 hover:bg-white/15 transition border border-white/10 group"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-400 text-[#123923] flex items-center justify-center shrink-0 font-bold group-hover:scale-105 transition-transform">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] text-emerald-300">ইমেইল ঠিকানা</div>
                  <div className="text-sm font-bold text-white break-all">wpsabbir44@gmail.com</div>
                  <div className="text-[11px] text-emerald-200/80 mt-0.5">ক্লিক করে মেইল পাঠান</div>
                </div>
              </a>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <div className="text-[11px] text-emerald-300">মূল অবস্থান</div>
                  <div className="text-sm font-bold text-white">শেরপুর জেলা, বাংলাদেশ</div>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-emerald-800/60 text-xs text-emerald-200/80 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span>আমরা সাধারণত ২৪-৪৮ ঘণ্টার মধ্যে উত্তর দেওয়ার চেষ্টা করি।</span>
            </div>
          </div>
        </div>

        {/* Validated Inquiry Form (3 Cols) */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs">
            <h2 className="text-xl font-bold text-[#143E27] mb-2">
              বার্তা পাঠান
            </h2>
            <p className="text-xs text-gray-500 mb-6">
              তথ্য যাচাই, ভ্রমণ অভিজ্ঞতা বা কোনো মতামত জানাতে নিচের ফরমটি পূরণ করুন।
            </p>

            {submitted ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="text-lg font-bold text-emerald-900">
                  আপনার বার্তাটি সফলভাবে গৃহীত হয়েছে!
                </h3>
                <p className="text-xs text-emerald-700">
                  আমাদের সাথে যোগাযোগ করার জন্য ধন্যবাদ। প্রয়োজনে আমরা আপনার ইমেইলে যোগাযোগ করব।
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-2 px-4 py-2 bg-[#143E27] text-white text-xs font-semibold rounded-xl hover:bg-[#0D2618] transition"
                >
                  আরেকটি বার্তা পাঠান
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMsg && (
                  <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700">
                      আপনার নাম <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="নাম লিখুন"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-sm outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700">
                      ইমেইল ঠিকানা <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="example@mail.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-sm outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">
                    মোবাইল নম্বর (ঐচ্ছিক)
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="017xxxxxxxx"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-sm outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">
                    বার্তা বা অনুসন্ধানের বিবরণ <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="আপনার বার্তা এখানে লিখুন..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-sm outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-xl bg-[#143E27] hover:bg-[#0D2618] text-white font-bold text-sm transition shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'পাঠানো হচ্ছে...' : 'বার্তা প্রেরণ করুন'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
