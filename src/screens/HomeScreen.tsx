import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
} from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';
import MicButton from '../components/MicButton';
import StatusText from '../components/StatusText';

export default function HomeScreen() {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');

    const handleMicPress = () => {
        setIsListening(true);
        // TODO: Implement voice recording (Week 1)

        // Simulate for now
        setTimeout(() => {
            setTranscript('morning workout');
            setIsListening(false);
        }, 2000);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>AetherWave Music</Text>
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

                {!transcript && (
                    <View style={styles.suggestions}>
                        <Text style={styles.suggestionsLabel}>Try saying:</Text>
                        <Text style={styles.suggestion}>"morning workout"</Text>
                        <Text style={styles.suggestion}>"chill vibes"</Text>
                        <Text style={styles.suggestion}>"party energy"</Text>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        padding: SPACING.lg,
        alignItems: 'center',
    },
    title: {
        ...TYPOGRAPHY.h2,
        color: COLORS.primary,
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
        color: COLORS.textSecondary,
        marginVertical: SPACING.xs,
    },
});
