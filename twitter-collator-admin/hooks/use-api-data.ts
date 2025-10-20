/**
 * Custom React hooks for API data management
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  apiClient, 
  transformFeedItemToDistill, 
  type WatchedUser, 
  type Collection, 
  type FeedItem, 
  type Distill 
} from '@/lib/api-client';

export function useWatchedUsers() {
  const [users, setUsers] = useState<WatchedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getWatchedUsers();
      
      if (response.success && response.data) {
        const usersList = response.data.users || [];
        
        // Fetch profile data for each user
        const usersWithProfiles = await Promise.all(
          usersList.map(async (user) => {
            try {
              const profileResponse = await apiClient.getUserProfile(user.username);
              if (profileResponse.success && profileResponse.data) {
                return {
                  ...user,
                  profile: {
                    name: profileResponse.data.name,
                    avatar_url: profileResponse.data.profile_image_url,
                    description: profileResponse.data.description,
                    verified: profileResponse.data.verified,
                    followers_count: profileResponse.data.public_metrics?.followers_count,
                  }
                };
              } else if (profileResponse.error === 'Profile not found') {
                // Silently handle missing profiles - these are likely test users
                console.debug(`Profile not available for ${user.username} (likely test user)`);
              }
            } catch (profileError) {
              console.warn(`Failed to fetch profile for ${user.username}:`, profileError);
            }
            return user;
          })
        );
        
        setUsers(usersWithProfiles);
      } else {
        setError(response.error || 'Failed to fetch users');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const addUser = useCallback(async (username: string) => {
    try {
      const response = await apiClient.addUser(username);
      if (response.success) {
        await fetchUsers(); // Refresh the list
        return { success: true, message: `User @${username} added successfully` };
      } else {
        return { success: false, message: response.error || 'Failed to add user' };
      }
    } catch (err) {
      return { success: false, message: err instanceof Error ? err.message : 'Unknown error' };
    }
  }, [fetchUsers]);

  const removeUser = useCallback(async (username: string) => {
    try {
      const response = await apiClient.removeUser(username);
      if (response.success) {
        await fetchUsers(); // Refresh the list
        return { success: true, message: `User @${username} removed successfully` };
      } else {
        return { success: false, message: response.error || 'Failed to remove user' };
      }
    } catch (err) {
      return { success: false, message: err instanceof Error ? err.message : 'Unknown error' };
    }
  }, [fetchUsers]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    refetch: fetchUsers,
    addUser,
    removeUser,
  };
}

export function useCollections() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCollections = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getCollections();
      
      if (response.success && response.data) {
        setCollections(response.data.collections || []);
      } else {
        setError(response.error || 'Failed to fetch collections');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const addUserToCollection = useCallback(async (collection: string, username: string) => {
    try {
      const response = await apiClient.addUserToCollection(collection, username);
      if (response.success) {
        return { success: true, message: `User @${username} added to collection "${collection}"` };
      } else {
        return { success: false, message: response.error || 'Failed to add user to collection' };
      }
    } catch (err) {
      return { success: false, message: err instanceof Error ? err.message : 'Unknown error' };
    }
  }, []);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  return {
    collections,
    loading,
    error,
    refetch: fetchCollections,
    addUserToCollection,
  };
}

export function useCollectionAvatars() {
  const [collectionAvatars, setCollectionAvatars] = useState<Record<string, string>>({});

  const fetchCollectionAvatar = useCallback(async (collectionName: string, firstMember: string) => {
    try {
      const profileResponse = await apiClient.getUserProfile(firstMember);
      if (profileResponse.success && profileResponse.data?.profile_image_url) {
        setCollectionAvatars(prev => ({
          ...prev,
          [collectionName]: profileResponse.data.profile_image_url
        }));
      } else if (profileResponse.error === 'Profile not found') {
        console.debug(`Profile not available for collection ${collectionName} member ${firstMember}`);
      }
    } catch (error) {
      console.warn(`Failed to fetch avatar for collection ${collectionName}:`, error);
    }
  }, []);

  const clearCollectionAvatars = useCallback(() => {
    setCollectionAvatars({});
  }, []);

  return { collectionAvatars, fetchCollectionAvatar, clearCollectionAvatars };
}

export function useDistills() {
  const [distills, setDistills] = useState<Distill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  const fetchDistills = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('[useDistills] Fetching combined feed...');
      // Try to get combined feed from the backend
      const response = await apiClient.getCombinedFeed();
      console.log('[useDistills] Response received:', {
        success: response.success,
        hasData: !!response.data,
        dataLength: Array.isArray(response.data) ? response.data.length : 'not array',
        error: response.error
      });
      
      if (response.success && response.data) {
        // Ensure response.data is an array
        const feedItems: FeedItem[] = Array.isArray(response.data) ? response.data : [];
        console.log('[useDistills] Processing', feedItems.length, 'feed items');
        
        const transformedDistills = feedItems.map((item, index) => {
          try {
            return transformFeedItemToDistill(item, index);
          } catch (transformError) {
            console.error(`Failed to transform item ${index}:`, transformError, item);
            // Return a fallback distill for this item
            return {
              id: index + 1,
              account: item.name || 'unknown',
              collection: item.type === 'collection' ? item.name || 'general' : 'general',
              collectionColor: item.type === 'collection' ? 'blue' : 'purple',
              avatar: `/placeholder.svg?height=48&width=48`,
              participants: item.summary.collectionMembers?.length || 1,
              timestamp: new Date(),
              content: item.summary.topLevelSummary || 'No summary available',
              mentions: [],
              conversations: 0,
              engagement: 0,
              highInfluenceParticipants: [],
              viralTweets: [],
            };
          }
        });
        console.log('[useDistills] Transformed', transformedDistills.length, 'distills');
        setDistills(transformedDistills);
        setLastSyncTime(new Date());
      } else {
        // Fallback to mock data if API fails
        console.warn('API failed, using fallback data:', response.error);
        setDistills(getFallbackDistills());
        setError(response.error || 'Failed to fetch distills data');
      }
    } catch (err) {
      console.error('Failed to fetch distills:', err);
      setDistills(getFallbackDistills());
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const syncAndSummarize = useCallback(async () => {
    try {
      console.log('[useDistills] Starting sync and summarize...');
      const response = await apiClient.syncAndSummarize();
      console.log('[useDistills] Sync response:', response);
      
      if (response.success) {
        console.log('[useDistills] Sync successful, refreshing distills...');
        await fetchDistills(); // Refresh after sync
        console.log('[useDistills] Distills refreshed');
        return { success: true, message: response.data?.message || 'Sync and summarize completed successfully' };
      } else {
        console.error('[useDistills] Sync failed:', response.error);
        return { success: false, message: response.error || 'Sync failed' };
      }
    } catch (err) {
      console.error('[useDistills] Sync error:', err);
      return { success: false, message: err instanceof Error ? err.message : 'Unknown error' };
    }
  }, [fetchDistills]);

  useEffect(() => {
    fetchDistills();
  }, [fetchDistills]);

  return {
    distills,
    loading,
    error,
    lastSyncTime,
    refetch: fetchDistills,
    syncAndSummarize,
  };
}

// Fallback data when API is unavailable
function getFallbackDistills(): Distill[] {
  return [
    {
      id: 1,
      account: "tesla",
      collection: "tesla",
      collectionColor: "blue",
      avatar: "/placeholder.svg?height=48&width=48",
      participants: 8,
      timestamp: new Date("2025-01-17T10:30:00"),
      content: "We focused heavily on the rollout of FSD Supervised V14.1, detailing new features like Arrival Options and Driver Profile Sloth, alongside significant excitement over the launch of the more affordable Model 3 Standard and Model Y Standard vehicles.",
      mentions: ["@Tesla", "@SawyerMerritt", "@Teslarati", "@InsideEVs", "@TeslaClubAT"],
      conversations: 908,
      engagement: 795237,
      links: [
        { url: "https://tesla.com/fsd-v14", title: "FSD Supervised V14.1 Release Notes" },
        { url: "https://tesla.com/model3-standard", title: "Model 3 Standard Announcement" },
      ],
      highInfluenceParticipants: [
        { username: "@Tesla", avatar: "/placeholder.svg?height=32&width=32", hearts: 12500, retweets: 3200 },
        { username: "@SawyerMerritt", avatar: "/placeholder.svg?height=32&width=32", hearts: 8400, retweets: 2100 },
      ],
      viralTweets: [
        {
          id: 1,
          username: "@Tesla",
          avatar: "/placeholder.svg?height=40&width=40",
          timestamp: "42m ago",
          content: "Model S showed the world what an electric car could be",
          likes: 3410,
          retweets: 0,
          replies: 225,
          views: 0,
          summary: "Tweet from Tesla",
          whyInteresting: "High engagement on product announcement",
        },
      ],
    },
    {
      id: 2,
      account: "ai-leaders",
      collection: "ai-leaders",
      collectionColor: "purple",
      avatar: "/placeholder.svg?height=48&width=48",
      participants: 6,
      timestamp: new Date("2025-01-17T08:15:00"),
      content: "Recent discussions have been dominated by the rollout and real-world testing of FSD v14.1, showcasing significant improvements in complex maneuvers like safe red-light handling and parking/Supercharger navigation.",
      mentions: ["@sama", "@elonmusk", "@WholeMarsBlg"],
      conversations: 123,
      engagement: 24829,
      highInfluenceParticipants: [
        { username: "@sama", avatar: "/placeholder.svg?height=32&width=32", hearts: 5200, retweets: 1400 },
        { username: "@elonmusk", avatar: "/placeholder.svg?height=32&width=32", hearts: 4800, retweets: 1200 },
      ],
      viralTweets: [
        {
          id: 2,
          username: "@sama",
          avatar: "/placeholder.svg?height=40&width=40",
          timestamp: "1h ago",
          content: "The future of AI is going to be incredible. We're just getting started.",
          likes: 2100,
          retweets: 450,
          replies: 180,
          views: 0,
          summary: "AI future outlook",
          whyInteresting: "Insightful perspective from AI leader",
        },
      ],
    },
  ];
}
