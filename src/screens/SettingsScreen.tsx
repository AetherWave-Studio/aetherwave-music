import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { CONFIG } from '../constants/config';
import { apiService } from '../services/apiService';

interface SettingsScreenProps {
    onBack: () => void;
    onClearCache: () => void;
    onResetUsage: () => void;
    cacheStats: {
        entryCount: number;
        scenarios: string[];
    };
    generationsRemaining: number;
}

const API_KEY_STORAGE = 'aetherwave_api_key';

export default function SettingsScreen({
    onBack,
    onClearCache,
    onResetUsage,
    cacheStats,
    generationsRemaining,
}: SettingsScreenProps) {
    const [apiKey, setApiKey] = useState('');
    const [isApiKeySaved, setIsApiKeySaved] = useState(false);

    useEffect(() => {
        loadApiKey();
    }, []);

    const loadApiKey = async () => {
        try {
            const savedKey = await AsyncStorage.getItem(API_KEY_STORAGE);
            if (savedKey) {
                setApiKey(savedKey);
                setIsApiKeySaved(true);
                apiService.setApiKey(savedKey);
            }
        } catch (error) {
            console.error('Failed to load API key:', error);
        }
    };

    const saveApiKey = async () => {
        try {
            if (apiKey.trim()) {
                await AsyncStorage.setItem(API_KEY_STORAGE, apiKey.trim());
                apiService.setApiKey(apiKey.trim());
                setIsApiKeySaved(true);
                Alert.alert('Success', 'API key saved successfully!');
            } else {
                Alert.alert('Error', 'Please enter a valid API key');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to save API key');
        }
    };

    const clearApiKey = async () => {
        Alert.alert(
            'Clear API Key',
            'Are you sure you want to remove your API key?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear',
                    style: 'destructive',
                    onPress: async () => {
                        await AsyncStorage.removeItem(API_KEY_STORAGE);
                        setApiKey('');
                        setIsApiKeySaved(false);
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>API Configuration</Text>
                    <View style={styles.card}>
                        <Text style={styles.label}>Kie.ai API Key</Text>
                        <TextInput
                            style={styles.input}
                            value={apiKey}
                            onChangeText={setApiKey}
                            placeholder="Enter your API key"
                            placeholderTextColor={COLORS.textSecondary}
                            secureTextEntry
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                        <View style={styles.buttonRow}>
                            <TouchableOpacity
                                style={styles.button}
                                onPress={saveApiKey}
                            >
                                <Text style={styles.buttonText}>
                                    {isApiKeySaved ? 'Update Key' : 'Save Key'}
                                </Text>
                            </TouchableOpacity>
                            {isApiKeySaved && (
                                <TouchableOpacity
                                    style={[styles.button, styles.buttonSecondary]}
                                    onPress={clearApiKey}
                                >
                                    <Text style={styles.buttonTextSecondary}>Clear</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                        {isApiKeySaved && (
                            <Text style={styles.savedText}>API key configured</Text>
                        )}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Usage</Text>
                    <View style={styles.card}>
                        <View style={styles.row}>
                            <Text style={styles.label}>Generations Today</Text>
                            <Text style={styles.value}>
                                {CONFIG.FREE_TIER_GENERATIONS_PER_DAY - generationsRemaining}/
                                {CONFIG.FREE_TIER_GENERATIONS_PER_DAY}
                            </Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>Remaining</Text>
                            <Text
                                style={[
                                    styles.value,
                                    generationsRemaining === 0 && styles.valueError,
                                ]}
                            >
                                {generationsRemaining}
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={styles.button}
                            onPress={onResetUsage}
                        >
                            <Text style={styles.buttonText}>Reset Usage (Dev)</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Cache</Text>
                    <View style={styles.card}>
                        <View style={styles.row}>
                            <Text style={styles.label}>Cached Scenarios</Text>
                            <Text style={styles.value}>
                                {cacheStats.entryCount}/{CONFIG.CACHE_SIZE}
                            </Text>
                        </View>
                        {cacheStats.scenarios.length > 0 && (
                            <View style={styles.scenarioList}>
                                {cacheStats.scenarios.map((scenario, index) => (
                                    <Text key={index} style={styles.scenario}>
                                        • {scenario}
                                    </Text>
                                ))}
                            </View>
                        )}
                        <TouchableOpacity
                            style={[styles.button, styles.buttonDanger]}
                            onPress={onClearCache}
                        >
                            <Text style={styles.buttonText}>Clear Cache</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Audio</Text>
                    <View style={styles.card}>
                        <View style={styles.row}>
                            <Text style={styles.label}>Quality</Text>
                            <Text style={styles.value}>{CONFIG.AUDIO_QUALITY} kbps</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>Target Latency</Text>
                            <Text style={styles.value}>{CONFIG.TARGET_LATENCY_MS}ms</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Voice</Text>
                    <View style={styles.card}>
                        <View style={styles.row}>
                            <Text style={styles.label}>Timeout</Text>
                            <Text style={styles.value}>
                                {CONFIG.VOICE_TIMEOUT_MS / 1000}s
                            </Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>Min Confidence</Text>
                            <Text style={styles.value}>
                                {CONFIG.MIN_CONFIDENCE * 100}%
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>About</Text>
                    <View style={styles.card}>
                        <View style={styles.row}>
                            <Text style={styles.label}>App Version</Text>
                            <Text style={styles.value}>1.0.0</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>API Endpoint</Text>
                            <Text style={styles.value} numberOfLines={1}>
                                {CONFIG.API_BASE_URL}
                            </Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>Cache Version</Text>
                            <Text style={styles.value}>{CONFIG.CACHE_VERSION}</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
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
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.surface,
    },
    backButton: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    backIcon: {
        fontSize: 28,
        color: COLORS.textPrimary,
    },
    headerTitle: {
        ...TYPOGRAPHY.h3,
        color: COLORS.textPrimary,
    },
    placeholder: {
        width: 44,
    },
    content: {
        flex: 1,
        padding: SPACING.md,
    },
    section: {
        marginBottom: SPACING.lg,
    },
    sectionTitle: {
        ...TYPOGRAPHY.caption,
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: SPACING.sm,
        marginLeft: SPACING.xs,
    },
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: SPACING.md,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: SPACING.sm,
    },
    label: {
        ...TYPOGRAPHY.body,
        color: COLORS.textPrimary,
    },
    value: {
        ...TYPOGRAPHY.body,
        color: COLORS.textSecondary,
        flex: 1,
        textAlign: 'right',
        marginLeft: SPACING.md,
    },
    valueError: {
        color: COLORS.error,
    },
    input: {
        backgroundColor: COLORS.background,
        borderRadius: 8,
        padding: SPACING.md,
        color: COLORS.textPrimary,
        ...TYPOGRAPHY.body,
        marginTop: SPACING.sm,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: SPACING.sm,
        marginTop: SPACING.md,
    },
    scenarioList: {
        paddingVertical: SPACING.sm,
        borderTopWidth: 1,
        borderTopColor: COLORS.background,
        marginTop: SPACING.sm,
    },
    scenario: {
        ...TYPOGRAPHY.caption,
        color: COLORS.textSecondary,
        paddingVertical: SPACING.xs,
    },
    button: {
        flex: 1,
        backgroundColor: COLORS.primary,
        borderRadius: 8,
        padding: SPACING.md,
        alignItems: 'center',
    },
    buttonSecondary: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: COLORS.textSecondary,
    },
    buttonDanger: {
        backgroundColor: COLORS.error,
        marginTop: SPACING.md,
    },
    buttonText: {
        ...TYPOGRAPHY.body,
        color: COLORS.background,
        fontWeight: '600',
    },
    buttonTextSecondary: {
        ...TYPOGRAPHY.body,
        color: COLORS.textSecondary,
        fontWeight: '600',
    },
    savedText: {
        ...TYPOGRAPHY.caption,
        color: COLORS.primary,
        textAlign: 'center',
        marginTop: SPACING.sm,
    },
});
