import { collection, doc, getDocs, setDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase/config';
import { EventNotification } from '../types';

const NOTIFICATIONS_STORAGE_KEY = 'sherpur_event_notifications_v1';
const READ_NOTIFICATION_IDS_KEY = 'sherpur_read_notification_ids';

export const INITIAL_NOTIFICATIONS: EventNotification[] = [
  {
    id: 'wangala-nalitabari-2026',
    title: 'বারমারীতে গারো সম্প্রদায়ের ঐতিহ্যবাহী ওয়ানগালা (Wanggala) উৎসব ও মেলা',
    message: 'গারো সম্প্রদায়ের শস্য ও সূর্যদেবতা মিসি সালজং-এর প্রতি কৃতজ্ঞতা প্রকাশের সর্ববৃহৎ মহোৎসব ওয়ানগালা। ঐতিহ্যবাহী দকমান্দা পোশাক, ক্রাম (ঢোল) ও মহিষের শিঙার সুরে আদিবাসী নৃত্য, পাহাড়ি রকমারি খাবার ও লোকজ পণ্য প্রদর্শনীর মেলা বসবে।',
    category: 'festival',
    upazilaId: 'nalitabari',
    location: 'বারমারী সাধু লিওর ধর্মপল্লী ও মধুটিলা সন্নিহিত মাঠ, নালিতাবাড়ী',
    startDate: '২০২৬-১১-২০',
    endDate: '২০২৬-১১-২২',
    isBigEvent: true,
    isActive: true,
    createdAt: '2026-03-01T10:00:00Z',
    createdBy: 'sabbir',
  },
  {
    id: 'modhutila-winter-fest-2026',
    title: 'মধুটিলা ইকোপার্কে শীতকালীন পর্যটন উৎসব ও পাহাড়ি মেলা',
    message: 'শীত মৌসুমে দেশি-বিদেশি পর্যটকদের সুবিধার্থে শেরপুর জেলা প্রশাসন ও বন বিভাগের উদ্যোগে বিশেষ পর্যটন উৎসব। ওয়াচ টাওয়ার, লেক ও পাহাড়জুড়ে বিশেষ নিরাপত্তা ব্যবস্থা এবং স্থানীয় আদিবাসী হস্তশিল্পের স্টল স্থাপন।',
    category: 'festival',
    upazilaId: 'nalitabari',
    location: 'মধুটিলা ইকোপার্ক প্রাঙ্গণ, পোড়াগাঁও, নালিতাবাড়ী',
    startDate: '২০২৬-১২-১৫',
    endDate: '২০২৬-১২-২৫',
    isBigEvent: true,
    isActive: true,
    createdAt: '2026-03-05T08:00:00Z',
    createdBy: 'sabbir',
  },
  {
    id: 'ghajni-spring-fair-2026',
    title: 'গজনী অবকাশে বসন্তবরণ ও গারো-হাজং লোকজ মেলা',
    message: 'গারো পাহাড়ের সবুজ উপত্যকায় ঋতুরাজ বসন্তকে বরণ করে নিতে ৩ দিনব্যাপী বর্ণাঢ্য সাংস্কৃতিক আয়োজন। ক্ষুদ্র নৃগোষ্ঠীর ঐতিহ্যবাহী নৃত্যগীত, ঝুলন্ত সেতু ও পাতালপুরী ঘিরে দর্শনার্থীদের মিলনমেলা।',
    category: 'fair',
    upazilaId: 'jhinaigati',
    location: 'গজনী অবকাশ পর্যটন কেন্দ্র, ঝিনাইগাতী, শেরপুর',
    startDate: '২০২৬-০২-১৩',
    endDate: '২০২৬-০২-১৫',
    isBigEvent: true,
    isActive: true,
    createdAt: '2026-02-01T10:00:00Z',
    createdBy: 'sabbir',
  },
  {
    id: 'sadar-boishakhi-fair-2026',
    title: 'শেরপুর ডিসি পার্ক ও পৌর চত্বরে বৈশাখী মেলা ও সাংস্কৃতিক সন্ধ্যা',
    message: 'বাংলা নববর্ষকে স্বাগত জানিয়ে শেরপুর জেলা শিল্পকলা ও স্থানীয় প্রশাসনের আয়োজনে বর্ণাঢ্য মঙ্গল শোভাযাত্রা, লোকজ চারু ও কারুমেলা, জারি-সারি ও লালনগীতি পরিবেশন।',
    category: 'event',
    upazilaId: 'sherpur-sadar',
    location: 'ডিসি পার্ক ও পৌর পার্ক, শেরপুর জেলা সদর',
    startDate: '২০২৬-০৪-১৪',
    endDate: '২০২৬-০৪-১৬',
    isBigEvent: false,
    isActive: true,
    createdAt: '2026-03-10T12:00:00Z',
    createdBy: 'sabbir',
  },
  {
    id: 'nakla-boat-race-2026',
    title: 'নকলা কায়দা বিলে ঐতিহ্যবাহী নৌকা বাইচ প্রতিযোগিতা ও গ্রামীণ মেলা',
    message: 'শরতের শান্ত জলে শেরপুরের প্রাচীন ঐতিহ্যবাহী সুসজ্জিত নৌকা বাইচ প্রতিযোগিতা। দূর-দূরান্ত থেকে আসা শত শত মাঝিমাল্লার ছন্দময় বৈঠা আর হাজারো দর্শকের বাঁধভাঙা উল্লাস। তীরে বসবে মণ্ডা-মিঠাই ও লোকশিল্পের মেলা।',
    category: 'fair',
    upazilaId: 'nakla',
    location: 'কায়দা বিল ও ভোগাই নদীর মোহনা, নকলা, শেরপুর',
    startDate: '২০২৬-০৯-২০',
    endDate: '২০২৬-০৯-২১',
    isBigEvent: false,
    isActive: true,
    createdAt: '2026-03-12T09:00:00Z',
    createdBy: 'sabbir',
  },
  {
    id: 'sreebardi-handicrafts-fair-2026',
    title: 'শ্রীবরদী বালিজুড়ী ও রাজার পাহাড়ে তাঁতশিল্প ও পাহাড়ি ফল মেলা',
    message: 'পাহাড়ের কৃষকদের উৎপাদিত তাজা ফলমূল, আদিবাসী তাঁতবস্ত্র এবং বাঁশ-বেতের বিশেষ কারুশিল্প সামগ্রী নিয়ে বিশেষ প্রদর্শনী ও বিপণন মেলা।',
    category: 'event',
    upazilaId: 'sreebardi',
    location: 'বালিজুড়ী রেঞ্জ মাঠ ও রাজার পাহাড়, শ্রীবরদী',
    startDate: '২০২৬-০৫-১০',
    endDate: '২০২৬-০৫-১২',
    isBigEvent: false,
    isActive: true,
    createdAt: '2026-03-15T11:00:00Z',
    createdBy: 'sabbir',
  },
];

export async function getNotifications(activeOnly = true): Promise<EventNotification[]> {
  try {
    if (db) {
      const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const list = snapshot.docs.map((docSnap) => ({
          ...docSnap.data(),
          id: docSnap.id,
        })) as EventNotification[];
        // Sync to local cache
        localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(list));
        return activeOnly ? list.filter((n) => n.isActive) : list;
      }
    }
  } catch (err) {
    console.warn('Firestore fetch notifications failed, falling back to local:', err);
  }

  // Fallback to localStorage
  const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
  if (stored) {
    try {
      const list = JSON.parse(stored) as EventNotification[];
      return activeOnly ? list.filter((n) => n.isActive) : list;
    } catch {
      // ignore
    }
  }

  // Default seed data
  localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(INITIAL_NOTIFICATIONS));
  return activeOnly ? INITIAL_NOTIFICATIONS.filter((n) => n.isActive) : INITIAL_NOTIFICATIONS;
}

