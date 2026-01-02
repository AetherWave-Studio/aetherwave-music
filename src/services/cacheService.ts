import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONFIG } from '../constants/config';
import { Song, CacheEntry } from '../types';
import { audioService } from './audioService';

interface CacheData {
    version: string;
    entries: CacheEntry[];
    lastUpdated: number;
}

class CacheService {
    private cache: CacheData | null = null;

    async initialize(): Promise<void> {
        await this.loadCache();
    }

    private async loadCache(): Promise<void> {
        try {
            const stored = await AsyncStorage.getItem(CONFIG.CACHE_STORAGE_KEY);
            if (stored) {
                const data = JSON.parse(stored) as CacheData;
                if (data.version === CONFIG.CACHE_VERSION) {
                    this.cache = data;
                } else {
                    await this.clearCache();
                }
            } else {
                this.cache = {
                    version: CONFIG.CACHE_VERSION,
                    entries: [],
                    lastUpdated: Date.now(),
                };
            }
        } catch {
            this.cache = {
                version: CONFIG.CACHE_VERSION,
                entries: [],
                lastUpdated: Date.now(),
            };
        }
    }

    private async saveCache(): Promise<void> {
        if (!this.cache) return;
        this.cache.lastUpdated = Date.now();
        await AsyncStorage.setItem(
            CONFIG.CACHE_STORAGE_KEY,
            JSON.stringify(this.cache)
        );
    }

    async getCachedSong(scenario: string): Promise<Song | null> {
        if (!this.cache) await this.loadCache();

        const entry = this.cache?.entries.find(
            (e) => e.scenario.toLowerCase() === scenario.toLowerCase()
        );

        if (entry) {
            entry.lastUsed = Date.now();
            await this.saveCache();
            return entry.songs.primary;
        }

        return null;
    }

    async cacheSongs(scenario: string, songs: Song[]): Promise<void> {
        if (!this.cache) await this.loadCache();
        if (!this.cache) return;

        const existingIndex = this.cache.entries.findIndex(
            (e) => e.scenario.toLowerCase() === scenario.toLowerCase()
        );

        const newEntry: CacheEntry = {
            scenario,
            songs: {
                primary: songs[0],
                variation: songs[1] || songs[0],
            },
            lastUsed: Date.now(),
            requestsToday: 1,
        };

        if (existingIndex >= 0) {
            this.cache.entries[existingIndex] = newEntry;
        } else {
            if (this.cache.entries.length >= CONFIG.CACHE_SIZE) {
                const oldestIndex = this.findOldestEntry();
                await this.evictEntry(oldestIndex);
            }
            this.cache.entries.push(newEntry);
        }

        await this.saveCache();
    }

    private findOldestEntry(): number {
        if (!this.cache || this.cache.entries.length === 0) return 0;

        let oldestIndex = 0;
        let oldestTime = Infinity;

        this.cache.entries.forEach((entry, index) => {
            const time = entry.lastUsed || 0;
            if (time < oldestTime) {
                oldestTime = time;
                oldestIndex = index;
            }
        });

        return oldestIndex;
    }

    private async evictEntry(index: number): Promise<void> {
        if (!this.cache) return;

        const entry = this.cache.entries[index];
        if (entry) {
            if (entry.songs.primary.localPath) {
                await audioService.deleteLocalFile(entry.songs.primary.localPath);
            }
            if (entry.songs.variation.localPath) {
                await audioService.deleteLocalFile(entry.songs.variation.localPath);
            }
            this.cache.entries.splice(index, 1);
        }
    }

    async clearCache(): Promise<void> {
        if (this.cache) {
            for (const entry of this.cache.entries) {
                if (entry.songs.primary.localPath) {
                    await audioService.deleteLocalFile(entry.songs.primary.localPath);
                }
                if (entry.songs.variation.localPath) {
                    await audioService.deleteLocalFile(entry.songs.variation.localPath);
                }
            }
        }

        this.cache = {
            version: CONFIG.CACHE_VERSION,
            entries: [],
            lastUpdated: Date.now(),
        };

        await AsyncStorage.removeItem(CONFIG.CACHE_STORAGE_KEY);
    }

    async getCacheStats(): Promise<{
        entryCount: number;
        scenarios: string[];
        lastUpdated: number;
    }> {
        if (!this.cache) await this.loadCache();

        return {
            entryCount: this.cache?.entries.length || 0,
            scenarios: this.cache?.entries.map((e) => e.scenario) || [],
            lastUpdated: this.cache?.lastUpdated || 0,
        };
    }
}

export const cacheService = new CacheService();
