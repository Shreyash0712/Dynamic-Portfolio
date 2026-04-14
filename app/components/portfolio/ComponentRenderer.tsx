import type { Component } from '@/lib/types';

interface ComponentRendererProps {
    component: Component;
}

export default function ComponentRenderer({ component }: ComponentRendererProps) {
    const getBorderRadius = () => {
        switch (component.borderRadius) {
            case 'small': return '12px';
            case 'medium': return '24px';
            case 'large': return '48px';
            case 'circle': return '50%';
            default: return '24px';
        }
    };

    const opacity = component.imageOpacity ? component.imageOpacity / 100 : 1;
    const hasBackgroundImage = component.imageUrl && component.imagePosition === 'background';

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
                position: hasBackgroundImage ? 'relative' : 'static',
            }}
        >
            {/* Background Image */}
            {hasBackgroundImage && (
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: `url(${component.imageUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        opacity,
                        borderRadius: getBorderRadius(),
                    }}
                />
            )}

            {/* Accent Color Overlay */}
            {hasBackgroundImage && component.imageAccentColor && (
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: component.imageAccentColor,
                        mixBlendMode: 'multiply',
                        borderRadius: getBorderRadius(),
                    }}
                />
            )}

            {/* Content with optional side image */}
            <div className={component.imageUrl && component.imagePosition !== 'background' && component.imagePosition !== 'none'
                ? 'grid md:grid-cols-2 gap-4 items-center w-full h-full'
                : 'w-full h-full flex flex-col'
            }>
                {/* Side Image (left or right) */}
                {component.imageUrl && component.imagePosition !== 'background' && component.imagePosition !== 'none' && (
                    <div
                        className={component.imagePosition === 'left' ? 'order-1' : 'order-2'}
                        style={{ position: 'relative' }}
                    >
                        <img
                            src={component.imageUrl}
                            alt=""
                            style={{
                                width: '100%',
                                height: 'auto',
                                objectFit: 'cover',
                                borderRadius: getBorderRadius(),
                                opacity,
                            }}
                        />
                        {component.imageAccentColor && (
                            <div
                                style={{
                                    position: 'absolute',
                                    inset: 0,
                                    backgroundColor: component.imageAccentColor,
                                    borderRadius: getBorderRadius(),
                                    mixBlendMode: 'multiply',
                                    pointerEvents: 'none',
                                }}
                            />
                        )}
                    </div>
                )}

                {/* HTML Content */}
                {component.contentHtml && (
                    <div
                        className={component.imageUrl && component.imagePosition !== 'background' && component.imagePosition !== 'none'
                            ? (component.imagePosition === 'left' ? 'order-2' : 'order-1')
                            : ''
                        }
                        style={{
                            position: hasBackgroundImage ? 'relative' : 'static',
                            zIndex: hasBackgroundImage ? 1 : undefined,
                            lineHeight: '1.6',
                        }}
                        dangerouslySetInnerHTML={{ __html: component.contentHtml }}
                    />
                )}
            </div>
        </div>
    );
}
