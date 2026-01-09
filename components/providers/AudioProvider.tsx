"use client";

import { VinylAudioEngine } from "@/components/audio/VinylAudioEngine";
import { AudioController } from "@/components/player/AudioController";

export const AudioProvider = () => {
    return (
        <>
            <VinylAudioEngine />
            <AudioController />
        </>
    );
};
