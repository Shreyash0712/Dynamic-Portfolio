'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import type { Component, Page, CreateComponentRequest, UpdateComponentRequest, Theme } from '@/lib/types';
import BentoGrid from '@/app/components/bento/BentoGrid';
import PagesSidebar from '@/app/components/bento/PagesSidebar';
import ComponentEditPanel from '@/app/components/bento/ComponentEditPanel';
import Button from '@/app/components/ui/Button';
import { useToast, useConfirm } from '@/app/hooks/useToast';
import { Upload, LogOut, ArrowLeft, ChevronRight } from 'lucide-react';

// Debounce utility
function useDebouncedCallback<T extends (...args: any[]) => void>(callback: T, delay: number) {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    
    return useCallback((...args: Parameters<T>) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
            callback(...args);
        }, delay);
    }, [callback, delay]);
}

export default function BentoEditorPage() {
    const router = useRouter();
    const params = useParams();
    const themeId = params.themeId as string;
    const pageId = params.pageId as string;
    const [pages, setPages] = useState<Page[]>([]);
    const [currentPageId, setCurrentPageId] = useState<string>(pageId);
    const [components, setComponents] = useState<Component[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [theme, setTheme] = useState<Theme | null>(null);
    const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);
    const [savingComponentId, setSavingComponentId] = useState<string | null>(null);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    const { success: toastSuccess, error: toastError } = useToast();
    const { confirm, ConfirmDialog } = useConfirm();

    // Store pending updates for debounced saves
    const pendingUpdates = useRef<Map<string, UpdateComponentRequest>>(new Map());
    
    // Detect mobile screens
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const hasDrafts = components.some(c => c.status === 'draft');

    // Fetch theme and pages on mount
    useEffect(() => {
        if (themeId) {
            fetchTheme();
            fetchPages();
        }
    }, [themeId]);

    // Fetch components when page changes
    useEffect(() => {
        if (currentPageId) {
            fetchComponents(currentPageId);
        }
    }, [currentPageId]);

    const fetchTheme = async () => {
        try {
            const res = await fetch(`/api/themes/${themeId}`);
            const result = await res.json();
            if (result.success) {
                setTheme(result.data);
            }
        } catch (error) {
            console.error('Failed to fetch theme:', error);
        }
    };

    const fetchPages = async () => {
        try {
            const res = await fetch(`/api/pages?themeId=${themeId}`);
            const result = await res.json();
            if (result.success) {
                setPages(result.data);
            }
        } catch (error) {
            console.error('Failed to fetch pages:', error);
        }
    };

    const fetchComponents = async (pageId: string) => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/pages/${pageId}`);
            const result = await res.json();
            if (result.success) {
                setComponents(result.data.components || []);
            }
        } catch (error) {
            console.error('Failed to fetch components:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        await fetch('/api/auth/signout', { method: 'POST' });
        router.push('/login');
    };

    // Auto-placement: Find next available position
    const findNextPosition = () => {
        if (components.length === 0) {
            return { rowStart: 1, colStart: 1 };
        }

        const maxRow = Math.max(...components.map(c => c.rowStart + c.rowSpan - 1));
        const gridCols = 4;
        
        const occupancy: boolean[][] = [];
        for (let r = 0; r <= maxRow + 2; r++) {
            occupancy[r] = [];
            for (let c = 0; c < gridCols; c++) {
                occupancy[r][c] = false;
            }
        }
        
        components.forEach(c => {
            for (let r = c.rowStart; r < c.rowStart + c.rowSpan; r++) {
                for (let col = c.colStart; col < c.colStart + c.colSpan; col++) {
                    if (occupancy[r]) occupancy[r][col - 1] = true;
                }
            }
        });
        
        for (let r = 1; r <= maxRow + 2; r++) {
            for (let c = 1; c <= gridCols; c++) {
                if (!occupancy[r] || !occupancy[r][c - 1]) {
                    return { rowStart: r, colStart: c };
                }
            }
        }
        
        return { rowStart: maxRow + 1, colStart: 1 };
    };

    const handleAddComponent = async () => {
        const { rowStart, colStart } = findNextPosition();

        const newComponentData: CreateComponentRequest = {
            pageId: currentPageId,
            status: 'draft',
            isVisible: true,
            rowStart,
            rowSpan: 1,
            colStart,
            colSpan: 1,
            contentHtml: '<p>New component - click to edit</p>',
        };

        try {
            const res = await fetch('/api/components', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newComponentData),
            });
            const result = await res.json();
            if (result.success) {
                setComponents([...components, result.data]);
                setSelectedComponent(result.data);
            }
        } catch (error) {
            console.error('Failed to create component:', error);
        }
    };

    const handleSelectComponent = (component: Component) => {
        setSelectedComponent(component);
        // Expand sidebar if collapsed when selecting a component
        if (sidebarCollapsed) {
            setSidebarCollapsed(false);
        }
    };

    // Optimistic update for component size
    const handleUpdateComponentSize = useCallback((componentId: string, updates: { rowSpan?: number; colSpan?: number }) => {
        setComponents(prev => prev.map(c => {
            if (c.id === componentId) {
                return { ...c, ...updates };
            }
            return c;
        }));
        
        if (selectedComponent?.id === componentId) {
            setSelectedComponent(prev => prev ? { ...prev, ...updates } : null);
        }
        
        const existing = pendingUpdates.current.get(componentId) || {};
        pendingUpdates.current.set(componentId, { ...existing, ...updates });
        debouncedSaveSize(componentId);
    }, [selectedComponent?.id]);
    
    const debouncedSaveSize = useDebouncedCallback(async (componentId: string) => {
        const updates = pendingUpdates.current.get(componentId);
        if (!updates) return;
        
        pendingUpdates.current.delete(componentId);
        setSavingComponentId(componentId);
        
        try {
            const res = await fetch(`/api/components/${componentId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });
            const result = await res.json();
            if (result.success) {
                setComponents(prev => prev.map(c => c.id === componentId ? result.data : c));
                if (selectedComponent?.id === componentId) {
                    setSelectedComponent(result.data);
                }
            }
        } catch (error) {
            console.error('Failed to update component size:', error);
        } finally {
            setSavingComponentId(null);
        }
    }, 500);

    const handleDeleteComponent = (componentId: string) => {
        confirm({
            title: 'Delete Component?',
            message: 'This component and all its content will be permanently removed. This action cannot be undone.',
            confirmText: 'Delete',
            cancelText: 'Cancel',
            type: 'danger',
            onConfirm: async () => {
                try {
                    const res = await fetch(`/api/components/${componentId}`, {
                        method: 'DELETE',
                    });
                    const result = await res.json();
                    if (res.ok) {
                        setComponents(components.filter(c => c.id !== componentId));
                        if (selectedComponent?.id === componentId) {
                            setSelectedComponent(null);
                        }
                        toastSuccess('Component deleted');
                    } else {
                        toastError('Failed to delete component', result.message);
                    }
                } catch (error) {
                    toastError('Network error', 'Please try again later.');
                }
            },
        });
    };

    // Debounced save for component edits
    const handleSaveComponent = useCallback((componentId: string | null, data: UpdateComponentRequest) => {
        if (!componentId) return;
        
        setComponents(prev => prev.map(c => {
            if (c.id === componentId) {
                return { ...c, ...data };
            }
            return c;
        }));
        
        if (selectedComponent?.id === componentId) {
            setSelectedComponent(prev => prev ? { ...prev, ...data } : null);
        }
        
        pendingUpdates.current.set(componentId, data);
        debouncedSaveEdit(componentId);
    }, [selectedComponent?.id]);
    
    const debouncedSaveEdit = useDebouncedCallback(async (componentId: string) => {
        const updates = pendingUpdates.current.get(componentId);
        if (!updates) return;
        
        pendingUpdates.current.delete(componentId);
        setSavingComponentId(componentId);
        
        try {
            const res = await fetch(`/api/components/${componentId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });
            const result = await res.json();
            if (result.success) {
                setComponents(prev => prev.map(c => c.id === componentId ? result.data : c));
                if (selectedComponent?.id === componentId) {
                    setSelectedComponent(result.data);
                }
            }
        } catch (error) {
            console.error('Failed to save component:', error);
        } finally {
            setSavingComponentId(null);
        }
    }, 500);

    const handlePublish = async () => {
        const draftComponents = components.filter(c => c.status === 'draft');
        
        try {
            await Promise.all(
                draftComponents.map(c =>
                    fetch(`/api/components/${c.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: 'published' }),
                    })
                )
            );
            
            setComponents(components.map(c => 
                c.status === 'draft' ? { ...c, status: 'published' } : c
            ));
        } catch (error) {
            console.error('Failed to publish:', error);
        }
    };

    const handleTogglePageVisibility = async (pageId: string, isVisible: boolean) => {
        try {
            const res = await fetch(`/api/pages/${pageId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isVisible }),
            });
            if (res.ok) {
                setPages(pages.map(p => p.id === pageId ? { ...p, isVisible } : p));
            }
        } catch (error) {
            console.error('Failed to toggle page visibility:', error);
        }
    };

    const handleAddPage = async () => {
        const pageNum = pages.length + 1;
        const newPageData = {
            name: `New Page ${pageNum}`,
            slug: `page-${pageNum}`,
            themeId: themeId,
            isVisible: true,
        };

        try {
            const res = await fetch('/api/pages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newPageData),
            });
            const result = await res.json();
            if (result.success) {
                setPages([...pages, result.data]);
                // Navigate to the new page
                router.push(`/admin/themes/${themeId}/editor/${result.data.id}`);
            }
        } catch (error) {
            console.error('Failed to create page:', error);
        }
    };

    const currentPage = pages.find(p => p.id === currentPageId);

    return (
        <div className="h-screen flex flex-col bg-gray-100">
            {/* Header */}
            <header className="bg-white border-b px-4 sm:px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                    {/* Back to pages */}
                    <button
                        onClick={() => router.push(`/admin/themes/${themeId}/pages`)}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        title="Back to pages"
                    >
                        <ArrowLeft className="h-5 w-5 text-gray-600" />
                    </button>
                    <div className="h-6 w-px bg-gray-300 hidden sm:block" />
                    
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-sm">
                        <button 
                            onClick={() => router.push('/admin')}
                            className="text-gray-500 hover:text-gray-700 hidden sm:inline"
                        >
                            Themes
                        </button>
                        <ChevronRight className="h-4 w-4 text-gray-400 hidden sm:block" />
                        <button 
                            onClick={() => router.push(`/admin/themes/${themeId}`)}
                            className="text-gray-500 hover:text-gray-700 hidden sm:inline truncate max-w-[100px]"
                        >
                            {theme?.name || 'Theme'}
                        </button>
                        <ChevronRight className="h-4 w-4 text-gray-400 hidden sm:block" />
                        <button 
                            onClick={() => router.push(`/admin/themes/${themeId}/pages`)}
                            className="text-gray-500 hover:text-gray-700 hidden sm:inline"
                        >
                            Pages
                        </button>
                        <ChevronRight className="h-4 w-4 text-gray-400 hidden sm:block" />
                        <span className="font-medium text-gray-900 truncate max-w-[120px] sm:max-w-[200px]">
                            {currentPage?.name || 'Editor'}
                        </span>
                    </div>
                </div>
                
                <div className="flex items-center gap-2 sm:gap-3">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={handlePublish}
                        disabled={!hasDrafts}
                        className="gap-1 sm:gap-2"
                    >
                        <Upload className="h-4 w-4" />
                        <span className="hidden sm:inline">Publish</span>
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLogout}
                        className="gap-1 sm:gap-2"
                    >
                        <LogOut className="h-4 w-4" />
                        <span className="hidden sm:inline">Logout</span>
                    </Button>
                </div>
            </header>

            {/* Main content */}
            <div className={`flex-1 flex ${isMobile ? 'flex-col-reverse' : 'flex-row'} overflow-hidden`}>
                {/* Sidebar */}
                <div className={`
                    ${isMobile 
                        ? 'h-auto max-h-[200px] border-t' 
                        : sidebarCollapsed ? 'w-16' : 'w-64'
                    } 
                    bg-gray-50 flex flex-col transition-all duration-300 ease-in-out
                    ${!isMobile && 'border-r'}
                `}>
                    <AnimatePresence mode="wait">
                        {selectedComponent ? (
                            <ComponentEditPanel
                                key="edit-panel"
                                component={selectedComponent}
                                onUpdate={(id, data) => handleSaveComponent(id, data)}
                                onClose={() => setSelectedComponent(null)}
                                onDelete={(id) => {
                                    handleDeleteComponent(id);
                                    setSelectedComponent(null);
                                }}
                                collapsed={!isMobile && sidebarCollapsed}
                                isMobile={isMobile}
                            />
                        ) : (
                            <PagesSidebar
                                key="pages-sidebar"
                                pages={pages}
                                currentPageId={currentPageId}
                                onPageSelect={(selectedPageId) => {
                                    setCurrentPageId(selectedPageId);
                                    router.push(`/admin/themes/${themeId}/editor/${selectedPageId}`);
                                    setSelectedComponent(null);
                                }}
                                onAddPage={handleAddPage}
                                onToggleVisibility={handleTogglePageVisibility}
                                collapsed={!isMobile && sidebarCollapsed}
                                isMobile={isMobile}
                                onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
                            />
                        )}
                    </AnimatePresence>
                </div>

                {/* Bento Editor Area */}
                <main className="flex-1 overflow-auto p-4 sm:p-6">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                        </div>
                    ) : (
                        <BentoGrid
                            components={components}
                            pageId={currentPageId || ''}
                            isAdmin={true}
                            onEdit={handleSelectComponent}
                            onDelete={handleDeleteComponent}
                            onAdd={handleAddComponent}
                            onResize={handleUpdateComponentSize}
                        />
                    )}
                </main>
            </div>
            <ConfirmDialog />
        </div>
    );
}