export async function saveNotification(
  data: Omit<EventNotification, 'id' | 'createdAt'> & { id?: string; createdAt?: string }
): Promise<EventNotification> {
  const id = data.id || `event-${Date.now()}`;
  const now = data.createdAt || new Date().toISOString();

  const item: EventNotification = {
    ...data,
    id,
    createdAt: now,
  };

  try {
    if (db) {
      await setDoc(doc(db, 'notifications', id), item, { merge: true });
    }
  } catch (err) {
    console.warn('Firestore save notification failed, saving locally:', err);
  }

  // Update local storage
  const current = await getNotifications(false);
  const index = current.findIndex((n) => n.id === id);
  if (index >= 0) {
    current[index] = item;
  } else {
    current.unshift(item);
  }
  localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(current));

  // Trigger browser push notification if enabled and it's a big event
  if (item.isBigEvent && item.isActive) {
    showBrowserNotification(`🎉 নতুন উৎসব: ${item.title}`, item.message);
  }

  return item;
}

export async function deleteNotification(id: string): Promise<void> {
  try {
    if (db) {
      await deleteDoc(doc(db, 'notifications', id));
    }
  } catch (err) {
    console.warn('Firestore delete notification failed:', err);
  }

  const current = await getNotifications(false);
  const filtered = current.filter((n) => n.id !== id);
  localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(filtered));
}

// Unread tracking
export function getReadNotificationIds(): string[] {
  try {
    const raw = localStorage.getItem(READ_NOTIFICATION_IDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function markNotificationAsRead(id: string): void {
  const current = getReadNotificationIds();
  if (!current.includes(id)) {
    current.push(id);
    localStorage.setItem(READ_NOTIFICATION_IDS_KEY, JSON.stringify(current));
  }
}

export function markAllNotificationsAsRead(ids: string[]): void {
  const current = new Set(getReadNotificationIds());
  ids.forEach((id) => current.add(id));
  localStorage.setItem(READ_NOTIFICATION_IDS_KEY, JSON.stringify(Array.from(current)));
}

// Browser Push Notification integration
export async function requestBrowserNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (e) {
    console.warn('Notification permission request error:', e);
    return false;
  }
}

export function isBrowserNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getBrowserNotificationPermission(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

export function showBrowserNotification(title: string, body: string, icon = '/icons/icon-192.png'): void {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon,
        badge: icon,
      });
    } catch (e) {
      console.warn('Failed to display browser notification:', e);
    }
  }
}
