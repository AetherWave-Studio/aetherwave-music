import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
} from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { SongInfo, PlayerControls, ProgressBar } from '../components';
import { Song } from '../types';

interface NowPlayingScreenProps {
    song: Song | null;
    isPlaying: boolean;
    isGenerating: boolean;
    positionMs: number;
    durationMs: number;
    onPlayPause: () => void;
    onSeekBackward: () => void;
    onSeekForward: () => void;
    onSeek: (positionMs: number) => void;
    onBack: () => void;
}

export default function NowPlayingScreen({
    song,
    isPlaying,
    isGenerating,
    positionMs,
    durationMs,
    onPlayPause,
    onSeekBackward,
    onSeekForward,
    onSeek,
    onBack,
}: NowPlayingScreenProps) {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Now Playing</Text>
                <View style={styles.placeholder} />
            </View>

            <View style={styles.content}>
                <SongInfo
                    title={song ? 'Generated Music' : 'No song loaded'}
                    subtitle={song ? `ID: ${song.id.slice(0, 8)}...` : undefined}
                    isGenerating={isGenerating}
                />

                <View style={styles.controls}>
                    <ProgressBar
                        positionMs={positionMs}
                        durationMs={durationMs}
                        onSeek={onSeek}
                    />

                    <View style={styles.playerControls}>
                        <PlayerControls
                            isPlaying={isPlaying}
                            onPlayPause={onPlayPause}
                            onSeekBackward={onSeekBackward}
                            onSeekForward={onSeekForward}
                            disabled={!song || isGenerating}
                        />
                    </View>
                </View>
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: SPACING.md,
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
        ...TYPOGRAPHY.body,
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    placeholder: {
        width: 44,
    },
    content: {
        flex: 1,
        justifyContent: 'space-between',
        paddingVertical: SPACING.xl,
    },
    controls: {
        paddingBottom: SPACING.xxl,
    },
    playerControls: {
        marginTop: SPACING.xl,
    },
});
