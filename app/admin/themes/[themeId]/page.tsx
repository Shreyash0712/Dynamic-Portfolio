'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import type { Theme } from '@/lib/types';
import Button from '@/app/components/ui/Button';
import { LogOut, ArrowLeft, LayoutDashboard, Settings, FileText, Palette, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ThemeDashboardPage() {
    const router = useRouter();
    const params = useParams();
    const themeId = params.themeId as string;
    const [theme, setTheme] = useState<Theme | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (themeId) {
            fetchTheme();
        }
    }, [themeId]);

    const fetchTheme = async () => {
        try {
            const res = await fetch(`/api/themes/${themeId}`);
            const result = await res.json();
            if (result.success) {
                setTheme(result.data);
            }
        } catch (error) {
            console.error('Failed to fetch theme:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        await fetch('/api/auth/signout', { method: 'POST' });
        router.push('/login');
    };

    const menuItems = [
        {
            icon: LayoutDashboard,
            label: 'Dashboard',
            description: 'Overview and analytics',
            comingSoon: true,
        },
        {
            icon: FileText,
            label: 'Pages',
            description: 'Manage your pages',
            href: `/admin/themes/${themeId}/pages`,
        },
        {
            icon: Palette,
            label: 'Appearance',
            description: 'Theme settings & styles',
            comingSoon: true,
        },
        {
            icon: Settings,
            label: 'Settings',
            description: 'General theme settings',
            comingSoon: true,
        },
    ];

    return (
        <div className="h-screen flex flex-col bg-gray-100">
            {/* Header */}
            <header className="bg-white border-b px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push('/admin')}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        title="Back to themes"
                    >
                        <ArrowLeft className="h-5 w-5 text-gray-600" />
                    </button>
                    <div className="h-6 w-px bg-gray-300" />
                    <h1 className="text-xl font-semibold text-gray-900">
                        {isLoading ? 'Loading...' : theme?.name}
                    </h1>
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
                    <h2 className="text-lg font-medium text-gray-700 mb-6">Theme Dashboard</h2>

                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {menuItems.map((item) => (
                                <motion.div
                                    key={item.label}
                                    whileHover={item.comingSoon ? {} : { scale: 1.02 }}
                                    whileTap={item.comingSoon ? {} : { scale: 0.98 }}
                                >
                                    {item.href ? (
                                        <button
                                            onClick={() => router.push(item.href)}
                                            className="w-full p-6 rounded-xl border-2 border-gray-200 bg-white hover:border-blue-300 text-left transition-colors group"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 rounded-lg bg-blue-50 group-hover:bg-blue-100 transition-colors">
                                                        <item.icon className="h-6 w-6 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900">{item.label}</h3>
                                                        <p className="text-sm text-gray-500">{item.description}</p>
                                                    </div>
                                                </div>
                                                <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-500" />
                                            </div>
                                        </button>
                                    ) : (
                                        <div className="w-full p-6 rounded-xl border-2 border-gray-100 bg-gray-50 text-left cursor-not-allowed opacity-75">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 rounded-lg bg-gray-200">
                                                        <item.icon className="h-6 w-6 text-gray-400" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-gray-500">{item.label}</h3>
                                                        <p className="text-sm text-gray-400">{item.description}</p>
                                                    </div>
                                                </div>
                                                <span className="text-xs px-2 py-1 bg-gray-200 text-gray-500 rounded-full">Soon</span>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
