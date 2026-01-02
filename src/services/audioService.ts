import { Audio, AVPlaybackStatus, AVPlaybackStatusSuccess } from 'expo-av';
import {
    documentDirectory,
    getInfoAsync,
    makeDirectoryAsync,
    downloadAsync,
    deleteAsync,
} from 'expo-file-system';
import { Song } from '../types';

class AudioService {
    private sound: Audio.Sound | null = null;
    private recording: Audio.Recording | null = null;
    private isInitialized: boolean = false;

    async initialize(): Promise<void> {
        if (this.isInitialized) return;

        await Audio.setAudioModeAsync({
            allowsRecordingIOS: true,
            playsInSilentModeIOS: true,
            staysActiveInBackground: true,
            shouldDuckAndroid: true,
            playThroughEarpieceAndroid: false,
        });

        this.isInitialized = true;
    }

    async startRecording(): Promise<void> {
        await this.initialize();

        if (this.recording) {
            await this.stopRecording();
        }

        const { granted } = await Audio.requestPermissionsAsync();
        if (!granted) {
            throw new Error('Microphone permission not granted');
        }

        const { recording } = await Audio.Recording.createAsync(
            Audio.RecordingOptionsPresets.HIGH_QUALITY
        );

        this.recording = recording;
    }

    async stopRecording(): Promise<string | null> {
        if (!this.recording) return null;

        await this.recording.stopAndUnloadAsync();
        const uri = this.recording.getURI();
        this.recording = null;

        await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            playsInSilentModeIOS: true,
            staysActiveInBackground: true,
            shouldDuckAndroid: true,
            playThroughEarpieceAndroid: false,
        });

        return uri;
    }

    async loadSong(song: Song): Promise<void> {
        await this.initialize();
        await this.unloadSound();

        const source = song.localPath
            ? { uri: song.localPath }
            : { uri: song.audioUrl };

        const { sound } = await Audio.Sound.createAsync(source, {
            shouldPlay: false,
            progressUpdateIntervalMillis: 100,
        });

        this.sound = sound;
    }

    async loadFromUrl(url: string): Promise<void> {
        await this.initialize();
        await this.unloadSound();

        const { sound } = await Audio.Sound.createAsync(
            { uri: url },
            { shouldPlay: false, progressUpdateIntervalMillis: 100 }
        );

        this.sound = sound;
    }

    async play(): Promise<void> {
        if (!this.sound) return;
        await this.sound.playAsync();
    }

    async pause(): Promise<void> {
        if (!this.sound) return;
        await this.sound.pauseAsync();
    }

    async stop(): Promise<void> {
        if (!this.sound) return;
        await this.sound.stopAsync();
        await this.sound.setPositionAsync(0);
    }

    async seekTo(positionMs: number): Promise<void> {
        if (!this.sound) return;
        await this.sound.setPositionAsync(positionMs);
    }

    async setVolume(volume: number): Promise<void> {
        if (!this.sound) return;
        await this.sound.setVolumeAsync(Math.max(0, Math.min(1, volume)));
    }

    async getStatus(): Promise<AVPlaybackStatusSuccess | null> {
        if (!this.sound) return null;
        const status = await this.sound.getStatusAsync();
        if (status.isLoaded) {
            return status;
        }
        return null;
    }

    setOnPlaybackStatusUpdate(
        callback: (status: AVPlaybackStatus) => void
    ): void {
        if (!this.sound) return;
        this.sound.setOnPlaybackStatusUpdate(callback);
    }

    async unloadSound(): Promise<void> {
        if (this.sound) {
            await this.sound.unloadAsync();
            this.sound = null;
        }
    }

    async downloadToLocal(url: string, filename: string): Promise<string> {
        const baseDir = documentDirectory || '';
        const localUri = `${baseDir}audio/${filename}`;

        const dirInfo = await getInfoAsync(`${baseDir}audio`);
        if (!dirInfo.exists) {
            await makeDirectoryAsync(`${baseDir}audio`, { intermediates: true });
        }

        const downloadResult = await downloadAsync(url, localUri);
        return downloadResult.uri;
    }

    async deleteLocalFile(localPath: string): Promise<void> {
        const fileInfo = await getInfoAsync(localPath);
        if (fileInfo.exists) {
            await deleteAsync(localPath);
        }
    }

    async cleanup(): Promise<void> {
        await this.stopRecording();
        await this.unloadSound();
    }
}

export const audioService = new AudioService();
