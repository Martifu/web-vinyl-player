'use client';
import { useEffect, useRef } from 'react';
import { useStore } from '@/lib/store';

export const VinylAudioEngine = () => {
    const { isPlaying, volume } = useStore();
    const crackleRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Initialize crackle sound
        const audio = new Audio('/vinyl-crackle.mp3');
        audio.loop = true;
        crackleRef.current = audio;

        // Listen for track changes to restart crackle
        const handleTrackChange = () => {
            if (crackleRef.current) {
                crackleRef.current.currentTime = 0;
            }
        };
        window.addEventListener('trackChange', handleTrackChange);

        return () => {
            audio.pause();
            audio.src = "";
            window.removeEventListener('trackChange', handleTrackChange);
        };
    }, []);

    useEffect(() => {
        if (!crackleRef.current) return;

        // Volume logic: 50% of current volume (reduced from 60%)
        crackleRef.current.volume = Math.min(volume * 0.5, 1);

        if (isPlaying) {
            crackleRef.current.play().catch(e => console.warn("Crackle play failed", e));
        } else {
            crackleRef.current.pause();
        }
    }, [isPlaying, volume]);

    return null;
};

