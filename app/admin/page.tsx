'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Palette } from 'lucide-react';
import { useThemes, updateTheme, deleteTheme, createTheme } from '@/app/hooks/useAdminData';
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

export default function AdminThemesPage() {
    const router = useRouter();
    const { themes, isLoading, mutate } = useThemes();
    const [isCreating, setIsCreating] = useState(false);
    const [newThemeName, setNewThemeName] = useState('');

    const activeTheme = themes.find((t) => t.isActive);

    const { success: toastSuccess, error: toastError } = useToast();
    const { confirm, ConfirmDialog } = useConfirm();

    const handleCreate = async () => {
        if (!newThemeName.trim()) {
            toastError('Please enter a theme name');
            return;
        }
        const result = await createTheme(newThemeName);
        if (result.success) {
            setNewThemeName('');
            setIsCreating(false);
            mutate();
            toastSuccess(result.message);
        } else {
            toastError('Failed to create theme', result.message);
        }
    };

    const handleEdit = async (id: string, newName: string) => {
        const result = await updateTheme(id, { name: newName });
        if (result.success) {
            mutate();
            toastSuccess(result.message);
        } else {
            toastError('Failed to update theme', result.message);
        }
    };

    const handleDelete = async (id: string) => {
        confirm({
            title: 'Delete Theme?',
            message: 'All pages and components within this theme will be permanently deleted. This action cannot be undone.',
            confirmText: 'Delete Theme',
            cancelText: 'Cancel',
            type: 'danger',
            onConfirm: async () => {
                const result = await deleteTheme(id);
                if (result.success) {
                    mutate();
                    toastSuccess(result.message);
                } else {
                    toastError('Failed to delete theme', result.message);
                }
            },
        });
    };

    const handleSetActive = async (id: string) => {
        // Deactivate current active theme
        if (activeTheme) {
            const result1 = await updateTheme(activeTheme.id, { isActive: false });
            if (!result1.success) {
                toastError('Failed to update theme', result1.message);
                return;
            }
        }
        // Activate new theme
        const result2 = await updateTheme(id, { isActive: true });
        if (result2.success) {
            mutate();
            toastSuccess('Theme set as active');
        } else {
            toastError('Failed to set theme as active', result2.message);
        }
    };

    return (
        <div className="h-screen flex flex-col bg-gray-50">
            <AdminHeader title="Themes" subtitle="Hello Username!" />

            <main className="flex-1 overflow-auto p-6 sm:p-8">
                <div className="max-w-6xl mx-auto">
                    <motion.h2
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-lg font-medium text-gray-700 mb-4"
                    >
                        Your Themes
                    </motion.h2>

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
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                        >
                            <AnimatePresence>
                                {themes.map((theme) => (
                                    <motion.div key={theme.id} variants={itemVariants}>
                                        <EditableCard
                                            id={theme.id}
                                            title={theme.name}
                                            subtitle={theme.isActive ? 'Active theme' : 'Click to manage'}
                                            icon={<Palette className="h-6 w-6" />}
                                            iconBgClass={theme.isActive ? 'bg-blue-100' : 'bg-gray-100'}
                                            iconColorClass={theme.isActive ? 'text-blue-600' : 'text-gray-500'}
                                            isActive={theme.isActive}
                                            activeLabel="Currently active"
                                            onClick={() => router.push(`/admin/themes/${theme.id}`)}
                                            onEdit={handleEdit}
                                            onDelete={handleDelete}
                                            extraActions={
                                                !theme.isActive
                                                    ? [
                                                          {
                                                              label: 'Set as active',
                                                              onClick: () => handleSetActive(theme.id),
                                                          },
                                                      ]
                                                    : []
                                            }
                                        />
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {/* Add theme card */}
                            <motion.div variants={itemVariants}>
                                {isCreating ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="p-6 rounded-xl border-2 border-blue-200 bg-blue-50"
                                    >
                                        <input
                                            type="text"
                                            value={newThemeName}
                                            onChange={(e) => setNewThemeName(e.target.value)}
                                            placeholder="Theme name"
                                            className="w-full p-2 border rounded-lg mb-3"
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
                                ) : (
                                    <motion.button
                                        whileHover={{ scale: 1.02, borderColor: '#9ca3af' }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setIsCreating(true)}
                                        className="w-full h-full min-h-[160px] rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 flex flex-col items-center justify-center gap-3 transition-colors"
                                    >
                                        <motion.div
                                            whileHover={{ rotate: 90 }}
                                            transition={{ duration: 0.2 }}
                                            className="p-3 rounded-full bg-gray-200"
                                        >
                                            <Plus className="h-6 w-6 text-gray-500" />
                                        </motion.div>
                                        <span className="font-medium text-gray-600">Add theme</span>
                                    </motion.button>
                                )}
                            </motion.div>
                        </motion.div>
                    )}
                </div>
            </main>
            <ConfirmDialog />
        </div>
    );
}
