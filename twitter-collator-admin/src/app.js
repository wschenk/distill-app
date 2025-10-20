/**
 * Main Application Module
 * Initializes and coordinates all application components
 */

import { api } from './api/index.js';
import { UserService } from './services/userService.js';
import { CollectionService } from './services/collectionService.js';
import { FeedService } from './services/feedService.js';
import { UserManager } from './ui/userManager.js';
import { CollectionManager } from './ui/collectionManager.js';
import { FeedManager } from './ui/feedManager.js';
import { showMessage, showLoading, hideLoading } from './utils/helpers.js';

export class TwitterCollatorApp {
    constructor() {
        this.isInitialized = false;
        this.refreshInterval = null;
        this.refreshIntervalMs = 5 * 60 * 1000; // 5 minutes
        
        // Initialize services
        this.userService = new UserService(api.users);
        this.collectionService = new CollectionService(api.collections);
        this.feedService = new FeedService(api);
        
        // Initialize UI managers
        this.userManager = new UserManager(this.userService);
        this.collectionManager = new CollectionManager(this.collectionService);
        this.feedManager = new FeedManager(this.feedService);
    }

    async init() {
        if (this.isInitialized) return;
        
        try {
            console.log('Initializing Twitter Collator Admin...');
            
            // Check API health first
            await this.checkAPIHealth();
            
            // Load initial data
            await this.loadInitialData();
            
            // Setup auto-refresh
            this.setupAutoRefresh();
            
        // Setup error handling
        this.setupErrorHandling();
        
        // Setup sync button
        this.setupSyncButton();
        
        // Display last sync time
        this.displayLastSyncTime();
        
        // Make managers globally available for onclick handlers
        window.userManager = this.userManager;
        window.collectionManager = this.collectionManager;
        window.feedManager = this.feedManager;
            
            this.isInitialized = true;
            console.log('Twitter Collator Admin initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize application:', error);
            this.showInitializationError(error);
        }
    }

    async checkAPIHealth() {
        try {
            const health = await api.healthCheck();
            console.log('API Health Check:', health);
            return health;
        } catch (error) {
            console.warn('API Health Check failed:', error);
            return { status: 'unknown', message: 'Health check failed' };
        }
    }

    async loadInitialData() {
        const loadingPromises = [];
        
        // Load watched users
        loadingPromises.push(
            this.userManager.loadWatchedUsers().catch(error => {
                console.error('Failed to load watched users:', error);
            })
        );
        
        // Load collections
        loadingPromises.push(
            this.collectionManager.loadCollections().catch(error => {
                console.error('Failed to load collections:', error);
            })
        );
        
        // Load feed
        loadingPromises.push(
            this.feedManager.loadFeed().catch(error => {
                console.error('Failed to load feed:', error);
            })
        );
        
        // Wait for all initial data to load
        await Promise.allSettled(loadingPromises);
    }

    setupAutoRefresh() {
        // Clear any existing interval
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        
        // Set up new interval
        this.refreshInterval = setInterval(() => {
            this.refreshData();
        }, this.refreshIntervalMs);
        
        console.log(`Auto-refresh set up for every ${this.refreshIntervalMs / 1000} seconds`);
    }

    async refreshData() {
        try {
            console.log('Refreshing data...');
            await this.feedManager.loadFeed();
            await this.userManager.loadWatchedUsers();
            await this.collectionManager.loadCollections();
            console.log('Data refresh completed');
        } catch (error) {
            console.error('Error during data refresh:', error);
        }
    }

