/**
 * Server-side API wrapper
 * Imports the TwitterCollatorAPI from src/api and makes it available to Next.js API routes
 */

import { TwitterCollatorAPI } from '../src/api/index.js';

// Create a singleton instance for the backend API
const BACKEND_URL = process.env.BACKEND_URL || 'https://twitter-collator.fly.dev';

export const backendApi = new TwitterCollatorAPI(BACKEND_URL, {
  cacheTimeout: 5 * 60 * 1000, // 5 minutes
  timeout: 10000 // 10 seconds
});

// Export the API class for creating custom instances if needed
export { TwitterCollatorAPI };


