import { useState, useCallback } from 'react';
import { Song } from '../types';
import { apiService } from '../services/apiService';
import { cacheService } from '../services/cacheService';
import { audioService } from '../services/audioService';

interface UseMusicGenerationReturn {
    isGenerating: boolean;
    isLoading: boolean;
    error: string | null;
    currentSong: Song | null;
    generateMusic: (prompt: string, userId: string) => Promise<Song | null>;
    clearError: () => void;
}

export function useMusicGeneration(): UseMusicGenerationReturn {
    const [isGenerating, setIsGenerating] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentSong, setCurrentSong] = useState<Song | null>(null);

    const generateMusic = useCallback(
        async (prompt: string, userId: string): Promise<Song | null> => {
            setError(null);
            setIsLoading(true);

            try {
                // Check cache first
                const cachedSong = await cacheService.getCachedSong(prompt);
                if (cachedSong) {
                    setCurrentSong(cachedSong);
                    setIsLoading(false);
                    return cachedSong;
                }

                // Generate new music
                setIsGenerating(true);
                const response = await apiService.generateMusic({
                    prompt,
                    userId,
                    count: 2,
                });

                if (response.songs.length > 0) {
                    const song = response.songs[0];

                    // Download to local storage
                    try {
                        const localPath = await audioService.downloadToLocal(
                            song.audioUrl,
                            `${song.id}.mp3`
                        );
                        song.localPath = localPath;
                    } catch (downloadError) {
                        console.warn('Failed to download song locally:', downloadError);
                    }

                    // Cache the songs
                    await cacheService.cacheSongs(prompt, response.songs);

                    setCurrentSong(song);
                    return song;
                }

                setError('No songs were generated');
                return null;
            } catch (e) {
                const message = e instanceof Error ? e.message : 'Failed to generate music';
                setError(message);
                return null;
            } finally {
                setIsGenerating(false);
                setIsLoading(false);
            }
        },
        []
    );

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        isGenerating,
        isLoading,
        error,
        currentSong,
        generateMusic,
        clearError,
    };
}
