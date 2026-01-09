'use client';

import { useEffect, useCallback, useRef } from 'react';

/**
 * Hook for Smart TV remote navigation
 * Enables arrow key navigation between focusable elements
 */
export const useTVNavigation = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    const getFocusableElements = useCallback(() => {
        if (!containerRef.current) return [];
        return Array.from(
            containerRef.current.querySelectorAll<HTMLElement>(
                'button:not([disabled]), [tabindex]:not([tabindex="-1"]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [data-focusable="true"]'
            )
        ).filter(el => {
            const rect = el.getBoundingClientRect();
            return rect.width > 0 && rect.height > 0;
        });
    }, []);

    const getElementCenter = (el: HTMLElement) => {
        const rect = el.getBoundingClientRect();
        return {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
        };
    };

    const findNextFocusable = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
        const elements = getFocusableElements();
        const current = document.activeElement as HTMLElement;

        if (!current || !elements.includes(current)) {
            return elements[0];
        }

        const currentCenter = getElementCenter(current);
        let bestCandidate: HTMLElement | null = null;
        let bestScore = Infinity;

        elements.forEach(el => {
            if (el === current) return;

            const elCenter = getElementCenter(el);
            const dx = elCenter.x - currentCenter.x;
            const dy = elCenter.y - currentCenter.y;

            // Check if element is in the correct direction
            let inDirection = false;
            let distance = 0;

            switch (direction) {
                case 'up':
                    inDirection = dy < -10;
                    distance = Math.abs(dy) + Math.abs(dx) * 0.5;
                    break;
                case 'down':
                    inDirection = dy > 10;
                    distance = Math.abs(dy) + Math.abs(dx) * 0.5;
                    break;
                case 'left':
                    inDirection = dx < -10;
                    distance = Math.abs(dx) + Math.abs(dy) * 0.5;
                    break;
                case 'right':
                    inDirection = dx > 10;
                    distance = Math.abs(dx) + Math.abs(dy) * 0.5;
                    break;
            }

            if (inDirection && distance < bestScore) {
                bestScore = distance;
                bestCandidate = el;
            }
        });

        return bestCandidate;
    }, [getFocusableElements]);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        let direction: 'up' | 'down' | 'left' | 'right' | null = null;

        switch (e.key) {
            case 'ArrowUp':
                direction = 'up';
                break;
            case 'ArrowDown':
                direction = 'down';
                break;
            case 'ArrowLeft':
                direction = 'left';
                break;
            case 'ArrowRight':
                direction = 'right';
                break;
            case 'Enter':
            case ' ':
                // Let the focused element handle it
                return;
            default:
                return;
        }

        if (direction) {
            e.preventDefault();
            const next = findNextFocusable(direction);
            if (next) {
                next.focus();
                next.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }
    }, [findNextFocusable]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    // Focus first element on mount
    useEffect(() => {
        const elements = getFocusableElements();
        if (elements.length > 0 && !document.activeElement?.closest('[data-focusable]')) {
            elements[0].focus();
        }
    }, [getFocusableElements]);

    return { containerRef };
};

/**
 * Global TV navigation wrapper component
 */
export const TVNavigationProvider = ({ children }: { children: React.ReactNode }) => {
    const { containerRef } = useTVNavigation();

    return (
        <div ref={containerRef} className="tv-navigation-container">
            {children}
        </div>
    );
};


