/**
 * Main API Module
 * Exports all API services and creates the main API instance
 */

import { HttpClient } from './httpClient.js';
import { UserApi } from './userApi.js';
import { CollectionApi } from './collectionApi.js';
import { endpoints } from './endpoints.js';

export class TwitterCollatorAPI {
    constructor(baseURL = 'https://twitter-collator.fly.dev', options = {}) {
        this.http = new HttpClient(baseURL, options);
        this.users = new UserApi(this.http);
        this.collections = new CollectionApi(this.http);
        this.baseURL = baseURL;
    }

    // Health check
    async healthCheck() {
        return this.http.get(endpoints.health());
    }

    // Sync operations
    async syncAndSummarize() {
        return this.http.post(endpoints.syncAndSummarize());
    }

    async syncData(options = {}) {
        return this.http.post(endpoints.sync(), options);
    }

    // Cache management
    clearCache() {
        this.http.clearCache();
    }

    // Combined feed data
    async getCombinedFeed() {
        console.log('🔍 Starting getCombinedFeed...');
        
        try {
            const [collectionsData, watchedUsersData] = await Promise.all([
                this.collections.getCollections(),
                this.users.getWatchedUsers()
            ]);

        console.log('📊 Collections data:', collectionsData);
        console.log('👥 Watched users data:', watchedUsersData);
        const feedItems = [];
        console.log('🔧 Initialized feedItems as array:', Array.isArray(feedItems), feedItems);

        // Process collections
        console.log('📁 Processing collections...', collectionsData.success, collectionsData.collections?.length);
        if (collectionsData.success && collectionsData.collections) {
            for (const collection of collectionsData.collections) {
                try {
                    let summary = null;
                    
                    // Try to get collection summary
                    try {
                        summary = await this.collections.getCollectionSummary(collection.name);
                    } catch (summaryError) {
                        console.warn(`No summary for collection ${collection.name}, creating basic summary`);
                        // Create a basic summary with collection members
                        summary = {
                            topLevelSummary: collection.description || `Collection: ${collection.name}`,
                            conversations: [],
                            collectionMembers: collection.accounts || []
                        };
                    }
                    
                    // Ensure collection members are included
                    if (collection.accounts && !summary.collectionMembers) {
                        summary.collectionMembers = collection.accounts;
                    }
                    
                    console.log('🔧 About to push collection, feedItems is array:', Array.isArray(feedItems));
                    feedItems.push({
                        type: 'collection',
                        name: collection.name,
                        summary: summary,
                        url: collection.summaryUrl
                    });
                } catch (error) {
                    console.error(`Error fetching collection ${collection.name}:`, error);
                }
            }
        }

        // Process watched users
        console.log('👤 Processing users...', watchedUsersData.success, watchedUsersData.users?.length);
        if (watchedUsersData.success && watchedUsersData.users) {
            // Limit to first 10 users for performance
            const usersToProcess = watchedUsersData.users.slice(0, 10);
            for (const user of usersToProcess) {
                try {
                    let summaryData = null;
                    let profile = null;
                    
                    // Try to get profile data first
                    try {
                        profile = await this.users.getUserProfile(user.username);
                    } catch (profileError) {
                        console.warn(`No profile for ${user.username}:`, profileError.message);
                    }
                    
                    // Try to get summary data
                    try {
                        if (user.latestSummary && user.latestSummary.url) {
                            summaryData = await this.http.get(user.latestSummary.url);
                        } else {
                            summaryData = await this.users.getUserSummary(user.username);
                        }
                    } catch (summaryError) {
                        console.warn(`No summary for ${user.username}, creating basic summary`);
                        // Create a basic summary with profile data
                        summaryData = {
                            topLevelSummary: profile ? `${profile.name || user.username} - ${profile.description || 'Twitter user'}` : `User: ${user.username}`,
                            conversations: [],
                            profile: profile
                        };
                    }
                    
                    // Add profile data to summary if we have it
                    if (profile && !summaryData.profile) {
                        summaryData.profile = profile;
                    }
                    
                    console.log('🔧 About to push user, feedItems is array:', Array.isArray(feedItems));
                    feedItems.push({
                        type: 'user',
                        name: user.username,
                        summary: summaryData,
                        url: user.latestSummary?.url || user.summaryUrl
                    });
                } catch (error) {
                    console.error(`⚠️ Failed to add user ${user.username}:`, error);
                    // Add user with minimal data so they're not completely skipped
                    try {
                        feedItems.push({
                            type: 'user',
                            name: user.username,
                            summary: {
                                topLevelSummary: `User: ${user.username}`,
                                conversations: []
                            },
                            url: null
                        });
                    } catch (pushError) {
                        console.error(`⚠️ Could not add fallback for ${user.username}:`, pushError);
                    }
                }
            }
        }
        
        console.log('✅ Final feed items:', feedItems?.length || 0, feedItems?.map(item => ({ type: item.type, name: item.name })) || []);
        
        // Ensure feedItems is always an array
        if (!Array.isArray(feedItems)) {
            console.warn('⚠️ feedItems is not an array, initializing as empty array');
            feedItems = [];
        }
        
        // Note: Fallback data removed since we now gracefully handle missing summaries
        // Collections and users will always be included with basic data even if summaries don't exist
        
            return feedItems;
        } catch (error) {
            console.error('🚨 Complete API failure, returning fallback data:', error);
            return [{
                type: 'user',
                name: 'fallback_user',
                summary: {
                    conversations: [
                        {
                            id: 'fallback_1',
                            author: 'fallback_user',
                            text: 'Backend API is currently down. This is fallback data to show the UI working.',
                            created_at: new Date().toISOString(),
                            likes: 10,
                            retweets: 5,
                            replies: 2,
                            views: 100
                        }
                    ],
                    topLevelSummary: 'Backend API is down - showing fallback data'
                }
            }];
        }
    }
}

// Create and export default instance
export const api = new TwitterCollatorAPI();
