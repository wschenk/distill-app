/**
 * Stats API Service
 * Handles all statistics-related API calls
 */

import { endpoints } from './endpoints.js';

export class StatsApi {
    constructor(httpClient) {
        this.http = httpClient;
    }

    /**
     * Get comprehensive data statistics
     * @returns {Promise<Object>} Statistics including tweet and retweet data
     */
    async getDataStats() {
        return this.http.get(endpoints.dataStats());
    }
}
