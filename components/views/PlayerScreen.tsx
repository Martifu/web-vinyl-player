'use client';
import { useStore } from '@/lib/store';
import { useLibraryStore, VinylData, TrackData } from '@/lib/libraryStore';
import { TurntablePlayer } from '@/components/player/TurntablePlayer';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Play, Disc } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../ui/dropdown-menu';
import { MoreHorizontal, Trash2 } from 'lucide-react';

export const PlayerScreen = () => {
    const { currentVinylId, currentTrackId, playTrack, setView, isPlaying } = useStore();
    const library = useLibraryStore((state) => state.library);
    const removeVinyl = useLibraryStore((state) => state.removeVinyl);

    // Get vinyl and tracks from library store
    const vinyl = library?.vinyls.find(v => v.id === currentVinylId);
    const tracks = library?.tracks
        .filter(t => t.vinylId === currentVinylId)
        .sort((a, b) => a.order - b.order) || [];

    const deleteVinyl = async () => {
        if (!currentVinylId) return;
        if (confirm("Are you sure you want to delete this album?")) {
            removeVinyl(currentVinylId);
            setView('library');
        }
    };

    const currentTrack = tracks.find((t) => t.id === currentTrackId) || null;

    // Convert VinylData to the format TurntablePlayer expects
    const vinylForPlayer = vinyl ? {
        id: vinyl.id,
        title: vinyl.title,
        artist: vinyl.artist,
        coverImage: vinyl.coverPath,
        coverFront: vinyl.coverPath,
        createdAt: vinyl.createdAt,
    } : null;

    if (!vinylForPlayer) return null;

    return (
        <div className="h-screen w-full flex flex-col bg-background text-foreground p-6 overflow-hidden">
            <header className="mb-4 flex items-center justify-between z-10">
                <Button variant="ghost" className="rounded-full hover:bg-black/5 dark:hover:bg-white/10" onClick={() => setView('library')}>
                    <ArrowLeft className="mr-2 h-5 w-5" /> Library
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-black/5 dark:hover:bg-white/10">
                            <MoreHorizontal className="w-5 h-5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={deleteVinyl} className="text-red-500 focus:text-red-500 cursor-pointer">
                            <Trash2 className="w-4 h-4 mr-2" /> Delete Album
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </header>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center max-w-[1800px] mx-auto w-full h-full pb-8">
                {/* Left: Turntable - High Priority Height */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="flex justify-center items-center h-full max-h-[90vh]"
                >
                    <TurntablePlayer vinyl={vinylForPlayer} currentTrack={currentTrack} />
                </motion.div>

                {/* Right: Info & Tracks - Maximize Height */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="space-y-6 flex flex-col h-full max-h-[85vh]"
                >
                    <div className="space-y-2 shrink-0">
                        <h2 className="text-xl md:text-2xl text-primary font-bold tracking-tight opacity-70">{vinylForPlayer.artist}</h2>
                        <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-none tracking-tighter uppercase line-clamp-2">{vinylForPlayer.title}</h1>
                    </div>

                    <div className="flex-1 min-h-0 rounded-3xl border border-white/20 bg-white/40 dark:bg-black/20 backdrop-blur-xl shadow-sm overflow-hidden flex flex-col">
                        <ScrollArea className="flex-1 p-6">
                            <div className="space-y-8 pb-12">
                                {/* Group by Disks */}
                                {Array.from(new Set(tracks?.map(t => t.diskNumber || 1))).sort().map(diskNum => {
                                    const diskTracks = tracks?.filter(t => (t.diskNumber || 1) === diskNum) || [];
                                    const sideA = diskTracks.filter(t => t.side === 'A').sort((a, b) => a.order - b.order);
                                    const sideB = diskTracks.filter(t => t.side === 'B').sort((a, b) => a.order - b.order);

                                    return (
                                        <div key={diskNum} className="space-y-6">
                                            {(tracks?.some(t => t.diskNumber && t.diskNumber > 1)) && (
                                                <div className="sticky top-0 bg-white/50 dark:bg-black/50 backdrop-blur-md py-2 z-10 border-b border-black/5 dark:border-white/5">
                                                    <h4 className="font-bold text-sm tracking-widest uppercase opacity-60">Disk {diskNum}</h4>
                                                </div>
                                            )}

                                            {/* Side A */}
                                            {sideA.length > 0 && (
                                                <div className="space-y-2 px-2">
                                                    <h3 className="flex items-center gap-2 text-sm font-bold opacity-40 uppercase tracking-widest mb-3 pl-2">
                                                        <Disc className="w-4 h-4" /> Side A
                                                    </h3>
                                                    <div className="flex flex-col gap-1">
                                                        {sideA.map((track, i) => (
                                                            <TrackItem
                                                                key={track.id}
                                                                track={track}
                                                                index={track.order}
                                                                isActive={currentTrackId === track.id}
                                                                isPlaying={isPlaying}
                                                                onClick={() => playTrack(track.id!)}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Side B */}
                                            {sideB.length > 0 && (
                                                <div className="space-y-2 pt-2 px-2">
                                                    <h3 className="flex items-center gap-2 text-sm font-bold opacity-40 uppercase tracking-widest mb-3 pl-2">
                                                        <Disc className="w-4 h-4" /> Side B
                                                    </h3>
                                                    <div className="flex flex-col gap-1">
                                                        {sideB.map((track, i) => (
                                                            <TrackItem
                                                                key={track.id}
                                                                track={track}
                                                                index={track.order}
                                                                isActive={currentTrackId === track.id}
                                                                isPlaying={isPlaying}
                                                                onClick={() => playTrack(track.id!)}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}

                                {(!tracks || tracks?.length === 0) && <p className="text-muted-foreground text-sm italic pl-8">No tracks found.</p>}
                            </div>
                        </ScrollArea>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

const TrackItem = ({ track, index, isActive, isPlaying, onClick }: any) => {
    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full flex items-center gap-4 p-4 rounded-xl transition-all text-left group border border-transparent",
                isActive
                    ? "bg-[#1A1A1A] text-white shadow-xl scale-[1.02] border-white/10 z-10"
                    : "hover:bg-black/5 dark:hover:bg-white/5 text-foreground/80 hover:text-foreground hover:pl-5"
            )}
        >
            <div className={cn(
                "w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm shrink-0 transition-colors",
                isActive ? "bg-white/20 text-white" : "bg-black/5 dark:bg-white/10 group-hover:bg-black/10 dark:group-hover:bg-white/20"
            )}>
                {isActive && isPlaying ? (
                    <div className="flex gap-[3px] h-3 items-end justify-center">
                        <motion.div animate={{ height: [4, 12, 4] }} transition={{ repeat: Infinity, duration: 0.5 }} className="w-[3px] bg-current rounded-full" />
                        <motion.div animate={{ height: [8, 16, 6] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-[3px] bg-current rounded-full" />
                        <motion.div animate={{ height: [6, 10, 5] }} transition={{ repeat: Infinity, duration: 0.4 }} className="w-[3px] bg-current rounded-full" />
                    </div>
                ) : (
                    <span className="font-mono">{index}</span>
                )}
            </div>

            <span className="flex-1 font-medium truncate text-lg tracking-tight">
                {track.title}
            </span>

            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <Play className="w-4 h-4 fill-current" />
            </div>
        </button>
    )
}
