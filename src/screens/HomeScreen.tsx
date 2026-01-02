import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    Alert,
    Platform,
} from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { MicButton, StatusText, UsageBadge, GeneratingOverlay, MiniPlayer } from '../components';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { useMusicGeneration } from '../hooks/useMusicGeneration';
import { useUsageTracking } from '../hooks/useUsageTracking';
import { getSuggestions, getGreeting, enhancePrompt } from '../utils';
import { getDeviceId } from '../utils/deviceUtils';
import { cacheService } from '../services/cacheService';
import { Song } from '../types';

interface HomeScreenProps {
    onNavigateToPlayer: () => void;
    onNavigateToSettings: () => void;
    currentSong: Song | null;
    isPlaying: boolean;
    playbackProgress: number;
    onPlayPause: () => void;
    onSongGenerated: (song: Song) => void;
}

export default function HomeScreen({
    onNavigateToPlayer,
    onNavigateToSettings,
    currentSong,
    isPlaying,
    playbackProgress,
    onPlayPause,
    onSongGenerated,
}: HomeScreenProps) {
    const [userId, setUserId] = useState<string>('');
    const suggestions = getSuggestions();
    const greeting = getGreeting();

    const {
        isListening,
        transcript,
        error: voiceError,
        startListening,
        stopListening,
        resetTranscript,
    } = useVoiceRecognition();

    const {
        isGenerating,
        isLoading,
        error: genError,
        generateMusic,
        clearError,
    } = useMusicGeneration();

    const { generationsRemaining, canGenerate, recordGeneration } = useUsageTracking();

    useEffect(() => {
        const init = async () => {
            const id = await getDeviceId();
            setUserId(id);
            await cacheService.initialize();
        };
        init();
    }, []);

    useEffect(() => {
        if (voiceError) {
            // Voice recognition might not work on all platforms
            console.warn('Voice error:', voiceError);
        }
    }, [voiceError]);

    useEffect(() => {
        if (genError) {
            Alert.alert('Generation Error', genError, [
                { text: 'OK', onPress: clearError },
            ]);
        }
    }, [genError, clearError]);

    const handleMicPress = useCallback(async () => {
        if (isListening) {
            await stopListening();
        } else {
            if (!canGenerate) {
                Alert.alert(
                    'Daily Limit Reached',
                    'You have used all your free generations for today. Try again tomorrow!',
                    [{ text: 'OK' }]
                );
                return;
            }
            resetTranscript();
            await startListening();
        }
    }, [isListening, canGenerate, startListening, stopListening, resetTranscript]);

    const handleGenerate = useCallback(async (prompt: string) => {
        if (!canGenerate || !userId) return;

        const enhancedPrompt = enhancePrompt(prompt);
        const song = await generateMusic(enhancedPrompt, userId);

        if (song) {
            await recordGeneration();
            onSongGenerated(song);
        }
    }, [canGenerate, userId, generateMusic, recordGeneration, onSongGenerated]);

    useEffect(() => {
        if (transcript && !isListening && transcript.length > 2) {
            handleGenerate(transcript);
        }
    }, [transcript, isListening, handleGenerate]);

    const handleSuggestionPress = (suggestion: string) => {
        if (!canGenerate) {
            Alert.alert(
                'Daily Limit Reached',
                'You have used all your free generations for today.',
                [{ text: 'OK' }]
            );
            return;
        }
        handleGenerate(suggestion);
    };

    return (
        <SafeAreaView style={styles.container}>
            <GeneratingOverlay isVisible={isGenerating} prompt={transcript} />

            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>{greeting}</Text>
                    <Text style={styles.title}>AetherWave</Text>
                </View>
                <TouchableOpacity
                    style={styles.settingsButton}
                    onPress={onNavigateToSettings}
                >
                    <Text style={styles.settingsIcon}>⚙️</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.usageContainer}>
                <UsageBadge remaining={generationsRemaining} />
            </View>

            <View style={styles.content}>
                <StatusText
                    isListening={isListening}
                    transcript={transcript}
                />

                <MicButton
                    onPress={handleMicPress}
                    isActive={isListening}
                />

                {!transcript && !isGenerating && (
                    <View style={styles.suggestions}>
                        <Text style={styles.suggestionsLabel}>Try saying:</Text>
                        {suggestions.map((suggestion, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => handleSuggestionPress(suggestion)}
                            >
                                <Text style={styles.suggestion}>"{suggestion}"</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </View>

            <MiniPlayer
                song={currentSong}
                isPlaying={isPlaying}
                onPlayPause={onPlayPause}
                onPress={onNavigateToPlayer}
                progress={playbackProgress}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: SPACING.lg,
    },
    greeting: {
        ...TYPOGRAPHY.caption,
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    title: {
        ...TYPOGRAPHY.h1,
        color: COLORS.primary,
    },
    settingsButton: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    settingsIcon: {
        fontSize: 24,
    },
    usageContainer: {
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.xl,
    },
    suggestions: {
        marginTop: SPACING.xxl,
        alignItems: 'center',
    },
    suggestionsLabel: {
        ...TYPOGRAPHY.caption,
        color: COLORS.textSecondary,
        marginBottom: SPACING.sm,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    suggestion: {
        ...TYPOGRAPHY.body,
        color: COLORS.accent,
        marginVertical: SPACING.xs,
    },
});
