/**
 * API Endpoints Configuration
 * Centralized endpoint definitions and URL building
 */

export const endpoints = {
    // Health
    health: () => '/health',

    // Users
    watchedUsers: () => '/data/watched-users.json',  // Fixed: use actual working endpoint
    userProfile: (username) => `/data/summary/${username}/profile.json`,  // Fixed: add .json extension
    userTweets: (username) => `/api/users/${username}/tweets`,
    userSummary: (username) => `/data/summary/${username}/${username}.json`,
    addUser: (username) => `/api/watch/${username}`,
    removeUser: (username) => `/api/watch/${username}`,
    searchUser: (query, type = 'auto') => `/api/search/user/${query}?type=${type}`,

    // Collections
    collections: () => '/data/collections/',
    collectionDetails: (name) => `/data/collections/${name}.json`,
    collectionSummary: (name) => `/data/summary/${name}/${name}.json`,
    collectionSummaryAlt: (name) => `/api/collections/${name}/summary`,
    collectionTweets: (name) => `/api/collections/${name}/tweets`,
    addUserToCollection: (collection, username) => `/api/collections/${collection}/users/${username}`,

    // Sync
    syncAndSummarize: () => '/api/sync-and-summarize',
    sync: () => '/api/sync'
};

