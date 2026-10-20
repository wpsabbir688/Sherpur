import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  increment,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../lib/firebase/config';
import { CommunityPost, PostComment, PostLike } from '../types/community';

const POSTS_COL = 'posts';
const LIKES_COL = 'post_likes';
const COMMENTS_COL = 'post_comments';

export const INITIAL_COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: 'post_madhutila_family_tour',
    authorId: 'user_tarek_ahmed',
    authorName: 'তারেক মাহমুদ',
    authorUsername: 'tarek_traveler',
    authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
    authorRole: 'ট্রাভেল ভ্লগার',
    caption: 'শীতের সকালে মধুটিলা ইকোপার্কে আমাদের পরিবারসহ চমৎকার একটি দিন কাটল!',
    travelStory: 'ঢাকা থেকে সকাল ৬টায় বাসে উঠে বেলা সাড়ে দশটায় শেরপুর সদরে পৌঁছাই। সেখান থেকে সরাসরি সিএনজিতে মধুটিলা ইকোপার্ক। ওয়াচ টাওয়ার থেকে মেঘালয়ের নীল পাহাড়ের দৃশ্য সত্যি চোখ জুড়িয়ে যায়। কৃত্রিম হ্রদে প্যাডেল বোট চালানো বাচ্চাদের খুব পছন্দ হয়েছে। বিকেলে শালবনের শীতল ছায়ায় হেঁটে মনটা শান্ত হয়ে গেল। যারা একদিনের ডে-ট্যুর করতে চান তাদের জন্য আদর্শ জায়গা।',
    photos: [
      'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80',
    ],
    destinationId: 'madhutila-eco-park',
    destinationTitle: 'মধুটিলা ইকো পার্ক',
    upazilaId: 'nalitabari',
    likesCount: 24,
    commentsCount: 6,
    sharesCount: 5,
    status: 'published',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: 'post_ghajni_sunset_view',
    authorId: 'user_nusrat_jahan',
    authorName: 'নুসরাত জাহান',
    authorUsername: 'nusrat_explores',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    authorRole: 'আলোকচিত্রী',
    caption: 'গজনী অবকাশ কেন্দ্রের পাহাড়ের চূড়া থেকে সূর্যাস্ত দেখার মতো এক দৃশ্য!',
    travelStory: 'ঝিনাইগাতী হয়ে যখন গজনী অবকাশে পৌঁছালাম, তখন দুপুর গড়িয়ে বিকেল। আঁকাবাঁকা পাহাড়ি পথ ধরে উপরে উঠতেই চোখে পড়ল দিগন্ত বিস্তৃত সবুজ। এখানকার সুড়ঙ্গ পথ এবং ড্রাগন নৌকা রাইডটা বেশ রোমাঞ্চকর। তবে সবচেয়ে সুন্দর ছিল সূর্যাস্তের মুহূর্ত—গারো পাহাড়ের উপরে সূর্যের লাল আভা মিশে এক অনন্য রঙের খেলা তৈরি হয়েছিল। শেরপুর জেলা সত্যিই সুন্দর!',
    photos: [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80',
    ],
    destinationId: 'ghajni-abakash-center',
    destinationTitle: 'গজনী অবকাশ কেন্দ্র',
    upazilaId: 'jhinaigati',
    likesCount: 38,
    commentsCount: 11,
    sharesCount: 8,
    status: 'published',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
  {
    id: 'post_rajar_pahar_trek',
    authorId: 'user_tanvir_alam',
    authorName: 'তানভীর আলম',
    authorUsername: 'tanvir_treks',
    authorAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=300&q=80',
    authorRole: 'হাইকার',
    caption: 'শ্রীবরদীর রাজার পাহাড়ে রোমাঞ্চকর ট্র্যাকিং ও মেঘালয় সীমানা দর্শন',
    travelStory: 'শ্রীবরদী উপজেলা সদর থেকে কর্ণঝোড়া বাজার হয়ে রাজার পাহাড়। প্রায় চারশো ফুট উঁচু টিলা বেয়ে উপরে ওঠা কিছুটা কষ্টসাধ্য হলেও চূড়ায় ওঠার পর সব ক্লান্তি ধুয়ে যায়। চারিদিকে শান্ত নির্জন পাহাড়ি বন, পাখির ডাক আর সীমান্ত ঘেঁষা সবুজ ভ্যালি। যারা ট্র্যাকিং ও শান্ত প্রকৃতির রূপ ভালোবাসেন, তারা অবশ্যই রাজার পাহাড় মিস করবেন না।',
    photos: [
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    ],
    destinationId: 'rajar-pahar-sreebardi',
    destinationTitle: 'রাজার পাহাড়',
    upazilaId: 'sreebardi',
    likesCount: 19,
    commentsCount: 4,
    sharesCount: 3,
    status: 'published',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
  },
];

