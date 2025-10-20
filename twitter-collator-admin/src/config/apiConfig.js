/**
 * API Configuration
 * Centralized configuration for API base URL with development mode support
 */

const PRODUCTION_URL = 'https://twitter-collator.fly.dev';
const DEFAULT_LOCAL_URL = 'http://localhost:3000';

/**
 * Get the API base URL based on the current environment
 * Priority:
 * 1. Explicit environment variable (Node.js)
 * 2. localStorage setting (Browser)
 * 3. URL parameter (Browser)
 * 4. Auto-detect localhost (Browser)
 * 5. Production URL (default)
 */
export function getApiBaseUrl() {
    // Node.js environment variable
    if (typeof process !== 'undefined' && process.env?.API_BASE_URL) {
        return process.env.API_BASE_URL;
    }

    // Browser environment
    if (typeof window !== 'undefined') {
        // Check localStorage for dev mode setting
        const devMode = localStorage.getItem('twitter_admin_dev_mode');
        if (devMode === 'true') {
            const localUrl = localStorage.getItem('twitter_admin_local_url') || DEFAULT_LOCAL_URL;
            console.log('[API Config] Using local development server:', localUrl);
            return localUrl;
        }

        // Check URL parameter for quick testing
        const urlParams = new URLSearchParams(window.location.search);
        const devParam = urlParams.get('dev');
        if (devParam === 'true' || devParam === '1') {
            const localUrl = urlParams.get('local_url') || DEFAULT_LOCAL_URL;
            console.log('[API Config] Using local development server (from URL param):', localUrl);
            return localUrl;
        }

        // Auto-detect if running on localhost
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            const devMode = localStorage.getItem('twitter_admin_dev_mode');
            if (devMode !== 'false') { // Only skip if explicitly disabled
                const localUrl = localStorage.getItem('twitter_admin_local_url') || DEFAULT_LOCAL_URL;
                console.log('[API Config] Auto-detected localhost, using:', localUrl);
                return localUrl;
            }
        }
    }

    // Default to production
    console.log('[API Config] Using production server:', PRODUCTION_URL);
    return PRODUCTION_URL;
}

/**
 * Enable development mode (Browser only)
 */
export function enableDevMode(localUrl = DEFAULT_LOCAL_URL) {
    if (typeof localStorage !== 'undefined') {
        localStorage.setItem('twitter_admin_dev_mode', 'true');
        localStorage.setItem('twitter_admin_local_url', localUrl);
        console.log('[API Config] Development mode enabled. Local URL:', localUrl);
        console.log('[API Config] Reload the page to apply changes.');
    }
}

/**
 * Disable development mode (Browser only)
 */
export function disableDevMode() {
    if (typeof localStorage !== 'undefined') {
        localStorage.setItem('twitter_admin_dev_mode', 'false');
        console.log('[API Config] Development mode disabled.');
        console.log('[API Config] Reload the page to apply changes.');
    }
}

/**
 * Get current configuration status
 */
export function getConfigStatus() {
    const baseUrl = getApiBaseUrl();
    const isDev = baseUrl !== PRODUCTION_URL;
    
    return {
        baseUrl,
        isDevelopmentMode: isDev,
        productionUrl: PRODUCTION_URL,
        defaultLocalUrl: DEFAULT_LOCAL_URL
    };
}

// Export constants
export const API_CONFIG = {
    PRODUCTION_URL,
    DEFAULT_LOCAL_URL
};

