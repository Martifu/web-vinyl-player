'use client';
import { useState, useEffect } from 'react';
import { VinylRecord } from '@/components/assets/VinylRecord';
import { Tonearm } from '@/components/assets/Tonearm';
import { Vinyl, Track } from '@/lib/db';
import { useStore } from '@/lib/store';
import { Play, Pause, Volume2, Shuffle } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TurntablePlayerProps {
    vinyl: Vinyl;
    currentTrack: Track | null;
}

export const TurntablePlayer = ({ vinyl, currentTrack }: TurntablePlayerProps) => {
    const { isPlaying, togglePlay, volume, setVolume, shuffle, toggleShuffle } = useStore();
    const [coverUrl, setCoverUrl] = useState<string>('');

    useEffect(() => {
        if (vinyl) {
            if (vinyl.coverFront instanceof Blob) {
                const url = URL.createObjectURL(vinyl.coverFront);
                setCoverUrl(url);
                return () => URL.revokeObjectURL(url);
            } else if (typeof vinyl.coverFront === 'string') {
                setCoverUrl(vinyl.coverFront);
            }
        }
    }, [vinyl]);

    return (
        <div className="relative w-full h-[85vh] rounded-[40px] shadow-2xl overflow-hidden flex items-center justify-center bg-[#F4F4F5] dark:bg-[#18181B] backdrop-blur-3xl border border-white/20">
            {/* Turntable Body / Plinth Texture */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent pointer-events-none opacity-50" />

            {/* Decor: Speed Selector (Simulated Buttons) */}
            <div className="absolute top-12 left-8 flex flex-col gap-4 z-10">
                <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold tracking-widest opacity-40 uppercase ml-1">Speed</span>
                    <div className="flex flex-col gap-3">
                        <button className="w-12 h-12 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center border border-black/10 dark:border-white/10 text-xs font-bold font-mono shadow-inner">33</button>
                        <button className="w-12 h-12 rounded-full border border-black/10 dark:border-white/10 flex items-center justify-center text-xs font-bold font-mono opacity-50 hover:opacity-100 transition-opacity">45</button>
                    </div>
                </div>

                <div className="flex flex-col gap-2 mt-4">
                    <span className="text-[10px] font-bold tracking-widest opacity-40 uppercase ml-1">Power</span>
                    <button className={`w-12 h-12 rounded-full border border-red-500/20 flex items-center justify-center shadow-sm transition-all ${isPlaying ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'bg-transparent'}`}>
                        <div className={`w-3 h-3 rounded-full ${isPlaying ? 'bg-white' : 'bg-red-500'}`} />
                    </button>
                </div>
            </div>

            {/* The Platter (The spinning base) - Taking up most of the space */}
            <div className="relative w-[85%] aspect-square rounded-full bg-[#121212] shadow-[0_30px_60px_rgba(0,0,0,0.6)] flex items-center justify-center border-[8px] border-[#222]">
                {/* Metallic shine reflection */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/5 via-transparent to-transparent pointer-events-none" />

                {/* The Vinyl Record */}
                <div className="w-[98%] h-[98%] relative transition-all duration-1000">
                    <VinylRecord
                        coverUrl={coverUrl}
                        className="w-full h-full"
                        isSpinning={isPlaying}
                    />
                </div>
            </div>

            {/* Tonearm - Large and realistic placement */}
            <div className="absolute right-[-5%] top-[5%] pointer-events-none z-20 drop-shadow-2xl scale-125 origin-top-right">
                <Tonearm isPlaying={isPlaying} />
            </div>

            {/* Controls Overlay Floating at Bottom - moved down 25px (bottom-6 instead of bottom-12) */}
            <div className="absolute bottom-6 flex items-center gap-4 bg-black/80 dark:bg-white/10 backdrop-blur-xl p-4 pl-6 pr-8 rounded-full shadow-2xl border border-white/10 z-30 transition-all hover:scale-105">
                {/* Shuffle Button */}
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                        "rounded-full w-12 h-12 transition-all",
                        shuffle
                            ? "bg-green-500 text-white hover:bg-green-400"
                            : "bg-white/10 text-white/50 hover:bg-white/20 hover:text-white"
                    )}
                    onClick={toggleShuffle}
                >
                    <Shuffle className="w-5 h-5" />
                </Button>

                {/* Play/Pause Button */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full w-16 h-16 bg-white text-black hover:bg-white/90 hover:scale-105 transition-all shadow-lg"
                    onClick={togglePlay}
                >
                    {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                </Button>

                <div className="h-8 w-[1px] bg-white/20 mx-2" />

                <div className="flex items-center gap-4 min-w-[140px]">
                    <Volume2 className="w-5 h-5 text-white/50" />
                    <Slider
                        value={[volume * 100]}
                        onValueChange={(val) => setVolume(val[0] / 100)}
                        max={100}
                        step={1}
                        className="w-full cursor-pointer"
                    />
                </div>
            </div>
        </div>
    );
};

