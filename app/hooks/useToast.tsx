'use client';

import React, { createContext, useContext, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
}

interface ToastContextType {
    success: (title: string, message?: string) => void;
    error: (title: string, message?: string) => void;
    warning: (title: string, message?: string) => void;
    info: (title: string, message?: string) => void;
    remove: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const toastIcons = {
    success: <CheckCircle className="h-5 w-5 text-green-500" />,
    error: <AlertCircle className="h-5 w-5 text-red-500" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />,
};

const toastStyles = {
    success: 'border-l-4 border-green-500 bg-white',
    error: 'border-l-4 border-red-500 bg-white',
    warning: 'border-l-4 border-amber-500 bg-white',
    info: 'border-l-4 border-blue-500 bg-white',
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
    const [progress, setProgress] = useState(100);
    const duration = toast.duration || 5000;

    React.useEffect(() => {
        const startTime = Date.now();
        const interval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
            setProgress(remaining);

            if (remaining === 0) {
                clearInterval(interval);
                onRemove(toast.id);
            }
        }, 50);

        return () => clearInterval(interval);
    }, [toast.id, duration, onRemove]);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className={`pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg shadow-lg ring-1 ring-black/5 ${toastStyles[toast.type]}`}
        >
            <div className="p-4">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">{toastIcons[toast.type]}</div>
                    <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-gray-900">{toast.title}</h4>
                        {toast.message && (
                            <p className="mt-1 text-sm text-gray-600 leading-relaxed">{toast.message}</p>
                        )}
                    </div>
                    <button
                        onClick={() => onRemove(toast.id)}
                        className="flex-shrink-0 p-1 rounded-full hover:bg-gray-100 transition-colors"
                        aria-label="Close toast"
                    >
                        <X className="h-4 w-4 text-gray-400" />
                    </button>
                </div>
            </div>
            {/* Progress bar */}
            <div className="h-1 bg-gray-100">
                <motion.div
                    className={`h-full ${
                        toast.type === 'success' ? 'bg-green-500' :
                        toast.type === 'error' ? 'bg-red-500' :
                        toast.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                    }`}
                    initial={{ width: '100%' }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.05, ease: 'linear' }}
                />
            </div>
        </motion.div>
    );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const addToast = useCallback((type: ToastType, title: string, message?: string, duration?: number) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, type, title, message, duration }]);
    }, []);

    const success = useCallback((title: string, message?: string) => {
        addToast('success', title, message, 4000);
    }, [addToast]);

    const error = useCallback((title: string, message?: string) => {
        addToast('error', title, message, 6000); // Errors stay longer
    }, [addToast]);

    const warning = useCallback((title: string, message?: string) => {
        addToast('warning', title, message, 5000);
    }, [addToast]);

    const info = useCallback((title: string, message?: string) => {
        addToast('info', title, message, 4000);
    }, [addToast]);

    const value = React.useMemo(
        () => ({ success, error, warning, info, remove: removeToast }),
        [success, error, warning, info, removeToast]
    );

    return (
        <ToastContext.Provider value={value}>
            {children}
            {/* Toast container */}
            <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
                <AnimatePresence mode="popLayout">
                    {toasts.map((toast) => (
                        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}

export function useToast(): ToastContextType {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

// Hook for confirmation dialogs
interface ConfirmOptions {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
    onCancel?: () => void;
}

export function useConfirm() {
    const [isOpen, setIsOpen] = React.useState(false);
    const [options, setOptions] = React.useState<ConfirmOptions | null>(null);

    const confirm = useCallback((opts: ConfirmOptions) => {
        setOptions(opts);
        setIsOpen(true);
    }, []);

    const close = useCallback(() => {
        setIsOpen(false);
        setOptions(null);
    }, []);

    const handleConfirm = useCallback(() => {
        options?.onConfirm();
        close();
    }, [options, close]);

    const handleCancel = useCallback(() => {
        options?.onCancel?.();
        close();
    }, [options, close]);

    const ConfirmDialog = React.useCallback(() => {
        if (!isOpen || !options) return null;

        const buttonStyles = {
            danger: 'bg-red-600 hover:bg-red-700 text-white',
            warning: 'bg-amber-600 hover:bg-amber-700 text-white',
            info: 'bg-blue-600 hover:bg-blue-700 text-white',
        };

        const iconStyles = {
            danger: 'text-red-600',
            warning: 'text-amber-600',
            info: 'text-blue-600',
        };

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
                >
                    <div className="p-6">
                        <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-full bg-gray-100 flex-shrink-0 ${iconStyles[options.type || 'danger']}`}>
                                {options.type === 'danger' ? <AlertCircle className="h-6 w-6" /> :
                                 options.type === 'warning' ? <AlertTriangle className="h-6 w-6" /> :
                                 <Info className="h-6 w-6" />}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900">{options.title}</h3>
                                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{options.message}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50">
                        <button
                            onClick={handleCancel}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            {options.cancelText || 'Cancel'}
                        </button>
                        <button
                            onClick={handleConfirm}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${buttonStyles[options.type || 'danger']}`}
                        >
                            {options.confirmText || 'Confirm'}
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }, [isOpen, options, handleConfirm, handleCancel]);

    return { confirm, ConfirmDialog, isOpen };
}
