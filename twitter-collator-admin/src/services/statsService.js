/**
 * Stats Service
 * Business logic for statistics operations
 */

export class StatsService {
    constructor(statsApi) {
        this.statsApi = statsApi;
    }

    /**
     * Get comprehensive data statistics
     * @returns {Promise<Object>} Service response with stats data
     */
    async getDataStats() {
        try {
            const data = await this.statsApi.getDataStats();
            return {
                success: true,
                data: data,
                message: 'Statistics loaded successfully'
            };
        } catch (error) {
            console.error('Error fetching data stats:', error);
            return {
                success: false,
                data: null,
                message: `Error loading statistics: ${error.message}`
            };
        }
    }

    /**
     * Calculate retweet collection health metrics
     * @param {Object} stats - Raw stats data
     * @returns {Object} Health metrics
     */
    calculateRetweetHealth(stats) {
        if (!stats || !stats.summary) {
            return {
                status: 'unknown',
                message: 'No data available'
            };
        }

        const { summary } = stats;
        const coveragePercent = parseFloat(summary.retweetCoverageRatio) || 0;

        let status, message, color;

        if (coveragePercent >= 50) {
            status = 'healthy';
            message = 'Good retweet coverage';
            color = 'var(--wa-color-success-fill)';
        } else if (coveragePercent >= 20) {
            status = 'moderate';
            message = 'Moderate rate limiting';
            color = 'var(--wa-color-warning-fill)';
        } else if (coveragePercent >= 5) {
            status = 'limited';
            message = 'Severe rate limiting';
            color = 'var(--wa-color-warning-fill)';
        } else {
            status = 'critical';
            message = 'Critical rate limiting';
            color = 'var(--wa-color-danger-fill)';
        }

        return {
            status,
            message,
            color,
            coveragePercent
        };
    }

    /**
     * Get top retweeted users
     * @param {Object} stats - Raw stats data
     * @param {number} limit - Number of users to return
     * @returns {Array} Top users by retweet count
     */
    getTopRetweetedUsers(stats, limit = 5) {
        if (!stats || !stats.retweets || !stats.retweets.userStats) {
            return [];
        }

        return stats.retweets.userStats
            .sort((a, b) => b.totalRetweeters - a.totalRetweeters)
            .slice(0, limit);
    }

    /**
     * Get users with most tweets
     * @param {Object} stats - Raw stats data
     * @param {number} limit - Number of users to return
     * @returns {Array} Top users by tweet count
     */
    getTopTweetUsers(stats, limit = 5) {
        if (!stats || !stats.tweets || !stats.tweets.userStats) {
            return [];
        }

        return stats.tweets.userStats
            .sort((a, b) => b.totalTweets - a.totalTweets)
            .slice(0, limit);
    }
}
