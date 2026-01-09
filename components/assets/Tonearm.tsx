import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface TonearmProps {
    isPlaying: boolean;
    className?: string;
}

export const Tonearm = ({ isPlaying, className }: TonearmProps) => {
    // Rotation logic:
    // 0 deg = Resting position (off record)
    // 25 deg = Playing position (on record)
    const rotation = isPlaying ? 25 : 0;

    return (
        <div className={`relative ${className}`} style={{ width: 200, height: 400 }}>
            <motion.div
                className="w-full h-full"
                initial={{ rotate: 0 }}
                animate={{ rotate: rotation }}
                transition={{ type: "spring", stiffness: 50, damping: 20 }}
                style={{ transformOrigin: "75% 15%" }} // Pivot at the base/counterweight area
            >
                <Image
                    src="/arm.png"
                    alt="Tonearm"
                    fill
                    className="object-contain drop-shadow-xl"
                    priority
                />
            </motion.div>
        </div>
    );
};

