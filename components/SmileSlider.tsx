"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import Image from "next/image";
import { Vinyl } from "@/lib/db";
import AddVinylModal from "./AddVinylModal";
interface SmileSliderProps {
    disks: Vinyl[];
    onSelect: (disk: Vinyl) => void;
}

export default function SmileSlider({ disks, onSelect }: SmileSliderProps) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    // Simple horizontal scroll implementation for now, curved effect can be complex.
    // We'll start with a clean horizontal slider with glass cards.
    const [activeIndex, setActiveIndex] = useState(0);

    return (
        <>
            <div className="w-full flex flex-col items-center justify-center py-10">
                {/* Added more pb (pb-20) to prevent shadow cutoff on hover/focus */}
                <div className="flex overflow-x-auto gap-8 px-20 pb-20 w-full snap-x snap-mandatory scrollbar-hide pt-10">
                    {disks.map((disk, index) => (
                        <motion.div
                            key={disk.id}
                            className="snap-center shrink-0 outline-none"
                            whileHover={{ scale: 1.05, y: -10 }}
                            whileFocus={{ scale: 1.05, y: -10 }}
                            onClick={() => onSelect(disk)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    onSelect(disk);
                                }
                            }}
                            tabIndex={index + 1}
                            data-focusable="true"
                            role="button"
                            aria-label={`Play ${disk.title} by ${disk.artist}`}
                        >
                            <div className="relative w-64 h-80 rounded-3xl overflow-hidden glass-card cursor-pointer group shadow-xl hover:shadow-2xl transition-shadow">
                                {/* Glass Effect created by global styles, here we apply specific classes */}
                                <div className="absolute inset-0 bg-white/40 dark:bg-black/40 backdrop-blur-md border border-white/20 z-10 transition-colors group-hover:bg-white/50" />

                                {/* Content */}
                                <div className="relative z-20 h-full flex flex-col p-4">
                                    <div className="w-full aspect-square rounded-2xl overflow-hidden shadow-2xl relative mb-4">
                                        {/* Placeholder for cover if not loaded */}
                                        {disk.coverImage ? (
                                            <img src={disk.coverImage} alt={disk.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gray-300 animate-pulse" />
                                        )}
                                        {/* Vinyl Record decorative element sliding out could be cool later */}
                                    </div>

                                    <div className="mt-auto">
                                        <h3 className="font-bold text-lg text-foreground truncate">{disk.title}</h3>
                                        <p className="text-sm text-muted-foreground truncate">{disk.artist}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {/* Add New Disk Button */}
                    <motion.div
                        className="snap-center shrink-0 outline-none"
                        whileHover={{ scale: 1.05 }}
                        whileFocus={{ scale: 1.05 }}
                        onClick={() => setIsAddModalOpen(true)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setIsAddModalOpen(true);
                            }
                        }}
                        tabIndex={disks.length + 1}
                        data-focusable="true"
                        role="button"
                        aria-label="Add new vinyl"
                    >
                        <div className="w-64 h-80 rounded-3xl border-2 border-dashed border-gray-400/50 flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 transition-colors backdrop-blur-sm group">
                            <span className="text-4xl text-muted-foreground group-hover:text-foreground transition-colors">+</span>
                            <span className="mt-2 text-muted-foreground font-medium group-hover:text-foreground transition-colors">Add Vinyl</span>
                        </div>
                    </motion.div>
                </div>
            </div>

            <AddVinylModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
        </>
    );
}

