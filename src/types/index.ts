export type UpazilaId = 'sherpur-sadar' | 'nalitabari' | 'jhinaigati' | 'sreebardi' | 'nakla';

export interface UpazilaInfo {
  id: UpazilaId;
  nameBn: string;
  nameEn: string;
  headlineBn: string;
  descriptionBn: string;
  hqBn: string;
  popularForBn: string;
}

export interface Category {
  id: string;
  nameBn: string;
  nameEn: string;
  slug: string;
  descriptionBn: string;
  icon: string;
  order: number;
}

export interface DestinationGalleryItem {
  url: string;
  alt: string;
  caption?: string;
}

export interface Destination {
  id: string;
  titleBn: string;
  titleEn?: string;
  slug: string;
  summaryBn: string;
  descriptionBn: string;
  upazilaId: UpazilaId;
  categoryIds: string[];
  coverImage: string;
  coverImageAlt: string;
  gallery?: DestinationGalleryItem[];
  locationName: string;
  latitude?: number | null;
  longitude?: number | null;
  googleMapsUrl?: string;
  howToGetThereBn?: string;
  bestSeasonBn?: string;
  openingHours?: string;
  entryFee?: string;
  travelTipsBn?: string;
  accessibilityNotesBn?: string;
  safetyNotesBn?: string;
  nearbyDestinationIds?: string[];
  sourceUrls?: string[];
  lastVerifiedAt: string;
  seoTitle?: string;
  seoDescription?: string;
  status: 'draft' | 'published';
  isFeatured: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  createdAt: string;
  status?: 'unread' | 'read';
}

export interface AdminUser {
  id: string;
  username: string;
  name: string;
  password?: string;
  role: 'superadmin' | 'editor';
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface TravelArticle {
  id: string;
  titleBn: string;
  slug: string;
  summaryBn: string;
  contentBn: string;
  coverImage: string;
  categoryBn: string;
  readTimeBn: string;
  publishedAt: string;
  authorBn: string;
}

export type NotificationCategory = 'festival' | 'event' | 'fair' | 'notice' | 'alert';

export interface EventNotification {
  id: string;
  title: string;
  message: string;
  category: NotificationCategory;
  upazilaId?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  isBigEvent?: boolean;
  isActive: boolean;
  actionUrl?: string;
  createdAt: string;
  createdBy?: string;
}

