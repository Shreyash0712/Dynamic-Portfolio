'use client';

import { SliderProps } from '@/lib/types';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import AutoScroll from 'embla-carousel-auto-scroll';
import { useCallback, useEffect, useState } from 'react';

interface SliderComponentProps {
    props: SliderProps;
}

export default function SliderComponent({ props }: SliderComponentProps) {
    const getCardRadius = () => {
        switch (props.card_radius) {
            case 'small': return '12px';
            case 'medium': return '24px';
            case 'large': return '48px';
            default: return '24px';
        }
    };

    const getImageRadius = () => {
        if (props.image_style === 'borderless') {
            return `${getCardRadius()} ${getCardRadius()} 0 0`;
        }
        return getCardRadius();
    };

    // Configure plugins based on animation mode
    const plugins = [];

    if (props.animation === 'steady') {
        plugins.push(
            AutoScroll({
                speed: 1,
                stopOnInteraction: false,
                stopOnMouseEnter: false,
            })
        );
    } else if (props.animation === 'focus') {
        plugins.push(
            Autoplay({
                delay: 3000,
                stopOnInteraction: false,
                stopOnMouseEnter: true,
            })
        );
    }

    const [emblaRef, emblaApi] = useEmblaCarousel(
        {
            loop: true,
            align: props.animation === 'focus' ? 'center' : 'start',
            slidesToScroll: 1,
            direction: props.direction === 'rtl' ? 'rtl' : 'ltr',
            skipSnaps: false,
            containScroll: false,
            dragFree: props.animation === 'steady',
        },
        plugins
    );

    const [selectedIndex, setSelectedIndex] = useState(0);

    const scrollPrev = useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev();
    }, [emblaApi]);

    const scrollNext = useCallback(() => {
        if (emblaApi) emblaApi.scrollNext();
    }, [emblaApi]);

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        // Map the selected scroll snap index back to the original card index
        setSelectedIndex(emblaApi.selectedScrollSnap() % props.cards.length);
    }, [emblaApi, props.cards.length]);

    useEffect(() => {
        if (!emblaApi) return;

        onSelect();
        emblaApi.on('select', onSelect);
        return () => {
            emblaApi.off('select', onSelect);
        };
    }, [emblaApi, onSelect]);

    return (
        <div
            style={{
                backgroundColor: props.bg_color,
                padding: `${props.padding}px 0`,
                position: 'relative',
            }}
        >
            <div className="max-w-7xl mx-auto px-4">
                {/* Title and Subtitle */}
                {(props.title || props.subtitle) && (
                    <div className="mb-8">
                        {props.title && (
                            <h2
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
                            </h2>
                        )}
                        {props.subtitle && (
                            <p
                                style={{
                                    color: props.subtitle_color,
                                    fontSize: `${props.subtitle_font_size}px`,
                                    fontFamily: props.subtitle_font_style,
                                    textAlign: props.subtitle_alignment,
                                    margin: '0.5rem 0 0 0',
                                }}
                            >
                                {props.subtitle}
                            </p>
                        )}
                    </div>
                )}

                {/* Carousel */}
                <div className="relative">
                    <div
                        key={`${props.animation}-${props.direction}`}
                        className="overflow-hidden py-12"
                        ref={emblaRef}
                        style={{
                            margin: '-3rem 0', // Offset the padding to maintain layout flow if needed, or just let it take space
                            direction: props.direction, // Ensure flex layout matches Embla direction
                        }}
                    >
                        <div
                            className="flex touch-pan-y"
                            style={{
                                ...(props.direction === 'rtl'
                                    ? { marginRight: '-1.5rem' }
                                    : { marginLeft: '-1.5rem' }),
                                padding: '0.5rem 0'
                            }}
                        >
                            {(() => {
                                let displayCards = [...props.cards];
                                if (displayCards.length > 0 && displayCards.length < 6) {
                                    const multiplier = Math.ceil(6 / displayCards.length);
                                    displayCards = Array(multiplier).fill(displayCards).flat();
                                }

                                return displayCards.map((card, index) => {
                                    const originalIndex = index % props.cards.length;
                                    const isFocused = props.animation === 'focus' && originalIndex === selectedIndex;

                                    return (
                                        <div
                                            key={`${index}-${originalIndex}`}
                                            className="embla-slide"
                                            style={{
                                                flex: '0 0 auto',
                                                width: '100%',
                                                minWidth: '280px',
                                                ...(props.direction === 'rtl'
                                                    ? { paddingRight: '1.5rem' }
                                                    : { paddingLeft: '1.5rem' }),
                                                position: 'relative',
                                            }}
                                        >
                                            <div
                                                style={{
                                                    backgroundColor: props.card_bg_color,
                                                    borderRadius: getCardRadius(),
                                                    overflow: 'hidden',
                                                    height: '100%',
                                                    border: isFocused ? `2px solid ${props.title_color || '#000'}` : '2px solid transparent',
                                                    transform: isFocused ? 'scale(1.05)' : 'scale(1)',
                                                    transition: 'all 0.4s ease',
                                                }}
                                            >
                                                {/* Image */}
                                                {card.image_url && (
                                                    <div
                                                        style={{
                                                            position: 'relative',
                                                            padding: props.image_style === 'bordered' ? '1rem 1rem 0 1rem' : '0',
                                                        }}
                                                    >
                                                        <img
                                                            src={card.image_url}
                                                            alt={card.card_title}
                                                            style={{
                                                                width: '100%',
                                                                height: `${props.image_height}px`,
                                                                objectFit: 'cover',
                                                                borderRadius: getImageRadius(),
                                                                opacity: props.image_opacity / 100,
                                                            }}
                                                        />
                                                        {props.accent_color && (
                                                            <div
                                                                style={{
                                                                    position: 'absolute',
                                                                    inset: props.image_style === 'bordered' ? '1rem 1rem 0 1rem' : '0',
                                                                    backgroundColor: props.accent_color,
                                                                    borderRadius: getImageRadius(),
                                                                    mixBlendMode: 'multiply',
                                                                    pointerEvents: 'none',
                                                                }}
                                                            />
                                                        )}
                                                    </div>
                                                )}

                                                <div style={{ padding: '1.5rem' }}>
                                                    {card.card_title && (
                                                        <h3
                                                            style={{
                                                                color: card.card_title_color,
                                                                fontSize: `${card.card_title_font_size}px`,
                                                                fontFamily: card.card_title_font_style,
                                                                margin: 0,
                                                                fontWeight: 'bold',
                                                            }}
                                                        >
                                                            {card.card_title}
                                                        </h3>
                                                    )}
                                                    {card.card_subtitle && (
                                                        <p
                                                            style={{
                                                                color: card.card_subtitle_color,
                                                                fontSize: `${card.card_subtitle_font_size}px`,
                                                                fontFamily: card.card_subtitle_font_style,
                                                                margin: '0.5rem 0 0 0',
                                                            }}
                                                        >
                                                            {card.card_subtitle}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            })()}
                        </div>
                    </div>

                    {/* Navigation Arrows */}
                    {props.animation !== 'steady' && (
                        <>
                            <button
                                onClick={scrollPrev}
                                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 transition-colors z-10"
                                style={{ border: '1px solid #e5e7eb' }}
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="15 18 9 12 15 6" />
                                </svg>
                            </button>
                            <button
                                onClick={scrollNext}
                                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 transition-colors z-10"
                                style={{ border: '1px solid #e5e7eb' }}
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="9 6 15 12 9 18" />
                                </svg>
                            </button>
                        </>
                    )}
                </div>

                {/* Responsive styles for larger screens */}
                <style jsx>{`
                    @media (min-width: 640px) {
                        .embla-slide {
                            width: 50% !important;
                        }
                    }
                    @media (min-width: 1024px) {
                        .embla-slide {
                            width: 33.333333% !important;
                        }
                    }
                `}</style>
            </div>
        </div>
    );
}
