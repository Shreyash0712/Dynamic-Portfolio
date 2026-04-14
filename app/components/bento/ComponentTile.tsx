'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import type { Component } from '@/lib/types';
import { Pencil, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '@/app/components/ui/Button';
import ComponentRenderer from '../portfolio/ComponentRenderer';

interface ComponentTileProps {
    component: Component;
    isAdmin?: boolean;
    onEdit?: (component: Component) => void;
    onDelete?: (componentId: string) => void;
    onResize?: (componentId: string, updates: { rowSpan?: number; colSpan?: number }) => void;
    canResize?: (componentId: string, newRowSpan: number, newColSpan: number) => boolean;
    forceLinear?: boolean;
}

export default function ComponentTile({
    component,
    isAdmin = false,
    onEdit,
    onDelete,
    onResize,
    canResize,
    forceLinear = false,
}: ComponentTileProps) {
    const [isResizing, setIsResizing] = useState(false);
    const resizeDirection = useRef<{ row: number; col: number } | null>(null);
    const startPos = useRef({ x: 0, y: 0 });
    const startSize = useRef({ rowSpan: component.rowSpan, colSpan: component.colSpan });
    const lastValidSize = useRef({ rowSpan: component.rowSpan, colSpan: component.colSpan });

    const handleResizeStart = useCallback((e: React.MouseEvent, direction: { row: number; col: number }) => {
        e.preventDefault();
        e.stopPropagation();
        
        resizeDirection.current = direction;
        startPos.current = { x: e.clientX, y: e.clientY };
        startSize.current = { rowSpan: component.rowSpan, colSpan: component.colSpan };
        lastValidSize.current = { rowSpan: component.rowSpan, colSpan: component.colSpan };
        setIsResizing(true);
    }, [component.rowSpan, component.colSpan]);

    const handleResizeMove = useCallback((e: MouseEvent) => {
        if (!isResizing || !resizeDirection.current || !onResize || !canResize) return;

        const deltaX = e.clientX - startPos.current.x;
        const deltaY = e.clientY - startPos.current.y;
        
        // Grid cell size estimation
        const cellWidth = 220;
        const cellHeight = 170;

        const colChange = Math.round(deltaX / cellWidth) * resizeDirection.current.col;
        const rowChange = Math.round(deltaY / cellHeight) * resizeDirection.current.row;

        const newColSpan = Math.max(1, Math.min(4 - component.colStart + 1, startSize.current.colSpan + colChange));
        const newRowSpan = Math.max(1, startSize.current.rowSpan + rowChange);

        // Only resize if collision-free
        if (canResize(component.id, newRowSpan, newColSpan)) {
            lastValidSize.current = { rowSpan: newRowSpan, colSpan: newColSpan };
            onResize(component.id, { rowSpan: newRowSpan, colSpan: newColSpan });
        }
    }, [isResizing, canResize, onResize, component.id, component.colStart]);

    const handleResizeEnd = useCallback(() => {
        setIsResizing(false);
        resizeDirection.current = null;
    }, []);

    // Attach global mouse listeners during resize
    useEffect(() => {
        if (isResizing) {
            window.addEventListener('mousemove', handleResizeMove);
            window.addEventListener('mouseup', handleResizeEnd);
            return () => {
                window.removeEventListener('mousemove', handleResizeMove);
                window.removeEventListener('mouseup', handleResizeEnd);
            };
        }
    }, [isResizing, handleResizeMove, handleResizeEnd]);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`
                relative rounded-2xl overflow-hidden
                ${component.status === 'draft' ? 'ring-2 ring-yellow-400 ring-offset-2' : ''}
                ${isAdmin ? 'group cursor-pointer' : ''}
                ${isResizing ? 'z-50' : ''}
            `}
            style={forceLinear ? undefined : {
                gridRow: `${component.rowStart} / span ${component.rowSpan}`,
                gridColumn: `${component.colStart} / span ${component.colSpan}`,
            }}
            onClick={() => onEdit?.(component)}
        >
            <ComponentRenderer component={component} />

            {isAdmin && (
                <>
                    {/* Draft badge */}
                    {component.status === 'draft' && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute top-2 left-2 px-2 py-1 bg-yellow-400 text-yellow-900 text-xs font-medium rounded z-10"
                        >
                            Draft
                        </motion.div>
                    )}

                    {/* Admin controls overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none rounded-2xl" />

                    {/* Action buttons */}
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto z-10">
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit?.(component);
                            }}
                            className="h-8 w-8 p-0 bg-white/90 hover:bg-white shadow-sm"
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete?.(component.id);
                            }}
                            className="h-8 w-8 p-0 shadow-sm"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Corner resize handle */}
                    {onResize && canResize && (
                        <>
                            <div
                                className="absolute bottom-2 right-2 w-6 h-6 cursor-nwse-resize opacity-0 group-hover:opacity-100 transition-opacity z-20"
                                onMouseDown={(e) => handleResizeStart(e, { row: 1, col: 1 })}
                                title="Drag to resize"
                            >
                                <motion.div 
                                    whileHover={{ scale: 1.2 }}
                                    className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500 rounded-full shadow-md border-2 border-white flex items-center justify-center"
                                >
                                    <svg className="w-2 h-2 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                        <path d="M7 17L17 7M17 7H7M17 7V17" />
                                    </svg>
                                </motion.div>
                            </div>
                        </>
                    )}
                </>
            )}
        </motion.div>
    );
}
