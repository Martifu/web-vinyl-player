import { create } from 'zustand';

// Types matching the API
export interface VinylData {
    id: string;
    title: string;
    artist: string;
    coverPath: string;
    createdAt: number;
}

export interface TrackData {
    id: string;
    vinylId: string;
    title: string;
    order: number;
    side: 'A' | 'B';
    diskNumber: number;
    audioPath: string;
}

export interface LibraryData {
    vinyls: VinylData[];
    tracks: TrackData[];
}

interface LibraryStore {
    library: LibraryData | null;
    isLoading: boolean;
    setLibrary: (library: LibraryData) => void;
    addVinyl: (vinyl: VinylData, tracks: TrackData[]) => void;
    removeVinyl: (vinylId: string) => void;
    saveToServer: () => Promise<void>;
    loadFromServer: () => Promise<void>;
}

export const useLibraryStore = create<LibraryStore>((set, get) => ({
    library: null,
    isLoading: false,

    setLibrary: (library) => set({ library }),

    addVinyl: (vinyl, tracks) => {
        const current = get().library;
        if (!current) return;

        set({
            library: {
                ...current,
                vinyls: [...current.vinyls, vinyl],
                tracks: [...current.tracks, ...tracks],
            }
        });

        // Auto-save to server
        get().saveToServer();
    },

    removeVinyl: (vinylId) => {
        const current = get().library;
        if (!current) return;

        set({
            library: {
                ...current,
                vinyls: current.vinyls.filter(v => v.id !== vinylId),
                tracks: current.tracks.filter(t => t.vinylId !== vinylId),
            }
        });

        // Auto-save to server
        get().saveToServer();
    },

    saveToServer: async () => {
        const library = get().library;
        if (!library) return;

        try {
            await fetch('/api/library', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ library }),
            });
        } catch (error) {
            console.error('Failed to save library:', error);
        }
    },

    loadFromServer: async () => {
        set({ isLoading: true });
        try {
            const res = await fetch('/api/library');
            const data = await res.json();

            if (data.library) {
                set({ library: data.library, isLoading: false });
            } else {
                // Create empty library
                const newLibrary: LibraryData = {
                    vinyls: [],
                    tracks: [],
                };
                set({ library: newLibrary, isLoading: false });
            }
        } catch (error) {
            console.error('Failed to load library:', error);
            // Fallback to empty library
            set({
                library: { vinyls: [], tracks: [] },
                isLoading: false
            });
        }
    },
}));
