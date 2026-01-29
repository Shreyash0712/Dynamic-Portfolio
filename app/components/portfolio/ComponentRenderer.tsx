import { Component, ComponentType } from '@/lib/types';
import ParagraphComponent from './ParagraphComponent';

interface ComponentRendererProps {
    component: Component;
}

export default function ComponentRenderer({ component }: ComponentRendererProps) {
    switch (component.component_type) {
        case ComponentType.PARAGRAPH:
            return <ParagraphComponent props={component.props} />;
        default:
            console.warn(`Unknown component type: ${component.component_type}`);
            return null;
    }
}
