import { z } from 'zod';

// Zod schemas for validation
export const StatusSchema = z.enum(['draft', 'published']);
export const AlignItemsSchema = z.enum(['start', 'center', 'end', 'stretch']);
export const JustifyContentSchema = z.enum(['start', 'center', 'end', 'between', 'around']);
export const ImagePositionSchema = z.enum(['left', 'right', 'center', 'background', 'none']);
export const BorderRadiusSchema = z.enum(['small', 'medium', 'large', 'circle']);

// Component schema
export const ComponentSchema = z.object({
    id: z.string().uuid(),
    pageId: z.string().uuid(),
    status: StatusSchema,
    isVisible: z.boolean(),
    rowStart: z.number().int().min(1).max(100),
    rowSpan: z.number().int().min(1).max(12),
    colStart: z.number().int().min(1).max(100),
    colSpan: z.number().int().min(1).max(12),
    contentHtml: z.string().nullable(),
    alignItems: AlignItemsSchema.nullable(),
    justifyContent: JustifyContentSchema.nullable(),
    bgColor: z.string().nullable(),
    padding: z.number().int().nullable(),
    borderRadius: BorderRadiusSchema.nullable(),
    imageUrl: z.string().nullable(),
    imagePublicId: z.string().nullable(),
    imagePosition: ImagePositionSchema.nullable(),
    imageOpacity: z.number().int().min(0).max(100).nullable(),
    imageAccentColor: z.string().nullable(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
});

// Page schema
export const PageSchema = z.object({
    id: z.string().uuid(),
    themeId: z.string().uuid(),
    name: z.string(),
    slug: z.string(),
    isVisible: z.boolean(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
});

// Theme schema
export const ThemeSchema = z.object({
    id: z.string().uuid(),
    name: z.string(),
    isActive: z.boolean(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
});

// Create/Update request schemas
export const CreateComponentSchema = z.object({
    pageId: z.string().uuid(),
    status: StatusSchema.optional(),
    isVisible: z.boolean().optional(),
    rowStart: z.number().int().min(1).optional(),
    rowSpan: z.number().int().min(1).max(12).optional(),
    colStart: z.number().int().min(1).optional(),
    colSpan: z.number().int().min(1).max(12).optional(),
    contentHtml: z.string().optional(),
    alignItems: AlignItemsSchema.optional(),
    justifyContent: JustifyContentSchema.optional(),
    bgColor: z.string().optional(),
    padding: z.number().int().optional(),
    borderRadius: BorderRadiusSchema.optional(),
    imageUrl: z.string().optional(),
    imagePublicId: z.string().optional(),
    imagePosition: ImagePositionSchema.optional(),
    imageOpacity: z.number().int().min(0).max(100).optional(),
    imageAccentColor: z.string().optional(),
});

export const UpdateComponentSchema = CreateComponentSchema.partial().omit({ pageId: true });

export const CreatePageSchema = z.object({
    themeId: z.string().uuid(),
    name: z.string().min(1),
    slug: z.string().min(1),
    isVisible: z.boolean().optional(),
});

export const UpdatePageSchema = CreatePageSchema.partial().omit({ themeId: true });

export const CreateThemeSchema = z.object({
    name: z.string().min(1),
    isActive: z.boolean().optional(),
});

export const UpdateThemeSchema = CreateThemeSchema.partial();

// TypeScript types derived from Zod schemas
export type Status = z.infer<typeof StatusSchema>;
export type AlignItems = z.infer<typeof AlignItemsSchema>;
export type JustifyContent = z.infer<typeof JustifyContentSchema>;
export type ImagePosition = z.infer<typeof ImagePositionSchema>;
export type BorderRadius = z.infer<typeof BorderRadiusSchema>;

export type Component = z.infer<typeof ComponentSchema>;
export type CreateComponentRequest = z.infer<typeof CreateComponentSchema>;
export type UpdateComponentRequest = z.infer<typeof UpdateComponentSchema>;

export type Page = z.infer<typeof PageSchema>;
export type CreatePageRequest = z.infer<typeof CreatePageSchema>;
export type UpdatePageRequest = z.infer<typeof UpdatePageSchema>;

export type Theme = z.infer<typeof ThemeSchema>;
export type CreateThemeRequest = z.infer<typeof CreateThemeSchema>;
export type UpdateThemeRequest = z.infer<typeof UpdateThemeSchema>;

// API response type
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
}

// Extended types with relations
export type ComponentWithPage = Component & { page: Page };
export type PageWithComponents = Page & { components: Component[] };
export type PageWithTheme = Page & { theme: Theme };
export type ThemeWithPages = Theme & { pages: Page[] };
