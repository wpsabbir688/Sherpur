import { UpazilaId } from './index';

export interface UserProfile {
  uid: string;
  displayName: string;
  username: string;
  email?: string;
  photoURL?: string;
  bio?: string;
  location?: string;
  interests?: string[];
  savedDestinationIds: string[];
  savedPostIds?: string[];
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isVerified?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatar?: string;
  authorRole?: string;
  caption: string;
  travelStory?: string;
  photos: string[];
  destinationId?: string;
  destinationTitle?: string;
  upazilaId?: UpazilaId;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  status: 'published' | 'hidden' | 'flagged';
  createdAt: string;
  updatedAt?: string;
}

export interface PostComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatar?: string;
  text: string;
  createdAt: string;
  status: 'published' | 'hidden';
}

export interface PostLike {
  id: string; // `${postId}_${userId}`
  postId: string;
  userId: string;
  createdAt: string;
}

export interface SavedItem {
  id: string; // `${userId}_${targetId}`
  userId: string;
  targetType: 'destination' | 'post';
  targetId: string;
  title: string;
  subtitle?: string;
  image?: string;
  slug?: string;
  createdAt: string;
}

export interface UserFollow {
  id: string; // `${followerId}_${followingId}`
  followerId: string;
  followingId: string;
  createdAt: string;
}

export type ChatConversationStatus = 'open' | 'pending' | 'answered' | 'closed';

export interface ChatConversation {
  id: string;
  visitorId: string;
  userId?: string;
  userName: string;
  userEmail?: string;
  userAvatar?: string;
  isGuest: boolean;
  status: ChatConversationStatus;
  lastMessage: string;
  lastMessageTime: string;
  unreadByAdminCount: number;
  unreadByUserCount: number;
  assignedAdminName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderType: 'user' | 'admin';
  senderId?: string;
  senderName: string;
  senderRole?: string;
  text: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}

export type ReportTargetType = 'post' | 'comment' | 'destination' | 'user';
export type ReportStatus = 'pending' | 'resolved' | 'dismissed';

export interface ContentReport {
  id: string;
  targetType: ReportTargetType;
  targetId: string;
  targetTitle?: string;
  reason: string;
  details?: string;
  reportedBy: string;
  reportedByName?: string;
  status: ReportStatus;
  createdAt: string;
  resolvedBy?: string;
  resolvedAt?: string;
  resolutionNotes?: string;
}

export type TravelStyle = 'family' | 'budget' | 'friends' | 'solo';

export interface TripPlanDay {
  day: number;
  title: string;
  destinationIds: string[];
  travelNotes: string;
  estimatedCost: number;
}

export interface TripPlan {
  id: string;
  title: string;
  description: string;
  durationDays: number;
  travelStyle: TravelStyle;
  estimatedBudgetTotal: number;
  destinationIds: string[];
  itineraryDays: TripPlanDay[];
  budgetBreakdown: {
    transport: number;
    accommodation: number;
    food: number;
    entryAndActivities: number;
    emergency: number;
  };
  highlights: string[];
  isCurated?: boolean;
  createdBy?: string;
  createdAt: string;
}
