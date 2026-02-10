'use client';

import { useState, useEffect } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Component, ComponentType } from '@/lib/types';
import Modal from '../components/admin/Modal';
import ComponentForm from '../components/admin/ComponentForm';
import ComponentCard from '../components/admin/ComponentCard';

export default function AdminPage() {
    const [components, setComponents] = useState<Component[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [selectedComponentType, setSelectedComponentType] = useState<ComponentType>(ComponentType.PARAGRAPH);
    const [editingComponent, setEditingComponent] = useState<Component | undefined>();
    const [isLoading, setIsLoading] = useState(true);

    // Drag and drop sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Fetch components
    const fetchComponents = async () => {
        try {
            const response = await fetch('/api/components');
            const data = await response.json();
            if (data.success) {
                // Sort by display_order descending (highest first)
                const sorted = data.data.sort((a: Component, b: Component) => b.display_order - a.display_order);
                setComponents(sorted);
            }
        } catch (error) {
            console.error('Error fetching components:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchComponents();
    }, []);

    // Handle drag end
    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over || active.id === over.id) {
            return;
        }

        const oldIndex = components.findIndex((c) => c.id === active.id);
        const newIndex = components.findIndex((c) => c.id === over.id);

        // Reorder locally first for immediate feedback
        const reorderedComponents = arrayMove(components, oldIndex, newIndex);
        setComponents(reorderedComponents);

        // Calculate new display_order values
        // Since components are sorted descending, index 0 has highest display_order
        const maxOrder = Math.max(...reorderedComponents.map(c => c.display_order));
        const updates = reorderedComponents.map((component, index) => ({
            id: component.id,
            display_order: maxOrder - index, // Descending order
        }));

        // Update only the components that changed
        const changedUpdates = updates.filter((update, index) => {
            const originalComponent = reorderedComponents[index];
            return originalComponent.display_order !== update.display_order;
        });

        // Batch update all changed components
        try {
            await Promise.all(
                changedUpdates.map((update) =>
                    fetch(`/api/components/${update.id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ display_order: update.display_order }),
                    })
                )
            );

            // Refresh to ensure consistency
            fetchComponents();
        } catch (error) {
            console.error('Error updating display order:', error);
            // Revert on error
            fetchComponents();
        }
    };

    // Handle create new component
    const handleCreateNew = (type: ComponentType) => {
        setSelectedComponentType(type);
        setModalMode('create');
        setEditingComponent(undefined);
        setIsModalOpen(true);
        setIsDropdownOpen(false);
    };

    // Handle edit component
    const handleEdit = (component: Component) => {
        setSelectedComponentType(component.component_type as ComponentType);
        setModalMode('edit');
        setEditingComponent(component);
        setIsModalOpen(true);
    };

    // Handle delete component
    const handleDelete = async (id: string) => {
        try {
            const response = await fetch(`/api/components/${id}`, {
                method: 'DELETE',
            });
            const data = await response.json();
            if (data.success) {
                fetchComponents();
            }
        } catch (error) {
            console.error('Error deleting component:', error);
        }
    };

    // Handle toggle visibility
    const handleToggleVisibility = async (id: string, isVisible: boolean) => {
        try {
            const response = await fetch(`/api/components/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ is_visible: isVisible }),
            });
            const data = await response.json();
            if (data.success) {
                fetchComponents();
            }
        } catch (error) {
            console.error('Error toggling visibility:', error);
        }
    };

    // Handle form success
    const handleFormSuccess = () => {
        setIsModalOpen(false);
        fetchComponents();
    };

    // Handle logout
    const handleLogout = async () => {
        await fetch('/api/auth/signout', { method: 'POST' });
        window.location.href = '/login';
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>

                        {/* Right side buttons */}
                        <div className="flex items-center gap-3">
                            {/* Add Component Button with Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Add Component
                                </button>

                                {/* Dropdown */}
                                {isDropdownOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-10"
                                            onClick={() => setIsDropdownOpen(false)}
                                        />
                                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                                            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                                                Select Component Type
                                            </div>
                                            <button
                                                onClick={() => handleCreateNew(ComponentType.PARAGRAPH)}
                                                className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
                                            >
                                                <div className="font-medium">Paragraph</div>
                                                <div className="text-sm text-gray-500">Text content with title and subtitle</div>
                                            </button>
                                            <button
                                                onClick={() => handleCreateNew(ComponentType.IMAGE)}
                                                className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
                                            >
                                                <div className="font-medium">Image</div>
                                                <div className="text-sm text-gray-500">Display an image with optional caption</div>
                                            </button>
                                            <button
                                                onClick={() => handleCreateNew(ComponentType.SLIDER)}
                                                className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
                                            >
                                                <div className="font-medium">Slider</div>
                                                <div className="text-sm text-gray-500">Carousel with multiple cards</div>
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Logout Button */}
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">Your Components</h2>
                    <p className="text-sm text-gray-600">
                        Drag components to reorder them. Click on a component to edit it.
                    </p>
                </div>

                {/* Component List */}
                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <p className="mt-2 text-gray-600">Loading components...</p>
                    </div>
                ) : components.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No components</h3>
                        <p className="mt-1 text-sm text-gray-500">Get started by creating a new component.</p>
                        <div className="mt-6">
                            <button
                                onClick={() => setIsDropdownOpen(true)}
                                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add Component
                            </button>
                        </div>
                    </div>
                ) : (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={components.map((c) => c.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="space-y-4">
                                {components.map((component) => (
                                    <ComponentCard
                                        key={component.id}
                                        component={component}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                        onToggleVisibility={handleToggleVisibility}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                )}
            </div>

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={modalMode === 'create' ? `Create ${selectedComponentType} Component` : `Edit ${selectedComponentType} Component`}
            >
                <ComponentForm
                    mode={modalMode}
                    componentType={selectedComponentType}
                    initialData={editingComponent}
                    onSuccess={handleFormSuccess}
                    onCancel={() => setIsModalOpen(false)}
                />
            </Modal>
        </div>
    );
}
