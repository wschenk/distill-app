/**
 * Collection API Service
 * Handles all collection-related API calls
 */

import { endpoints } from './endpoints.js';

export class CollectionApi {
    constructor(httpClient) {
        this.http = httpClient;
    }

    async getCollections() {
        // The /data/collections/ endpoint doesn't return JSON, it's a directory
        // We need to manually construct a list of known collections
        try {
            // Try to fetch known collections
            const knownCollections = ['tesla', 'ai-leaders'];
            const collections = [];
            
            for (const name of knownCollections) {
                try {
                    const details = await this.http.get(endpoints.collectionDetails(name));
                    collections.push({
                        name: details.name,
                        description: details.description,
                        summaryUrl: `/data/summary/${name}/`,
                        accounts: details.accounts
                    });
                } catch (error) {
                    console.warn(`Failed to fetch collection ${name}:`, error);
                }
            }
            
            return {
                success: true,
                collections
            };
        } catch (error) {
            console.error('Failed to get collections:', error);
            return {
                success: false,
                collections: [],
                message: error.message
            };
        }
    }

    async getCollectionDetails(name) {
        return this.http.get(endpoints.collectionDetails(name));
    }

    async getCollectionSummary(name) {
        return this.http.get(endpoints.collectionSummary(name));
    }

    async addUserToCollection(collection, username) {
        return this.http.post(endpoints.addUserToCollection(collection, username));
    }

    async removeUserFromCollection(collection, username) {
        return this.http.delete(endpoints.addUserToCollection(collection, username));
    }
}
