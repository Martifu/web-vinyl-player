import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface VinylRecordProps {
    coverUrl?: string; // Blob URL of the cover
    className?: string;
    isSpinning?: boolean;
}

export const VinylRecord = ({ coverUrl, className, isSpinning = false }: VinylRecordProps) => {
    return (
        <motion.div
            className={`relative aspect-square rounded-full shadow-2xl ${className}`}
            animate={isSpinning ? { rotate: 360 } : { rotate: 0 }}
            transition={isSpinning ? { duration: 1.8, repeat: Infinity, ease: "linear" } : { duration: 0 }}
        >
            {/* The Vinyl Image */}
            <Image
                src="/vinyl.png"
                alt="Vinyl Record"
                fill
                className="object-contain pointer-events-none"
                priority
            />

            {/* The Cover Art (Center - both spin together now) */}
            <div className="absolute inset-0 flex items-center justify-center">
                {coverUrl && (
                    <div className="w-[42%] h-[42%] rounded-full overflow-hidden shadow-lg">
                        <img
                            src={coverUrl}
                            alt="Album Cover"
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}
            </div>
        </motion.div>
    );
};

