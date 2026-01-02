import { Scenario, TimeOfDay } from '../types';
import { getTimeOfDay } from './timeUtils';

const SCENARIO_KEYWORDS: Record<string, string[]> = {
    workout: ['workout', 'exercise', 'gym', 'running', 'training', 'fitness'],
    relax: ['relax', 'chill', 'calm', 'peaceful', 'zen', 'meditation'],
    focus: ['focus', 'work', 'study', 'concentrate', 'productive'],
    party: ['party', 'dance', 'celebration', 'fun', 'upbeat', 'energy'],
    sleep: ['sleep', 'bedtime', 'night', 'lullaby', 'dreamy'],
    morning: ['morning', 'wake', 'sunrise', 'coffee', 'breakfast'],
    evening: ['evening', 'sunset', 'dinner', 'wind down'],
};

const TIME_BASED_SCENARIOS: Record<TimeOfDay, Scenario[]> = {
    MORNING: [
        { prompt: 'energizing morning music', priority: 1 },
        { prompt: 'uplifting wake up vibes', priority: 2 },
    ],
    AFTERNOON: [
        { prompt: 'focused work music', priority: 1 },
        { prompt: 'productive afternoon beats', priority: 2 },
    ],
    EVENING: [
        { prompt: 'relaxing evening music', priority: 1 },
        { prompt: 'chill sunset vibes', priority: 2 },
    ],
    NIGHT: [
        { prompt: 'calm night music', priority: 1 },
        { prompt: 'peaceful sleep sounds', priority: 2 },
    ],
};

export function matchScenario(input: string): Scenario | null {
    const normalizedInput = input.toLowerCase().trim();

    for (const [category, keywords] of Object.entries(SCENARIO_KEYWORDS)) {
        for (const keyword of keywords) {
            if (normalizedInput.includes(keyword)) {
                return {
                    prompt: `${category} ${normalizedInput}`,
                    priority: 1,
                };
            }
        }
    }

    return null;
}

export function getTimeBasedScenario(): Scenario {
    const timeOfDay = getTimeOfDay();
    const scenarios = TIME_BASED_SCENARIOS[timeOfDay];
    return scenarios[0];
}

export function enhancePrompt(userPrompt: string): string {
    const timeOfDay = getTimeOfDay();
    const normalizedPrompt = userPrompt.toLowerCase().trim();

    const hasTimeContext =
        normalizedPrompt.includes('morning') ||
        normalizedPrompt.includes('afternoon') ||
        normalizedPrompt.includes('evening') ||
        normalizedPrompt.includes('night');

    if (hasTimeContext) {
        return normalizedPrompt;
    }

    const timeContextMap: Record<TimeOfDay, string> = {
        MORNING: 'morning',
        AFTERNOON: 'afternoon',
        EVENING: 'evening',
        NIGHT: 'night',
    };

    return `${timeContextMap[timeOfDay]} ${normalizedPrompt}`;
}

export function getSuggestions(): string[] {
    const timeOfDay = getTimeOfDay();

    const baseSuggestions: Record<TimeOfDay, string[]> = {
        MORNING: [
            'morning workout',
            'energizing coffee time',
            'upbeat start',
        ],
        AFTERNOON: [
            'focused work session',
            'afternoon productivity',
            'study music',
        ],
        EVENING: [
            'relaxing evening',
            'chill dinner vibes',
            'sunset melodies',
        ],
        NIGHT: [
            'calm night sounds',
            'peaceful sleep',
            'dreamy ambience',
        ],
    };

    return baseSuggestions[timeOfDay];
}
