/**
 * Developer Tools
 * Utilities for managing development mode and API configuration
 * Can be used in browser console or imported as a module
 */

import { 
    getApiBaseUrl, 
    enableDevMode, 
    disableDevMode, 
    getConfigStatus,
    API_CONFIG 
} from '../config/apiConfig.js';

/**
 * Development Tools Interface
 * Use in browser console: window.devTools
 */
export const devTools = {
    /**
     * Enable development mode
     * @param {string} localUrl - Optional local server URL (default: http://localhost:3000)
     */
    enableDevMode(localUrl = API_CONFIG.DEFAULT_LOCAL_URL) {
        enableDevMode(localUrl);
        console.log('✅ Development mode enabled');
        console.log('🔄 Please reload the page for changes to take effect');
    },

    /**
     * Disable development mode
     */
    disableDevMode() {
        disableDevMode();
        console.log('✅ Development mode disabled');
        console.log('🔄 Please reload the page for changes to take effect');
    },

    /**
     * Get current configuration status
     */
    status() {
        const config = getConfigStatus();
        console.log('📊 API Configuration Status:');
        console.log('  Base URL:', config.baseUrl);
        console.log('  Development Mode:', config.isDevelopmentMode);
        console.log('  Production URL:', config.productionUrl);
        console.log('  Default Local URL:', config.defaultLocalUrl);
        return config;
    },

    /**
     * Quick test with a custom URL
     * Note: Add ?dev=true to URL or use devTools.enableDevMode() for persistent setting
     */
    help() {
        console.log(`
🔧 Twitter Admin Developer Tools
================================

Enable Development Mode:
  devTools.enableDevMode()              // Use default local server (http://localhost:3000)
  devTools.enableDevMode('http://localhost:8080')  // Use custom local server

Disable Development Mode:
  devTools.disableDevMode()

Check Current Status:
  devTools.status()

Quick Testing (temporary, no page reload needed):
  1. Add ?dev=true to the URL
  2. Optionally add &local_url=http://localhost:8080 for custom URL

Environment Variable (CLI only):
  export API_BASE_URL=http://localhost:3000
  node cli.js users
        `);
    }
};

// Make devTools available globally in browser
if (typeof window !== 'undefined') {
    window.devTools = devTools;
    console.log('🔧 Developer tools loaded. Type devTools.help() for more info.');
}

export default devTools;

