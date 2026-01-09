'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useStore } from '@/lib/store';

export const WelcomeScreen = () => {
    const [name, setName] = useState('');
    const { setUserName, setView } = useStore();

    const handleContinue = () => {
        if (!name.trim()) return;
        setUserName(name);
        setView('library');
    };

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-background text-foreground relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-[-20%] left-[-10%] w-[50vh] h-[50vh] rounded-full bg-primary/10 blur-3xl pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60vh] h-[60vh] rounded-full bg-secondary/10 blur-3xl pointer-events-none" />

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-md w-full space-y-8 text-center z-10"
            >
                <div className="space-y-2">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-primary">
                        Bienvenido
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        ¿Cómo te llamas?
                    </p>
                </div>

                <div className="flex gap-2">
                    <Input 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Tu nombre..." 
                        className="text-2xl h-16 px-6 bg-white/50 backdrop-blur border-2 border-primary/20 focus-visible:border-primary rounded-2xl text-center"
                        onKeyDown={(e) => e.key === 'Enter' && handleContinue()}
                    />
                </div>

                <Button 
                    onClick={handleContinue}
                    disabled={!name.trim()}
                    className="h-14 w-full rounded-2xl text-xl font-bold bg-primary hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 disabled:opacity-50 disabled:translate-y-0"
                >
                    Entrar <ArrowRight className="ml-2 w-6 h-6" />
                </Button>
            </motion.div>
        </div>
    );
};
