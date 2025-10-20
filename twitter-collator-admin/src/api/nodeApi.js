/**
 * Node.js Compatible API
 * Main API module for Node.js environments
 */

import { NodeHttpClient } from './nodeHttpClient.js';
import { UserApi } from './userApi.js';
import { CollectionApi } from './collectionApi.js';
import { endpoints } from './endpoints.js';

export class TwitterCollatorAPI {
    constructor(baseURL = 'https://twitter-collator.fly.dev', options = {}) {
        this.http = new NodeHttpClient(baseURL, options);
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
        const [collectionsData, watchedUsersData] = await Promise.all([
            this.collections.getCollections(),
            this.users.getWatchedUsers()
        ]);

        const feedItems = [];

        // Process collections
        if (collectionsData.success && collectionsData.collections) {
            for (const collection of collectionsData.collections) {
                try {
                    const summary = await this.collections.getCollectionSummary(collection.name);
                    const details = await this.collections.getCollectionDetails(collection.name);
                    
                    if (details.accounts) {
                        summary.collectionMembers = details.accounts;
                    }
                    
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
        if (watchedUsersData.success && watchedUsersData.users) {
            for (const user of watchedUsersData.users) {
                try {
                    if (user.latestSummary && user.latestSummary.url) {
                        const summaryData = await this.http.get(user.latestSummary.url);
                        feedItems.push({
                            type: 'user',
                            name: user.username,
                            summary: summaryData,
                            url: user.latestSummary.url
                        });
                    } else {
                        const summary = await this.users.getUserSummary(user.username);
                        feedItems.push({
                            type: 'user',
                            name: user.username,
                            summary: summary,
                            url: user.summaryUrl
                        });
                    }
                } catch (error) {
                    console.error(`Error processing user ${user.username}:`, error);
                }
            }
        }

        return feedItems;
    }
}

// Create and export default instance
export const api = new TwitterCollatorAPI();
