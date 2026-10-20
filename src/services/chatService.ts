import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  increment,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../lib/firebase/config';
import { ChatConversation, ChatMessage, ChatConversationStatus } from '../types/community';

const CONVERSATIONS_COL = 'chat_conversations';
const MESSAGES_COL = 'chat_messages';

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
  const convId = `conv_${visitorId.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
  const convRef = doc(db, CONVERSATIONS_COL, convId);

  try {
    const snap = await getDoc(convRef);
    if (snap.exists()) {
      const data = snap.data() as ChatConversation;
      // Update with latest user details if changed
      if (userMeta.userName && userMeta.userName !== data.userName) {
        await updateDoc(convRef, {
          userName: userMeta.userName,
          userAvatar: userMeta.userAvatar || data.userAvatar,
          updatedAt: new Date().toISOString(),
        }).catch(() => {});
      }
      return data;
    }
  } catch (err) {
    console.warn('Error reading chat conversation:', err);
  }

  // Create new conversation
  const newConv: ChatConversation = {
    id: convId,
    visitorId,
    userId: userMeta.userId,
    userName: userMeta.userName || 'ভ্রমণকারী',
    userEmail: userMeta.userEmail,
    userAvatar: userMeta.userAvatar,
    isGuest: userMeta.isGuest,
    status: 'open',
    lastMessage: 'কথোপকথন শুরু হয়েছে',
    lastMessageTime: new Date().toISOString(),
    unreadByAdminCount: 0,
    unreadByUserCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    await setDoc(convRef, newConv);
  } catch (err) {
    console.warn('Could not save conversation to Firestore, holding in local state:', err);
  }

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
        // Sort chronologically
        msgs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        onUpdate(msgs);
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
    senderName: senderInfo.senderName,
    text: text.trim(),
    timestamp: new Date().toISOString(),
    status: 'sent',
  };

  try {
    await setDoc(doc(db, MESSAGES_COL, msgId), message);
    await updateDoc(doc(db, CONVERSATIONS_COL, conversationId), {
      lastMessage: text.trim().slice(0, 100),
      lastMessageTime: message.timestamp,
      unreadByAdminCount: increment(1),
      status: 'pending',
      updatedAt: message.timestamp,
    });
  } catch (err) {
    console.warn('Could not save message to Firestore:', err);
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

  try {
    await setDoc(doc(db, MESSAGES_COL, msgId), message);
    await updateDoc(doc(db, CONVERSATIONS_COL, conversationId), {
      lastMessage: `অ্যাডমিন: ${text.trim().slice(0, 80)}`,
      lastMessageTime: message.timestamp,
      unreadByUserCount: increment(1),
      unreadByAdminCount: 0,
      assignedAdminName: adminName,
      status: 'answered',
      updatedAt: message.timestamp,
    });
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
  try {
    const colRef = collection(db, CONVERSATIONS_COL);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const list: ChatConversation[] = [];
        snapshot.forEach((d) => {
          list.push({ id: d.id, ...d.data() } as ChatConversation);
        });
        // Sort by most recent message
        list.sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());
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
    await updateDoc(doc(db, CONVERSATIONS_COL, conversationId), {
      status,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Error updating conversation status:', err);
  }
}

/**
 * Mark messages as read by user
 */
export async function markConversationAsReadByUser(conversationId: string): Promise<void> {
  try {
    await updateDoc(doc(db, CONVERSATIONS_COL, conversationId), {
      unreadByUserCount: 0,
    });
  } catch {}
}

/**
 * Mark messages as read by admin
 */
export async function markConversationAsReadByAdmin(conversationId: string): Promise<void> {
  try {
    await updateDoc(doc(db, CONVERSATIONS_COL, conversationId), {
      unreadByAdminCount: 0,
    });
  } catch {}
}
