'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Component, ComponentType } from '@/lib/types';

interface ComponentCardProps {
    component: Component;
    onEdit: (component: Component) => void;
    onDelete: (id: string) => void;
    onToggleVisibility: (id: string, isVisible: boolean) => void;
}

export default function ComponentCard({ component, onEdit, onDelete, onToggleVisibility }: ComponentCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: component.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    // Extract title and subtitle from props based on component type
    const getDisplayInfo = () => {
        if (component.component_type === ComponentType.PARAGRAPH) {
            return {
                title: component.props.title || 'Untitled',
                subtitle: component.props.subtitle || 'No subtitle',
            };
        }
        return { title: 'Component', subtitle: component.component_type };
    };

    const { title, subtitle } = getDisplayInfo();

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
            <div className="flex items-start justify-between gap-4">
                {/* Drag Handle */}
                <button
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Drag to reorder"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                    </svg>
                </button>

                {/* Content - Clickable to edit */}
                <div
                    className="flex-1 cursor-pointer"
                    onClick={() => onEdit(component)}
                >
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded capitalize">
                            {component.component_type}
                        </span>
                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            Order: {component.display_order}
                        </span>
                        <span className={`text-xs font-medium px-2 py-1 rounded ${component.is_visible ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                            }`}>
                            {component.is_visible ? 'Visible' : 'Hidden'}
                        </span>
                    </div>
                    <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">{title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-1">{subtitle}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    {/* Visibility Toggle */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleVisibility(component.id, !component.is_visible);
                        }}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title={component.is_visible ? 'Hide component' : 'Show component'}
                    >
                        {component.is_visible ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                        )}
                    </button>

                    {/* Delete */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Are you sure you want to delete this component?')) {
                                onDelete(component.id);
                            }
                        }}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete component"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
