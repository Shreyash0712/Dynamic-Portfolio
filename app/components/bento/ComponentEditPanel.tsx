'use client';

import { useState, useEffect } from 'react';
import type { Component, UpdateComponentRequest } from '@/lib/types';
import { motion } from 'framer-motion';
import Button from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';
import Select from '@/app/components/ui/Select';
import { useToast, useConfirm } from '@/app/hooks/useToast';
import { X, ArrowLeft, Trash2, Eye, EyeOff, Settings2 } from 'lucide-react';

interface ComponentEditPanelProps {
    component: Component;
    onUpdate: (id: string, data: UpdateComponentRequest) => void;
    onClose: () => void;
    onDelete: (id: string) => void;
    collapsed?: boolean;
    isMobile?: boolean;
}

const alignOptions = [
    { value: 'start', label: 'Start' },
    { value: 'center', label: 'Center' },
    { value: 'end', label: 'End' },
    { value: 'stretch', label: 'Stretch' },
];

const justifyOptions = [
    { value: 'start', label: 'Start' },
    { value: 'center', label: 'Center' },
    { value: 'end', label: 'End' },
    { value: 'between', label: 'Space Between' },
    { value: 'around', label: 'Space Around' },
];

const borderRadiusOptions = [
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' },
    { value: 'circle', label: 'Circle' },
];

const imagePositionOptions = [
    { value: 'none', label: 'None' },
    { value: 'left', label: 'Left' },
    { value: 'right', label: 'Right' },
    { value: 'center', label: 'Center' },
    { value: 'background', label: 'Background' },
];

