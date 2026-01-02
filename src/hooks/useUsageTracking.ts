import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONFIG } from '../constants/config';

interface UsageData {
    generationsToday: number;
    lastResetDate: string;
}

interface UseUsageTrackingReturn {
    generationsRemaining: number;
    canGenerate: boolean;
    recordGeneration: () => Promise<void>;
    resetUsage: () => Promise<void>;
    isLoading: boolean;
}

const USAGE_STORAGE_KEY = 'aetherwave_usage';

function getTodayDateString(): string {
    return new Date().toISOString().split('T')[0];
}

export function useUsageTracking(): UseUsageTrackingReturn {
    const [usageData, setUsageData] = useState<UsageData>({
        generationsToday: 0,
        lastResetDate: getTodayDateString(),
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadUsageData();
    }, []);

    const loadUsageData = async () => {
        try {
            const stored = await AsyncStorage.getItem(USAGE_STORAGE_KEY);
            if (stored) {
                const data = JSON.parse(stored) as UsageData;
                const today = getTodayDateString();

                if (data.lastResetDate !== today) {
                    const resetData: UsageData = {
                        generationsToday: 0,
                        lastResetDate: today,
                    };
                    await AsyncStorage.setItem(
                        USAGE_STORAGE_KEY,
                        JSON.stringify(resetData)
                    );
                    setUsageData(resetData);
                } else {
                    setUsageData(data);
                }
            }
        } catch (error) {
            console.error('Failed to load usage data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const recordGeneration = useCallback(async () => {
        const today = getTodayDateString();
        const newData: UsageData = {
            generationsToday:
                usageData.lastResetDate === today
                    ? usageData.generationsToday + 1
                    : 1,
            lastResetDate: today,
        };

        setUsageData(newData);
        await AsyncStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(newData));
    }, [usageData]);

    const resetUsage = useCallback(async () => {
        const resetData: UsageData = {
            generationsToday: 0,
            lastResetDate: getTodayDateString(),
        };
        setUsageData(resetData);
        await AsyncStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(resetData));
    }, []);

    const generationsRemaining = Math.max(
        0,
        CONFIG.FREE_TIER_GENERATIONS_PER_DAY - usageData.generationsToday
    );

    const canGenerate = generationsRemaining > 0;

    return {
        generationsRemaining,
        canGenerate,
        recordGeneration,
        resetUsage,
        isLoading,
    };
}
