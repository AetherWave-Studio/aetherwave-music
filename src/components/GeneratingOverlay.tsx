import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';

interface GeneratingOverlayProps {
    isVisible: boolean;
    prompt?: string;
}

export default function GeneratingOverlay({
    isVisible,
    prompt,
}: GeneratingOverlayProps) {
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (isVisible) {
            Animated.loop(
                Animated.timing(rotateAnim, {
                    toValue: 1,
                    duration: 2000,
                    easing: Easing.linear,
                    useNativeDriver: true,
                })
            ).start();

            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.1,
                        duration: 800,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 800,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        } else {
            rotateAnim.stopAnimation();
            pulseAnim.stopAnimation();
            rotateAnim.setValue(0);
            pulseAnim.setValue(1);
        }
    }, [isVisible, rotateAnim, pulseAnim]);

    if (!isVisible) return null;

    const spin = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <View style={styles.overlay}>
            <Animated.View
                style={[
                    styles.iconContainer,
                    {
                        transform: [
                            { rotate: spin },
                            { scale: pulseAnim },
                        ],
                    },
                ]}
            >
                <LinearGradient
                    colors={[COLORS.primary, COLORS.accent]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.iconGradient}
                >
                    <Text style={styles.icon}>✨</Text>
                </LinearGradient>
            </Animated.View>

            <Text style={styles.title}>Generating Music</Text>
            {prompt && (
                <Text style={styles.prompt}>"{prompt}"</Text>
            )}
            <Text style={styles.subtitle}>This may take a few seconds...</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: COLORS.background + 'F0',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
    },
    iconContainer: {
        marginBottom: SPACING.xl,
    },
    iconGradient: {
        width: 120,
        height: 120,
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        fontSize: 48,
    },
    title: {
        ...TYPOGRAPHY.h2,
        color: COLORS.textPrimary,
        marginBottom: SPACING.sm,
    },
    prompt: {
        ...TYPOGRAPHY.body,
        color: COLORS.primary,
        marginBottom: SPACING.md,
        textAlign: 'center',
        paddingHorizontal: SPACING.xl,
    },
    subtitle: {
        ...TYPOGRAPHY.caption,
        color: COLORS.textSecondary,
    },
});
