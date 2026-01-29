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
    height: number; // in px
}

// Union type for all component props
export type ComponentProps = ParagraphProps;

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
