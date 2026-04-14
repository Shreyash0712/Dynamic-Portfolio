'use client';

import { useMemo, useCallback, useEffect, useState } from 'react';
import type { Component } from '@/lib/types';
import { motion } from 'framer-motion';
import ComponentTile from './ComponentTile';
import AddComponentTile from './AddComponentTile';

interface BentoGridProps {
    components: Component[];
    pageId: string;
    isAdmin?: boolean;
    onEdit?: (component: Component) => void;
    onDelete?: (componentId: string) => void;
    onAdd?: () => void;
    onResize?: (componentId: string, updates: { rowSpan?: number; colSpan?: number }) => void;
}

export default function BentoGrid({
    components,
    pageId,
    isAdmin = false,
    onEdit,
    onDelete,
    onAdd,
    onResize,
}: BentoGridProps) {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 640);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // For mobile non-admin (portfolio), sort components by their position
    const sortedComponents = useMemo(() => {
        if (isAdmin || !isMobile) return components;
        // Sort by row start, then column start for linear display
        return [...components].sort((a, b) => {
            if (a.rowStart !== b.rowStart) return a.rowStart - b.rowStart;
            return a.colStart - b.colStart;
        });
    }, [components, isAdmin, isMobile]);

    // Calculate max rows needed
    const maxRow = useMemo(() => {
        return Math.max(...components.map(c => c.rowStart + c.rowSpan - 1), 1);
    }, [components]);

    // Build occupancy grid for collision detection
    const occupancyGrid = useMemo(() => {
        const grid: Map<string, string> = new Map(); // key: "row,col", value: componentId
        
        for (const comp of components) {
            for (let r = comp.rowStart; r < comp.rowStart + comp.rowSpan; r++) {
                for (let c = comp.colStart; c < comp.colStart + comp.colSpan; c++) {
                    grid.set(`${r},${c}`, comp.id);
                }
            }
        }
        return grid;
    }, [components]);

    // Check if resize would cause collision
    const canResize = useCallback((componentId: string, newRowSpan: number, newColSpan: number): boolean => {
        const component = components.find(c => c.id === componentId);
        if (!component) return false;

        // Check if new size fits within 4 columns
        if (component.colStart + newColSpan - 1 > 4) return false;

        // Check collision with other components
        for (let r = component.rowStart; r < component.rowStart + newRowSpan; r++) {
            for (let c = component.colStart; c < component.colStart + newColSpan; c++) {
                const occupant = occupancyGrid.get(`${r},${c}`);
                if (occupant && occupant !== componentId) {
                    return false; // Collision detected
                }
            }
        }
        return true;
    }, [components, occupancyGrid]);

    // Mobile linear layout for portfolio
    if (!isAdmin && isMobile) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col gap-4"
            >
                {sortedComponents.map((component) => (
                    <ComponentTile
                        key={component.id}
                        component={component}
                        isAdmin={false}
                        forceLinear={true}
                    />
                ))}
            </motion.div>
        );
    }

    return (
        <>
            <style>{`
                .bento-grid {
                    display: grid;
                    gap: 0.75rem;
                    grid-template-columns: repeat(1, 1fr);
                    grid-auto-rows: 150px;
                }
                @media (min-width: 640px) {
                    .bento-grid {
                        gap: 1rem;
                        grid-template-columns: repeat(2, 1fr);
                        grid-auto-rows: 200px;
                    }
                }
                @media (min-width: 1024px) {
                    .bento-grid {
                        grid-template-columns: repeat(4, 1fr);
                    }
                }
            `}</style>
            <motion.div
                layout
                className="bento-grid"
                style={{
                    gridTemplateRows: `repeat(${maxRow}, minmax(150px, auto))`,
                }}
            >
                {components.map((component) => (
                    <ComponentTile
                        key={component.id}
                        component={component}
                        isAdmin={isAdmin}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onResize={onResize}
                        canResize={canResize}
                    />
                ))}

                {isAdmin && onAdd && (
                    <AddComponentTile onClick={onAdd} />
                )}
            </motion.div>
        </>
    );
}
