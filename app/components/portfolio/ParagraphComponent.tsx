import type { Component } from '@/lib/types';

interface ParagraphComponentProps {
    component: Component;
}

export default function ParagraphComponent({ component }: ParagraphComponentProps) {
    const getBorderRadius = () => {
        switch (component.borderRadius) {
            case 'small': return '12px';
            case 'medium': return '24px';
            case 'large': return '48px';
            case 'circle': return '50%';
            default: return '24px';
        }
    };

    return (
        <div
            style={{
                backgroundColor: component.bgColor || undefined,
                padding: component.padding ? `${component.padding}px` : '24px',
                borderRadius: getBorderRadius(),
                display: 'flex',
                flexDirection: 'column',
                alignItems: component.alignItems || 'center',
                justifyContent: component.justifyContent || 'center',
                height: '100%',
                overflow: 'hidden',
            }}
        >
            {component.contentHtml && (
                <div
                    className="w-full"
                    style={{
                        lineHeight: '1.6',
                    }}
                    dangerouslySetInnerHTML={{ __html: component.contentHtml }}
                />
            )}
        </div>
    );
}
