/**
 * Retweet Service
 * Business logic for retweet operations
 */

export class RetweetService {
    constructor(retweetApi) {
        this.retweetApi = retweetApi;
    }

    /**
     * Get retweets for a specific tweet
     * @param {string} username - The tweet author's username
     * @param {string} tweetId - The tweet ID
     * @returns {Promise<Object>} Service response with retweet data
     */
    async getTweetRetweets(username, tweetId) {
        try {
            const data = await this.retweetApi.getTweetRetweets(username, tweetId);
            return {
                success: true,
                data: data,
                message: `Found ${data.retweetCount || 0} retweets`
            };
        } catch (error) {
            console.error(`Error fetching retweets for tweet ${tweetId}:`, error);
            return {
                success: false,
                data: null,
                message: `Error loading retweets: ${error.message}`
            };
        }
    }

    /**
     * Get list of users who have retweet data available
     * @returns {Promise<Object>} Service response with retweet index
     */
    async getRetweetIndex() {
        try {
            const data = await this.retweetApi.getRetweetIndex();
            return {
                success: true,
                data: data,
                message: `Loaded retweet index`
            };
        } catch (error) {
            console.error(`Error fetching retweet index:`, error);
            return {
                success: false,
                data: null,
                message: `Error loading retweet index: ${error.message}`
            };
        }
    }

    /**
     * Format retweet data for display
     * @param {Object} retweetData - Raw retweet data from API
     * @returns {Object} Formatted retweet data
     */
    formatRetweetData(retweetData) {
        if (!retweetData) return null;

        return {
            tweetId: retweetData.tweetId,
            tweetAuthor: retweetData.tweetAuthor,
            retweetCount: retweetData.retweetCount || 0,
            retweeters: retweetData.retweeters || [],
            lastFetched: retweetData.lastFetched ? new Date(retweetData.lastFetched) : null,
            lastRetweetCountCheck: retweetData.lastRetweetCountCheck ? new Date(retweetData.lastRetweetCountCheck) : null
        };
    }

    /**
     * Get the most recent retweeters
     * @param {Object} retweetData - Raw retweet data from API
     * @param {number} limit - Maximum number of retweeters to return
     * @returns {Array} Array of most recent retweeters
     */
    getRecentRetweeters(retweetData, limit = 10) {
        if (!retweetData || !retweetData.retweeters) return [];

        // Sort by retweetedAt timestamp (most recent first)
        const sorted = [...retweetData.retweeters].sort((a, b) => {
            const dateA = new Date(a.retweetedAt);
            const dateB = new Date(b.retweetedAt);
            return dateB - dateA;
        });

        return sorted.slice(0, limit);
    }
}

