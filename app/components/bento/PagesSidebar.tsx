'use client';

import type { Page } from '@/lib/types';
import { FileText, Plus, Eye, EyeOff, PanelLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/app/components/ui/Button';

interface PagesSidebarProps {
    pages: Page[];
    currentPageId: string | null;
    onPageSelect: (pageId: string) => void;
    onAddPage: () => void;
    onToggleVisibility?: (pageId: string, isVisible: boolean) => void;
    collapsed?: boolean;
    isMobile?: boolean;
    onToggleCollapse?: () => void;
}

export default function PagesSidebar({
    pages,
    currentPageId,
    onPageSelect,
    onAddPage,
    onToggleVisibility,
    collapsed = false,
    isMobile = false,
    onToggleCollapse,
}: PagesSidebarProps) {
    // Mobile horizontal layout
    if (isMobile) {
        return (
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col h-full"
            >
                <div className="flex-1 overflow-x-auto overflow-y-hidden">
                    <div className="flex gap-1 p-2 min-w-min">
                        <AnimatePresence>
                            {pages.map((page) => (
                                <motion.button
                                    key={page.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    onClick={() => onPageSelect(page.id)}
                                    className={`
                                        flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap
                                        transition-colors flex-shrink-0
                                        ${currentPageId === page.id
                                            ? 'bg-blue-100 text-blue-900'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }
                                    `}
                                >
                                    <FileText className="h-4 w-4 flex-shrink-0" />
                                    <span className="font-medium">{page.name}</span>
                                    {page.isVisible ? (
                                        <Eye className="h-3 w-3 text-green-500" />
                                    ) : (
                                        <EyeOff className="h-3 w-3 text-gray-400" />
                                    )}
                                </motion.button>
                            ))}
                        </AnimatePresence>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onAddPage}
                            className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 flex-shrink-0"
                        >
                            <Plus className="h-4 w-4" />
                            <span>Add</span>
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        );
    }

    // Desktop/Laptop - Collapsible sidebar
    return (
        <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col h-full"
        >
            {/* Header */}
            <div className={`p-4 border-b ${collapsed ? 'px-2' : ''}`}>
                <h2 className={`font-semibold text-gray-900 flex items-center gap-2 ${collapsed ? 'justify-center' : ''}`}>
                    <FileText className="h-5 w-5" />
                    {!collapsed && <span>Pages</span>}
                </h2>
            </div>

            {/* Pages list */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                <AnimatePresence>
                    {pages.map((page, index) => (
                        <motion.div
                            key={page.id}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ delay: index * 0.05 }}
                            className={`
                                group flex items-center rounded-lg text-sm transition-colors cursor-pointer
                                ${currentPageId === page.id
                                    ? 'bg-blue-100 text-blue-900'
                                    : 'hover:bg-gray-100 text-gray-700'
                                }
                                ${collapsed ? 'justify-center p-2' : 'gap-1 px-2 py-2'}
                            `}
                        >
                            <button
                                onClick={() => onPageSelect(page.id)}
                                className={`flex items-center text-left min-w-0 ${collapsed ? '' : 'flex-1 gap-2'}`}
                                title={collapsed ? page.name : undefined}
                            >
                                <FileText className="h-4 w-4 flex-shrink-0" />
                                {!collapsed && <span className="truncate font-medium">{page.name}</span>}
                            </button>
                            {!collapsed && onToggleVisibility && (
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onToggleVisibility(page.id, !page.isVisible);
                                    }}
                                    className={`p-1.5 rounded transition-colors opacity-0 group-hover:opacity-100 ${
                                        page.isVisible ? 'text-green-600 hover:bg-green-100' : 'text-gray-400 hover:bg-gray-200'
                                    }`}
                                    title={page.isVisible ? 'Visible - click to hide' : 'Hidden - click to show'}
                                >
                                    {page.isVisible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                                </motion.button>
                            )}
                            {collapsed && page.isVisible && (
                                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Add Page Button & Collapse Toggle */}
            <div className={`p-3 border-t ${collapsed ? 'px-2' : ''}`}>
                <div className={`flex items-center gap-2 ${collapsed ? 'flex-col' : ''}`}>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onAddPage}
                            className={`gap-2 ${collapsed ? 'w-full justify-center px-1' : 'w-full justify-center'}`}
                            title={collapsed ? 'Add Page' : undefined}
                        >
                            <Plus className="h-4 w-4" />
                            {!collapsed && <span>Add Page</span>}
                        </Button>
                    </motion.div>
                    {onToggleCollapse && !isMobile && (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onToggleCollapse}
                            className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
                            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                        >
                            {collapsed ? <ChevronRight className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
                        </motion.button>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
