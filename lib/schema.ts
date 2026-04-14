import { pgTable, uuid, text, integer, boolean, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Tables
export const themes = pgTable('themes', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    isActive: boolean('is_active').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const pages = pgTable('pages', {
    id: uuid('id').primaryKey().defaultRandom(),
    themeId: uuid('theme_id').notNull().references(() => themes.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    isVisible: boolean('is_visible').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const components = pgTable('components_new', {
    id: uuid('id').primaryKey().defaultRandom(),
    pageId: uuid('page_id').notNull().references(() => pages.id, { onDelete: 'cascade' }),
    status: text('status').notNull().default('draft'), // 'draft' | 'published'
    isVisible: boolean('is_visible').notNull().default(true),

    // Bento grid positioning
    rowStart: integer('row_start').notNull().default(1),
    rowSpan: integer('row_span').notNull().default(1),
    colStart: integer('col_start').notNull().default(1),
    colSpan: integer('col_span').notNull().default(1),

    // Content
    contentHtml: text('content_html'),

    // Flexbox alignment
    alignItems: text('align_items').default('center'),
    justifyContent: text('justify_content').default('center'),

    // Layout
    bgColor: text('bg_color'),
    padding: integer('padding').default(24),
    borderRadius: text('border_radius').default('medium'),

    // Image fields
    imageUrl: text('image_url'),
    imagePublicId: text('image_public_id'),
    imagePosition: text('image_position').default('none'),
    imageOpacity: integer('image_opacity'),
    imageAccentColor: text('image_accent_color'),

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const adminUsers = pgTable('admin_users', {
    id: uuid('id').primaryKey().defaultRandom(),
    email: text('email').notNull().unique(),
    password: text('password').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// Relations
export const themesRelations = relations(themes, ({ many }) => ({
    pages: many(pages),
}));

export const pagesRelations = relations(pages, ({ one, many }) => ({
    theme: one(themes, {
        fields: [pages.themeId],
        references: [themes.id],
    }),
    components: many(components),
}));

export const componentsRelations = relations(components, ({ one }) => ({
    page: one(pages, {
        fields: [components.pageId],
        references: [pages.id],
    }),
}));

// Types
export type Theme = typeof themes.$inferSelect;
export type NewTheme = typeof themes.$inferInsert;

export type Page = typeof pages.$inferSelect;
export type NewPage = typeof pages.$inferInsert;

export type Component = typeof components.$inferSelect;
export type NewComponent = typeof components.$inferInsert;

export type AdminUser = typeof adminUsers.$inferSelect;
export type NewAdminUser = typeof adminUsers.$inferInsert;

// Enums for frontend use (Zod validation)

export const Status = {
    DRAFT: 'draft',
    PUBLISHED: 'published',
} as const;

export const AlignItems = {
    START: 'start',
    CENTER: 'center',
    END: 'end',
    STRETCH: 'stretch',
} as const;

export const JustifyContent = {
    START: 'start',
    CENTER: 'center',
    END: 'end',
    BETWEEN: 'between',
    AROUND: 'around',
} as const;

export const ImagePosition = {
    LEFT: 'left',
    RIGHT: 'right',
    CENTER: 'center',
    BACKGROUND: 'background',
    NONE: 'none',
} as const;

export const BorderRadius = {
    SMALL: 'small',
    MEDIUM: 'medium',
    LARGE: 'large',
    CIRCLE: 'circle',
} as const;

export type Status = typeof Status[keyof typeof Status];
export type AlignItems = typeof AlignItems[keyof typeof AlignItems];
export type JustifyContent = typeof JustifyContent[keyof typeof JustifyContent];
export type ImagePosition = typeof ImagePosition[keyof typeof ImagePosition];
export type BorderRadius = typeof BorderRadius[keyof typeof BorderRadius];
