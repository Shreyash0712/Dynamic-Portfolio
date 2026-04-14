import type { Component } from '@/lib/types';

interface ImageComponentProps {
    component: Component;
}

export default function ImageComponent({ component }: ImageComponentProps) {
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

    // Background mode - image as full background with overlay
    if (component.imagePosition === 'background') {
        return (
            <div
                style={{
                    position: 'relative',
                    backgroundColor: component.bgColor || undefined,
                    overflow: 'hidden',
                    borderRadius: getBorderRadius(),
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: component.alignItems || 'center',
                    justifyContent: component.justifyContent || 'center',
                    height: '100%',
                    padding: component.padding ? `${component.padding}px` : '24px',
                }}
            >
                {/* Background Image */}
                {component.imageUrl && (
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
                {component.imageAccentColor && (
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

                {/* Content */}
                {component.contentHtml && (
                    <div
                        style={{
                            position: 'relative',
                            zIndex: 1,
                            width: '100%',
                        }}
                        dangerouslySetInnerHTML={{ __html: component.contentHtml }}
                    />
                )}
            </div>
        );
    }

    // Standard mode with image and content
    const isImageLeft = component.imagePosition === 'left';
    const isImageRight = component.imagePosition === 'right';
    const showSideBySide = isImageLeft || isImageRight;

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
            <div className={showSideBySide ? 'grid md:grid-cols-2 gap-4 items-center h-full' : 'space-y-4 w-full'}>
                {/* Image */}
                {component.imageUrl && (
                    <div
                        className={showSideBySide
                            ? (isImageLeft ? 'order-1' : 'order-2')
                            : 'w-full'
                        }
                        style={{ position: 'relative' }}
                    >
                        <div style={{ position: 'relative' }}>
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
                    </div>
                )}

                {/* Content */}
                {component.contentHtml && (
                    <div
                        className={showSideBySide
                            ? (isImageLeft ? 'order-2' : 'order-1')
                            : 'w-full'
                        }
                        style={{
                            lineHeight: '1.6',
                        }}
                        dangerouslySetInnerHTML={{ __html: component.contentHtml }}
                    />
                )}
            </div>
        </div>
    );
}
