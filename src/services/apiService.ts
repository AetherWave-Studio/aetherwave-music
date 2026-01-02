import axios, { AxiosInstance } from 'axios';
import { CONFIG } from '../constants/config';
import { Song, GenerateRequest, GenerateResponse } from '../types';

interface KieGenerateRequest {
    prompt: string;
    model?: string;
    duration?: number;
    make_instrumental?: boolean;
}

interface KieGenerateResponse {
    id: string;
    status: string;
    audio_url?: string;
    duration?: number;
    created_at?: string;
}

class ApiService {
    private client: AxiosInstance;
    private apiKey: string | null = null;

    constructor() {
        this.client = axios.create({
            baseURL: CONFIG.API_BASE_URL,
            timeout: CONFIG.CACHE_MISS_TIMEOUT_MS,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    setApiKey(key: string): void {
        this.apiKey = key;
        this.client.defaults.headers.common['Authorization'] = `Bearer ${key}`;
    }

    async generateMusic(request: GenerateRequest): Promise<GenerateResponse> {
        try {
            const kieRequest: KieGenerateRequest = {
                prompt: request.prompt,
                model: 'chirp-v3',
                duration: 30,
                make_instrumental: false,
            };

            const response = await this.client.post<KieGenerateResponse>(
                '/generate',
                kieRequest
            );

            const kieData = response.data;

            // Transform Kie.ai response to our Song format
            const song: Song = {
                id: kieData.id || `song_${Date.now()}`,
                audioUrl: kieData.audio_url || '',
                duration: (kieData.duration || 30) * 1000, // Convert to ms
                metadata: {
                    sunoId: kieData.id || '',
                    generatedAt: kieData.created_at || new Date().toISOString(),
                    playCount: 0,
                },
            };

            return {
                songs: [song],
                generatedAt: new Date().toISOString(),
            };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.message
                    || error.response?.data?.error
                    || 'Failed to generate music';
                throw new Error(message);
            }
            throw error;
        }
    }

    async pollForCompletion(taskId: string, maxAttempts: number = 30): Promise<Song | null> {
        for (let i = 0; i < maxAttempts; i++) {
            try {
                const response = await this.client.get<KieGenerateResponse>(
                    `/status/${taskId}`
                );

                if (response.data.status === 'completed' && response.data.audio_url) {
                    return {
                        id: response.data.id,
                        audioUrl: response.data.audio_url,
                        duration: (response.data.duration || 30) * 1000,
                        metadata: {
                            sunoId: response.data.id,
                            generatedAt: response.data.created_at || new Date().toISOString(),
                            playCount: 0,
                        },
                    };
                }

                if (response.data.status === 'failed') {
                    throw new Error('Music generation failed');
                }

                // Wait 2 seconds before next poll
                await new Promise(resolve => setTimeout(resolve, 2000));
            } catch (error) {
                if (axios.isAxiosError(error) && error.response?.status === 404) {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    continue;
                }
                throw error;
            }
        }

        throw new Error('Generation timed out');
    }

    async getSong(songId: string): Promise<Song> {
        try {
            const response = await this.client.get<KieGenerateResponse>(
                `/songs/${songId}`
            );

            return {
                id: response.data.id,
                audioUrl: response.data.audio_url || '',
                duration: (response.data.duration || 30) * 1000,
                metadata: {
                    sunoId: response.data.id,
                    generatedAt: response.data.created_at || new Date().toISOString(),
                    playCount: 0,
                },
            };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(
                    error.response?.data?.message || 'Failed to fetch song'
                );
            }
            throw error;
        }
    }

    async checkUsage(userId: string): Promise<{ remaining: number; resetAt: string }> {
        try {
            const response = await this.client.get(`/usage/${userId}`);
            return response.data;
        } catch (error) {
            // Return default if usage endpoint not available
            return {
                remaining: CONFIG.FREE_TIER_GENERATIONS_PER_DAY,
                resetAt: new Date(Date.now() + 86400000).toISOString(),
            };
        }
    }

    async healthCheck(): Promise<boolean> {
        try {
            await this.client.get('/health');
            return true;
        } catch {
            return false;
        }
    }
}

export const apiService = new ApiService();
