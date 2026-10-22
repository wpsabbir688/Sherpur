import React, { useState, useEffect, useRef } from 'react';
import {
  MessageCircle,
  X,
  Send,
  Compass,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  User,
  AlertCircle,
  Minimize2,
  Edit2,
  Check,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  getOrCreateConversation,
  subscribeToMessages,
  sendUserMessage,
  markConversationAsReadByUser,
} from '../../services/chatService';
import { ChatConversation, ChatMessage } from '../../types/community';

interface FloatingChatWidgetProps {
  onOpenAuthModal?: () => void;
}

const QUICK_PROMPTS = [
  'ঢাকা থেকে যাতায়াত কীভাবে?',
  'মধুটিলা নাকি গজনী অবকাশ?',
  'থাকার ভালো হোটেল ও রিসোর্ট?',
  'জরুরি হেল্পলাইন নম্বর কত?',
];

export const FloatingChatWidget: React.FC<FloatingChatWidgetProps> = ({ onOpenAuthModal }) => {
  const { user, userProfile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [conversation, setConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [guestName, setGuestName] = useState(() => {
    return localStorage.getItem('sherpur_guest_name') || '';
  });
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Generate or retrieve persistent visitor ID for guest or logged-in user
  const getVisitorId = (): string => {
    if (user?.uid) return `user_${user.uid}`;
    let vid = localStorage.getItem('sherpur_guest_visitor_id');
    if (!vid) {
      vid = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      localStorage.setItem('sherpur_guest_visitor_id', vid);
    }
    return vid;
  };

  const currentDisplayName =
    userProfile?.displayName || user?.displayName || guestName || 'ভ্রমণকারী অতিথি';

  // Initialize or fetch conversation when opened
  useEffect(() => {
    if (!isOpen) return;

    const visitorId = getVisitorId();
    const isGuest = !user;

    getOrCreateConversation(visitorId, {
      userId: user?.uid,
      userName: currentDisplayName,
      userEmail: user?.email || undefined,
      userAvatar: userProfile?.photoURL || user?.photoURL || undefined,
      isGuest,
    }).then((conv) => {
      setConversation(conv);
      markConversationAsReadByUser(conv.id);
    });
  }, [isOpen, user, userProfile, guestName]);

  // Subscribe to real-time messages
  useEffect(() => {
    if (!conversation?.id || !isOpen) return;

    const unsubscribe = subscribeToMessages(conversation.id, (newMessages) => {
      setMessages(newMessages);
      markConversationAsReadByUser(conversation.id);
    });

    return () => unsubscribe();
  }, [conversation?.id, isOpen]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const doSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const visitorId = getVisitorId();
    let currentConv = conversation;

    if (!currentConv) {
      currentConv = await getOrCreateConversation(visitorId, {
        userId: user?.uid,
        userName: currentDisplayName,
        userEmail: user?.email || undefined,
        userAvatar: userProfile?.photoURL || user?.photoURL || undefined,
        isGuest: !user,
      });
      setConversation(currentConv);
    }

    const optimisticId = `temp_${Date.now()}`;
    const optimisticMessage: ChatMessage = {
      id: optimisticId,
      conversationId: currentConv.id,
      senderType: 'user',
      senderId: user?.uid,
      senderName: currentDisplayName,
      text: textToSend.trim(),
      timestamp: new Date().toISOString(),
      status: 'sent',
    };

    // Instant optimistic render
    setMessages((prev) => {
      if (prev.some((m) => m.id === optimisticId)) return prev;
      return [...prev, optimisticMessage];
    });

    setSending(true);
    try {
      await sendUserMessage(currentConv.id, textToSend.trim(), {
        senderId: user?.uid,
        senderName: currentDisplayName,
      });
    } catch (err) {
      console.warn('Message send processed:', err);
    } finally {
      setSending(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || sending) return;
    const text = inputText.trim();
    setInputText('');
    await doSendMessage(text);
  };

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempName.trim()) {
      setGuestName(tempName.trim());
      localStorage.setItem('sherpur_guest_name', tempName.trim());
    }
    setIsEditingName(false);
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 font-sans">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 bg-[#143E27] hover:bg-[#0D2618] active:scale-95 text-white px-4 py-3.5 rounded-full shadow-2xl transition duration-300 border-2 border-emerald-400/30 cursor-pointer touch-manipulation"
          aria-label="লাইভ চ্যাট সহায়তা খুলুন"
        >
          <div className="relative">
            <MessageCircle className="w-5 h-5 text-emerald-300 group-hover:scale-110 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full" />
          </div>
          <span className="font-bold text-xs hidden sm:inline tracking-wide">
            শেরপুর গাইড সহায়তা
          </span>
          {conversation && conversation.unreadByUserCount > 0 && (
            <span className="bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-xs">
              {conversation.unreadByUserCount}
            </span>
          )}
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-[330px] sm:w-[380px] h-[520px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-emerald-950/10 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#143E27] via-[#1c5636] to-[#0D2618] text-white p-4 flex items-center justify-between shrink-0 shadow-sm">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shrink-0">
                <Compass className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="font-extrabold text-sm leading-tight truncate flex items-center gap-1.5">
                  <span>শেরপুর ভ্রমণ ডেস্ক</span>
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
                </div>
                <div className="text-[11px] text-emerald-200/90 truncate flex items-center gap-1">
                  <span>অনলাইন</span>
                  <span>•</span>
                  <span>জরুরি পর্যটন সহায়তা</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl hover:bg-black/20 text-emerald-200 transition cursor-pointer"
                title="চ্যাট মিনিমাইজ করুন"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl hover:bg-black/20 text-emerald-200 transition cursor-pointer"
                title="বন্ধ করুন"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Subheader: User identity info & edit */}
          <div className="px-3.5 py-1.5 bg-emerald-50/70 border-b border-emerald-100 flex items-center justify-between text-[11px] text-emerald-900">
            {isEditingName ? (
              <form onSubmit={handleSaveName} className="flex items-center gap-1.5 w-full">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  placeholder="আপনার নাম..."
                  autoFocus
                  className="flex-1 px-2 py-0.5 rounded-md border border-emerald-300 bg-white text-xs outline-none"
                />
                <button
                  type="submit"
                  className="p-1 rounded bg-[#143E27] text-white hover:bg-[#0D2618] cursor-pointer"
                  title="সংরক্ষণ করুন"
                >
                  <Check className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingName(false)}
                  className="p-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </form>
            ) : (
              <>
                <div className="flex items-center gap-1 truncate font-medium">
                  <User className="w-3 h-3 text-emerald-700 shrink-0" />
                  <span className="truncate">প্রেরক: <strong>{currentDisplayName}</strong></span>
                </div>
                {!user && (
                  <button
                    onClick={() => {
                      setTempName(guestName);
                      setIsEditingName(true);
                    }}
                    className="text-[10px] text-emerald-700 hover:text-emerald-900 font-bold underline flex items-center gap-0.5 cursor-pointer ml-2 shrink-0"
                  >
                    <Edit2 className="w-2.5 h-2.5" />
                    <span>নাম পরিবর্তন</span>
                  </button>
                )}
              </>
            )}
          </div>

          {/* Message History */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-gray-50/40">
            {/* System Welcome Message */}
            <div className="flex flex-col items-start">
              <div className="text-[10px] text-gray-400 mb-0.5 px-1 flex items-center gap-1 font-bold text-emerald-800">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>শেরপুর ভ্রমণ ডেস্ক</span>
                <span>•</span>
                <span>স্বাগতম</span>
              </div>
              <div className="max-w-[88%] p-3 rounded-2xl text-xs sm:text-sm leading-relaxed bg-white text-gray-800 border border-gray-200/90 rounded-bl-xs shadow-2xs">
                স্বাগতম! শেরপুর ভ্রমণ ডেস্কে আপনাকে স্বাগতম। পাহাড়, যাতায়াত, রিসোর্ট বা জরুরি তথ্য—যেকোনো বিষয়ে মেসেজ পাঠাতে পারেন।
              </div>
            </div>

            {messages.map((msg) => {
              const isMe = msg.senderType === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div className="text-[10px] text-gray-400 mb-0.5 px-1 flex items-center gap-1">
                    {!isMe && (
                      <span className="font-bold text-emerald-800 flex items-center gap-0.5">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        {msg.senderName} ({msg.senderRole || 'Admin'})
                      </span>
                    )}
                    {isMe && <span>{msg.senderName}</span>}
                    <span>•</span>
                    <span>
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      isMe
                        ? 'bg-[#143E27] text-white rounded-br-xs shadow-xs'
                        : 'bg-white text-gray-800 border border-gray-200/90 rounded-bl-xs shadow-xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Question Chips */}
          <div className="p-2 bg-gray-50/90 border-t border-gray-100 flex items-center gap-1.5 overflow-x-auto text-[11px] whitespace-nowrap scrollbar-none">
            <span className="text-[10px] text-gray-400 font-bold shrink-0 ml-1">কুইক প্রশ্ন:</span>
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => doSendMessage(prompt)}
                disabled={sending}
                className="px-2.5 py-1 rounded-full bg-white hover:bg-emerald-50 text-emerald-900 border border-emerald-200/80 font-medium text-[11px] shrink-0 transition cursor-pointer shadow-2xs hover:border-emerald-400"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-white border-t border-gray-200/80 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="আপনার প্রশ্ন বা বার্তা লিখুন..."
              className="flex-1 p-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm outline-none focus:border-emerald-600 bg-gray-50/50"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || sending}
              className="p-2.5 rounded-xl bg-[#143E27] hover:bg-[#0D2618] text-white disabled:opacity-40 transition shadow-xs cursor-pointer shrink-0"
              title="মেসেজ পাঠান"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
