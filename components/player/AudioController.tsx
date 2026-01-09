'use client';
import { useEffect, useRef, useCallback } from 'react';
import { useStore } from '@/lib/store';
import { useLibraryStore } from '@/lib/libraryStore';

export const AudioController = () => {
    const { currentTrackId, currentVinylId, isPlaying, volume, shuffle, playTrack, stop } = useStore();
    const library = useLibraryStore((state) => state.library);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        audioRef.current = new Audio();
        audioRef.current.onended = handleTrackEnd;
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = '';
            }
        };
    }, []);

    const handleTrackEnd = useCallback(async () => {
        if (!currentVinylId || !currentTrackId || !library) {
            stop();
            return;
        }

        // Get all tracks for current vinyl from library store
        const tracks = library.tracks
            .filter(t => t.vinylId === currentVinylId)
            .sort((a, b) => a.order - b.order);

        if (!tracks || tracks.length === 0) {
            stop();
            return;
        }

        const currentIndex = tracks.findIndex(t => t.id === currentTrackId);

        if (shuffle) {
            // Pick a random track that's not the current one
            const otherTracks = tracks.filter(t => t.id !== currentTrackId);
            if (otherTracks.length > 0) {
                const randomTrack = otherTracks[Math.floor(Math.random() * otherTracks.length)];
                // Dispatch event for crackle restart
                window.dispatchEvent(new CustomEvent('trackChange'));
                playTrack(randomTrack.id);
            } else {
                stop();
            }
        } else {
            // Play next track in order
            const nextIndex = currentIndex + 1;
            if (nextIndex < tracks.length) {
                // Dispatch event for crackle restart
                window.dispatchEvent(new CustomEvent('trackChange'));
                playTrack(tracks[nextIndex].id);
            } else {
                // End of playlist
                stop();
            }
        }
    }, [currentVinylId, currentTrackId, shuffle, library, playTrack, stop]);

    // Update onended handler when dependencies change
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.onended = handleTrackEnd;
        }
    }, [handleTrackEnd]);

    // Effect: Handle Track Change
    useEffect(() => {
        const loadTrack = async () => {
            if (!currentTrackId || !audioRef.current || !library) return;

            // Find track in library store
            const track = library.tracks.find(t => t.id === currentTrackId);
            if (track && track.audioPath) {
                // audioPath is a server URL like /library/user/vinyl-id/track-1.mp3
                audioRef.current.src = track.audioPath;

                if (isPlaying) {
                    try {
                        await audioRef.current.play();
                    } catch (e) {
                        console.error("Autoplay failed", e);
                    }
                }
            }
        };

        loadTrack();
    }, [currentTrackId, library]);

    // Effect: Handle Play/Pause
    useEffect(() => {
        if (!audioRef.current || !audioRef.current.src) return;

        if (isPlaying) {
            audioRef.current.play().catch(console.error);
        } else {
            audioRef.current.pause();
        }
    }, [isPlaying]);

    // Effect: Volume
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    return null; // Logic only
};
