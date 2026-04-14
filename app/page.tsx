import BentoGrid from './components/bento/BentoGrid';
import type { Component, Page } from '@/lib/types';

async function getActiveThemeData(): Promise<{ page: Page | null; components: Component[] }> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

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

    // Get pages for the active theme
    const pagesRes = await fetch(`${baseUrl}/api/pages?themeId=${activeTheme.id}`, { cache: 'no-store' });
    const pagesData = await pagesRes.json();

    if (!pagesData.success || pagesData.data.length === 0) {
      return { page: null, components: [] };
    }

    // Get the first visible page
    const page = pagesData.data[0] as Page;

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
    console.error('Error fetching data:', error);
    return { page: null, components: [] };
  }
}

export default async function Home() {
  const { page, components } = await getActiveThemeData();

  return (
    <main className="min-h-screen bg-gray-50">
      {components.length === 0 ? (
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-500">No components to display</p>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {page && (
            <h1 className="text-3xl font-bold text-gray-900 mb-8">{page.name}</h1>
          )}
          <BentoGrid
            components={components}
            pageId={page?.id || ''}
            isAdmin={false}
          />
        </div>
      )}
    </main>
  );
}
