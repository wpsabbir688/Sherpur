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
} from 'lucide-react';
import {
  subscribeToAllConversations,
  subscribeToMessages,
  sendAdminReply,
  updateConversationStatus,
  markConversationAsReadByAdmin,
} from '../../services/chatService';
import { ChatConversation, ChatMessage, ChatConversationStatus } from '../../types/community';
import { useAuth } from '../../context/AuthContext';

export const AdminChatInboxView: React.FC = () => {
  const { adminName, adminRole, isSuperAdmin } = useAuth();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | ChatConversationStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Subscribe to all conversations
  useEffect(() => {
    const unsubscribe = subscribeToAllConversations((list) => {
      setConversations(list);
      if (!selectedConvId && list.length > 0) {
        setSelectedConvId(list[0].id);
      }
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to selected conversation's messages
  useEffect(() => {
    if (!selectedConvId) {
      setMessages([]);
      return;
    }

    markConversationAsReadByAdmin(selectedConvId);

    const unsubscribe = subscribeToMessages(selectedConvId, (msgs) => {
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [selectedConvId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const selectedConversation = conversations.find((c) => c.id === selectedConvId);

  const filteredConversations = conversations.filter((c) => {
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      c.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedConvId) return;

    setSending(true);
    const textToSend = replyText.trim();
    setReplyText('');

    try {
      await sendAdminReply(
        selectedConvId,
        textToSend,
        adminName || 'প্রধান প্রশাসক',
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

  const getStatusBadge = (status: ChatConversationStatus) => {
    switch (status) {
      case 'open':
        return <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">উন্মুক্ত</span>;
      case 'pending':
        return <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">অপেক্ষমাণ</span>;
      case 'answered':
        return <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">উত্তর দেওয়া হয়েছে</span>;
      case 'closed':
        return <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-bold">বন্ধ</span>;
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-200/90 shadow-2xs overflow-hidden h-[720px] flex flex-col md:flex-row">
      {/* Sidebar: Conversation List */}
      <div className="w-full md:w-80 lg:w-96 border-r border-gray-200 flex flex-col h-full bg-gray-50/50">
        {/* Header & Search */}
        <div className="p-4 border-b border-gray-200 space-y-3 bg-white">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-emerald-800" />
              <span>লাইভ চ্যাট ইনবক্স</span>
            </h3>
            <span className="text-xs bg-emerald-50 text-[#143E27] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
              {conversations.length}টি চ্যাট
            </span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="নাম বা বার্তা খুঁজুন..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-gray-200 bg-gray-50 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#143E27]"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] font-semibold text-gray-600">
            {(['all', 'pending', 'open', 'answered', 'closed'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap cursor-pointer ${
                  statusFilter === st
                    ? 'bg-[#143E27] text-white shadow-2xs'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {st === 'all'
                  ? 'সকল'
                  : st === 'pending'
                  ? 'অপেক্ষমাণ'
                  : st === 'open'
                  ? 'উন্মুক্ত'
                  : st === 'answered'
                  ? 'উত্তরকৃত'
                  : 'বন্ধ'}
              </button>
            ))}
          </div>
        </div>

        {/* Conversation list items */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-400">
              কোনো কথোপকথন পাওয়া যায়নি
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isSelected = conv.id === selectedConvId;
              return (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConvId(conv.id)}
                  className={`p-3.5 transition cursor-pointer flex items-start gap-3 ${
                    isSelected ? 'bg-emerald-50/80 border-l-4 border-l-[#143E27]' : 'hover:bg-gray-100/70 bg-white'
                  }`}
                >
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                    {conv.userName.slice(0, 1)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-bold text-xs text-gray-900 truncate">
                        {conv.userName}
                      </span>
                      <span className="text-[10px] text-gray-400 shrink-0">
                        {new Date(conv.lastMessageTime).toLocaleTimeString('bn-BD', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <p className="text-[11px] text-gray-500 truncate mb-1">
                      {conv.lastMessage}
                    </p>

                    <div className="flex items-center justify-between">
                      {getStatusBadge(conv.status)}
                      {conv.unreadByAdminCount > 0 && (
                        <span className="w-4 h-4 rounded-full bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center shadow-xs">
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

      {/* Main Chat Thread */}
      <div className="flex-1 flex flex-col h-full bg-white">
        {selectedConversation ? (
          <>
            {/* Thread Header */}
            <div className="p-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 bg-gray-50/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#143E27] text-white flex items-center justify-center font-bold text-sm shadow-2xs">
                  {selectedConversation.userName.slice(0, 1)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-gray-900">
                      {selectedConversation.userName}
                    </h4>
                    {selectedConversation.isGuest && (
                      <span className="text-[10px] bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded">
                        গেস্ট সেশন
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500">
                    {selectedConversation.userEmail || 'আইডি: ' + selectedConversation.visitorId}
                  </p>
                </div>
              </div>

              {/* Status Actions */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 font-semibold">স্ট্যাটাস:</span>
                <select
                  value={selectedConversation.status}
                  onChange={(e) => handleStatusChange(e.target.value as ChatConversationStatus)}
                  className="text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#143E27]"
                >
                  <option value="open">উন্মুক্ত (Open)</option>
                  <option value="pending">অপেক্ষমাণ (Pending)</option>
                  <option value="answered">উত্তরকৃত (Answered)</option>
                  <option value="closed">বন্ধ (Closed)</option>
                </select>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gray-50/30">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-gray-400">
                  এখনো কোনো বার্তা আদান-প্রদান হয়নি।
                </div>
              ) : (
                messages.map((msg) => {
                  const isAdminMsg = msg.senderType === 'admin';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isAdminMsg ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mb-1 px-1">
                        <span className="font-semibold text-gray-600">{msg.senderName}</span>
                        {msg.senderRole && (
                          <span className="bg-emerald-100 text-[#143E27] px-1 rounded text-[9px] font-bold">
                            {msg.senderRole}
                          </span>
                        )}
                        <span>•</span>
                        <span>
                          {new Date(msg.timestamp).toLocaleTimeString('bn-BD', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <div
                        className={`max-w-md p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-2xs ${
                          isAdminMsg
                            ? 'bg-[#143E27] text-white rounded-br-xs'
                            : 'bg-white text-gray-800 border border-gray-200 rounded-bl-xs'
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

            {/* Reply Input Bar */}
            <form onSubmit={handleSendReply} className="p-3.5 border-t border-gray-200 bg-white flex items-center gap-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="উত্তর লিখুন..."
                disabled={sending}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#143E27] bg-gray-50/50"
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
          <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-400 space-y-2">
            <MessageCircle className="w-12 h-12 text-gray-300" />
            <h4 className="font-bold text-gray-700 text-sm">কোনো চ্যাট নির্বাচিত নেই</h4>
            <p className="text-xs">বাম পাশের তালিকা থেকে একটি কথোপকথন নির্বাচন করুন।</p>
          </div>
        )}
      </div>
    </div>
  );
};
