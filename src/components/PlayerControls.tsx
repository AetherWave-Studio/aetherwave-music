import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING } from '../constants/theme';

interface PlayerControlsProps {
    isPlaying: boolean;
    onPlayPause: () => void;
    onSeekBackward: () => void;
    onSeekForward: () => void;
    disabled?: boolean;
}

export default function PlayerControls({
    isPlaying,
    onPlayPause,
    onSeekBackward,
    onSeekForward,
    disabled = false,
}: PlayerControlsProps) {
    const handlePlayPause = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPlayPause();
    };

    const handleSeekBackward = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onSeekBackward();
    };

    const handleSeekForward = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onSeekForward();
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleSeekBackward}
                disabled={disabled}
            >
                <Text style={[styles.secondaryIcon, disabled && styles.disabled]}>
                    ⏪
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={handlePlayPause}
                disabled={disabled}
                activeOpacity={0.8}
            >
                <LinearGradient
                    colors={
                        disabled
                            ? [COLORS.surface, COLORS.surface]
                            : [COLORS.primary, COLORS.accent]
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.playButton}
                >
                    <Text style={styles.playIcon}>
                        {isPlaying ? '⏸' : '▶'}
                    </Text>
                </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleSeekForward}
                disabled={disabled}
            >
                <Text style={[styles.secondaryIcon, disabled && styles.disabled]}>
                    ⏩
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.xl,
    },
    playButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    playIcon: {
        fontSize: 32,
        color: COLORS.background,
    },
    secondaryButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: COLORS.surface,
        alignItems: 'center',
        justifyContent: 'center',
    },
    secondaryIcon: {
        fontSize: 24,
        color: COLORS.textPrimary,
    },
    disabled: {
        opacity: 0.4,
    },
});
