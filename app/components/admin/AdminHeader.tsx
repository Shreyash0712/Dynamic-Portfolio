'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LogOut, ArrowLeft } from 'lucide-react';
import Button from '@/app/components/ui/Button';

interface AdminHeaderProps {
    title: string;
    subtitle?: string;
    showBack?: boolean;
    backHref?: string;
    backLabel?: string;
    onBack?: () => void;
    rightContent?: React.ReactNode;
}

export default function AdminHeader({
    title,
    subtitle,
    showBack = false,
    backHref,
    backLabel,
    onBack,
    rightContent,
}: AdminHeaderProps) {
    const router = useRouter();

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else if (backHref) {
            router.push(backHref);
        }
    };

    const handleLogout = async () => {
        await fetch('/api/auth/signout', { method: 'POST' });
        router.push('/login');
    };

    return (
        <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white border-b px-4 sm:px-6 py-3 flex items-center justify-between"
        >
            <div className="flex items-center gap-3">
                {showBack && (
                    <>
                        <button
                            onClick={handleBack}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            title={backLabel || 'Back'}
                        >
                            <ArrowLeft className="h-5 w-5 text-gray-600" />
                        </button>
                        <div className="h-6 w-px bg-gray-300" />
                    </>
                )}
                <div>
                    {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
                    <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
                </div>
            </div>

            <div className="flex items-center gap-2">
                {rightContent}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="gap-2"
                >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">Logout</span>
                </Button>
            </div>
        </motion.header>
    );
}
