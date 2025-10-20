/**
 * User API Service
 * Handles all user-related API calls
 */

import { endpoints } from './endpoints.js';

export class UserApi {
    constructor(httpClient) {
        this.http = httpClient;
    }

    async getWatchedUsers() {
        const data = await this.http.get(endpoints.watchedUsers());
        // Wrap in success format expected by getCombinedFeed
        return {
            success: true,
            users: data.users || [],
            lastUpdated: data.lastUpdated
        };
    }

    async getUserSummary(username) {
        return this.http.get(endpoints.userSummary(username));
    }

    async getUserProfile(username) {
        return this.http.get(endpoints.userProfile(username));
    }

    async addUser(username) {
        return this.http.post(endpoints.addUser(username));
    }

    async removeUser(username) {
        return this.http.delete(endpoints.removeUser(username));
    }

    async searchUser(query, type = 'auto') {
        return this.http.get(endpoints.searchUser(query, type));
    }
}
