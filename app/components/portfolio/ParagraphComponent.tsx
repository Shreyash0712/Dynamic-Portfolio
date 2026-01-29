import { ParagraphProps } from '@/lib/types';

interface ParagraphComponentProps {
    props: ParagraphProps;
}

export default function ParagraphComponent({ props }: ParagraphComponentProps) {
    return (
        <div
            style={{
                backgroundColor: props.bg_color,
                minHeight: `${props.height}px`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '2rem',
            }}
        >
            <div className="max-w-6xl mx-auto w-full space-y-4">
                {/* Title */}
                {props.title && (
                    <h1
                        style={{
                            color: props.title_color,
                            fontSize: `${props.title_font_size}px`,
                            fontFamily: props.title_font_style,
                            textAlign: props.title_alignment,
                            margin: 0,
                            fontWeight: 'bold',
                        }}
                    >
                        {props.title}
                    </h1>
                )}

                {/* Subtitle */}
                {props.subtitle && (
                    <h2
                        style={{
                            color: props.subtitle_color,
                            fontSize: `${props.subtitle_font_size}px`,
                            fontFamily: props.subtitle_font_style,
                            textAlign: props.subtitle_alignment,
                            margin: 0,
                            fontWeight: '600',
                        }}
                    >
                        {props.subtitle}
                    </h2>
                )}

                {/* Paragraph */}
                {props.paragraph && (
                    <div
                        style={{
                            color: props.paragraph_color,
                            fontSize: `${props.paragraph_text_size}px`,
                            fontFamily: props.paragraph_font_style,
                            textAlign: props.paragraph_alignment,
                            lineHeight: '1.6',
                        }}
                        dangerouslySetInnerHTML={{ __html: props.paragraph }}
                    />
                )}
            </div>
        </div>
    );
}
