'use client';

import { useState, useEffect, useCallback } from 'react';
import type { State } from 'swr';

const CACHE_KEY = 'portfolio-swr-cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes default TTL

// SWR's internal State structure
interface CacheState extends State {
    // SWR State already includes: data, error, isValidating, etc.
}

type CacheEntry = {
    state: CacheState;
    timestamp: number;
    expiresAt: number;
};

// In-memory fallback for SSR
const memoryCache = new Map<string, CacheEntry>();

function isBrowser(): boolean {
    return typeof window !== 'undefined';
}

function getStorage() {
    if (!isBrowser()) return null;
    try {
        return window.localStorage;
    } catch {
        return null;
    }
}

export function getCacheProvider() {
    const storage = getStorage();

    return {
        get: (key: string): CacheState | undefined => {
            // Try localStorage first
            if (storage) {
                try {
                    const item = storage.getItem(`${CACHE_KEY}:${key}`);
                    if (item) {
                        const entry: CacheEntry = JSON.parse(item);
                        if (entry.expiresAt > Date.now()) {
                            return entry.state;
                        }
                        // Expired, clean up
                        storage.removeItem(`${CACHE_KEY}:${key}`);
                    }
                } catch {
                    // Fall through to memory cache
                }
            }

            // Fallback to memory cache
            const memEntry = memoryCache.get(key);
            if (memEntry && memEntry.expiresAt > Date.now()) {
                return memEntry.state;
            }
            memoryCache.delete(key);
            return undefined;
        },

        set: (key: string, value: CacheState): void => {
            const entry: CacheEntry = {
                state: value,
                timestamp: Date.now(),
                expiresAt: Date.now() + CACHE_TTL,
            };

            // Always update memory cache
            memoryCache.set(key, entry);

            // Try localStorage
            if (storage) {
                try {
                    storage.setItem(`${CACHE_KEY}:${key}`, JSON.stringify(entry));
                } catch {
                    // Storage might be full, ignore
                }
            }
        },

        delete: (key: string): void => {
            memoryCache.delete(key);
            if (storage) {
                try {
                    storage.removeItem(`${CACHE_KEY}:${key}`);
                } catch {
                    // Ignore
                }
            }
        },

        keys: (): IterableIterator<string> => {
            const keys = new Set<string>();

            // Add memory cache keys
            for (const key of memoryCache.keys()) {
                keys.add(key);
            }

            // Add localStorage keys
            if (storage) {
                try {
                    for (let i = 0; i < storage.length; i++) {
                        const k = storage.key(i);
                        if (k?.startsWith(`${CACHE_KEY}:`)) {
                            keys.add(k.slice(`${CACHE_KEY}:`.length));
                        }
                    }
                } catch {
                    // Ignore
                }
            }

            return keys.values();
        },
    };
}

// Helper to clear expired entries on app start
export function cleanupExpiredCache(): void {
    const storage = getStorage();
    if (!storage) return;

    try {
        const now = Date.now();
        for (let i = storage.length - 1; i >= 0; i--) {
            const key = storage.key(i);
            if (key?.startsWith(`${CACHE_KEY}:`)) {
                try {
                    const item = storage.getItem(key);
                    if (item) {
                        const entry: CacheEntry = JSON.parse(item);
                        if (entry.expiresAt <= now) {
                            storage.removeItem(key);
                        }
                    }
                } catch {
                    storage.removeItem(key);
                }
            }
        }
    } catch {
        // Ignore
    }
}

// Hook to clear specific cache entries
export function useCacheInvalidation() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        cleanupExpiredCache();
    }, []);

    const clearCache = useCallback((pattern?: string | RegExp) => {
        if (!mounted) return;

        const storage = getStorage();
        if (!storage) return;

        if (!pattern) {
            // Clear all
            cleanupExpiredCache();
            return;
        }

        // Clear matching entries
        const regex = typeof pattern === 'string'
            ? new RegExp(pattern.replace(/\*/g, '.*'))
            : pattern;

        for (let i = storage.length - 1; i >= 0; i--) {
            const key = storage.key(i);
            if (key?.startsWith(`${CACHE_KEY}:`)) {
                const cacheKey = key.slice(`${CACHE_KEY}:`.length);
                if (regex.test(cacheKey)) {
                    storage.removeItem(key);
                    memoryCache.delete(cacheKey);
                }
            }
        }
    }, [mounted]);

    return { clearCache };
}
