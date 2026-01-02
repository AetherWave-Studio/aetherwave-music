export const CONFIG = {
    // API
    API_BASE_URL: 'https://api.kie.ai/api/v1',
    API_KEY: 'b1bde5cbe1b55cf0c492afe2b97fb133', // Set your Kie.ai API key here

    // Cache
    CACHE_SIZE: 4,                           // 4 scenarios
    CACHE_VERSION: '1.0.0',
    CACHE_STORAGE_KEY: 'music_cache',

    // Audio
    AUDIO_QUALITY: 128,                     // kbps
    FILLER_TRACK_URL: 'assets/sounds/filler-ambient.mp3',

    // Playback
    TARGET_LATENCY_MS: 500,                 // 0.5s target
    CACHE_MISS_TIMEOUT_MS: 15000,           // 15s to generate

    // Voice
    VOICE_TIMEOUT_MS: 5000,                 // 5s max recording
    MIN_CONFIDENCE: 0.7,                    // 70% transcription confidence

    // Analytics
    ENABLE_ANALYTICS: true,

    // Free tier limits
    FREE_TIER_GENERATIONS_PER_DAY: 3,
};
