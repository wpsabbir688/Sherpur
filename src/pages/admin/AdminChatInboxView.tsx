import React, { useState, useEffect, useRef } from 'react';
import {
  MessageCircle,
  Search,
  CheckCircle2,
  Clock,
  Send,
  User,
  ShieldCheck,
  AlertCircle,
  Filter,
  RefreshCw,
  Check,
  Lock,
  Sparkles,
  Phone,
  Mail,
  ChevronRight,
  Info,
  Calendar,
  Layers,
  MapPin,
  Compass,
} from 'lucide-react';
import {
  subscribeToAllConversations,
  subscribeToMessages,
  sendAdminReply,
  sendUserMessage,
  getOrCreateConversation,
  updateConversationStatus,
  markConversationAsReadByAdmin,
  seedInitialChatData,
  INITIAL_SEED_CONVERSATIONS,
} from '../../services/chatService';
import { ChatConversation, ChatMessage, ChatConversationStatus } from '../../types/community';
import { useAuth } from '../../context/AuthContext';

const ADMIN_QUICK_REPLIES = [
  'ধন্যবাদ! শেরপুর ভ্রমণে যেকোনো সহায়তায় আমরা আপনার সাথে আছি।',
  'ঢাকা মহাখালী থেকে শেরপুরের উদ্দেশ্যে ড্রিমল্যান্ড ও তুরাগ বাস ছাড়ে (ভাড়া ২৫০-৩৫০ টাকা)। এরপর সিএনজিতে সহজেই গজনী বা মধুটিলা যাওয়া যায়।',
  'শেরপুর জেলা সদরে হোটেল আল-শান, আরপি ও কাকলীতে নিরাপদ ও পরিচ্ছন্ন থাকার ব্যবস্থা রয়েছে।',
  'জরুরি তথ্যের জন্য সরাসরি আমাদের ট্যুরিজম ডেস্কে কল করতে পারেন: +৮৮০১৯৪৪৪৬০৩৪৪।',
  'আপনার ভ্রমণ নিরাপদ ও আনন্দময় হোক! আর কিছু জানার থাকলে নিঃসঙ্কোচে লিখুন।',
];

