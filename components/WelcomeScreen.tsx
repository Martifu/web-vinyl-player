"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { useLibraryStore } from "@/lib/libraryStore";
import { motion } from "framer-motion";

export default function WelcomeScreen() {
    const [name, setName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const setUserName = useStore((state) => state.setUserName);
    const loadFromServer = useLibraryStore((state) => state.loadFromServer);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsLoading(true);
        try {
            // Load global library from server
            await loadFromServer();

            // Set username in main store (only for greeting)
            setUserName(name.trim());
        } catch (error) {
            console.error('Error loading library:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center p-4 bg-background/50 backdrop-blur-3xl">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md p-8 rounded-3xl bg-white/20 dark:bg-black/20 backdrop-blur-lg border border-white/30 shadow-2xl"
            >
                <h1 className="text-4xl font-bold text-center text-foreground mb-2">Welcome</h1>
                <p className="text-center text-muted-foreground mb-8">Enter your name to start</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative">
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your Name"
                            className="w-full px-6 py-4 rounded-2xl bg-white/10 dark:bg-black/10 border border-white/20 focus:border-primary/50 focus:ring-0 outline-none text-lg text-center placeholder:text-muted-foreground/50 transition-all dark:text-white"
                            autoFocus
                            disabled={isLoading}
                            tabIndex={1}
                            data-focusable="true"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={!name.trim() || isLoading}
                        className="w-full py-4 rounded-2xl bg-black/80 dark:bg-white/90 text-white dark:text-black font-semibold text-lg hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-50 disabled:pointer-events-none shadow-lg"
                        tabIndex={2}
                        data-focusable="true"
                    >
                        {isLoading ? 'Loading...' : 'Enter Studio'}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
