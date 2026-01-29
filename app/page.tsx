import ComponentRenderer from './components/portfolio/ComponentRenderer';
import { Component } from '@/lib/types';

async function getComponents(): Promise<Component[]> {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/components`, {
      cache: 'no-store',
    });
    const data = await response.json();

    if (data.success) {
      // Filter visible components and sort by display_order (descending)
      return data.data
        .filter((comp: Component) => comp.is_visible)
        .sort((a: Component, b: Component) => b.display_order - a.display_order);
    }
    return [];
  } catch (error) {
    console.error('Error fetching components:', error);
    return [];
  }
}

export default async function Home() {
  const components = await getComponents();

  return (
    <div>
      {components.length === 0 ? (
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-500">No components to display</p>
        </div>
      ) : (
        components.map((component) => (
          <ComponentRenderer key={component.id} component={component} />
        ))
      )}
    </div>
  );
}
