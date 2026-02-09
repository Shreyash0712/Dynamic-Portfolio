import { Component, ComponentType } from '@/lib/types';
import ParagraphComponent from './ParagraphComponent';
import ImageComponent from './ImageComponent';

interface ComponentRendererProps {
    component: Component;
}

export default function ComponentRenderer({ component }: ComponentRendererProps) {
    switch (component.component_type) {
        case ComponentType.PARAGRAPH:
            return <ParagraphComponent props={component.props} />;
        case ComponentType.IMAGE:
            return <ImageComponent props={component.props} />;
        default:
            console.warn(`Unknown component type: ${component.component_type}`);
            return null;
    }
}
