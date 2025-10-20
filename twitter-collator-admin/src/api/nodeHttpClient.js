/**
 * Node.js HTTP Client
 * Compatible version of HttpClient for Node.js environments
 */

import https from 'https';
import { URL } from 'url';

export class NodeHttpClient {
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

        return new Promise((resolve, reject) => {
            const urlObj = new URL(url);
            const requestOptions = {
                hostname: urlObj.hostname,
                port: urlObj.port || 443,
                path: urlObj.pathname + urlObj.search,
                method: options.method || 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Twitter-Collator-CLI/1.0',
                    ...options.headers
                }
            };

            const req = https.request(requestOptions, (res) => {
                let data = '';
                
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    try {
                        const jsonData = JSON.parse(data);
                        
                        if (res.statusCode < 200 || res.statusCode >= 300) {
                            reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
                            return;
                        }

                        // Cache successful responses
                        this.cache.set(cacheKey, {
                            data: jsonData,
                            timestamp: Date.now()
                        });

                        resolve(jsonData);
                    } catch (error) {
                        reject(new Error(`Failed to parse JSON: ${error.message}`));
                    }
                });
            });

            req.on('error', (error) => {
                reject(new Error(`Request failed: ${error.message}`));
            });

            if (options.body) {
                req.write(JSON.stringify(options.body));
            }

            req.end();
        });
    }

    async get(endpoint, options = {}) {
        return this.request(endpoint, { method: 'GET', ...options });
    }

    async post(endpoint, body, options = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: body,
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
