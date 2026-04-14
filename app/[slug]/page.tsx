import BentoGrid from '../components/bento/BentoGrid';
import type { Component, Page } from '@/lib/types';
import { notFound } from 'next/navigation';

interface PageProps {
    params: Promise<{ slug: string }>;
}

async function getPageBySlug(slug: string): Promise<{ page: Page | null; components: Component[] }> {
    const baseUrl = process.env.NEXTAUTH_URL;

    try {
        // Get all themes and find the active one
        const themesRes = await fetch(`${baseUrl}/api/themes`, { cache: 'no-store' });
        const themesData = await themesRes.json();

        if (!themesData.success) {
            return { page: null, components: [] };
        }

        const activeTheme = themesData.data.find((t: { isActive: boolean }) => t.isActive);

        if (!activeTheme) {
            return { page: null, components: [] };
        }

        // Get pages for the active theme and find the one matching the slug
        const pagesRes = await fetch(`${baseUrl}/api/pages?themeId=${activeTheme.id}`, { cache: 'no-store' });
        const pagesData = await pagesRes.json();

        if (!pagesData.success) {
            return { page: null, components: [] };
        }

        const page = pagesData.data.find((p: Page) => p.slug === slug && p.isVisible);

        if (!page) {
            return { page: null, components: [] };
        }

        // Get components for this page
        const componentsRes = await fetch(`${baseUrl}/api/components?pageId=${page.id}&status=published`, {
            cache: 'no-store',
        });
        const componentsData = await componentsRes.json();

        return {
            page,
            components: componentsData.success ? componentsData.data.filter((c: Component) => c.isVisible) : [],
        };
    } catch (error) {
        console.error('Error fetching page:', error);
        return { page: null, components: [] };
    }
}

export default async function PageRoute({ params }: PageProps) {
    const { slug } = await params;
    const { page, components } = await getPageBySlug(slug);

    if (!page) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">{page.name}</h1>
                {components.length === 0 ? (
                    <p className="text-gray-500 text-center py-12">No components on this page yet.</p>
                ) : (
                    <BentoGrid
                        components={components}
                        pageId={page.id}
                        isAdmin={false}
                    />
                )}
            </div>
        </main>
    );
}
