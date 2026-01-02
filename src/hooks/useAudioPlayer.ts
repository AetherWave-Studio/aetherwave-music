import { useState, useEffect, useCallback, useRef } from 'react';
import { AVPlaybackStatus, AVPlaybackStatusSuccess } from 'expo-av';
import { audioService } from '../services/audioService';
import { Song } from '../types';

interface PlaybackState {
    isPlaying: boolean;
    isLoaded: boolean;
    isBuffering: boolean;
    positionMs: number;
    durationMs: number;
    volume: number;
}

interface UseAudioPlayerReturn {
    playbackState: PlaybackState;
    currentSong: Song | null;
    loadSong: (song: Song) => Promise<void>;
    play: () => Promise<void>;
    pause: () => Promise<void>;
    togglePlayPause: () => Promise<void>;
    seekTo: (positionMs: number) => Promise<void>;
    seekForward: (ms?: number) => Promise<void>;
    seekBackward: (ms?: number) => Promise<void>;
    setVolume: (volume: number) => Promise<void>;
    stop: () => Promise<void>;
}

const initialPlaybackState: PlaybackState = {
    isPlaying: false,
    isLoaded: false,
    isBuffering: false,
    positionMs: 0,
    durationMs: 0,
    volume: 1,
};

export function useAudioPlayer(): UseAudioPlayerReturn {
    const [playbackState, setPlaybackState] = useState<PlaybackState>(initialPlaybackState);
    const [currentSong, setCurrentSong] = useState<Song | null>(null);
    const isLoadedRef = useRef(false);

    const handlePlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
        if (status.isLoaded) {
            const loadedStatus = status as AVPlaybackStatusSuccess;
            setPlaybackState({
                isPlaying: loadedStatus.isPlaying,
                isLoaded: true,
                isBuffering: loadedStatus.isBuffering,
                positionMs: loadedStatus.positionMillis,
                durationMs: loadedStatus.durationMillis || 0,
                volume: loadedStatus.volume,
            });

            if (loadedStatus.didJustFinish) {
                setPlaybackState((prev) => ({
                    ...prev,
                    isPlaying: false,
                    positionMs: 0,
                }));
            }
        } else {
            if (!isLoadedRef.current) {
                setPlaybackState(initialPlaybackState);
            }
        }
    }, []);

    useEffect(() => {
        return () => {
            audioService.cleanup();
        };
    }, []);

    const loadSong = useCallback(async (song: Song) => {
        try {
            isLoadedRef.current = false;
            setPlaybackState(initialPlaybackState);
            setCurrentSong(song);

            await audioService.loadSong(song);
            audioService.setOnPlaybackStatusUpdate(handlePlaybackStatusUpdate);

            isLoadedRef.current = true;

            const status = await audioService.getStatus();
            if (status) {
                setPlaybackState({
                    isPlaying: status.isPlaying,
                    isLoaded: true,
                    isBuffering: status.isBuffering,
                    positionMs: status.positionMillis,
                    durationMs: status.durationMillis || 0,
                    volume: status.volume,
                });
            }
        } catch (error) {
            console.error('Failed to load song:', error);
            setPlaybackState(initialPlaybackState);
        }
    }, [handlePlaybackStatusUpdate]);

    const play = useCallback(async () => {
        if (playbackState.isLoaded) {
            await audioService.play();
        }
    }, [playbackState.isLoaded]);

    const pause = useCallback(async () => {
        if (playbackState.isLoaded) {
            await audioService.pause();
        }
    }, [playbackState.isLoaded]);

    const togglePlayPause = useCallback(async () => {
        if (playbackState.isPlaying) {
            await pause();
        } else {
            await play();
        }
    }, [playbackState.isPlaying, play, pause]);

    const seekTo = useCallback(async (positionMs: number) => {
        if (playbackState.isLoaded) {
            const clampedPosition = Math.max(
                0,
                Math.min(positionMs, playbackState.durationMs)
            );
            await audioService.seekTo(clampedPosition);
        }
    }, [playbackState.isLoaded, playbackState.durationMs]);

    const seekForward = useCallback(async (ms: number = 10000) => {
        await seekTo(playbackState.positionMs + ms);
    }, [playbackState.positionMs, seekTo]);

    const seekBackward = useCallback(async (ms: number = 10000) => {
        await seekTo(playbackState.positionMs - ms);
    }, [playbackState.positionMs, seekTo]);

    const setVolume = useCallback(async (volume: number) => {
        if (playbackState.isLoaded) {
            await audioService.setVolume(volume);
        }
    }, [playbackState.isLoaded]);

    const stop = useCallback(async () => {
        await audioService.stop();
        setPlaybackState((prev) => ({
            ...prev,
            isPlaying: false,
            positionMs: 0,
        }));
    }, []);

    return {
        playbackState,
        currentSong,
        loadSong,
        play,
        pause,
        togglePlayPause,
        seekTo,
        seekForward,
        seekBackward,
        setVolume,
        stop,
    };
}
