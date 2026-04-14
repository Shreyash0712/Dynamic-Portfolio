'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreVertical, Pencil, Trash2 } from 'lucide-react';

interface MenuItem {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    danger?: boolean;
}

interface ThreeDotsMenuProps {
    items: MenuItem[];
}

export default function ThreeDotsMenu({ items }: ThreeDotsMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleItemClick = (onClick: () => void) => {
        onClick();
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="More options"
            >
                <MoreVertical className="h-4 w-4 text-gray-500" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -5 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-1 w-40 bg-white border rounded-lg shadow-lg z-50 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {items.map((item, index) => (
                            <button
                                key={index}
                                onClick={() => handleItemClick(item.onClick)}
                                className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-colors ${
                                    item.danger
                                        ? 'text-red-600 hover:bg-red-50'
                                        : 'text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                {item.icon}
                                {item.label}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
