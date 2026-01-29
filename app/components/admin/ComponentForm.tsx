'use client';

import { useState, useEffect } from 'react';
import { Component, ComponentType, ParagraphProps, TextAlignment } from '@/lib/types';

// Available Google Fonts
const FONT_OPTIONS = [
    { value: 'var(--font-inter)', label: 'Inter' },
    { value: 'var(--font-roboto)', label: 'Roboto' },
    { value: 'var(--font-poppins)', label: 'Poppins' },
    { value: 'var(--font-montserrat)', label: 'Montserrat' },
    { value: 'var(--font-open-sans)', label: 'Open Sans' },
    { value: 'var(--font-lato)', label: 'Lato' },
    { value: 'var(--font-playfair)', label: 'Playfair Display' },
    { value: 'var(--font-merriweather)', label: 'Merriweather' },
];

const DEFAULT_PARAGRAPH_PROPS: ParagraphProps = {
    title: '',
    subtitle: '',
    title_color: '#000000',
    subtitle_color: '#666666',
    title_font_size: 48,
    title_font_style: 'var(--font-inter)',
    subtitle_font_size: 24,
    subtitle_font_style: 'var(--font-inter)',
    title_alignment: 'center',
    subtitle_alignment: 'center',
    paragraph: '',
    paragraph_text_size: 16,
    paragraph_font_style: 'var(--font-inter)',
    paragraph_alignment: 'left',
    paragraph_color: '#333333',
    bg_color: '#ffffff',
    height: 400,
};

interface ComponentFormProps {
    mode: 'create' | 'edit';
    componentType: ComponentType;
    initialData?: Component;
    onSuccess: () => void;
    onCancel?: () => void;
}

