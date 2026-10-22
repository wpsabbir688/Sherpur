import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  onSnapshot,
  increment,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../lib/firebase/config';
import { ChatConversation, ChatMessage, ChatConversationStatus } from '../types/community';

const CONVERSATIONS_COL = 'chat_conversations';
const MESSAGES_COL = 'chat_messages';

/**
 * Initial Realistic Seed Conversations & Chat History
 */
export const INITIAL_SEED_CONVERSATIONS: {
  conv: ChatConversation;
  messages: ChatMessage[];
}[] = [
  {
    conv: {
      id: 'conv_traveler_tanvir',
      visitorId: 'visitor_tanvir_dhaka',
      userId: 'user_tanvir_dhaka',
      userName: 'তানভীর মাহমুদ (ঢাকা)',
      userEmail: 'tanvir.traveler@gmail.com',
      isGuest: false,
      status: 'answered',
      lastMessage: 'অ্যাডমিন: শেরপুর সদরে হোটেল আল-শান ও হোটেল আরপি বেশ পরিচ্ছন্ন ও ফ্যামিলি ফ্রেন্ডলি।',
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      unreadByAdminCount: 0,
      unreadByUserCount: 0,
      assignedAdminName: 'মো. সাব্বির হোসেন',
      createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    },
    messages: [
      {
        id: 'msg_tanvir_1',
        conversationId: 'conv_traveler_tanvir',
        senderType: 'user',
        senderName: 'তানভীর মাহমুদ',
        text: 'আসসালামু আলাইকুম। মহাখালী থেকে শেরপুরের বাস ভোর কয়টায় ছাড়ে? আর আমরা পরিবারসহ মধুটিলা ইকোপার্কে যেতে চাচ্ছি।',
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        status: 'read',
      },
      {
        id: 'msg_tanvir_2',
        conversationId: 'conv_traveler_tanvir',
        senderType: 'admin',
        senderName: 'মো. সাব্বির হোসেন',
        senderRole: 'Super Admin',
        text: 'ওয়ালাইকুম আসসালাম তানভীর ভাই! মহাখালী থেকে ভোর ৬টা থেকে প্রতি আধা ঘণ্টা পর পর ড্রিমল্যান্ড ও তুরাগ বাস ছাড়ে। পরিবার নিয়ে মধুটিলা ভ্রমণ খুবই চমৎকার হবে। শেরপুর নেমে সিএনজি নিয়ে সরাসরি ইকোপার্কে যেতে পারবেন।',
        timestamp: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
        status: 'read',
      },
      {
        id: 'msg_tanvir_3',
        conversationId: 'conv_traveler_tanvir',
        senderType: 'user',
        senderName: 'তানভীর মাহমুদ',
        text: 'ধন্যবাদ! রাতে থাকার মতো কোনো ভালো রিসোর্ট বা হোটেল আছে কি?',
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        status: 'read',
      },
      {
        id: 'msg_tanvir_4',
        conversationId: 'conv_traveler_tanvir',
        senderType: 'admin',
        senderName: 'মো. সাব্বির হোসেন',
        senderRole: 'Super Admin',
        text: 'শেরপুর সদরে হোটেল আল-শান ও হোটেল আরপি বেশ পরিচ্ছন্ন ও ফ্যামিলি ফ্রেন্ডলি। অগ্রিম বুকিং ছাড়াও সহজে রুম পাওয়া যায়।',
        timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
        status: 'read',
      },
    ],
  },
  {
    conv: {
      id: 'conv_traveler_sumaiya',
      visitorId: 'visitor_sumaiya_mym',
      userId: 'user_sumaiya_mym',
      userName: 'সুমাইয়া জাহান (ময়মনসিংহ)',
      userEmail: 'sumaiya.jahan@gmail.com',
      isGuest: true,
      status: 'pending',
      lastMessage: 'গজনী অবকাশ কেন্দ্রের ওয়াচ টাওয়ার এবং ঝুলন্ত ব্রিজ কি বর্তমানে উন্মুক্ত আছে?',
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      unreadByAdminCount: 1,
      unreadByUserCount: 0,
      createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    },
    messages: [
      {
        id: 'msg_sumaiya_1',
        conversationId: 'conv_traveler_sumaiya',
        senderType: 'user',
        senderName: 'সুমাইয়া জাহান',
        text: 'গজনী অবকাশ কেন্দ্রের ওয়াচ টাওয়ার এবং ঝুলন্ত ব্রিজ কি বর্তমানে উন্মুক্ত আছে?',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        status: 'delivered',
      },
    ],
  },
  {
    conv: {
      id: 'conv_traveler_rakibul',
      visitorId: 'visitor_rakibul_syl',
      userName: 'রাকিবুল হাসান (সিলেট)',
      isGuest: true,
      status: 'open',
      lastMessage: 'আমরা ১০ জনের একটি গ্রুপ নিয়ে ঝিনাইগাতীর রাংটিয়া ও গারো পাহাড়ে ট্র্যাকিং করতে চাই। স্থানীয় গাইডের হেল্পলাইন প্রয়োজন।',
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
      unreadByAdminCount: 1,
      unreadByUserCount: 0,
      createdAt: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
    },
    messages: [
      {
        id: 'msg_rakibul_1',
        conversationId: 'conv_traveler_rakibul',
        senderType: 'user',
        senderName: 'রাকিবুল হাসান',
        text: 'আমরা ১০ জনের একটি গ্রুপ নিয়ে ঝিনাইগাতীর রাংটিয়া ও গারো পাহাড়ে ট্র্যাকিং করতে চাই। স্থানীয় গাইডের হেল্পলাইন প্রয়োজন।',
        timestamp: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
        status: 'delivered',
      },
    ],
  },
  {
    conv: {
      id: 'conv_traveler_farhana',
      visitorId: 'visitor_farhana_uttara',
      userName: 'ফারহানা আক্তার (উত্তরা)',
      isGuest: true,
      status: 'closed',
      lastMessage: 'অ্যাডমিন: মধুটিলা ইকোপার্কে কৃত্রিম হ্রদে প্যাডেল বোট, ওয়াচ টাওয়ার এবং শিশুদের খেলার পার্ক রয়েছে।',
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      unreadByAdminCount: 0,
      unreadByUserCount: 0,
      assignedAdminName: 'মো. সাব্বির হোসেন',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
    messages: [
      {
        id: 'msg_farhana_1',
        conversationId: 'conv_traveler_farhana',
        senderType: 'user',
        senderName: 'ফারহানা আক্তার',
        text: 'নালিতাবাড়ীর মধুটিলা ইকোপার্কে ছোট শিশুদের জন্য কী কী রাইড রয়েছে?',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
        status: 'read',
      },
      {
        id: 'msg_farhana_2',
        conversationId: 'conv_traveler_farhana',
        senderType: 'admin',
        senderName: 'মো. সাব্বির হোসেন',
        senderRole: 'Super Admin',
        text: 'মধুটিলা ইকোপার্কে কৃত্রিম হ্রদে প্যাডেল বোট, ওয়াচ টাওয়ার এবং শিশুদের খেলার পার্ক রয়েছে। নিরাপত্তা অনেক ভালো।',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        status: 'read',
      },
    ],
  },
];

/**
 * Verified knowledge base auto-replies for instant traveler assistance
 */
export function getSmartAutoReply(userText: string): string | null {
  const t = userText.toLowerCase();
  if (
    t.includes('ঢাকা') ||
    t.includes('যাব') ||
    t.includes('যাতায়াত') ||
    t.includes('যাতায়াত') ||
    t.includes('বাস') ||
    t.includes('ভাড়া') ||
    t.includes('ভাড়া') ||
    t.includes('মহাখালী')
  ) {
    return '🚌 ঢাকা থেকে যাতায়াত: মহাখালী বাস টার্মিনাল থেকে ড্রিমল্যান্ড, তুরাগ বা অন্যান্য বাসে সরাসরি শেরপুর সদর বাসস্ট্যান্ডে পৌঁছানো যায় (ভাড়া ২৫০-৩৫০ টাকা, সময় ৪-৫ ঘণ্টা)। এরপর শেরপুর সদর থেকে সিএনজি বা মাহিন্দ্রাযোগে সহজেই নালিতাবাড়ী, ঝিনাইগাতী বা গারো পাহাড় যাওয়া যায়।';
  }
  if (
    t.includes('মধুটিলা') ||
    t.includes('গজনী') ||
    t.includes('পাহাড়') ||
    t.includes('পাহাড়') ||
    t.includes('কোনটি') ||
    t.includes('কোনটা') ||
    t.includes('ইকোপার্ক')
  ) {
    return '🌲 মধুটিলা ও গজনী অবকাশ: মধুটিলা ইকোপার্ক নালিতাবাড়ীতে এবং গজনী অবকাশ কেন্দ্র ঝিনাইগাতী উপজেলায় অবস্থিত। পরিবার ও শিশুদের নিয়ে পিকনিক, কৃত্রিম হ্রদে বোটিং ও মেঘালয়ের সবুজ পাহাড় দেখার জন্য দুটোই চমৎকার। সকাল ৮টা থেকে বিকেল ৫টা পর্যন্ত ভ্রমণ করা সবচেয়ে নিরাপদ ও মনোরম।';
  }
  if (
    t.includes('হোটেল') ||
    t.includes('রিসোর্ট') ||
    t.includes('থাকা') ||
    t.includes('থাকব') ||
    t.includes('রাত') ||
    t.includes('আবাসিক')
  ) {
    return '🏨 থাকার ব্যবস্থা: শেরপুর জেলা সদরে হোটেল আল-শান, হোটেল আরপি, কাকলী ও রজনীগন্ধাসহ পরিচ্ছন্ন মানসম্মত আবাসিক হোটেল রয়েছে। এছাড়া সীমান্ত এলাকায় বনবিভাগের কিছু রেস্টহাউস রয়েছে (প্রশাসনিক পূর্বানুমতি সাপেক্ষে)।';
  }
  if (
    t.includes('জরুরি') ||
    t.includes('হেল্প') ||
    t.includes('ফোন') ||
    t.includes('নম্বর') ||
    t.includes('নাম্বার') ||
    t.includes('গাইড') ||
    t.includes('যোগাযোগ')
  ) {
    return '📞 পর্যটন হেল্পলাইন: জরুরি তথ্য, ট্যুর গাইড বা সহায়তার জন্য আমাদের প্রতিনিধির সাথে সরাসরি কথা বলতে পারেন: +৮৮০১৯৪৪৪৬০৩৪৪ অথবা ইমেইল: wpsabbir44@gmail.com।';
  }
  return null;
}

/**
 * Seeds initial conversations and messages into Firestore and local storage if empty
 */
export async function seedInitialChatData(): Promise<void> {
  for (const item of INITIAL_SEED_CONVERSATIONS) {
    try {
      await setDoc(doc(db, CONVERSATIONS_COL, item.conv.id), item.conv, { merge: true });
      for (const m of item.messages) {
        await setDoc(doc(db, MESSAGES_COL, m.id), m, { merge: true });
      }
      localStorage.setItem(`sherpur_msgs_${item.conv.id}`, JSON.stringify(item.messages));
    } catch (e) {
      console.warn('Seed chat item:', e);
    }
  }
  const convs = INITIAL_SEED_CONVERSATIONS.map((i) => i.conv);
  localStorage.setItem('sherpur_admin_all_convs', JSON.stringify(convs));
}

/**
 * Gets or creates a conversation for a visitor (logged-in user or guest session)
 */
export async function getOrCreateConversation(
  visitorId: string,
  userMeta: {
    userId?: string;
    userName: string;
    userEmail?: string;
    userAvatar?: string;
    isGuest: boolean;
  }
): Promise<ChatConversation> {
  const cleanVid = visitorId.replace(/[^a-zA-Z0-9_-]/g, '_');
  const convId = `conv_${cleanVid}`;
  const convRef = doc(db, CONVERSATIONS_COL, convId);
  const cacheKey = `sherpur_conv_${convId}`;

  // Check local cache first
  const cached = localStorage.getItem(cacheKey);
  let localConv: ChatConversation | null = null;
  if (cached) {
    try {
      localConv = JSON.parse(cached);
    } catch {}
  }

  const newConv: ChatConversation = {
    id: convId,
    visitorId,
    userId: userMeta.userId,
    userName: userMeta.userName || 'ভ্রমণকারী অতিথি',
    userEmail: userMeta.userEmail,
    userAvatar: userMeta.userAvatar,
    isGuest: userMeta.isGuest,
    status: localConv?.status || 'open',
    lastMessage: localConv?.lastMessage || 'কথোপকথন শুরু হয়েছে',
    lastMessageTime: localConv?.lastMessageTime || new Date().toISOString(),
    unreadByAdminCount: localConv?.unreadByAdminCount || 0,
    unreadByUserCount: localConv?.unreadByUserCount || 0,
    createdAt: localConv?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    const snap = await getDoc(convRef);
    if (snap.exists()) {
      const data = snap.data() as ChatConversation;
      if (userMeta.userName && userMeta.userName !== data.userName) {
        await setDoc(
          convRef,
          {
            userName: userMeta.userName,
            userAvatar: userMeta.userAvatar || data.userAvatar,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        ).catch(() => {});
      }
      localStorage.setItem(cacheKey, JSON.stringify(data));
      return data;
    } else {
      await setDoc(convRef, newConv, { merge: true });
    }
  } catch (err) {
    console.warn('Firestore conversation sync using local state:', err);
  }

  localStorage.setItem(cacheKey, JSON.stringify(newConv));
  return newConv;
}

/**
 * Subscribes to real-time messages for a specific conversation thread
 */
export function subscribeToMessages(
  conversationId: string,
  onUpdate: (messages: ChatMessage[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  if (!conversationId) return () => {};
  const cacheKey = `sherpur_msgs_${conversationId}`;

  try {
    const q = query(
      collection(db, MESSAGES_COL),
      where('conversationId', '==', conversationId)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const msgs: ChatMessage[] = [];
        snapshot.forEach((d) => {
          msgs.push({ id: d.id, ...d.data() } as ChatMessage);
        });
        if (msgs.length > 0) {
          msgs.sort((a, b) => {
            const tA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
            const tB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
            return tA - tB;
          });
          try {
            localStorage.setItem(cacheKey, JSON.stringify(msgs));
          } catch {}
          onUpdate(msgs);
        } else {
          // If empty in firestore, check seed
          const seed = INITIAL_SEED_CONVERSATIONS.find((s) => s.conv.id === conversationId);
          if (seed) {
            onUpdate(seed.messages);
          }
        }
      },
      (error) => {
        console.warn('Firestore onSnapshot error for messages:', error);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.warn('Error creating messages subscription:', err);
    return () => {};
  }
}

/**
 * User / Guest sends a message to the Admin team
 */
export async function sendUserMessage(
  conversationId: string,
  text: string,
  senderInfo: {
    senderId?: string;
    senderName: string;
  }
): Promise<ChatMessage> {
  const msgId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const message: ChatMessage = {
    id: msgId,
    conversationId,
    senderType: 'user',
    senderId: senderInfo.senderId,
    senderName: senderInfo.senderName || 'ভ্রমণকারী',
    text: text.trim(),
    timestamp: new Date().toISOString(),
    status: 'sent',
  };

  // Cache message locally immediately
  const cacheKey = `sherpur_msgs_${conversationId}`;
  try {
    const existing: ChatMessage[] = JSON.parse(localStorage.getItem(cacheKey) || '[]');
    if (!existing.some((m) => m.id === msgId)) {
      existing.push(message);
      localStorage.setItem(cacheKey, JSON.stringify(existing));
    }
  } catch {}

  // Write to Firestore with setDoc merge
  try {
    await setDoc(doc(db, MESSAGES_COL, msgId), message);
    await setDoc(
      doc(db, CONVERSATIONS_COL, conversationId),
      {
        id: conversationId,
        lastMessage: text.trim().slice(0, 100),
        lastMessageTime: message.timestamp,
        unreadByAdminCount: increment(1),
        status: 'pending',
        updatedAt: message.timestamp,
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Could not save message to Firestore, stored in local cache:', err);
  }

  // Check for verified instant smart auto-reply
  const autoAnswer = getSmartAutoReply(text);
  if (autoAnswer) {
    setTimeout(async () => {
      try {
        const autoMsgId = `msg_${Date.now()}_desk_auto`;
        const autoReply: ChatMessage = {
          id: autoMsgId,
          conversationId,
          senderType: 'admin',
          senderName: 'শেরপুর ভ্রমণ ডেস্ক (স্বয়ংক্রিয়)',
          senderRole: 'তথ্য সহায়িকা',
          text: autoAnswer,
          timestamp: new Date().toISOString(),
          status: 'delivered',
        };

        // Cache locally
        try {
          const cachedMsgs: ChatMessage[] = JSON.parse(localStorage.getItem(cacheKey) || '[]');
          if (!cachedMsgs.some((m) => m.id === autoMsgId)) {
            cachedMsgs.push(autoReply);
            localStorage.setItem(cacheKey, JSON.stringify(cachedMsgs));
          }
        } catch {}

        await setDoc(doc(db, MESSAGES_COL, autoMsgId), autoReply);
        await setDoc(
          doc(db, CONVERSATIONS_COL, conversationId),
          {
            lastMessage: `ডেস্ক: ${autoAnswer.slice(0, 80)}`,
            lastMessageTime: autoReply.timestamp,
            unreadByUserCount: increment(1),
            status: 'answered',
            updatedAt: autoReply.timestamp,
          },
          { merge: true }
        );
      } catch (e) {
        console.warn('Error saving auto reply:', e);
      }
    }, 600);
  }

  return message;
}

/**
 * Admin sends a reply to the user in a conversation
 */
export async function sendAdminReply(
  conversationId: string,
  text: string,
  adminName: string,
  adminRole: string
): Promise<ChatMessage> {
  const msgId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const message: ChatMessage = {
    id: msgId,
    conversationId,
    senderType: 'admin',
    senderName: adminName || 'অ্যাডমিন প্রতিনিধি',
    senderRole: adminRole || 'Admin',
    text: text.trim(),
    timestamp: new Date().toISOString(),
    status: 'sent',
  };

  // Cache locally immediately
  const cacheKey = `sherpur_msgs_${conversationId}`;
  try {
    const existing: ChatMessage[] = JSON.parse(localStorage.getItem(cacheKey) || '[]');
    if (!existing.some((m) => m.id === msgId)) {
      existing.push(message);
      localStorage.setItem(cacheKey, JSON.stringify(existing));
    }
  } catch {}

  try {
    await setDoc(doc(db, MESSAGES_COL, msgId), message);
    await setDoc(
      doc(db, CONVERSATIONS_COL, conversationId),
      {
        id: conversationId,
        lastMessage: `অ্যাডমিন: ${text.trim().slice(0, 80)}`,
        lastMessageTime: message.timestamp,
        unreadByUserCount: increment(1),
        unreadByAdminCount: 0,
        assignedAdminName: adminName,
        status: 'answered',
        updatedAt: message.timestamp,
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Could not save admin reply to Firestore:', err);
  }

  return message;
}

/**
 * Subscribes to all conversations for the Admin Chat Inbox
 */
export function subscribeToAllConversations(
  onUpdate: (conversations: ChatConversation[]) => void
): Unsubscribe {
  const cacheKey = 'sherpur_admin_all_convs';

  try {
    const colRef = collection(db, CONVERSATIONS_COL);
    return onSnapshot(
      colRef,
      (snapshot) => {
        if (snapshot.empty) {
          seedInitialChatData().catch(() => {});
          const seedConvs = INITIAL_SEED_CONVERSATIONS.map((i) => i.conv);
          onUpdate(seedConvs);
          return;
        }

        const list: ChatConversation[] = [];
        snapshot.forEach((d) => {
          list.push({ id: d.id, ...d.data() } as ChatConversation);
        });
        list.sort((a, b) => {
          const tA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
          const tB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
          return tB - tA;
        });
        try {
          localStorage.setItem(cacheKey, JSON.stringify(list));
        } catch {}
        onUpdate(list);
      },
      (err) => {
        console.warn('Error listening to all conversations:', err);
      }
    );
  } catch {
    return () => {};
  }
}

/**
 * Update conversation status (open, pending, answered, closed)
 */
export async function updateConversationStatus(
  conversationId: string,
  status: ChatConversationStatus
): Promise<void> {
  try {
    await setDoc(
      doc(db, CONVERSATIONS_COL, conversationId),
      {
        status,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.error('Error updating conversation status:', err);
  }
}

/**
 * Mark messages as read by user
 */
export async function markConversationAsReadByUser(conversationId: string): Promise<void> {
  try {
    await setDoc(
      doc(db, CONVERSATIONS_COL, conversationId),
      {
        unreadByUserCount: 0,
      },
      { merge: true }
    );
  } catch {}
}

/**
 * Mark messages as read by admin
 */
export async function markConversationAsReadByAdmin(conversationId: string): Promise<void> {
  try {
    await setDoc(
      doc(db, CONVERSATIONS_COL, conversationId),
      {
        unreadByAdminCount: 0,
      },
      { merge: true }
    );
  } catch {}
}
