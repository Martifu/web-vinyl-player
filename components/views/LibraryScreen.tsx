'use client';
import { useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { useStore } from '@/lib/store';
import { VinylUploader } from '@/components/vinyl/VinylUploader';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { VinylSmileSlider } from '@/components/vinyl/VinylSmileSlider';
import { motion } from 'framer-motion';

export const LibraryScreen = () => {
    const { userName } = useStore();
    const vinyls = useLiveQuery(() => db.vinyls.toArray());

    return (
        <div className="min-h-screen w-full flex flex-col bg-background text-foreground overflow-hidden">
             {/* Header */}
             <header className="p-8 flex justify-between items-center z-10">
                <div>
                    <h2 className="text-xl text-muted-foreground font-medium">Colección de</h2>
                    <h1 className="text-4xl md:text-5xl font-bold text-primary tracking-tight">{userName}</h1>
                </div>
                <VinylUploader>
                    <Button size="lg" className="rounded-full px-6 shadow-lg bg-primary hover:bg-primary/90 text-white font-bold">
                        <Plus className="w-5 h-5 mr-2" /> Agregar Disco
                    </Button>
                </VinylUploader>
             </header>

             {/* Main Content - The Slider */}
             <main className="flex-1 flex flex-col items-center justify-center relative">
                {!vinyls || vinyls.length === 0 ? (
                    <div className="text-center space-y-4 max-w-md p-6 bg-white/30 backdrop-blur rounded-3xl border border-white/50 shadow-sm">
                        <div className="w-20 h-20 bg-muted rounded-full mx-auto flex items-center justify-center">
                            <Plus className="w-10 h-10 text-muted-foreground" />
                        </div>
                        <h3 className="text-2xl font-bold text-secondary">Tu colección está vacía</h3>
                        <p className="text-muted-foreground">Sube tu primer vinilo para comenzar la experiencia.</p>
                        <VinylUploader>
                            <Button className="w-full bg-secondary hover:bg-secondary/90 text-white">Subir ahora</Button>
                        </VinylUploader>
                    </div>
                ) : (
                    <VinylSmileSlider vinyls={vinyls} />
                )}
             </main>
        </div>
    );
};