export default function ComponentForm({ mode, componentType, initialData, onSuccess, onCancel }: ComponentFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Paragraph form state
    const [paragraphProps, setParagraphProps] = useState<ParagraphProps>(
        mode === 'edit' && initialData ? initialData.props : DEFAULT_PARAGRAPH_PROPS
    );

    // Update form when initialData changes
    useEffect(() => {
        if (mode === 'edit' && initialData) {
            setParagraphProps(initialData.props);
        }
    }, [mode, initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage(null);

        try {
            const url = mode === 'create' ? '/api/components' : `/api/components/${initialData?.id}`;
            const method = mode === 'create' ? 'POST' : 'PUT';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    component_type: componentType,
                    props: paragraphProps,
                    display_order: initialData?.display_order,
                    is_visible: initialData?.is_visible ?? false,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setMessage({ type: 'success', text: `Component ${mode === 'create' ? 'created' : 'updated'} successfully!` });
                setTimeout(() => {
                    onSuccess();
                }, 500);
            } else {
                setMessage({ type: 'error', text: data.error || `Failed to ${mode} component` });
            }
        } catch (error) {
            setMessage({ type: 'error', text: `An error occurred while ${mode === 'create' ? 'creating' : 'updating'} the component` });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-6">
            {message && (
                <div
                    className={`mb-4 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                >
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Paragraph Component Fields */}
                {componentType === ComponentType.PARAGRAPH && (
                    <div className="space-y-6">
                        {/* Title Section */}
                        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                            <h3 className="font-semibold text-lg">Title</h3>
                            <div>
                                <label className="block text-sm font-medium mb-2">Title Text</label>
                                <input
                                    type="text"
                                    value={paragraphProps.title}
                                    onChange={(e) => setParagraphProps({ ...paragraphProps, title: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter title"
                                />
                            </div>
                            <div className="grid grid-cols-4 gap-3">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Color</label>
                                    <input
                                        type="color"
                                        value={paragraphProps.title_color}
                                        onChange={(e) => setParagraphProps({ ...paragraphProps, title_color: e.target.value })}
                                        className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Size (px)</label>
                                    <input
                                        type="number"
                                        value={paragraphProps.title_font_size}
                                        onChange={(e) => setParagraphProps({ ...paragraphProps, title_font_size: Number(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        min="8"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Font</label>
                                    <select
                                        value={paragraphProps.title_font_style}
                                        onChange={(e) => setParagraphProps({ ...paragraphProps, title_font_style: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        {FONT_OPTIONS.map((font) => (
                                            <option key={font.value} value={font.value}>
                                                {font.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Align</label>
                                    <select
                                        value={paragraphProps.title_alignment}
                                        onChange={(e) => setParagraphProps({ ...paragraphProps, title_alignment: e.target.value as TextAlignment })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="left">Left</option>
                                        <option value="center">Center</option>
                                        <option value="right">Right</option>
                                        <option value="justify">Justify</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Subtitle Section */}
                        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                            <h3 className="font-semibold text-lg">Subtitle</h3>
                            <div>
                                <label className="block text-sm font-medium mb-2">Subtitle Text</label>
                                <input
                                    type="text"
                                    value={paragraphProps.subtitle}
                                    onChange={(e) => setParagraphProps({ ...paragraphProps, subtitle: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter subtitle"
                                />
                            </div>
                            <div className="grid grid-cols-4 gap-3">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Color</label>
                                    <input
                                        type="color"
                                        value={paragraphProps.subtitle_color}
                                        onChange={(e) => setParagraphProps({ ...paragraphProps, subtitle_color: e.target.value })}
                                        className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Size (px)</label>
                                    <input
                                        type="number"
                                        value={paragraphProps.subtitle_font_size}
                                        onChange={(e) => setParagraphProps({ ...paragraphProps, subtitle_font_size: Number(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        min="8"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Font</label>
                                    <select
                                        value={paragraphProps.subtitle_font_style}
                                        onChange={(e) => setParagraphProps({ ...paragraphProps, subtitle_font_style: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        {FONT_OPTIONS.map((font) => (
                                            <option key={font.value} value={font.value}>
                                                {font.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Align</label>
                                    <select
                                        value={paragraphProps.subtitle_alignment}
                                        onChange={(e) => setParagraphProps({ ...paragraphProps, subtitle_alignment: e.target.value as TextAlignment })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="left">Left</option>
                                        <option value="center">Center</option>
                                        <option value="right">Right</option>
                                        <option value="justify">Justify</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Paragraph Section */}
                        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                            <h3 className="font-semibold text-lg">Paragraph</h3>
                            <div>
                                <label className="block text-sm font-medium mb-2">Paragraph Content</label>
                                <textarea
                                    value={paragraphProps.paragraph}
                                    onChange={(e) => setParagraphProps({ ...paragraphProps, paragraph: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    rows={6}
                                    placeholder="Enter paragraph content (HTML supported)"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    You can use HTML tags like &lt;b&gt;, &lt;i&gt;, &lt;u&gt; for formatting
                                </p>
                            </div>
                            <div className="grid grid-cols-4 gap-3">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Color</label>
                                    <input
                                        type="color"
                                        value={paragraphProps.paragraph_color}
                                        onChange={(e) => setParagraphProps({ ...paragraphProps, paragraph_color: e.target.value })}
                                        className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Size (px)</label>
                                    <input
                                        type="number"
                                        value={paragraphProps.paragraph_text_size}
                                        onChange={(e) => setParagraphProps({ ...paragraphProps, paragraph_text_size: Number(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        min="8"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Font</label>
                                    <select
                                        value={paragraphProps.paragraph_font_style}
                                        onChange={(e) => setParagraphProps({ ...paragraphProps, paragraph_font_style: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        {FONT_OPTIONS.map((font) => (
                                            <option key={font.value} value={font.value}>
                                                {font.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Align</label>
                                    <select
                                        value={paragraphProps.paragraph_alignment}
                                        onChange={(e) => setParagraphProps({ ...paragraphProps, paragraph_alignment: e.target.value as TextAlignment })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="left">Left</option>
                                        <option value="center">Center</option>
                                        <option value="right">Right</option>
                                        <option value="justify">Justify</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Layout Section */}
                        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                            <h3 className="font-semibold text-lg">Layout</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Background Color</label>
                                    <input
                                        type="color"
                                        value={paragraphProps.bg_color}
                                        onChange={(e) => setParagraphProps({ ...paragraphProps, bg_color: e.target.value })}
                                        className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Height (px)</label>
                                    <input
                                        type="number"
                                        value={paragraphProps.height}
                                        onChange={(e) => setParagraphProps({ ...paragraphProps, height: Number(e.target.value) })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        min="100"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Form Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        type="submit"
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Component' : 'Update Component'}
                    </button>
                </div>
            </form>
        </div>
    );
}
