/**
 * API Client for Twitter Collator
 * Bridge layer between Next.js frontend and existing backend services
 */

// For frontend, we call our Next.js API routes, not the backend directly
const API_BASE_URL = typeof window !== 'undefined' ? '' : 'https://twitter-collator.fly.dev';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface WatchedUser {
  username: string;
  name?: string;
  profile?: {
    name: string;
    description: string;
    avatar_url?: string;
    followers_count?: number;
    following_count?: number;
  };
  latestSummary?: {
    url: string;
    created_at: string;
  };
  summaryUrl?: string;
  recentTweet?: {
    text: string;
    created_at: string;
    likes: number;
    retweets: number;
    replies: number;
  };
}

export interface Collection {
  name: string;
  description?: string;
  accounts?: string[];
  summaryUrl?: string;
}

export interface FeedItem {
  type: 'user' | 'collection';
  name: string;
  summary: {
    conversations?: Array<{
      id: string;
      author: string;
      text: string;
      created_at: string;
      likes: number;
      retweets: number;
      replies: number;
      views?: number;
    }>;
    topLevelSummary?: string;
    collectionMembers?: string[];
    engagementStats?: {
      totalTweets?: number;
      totalLikes?: number;
      totalRetweets?: number;
      totalReplies?: number;
      totalQuotes?: number;
      totalBookmarks?: number;
      totalImpressions?: number;
      averageEngagement?: number;
      topTweet?: {
        id: string;
        text: string;
        engagement: number;
      };
    };
    profile?: {
      id: string;
      username: string;
      name: string;
      description: string;
      profile_image_url?: string;
      profile_banner_url?: string;
      location?: string;
      url?: string;
      verified?: boolean;
      public_metrics?: {
        followers_count: number;
        following_count: number;
        tweet_count: number;
        listed_count: number;
        like_count: number;
        media_count: number;
      };
      created_at: string;
      lastUpdated: string;
    };
  };
  url?: string;
}

export interface ViralTweet {
  id: string;
  username: string;
  avatar?: string;
  timestamp: string;
  content: string;
  likes: number;
  retweets: number;
  replies: number;
  views: number;
  summary: string;
  whyInteresting: string;
}

export interface Distill {
  id: number;
  account: string;
  collection: string;
  collectionColor: string;
  avatar?: string;
  participants: number;
  timestamp: Date;
  content: string;
  mentions: string[];
  conversations: number;
  engagement: number;
  links?: Array<{
    url: string;
    title: string;
  }>;
  highInfluenceParticipants?: Array<{
    username: string;
    avatar?: string;
    hearts: number;
    retweets: number;
  }>;
  viralTweets?: ViralTweet[];
  recentTweets?: Array<{
    id: string;
    author: string;
    text: string;
    created_at: string;
    likes: number;
    retweets: number;
    replies: number;
    views?: number;
    avatar?: string;
  }>;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      console.log('[ApiClient] Requesting:', { url, method: options.method || 'GET' });
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      // Only log errors and non-200 responses
      if (!response.ok) {
        console.log('[ApiClient] Response:', { 
          url, 
          status: response.status, 
          ok: response.ok,
          statusText: response.statusText
        });
      }

