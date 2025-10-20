/**
 * Profile Cache
 * Caches user profile data to avoid redundant API calls
 */

import { getApiBaseUrl } from '../config/apiConfig.js';

export class ProfileCache {
    constructor(baseURL = getApiBaseUrl()) {
        this.baseURL = baseURL;
        this.cache = new Map();
        this.pendingRequests = new Map();
    }

    /**
     * Get a user's profile, using cache if available
     */
    async getProfile(username) {
        if (!username) return null;

        // Check cache first
        if (this.cache.has(username)) {
            return this.cache.get(username);
        }

        // Check if there's already a pending request for this user
        if (this.pendingRequests.has(username)) {
            return this.pendingRequests.get(username);
        }

        // Make the request and cache the promise
        const request = this._fetchProfile(username);
        this.pendingRequests.set(username, request);

        try {
            const profile = await request;
            this.cache.set(username, profile);
            return profile;
        } finally {
            this.pendingRequests.delete(username);
        }
    }

    /**
     * Batch fetch multiple profiles in parallel
     */
    async batchGetProfiles(usernames) {
        const uniqueUsernames = [...new Set(usernames.filter(Boolean))];
        
        // Fetch all profiles in parallel
        const profilePromises = uniqueUsernames.map(username => 
            this.getProfile(username).catch(error => {
                console.warn(`Failed to fetch profile for ${username}:`, error);
                return null;
            })
        );

        await Promise.all(profilePromises);
        
        // Return a map of username -> profile
        const profileMap = new Map();
        uniqueUsernames.forEach(username => {
            const profile = this.cache.get(username);
            if (profile) {
                profileMap.set(username, profile);
            }
        });
        
        return profileMap;
    }

    /**
     * Get avatar URL for a user
     */
    getAvatarUrl(username) {
        const profile = this.cache.get(username);
        return profile?.profile_image_url || null;
    }

    /**
     * Prefetch profiles for feed items
     */
    async prefetchForFeedItems(feedItems) {
        const usernames = new Set();

        feedItems.forEach(item => {
            // Add main user/collection author
            if (item.type === 'user') {
                usernames.add(item.name);
            }

            // Add all conversation authors
            if (item.summary?.conversations) {
                item.summary.conversations.forEach(conv => {
                    const author = conv.author || conv.originalPost?.author || conv.username;
                    if (author) usernames.add(author);
                });
            }

            // Add collection members
            if (item.type === 'collection' && item.summary?.collectionMembers) {
                item.summary.collectionMembers.forEach(member => usernames.add(member));
            }
        });

        console.log(`Prefetching ${usernames.size} unique user profiles...`);
        const startTime = performance.now();
        
        await this.batchGetProfiles([...usernames]);
        
        const endTime = performance.now();
        console.log(`Prefetch completed in ${Math.round(endTime - startTime)}ms`);
    }

    /**
     * Internal method to fetch a profile
     */
    async _fetchProfile(username) {
        try {
            // New API structure: /data/summary/:username/profile.json
            const response = await fetch(`${this.baseURL}/data/summary/${username}/profile.json`);
            if (response.ok) {
                const data = await response.json();
                // New API returns profile directly, not wrapped in {profile: {...}}
                return {
                    username,
                    profile_image_url: data.profile_image_url,
                    name: data.name,
                    ...data
                };
            }
        } catch (error) {
            console.warn(`Error fetching profile for ${username}:`, error);
        }
        return null;
    }

    /**
     * Clear the cache
     */
    clear() {
        this.cache.clear();
        this.pendingRequests.clear();
    }

    /**
     * Get cache size
     */
    get size() {
        return this.cache.size;
    }
}

// Create and export a singleton instance
export const profileCache = new ProfileCache();

