/**
 * HTTP Client with caching
 * Handles all HTTP requests with built-in caching and error handling
 */

export class HttpClient {
    constructor(baseURL, options = {}) {
        this.baseURL = baseURL;
        this.cache = new Map();
        this.cacheTimeout = options.cacheTimeout || 5 * 60 * 1000; // 5 minutes
        this.timeout = options.timeout || 10000; // 10 seconds
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const cacheKey = `${url}-${JSON.stringify(options)}`;
        
        // Check cache first
        const cached = this.cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }

        try {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            // Cache successful responses
            this.cache.set(cacheKey, {
                data,
                timestamp: Date.now()
            });

            return data;
        } catch (error) {
            console.error(`API Error for ${url}:`, error);
            throw error;
        }
    }

    async get(endpoint, options = {}) {
        return this.request(endpoint, { method: 'GET', ...options });
    }

    async post(endpoint, body, options = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(body),
            ...options
        });
    }

    async delete(endpoint, options = {}) {
        return this.request(endpoint, { method: 'DELETE', ...options });
    }

    clearCache() {
        this.cache.clear();
    }
}
