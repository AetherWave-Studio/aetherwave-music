import { TimeOfDay } from '../types';

export function getTimeOfDay(): TimeOfDay {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
        return 'MORNING';
    } else if (hour >= 12 && hour < 17) {
        return 'AFTERNOON';
    } else if (hour >= 17 && hour < 21) {
        return 'EVENING';
    } else {
        return 'NIGHT';
    }
}

export function formatDuration(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function formatTimeAgo(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) {
        return 'Just now';
    } else if (minutes < 60) {
        return `${minutes}m ago`;
    } else if (hours < 24) {
        return `${hours}h ago`;
    } else {
        return `${days}d ago`;
    }
}

export function getGreeting(): string {
    const timeOfDay = getTimeOfDay();

    switch (timeOfDay) {
        case 'MORNING':
            return 'Good morning';
        case 'AFTERNOON':
            return 'Good afternoon';
        case 'EVENING':
            return 'Good evening';
        case 'NIGHT':
            return 'Good night';
    }
}

export function getSuggestedMood(): string {
    const timeOfDay = getTimeOfDay();

    switch (timeOfDay) {
        case 'MORNING':
            return 'energizing';
        case 'AFTERNOON':
            return 'focused';
        case 'EVENING':
            return 'relaxing';
        case 'NIGHT':
            return 'calm';
    }
}