export default function ComponentEditPanel({ component, onUpdate, onClose, onDelete, collapsed = false, isMobile = false }: ComponentEditPanelProps) {
    const [formData, setFormData] = useState<Partial<Component>>(component);
    const [isSaving, setIsSaving] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const { success: toastSuccess } = useToast();
    const { confirm, ConfirmDialog } = useConfirm();

    // Update local state when component prop changes
    useEffect(() => {
        setFormData(component);
    }, [component.id]);
    
    // Auto-save when formData changes (debounced via parent)
    useEffect(() => {
        // Skip initial render
        if (formData.id === component.id && JSON.stringify(formData) !== JSON.stringify(component)) {
            setIsSaving(true);
            const data: UpdateComponentRequest = {
                status: formData.status,
                isVisible: formData.isVisible,
                rowStart: formData.rowStart,
                rowSpan: formData.rowSpan,
                colStart: formData.colStart,
                colSpan: formData.colSpan,
                contentHtml: formData.contentHtml || undefined,
                alignItems: formData.alignItems || undefined,
                justifyContent: formData.justifyContent || undefined,
                bgColor: formData.bgColor || undefined,
                padding: formData.padding ?? undefined,
                borderRadius: formData.borderRadius || undefined,
                imageUrl: formData.imageUrl || undefined,
                imagePosition: formData.imagePosition || undefined,
                imageOpacity: formData.imageOpacity ?? undefined,
                imageAccentColor: formData.imageAccentColor || undefined,
            };
            onUpdate(component.id, data);
            
            // Clear saving indicator after a short delay
            const timer = setTimeout(() => setIsSaving(false), 600);
            return () => clearTimeout(timer);
        }
    }, [formData]);

    const handleDelete = () => {
        confirm({
            title: 'Delete Component?',
            message: 'This component and all its content will be permanently removed. This action cannot be undone.',
            confirmText: 'Delete',
            cancelText: 'Cancel',
            type: 'danger',
            onConfirm: () => {
                onDelete(component.id);
                toastSuccess('Component deleted');
            },
        });
    };

    // Collapsed view - minimal controls
    if (collapsed && !isExpanded) {
        return (
            <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col h-full"
            >
                <div className="p-3 border-b flex items-center justify-between">
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
                        title="Back to Pages"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => setIsExpanded(true)}
                        className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
                        title="Expand settings"
                    >
                        <Settings2 className="h-4 w-4" />
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-2 space-y-3">
                    {/* Quick actions */}
                    <div className="space-y-2">
                        <button
                            onClick={() => setFormData({ ...formData, status: formData.status === 'draft' ? 'published' : 'draft' })}
                            className={`w-full px-2 py-2 rounded-lg text-xs font-medium transition-colors ${
                                formData.status === 'draft'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-green-100 text-green-800'
                            }`}
                        >
                            {formData.status === 'draft' ? 'Draft' : 'Published'}
                        </button>
                        
                        <button
                            onClick={() => setFormData({ ...formData, isVisible: !formData.isVisible })}
                            className={`w-full flex items-center justify-center gap-1 px-2 py-2 rounded-lg text-xs transition-colors ${
                                formData.isVisible ? 'text-green-600 bg-green-50' : 'text-gray-400 bg-gray-100'
                            }`}
                        >
                            {formData.isVisible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                            {formData.isVisible ? 'Visible' : 'Hidden'}
                        </button>
                    </div>

                    {/* Quick size controls */}
                    <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                            <label className="text-[10px] text-gray-500 uppercase">W</label>
                            <Input
                                type="number"
                                min={1}
                                max={4}
                                value={formData.colSpan || 1}
                                onChange={(e) => setFormData({ ...formData, colSpan: parseInt(e.target.value) || 1 })}
                                className="h-8 text-center text-sm"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] text-gray-500 uppercase">H</label>
                            <Input
                                type="number"
                                min={1}
                                max={12}
                                value={formData.rowSpan || 1}
                                onChange={(e) => setFormData({ ...formData, rowSpan: parseInt(e.target.value) || 1 })}
                                className="h-8 text-center text-sm"
                            />
                        </div>
                    </div>

                    {/* Delete */}
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDelete}
                        className="w-full h-8"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>

            </motion.div>
        );
    }

    // Full view (or expanded from collapsed)
    return (
        <motion.div
            initial={{ x: isMobile ? 300 : -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: isMobile ? 300 : -20, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`flex flex-col h-full ${isMobile ? 'w-[85vw] min-w-[300px] max-w-[400px]' : ''}`}
        >
            {/* Header */}
            <div className="p-3 border-b flex items-center justify-between">
                <button
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
                    title="Back"
                >
                    <ArrowLeft className="h-5 w-5 text-gray-600" />
                </button>
                {collapsed && (
                    <button
                        onClick={() => setIsExpanded(false)}
                        className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
                        title="Collapse"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Status & Visibility */}
                <div className="space-y-3">
                    <h3 className="font-medium text-sm text-gray-900">Status</h3>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFormData({ ...formData, status: 'draft' })}
                            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                formData.status === 'draft'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            Draft
                        </button>
                        <button
                            onClick={() => setFormData({ ...formData, status: 'published' })}
                            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                formData.status === 'published'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            Published
                        </button>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <button
                            onClick={() => setFormData({ ...formData, isVisible: !formData.isVisible })}
                            className={`p-1.5 rounded transition-colors ${
                                formData.isVisible ? 'text-green-600' : 'text-gray-400'
                            }`}
                        >
                            {formData.isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </button>
                        <span className="text-sm text-gray-600">
                            {formData.isVisible ? 'Visible on site' : 'Hidden from visitors'}
                        </span>
                    </label>
                </div>

                {/* Size */}
                <div className="space-y-3">
                    <h3 className="font-medium text-sm text-gray-900">Size</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-xs text-gray-500">Row Span</label>
                            <Input
                                type="number"
                                min={1}
                                max={12}
                                value={formData.rowSpan || 1}
                                onChange={(e) => setFormData({ ...formData, rowSpan: parseInt(e.target.value) || 1 })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-gray-500">Col Span</label>
                            <Input
                                type="number"
                                min={1}
                                max={4}
                                value={formData.colSpan || 1}
                                onChange={(e) => setFormData({ ...formData, colSpan: parseInt(e.target.value) || 1 })}
                            />
                        </div>
                    </div>
                    <p className="text-xs text-gray-500">
                        Component spans {formData.rowSpan || 1} rows × {formData.colSpan || 1} columns
                    </p>
                </div>

                {/* Position */}
                <div className="space-y-3">
                    <h3 className="font-medium text-sm text-gray-900">Position</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-xs text-gray-500">Row Start</label>
                            <Input
                                type="number"
                                min={1}
                                max={12}
                                value={formData.rowStart || 1}
                                onChange={(e) => setFormData({ ...formData, rowStart: parseInt(e.target.value) || 1 })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-gray-500">Col Start</label>
                            <Input
                                type="number"
                                min={1}
                                max={4}
                                value={formData.colStart || 1}
                                onChange={(e) => setFormData({ ...formData, colStart: parseInt(e.target.value) || 1 })}
                            />
                        </div>
                    </div>
                </div>

                {/* Styling */}
                <div className="space-y-3">
                    <h3 className="font-medium text-sm text-gray-900">Styling</h3>
                    <div className="space-y-2">
                        <label className="text-xs text-gray-500">Background Color</label>
                        <div className="flex gap-2">
                            <input
                                type="color"
                                value={formData.bgColor || '#ffffff'}
                                onChange={(e) => setFormData({ ...formData, bgColor: e.target.value })}
                                className="h-9 w-9 rounded border cursor-pointer"
                            />
                            <Input
                                type="text"
                                value={formData.bgColor || ''}
                                onChange={(e) => setFormData({ ...formData, bgColor: e.target.value })}
                                placeholder="#ffffff"
                                className="flex-1"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs text-gray-500">Padding (px)</label>
                        <Input
                            type="number"
                            min={0}
                            value={formData.padding ?? 24}
                            onChange={(e) => setFormData({ ...formData, padding: parseInt(e.target.value) || 0 })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                            <label className="text-xs text-gray-500">Align Items</label>
                            <Select
                                value={formData.alignItems || 'center'}
                                onChange={(value) => setFormData({ ...formData, alignItems: value as Component['alignItems'] })}
                                options={alignOptions}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-gray-500">Justify Content</label>
                            <Select
                                value={formData.justifyContent || 'center'}
                                onChange={(value) => setFormData({ ...formData, justifyContent: value as Component['justifyContent'] })}
                                options={justifyOptions}
                            />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-gray-500">Border Radius</label>
                        <Select
                            value={formData.borderRadius || 'medium'}
                            onChange={(value) => setFormData({ ...formData, borderRadius: value as Component['borderRadius'] })}
                            options={borderRadiusOptions}
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-3">
                    <h3 className="font-medium text-sm text-gray-900">Content (HTML)</h3>
                    <textarea
                        className="w-full min-h-[120px] p-3 border rounded-lg font-mono text-sm resize-y"
                        value={formData.contentHtml || ''}
                        onChange={(e) => setFormData({ ...formData, contentHtml: e.target.value })}
                        placeholder="<h1>Your Title</h1><p>Your content here...</p>"
                    />
                </div>

                {/* Image Settings */}
                <div className="space-y-3">
                    <h3 className="font-medium text-sm text-gray-900">Image</h3>
                    <div className="space-y-2">
                        <label className="text-xs text-gray-500">Image URL</label>
                        <Input
                            type="text"
                            value={formData.imageUrl || ''}
                            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                            placeholder="https://..."
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                            <label className="text-xs text-gray-500">Position</label>
                            <Select
                                value={formData.imagePosition || 'none'}
                                onChange={(value) => setFormData({ ...formData, imagePosition: value as Component['imagePosition'] })}
                                options={imagePositionOptions}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-gray-500">Opacity (%)</label>
                            <Input
                                type="number"
                                min={0}
                                max={100}
                                value={formData.imageOpacity ?? 100}
                                onChange={(e) => setFormData({ ...formData, imageOpacity: parseInt(e.target.value) || 100 })}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs text-gray-500">Accent/Overlay Color</label>
                        <div className="flex gap-2">
                            <input
                                type="color"
                                value={formData.imageAccentColor || '#000000'}
                                onChange={(e) => setFormData({ ...formData, imageAccentColor: e.target.value })}
                                className="h-9 w-9 rounded border cursor-pointer"
                            />
                            <Input
                                type="text"
                                value={formData.imageAccentColor || ''}
                                onChange={(e) => setFormData({ ...formData, imageAccentColor: e.target.value })}
                                placeholder="#000000"
                                className="flex-1"
                            />
                        </div>
                    </div>
                </div>

                {/* Delete Button */}
                <div className="pt-4 border-t">
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDelete}
                        className="w-full gap-2"
                    >
                        <Trash2 className="h-4 w-4" />
                        Delete Component
                    </Button>
                </div>
            </div>

            <ConfirmDialog />
        </motion.div>
    );
}