export const AdminChatInboxView: React.FC = () => {
  const { adminName, adminRole, isSuperAdmin } = useAuth();

  // Safely initialize from seed or cache immediately so the page is NEVER empty or crashing
  const [conversations, setConversations] = useState<ChatConversation[]>(() => {
    try {
      const cached = localStorage.getItem('sherpur_admin_all_convs');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_SEED_CONVERSATIONS.map((i) => i.conv);
  });

  const [selectedConvId, setSelectedConvId] = useState<string>(() => {
    return INITIAL_SEED_CONVERSATIONS[0]?.conv.id || 'conv_traveler_tanvir';
  });

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return INITIAL_SEED_CONVERSATIONS[0]?.messages || [];
  });

  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | ChatConversationStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showVisitorInfo, setShowVisitorInfo] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Subscribe to all conversations in Firestore with strict [] dependency array
  useEffect(() => {
    const unsubscribe = subscribeToAllConversations((list) => {
      if (Array.isArray(list) && list.length > 0) {
        setConversations(list);
      }
    });
    return () => unsubscribe();
  }, []);

  // When selectedConvId changes, update messages and subscribe
  useEffect(() => {
    if (!selectedConvId) return;

    // Load from seed or cache first
    try {
      const cacheKey = `sherpur_msgs_${selectedConvId}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      } else {
        const seed = INITIAL_SEED_CONVERSATIONS.find((s) => s.conv.id === selectedConvId);
        if (seed) {
          setMessages(seed.messages);
        }
      }
    } catch {}

    markConversationAsReadByAdmin(selectedConvId);

    const unsubscribe = subscribeToMessages(selectedConvId, (msgs) => {
      if (Array.isArray(msgs) && msgs.length > 0) {
        setMessages(msgs);
      }
    });

    return () => unsubscribe();
  }, [selectedConvId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const selectedConversation =
    conversations.find((c) => c.id === selectedConvId) || conversations[0];

  const filteredConversations = conversations.filter((c) => {
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      c.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const pendingCount = conversations.filter(
    (c) => c.status === 'pending' || c.unreadByAdminCount > 0
  ).length;
  const answeredCount = conversations.filter((c) => c.status === 'answered').length;
  const openCount = conversations.filter((c) => c.status === 'open').length;
  const closedCount = conversations.filter((c) => c.status === 'closed').length;

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedConvId || sending) return;

    const textToSend = replyText.trim();
    setReplyText('');

    const optimisticId = `admin_temp_${Date.now()}`;
    const optimisticMsg: ChatMessage = {
      id: optimisticId,
      conversationId: selectedConvId,
      senderType: 'admin',
      senderName: adminName || 'মো. সাব্বির হোসেন',
      senderRole: isSuperAdmin ? 'Super Admin' : 'Editor',
      text: textToSend,
      timestamp: new Date().toISOString(),
      status: 'sent',
    };

    setMessages((prev) => {
      if (prev.some((m) => m.id === optimisticId)) return prev;
      return [...prev, optimisticMsg];
    });

    setSending(true);
    try {
      await sendAdminReply(
        selectedConvId,
        textToSend,
        adminName || 'মো. সাব্বির হোসেন',
        isSuperAdmin ? 'Super Admin' : 'Editor'
      );
    } catch (err) {
      console.error('Error sending admin reply:', err);
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (newStatus: ChatConversationStatus) => {
    if (!selectedConvId) return;
    await updateConversationStatus(selectedConvId, newStatus);
    setConversations((prev) =>
      prev.map((c) => (c.id === selectedConvId ? { ...c, status: newStatus } : c))
    );
  };

  const handleCreateTestConversation = async () => {
    const testVid = `test_visitor_${Math.random().toString(36).substring(2, 6)}`;
    const conv = await getOrCreateConversation(testVid, {
      userName: 'আরিফ আহমেদ (টেস্ট ভ্রমণকারী)',
      userEmail: 'traveler.test@example.com',
      isGuest: true,
    });
    await sendUserMessage(
      conv.id,
      'আসসালামু আলাইকুম, ঢাকা থেকে শেরপুরের গজনী অবকাশে যাওয়ার সেরা উপায় কী?',
      {
        senderName: 'আরিফ আহমেদ',
      }
    );
    setSelectedConvId(conv.id);
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await seedInitialChatData();
    } catch {}
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const getStatusBadge = (status: ChatConversationStatus) => {
    switch (status) {
      case 'open':
        return (
          <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">
            উন্মুক্ত
          </span>
        );
      case 'pending':
        return (
          <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-bold animate-pulse">
            অপেক্ষমাণ
          </span>
        );
      case 'answered':
        return (
          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
            উত্তরকৃত
          </span>
        );
      case 'closed':
        return (
          <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-bold">
            বন্ধ
          </span>
        );
    }
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Top Chat Intelligence Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-200 shadow-2xs">
          <div className="text-[11px] text-gray-500 font-semibold flex items-center justify-between">
            <span>মোট কথোপকথন</span>
            <MessageCircle className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#143E27] mt-0.5">
            {conversations.length}টি
          </div>
          <div className="text-[10px] text-gray-400 font-medium">ভ্রমণকারীদের সাথে সক্রিয় চ্যাট</div>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-amber-200/80 bg-amber-50/20 shadow-2xs">
          <div className="text-[11px] text-amber-800 font-semibold flex items-center justify-between">
            <span>অপেক্ষমাণ বার্তা</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-700 mt-0.5">
            {pendingCount}টি
          </div>
          <div className="text-[10px] text-amber-600 font-medium">তাৎক্ষণিক উত্তর প্রয়োজন</div>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-emerald-200/80 bg-emerald-50/20 shadow-2xs">
          <div className="text-[11px] text-emerald-800 font-semibold flex items-center justify-between">
            <span>উত্তর প্রদানকৃত</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-700 mt-0.5">
            {answeredCount}টি
          </div>
          <div className="text-[10px] text-emerald-600 font-medium">অ্যাডমিন টিম উত্তর সম্পন্ন করেছে</div>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-200 shadow-2xs">
          <div className="text-[11px] text-gray-500 font-semibold flex items-center justify-between">
            <span>সমাধানকৃত ও বন্ধ</span>
            <Check className="w-4 h-4 text-gray-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-gray-700 mt-0.5">
            {closedCount}টি
          </div>
          <div className="text-[10px] text-gray-400 font-medium">সফলভাবে সমাধান হয়েছে</div>
        </div>
      </div>

      {/* Main SaaS Chat Container */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden h-[740px] flex flex-col md:flex-row">
        {/* Left Column: Conversation Directory */}
        <div className="w-full md:w-80 lg:w-96 border-r border-gray-200 flex flex-col h-full bg-gray-50/40">
          {/* Top Search & Actions */}
          <div className="p-3.5 border-b border-gray-200 space-y-3 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold text-xs">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900 text-sm">ইনবক্স তালিকা</h3>
                  <p className="text-[10px] text-gray-400">রিয়েল-টাইম বার্তা স্ট্রিম</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleManualRefresh}
                  disabled={isRefreshing}
                  className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-600 transition cursor-pointer"
                  title="চ্যাট হিস্ট্রি সিঙ্ক ও রিফ্রেশ"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-700' : ''}`}
                  />
                </button>
                <button
                  type="button"
                  onClick={handleCreateTestConversation}
                  className="text-[10px] text-white bg-[#143E27] hover:bg-[#0D2618] px-2.5 py-1.5 rounded-lg font-bold shadow-2xs transition cursor-pointer"
                  title="নতুন টেস্ট চ্যাট শুরু করুন"
                >
                  + টেস্ট চ্যাট
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ভ্রমণকারীর নাম বা বার্তা খুঁজুন..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-gray-200 bg-gray-50 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#143E27]"
              />
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5 text-[11px] font-semibold text-gray-600 scrollbar-none">
              {(
                [
                  { id: 'all', label: 'সবগুলো', count: conversations.length },
                  { id: 'pending', label: 'অপেক্ষমাণ', count: pendingCount },
                  { id: 'open', label: 'উন্মুক্ত', count: openCount },
                  { id: 'answered', label: 'উত্তরকৃত', count: answeredCount },
                  { id: 'closed', label: 'বন্ধ', count: closedCount },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id as any)}
                  className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                    statusFilter === tab.id
                      ? 'bg-[#143E27] text-white shadow-2xs'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[9px] px-1 py-0.2 rounded-full font-bold ${
                      statusFilter === tab.id
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Conversation List Scroll Area */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400 space-y-3">
                <MessageCircle className="w-8 h-8 mx-auto text-gray-300" />
                <p>কোনো চ্যাট পাওয়া যায়নি।</p>
                <button
                  onClick={handleCreateTestConversation}
                  className="px-3.5 py-1.5 rounded-xl bg-[#143E27] text-white text-xs font-bold hover:bg-[#0D2618] transition cursor-pointer"
                >
                  একটি টেস্ট বার্তা তৈরি করুন
                </button>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = conv.id === selectedConvId;
                return (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConvId(conv.id)}
                    className={`p-3.5 flex items-start gap-3 cursor-pointer transition ${
                      isSelected
                        ? 'bg-emerald-50/90 border-l-4 border-l-[#143E27]'
                        : 'hover:bg-white bg-transparent'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-[#143E27] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                      {conv.userName ? conv.userName.slice(0, 1) : 'ভ'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-bold text-xs text-gray-900 truncate">
                          {conv.userName}
                        </span>
                        <span className="text-[10px] text-gray-400 shrink-0">
                          {conv.lastMessageTime
                            ? new Date(conv.lastMessageTime).toLocaleTimeString('bn-BD', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : ''}
                        </span>
                      </div>

                      <p className="text-[11px] text-gray-500 truncate mb-1.5">
                        {conv.lastMessage}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          {getStatusBadge(conv.status)}
                          {conv.isGuest && (
                            <span className="text-[9px] bg-gray-200 text-gray-600 px-1.5 py-0.2 rounded font-medium">
                              গেস্ট
                            </span>
                          )}
                        </div>
                        {conv.unreadByAdminCount > 0 && (
                          <span className="w-4 h-4 rounded-full bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center shadow-xs animate-bounce">
                            {conv.unreadByAdminCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Center Column: Active Conversation Workspace */}
        <div className="flex-1 flex flex-col h-full bg-white min-w-0">
          {selectedConversation ? (
            <>
              {/* Thread Header */}
              <div className="p-3.5 sm:p-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#143E27] text-white flex items-center justify-center font-bold text-sm shadow-2xs">
                    {selectedConversation.userName ? selectedConversation.userName.slice(0, 1) : 'ভ'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-sm text-gray-900">
                        {selectedConversation.userName}
                      </h4>
                      {selectedConversation.isGuest ? (
                        <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                          গেস্ট ভিজিটর
                        </span>
                      ) : (
                        <span className="text-[10px] bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full font-bold">
                          নিবন্ধিত ভ্রমণকারী
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500 truncate">
                      {selectedConversation.userEmail || `ভিজিটর আইডি: ${selectedConversation.visitorId}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-500 font-semibold">স্ট্যাটাস:</span>
                    <select
                      value={selectedConversation.status}
                      onChange={(e) =>
                        handleStatusChange(e.target.value as ChatConversationStatus)
                      }
                      className="text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#143E27] cursor-pointer"
                    >
                      <option value="open">উন্মুক্ত (Open)</option>
                      <option value="pending">অপেক্ষমাণ (Pending)</option>
                      <option value="answered">উত্তরকৃত (Answered)</option>
                      <option value="closed">বন্ধ (Closed)</option>
                    </select>
                  </div>

                  <button
                    onClick={() => setShowVisitorInfo(!showVisitorInfo)}
                    className="p-1.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-gray-600 transition cursor-pointer"
                    title="ভিজিটর তথ্য দেখুন/লুকান"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Chat Body & Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gray-50/40">
                {/* Initial Conversation Banner */}
                <div className="text-center my-1">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-gray-200 text-[10px] font-semibold text-gray-500 shadow-2xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>শেরপুর ভ্রমণ ডেস্ক সরাসরি মেসেঞ্জার</span>
                  </span>
                </div>

                {messages.length === 0 ? (
                  <div className="h-48 flex items-center justify-center text-xs text-gray-400">
                    এখনো কোনো বার্তা আদান-প্রদান হয়নি।
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isAdminMsg = msg.senderType === 'admin';
                    const isDeskAuto =
                      msg.senderName?.includes('স্বয়ংক্রিয়') ||
                      msg.senderRole?.includes('সহায়িকা');

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isAdminMsg ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mb-1 px-1">
                          <span className="font-semibold text-gray-600">{msg.senderName}</span>
                          {msg.senderRole && (
                            <span
                              className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                                isDeskAuto
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-emerald-100 text-[#143E27]'
                              }`}
                            >
                              {msg.senderRole}
                            </span>
                          )}
                          <span>•</span>
                          <span>
                            {msg.timestamp
                              ? new Date(msg.timestamp).toLocaleTimeString('bn-BD', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : ''}
                          </span>
                        </div>

                        <div
                          className={`max-w-md p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-2xs ${
                            isAdminMsg
                              ? 'bg-[#143E27] text-white rounded-br-xs'
                              : 'bg-white text-gray-800 border border-gray-200/90 rounded-bl-xs'
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Canned Replies Bar */}
              <div className="px-3.5 py-1.5 bg-gray-50 border-t border-gray-200 flex items-center gap-1.5 overflow-x-auto text-[11px] scrollbar-none">
                <span className="text-[10px] text-gray-400 font-bold shrink-0">কুইক রিপ্লাই:</span>
                {ADMIN_QUICK_REPLIES.map((rep, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setReplyText(rep)}
                    className="px-2.5 py-1 rounded-full bg-white hover:bg-emerald-50 text-emerald-950 border border-emerald-200 text-[11px] shrink-0 font-medium transition cursor-pointer shadow-2xs hover:border-emerald-400"
                  >
                    {rep.slice(0, 25)}...
                  </button>
                ))}
              </div>

              {/* Message Reply Form */}
              <form
                onSubmit={handleSendReply}
                className="p-3.5 border-t border-gray-200 bg-white flex items-center gap-2"
              >
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="ভ্রমণকারীকে উত্তর লিখুন (Enter চাপুন)..."
                  disabled={sending}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#143E27] bg-gray-50/50 font-medium"
                />
                <button
                  type="submit"
                  disabled={sending || !replyText.trim()}
                  className="px-5 py-2.5 rounded-xl bg-[#143E27] text-white font-bold text-xs sm:text-sm hover:bg-[#0E2C1C] transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  <Send className="w-4 h-4" />
                  <span>{sending ? 'পাঠানো হচ্ছে...' : 'উত্তর দিন'}</span>
                </button>
              </form>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-400 space-y-3">
              <MessageCircle className="w-12 h-12 text-gray-300" />
              <h4 className="font-bold text-gray-700 text-sm">কোনো চ্যাট নির্বাচিত নেই</h4>
              <p className="text-xs">বাম পাশের তালিকা থেকে একটি কথোপকথন নির্বাচন করুন অথবা টেস্ট চ্যাট শুরু করুন।</p>
              <button
                onClick={handleCreateTestConversation}
                className="px-4 py-2 rounded-xl bg-[#143E27] text-white text-xs font-bold hover:bg-[#0D2618] transition cursor-pointer shadow-xs"
              >
                টেস্ট ইনকোয়ারি শুরু করুন
              </button>
            </div>
          )}
        </div>

        {/* Right Collapsible Panel: Traveler Details Inspector */}
        {selectedConversation && showVisitorInfo && (
          <div className="w-full md:w-64 lg:w-72 border-l border-gray-200 bg-gray-50/30 p-4 space-y-4 overflow-y-auto hidden xl:block">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              ভ্রমণকারী বিবরণ
            </div>

            <div className="text-center p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-900 font-extrabold text-xl flex items-center justify-center mx-auto border border-emerald-300">
                {selectedConversation.userName ? selectedConversation.userName.slice(0, 1) : 'ভ'}
              </div>
              <div>
                <h5 className="font-extrabold text-sm text-gray-900 leading-tight">
                  {selectedConversation.userName}
                </h5>
                <p className="text-[11px] text-gray-500 mt-0.5 truncate">
                  {selectedConversation.userEmail || 'গেস্ট অ্যাকাউন্ট'}
                </p>
              </div>
              <div className="pt-1">{getStatusBadge(selectedConversation.status)}</div>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-2xs space-y-2.5 text-xs text-gray-600">
              <div className="font-bold text-gray-900 text-[11px]">মেটাডেটা ও সেশন</div>
              <div className="flex items-center justify-between">
                <span>সেশন টাইপ:</span>
                <strong className="text-gray-800">
                  {selectedConversation.isGuest ? 'গেস্ট ভিজিটর' : 'নিবন্ধিত ইউজার'}
                </strong>
              </div>
              <div className="flex items-center justify-between">
                <span>কনভারসেশন আইডি:</span>
                <span className="font-mono text-[10px] text-gray-500 truncate max-w-[120px]">
                  {selectedConversation.id}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>প্রথম যোগাযোগ:</span>
                <span className="text-[10px] text-gray-500">
                  {selectedConversation.createdAt
                    ? new Date(selectedConversation.createdAt).toLocaleDateString('bn-BD')
                    : 'সম্প্রতি'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>দায়িত্বপ্রাপ্ত:</span>
                <span className="text-emerald-800 font-bold text-[11px]">
                  {selectedConversation.assignedAdminName || adminName || 'মো. সাব্বির হোসেন'}
                </span>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-950 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                <span>জরুরি যোগাযোগ</span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                ট্যুরিজম ডেস্ক হেল্পলাইন: <strong>+৮৮০১৯৪৪৪৬০৩৪৪</strong>। যেকোনো জটিলতায় সরাসরি কল করুন।
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
