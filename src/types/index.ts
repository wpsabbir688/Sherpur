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
  createdBy?: string;
  updatedBy?: string;
  authorName?: string;
  authorRole?: string;
  authorAvatar?: string;
  authorBio?: string;
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

// Analytics Types
export type AnalyticsEventType =
  | 'page_view'
  | 'destination_view'
  | 'destination_search'
  | 'category_filter'
  | 'upazila_filter'
  | 'contact_click'
  | 'map_link_click'
  | 'share_click';

export type TrafficSource = 'Direct' | 'Search' | 'Social' | 'Referral' | 'Unknown';
export type DeviceCategory = 'Mobile' | 'Desktop' | 'Tablet';

export interface AnalyticsEvent {
  id: string;
  eventType: AnalyticsEventType;
  pagePath: string;
  destinationId?: string;
  timestamp: string; // ISO string in UTC
  visitorId: string;
  sessionId: string;
  device: DeviceCategory;
  source: TrafficSource;
  metadata?: Record<string, any>;
}

export type DateRangePreset =
  | 'today'
  | '24h'
  | '7d'
  | '30d'
  | '90d'
  | 'custom';

export interface DateRangeFilter {
  preset: DateRangePreset;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}

export interface AnalyticsSummaryMetrics {
  liveVisitorsNow: number;
  uniqueUsers24h: number;
  uniqueUsers7d: number;
  uniqueUsers30d: number;
  totalPageViews: number;
  totalPublishedPlaces: number;
  placesAddedInPeriod: number;
  totalTeamMembers: number;
  // Period comparisons
  periodPageViews: number;
  prevPeriodPageViews: number;
  periodUniqueUsers: number;
  prevPeriodUniqueUsers: number;
  pageViewsChangePercent: number | null;
  uniqueUsersChangePercent: number | null;
}

export interface TrafficDataPoint {
  label: string; // e.g. "12:00", "19 Oct"
  dateKey: string;
  pageViews: number;
  uniqueVisitors: number;
  sessions: number;
}

export interface PageRankItem {
  path: string;
  title: string;
  views: number;
  uniqueVisitors: number;
  percentage: number;
}

export interface DestinationRankItem {
  id: string;
  slug: string;
  titleBn: string;
  upazilaName: string;
  views: number;
  percentage: number;
}

export interface TrafficSourceItem {
  source: TrafficSource;
  count: number;
  percentage: number;
}

export interface DeviceBreakdownItem {
  device: DeviceCategory;
  count: number;
  percentage: number;
}

// Team Member Types
export type TeamRole = 'superadmin' | 'admin' | 'editor' | 'contributor';
export type AccountStatus = 'active' | 'inactive';

export interface TeamMember {
  id: string;
  username: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  title: string;
  bio?: string;
  role: TeamRole;
  status: AccountStatus;
  avatarUrl?: string;
  email?: string;
  phone?: string;
  joinedDate: string;
  lastActive?: string;
  placesCreated: number;
  placesUpdated: number;
  isPrimaryOwner?: boolean;
}

// Admin Profile Types
export interface AdminProfile {
  id: string; // username
  username: string;
  fullName: string;
  firstName: string;
  lastName: string;
  title: string;
  bio: string;
  email: string;
  phone: string;
  location: string;
  avatarUrl: string;
  socialLinks?: {
    facebook?: string;
    linkedin?: string;
    website?: string;
    github?: string;
  };
  updatedAt: string;
}

