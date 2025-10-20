/**
 * Collection Service
 * Business logic for collection operations
 */

export class CollectionService {
    constructor(collectionApi) {
        this.collectionApi = collectionApi;
    }

    async getCollections() {
        try {
            const result = await this.collectionApi.getCollections();
            // New API returns {collections: [], count, lastUpdated}
            // Normalize to {success: true, collections: []}
            return {
                success: true,
                collections: result.collections || [],
                count: result.count,
                lastUpdated: result.lastUpdated
            };
        } catch (error) {
            return {
                success: false,
                collections: [],
                message: `Error loading collections: ${error.message}`
            };
        }
    }

    async getCollectionData(name) {
        try {
            const [details, summary] = await Promise.all([
                this.collectionApi.getCollectionDetails(name),
                this.collectionApi.getCollectionSummary(name)
            ]);

            if (details.accounts) {
                summary.collectionMembers = details.accounts;
            }

            return {
                success: true,
                collection: { name, ...details },
                summary
            };
        } catch (error) {
            return {
                success: false,
                message: `Error loading collection data: ${error.message}`,
                collection: null,
                summary: null
            };
        }
    }

    async addUserToCollection(collection, username) {
        try {
            const result = await this.collectionApi.addUserToCollection(collection, username);
            if (result.success) {
                return { success: true, message: `User @${username} added to collection "${collection}"` };
            } else {
                return { success: false, message: result.message || 'Failed to add user to collection' };
            }
        } catch (error) {
            return { success: false, message: `Error adding user to collection: ${error.message}` };
        }
    }
}