    setupErrorHandling() {
        // Global error handler for unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            this.handleGlobalError(event.reason);
        });
        
        // Global error handler for JavaScript errors
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            this.handleGlobalError(event.error);
        });
    }

    setupSyncButton() {
        const syncButton = document.getElementById('sync-button');
        if (syncButton) {
            syncButton.addEventListener('click', this.handleSyncAndSummarize.bind(this));
        }
    }

    async handleSyncAndSummarize() {
        try {
            showLoading('Starting sync and summarize...');
            const result = await api.syncAndSummarize();
            
            if (result.success) {
                showMessage('Sync and summarize completed successfully', 'success');
                this.updateLastSyncTime();
                await this.refreshData();
            } else {
                showMessage(result.message || 'Sync failed', 'error');
            }
        } catch (error) {
            showMessage(`Error during sync: ${error.message}`, 'error');
        } finally {
            hideLoading();
        }
    }

    updateLastSyncTime() {
        const lastSyncTime = new Date();
        localStorage.setItem('lastSyncTime', lastSyncTime.toISOString());
        this.displayLastSyncTime();
    }

    displayLastSyncTime() {
        const lastSyncTimeElement = document.getElementById('last-sync-time');
        if (!lastSyncTimeElement) return;

        const lastSyncTimeStr = localStorage.getItem('lastSyncTime');
        if (!lastSyncTimeStr) {
            lastSyncTimeElement.textContent = 'Never synced';
            return;
        }

        const lastSyncTime = new Date(lastSyncTimeStr);
        const now = new Date();
        const diffMs = now - lastSyncTime;
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);

        let timeAgo;
        if (diffMinutes < 1) {
            timeAgo = 'Just now';
        } else if (diffMinutes < 60) {
            timeAgo = `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
        } else if (diffHours < 24) {
            timeAgo = `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
        } else {
            timeAgo = `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
        }

        lastSyncTimeElement.textContent = `Last sync: ${timeAgo}`;
    }

    handleGlobalError(error) {
        // Don't show error notifications for network issues that might be temporary
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            console.warn('Network error (likely temporary):', error.message);
            return;
        }
        
        // Show user-friendly error message
        showMessage(`An unexpected error occurred: ${error.message}`, 'error');
    }

    showInitializationError(error) {
        const mainContent = document.querySelector('main');
        if (mainContent) {
            mainContent.innerHTML = `
                <div class="error-message">
                    <h2>Failed to Initialize Application</h2>
                    <p>There was an error starting the Twitter Collator Admin:</p>
                    <p><strong>${error.message}</strong></p>
                    <p>Please check your internet connection and try refreshing the page.</p>
                    <button onclick="location.reload()" class="wa-button wa-button--primary">
                        Refresh Page
                    </button>
                </div>
            `;
        }
    }

    // Public methods for manual operations
    async syncData() {
        try {
            showLoading('Syncing data...');
            const result = await api.syncData();
            
            if (result.success) {
                showMessage('Data sync completed successfully', 'success');
                await this.loadInitialData();
            } else {
                showMessage(result.message || 'Data sync failed', 'error');
            }
        } catch (error) {
            showMessage(`Sync error: ${error.message}`, 'error');
        } finally {
            hideLoading();
        }
    }

    clearCache() {
        api.clearCache();
        showMessage('Cache cleared successfully', 'success');
    }

    // Utility methods
    getStatus() {
        return {
            initialized: this.isInitialized,
            apiBaseURL: api.baseURL,
            refreshInterval: this.refreshIntervalMs,
            cacheSize: api.http.cache.size
        };
    }

    // Cleanup method
    destroy() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
        this.isInitialized = false;
    }
}

// Initialize the application when the DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    // Wait for WebAwesome to be ready
    if (window.customElements && window.customElements.get('wa-page')) {
        // WebAwesome is already loaded
        window.twitterApp = new TwitterCollatorApp();
        await window.twitterApp.init();
    } else {
        // Wait for WebAwesome to load
        const checkWebAwesome = setInterval(() => {
            if (window.customElements && window.customElements.get('wa-page')) {
                clearInterval(checkWebAwesome);
                window.twitterApp = new TwitterCollatorApp();
                window.twitterApp.init();
            }
        }, 100);
        
        // Fallback timeout
        setTimeout(() => {
            clearInterval(checkWebAwesome);
            if (!window.twitterApp) {
                console.warn('WebAwesome not detected, initializing anyway...');
                window.twitterApp = new TwitterCollatorApp();
                window.twitterApp.init();
            }
        }, 5000);
    }
});

// Expose some utility functions globally for debugging
window.debugTwitterApp = {
    getStatus: () => window.twitterApp?.getStatus(),
    syncData: () => window.twitterApp?.syncData(),
    clearCache: () => window.twitterApp?.clearCache(),
    refreshData: () => window.twitterApp?.refreshData(),
    checkAPIHealth: () => window.twitterApp?.api.healthCheck()
};
