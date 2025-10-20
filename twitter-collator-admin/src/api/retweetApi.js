/**
 * Retweet API Service
 * Handles all retweet-related API calls
 */

import { endpoints } from './endpoints.js';

export class RetweetApi {
    constructor(httpClient) {
        this.http = httpClient;
    }

    /**
     * Get retweets for a specific tweet
     * @param {string} username - The tweet author's username
     * @param {string} tweetId - The tweet ID
     * @returns {Promise<Object>} Retweet data including retweeters and count
     */
    async getTweetRetweets(username, tweetId) {
        return this.http.get(endpoints.tweetRetweets(username, tweetId));
    }

    /**
     * Get list of users who have retweet data available
     * @returns {Promise<Object>} Index of users with retweet data
     */
    async getRetweetIndex() {
        return this.http.get(endpoints.retweetIndex());
    }
}

