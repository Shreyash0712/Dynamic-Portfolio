'use client';

import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { LayoutDashboard, Settings, FileText, Palette, ChevronRight } from 'lucide-react';
import { useTheme } from '@/app/hooks/useAdminData';
import AdminHeader from '@/app/components/admin/AdminHeader';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

interface MenuItem {
    icon: React.ElementType;
    label: string;
    description: string;
    href?: string;
    comingSoon?: boolean;
}

export default function ThemeDashboard() {
    const router = useRouter();
    const params = useParams();
    const themeId = params.themeId as string;
    const { theme, isLoading } = useTheme(themeId);

    const menuItems: MenuItem[] = [
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
        <div className="h-screen flex flex-col bg-gray-50">
            <AdminHeader
                title={isLoading ? 'Loading...' : theme?.name || 'Theme'}
                showBack
                backHref="/admin"
                backLabel="Back to themes"
            />

            <main className="flex-1 overflow-auto p-6 sm:p-8">
                <div className="max-w-4xl mx-auto">
                    <motion.h2
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-lg font-medium text-gray-700 mb-6"
                    >
                        Theme Dashboard
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
                            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                        >
                            {menuItems.map((item) => (
                                <motion.div key={item.label} variants={itemVariants}>
                                    {item.href ? (
                                        <motion.button
                                            whileHover={{ scale: 1.02, y: -2 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => router.push(item.href!)}
                                            className="w-full p-6 rounded-xl border-2 border-gray-200 bg-white hover:border-blue-300 hover:shadow-md text-left transition-all group"
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
                                                <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                            </div>
                                        </motion.button>
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
                        </motion.div>
                    )}
                </div>
            </main>
        </div>
    );
}
