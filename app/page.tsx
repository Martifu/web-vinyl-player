"use client";

import { useStore } from "@/lib/store";
import { useLibraryStore } from "@/lib/libraryStore";
import WelcomeScreen from "@/components/WelcomeScreen";
import SmileSlider from "@/components/SmileSlider";
import { PlayerScreen } from "@/components/views/PlayerScreen";
import { useState, useEffect } from "react";

export default function Home() {
  const { userName, view, playVinyl } = useStore();
  const library = useLibraryStore((state) => state.library);
  const [mounted, setMounted] = useState(false);

  // Wait for hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (!userName) {
    return <WelcomeScreen />;
  }

  if (view === 'player') {
    return <PlayerScreen />;
  }

  // Convert library vinyls to the format SmileSlider expects
  const vinyls = library?.vinyls.map(v => ({
    id: v.id,
    title: v.title,
    artist: v.artist,
    coverImage: v.coverPath,
    coverFront: v.coverPath,
    createdAt: v.createdAt,
  })) || [];

  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-start py-20 relative overflow-hidden bg-background text-foreground transition-colors duration-500">
      {/* Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-200/20 dark:bg-purple-900/10 rounded-full blur-[100px] pointer-events-none mix-blend-multiply dark:mix-blend-screen" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-sky-200/20 dark:bg-sky-900/10 rounded-full blur-[120px] pointer-events-none mix-blend-multiply dark:mix-blend-screen" />

      <div className="z-10 w-full max-w-7xl px-8 flex flex-col h-full flex-grow">
        <header className="mb-12 flex justify-between items-end">
          <div>
            <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-foreground/90 drop-shadow-sm">
              Welcome, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-800 to-gray-500 dark:from-white dark:to-gray-400">
                {userName}.
              </span>
            </h1>
            <p className="mt-4 text-xl text-muted-foreground font-light">Select a record to play.</p>
          </div>
        </header>

        <section className="w-full flex-grow flex items-center">
          <SmileSlider
            disks={vinyls}
            onSelect={(vinyl) => playVinyl(vinyl.id)}
          />
        </section>
      </div>
    </main>
  );
}