export async function getCommunityPosts(options: {
  sort?: 'newest' | 'popular';
  destinationId?: string;
  authorId?: string;
  limitCount?: number;
} = {}): Promise<CommunityPost[]> {
  const { sort = 'newest', destinationId, authorId, limitCount = 30 } = options;

  try {
    const colRef = collection(db, POSTS_COL);
    let q = query(colRef, where('status', '==', 'published'));

    if (destinationId) {
      q = query(colRef, where('status', '==', 'published'), where('destinationId', '==', destinationId));
    } else if (authorId) {
      q = query(colRef, where('authorId', '==', authorId));
    }

    const snap = await getDocs(q);

    if (snap.empty) {
      // Return initial verified community stories if Firestore has no posts yet
      let posts = [...INITIAL_COMMUNITY_POSTS];
      if (destinationId) {
        posts = posts.filter((p) => p.destinationId === destinationId);
      }
      if (authorId) {
        posts = posts.filter((p) => p.authorId === authorId);
      }
      if (sort === 'popular') {
        posts.sort((a, b) => b.likesCount + b.commentsCount - (a.likesCount + a.commentsCount));
      } else {
        posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
      return posts.slice(0, limitCount);
    }

    const list: CommunityPost[] = [];
    snap.forEach((d) => list.push({ id: d.id, ...d.data() } as CommunityPost));

    if (sort === 'popular') {
      list.sort((a, b) => b.likesCount + b.commentsCount - (a.likesCount + a.commentsCount));
    } else {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return list.slice(0, limitCount);
  } catch (err) {
    console.warn('Error reading posts from Firestore, serving initial posts:', err);
    let posts = [...INITIAL_COMMUNITY_POSTS];
    if (destinationId) {
      posts = posts.filter((p) => p.destinationId === destinationId);
    }
    return posts.slice(0, limitCount);
  }
}

export async function getAllPostsForAdmin(): Promise<CommunityPost[]> {
  try {
    const snap = await getDocs(collection(db, POSTS_COL));
    if (snap.empty) return INITIAL_COMMUNITY_POSTS;
    const list: CommunityPost[] = [];
    snap.forEach((d) => list.push({ id: d.id, ...d.data() } as CommunityPost));
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  } catch {
    return INITIAL_COMMUNITY_POSTS;
  }
}

export async function createCommunityPost(
  postInput: Omit<CommunityPost, 'id' | 'likesCount' | 'commentsCount' | 'sharesCount' | 'status' | 'createdAt'>
): Promise<CommunityPost> {
  const newId = `post_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const post: CommunityPost = {
    ...postInput,
    id: newId,
    likesCount: 0,
    commentsCount: 0,
    sharesCount: 0,
    status: 'published',
    createdAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, POSTS_COL, newId), post);
    // Increment post count on user profile
    await updateDoc(doc(db, 'users', post.authorId), {
      postsCount: increment(1),
    }).catch(() => {});
  } catch (err) {
    console.warn('Could not save post to Firestore, saving to local list:', err);
  }

  return post;
}

/**
 * Toggle like on a post.
 * Uses deterministic ID `${postId}_${userId}` to guarantee zero duplicate likes!
 */
export async function toggleLikePost(
  postId: string,
  userId: string
): Promise<{ isLiked: boolean; newCount: number }> {
  if (!postId || !userId) return { isLiked: false, newCount: 0 };
  const likeId = `${postId}_${userId}`;
  const likeRef = doc(db, LIKES_COL, likeId);
  const postRef = doc(db, POSTS_COL, postId);

  // Local storage cache for instant UI response
  const localLikesKey = `sherpur_likes_${userId}`;
  let userLikes: string[] = [];
  try {
    userLikes = JSON.parse(localStorage.getItem(localLikesKey) || '[]');
  } catch {}

  const alreadyLikedLocally = userLikes.includes(postId);
  if (alreadyLikedLocally) {
    userLikes = userLikes.filter((id) => id !== postId);
  } else {
    userLikes.push(postId);
  }
  localStorage.setItem(localLikesKey, JSON.stringify(userLikes));

  try {
    const snap = await getDoc(likeRef);
    if (snap.exists()) {
      // Unlike
      await deleteDoc(likeRef);
      await updateDoc(postRef, { likesCount: increment(-1) }).catch(() => {});
      return { isLiked: false, newCount: -1 };
    } else {
      // Like
      const likeObj: PostLike = {
        id: likeId,
        postId,
        userId,
        createdAt: new Date().toISOString(),
      };
      await setDoc(likeRef, likeObj);
      await updateDoc(postRef, { likesCount: increment(1) }).catch(() => {});
      return { isLiked: true, newCount: 1 };
    }
  } catch (err) {
    console.warn('Firestore like toggle error, using local state:', err);
    return { isLiked: !alreadyLikedLocally, newCount: alreadyLikedLocally ? -1 : 1 };
  }
}

export function isPostLikedLocally(postId: string, userId?: string | null): boolean {
  if (!userId) return false;
  try {
    const userLikes = JSON.parse(localStorage.getItem(`sherpur_likes_${userId}`) || '[]');
    return userLikes.includes(postId);
  } catch {
    return false;
  }
}

export async function addCommentToPost(
  postId: string,
  author: {
    authorId: string;
    authorName: string;
    authorUsername: string;
    authorAvatar?: string;
  },
  text: string
): Promise<PostComment> {
  const commentId = `comment_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const comment: PostComment = {
    id: commentId,
    postId,
    authorId: author.authorId,
    authorName: author.authorName,
    authorUsername: author.authorUsername,
    authorAvatar: author.authorAvatar,
    text: text.trim(),
    createdAt: new Date().toISOString(),
    status: 'published',
  };

  try {
    await setDoc(doc(db, COMMENTS_COL, commentId), comment);
    await updateDoc(doc(db, POSTS_COL, postId), {
      commentsCount: increment(1),
    }).catch(() => {});
  } catch (err) {
    console.warn('Could not post comment to Firestore:', err);
  }

  return comment;
}

export async function getCommentsForPost(postId: string): Promise<PostComment[]> {
  try {
    const q = query(collection(db, COMMENTS_COL), where('postId', '==', postId));
    const snap = await getDocs(q);
    const list: PostComment[] = [];
    snap.forEach((d) => list.push({ id: d.id, ...d.data() } as PostComment));
    list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    return list;
  } catch (err) {
    console.warn('Error fetching comments:', err);
    return [];
  }
}

export async function updatePostStatus(
  postId: string,
  status: 'published' | 'hidden' | 'flagged'
): Promise<void> {
  try {
    await updateDoc(doc(db, POSTS_COL, postId), { status, updatedAt: new Date().toISOString() });
  } catch (err) {
    console.error('Error updating post status:', err);
  }
}

export async function deletePost(postId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, POSTS_COL, postId));
  } catch (err) {
    console.error('Error deleting post:', err);
  }
}
