'use client';

import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';

interface AddComponentTileProps {
    onClick: () => void;
}

export default function AddComponentTile({ onClick }: AddComponentTileProps) {
    return (
        <motion.button
            whileHover={{ scale: 1.02, backgroundColor: '#f3f4f6' }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className="
                flex flex-col items-center justify-center gap-2
                rounded-2xl border-2 border-dashed border-gray-300
                bg-gray-50 hover:border-gray-400
                transition-colors cursor-pointer
                min-h-[150px] sm:min-h-[200px]
            "
            style={{
                gridColumn: 'span 1',
                gridRow: 'span 1',
            }}
        >
            <motion.div
                initial={{ scale: 1 }}
                whileHover={{ scale: 1.1, rotate: 90 }}
                transition={{ duration: 0.2 }}
            >
                <Plus className="h-8 w-8 text-gray-400" />
            </motion.div>
            <span className="text-sm text-gray-500 text-center px-4">
                Add component
            </span>
        </motion.button>
    );
}
