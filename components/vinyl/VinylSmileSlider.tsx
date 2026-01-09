'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate, PanInfo, MotionValue } from 'framer-motion';
import { Vinyl } from '@/lib/db';
import { VinylRecord } from '@/components/assets/VinylRecord';
import { useStore } from '@/lib/store';

interface VinylSmileSliderProps {
    vinyls: Vinyl[];
}

const CARD_WIDTH = 260;
const SPACING = 40; // Gap between cards

export const VinylSmileSlider = ({ vinyls }: VinylSmileSliderProps) => {
    const { playVinyl } = useStore();
    const [centeredIndex, setCenteredIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);

    // Snap logic
    const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const velocity = info.velocity.x;
        const offset = info.offset.x;

        // Determine target index based on drag distance and velocity
        let newIndex = centeredIndex;

        // Thresholds
        if (offset < -100 || velocity < -500) newIndex++;
        if (offset > 100 || velocity > 500) newIndex--;

        // Clamp
        newIndex = Math.max(0, Math.min(newIndex, vinyls.length - 1));

        setCenteredIndex(newIndex);

        // Animate to snap position
        animate(x, -newIndex * (CARD_WIDTH + SPACING), {
            type: "spring",
            stiffness: 300,
            damping: 30
        });
    };

    // Initial position
    useEffect(() => {
        x.set(-centeredIndex * (CARD_WIDTH + SPACING));
    }, [centeredIndex, x]);

    return (
        <div className="w-full h-[600px] flex items-center justify-center relative overflow-hidden" ref={containerRef}>
            {/* The "Track" wrapper */}
            <motion.div
                className="flex items-center absolute left-1/2"
                style={{ x }}
                drag="x"
                dragConstraints={{
                    left: -((vinyls.length - 1) * (CARD_WIDTH + SPACING)),
                    right: 0
                }}
                onDragEnd={handleDragEnd}
            >
                <div className="flex" style={{ marginLeft: -CARD_WIDTH / 2 }}>
                    {vinyls.map((vinyl, i) => (
                        <SliderItem
                            key={vinyl.id}
                            vinyl={vinyl}
                            index={i}
                            parentX={x}
                            onClick={() => {
                                if (i === centeredIndex) {
                                    playVinyl(vinyl.id!);
                                } else {
                                    // Scroll to this one
                                    setCenteredIndex(i);
                                    animate(x, -i * (CARD_WIDTH + SPACING), { type: "spring", stiffness: 300, damping: 30 });
                                }
                            }}
                        />
                    ))}
                </div>
            </motion.div>

            {/* Helper Text */}
            <div className="absolute bottom-10 text-center pointer-events-none opacity-50">
                <p className="text-sm tracking-widest uppercase text-muted-foreground">Desliza para explorar • Toca para reproducir</p>
            </div>
        </div>
    );
};

const SliderItem = ({ vinyl, index, parentX, onClick }: { vinyl: Vinyl, index: number, parentX: MotionValue<number>, onClick: () => void }) => {
    // We need to transform based on the distance from the "center" of the viewport.
    const myOffset = index * (CARD_WIDTH + SPACING);
    const globalX = useTransform(parentX, (value: number) => value + myOffset);

    // Calculate rotation and Y offset for the "Smile"
    // Range of influence: +/- 800px
    const rotate = useTransform(globalX, [-800, 0, 800], [-30, 0, 30]);
    const y = useTransform(globalX, [-800, 0, 800], [200, 0, 200]);
    const scale = useTransform(globalX, [-800, 0, 800], [0.8, 1.1, 0.8]);
    const opacity = useTransform(globalX, [-800, 0, 800], [0.4, 1, 0.4]);
    const zIndex = useTransform(globalX, (latest) => Math.round(100 - Math.abs(latest as number)));

    const [coverUrl, setCoverUrl] = useState<string>('');

    useEffect(() => {
        // coverImage is now a URL string, coverFront might be Blob or string
        if (vinyl.coverImage && typeof vinyl.coverImage === 'string') {
            setCoverUrl(vinyl.coverImage);
        } else if (vinyl.coverFront) {
            if (typeof vinyl.coverFront === 'string') {
                setCoverUrl(vinyl.coverFront);
            } else {
                // It's a Blob
                const url = URL.createObjectURL(vinyl.coverFront);
                setCoverUrl(url);
                return () => URL.revokeObjectURL(url);
            }
        }
    }, [vinyl]);

    return (
        <motion.div
            style={{
                width: CARD_WIDTH,
                marginRight: SPACING,
                rotate,
                y,
                scale,
                opacity,
                zIndex
            }}
            className="flex flex-col items-center cursor-pointer will-change-transform"
            onClick={onClick}
            whileHover={{ scale: 1.15 }}
            transition={{ duration: 0.2 }}
        >
            <VinylRecord coverUrl={coverUrl} className="w-full" />

            <div className="mt-8 text-center bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-white/40 w-[120%]">
                <h3 className="text-xl font-bold truncate text-primary">{vinyl.title}</h3>
                <p className="text-sm font-medium text-muted-foreground truncate">{vinyl.artist}</p>
            </div>
        </motion.div>
    );
};
