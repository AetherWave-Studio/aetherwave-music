import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';

interface SongInfoProps {
    title: string;
    subtitle?: string;
    isGenerating?: boolean;
}

export default function SongInfo({
    title,
    subtitle,
    isGenerating = false,
}: SongInfoProps) {
    return (
        <View style={styles.container}>
            <View style={styles.albumArt}>
                <LinearGradient
                    colors={[COLORS.primary + '40', COLORS.accent + '40']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.albumGradient}
                >
                    <Text style={styles.albumIcon}>
                        {isGenerating ? '✨' : '🎵'}
                    </Text>
                </LinearGradient>
            </View>

            <Text style={styles.title} numberOfLines={2}>
                {isGenerating ? 'Generating...' : title}
            </Text>

            {subtitle && (
                <Text style={styles.subtitle} numberOfLines={1}>
                    {subtitle}
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        paddingHorizontal: SPACING.xl,
    },
    albumArt: {
        width: 200,
        height: 200,
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: SPACING.xl,
    },
    albumGradient: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    albumIcon: {
        fontSize: 80,
    },
    title: {
        ...TYPOGRAPHY.h2,
        color: COLORS.textPrimary,
        textAlign: 'center',
        marginBottom: SPACING.sm,
    },
    subtitle: {
        ...TYPOGRAPHY.body,
        color: COLORS.textSecondary,
        textAlign: 'center',
    },
});
