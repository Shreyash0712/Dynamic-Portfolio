'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, LayoutGrid, Eye, EyeOff } from 'lucide-react';
import { useTheme, usePages, createPage, updatePage, deletePage, togglePageVisibility } from '@/app/hooks/useAdminData';
import { useToast, useConfirm } from '@/app/hooks/useToast';
import AdminHeader from '@/app/components/admin/AdminHeader';
import EditableCard from '@/app/components/admin/EditableCard';
import Button from '@/app/components/ui/Button';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.05 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

export default function ThemePages() {
    const router = useRouter();
    const params = useParams();
    const themeId = params.themeId as string;
    const { theme } = useTheme(themeId);
    const { pages, isLoading, mutate } = usePages(themeId);
    const [isCreating, setIsCreating] = useState(false);
    const [newPageName, setNewPageName] = useState('');

    const { success: toastSuccess, error: toastError } = useToast();
    const { confirm, ConfirmDialog } = useConfirm();

    const handleCreate = async () => {
        if (!newPageName.trim()) {
            toastError('Please enter a page name');
            return;
        }
        const slug = newPageName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const result = await createPage(themeId, newPageName, slug || `page-${pages.length + 1}`);
        if (result.success) {
            setNewPageName('');
            setIsCreating(false);
            mutate();
            toastSuccess(result.message);
        } else {
            toastError('Failed to create page', result.message);
        }
    };

    const handleEdit = async (id: string, newName: string) => {
        const newSlug = newName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const result = await updatePage(id, { name: newName, slug: newSlug });
        if (result.success) {
            mutate();
            toastSuccess(result.message);
        } else {
            toastError('Failed to update page', result.message);
        }
    };

    const handleDelete = async (id: string) => {
        confirm({
            title: 'Delete Page?',
            message: 'All components on this page will be permanently deleted. This action cannot be undone.',
            confirmText: 'Delete Page',
            cancelText: 'Cancel',
            type: 'danger',
            onConfirm: async () => {
                const result = await deletePage(id, themeId);
                if (result.success) {
                    mutate();
                    toastSuccess(result.message);
                } else {
                    toastError('Failed to delete page', result.message);
                }
            },
        });
    };

    const handleToggle = async (id: string, isVisible: boolean) => {
        const result = await togglePageVisibility(id, isVisible, themeId);
        if (result.success) {
            mutate();
            toastSuccess(result.message);
        } else {
            toastError('Failed to update visibility', result.message);
        }
    };

    return (
        <div className="h-screen flex flex-col bg-gray-50">
            <AdminHeader
                title="Pages"
                subtitle={theme?.name}
                showBack
                backHref={`/admin/themes/${themeId}`}
                backLabel="Back to dashboard"
            />

            <main className="flex-1 overflow-auto p-6 sm:p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <motion.h2
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-lg font-medium text-gray-700"
                        >
                            Your Pages
                        </motion.h2>
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <Button size="sm" onClick={() => setIsCreating(true)} className="gap-2">
                                <Plus className="h-4 w-4" />
                                Add Page
                            </Button>
                        </motion.div>
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                                className="h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full"
                            />
                        </div>
                    ) : (
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="space-y-3"
                        >
                            <AnimatePresence>
                                {isCreating && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className="p-4 rounded-xl border-2 border-blue-200 bg-blue-50"
                                    >
                                        <input
                                            type="text"
                                            value={newPageName}
                                            onChange={(e) => setNewPageName(e.target.value)}
                                            placeholder="Page name"
                                            className="w-full p-3 border rounded-lg mb-3"
                                            autoFocus
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleCreate();
                                                if (e.key === 'Escape') setIsCreating(false);
                                            }}
                                        />
                                        <div className="flex gap-2">
                                            <Button size="sm" onClick={handleCreate} className="flex-1">
                                                Create
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => setIsCreating(false)}>
                                                Cancel
                                            </Button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {pages.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center py-12 text-gray-500"
                                >
                                    <LayoutGrid className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                    <p className="text-lg font-medium">No pages yet</p>
                                    <p className="text-sm">Create your first page to get started</p>
                                </motion.div>
                            ) : (
                                pages.map((page) => (
                                    <motion.div key={page.id} variants={itemVariants}>
                                        <EditableCard
                                            id={page.id}
                                            title={page.name}
                                            subtitle={`/${page.slug}`}
                                            icon={<LayoutGrid className="h-5 w-5" />}
                                            iconBgClass="bg-blue-50"
                                            iconColorClass="text-blue-600"
                                            onClick={() => router.push(`/admin/themes/${themeId}/editor/${page.id}`)}
                                            onEdit={handleEdit}
                                            onDelete={handleDelete}
                                        />
                                    </motion.div>
                                ))
                            )}
                        </motion.div>
                    )}
                </div>
            </main>
            <ConfirmDialog />
        </div>
    );
}
