import { useState, useEffect, useCallback } from 'react';
import Voice, {
    SpeechResultsEvent,
    SpeechErrorEvent,
} from '@react-native-voice/voice';
import { VoiceResult } from '../types';
import { CONFIG } from '../constants/config';

interface UseVoiceRecognitionReturn {
    isListening: boolean;
    transcript: string;
    confidence: number;
    error: string | null;
    startListening: () => Promise<void>;
    stopListening: () => Promise<void>;
    resetTranscript: () => void;
}

export function useVoiceRecognition(): UseVoiceRecognitionReturn {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [confidence, setConfidence] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [timeoutId, setTimeoutId] = useState<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        Voice.onSpeechStart = () => {
            setIsListening(true);
            setError(null);
        };

        Voice.onSpeechEnd = () => {
            setIsListening(false);
        };

        Voice.onSpeechResults = (event: SpeechResultsEvent) => {
            if (event.value && event.value.length > 0) {
                setTranscript(event.value[0]);
                setConfidence(0.9);
            }
        };

        Voice.onSpeechPartialResults = (event: SpeechResultsEvent) => {
            if (event.value && event.value.length > 0) {
                setTranscript(event.value[0]);
            }
        };

        Voice.onSpeechError = (event: SpeechErrorEvent) => {
            setError(event.error?.message || 'Speech recognition error');
            setIsListening(false);
        };

        return () => {
            Voice.destroy().then(Voice.removeAllListeners);
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [timeoutId]);

    const startListening = useCallback(async () => {
        try {
            setError(null);
            setTranscript('');
            setConfidence(0);

            await Voice.start('en-US');

            const timeout = setTimeout(async () => {
                await stopListening();
            }, CONFIG.VOICE_TIMEOUT_MS);

            setTimeoutId(timeout);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to start voice recognition');
            setIsListening(false);
        }
    }, []);

    const stopListening = useCallback(async () => {
        try {
            if (timeoutId) {
                clearTimeout(timeoutId);
                setTimeoutId(null);
            }
            await Voice.stop();
            setIsListening(false);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to stop voice recognition');
        }
    }, [timeoutId]);

    const resetTranscript = useCallback(() => {
        setTranscript('');
        setConfidence(0);
        setError(null);
    }, []);

    return {
        isListening,
        transcript,
        confidence,
        error,
        startListening,
        stopListening,
        resetTranscript,
    };
}

export function isVoiceResultValid(result: VoiceResult): boolean {
    return (
        result.transcript.length > 0 &&
        result.confidence >= CONFIG.MIN_CONFIDENCE
    );
}
