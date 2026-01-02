import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { formatDuration } from '../utils/timeUtils';

interface ProgressBarProps {
    positionMs: number;
    durationMs: number;
    onSeek?: (positionMs: number) => void;
}

export default function ProgressBar({
    positionMs,
    durationMs,
    onSeek,
}: ProgressBarProps) {
    const progress = durationMs > 0 ? positionMs / durationMs : 0;

    const handlePress = (event: { nativeEvent: { locationX: number } }) => {
        if (!onSeek || durationMs === 0) return;

        const barWidth = 300;
        const touchX = event.nativeEvent.locationX;
        const newPosition = (touchX / barWidth) * durationMs;
        onSeek(Math.max(0, Math.min(newPosition, durationMs)));
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.barContainer}
                onPress={handlePress}
                activeOpacity={0.8}
            >
                <View style={styles.barBackground}>
                    <LinearGradient
                        colors={[COLORS.primary, COLORS.accent]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[
                            styles.barFill,
                            { width: `${progress * 100}%` },
                        ]}
                    />
                </View>
                <View
                    style={[
                        styles.thumb,
                        { left: `${progress * 100}%` },
                    ]}
                />
            </TouchableOpacity>

            <View style={styles.timeContainer}>
                <Text style={styles.timeText}>{formatDuration(positionMs)}</Text>
                <Text style={styles.timeText}>{formatDuration(durationMs)}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingHorizontal: SPACING.lg,
    },
    barContainer: {
        height: 24,
        justifyContent: 'center',
    },
    barBackground: {
        height: 4,
        backgroundColor: COLORS.surface,
        borderRadius: 2,
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        borderRadius: 2,
    },
    thumb: {
        position: 'absolute',
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: COLORS.primary,
        marginLeft: -8,
        top: 4,
    },
    timeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: SPACING.xs,
    },
    timeText: {
        ...TYPOGRAPHY.caption,
        color: COLORS.textSecondary,
    },
});
