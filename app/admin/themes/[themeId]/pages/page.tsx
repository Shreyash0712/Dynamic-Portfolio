'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import type { Page, Theme } from '@/lib/types';
import Button from '@/app/components/ui/Button';
import { useToast, useConfirm } from '@/app/hooks/useToast';
import { LogOut, ArrowLeft, Plus, LayoutGrid, Eye, EyeOff, ChevronRight, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ThemePagesPage() {
    const router = useRouter();
    const params = useParams();
    const themeId = params.themeId as string;
    const [theme, setTheme] = useState<Theme | null>(null);
    const [pages, setPages] = useState<Page[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [newPageName, setNewPageName] = useState('');
    const [editingPage, setEditingPage] = useState<Page | null>(null);
    const [editName, setEditName] = useState('');
    const [editSlug, setEditSlug] = useState('');

    const { success: toastSuccess, error: toastError } = useToast();
    const { confirm, ConfirmDialog } = useConfirm();

    useEffect(() => {
        if (themeId) {
            fetchThemeAndPages();
        }
    }, [themeId]);

    const fetchThemeAndPages = async () => {
        try {
            // Fetch theme
            const themeRes = await fetch(`/api/themes/${themeId}`);
            const themeResult = await themeRes.json();
            if (themeResult.success) {
                setTheme(themeResult.data);
            }

            // Fetch pages for this theme
            const pagesRes = await fetch(`/api/pages?themeId=${themeId}`);
            const pagesResult = await pagesRes.json();
            if (pagesResult.success) {
                setPages(pagesResult.data);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreatePage = async () => {
        if (!newPageName.trim()) {
            toastError('Please enter a page name');
            return;
        }

        const slug = newPageName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

        try {
            const res = await fetch('/api/pages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    themeId: themeId,
                    name: newPageName,
                    slug: slug || `page-${pages.length + 1}`,
                    isVisible: true,
                }),
            });
            const result = await res.json();
            if (result.success) {
                setPages([...pages, result.data]);
                setNewPageName('');
                setIsCreating(false);
                toastSuccess('Page created successfully');
            } else {
                toastError('Failed to create page', result.message);
            }
        } catch (error) {
            toastError('Network error', 'Please try again later.');
        }
    };

    const handleToggleVisibility = async (pageId: string, isVisible: boolean) => {
        try {
            const res = await fetch(`/api/pages/${pageId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isVisible }),
            });
            const result = await res.json();
            if (res.ok) {
                setPages(pages.map(p => p.id === pageId ? { ...p, isVisible } : p));
                toastSuccess(`Page ${isVisible ? 'visible' : 'hidden'}`);
            } else {
                toastError('Failed to update visibility', result.message);
            }
        } catch (error) {
            toastError('Network error', 'Please try again later.');
        }
    };

    const handleLogout = async () => {
        await fetch('/api/auth/signout', { method: 'POST' });
        router.push('/login');
    };

    const handleUpdatePage = async () => {
        if (!editingPage || !editName.trim()) {
            toastError('Please enter a page name');
            return;
        }

        try {
            const res = await fetch(`/api/pages/${editingPage.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: editName,
                    slug: editSlug || editName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
                }),
            });
            const result = await res.json();
            if (res.ok) {
                setPages(pages.map(p => p.id === editingPage.id ? { ...p, name: editName, slug: editSlug } : p));
                setEditingPage(null);
                setEditName('');
                setEditSlug('');
                toastSuccess('Page updated successfully');
            } else {
                toastError('Failed to update page', result.message);
            }
        } catch (error) {
            toastError('Network error', 'Please try again later.');
        }
    };

    const handleDeletePage = (pageId: string) => {
        confirm({
            title: 'Delete Page?',
            message: 'All components on this page will be permanently deleted. This action cannot be undone.',
            confirmText: 'Delete Page',
            cancelText: 'Cancel',
            type: 'danger',
            onConfirm: async () => {
                try {
                    const res = await fetch(`/api/pages/${pageId}`, {
                        method: 'DELETE',
                    });
                    const result = await res.json();
                    if (res.ok) {
                        setPages(pages.filter(p => p.id !== pageId));
                        toastSuccess('Page deleted successfully');
                    } else {
                        toastError('Failed to delete page', result.message);
                    }
                } catch (error) {
                    toastError('Network error', 'Please try again later.');
                }
            },
        });
    };

    const startEditing = (page: Page) => {
        setEditingPage(page);
        setEditName(page.name);
        setEditSlug(page.slug);
    };

    return (
        <div className="h-screen flex flex-col bg-gray-100">
            {/* Header */}
            <header className="bg-white border-b px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push(`/admin/themes/${themeId}`)}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        title="Back to dashboard"
                    >
                        <ArrowLeft className="h-5 w-5 text-gray-600" />
                    </button>
                    <div className="h-6 w-px bg-gray-300" />
                    <div>
                        <p className="text-xs text-gray-500">{theme?.name}</p>
                        <h1 className="text-lg font-semibold text-gray-900">Pages</h1>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="gap-2"
                >
                    <LogOut className="h-4 w-4" />
                    Logout
                </Button>
            </header>

            {/* Main content */}
            <main className="flex-1 overflow-auto p-6 sm:p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-medium text-gray-700">Your Pages</h2>
                        <Button
                            size="sm"
                            onClick={() => setIsCreating(true)}
                            className="gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            Add Page
                        </Button>
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {/* Create page form */}
                            {isCreating && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 rounded-xl border-2 border-blue-200 bg-blue-50"
                                >
                                    <input
                                        type="text"
                                        value={newPageName}
                                        onChange={(e) => setNewPageName(e.target.value)}
                                        placeholder="Page name (e.g., Home, About, Contact)"
                                        className="w-full p-3 border rounded-lg mb-3"
                                        autoFocus
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleCreatePage();
                                            if (e.key === 'Escape') setIsCreating(false);
                                        }}
                                    />
                                    <div className="flex gap-2">
                                        <Button onClick={handleCreatePage} className="flex-1">
                                            Create Page
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            onClick={() => setIsCreating(false)}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </motion.div>
                            )}

                            {/* Pages list */}
                            {pages.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <LayoutGrid className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                    <p className="text-lg font-medium">No pages yet</p>
                                    <p className="text-sm">Create your first page to get started</p>
                                </div>
                            ) : (
                                pages.map((page) => (
                                    <motion.div
                                        key={page.id}
                                        whileHover={{ scale: 1.01 }}
                                        className="group flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm transition-all"
                                    >
                                        {editingPage?.id === page.id ? (
                                            // Edit mode
                                            <div className="flex-1 flex items-center gap-3">
                                                <div className="p-3 rounded-lg bg-blue-50">
                                                    <LayoutGrid className="h-5 w-5 text-blue-600" />
                                                </div>
                                                <div className="flex-1 space-y-2">
                                                    <input
                                                        type="text"
                                                        value={editName}
                                                        onChange={(e) => setEditName(e.target.value)}
                                                        placeholder="Page name"
                                                        className="w-full p-2 text-sm border rounded"
                                                        autoFocus
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') handleUpdatePage();
                                                            if (e.key === 'Escape') setEditingPage(null);
                                                        }}
                                                    />
                                                    <input
                                                        type="text"
                                                        value={editSlug}
                                                        onChange={(e) => setEditSlug(e.target.value)}
                                                        placeholder="slug"
                                                        className="w-full p-2 text-sm border rounded"
                                                    />
                                                </div>
                                                <div className="flex gap-1">
                                                    <Button size="sm" onClick={handleUpdatePage}>Save</Button>
                                                    <Button variant="ghost" size="sm" onClick={() => setEditingPage(null)}>Cancel</Button>
                                                </div>
                                            </div>
                                        ) : (
                                            // View mode
                                            <>
                                                <button
                                                    onClick={() => router.push(`/admin/themes/${themeId}/editor/${page.id}`)}
                                                    className="flex-1 flex items-center gap-4 text-left"
                                                >
                                                    <div className="p-3 rounded-lg bg-blue-50 group-hover:bg-blue-100 transition-colors">
                                                        <LayoutGrid className="h-5 w-5 text-blue-600" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-gray-900">{page.name}</h3>
                                                        <p className="text-sm text-gray-500">/{page.slug}</p>
                                                    </div>
                                                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-500" />
                                                </button>

                                                <div className="flex items-center gap-1 ml-4">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleToggleVisibility(page.id, !page.isVisible);
                                                        }}
                                                        className={`p-2 rounded-lg transition-colors ${
                                                            page.isVisible
                                                                ? 'text-green-600 hover:bg-green-100'
                                                                : 'text-gray-400 hover:bg-gray-100'
                                                        }`}
                                                        title={page.isVisible ? 'Visible - click to hide' : 'Hidden - click to show'}
                                                    >
                                                        {page.isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                                    </button>
                                                    
                                                    {/* Three dots menu */}
                                                    <div className="relative">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                // Toggle menu for this page
                                                                const menu = document.getElementById(`menu-${page.id}`);
                                                                if (menu) {
                                                                    menu.classList.toggle('hidden');
                                                                }
                                                            }}
                                                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                                            title="More options"
                                                        >
                                                            <MoreVertical className="h-4 w-4 text-gray-500" />
                                                        </button>
                                                        <div
                                                            id={`menu-${page.id}`}
                                                            className="hidden absolute right-0 mt-1 w-40 bg-white border rounded-lg shadow-lg z-50"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <button
                                                                onClick={() => {
                                                                    startEditing(page);
                                                                    document.getElementById(`menu-${page.id}`)?.classList.add('hidden');
                                                                }}
                                                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    handleDeletePage(page.id);
                                                                    document.getElementById(`menu-${page.id}`)?.classList.add('hidden');
                                                                }}
                                                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </motion.div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </main>
            <ConfirmDialog />
        </div>
    );
}
