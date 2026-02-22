// Component database schema types
export interface Component<T = any> {
    id: string;
    component_type: ComponentType;
    props: T;
    display_order: number;
    is_visible: boolean;
    created_at: string;
    updated_at: string;
}

// Component types
export enum ComponentType {
    PARAGRAPH = 'paragraph',
    IMAGE = 'image',
    SLIDER = 'slider',
}

// Alignment types
export type TextAlignment = 'left' | 'center' | 'right' | 'justify';

// Paragraph component props
export interface ParagraphProps {
    title: string;
    subtitle: string;
    title_color: string;
    subtitle_color: string;
    title_font_size: number; // in px
    title_font_style: string; // font family
    subtitle_font_size: number; // in px
    subtitle_font_style: string; // font family
    title_alignment: TextAlignment;
    subtitle_alignment: TextAlignment;
    paragraph: string; // HTML content for rich text
    paragraph_text_size: number; // in px
    paragraph_font_style: string; // font family
    paragraph_alignment: TextAlignment;
    paragraph_color: string;
    bg_color: string;
    padding: number; // vertical padding in px
    full_screen?: boolean; // stretch component to full viewport height
}

// Image component props
export interface ImageProps {
    // Text content
    title: string;
    subtitle: string;
    paragraph: string;
    title_color: string;
    subtitle_color: string;
    paragraph_color: string;
    title_font_size: number;
    subtitle_font_size: number;
    paragraph_text_size: number;
    title_font_style: string;
    subtitle_font_style: string;
    paragraph_font_style: string;

    // Image
    image_url: string;
    image_public_id: string;
    image_position: 'left' | 'right' | 'center' | 'background';
    image_opacity: number; // 0-100
    image_height: number; // image height in px (auto width)
    accent_color: string; // hex color for overlay
    image_radius: 'small' | 'medium' | 'large' | 'circle';

    // Layout
    bg_color: string;
    padding: number; // vertical padding in px
    full_screen?: boolean; // stretch component to full viewport height
}

// Slider card interface
export interface SliderCard {
    card_title: string;
    card_subtitle: string;
    card_title_color: string;
    card_subtitle_color: string;
    card_title_font_size: number;
    card_subtitle_font_size: number;
    card_title_font_style: string;
    card_subtitle_font_style: string;
    image_url: string;
    image_public_id: string;
}

// Slider component props
export interface SliderProps {
    // Main text
    title: string;
    subtitle: string;
    title_color: string;
    subtitle_color: string;
    title_font_size: number;
    subtitle_font_size: number;
    title_font_style: string;
    subtitle_font_style: string;
    title_alignment: TextAlignment;
    subtitle_alignment: TextAlignment;

    // Cards
    cards: SliderCard[];

    // Card styling
    card_bg_color: string;
    card_radius: 'small' | 'medium' | 'large';

    // Image settings (common for all cards)
    image_height: number;
    image_style: 'bordered' | 'borderless';
    image_opacity: number;
    accent_color: string;

    // Animation
    animation: 'none' | 'steady' | 'focus';
    direction: 'ltr' | 'rtl'; // applies to both steady and focus

    // Layout
    bg_color: string;
    padding: number;
    full_screen?: boolean; // stretch component to full viewport height
}

// Union type for all component props
export type ComponentProps = ParagraphProps | ImageProps | SliderProps;

// API request/response types
export interface CreateComponentRequest {
    component_type: ComponentType | string;
    props: ComponentProps | Record<string, any>;
    display_order?: number;
    is_visible?: boolean;
}

export interface UpdateComponentRequest {
    component_type?: ComponentType | string;
    props?: ComponentProps | Record<string, any>;
    display_order?: number;
    is_visible?: boolean;
}

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}
