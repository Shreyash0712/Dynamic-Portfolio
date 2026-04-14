'use client';

import useSWR, { mutate } from 'swr';
import type { Theme, Page, Component } from '@/lib/types';
import { getCacheProvider, cleanupExpiredCache } from './swrCacheProvider';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Initialize cache cleanup on module load
if (typeof window !== 'undefined') {
    cleanupExpiredCache();
}

// SWR Configuration with persistent cache
export const swrPersistentConfig = {
    provider: getCacheProvider,
    revalidateOnFocus: false,
    revalidateIfStale: true,
    revalidateOnReconnect: true,
    dedupingInterval: 10000,
    keepPreviousData: true,
    errorRetryCount: 3,
    suspense: false,
};

// Theme hooks
export function useThemes() {
    const { data, error, isLoading } = useSWR('/api/themes', fetcher, swrPersistentConfig);

    return {
        themes: data?.success ? (data.data as Theme[]) : [],
        isLoading,
        error,
        mutate: () => mutate('/api/themes'),
    };
}

export function useTheme(themeId: string | null) {
    const { data, error, isLoading } = useSWR(
        themeId ? `/api/themes/${themeId}` : null,
        fetcher,
        swrPersistentConfig
    );

    return {
        theme: data?.success ? (data.data as Theme) : null,
        isLoading,
        error,
        mutate: () => themeId && mutate(`/api/themes/${themeId}`),
    };
}

// Page hooks
export function usePages(themeId: string | null) {
    const { data, error, isLoading } = useSWR(
        themeId ? `/api/pages?themeId=${themeId}` : null,
        fetcher,
        swrPersistentConfig
    );

    return {
        pages: data?.success ? (data.data as Page[]) : [],
        isLoading,
        error,
        mutate: () => themeId && mutate(`/api/pages?themeId=${themeId}`),
    };
}

export function usePage(pageId: string | null) {
    const { data, error, isLoading } = useSWR(
        pageId ? `/api/pages/${pageId}` : null,
        fetcher,
        swrPersistentConfig
    );

    return {
        page: data?.success ? (data.data as Page) : null,
        isLoading,
        error,
        mutate: () => pageId && mutate(`/api/pages/${pageId}`),
    };
}

// Component hooks
export function useComponents(pageId: string | null) {
    const { data, error, isLoading } = useSWR(
        pageId ? `/api/components?pageId=${pageId}` : null,
        fetcher,
        swrPersistentConfig
    );

    return {
        components: data?.success ? (data.data as Component[]) : [],
        isLoading,
        error,
        mutate: () => pageId && mutate(`/api/components?pageId=${pageId}`),
    };
}

// Optimistic update helpers
export async function updateTheme(themeId: string, data: Partial<Theme>) {
    try {
        const res = await fetch(`/api/themes/${themeId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        const result = await res.json();
        if (res.ok) {
            mutate('/api/themes');
            mutate(`/api/themes/${themeId}`);
            return { success: true, message: 'Theme updated successfully' };
        }
        return { success: false, message: result.message || 'Failed to update theme' };
    } catch (error) {
        return { success: false, message: 'Network error. Please try again.' };
    }
}

export async function deleteTheme(themeId: string) {
    try {
        const res = await fetch(`/api/themes/${themeId}`, {
            method: 'DELETE',
        });
        const result = await res.json();
        if (res.ok) {
            mutate('/api/themes');
            return { success: true, message: 'Theme deleted successfully' };
        }
        return { success: false, message: result.message || 'Failed to delete theme' };
    } catch (error) {
        return { success: false, message: 'Network error. Please try again.' };
    }
}

export async function createTheme(name: string) {
    try {
        const res = await fetch('/api/themes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name }),
        });
        const result = await res.json();
        if (res.ok) {
            mutate('/api/themes');
            return { success: true, message: 'Theme created successfully' };
        }
        return { success: false, message: result.message || 'Failed to create theme' };
    } catch (error) {
        return { success: false, message: 'Network error. Please try again.' };
    }
}

export async function updatePage(pageId: string, data: Partial<Page>) {
    try {
        const res = await fetch(`/api/pages/${pageId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        const result = await res.json();
        if (res.ok) {
            mutate((key) => typeof key === 'string' && key.startsWith('/api/pages'));
            return { success: true, message: 'Page updated successfully' };
        }
        return { success: false, message: result.message || 'Failed to update page' };
    } catch (error) {
        return { success: false, message: 'Network error. Please try again.' };
    }
}

export async function deletePage(pageId: string, themeId: string) {
    try {
        const res = await fetch(`/api/pages/${pageId}`, {
            method: 'DELETE',
        });
        const result = await res.json();
        if (res.ok) {
            mutate(`/api/pages?themeId=${themeId}`);
            return { success: true, message: 'Page deleted successfully' };
        }
        return { success: false, message: result.message || 'Failed to delete page' };
    } catch (error) {
        return { success: false, message: 'Network error. Please try again.' };
    }
}

export async function createPage(themeId: string, name: string, slug: string) {
    try {
        const res = await fetch('/api/pages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ themeId, name, slug, isVisible: true }),
        });
        const result = await res.json();
        if (res.ok) {
            mutate(`/api/pages?themeId=${themeId}`);
            return { success: true, message: 'Page created successfully' };
        }
        return { success: false, message: result.message || 'Failed to create page' };
    } catch (error) {
        return { success: false, message: 'Network error. Please try again.' };
    }
}

export async function togglePageVisibility(pageId: string, isVisible: boolean, themeId: string) {
    try {
        const res = await fetch(`/api/pages/${pageId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isVisible }),
        });
        const result = await res.json();
        if (res.ok) {
            mutate(`/api/pages?themeId=${themeId}`);
            return { success: true, message: `Page ${isVisible ? 'visible' : 'hidden'} successfully` };
        }
        return { success: false, message: result.message || 'Failed to update page visibility' };
    } catch (error) {
        return { success: false, message: 'Network error. Please try again.' };
    }
}
