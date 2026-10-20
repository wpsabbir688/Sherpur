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

export const FloatingChatWidget: React.FC<FloatingChatWidgetProps> = ({ onOpenAuthModal }) => {
  const { user, userProfile, isAdmin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [conversation, setConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [hasStartedGuest, setHasStartedGuest] = useState(false);
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

  // Initialize or fetch conversation when opened
  useEffect(() => {
    if (!isOpen) return;

    const visitorId = getVisitorId();
    const displayName = userProfile?.displayName || user?.displayName || guestName || 'ভ্রমণকারী অতিথি';
    const isGuest = !user;

    getOrCreateConversation(visitorId, {
      userId: user?.uid,
      userName: displayName,
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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !conversation) return;

    const textToSend = inputText.trim();
    setInputText('');
    setSending(true);

    try {
      const senderName =
        userProfile?.displayName || user?.displayName || guestName || 'ভ্রমণকারী';
      await sendUserMessage(conversation.id, textToSend, {
        senderId: user?.uid,
        senderName,
      });
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  const handleStartGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (guestName.trim()) {
      setHasStartedGuest(true);
    }
  };

  // If viewing on admin page, we don't hide it so admin can also test live response
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
            <span className="bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
              {conversation.unreadByUserCount}
            </span>
          )}
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-[340px] sm:w-[380px] h-[520px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-emerald-950/10 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
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
                <div className="text-[11px] text-emerald-200/80 truncate">
                  যাচাইকৃত তথ্য ও জরুরি ভ্রমণ সহায়তা
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

          {/* Guest Name Prompt if not logged in and not started */}
          {!user && !hasStartedGuest && messages.length === 0 ? (
            <div className="flex-1 p-6 flex flex-col justify-center items-center text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-200">
                <Sparkles className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-extrabold text-gray-900 text-sm">
                  শেরপুর ভ্রমণে কোনো তথ্য প্রয়োজন?
                </h3>
                <p className="text-xs text-gray-500 mt-1 max-w-xs">
                  যাতায়াত, রিসোর্ট, গাইডলাইন বা নিরাপত্তা সম্পর্কিত যেকোনো প্রশ্ন আমাদের অ্যাডমিন টিমকে সরাসরি জানান।
                </p>
              </div>

              <form onSubmit={handleStartGuest} className="w-full space-y-2.5 pt-2">
                <input
                  type="text"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="আপনার নাম লিখুন..."
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm outline-none focus:border-emerald-600 font-medium"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#143E27] hover:bg-[#0D2618] text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                >
                  সরাসরি বার্তা শুরু করুন
                </button>
              </form>

              {onOpenAuthModal && (
                <div className="text-[11px] text-gray-400 pt-1">
                  কিংবা{' '}
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onOpenAuthModal();
                    }}
                    className="text-emerald-700 font-bold hover:underline cursor-pointer"
                  >
                    লগইন করুন
                  </button>{' '}
                  সংরক্ষিত বার্তার জন্য
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Message History */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50/50">
                {/* System Welcome Badge */}
                <div className="text-center my-2">
                  <span className="inline-block px-3 py-1 bg-white border border-gray-200 rounded-full text-[10px] font-semibold text-gray-500 shadow-2xs">
                    🤝 স্বাগতম! শেরপুর ভ্রমণ ডেস্কে আপনার প্রশ্ন লিখে পাঠান।
                  </span>
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
                        className={`max-w-[82%] p-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${
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

              {/* Chat Input */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 bg-white border-t border-gray-100 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="আপনার মেসেজ লিখুন..."
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
            </>
          )}
        </div>
      )}
    </div>
  );
};
