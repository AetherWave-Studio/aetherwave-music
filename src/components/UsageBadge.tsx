import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { CONFIG } from '../constants/config';

interface UsageBadgeProps {
    remaining: number;
}

export default function UsageBadge({ remaining }: UsageBadgeProps) {
    const isLow = remaining <= 1;
    const isEmpty = remaining === 0;

    return (
        <View
            style={[
                styles.container,
                isLow && styles.containerLow,
                isEmpty && styles.containerEmpty,
            ]}
        >
            <Text
                style={[
                    styles.text,
                    isLow && styles.textLow,
                    isEmpty && styles.textEmpty,
                ]}
            >
                {remaining}/{CONFIG.FREE_TIER_GENERATIONS_PER_DAY} generations left
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs,
        borderRadius: 12,
        backgroundColor: COLORS.surface,
    },
    containerLow: {
        backgroundColor: COLORS.warning + '20',
    },
    containerEmpty: {
        backgroundColor: COLORS.error + '20',
    },
    text: {
        ...TYPOGRAPHY.caption,
        color: COLORS.textSecondary,
    },
    textLow: {
        color: COLORS.warning,
    },
    textEmpty: {
        color: COLORS.error,
    },
});
