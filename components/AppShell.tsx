'use client';
import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { WelcomeScreen } from '@/components/views/WelcomeScreen';
import { LibraryScreen } from '@/components/views/LibraryScreen';
import { PlayerScreen } from '@/components/views/PlayerScreen';
import { VinylAudioEngine } from '@/components/audio/VinylAudioEngine';
import { AudioController } from '@/components/player/AudioController';

export const AppShell = () => {
    const { view, userName } = useStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    // Route Logic
    // If no user name, force welcome
    if (!userName && view !== 'welcome') {
        return <WelcomeScreen />;
    }

    return (
        <>
            <VinylAudioEngine />
            <AudioController />
            
            <main className="w-full h-full">
                {view === 'welcome' && <WelcomeScreen />}
                {view === 'library' && <LibraryScreen />}
                {view === 'player' && <PlayerScreen />}
            </main>
        </>
    );
};
