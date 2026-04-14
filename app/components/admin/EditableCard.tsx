'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Pencil, Trash2, Check, X } from 'lucide-react';
import Button from '@/app/components/ui/Button';
import ThreeDotsMenu from './ThreeDotsMenu';

interface EditableCardProps {
    id: string;
    title: string;
    subtitle?: string;
    icon: React.ReactNode;
    iconBgClass?: string;
    iconColorClass?: string;
    isActive?: boolean;
    activeLabel?: string;
    onClick: () => void;
    onEdit: (id: string, newName: string) => void;
    onDelete: (id: string) => void;
    extraActions?: { label: string; onClick: () => void }[];
    editPlaceholder?: string;
}

export default function EditableCard({
    id,
    title,
    subtitle,
    icon,
    iconBgClass = 'bg-gray-100',
    iconColorClass = 'text-gray-500',
    isActive = false,
    activeLabel = 'Active',
    onClick,
    onEdit,
    onDelete,
    extraActions,
    editPlaceholder = 'Name',
}: EditableCardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(title);

    const handleSave = () => {
        if (editValue.trim()) {
            onEdit(id, editValue.trim());
        }
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditValue(title);
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSave();
        if (e.key === 'Escape') handleCancel();
    };

    const menuItems = [
        {
            label: 'Edit',
            icon: <Pencil className="h-4 w-4" />,
            onClick: () => setIsEditing(true),
        },
        ...(extraActions?.map(action => ({
            label: action.label,
            icon: <Pencil className="h-4 w-4" />,
            onClick: action.onClick,
        })) || []),
        {
            label: 'Delete',
            icon: <Trash2 className="h-4 w-4" />,
            onClick: () => onDelete(id),
            danger: true,
        },
    ];

    if (isEditing) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-4 rounded-xl border-2 ${
                    isActive ? 'border-blue-500 bg-blue-50/50' : 'border-gray-200 bg-white'
                }`}
            >
                <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${iconBgClass}`}>
                        {icon}
                    </div>
                    <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        placeholder={editPlaceholder}
                        className="flex-1 p-2 text-sm border rounded"
                        autoFocus
                        onKeyDown={handleKeyDown}
                    />
                </div>
                <div className="flex gap-2">
                    <Button size="sm" onClick={handleSave} className="flex-1">
                        <Check className="h-4 w-4 mr-1" />
                        Save
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleCancel}>
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                    </Button>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
            className={`group rounded-xl border-2 transition-all ${
                isActive
                    ? 'border-blue-500 bg-blue-50/50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
        >
            <div
                className="p-6 cursor-pointer"
                onClick={onClick}
            >
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-lg ${isActive ? 'bg-blue-100' : iconBgClass}`}>
                            <div className={isActive ? 'text-blue-600' : iconColorClass}>
                                {icon}
                            </div>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">{title}</h3>
                            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
                        </div>
                    </div>
                    <ThreeDotsMenu items={menuItems} />
                </div>

                {isActive && activeLabel && (
                    <div className="mt-4 flex items-center gap-2 text-sm text-blue-600">
                        <Check className="h-4 w-4" />
                        <span>{activeLabel}</span>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
