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
        // Clear cache before refreshing
        this.api.clearCache();
        return this.getCombinedFeed();
    }
}
