import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PlayerState {
  // User Preferences
  userName: string;
  setUserName: (name: string) => void;

  // Navigation
  view: 'welcome' | 'library' | 'player' | 'upload';
  setView: (view: 'welcome' | 'library' | 'player' | 'upload') => void;

  // Playback State
  currentVinylId: string | null;
  currentTrackId: string | null;
  isPlaying: boolean;
  volume: number;
  shuffle: boolean;

  // Actions
  playVinyl: (vinylId: string) => void;
  playTrack: (trackId: string) => void;
  togglePlay: () => void;
  setVolume: (vol: number) => void;
  toggleShuffle: () => void;
  stop: () => void;
  // For auto-next, we'll handle this in AudioController with access to tracks
}

export const useStore = create<PlayerState>()(
  persist(
    (set) => ({
      userName: '',
      setUserName: (name) => set({ userName: name }),

      view: 'welcome',
      setView: (view) => set({ view }),

      currentVinylId: null,
      currentTrackId: null,
      isPlaying: false,
      volume: 0.8,
      shuffle: false,

      playVinyl: (vinylId) => set({ currentVinylId: vinylId, view: 'player', isPlaying: false }),
      playTrack: (trackId) => set({ currentTrackId: trackId, isPlaying: true }),
      togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
      setVolume: (volume) => set({ volume }),
      toggleShuffle: () => set((state) => ({ shuffle: !state.shuffle })),
      stop: () => set({ isPlaying: false, currentTrackId: null }),
    }),
    {
      name: 'vinyl-player-storage',
      partialize: (state) => ({ userName: state.userName, view: state.view, shuffle: state.shuffle }),
    }
  )
);

