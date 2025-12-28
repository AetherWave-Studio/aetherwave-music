// Song types
export interface Song {
    id: string;
    audioUrl: string;
    localPath?: string;
    duration: number;
    metadata: {
        sunoId: string;
        generatedAt: string;
        playCount: number;
        userRating?: number;
    };
}

export interface CacheEntry {
    scenario: string;
    songs: {
        primary: Song;
        variation: Song;
    };
    lastUsed: number | null;
    requestsToday: number;
}

// Voice types
export interface VoiceResult {
    transcript: string;
    confidence: number;
}

// API types
export interface GenerateRequest {
    prompt: string;
    userId: string;
    count?: number;
}

export interface GenerateResponse {
    songs: Song[];
    generatedAt: string;
}

// Scenario types
export interface Scenario {
    prompt: string;
    priority: number;
    timeWindow?: {
        start: number;   // hour (0-23)
        end: number;
    };
}

export type TimeOfDay = 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT';
