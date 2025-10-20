/**
 * Feed Service
 * Business logic for feed operations
 */

export class FeedService {
    constructor(api) {
        this.api = api;
    }

    async getCombinedFeed() {
        try {
            const feedItems = await this.api.getCombinedFeed();
            return {
                success: true,
                items: feedItems,
                count: feedItems.length
            };
        } catch (error) {
            return {
                success: false,
                items: [],
                count: 0,
                message: `Error loading feed: ${error.message}`
            };
        }
    }

    async refreshFeed() {
        // Clear both API cache and profile cache before refreshing
        this.api.clearCache();
        
        // Import profileCache dynamically to avoid circular dependencies
        const { profileCache } = await import('../utils/profileCache.js');
        profileCache.clear();
        
        return this.getCombinedFeed();
    }
}