      if (!response.ok) {
        // Handle 404s gracefully for profile requests
        if (response.status === 404 && endpoint.includes('/profile')) {
          console.warn(`[ApiClient] Profile not found for: ${endpoint}`);
          return {
            success: false,
            error: 'Profile not found',
            data: null
          };
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // Only log data for debugging when needed
      if (process.env.NODE_ENV === 'development' && endpoint.includes('/profile')) {
        console.debug('[ApiClient] Data received:', { 
          url, 
          dataType: typeof data,
          isArray: Array.isArray(data),
          keys: Object.keys(data || {})
        });
      }
      
      // API routes return { success, data } structure
      return data;
    } catch (error) {
      console.error('[ApiClient] Request failed:', { url: endpoint, error });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Health check
  async healthCheck(): Promise<ApiResponse> {
    return this.request('/health');
  }

  // User management
  async getWatchedUsers(): Promise<ApiResponse<{ users: WatchedUser[] }>> {
    return this.request('/api/watch');
  }

  async addUser(username: string): Promise<ApiResponse> {
    return this.request(`/api/watch/${username}`, {
      method: 'POST',
    });
  }

  async removeUser(username: string): Promise<ApiResponse> {
    return this.request(`/api/watch/${username}`, {
      method: 'DELETE',
    });
  }

  async getUserSummary(username: string): Promise<ApiResponse> {
    return this.request(`/api/users/${username}/summary`);
  }

  async getUserProfile(username: string): Promise<ApiResponse> {
    return this.request(`/api/users/${username}/profile`);
  }

  // Collection management
  async getCollections(): Promise<ApiResponse<{ collections: Collection[] }>> {
    return this.request('/api/collections');
  }

  async getCollectionDetails(name: string): Promise<ApiResponse> {
    return this.request(`/data/collections/${name}.json`);
  }

  async getCollectionSummary(name: string): Promise<ApiResponse> {
    return this.request(`/data/summary/${name}/`);
  }

  async addUserToCollection(collection: string, username: string): Promise<ApiResponse> {
    return this.request(`/api/collections/${collection}/users/${username}`, {
      method: 'POST',
    });
  }

  // Feed operations
  async getCombinedFeed(): Promise<ApiResponse<FeedItem[]>> {
    // Call our Next.js API route which bridges to the backend
    return this.request('/api/combined-feed');
  }

  // Sync operations
  async syncAndSummarize(): Promise<ApiResponse> {
    return this.request('/api/sync-and-summarize', {
      method: 'POST',
    });
  }

  async syncData(options: any = {}): Promise<ApiResponse> {
    return this.request('/api/sync', {
      method: 'POST',
      body: JSON.stringify(options),
    });
  }
}

// Create and export singleton instance
export const apiClient = new ApiClient();

// Utility functions for data transformation
export function transformFeedItemToDistill(item: FeedItem, index: number): Distill {
  const conversations = item.summary.conversations || [];
  
  // Calculate engagement from the new engagementStats structure if available
  let totalEngagement = 0;
  if (item.summary.engagementStats) {
    const stats = item.summary.engagementStats;
    totalEngagement = (stats.totalLikes || 0) + (stats.totalRetweets || 0) + (stats.totalReplies || 0);
  } else {
    // Fallback to calculating from conversations
    totalEngagement = conversations.reduce((sum, conv) => 
      sum + (conv.likes || 0) + (conv.retweets || 0) + (conv.replies || 0), 0
    );
  }

  // Extract mentions from conversation texts
  const mentions = conversations
    .flatMap(conv => {
      const post = conv.originalPost || conv;
      const mentionMatches = post.text?.match(/@[a-zA-Z0-9_]+/g);
      return mentionMatches || [];
    })
    .filter((mention, index, arr) => arr.indexOf(mention) === index) // Remove duplicates
    .slice(0, 10); // Limit to 10 mentions

  // Create viral tweets from high-engagement conversations
  const viralTweets: ViralTweet[] = conversations
    .filter(conv => {
      const post = conv.originalPost || conv;
      return (post.likes || 0) > 100 || (post.retweets || 0) > 50;
    })
    .slice(0, 3)
    .map((conv, i) => {
      const post = conv.originalPost || conv;
      // Try to find the author's profile image from the profile data
      const authorProfile = item.summary.profile?.username === post.author ? item.summary.profile : null;
      const avatar = authorProfile?.profile_image_url || `/placeholder.svg?height=40&width=40`;
      
      return {
        id: post.id || `viral_${index}_${i}`,
        username: `@${post.author || 'unknown'}`,
        avatar,
        timestamp: getRelativeTime(post.created_at || new Date().toISOString()),
        content: post.text || 'No content available',
        likes: post.likes || 0,
        retweets: post.retweets || 0,
        replies: post.replies || 0,
        views: post.views || 0,
        summary: `Tweet from ${post.author || 'unknown'}`,
        whyInteresting: "High engagement content",
      };
    });

  // Create high influence participants from conversations
  const highInfluenceParticipants = conversations
    .reduce((acc, conv) => {
      // Handle the new conversation structure with originalPost
      const post = conv.originalPost || conv;
      const author = post.author;
      const likes = post.likes || 0;
      const retweets = post.retweets || 0;
      
      if (author) {
        const existing = acc.find(p => p.username === `@${author}`);
        if (existing) {
          existing.hearts += likes;
          existing.retweets += retweets;
        } else {
          // Try to find the author's profile image from the profile data
          const authorProfile = item.summary.profile?.username === author ? item.summary.profile : null;
          const avatar = authorProfile?.profile_image_url || `/placeholder.svg?height=32&width=32`;
          
          acc.push({
            username: `@${author}`,
            avatar,
            hearts: likes,
            retweets: retweets,
          });
        }
      }
      
      // Also process replies to get more diverse participants
      if (conv.replies && Array.isArray(conv.replies)) {
        conv.replies.forEach(reply => {
          if (reply.author) {
            const replyLikes = reply.likes || 0;
            const replyRetweets = reply.retweets || 0;
            
            const existing = acc.find(p => p.username === `@${reply.author}`);
            if (existing) {
              existing.hearts += replyLikes;
              existing.retweets += replyRetweets;
            } else {
              const avatar = `/placeholder.svg?height=32&width=32`;
              acc.push({
                username: `@${reply.author}`,
                avatar,
                hearts: replyLikes,
                retweets: replyRetweets,
              });
            }
          }
        });
      }
      
      return acc;
    }, [] as Array<{ username: string; avatar?: string; hearts: number; retweets: number }>)
    .sort((a, b) => (b.hearts + b.retweets) - (a.hearts + a.retweets))
    .slice(0, 5);

  // If we don't have enough high-influence participants, add collection members as fallback
  if (highInfluenceParticipants.length < 5 && item.summary.collectionMembers) {
    const existingUsernames = highInfluenceParticipants.map(p => p.username.replace('@', ''));
    const remainingMembers = item.summary.collectionMembers
      .filter(member => !existingUsernames.includes(member))
      .slice(0, 5 - highInfluenceParticipants.length);
    
    remainingMembers.forEach(member => {
      highInfluenceParticipants.push({
        username: `@${member}`,
        avatar: `/placeholder.svg?height=32&width=32`,
        hearts: 0,
        retweets: 0,
      });
    });
  }

  // If no conversations, create some default data for better UX
  const hasConversations = conversations.length > 0;
  const participants = item.summary.collectionMembers?.length || conversations.length || 1;
  const timestamp = hasConversations && conversations[0]?.created_at 
    ? new Date(conversations[0].created_at) 
    : new Date();

  // Get avatar from profile data if available
  let avatar = item.summary.profile?.profile_image_url || `/placeholder.svg?height=48&width=48`;
  
  // For collections, use the first member's profile image directly
  if (item.type === 'collection' && !item.summary.profile?.profile_image_url && item.summary.collectionMembers && item.summary.collectionMembers.length > 0) {
    // Use a placeholder that will be replaced by the frontend
    avatar = `/placeholder.svg?height=48&width=48`;
  }

  // Create recent tweets from conversations (last 10)
  const recentTweets = conversations
    .slice(0, 10)
    .map(conv => {
      const post = conv.originalPost || conv;
      return {
        id: post.id || `tweet_${index}_${conversations.indexOf(conv)}`,
        author: post.author || 'unknown',
        text: post.text || 'No content available',
        created_at: post.created_at || new Date().toISOString(),
        likes: post.likes || 0,
        retweets: post.retweets || 0,
        replies: post.replies || 0,
        views: post.views || 0,
        avatar: item.summary.profile?.username === post.author ? item.summary.profile.profile_image_url : `/placeholder.svg?height=32&width=32`,
      };
    });

  return {
    id: index + 1,
    account: item.name,
    collection: item.type === 'collection' ? item.name : 'general',
    collectionColor: item.type === 'collection' ? 'blue' : 'purple',
    avatar,
    participants,
    timestamp,
    content: item.summary.topLevelSummary || 'No summary available',
    mentions,
    conversations: conversations.length,
    engagement: totalEngagement,
    highInfluenceParticipants,
    viralTweets,
    recentTweets,
  };
}

export function getRelativeTime(dateString: string): string {
  if (!dateString) return 'Unknown time';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  } else if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000);
    return `${months}mo ago`;
  } else {
    const years = Math.floor(diffInSeconds / 31536000);
    return `${years}y ago`;
  }
}
