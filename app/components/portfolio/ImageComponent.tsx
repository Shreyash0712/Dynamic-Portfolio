import { ImageProps } from '@/lib/types';

interface ImageComponentProps {
    props: ImageProps;
}

export default function ImageComponent({ props }: ImageComponentProps) {
    const getBorderRadius = () => {
        switch (props.image_radius) {
            case 'small': return '12px';
            case 'medium': return '24px';
            case 'large': return '48px';
            case 'circle': return '50%';
            default: return '12px';
        }
    };

    // Background mode - image as full background with overlay
    if (props.image_position === 'background') {
        return (
            <div
                style={{
                    position: 'relative',
                    backgroundColor: props.bg_color,
                    overflow: 'hidden',
                    padding: `${props.padding}px 0`,
                }}
            >
                {/* Background Image */}
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: `url(${props.image_url})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        opacity: props.image_opacity / 100,
                    }}
                />

                {/* Accent Color Overlay */}
                {props.accent_color && (
                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            backgroundColor: props.accent_color,
                            mixBlendMode: 'multiply',
                        }}
                    />
                )}

                {/* Content */}
                <div
                    style={{
                        position: 'relative',
                        zIndex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: '2rem',
                        textAlign: 'center',
                    }}
                >
                    {props.title && (
                        <h1
                            style={{
                                color: props.title_color,
                                fontSize: `${props.title_font_size}px`,
                                fontFamily: props.title_font_style,
                                margin: 0,
                                fontWeight: 'bold',
                            }}
                        >
                            {props.title}
                        </h1>
                    )}
                    {props.subtitle && (
                        <h2
                            style={{
                                color: props.subtitle_color,
                                fontSize: `${props.subtitle_font_size}px`,
                                fontFamily: props.subtitle_font_style,
                                margin: '0.5rem 0 0 0',
                                fontWeight: '600',
                            }}
                        >
                            {props.subtitle}
                        </h2>
                    )}
                    {props.paragraph && (
                        <div
                            style={{
                                color: props.paragraph_color,
                                fontSize: `${props.paragraph_text_size}px`,
                                fontFamily: props.paragraph_font_style,
                                marginTop: '1rem',
                                lineHeight: '1.6',
                                maxWidth: '800px',
                            }}
                            dangerouslySetInnerHTML={{ __html: props.paragraph }}
                        />
                    )}
                </div>
            </div>
        );
    }

    // Center mode - text above, image below
    if (props.image_position === 'center') {
        return (
            <div
                style={{
                    backgroundColor: props.bg_color,
                    padding: `${props.padding}px 2rem`,
                }}
            >
                <div className="max-w-6xl mx-auto w-full space-y-6">
                    {/* Text Content */}
                    <div style={{ textAlign: 'center' }}>
                        {props.title && (
                            <h1
                                style={{
                                    color: props.title_color,
                                    fontSize: `${props.title_font_size}px`,
                                    fontFamily: props.title_font_style,
                                    margin: 0,
                                    fontWeight: 'bold',
                                }}
                            >
                                {props.title}
                            </h1>
                        )}
                        {props.subtitle && (
                            <h2
                                style={{
                                    color: props.subtitle_color,
                                    fontSize: `${props.subtitle_font_size}px`,
                                    fontFamily: props.subtitle_font_style,
                                    margin: '0.5rem 0 0 0',
                                    fontWeight: '600',
                                }}
                            >
                                {props.subtitle}
                            </h2>
                        )}
                        {props.paragraph && (
                            <div
                                style={{
                                    color: props.paragraph_color,
                                    fontSize: `${props.paragraph_text_size}px`,
                                    fontFamily: props.paragraph_font_style,
                                    marginTop: '1rem',
                                    lineHeight: '1.6',
                                }}
                                dangerouslySetInnerHTML={{ __html: props.paragraph }}
                            />
                        )}
                    </div>

                    {/* Image */}
                    <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
                        <div style={{ position: 'relative' }}>
                            <img
                                src={props.image_url}
                                alt="Component image"
                                style={{
                                    width: '100%',
                                    maxHeight: `${props.image_height}px`,
                                    height: 'auto',
                                    objectFit: 'cover',
                                    borderRadius: getBorderRadius(),
                                    opacity: props.image_opacity / 100,
                                }}
                            />
                            {props.accent_color && (
                                <div
                                    style={{
                                        position: 'absolute',
                                        inset: 0,
                                        backgroundColor: props.accent_color,
                                        borderRadius: getBorderRadius(),
                                        mixBlendMode: 'multiply',
                                        pointerEvents: 'none',
                                    }}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Left/Right mode - side by side on desktop, stacked on mobile
    const isImageLeft = props.image_position === 'left';

    return (
        <div
            style={{
                backgroundColor: props.bg_color,
                padding: `${props.padding}px 2rem`,
            }}
        >
            <div className="max-w-6xl mx-auto w-full">
                {/* Mobile: Always center layout (text above, image below) */}
                <div className="md:hidden space-y-6">
                    {/* Text Content */}
                    <div>
                        {props.title && (
                            <h1
                                style={{
                                    color: props.title_color,
                                    fontSize: `${props.title_font_size}px`,
                                    fontFamily: props.title_font_style,
                                    margin: 0,
                                    fontWeight: 'bold',
                                    textAlign: 'left',
                                }}
                            >
                                {props.title}
                            </h1>
                        )}
                        {props.subtitle && (
                            <h2
                                style={{
                                    color: props.subtitle_color,
                                    fontSize: `${props.subtitle_font_size}px`,
                                    fontFamily: props.subtitle_font_style,
                                    margin: '0.5rem 0 0 0',
                                    fontWeight: '600',
                                    textAlign: 'left',
                                }}
                            >
                                {props.subtitle}
                            </h2>
                        )}
                        {props.paragraph && (
                            <div
                                style={{
                                    color: props.paragraph_color,
                                    fontSize: `${props.paragraph_text_size}px`,
                                    fontFamily: props.paragraph_font_style,
                                    marginTop: '1rem',
                                    lineHeight: '1.6',
                                    textAlign: 'left',
                                }}
                                dangerouslySetInnerHTML={{ __html: props.paragraph }}
                            />
                        )}
                    </div>

                    {/* Image */}
                    <div style={{ position: 'relative' }}>
                        <img
                            src={props.image_url}
                            alt="Component image"
                            style={{
                                width: '100%',
                                maxHeight: `${props.image_height}px`,
                                height: 'auto',
                                objectFit: 'cover',
                                borderRadius: getBorderRadius(),
                                opacity: props.image_opacity / 100,
                            }}
                        />
                        {props.accent_color && (
                            <div
                                style={{
                                    position: 'absolute',
                                    inset: 0,
                                    backgroundColor: props.accent_color,
                                    borderRadius: getBorderRadius(),
                                    mixBlendMode: 'multiply',
                                    pointerEvents: 'none',
                                }}
                            />
                        )}
                    </div>
                </div>

                {/* Desktop: Side by side layout */}
                <div className="hidden md:grid md:grid-cols-2 gap-8 items-center">
                    {/* Image Column */}
                    <div
                        className={isImageLeft ? 'order-1' : 'order-2'}
                        style={{ position: 'relative' }}
                    >
                        <div style={{ position: 'relative' }}>
                            <img
                                src={props.image_url}
                                alt="Component image"
                                style={{
                                    width: '100%',
                                    maxHeight: `${props.image_height}px`,
                                    height: 'auto',
                                    objectFit: 'cover',
                                    borderRadius: getBorderRadius(),
                                    opacity: props.image_opacity / 100,
                                }}
                            />
                            {props.accent_color && (
                                <div
                                    style={{
                                        position: 'absolute',
                                        inset: 0,
                                        backgroundColor: props.accent_color,
                                        borderRadius: getBorderRadius(),
                                        mixBlendMode: 'multiply',
                                        pointerEvents: 'none',
                                    }}
                                />
                            )}
                        </div>
                    </div>

                    {/* Text Column */}
                    <div className={isImageLeft ? 'order-2' : 'order-1'}>
                        {props.title && (
                            <h1
                                style={{
                                    color: props.title_color,
                                    fontSize: `${props.title_font_size}px`,
                                    fontFamily: props.title_font_style,
                                    margin: 0,
                                    fontWeight: 'bold',
                                    textAlign: 'left',
                                }}
                            >
                                {props.title}
                            </h1>
                        )}
                        {props.subtitle && (
                            <h2
                                style={{
                                    color: props.subtitle_color,
                                    fontSize: `${props.subtitle_font_size}px`,
                                    fontFamily: props.subtitle_font_style,
                                    margin: '0.5rem 0 0 0',
                                    fontWeight: '600',
                                    textAlign: 'left',
                                }}
                            >
                                {props.subtitle}
                            </h2>
                        )}
                        {props.paragraph && (
                            <div
                                style={{
                                    color: props.paragraph_color,
                                    fontSize: `${props.paragraph_text_size}px`,
                                    fontFamily: props.paragraph_font_style,
                                    marginTop: '1rem',
                                    lineHeight: '1.6',
                                    textAlign: 'left',
                                }}
                                dangerouslySetInnerHTML={{ __html: props.paragraph }}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
