import React, { useState, useEffect, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HomeScreen, NowPlayingScreen, SettingsScreen } from '../screens';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { useUsageTracking } from '../hooks/useUsageTracking';
import { cacheService } from '../services/cacheService';
import { apiService } from '../services/apiService';
import { Song } from '../types';
import { COLORS } from '../constants/theme';
import { CONFIG } from '../constants/config';

const API_KEY_STORAGE = 'aetherwave_api_key';

export type RootStackParamList = {
    Home: undefined;
    NowPlaying: undefined;
    Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
    const [currentSong, setCurrentSong] = useState<Song | null>(null);
    const [cacheStats, setCacheStats] = useState({ entryCount: 0, scenarios: [] as string[] });

    const {
        playbackState,
        loadSong,
        play,
        pause,
        togglePlayPause,
        seekTo,
        seekForward,
        seekBackward,
    } = useAudioPlayer();

    const { generationsRemaining, resetUsage } = useUsageTracking();

    const loadCacheStats = useCallback(async () => {
        const stats = await cacheService.getCacheStats();
        setCacheStats({
            entryCount: stats.entryCount,
            scenarios: stats.scenarios,
        });
    }, []);

    useEffect(() => {
        const initialize = async () => {
            // Load saved API key from storage
            try {
                const savedKey = await AsyncStorage.getItem(API_KEY_STORAGE);
                if (savedKey) {
                    apiService.setApiKey(savedKey);
                } else if (CONFIG.API_KEY) {
                    apiService.setApiKey(CONFIG.API_KEY);
                }
            } catch (error) {
                console.error('Failed to load API key:', error);
            }
            loadCacheStats();
        };
        initialize();
    }, [loadCacheStats]);

    const handleSongGenerated = useCallback(async (song: Song) => {
        setCurrentSong(song);
        await loadSong(song);
        await play();
        await loadCacheStats();
    }, [loadSong, play, loadCacheStats]);

    const handleClearCache = useCallback(async () => {
        await cacheService.clearCache();
        await loadCacheStats();
    }, [loadCacheStats]);

    const handleResetUsage = useCallback(async () => {
        await resetUsage();
    }, [resetUsage]);

    const playbackProgress = playbackState.durationMs > 0
        ? playbackState.positionMs / playbackState.durationMs
        : 0;

    return (
        <NavigationContainer
            theme={{
                dark: true,
                colors: {
                    primary: COLORS.primary,
                    background: COLORS.background,
                    card: COLORS.surface,
                    text: COLORS.textPrimary,
                    border: COLORS.surface,
                    notification: COLORS.accent,
                },
                fonts: {
                    regular: { fontFamily: 'System', fontWeight: '400' },
                    medium: { fontFamily: 'System', fontWeight: '500' },
                    bold: { fontFamily: 'System', fontWeight: '700' },
                    heavy: { fontFamily: 'System', fontWeight: '900' },
                },
            }}
        >
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                    animation: 'slide_from_right',
                    contentStyle: { backgroundColor: COLORS.background },
                }}
            >
                <Stack.Screen name="Home">
                    {({ navigation }) => (
                        <HomeScreen
                            onNavigateToPlayer={() => navigation.navigate('NowPlaying')}
                            onNavigateToSettings={() => navigation.navigate('Settings')}
                            currentSong={currentSong}
                            isPlaying={playbackState.isPlaying}
                            playbackProgress={playbackProgress}
                            onPlayPause={togglePlayPause}
                            onSongGenerated={handleSongGenerated}
                        />
                    )}
                </Stack.Screen>

                <Stack.Screen name="NowPlaying">
                    {({ navigation }) => (
                        <NowPlayingScreen
                            song={currentSong}
                            isPlaying={playbackState.isPlaying}
                            isGenerating={false}
                            positionMs={playbackState.positionMs}
                            durationMs={playbackState.durationMs}
                            onPlayPause={togglePlayPause}
                            onSeekBackward={seekBackward}
                            onSeekForward={seekForward}
                            onSeek={seekTo}
                            onBack={() => navigation.goBack()}
                        />
                    )}
                </Stack.Screen>

                <Stack.Screen name="Settings">
                    {({ navigation }) => (
                        <SettingsScreen
                            onBack={() => navigation.goBack()}
                            onClearCache={handleClearCache}
                            onResetUsage={handleResetUsage}
                            cacheStats={cacheStats}
                            generationsRemaining={generationsRemaining}
                        />
                    )}
                </Stack.Screen>
            </Stack.Navigator>
        </NavigationContainer>
    );
}
