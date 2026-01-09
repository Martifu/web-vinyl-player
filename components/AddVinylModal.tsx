"use client";

import { useState, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useLibraryStore, VinylData, TrackData } from "@/lib/libraryStore";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { X, Upload, Music, GripVertical, Plus, Trash2, Disc } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddVinylModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface FormData {
    title: string;
    artist: string;
}

interface TrackDraft {
    id: string;
    file: File;
    title: string;
    duration?: string;
}

interface DiskState {
    id: number;
    sideA: TrackDraft[];
    sideB: TrackDraft[];
}

export default function AddVinylModal({ isOpen, onClose }: AddVinylModalProps) {
    const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Multi-disk state
    const [disks, setDisks] = useState<DiskState[]>([{ id: 1, sideA: [], sideB: [] }]);
    const [activeDiskId, setActiveDiskId] = useState(1);

    const activeDisk = disks.find(d => d.id === activeDiskId) || disks[0];

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setCoverFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const addDisk = () => {
        const newId = disks.length + 1;
        setDisks([...disks, { id: newId, sideA: [], sideB: [] }]);
        setActiveDiskId(newId);
    };

    const removeDisk = (id: number) => {
        if (disks.length <= 1) return;
        const newDisks = disks.filter(d => d.id !== id).map((d, i) => ({ ...d, id: i + 1 }));
        setDisks(newDisks);
        if (activeDiskId === id) setActiveDiskId(1);
    };

    const updateTracks = (diskId: number, side: 'sideA' | 'sideB', newTracks: TrackDraft[]) => {
        setDisks(disks.map(d => d.id === diskId ? { ...d, [side]: newTracks } : d));
    };

    const uploadFile = async (vinylId: string, file: File, fileType: 'cover' | 'audio', trackIndex?: number): Promise<string> => {
        const formData = new window.FormData();
        formData.append('vinylId', vinylId);
        formData.append('fileType', fileType);
        formData.append('file', file);
        if (trackIndex !== undefined) {
            formData.append('trackIndex', String(trackIndex));
        }

        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const data = await res.json();

        if (!data.success) {
            throw new Error(data.error || 'Upload failed');
        }

        return data.path;
    };

    const onSubmit = async (data: FormData) => {
        if (!imagePreview || !coverFile) return;

        setIsUploading(true);
        try {
            const vinylId = crypto.randomUUID();
            const { addVinyl } = useLibraryStore.getState();

            // 1. Upload cover (no userName needed - global library)
            const coverPath = await uploadFile(vinylId, coverFile, 'cover');

            // 2. Upload tracks and collect metadata
            const tracksData: TrackData[] = [];
            let globalTrackIndex = 1;

            for (const disk of disks) {
                // Side A
                for (let i = 0; i < disk.sideA.length; i++) {
                    const track = disk.sideA[i];
                    const audioPath = await uploadFile(vinylId, track.file, 'audio', globalTrackIndex);

                    tracksData.push({
                        id: crypto.randomUUID(),
                        vinylId,
                        title: track.title,
                        order: i + 1,
                        side: 'A',
                        diskNumber: disk.id,
                        audioPath,
                    });
                    globalTrackIndex++;
                }

                // Side B
                for (let i = 0; i < disk.sideB.length; i++) {
                    const track = disk.sideB[i];
                    const audioPath = await uploadFile(vinylId, track.file, 'audio', globalTrackIndex);

                    tracksData.push({
                        id: crypto.randomUUID(),
                        vinylId,
                        title: track.title,
                        order: i + 1,
                        side: 'B',
                        diskNumber: disk.id,
                        audioPath,
                    });
                    globalTrackIndex++;
                }
            }

            // 3. Create vinyl data
            const vinylData: VinylData = {
                id: vinylId,
                title: data.title,
                artist: data.artist,
                coverPath,
                createdAt: Date.now(),
            };

            // 4. Add to library store (auto-saves to server)
            addVinyl(vinylData, tracksData);

            // Reset form
            reset();
            setImagePreview(null);
            setCoverFile(null);
            setDisks([{ id: 1, sideA: [], sideB: [] }]);
            onClose();
        } catch (error) {
            console.error("Failed to add vinyl:", error);
            alert("Failed to upload vinyl. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full max-w-5xl bg-[#F3F4F6] dark:bg-[#111827] rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-black/20 flex justify-between items-center sticky top-0 z-10">
                            <h2 className="text-2xl font-bold">Add to Collection</h2>
                            <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full"><X className="w-6 h-6" /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8">
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                                {/* Basic Info */}
                                <div className="flex flex-col md:flex-row gap-8">
                                    {/* Cover Upload */}
                                    <div
                                        className="w-60 h-60 shrink-0 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors overflow-hidden relative group"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        {imagePreview ? (
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="text-center p-4">
                                                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                                <span className="text-gray-500 text-sm">Upload Cover</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-white font-medium">Change</span>
                                        </div>
                                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
                                    </div>

                                    <div className="flex-1 space-y-4">
                                        <div>
                                            <label className="text-sm font-medium mb-1 block opacity-70">Album Title</label>
                                            <input
                                                {...register("title", { required: true })}
                                                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-primary outline-none text-xl font-semibold"
                                                placeholder="e.g. Dark Side of the Moon"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium mb-1 block opacity-70">Artist</label>
                                            <input
                                                {...register("artist", { required: true })}
                                                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-primary outline-none text-lg"
                                                placeholder="e.g. Pink Floyd"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Disk Management */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 overflow-x-auto pb-2">
                                        {disks.map((disk) => (
                                            <button
                                                key={disk.id}
                                                type="button"
                                                onClick={() => setActiveDiskId(disk.id)}
                                                className={cn(
                                                    "px-4 py-2 rounded-full flex items-center gap-2 transition-all whitespace-nowrap",
                                                    activeDiskId === disk.id
                                                        ? "bg-black text-white dark:bg-white dark:text-black shadow-lg"
                                                        : "bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10"
                                                )}
                                            >
                                                <Disc className="w-4 h-4" />
                                                Disk {disk.id}
                                                {disks.length > 1 && (
                                                    <span onClick={(e) => { e.stopPropagation(); removeDisk(disk.id); }} className="ml-1 opacity-50 hover:opacity-100 p-1 hover:bg-white/20 rounded-full">
                                                        <X className="w-3 h-3" />
                                                    </span>
                                                )}
                                            </button>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={addDisk}
                                            className="px-4 py-2 rounded-full border border-dashed border-gray-300 dark:border-white/20 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2 transition-colors text-sm"
                                        >
                                            <Plus className="w-4 h-4" /> Add Disk
                                        </button>
                                    </div>

                                    {/* Sides Container */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-white dark:bg-black/20 rounded-3xl border border-gray-200 dark:border-white/10">
                                        <TrackDropZone
                                            side="Side A"
                                            tracks={activeDisk.sideA}
                                            onUpdate={(tracks) => updateTracks(activeDisk.id, 'sideA', tracks)}
                                        />
                                        <TrackDropZone
                                            side="Side B"
                                            tracks={activeDisk.sideB}
                                            onUpdate={(tracks) => updateTracks(activeDisk.id, 'sideB', tracks)}
                                        />
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-black/20 flex justify-end gap-4 sticky bottom-0 z-10">
                            <button onClick={onClose} className="px-6 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 font-medium transition-colors">
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit(onSubmit)}
                                disabled={!imagePreview}
                                className="px-8 py-3 rounded-xl bg-black dark:bg-white text-white dark:text-black font-bold hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none shadow-xl"
                            >
                                Save to Library
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

// Sub-component for dropping and reordering tracks
function TrackDropZone({ side, tracks, onUpdate }: { side: string, tracks: TrackDraft[], onUpdate: (t: TrackDraft[]) => void }) {
    const onDrop = useCallback((acceptedFiles: File[]) => {
        const newTracks = acceptedFiles.map(file => ({
            id: crypto.randomUUID(),
            file,
            title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
        }));
        onUpdate([...tracks, ...newTracks]);
    }, [tracks, onUpdate]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'audio/*': [] } });

    const removeTrack = (id: string) => {
        onUpdate(tracks.filter(t => t.id !== id));
    };

    const updateTrackTitle = (id: string, newTitle: string) => {
        onUpdate(tracks.map(t => t.id === id ? { ...t, title: newTitle } : t));
    };

    return (
        <div className="flex flex-col h-full">
            <h3 className="font-bold text-lg mb-4 opacity-50 uppercase tracking-widest text-xs flex items-center gap-2">
                <Music className="w-4 h-4" /> {side}
            </h3>

            <div className="flex-1 min-h-[300px] flex flex-col gap-4">
                <Reorder.Group axis="y" values={tracks} onReorder={onUpdate} className="space-y-2">
                    {tracks.map((track) => (
                        <Reorder.Item key={track.id} value={track}>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5 group hover:border-gray-300 dark:hover:border-white/20 transition-colors">
                                <GripVertical className="w-4 h-4 text-gray-400 cursor-move shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <input
                                        value={track.title}
                                        onChange={(e) => updateTrackTitle(track.id, e.target.value)}
                                        className="w-full bg-transparent outline-none text-sm font-medium truncate"
                                    />
                                    <p className="text-xs text-muted-foreground truncate opacity-50">{(track.file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                                <button onClick={() => removeTrack(track.id)} className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </Reorder.Item>
                    ))}
                </Reorder.Group>

                <div
                    {...getRootProps()}
                    className={cn(
                        "flex-1 border-2 border-dashed rounded-xl flex items-center justify-center p-6 transition-all min-h-[100px]",
                        isDragActive
                            ? "border-primary bg-primary/5 scale-[1.02]"
                            : "border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 hover:bg-gray-50 dark:hover:bg-white/5"
                    )}
                >
                    <input {...getInputProps()} />
                    <div className="text-center space-y-2 pointer-events-none">
                        <Plus className="w-8 h-8 mx-auto text-gray-300" />
                        <p className="text-sm text-muted-foreground">Drop audio files here</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
