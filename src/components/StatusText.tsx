import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';

interface StatusTextProps {
    isListening: boolean;
    transcript: string;
}

export default function StatusText({ isListening, transcript }: StatusTextProps) {
    const getText = () => {
        if (isListening) return 'Listening...';
        if (transcript) return `"${transcript}"`;
        return 'Tap to speak';
    };

    const getColor = () => {
        if (isListening) return COLORS.primary;
        if (transcript) return COLORS.accent;
        return COLORS.textSecondary;
    };

    return (
        <View style={styles.container}>
            <Text style={[styles.text, { color: getColor() }]}>
                {getText()}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: SPACING.xxl,
    },
    text: {
        ...TYPOGRAPHY.h3,
        textAlign: 'center',
    },
});
