import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { Song } from '../types';

interface MiniPlayerProps {
    song: Song | null;
    isPlaying: boolean;
    onPlayPause: () => void;
    onPress: () => void;
    progress: number;
}

export default function MiniPlayer({
    song,
    isPlaying,
    onPlayPause,
    onPress,
    progress,
}: MiniPlayerProps) {
    if (!song) return null;

    const handlePlayPause = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPlayPause();
    };

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
            activeOpacity={0.9}
        >
            <View style={styles.progressBar}>
                <LinearGradient
                    colors={[COLORS.primary, COLORS.accent]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.progressFill, { width: `${progress * 100}%` }]}
                />
            </View>

            <View style={styles.content}>
                <View style={styles.albumThumb}>
                    <LinearGradient
                        colors={[COLORS.primary + '60', COLORS.accent + '60']}
                        style={styles.thumbGradient}
                    >
                        <Text style={styles.thumbIcon}>🎵</Text>
                    </LinearGradient>
                </View>

                <View style={styles.info}>
                    <Text style={styles.title} numberOfLines={1}>
                        Now Playing
                    </Text>
                    <Text style={styles.subtitle} numberOfLines={1}>
                        Generated music
                    </Text>
                </View>

                <TouchableOpacity
                    style={styles.playButton}
                    onPress={handlePlayPause}
                >
                    <Text style={styles.playIcon}>
                        {isPlaying ? '⏸' : '▶'}
                    </Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.surface,
        borderTopWidth: 1,
        borderTopColor: COLORS.background,
    },
    progressBar: {
        height: 2,
        backgroundColor: COLORS.background,
    },
    progressFill: {
        height: '100%',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.sm,
        gap: SPACING.sm,
    },
    albumThumb: {
        width: 48,
        height: 48,
        borderRadius: 8,
        overflow: 'hidden',
    },
    thumbGradient: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    thumbIcon: {
        fontSize: 24,
    },
    info: {
        flex: 1,
    },
    title: {
        ...TYPOGRAPHY.body,
        color: COLORS.textPrimary,
        fontWeight: '600',
    },
    subtitle: {
        ...TYPOGRAPHY.caption,
        color: COLORS.textSecondary,
    },
    playButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    playIcon: {
        fontSize: 18,
        color: COLORS.background,
    },
});
